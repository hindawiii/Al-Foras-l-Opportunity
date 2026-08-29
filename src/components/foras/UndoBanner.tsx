import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Check, Trash2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { dynamicStore } from "@/lib/dynamicStore";
import { toast } from "sonner";

interface UndoState {
  itemIds: string[];
  count: number;
  itemType: "scholarship" | "job" | "multiple";
  title?: string;
}

export const UndoBanner: React.FC = () => {
  const { lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [activeUndo, setActiveUndo] = useState<UndoState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);

  useEffect(() => {
    const handleUndoTrigger = (e: Event) => {
      const detail = (e as CustomEvent).detail as UndoState;
      if (detail && detail.itemIds && detail.itemIds.length > 0) {
        setActiveUndo(detail);
        setTimeLeft(10);
      }
    };

    window.addEventListener("foras:show-undo", handleUndoTrigger as EventListener);
    return () => window.removeEventListener("foras:show-undo", handleUndoTrigger as EventListener);
  }, []);

  useEffect(() => {
    if (!activeUndo) return;

    if (timeLeft <= 0) {
      setActiveUndo(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeUndo, timeLeft]);

  const handleRestore = () => {
    if (!activeUndo) return;
    if (activeUndo.itemIds.length === 1) {
      dynamicStore.restoreArchivedItem(activeUndo.itemIds[0]);
    } else {
      dynamicStore.restoreMultiple(activeUndo.itemIds);
    }
    toast.success(
      isRtl
        ? `تمت استعادة ${activeUndo.count} ${activeUndo.count === 1 ? "عنصر بنجاح" : "عناصر بنجاح"}`
        : `Restored ${activeUndo.count} item(s) successfully`
    );
    setActiveUndo(null);
  };

  const handleDismiss = () => {
    setActiveUndo(null);
  };

  return (
    <AnimatePresence>
      {activeUndo && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`fixed bottom-20 z-50 flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-card/95 border-2 border-primary/40 shadow-2xl backdrop-blur-xl ${
            isRtl ? "left-4 sm:left-8" : "right-4 sm:right-8"
          } max-w-md w-[calc(100%-2rem)] sm:w-auto`}
          style={{ direction: dir }}
        >
          <div className="flex items-center gap-3">
            {/* Circular Countdown Tag */}
            <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-xs font-bold text-primary">
              <span>{timeLeft}</span>
            </div>

            <div className="text-right">
              <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                {isRtl
                  ? `تمت أرشفة ${activeUndo.count} ${
                      activeUndo.count === 1
                        ? activeUndo.itemType === "scholarship"
                          ? "منحة"
                          : "وظيفة"
                        : "عناصر"
                    }`
                  : `Archived ${activeUndo.count} item(s)`}
              </p>
              <span className="text-[11px] font-medium text-gray-300">
                {isRtl ? "يمكنك التراجع قبل الإغلاق" : "Recoverable for 10 seconds"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-gradient text-primary-foreground text-xs sm:text-sm font-bold shadow-gold hover:scale-105 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRtl ? "تراجع الآن" : "Undo"}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-primary/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
