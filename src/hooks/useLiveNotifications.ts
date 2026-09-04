import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLiveRates } from "./useLiveRates";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsStore } from "@/lib/applicationsStorage";
import { notificationsStore } from "@/lib/notificationsStorage";

/**
 * Genuine in-app notifications handler:
 *  - alerts on real significant live currency market shifts
 *  - notifies immediately when a new scholarship or job is published/updated
 *  - checks user's actual saved applications and alerts if a deadline is closing within 3 days
 * Strictly respects active language (Arabic / English).
 */
export const useLiveNotifications = () => {
  const { alert } = useLiveRates();
  const { lang } = useLanguage();
  const seenAlert = useRef<string | null>(null);
  const checkedDeadlines = useRef(false);

  // Real currency moves
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

  // Real Event: When an opportunity is saved, published, or updated
  useEffect(() => {
    const onDataUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type?: string; item?: any };
      if (!detail?.item) return;

      const isScholarship = detail.type === "scholarship";
      const title = lang === "ar"
        ? (detail.item.title_ar || detail.item.title || "فرصة جديدة")
        : (detail.item.title_en || detail.item.titleEn || detail.item.title || "New Opportunity");
      const sub = detail.item.country || detail.item.company || "";

      // Surface a real toast with navigation action
      if (lang === "en") {
        toast(isScholarship ? "New Scholarship Published" : "New Job Published", {
          description: `${title} ${sub ? `— ${sub}` : ""}`,
          action: {
            label: "View",
            onClick: () => {
              window.dispatchEvent(
                new CustomEvent("foras:navigate", {
                  detail: { tab: isScholarship ? "scholarships" : "jobs" },
                })
              );
            },
          },
        });
      } else {
        toast(isScholarship ? "تم نشر منحة دراسية جديدة" : "تم نشر وظيفة جديدة", {
          description: `${title} ${sub ? `— ${sub}` : ""}`,
          action: {
            label: "عرض",
            onClick: () => {
              window.dispatchEvent(
                new CustomEvent("foras:navigate", {
                  detail: { tab: isScholarship ? "scholarships" : "jobs" },
                })
              );
            },
          },
        });
      }

      // Add to persistent real notifications feed
      notificationsStore.pushRealNotification({
        id: `pub-${detail.item.id}-${Date.now()}`,
        kind: isScholarship ? "match" : "news",
        title:
          lang === "ar"
            ? isScholarship
              ? "منحة دراسية جديدة معتمدة"
              : "فرصة عمل جديدة بالدولار"
            : isScholarship
            ? "New Verified Scholarship"
            : "New USD Job Opportunity",
        titleEn: isScholarship ? "New Verified Scholarship" : "New USD Job Opportunity",
        body: `${title} ${sub ? `— ${sub}` : ""}`.trim(),
        bodyEn: `${title} ${sub ? `— ${sub}` : ""}`.trim(),
        ts: Date.now(),
        actionTab: isScholarship ? "scholarships" : "jobs",
      });
    };

    window.addEventListener("foras:data-updated", onDataUpdated as EventListener);
    return () => window.removeEventListener("foras:data-updated", onDataUpdated as EventListener);
  }, [lang]);

  // Real Application Deadline Reminder: Checks user's actual saved applications
  useEffect(() => {
    if (checkedDeadlines.current) return;
    checkedDeadlines.current = true;

    const apps = applicationsStore.all();
    const urgentApp = apps.find((a) => {
      if (!a.deadline) return false;
      const d = new Date(a.deadline).getTime();
      if (Number.isNaN(d)) return false;
      const days = Math.ceil((d - Date.now()) / 86_400_000);
      return days > 0 && days <= 3;
    });

    if (urgentApp) {
      const d = new Date(urgentApp.deadline!).getTime();
      const days = Math.ceil((d - Date.now()) / 86_400_000);
      if (lang === "en") {
        toast.warning("Urgent: Application Deadline Approaching", {
          description: `${urgentApp.title} closes in ${days} ${days === 1 ? "day" : "days"}!`,
          action: {
            label: "My Applications",
            onClick: () => {
              window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "applications" } }));
            },
          },
        });
      } else {
        toast.warning("تنبيه عاجل: اقتراب موعد انتهاء التقديم", {
          description: `${urgentApp.title} — متبقٍ ${days} ${days === 1 ? "يوم" : "أيام"} فقط على الإغلاق!`,
          action: {
            label: "طلباتي",
            onClick: () => {
              window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "applications" } }));
            },
          },
        });
      }
    }
  }, [lang]);
};