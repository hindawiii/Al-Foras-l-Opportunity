import React from "react";
import {
  GraduationCap,
  X,
  Plus,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Square,
  Trash2,
  Archive,
} from "lucide-react";
import { Scholarship } from "@/lib/mockData";
import { adminAuthStore, AdminUser } from "@/lib/adminAuthStore";
import { dynamicStore } from "@/lib/dynamicStore";
import { toast } from "sonner";

interface ScholarshipListPaneProps {
  isRtl: boolean;
  t: (key: string) => string;
  deviceSimulator: "desktop" | "tablet" | "phone";
  mobileViewPane: "list" | "detail";
  setMobileViewPane: (pane: "list" | "detail") => void;
  filteredScholarships: Scholarship[];
  scholarships: Scholarship[];
  hasActiveScholarshipFilters: boolean;
  resetScholarshipFilters: () => void;
  currentUser: AdminUser | null;
  scholarshipCategoryFilter: "all" | "arab" | "global";
  setScholarshipCategoryFilter: (filter: "all" | "arab" | "global") => void;
  scholarshipFundingFilter: "all" | "full" | "partial";
  setScholarshipFundingFilter: (filter: "all" | "full" | "partial") => void;
  scholarshipDegreeFilter: "all" | "bachelor" | "master" | "phd";
  setScholarshipDegreeFilter: (filter: "all" | "bachelor" | "master" | "phd") => void;
  scholarshipDeadlineFilter: "all" | "active" | "expiring_soon" | "expired";
  setScholarshipDeadlineFilter: (filter: "all" | "active" | "expiring_soon" | "expired") => void;
  scholarshipCategoryCounts: {
    all: number;
    arab: number;
    global: number;
    full: number;
    partial: number;
    bachelor: number;
    master: number;
    phd: number;
    expiring_soon: number;
    expired: number;
  };
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleToggleSelectItem: (id: string, idx: number, e: React.MouseEvent) => void;
  editingScholarship: Scholarship | null;
  setEditingScholarship: React.Dispatch<React.SetStateAction<Scholarship | null>>;
  calculateScholarshipScore: (s: any) => { score: number; grade: string; missing: string[] };
}

