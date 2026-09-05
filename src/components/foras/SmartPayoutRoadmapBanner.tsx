import React, { useState } from "react";
import {
  MapPin, ChevronDown, Check, Sparkles, Globe, ShieldCheck,
  RefreshCw, CheckCircle2, Navigation
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { COUNTRIES, findCountryByCode } from "@/lib/countries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CountryPayoutGuide {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  highlightPills: Array<{ labelAr: string; labelEn: string }>;
}

const COUNTRY_PAYOUT_GUIDES: Record<string, CountryPayoutGuide> = {
  SD: {
    titleAr: "دليل استلام الأرباح وسحب الدولار للمستقلين في السودان 🇸🇩",
    titleEn: "Freelancer Payout & USD Cashout Roadmap in Sudan 🇸🇩",
    descAr: "حلول موثقة لتجاوز الحظر المصرفي؛ استلم أرباحك بالدولار عبر الحسابات الأمريكية (Elevate / Payoneer)، واسحبها فوريّاً بالجنيه السوداني إلى حسابك في تطبيق بنكك (بنك الخرطوم) أو فوري عبر تداولات P2P المعتمدة والعملات الرقمية بأعلى أمان.",
    descEn: "Verified routes to bypass sanctions: Receive USD via US accounts (Elevate/Payoneer) and cash out instantly in SDG to Bokak (Bank of Khartoum) or Fawry via audited P2P crypto rails.",
    highlightPills: [
      { labelAr: "تطبيق بنكك", labelEn: "Bokak" },
      { labelAr: "Elevate Pay", labelEn: "Elevate Pay" },
      { labelAr: "بينانس P2P", labelEn: "Binance P2P" },
      { labelAr: "Payoneer", labelEn: "Payoneer" },
    ],
  },
  EG: {
    titleAr: "دليل استلام أرباح العمل الحر وسحب العملة الصعبة في مصر 🇪🇬",
    titleEn: "Freelancer Payout & USD Withdrawal Roadmap in Egypt 🇪🇬",
    descAr: "طرق مؤكدة لاستلام العملة الصعبة؛ ربط مباشر مع الحسابات البنكية الدولارية، أو السحب الفوري بالجنيه المصري عبر إنستاباي (InstaPay) وفودافون كاش وبطاقات الدفع الذكية مع أقل عمولات سحب.",
    descEn: "Proven payout routes in Egypt: Direct link to USD bank accounts, instant EGP cashout via InstaPay, Vodafone Cash, and smart virtual debit cards with minimal FX fees.",
    highlightPills: [
      { labelAr: "إنستاباي InstaPay", labelEn: "InstaPay" },
      { labelAr: "فودافون كاش", labelEn: "Vodafone Cash" },
      { labelAr: "Payoneer", labelEn: "Payoneer" },
      { labelAr: "حساب بنكي دولاري", labelEn: "USD Bank Account" },
    ],
  },
  SA: {
    titleAr: "دليل استلام عوائد العمل الحر في المملكة العربية السعودية 🇸🇦",
    titleEn: "Freelancer Payout & Remote Contracts in Saudi Arabia 🇸🇦",
    descAr: "استلم عوائدك الدولية وعقود العمل المرن بسهولة؛ تحويل مباشر عبر نظام سريع للحسابات البنكية التجارية المرتبطة بوثيقة العمل الحر، ومحافظ stc pay وUrpay وحسابات Payoneer المعتمدة.",
    descEn: "Seamless payouts for Saudi freelancers: Direct Sarie bank transfers linked to Freelance Certificate, stc pay, Urpay, and verified Payoneer corporate receiving accounts.",
    highlightPills: [
      { labelAr: "تحويل سريع Sarie", labelEn: "Sarie Transfer" },
      { labelAr: "stc pay", labelEn: "stc pay" },
      { labelAr: "وثيقة العمل الحر", labelEn: "Freelance Document" },
      { labelAr: "Urpay", labelEn: "Urpay" },
    ],
  },
  AE: {
    titleAr: "دليل استلام أرباح الفريلانسرز في دولة الإمارات 🇦🇪",
    titleEn: "Freelancer Earnings & Multi-Currency Roadmap in UAE 🇦🇪",
    descAr: "خيارات استلام عالمية بدون تعقيدات؛ تحويلات بنكية مباشرة بالدولار والدرهم عبر الـ IBAN، حسابات رقمية متقدمة (Wio Bank / Mashreq Neo)، ودعم شامل لكافة بطاقات العملات الرقمية وباي بال.",
    descEn: "Global multi-currency receiving rails: Direct IBAN transfers in AED/USD, modern digital banks (Wio, Mashreq Neo), and frictionless crypto debit card spending.",
    highlightPills: [
      { labelAr: "تحويل IBAN مباشر", labelEn: "Direct IBAN" },
      { labelAr: "Wio Bank", labelEn: "Wio Bank" },
      { labelAr: "Mashreq Neo", labelEn: "Mashreq Neo" },
      { labelAr: "باي بال & Stripe", labelEn: "PayPal & Stripe" },
    ],
  },
  MA: {
    titleAr: "دليل سحب أرباح المستقلين وتخطي قيود الصرف في المغرب 🇲🇦",
    titleEn: "Freelance USD Cashout Roadmap in Morocco 🇲🇦",
    descAr: "أفضل الحلول لتجاوز قيود الصرف والتحويل الدولي؛ تفعيل باي بال كلياً عبر البطاقات الافتراضية الدولية، وتداول العملات المستقرة، والسحب المباشر عبر Payoneer وWise إلى الحسابات البنكية المغربية.",
    descEn: "Overcome exchange limits: Fully unlock PayPal with international virtual cards, use stablecoin P2P, and direct Payoneer/Wise cashout to Moroccan banks.",
    highlightPills: [
      { labelAr: "تفعيل PayPal", labelEn: "PayPal Activation" },
      { labelAr: "Payoneer", labelEn: "Payoneer" },
      { labelAr: "Wise", labelEn: "Wise" },
      { labelAr: "بينانس P2P", labelEn: "Binance P2P" },
    ],
  },
  DZ: {
    titleAr: "دليل استلام وسحب أرباح العمل الحر في الجزائر 🇩🇿",
    titleEn: "Freelance Payout & Euro/USD Cashout in Algeria 🇩🇿",
    descAr: "طرق عملية لاستلام العملة الصعبة بدون وساطات معقدة؛ بطاقات فيزا/ماستركارد الرقمية الموثقة (RedotPay / Pyypl / Paysera)، وسحب الأرباح بالدينار الجزائري عبر منصات P2P المضمونة.",
    descEn: "Practical FX receiving in Algeria: Virtual cards (RedotPay / Pyypl), Paysera, and secure DZD peer-to-peer cashout.",
    highlightPills: [
      { labelAr: "RedotPay Visa", labelEn: "RedotPay Visa" },
      { labelAr: "P2P بالدينار الجزائري", labelEn: "DZD P2P" },
      { labelAr: "Paysera", labelEn: "Paysera" },
      { labelAr: "Payoneer", labelEn: "Payoneer" },
    ],
  },
  TN: {
    titleAr: "دليل سحب أموال العمل الحر للمستقلين في تونس 🇹🇳",
    titleEn: "Freelance Earnings Roadmap in Tunisia 🇹🇳",
    descAr: "حلول لتجاوز قيود الدفع الإلكتروني؛ استلام العملة الصعبة عبر حسابات Payoneer وبطاقات فيزا الرقمية المدعومة بالكريبتو، واستلام الدينار التونسي عبر شبكات التبادل المعتمدة.",
    descEn: "Overcoming FX constraints: Receive international client transfers via Payoneer, crypto-backed debit cards, and trusted local cashout rails.",
    highlightPills: [
      { labelAr: "Payoneer", labelEn: "Payoneer" },
      { labelAr: "بطاقات فيزا الرقمية", labelEn: "Virtual Visa" },
      { labelAr: "Binance P2P", labelEn: "Binance P2P" },
    ],
  },
  JO: {
    titleAr: "دليل استلام أرباح العمل الحر والمستقلين في الأردن 🇯🇴",
    titleEn: "Freelancer Payout Roadmap in Jordan 🇯🇴",
    descAr: "طرق استلام سهلة ومباشرة؛ سحب سريع للحسابات البنكية عبر نظام كليك (CliQ) ومحافظ زين كاش وOrange Money، مع ربط مباشر بحسابات Payoneer وباي بال الموثقة.",
    descEn: "Smooth payouts in Jordan: Instant cashout via CliQ system, Zain Cash, Orange Money, and verified Payoneer/PayPal account linkages.",
    highlightPills: [
      { labelAr: "نظام كليك CliQ", labelEn: "CliQ System" },
      { labelAr: "Zain Cash", labelEn: "Zain Cash" },
      { labelAr: "Orange Money", labelEn: "Orange Money" },
      { labelAr: "Payoneer", labelEn: "Payoneer" },
    ],
  },
  IQ: {
    titleAr: "دليل استلام أرباح العمل الحر والمستقلين في العراق 🇮🇶",
    titleEn: "Freelancer Cashout & USD Roadmap in Iraq 🇮🇶",
    descAr: "حلول مضمونة لاستلام الأرباح وتخطي قيود التحويل الخارجي؛ استخدام محافظ زين كاش (ZainCash) وبطاقات ماستركارد الرافدين والمصرف العراقي للتجارة، مع تداولات P2P المعتمدة وسحب الدولار بأمان.",
    descEn: "Reliable payout rails in Iraq: ZainCash wallets, Rafidain & TBI Mastercards, P2P exchange rails, and verified digital accounts.",
    highlightPills: [
      { labelAr: "زين كاش ZainCash", labelEn: "ZainCash" },
      { labelAr: "ماستركارد الرافدين", labelEn: "Mastercard" },
      { labelAr: "Binance P2P", labelEn: "Binance P2P" },
      { labelAr: "Payoneer", labelEn: "Payoneer" },
    ],
  },
};

