// Al-Foras Service Worker — Production-grade PWA Offline Caching
// Handles static asset precaching, Stale-While-Revalidate for fonts/assets,
// and Network-First with cached SPA fallback for navigation.

const CACHE_NAME = "al-foras-cache-v1";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/al-foras-icon.png",
  "/al-foras-logo.png"
];

// Install Event — Precaching core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.info("[SW] Precache partial note:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Offline resilience strategies
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Skip non-GET requests and chrome extensions
  if (req.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 2. Skip Firebase and external analytics from service worker cache
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("securetoken.googleapis.com")
  ) {
    return;
  }

  // 3. Navigation requests (SPA HTML fallback)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match("/index.html").then((cached) => {
          return cached || fetch(req);
        });
      })
    );
    return;
  }

  // 4. Static assets & Google Fonts: Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|woff|ttf|ico)$/) ||
     url.pathname.startsWith("/assets/"))
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5. Default: Network-First with cache fallback
  event.respondWith(
    fetch(req).then((networkRes) => {
      if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, resClone);
        });
      }
      return networkRes;
    }).catch(() => {
      return caches.match(req);
    })
  );
});
