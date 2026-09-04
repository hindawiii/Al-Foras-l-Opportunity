// Dynamic Data Store for Admin & Custom Opportunities
// Handles local/cloud synchronization for Scholarships, Jobs, and Universities
// Supports AI-assisted URL auto-parsing, manual editing, soft-delete archiving, and persistent updates.

import { Scholarship, SCHOLARSHIPS } from "./mockData";
import { Job, JOBS } from "./jobsData";
import { adminAuthStore, AdminUser } from "./adminAuthStore";
import { supabase } from "@/integrations/supabase/client";

export interface CustomJobItem {
  id: string;
  title_ar: string;
  title_en?: string;
  company: string;
  location?: string;
  salary?: string;
  description_ar: string;
  description_en?: string;
  apply_url: string;
  deadline?: string;
  category: string;
  skills: string[];
  benefits_ar?: string[];
  verified?: boolean;
  eligibility?: any;
  successStories?: any[];
}

export interface ArchivedItem {
  id: string;
  type: "scholarship" | "job";
  itemData: any;
  deletedAt: string;
  deletedBy: {
    id: string;
    name: string;
    role: string;
  };
  reason?: string;
}

const SCHOLARSHIPS_STORAGE_KEY = "foras_custom_scholarships";
const JOBS_STORAGE_KEY = "foras_custom_jobs";
const DELETED_IDS_KEY = "foras_deleted_items";
const ARCHIVE_VAULT_KEY = "foras_archived_vault_v1";

export interface CustomDataState {
  scholarships: Scholarship[];
  jobs: CustomJobItem[];
  deletedIds: string[];
  archived: ArchivedItem[];
}

export const ARAB_COUNTRIES = [
  "قطر", "السعودية", "الإمارات", "مصر", "السودان", "الأردن", "الكويت",
  "عمان", "سلطنة عمان", "البحرين", "المغرب", "تونس", "الجزائر", "العراق",
  "لبنان", "سوريا", "اليمن", "فلسطين", "ليبيا", "موريتانيا", "الصومال",
  "جيبوتي", "جزر القمر", "qatar", "saudi", "emirates", "uae", "egypt",
  "sudan", "jordan", "kuwait", "oman", "bahrain", "morocco", "tunisia",
  "algeria", "iraq", "lebanon", "syria", "yemen", "palestine", "libya",
  "mauritania", "somalia", "djibouti", "comoros"
];

export function isArabCountry(countryName?: string, titleName?: string): boolean {
  if (!countryName && !titleName) return false;
  const c = (countryName || "").toLowerCase();
  const t = (titleName || "").toLowerCase();
  return ARAB_COUNTRIES.some(name => c.includes(name) || t.includes(name));
}

