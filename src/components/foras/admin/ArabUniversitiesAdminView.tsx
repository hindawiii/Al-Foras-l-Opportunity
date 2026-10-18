import { useState, useMemo, useEffect } from "react";
import {
  ExternalLink,
  Plus,
  Building2,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  X,
  Globe,
  GraduationCap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArabUniversity, ArabUniType } from "@/lib/arabUniversities";
import { Scholarship } from "@/lib/mockData";
import { universitiesDirectoryStore } from "@/lib/universitiesDirectoryStore";
import { adminAuthStore } from "@/lib/adminAuthStore";
import { toast } from "sonner";

interface Props {
  isRtl: boolean;
  searchQuery: string;
  onSelectScholarshipDraft: (draft: Partial<Scholarship>) => void;
  onResetSearch: () => void;
}

const ARAB_COUNTRIES_LIST = [
  { name: "المملكة العربية السعودية", flag: "🇸🇦" },
  { name: "قطر", flag: "🇶🇦" },
  { name: "الإمارات العربية المتحدة", flag: "🇦🇪" },
  { name: "جمهورية مصر العربية", flag: "🇪🇬" },
  { name: "السودان", flag: "🇸🇩" },
  { name: "المملكة الأردنية الهاشمية", flag: "🇯🇴" },
  { name: "سلطنة عمان", flag: "🇴🇲" },
  { name: "مملكة البحرين", flag: "🇧🇭" },
  { name: "الكويت", flag: "🇰🇼" },
];

