import { useState, useEffect } from "react";
import {
  User, Shield, Info, Trash2, LogOut, Share2, Languages, ShieldCheck,
  Moon, Zap, Coins, ChevronLeft, ChevronRight, Sparkles, Crown, X, Check,
  CheckCircle2, Globe, ArrowRight, ArrowLeft, GraduationCap, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { nativeShare } from "@/lib/share";
import { guestStorage } from "@/lib/guestStorage";
import { profileExtras } from "@/lib/profileExtras";
import { PrivacySecurityPage } from "@/components/foras/PrivacySecurityPage";
import { AboutDialog } from "@/components/foras/AboutDialog";
import { AdminDashboardModal } from "@/components/foras/AdminDashboardModal";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

const SUPPORTED_CURRENCIES = [
  { code: "SAR", symbol: "ر.س", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", flag: "🇸🇦" },
  { code: "USD", symbol: "$", nameAr: "دولار أمريكي", nameEn: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", nameAr: "يورو أوروبي", nameEn: "Euro", flag: "🇪🇺" },
  { code: "AED", symbol: "د.إ", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", flag: "🇦🇪" },
  { code: "EGP", symbol: "ج.م", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", flag: "🇪🇬" },
  { code: "KWD", symbol: "د.ك", nameAr: "دينار كويتي", nameEn: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "QAR", symbol: "ر.ق", nameAr: "ريال قطري", nameEn: "Qatari Riyal", flag: "🇶🇦" },
  { code: "JOD", symbol: "د.أ", nameAr: "دينار أردني", nameEn: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "OMR", symbol: "ر.ع", nameAr: "ريال عماني", nameEn: "Omani Rial", flag: "🇴🇲" },
  { code: "BHD", symbol: "د.ب", nameAr: "دينار بحريني", nameEn: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "GBP", symbol: "£", nameAr: "جنيه إسترليني", nameEn: "British Pound", flag: "🇬🇧" },
  { code: "TRY", symbol: "₺", nameAr: "ليرة تركية", nameEn: "Turkish Lira", flag: "🇹🇷" },
  { code: "MAD", symbol: "د.م", nameAr: "درهم مغربي", nameEn: "Moroccan Dirham", flag: "🇲🇦" },
  { code: "DZD", symbol: "د.ج", nameAr: "دينار جزائري", nameEn: "Algerian Dinar", flag: "🇩🇿" },
  { code: "IQD", symbol: "د.ع", nameAr: "دينار عراقي", nameEn: "Iraqi Dinar", flag: "🇮🇶" },
];

export const SettingsSheet = ({ open, onOpenChange }: Props) => {
  const { signOut, user } = useAuth();
  const { lang, dir, toggleLang, t } = useLanguage();
  const { textOnly, toggleTextOnly, localCurrency, setLocalCurrency } = useSettings();
  const nav = useNavigate();
  const [view, setView] = useState<"main" | "privacy">("main");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const [persona, setPersona] = useState<"student" | "professional">("student");

  // Load persona from extras
  useEffect(() => {
    if (open) {
      profileExtras.load().then((ex) => {
        if (ex.persona) setPersona(ex.persona);
      });
    }
  }, [open]);

  const handleSetPersona = async (newPersona: "student" | "professional") => {
    setPersona(newPersona);
    const curr = await profileExtras.load();
    const updated = { ...curr, persona: newPersona };
    await profileExtras.save(updated);
    // Dispatch event so ProfileTab updates in real-time
    window.dispatchEvent(new CustomEvent("foras:persona_change", { detail: { persona: newPersona } }));
    toast.success(
      newPersona === "student"
        ? (isRtl ? "تم تفعيل هوية: طالب وباحث عن منح 🎓" : "Persona set to: Student & Scholar 🎓")
        : (isRtl ? "تم تفعيل هوية: مهني ومستقل وموظف 💼" : "Persona set to: Professional & Freelancer 💼")
    );
  };

  // Reset view when sheet closes
  const handleOpenChange = (v: boolean) => {
    if (!v) setView("main");
    onOpenChange(v);
  };

  const handleClearCache = async () => {
    await guestStorage.clearAllCache();
    toast.success(lang === "ar" ? "تم مسح الملفات والذاكرة المؤقتة بنجاح" : "Cache successfully cleared");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(lang === "ar" ? "تم تسجيل الخروج بنجاح" : "Signed out successfully");
    nav("/auth");
  };

  const handleShareApp = async () => {
    await nativeShare({
      title: "الفرص — Al-Foras",
      text: lang === "ar"
        ? "اكتشف أحدث المنح الدراسية وفرص العمل والجامعات المعتمدة في تطبيق واحد."
        : "Discover the latest scholarships, job opportunities, and accredited universities in one app.",
      url: window.location.origin,
    });
  };

  const openProfile = () => {
    onOpenChange(false);
    window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "profile" } }));
  };

  const activeCurrencyObj = SUPPORTED_CURRENCIES.find(c => c.code === localCurrency) || SUPPORTED_CURRENCIES[0];

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.nameAr.includes(currencySearch) ||
    c.nameEn.toLowerCase().includes(currencySearch.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        className="bg-card/95 backdrop-blur-xl border-primary/20 w-[90%] sm:max-w-md md:max-w-lg flex flex-col p-0 shadow-2xl z-50"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-primary/10 flex flex-row items-center justify-between">
          <div className={`min-w-0 ${alignClass}`}>
            <SheetTitle className="text-gold-gradient font-display text-xl sm:text-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{view === "main" ? t("settings") : t("privacySection")}</span>
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {view === "main"
                ? (isRtl ? "تخصيص التفضيلات والحساب والمظهر" : "Customize preferences, account & display")
                : (isRtl ? "إعدادات الأمان ومشاركة البيانات" : "Security & data sharing options")}
            </p>
          </div>
        </SheetHeader>

        {view === "privacy" ? (
          <div className="flex-1 overflow-y-auto pt-3">
            <PrivacySecurityPage onBack={() => setView("main")} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
            {/* User Profile Mini Banner */}
            <div
              role="button"
              tabIndex={0}
              onClick={openProfile}
              className={`p-3.5 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/25 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99] ${alignClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/35 flex items-center justify-center text-primary font-bold shadow-sm flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                      {user?.user_metadata?.full_name || t("settingsGuestAccount")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t("settingsActiveBadge")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {t("settingsAccountDesc")}
                  </p>
                </div>
              </div>
              <Chevron className="w-4 h-4 text-primary flex-shrink-0" />
            </div>

            {/* Group 1: Preferences & Display */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-bold text-primary/80 uppercase tracking-wider px-1 block ${alignClass}`}>
                {t("settingsPreferencesGroup")}
              </span>
              <div className="rounded-2xl bg-background/50 border border-primary/20 divide-y divide-primary/10 overflow-hidden shadow-sm">
                {/* Language Switch */}
                <SettingRow
                  icon={Languages}
                  title={t("language")}
                  description={t("settingsLanguageDesc")}
                  alignClass={alignClass}
                  onClick={toggleLang}
                  trailing={
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all flex-shrink-0">
                      <Globe className="w-3.5 h-3.5" />
                      {lang === "ar" ? "العربية ⇄ EN" : "EN ⇄ العربية"}
                    </span>
                  }
                />

                {/* Preferred Currency */}
                <SettingRow
                  icon={Coins}
                  title={t("settingsCurrency")}
                  description={t("settingsCurrencyDesc")}
                  alignClass={alignClass}
                  onClick={() => setCurrencyModalOpen(true)}
                  trailing={
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all flex-shrink-0">
                      <span>{activeCurrencyObj.flag}</span>
                      <span>{activeCurrencyObj.code}</span>
                      <Chevron className="w-3.5 h-3.5 text-primary/70" />
                    </div>
                  }
                />

                {/* Dark Mode (Permanent Luxe Dark) */}
                <SettingRow
                  icon={Moon}
                  title={t("darkMode")}
                  description={t("settingsDarkDesc")}
                  alignClass={alignClass}
                  trailing={
                    <span className="text-[11px] font-semibold text-primary/90 bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg flex-shrink-0">
                      {isRtl ? "مفعّل تلقائياً ✓" : "Always Active ✓"}
                    </span>
                  }
                />

                {/* Data Saver Mode */}
                <SettingRow
                  icon={Zap}
                  title={t("settingsTextOnly")}
                  description={t("settingsTextOnlyDesc")}
                  alignClass={alignClass}
                  trailing={
                    <Switch
                      checked={textOnly}
                      onCheckedChange={toggleTextOnly}
                      className="flex-shrink-0"
                    />
                  }
                />
              </div>
            </div>

            {/* Group 2: Account, Security & Admin */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-bold text-primary/80 uppercase tracking-wider px-1 block ${alignClass}`}>
                {t("settingsAccountGroup")}
              </span>
              <div className="rounded-2xl bg-background/50 border border-primary/20 divide-y divide-primary/10 overflow-hidden shadow-sm">
                {/* Persona Switcher */}
                <div className={`p-3.5 space-y-2.5 ${alignClass}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary">
                      {persona === "student" ? <GraduationCap className="w-4.5 h-4.5" /> : <Briefcase className="w-4.5 h-4.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs sm:text-sm font-semibold text-foreground truncate">
                        {t("settingsPersona")}
                      </span>
                      <span className="block text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                        {t("settingsPersonaDesc")}
                      </span>
                    </div>
                  </div>

                  {/* Two Archetype Buttons */}
                  <div className="grid grid-cols-2 gap-2 bg-background/70 p-1.5 rounded-xl border border-primary/20">
                    <button
                      type="button"
                      onClick={() => handleSetPersona("student")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        persona === "student"
                          ? "bg-primary text-black shadow-gold font-extrabold"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{t("settingsPersonaStudent")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetPersona("professional")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        persona === "professional"
                          ? "bg-primary text-black shadow-gold font-extrabold"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{t("settingsPersonaPro")}</span>
                    </button>
                  </div>
                </div>

                {/* Account Details */}
                <SettingRow
                  icon={User}
                  title={t("accountSettings")}
                  description={t("settingsAccountDesc")}
                  alignClass={alignClass}
                  onClick={openProfile}
                  trailing={<Chevron className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                />

                {/* Privacy & Security Subview */}
                <SettingRow
                  icon={Shield}
                  title={t("privacy")}
                  description={t("settingsPrivacyDesc")}
                  alignClass={alignClass}
                  onClick={() => setView("privacy")}
                  trailing={<Chevron className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                />

                {/* Admin Portal (Highlighted) */}
                <SettingRow
                  icon={Crown}
                  title={isRtl ? "لوحة تحكم الإدارة والتحديثات 👑" : "Admin & Management Portal 👑"}
                  description={t("settingsAdminDesc")}
                  alignClass={alignClass}
                  onClick={() => setAdminOpen(true)}
                  highlighted
                  trailing={
                    <span className="text-[10px] font-bold text-primary bg-primary/20 border border-primary/40 px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                      {isRtl ? "دخول آمن" : "Secure Portal"}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Group 3: Data & Storage */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-bold text-primary/80 uppercase tracking-wider px-1 block ${alignClass}`}>
                {t("settingsDataGroup")}
              </span>
              <div className="rounded-2xl bg-background/50 border border-primary/20 divide-y divide-primary/10 overflow-hidden shadow-sm">
                <SettingRow
                  icon={Trash2}
                  title={t("clearCache")}
                  description={t("settingsCacheDesc")}
                  alignClass={alignClass}
                  onClick={handleClearCache}
                  trailing={
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearCache();
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-primary bg-muted/30 hover:bg-primary/10 border border-border px-3 py-1.5 rounded-xl transition-all flex-shrink-0 active:scale-95"
                    >
                      {isRtl ? "مسح الآن" : "Clear"}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Group 4: About & Community */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-bold text-primary/80 uppercase tracking-wider px-1 block ${alignClass}`}>
                {t("settingsAboutGroup")}
              </span>
              <div className="rounded-2xl bg-background/50 border border-primary/20 divide-y divide-primary/10 overflow-hidden shadow-sm">
                {/* Share App */}
                <SettingRow
                  icon={Share2}
                  title={t("shareApp")}
                  description={t("settingsShareDesc")}
                  alignClass={alignClass}
                  onClick={handleShareApp}
                  trailing={
                    <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/25 px-3 py-1.5 rounded-xl flex-shrink-0">
                      {isRtl ? "مشاركة" : "Share"}
                    </span>
                  }
                />

                {/* About App */}
                <SettingRow
                  icon={Info}
                  title={t("about")}
                  description={t("settingsAboutDesc")}
                  alignClass={alignClass}
                  onClick={() => setAboutOpen(true)}
                  trailing={<Chevron className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                />
              </div>
            </div>

            {/* Bottom Actions: Sign Out & Footer */}
            <div className="pt-2 space-y-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="danger"
                    size="lg"
                    className="w-full h-11 text-xs sm:text-sm font-bold rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>{t("logout")}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-gold/30 rounded-2xl max-w-sm" dir={dir}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className={`${alignClass} text-gold-gradient font-display text-lg sm:text-xl`}>
                      {t("confirmLogout")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className={`${alignClass} text-muted-foreground text-xs leading-relaxed`}>
                      {t("confirmLogoutDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className={`gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="flex-1 h-9 rounded-xl bg-destructive text-white hover:bg-destructive/90 text-xs font-bold transition-colors"
                    >
                      {t("yesLogout")}
                    </AlertDialogAction>
                    <AlertDialogCancel className="flex-1 h-9 mt-0 rounded-xl bg-background border border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold transition-colors">
                      {t("cancel")}
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Version Tag */}
              <div className="text-center py-2">
                <p className="text-[11px] text-muted-foreground/80 font-medium">
                  {isRtl ? "الفرص © 2026 · منصة الفرص والمنح الدراسية العالمية v2.5" : "Al-Foras © 2026 · Global Opportunities & Scholarships Platform v2.5"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Currency Selection Dialog */}
        <Dialog open={currencyModalOpen} onOpenChange={setCurrencyModalOpen}>
          <DialogContent className="bg-card border-primary/30 max-w-sm rounded-2xl p-4 sm:p-5" dir={dir}>
            <DialogHeader className="pb-2">
              <DialogTitle className={`text-gold-gradient font-display text-lg flex items-center gap-2 ${alignClass}`}>
                <Coins className="w-5 h-5 text-primary" />
                <span>{t("settingsSelectCurrency")}</span>
              </DialogTitle>
              <DialogDescription className={`text-xs text-muted-foreground ${alignClass}`}>
                {isRtl ? "اختر عملة التسعير الافتراضية لعرض تكاليف المنح ومبالغ الوظائف" : "Choose the currency used to display scholarship & job amounts"}
              </DialogDescription>
            </DialogHeader>

            {/* Quick Filter Input */}
            <div className="my-2">
              <input
                type="text"
                value={currencySearch}
                onChange={e => setCurrencySearch(e.target.value)}
                placeholder={isRtl ? "ابحث باسم العملة أو الرمز..." : "Search currency name or code..."}
                className="w-full px-3 py-2 text-xs rounded-xl bg-background/60 border border-primary/25 focus:border-primary text-foreground outline-none transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Currency List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredCurrencies.map((c) => {
                const isSelected = localCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      setLocalCurrency(c.code);
                      setCurrencyModalOpen(false);
                      toast.success(isRtl ? `تم اعتماد عملة ${c.nameAr} (${c.code})` : `Currency set to ${c.nameEn} (${c.code})`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs active:scale-[0.99] ${
                      isSelected
                        ? "bg-primary/15 border-primary text-primary font-bold shadow-sm"
                        : "bg-background/40 border-transparent hover:border-primary/20 text-foreground hover:bg-primary/5"
                    } ${alignClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{c.flag}</span>
                      <div className="min-w-0">
                        <span className="font-semibold">{isRtl ? c.nameAr : c.nameEn}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5 mr-1.5 font-mono">({c.code} · {c.symbol})</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
        <AdminDashboardModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

interface SettingRowProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  alignClass: string;
  highlighted?: boolean;
}

const SettingRow = ({
  icon: Icon,
  title,
  description,
  trailing,
  onClick,
  alignClass,
  highlighted,
}: SettingRowProps) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    }}
    className={`w-full flex items-center justify-between gap-3 p-3 sm:p-3.5 transition-all select-none ${
      highlighted
        ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent hover:bg-primary/20"
        : "hover:bg-primary/10"
    } ${onClick ? "cursor-pointer active:scale-[0.99]" : ""} ${alignClass}`}
  >
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          highlighted
            ? "bg-primary/20 border border-primary/40 text-primary shadow-gold"
            : "bg-primary/10 border border-primary/25 text-primary"
        }`}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <span className="block text-xs sm:text-sm font-semibold text-foreground truncate">
          {title}
        </span>
        {description && (
          <span className="block text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
            {description}
          </span>
        )}
      </div>
    </div>
    {trailing && <div className="flex-shrink-0 flex items-center">{trailing}</div>}
  </div>
);

