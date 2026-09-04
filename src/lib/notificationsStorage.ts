import { guestStorage } from "./guestStorage";
import { applicationsStore } from "./applicationsStorage";
import { dynamicStore } from "./dynamicStore";

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
const DISMISSED_KEY = "notifDismissed";
const PERSISTENT_EVENTS_KEY = "forasPersistentNotifs";

const daysLeft = (deadline?: string): number | null => {
  if (!deadline) return null;
  const d = new Date(deadline).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86_400_000);
};

export const getPersistentNotifs = (): AppNotification[] => {
  return guestStorage.get<AppNotification[]>(PERSISTENT_EVENTS_KEY, []) ?? [];
};

export const addPersistentNotif = (notif: AppNotification) => {
  const current = getPersistentNotifs();
  const filtered = current.filter((n) => n.id !== notif.id);
  guestStorage.set(PERSISTENT_EVENTS_KEY, [notif, ...filtered].slice(0, 30));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("foras:notifications-updated"));
  }
};

/** Builds the live notification feed from real application data with full automatic translation support */
export const buildNotifications = (lang: "ar" | "en" = "ar"): AppNotification[] => {
  const out: AppNotification[] = [];
  const apps = applicationsStore.all();
  const ar = lang === "ar";
  const allScholarships = dynamicStore.getScholarships();
  const allJobs = dynamicStore.getJobs();

  // 0) Add persistent real notifications (e.g. published scholarships/jobs from admin)
  const persistent = getPersistentNotifs();
  out.push(...persistent);

  // 1) Real deadline reminders for saved / applied items
  apps.forEach((a) => {
    const dl = daysLeft(a.deadline);
    if (dl === null) return;

    const orig = allScholarships.find((s) => s.id === a.id);
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

  // 2) Status follow-ups on applied items
  apps
    .filter((a) => a.status === "applied")
    .slice(0, 3)
    .forEach((a) => {
      const orig = allScholarships.find((s) => s.id === a.id);
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

  // 3) Real top scholarships from dynamic store not yet saved
  const savedIds = new Set(apps.map((a) => a.id));
  allScholarships
    .filter((s) => !savedIds.has(s.id))
    .slice(0, 3)
    .forEach((s, i) => {
      const sTitle = ar ? s.title : (s.titleEn || s.title);
      const sCountry = ar ? s.country : (s.countryEn || s.country || "");
      const sOrg = ar ? s.org : (s.orgEn || s.org || "");

      out.push({
        id: `mt-${s.id}`,
        kind: "match",
        title: ar ? "منحة مميزة متاحة للتقديم" : "Featured Opportunity Open for Application",
        titleEn: "Featured Opportunity Open for Application",
        body: `${sTitle} — ${sCountry} ${sOrg ? `• ${sOrg}` : ""}`.trim(),
        bodyEn: `${s.titleEn || s.title} — ${s.countryEn || s.country || ""}`,
        ts: Date.now() - (i + 1) * 3_600_000,
        actionTab: "scholarships",
      });
    });

  // 4) Real remote jobs from dynamic store
  allJobs
    .slice(0, 2)
    .forEach((j, i) => {
      const jTitle = ar ? (j.title_ar || j.title) : (j.title_en || j.title);
      const jComp = j.company || (ar ? "شركة دولية" : "Global Company");
      const jSalary = j.salary ? `• ${j.salary}` : "";

      out.push({
        id: `job-${j.id}`,
        kind: "news",
        title: ar ? "فرصة عمل عن بُعد بالدولار" : "Remote USD Job Opportunity",
        titleEn: "Remote USD Job Opportunity",
        body: `${jTitle} — ${jComp} ${jSalary}`.trim(),
        bodyEn: `${j.title_en || j.title} — ${jComp} ${jSalary}`.trim(),
        ts: Date.now() - (i + 2) * 7_200_000,
        actionTab: "jobs",
      });
    });

  // Deduplicate by ID and sort newest first
  const seen = new Set<string>();
  return out
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 25);
};

const readIds = (): string[] => guestStorage.get<string[]>(READ_KEY, []) ?? [];
const dismissedIds = (): string[] => guestStorage.get<string[]>(DISMISSED_KEY, []) ?? [];

export const notificationsStore = {
  list(lang: "ar" | "en" = "ar"): (AppNotification & { read: boolean })[] {
    const read = new Set(readIds());
    const dismissed = new Set(dismissedIds());
    return buildNotifications(lang)
      .filter((n) => !dismissed.has(n.id))
      .map((n) => ({ ...n, read: read.has(n.id) }));
  },
  unreadCount(lang: "ar" | "en" = "ar"): number {
    return notificationsStore.list(lang).filter((n) => !n.read).length;
  },
  markRead(id: string) {
    const cur = readIds();
    if (!cur.includes(id)) {
      guestStorage.set(READ_KEY, [...cur, id]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("foras:notifications-updated"));
      }
    }
  },
  markAllRead(lang: "ar" | "en" = "ar") {
    const cur = readIds();
    const allIds = buildNotifications(lang).map((n) => n.id);
    const merged = Array.from(new Set([...cur, ...allIds]));
    guestStorage.set(READ_KEY, merged);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:notifications-updated"));
    }
  },
  dismiss(id: string) {
    const cur = dismissedIds();
    if (!cur.includes(id)) {
      guestStorage.set(DISMISSED_KEY, [...cur, id]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("foras:notifications-updated"));
      }
    }
  },
  clearAll(lang: "ar" | "en" = "ar") {
    const allIds = buildNotifications(lang).map((n) => n.id);
    guestStorage.set(DISMISSED_KEY, allIds);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:notifications-updated"));
    }
  },
  pushRealNotification(notif: AppNotification) {
    addPersistentNotif(notif);
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
