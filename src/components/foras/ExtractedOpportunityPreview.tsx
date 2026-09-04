import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Edit3,
  Eye,
  Plus,
  Trash2,
  FileText,
  BadgeAlert,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isArabCountry } from "@/lib/dynamicStore";

interface ExtractedOpportunityPreviewProps {
  data: any;
  type: "scholarship" | "job";
  isRtl: boolean;
  onApprove: (approvedData: any) => void;
  onCancel: () => void;
}

export const ExtractedOpportunityPreview: React.FC<ExtractedOpportunityPreviewProps> = ({
  data: initialData,
  type,
  isRtl,
  onApprove,
  onCancel,
}) => {
  const [data, setData] = useState<any>(() => {
    const raw = initialData || {};
    const autoCategory =
      raw.category === "arab" || raw.category === "global"
        ? raw.category
        : isArabCountry(raw.country, raw.title_ar || raw.title)
        ? "arab"
        : "global";
    return {
      ...raw,
      category: type === "scholarship" ? autoCategory : raw.category,
    };
  });
  const [viewMode, setViewMode] = useState<"card" | "inspector">("card");
  const [newBenefit, setNewBenefit] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newMajor, setNewMajor] = useState("");

  // Audit evaluation
  const audit = useMemo(() => {
    const missing: { key: string; labelAr: string; labelEn: string; critical: boolean }[] = [];

    // Title
    const hasTitle = Boolean(data.title_ar || data.title);
    if (!hasTitle) {
      missing.push({ key: "title", labelAr: "عنوان الفرصة", labelEn: "Title", critical: true });
    }

    // Organization / University / Company
    const hasOrg = Boolean(data.university || data.company || data.org);
    if (!hasOrg) {
      missing.push({
        key: "org",
        labelAr: type === "scholarship" ? "الجامعة المانحة" : "الشركة / المؤسسة",
        labelEn: type === "scholarship" ? "University" : "Company",
        critical: true,
      });
    }

    // Country
    const hasCountry = Boolean(data.country);
    if (!hasCountry) {
      missing.push({ key: "country", labelAr: "الدولة", labelEn: "Country", critical: false });
    }

    // Apply URL
    const hasApplyUrl = Boolean(
      (data.apply_url || data.url) &&
      String(data.apply_url || data.url).startsWith("http")
    );
    if (!hasApplyUrl) {
      missing.push({ key: "apply_url", labelAr: "رابط التقديم المباشر", labelEn: "Apply URL", critical: true });
    }

    // Deadline
    const hasDeadline = Boolean(data.deadline && data.deadline.trim() !== "");
    if (!hasDeadline) {
      missing.push({ key: "deadline", labelAr: "الموعد النهائي للتقديم", labelEn: "Deadline", critical: false });
    }

    // Description
    const hasDesc = Boolean(data.description_ar || data.description);
    if (!hasDesc) {
      missing.push({ key: "description", labelAr: "الوصف التفصيلي", labelEn: "Description", critical: false });
    }

    // Benefits / Coverage
    const benefitsList = data.benefits_ar || data.benefits || [];
    const hasBenefits = Array.isArray(benefitsList) && benefitsList.length > 0;
    if (!hasBenefits) {
      missing.push({ key: "benefits", labelAr: "مزايا وتغطية الفرصة", labelEn: "Benefits", critical: false });
    }

    // Requirements
    const reqsList = data.requirements_ar || data.requirements || [];
    const hasReqs = Array.isArray(reqsList) && reqsList.length > 0;
    if (!hasReqs) {
      missing.push({ key: "requirements", labelAr: "شروط القبول والمعايير", labelEn: "Requirements", critical: false });
    }

    // Majors or Skills
    const majorsList = data.majors || data.skills || [];
    const hasMajors = Array.isArray(majorsList) && majorsList.length > 0;
    if (!hasMajors) {
      missing.push({
        key: "majors",
        labelAr: type === "scholarship" ? "التخصصات المتاحة" : "المهارات المطلوبة",
        labelEn: type === "scholarship" ? "Majors" : "Skills",
        critical: false,
      });
    }

    const totalChecks = 9;
    const passed = totalChecks - missing.length;
    const score = Math.round((passed / totalChecks) * 100);
    const isFullyComplete = missing.length === 0;

    return {
      score,
      isFullyComplete,
      missing,
    };
  }, [data, type]);

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const applyUrl = data.apply_url || data.url || "";
  const officialUrl = data.official_website || data.company_url || applyUrl;

  return (
    <div className="rounded-2xl bg-card border-2 border-primary/30 shadow-2xl overflow-hidden transition-all text-slate-100">
      {/* Top Header & Completeness Auditor Banner */}
      <div className={`p-4 sm:p-5 border-b transition-colors ${
        audit.isFullyComplete
          ? "bg-emerald-950/40 border-emerald-500/30"
          : "bg-amber-950/30 border-amber-500/30"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              audit.isFullyComplete
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
            }`}>
              {audit.isFullyComplete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <BadgeAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <span>{isRtl ? "فاحص جودة واكتمال البيانات الذكي" : "AI Opportunity Quality Auditor"}</span>
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  audit.isFullyComplete
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {audit.score}% {isRtl ? "مكتمل" : "Complete"}
                </span>
              </div>

              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                {audit.isFullyComplete
                  ? (isRtl
                      ? "تم سحب واستخراج الفرصة بنجاح 100% — كافة الروابط والشروط والمواعيد موثقة وجاهزة للنشر الفوري."
                      : "Opportunity extracted 100% complete — All official links, requirements, and deadlines are intact.")
                  : (isRtl
                      ? "تم الاستخراج جزئياً. هناك بعض الحقول التي قد تحتاج لمراجعة قبل الاعتماد:"
                      : "Partial extraction. Some fields might need your review before publishing:")}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Card View vs Inspector Editor */}
          <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-white/10 shrink-0 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "card"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isRtl ? "معاينة البطاقة" : "Card View"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("inspector")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "inspector"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isRtl ? "فحص وتعديل الحقول" : "Field Inspector"}</span>
            </button>
          </div>
        </div>

        {/* Missing fields notification chips */}
        {!audit.isFullyComplete && (
          <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-amber-300 font-medium flex items-center gap-1 me-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {isRtl ? "الحقول غير المكتملة:" : "Missing fields:"}
            </span>
            {audit.missing.map((m) => (
              <span
                key={m.key}
                onClick={() => setViewMode("inspector")}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-200 cursor-pointer hover:bg-amber-500/25 transition-colors"
                title={isRtl ? "انقر لتعديل هذا الحقل مباشرة" : "Click to edit this field"}
              >
                {isRtl ? m.labelAr : m.labelEn}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Destination Category Picker (For Scholarships) - Smart Geo-Routing & Luxe Control */}
        {type === "scholarship" && (
          <div className="p-4 rounded-2xl bg-background/80 border-2 border-primary/30 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white">
                  {isRtl ? "وجهة وتصنيف ظهور المنحة في التطبيق:" : "Target Tab in Main App Deck:"}
                </span>
              </div>
              <span className="text-[11px] font-medium text-gray-300">
                {data.category === "arab"
                  ? (isRtl ? "✅ محدد حالياً: تظهر فوراً في تبويب منح العالم العربي" : "✅ Current: Appears in Arab World Tab")
                  : (isRtl ? "🌐 محدد حالياً: تظهر فوراً في تبويب منح دولية وعالمية" : "🌐 Current: Appears in Global & International Tab")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => updateField("category", "arab")}
                className={`h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between border transition-all cursor-pointer ${
                  data.category === "arab"
                    ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold"
                    : "bg-background/60 border-primary/20 text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🏛️</span>
                  <div className="text-start">
                    <div className="leading-tight">{isRtl ? "منح العالم العربي" : "Arab World Scholarships"}</div>
                    <div className="text-[10px] opacity-85 font-normal">
                      {isRtl ? "(الدول والجامعات العربية)" : "(Arab countries & universities)"}
                    </div>
                  </div>
                </div>
                {data.category === "arab" && <Check className="w-4 h-4 shrink-0 ms-2" />}
              </button>

              <button
                type="button"
                onClick={() => updateField("category", "global")}
                className={`h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between border transition-all cursor-pointer ${
                  data.category === "global"
                    ? "bg-gradient-to-r from-sky-600 to-indigo-700 text-white border-transparent shadow-lg shadow-sky-600/30"
                    : "bg-background/60 border-primary/20 text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🌍</span>
                  <div className="text-start">
                    <div className="leading-tight">{isRtl ? "منح دولية وعالمية" : "Global & International"}</div>
                    <div className="text-[10px] opacity-85 font-normal">
                      {isRtl ? "(أوروبا، أمريكا، تركيا، آسيا...)" : "(Europe, USA, Turkey, Asia...)"}
                    </div>
                  </div>
                </div>
                {data.category === "global" && <Check className="w-4 h-4 shrink-0 ms-2" />}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: LIVE CARD PREVIEW */}
        {viewMode === "card" && (
          <div className="space-y-4">
            {/* The Opportunity Card as users will see it */}
            <div className="p-5 rounded-2xl bg-background/90 border border-white/10 shadow-lg space-y-4">
              {/* Header tags */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{data.flag || "🌍"}</span>
                  <Badge variant="outline" className="text-xs border-primary/40 text-primary font-bold">
                    {data.country || (isRtl ? "دولي" : "International")}
                  </Badge>
                  {data.coverage && (
                    <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      {data.coverage === "full"
                        ? (isRtl ? "ممولة بالكامل" : "Fully Funded")
                        : (isRtl ? "تمويل جزئي" : "Partial Funding")}
                    </Badge>
                  )}
                </div>

                {data.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isRtl ? "آخر موعد للتقديم:" : "Deadline:"} {data.deadline}</span>
                  </div>
                )}
              </div>

              {/* Title & Organization */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {data.title_ar || data.title || (isRtl ? "عنوان غير محدد" : "Untitled Opportunity")}
                </h3>
                {data.title_en && data.title_en !== data.title_ar && (
                  <p className="text-xs text-gray-400 mt-0.5 font-sans" dir="ltr">
                    {data.title_en}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 text-xs text-primary font-medium">
                  {type === "scholarship" ? (
                    <>
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>{data.university || data.org || (isRtl ? "جامعة معتمدة" : "Accredited University")}</span>
                    </>
                  ) : (
                    <>
                      <Building className="w-4 h-4 text-primary" />
                      <span>{data.company || (isRtl ? "شركة معتمدة" : "Verified Company")}</span>
                    </>
                  )}
                  {data.stipend && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span>{data.stipend}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-4">
                {data.description_ar || data.description || (isRtl ? "لا يوجد وصف متوفر." : "No description available.")}
              </p>

              {/* Majors or Skills Chips */}
              {((data.majors && data.majors.length > 0) || (data.skills && data.skills.length > 0)) && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-400">
                    {type === "scholarship" ? (isRtl ? "التخصصات المشمولة:" : "Eligible Majors:") : (isRtl ? "المهارات المطلوبة:" : "Required Skills:")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.majors || data.skills || []).map((item: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-white/5 border border-white/10 text-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits Highlights */}
              {data.benefits_ar && data.benefits_ar.length > 0 && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1.5">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isRtl ? "أبرز المزايا والتمويل المكتشفة:" : "Extracted Benefits & Funding:"}
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-200">
                    {data.benefits_ar.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements Highlights */}
              {data.requirements_ar && data.requirements_ar.length > 0 && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    {isRtl ? "شروط ومعايير التقديم:" : "Eligibility & Requirements:"}
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-300">
                    {data.requirements_ar.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Direct Link Verification Box */}
            <div className="p-4 rounded-xl bg-background/50 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  {isRtl ? "فحص وتجربة رابط التقديم المباشر:" : "Test Live Application Link:"}
                </span>
                <p className="text-[11px] text-gray-400 font-mono break-all mt-0.5 max-w-xl" dir="ltr">
                  {applyUrl || (isRtl ? "لم يتم استخراج رابط تقديم مباشر!" : "No apply link found!")}
                </p>
              </div>

              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>{isRtl ? "تجربة الرابط في نافذة جديدة" : "Test Link in New Tab"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: FIELD INSPECTOR & QUICK EDITOR */}
        {viewMode === "inspector" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title AR */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">
                  {isRtl ? "عنوان الفرصة (باللغة العربية) *" : "Opportunity Title (Arabic) *"}
                </label>
                <input
                  type="text"
                  value={data.title_ar || data.title || ""}
                  onChange={(e) => {
                    updateField("title_ar", e.target.value);
                    updateField("title", e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none"
                />
              </div>

              {/* Title EN */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">
                  {isRtl ? "العنوان بالإنجليزية (اختياري)" : "Title (English)"}
                </label>
                <input
                  type="text"
                  value={data.title_en || data.titleEn || ""}
                  onChange={(e) => {
                    updateField("title_en", e.target.value);
                    updateField("titleEn", e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none"
                  dir="ltr"
                />
              </div>

              {/* University / Company */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">
                  {type === "scholarship"
                    ? (isRtl ? "الجامعة / الجهة المانحة *" : "University / Sponsor *")
                    : (isRtl ? "الشركة / المؤسسة *" : "Company Name *")}
                </label>
                <input
                  type="text"
                  value={data.university || data.company || data.org || ""}
                  onChange={(e) => {
                    updateField("university", e.target.value);
                    updateField("company", e.target.value);
                    updateField("org", e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none"
                />
              </div>

              {/* Country & Flag & Category */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-bold text-gray-300">
                    {isRtl ? "الدولة *" : "Country *"}
                  </label>
                  <input
                    type="text"
                    value={data.country || ""}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      updateField("country", newCountry);
                      if (type === "scholarship") {
                        const isArab = isArabCountry(newCountry, data.title_ar || data.title);
                        updateField("category", isArab ? "arab" : "global");
                      }
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-300">
                    {isRtl ? "العلم" : "Flag"}
                  </label>
                  <input
                    type="text"
                    value={data.flag || "🌍"}
                    onChange={(e) => updateField("flag", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white text-center focus:border-primary outline-none text-base"
                  />
                </div>
              </div>

              {/* Destination Category Picker (Inspector View) */}
              {type === "scholarship" && (
                <div className="space-y-1.5 md:col-span-2 p-3 rounded-xl bg-background/60 border border-primary/20">
                  <label className="font-bold text-gray-300 flex items-center justify-between">
                    <span>{isRtl ? "تصنيف وظهور المنحة في التطبيق *" : "Destination Tab *"}</span>
                    <span className="text-[10px] text-primary">
                      {data.category === "arab"
                        ? (isRtl ? "🏛️ تظهر في: منح العالم العربي" : "🏛️ Arab World Tab")
                        : (isRtl ? "🌍 تظهر في: منح دولية وعالمية" : "🌍 Global & International Tab")}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => updateField("category", "arab")}
                      className={`h-9 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        data.category === "arab"
                          ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold"
                          : "bg-background/80 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span>🏛️ {isRtl ? "منح العالم العربي" : "Arab World"}</span>
                      {data.category === "arab" && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("category", "global")}
                      className={`h-9 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        data.category === "global"
                          ? "bg-sky-600 text-white border-transparent shadow-md"
                          : "bg-background/80 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span>🌍 {isRtl ? "منح دولية وعالمية" : "Global & Int."}</span>
                      {data.category === "global" && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Apply URL */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    {isRtl ? "رابط التقديم المباشر (Apply URL) *" : "Direct Apply URL *"}
                  </label>
                  {applyUrl && (
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{isRtl ? "فحص وتجربة الرابط" : "Test link"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={data.apply_url || data.url || ""}
                  onChange={(e) => {
                    updateField("apply_url", e.target.value);
                    updateField("url", e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none font-mono"
                  dir="ltr"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">
                  {isRtl ? "الموعد النهائي للتقديم (YYYY-MM-DD)" : "Deadline (YYYY-MM-DD)"}
                </label>
                <input
                  type="date"
                  value={data.deadline || ""}
                  onChange={(e) => updateField("deadline", e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none"
                />
              </div>

              {/* Stipend / Salary */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-300">
                  {type === "scholarship" ? (isRtl ? "الراتب / التغطية المالية" : "Stipend / Allowance") : (isRtl ? "الراتب / المكافأة" : "Salary")}
                </label>
                <input
                  type="text"
                  value={data.stipend || data.salary || ""}
                  onChange={(e) => {
                    updateField("stipend", e.target.value);
                    updateField("salary", e.target.value);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Description AR */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-300">
                {isRtl ? "الوصف الشامل للفرصة بالعربية" : "Arabic Description"}
              </label>
              <textarea
                rows={4}
                value={data.description_ar || data.description || ""}
                onChange={(e) => {
                  updateField("description_ar", e.target.value);
                  updateField("description", e.target.value);
                }}
                className="w-full p-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary outline-none leading-relaxed"
              />
            </div>

            {/* Benefits Editor */}
            <div className="space-y-2 p-3 rounded-xl bg-background/50 border border-white/10">
              <label className="font-bold text-gray-300 flex items-center justify-between">
                <span>{isRtl ? "المزايا والتغطيات المالية:" : "Benefits & Coverages:"}</span>
                <span className="text-[11px] text-gray-400">
                  ({(data.benefits_ar || []).length} {isRtl ? "ميزة مسجلة" : "items"})
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(data.benefits_ar || []).map((b: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-center gap-1.5"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.benefits_ar || []).filter((_: any, idx: number) => idx !== i);
                        updateField("benefits_ar", updated);
                      }}
                      className="text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder={isRtl ? "أضف ميزة جديدة (مثال: تذاكر سفر مجانية)..." : "Add a benefit..."}
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newBenefit.trim()) {
                      e.preventDefault();
                      updateField("benefits_ar", [...(data.benefits_ar || []), newBenefit.trim()]);
                      setNewBenefit("");
                    }
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-white/10 text-white outline-none focus:border-primary text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newBenefit.trim()) {
                      updateField("benefits_ar", [...(data.benefits_ar || []), newBenefit.trim()]);
                      setNewBenefit("");
                    }
                  }}
                  className="h-9 px-3 rounded-lg bg-primary/20 text-primary border border-primary/30 font-bold hover:bg-primary/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? "إضافة" : "Add"}</span>
                </button>
              </div>
            </div>

            {/* Requirements Editor */}
            <div className="space-y-2 p-3 rounded-xl bg-background/50 border border-white/10">
              <label className="font-bold text-gray-300 flex items-center justify-between">
                <span>{isRtl ? "شروط ومعايير القبول:" : "Requirements:"}</span>
                <span className="text-[11px] text-gray-400">
                  ({(data.requirements_ar || []).length} {isRtl ? "شرط مسجل" : "items"})
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(data.requirements_ar || []).map((r: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center gap-1.5"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.requirements_ar || []).filter((_: any, idx: number) => idx !== i);
                        updateField("requirements_ar", updated);
                      }}
                      className="text-gray-400 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder={isRtl ? "أضف شرط قبول جديد (مثال: شهادة لغة إنجليزية IELTS 6.5)..." : "Add a requirement..."}
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newRequirement.trim()) {
                      e.preventDefault();
                      updateField("requirements_ar", [...(data.requirements_ar || []), newRequirement.trim()]);
                      setNewRequirement("");
                    }
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-white/10 text-white outline-none focus:border-primary text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newRequirement.trim()) {
                      updateField("requirements_ar", [...(data.requirements_ar || []), newRequirement.trim()]);
                      setNewRequirement("");
                    }
                  }}
                  className="h-9 px-3 rounded-lg bg-primary/20 text-primary border border-primary/30 font-bold hover:bg-primary/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? "إضافة" : "Add"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" />
            <span>
              {isRtl
                ? "بمجرد الضغط على اعتماد، سيتم نشر الفرصة في المنصة وتحديث السحابة تلقائياً."
                : "Once approved, the opportunity will be published immediately to users."}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-4 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/15 hover:text-red-300 font-bold text-xs sm:text-sm cursor-pointer"
            >
              <X className="w-4 h-4 me-1.5" />
              <span>{isRtl ? "إلغاء / تجاهل" : "Cancel & Dismiss"}</span>
            </Button>

            <Button
              type="button"
              variant="luxe"
              onClick={() => onApprove(data)}
              className="h-11 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-gold cursor-pointer"
            >
              <Check className="w-4 h-4 me-1.5" />
              <span>{isRtl ? "اعتماد ونشر فوري للمنصة" : "Approve & Publish Now"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
