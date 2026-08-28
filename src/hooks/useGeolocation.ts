import { useEffect, useState, useCallback } from "react";

export interface GeoInfo {
  city?: string;
  country?: string;
  countryCode?: string;
  cityAr?: string;
  countryAr?: string;
  cityEn?: string;
  countryEn?: string;
  formatted?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  provider?: "gps" | "ip";
}

const STORAGE_KEY = "foras-geo";

// Country ISO to Arabic & English translation map
const COUNTRY_MAP: Record<string, { ar: string; en: string }> = {
  SD: { ar: "السودان", en: "Sudan" },
  SA: { ar: "السعودية", en: "Saudi Arabia" },
  EG: { ar: "مصر", en: "Egypt" },
  AE: { ar: "الإمارات", en: "UAE" },
  QA: { ar: "قطر", en: "Qatar" },
  KW: { ar: "الكويت", en: "Kuwait" },
  OM: { ar: "عمان", en: "Oman" },
  BH: { ar: "البحرين", en: "Bahrain" },
  JO: { ar: "الأردن", en: "Jordan" },
  IQ: { ar: "العراق", en: "Iraq" },
  MA: { ar: "المغرب", en: "Morocco" },
  DZ: { ar: "الجزائر", en: "Algeria" },
  TN: { ar: "تونس", en: "Tunisia" },
  LY: { ar: "ليبيا", en: "Libya" },
  YE: { ar: "اليمن", en: "Yemen" },
  SY: { ar: "سوريا", en: "Syria" },
  LB: { ar: "لبنان", en: "Lebanon" },
  PS: { ar: "فلسطين", en: "Palestine" },
  MR: { ar: "موريتانيا", en: "Mauritania" },
  SO: { ar: "الصومال", en: "Somalia" },
  DJ: { ar: "جيبوتي", en: "Djibouti" },
  KM: { ar: "جزر القمر", en: "Comoros" },
  TR: { ar: "تركيا", en: "Turkey" },
  GB: { ar: "بريطانيا", en: "United Kingdom" },
  US: { ar: "الولايات المتحدة", en: "United States" },
  DE: { ar: "ألمانيا", en: "Germany" },
  CA: { ar: "كندا", en: "Canada" },
  FR: { ar: "فرنسا", en: "France" },
  MY: { ar: "ماليزيا", en: "Malaysia" },
};

/**
 * Fetch geolocation via IP if GPS is not available or denied
 */
