import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw, X, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useLanguage } from "@/contexts/LanguageContext";

export const OfflineStatusBanner = () => {
  const {
    isOnline,
    wasOffline,
    isSyncing,
    recheck,
    clearWasOffline,
    isGlobalOfflineEnabled,
    isUserOfflineEnabled,
    isOfflineModeEffective,
  } = useNetworkStatus();
  const { lang, dir } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);
  const isRtl = dir === "rtl";

  // Re-open if network state drops again
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // When reconnected, show success for 4 seconds then auto-dismiss
  useEffect(() => {
    if (isOnline && wasOffline) {
      const timer = setTimeout(() => {
        clearWasOffline();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, clearWasOffline]);

  const handleManualRetry = async () => {
    setChecking(true);
    try {
      await recheck();
    } finally {
      setChecking(false);
    }
  };

  // Only render if offline OR just reconnected (wasOffline)
  const shouldShow = (!isOnline || wasOffline) && !dismissed;

  // Determine current offline reason
  const isSuspendedByAdmin = !isOnline && !isGlobalOfflineEnabled;
  const isPausedByUser = !isOnline && isGlobalOfflineEnabled && !isUserOfflineEnabled;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.aside
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          aria-live="polite"
          className="fixed top-3 inset-x-3 sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2 z-50 max-w-xl w-auto pointer-events-auto"
        >
          <div
            className={`flex items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 ${
              isOnline
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40"
                : isSuspendedByAdmin
                ? "bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-black/70"
                : isPausedByUser
                ? "bg-slate-900/95 border-slate-700 text-slate-200 shadow-black/60"
                : "bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-black/60"
            }`}
          >
            {/* Status Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isOnline
                  ? "bg-emerald-500/20 text-emerald-300"
                  : isSuspendedByAdmin
                  ? "bg-rose-500/20 text-rose-400"
                  : isPausedByUser
                  ? "bg-slate-700/40 text-slate-400"
                  : "bg-amber-500/20 text-amber-400 animate-pulse"
              }`}
            >
              {isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : isSuspendedByAdmin ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>

            {/* Explanatory Message */}
            <div className="flex-1 min-w-0 text-start">
              <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                {isOnline ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{isRtl ? "تمت استعادة الاتصال بالإنترنت" : "Internet Connection Restored"}</span>
                  </>
                ) : isSuspendedByAdmin ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>{isRtl ? "وضع عدم الاتصال معطل من قِبل إدارة المنصة" : "Offline Mode Suspended by Admin"}</span>
                  </>
                ) : isPausedByUser ? (
                  <span>{isRtl ? "وضع عدم الاتصال موقوف في إعداداتك" : "Offline Mode Paused in Settings"}</span>
                ) : (
                  <span>{isRtl ? "تصفح في وضع عدم الاتصال (Offline Ready)" : "Browsing in Offline Mode"}</span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs leading-relaxed opacity-90 line-clamp-2 mt-0.5 font-normal">
                {isOnline
                  ? isRtl
                    ? "تمت المزامنة وتحديث أحدث المنح وفرص العمل تلقائياً ✨"
                    : "Latest scholarships and jobs synced automatically ✨"
                  : isSuspendedByAdmin
                  ? isRtl
                    ? "تم إيقاف التصفح دون إنترنت مؤقتاً بأمر المشرف. يُرجى الاتصال بالإنترنت للمتابعة."
                    : "Offline browsing is paused by administration. Please connect to internet."
                  : isPausedByUser
                  ? isRtl
                    ? "يمكنك تفعيل وضع العمل دون اتصال في أي وقت من شاشة الإعدادات لتصفح الفرص المخزنة."
                    : "You can re-enable offline mode anytime in settings to browse cached data."
                  : isRtl
                  ? "جميع المنح والفرص المخزنة متاحة بالكامل. ستُحدّث البيانات تلقائياً فور عودة الشبكة."
                  : "All cached opportunities are fully accessible. New data will sync once connected."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isOnline && (
                <button
                  type="button"
                  onClick={handleManualRetry}
                  disabled={checking || isSyncing}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  title={isRtl ? "إعادة فحص الاتصال" : "Retry connection"}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${checking || isSyncing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {isRtl ? "تحقق" : "Retry"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="w-11 h-11 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors focus:outline-none"
                aria-label={isRtl ? "إغلاق التنبيه" : "Dismiss notice"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
