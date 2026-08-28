import { useState } from "react";
import { User, Shield, Info, Trash2, LogOut, Share2, Languages } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { nativeShare } from "@/lib/share";
import { guestStorage } from "@/lib/guestStorage";
import { PrivacySecurityPage } from "@/components/foras/PrivacySecurityPage";
import { AboutDialog } from "@/components/foras/AboutDialog";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export const SettingsSheet = ({ open, onOpenChange }: Props) => {
  const { signOut } = useAuth();
  const { lang, dir, toggleLang, t } = useLanguage();
  const nav = useNavigate();
  const [view, setView] = useState<"main" | "privacy">("main");
  const [aboutOpen, setAboutOpen] = useState(false);
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  // Reset view when sheet closes
  const handleOpenChange = (v: boolean) => {
    if (!v) setView("main");
    onOpenChange(v);
  };

  const handleClearCache = async () => {
    await guestStorage.clearAllCache();
    toast.success(lang === "ar" ? "تم مسح الملفات المؤقتة بنجاح" : "Cache cleared");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(lang === "ar" ? "تم تسجيل الخروج" : "Signed out");
    nav("/auth");
  };

  const handleShareApp = async () => {
    await nativeShare({
      title: "الفرص — Al-Foras",
      text: lang === "ar"
        ? "اكتشف المنح الدراسية والفرص العالمية والعربية في تطبيق واحد."
        : "Discover scholarships and global opportunities in one app.",
      url: window.location.origin,
    });
  };

  const openProfile = () => {
    onOpenChange(false);
    window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "profile" } }));
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        className="bg-card border-gold/30 w-[88%] sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <SheetTitle className={`text-gold-gradient font-display text-2xl ${alignClass}`}>
            {view === "main" ? t("settings") : t("privacySection")}
          </SheetTitle>
        </SheetHeader>

        {view === "privacy" ? (
          <PrivacySecurityPage onBack={() => setView("main")} />
        ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-2 mt-4">
          <Row icon={Languages} label={t("language")} align={alignClass}
            trailing={
              <button onClick={toggleLang}
                className="text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/20">
                {lang === "ar" ? "العربية ⇄ EN" : "EN ⇄ العربية"}
              </button>
            } />
          <Row icon={User} label={t("accountSettings")} align={alignClass} onClick={openProfile} />
          <Row icon={Shield} label={t("privacy")} align={alignClass} onClick={() => setView("privacy")} />
          <Row icon={Info} label={t("about")} align={alignClass}
            onClick={() => setAboutOpen(true)} />
          <Row icon={Trash2} label={t("clearCache")} align={alignClass} onClick={handleClearCache} />

          <div className="pt-4 space-y-2">
            <Button variant="outline" size="lg"
              onClick={handleShareApp}
              className="w-full bg-card border-gold/40 hover:bg-primary/10 hover:border-primary">
              <Share2 className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
              {t("shareApp")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="danger" size="lg" className="w-full">
                  <LogOut className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                  {t("logout")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-gold/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className={`${alignClass} text-gold-gradient font-display text-xl`}>
                    {t("confirmLogout")}
                  </AlertDialogTitle>
                  <AlertDialogDescription className={`${alignClass} text-muted-foreground`}>
                    {t("confirmLogoutDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={`gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <AlertDialogAction onClick={handleLogout}
                    className="flex-1 rounded-full bg-transparent border border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                    {t("yesLogout")}
                  </AlertDialogAction>
                  <AlertDialogCancel className="flex-1 mt-0 rounded-full bg-transparent border border-primary/50 text-primary hover:bg-primary/10 hover:text-primary transition-colors">
                    {t("cancel")}
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        )}
        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      </SheetContent>
    </Sheet>
  );
};

const Row = ({
  icon: Icon, label, trailing, onClick, align,
}: {
  icon: React.ElementType; label: string;
  trailing?: React.ReactNode; onClick?: () => void; align: string;
}) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-xl bg-background/40 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all ${align}`}>
    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <span className="flex-1 text-foreground font-medium">{label}</span>
    {trailing}
  </button>
);
