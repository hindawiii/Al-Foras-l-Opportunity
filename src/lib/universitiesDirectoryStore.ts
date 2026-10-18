/**
 * Unified Universities Directory Store
 * Provides real-time synchronization between Cloud Firestore (/universities)
 * and the client state, ensuring 100% live consistency across all users worldwide.
 */

import {
  ARAB_UNIVERSITIES,
  ARAB_COUNTRIES_META,
  type ArabUniversity,
  type ArabCountryStat,
  type ArabUniType,
} from "./arabUniversities";
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe, writeBatch } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { adminAuthStore, AdminUser } from "./adminAuthStore";
import { notificationsStore } from "./notificationsStorage";
import { sanitizeUniversity } from "./sanitizer";

export interface ManagedArabUniversity extends ArabUniversity {
  custom?: boolean;
  updatedAt?: string;
  updatedBy?: {
    id: string;
    name: string;
    role: string;
  };
  isArchived?: boolean;
}

const UNIVERSITIES_STORAGE_KEY = "foras_custom_universities_v1";
const DELETED_UNIS_KEY = "foras_deleted_universities_v1";

let realtimeUnisUnsub: Unsubscribe | null = null;
let isRealtimeListenerActive = false;

// Helper to convert flag to country code fallback
function flagToCountryCode(flag: string): string {
  if (flag.includes("🇸🇦")) return "SA";
  if (flag.includes("🇶🇦")) return "QA";
  if (flag.includes("🇦🇪")) return "AE";
  if (flag.includes("🇪🇬")) return "EG";
  if (flag.includes("🇸🇩")) return "SD";
  if (flag.includes("🇯🇴")) return "JO";
  if (flag.includes("🇴🇲")) return "OM";
  if (flag.includes("🇧🇭")) return "BH";
  if (flag.includes("🇰🇼")) return "KW";
  return "AR";
}

