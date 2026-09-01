import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Brain,
  BadgeCheck,
  Clock,
  MapPin,
  Mail,
  Rocket,
  Target,
  Database,
  Languages,
  Briefcase,
  GraduationCap,
  FileText,
  Coins,
  Globe2,
  Building2,
  DollarSign,
  TrendingUp,
  Star,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/foras/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Scholarship } from "@/lib/mockData";
import { JOBS, Job } from "@/lib/jobsData";
import { ARAB_COUNTRY_STATS } from "@/lib/arabUniversities";
import { GLOBAL_COUNTRIES } from "@/lib/globalUniversities";
import { dynamicStore } from "@/lib/dynamicStore";
import { ScholarshipAcademyModal } from "@/components/foras/ScholarshipAcademyModal";
import { SCHOLARSHIP_ACADEMY_TRACKS } from "@/lib/scholarshipAcademyData";

// Render Arabic text with diacritics (tashkeel) highlighted in a lighter gold/white
const TashkeelText = ({ children, className = "" }: { children: string; className?: string }) => {
  const chars = Array.from(children);
  return (
    <span className={className}>
      {chars.map((ch, i) => {
        const isHaraka = /[\u064B-\u0652\u0670]/.test(ch);
        if (isHaraka) {
          return (
            <span
              key={i}
              className="text-white/95 transition-all duration-300 group-hover:text-primary-glow group-hover:[text-shadow:0_0_8px_hsl(var(--primary-glow)/0.9)]"
            >
              {ch}
            </span>
          );
        }
        return <span key={i}>{ch}</span>;
      })}
    </span>
  );
};

