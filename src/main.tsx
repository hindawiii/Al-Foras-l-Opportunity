import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { guestStorage } from "./lib/guestStorage";

// Permanent dark mode — enforce on boot before React mounts.
document.documentElement.classList.add("dark");
document.documentElement.classList.remove("light");

// استرجاع البيانات من IndexedDB (نسخة احتياطية) قبل الإقلاع.
guestStorage.hydrate().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

// تسجيل الـ Service Worker لتمكين العمل بدون إنترنت (PWA Offline Resilience)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.info("[PWA] Service Worker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.info("[PWA] Service Worker registration note:", err);
      });
  });
}
