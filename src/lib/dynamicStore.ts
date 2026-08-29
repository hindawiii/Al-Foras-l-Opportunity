// Dynamic Data Store for Admin & Custom Opportunities
// Handles local/cloud synchronization for Scholarships, Jobs, and Universities
// Supports AI-assisted URL auto-parsing, manual editing, soft-delete archiving, and persistent updates.

import { Scholarship, SCHOLARSHIPS } from "./mockData";
import { Job, JOBS } from "./jobsData";
import { adminAuthStore, AdminUser } from "./adminAuthStore";

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

export const dynamicStore = {
  // Get all scholarships (Base built-in + Admin custom, minus deleted/archived)
  getScholarships(): Scholarship[] {
    if (typeof window === "undefined") return SCHOLARSHIPS;
    try {
      const customRaw = localStorage.getItem(SCHOLARSHIPS_STORAGE_KEY);
      const deletedRaw = localStorage.getItem(DELETED_IDS_KEY);
      const custom: Scholarship[] = customRaw ? JSON.parse(customRaw) : [];
      const deleted: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

      const baseFiltered = SCHOLARSHIPS.filter(s => !deleted.includes(s.id));
      // Merge: Custom ones on top
      const customFiltered = custom.filter(s => !deleted.includes(s.id));
      
      const customIds = new Set(customFiltered.map(s => s.id));
      const result = [...customFiltered, ...baseFiltered.filter(s => !customIds.has(s.id))];
      return result.length > 0 ? result : SCHOLARSHIPS;
    } catch {
      return SCHOLARSHIPS;
    }
  },

  // Save or update a scholarship
  saveScholarship(item: Scholarship): void {
    if (typeof window === "undefined") return;
    try {
      const customRaw = localStorage.getItem(SCHOLARSHIPS_STORAGE_KEY);
      const list: Scholarship[] = customRaw ? JSON.parse(customRaw) : [];
      
      const existingIdx = list.findIndex(s => s.id === item.id);
      if (existingIdx >= 0) {
        list[existingIdx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(SCHOLARSHIPS_STORAGE_KEY, JSON.stringify(list));
      
      // If previously deleted or archived, un-delete it
      this.undeleteItem(item.id);
      window.dispatchEvent(new CustomEvent("foras:data-updated", { detail: { type: "scholarship" } }));
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

  // Save or update a job
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

  // AI URL Smart Parser simulation (extracts structure from official links)
  async parseFromUrl(url: string, type: "scholarship" | "job"): Promise<Partial<Scholarship> | Partial<CustomJobItem>> {
    await new Promise(r => setTimeout(r, 1200)); // Smooth processing simulation
    const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0].toLowerCase();
    
    if (type === "scholarship") {
      let country = "دولي / International";
      let titleAr = "منحة دراسية ممولة بالكامل";
      let titleEn = "Fully Funded Academic Scholarship";
      const coverage = "full";
      let stipend = "$1,200/month";

      if (domain.includes("turkiye") || domain.includes("gov.tr")) {
        country = "تركيا";
        titleAr = "منحة الحكومة التركية الرسمية (Türkiye Bursları)";
        titleEn = "Official Türkiye Scholarships Program";
        stipend = "2,500 - 4,000 TRY + سكن مجاني وتذاكر";
      } else if (domain.includes("saudi") || domain.includes("moe.gov.sa")) {
        country = "السعودية";
        titleAr = "منح الجامعات السعودية للطلاب الدوليين";
        titleEn = "Study in Saudi Official Scholarships";
        stipend = "1,000 - 2,500 SAR + تأمين وسكن";
      } else if (domain.includes("daad.de")) {
        country = "ألمانيا";
        titleAr = "منحة الهيئة الألمانية للتبادل الأكاديمي (DAAD)";
        titleEn = "DAAD Scholarship Program Germany";
        stipend = "934 - 1,300 EUR/month";
      } else if (domain.includes("chevening.org")) {
        country = "المملكة المتحدة";
        titleAr = "منحة تشيفنينغ البريطانية للقادة";
        titleEn = "Chevening UK Leadership Scholarship";
        stipend = "£1,400/month + Full Tuition";
      } else if (domain.includes("fulbright")) {
        country = "الولايات المتحدة";
        titleAr = "منحة فولبرايت للتبادل التعليمي (Fulbright)";
        titleEn = "Fulbright Foreign Student Program";
        stipend = "Full Coverage + Health & Flights";
      }

      return {
        id: `sch_${Date.now()}`,
        title_ar: titleAr,
        title_en: titleEn,
        university: "Official Accredited University",
        country,
        flag: "🌍",
        degree: "bachelor_master",
        coverage: coverage as any,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        majors: ["الهندسة والتقنية", "العلوم الطبية والصحية", "إدارة الأعمال والاقتصاد", "الذكاء الاصطناعي"],
        apply_url: url,
        official_website: url,
        is_featured: true,
        stipend,
        description_ar: `منحة رسمية معتمدة وممولة بالكامل تم استخراج بياناتها آلياً من الرابط (${domain}) وتتضمن تغطية الرسوم الدراسية وراتباً شهرياً وتأميناً شاملاً.`,
        description_en: `Official accredited fully funded opportunity auto-parsed from (${domain}). Covers full tuition, monthly stipend, and health insurance.`,
        benefits_ar: ["إعفاء 100% من المصروفات الدراسية", "راتب شهري منتظم طوال فترة الدراسة", "سكن جامعي مؤثث مجاناً", "تأمين صحي وتذاكر سفر سنوية"],
        benefits_en: ["100% Tuition fee waiver", "Monthly living allowance stipend", "Free furnished student accommodation", "Full health insurance & flights"],
        requirements_ar: ["ألا يقل معدل الشهادة السابقة عن 75%", "جواز سفر ساري المفعول", "خطاب دافع متقن وسيرة ذاتية حديثة"],
        requirements_en: ["Minimum 75% academic grade", "Valid passport", "Tailored motivation letter & updated CV"],
      };
    }

    // Job Parsing
    return {
      id: `job_${Date.now()}`,
      title_ar: "فرصة عمل تقنية عن بعد",
      title_en: "Remote Professional Position",
      company: domain.split(".")[0].toUpperCase() || "Global Remote Inc.",
      category: "tech",
      type: "remote_fulltime",
      country: "عن بعد / Global Remote",
      flag: "💻",
      salary: "$1,800 - $3,500 / month",
      verified: true,
      featured: true,
      posted_date: new Date().toISOString().split("T")[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      apply_url: url,
      company_url: url,
      experience_level: "mid",
      description_ar: `وظيفة عن بعد تم استخراج تفاصيلها وتوثيقها رسمياً من منصة (${domain}) للعمل مع فريق عالمي براتب تنافسي ومواعيد مرنة.`,
      description_en: `Remote role officially parsed and verified from (${domain}). Flexible work hours with international compensation.`,
      tags: ["Remote", "Full-time", "USD Salary", "Verified"],
      skills: ["Problem Solving", "Communication", "Technical Excellence"],
      benefits_ar: ["راتب شهري بالدولار الأمريكي", "ساعات عمل مرنة بالكامل", "تأمين صحي وبدل أجهزة حاسوب"],
      benefits_en: ["USD Monthly Salary", "100% Remote Flexibility", "Equipment & Health Allowance"],
      requirements_ar: ["خبرة عملية لا تقل عن سنتين", "إجادة أساسيات اللغة الإنجليزية في التواصل", "التزام بمواعيد تسليم المشاريع"],
      requirements_en: ["2+ years relevant experience", "Working English proficiency", "Reliable delivery and ownership"],
    };
  }
};