export const universitiesDirectoryStore = {
  /**
   * Get all Arab Universities:
   * Merges built-in catalog with Cloud Firestore overrides/additions,
   * while filtering out any archived/deleted records.
   */
  getArabUniversities(): ArabUniversity[] {
    if (typeof window === "undefined") return ARAB_UNIVERSITIES;

    try {
      const customRaw = localStorage.getItem(UNIVERSITIES_STORAGE_KEY);
      const deletedRaw = localStorage.getItem(DELETED_UNIS_KEY);

      const customList: ManagedArabUniversity[] = customRaw ? JSON.parse(customRaw) : [];
      const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      const deletedSet = new Set(deletedList);

      // Map custom/overridden items by ID
      const customMap = new Map<string, ManagedArabUniversity>();
      customList.forEach((u) => {
        if (u && u.id && !u.isArchived && !deletedSet.has(u.id)) {
          customMap.set(u.id, u);
        }
      });

      // Filter base catalog and merge overrides
      const baseMerged: ArabUniversity[] = [];
      ARAB_UNIVERSITIES.forEach((baseUni) => {
        if (deletedSet.has(baseUni.id)) return;

        const override = customMap.get(baseUni.id);
        if (override) {
          baseMerged.push(override);
          customMap.delete(baseUni.id); // Handled
        } else {
          baseMerged.push(baseUni);
        }
      });

      // Append any newly created custom universities from cloud/admin
      const brandNewCustom = Array.from(customMap.values());
      const allMerged = [...brandNewCustom, ...baseMerged];

      return allMerged;
    } catch (err) {
      console.warn("universitiesDirectoryStore.getArabUniversities error, using base catalog:", err);
      return ARAB_UNIVERSITIES;
    }
  },

  /**
   * Dynamically calculate country statistics based on the active universities list
   */
  getCountryStats(unis?: ArabUniversity[]): ArabCountryStat[] {
    const list = unis || this.getArabUniversities();
    const countriesMap = new Map<string, {
      country: string;
      countryEn: string;
      flag: string;
      unis: ArabUniversity[];
    }>();

    list.forEach((u) => {
      const existing = countriesMap.get(u.country);
      if (existing) {
        existing.unis.push(u);
      } else {
        countriesMap.set(u.country, {
          country: u.country,
          countryEn: u.countryEn || u.country,
          flag: u.flag || "🏛️",
          unis: [u],
        });
      }
    });

    const stats: ArabCountryStat[] = Array.from(countriesMap.values()).map(({ country, countryEn, flag, unis }) => {
      const meta = ARAB_COUNTRIES_META[country];
      return {
        country,
        countryEn,
        flag,
        code: meta ? meta.code : flagToCountryCode(flag),
        count: unis.length,
        minPercentage: unis.length > 0 ? Math.min(...unis.map((u) => u.minPercentage)) : 70,
        scholarships: unis.some((u) => u.scholarships),
        scholarshipType: meta?.scholarshipType || "منح دراسية حكومية وجامعية معتمدة",
        scholarshipTypeEn: meta?.scholarshipTypeEn || "Accredited university & governmental scholarships",
        officialPortals: meta?.officialPortals || [],
        overview: meta?.overview || "",
        overviewEn: meta?.overviewEn || "",
      };
    });

    // Sort by count descending
    return stats.sort((a, b) => b.count - a.count);
  },

  /**
   * Save or update university (Local cache + Cloud Firestore)
   */
  async saveUniversity(
    uni: ArabUniversity,
    user?: AdminUser | null
  ): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const activeUser = user || adminAuthStore.getCurrentSession() || {
        id: "admin",
        name: "مدير النظام",
        role: "super_admin" as const,
      };

      const cleanUni = sanitizeUniversity(uni);
      const now = new Date().toISOString();
      const managed: ManagedArabUniversity = {
        ...cleanUni,
        custom: true,
        updatedAt: now,
        updatedBy: {
          id: activeUser.id,
          name: activeUser.name,
          role: activeUser.role,
        },
        isArchived: false,
      };

      // 1. Update local cache
      const customRaw = localStorage.getItem(UNIVERSITIES_STORAGE_KEY);
      const list: ManagedArabUniversity[] = customRaw ? JSON.parse(customRaw) : [];
      const idx = list.findIndex((u) => u.id === managed.id);
      if (idx >= 0) {
        list[idx] = managed;
      } else {
        list.unshift(managed);
      }
      localStorage.setItem(UNIVERSITIES_STORAGE_KEY, JSON.stringify(list));

      // Undelete if previously deleted
      this.undeleteUniversity(managed.id);

      // Dispatch local reactive event
      window.dispatchEvent(new CustomEvent("foras:universities-updated", { detail: { uni: managed } }));

      // 2. Persist to Cloud Firestore for instant worldwide synchronization
      try {
        await setDoc(doc(db, "universities", managed.id), managed, { merge: true });
      } catch (fsErr) {
        console.warn("Firestore universities write notice (cached locally):", fsErr);
      }

      // Log in Audit Trail
      adminAuthStore.logActivity(
        activeUser as any,
        "edit_university" as any,
        `تحديث بيانات صرح جامعي`,
        `تم حفظ بيانات: ${managed.name} (${managed.country}) بواسطة ${activeUser.name}`
      );

      // Broadcast real-time notification
      notificationsStore.broadcastOpportunityNotification("university", managed).catch(() => {});

      return true;
    } catch (err) {
      console.error("Failed to save university:", err);
      return false;
    }
  },

  /**
   * Delete / Archive a university
   */
  async deleteUniversity(
    id: string,
    user?: AdminUser | null
  ): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const activeUser = user || adminAuthStore.getCurrentSession() || {
        id: "admin",
        name: "مدير النظام",
        role: "super_admin" as const,
      };

      // 1. Mark as deleted in local storage
      const deletedRaw = localStorage.getItem(DELETED_UNIS_KEY);
      const deleted: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem(DELETED_UNIS_KEY, JSON.stringify(deleted));
      }

      // Remove from custom list if present
      const customRaw = localStorage.getItem(UNIVERSITIES_STORAGE_KEY);
      if (customRaw) {
        const list: ManagedArabUniversity[] = JSON.parse(customRaw);
        localStorage.setItem(
          UNIVERSITIES_STORAGE_KEY,
          JSON.stringify(list.filter((u) => u.id !== id))
        );
      }

      window.dispatchEvent(new CustomEvent("foras:universities-updated", { detail: { deletedId: id } }));

      // 2. Remove or mark archived in Cloud Firestore
      try {
        await deleteDoc(doc(db, "universities", id));
      } catch (fsErr) {
        console.warn("Firestore delete university notice:", fsErr);
      }

      adminAuthStore.logActivity(
        activeUser as any,
        "delete_university" as any,
        `حذف صرح جامعي`,
        `تمت إزالة الصرح (ID: ${id}) بواسطة ${activeUser.name}`
      );

      return true;
    } catch (err) {
      console.error("Failed to delete university:", err);
      return false;
    }
  },

  /**
   * Undelete helper
   */
  undeleteUniversity(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const deletedRaw = localStorage.getItem(DELETED_UNIS_KEY);
      if (deletedRaw) {
        const deleted: string[] = JSON.parse(deletedRaw);
        localStorage.setItem(
          DELETED_UNIS_KEY,
          JSON.stringify(deleted.filter((d) => d !== id))
        );
      }
    } catch {}
  },

  /**
   * Seed flagship universities to Cloud Firestore in a single batch
   * Useful to ensure the top universities can be managed and edited dynamically.
   */
  async seedFlagshipUniversities(limitCount = 20): Promise<{ count: number; error?: string }> {
    if (typeof window === "undefined") return { count: 0 };

    try {
      // Pick top universities with active scholarships or flagship enrichments
      const topFlagships = ARAB_UNIVERSITIES.slice(0, limitCount);
      let count = 0;

      for (const uni of topFlagships) {
        const docRef = doc(db, "universities", uni.id);
        const payload: ManagedArabUniversity = {
          ...uni,
          custom: false,
          updatedAt: new Date().toISOString(),
          isArchived: false,
        };
        await setDoc(docRef, payload, { merge: true });
        count++;
      }

      return { count };
    } catch (err: any) {
      console.warn("Seed flagship universities notice:", err);
      return { count: 0, error: err?.message || "Failed to seed universities" };
    }
  },

  /**
   * Start real-time Firestore synchronization listener
   */
  syncWithCloud(): void {
    if (typeof window === "undefined") return;
    if (isRealtimeListenerActive && realtimeUnisUnsub) return;

    try {
      isRealtimeListenerActive = true;
      realtimeUnisUnsub = onSnapshot(
        collection(db, "universities"),
        (snapshot) => {
          const customRaw = localStorage.getItem(UNIVERSITIES_STORAGE_KEY);
          const parsed = customRaw ? JSON.parse(customRaw) : [];
          const localList: ManagedArabUniversity[] = Array.isArray(parsed) ? parsed : [];
          const localMap = new Map<string, ManagedArabUniversity>(
            localList.filter((u) => u && u.id).map((u) => [u.id, u])
          );

          // Handle real-time removals
          snapshot.docChanges().forEach((change) => {
            if (change.type === "removed") {
              localMap.delete(change.doc.id);
            }
          });

          // Handle real-time additions & updates
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ManagedArabUniversity;
            if (data && data.id) {
              localMap.set(data.id, {
                ...data,
                id: docSnap.id || data.id,
              });
            }
          });

          const merged = Array.from(localMap.values());
          localStorage.setItem(UNIVERSITIES_STORAGE_KEY, JSON.stringify(merged));

          // Notify all subscribers (Tabs, Admins, Comparison Modals)
          window.dispatchEvent(
            new CustomEvent("foras:universities-updated", {
              detail: { count: merged.length, source: "firestore" },
            })
          );
        },
        (err) => {
          console.info("Firestore universities real-time listener notice:", err);
        }
      );
    } catch (subErr) {
      console.info("Firestore universities subscription catch:", subErr);
    }
  },
};

// Automatic subscription on client boot
if (typeof window !== "undefined") {
  setTimeout(() => {
    universitiesDirectoryStore.syncWithCloud();
  }, 400);
}
