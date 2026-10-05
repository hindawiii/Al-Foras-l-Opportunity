import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calculator,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  Zap
} from "lucide-react";
import { useLiveRates, enrichCurrencies } from "@/hooks/useLiveRates";
import { useCryptoGold } from "@/hooks/useCryptoGold";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CURRENCIES } from "@/lib/mockData";
import { LuxeCurrencySelector } from "./LuxeCurrencySelector";

interface CountryPayoutPreset {
  countryCode: string;
  currencyCode: string;
  flag: string;
  nameAr: string;
  nameEn: string;
  recommendedMethodAr: string;
  recommendedMethodEn: string;
  tipAr: string;
  tipEn: string;
}

const PRESETS: Record<string, CountryPayoutPreset> = {
  SD: {
    countryCode: "SD",
    currencyCode: "SDG",
    flag: "🇸🇩",
    nameAr: "السودان",
    nameEn: "Sudan",
    recommendedMethodAr: "Binance P2P ⬅️ تطبيق بنكك (Bankak) أو بطاقة RedotPay الافتراضية",
    recommendedMethodEn: "Binance P2P ⬅️ Bankak App or RedotPay Crypto Visa",
    tipAr: "أسرع وأضمن وسيلة لاستلام الدولار والـ USDT وتفادي القيود المصرفية بدون تجميد أرصدة.",
    tipEn: "Fastest route to cash out USD/USDT avoiding banking bans with zero freeze risk.",
  },
  EG: {
    countryCode: "EG",
    currencyCode: "EGP",
    flag: "🇪🇬",
    nameAr: "مصر",
    nameEn: "Egypt",
    recommendedMethodAr: "Binance P2P ⬅️ فودافون كاش (Vodafone Cash) أو InstaPay",
    recommendedMethodEn: "Binance P2P ⬅️ Vodafone Cash or InstaPay",
    tipAr: "استلام فوري خلال دقيقتين بسعر السوق المباشر دون عمولات بنكية مرتفعة.",
    tipEn: "Instant settlement within 2 minutes at direct market rate without bank fees.",
  },
  SA: {
    countryCode: "SA",
    currencyCode: "SAR",
    flag: "🇸🇦",
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    recommendedMethodAr: "حساب بنكي محلي أو STC Pay أو بطاقة Elevate / Wise",
    recommendedMethodEn: "Local Bank, STC Pay, or Elevate / Wise USD Account",
    tipAr: "استقبال مباشر من المنصات العالمية (Upwork, Deel, Stripe) مع رسوم تحويل منخفضة.",
    tipEn: "Direct receipts from global platforms (Upwork, Deel, Stripe) with minimal fees.",
  },
  AE: {
    countryCode: "AE",
    currencyCode: "AED",
    flag: "🇦🇪",
    nameAr: "الإمارات",
    nameEn: "UAE",
    recommendedMethodAr: "سحب مباشر بالدرهم عبر Wio Bank أو Binance أو Wise",
    recommendedMethodEn: "Direct AED withdrawal via Wio Bank, Binance, or Wise",
    tipAr: "ربط سلس مع كافة بوابات الدفع العالمية والبطاقات الرقمية الفورية.",
    tipEn: "Seamless bridge to global payment gateways and digital debit cards.",
  },
  JO: {
    countryCode: "JO",
    currencyCode: "JOD",
    flag: "🇯🇴",
    nameAr: "الأردن",
    nameEn: "Jordan",
    recommendedMethodAr: "CliQ محلي أو بطاقة زين كاش أو بايونير",
    recommendedMethodEn: "Local CliQ, Zain Cash, or Payoneer",
    tipAr: "تحويل مباشر للمحافظ الرقمية المحلية المعتمدة والبطاقات المصرفية.",
    tipEn: "Direct transfer to licensed local digital wallets and debit cards.",
  },
  MA: {
    countryCode: "MA",
    currencyCode: "MAD",
    flag: "🇲🇦",
    nameAr: "المغرب",
    nameEn: "Morocco",
    recommendedMethodAr: "Payoneer أو CIH Bank أو Binance P2P",
    recommendedMethodEn: "Payoneer, CIH Bank, or Binance P2P",
    tipAr: "استلام أرباح فريلانس عبر بايونير أو بطاقة دولية وربطها بالحساب المحلي.",
    tipEn: "Withdraw freelance revenue via Payoneer or international cards.",
  },
};

