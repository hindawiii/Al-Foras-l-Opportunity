import React from "react";
import {
  Briefcase,
  Plus,
  X,
  CheckSquare,
  Square,
  Check,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { CustomJobItem, dynamicStore } from "@/lib/dynamicStore";
import { adminAuthStore, AdminUser } from "@/lib/adminAuthStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JobsManagementViewProps {
  isRtl: boolean;
  dir: string;
  t: (key: string) => string;
  deviceSimulator: "desktop" | "tablet" | "phone";
  mobileViewPane: "list" | "detail";
  setMobileViewPane: (pane: "list" | "detail") => void;
  currentUser: AdminUser | null;
  filteredJobs: CustomJobItem[];
  selectedIds: string[];
  handleToggleSelectItem: (id: string, idx: number, e: React.MouseEvent) => void;
  editingJob: CustomJobItem | null;
  setEditingJob: React.Dispatch<React.SetStateAction<CustomJobItem | null>>;
  calculateJobScore: (j: any) => { score: number; grade: string; missing: string[] };
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  activeEditorTab: "info" | "financials" | "eligibility" | "custom" | "urls";
  setActiveEditorTab: (tab: "info" | "financials" | "eligibility" | "custom" | "urls") => void;
}

export const JobsManagementView: React.FC<JobsManagementViewProps> = ({
  isRtl,
  dir,
  t,
  deviceSimulator,
  mobileViewPane,
  setMobileViewPane,
  currentUser,
  filteredJobs,
  selectedIds,
  handleToggleSelectItem,
  editingJob,
  setEditingJob,
  calculateJobScore,
  isInspectorOpen,
  setIsInspectorOpen,
  activeEditorTab,
  setActiveEditorTab,
}) => {
  const handleCreateNewJob = () => {
    const newJob: CustomJobItem = {
      id: `job_${Date.now()}`,
      title_ar: "وظيفة عمل حر جديدة بالدولار",
      title_en: "New Remote USD Job",
      company: "Global Tech Inc.",
      category: "tech",
      type: "remote_freelance",
      salary: "$2,000 - $3,500",
      apply_url: "https://example.com",
      description_ar: "تفاصيل العمل والمهام المطلوبة والراتب بالدولار.",
      description_en: "Job details and qualifications.",
      skills: ["React", "TypeScript", "UI/UX"],
      benefits_ar: ["دخل بالدولار", "ساعات عمل مرنة"],
    };
    setEditingJob(newJob);
    setMobileViewPane("detail");
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
      {/* Pane 2: List Pane */}
      <div
        className={`h-full flex flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
          deviceSimulator === "phone" && mobileViewPane === "detail"
            ? "hidden"
            : "lg:col-span-4 xl:col-span-4 flex"
        }`}
      >
        {/* List Header */}
        <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white">
              {t("adminActiveJobsCount").replace("{count}", String(filteredJobs.length))}
            </span>
          </div>
          {adminAuthStore.canUserPerform(currentUser, "create") && (
            <button
              onClick={handleCreateNewJob}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-gold hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRtl ? "إضافة وظيفة" : "New"}</span>
            </button>
          )}
        </div>

        {/* Scrollable List Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-primary/20">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 p-4 rounded-xl bg-card/40 border border-primary/20">
              <Briefcase className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-300 font-bold">{t("adminNoJobs")}</p>
            </div>
          ) : (
            filteredJobs.map((j, idx) => {
              const isSelected = selectedIds.includes(j.id);
              const isActiveEdit = editingJob?.id === j.id;
              const scoreData = calculateJobScore(j);

              return (
                <div
                  key={j.id}
                  onClick={() => {
                    setEditingJob(j);
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
                          handleToggleSelectItem(j.id, idx, e);
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
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                          {isRtl ? j.title_ar : j.title_en || j.title_ar}
                        </h4>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {j.company} • <span className="text-emerald-400 font-bold">{j.salary || "$ USD"}</span>
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

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-primary/10 text-gray-400">
                    <span className="text-primary font-medium">{j.category}</span>
                    <span className="text-gray-400 text-[10px]">
                      {j.type === "remote_freelance" ? (isRtl ? "عن بُعد / حر" : "Remote Freelance") : j.type}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pane 3: Detail Workspace Pane */}
      <div
        className={`h-full flex flex-col bg-card/75 border border-primary/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          !editingJob
            ? "hidden lg:flex lg:col-span-8 xl:col-span-8"
            : deviceSimulator === "phone" && mobileViewPane === "list"
            ? "hidden"
            : isInspectorOpen
            ? "lg:col-span-8 xl:col-span-5 flex"
            : "lg:col-span-8 xl:col-span-8 flex"
        }`}
      >
        {editingJob ? (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Workspace Header with Tabs & Actions */}
            <div className="p-3 border-b border-primary/20 bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                {deviceSimulator === "phone" && (
                  <button
                    onClick={() => setMobileViewPane("list")}
                    className="p-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    <span>{isRtl ? "القائمة" : "List"}</span>
                  </button>
                )}
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                    {isRtl ? editingJob.title_ar : editingJob.title_en || editingJob.title_ar}
                  </h3>
                  <p className="text-[10px] text-gray-400">{editingJob.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingJob(null)}
                  className="h-8 px-2.5 rounded-xl text-xs cursor-pointer text-gray-300 hover:text-white"
                >
                  {isRtl ? "إغلاق" : "Close"}
                </Button>
                <Button
                  variant="luxe"
                  size="sm"
                  onClick={() => {
                    dynamicStore.saveJob(editingJob);
                    toast.success(isRtl ? "تم حفظ وتحديث بيانات الوظيفة بنجاح" : "Job saved successfully");
                  }}
                  className="h-8 px-3 rounded-xl text-xs font-bold shadow-gold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 me-1" />
                  {t("adminSavePublish")}
                </Button>
              </div>
            </div>

            {/* Editor Tabs */}
            <div className="flex items-center gap-1 p-2 bg-background/50 border-b border-primary/15 overflow-x-auto flex-shrink-0">
              {[
                { id: "info", labelAr: "بيانات الوظيفة", labelEn: "Job Info" },
                { id: "financials", labelAr: "الراتب والمزايا", labelEn: "Salary & Benefits" },
                { id: "eligibility", labelAr: "المهام والمهارات", labelEn: "Skills & Tasks" },
                { id: "urls", labelAr: "روابط التقديم", labelEn: "Apply URLs" },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setActiveEditorTab(tb.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeEditorTab === tb.id
                      ? "bg-primary text-primary-foreground shadow-gold"
                      : "text-gray-400 hover:text-white hover:bg-primary/10"
                  }`}
                >
                  {isRtl ? tb.labelAr : tb.labelEn}
                </button>
              ))}
            </div>

            {/* Editor Form Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20" dir={dir}>
              {activeEditorTab === "info" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      {t("adminJobTitleAr")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingJob.title_ar}
                      onChange={(e) => setEditingJob({ ...editingJob, title_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      {t("adminJobTitleEn")}
                    </label>
                    <input
                      type="text"
                      value={editingJob.title_en || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, title_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        {t("adminCompany")}
                      </label>
                      <input
                        type="text"
                        value={editingJob.company}
                        onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                        dir={dir}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        {t("adminSalaryUsd")}
                      </label>
                      <input
                        type="text"
                        value={editingJob.salary || ""}
                        onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                        placeholder="$2,500 - $4,500 / month"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeEditorTab === "financials" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      {isRtl ? "مزايا العمل والدخل بالدولار" : "Benefits (one per line)"}
                    </label>
                    <textarea
                      rows={4}
                      value={
                        Array.isArray(editingJob.benefits_ar)
                          ? editingJob.benefits_ar.join("\n")
                          : ""
                      }
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          benefits_ar: e.target.value.split("\n").filter((b) => b.trim()),
                        })
                      }
                      placeholder={isRtl ? "راتب شهري محول مباشرة بالدولار\nساعات عمل مرنة بالكامل\nمكافآت إنجاز ومشاريع مستمرة" : "USD Monthly payout\nFlexible hours"}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      {isRtl ? "وصف الوظيفة والمهام" : "Job Description"}
                    </label>
                    <textarea
                      rows={4}
                      value={editingJob.description_ar || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, description_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                      dir={dir}
                    />
                  </div>
                </div>
              )}

              {activeEditorTab === "eligibility" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      {isRtl ? "المهارات المطلوبة (مفصولة بفواصل)" : "Required Skills"}
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(editingJob.skills) ? editingJob.skills.join(", ") : ""}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          skills: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      placeholder="React, TypeScript, Figma, English B2"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {activeEditorTab === "urls" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      {t("adminApplyUrl")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="url"
                      value={editingJob.apply_url || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, apply_url: e.target.value })}
                      placeholder="https://upwork.com/jobs/..."
                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
              <Briefcase className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              {isRtl ? "مساحة تحرير وظائف العمل الحر بالدولار" : "USD Jobs Detail Workspace"}
            </h4>
            <p className="text-xs text-gray-400 max-w-sm mb-4">
              {isRtl
                ? "اختر وظيفة من القائمة لتعديلها فوريًا أو اضغط على الزر لإنشاء فرصة عمل جديدة."
                : "Select a job from the list to edit live, or create a new one."}
            </p>
            {adminAuthStore.canUserPerform(currentUser, "create") && (
              <Button
                variant="luxe"
                size="sm"
                onClick={handleCreateNewJob}
                className="font-bold shadow-gold cursor-pointer"
              >
                <Plus className="w-4 h-4 me-1" />
                <span>{t("adminAddJob")}</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pane 4: Context / AI Inspector Pane */}
      {isInspectorOpen && (
        <div className="hidden xl:flex xl:col-span-3 h-full flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white">
                {isRtl ? "مستشار وفاحص الوظيفة" : "Job Quality Inspector"}
              </span>
            </div>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20 text-xs">
            {/* AI Quality Gauge */}
            {(() => {
              const scoreData = calculateJobScore(editingJob);
              return (
                <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300">
                      {isRtl ? "جودة واكتمال البيانات" : "Data Quality Score"}
                    </span>
                    <span className="font-extrabold text-sky-400 text-sm">
                      {scoreData.score}% ({scoreData.grade})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-card overflow-hidden border border-primary/20">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        scoreData.score >= 85
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : scoreData.score >= 60
                          ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${scoreData.score}%` }}
                    />
                  </div>
                  {scoreData.missing.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] text-gray-400 block mb-1">
                        {isRtl ? "حقول يُوصى باستكمالها:" : "Recommended to fill:"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {scoreData.missing.map((m, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] font-bold"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Live Student Job Card Preview */}
            <div className="space-y-1.5">
              <span className="font-bold text-gray-300 block text-[11px]">
                {isRtl ? "معاينة بطاقة الوظيفة الحية:" : "Live Job Card Preview:"}
              </span>
              <div className="p-3 rounded-xl bg-background border border-primary/30 shadow-inner space-y-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{editingJob?.company || "Company"}</span>
                  <span className="text-emerald-400 font-bold">
                    {editingJob?.salary || "$ USD"}
                  </span>
                </div>
                <h5 className="font-bold text-white text-xs line-clamp-2">
                  {isRtl ? editingJob?.title_ar || "المسمى الوظيفي" : editingJob?.title_en || editingJob?.title_ar || "Job Title"}
                </h5>
                <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {editingJob?.category || "Tech"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold text-[9px]">
                    {isRtl ? "تقديم سريع" : "Apply"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick URL Validator */}
            <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
              <span className="font-bold text-gray-300 block text-[11px]">
                {isRtl ? "إجراءات سريعة وفحص الروابط" : "Quick Actions"}
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    if (editingJob?.apply_url) {
                      window.open(editingJob.apply_url, "_blank");
                    } else {
                      toast.error(isRtl ? "لا يوجد رابط تقديم" : "No apply URL");
                    }
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-sky-500/10 border border-sky-500/25 hover:bg-sky-500/20 text-sky-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isRtl ? "فحص رابط التقديم" : "Test Apply URL"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
