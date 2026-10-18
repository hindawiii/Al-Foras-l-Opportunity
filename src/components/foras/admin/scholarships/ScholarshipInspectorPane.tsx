import React from "react";
import { Sparkles, X, ExternalLink, Copy } from "lucide-react";
import { Scholarship } from "@/lib/mockData";
import { toast } from "sonner";

interface ScholarshipInspectorPaneProps {
  isRtl: boolean;
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  editingScholarship: Scholarship | null;
  calculateScholarshipScore: (s: any) => { score: number; grade: string; missing: string[] };
}

export const ScholarshipInspectorPane: React.FC<ScholarshipInspectorPaneProps> = ({
  isRtl,
  isInspectorOpen,
  setIsInspectorOpen,
  editingScholarship,
  calculateScholarshipScore,
}) => {
  if (!isInspectorOpen) return null;

  const scoreData = calculateScholarshipScore(editingScholarship);

  return (
    <div className="hidden xl:flex xl:col-span-3 h-full flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-white">
            {isRtl ? "مستشار وفاحص المنحة" : "Context & Quality Inspector"}
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
        {/* AI Quality Completeness Gauge */}
        <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-300">
              {isRtl ? "جودة واكتمال البيانات" : "Data Quality Score"}
            </span>
            <span className="font-extrabold text-primary text-sm">
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
                    className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Student Mobile Card Preview */}
        <div className="space-y-1.5">
          <span className="font-bold text-gray-300 block text-[11px]">
            {isRtl ? "معاينة بطاقة الطالب الحية:" : "Live Student Card Preview:"}
          </span>
          <div className="p-3 rounded-xl bg-background border border-primary/30 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>{editingScholarship?.country || (isRtl ? "الدولة" : "Country")}</span>
              <span className="text-amber-300 font-bold">
                {editingScholarship?.coverage === "full" ? (isRtl ? "ممولة بالكامل" : "Full") : "Partial"}
              </span>
            </div>
            <h5 className="font-bold text-white text-xs line-clamp-2">
              {isRtl
                ? (editingScholarship as any)?.title_ar || editingScholarship?.title || "عنوان المنحة"
                : (editingScholarship as any)?.title_en || editingScholarship?.title || "Scholarship Title"}
            </h5>
            <p className="text-[10px] text-gray-400 line-clamp-1">
              {editingScholarship?.university || (isRtl ? "الجامعة الرسمية" : "Official University")}
            </p>
            <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                {editingScholarship?.deadline || (isRtl ? "الموعد النهائي" : "Deadline")}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold text-[9px]">
                {isRtl ? "تفاصيل المنحة" : "View"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick URL Validator & Actions */}
        <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
          <span className="font-bold text-gray-300 block text-[11px]">
            {isRtl ? "إجراءات سريعة وفحص الروابط" : "Quick Actions"}
          </span>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                if (editingScholarship?.apply_url) {
                  window.open(editingScholarship.apply_url, "_blank");
                } else {
                  toast.error(isRtl ? "لا يوجد رابط تقديم" : "No apply URL");
                }
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isRtl ? "فحص رابط التقديم" : "Test Apply URL"}</span>
            </button>
            <button
              onClick={() => {
                if (editingScholarship) {
                  navigator.clipboard.writeText(JSON.stringify(editingScholarship, null, 2));
                  toast.success(isRtl ? "تم نسخ بيانات المنحة كـ JSON" : "Copied JSON");
                }
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-card border border-primary/25 hover:bg-primary/10 text-gray-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isRtl ? "نسخ البيانات (JSON)" : "Copy JSON"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