export const dynamicStore = {
  // Get all scholarships (Base built-in + Admin custom, minus deleted/archived)
  getScholarships(): Scholarship[] {
    if (typeof window === "undefined") return SCHOLARSHIPS;
    try {
      const customRaw = localStorage.getItem(SCHOLARSHIPS_STORAGE_KEY);
      const deletedRaw = localStorage.getItem(DELETED_IDS_KEY);
      const parsedCustom = customRaw ? JSON.parse(customRaw) : [];
      const parsedDeleted = deletedRaw ? JSON.parse(deletedRaw) : [];
      const custom: Scholarship[] = Array.isArray(parsedCustom) ? parsedCustom : [];
      const deleted: string[] = Array.isArray(parsedDeleted) ? parsedDeleted : [];

      const normalizeSch = (s: any): Scholarship => {
        const detectedCat: "arab" | "global" =
          s.category === "arab" || s.category === "global"
            ? s.category
            : isArabCountry(s.country, s.title || s.title_ar)
            ? "arab"
            : "global";

        return {
          id: s.id,
          title: s.title || s.title_ar || "منحة دراسية معتمدة",
          titleEn: s.titleEn || s.title_en || s.title || "Scholarship Opportunity",
          org: s.org || s.university || "جامعة معتمدة",
          country: s.country || "دولي",
          countryEn: s.countryEn || s.country || "International",
          flag: s.flag || (detectedCat === "arab" ? "🏛️" : "🌍"),
          coverage: s.coverage || "full",
          category: detectedCat,
          amount: s.amount || s.stipend || (s.coverage === "full" ? "ممولة بالكامل" : "تمويل جزئي"),
          level: s.level || s.degree || "بكالوريوس / ماجستير",
          deadline: s.deadline || new Date().toISOString().split("T")[0],
          tags: Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : (Array.isArray(s.majors) && s.majors.length > 0 ? s.majors : ["منح"]),
          interests: Array.isArray(s.interests) ? s.interests : (Array.isArray(s.tags) ? s.tags : []),
          description: s.description || s.description_ar || "",
          descriptionEn: s.descriptionEn || s.description_en || "",
          url: s.url || s.apply_url || s.official_website || "#",
          is_featured: Boolean(s.is_featured),
          views_count: s.views_count || 0,
          ...s,
          category: detectedCat,
        };
      };

      const baseFiltered = SCHOLARSHIPS.filter(s => s && s.id && !deleted.includes(s.id)).map(normalizeSch);
      const customFiltered = custom.filter(s => s && s.id && !deleted.includes(s.id)).map(normalizeSch);
      
      const customIds = new Set(customFiltered.map(s => s.id));
      const result = [...customFiltered, ...baseFiltered.filter(s => !customIds.has(s.id))];
      return result.length > 0 ? result : SCHOLARSHIPS;
    } catch (e) {
      console.warn("dynamicStore getScholarships error, returning default SCHOLARSHIPS:", e);
      return SCHOLARSHIPS;
    }
  },

  // Cloud sync initialization from Supabase
  async syncWithCloud(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      // 1. Fetch scholarships from Supabase
      const { data: cloudSch, error: schErr } = await (supabase as any)
        .from("scholarships")
        .select("*");
      if (!schErr && Array.isArray(cloudSch) && cloudSch.length > 0) {
        const customRaw = localStorage.getItem(SCHOLARSHIPS_STORAGE_KEY);
        const parsed = customRaw ? JSON.parse(customRaw) : [];
        const localList: Scholarship[] = Array.isArray(parsed) ? parsed : [];
        const localMap = new Map(localList.filter(s => s && s.id).map(s => [s.id, s]));
        
        cloudSch.forEach((item: any) => {
          if (item && item.id) {
            const normalized: Scholarship = {
              id: item.id,
              title: item.title_ar || item.title || "منحة دراسية معتمدة",
              titleEn: item.title_en || item.titleEn || "Scholarship Opportunity",
              org: item.university || item.org || "جامعة معتمدة",
              country: item.country || "دولي",
              flag: item.flag || "🌍",
              coverage: item.coverage || "full",
              category: item.category || "global",
              deadline: item.deadline || new Date().toISOString().split("T")[0],
              tags: Array.isArray(item.majors) && item.majors.length > 0 ? item.majors : (Array.isArray(item.tags) ? item.tags : ["منح"]),
              description: item.description_ar || item.description || "",
              descriptionEn: item.description_en || item.descriptionEn || "",
              url: item.apply_url || item.url || "#",
              is_featured: Boolean(item.is_featured),
              views_count: item.views_count || 0,
              ...(item as any),
            };
            localMap.set(item.id, normalized);
          }
        });
        const merged = Array.from(localMap.values());
        localStorage.setItem(SCHOLARSHIPS_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "scholarship" } }));
      }

      // 2. Fetch jobs from Supabase
      const { data: cloudJobs, error: jobsErr } = await (supabase as any)
        .from("jobs")
        .select("*");
      if (!jobsErr && Array.isArray(cloudJobs) && cloudJobs.length > 0) {
        const customRaw = localStorage.getItem(JOBS_STORAGE_KEY);
        const parsed = customRaw ? JSON.parse(customRaw) : [];
        const localList: CustomJobItem[] = Array.isArray(parsed) ? parsed : [];
        const localMap = new Map(localList.filter(j => j && j.id).map(j => [j.id, j]));
        cloudJobs.forEach((item: any) => {
          if (item && item.id) {
            localMap.set(item.id, item);
          }
        });
        const merged = Array.from(localMap.values());
        localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "job" } }));
      }
    } catch (e) {
      console.info("Supabase sync standby:", e);
    }
  },

  // Save or update a scholarship (Local + Cloud Supabase)
  saveScholarship(item: Scholarship): void {
    if (typeof window === "undefined") return;
    try {
      const detectedCat: "arab" | "global" =
        item.category === "arab" || item.category === "global"
          ? item.category
          : isArabCountry(item.country, item.title || (item as any).title_ar)
          ? "arab"
          : "global";

      const normalized: Scholarship = {
        ...item,
        category: detectedCat,
        title: item.title || (item as any).title_ar || "منحة دراسية معتمدة",
        titleEn: item.titleEn || (item as any).title_en || item.title || "Scholarship Opportunity",
        org: item.org || (item as any).university || "جامعة معتمدة",
        country: item.country || "دولي",
        flag: item.flag || (detectedCat === "arab" ? "🏛️" : "🌍"),
        amount: item.amount || (item as any).stipend || (item.coverage === "full" ? "ممولة بالكامل" : "تمويل جزئي"),
        level: item.level || (item as any).degree || "بكالوريوس / ماجستير",
        url: item.url || (item as any).apply_url || (item as any).official_website || "#",
        tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : (Array.isArray((item as any).majors) && (item as any).majors.length > 0 ? (item as any).majors : ["منح"]),
        interests: Array.isArray(item.interests) ? item.interests : (Array.isArray(item.tags) ? item.tags : []),
      };

      const customRaw = localStorage.getItem(SCHOLARSHIPS_STORAGE_KEY);
      const list: Scholarship[] = customRaw ? JSON.parse(customRaw) : [];
      
      const existingIdx = list.findIndex(s => s.id === normalized.id);
      if (existingIdx >= 0) {
        list[existingIdx] = normalized;
      } else {
        list.unshift(normalized);
      }
      localStorage.setItem(SCHOLARSHIPS_STORAGE_KEY, JSON.stringify(list));
      
      // If previously deleted or archived, un-delete it
      this.undeleteItem(normalized.id);
      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "scholarship", item: normalized } }));

      // Asynchronously upsert to Supabase
      try {
        (supabase as any)
          .from("scholarships")
          .upsert({
            id: normalized.id,
            title_ar: normalized.title_ar || normalized.title,
            title_en: normalized.title_en || normalized.titleEn,
            university: normalized.university || normalized.org,
            country: normalized.country,
            flag: normalized.flag || "🌍",
            degree: (normalized as any).degree || normalized.level || "bachelor_master",
            coverage: normalized.coverage || "full",
            category: normalized.category,
            deadline: normalized.deadline,
            majors: (normalized as any).majors || normalized.tags || [],
            apply_url: (normalized as any).apply_url || normalized.url,
            official_website: (normalized as any).official_website,
            stipend: (normalized as any).stipend || normalized.amount,
            description_ar: (normalized as any).description_ar || normalized.description,
            description_en: (normalized as any).description_en || normalized.descriptionEn,
            benefits_ar: (normalized as any).benefits_ar || [],
            benefits_en: (normalized as any).benefits_en || [],
            requirements_ar: (normalized as any).requirements_ar || [],
            requirements_en: (normalized as any).requirements_en || [],
            is_featured: normalized.is_featured ?? false,
            views_count: normalized.views_count ?? 0,
          })
          .then(({ error }: any) => {
            if (error) console.info("Supabase scholarship upsert note:", error.message);
          });
      } catch (cloudErr) {
        console.info("Supabase direct write skipped:", cloudErr);
      }
    } catch (e) {
      console.error("Failed to save scholarship", e);
    }
  },

  // Get all custom jobs (Base + Admin, minus deleted/archived)
  getJobs(): CustomJobItem[] {
    if (typeof window === "undefined") return [];
    try {
      const customRaw = localStorage.getItem(JOBS_STORAGE_KEY);
      const deletedRaw = localStorage.getItem(DELETED_IDS_KEY);
      const custom: CustomJobItem[] = customRaw ? JSON.parse(customRaw) : [];
      const deleted: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      return custom.filter(j => !deleted.includes(j.id));
    } catch {
      return [];
    }
  },

  // Save or update a job (Local + Cloud Supabase)
  saveJob(job: CustomJobItem): void {
    if (typeof window === "undefined") return;
    try {
      const customRaw = localStorage.getItem(JOBS_STORAGE_KEY);
      const list: CustomJobItem[] = customRaw ? JSON.parse(customRaw) : [];
      const idx = list.findIndex(j => j.id === job.id);
      if (idx >= 0) {
        list[idx] = job;
      } else {
        list.unshift(job);
      }
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(list));
      this.undeleteItem(job.id);
      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "job" } }));

      // Asynchronously upsert to Supabase
      try {
        (supabase as any)
          .from("jobs")
          .upsert({
            id: job.id,
            title_ar: job.title_ar,
            title_en: job.title_en,
            company: job.company,
            location: job.location,
            salary: job.salary,
            category: job.category || "tech",
            type: (job as any).type || "remote_fulltime",
            country: (job as any).country || "عن بعد / Global Remote",
            flag: (job as any).flag || "💻",
            deadline: job.deadline,
            apply_url: job.apply_url,
            company_url: (job as any).company_url,
            skills: job.skills || [],
            benefits_ar: job.benefits_ar || [],
            description_ar: job.description_ar,
            description_en: job.description_en,
            verified: job.verified ?? true,
            featured: (job as any).featured ?? false,
          })
          .then(({ error }: any) => {
            if (error) console.info("Supabase job upsert note:", error.message);
          });
      } catch (cloudErr) {
        console.info("Supabase direct write skipped:", cloudErr);
      }
    } catch (e) {
      console.error("Failed to save job", e);
    }
  },

  // ==========================================
  // ARCHIVE VAULT & SOFT DELETE SYSTEM
  // ==========================================

  getArchivedItems(): ArchivedItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(ARCHIVE_VAULT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Archive a single item (Soft-Delete)
  archiveItem(
    id: string,
    type: "scholarship" | "job",
    user?: AdminUser | null,
    reason?: string
  ): ArchivedItem | null {
    if (typeof window === "undefined") return null;
    try {
      // Find the item data before marking as deleted
      let itemData: any = null;
      if (type === "scholarship") {
        itemData = this.getScholarships().find(s => s.id === id) || SCHOLARSHIPS.find(s => s.id === id);
      } else {
        itemData = this.getJobs().find(j => j.id === id) || JOBS.find(j => j.id === id);
      }

      if (!itemData) {
        itemData = { id, title: "عنصر محذوف", title_ar: "عنصر محذوف" };
      }

      const activeUser = user || adminAuthStore.getCurrentSession() || {
        id: "system",
        name: "مشرف النظام",
        role: "moderator" as const,
      };

      const archivedItem: ArchivedItem = {
        id,
        type,
        itemData,
        deletedAt: new Date().toISOString(),
        deletedBy: {
          id: activeUser.id,
          name: activeUser.name,
          role: activeUser.role,
        },
        reason,
      };

      // Add to archive vault
      const archive = this.getArchivedItems();
      // Avoid duplicate
      const existingIdx = archive.findIndex(a => a.id === id);
      if (existingIdx >= 0) {
        archive[existingIdx] = archivedItem;
      } else {
        archive.unshift(archivedItem);
      }
      localStorage.setItem(ARCHIVE_VAULT_KEY, JSON.stringify(archive));

      // Mark ID as deleted in active list
      this.markIdDeleted(id);

      // Audit Log & Admin Notification
      const title = itemData.title_ar || itemData.title || itemData.titleEn || id;
      const isSuperAdmin = activeUser.role === "super_admin";
      
      adminAuthStore.logActivity(
        activeUser as any,
        "archive_item",
        `أرشفة ${type === "scholarship" ? "منحة" : "فرصة عمل"}`,
        `العنصر: ${title} — بواسطة ${activeUser.name} (${activeUser.role})`
      );

      // If action done by a moderator/editor, trigger alert for admin
      if (!isSuperAdmin) {
        window.dispatchEvent(
          new CustomEvent("foras:admin-alert", {
            detail: {
              type: "moderator_deletion",
              message: `قام المشرف ${activeUser.name} بأرشفة ${type === "scholarship" ? "منحة" : "وظيفة"}: ${title}`,
              itemId: id,
              user: activeUser,
              timestamp: new Date().toISOString(),
            },
          })
        );
      }

      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type, id } }));
      window.dispatchEvent(new CustomEvent("foras:archive-updated"));
      return archivedItem;
    } catch (e) {
      console.error("Failed to archive item", e);
      return null;
    }
  },

  // Archive Multiple Items in Bulk
  archiveMultiple(
    items: { id: string; type: "scholarship" | "job"; itemData?: any }[],
    user?: AdminUser | null,
    reason?: string
  ): number {
    if (typeof window === "undefined" || !items.length) return 0;
    try {
      const activeUser = user || adminAuthStore.getCurrentSession() || {
        id: "system",
        name: "مشرف النظام",
        role: "moderator" as const,
      };

      const archive = this.getArchivedItems();
      const now = new Date().toISOString();
      let archivedCount = 0;

      items.forEach(item => {
        let itemData = item.itemData;
        if (!itemData) {
          if (item.type === "scholarship") {
            itemData = this.getScholarships().find(s => s.id === item.id) || SCHOLARSHIPS.find(s => s.id === item.id);
          } else {
            itemData = this.getJobs().find(j => j.id === item.id) || JOBS.find(j => j.id === item.id);
          }
        }

        const archivedItem: ArchivedItem = {
          id: item.id,
          type: item.type,
          itemData: itemData || { id: item.id },
          deletedAt: now,
          deletedBy: {
            id: activeUser.id,
            name: activeUser.name,
            role: activeUser.role,
          },
          reason,
        };

        const existingIdx = archive.findIndex(a => a.id === item.id);
        if (existingIdx >= 0) {
          archive[existingIdx] = archivedItem;
        } else {
          archive.unshift(archivedItem);
        }
        this.markIdDeleted(item.id);
        archivedCount++;
      });

      localStorage.setItem(ARCHIVE_VAULT_KEY, JSON.stringify(archive));

      adminAuthStore.logActivity(
        activeUser as any,
        "bulk_archive",
        `أرشفة جماعية لـ ${archivedCount} عنصر`,
        `قام ${activeUser.name} بنقل ${archivedCount} عنصر إلى الأرشيف`
      );

      if (activeUser.role !== "super_admin") {
        window.dispatchEvent(
          new CustomEvent("foras:admin-alert", {
            detail: {
              type: "moderator_bulk_deletion",
              message: `قام المشرف ${activeUser.name} بأرشفة ${archivedCount} عنصر دفعة واحدة.`,
              count: archivedCount,
              user: activeUser,
              timestamp: now,
            },
          })
        );
      }

      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "all" } }));
      window.dispatchEvent(new CustomEvent("foras:archive-updated"));
      return archivedCount;
    } catch (e) {
      console.error("Failed to archive multiple items", e);
      return 0;
    }
  },

  // Restore an archived item back to active lists
  restoreArchivedItem(id: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      const archive = this.getArchivedItems();
      const target = archive.find(a => a.id === id);
      if (!target) return false;

      // Remove from archive vault
      localStorage.setItem(ARCHIVE_VAULT_KEY, JSON.stringify(archive.filter(a => a.id !== id)));
      
      // Undelete from deleted list
      this.undeleteItem(id);

      const activeUser = adminAuthStore.getCurrentSession();
      if (activeUser) {
        adminAuthStore.logActivity(
          activeUser,
          "restore_item",
          `استعادة عنصر من الأرشيف`,
          `تمت استعادة ${target.type === "scholarship" ? "المنحة" : "الوظيفة"} (ID: ${id})`
        );
      }

      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: target.type, id } }));
      window.dispatchEvent(new CustomEvent("foras:archive-updated"));
      return true;
    } catch (e) {
      console.error("Failed to restore archived item", e);
      return false;
    }
  },

  // Restore multiple items
  restoreMultiple(ids: string[]): number {
    if (typeof window === "undefined" || !ids.length) return 0;
    try {
      const archive = this.getArchivedItems();
      const idSet = new Set(ids);
      const remaining = archive.filter(a => !idSet.has(a.id));
      localStorage.setItem(ARCHIVE_VAULT_KEY, JSON.stringify(remaining));

      ids.forEach(id => this.undeleteItem(id));

      const activeUser = adminAuthStore.getCurrentSession();
      if (activeUser) {
        adminAuthStore.logActivity(
          activeUser,
          "bulk_restore",
          `استعادة جماعية من الأرشيف (${ids.length} عنصر)`,
          `بواسطة ${activeUser.name}`
        );
      }

      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "all" } }));
      window.dispatchEvent(new CustomEvent("foras:archive-updated"));
      return ids.length;
    } catch {
      return 0;
    }
  },

  // Permanently Delete single item from Archive (Admin Only)
  permanentlyDeleteArchivedItem(id: string, user: AdminUser): boolean {
    if (typeof window === "undefined") return false;
    if (user.role !== "super_admin") {
      throw new Error("عفواً، الحذف النهائي مقتصر على المدير العام فقط");
    }

    try {
      const archive = this.getArchivedItems();
      const target = archive.find(a => a.id === id);
      localStorage.setItem(ARCHIVE_VAULT_KEY, JSON.stringify(archive.filter(a => a.id !== id)));

      adminAuthStore.logActivity(
        user,
        "permanent_delete",
        `حذف نهائي لا رجعة فيه من الأرشيف`,
        `العنصر: ${target?.itemData?.title_ar || id} — تم مسحه للأبد من قبل المدير العام`
      );

      window.dispatchEvent(new CustomEvent("foras:archive-updated"));
      return true;
    } catch (e) {
      console.error("Failed to permanently delete item", e);
      return false;
    }
  },

  // Empty Entire Archive Vault (Admin Only - Danger Zone)
  emptyArchive(user: AdminUser): number {
    if (typeof window === "undefined") return 0;
    if (user.role !== "super_admin") {
      throw new Error("عفواً، تفريغ الأرشيف مقتصر على المدير العام فقط");
    }

    try {
      const archive = this.getArchivedItems();
      const count = archive.length;
      localStorage.removeItem(ARCHIVE_VAULT_KEY);

      adminAuthStore.logActivity(
        user,
        "empty_archive_vault",
        `تفريغ سلة المحذوفات بالكامل (${count} عنصر)`,
        `قام المدير العام ${user.name} بمسح كامل محتويات الأرشيف نهائياً`
      );

      window.dispatchEvent(new CustomEvent("foras:archive-updated"));
      return count;
    } catch {
      return 0;
    }
  },

  // Internal helper to mark an ID deleted
  markIdDeleted(id: string): void {
    try {
      const deletedRaw = localStorage.getItem(DELETED_IDS_KEY);
      const deleted: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deleted));
      }
    } catch {}
  },

  // Delete scholarship or job by ID (standard wrapper)
  deleteItem(id: string, type: "scholarship" | "job"): void {
    this.archiveItem(id, type);
  },

  undeleteItem(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const deletedRaw = localStorage.getItem(DELETED_IDS_KEY);
      if (deletedRaw) {
        const deleted: string[] = JSON.parse(deletedRaw);
        localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deleted.filter(d => d !== id)));
      }
    } catch {}
  },

  // Reset to initial built-in defaults
  resetAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SCHOLARSHIPS_STORAGE_KEY);
    localStorage.removeItem(JOBS_STORAGE_KEY);
    localStorage.removeItem(DELETED_IDS_KEY);
    localStorage.removeItem(ARCHIVE_VAULT_KEY);
    window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "all" } }));
    window.dispatchEvent(new CustomEvent("foras:archive-updated"));
  },

  // Real AI-Powered URL Extractor via backend API
  async parseFromUrl(url: string, type: "scholarship" | "job"): Promise<Partial<Scholarship> | Partial<CustomJobItem>> {
    try {
      const response = await fetch("/api/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type }),
      });

      const result = await response.json();

      if (!response.ok || result.isValid === false) {
        throw new Error(result.reason || result.error || "تعذر استخراج بيانات صالحة من هذا الرابط");
      }

      if (result.isValid && result.data) {
        return {
          id: `${type === "scholarship" ? "sch" : "job"}_${Date.now()}`,
          ...result.data,
        };
      }

      throw new Error("الرابط المدخل لا يحتوي على بيانات فرصة معتمدة");
    } catch (e: any) {
      throw new Error(e.message || "فشل الاتصال بمستخرج الروابط الذكي");
    }
  }
};
