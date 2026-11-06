import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Sparkles, X, Smartphone, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallBanner: React.FC = () => {
  const { lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone (installed) mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently (within 7 days)
    const dismissedTime = localStorage.getItem("alforas_pwa_dismissed");
    if (dismissedTime) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("alforas_pwa_dismissed", Date.now().toString());
  };

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:end-6 sm:max-w-md z-40"
        dir={dir}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card/95 border-2 border-primary/40 p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient p-[1px] shadow-gold flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[11px] bg-background flex items-center justify-center">
                <img src="/al-foras-icon.png" alt="Al-Foras" className="w-6 h-6 object-contain" />
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-foreground truncate flex items-center gap-1.5">
                <span>{ar ? "تثبيت تطبيق الفُرَص" : "Install Al-Foras App"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  PWA
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {ar ? "وصول أسرع وتصفح بدون إنترنت على هاتفك" : "Instant access & offline mode on your home screen"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{ar ? "تثبيت" : "Install"}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-xs transition-colors"
              aria-label={ar ? "إغلاق" : "Dismiss"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
