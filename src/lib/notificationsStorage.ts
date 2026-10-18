import { guestStorage } from "./guestStorage";
import { applicationsStore } from "./applicationsStorage";
import { dynamicStore } from "./dynamicStore";
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { adminAuthStore, AdminUser } from "./adminAuthStore";

export type NotifKind = "deadline" | "match" | "status" | "news" | "broadcast";

export interface AppNotification {
  id: string;
  kind: NotifKind;
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  ts: number;
  actionTab?: "scholarships" | "jobs" | "news" | "applications" | "profile" | "arab_unis" | "global_unis";
  url?: string;
  source?: "cloud" | "local" | "system";
  isBroadcast?: boolean;
}

const READ_KEY = "notifRead";
const DISMISSED_KEY = "notifDismissed";
const PERSISTENT_EVENTS_KEY = "forasPersistentNotifs";
const CLOUD_NOTIFS_KEY = "foras_cloud_notifications_v1";

let realtimeNotifsUnsub: Unsubscribe | null = null;
let isRealtimeListenerAttached = false;
const knownNotifIds = new Set<string>();

const daysLeft = (deadline?: string): number | null => {
  if (!deadline) return null;
  const d = new Date(deadline).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86_400_000);
};

export const getPersistentNotifs = (): AppNotification[] => {
  return guestStorage.get<AppNotification[]>(PERSISTENT_EVENTS_KEY, []) ?? [];
};

export const getCloudNotifs = (): AppNotification[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLOUD_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addPersistentNotif = (notif: AppNotification) => {
  const current = getPersistentNotifs();
  const filtered = current.filter((n) => n.id !== notif.id);
  guestStorage.set(PERSISTENT_EVENTS_KEY, [notif, ...filtered].slice(0, 30));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("foras:notifications-updated"));
  }
};

