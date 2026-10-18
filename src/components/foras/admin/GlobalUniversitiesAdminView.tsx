import { useMemo } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GLOBAL_COUNTRIES } from "@/lib/globalUniversities";
import { Scholarship } from "@/lib/mockData";
import { toast } from "sonner";

interface Props {
  isRtl: boolean;
  searchQuery: string;
  onSelectScholarshipDraft: (draft: Partial<Scholarship>) => void;
}

export const GlobalUniversitiesAdminView = ({
  isRtl,
  searchQuery,
  onSelectScholarshipDraft,
}: Props) => {
  const filteredGlobalCountries = useMemo(() => {
    return GLOBAL_COUNTRIES.filter((gc) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        gc.country.toLowerCase().includes(q) ||
        gc.countryEn.toLowerCase().includes(q) ||
        gc.scholarshipName.toLowerCase().includes(q) ||
        (gc.scholarshipNameEn && gc.scholarshipNameEn.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  return (
    <div className="flex-1 h-full overflow-y-auto space-y-4 pb-32 px-1 scrollbar-thin scrollbar-thumb-primary/20 overscroll-contain touch-pan-y">
      <div className="flex items-center justify-between text-xs text-gray-300 mb-1 flex-wrap gap-2">
        <span className="font-bold text-white">
          {isRtl
            ? `دليل الوجهات والجامعات العالمية (${filteredGlobalCountries.length} دولة ووجهة)`
            : `Global Universities & Hubs (${filteredGlobalCountries.length} destinations)`}
        </span>
        <span className="text-primary font-medium text-2xs">
          {isRtl
            ? "منح حكومية ورسمية ممولة بالكامل"
            : "Fully funded government scholarships"}
        </span>
      </div>

      <div className="space-y-3">
        {filteredGlobalCountries.map((gc) => (
          <div
            key={gc.country}
            className="p-4 rounded-2xl border-2 border-primary/20 bg-card/70 hover:border-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                {gc.flag}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                  {isRtl ? gc.scholarshipName : gc.scholarshipNameEn || gc.scholarshipName}
                </h4>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300 mt-1">
                  <span className="font-bold text-primary">{isRtl ? gc.country : gc.countryEn}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{gc.stipend}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-medium">
                    {isRtl ? `الموعد: ${gc.deadline}` : `Deadline: ${gc.deadline}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
              <a
                href={gc.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all flex items-center gap-1 text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? "البوابة الرسمية" : "Official Portal"}</span>
              </a>

              <Button
                variant="luxe"
                size="sm"
                onClick={() => {
                  onSelectScholarshipDraft({
                    id: `sch_global_${gc.country}_${Date.now()}`,
                    title_ar: gc.scholarshipName,
                    title_en: gc.scholarshipNameEn || gc.scholarshipName,
                    university: isRtl
                      ? `الجامعات الحكومية في ${gc.country}`
                      : `Government Universities in ${gc.countryEn}`,
                    country: isRtl ? gc.country : gc.countryEn,
                    flag: gc.flag,
                    degree: "all",
                    coverage: "full" as any,
                    deadline: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
                    majors: ["كافة التخصصات والمجالات الدراسية"],
                    apply_url: gc.officialPortal,
                    official_website: gc.officialPortal,
                    description_ar: `${gc.scholarshipName} - التمويل: ${gc.stipend}. لغة الدراسة: ${gc.studyLanguage}.`,
                    description_en: `${gc.scholarshipNameEn || gc.scholarshipName} - Funding: ${gc.stipend}. Study language: ${gc.studyLanguage}.`,
                    benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني", "تذاكر سفر"],
                    benefits_en: ["Full tuition waiver", "Monthly stipend", "Free accommodation", "Flight tickets"],
                  });
                  toast.info(
                    isRtl
                      ? "تم تجهيز بطاقة المنحة بنجاح! راجع التفاصيل واضغط حفظ ونشر"
                      : "Scholarship pre-filled! Review and click Save"
                  );
                }}
                className="text-xs font-bold shadow-gold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "إضافة للمنح" : "Add to Scholarships"}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