export const ArabUniversitiesAdminView = ({
  isRtl,
  searchQuery,
  onSelectScholarshipDraft,
  onResetSearch,
}: Props) => {
  const [selectedArabCountry, setSelectedArabCountry] = useState<string>("all");
  const [visibleUnisCount, setVisibleUnisCount] = useState<number>(35);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Live state from universitiesDirectoryStore
  const [allUnis, setAllUnis] = useState<ArabUniversity[]>(() =>
    universitiesDirectoryStore.getArabUniversities()
  );

  // Listen for real-time updates from Cloud Firestore
  useEffect(() => {
    const handleUpdate = () => {
      setAllUnis(universitiesDirectoryStore.getArabUniversities());
    };
    window.addEventListener("foras:universities-updated", handleUpdate);
    return () => window.removeEventListener("foras:universities-updated", handleUpdate);
  }, []);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingUni, setEditingUni] = useState<Partial<ArabUniversity> | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formCountry, setFormCountry] = useState(ARAB_COUNTRIES_LIST[0].name);
  const [formFlag, setFormFlag] = useState(ARAB_COUNTRIES_LIST[0].flag);
  const [formCity, setFormCity] = useState("");
  const [formCityEn, setFormCityEn] = useState("");
  const [formType, setFormType] = useState<ArabUniType>("government");
  const [formWebsite, setFormWebsite] = useState("");
  const [formMinPercentage, setFormMinPercentage] = useState<number>(75);
  const [formLanguage, setFormLanguage] = useState<"ar" | "en" | "mixed">("mixed");
  const [formScholarships, setFormScholarships] = useState<boolean>(true);
  const [formHighlights, setFormHighlights] = useState("");
  const [formHighlightsEn, setFormHighlightsEn] = useState("");
  const [formFaculties, setFormFaculties] = useState("");

  const availableArabCountries = useMemo(() => {
    const map = new Map<string, { name: string; flag: string; count: number }>();
    allUnis.forEach((u) => {
      const c = map.get(u.country);
      if (c) {
        c.count += 1;
      } else {
        map.set(u.country, { name: u.country, flag: u.flag, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allUnis]);

  const filteredArabUnis = useMemo(() => {
    return allUnis.filter((u) => {
      const matchesCountry =
        selectedArabCountry === "all" || u.country === selectedArabCountry;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.nameEn && u.nameEn.toLowerCase().includes(q)) ||
        u.country.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q);
      return matchesCountry && matchesSearch;
    });
  }, [allUnis, selectedArabCountry, searchQuery]);

  // Open modal for new university
  const handleOpenAdd = () => {
    setEditingUni(null);
    setFormName("");
    setFormNameEn("");
    setFormCountry(ARAB_COUNTRIES_LIST[0].name);
    setFormFlag(ARAB_COUNTRIES_LIST[0].flag);
    setFormCity("");
    setFormCityEn("");
    setFormType("government");
    setFormWebsite("");
    setFormMinPercentage(75);
    setFormLanguage("mixed");
    setFormScholarships(true);
    setFormHighlights("");
    setFormHighlightsEn("");
    setFormFaculties("");
    setModalOpen(true);
  };

  // Open modal for editing university
  const handleOpenEdit = (uni: ArabUniversity) => {
    setEditingUni(uni);
    setFormName(uni.name);
    setFormNameEn(uni.nameEn || "");
    setFormCountry(uni.country);
    setFormFlag(uni.flag || "🏛️");
    setFormCity(uni.city);
    setFormCityEn(uni.cityEn || "");
    setFormType(uni.type);
    setFormWebsite(uni.website);
    setFormMinPercentage(uni.minPercentage);
    setFormLanguage(uni.language);
    setFormScholarships(uni.scholarships);
    setFormHighlights(uni.highlights);
    setFormHighlightsEn(uni.highlightsEn || "");
    setFormFaculties(uni.faculties ? uni.faculties.join(", ") : "");
    setModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(isRtl ? "يرجى إدخال اسم الجامعة بالعربية" : "University Arabic name required");
      return;
    }
    if (!formWebsite.trim()) {
      toast.error(isRtl ? "يرجى إدخال الرابط الرسمي" : "Official website URL required");
      return;
    }

    const facultiesList = formFaculties
      ? formFaculties.split(/[,،]+/).map((s) => s.trim()).filter(Boolean)
      : ["كافة التخصصات والكليات"];

    const uniId =
      editingUni?.id ||
      `uni_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const payload: ArabUniversity = {
      id: uniId,
      name: formName.trim(),
      nameEn: formNameEn.trim() || formName.trim(),
      country: formCountry,
      countryEn: formCountry,
      flag: formFlag,
      city: formCity.trim() || "المدينة الرئيسية",
      cityEn: formCityEn.trim() || formCity.trim(),
      type: formType,
      website: formWebsite.trim(),
      faculties: facultiesList,
      minPercentage: Number(formMinPercentage) || 70,
      language: formLanguage,
      scholarships: formScholarships,
      highlights: formHighlights.trim() || formName.trim(),
      highlightsEn: formHighlightsEn.trim() || formHighlights.trim(),
    };

    const activeUser = adminAuthStore.getCurrentSession();
    const success = await universitiesDirectoryStore.saveUniversity(payload, activeUser);

    if (success) {
      toast.success(
        isRtl
          ? "تم حفظ الصرح الجامعي ومزامنته سحابياً بنجاح! ✨"
          : "University saved and synced to cloud! ✨"
      );
      setModalOpen(false);
    } else {
      toast.error(isRtl ? "فشل حفظ البيانات، يرجى المحاولة ثانية" : "Failed to save university");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      isRtl
        ? `هل أنت متأكد من حذف/أرشفة «${name}»؟ سيتم إزالته من الدليل المباشر لجميع المستخدمين.`
        : `Are you sure you want to delete "${name}"? It will be removed from all users.`
    );
    if (!confirmed) return;

    const activeUser = adminAuthStore.getCurrentSession();
    const ok = await universitiesDirectoryStore.deleteUniversity(id, activeUser);
    if (ok) {
      toast.success(isRtl ? "تمت إزالة الصرح الجامعي بنجاح" : "University removed successfully");
    } else {
      toast.error(isRtl ? "تعذر الحذف" : "Failed to delete");
    }
  };

  // Seed Flagships
  const handleSeedFlagships = async () => {
    setIsSyncing(true);
    toast.info(isRtl ? "جاري بذر الصروح الرائدة في Firestore..." : "Seeding flagships to Firestore...");
    const res = await universitiesDirectoryStore.seedFlagshipUniversities(25);
    setIsSyncing(false);
    if (res.count > 0) {
      toast.success(
        isRtl
          ? `تم بنجاح بذر ${res.count} صرح جامعي في Cloud Firestore! 🏛️`
          : `Successfully seeded ${res.count} universities to Cloud Firestore!`
      );
    } else {
      toast.error(res.error || (isRtl ? "حدث خطأ أثناء البذر" : "Error seeding flagships"));
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto space-y-4 pb-32 pe-1 ps-1 scrollbar-thin scrollbar-thumb-primary/20 overscroll-contain touch-pan-y">
      {/* Top Banner: Status + Actions */}
      <div className="p-4 rounded-2xl bg-card/80 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isRtl ? "إدارة الصروح والجامعات العربية" : "Arab Universities Management"}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                {isRtl ? "متزامن لحظياً مع Firestore" : "Live Firestore Sync"}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            {isRtl
              ? `إجمالي الصروح: ${allUnis.length} جامعة معتمدة موزعة على 9 دول عربية.`
              : `Total: ${allUnis.length} accredited universities across 9 Arab nations.`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeedFlagships}
            disabled={isSyncing}
            className="h-10 text-xs font-bold border-primary/30 hover:border-primary/60 text-primary flex items-center gap-1.5 flex-1 sm:flex-initial"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isRtl ? "بذر الصروح السحابية" : "Seed Flagships"}</span>
          </Button>

          <Button
            type="button"
            variant="luxe"
            size="sm"
            onClick={handleOpenAdd}
            className="h-10 text-xs font-bold shadow-gold flex items-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? "إضافة صرح جديد" : "Add University"}</span>
          </Button>
        </div>
      </div>

      {/* Header with Counter and Guidance */}
      <div className="flex items-center justify-between text-xs text-slate-300 mb-1 flex-wrap gap-2">
        <span className="font-bold text-white flex items-center gap-2">
          <span>
            {isRtl
              ? `دليل الجامعات العربية (${filteredArabUnis.length} جامعة معروضة)`
              : `Arab Universities (${filteredArabUnis.length} displayed)`}
          </span>
          {selectedArabCountry !== "all" && (
            <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold">
              {selectedArabCountry}
            </span>
          )}
        </span>
        <span className="text-primary font-medium text-[11px]">
          {isRtl
            ? "التعديلات تُحدث فوراً لدى جميع الطلاب والمستخدمين دون حاجة للتحديث"
            : "Edits reflect instantly for all users via real-time sync"}
        </span>
      </div>

      {/* Quick Country Filter Pills (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
        <button
          type="button"
          onClick={() => {
            setSelectedArabCountry("all");
            setVisibleUnisCount(35);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 h-10 ${
            selectedArabCountry === "all"
              ? "bg-primary text-primary-foreground shadow-gold"
              : "bg-card/70 border border-primary/20 text-slate-300 hover:text-white hover:bg-card"
          }`}
        >
          <span>🌍</span>
          <span>{isRtl ? "جميع الدول" : "All Countries"}</span>
          <span className="opacity-75 font-mono text-[10px]">
            ({allUnis.length})
          </span>
        </button>

        {availableArabCountries.map((c) => {
          const isSelected = selectedArabCountry === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setSelectedArabCountry(c.name);
                setVisibleUnisCount(35);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 h-10 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "bg-card/70 border border-primary/20 text-slate-300 hover:text-white hover:bg-card"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
              <span className="opacity-75 font-mono text-[10px]">({c.count})</span>
            </button>
          );
        })}
      </div>

      {/* Universities List with Paginated/Incremental Render */}
      <div className="space-y-3">
        {filteredArabUnis.slice(0, visibleUnisCount).map((uni) => (
          <div
            key={uni.id}
            className="p-4 rounded-2xl border-2 border-primary/20 bg-card/70 hover:border-primary/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-start lg:items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl flex-shrink-0">
                {uni.flag || "🏛️"}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {isRtl ? uni.name : uni.nameEn || uni.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-primary/30 bg-primary/10 text-primary">
                    {uni.type === "government"
                      ? isRtl
                        ? "حكومية"
                        : "Government"
                      : uni.type === "technical"
                      ? isRtl
                        ? "تقنية"
                        : "Technical"
                      : isRtl
                      ? "خاصة"
                      : "Private"}
                  </span>
                  {uni.scholarships && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      {isRtl ? "منح متوفرة ✨" : "Scholarships Available ✨"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                  <span>{isRtl ? uni.city : uni.cityEn || uni.city}</span>
                  <span>•</span>
                  <span>{isRtl ? uni.country : uni.countryEn || uni.country}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">
                    {isRtl ? `أقل نسبة: ${uni.minPercentage}%` : `Min: ${uni.minPercentage}%`}
                  </span>
                </div>

                {uni.highlights && (
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {isRtl ? uni.highlights : uni.highlightsEn || uni.highlights}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isRtl ? "الموقع" : "Website"}</span>
              </a>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(uni)}
                className="h-10 px-3 text-xs font-bold border-primary/30 hover:border-primary/60 text-slate-200 hover:text-white flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span>{isRtl ? "تعديل" : "Edit"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDelete(uni.id, uni.name)}
                className="h-10 px-3 text-xs font-bold border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRtl ? "حذف" : "Delete"}</span>
              </Button>

              <Button
                variant="luxe"
                size="sm"
                onClick={() => {
                  onSelectScholarshipDraft({
                    id: `sch_arab_${uni.id}_${Date.now()}`,
                    title_ar: `منحة ${uni.name} للطلاب الدوليين`,
                    title_en: `${uni.nameEn || uni.name} Scholarship for International Students`,
                    university: uni.name,
                    country: uni.country,
                    flag: uni.flag,
                    degree: "bachelor_master",
                    coverage: "full" as any,
                    deadline: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
                    majors: uni.faculties,
                    apply_url: uni.website,
                    official_website: uni.website,
                    description_ar: uni.highlights,
                    description_en: uni.highlightsEn || uni.highlights,
                    benefits_ar: ["إعفاء من الرسوم الدراسية", "سكن جامعي", "تأمين صحي"],
                    benefits_en: ["Tuition fee waiver", "Campus housing", "Health insurance"],
                  });
                  toast.info(
                    isRtl
                      ? "تم تجهيز بطاقة المنحة بنجاح! راجع التفاصيل واضغط حفظ ونشر"
                      : "Scholarship pre-filled! Review and click Save"
                  );
                }}
                className="h-10 text-xs font-bold shadow-gold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "إضافة للمنح" : "To Grants"}</span>
              </Button>
            </div>
          </div>
        ))}

        {filteredArabUnis.length === 0 && (
          <div className="text-center py-12 p-6 rounded-2xl bg-card/40 border border-primary/20 space-y-3">
            <Building2 className="w-10 h-10 text-primary mx-auto opacity-50" />
            <p className="text-sm font-bold text-white">
              {isRtl
                ? "لم يتم العثور على جامعات مطابقة للبحث أو الدولة المحددة"
                : "No universities found matching your search"}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedArabCountry("all");
                onResetSearch();
              }}
              className="h-10 px-4 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 cursor-pointer"
            >
              {isRtl ? "إلغاء التصفية وعرض الكل" : "Reset filter"}
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleUnisCount < filteredArabUnis.length && (
          <div className="text-center py-4">
            <button
              type="button"
              onClick={() => setVisibleUnisCount((prev) => prev + 35)}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-primary-foreground font-bold text-xs shadow-gold hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95 h-11"
            >
              <span>
                {isRtl
                  ? `عرض المزيد من الجامعات (+${Math.min(35, filteredArabUnis.length - visibleUnisCount)})`
                  : `Load More Unis (+${Math.min(35, filteredArabUnis.length - visibleUnisCount)})`}
              </span>
              <span className="opacity-80 font-mono text-xs">
                ({visibleUnisCount} / {filteredArabUnis.length})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-card/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white text-base">
                  {editingUni
                    ? isRtl
                      ? "تعديل بيانات الصرح الجامعي"
                      : "Edit University Details"
                    : isRtl
                    ? "إضافة صرح جامعي جديد إلى المنصة"
                    : "Add New University to Platform"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "اسم الجامعة (بالعربية) *" : "University Name (Arabic) *"}
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={isRtl ? "مثال: جامعة الملك سعود" : "e.g. King Saud University"}
                    className="h-11 bg-card/70 border-primary/30"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "اسم الجامعة (بالإنجليزية)" : "University Name (English)"}
                  </label>
                  <Input
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. King Saud University"
                    className="h-11 bg-card/70 border-primary/30 text-start"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "الدولة" : "Country"}
                  </label>
                  <select
                    value={formCountry}
                    onChange={(e) => {
                      const selected = ARAB_COUNTRIES_LIST.find((c) => c.name === e.target.value);
                      setFormCountry(e.target.value);
                      if (selected) setFormFlag(selected.flag);
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-card border border-primary/30 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {ARAB_COUNTRIES_LIST.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "المدينة (بالعربية)" : "City (Arabic)"}
                  </label>
                  <Input
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder={isRtl ? "مثال: الرياض" : "e.g. Riyadh"}
                    className="h-11 bg-card/70 border-primary/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "نوع الجامعة" : "Type"}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ArabUniType)}
                    className="w-full h-11 px-3 rounded-xl bg-card border border-primary/30 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="government">{isRtl ? "حكومية (أهلية/عامة)" : "Government"}</option>
                    <option value="private">{isRtl ? "خاصة" : "Private"}</option>
                    <option value="technical">{isRtl ? "تقنية وتطبيقية" : "Technical"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "الرابط الرسمي للجامعة *" : "Official Website *"}
                  </label>
                  <Input
                    type="url"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://..."
                    className="h-11 bg-card/70 border-primary/30 text-start"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "أدنى نسبة قبول للمفاضلة (%)" : "Min Admission (%)"}
                  </label>
                  <Input
                    type="number"
                    min="50"
                    max="100"
                    value={formMinPercentage}
                    onChange={(e) => setFormMinPercentage(Number(e.target.value))}
                    className="h-11 bg-card/70 border-primary/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {isRtl ? "لغة التدريس" : "Instruction Language"}
                  </label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-card border border-primary/30 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="mixed">{isRtl ? "مزدوج (عربي / إنجليزي)" : "Bilingual"}</option>
                    <option value="ar">{isRtl ? "عربي" : "Arabic"}</option>
                    <option value="en">{isRtl ? "إنجليزي" : "English"}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-primary/20">
                <input
                  type="checkbox"
                  id="formScholarships"
                  checked={formScholarships}
                  onChange={(e) => setFormScholarships(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="formScholarships" className="text-xs font-bold text-white cursor-pointer">
                  {isRtl
                    ? "يتوفر بالجامعة برنامج منح دراسية / إعفاءات للطلاب الدوليين ✨"
                    : "Scholarship programs available for international students ✨"}
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  {isRtl ? "أبرز الكليات والتخصصات (مفصولة بفواصل)" : "Key Faculties (comma-separated)"}
                </label>
                <Input
                  value={formFaculties}
                  onChange={(e) => setFormFaculties(e.target.value)}
                  placeholder={isRtl ? "كلية الطب، كلية الهندسة، كلية علوم الحاسب..." : "Medicine, Engineering, Computer Science..."}
                  className="h-11 bg-card/70 border-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  {isRtl ? "نبذة ومميزات الصرح (بالعربية)" : "University Highlights (Arabic)"}
                </label>
                <textarea
                  rows={3}
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  placeholder={isRtl ? "اكتب نبذة موجزة عن تصنيف الجامعة ومراكز أبحاثها..." : "Brief overview of university ranking..."}
                  className="w-full p-3 rounded-xl bg-card/70 border border-primary/30 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="h-11 px-4 text-xs font-bold"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="luxe"
                  className="h-11 px-6 text-xs font-bold shadow-gold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRtl ? "حفظ ومزامنة فورية" : "Save & Sync Now"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
