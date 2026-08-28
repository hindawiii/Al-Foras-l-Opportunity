import { Mail, Sparkles, Brain, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const CONTACT_EMAIL = "alforas.one@gmail.com";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export const AboutDialog = ({ open, onOpenChange }: Props) => {
  const { t, dir } = useLanguage();
  const align = dir === "rtl" ? "text-right" : "text-left";

  const items = [
    { icon: Sparkles, label: t("aboutVisionLabel"), body: t("aboutVisionBody") },
    { icon: Brain, label: t("aboutTechLabel"), body: t("aboutTechBody") },
    { icon: ShieldCheck, label: t("aboutTrustLabel"), body: t("aboutTrustBody") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-gold/30 max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle className={`text-gold-gradient font-display text-2xl ${align}`}>
            {t("aboutTitle")}
          </DialogTitle>
        </DialogHeader>

        <ul className="space-y-3 mt-2">
          {items.map(({ icon: Icon, label, body }) => (
            <li key={label} className={`flex gap-3 p-3 rounded-xl glass border-primary/20 ${align}`}>
              <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-foreground text-sm">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</div>
              </div>
            </li>
          ))}
        </ul>

        <Button
          variant="luxe"
          size="lg"
          asChild
          className="w-full mt-2"
        >
          <a href={`mailto:${CONTACT_EMAIL}`}>
            <Mail className="w-4 h-4" />
            {t("contactUs")} · {CONTACT_EMAIL}
          </a>
        </Button>

        <p className={`text-[11px] text-muted-foreground ${align}`}>{t("aboutVersion")}</p>
      </DialogContent>
    </Dialog>
  );
};