export const ScholarshipListPane: React.FC<ScholarshipListPaneProps> = ({
  isRtl,
  t,
  deviceSimulator,
  mobileViewPane,
  setMobileViewPane,
  filteredScholarships,
  scholarships,
  hasActiveScholarshipFilters,
  resetScholarshipFilters,
  currentUser,
  scholarshipCategoryFilter,
  setScholarshipCategoryFilter,
  scholarshipFundingFilter,
  setScholarshipFundingFilter,
  scholarshipDegreeFilter,
  setScholarshipDegreeFilter,
  scholarshipDeadlineFilter,
  setScholarshipDeadlineFilter,
  scholarshipCategoryCounts,
  selectedIds,
  setSelectedIds,
  handleToggleSelectItem,
  editingScholarship,
  setEditingScholarship,
  calculateScholarshipScore,
}) => {
  return (
<div
  className={`h-full flex flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
    (deviceSimulator === "phone" || mobileViewPane === "detail")
      ? "hidden lg:flex lg:col-span-4 xl:col-span-4"
      : "lg:col-span-4 xl:col-span-4 flex"
  }`}
>
  {/* List Header & Categories Segment Hub */}
  <div className="border-b border-primary/20 bg-card/90 flex flex-col flex-shrink-0">
    {/* 1. Header Bar */}
    <div className="p-3 pb-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
          <GraduationCap className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>{isRtl ? "سجل المنح الدراسية" : "Scholarships Hub"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-primary/25 border border-primary/40 text-primary">
              {filteredScholarships.length}
              {filteredScholarships.length !== scholarships.length && ` / ${scholarships.length}`}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {hasActiveScholarshipFilters && (
          <button
            onClick={resetScholarshipFilters}
            title={isRtl ? "تصفير جميع الفلاتر" : "Reset all filters"}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span className="hidden sm:inline">{isRtl ? "تصفير" : "Reset"}</span>
          </button>
        )}

        {adminAuthStore.canUserPerform(currentUser, "create") && (
          <button
            onClick={() => {
              const newSch = {
                id: `sch_${Date.now()}`,
                title_ar: "منحة دراسية جديدة ممولة بالكامل",
                title_en: "New Fully Funded Scholarship",
                university: isRtl ? "جامعة دولية معتمدة" : "Accredited International University",
                country: isRtl ? "عالمي" : "International",
                flag: "🌍",
                category: scholarshipCategoryFilter === "arab" ? "arab" : "global",
                degree: "bachelor_master",
                coverage: "full" as any,
                deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
                majors: ["الهندسة والتقنية", "الطب والعلوم"],
                apply_url: "https://example.com",
                official_website: "https://example.com",
                description_ar: "وصف المنحة وتفاصيل الدعم المالي والرسوم والتذاكر والسكن.",
                description_en: "Scholarship description and full financial coverage details.",
                benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني"],
                benefits_en: ["Full tuition waiver", "Monthly stipend"],
              };
              setEditingScholarship(newSch as any);
              setMobileViewPane("detail");
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-gold hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? "إضافة منحة" : "New"}</span>
          </button>
        )}
      </div>
    </div>

    {/* 2. Primary Geographic Scope Tabs (القطاع الجغرافي) */}
    <div className="px-3 pb-2 flex gap-1.5">
      <button
        type="button"
        onClick={() => setScholarshipCategoryFilter("all")}
        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
          scholarshipCategoryFilter === "all"
            ? "bg-primary text-primary-foreground shadow-gold"
            : "bg-card/70 border border-primary/20 text-gray-300 hover:text-white hover:border-primary/40"
        }`}
      >
        <span>🌍</span>
        <span>{isRtl ? "الكل" : "All"}</span>
        <span className={`text-[10px] px-1 rounded-full ${
          scholarshipCategoryFilter === "all" ? "bg-black/20 text-white" : "bg-primary/20 text-primary"
        }`}>
          {scholarshipCategoryCounts.total}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setScholarshipCategoryFilter("arab")}
        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
          scholarshipCategoryFilter === "arab"
            ? "bg-primary text-primary-foreground shadow-gold"
            : "bg-card/70 border border-primary/20 text-gray-300 hover:text-white hover:border-primary/40"
        }`}
      >
        <span>🏛️</span>
        <span>{isRtl ? "منح عربية" : "Arab"}</span>
        <span className={`text-[10px] px-1 rounded-full ${
          scholarshipCategoryFilter === "arab" ? "bg-black/20 text-white" : "bg-primary/20 text-primary"
        }`}>
          {scholarshipCategoryCounts.arab}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setScholarshipCategoryFilter("global")}
        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
          scholarshipCategoryFilter === "global"
            ? "bg-primary text-primary-foreground shadow-gold"
            : "bg-card/70 border border-primary/20 text-gray-300 hover:text-white hover:border-primary/40"
        }`}
      >
        <span>🌐</span>
        <span>{isRtl ? "منح دولية" : "Global"}</span>
        <span className={`text-[10px] px-1 rounded-full ${
          scholarshipCategoryFilter === "global" ? "bg-black/20 text-white" : "bg-primary/20 text-primary"
        }`}>
          {scholarshipCategoryCounts.global}
        </span>
      </button>
    </div>

    {/* 3. Fast Sub-Filter Chips (المرشحات السريعة للتمويل والمرحلة والصلاحية) */}
    <div className="px-3 pb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
      {/* Funding Pills */}
      <button
        type="button"
        onClick={() =>
          setScholarshipFundingFilter(prev => (prev === "full" ? "all" : "full"))
        }
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
          scholarshipFundingFilter === "full"
            ? "bg-emerald-500 text-white shadow-sm"
            : "bg-card/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15"
        }`}
      >
        <span>💎</span>
        <span>{isRtl ? "ممولة بالكامل" : "Full"}</span>
        <span className="opacity-80">({scholarshipCategoryCounts.full})</span>
      </button>

      <button
        type="button"
        onClick={() =>
          setScholarshipFundingFilter(prev => (prev === "partial" ? "all" : "partial"))
        }
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
          scholarshipFundingFilter === "partial"
            ? "bg-blue-500 text-white shadow-sm"
            : "bg-card/60 border border-blue-500/30 text-blue-400 hover:bg-blue-500/15"
        }`}
      >
        <span>⚖️</span>
        <span>{isRtl ? "تمويل جزئي" : "Partial"}</span>
        <span className="opacity-80">({scholarshipCategoryCounts.partial})</span>
      </button>

      {/* Degree Pills */}
      <button
        type="button"
        onClick={() =>
          setScholarshipDegreeFilter(prev => (prev === "bachelor" ? "all" : "bachelor"))
        }
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
          scholarshipDegreeFilter === "bachelor"
            ? "bg-amber-500 text-black font-black shadow-sm"
            : "bg-card/60 border border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
        }`}
      >
        <span>🎓</span>
        <span>{isRtl ? "بكالوريوس" : "Bachelor"}</span>
        <span className="opacity-80">({scholarshipCategoryCounts.bachelor})</span>
      </button>

      <button
        type="button"
        onClick={() =>
          setScholarshipDegreeFilter(prev => (prev === "postgrad" ? "all" : "postgrad"))
        }
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
          scholarshipDegreeFilter === "postgrad"
            ? "bg-purple-500 text-white shadow-sm"
            : "bg-card/60 border border-purple-500/30 text-purple-300 hover:bg-purple-500/15"
        }`}
      >
        <span>📚</span>
        <span>{isRtl ? "دراسات عليا" : "Postgrad"}</span>
        <span className="opacity-80">({scholarshipCategoryCounts.postgrad})</span>
      </button>

      {/* Expired Filter Pill - High Priority Maintenance */}
      <button
        type="button"
        onClick={() =>
          setScholarshipDeadlineFilter(prev => (prev === "expired" ? "all" : "expired"))
        }
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
          scholarshipDeadlineFilter === "expired"
            ? "bg-red-500 text-white shadow-sm font-black"
            : scholarshipCategoryCounts.expired > 0
            ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
            : "bg-card/60 border border-primary/20 text-gray-400 hover:text-white"
        }`}
      >
        <span>🔴</span>
        <span>{isRtl ? "منتهية الصلاحية" : "Expired"}</span>
        <span className="opacity-90 font-black">({scholarshipCategoryCounts.expired})</span>
      </button>

      {/* Expiring Soon Pill */}
      <button
        type="button"
        onClick={() =>
          setScholarshipDeadlineFilter(prev => (prev === "expiring_soon" ? "all" : "expiring_soon"))
        }
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
          scholarshipDeadlineFilter === "expiring_soon"
            ? "bg-amber-600 text-white shadow-sm"
            : "bg-card/60 border border-amber-500/30 text-amber-400 hover:bg-amber-500/15"
        }`}
      >
        <span>⏳</span>
        <span>{isRtl ? "تنتهي قريباً" : "Expiring"}</span>
        <span className="opacity-80">({scholarshipCategoryCounts.expiringSoon})</span>
      </button>
    </div>

    {/* 4. Expired Batch Maintenance Banner */}
    {scholarshipDeadlineFilter === "expired" && (
      <div className="mx-3 mb-2.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-red-300 font-bold">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>
            {isRtl
              ? `تم فرز ${filteredScholarships.length} منحة منتهية الصلاحية.`
              : `${filteredScholarships.length} expired scholarships found.`}
          </span>
          {selectedIds.length > 0 && (
            <span className="bg-red-500/30 px-2 py-0.5 rounded-full text-[10px] text-white font-mono">
              {isRtl ? `(${selectedIds.length} محددة)` : `(${selectedIds.length} selected)`}
            </span>
          )}
        </div>

        {filteredScholarships.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Select All / Deselect All */}
            <button
              type="button"
              onClick={() => {
                const expiredIds = filteredScholarships.map(s => s.id);
                if (selectedIds.length === expiredIds.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(expiredIds);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-card/90 border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/20 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>
                {selectedIds.length === filteredScholarships.length
                  ? (isRtl ? "إلغاء التحديد" : "Deselect all")
                  : (isRtl ? "تحديد الكل" : "Select all")}
              </span>
            </button>

            {/* 2. Explicit Permanent Delete / Wipe Button */}
            <button
              type="button"
              onClick={() => {
                const idsToDelete = selectedIds.length > 0 ? selectedIds : filteredScholarships.map(s => s.id);
                if (idsToDelete.length === 0) return;
                const confirmMsg = isRtl
                  ? `هل أنت متأكد من مسح وحذف ${idsToDelete.length} منحة منتهية الصلاحية نهائياً؟`
                  : `Are you sure you want to permanently delete ${idsToDelete.length} expired scholarship(s)?`;
                if (!window.confirm(confirmMsg)) return;

                const items = idsToDelete.map(id => ({ id, type: "scholarship" }));
                dynamicStore.archiveMultiple(items, currentUser, "مسح وحذف منحة منتهية");
                idsToDelete.forEach(id => {
                  try {
                    const archive = dynamicStore.getArchivedItems();
                    localStorage.setItem("foras_archived_vault_v1", JSON.stringify(archive.filter(a => a.id !== id)));
                  } catch {
                    // silent
                  }
                });
                setSelectedIds([]);
                toast.success(
                  isRtl
                    ? `تم مسح وحذف ${idsToDelete.length} منحة منتهية بنجاح`
                    : `Deleted ${idsToDelete.length} expired scholarship(s)`
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              title={isRtl ? "مسح وحذف نهائي من النظام" : "Permanently delete from system"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {selectedIds.length > 0
                  ? (isRtl ? `مسح وحذف المحددة (${selectedIds.length})` : `Delete selected (${selectedIds.length})`)
                  : (isRtl ? `مسح وحذف جميع المنتهية (${filteredScholarships.length})` : `Delete all expired (${filteredScholarships.length})`)}
              </span>
            </button>

            {/* 3. Move to Archive Vault */}
            <button
              type="button"
              onClick={() => {
                const idsToArchive = selectedIds.length > 0 ? selectedIds : filteredScholarships.map(s => s.id);
                if (idsToArchive.length === 0) return;
                const items = idsToArchive.map(id => ({ id, type: "scholarship" }));
                dynamicStore.archiveMultiple(items, currentUser);
                setSelectedIds([]);
                toast.success(
                  isRtl
                    ? `تمت أرشفة ${idsToArchive.length} منحة منتهية بنجاح ونقلها للأرشيف`
                    : `Archived ${idsToArchive.length} expired scholarship(s)`
                );
              }}
              className="px-2.5 py-1.5 rounded-lg bg-card border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title={isRtl ? "نقل المنح إلى الأرشيف" : "Move to archive vault"}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                {selectedIds.length > 0
                  ? (isRtl ? `أرشفة المحددة (${selectedIds.length})` : `Archive selected (${selectedIds.length})`)
                  : (isRtl ? `أرشفة جميع المنتهية (${filteredScholarships.length})` : `Archive all (${filteredScholarships.length})`)}
              </span>
            </button>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Scrollable List Items */}
  <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-primary/20">
    {filteredScholarships.length === 0 ? (
      <div className="text-center py-12 p-4 rounded-xl bg-card/40 border border-primary/20 space-y-2">
        <GraduationCap className="w-8 h-8 text-primary mx-auto opacity-50" />
        <p className="text-xs text-gray-300 font-bold">
          {hasActiveScholarshipFilters || searchQuery
            ? (isRtl ? "لا توجد منح مطابقة للفلاتر المحددة حالياً" : "No scholarships match current filters")
            : t("adminNoScholarships")}
        </p>
        {hasActiveScholarshipFilters && (
          <button
            onClick={resetScholarshipFilters}
            className="px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRtl ? "إلغاء التصفية وعرض الكل" : "Clear filters and show all"}</span>
          </button>
        )}
      </div>
    ) : (
      filteredScholarships.map((s, idx) => {
        const isSelected = selectedIds.includes(s.id);
        const isActiveEdit = editingScholarship?.id === s.id;
        const scoreData = calculateScholarshipScore(s);
        const deadlineStatus = getScholarshipDeadlineStatus(s);
        const isArab = s.category === "arab";

        return (
          <div
            key={s.id}
            onClick={() => {
              setEditingScholarship(s);
              setMobileViewPane("detail");
            }}
            className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
              isActiveEdit
                ? "bg-primary/20 border-primary shadow-gold"
                : isSelected
                ? "bg-primary/10 border-primary/50"
                : "bg-card/70 border-primary/15 hover:border-primary/40 hover:bg-card"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSelectItem(s.id, idx, e);
                  }}
                  className="pt-0.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {/* Category Badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isArab
                          ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                          : "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                      }`}
                    >
                      {isArab ? (isRtl ? "🏛️ عربية" : "Arab") : (isRtl ? "🌐 دولية" : "Global")}
                    </span>

                    {/* Degree Badge if available */}
                    {((s as any).degree || s.level) && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-card border border-primary/20 text-gray-300">
                        {isScholarshipBachelor(s)
                          ? (isRtl ? "🎓 بكالوريوس" : "Bachelor")
                          : isScholarshipPostgrad(s)
                          ? (isRtl ? "📚 دراسات عليا" : "Postgrad")
                          : (s.level || (s as any).degree)}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                    {isRtl ? s.title || (s as any).title_ar : (s as any).title_en || s.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    {s.university || s.org} • {s.country}
                  </p>
                </div>
              </div>

              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${
                  scoreData.score >= 85
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {scoreData.score}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-primary/10 text-gray-400">
              <span className="text-amber-300 font-medium">
                {isScholarshipFullyFunded(s)
                  ? (isRtl ? "💎 ممولة بالكامل" : "Fully Funded")
                  : (isRtl ? "⚖️ تمويل جزئي" : "Partial")}
              </span>

              {/* Deadline with color alert */}
              <span
                className={`text-[10px] font-bold flex items-center gap-1 ${
                  deadlineStatus === "expired"
                    ? "text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"
                    : deadlineStatus === "expiring_soon"
                    ? "text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded"
                    : "text-gray-400"
                }`}
              >
                {deadlineStatus === "expired" && "🔴 "}
                {deadlineStatus === "expiring_soon" && "⏳ "}
                {s.deadline
                  ? `${s.deadline} ${deadlineStatus === "expired" ? (isRtl ? "(منتهية)" : "(Expired)") : ""}`
                  : isRtl
                  ? "مفتوح دائماً"
                  : "Open"}
              </span>
            </div>
          </div>
        );
      })
    )}
  </div>
</div>

  );
};
