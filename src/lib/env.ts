/**
 * Central env helper. All VITE_* values are bundled into the client and
 * therefore PUBLIC — never put real secrets here. Use Lovable Cloud
 * secrets + edge functions for anything sensitive.
 *
 * Each getter returns the env value when present, otherwise `undefined`
 * so callers can fall back to a free/no-key code path.
 */

const read = (key: string): string | undefined => {
  try {
    // @ts-ignore - import.meta.env is provided by Vite
    const v = import.meta.env?.[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  } catch { /* ignore */ }
  return undefined;
};

export const ENV = {
  SUPABASE_URL: read("VITE_SUPABASE_URL"),
  // Lovable Cloud names this PUBLISHABLE_KEY; we also accept ANON_KEY as alias.
  SUPABASE_ANON_KEY: read("VITE_SUPABASE_PUBLISHABLE_KEY") ?? read("VITE_SUPABASE_ANON_KEY"),
  EXCHANGERATE_API_KEY: read("VITE_EXCHANGERATE_API_KEY"),
} as const;

export const hasExchangeRateKey = () => !!ENV.EXCHANGERATE_API_KEY;