/** Builds the live notification feed from Cloud Firestore and local application state */
export const buildNotifications = (lang: "ar" | "en" = "ar"): AppNotification[] => {
  const out: AppNotification[] = [];
  const apps = applicationsStore.all();
  const ar = lang === "ar";
  const allScholarships = dynamicStore.getScholarships();
  const allJobs = dynamicStore.getJobs();

  // 0) Cloud Broadcast & Admin Notifications from Firestore
  const cloudNotifs = getCloudNotifs();
  out.push(...cloudNotifs);

  // 1) Persistent manual notifications
  const persistent = getPersistentNotifs();
  out.push(...persistent);

  // 2) Real deadline reminders for saved / applied items
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
        source: "local",
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
        source: "local",
      });
    }
  });

  // 3) Status follow-ups on applied items
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
        source: "local",
      });
    });

  // 4) Top matching scholarships
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
        source: "system",
      });
    });

  // 5) Real remote jobs from dynamic store
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
        source: "system",
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
    .slice(0, 35);
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

  /**
   * Broadcast a real-time notification to all users worldwide via Cloud Firestore
   */
  async broadcastNotification(
    notif: Omit<AppNotification, "ts"> & { ts?: number },
    user?: AdminUser | null
  ): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const activeUser = user || adminAuthStore.getCurrentSession() || {
        id: "admin",
        name: "إدارة المنصة",
        role: "super_admin" as const,
      };

      const payload: AppNotification = {
        ...notif,
        id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ts: notif.ts || Date.now(),
        source: "cloud",
        isBroadcast: true,
      };

      // 1. Save to local cache
      const local = getCloudNotifs();
      const updated = [payload, ...local.filter((n) => n.id !== payload.id)].slice(0, 50);
      localStorage.setItem(CLOUD_NOTIFS_KEY, JSON.stringify(updated));

      // 2. Dispatch local UI update
      window.dispatchEvent(new CustomEvent("foras:notifications-updated"));

      // 3. Persist to Cloud Firestore for instant real-time sync across all users
      await setDoc(doc(db, "notifications", payload.id), payload, { merge: true });

      // 4. Log in Audit Trail
      adminAuthStore.logActivity(
        activeUser as any,
        "broadcast_notification" as any,
        `بث إشعار عام للمستخدمين`,
        `العنوان: ${payload.title} — تم البث بواسطة ${activeUser.name}`
      );

      return true;
    } catch (err) {
      console.warn("Failed to broadcast notification to Cloud Firestore:", err);
      return false;
    }
  },

  /**
   * Automatically broadcast opportunity notification on publish
   */
  async broadcastOpportunityNotification(
    type: "scholarship" | "job" | "university",
    item: any
  ): Promise<void> {
    if (!item || !item.id) return;

    try {
      let notif: AppNotification;

      if (type === "scholarship") {
        notif = {
          id: `notif_sch_${item.id}`,
          kind: "match",
          title: "منحة دراسية جديدة معتمدة ✨",
          titleEn: "New Accredited Scholarship ✨",
          body: `${item.title || item.title_ar || "منحة دراسية"} — ${item.country || "دولي"} (${item.coverage === "full" ? "ممولة بالكامل" : "تمويل جزئي"})`,
          bodyEn: `${item.titleEn || item.title || "Scholarship"} — ${item.countryEn || item.country || "International"}`,
          ts: Date.now(),
          actionTab: "scholarships",
          url: item.url || item.apply_url,
          source: "cloud",
          isBroadcast: true,
        };
      } else if (type === "job") {
        notif = {
          id: `notif_job_${item.id}`,
          kind: "news",
          title: "فرصة عمل جديدة عن بُعد 💼",
          titleEn: "New Remote Job Opportunity 💼",
          body: `${item.title_ar || item.title || "وظيفة جديدة"} — ${item.company || "شركة معتمدة"} ${item.salary ? `(${item.salary})` : ""}`,
          bodyEn: `${item.title_en || item.title || "Remote Job"} — ${item.company || "Global Company"}`,
          ts: Date.now(),
          actionTab: "jobs",
          url: item.apply_url || item.url,
          source: "cloud",
          isBroadcast: true,
        };
      } else {
        notif = {
          id: `notif_uni_${item.id}`,
          kind: "news",
          title: "صرح جامعي معتمد جديد 🏛️",
          titleEn: "New Accredited University 🏛️",
          body: `${item.name} — ${item.country} (أدنى نسبة قبول: ${item.minPercentage}%)`,
          bodyEn: `${item.nameEn || item.name} — ${item.countryEn || item.country}`,
          ts: Date.now(),
          actionTab: "arab_unis",
          url: item.website,
          source: "cloud",
          isBroadcast: true,
        };
      }

      await this.broadcastNotification(notif);
    } catch (e) {
      console.warn("broadcastOpportunityNotification notice:", e);
    }
  },

  /**
   * Delete a broadcast notification from Cloud Firestore
   */
  async deleteNotification(id: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      const local = getCloudNotifs();
      localStorage.setItem(CLOUD_NOTIFS_KEY, JSON.stringify(local.filter((n) => n.id !== id)));
      window.dispatchEvent(new CustomEvent("foras:notifications-updated"));

      await deleteDoc(doc(db, "notifications", id));
      return true;
    } catch (err) {
      console.warn("Failed to delete notification from Firestore:", err);
      return false;
    }
  },

  /**
   * Listen to real-time broadcast notifications from Cloud Firestore
   */
  syncWithCloud(): void {
    if (typeof window === "undefined") return;
    if (isRealtimeListenerAttached && realtimeNotifsUnsub) return;

    try {
      isRealtimeListenerAttached = true;

      // Populate known IDs from local cache
      const initial = getCloudNotifs();
      initial.forEach((n) => knownNotifIds.add(n.id));

      realtimeNotifsUnsub = onSnapshot(
        collection(db, "notifications"),
        (snapshot) => {
          const cloudList: AppNotification[] = [];
          let hasNewLiveDoc = false;

          snapshot.forEach((d) => {
            const data = d.data() as AppNotification;
            const notifId = d.id || data.id;
            if (notifId && data.title) {
              const fullNotif: AppNotification = {
                id: notifId,
                kind: data.kind || "broadcast",
                title: data.title,
                titleEn: data.titleEn,
                body: data.body || "",
                bodyEn: data.bodyEn,
                ts: Number(data.ts) || Date.now(),
                actionTab: data.actionTab,
                url: data.url,
                source: "cloud",
                isBroadcast: true,
              };
              cloudList.push(fullNotif);

              // Check if genuinely new document
              if (!knownNotifIds.has(notifId)) {
                knownNotifIds.add(notifId);
                hasNewLiveDoc = true;
              }
            }
          });

          // Sort descending by timestamp
          cloudList.sort((a, b) => b.ts - a.ts);
          localStorage.setItem(CLOUD_NOTIFS_KEY, JSON.stringify(cloudList.slice(0, 50)));

          // Dispatch update event
          window.dispatchEvent(new CustomEvent("foras:notifications-updated"));

          // If a new live doc arrived while user is active, trigger dynamic alert event
          if (hasNewLiveDoc && cloudList.length > 0) {
            const newest = cloudList[0];
            window.dispatchEvent(
              new CustomEvent("foras:new-cloud-notification", { detail: { notif: newest } })
            );
          }
        },
        (err) => {
          console.info("Firestore notifications listener note:", err);
        }
      );
    } catch (subErr) {
      console.info("Firestore notifications subscription catch:", subErr);
    }
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

// Automatic subscription on client boot
if (typeof window !== "undefined") {
  setTimeout(() => {
    notificationsStore.syncWithCloud();
  }, 500);
}
