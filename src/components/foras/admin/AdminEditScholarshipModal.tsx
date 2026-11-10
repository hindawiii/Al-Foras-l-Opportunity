import React from "react";
import { GraduationCap, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Scholarship } from "@/lib/mockData";

interface AdminEditScholarshipModalProps {
  editingScholarship: Scholarship | null;
  setEditingScholarship: React.Dispatch<React.SetStateAction<Scholarship | null>>;
  onSave: (scholarship: Scholarship) => void;
  onClose: () => void;
  isRtl: boolean;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
}

export const AdminEditScholarshipModal: React.FC<AdminEditScholarshipModalProps> = ({
  editingScholarship,
  setEditingScholarship,
  onSave,
  onClose,
  isRtl,
  dir,
  t,
}) => {
  if (!editingScholarship) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-3xl max-h-[90vh] p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4 my-auto overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30"
        dir={dir}
      >
        <div className="flex items-center justify-between border-b border-primary/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">{t("adminEditScholarshipTitle")}</h4>
              <p className="text-[11px] text-gray-400">{t("adminEditScholarshipDesc")}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-gray-200 mb-1">
              {t("adminTitleAr")} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={(editingScholarship as any).title_ar || editingScholarship.title}
              onChange={e =>
                setEditingScholarship({
                  ...editingScholarship,
                  title: e.target.value,
                  title_ar: e.target.value,
                } as any)
              }
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminTitleEn")}</label>
            <input
              type="text"
              value={(editingScholarship as any).title_en || (editingScholarship as any).titleEn || ""}
              onChange={e =>
                setEditingScholarship({
                  ...editingScholarship,
                  title_en: e.target.value,
                  titleEn: e.target.value,
                } as any)
              }
              placeholder="e.g. Fully Funded Oxford Scholarship"
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminCountryUniversity")}</label>
            <input
              type="text"
              value={editingScholarship.country}
              onChange={e => setEditingScholarship({ ...editingScholarship, country: e.target.value })}
              placeholder={isRtl ? "بريطانيا - جامعة أكسفورد" : "UK - Oxford University"}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir={dir}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminDegreeLevel")}</label>
            <select
              value={editingScholarship.degree || "all"}
              onChange={e => setEditingScholarship({ ...editingScholarship, degree: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
            >
              <option value="bachelor">{isRtl ? "بكالوريوس" : "Bachelor's"}</option>
              <option value="master">{isRtl ? "ماجستير" : "Master's"}</option>
              <option value="phd">{isRtl ? "دكتوراه / أبحاث" : "PhD / Research"}</option>
              <option value="bachelor_master">{isRtl ? "بكالوريوس + ماجستير" : "Bachelor + Master"}</option>
              <option value="all">{isRtl ? "كافة المراحل (شامل)" : "All Levels"}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminFundingCoverage")}</label>
            <select
              value={editingScholarship.coverage || "full"}
              onChange={e => setEditingScholarship({ ...editingScholarship, coverage: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
            >
              <option value="full">{isRtl ? "ممولة بالكامل (رسوم + راتب + سكن + طيران)" : "Fully Funded"}</option>
              <option value="partial">{isRtl ? "تمويل جزئي (رسوم دراسية فقط)" : "Partial Funded"}</option>
              <option value="tuition_only">{isRtl ? "إعفاء من الرسوم" : "Tuition Waiver Only"}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminDeadline")}</label>
            <input
              type="date"
              value={editingScholarship.deadline}
              onChange={e => setEditingScholarship({ ...editingScholarship, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminApplyUrl")}</label>
            <input
              type="url"
              value={editingScholarship.apply_url}
              onChange={e => setEditingScholarship({ ...editingScholarship, apply_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminLanguageReq")}</label>
            <input
              type="text"
              value={(editingScholarship as any).language_req || ""}
              onChange={e =>
                setEditingScholarship({ ...editingScholarship, language_req: e.target.value } as any)
              }
              placeholder={isRtl ? "مثال: IELTS 6.5 أو بدون شرط لغة" : "e.g. IELTS 6.5 or No Language Req"}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir={dir}
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-200 mb-1">{t("adminDescriptionBenefits")}</label>
          <textarea
            rows={3}
            value={(editingScholarship as any).description_ar || editingScholarship.description}
            onChange={e =>
              setEditingScholarship({
                ...editingScholarship,
                description: e.target.value,
                description_ar: e.target.value,
              } as any)
            }
            className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary text-xs sm:text-sm"
            dir={dir}
          />
        </div>

        {/* Dynamic Custom Fields Builder */}
        <div className="p-4 rounded-2xl bg-card/60 border border-primary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-bold text-white">{t("adminCustomFieldsTitle")}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentFields = (editingScholarship as any).custom_fields || [];
                setEditingScholarship({
                  ...editingScholarship,
                  custom_fields: [...currentFields, { label: "", value: "" }],
                } as any);
              }}
              className="text-xs border-primary/40 text-primary cursor-pointer hover:bg-primary/10"
            >
              <Plus className="w-3.5 h-3.5 mx-1" />
              <span>{t("adminAddField")}</span>
            </Button>
          </div>

          {((editingScholarship as any).custom_fields || []).map((f: any, fIdx: number) => (
            <div key={fIdx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isRtl ? "اسم الحقل (مثال: شروط السن)" : "Field Label"}
                value={f.label}
                onChange={e => {
                  const updated = [...((editingScholarship as any).custom_fields || [])];
                  updated[fIdx].label = e.target.value;
                  setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                }}
                className="w-1/3 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                dir={dir}
              />
              <input
                type="text"
                placeholder={isRtl ? "القيمة أو الملاحظة المطلوبة" : "Field Value"}
                value={f.value}
                onChange={e => {
                  const updated = [...((editingScholarship as any).custom_fields || [])];
                  updated[fIdx].value = e.target.value;
                  setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                dir={dir}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = ((editingScholarship as any).custom_fields || []).filter(
                    (_: any, i: number) => i !== fIdx
                  );
                  setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                }}
                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-primary/20">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            {t("adminCancel")}
          </Button>
          <Button
            variant="luxe"
            size="sm"
            onClick={() => onSave(editingScholarship)}
            className="font-bold shadow-gold cursor-pointer"
          >
            {t("adminSavePublish")}
          </Button>
        </div>
      </div>
    </div>
  );
};
