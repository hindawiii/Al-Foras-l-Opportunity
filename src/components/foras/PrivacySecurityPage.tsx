import { ArrowLeft, ArrowRight, MapPin, EyeOff, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Props { onBack: () => void; }

export const PrivacySecurityPage = ({ onBack }: Props) => {
  const { t, dir } = useLanguage();
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
    <div className="flex-1 overflow-y-auto px-6 pb-8 mt-2">
      <button onClick={onBack}
        className={`inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-glow mb-4 ${alignClass}`}>
        <Back className="w-3.5 h-3.5" />
        {t("backToSettings")}
      </button>

      <div className="space-y-3">
        <div className={`bg-background/40 border border-border rounded-xl p-4 ${alignClass}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium text-sm">{t("locationShare")}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("locationShareDesc")}
              </p>
            </div>
            <Switch
              checked={locationSharingEnabled}
              onCheckedChange={onLocationToggle}
            />
          </div>
        </div>

        <div className={`bg-background/40 border border-border rounded-xl p-4 ${alignClass}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium text-sm">{t("hideProfile")}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("hideProfileDesc")}
              </p>
            </div>
            <Switch
              checked={hideProfile}
              onCheckedChange={setHideProfile}
            />
          </div>
        </div>

        <div className={`bg-background/40 border border-border rounded-xl p-4 ${alignClass}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium text-sm">{t("twoFA")}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("twoFADesc")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 bg-card border-gold/40 hover:bg-primary/10 hover:border-primary"
            onClick={() => toast.info(t("twoFASoon"))}
          >
            {t("setUp")}
          </Button>
        </div>
      </div>
    </div>
  );
};