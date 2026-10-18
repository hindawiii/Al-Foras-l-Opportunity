import React from "react";
import {
  Edit3,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scholarship } from "@/lib/mockData";
import { dynamicStore } from "@/lib/dynamicStore";
import { ScholarshipDuplicateBanner } from "@/components/foras/ScholarshipDuplicateGuard";
import { toast } from "sonner";

interface ScholarshipEditorPaneProps {
  isRtl: boolean;
  dir: string;
  t: (key: string) => string;
  deviceSimulator: "desktop" | "tablet" | "phone";
  mobileViewPane: "list" | "detail";
  setMobileViewPane: (pane: "list" | "detail") => void;
  isInspectorOpen: boolean;
  editingScholarship: Scholarship | null;
  setEditingScholarship: React.Dispatch<React.SetStateAction<Scholarship | null>>;
  scholarshipDuplicateResult: any;
  duplicateOverriddenId: string | null;
  setDuplicateOverriddenId: (id: string | null) => void;
  activeEditorTab: "basic" | "financial" | "eligibility" | "custom" | "urls";
  setActiveEditorTab: (tab: any) => void;
  scholarships: Scholarship[];
  scholarshipCategoryCounts: { full: number; expired: number; [key: string]: number };
}

export const ScholarshipEditorPane: React.FC<ScholarshipEditorPaneProps> = ({
  isRtl,
  dir,
  t,
  deviceSimulator,
  mobileViewPane,
  setMobileViewPane,
  isInspectorOpen,
  editingScholarship,
  setEditingScholarship,
  scholarshipDuplicateResult,
  duplicateOverriddenId,
  setDuplicateOverriddenId,
  activeEditorTab,
  setActiveEditorTab,
  scholarships,
  scholarshipCategoryCounts,
}) => {
  return (
    <div
  className={`h-full flex flex-col bg-card/75 border border-primary/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
    !editingScholarship
      ? "hidden lg:flex lg:col-span-8 xl:col-span-8"
      : (deviceSimulator === "phone" || mobileViewPane === "list")
      ? "hidden lg:flex lg:col-span-8 xl:col-span-8"
      : isInspectorOpen
      ? "lg:col-span-8 xl:col-span-5 flex"
      : "lg:col-span-8 xl:col-span-8 flex"
  }`}
>
  {editingScholarship ? (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Workspace Header with Tabs & Actions */}
      <div className="p-3 border-b border-primary/20 bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          {(deviceSimulator === "phone" || mobileViewPane === "detail") && (
            <button
              onClick={() => setMobileViewPane("list")}
              className="lg:hidden p-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title={isRtl ? "العودة للقائمة" : "Back to list"}
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isRtl ? "القائمة" : "List"}</span>
            </button>
          )}
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
              {isRtl ? editingScholarship.title || (editingScholarship as any).title_ar : (editingScholarship as any).title_en || editingScholarship.title}
            </h3>
            <p className="text-[10px] text-gray-400">
              {editingScholarship.id}
            </p>
          </div>
        </div>

        {/* Actions & Tab Switchers */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingScholarship(null)}
            className="h-8 px-2.5 rounded-xl text-xs cursor-pointer text-gray-300 hover:text-white"
          >
            {isRtl ? "إغلاق" : "Close"}
          </Button>
          <Button
            variant="luxe"
            size="sm"
            onClick={() => {
              if (scholarshipDuplicateResult.isDuplicate && duplicateOverriddenId !== editingScholarship.id) {
                toast.error(
                  isRtl
                    ? `⚠️ تنبيه النزاهة: تم رصد منحة مطابقة مسبقاً (${scholarshipDuplicateResult.matchedItem?.title})! اضغط "تجاوز" في صندوق التنبيه لتأكيد الحفظ كمنحة منفصلة.`
                    : `⚠️ Duplicate detected! Click "Ignore" on the alert to save as separate.`
                );
                return;
              }
              dynamicStore.saveScholarship(editingScholarship);
              toast.success(isRtl ? "تم الحفظ والنشر الفوري بنجاح" : "Saved & Published successfully");
            }}
            className="h-8 px-3 rounded-xl text-xs font-bold shadow-gold cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 me-1" />
            {t("adminSavePublish")}
          </Button>
        </div>
      </div>

      {/* Editor Tabs Navigation (Pane 3 Tabs) */}
      <div className="flex items-center gap-1 p-2 bg-background/50 border-b border-primary/15 overflow-x-auto flex-shrink-0">
        {[
          { id: "info", labelAr: "البيانات الأساسية", labelEn: "Basic Info" },
          { id: "financials", labelAr: "التمويل والمزايا", labelEn: "Financials & Benefits" },
          { id: "eligibility", labelAr: "الشروط والمواعيد", labelEn: "Eligibility & Dates" },
          { id: "custom_fields", labelAr: "حقول مخصصة", labelEn: "Custom Fields" },
          { id: "urls", labelAr: "روابط التقديم", labelEn: "Application Links" },
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

      {/* Editor Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20" dir={dir}>
        {/* Live Integrity & Duplicate Guard Banner */}
        <ScholarshipDuplicateBanner
          checkResult={scholarshipDuplicateResult}
          isRtl={isRtl}
          onSelectExisting={(matched) => {
            setEditingScholarship(matched);
            setDuplicateOverriddenId(null);
            toast.info(isRtl ? `تم الانتقال للمنحة المسجلة: "${matched.title}"` : `Switched to registered scholarship: "${matched.title}"`);
          }}
          onDismissOverride={() => {
            setDuplicateOverriddenId(editingScholarship.id);
            toast.warning(isRtl ? "تم تفعيل خيار التجاوز: يمكنك الحفظ كمنحة منفصلة الآن" : "Duplicate override enabled: You can save as separate listing");
          }}
          isOverridden={duplicateOverriddenId === editingScholarship.id}
        />

        {activeEditorTab === "info" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {t("adminSchTitleAr")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={(editingScholarship as any).title_ar || editingScholarship.title || ""}
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    title: e.target.value,
                    title_ar: e.target.value,
                  } as any)
                }
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {t("adminSchTitleEn")}
              </label>
              <input
                type="text"
                value={(editingScholarship as any).title_en || (editingScholarship as any).titleEn || ""}
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    title_en: e.target.value,
                    titleEn: e.target.value,
                  } as any)
                }
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  {t("adminUniversity")}
                </label>
                <input
                  type="text"
                  value={editingScholarship.university || editingScholarship.org || ""}
                  onChange={(e) =>
                    setEditingScholarship({
                      ...editingScholarship,
                      university: e.target.value,
                      org: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                  dir={dir}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  {t("adminCountry")}
                </label>
                <input
                  type="text"
                  value={editingScholarship.country || ""}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    const isArab = isArabCountry(newCountry, (editingScholarship as any).title_ar || editingScholarship.title);
                    setEditingScholarship({
                      ...editingScholarship,
                      country: newCountry,
                      category: isArab ? "arab" : "global",
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                  dir={dir}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  {isRtl ? "تصنيف المنحة" : "Category"}
                </label>
                <select
                  value={editingScholarship.category || "global"}
                  onChange={(e) =>
                    setEditingScholarship({
                      ...editingScholarship,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                >
                  <option value="global">{isRtl ? "🌐 منحة دولية / عالمية" : "Global Scholarship"}</option>
                  <option value="arab">{isRtl ? "🏛️ منحة عربية / إقليمية" : "Arab Scholarship"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  {t("adminDegree")}
                </label>
                <select
                  value={editingScholarship.degree || "bachelor_master"}
                  onChange={(e) =>
                    setEditingScholarship({
                      ...editingScholarship,
                      degree: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                >
                  <option value="bachelor">{isRtl ? "بكالوريوس" : "Bachelor"}</option>
                  <option value="master">{isRtl ? "ماجستير" : "Master"}</option>
                  <option value="phd">{isRtl ? "دكتوراه" : "PhD"}</option>
                  <option value="bachelor_master">{isRtl ? "بكالوريوس + ماجستير" : "Bachelor + Master"}</option>
                  <option value="all">{isRtl ? "جميع المراحل الأكاديمية" : "All Degrees"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  {t("adminCoverage")}
                </label>
                <select
                  value={editingScholarship.coverage || "full"}
                  onChange={(e) =>
                    setEditingScholarship({
                      ...editingScholarship,
                      coverage: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                >
                  <option value="full">{isRtl ? "ممولة بالكامل (شاملة السكن والتذاكر)" : "Fully Funded"}</option>
                  <option value="partial">{isRtl ? "تمويل جزئي (رسوم دراسية فقط)" : "Partial"}</option>
                  <option value="tuition_only">{isRtl ? "إعفاء من الرسوم" : "Tuition Only"}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeEditorTab === "financials" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {isRtl ? "تفاصيل التمويل والمزايا المالية (بالعربية)" : "Benefits in Arabic (one per line)"}
              </label>
              <textarea
                rows={4}
                value={
                  Array.isArray((editingScholarship as any).benefits_ar)
                    ? (editingScholarship as any).benefits_ar.join("\n")
                    : ""
                }
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    benefits_ar: e.target.value.split("\n").filter((b) => b.trim()),
                  } as any)
                }
                placeholder={isRtl ? "إعفاء كامل من المصروفات الدراسية\nراتب شهري بقيمة 1200 يورو\nتذاكر طيران ذهاب وإياب\nسكن جامعي وتأمين صحي شامل" : "Full tuition waiver\nMonthly stipend\nRoundtrip airfare"}
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {isRtl ? "الوصف التفصيلي للمنحة" : "Detailed Description"}
              </label>
              <textarea
                rows={4}
                value={(editingScholarship as any).description_ar || editingScholarship.description || ""}
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    description_ar: e.target.value,
                    description: e.target.value,
                  } as any)
                }
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
                {t("adminDeadline")}
              </label>
              <input
                type="date"
                value={editingScholarship.deadline || ""}
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    deadline: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {isRtl ? "التخصصات المتاحة (مفصولة بفواصل)" : "Majors (comma separated)"}
              </label>
              <input
                type="text"
                value={
                  Array.isArray(editingScholarship.majors)
                    ? editingScholarship.majors.join(", ")
                    : ""
                }
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    majors: e.target.value.split(",").map((m) => m.trim()),
                  })
                }
                placeholder={isRtl ? "الهندسة, الطب, علوم الحاسوب, إدارة الأعمال" : "Engineering, Medicine, Computer Science"}
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                dir={dir}
              />
            </div>
          </div>
        )}

        {activeEditorTab === "custom_fields" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">
                {isRtl ? "الحقول الإضافية المخصصة" : "Dynamic Custom Fields"}
              </span>
              <button
                type="button"
                onClick={() => {
                  const existing = (editingScholarship as any).custom_fields || [];
                  setEditingScholarship({
                    ...editingScholarship,
                    custom_fields: [...existing, { label: "", value: "" }],
                  } as any);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isRtl ? "+ إضافة حقل" : "+ Add Field"}</span>
              </button>
            </div>

            {(((editingScholarship as any).custom_fields) || []).map((f: any, fIdx: number) => (
              <div key={fIdx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isRtl ? "اسم الحقل (مثل: شرط اللغة)" : "Field Label"}
                  value={f.label}
                  onChange={(e) => {
                    const updated = [...((editingScholarship as any).custom_fields || [])];
                    updated[fIdx].label = e.target.value;
                    setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                  }}
                  className="w-1/3 px-2.5 py-1.5 rounded-lg bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder={isRtl ? "القيمة أو الملاحظة" : "Value"}
                  value={f.value}
                  onChange={(e) => {
                    const updated = [...((editingScholarship as any).custom_fields || [])];
                    updated[fIdx].value = e.target.value;
                    setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = ((editingScholarship as any).custom_fields || []).filter((_: any, i: number) => i !== fIdx);
                    setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                  }}
                  className="p-1 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
                value={editingScholarship.apply_url || ""}
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    apply_url: e.target.value,
                  })
                }
                placeholder="https://apply.university.edu/admission"
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                {t("adminOfficialWebsite")}
              </label>
              <input
                type="url"
                value={editingScholarship.official_website || ""}
                onChange={(e) =>
                  setEditingScholarship({
                    ...editingScholarship,
                    official_website: e.target.value,
                  })
                }
                placeholder="https://university.edu"
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                dir="ltr"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    /* Empty State in Workspace: Overview & Analytics (Desktop only, never cluttered on mobile) */
    <div className="h-full hidden lg:flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-3 shadow-inner">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-white mb-1">
        {isRtl ? "مساحة تحرير وتنسيق المنح الدراسية" : "Scholarship Detail Workspace"}
      </h4>
      <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
        {isRtl
          ? "اختر أي منحة من القائمة الجانبية لتعديل بياناتها فوريًا، أو استخدم زر [+ إضافة منحة] الموجود في أعلى القائمة لإنشاء منحة جديدة."
          : "Select any scholarship from the list to edit its details, or use the [+ New] button at the top to create one."}
      </p>

      {/* Luxe Pro Mini Analytics Badges - Single point of action */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        <div className="p-2.5 rounded-xl bg-card border border-primary/20 flex flex-col items-center">
          <span className="text-[11px] text-gray-400 font-medium">{isRtl ? "الإجمالي" : "Total"}</span>
          <span className="text-sm font-black text-white mt-0.5">{scholarships.length}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-card border border-emerald-500/25 flex flex-col items-center">
          <span className="text-[11px] text-emerald-400 font-medium">{isRtl ? "كامل" : "Full"}</span>
          <span className="text-sm font-black text-emerald-300 mt-0.5">{scholarshipCategoryCounts.full}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-card border border-red-500/25 flex flex-col items-center">
          <span className="text-[11px] text-red-400 font-medium">{isRtl ? "منتهية" : "Expired"}</span>
          <span className="text-sm font-black text-red-300 mt-0.5">{scholarshipCategoryCounts.expired}</span>
        </div>
      </div>
    </div>
  )}
</div>

  );
};
