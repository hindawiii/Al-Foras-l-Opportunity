import { useEffect, useState } from "react";

export interface AssetQuote {
  id: string;
  symbol: string;
  name: string;
  nameAr: string;
  icon: string;
  price: number;
  change24h: number;
}

const ASSETS: Omit<AssetQuote, "price" | "change24h">[] = [
  { id: "bitcoin",  symbol: "BTC",  name: "Bitcoin",  nameAr: "بيتكوين",   icon: "₿" },
  { id: "ethereum", symbol: "ETH",  name: "Ethereum", nameAr: "إيثيريوم", icon: "Ξ" },
  { id: "tether",   symbol: "USDT", name: "Tether",   nameAr: "تيذر",      icon: "₮" },
];

const GOLD: Omit<AssetQuote, "price" | "change24h"> = {
  id: "pax-gold", symbol: "XAU", name: "Gold (oz)", nameAr: "الذهب (أونصة)", icon: "🥇",
};

const ENDPOINT =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,pax-gold&vs_currencies=usd&include_24hr_change=true";

export interface CryptoGoldState {
  crypto: AssetQuote[];
  gold: AssetQuote | null;
  /** USD price per gram of pure 24K gold */
  goldPricePerGram: number | null;
  updatedAt: Date | null;
  loading: boolean;
  error: string | null;
}

const OZ_TO_G = 31.1035;

export const useCryptoGold = (intervalMs = 60_000): CryptoGoldState => {
  const [crypto, setCrypto] = useState<AssetQuote[]>(
    ASSETS.map(a => ({ ...a, price: 0, change24h: 0 }))
  );
  const [gold, setGold] = useState<AssetQuote | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(ENDPOINT);
        if (!res.ok) throw new Error("network");
        const data = await res.json();
        if (cancelled) return;
        setCrypto(ASSETS.map(a => ({
          ...a,
          price: data?.[a.id]?.usd ?? 0,
          change24h: data?.[a.id]?.usd_24h_change ?? 0,
        })));
        const g = data?.["pax-gold"];
        if (g?.usd) {
          setGold({ ...GOLD, price: g.usd, change24h: g.usd_24h_change ?? 0 });
        }
        setUpdatedAt(new Date());
        setError(null);
      } catch {
        if (!cancelled) setError("تعذر تحديث أسعار الذهب والعملات الرقمية");
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
  }, [intervalMs]);

  const goldPricePerGram = gold ? gold.price / OZ_TO_G : null;

  return { crypto, gold, goldPricePerGram, updatedAt, loading, error };
};

/** Purity factors for gold karats (based on 24K = 1.0) */
export const GOLD_KARATS: { label: string; factor: number }[] = [
  { label: "24K", factor: 24 / 24 },
  { label: "22K", factor: 22 / 24 },
  { label: "21K", factor: 21 / 24 },
  { label: "18K", factor: 18 / 24 },
  { label: "14K", factor: 14 / 24 },
];