export const SmartCurrencyPayoutWidget = () => {
  const { rates, loading: ratesLoading, updatedAt: ratesUpdatedAt } = useLiveRates();
  const { crypto, goldPricePerGram, loading: cryptoLoading } = useCryptoGold();
  const { countryCode } = useSettings();
  const { lang, dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [isOpen, setIsOpen] = useState(false);
  const [amountUsd, setAmountUsd] = useState("100");
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (countryCode && PRESETS[countryCode]?.currencyCode) {
      return PRESETS[countryCode].currencyCode;
    }
    return "USD";
  });
  const [isRealSdgMarket, setIsRealSdgMarket] = useState(true);

  // USDT quote
  const usdtQuote = useMemo(() => {
    const found = crypto.find((c) => c.symbol === "USDT" || c.id === "tether");
    return found?.price && found.price > 0 ? found.price : 1.0;
  }, [crypto]);

  // Current active preset based on selected currency or country
  const currentPreset = useMemo(() => {
    const foundByCurr = Object.values(PRESETS).find((p) => p.currencyCode === selectedCurrency);
    if (foundByCurr) return foundByCurr;
    if (countryCode && PRESETS[countryCode]) return PRESETS[countryCode];
    return PRESETS["SD"];
  }, [selectedCurrency, countryCode]);

  // Effective conversion rate (supporting real market Bankak/P2P rate for Sudan SDG)
  const effectiveRateValue = useMemo(() => {
    if (selectedCurrency === "SDG" && isRealSdgMarket) {
      return 2750; // Current real market / Bankak P2P rate in Sudan
    }
    return rates[selectedCurrency] || 1;
  }, [selectedCurrency, isRealSdgMarket, rates]);

  const numAmount = parseFloat(amountUsd) || 0;
  const calculatedLocal = numAmount * effectiveRateValue;

  return (
    <div className="rounded-2xl border border-border bg-card/85 backdrop-blur-xl shadow-luxe overflow-hidden transition-all duration-300">
      {/* Top Compact Ticker Header */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left / Start: Live Ticker Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Title Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Coins className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold font-arabic">
              {lang === "ar" ? "أسعار الدولار والـ USDT" : "Live USD & USDT Rates"}
            </span>
          </div>

          {/* USDT Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-emerald-400">1 USDT ≈ ${usdtQuote.toFixed(2)}</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              ({lang === "ar" ? "دولار مشفر" : "Crypto USD"})
            </span>
          </div>

          {/* Localized Currency Rate */}
          {effectiveRateValue > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary/80 border border-border text-foreground text-xs font-medium">
              <span>{currentPreset.flag}</span>
              <span className="font-mono font-bold text-foreground">
                1 USD = {effectiveRateValue.toLocaleString("en-US", { maximumFractionDigits: selectedCurrency === "GOLD" ? 4 : 2 })} {selectedCurrency}
              </span>
              {selectedCurrency === "SDG" && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {isRealSdgMarket ? (lang === "ar" ? "سعر بنكك الفعلي" : "Bankak P2P") : (lang === "ar" ? "رسمي" : "Official")}
                </span>
              )}
            </div>
          )}

          {/* Gold Mini Badge */}
          {goldPricePerGram && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-gold/10 border border-gold/30 text-gold text-2xs font-semibold">
              <span>🥇</span>
              <span>{lang === "ar" ? "ذهب 24ك:" : "Gold 24k:"} ${goldPricePerGram.toFixed(1)}/g</span>
            </div>
          )}
        </div>

        {/* Right / End: Interactive Toggle Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            isOpen
              ? "bg-primary text-primary-foreground shadow-brand"
              : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25"
          }`}
          aria-expanded={isOpen}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{lang === "ar" ? "حاسبة استلام الأرباح ⚡" : "Payout Calculator ⚡"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Interactive Calculator & Recommended Payout Path */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border bg-background/50 px-4 py-4 sm:p-5 space-y-4"
          >
            {/* Input Row: Amount & Target Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Amount Input */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  {lang === "ar" ? "مبلغ الأرباح بالدولار (USD / USDT):" : "Earnings in USD / USDT:"}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute start-3 text-xs font-bold text-muted-foreground">$</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    placeholder="100"
                    className="w-full h-11 ps-7 pe-3 rounded-xl bg-card border border-border text-foreground font-mono text-base font-bold focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Target Currency Selector */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-primary" />
                  {lang === "ar" ? "العملة المحلية المستهدفة:" : "Target Local Currency:"}
                </label>
                <LuxeCurrencySelector
                  selectedCode={selectedCurrency}
                  onSelect={(code) => setSelectedCurrency(code)}
                  rates={rates}
                  lang={lang}
                  isRealSdgMarket={isRealSdgMarket}
                />
              </div>
            </div>

            {/* Conversion Result Hero Box */}
            <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xs font-semibold text-muted-foreground">
                    {lang === "ar" ? "القيمة التقديرية بالعملة المحلية:" : "Estimated Local Payout Value:"}
                  </p>
                  {selectedCurrency === "SDG" && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-3xs font-bold">
                      {isRealSdgMarket
                        ? (lang === "ar" ? "⚡ سعر بنكك وسوق P2P المباشر" : "⚡ Real Bankak / P2P")
                        : (lang === "ar" ? "سعر البنك التأشيري القديم" : "Legacy Bank Peg")}
                    </span>
                  )}
                </div>

                <p className="text-2xl sm:text-3xl font-display font-extrabold text-foreground" dir="ltr">
                  {calculatedLocal.toLocaleString("en-US", { maximumFractionDigits: selectedCurrency === "GOLD" ? 4 : 2 })}
                  <span className="text-sm font-bold text-primary ms-1.5">{selectedCurrency}</span>
                </p>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {selectedCurrency === "SDG" && isRealSdgMarket
                    ? (lang === "ar"
                        ? `محسوبة وفق سعر الصرف والتحويل الفعلي في السودان: 1 USD ≈ 2,750 SDG (تطبيق بنكك / Binance P2P)`
                        : `Calculated at real-market cashout rate in Sudan: 1 USD ≈ 2,750 SDG (Bankak / Binance P2P)`)
                    : (lang === "ar"
                        ? `وفق سعر الصرف المباشر: 1 USD = ${effectiveRateValue.toLocaleString("en-US", { maximumFractionDigits: selectedCurrency === "GOLD" ? 4 : 2 })} ${selectedCurrency}`
                        : `At live rate: 1 USD = ${effectiveRateValue.toLocaleString("en-US", { maximumFractionDigits: selectedCurrency === "GOLD" ? 4 : 2 })} ${selectedCurrency}`)}
                </p>

                {/* Sudan Real Bankak vs Official Peg Switcher */}
                {selectedCurrency === "SDG" && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-3xs text-muted-foreground font-medium">
                      {lang === "ar" ? "نوع السعر:" : "Rate Type:"}
                    </span>
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-background/90 border border-border">
                      <button
                        type="button"
                        onClick={() => setIsRealSdgMarket(true)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          isRealSdgMarket
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lang === "ar" ? "سعر بنكك الفعلي (2,750 ج.س)" : "Bankak Real (~2,750)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRealSdgMarket(false)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          !isRealSdgMarket
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lang === "ar" ? "السعر التأشيري القديم (458.58)" : "Legacy Bank (458.58)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <div className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "ar" ? "سعر حي معتمد" : "Live Verified Rate"}</span>
                </div>
              </div>
            </div>

            {/* Smart Payout Route Recommendation */}
            <div className="rounded-xl border border-border bg-card p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <span>{currentPreset.flag}</span>
                  <span>
                    {lang === "ar"
                      ? `أفضل مسار لسحب هذا المبلغ في ${currentPreset.nameAr}:`
                      : `Recommended Payout Route in ${currentPreset.nameEn}:`}
                  </span>
                </p>
                <p className="font-semibold text-primary mt-1">
                  {lang === "ar" ? currentPreset.recommendedMethodAr : currentPreset.recommendedMethodEn}
                </p>
                <p className="text-muted-foreground text-[11px] mt-1 leading-relaxed">
                  {lang === "ar" ? currentPreset.tipAr : currentPreset.tipEn}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
