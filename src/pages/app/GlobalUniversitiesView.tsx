import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe2, ExternalLink, MapPin, Sparkles, Clock, CheckCircle2, ShieldCheck,
  Building2, Award, Search, ChevronRight, X, GraduationCap, Scale,
  BookOpen, Wallet, Home, CalendarDays, FileText, ListChecks, Map as MapIcon
} from "lucide-react";
import {
  GLOBAL_COUNTRIES,
  type GlobalCountryStat,
  getStudyLanguageLabels,
  getDegreeLevelLabel,
  getGlobalCityLabel,
} from "@/lib/globalUniversities";
import { getFacultyLabel } from "@/lib/arabUniversities";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface GlobalUniversitiesViewProps {
  initialCountry?: string | null;
}

export const GlobalUniversitiesView = ({ initialCountry }: GlobalUniversitiesViewProps) => {
  const { lang, t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const ar = lang === "ar";
  const alignClass = isRtl ? "text-right" : "text-left";

  // Selected Country state: string | null (null means browsing country cards overview)
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(() => {
    if (initialCountry) {
      const match = GLOBAL_COUNTRIES.find(
        (g) => g.country.toLowerCase() === initialCountry.toLowerCase() || g.countryEn.toLowerCase() === initialCountry.toLowerCase()
      );
      if (match) return match.country;
    }
    return null;
  });

  const [filterTier, setFilterTier] = useState<"all" | "guaranteed" | "periodic">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [selectedUniDetail, setSelectedUniDetail] = useState<{
    uni: GlobalCountryStat["topUniversities"][0];
    country: GlobalCountryStat;
  } | null>(null);

  // Filtered countries by Tier
  const filteredCountries = useMemo(() => {
    return GLOBAL_COUNTRIES.filter((g) => {
      if (filterTier === "all") return true;
      return g.tier === filterTier;
    });
  }, [filterTier]);

  const currentCountry = useMemo(() => {
    if (!selectedCountryName) return null;
    return GLOBAL_COUNTRIES.find((g) => g.country === selectedCountryName) || null;
  }, [selectedCountryName]);

  // Filtered universities within the selected country
  const filteredUniversities = useMemo(() => {
    if (!currentCountry) return [];
    const q = searchQuery.trim().toLowerCase();
    return currentCountry.topUniversities.filter((uni) => {
      const matchesSearch = !q || (
        uni.name.toLowerCase().includes(q) ||
        uni.nameEn.toLowerCase().includes(q) ||
        uni.city.toLowerCase().includes(q) ||
        uni.cityEn.toLowerCase().includes(q) ||
        uni.highlights.toLowerCase().includes(q) ||
        uni.highlightsEn.toLowerCase().includes(q)
      );

      return matchesSearch;
    });
  }, [currentCountry, searchQuery]);

  return (
    <div className="space-y-4 w-full" dir={dir}>
      {/* VIEW MODE 1: GLOBAL COUNTRIES GRID (When selectedCountryName === null) */}
      {!currentCountry ? (
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              <span>{t("globalUniSelectCountry")}</span>
            </p>
            <span className="text-[11px] text-muted-foreground">
              {t("globalUniCountryCount").replace("{n}", String(filteredCountries.length))}
            </span>
          </div>

          {/* Tier Filter Switcher (Matching Luxe Theme) */}
          <div className="flex items-center gap-1.5 bg-background/80 border border-primary/25 p-1 rounded-2xl">
            <button
              onClick={() => setFilterTier("all")}
              className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTier === "all"
                  ? "bg-gold-gradient text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("globalUniAllCountries")} ({GLOBAL_COUNTRIES.length})
            </button>
            <button
              onClick={() => setFilterTier("guaranteed")}
              className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filterTier === "guaranteed"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("globalUniGuaranteed")}</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
                {GLOBAL_COUNTRIES.filter((g) => g.tier === "guaranteed").length}
              </span>
            </button>
            <button
              onClick={() => setFilterTier("periodic")}
              className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filterTier === "periodic"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("globalUniPeriodic")}</span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded-full font-bold">
                {GLOBAL_COUNTRIES.filter((g) => g.tier === "periodic").length}
              </span>
            </button>
          </div>

          {/* 2-Column Responsive Country Grid (Matches Screenshot 1 Exactly) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredCountries.map((c, i) => {
              const isGuaranteed = c.tier === "guaranteed";
              return (
                <motion.button
                  key={c.country}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => {
                    setSelectedCountryName(c.country);
                    setSearchQuery("");
                  }}
                  className={`relative text-start rounded-2xl border p-3.5 bg-card/60 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 cursor-pointer ${
                    isGuaranteed
                      ? "border-primary/30 shadow-[0_0_15px_-6px_hsl(var(--primary)/0.3)]"
                      : "border-primary/20"
                  }`}
                >
                  {isGuaranteed && (
                    <span className={`absolute top-2.5 ${isRtl ? "left-2.5" : "right-2.5"} text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold`}>
                      {t("globalUniGuaranteedBadge")}
                    </span>
                  )}
                  <div className="text-2xl mb-1">{c.flag}</div>
                  <p className="text-sm font-bold text-primary truncate leading-tight">
                    {ar ? c.country : c.countryEn}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {c.topUniversities.length} {t("globalUniAccreditedUnis")}
                  </p>
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 border border-primary/20 text-muted-foreground font-medium">
                      {ar ? c.fundingType : c.fundingTypeEn}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium">
                      {t("globalUniScholarshipsAvailable")}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: SELECTED GLOBAL COUNTRY VIEW (Matches Screenshot 2 & Arab Universities Layout Exactly) */
        <div className="space-y-3">
          {/* Navigation & Controls Top Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedCountryName(null);
                setSearchQuery("");
                setSelectedDegree("");
              }}
              className="h-9 px-3.5 rounded-full text-xs font-bold border border-primary/30 bg-card/80 text-primary flex items-center gap-1.5 hover:bg-primary/10 transition-all"
            >
              <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? "" : "rotate-180"}`} />
              <span>{t("arabUniBackToCountries")} ({isRtl ? currentCountry.country : currentCountry.countryEn})</span>
            </button>
            <p className="text-xs text-muted-foreground font-medium">
              {t("globalUniFoundUnis").replace("{count}", String(filteredUniversities.length))}
            </p>
          </div>

          {/* Country Official Sources & Scholarships Showcase */}
          <div className="rounded-2xl border border-primary/30 bg-card/75 backdrop-blur-md p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary/15">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentCountry.flag}</span>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2 flex-wrap">
                    <span>{isRtl ? currentCountry.country : currentCountry.countryEn}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                      ✨ {t("arabUniScholarshipsAvailable")}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("globalUniBannerDesc")
                      .replace("{count}", String(currentCountry.topUniversities.length))
                      .replace("{funding}", ar ? currentCountry.fundingType : currentCountry.fundingTypeEn)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-2xs text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("arabUniOfficialPortalsBanner")}</span>
              </div>
            </div>

            {/* Scholarship Flagship Highlight */}
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2 text-xs">
              <span className="text-sm">🏆</span>
              <div>
                <span className="font-bold text-primary">
                  {t("arabUniScholarshipTypeLabel")}{" "}
                </span>
                <span className="text-foreground/90 font-medium">
                  {ar ? currentCountry.scholarshipName : currentCountry.scholarshipNameEn} ({ar ? currentCountry.applicationWindow : currentCountry.applicationWindowEn})
                </span>
              </div>
            </div>

            {/* Official Portals Links */}
            {currentCountry.officialPortals && currentCountry.officialPortals.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-2xs font-bold text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-primary" />
                  {t("arabUniOfficialPortalsLabel")}
                </span>
                {currentCountry.officialPortals.map((portal) => (
                  <a
                    key={portal.url}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-glow bg-background/80 hover:bg-primary/20 border border-primary/30 px-3 py-1 rounded-xl transition-all"
                  >
                    <span>{isRtl ? portal.name : portal.nameEn}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar & Dropdown Controls */}
          <div className="space-y-2.5 rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-3">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("globalUniSearchPlaceholder")}
                className={`bg-background/70 border-border text-xs h-9 ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} ${alignClass}`}
                dir={dir}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRtl ? "left-3" : "right-3"}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Universities List - Matching Screenshot 2 Exactly */}
          <div className="space-y-3">
            {filteredUniversities.map((uni, i) => {
              const cityText = ar ? uni.city : (uni.cityEn || getGlobalCityLabel(uni.city, lang));
              const countryText = ar ? currentCountry.country : currentCountry.countryEn;

              return (
                <motion.div
                  key={uni.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setSelectedUniDetail({ uni, country: currentCountry })}
                  className="rounded-2xl border bg-card/60 backdrop-blur-md p-4 transition-all hover:border-primary/50 cursor-pointer group hover:bg-card/80 border-primary/20"
                >
                  {/* Card Header: Flag, Name, City, Country, Ranking Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                        {currentCountry.flag}
                      </div>
                      <div className={`flex-1 min-w-0 ${alignClass}`}>
                        <h3 className="text-base font-bold font-display text-gold-gradient truncate leading-snug group-hover:text-primary transition-colors">
                          {ar ? uni.name : (uni.nameEn || uni.name)}
                        </h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{cityText} · {countryText}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold bg-primary/15 border-primary/30 text-primary">
                        {uni.ranking || t("globalUniLeadingBadge")}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Summary */}
                  <p className={`text-xs text-foreground/85 leading-relaxed mb-2.5 ${alignClass}`}>
                    {ar ? uni.highlights : (uni.highlightsEn || uni.highlights)}
                  </p>

                  {/* Meta Badges: Languages, Scholarship, Levels */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-primary/10 text-muted-foreground flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-primary" />
                      {getStudyLanguageLabels(currentCountry.studyLanguages, lang).join(" / ")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {t("globalUniScholarshipEligible")}
                    </span>
                    {currentCountry.degreeLevels.map((lvl) => (
                      <span
                        key={lvl}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 text-foreground/80"
                      >
                        {getDegreeLevelLabel(lvl, lang)}
                      </span>
                    ))}
                  </div>

                  {/* Percentage & Admission Requirements Bar + Action Links */}
                  <div className={`flex items-center justify-between gap-2 pt-2.5 border-t border-border/60 ${isRtl ? "" : "flex-row-reverse"}`}>
                    <div className={alignClass}>
                      <p className="text-[10px] text-muted-foreground">
                        {t("globalUniFundingStatus")}
                      </p>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        <span>{ar ? currentCountry.fundingType : currentCountry.fundingTypeEn}</span>
                        <span className={`${isRtl ? "mr-1.5" : "ml-1.5"} inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold`}>
                          <Sparkles className="w-3 h-3" /> {t("globalUniEligibleApply")}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button asChild size="sm" variant="luxe" className="h-8 rounded-xl text-[11px]">
                        <a href={uni.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className={`w-3 h-3 ${isRtl ? "ml-1" : "mr-1"}`} />
                          {t("globalUniWebsite")}
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Primary Standalone Modal Opener Button (Matches Screenshot 2 Exactly) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUniDetail({ uni, country: currentCountry });
                    }}
                    className="mt-3 w-full h-10 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-gold hover:brightness-105 active:scale-[0.99] transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{t("globalUniFullDetails")}</span>
                  </button>
                </motion.div>
              );
            })}

            {filteredUniversities.length === 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 text-center text-sm text-muted-foreground space-y-2">
                <p>{t("globalUniNoResults")}</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-primary font-bold underline hover:no-underline"
                  >
                    {t("globalUniResetSearch")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Standalone University Details Modal (Matching Arab Universities Sheet & Screenshots Exactly) */}
      <Sheet open={!!selectedUniDetail} onOpenChange={(open) => !open && setSelectedUniDetail(null)}>
        <SheetContent side="bottom" dir={dir} className="max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20 rounded-t-3xl">
          {selectedUniDetail && (() => {
            const { uni, country } = selectedUniDetail;
            const cityText = ar ? uni.city : (uni.cityEn || getGlobalCityLabel(uni.city, lang));
            const countryText = ar ? country.country : country.countryEn;

            // Curated faculties/specializations based on country and university highlights
            const defaultFaculties = isRtl
              ? ["الهندسة", "علوم الحاسب", "الذكاء الاصطناعي", "الأمن السيبراني", "الطب البشري والصيدلة", "إدارة الأعمال والاقتصاد", "العلوم التطبيقية"]
              : ["Engineering", "Computer Science", "Artificial Intelligence", "Cybersecurity", "Medicine & Pharmacy", "Business & Economics", "Applied Sciences"];

            // Curated standard required documents for global scholarships
            const requiredDocs = isRtl
              ? [
                  "شهادة الثانوية العامة أو البكالوريا مصدّقة + كشف الدرجات",
                  "جواز سفر ساري المفعول لمدة سنة على الأقل",
                  "شهادة ميلاد مترجمة ومصدّقة رسمياً",
                  "صور شخصية حديثة بخلفية بيضاء",
                  "شهادة كفاءة لغة إنجليزية (IELTS / TOEFL) للبرامج الإنجليزية أو شهادة إتقان لغة البلد",
                  "تقرير طبي يثبت الخلو من الأمراض المعدية"
                ]
              : [
                  "Certified High School / Bachelor Diploma + Academic Transcripts",
                  "Valid Passport for at least 12 months",
                  "Certified Official Translated Birth Certificate",
                  "Recent Passport-Sized Photographs with White Background",
                  "English Proficiency Certificate (IELTS / TOEFL) or Native Language Proof",
                  "Comprehensive Medical Fitness Report"
                ];

            // Curated application steps
            const appSteps = isRtl
              ? [
                  `الاطلاع على شروط القبول والتخصصات المتاحة عبر البوابة الحكومية المعتمدة لـ ${country.country}`,
                  "ترجمة وتصديق كافة المستندات الأكاديمية والشهادات من وزارة الخارجية والسفارة المعنية",
                  `إنشاء حساب رسمي على بوابة المنحة الحكومية (${country.scholarshipName}) واختيار ${uni.name}`,
                  "تعبئة استمارة الرغبات وتحميل ملفات المستندات وسداد رسوم المعالجة إن وجدت",
                  "استلام إشعار القبول الرسمي النهائي واستخراج تأشيرة الطالب الدراسية وحجز السفر"
                ]
              : [
                  `Review eligibility and available degree majors on the official portal for ${country.countryEn}`,
                  "Translate and notarize all academic transcripts and certificates via Ministry of Foreign Affairs",
                  `Register on the official government portal (${country.scholarshipNameEn}) and select ${uni.nameEn || uni.name}`,
                  "Complete academic preferences form, upload required portfolio, and submit",
                  "Receive official acceptance letter, process student visa, and arrange enrollment"
                ];

            const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${uni.nameEn || uni.name} ${uni.cityEn || uni.city} ${country.countryEn || country.country}`
            )}`;

            return (
              <>
                <SheetHeader>
                  <div className={`flex items-center gap-3 mb-2 ${isRtl ? "" : "flex-row-reverse"}`}>
                    <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-2xl shadow-gold flex-shrink-0">
                      {country.flag}
                    </div>
                    <div className={`flex-1 ${alignClass}`}>
                      <SheetTitle className="text-lg font-bold font-display text-gold-gradient">
                        {ar ? uni.name : (uni.nameEn || uni.name)}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cityText} · {countryText}
                      </p>
                    </div>
                  </div>
                </SheetHeader>

                <div className={`space-y-4 mt-4 ${alignClass}`}>
                  {/* University Highlights Summary */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {ar ? uni.highlights : (uni.highlightsEn || uni.highlights)}
                  </p>

                  {/* 6-Cell Information Grid (Matching Screenshot 1 & Arab Modal Exactly) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("globalUniCityLabel")}</p>
                      <p className="text-foreground font-bold mt-1">{cityText}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("globalUniMinAdmissionLabel")}</p>
                      <p className="text-foreground font-bold mt-1 text-primary">{uni.ranking || (isRtl ? "تنافسي / 85%+" : "85%+")}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("globalUniInstTypeLabel")}</p>
                      <p className="text-foreground font-bold mt-1">{t("globalUniInstTypeValue")}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("globalUniLangLabel")}</p>
                      <p className="text-foreground font-bold mt-1">
                        {getStudyLanguageLabels(country.studyLanguages, lang).join(" / ")}
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3 col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-primary" />
                        {t("globalUniTuitionLabel")}
                      </p>
                      <p className="text-foreground font-bold mt-1 text-emerald-400">
                        {t("globalUniTuitionCovered")}
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3 col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Home className="w-3 h-3 text-primary" />
                        {t("globalUniLivingLabel")}
                      </p>
                      <p className="text-foreground font-bold mt-1">
                        {t("globalUniLivingCovered")}
                      </p>
                    </div>
                  </div>

                  {/* Application Deadlines Section 📅 */}
                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      {t("globalUniDeadlinesTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {t("globalUniDeadlinesDesc").replace(
                        "{window}",
                        ar ? country.applicationWindow : country.applicationWindowEn
                      )}
                    </p>
                  </div>

                  {/* Associated Government Scholarship Highlight */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                    <p className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t("globalUniAssociatedScholarshipTitle")}</span>
                    </p>
                    <p className="font-bold text-foreground text-sm">
                      {ar ? country.scholarshipName : country.scholarshipNameEn}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(ar ? country.coverage : country.coverageEn).map((cov, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-background/70 border border-emerald-500/20 text-foreground">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{cov}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Faculties & Majors 🏛️ */}
                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {t("globalUniFacultiesTitle")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {defaultFaculties.map((fac) => (
                        <span key={fac} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents 📑 (With Green Checkmarks) */}
                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("globalUniDocsTitle")}
                    </p>
                    <ul className="space-y-1.5">
                      {requiredDocs.map((doc, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Application Steps 🔢 (Numbered 1-5) */}
                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      {t("globalUniStepsTitle")}
                    </p>
                    <ol className="space-y-1.5">
                      {appSteps.map((step, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-4 h-4 shrink-0 rounded-full bg-primary/15 border border-primary/30 text-primary text-[9px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Dual Action Buttons at Bottom: Map Location & Official Website */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={mapSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 rounded-xl border border-primary/30 bg-background/60 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                    >
                      <MapIcon className="w-4 h-4" />
                      {t("globalUniLocationMap")}
                    </a>
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:brightness-105 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t("globalUniVisitOfficialSite")}
                    </a>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