export const SmartPayoutRoadmapBanner: React.FC = () => {
  const { lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";

  const { countryCode, setCountryCode, setCity } = useSettings();
  const { info, request } = useGeolocation(false);

  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [isDisclosureModalOpen, setIsDisclosureModalOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Active country resolution: manual settings override -> silent geo detection -> fallback "SD"
  const activeCode = (countryCode || info?.countryCode || "SD").toUpperCase();
  const currentCountry = findCountryByCode(activeCode) || {
    code: activeCode,
    nameAr: "الوطن العربي والعالم",
    nameEn: "MENA & Global",
    flag: "🌍",
    currency: "USD",
  };

  const customGuide = COUNTRY_PAYOUT_GUIDES[activeCode];
  const title = customGuide
    ? (ar ? customGuide.titleAr : customGuide.titleEn)
    : (ar
        ? `دليل استلام الأرباح وسحب الدولار في ${currentCountry.nameAr} ${currentCountry.flag}`
        : `Freelancer Payout & USD Cashout in ${currentCountry.nameEn} ${currentCountry.flag}`);

  const description = customGuide
    ? (ar ? customGuide.descAr : customGuide.descEn)
    : (ar
        ? "حصر شامل وموثق لأهم البنوك الرقمية الأمريكية، المحافظ النقدية السريعة، وبطاقات الفيزا المشحونة بالعملات الرقمية لتخطي كافة القيود المصرفية واستلام أموالك بأمان."
        : "Verified receiving accounts, US virtual banking, instant cash rails, and crypto-backed Visa cards to effortlessly withdraw freelance earnings.");

  const pills = customGuide?.highlightPills || [
    { labelAr: "بنوك أمريكية رقمية", labelEn: "US Virtual Banks" },
    { labelAr: "محافظ P2P النقدية", labelEn: "P2P Cash Rails" },
    { labelAr: "بطاقات فيزا مشحونة", labelEn: "Crypto Visa" },
    { labelAr: "تحويلات بنكية", labelEn: "Bank Transfers" },
  ];

  // User explicitly confirmed GPS location sync from prominent disclosure modal
  const handleConfirmGpsSync = async () => {
    setGpsLoading(true);
    try {
      const res = await request(true);
      if (res?.countryCode) {
        setCountryCode(res.countryCode);
        if (res.city) setCity(res.city);
        const matched = findCountryByCode(res.countryCode);
        toast.success(
          ar
            ? `تمت المزامنة بنجاح! تم تحديد موقعك: ${matched?.nameAr || res.country} ${matched?.flag || "📍"}`
            : `Synced! Location set to ${matched?.nameEn || res.country} ${matched?.flag || "📍"}`
        );
      } else {
        toast.info(ar ? "تم الاعتماد على الدولة المحددة مسبقاً" : "Defaulted to existing country");
      }
    } catch {
      toast.error(ar ? "تعذر تحديد الموقع الجغرافي الدقيق" : "Could not determine exact location");
    } finally {
      setGpsLoading(false);
      setIsDisclosureModalOpen(false);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-emerald-500/15 border-2 border-amber-500/30 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background shine */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
              💡
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                  {title}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {ar ? "دليل مخصص لبلدك" : "Tailored for your country"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                {description}
              </p>

              {/* Country Key Rails Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {pills.map((pill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-background/80 border border-amber-500/20 text-foreground flex items-center gap-1 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{ar ? pill.labelAr : pill.labelEn}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Country Switcher & Google-Play Compliant Sync Trigger */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-amber-500/20">
            {/* Country Selector Button */}
            <button
              onClick={() => setIsCountryPickerOpen(true)}
              className="h-9 px-3 rounded-xl bg-card/90 hover:bg-card border border-amber-500/40 text-foreground text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              title={ar ? "تغيير البلد المخصص للدليل" : "Change selected country"}
            >
              <span className="text-base">{currentCountry.flag}</span>
              <span>{ar ? currentCountry.nameAr : currentCountry.nameEn}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* In-Context GPS Sync Button with Prominent Disclosure */}
            <button
              onClick={() => setIsDisclosureModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title={ar ? "مزامنة تلقائية حسب موقعك الجغرافي" : "Auto-sync with your location"}
            >
              <Navigation className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{ar ? "مزامنة موقعي 📍" : "Sync Location 📍"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 🌐 Modal 1: Quick Country Selector                                      */}
      {/* ======================================================================= */}
      <Dialog open={isCountryPickerOpen} onOpenChange={setIsCountryPickerOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-6 rounded-2xl bg-card border border-amber-500/30">
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" />
              <span>{ar ? "اختر دولتك لتخصيص طرق الدفع والاستلام" : "Select Country for Payout Guidance"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {ar
                ? "سيتم تخصيص دليل سحب الأرباح والعملات والبنوك الرقمية المعتمدة فوراً حسب الدولة المختارة."
                : "Payout guidance and verified rails will update instantly based on your selection."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 overflow-y-auto py-3 pr-1 max-h-[55vh]">
            {COUNTRIES.map((c) => {
              const isSelected = activeCode === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountryCode(c.code);
                    setIsCountryPickerOpen(false);
                    toast.success(
                      ar
                        ? `تم تخصيص الدليل لدولة: ${c.nameAr} ${c.flag}`
                        : `Roadmap personalized for ${c.nameEn} ${c.flag}`
                    );
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500 text-foreground shadow-2xs"
                      : "bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span className="truncate">{ar ? c.nameAr : c.nameEn}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCountryPickerOpen(false)}
              className="text-xs font-semibold"
            >
              {ar ? "إغلاق" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================================================================= */}
      {/* 🔒 Modal 2: Google Play Prominent Disclosure Dialog for Geolocation     */}
      {/* Fully compliant with Google Play Developer Policy on Location           */}
      {/* ======================================================================= */}
      <Dialog open={isDisclosureModalOpen} onOpenChange={setIsDisclosureModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-card border-2 border-primary/30">
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <span>{ar ? "المزامنة الجغرافية الذكية لتطبيق فُرص" : "Smart Geo-Personalization for Foras"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
              {ar
                ? "لتخصيص أفضل المنح الدراسية الموجهة لمواطني بلدك، وإظهار منصات العمل الحر المتاحة بدون حظر، وترتيب طرق سحب الأرباح والبنوك المحلية (مثل بنكك / إنستاباي) التي تعمل في منطقتك، يحتاج التطبيق إلى التعرف على موقعك الجغرافي."
                : "To customize scholarships for your nationality, highlight unblocked freelance platforms, and prioritize working local payout methods (like Bokak or InstaPay), Foras can detect your location."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2 text-xs">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <span>🔒</span>
              <span>{ar ? "ضمانات الخصوصية والأمان (سياسة Google Play):" : "Privacy & Play Store Compliance:"}</span>
            </div>
            <ul className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{ar ? "يتم فحص الموقع محلياً على جهازك فقط لتحديد اسم دولتك ومدينتك." : "Processed locally on your device only to determine country & city."}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{ar ? "لا نقوم بتتبع تحركاتك أو تخزين إحداثيات الـ GPS في أي خوادم." : "No continuous tracking or storing of GPS coordinates on servers."}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{ar ? "لا يتم بيع أو مشاركة بياناتك الجغرافية مع أي طرف ثالث إطلاقاً." : "Never sold or shared with any advertising or third-party networks."}</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDisclosureModalOpen(false);
                setIsCountryPickerOpen(true);
              }}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 ml-1.5" />
              <span>{ar ? "سأختار دولتي يدوياً" : "Pick Manually"}</span>
            </Button>

            <Button
              variant="luxe"
              size="sm"
              disabled={gpsLoading}
              onClick={handleConfirmGpsSync}
              className="w-full sm:w-auto text-xs font-bold shadow-gold"
            >
              {gpsLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 ml-1.5 animate-spin" />
                  <span>{ar ? "جارٍ المزامنة..." : "Syncing..."}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 mr-1.5 ml-1.5" />
                  <span>{ar ? "موافقة وتحديد موقعي" : "Allow & Sync Location"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
