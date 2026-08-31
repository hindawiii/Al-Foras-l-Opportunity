import { ArrowLeft, ArrowRight, MapPin, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Props { onBack: () => void; }

export const PrivacySecurityPage = ({ onBack }: Props) => {
  const { t, dir, lang } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const {
    locationSharingEnabled, setLocationSharingEnabled,
    hideProfile, setHideProfile,
  } = useSettings();

  const onLocationToggle = (v: boolean) => {
    setLocationSharingEnabled(v);
    toast.success(v ? t("locationEnabledToast") : t("locationDisabledToast"));
  };

  const Back = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 space-y-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-xs font-semibold text-primary transition-all active:scale-95 ${alignClass}`}
      >
        <Back className="w-3.5 h-3.5" />
        {t("backToSettings")}
      </button>

      {/* Privacy Notice Banner */}
      <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 text-xs ${alignClass}`}>
        <div className="flex items-center gap-2 text-primary font-bold mb-1">
          <Lock className="w-4 h-4" />
          <span>{isRtl ? "حماية وتشفير البيانات" : "Data Protection & Privacy"}</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {isRtl
            ? "بياناتك مشفرة ومحمية محلياً. يمكنك التحكم في صلاحيات الوصول والمشاركة في أي وقت."
            : "Your data is encrypted and securely stored. You can manage sharing permissions at any time."}
        </p>
      </div>

      {/* Grouped Settings */}
      <div className="rounded-2xl bg-background/50 border border-primary/20 divide-y divide-primary/10 overflow-hidden shadow-sm">
        {/* Location Sharing */}
        <div className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 ${alignClass}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 text-primary">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground font-semibold text-xs sm:text-sm">{t("locationShare")}</p>
              <p className="text-2xs sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                {t("locationShareDesc")}
              </p>
            </div>
          </div>
          <Switch
            checked={locationSharingEnabled}
            onCheckedChange={onLocationToggle}
            className="flex-shrink-0"
          />
        </div>

        {/* Hide Profile */}
        <div className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 ${alignClass}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 text-primary">
              <EyeOff className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground font-semibold text-xs sm:text-sm">{t("hideProfile")}</p>
              <p className="text-2xs sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                {t("hideProfileDesc")}
              </p>
            </div>
          </div>
          <Switch
            checked={hideProfile}
            onCheckedChange={setHideProfile}
            className="flex-shrink-0"
          />
        </div>

        {/* 2FA Section */}
        <div className={`p-3.5 sm:p-4 ${alignClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 text-primary">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground font-semibold text-xs sm:text-sm">{t("twoFA")}</p>
                <p className="text-2xs sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                  {t("twoFADesc")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-black font-semibold rounded-xl transition-all flex-shrink-0"
              onClick={() => toast.info(t("twoFASoon"))}
            >
              {t("setUp")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
