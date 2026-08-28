import { useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSettings } from "@/contexts/SettingsContext";
import { findCountryByCode, findCountryByName } from "@/lib/countries";
import { CURRENCIES } from "@/lib/mockData";

/**
 * One-shot synchroniser: when GPS resolves the user's country,
 * propagate it into Settings (countryCode + default currency).
 * Honours the user's manual currency override.
 */
export const useGeoSync = () => {
  const { info } = useGeolocation(true);
  const { setCountryCode, countryCode, setAutoCurrency, localCurrency, currencyManuallySet, setCity, city, locationSharingEnabled } = useSettings();

  useEffect(() => {
    if (!locationSharingEnabled) return;
    if (!info) return;
    const country =
      findCountryByCode(info.countryCode) ?? findCountryByName(info.country);
    if (country && country.code !== countryCode) {
      setCountryCode(country.code);
    }
    // Auto-pick local currency if user hasn't manually chosen one
    if (country && !currencyManuallySet) {
      const supported = CURRENCIES.some(c => c.code === country.currency);
      const next = supported ? country.currency : "USD";
      if (next !== localCurrency) {
        setAutoCurrency(next);
      }
    }
    if (info.city && info.city !== city) setCity(info.city);
  }, [info?.countryCode, info?.country, info?.city, locationSharingEnabled, countryCode, currencyManuallySet, localCurrency, city, setCountryCode, setAutoCurrency, setCity]);
};
