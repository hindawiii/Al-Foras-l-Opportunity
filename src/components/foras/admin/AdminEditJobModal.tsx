import React from "react";
import { Briefcase, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomJobItem } from "@/lib/dynamicStore";

interface AdminEditJobModalProps {
  editingJob: CustomJobItem | null;
  setEditingJob: React.Dispatch<React.SetStateAction<CustomJobItem | null>>;
  onSave: (job: CustomJobItem) => void;
  onClose: () => void;
  isRtl: boolean;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
}

export const AdminEditJobModal: React.FC<AdminEditJobModalProps> = ({
  editingJob,
  setEditingJob,
  onSave,
  onClose,
  isRtl,
  dir,
  t,
}) => {
  if (!editingJob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-3xl max-h-[90vh] p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4 my-auto overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30"
        dir={dir}
      >
        <div className="flex items-center justify-between border-b border-primary/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">{t("adminEditJobTitle")}</h4>
              <p className="text-[11px] text-gray-400">{t("adminEditJobDesc")}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-gray-200 mb-1">
              {t("adminJobTitleAr")} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={editingJob.title_ar}
              onChange={e => setEditingJob({ ...editingJob, title_ar: e.target.value })}
              placeholder="مطور واجهات ومواقع عن بُعد"
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminJobTitleEn")}</label>
            <input
              type="text"
              value={editingJob.title_en || ""}
              onChange={e => setEditingJob({ ...editingJob, title_en: e.target.value })}
              placeholder="Remote Frontend Engineer"
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminCompany")}</label>
            <input
              type="text"
              value={editingJob.company}
              onChange={e => setEditingJob({ ...editingJob, company: e.target.value })}
              placeholder="Upwork / Toptal / Global Remote"
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir={dir}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminSalaryUsd")}</label>
            <input
              type="text"
              value={editingJob.salary || ""}
              onChange={e => setEditingJob({ ...editingJob, salary: e.target.value })}
              placeholder="$2,500 - $4,500 / month"
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminJobType")}</label>
            <select
              value={editingJob.type || "remote_freelance"}
              onChange={e => setEditingJob({ ...editingJob, type: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
            >
              <option value="remote_freelance">{isRtl ? "عن بُعد بالكامل (Remote Freelance)" : "100% Remote Freelance"}</option>
              <option value="full_time">{isRtl ? "دوام كامل عن بُعد (Full-Time Remote)" : "Full-Time Remote"}</option>
              <option value="part_time">{isRtl ? "دوام جزئي مرن (Part-Time)" : "Part-Time Flexible"}</option>
              <option value="contract">{isRtl ? "عقد مشروع محدد (Project Contract)" : "Project Contract"}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminPayoutMethod")}</label>
            <input
              type="text"
              value={(editingJob as any).payout_method || ""}
              onChange={e => setEditingJob({ ...editingJob, payout_method: e.target.value } as any)}
              placeholder={isRtl ? "بايبال، بايونير، تحويل بنكي دولي" : "PayPal, Payoneer, Wire Transfer"}
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir={dir}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminApplyUrl")}</label>
            <input
              type="url"
              value={editingJob.apply_url}
              onChange={e => setEditingJob({ ...editingJob, apply_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-200 mb-1">{t("adminSkillsReq")}</label>
            <input
              type="text"
              value={(editingJob.skills || []).join(", ")}
              onChange={e =>
                setEditingJob({
                  ...editingJob,
                  skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                })
              }
              placeholder="React, English B2, Node.js"
              className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-200 mb-1">{t("adminJobDescription")}</label>
          <textarea
            rows={3}
            value={editingJob.description_ar}
            onChange={e => setEditingJob({ ...editingJob, description_ar: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary text-xs sm:text-sm"
            dir={dir}
          />
        </div>

        {/* Dynamic Custom Fields Builder for Jobs */}
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
                const currentFields = (editingJob as any).custom_fields || [];
                setEditingJob({
                  ...editingJob,
                  custom_fields: [...currentFields, { label: "", value: "" }],
                } as any);
              }}
              className="text-xs border-primary/40 text-primary cursor-pointer hover:bg-primary/10"
            >
              <Plus className="w-3.5 h-3.5 mx-1" />
              <span>{t("adminAddField")}</span>
            </Button>
          </div>

          {((editingJob as any).custom_fields || []).map((f: any, fIdx: number) => (
            <div key={fIdx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isRtl ? "اسم الحقل (مثال: عدد ساعات العمل)" : "Field Label"}
                value={f.label}
                onChange={e => {
                  const updated = [...((editingJob as any).custom_fields || [])];
                  updated[fIdx].label = e.target.value;
                  setEditingJob({ ...editingJob, custom_fields: updated } as any);
                }}
                className="w-1/3 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                dir={dir}
              />
              <input
                type="text"
                placeholder={isRtl ? "القيمة أو الملاحظة المطلوبة" : "Field Value"}
                value={f.value}
                onChange={e => {
                  const updated = [...((editingJob as any).custom_fields || [])];
                  updated[fIdx].value = e.target.value;
                  setEditingJob({ ...editingJob, custom_fields: updated } as any);
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                dir={dir}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = ((editingJob as any).custom_fields || []).filter(
                    (_: any, i: number) => i !== fIdx
                  );
                  setEditingJob({ ...editingJob, custom_fields: updated } as any);
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
            onClick={() => onSave(editingJob)}
            className="font-bold shadow-gold cursor-pointer"
          >
            {t("adminSavePublish")}
          </Button>
        </div>
      </div>
    </div>
  );
};
