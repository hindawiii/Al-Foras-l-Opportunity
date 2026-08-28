import { guestStorage } from "./guestStorage";
import { applicationsStore } from "./applicationsStorage";
import { SCHOLARSHIPS } from "./mockData";

export type NotifKind = "deadline" | "match" | "status" | "news";

export interface AppNotification {
  id: string;
  kind: NotifKind;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  ts: number;
  actionTab?: "scholarships" | "jobs" | "news" | "applications" | "profile";
  url?: string;
}

const READ_KEY = "notifRead";

const daysLeft = (deadline?: string): number | null => {
  if (!deadline) return null;
  const d = new Date(deadline).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86_400_000);
};

/** Builds the live notification feed from real local data with full automatic translation support */
export const buildNotifications = (lang: "ar" | "en" = "ar"): AppNotification[] => {
  const out: AppNotification[] = [];
  const apps = applicationsStore.all();
  const ar = lang === "ar";

  // 1) Deadline reminders for saved / applied items
  apps.forEach((a) => {
    const dl = daysLeft(a.deadline);
    if (dl === null) return;

    const orig = SCHOLARSHIPS.find((s) => s.id === a.id);
    const itemTitle = ar ? (a.title || orig?.title || "") : (orig?.titleEn || a.title || "");

    if (dl < 0) {
      out.push({
        id: `dl-past-${a.id}`,
        kind: "deadline",
        title: ar ? "انتهى الموعد النهائي للتقديم" : "Application Deadline Passed",
        titleEn: "Application Deadline Passed",
        body: ar
          ? `${itemTitle} — أُغلق باب التقديم. يمكنك مراجعة طلباتك أو البحث عن منح بديلة متاحة.`
          : `${itemTitle} — Deadline has passed. Review your application or explore alternative opportunities.`,
        bodyEn: `${itemTitle} — Deadline has passed.`,
        ts: new Date(a.deadline!).getTime(),
        actionTab: "applications",
        url: a.url,
      });
    } else if (dl <= 14) {
      const isUrgent = dl <= 3;
      out.push({
        id: `dl-${a.id}-${isUrgent ? "urgent" : "soon"}`,
        kind: "deadline",
        title: ar
          ? (isUrgent ? "⏰ موعد التقديم يغلق خلال أيام قليلة!" : "الموعد النهائي للتقديم يقترب")
          : (isUrgent ? "⏰ Application Deadline Closing Soon!" : "Application Deadline Approaching"),
        titleEn: isUrgent ? "⏰ Deadline Closing Soon!" : "Deadline Approaching",
        body: ar
          ? `${itemTitle} — متبقٍ ${dl} ${dl === 1 ? "يوم" : "أيام"} فقط${a.status === "saved" ? " ولم تقم بالتقديم بعد." : "."}`
          : `${itemTitle} — Only ${dl} ${dl === 1 ? "day" : "days"} remaining${a.status === "saved" ? " (saved, not yet applied)." : "."}`,
        bodyEn: `${itemTitle} — Only ${dl} days remaining.`,
        ts: Date.now() - dl * 1000,
        actionTab: "applications",
        url: a.url,
      });
    }
  });

  // 2) Status follow-ups
  apps
    .filter((a) => a.status === "applied")
    .slice(0, 3)
    .forEach((a) => {
      const orig = SCHOLARSHIPS.find((s) => s.id === a.id);
      const itemTitle = ar ? (a.title || orig?.title || "") : (orig?.titleEn || a.title || "");

      out.push({
        id: `st-${a.id}`,
        kind: "status",
        title: ar ? "متابعة طلب منحة مُقدَّم" : "Follow up on Applied Scholarship",
        titleEn: "Applied Opportunity Follow-up",
        body: ar
          ? `${itemTitle} — حدّث حالة الطلب فور استلام أي رد رسمي، واستعد للمقابلة الشخصية عبر مستشار الذكاء الاصطناعي.`
          : `${itemTitle} — Update your status if you received a response, and practice interview questions using the AI Advisor.`,
        bodyEn: `${itemTitle} — Update your status and practice interviews.`,
        ts: new Date(a.updatedAt).getTime(),
        actionTab: "applications",
      });
    });

  // 3) Recommended matching scholarships not saved yet
  const savedIds = new Set(apps.map((a) => a.id));
  SCHOLARSHIPS.filter((s) => !savedIds.has(s.id))
    .slice(0, 3)
    .forEach((s, i) => {
      const deterministicOffset = (i + 1) * 3_600_000;
      const sTitle = ar ? s.title : (s.titleEn || s.title);
      const sCountry = ar ? s.country : (s.countryEn || s.country || "");
      const sOrg = ar ? s.org : (s.orgEn || s.org || "");

      out.push({
        id: `mt-${s.id}`,
        kind: "match",
        title: ar ? "منحة مميزة تطابق ملفك الأكاديمي" : "Opportunity Matching Your Profile",
        titleEn: "Opportunity Matching Your Profile",
        body: `${sTitle} — ${sCountry} ${sOrg ? `• ${sOrg}` : ""}`.trim(),
        bodyEn: `${s.titleEn || s.title} — ${s.countryEn || s.country || ""}`,
        ts: Date.parse(s.deadline || "2026-01-01") || (1700000000000 + deterministicOffset),
        actionTab: "scholarships",
      });
    });

  return out.sort((a, b) => b.ts - a.ts).slice(0, 20);
};

const readIds = (): string[] => guestStorage.get<string[]>(READ_KEY, []) ?? [];

export const notificationsStore = {
  list(lang: "ar" | "en" = "ar"): (AppNotification & { read: boolean })[] {
    const read = new Set(readIds());
    return buildNotifications(lang).map((n) => ({ ...n, read: read.has(n.id) }));
  },
  unreadCount(lang: "ar" | "en" = "ar"): number {
    return notificationsStore.list(lang).filter((n) => !n.read).length;
  },
  markRead(id: string) {
    const cur = readIds();
    if (!cur.includes(id)) guestStorage.set(READ_KEY, [...cur, id]);
  },
  markAllRead(lang: "ar" | "en" = "ar") {
    guestStorage.set(READ_KEY, buildNotifications(lang).map((n) => n.id));
  },
};

export const relativeTime = (ts: number, lang: "ar" | "en" = "ar"): string => {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60_000);
  if (lang === "en") {
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.round(h / 24);
    return `${d}d ago`;
  }
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  return `قبل ${d} يوم`;
};