async function fetchIpLocation(): Promise<GeoInfo | null> {
  try {
    const res = await fetch("https://ipapi.co/json/").then((r) => r.json());
    if (res && res.country_code) {
      const code = res.country_code.toUpperCase();
      const meta = COUNTRY_MAP[code];
      const city = res.city || "";
      const country = meta?.ar || res.country_name || "";
      const countryEn = meta?.en || res.country_name || "";
      return {
        city,
        cityAr: city,
        cityEn: city,
        country,
        countryEn,
        countryCode: code,
        latitude: res.latitude,
        longitude: res.longitude,
        provider: "ip",
        formatted: city ? `${country} / ${city}` : country,
      };
    }
  } catch {
    // try secondary IP endpoint
    try {
      const res2 = await fetch("https://freeipapi.com/api/json").then((r) => r.json());
      if (res2 && res2.countryCode) {
        const code = res2.countryCode.toUpperCase();
        const meta = COUNTRY_MAP[code];
        const city = res2.cityName || "";
        const country = meta?.ar || res2.countryName || "";
        const countryEn = meta?.en || res2.countryName || "";
        return {
          city,
          cityAr: city,
          cityEn: city,
          country,
          countryEn,
          countryCode: code,
          latitude: res2.latitude,
          longitude: res2.longitude,
          provider: "ip",
          formatted: city ? `${country} / ${city}` : country,
        };
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim and Open-Meteo
 */
async function reverseGeocodeCoords(lat: number, lon: number): Promise<GeoInfo> {
  let cityAr = "";
  let cityEn = "";
  let countryAr = "";
  let countryEn = "";
  let countryCode = "";

  try {
    // 1. Fetch Arabic info
    const resAr = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`
    ).then((r) => r.json());

    if (resAr && resAr.address) {
      countryCode = (resAr.address.country_code || "").toUpperCase();
      countryAr = resAr.address.country || COUNTRY_MAP[countryCode]?.ar || "";
      cityAr =
        resAr.address.city ||
        resAr.address.town ||
        resAr.address.village ||
        resAr.address.state ||
        resAr.address.county ||
        "";
    }
  } catch {
    // fallback
  }

  try {
    // 2. Fetch English info
    const resEn = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
    ).then((r) => r.json());

    if (resEn && resEn.address) {
      if (!countryCode) countryCode = (resEn.address.country_code || "").toUpperCase();
      countryEn = resEn.address.country || COUNTRY_MAP[countryCode]?.en || "";
      cityEn =
        resEn.address.city ||
        resEn.address.town ||
        resEn.address.village ||
        resEn.address.state ||
        resEn.address.county ||
        "";
    }
  } catch {
    // fallback
  }

  // If Nominatim failed, fallback to Open-Meteo
  if (!countryAr && !countryEn) {
    try {
      const resMeteo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=ar&format=json`
      ).then((r) => r.json());
      const place = resMeteo?.results?.[0];
      if (place) {
        countryCode = (place.country_code || "").toUpperCase();
        countryAr = place.country || COUNTRY_MAP[countryCode]?.ar || "";
        countryEn = COUNTRY_MAP[countryCode]?.en || place.country || "";
        cityAr = place.name || "";
        cityEn = place.name || "";
      }
    } catch {
      // fallback
    }
  }

  if (countryCode && COUNTRY_MAP[countryCode]) {
    if (!countryAr) countryAr = COUNTRY_MAP[countryCode].ar;
    if (!countryEn) countryEn = COUNTRY_MAP[countryCode].en;
  }

  const city = cityAr || cityEn || "";
  const country = countryAr || countryEn || "";

  return {
    latitude: lat,
    longitude: lon,
    city,
    cityAr: cityAr || city,
    cityEn: cityEn || city,
    country,
    countryAr: countryAr || country,
    countryEn: countryEn || country,
    countryCode,
    provider: "gps",
    formatted: city ? `${country} / ${city}` : country,
  };
}

export const useGeolocation = (auto = true) => {
  const [info, setInfo] = useState<GeoInfo | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GeoInfo) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (forceHighAccuracy = true): Promise<GeoInfo | null> => {
    if (typeof window !== "undefined" && localStorage.getItem("foras-location-sharing") === "false") {
      setError("location-disabled");
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        // Fallback to IP
        fetchIpLocation().then((ipRes) => {
          if (ipRes) {
            setInfo(ipRes);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ipRes));
            setLoading(false);
            resolve(ipRes);
          } else {
            setError("الموقع غير مدعوم");
            setLoading(false);
            resolve(null);
          }
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          try {
            const result = await reverseGeocodeCoords(latitude, longitude);
            result.accuracy = accuracy;
            setInfo(result);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
            setLoading(false);
            resolve(result);
          } catch {
            const fallback: GeoInfo = { latitude, longitude, provider: "gps" };
            setInfo(fallback);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
            setLoading(false);
            resolve(fallback);
          }
        },
        async (err) => {
          // If GPS fails or user denied, fallback gracefully to IP geolocation
          const ipRes = await fetchIpLocation();
          if (ipRes) {
            setInfo(ipRes);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ipRes));
            setLoading(false);
            resolve(ipRes);
          } else {
            setError(err.message || "تعذر الوصول إلى الموقع الجغرافي");
            setLoading(false);
            resolve(null);
          }
        },
        {
          enableHighAccuracy: forceHighAccuracy,
          timeout: 10000,
          maximumAge: forceHighAccuracy ? 0 : 1000 * 60 * 15,
        }
      );
    });
  }, []);

  useEffect(() => {
    if (!auto) return;
    if (info?.city && info?.country) return;
    if (typeof window !== "undefined" && localStorage.getItem("foras-location-sharing") === "false") return;
    request(false);
  }, [auto, info?.city, info?.country, request]);

  return { info, loading, error, request };
};
