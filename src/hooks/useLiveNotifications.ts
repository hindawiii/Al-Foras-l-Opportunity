import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLiveRates } from "./useLiveRates";
import { SCHOLARSHIPS } from "@/lib/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * In-app notifications simulator:
 *  - shows toast on significant currency moves
 *  - periodically surfaces a "new matching scholarship" toast
 *  - periodically surfaces an "urgent news" toast
 * Strictly respects active language (Arabic / English).
 */
export const useLiveNotifications = () => {
  const { alert } = useLiveRates();
  const { lang } = useLanguage();
  const seenAlert = useRef<string | null>(null);
  const tickRef = useRef(0);

  // Currency alerts
  useEffect(() => {
    if (!alert) return;
    const key = `${alert.code}:${alert.delta.toFixed(2)}`;
    if (seenAlert.current === key) return;
    seenAlert.current = key;
    const up = alert.delta >= 0;
    if (lang === "en") {
      toast(`Rate Alert: ${alert.code}`, {
        description: `Significant ${up ? "increase" : "drop"} of ${alert.delta.toFixed(2)}% — check Currency Hub.`,
      });
    } else {
      toast(`تنبيه أسعار: ${alert.code}`, {
        description: `${up ? "ارتفاع" : "انخفاض"} ملحوظ بنسبة ${alert.delta.toFixed(2)}% — راجع مركز العملات.`,
      });
    }
  }, [alert, lang]);

  // Periodic simulated notifications
  useEffect(() => {
    const id = window.setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      if (tick % 2 === 1) {
        const s = SCHOLARSHIPS[Math.floor(Math.random() * SCHOLARSHIPS.length)];
        if (lang === "en") {
          toast("New Scholarship Match", {
            description: `${s.title} — ${s.country}`,
          });
        } else {
          toast("منحة جديدة تطابق ملفك", {
            description: `${s.title} — ${s.country}`,
          });
        }
      } else {
        if (lang === "en") {
          toast("Breaking Opportunity News", {
            description: "Important update on global opportunities — open News tab to explore.",
          });
        } else {
          toast("خبر عاجل", {
            description: "تحديث مهم في الفرص العالمية — افتح تبويب الأخبار للاطلاع.",
          });
        }
      }
    }, 45_000);
    return () => window.clearInterval(id);
  }, [lang]);
};