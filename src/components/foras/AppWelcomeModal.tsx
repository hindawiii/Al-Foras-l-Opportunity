import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { FeaturesVisualInfographic } from "./FeaturesVisualInfographic";

interface WelcomeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const AppWelcomeModal = ({ forceOpen, onClose }: WelcomeModalProps) => {
  const { lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
      return;
    }

    // Auto show on first visit to app or if explicitly requested
    const hasSeen = localStorage.getItem("alforas_seen_welcome_v4");
    if (!hasSeen) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    localStorage.setItem("alforas_seen_welcome_v4", "true");
    setIsOpen(false);
    onClose?.();
  };

  const handleNavigateTab = (tabId: string) => {
    handleDismiss();
    const event = new CustomEvent("foras:navigate-tab", { detail: { tab: tabId } });
    window.dispatchEvent(event);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          dir={dir}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          {/* Backdrop Click Dismiss */}
          <div className="fixed inset-0" onClick={handleDismiss} />

          {/* Modal Container - Expands wide for complete legibility */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-5xl bg-card/95 border-2 border-primary/40 rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_0_60px_-10px_hsl(43_74%_49%/0.35)] backdrop-blur-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />

            {/* Header / Top Bar */}
            <div className="relative flex items-center justify-between pb-4 border-b border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2
                    className="font-bold text-lg sm:text-2xl text-gold-gradient leading-tight"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {isRtl ? "مرحباً بك في منصة الفُرَص الذكية" : "Welcome to Al-Foras Platform"}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-200 mt-0.5">
                    {isRtl
                      ? "الدليل الأكاديمي والمهني الشامل للمنح والجامعات والعمل الحر بالدولار"
                      : "Your Comprehensive Hub for Verified Scholarships, Universities & Remote Jobs"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/15 border border-primary/30 hover:bg-primary/25 text-gray-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content: Full-Width Visual Infographic Hub */}
            <div className="py-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/30">
              <FeaturesVisualInfographic onNavigate={handleNavigateTab} />
            </div>

            {/* Footer Navigation */}
            <div className="relative pt-4 mt-2 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-medium text-gray-200 text-center sm:text-right">
                {isRtl
                  ? "✨ انقر على أي ركيزة أعلاه لاستعراض تفاصيلها والدخول المباشر للقسم"
                  : "✨ Click on any pillar above to inspect details and jump directly into the feature"}
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  variant="luxe"
                  size="default"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-xl shadow-gold text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isRtl ? "بدء استكشاف المنصة" : "Start Exploring"}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
