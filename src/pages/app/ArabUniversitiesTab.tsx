import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ExternalLink, MapPin, Languages as LangIcon,
  Award, SlidersHorizontal, Building2, ChevronRight, Sparkles, Target, Filter,
  Wallet, Home, CalendarDays, FileText, ListChecks, Map as MapIcon, Scale, X,
  Info, Users, Quote, CheckCircle2, ShieldCheck, Search, Flame, Compass,
} from "lucide-react";
import {
  ARAB_UNIVERSITIES, ARAB_COUNTRY_STATS, ARAB_FACULTIES,
  getUniDetails, getFacultyLabel, getCityLabel, type ArabUniversity,
  type ArabUniType,
} from "@/lib/arabUniversities";
import { GlobalUniversitiesView } from "@/pages/app/GlobalUniversitiesView";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuxeAlumniPresenceCard } from "@/components/foras/LuxeAlumniPresenceCard";

const PCT_KEY = "foras-student-percentage";

const typeBadgeClass: Record<ArabUniType, string> = {
  government: "bg-primary/15 text-primary border-primary/40",
  private: "bg-amber-500/15 text-amber-500 border-amber-500/40",
  technical: "bg-blue-500/15 text-blue-400 border-blue-500/40",
};

export const ArabUniversitiesTab = () => {
  const { lang, t, dir } = useLanguage();
  const { countryCode } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [activeSubTab, setActiveSubTab] = useState<"arab" | "global">("arab");
  const [globalCountryParam, setGlobalCountryParam] = useState<string | null>(null);

  const [country, setCountry] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ArabUniType | "">("");
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [activeScholarshipOnly, setActiveScholarshipOnly] = useState(false);
  const [alumniOnly, setAlumniOnly] = useState(false);
  const [presenceOnly, setPresenceOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pct, setPct] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(PCT_KEY) ?? "" : ""));
  const [eligibleOnly, setOnlyEligible] = useState(false);
  const [selected, setSelected] = useState<ArabUniversity | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Parse incoming URL query params (e.g. from Landing page clicks)
  useEffect(() => {
    const subTabParam = searchParams.get("subTab");
    const gParam = searchParams.get("globalCountry");
    if (subTabParam === "global" || gParam) {
      setActiveSubTab("global");
      if (gParam) setGlobalCountryParam(gParam);
    } else if (subTabParam === "arab") {
      setActiveSubTab("arab");
    }

    const cParam = searchParams.get("country");
    const uParam = searchParams.get("uni");

    if (cParam) {
      const match = ARAB_COUNTRY_STATS.find(
        (c) =>
          c.country.toLowerCase() === cParam.toLowerCase() ||
          c.countryEn.toLowerCase() === cParam.toLowerCase() ||
          c.code.toLowerCase() === cParam.toLowerCase()
      );
      if (match) {
        setCountry(match.country);
      } else {
        setCountry(cParam);
      }
    }

    if (uParam) {
      const matchUni = ARAB_UNIVERSITIES.find(
        (u) => u.id === uParam || u.name === uParam || (u.nameEn && u.nameEn.toLowerCase() === uParam.toLowerCase())
      );
      if (matchUni) {
        setSelected(matchUni);
        if (!cParam) {
          setCountry(matchUni.country);
        }
      }
    }
  }, [searchParams]);

  const effectivePct = useMemo(() => {
    const n = parseFloat(pct);
    if (Number.isFinite(n) && n > 0 && n <= 100) return n;
    return undefined;
  }, [pct]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pct) localStorage.setItem(PCT_KEY, pct);
  }, [pct]);

  const showCountries = !country;

  const currentCountryStat = useMemo(() => {
    if (!country) return null;
    return ARAB_COUNTRY_STATS.find((c) => c.country === country || c.countryEn === country) || null;
  }, [country]);

  // Countries sorted with user's geolocation country first
  const countries = useMemo(() => {
    const mine = countryCode?.toUpperCase();
    return [...ARAB_COUNTRY_STATS].sort((a, b) => {
      const am = a.code === mine ? 0 : 1;
      const bm = b.code === mine ? 0 : 1;
      return am - bm || b.count - a.count;
    });
  }, [countryCode]);

  const list = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let items = ARAB_UNIVERSITIES.filter((u) => {
      if (country && u.country !== country) return false;
      if (faculty && !u.faculties.includes(faculty)) return false;
      if (typeFilter && u.type !== typeFilter) return false;
      if (scholarshipOnly && !u.scholarships) return false;
      if (activeScholarshipOnly && !u.activeScholarship) return false;
      if (alumniOnly && (!u.notableAlumni || u.notableAlumni.length === 0)) return false;
      if (presenceOnly && !u.studentPresence) return false;
      if (eligibleOnly && effectivePct !== undefined && effectivePct < u.minPercentage) return false;

      if (!q) return true;

      // Deep text matching
      const matchesStandard = (
        u.name.toLowerCase().includes(q) ||
        (u.nameEn && u.nameEn.toLowerCase().includes(q)) ||
        u.city.toLowerCase().includes(q) ||
        (u.cityEn && u.cityEn.toLowerCase().includes(q)) ||
        u.country.toLowerCase().includes(q) ||
        (u.countryEn && u.countryEn.toLowerCase().includes(q)) ||
        u.highlights.toLowerCase().includes(q) ||
        (u.highlightsEn && u.highlightsEn.toLowerCase().includes(q)) ||
        u.faculties.some((f) => f.toLowerCase().includes(q))
      );
      if (matchesStandard) return true;

      if (u.activeScholarship) {
        if (
          u.activeScholarship.name.toLowerCase().includes(q) ||
          (u.activeScholarship.nameEn && u.activeScholarship.nameEn.toLowerCase().includes(q)) ||
          u.activeScholarship.monthlyStipend.toLowerCase().includes(q) ||
          (u.activeScholarship.monthlyStipendEn && u.activeScholarship.monthlyStipendEn.toLowerCase().includes(q))
        ) return true;
      }

      if (u.notableAlumni && u.notableAlumni.length > 0) {
        const matchesAlumni = u.notableAlumni.some((a) =>
          a.pioneerName.toLowerCase().includes(q) ||
          (a.pioneerNameEn && a.pioneerNameEn.toLowerCase().includes(q)) ||
          a.currentRole.toLowerCase().includes(q) ||
          (a.currentRoleEn && a.currentRoleEn.toLowerCase().includes(q)) ||
          a.achievementShort.toLowerCase().includes(q) ||
          (a.achievementShortEn && a.achievementShortEn.toLowerCase().includes(q))
        );
        if (matchesAlumni) return true;
      }

      if (u.studentPresence) {
        if (
          (u.studentPresence.studentUnionOrClub && u.studentPresence.studentUnionOrClub.toLowerCase().includes(q)) ||
          (u.studentPresence.studentUnionOrClubEn && u.studentPresence.studentUnionOrClubEn.toLowerCase().includes(q)) ||
          (u.studentPresence.communityHighlight && u.studentPresence.communityHighlight.toLowerCase().includes(q)) ||
          (u.studentPresence.communityHighlightEn && u.studentPresence.communityHighlightEn.toLowerCase().includes(q))
        ) return true;
      }

      return false;
    });

    if (effectivePct !== undefined) {
      items = [...items].sort((a, b) => {
        const ea = effectivePct >= a.minPercentage ? 0 : 1;
        const eb = effectivePct >= b.minPercentage ? 0 : 1;
        if (ea !== eb) return ea - eb;
        return b.minPercentage - a.minPercentage;
      });
    }

    return items;
  }, [country, faculty, typeFilter, scholarshipOnly, activeScholarshipOnly, alumniOnly, presenceOnly, eligibleOnly, effectivePct, searchQuery]);

  const eligibleCount = useMemo(() => {
    if (effectivePct === undefined) return 0;
    const pool = country ? ARAB_UNIVERSITIES.filter((u) => u.country === country) : ARAB_UNIVERSITIES;
    return pool.filter((u) => effectivePct >= u.minPercentage).length;
  }, [effectivePct, country]);

  const totalInScope = country ? ARAB_UNIVERSITIES.filter((u) => u.country === country).length : ARAB_UNIVERSITIES.length;

  const langLabel = (l: ArabUniversity["language"]) =>
    l === "ar" ? (ar ? "عربي" : "Arabic") : l === "en" ? (ar ? "إنجليزي" : "English") : (ar ? "عربي/إنجليزي" : "Arabic/English");

  const typeLabel = (tp: ArabUniversity["type"]) => {
    if (tp === "government") return ar ? "حكومية" : "Public";
    if (tp === "technical") return ar ? "تقنية" : "Technical";
    return ar ? "خاصة" : "Private";
  };

  const toggleCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  const compareUnis = ARAB_UNIVERSITIES.filter((u) => compare.includes(u.id));
  const mapUrl = (u: ArabUniversity) =>
    `https://www.google.com/maps/search/${encodeURIComponent(`${u.nameEn || u.name} ${u.cityEn || u.city} ${u.countryEn}`)}`;

  const clearAllFilters = () => {
    setFaculty(null);
    setTypeFilter("");
    setScholarshipOnly(false);
    setActiveScholarshipOnly(false);
    setAlumniOnly(false);
    setPresenceOnly(false);
    setOnlyEligible(false);
    setSearchQuery("");
  };

  const hasActiveFilters = faculty || typeFilter || scholarshipOnly || activeScholarshipOnly || alumniOnly || presenceOnly || eligibleOnly || searchQuery;

  return (
    <div className="space-y-4 w-full" dir={dir}>
      {/* Header Banner - Matching UniversitiesGuide Gold/Luxe Theme */}
      <div className="rounded-3xl border border-primary/30 bg-card/70 backdrop-blur-xl p-4 sm:p-5 shadow-sm">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRtl ? "" : "sm:flex-row-reverse"}`}>
          <div className={`flex items-center gap-3 ${isRtl ? "" : "flex-row-reverse"}`}>
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-primary-foreground" strokeWidth={2} />
            </div>
            <div className={`flex-1 ${alignClass}`}>
              <h1 className="text-lg sm:text-xl font-bold font-display text-gold-gradient leading-tight">
                {t("arabUniTitle")}
              </h1>
            </div>
          </div>

          {/* SubTab Navigation Switcher (Arab Hub vs. World Hub) */}
          <div className="flex items-center gap-1.5 bg-background/80 border border-primary/25 p-1 rounded-2xl self-stretch sm:self-auto">
            <button
              onClick={() => setActiveSubTab("arab")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "arab"
                  ? "bg-gold-gradient text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🏛️</span>
              <span>{t("arabUnisSubTab")}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("global")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "global"
                  ? "bg-gold-gradient text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🌍</span>
              <span>{t("globalUnisSubTab")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO ACTIVE SUBTAB */}
      {activeSubTab === "global" ? (
        <GlobalUniversitiesView initialCountry={globalCountryParam} />
      ) : (
        <>
          {/* Smart Percentage Match Component (Unified from Sudanese Guide) */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
            <Target className="w-4 h-4 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div className={`flex-1 ${alignClass}`}>
            <p className="text-xs font-bold text-gold-gradient leading-tight">
              {t("arabUniMatchTitle")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("arabUniSmartMatchDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder={isRtl ? "مثال: 85.0" : "e.g. 85.0"}
              className={`bg-background/70 border-border text-sm h-10 ${alignClass}`}
              dir={dir}
            />
          </div>
          <span className="text-primary font-bold text-base px-1">%</span>
          {effectivePct !== undefined && (
            <button
              onClick={() => setOnlyEligible((v) => !v)}
              className={`text-[11px] font-bold px-3 py-2 rounded-xl border transition-all ${
                eligibleOnly
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm"
                  : "bg-background/60 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("arabUniEligibleOnly")}
            </button>
          )}
        </div>

        {effectivePct !== undefined && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-1"
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            {t("arabUniSmartMatchQualified")
              .replace("{pct}", String(effectivePct))
              .replace("{eligible}", String(eligibleCount))
              .replace("{total}", String(totalInScope))
              .replace(
                "{scope}",
                country ? t("arabUniInCountry").replace("{country}", country) : t("arabUniAllScope")
              )}
          </motion.p>
        )}
      </div>

      {/* Countries Grid (When not filtering by specific country) */}
      {showCountries ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              {t("arabUniCountriesTitle")}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {countries.length} {isRtl ? "دولة" : "countries"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {countries.map((c, i) => {
              const mine = c.code === countryCode?.toUpperCase();
              return (
                <motion.button
                  key={c.country}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setCountry(c.country)}
                  className={`relative text-start rounded-2xl border p-3.5 bg-card/60 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 ${
                    mine ? "border-primary shadow-[0_0_18px_-6px_hsl(var(--primary)/0.6)]" : "border-primary/20"
                  }`}
                >
                  {mine && (
                    <span className={`absolute top-2.5 ${isRtl ? "left-2.5" : "right-2.5"} text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary text-primary font-bold`}>
                      {t("arabUniYourCountry")}
                    </span>
                  )}
                  <div className="text-2xl mb-1">{c.flag}</div>
                  <p className="text-sm font-bold text-primary truncate leading-tight">
                    {ar ? c.country : c.countryEn}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t("arabUniUnisCount").replace("{n}", String(c.count))}
                  </p>
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 border border-primary/20 text-muted-foreground font-medium">
                      {t("arabUniMin")} {c.minPercentage}%
                    </span>
                    {c.scholarships && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium">
                        {t("arabUniHasScholarships")}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Selected Country View */
        <div className="space-y-3">
          {/* Navigation & Controls Top Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {country && (
              <button
                onClick={() => {
                  setCountry(null);
                  setFaculty(null);
                }}
                className="h-9 px-3.5 rounded-full text-xs font-bold border border-primary/30 bg-card/80 text-primary flex items-center gap-1.5 hover:bg-primary/10 transition-all"
              >
                <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? "" : "rotate-180"}`} />
                <span>{t("arabUniBackToCountries")} ({isRtl ? country : (currentCountryStat?.countryEn || country)})</span>
              </button>
            )}
            <p className="text-xs text-muted-foreground font-medium">
              {t("arabUniResults").replace("{n}", String(list.length))}
            </p>
          </div>

          {/* Country Official Sources & Scholarships Showcase */}
          {currentCountryStat && (
            <div className="rounded-2xl border border-primary/30 bg-card/75 backdrop-blur-md p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary/15">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentCountryStat.flag}</span>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2 flex-wrap">
                      <span>{isRtl ? currentCountryStat.country : currentCountryStat.countryEn}</span>
                      {currentCountryStat.scholarships && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                          ✨ {t("arabUniScholarshipsAvailable")}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("arabUniInstitutionsCount")
                        .replace("{count}", String(currentCountryStat.count))
                        .replace("{min}", String(currentCountryStat.minPercentage))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-2xs text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t("arabUniOfficialPortalsBanner")}</span>
                </div>
              </div>

              {/* Scholarship Type Info */}
              {currentCountryStat.scholarshipType && (
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2 text-xs">
                  <span className="text-sm">🎓</span>
                  <div>
                    <span className="font-bold text-primary">
                      {t("arabUniScholarshipTypeLabel")}{" "}
                    </span>
                    <span className="text-foreground/90 font-medium">
                      {isRtl ? currentCountryStat.scholarshipType : currentCountryStat.scholarshipTypeEn}
                    </span>
                  </div>
                </div>
              )}

              {/* Official Portals Links */}
              {currentCountryStat.officialPortals && currentCountryStat.officialPortals.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-2xs font-bold text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-primary" />
                    {t("arabUniOfficialPortalsLabel")}
                  </span>
                  {currentCountryStat.officialPortals.map((portal) => (
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
          )}

          {/* Advanced Dropdown & Pill Filter Controls */}
          <div className="space-y-2.5 rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-3">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("arabUniSearchPlaceholder")}
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

            <div className="flex flex-wrap gap-2">
              {/* Major / Faculty Dropdown Filter */}
              <select
                value={faculty || ""}
                onChange={(e) => setFaculty(e.target.value ? e.target.value : null)}
                className={`flex-1 min-w-[140px] h-9 rounded-xl bg-background/60 border border-border text-xs px-2.5 text-foreground ${alignClass}`}
                dir={dir}
              >
                <option value="">{t("arabUniAllMajorsOption")}</option>
                {ARAB_FACULTIES.map((f) => (
                  <option key={f} value={f}>{getFacultyLabel(f, lang)}</option>
                ))}
              </select>

              {/* Institution Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ArabUniType | "")}
                className={`flex-1 min-w-[120px] h-9 rounded-xl bg-background/60 border border-border text-xs px-2.5 text-foreground ${alignClass}`}
                dir={dir}
              >
                <option value="">{t("arabUniAllUnisOption")}</option>
                <option value="government">{t("arabUniGovOption")}</option>
                <option value="private">{t("arabUniPrivOption")}</option>
                <option value="technical">{t("arabUniTechOption")}</option>
              </select>
            </div>

            {/* Quick Toggle Chips: Scholarships & Flagships & Compare Status */}
            <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setActiveScholarshipOnly(false);
                    setAlumniOnly(false);
                    setPresenceOnly(false);
                    setScholarshipOnly(false);
                  }}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                    !activeScholarshipOnly && !alumniOnly && !presenceOnly && !scholarshipOnly
                      ? "bg-primary/20 border-primary text-primary shadow-sm"
                      : "bg-background/50 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>{t("globalUniFilterAll")}</span>
                </button>

                <button
                  onClick={() => setActiveScholarshipOnly((v) => !v)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                    activeScholarshipOnly
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm"
                      : "bg-background/50 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flame className="w-3 h-3 text-emerald-400" />
                  <span>{t("globalUniFilterScholarships")}</span>
                </button>

                <button
                  onClick={() => setAlumniOnly((v) => !v)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                    alumniOnly
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                      : "bg-background/50 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="w-3 h-3 text-amber-400" />
                  <span>{t("globalUniFilterAlumni")}</span>
                </button>

                <button
                  onClick={() => setPresenceOnly((v) => !v)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                    presenceOnly
                      ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm"
                      : "bg-background/50 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="w-3 h-3 text-blue-400" />
                  <span>{t("globalUniFilterPresence")}</span>
                </button>

                <button
                  onClick={() => setScholarshipOnly((v) => !v)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                    scholarshipOnly
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-background/50 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>{t("arabUniHasScholarships")}</span>
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-primary flex items-center gap-1 hover:underline ml-auto"
                >
                  <Filter className="w-3 h-3" />
                  <span>{t("arabUniClearFilters")}</span>
                </button>
              )}
            </div>
          </div>

          {/* Compare Hint Banner */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-primary" />
              {t("arabUniCompareHint")}
            </span>
            {compare.length > 0 && (
              <span className="text-primary font-bold">
                {t("arabUniSelectedCompare").replace("{count}", String(compare.length))}
              </span>
            )}
          </div>

          {/* Universities List with Full Ported Design & Direct Modal Details */}
          <div className="space-y-3">
            {list.map((u, i) => {
              const qualifies = effectivePct !== undefined ? effectivePct >= u.minPercentage : null;
              const isCompared = compare.includes(u.id);
              const cityText = ar ? u.city : (u.cityEn || getCityLabel(u.city, lang));
              const countryText = ar ? u.country : u.countryEn;

              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setSelected(u)}
                  className={`rounded-2xl border bg-card/60 backdrop-blur-md p-4 transition-all hover:border-primary/50 cursor-pointer group hover:bg-card/80 ${
                    isCompared
                      ? "border-primary shadow-[0_0_18px_-4px_hsl(var(--primary)/0.4)]"
                      : "border-primary/20"
                  }`}
                >
                  {/* Card Header: Name, Country, Flag, Badge */}
                  <div className={`flex items-start justify-between gap-3 mb-2.5 ${isRtl ? "" : "flex-row-reverse"}`}>
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                        {u.flag}
                      </div>
                      <div className={`flex-1 min-w-0 ${alignClass}`}>
                        <h3 className="text-base font-bold font-display text-gold-gradient truncate leading-snug group-hover:text-primary transition-colors">
                          {ar ? u.name : (u.nameEn || u.name)}
                        </h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{cityText} · {countryText}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${typeBadgeClass[u.type]}`}>
                        {typeLabel(u.type)}
                      </span>
                      {u.activeScholarship && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{ar ? "منحة مباشرة نشطة 🔥" : "Active Direct Grant 🔥"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Highlights Summary */}
                  <p className={`text-xs text-foreground/85 leading-relaxed mb-2.5 ${alignClass}`}>
                    {ar ? u.highlights : (u.highlightsEn || u.highlights)}
                  </p>

                  {/* Meta Badges: Language, Scholarships, Alumni, Presence, Faculties */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-primary/10 text-muted-foreground flex items-center gap-1">
                      <LangIcon className="w-3 h-3 text-primary" />
                      {langLabel(u.language)}
                    </span>
                    {u.activeScholarship ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>{ar ? u.activeScholarship.name : (u.activeScholarship.nameEn || u.activeScholarship.name)}</span>
                      </span>
                    ) : u.scholarships ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {t("arabUniHasScholarships")}
                      </span>
                    ) : null}

                    {u.notableAlumni && u.notableAlumni.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-amber-400" />
                        <span>{isRtl ? `رائد: ${u.notableAlumni[0].pioneerName}` : `Alumni: ${u.notableAlumni[0].pioneerNameEn || u.notableAlumni[0].pioneerName}`}</span>
                      </span>
                    )}

                    {u.studentPresence && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span>{isRtl ? (u.studentPresence.studentUnionOrClub || "تواجد طلابي عربي") : (u.studentPresence.studentUnionOrClubEn || u.studentPresence.studentUnionOrClub || "Arab Student Presence")}</span>
                      </span>
                    )}

                    {u.faculties.slice(0, 5).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 text-foreground/80"
                      >
                        {getFacultyLabel(f, lang)}
                      </span>
                    ))}
                    {u.faculties.length > 5 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground">
                        +{u.faculties.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Percentage & Admission Requirements Bar + Action Links */}
                  <div className={`flex items-center justify-between gap-2 pt-2.5 border-t border-border/60 ${isRtl ? "" : "flex-row-reverse"}`}>
                    <div className={alignClass}>
                      <p className="text-[10px] text-muted-foreground">
                        {isRtl ? "أقل نسبة قبول تقديرية" : "Approx. min. percentage"}
                      </p>
                      <p className={`text-sm font-bold ${
                        qualifies === true ? "text-emerald-400"
                        : qualifies === false ? "text-muted-foreground"
                        : "text-primary"
                      }`}>
                        {u.minPercentage}%
                        {qualifies === true && (
                          <span className={`${isRtl ? "mr-1.5" : "ml-1.5"} inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold`}>
                            <Sparkles className="w-3 h-3" /> {isRtl ? "مؤهل للقبول ✓" : "Eligible ✓"}
                          </span>
                        )}
                        {qualifies === false && (
                          <span className={`${isRtl ? "mr-1.5" : "ml-1.5"} inline-flex items-center text-[10px] text-muted-foreground`}>
                            {isRtl ? "أعلى من نسبتك" : "Above score"}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleCompare(u.id, e)}
                        className={`h-8 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 ${
                          isCompared
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-background/60 border-primary/20 text-muted-foreground hover:text-foreground"
                        }`}
                        title={t("arabUniCompare")}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t("arabUniCompare")}</span>
                      </button>

                      <Button asChild size="sm" variant="luxe" className="h-8 rounded-xl text-[11px]">
                        <a href={u.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className={`w-3 h-3 ${isRtl ? "ml-1" : "mr-1"}`} />
                          {isRtl ? "الموقع" : "Website"}
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Primary Standalone Modal Opener Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(u);
                    }}
                    className="mt-3 w-full h-10 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-gold hover:brightness-105 active:scale-[0.99] transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isRtl ? "التفاصيل الكاملة" : "Full Details"}</span>
                  </button>
                </motion.div>
              );
            })}

            {list.length === 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-8 text-center text-sm text-muted-foreground space-y-2">
                <p>{t("arabUniEmpty")}</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary font-bold underline hover:no-underline"
                  >
                    {isRtl ? "إلغاء جميع الفلاتر للبدء من جديد" : "Reset all filters to start over"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

        {/* Action Button at Bottom if filtering */}
      </>
      )}

      {/* Floating Comparison Bottom Bar */}
      {compare.length > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-40 px-4">
          <div className="mx-auto max-w-md rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-xl p-2.5 flex items-center gap-2 shadow-2xl">
            <button
              onClick={() => setCompareOpen(true)}
              className="flex-1 h-10 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold shadow-md hover:brightness-105 flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />
              {t("arabUniCompareOpen").replace("{n}", String(compare.length))}
            </button>
            <button
              onClick={() => setCompare([])}
              aria-label={t("arabUniClear")}
              className="w-10 h-10 rounded-xl border border-primary/30 text-muted-foreground flex items-center justify-center hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Sheet Modal */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent side="bottom" dir={dir} className="max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20 rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className={`text-primary flex items-center gap-2 ${alignClass}`}>
              <Scale className="w-5 h-5" />
              {t("arabUniCompare")}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-x-auto">
            <table className={`w-full text-xs ${alignClass}`}>
              <thead>
                <tr>
                  <th className={`p-2 text-muted-foreground font-normal ${alignClass}`}> </th>
                  {compareUnis.map((u) => (
                    <th key={u.id} className={`p-2 text-primary font-bold min-w-[130px] ${alignClass}`}>
                      {u.flag} {ar ? u.name : (u.nameEn || u.name)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  [t("arabUniCity"), (u: ArabUniversity) => `${ar ? u.city : (u.cityEn || getCityLabel(u.city, lang))} · ${ar ? u.country : u.countryEn}`],
                  [t("arabUniType"), (u: ArabUniversity) => typeLabel(u.type)],
                  [t("arabUniMin"), (u: ArabUniversity) => `${u.minPercentage}%`],
                  [t("arabUniLanguage"), (u: ArabUniversity) => langLabel(u.language)],
                  [t("arabUniHasScholarships"), (u: ArabUniversity) => (u.scholarships ? (isRtl ? "متاحة ✓" : "Available ✓") : "—")],
                  [t("arabUniTuition"), (u: ArabUniversity) => (ar ? getUniDetails(u).tuition : getUniDetails(u).tuitionEn)],
                  [t("arabUniLiving"), (u: ArabUniversity) => (ar ? getUniDetails(u).living : getUniDetails(u).livingEn)],
                ].map(([label, fn], idx) => (
                  <tr key={idx} className="border-t border-primary/10">
                    <td className="p-2 text-muted-foreground whitespace-nowrap font-medium">{label as string}</td>
                    {compareUnis.map((u) => (
                      <td key={u.id} className="p-2 leading-relaxed">
                        {(fn as (x: ArabUniversity) => string)(u)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Standalone University Details Modal */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" dir={dir} className="max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20 rounded-t-3xl">
          {selected && (() => {
            const d = getUniDetails(selected);
            const cityText = ar ? selected.city : (selected.cityEn || getCityLabel(selected.city, lang));
            const countryText = ar ? selected.country : selected.countryEn;

            return (
              <>
                <SheetHeader>
                  <div className={`flex items-center gap-3 mb-2 ${isRtl ? "" : "flex-row-reverse"}`}>
                    <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-2xl shadow-gold flex-shrink-0">
                      {selected.flag}
                    </div>
                    <div className={`flex-1 ${alignClass}`}>
                      <SheetTitle className="text-lg font-bold font-display text-gold-gradient">
                        {ar ? selected.name : (selected.nameEn || selected.name)}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cityText} · {countryText}
                      </p>
                    </div>
                  </div>
                </SheetHeader>

                <div className={`space-y-4 mt-4 ${alignClass}`}>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {ar ? selected.highlights : (selected.highlightsEn || selected.highlights)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniCity")}</p>
                      <p className="text-foreground font-bold mt-1">{cityText}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniMin")}</p>
                      <p className="text-foreground font-bold mt-1 text-primary">{selected.minPercentage}%</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniType")}</p>
                      <p className="text-foreground font-bold mt-1">{typeLabel(selected.type)}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniLanguage")}</p>
                      <p className="text-foreground font-bold mt-1">{langLabel(selected.language)}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3 col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-primary" />
                        {t("arabUniTuition")}
                      </p>
                      <p className="text-foreground font-bold mt-1">{ar ? d.tuition : d.tuitionEn}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3 col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Home className="w-3 h-3 text-primary" />
                        {t("arabUniLiving")}
                      </p>
                      <p className="text-foreground font-bold mt-1">{ar ? d.living : d.livingEn}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      {t("arabUniSeasons")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ar ? d.seasons : d.seasonsEn}</p>
                  </div>

                  {/* Luxe Alumni & Student Presence Spotlight */}
                  <LuxeAlumniPresenceCard
                    activeScholarship={selected.activeScholarship}
                    studentPresence={selected.studentPresence}
                    notableAlumni={selected.notableAlumni}
                    universityName={ar ? selected.name : (selected.nameEn || selected.name)}
                  />

                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {t("arabUniFaculties")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.faculties.map((f) => (
                        <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                          {getFacultyLabel(f, lang)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("arabUniDocs")}
                    </p>
                    <ul className="space-y-1.5">
                      {(ar ? d.docs : d.docsEn).map((doc) => (
                        <li key={doc} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      {t("arabUniSteps")}
                    </p>
                    <ol className="space-y-1.5">
                      {(ar ? d.steps : d.stepsEn).map((s, i) => (
                        <li key={s} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-4 h-4 shrink-0 rounded-full bg-primary/15 border border-primary/30 text-primary text-[9px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={mapUrl(selected)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 rounded-xl border border-primary/30 bg-background/60 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                    >
                      <MapIcon className="w-4 h-4" />
                      {t("arabUniMap")}
                    </a>
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:brightness-105 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t("arabUniVisit")}
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

export default ArabUniversitiesTab;
