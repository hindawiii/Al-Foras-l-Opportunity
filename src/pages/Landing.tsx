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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/foras/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Scholarship } from "@/lib/mockData";
import { JOBS, Job } from "@/lib/jobsData";
import { ARAB_COUNTRY_STATS, ARAB_UNIVERSITIES } from "@/lib/arabUniversities";
import { dynamicStore } from "@/lib/dynamicStore";

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
  // Selected Arab country preview index for the hub (default Sudan 🇸🇩)
  const [selectedCountry, setSelectedCountry] = useState<string>("السودان");

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

  const goApp = (tab = "scholarships") => {
    setLang(lang);
    nav(`/app?tab=${tab}`);
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

  // Selected Country data for Hub preview
  const currentCountryStat = ARAB_COUNTRY_STATS.find((c) => c.country === selectedCountry) || ARAB_COUNTRY_STATS[0];
  const countryUniversities = ARAB_UNIVERSITIES.filter((u) => u.country === currentCountryStat.country);

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

      {/* 🌟 NEW SECTION: أركان الدول ودليل الجامعات العربية (Arab Countries Hub) */}
      <section className="relative z-10 px-5 sm:px-10 py-10 max-w-5xl mx-auto">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-2xs font-bold mb-2.5 shadow-sm">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isRtl ? "تغطية شاملة لأكثر من 20 دولة عربية" : "20+ Arab Nations Covered"}</span>
          </div>
          <h2
            className="font-bold text-2xl sm:text-3xl text-gold-gradient"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingArabHubTitle")}</TashkeelText> : t("landingArabHubTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
            {t("landingArabHubSubtitle")}
          </p>
        </div>

        {/* Interactive Country Selector Ribbon (All 20+ Arab Nations) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-primary/20 no-scrollbar">
          {ARAB_COUNTRY_STATS.map((c) => {
            const isSelected = selectedCountry === c.country;
            return (
              <button
                key={c.country}
                onClick={() => setSelectedCountry(c.country)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-300 text-xs font-bold ${
                  isSelected
                    ? "bg-gold-gradient text-primary-foreground border-primary shadow-gold scale-105"
                    : "glass border-primary/20 text-foreground hover:border-primary/50 hover:bg-primary/10"
                }`}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span>{lang === "ar" ? c.country : c.countryEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-black/30 text-white" : "bg-primary/15 text-primary"
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Country Highlights & Universities Showcase Card */}
        <div className="mt-4 glass rounded-3xl p-5 sm:p-6 border-primary/30 shadow-luxe relative overflow-hidden bg-card/85">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary/15">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentCountryStat.flag}</span>
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-foreground flex items-center gap-2">
                  <span>{lang === "ar" ? `ركن الجامعات في ${currentCountryStat.country}` : `${currentCountryStat.countryEn} Universities Hub`}</span>
                  {currentCountryStat.scholarships && (
                    <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      ✨ {isRtl ? "تتوفر منح دراسية" : "Scholarships Available"}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRtl
                    ? `يتضمن ${currentCountryStat.count} جامعة ومؤسسة معتمدة · الحد الأدنى للقبول يبدأ من %${currentCountryStat.minPercentage}`
                    : `Features ${currentCountryStat.count} accredited institutions · Minimum admission from ${currentCountryStat.minPercentage}%`}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-2xs text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isRtl ? "دليل شامل وموثق" : "Accredited Directory"}</span>
            </div>
          </div>

          {/* Sample Universities Grid for this Country */}
          <div className="grid sm:grid-cols-2 gap-3.5 mt-4">
            {countryUniversities.slice(0, 4).map((uni) => (
              <div
                key={uni.id}
                onClick={() => goApp("arabUnis")}
                className="p-3.5 rounded-2xl bg-card/70 border border-primary/20 hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-primary truncate group-hover:text-primary-glow transition-colors">
                      {lang === "ar" ? uni.name : uni.nameEn}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        uni.type === "government"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {uni.type === "government"
                        ? isRtl
                          ? "حكومية"
                          : "Public"
                        : isRtl
                        ? "خاصة"
                        : "Private"}
                    </span>
                  </div>
                  <p className="text-2xs text-gray-300 line-clamp-2 leading-relaxed">
                    {lang === "ar" ? uni.highlights : uni.highlightsEn}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2.5 mt-2 border-t border-primary/10">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    {lang === "ar" ? uni.city : uni.cityEn || uni.city}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {isRtl ? `القبول: %${uni.minPercentage}+` : `Admission: ${uni.minPercentage}%+`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button at the Bottom (matching Scholarships and Freelance sections) */}
        <div className="mt-6 text-center">
          <Button
            variant="luxe"
            size="lg"
            onClick={() => goApp("arabUnis")}
            className="px-8 shadow-gold"
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
    </div>
  );
};

export default Landing;