const Landing = () => {
  const { t, dir, lang, toggleLang, setLang } = useLanguage();
  const isRtl = dir === "rtl";
  const nav = useNavigate();
  const { user } = useAuth();

  // Dynamic live scholarships synced with dynamicStore
  const [featuredScholarships, setFeaturedScholarships] = useState<Scholarship[]>([]);
  // Dynamic live jobs synced with dynamicStore and jobsData
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  // Show more / less state for Arab & Global countries on Landing page
  const [showAllArabCountries, setShowAllArabCountries] = useState(false);
  const [showAllGlobalCountries, setShowAllGlobalCountries] = useState(false);
  
  // 🎓 Scholarship Academy Modal State
  const [academyOpen, setAcademyOpen] = useState(false);
  const [selectedAcademyTrack, setSelectedAcademyTrack] = useState<string | null>(null);

  const loadScholarships = () => {
    const all = dynamicStore.getScholarships();
    const sorted = [...all].sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return (b.match_score || 0) - (a.match_score || 0);
    });
    setFeaturedScholarships(sorted.slice(0, 4));
  };

  const loadJobs = () => {
    const custom = dynamicStore.getJobs();
    const convertedCustom: Job[] = custom.map((c) => ({
      id: c.id,
      title: c.title_ar,
      titleEn: c.title_en,
      company: c.company,
      emoji: "💼",
      type: "عمل عن بعد / مشروع حر",
      typeEn: "Remote / Freelance",
      category: "programming" as any,
      salary: { min: 500, max: 2500, currency: "USD", period: "project" as const, average: c.salary || "$1,500+" },
      rating: { score: 4.9, totalReviews: 95, trustLevel: "موثوق", trustLevelEn: "Verified" },
      description: c.description_ar,
      descriptionEn: c.description_en,
      skills: c.skills || ["مهارات مهنية", "تواصل"],
      skillsEn: ["Professional Skills", "Communication"],
      availability: { global: true, countries: ["كل الدول"], restrictedCountries: [] },
      withdrawal: { minAmount: 50, currency: "USD", methods: [] },
      requirements: ["مهارات تقنية أو كتابية", "التزام بمواعيد التسليم"],
      registrationGuide: { steps: [] },
      contact: { website: c.apply_url },
    }));
    const customIds = new Set(convertedCustom.map((j) => j.id));
    const all = [...convertedCustom, ...JOBS.filter((j) => !customIds.has(j.id))];
    setFeaturedJobs(all.slice(0, 4) as Job[]);
  };

  useEffect(() => {
    loadScholarships();
    loadJobs();
    const handleDataUpdate = () => {
      loadScholarships();
      loadJobs();
    };
    window.addEventListener("foras:data-updated", handleDataUpdate);
    window.addEventListener("storage", handleDataUpdate);
    return () => {
      window.removeEventListener("foras:data-updated", handleDataUpdate);
      window.removeEventListener("storage", handleDataUpdate);
    };
  }, []);

  const goApp = (tab = "scholarships", params?: Record<string, string>) => {
    setLang(lang);
    const search = new URLSearchParams({ tab });
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) search.set(k, v);
      });
    }
    nav(`/app?${search.toString()}`);
  };

  const features = [
    {
      icon: ShieldCheck,
      title: t("landingFeature1Title"),
      body: t("landingFeature1Body"),
      tag: isRtl ? "موثوق & AI" : "Verified & AI",
    },
    {
      icon: GraduationCap,
      title: t("landingFeature2Title"),
      body: t("landingFeature2Body"),
      tag: isRtl ? "أكاديمي" : "Academic",
    },
    {
      icon: Briefcase,
      title: t("landingFeature3Title"),
      body: t("landingFeature3Body"),
      tag: isRtl ? "مهني / عن بعد" : "Remote & Global",
    },
    {
      icon: FileText,
      title: t("landingFeature4Title"),
      body: t("landingFeature4Body"),
      tag: isRtl ? "تنسيق ATS" : "ATS Format",
    },
    {
      icon: Coins,
      title: t("landingFeature5Title"),
      body: t("landingFeature5Body"),
      tag: isRtl ? "تحديث لحظي" : "Real-Time",
    },
  ];

  const whyCards = [
    { icon: Rocket, title: t("landingWhy1Title"), body: t("landingWhy1Body") },
    { icon: Target, title: t("landingWhy2Title"), body: t("landingWhy2Body") },
    { icon: Database, title: t("landingWhy3Title"), body: t("landingWhy3Body") },
  ];

  const bodyFont = lang === "ar" ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', system-ui, sans-serif";

  return (
    <div dir={dir} className="relative min-h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: bodyFont }}>
      {/* Ambient gold glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[350px] h-[350px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5 border-b border-primary/10 bg-background/50 backdrop-blur-md">
        <BrandMark size={78} />
        
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="group flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3.5 py-2 rounded-full hover:bg-primary/20 hover:border-primary/50 transition-all shadow-sm"
            title={lang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
          >
            <Languages className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
            <span>{lang === "ar" ? "English 🌐" : "العربية 🌐"}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-5 sm:px-10 pt-10 pb-12 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/30 text-primary uppercase mb-6 text-xs sm:text-sm font-semibold tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t("landingTagline")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.25] sm:leading-tight text-foreground">
            <span className="text-gold-gradient block">
              {t("landingHeadline")}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            {t("landingSubheadline")}
          </p>

          {/* Call To Action Buttons */}
          <div className="mt-8 flex items-center justify-center max-w-md mx-auto">
            {/* Primary CTA */}
            <Button
              variant="luxe"
              size="xl"
              onClick={() => goApp("scholarships")}
              className="w-full sm:w-[320px] py-4 text-base font-bold shadow-gold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <span>{t("landingCtaPrimary")}</span>
              <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 🌟 UNIFIED SECTION: دليل الجامعات العربية والعالمية (Arab & World Universities Guide) */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        {/* Main Unified Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-2xs font-bold mb-2.5 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{isRtl ? "دليل الجامعات والمنح المعتمدة" : "Accredited Universities & Grants Guide"}</span>
          </div>
          <h2
            className="font-bold text-2xl sm:text-3xl text-gold-gradient"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingArabHubTitle")}</TashkeelText> : t("landingArabHubTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-xl mx-auto leading-relaxed">
            {t("landingArabHubSubtitle")}
          </p>
        </div>

        {/* 🏛️ SUB-SECTION 1: الجامعات العربية (Arab Universities Hub) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-primary/15">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {isRtl ? "تغطية شاملة لأكثر من 8 دولة عربية" : "Comprehensive Coverage of 8+ Arab Nations"}
              </h3>
            </div>
            <span className="text-2xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              {ARAB_COUNTRY_STATS.length} {isRtl ? "دول" : "Countries"}
            </span>
          </div>

          {/* Arab Country Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(showAllArabCountries ? ARAB_COUNTRY_STATS : ARAB_COUNTRY_STATS.slice(0, 4)).map((c) => (
              <div
                key={c.country}
                onClick={() => goApp("arabUnis", { subTab: "arab", country: c.country })}
                className="glass rounded-2xl p-4 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden bg-card/80 shadow-2xs hover:scale-[1.02]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {lang === "ar" ? c.country : c.countryEn}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      {c.count} {isRtl ? "جامعة" : "Unis"}
                    </span>
                  </div>

                  <div className="space-y-1 text-2xs text-muted-foreground">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>{isRtl ? "الحد الأدنى للقبول:" : "Min. Admission:"}</span>
                      <span className="text-emerald-400 font-bold">%{c.minPercentage}+</span>
                    </div>
                    <p className="line-clamp-1 text-[11px] text-gray-300 font-medium pt-0.5">
                      {c.scholarships ? (isRtl ? "✨ منح ورعاية كاملة / حكومية" : "✨ Full Government Grants") : (isRtl ? "🏛️ قبول حكومي وخاص" : "🏛️ Public & Private")}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-2xs font-bold text-primary group-hover:text-primary-glow">
                  <span>{isRtl ? "استكشف الجامعات والمنح" : "Explore Hub"}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Show More / Show Less Button for Arab Countries */}
          {ARAB_COUNTRY_STATS.length > 4 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAllArabCountries(!showAllArabCountries)}
                className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
              >
                {showAllArabCountries ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>{isRtl ? "عرض أقل للدول العربية" : "Show Less Arab Nations"}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>
                      {isRtl
                        ? `عرض باقي الدول العربية (${ARAB_COUNTRY_STATS.length - 4} دول إضافية)`
                        : `Show More Arab Nations (+${ARAB_COUNTRY_STATS.length - 4})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 🌍 SUB-SECTION 2: الجامعات العالمية والمنح الدولية (Global Universities Hub) */}
        <div className="mt-9 space-y-3.5 pt-6 border-t border-primary/15">
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-primary/15">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌍</span>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {isRtl ? "15+ دولة عالمية رائدة مانحة" : "15+ Top Global Donor Nations"}
              </h3>
            </div>
            <span className="text-2xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {GLOBAL_COUNTRIES.length} {isRtl ? "دولة مانحة" : "Donor Nations"}
            </span>
          </div>

          {/* Global Country Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllGlobalCountries ? GLOBAL_COUNTRIES : GLOBAL_COUNTRIES.slice(0, 6)).map((g) => (
              <div
                key={g.country}
                onClick={() => goApp("arabUnis", { subTab: "global", globalCountry: g.country })}
                className="glass rounded-2xl p-4 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden bg-card/80 shadow-2xs hover:scale-[1.02]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{g.flag}</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {lang === "ar" ? g.country : g.countryEn}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        g.tier === "guaranteed"
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {g.tier === "guaranteed" ? (isRtl ? "سنوية مضمونة" : "Annual") : isRtl ? "دورية / نخبوية" : "Periodic"}
                    </span>
                  </div>

                  <div className="space-y-1 text-2xs text-muted-foreground">
                    <p className="text-xs font-bold text-primary truncate">
                      🏆 {lang === "ar" ? g.scholarshipName : g.scholarshipNameEn}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-gray-300">{lang === "ar" ? g.fundingType : g.fundingTypeEn}</span>
                      <span className="text-primary font-medium">{lang === "ar" ? g.applicationWindow : g.applicationWindowEn}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-2xs font-bold text-primary group-hover:text-primary-glow">
                  <span>{isRtl ? "استكشف ركن الدولة والمنحة" : "Explore Grants & Unis"}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Show More / Show Less Button for Global Countries */}
          {GLOBAL_COUNTRIES.length > 6 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAllGlobalCountries(!showAllGlobalCountries)}
                className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
              >
                {showAllGlobalCountries ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>{isRtl ? "عرض أقل للدول العالمية" : "Show Less Global Nations"}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>
                      {isRtl
                        ? `عرض باقي الدول العالمية (${GLOBAL_COUNTRIES.length - 6} دول إضافية)`
                        : `Show More Global Nations (+${GLOBAL_COUNTRIES.length - 6})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Unified Prominent CTA Button at Bottom */}
        <div className="mt-8 text-center">
          <Button
            variant="luxe"
            size="lg"
            onClick={() => goApp("arabUnis")}
            className="px-8 py-3 text-sm font-bold shadow-gold hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <span>{t("landingArabHubViewAll")}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </section>

      {/* Synchronized Live Scholarships Preview */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-2xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isRtl ? "محدثة تلقائياً مع الفرص الحية" : "Live Real-Time Sync"}</span>
          </div>
          <h2
            className="font-bold text-2xl sm:text-3xl text-gold-gradient"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingScholarshipsTitle")}</TashkeelText> : t("landingScholarshipsTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            {t("landingScholarshipsSubtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {featuredScholarships.map((s, i) => {
            const displayTitle = lang === "en" ? (s.title_en || s.titleEn || s.title_ar || s.title) : (s.title_ar || s.title);
            const displayOrg = lang === "en" ? (s.orgEn || s.university || s.org) : (s.org || s.university);
            const displayCountry = lang === "en" ? (s.countryEn || s.country) : s.country;
            const displayAmount = lang === "en" ? (s.amountEn || s.stipend || s.amount) : (s.stipend || s.amount);
            const displayDesc = lang === "en" ? (s.description_en || s.descriptionEn || s.description_ar || s.description) : (s.description_ar || s.description);

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="glass rounded-2xl p-5 border-primary/25 cursor-pointer transition-all hover:border-primary/60 shadow-luxe flex flex-col justify-between"
                onClick={() => goApp("scholarships")}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{s.flag}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {s.verified && <BadgeCheck className="w-4 h-4 text-[hsl(var(--verified))] flex-shrink-0" />}
                        <span className="text-xs sm:text-sm font-bold tracking-wide text-primary truncate">
                          {displayOrg}
                        </span>
                      </div>
                      {s.match_score && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-2xs font-bold flex-shrink-0">
                          {s.match_score}% {isRtl ? "تطابق" : "Match"}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-1">{displayTitle}</h3>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">{displayDesc}</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-2xs text-gray-300 pt-2 border-t border-primary/10">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        {displayCountry}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {s.deadline}
                      </span>
                      <span className="text-emerald-400 font-semibold mr-auto">
                        💰 {displayAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="luxe" size="lg" onClick={() => goApp("scholarships")} className="px-8 shadow-gold">
            <span>{t("landingViewAll")}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </section>

      {/* 🎓 ELITE SECTION: أكاديمية المنح والقبول الجامعي (Scholarship Readiness Academy Showcase) */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-2xs font-bold mb-2.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{t("academyBadge")}</span>
          </div>
          <h2
            className="font-bold text-2xl sm:text-3xl text-gold-gradient"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("academyTitle")}</TashkeelText> : t("academyTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-xl mx-auto leading-relaxed">
            {t("academySubtitle")}
          </p>
        </div>

        {/* 4 Interactive Track Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SCHOLARSHIP_ACADEMY_TRACKS.map((tr) => (
            <motion.div
              key={tr.id}
              whileHover={{ y: -3 }}
              onClick={() => {
                setSelectedAcademyTrack(tr.id);
                setAcademyOpen(true);
              }}
              className="glass rounded-2xl p-5 border-amber-500/25 cursor-pointer transition-all hover:border-amber-500/60 shadow-luxe flex flex-col justify-between bg-card/85 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-2xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40">
                    ⏱️ {lang === "ar" ? tr.estimatedReadTime : tr.estimatedReadTimeEn}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base group-hover:text-amber-500 transition-colors line-clamp-1">
                    {lang === "ar" ? tr.title : tr.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {lang === "ar" ? tr.subtitle : tr.subtitleEn}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3 border-t border-amber-500/15 flex items-center justify-between text-2xs font-bold text-amber-500">
                <span>{lang === "ar" ? "قراءة الدليل ونسخ النماذج" : "Read Guide & Copy Templates"}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button 
            variant="luxe" 
            size="lg" 
            onClick={() => {
              setSelectedAcademyTrack(null);
              setAcademyOpen(true);
            }} 
            className="px-8 shadow-gold font-bold text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t("academyOpenBtn")}</span>
          </Button>
        </div>
      </section>

      {/* 💼 NEW SECTION: أحدث فرص العمل الحر وعن بُعد (Freelance & Remote Work Hub) */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-2xs font-bold mb-2.5 shadow-sm">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isRtl ? "دخل بالدولار ومشاريع عالمية" : "USD Earnings & Global Projects"}</span>
          </div>
          <h2
            className="font-bold text-2xl sm:text-3xl text-gold-gradient"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingFreelanceTitle")}</TashkeelText> : t("landingFreelanceTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
            {t("landingFreelanceSubtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {featuredJobs.map((job, idx) => {
            const displayTitle = lang === "en" ? job.titleEn || job.title : job.title;
            const displayDesc = lang === "en" ? job.descriptionEn || job.description : job.description;
            const earning = job.salary.average || `$${job.salary.min} - $${job.salary.max} / ${job.salary.period === "month" ? (isRtl ? "شهر" : "mo") : (isRtl ? "مشروع" : "proj")}`;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                onClick={() => goApp("jobs")}
                className="glass rounded-2xl p-5 border-primary/25 cursor-pointer transition-all hover:border-primary/60 shadow-luxe flex flex-col justify-between bg-card/85"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{job.emoji || "💼"}</span>
                      <div>
                        <span className="text-xs font-bold text-primary block">{job.company}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {isRtl ? "عن بُعد 100% · حر" : "100% Remote · Freelance"}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      💰 {earning}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-1 mb-1">{displayTitle}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{displayDesc}</p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-primary/10 flex items-center justify-between text-2xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {((lang === "en" ? job.skillsEn : job.skills) || []).slice(0, 2).map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <span className="text-primary font-bold flex items-center gap-1 group-hover:underline">
                    <span>{isRtl ? "التقديم عبر المنصة" : "Apply via App"}</span>
                    <ArrowRight className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="luxe" size="lg" onClick={() => goApp("jobs")} className="px-8 shadow-gold">
            <span>{t("landingFreelanceViewAll")}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </section>

      {/* Features Grid - لماذا منصة الفرص؟ */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2
            className="group font-bold text-2xl sm:text-3xl text-gold-gradient cursor-default"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingFeaturesTitle")}</TashkeelText> : t("landingFeaturesTitle")}
          </h2>
          <div className="w-16 h-1 rounded-full bg-gold-gradient mx-auto mt-3 opacity-80" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className={`glass rounded-2xl p-6 border-primary/25 shadow-luxe hover:border-primary/50 transition-all flex flex-col justify-between ${
                i === 0 ? "sm:col-span-2 bg-gradient-to-br from-primary/10 via-card to-card border-primary/40" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-2xs font-bold">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-2 leading-snug">{f.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Al-Foras (Mission & Vision) - رسالتنا ورؤيتنا */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <h2
          className="group font-bold text-2xl sm:text-3xl text-center text-gold-gradient mb-8 cursor-default"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {lang === "ar" ? <TashkeelText>{t("landingWhyTitle")}</TashkeelText> : t("landingWhyTitle")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {whyCards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative glass rounded-2xl p-6 border-primary/30 shadow-luxe overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mb-4 shadow-gold">
                  <c.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{c.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{c.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-5 py-12 border-t border-primary/15 bg-card/40">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 text-center">
          <BrandMark size={160} />
          
          <a
            href="mailto:alforas.one@gmail.com"
            dir="ltr"
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/30 hover:border-primary/60 transition-all duration-300 shadow-luxe"
          >
            <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Mail className="w-3 h-3 text-primary" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground/90 tracking-wide transition-all duration-300 group-hover:text-primary">
              alforas.one@gmail.com
            </span>
          </a>

          <p className="text-2xs text-muted-foreground">{t("landingFooter")}</p>
        </div>
      </footer>

      {/* 🎓 Scholarship Readiness Academy Modal */}
      <ScholarshipAcademyModal
        isOpen={academyOpen}
        onClose={() => setAcademyOpen(false)}
        initialTrackId={selectedAcademyTrack || undefined}
      />
    </div>
  );
};

export default Landing;

