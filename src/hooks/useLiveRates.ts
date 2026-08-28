import { useEffect, useState } from "react";
import { CURRENCIES, Currency } from "@/lib/mockData";
import { ENV } from "@/lib/env";

export interface LiveRates {
  rates: Record<string, number>;
  updatedAt: Date | null;
  loading: boolean;
  error: string | null;
  alert: { code: string; delta: number } | null;
}

const FALLBACK_ENDPOINT = "https://open.er-api.com/v6/latest/USD";
const KEYED_ENDPOINT = (key: string) =>
  `https://v6.exchangerate-api.com/v6/${key}/latest/USD`;

const resolveEndpoint = () =>
  ENV.EXCHANGERATE_API_KEY ? KEYED_ENDPOINT(ENV.EXCHANGERATE_API_KEY) : FALLBACK_ENDPOINT;

/** Both providers expose rates differently; normalise to a flat map. */
const extractRates = (data: any): Record<string, number> | null => {
  if (data?.conversion_rates && typeof data.conversion_rates === "object") return data.conversion_rates;
  if (data?.rates && typeof data.rates === "object") return data.rates;
  return null;
};

export const useLiveRates = (intervalMs = 60_000): LiveRates => {
  const [rates, setRates] = useState<Record<string, number>>(
    Object.fromEntries(CURRENCIES.map(c => [c.code, c.rate]))
  );
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ code: string; delta: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        let res = await fetch(resolveEndpoint());
        if (!res.ok && ENV.EXCHANGERATE_API_KEY) {
          // Keyed endpoint failed (bad/expired key, quota, etc.) — fall back.
          res = await fetch(FALLBACK_ENDPOINT);
        }
        if (!res.ok) throw new Error("network");
        const data = await res.json();
        const apiRates = extractRates(data);
        if (!apiRates) throw new Error("shape");
        if (cancelled) return;
        const next: Record<string, number> = {};
        let biggest: { code: string; delta: number } | null = null;
        for (const c of CURRENCIES) {
          const apiCode = c.apiCode ?? c.code;
          const v = apiRates[apiCode];
          if (typeof v === "number") {
            next[c.code] = v;
            const prev = rates[c.code] ?? c.rate;
            const delta = ((v - prev) / prev) * 100;
            if (Math.abs(delta) > Math.abs(biggest?.delta ?? 0) && Math.abs(delta) > 0.5) {
              biggest = { code: c.code, delta };
            }
          } else {
            next[c.code] = rates[c.code] ?? c.rate;
          }
        }
        setRates(next);
        setUpdatedAt(new Date());
        setError(null);
        if (biggest) setAlert(biggest);
      } catch (e) {
        if (!cancelled) setError("تعذر تحديث الأسعار — عرض بيانات افتراضية");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load();
      }
    }, intervalMs);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { rates, updatedAt, loading, error, alert };
};

export const enrichCurrencies = (rates: Record<string, number>): (Currency & { liveRate: number })[] =>
  CURRENCIES.map(c => ({ ...c, liveRate: rates[c.code] ?? c.rate }));