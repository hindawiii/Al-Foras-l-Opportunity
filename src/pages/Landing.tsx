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
  Award,
  Layers,
  List,
  Globe2,
  Building2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  BookmarkCheck,
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
import { AIAdvisor } from "@/components/foras/AIAdvisor";

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
      title: c.title_ar || "فرصة عمل عن بعد",
      titleEn: c.title_en || "Remote Freelance Opportunity",
      company: c.company || "Global Platform",
      emoji: "💼",
      type: "عمل عن بعد / مشروع حر",
      typeEn: "Remote / Freelance",
      category: "programming" as any,
      salary: { min: 500, max: 2500, currency: "USD", period: "project" as const, average: c.salary || "$1,500+" },
      rating: { score: 4.9, totalReviews: 95, trustLevel: "موثوق", trustLevelEn: "Verified" },
      description: c.description_ar || "فرصة عمل حر مميزة وموثوقة.",
      descriptionEn: c.description_en || "Verified freelance opportunity for remote professionals.",
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
      tab: "scholarships",
      badgeColor: "bg-primary/10 border-primary/25 text-primary",
    },
    {
      icon: GraduationCap,
      title: t("landingFeature2Title"),
      body: t("landingFeature2Body"),
      tag: isRtl ? "أكاديمي" : "Academic",
      tab: "arabUnis",
      badgeColor: "bg-amber-500/10 border-amber-500/25 text-amber-400",
    },
    {
      icon: Briefcase,
      title: t("landingFeature3Title"),
      body: t("landingFeature3Body"),
      tag: isRtl ? "مهني / عن بعد" : "Remote & Global",
      tab: "jobs",
      badgeColor: "bg-sky-500/10 border-sky-500/25 text-sky-400",
    },
    {
      icon: FileText,
      title: t("landingFeature4Title"),
      body: t("landingFeature4Body"),
      tag: isRtl ? "تنسيق ATS" : "ATS Format",
      tab: "profile",
      badgeColor: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
    },
    {
      icon: BookmarkCheck,
      title: t("landingFeature5Title"),
      body: t("landingFeature5Body"),
      tag: isRtl ? "تتبع ذكي" : "Smart Tracking",
      tab: "applications",
      badgeColor: "bg-purple-500/10 border-purple-500/25 text-purple-400",
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

      {/* UNIFIED CURIOSITY SECTION: ركن الجامعات والمنح المعتمدة (Metrics Ticker + Interactive Action Hook) */}
      <section className="relative z-10 px-5 sm:px-10 py-12 sm:py-16 max-w-5xl mx-auto">
        <div className="text-center mb-8 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-2xs font-bold mb-3 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{isRtl ? "دليل الجامعات والمنح المعتمدة" : "Accredited Universities & Grants Guide"}</span>
          </div>
          <h2
            className="font-bold text-2xl sm:text-3xl text-gold-gradient leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
            style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingArabHubTitle")}</TashkeelText> : t("landingArabHubTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
            {t("landingArabHubSubtitle")}
          </p>
        </div>

        {/* 🏆 High-Impact Metrics Ticker (Curiosity & Credibility) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass rounded-2xl p-4 border border-primary/25 text-center bg-card/70 shadow-sm">
            <p className="text-2xl sm:text-3xl font-display font-bold text-gold-gradient">293+</p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">{isRtl ? "جامعة عربية معتمدة" : "Arab Universities"}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-primary/25 text-center bg-card/70 shadow-sm">
            <p className="text-2xl sm:text-3xl font-display font-bold text-gold-gradient">19</p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">{isRtl ? "دولة مانحة سنوياً" : "Donor Nations"}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-primary/25 text-center bg-card/70 shadow-sm">
            <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">100%</p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">{isRtl ? "تمويل كامل ورعاية" : "Fully Funded"}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-primary/25 text-center bg-card/70 shadow-sm">
            <p className="text-2xl sm:text-3xl font-display font-bold text-primary">0$</p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">{isRtl ? "مجاني بالكامل للطلاب" : "100% Free Access"}</p>
          </div>
        </div>

        {/* 🎯 Interactive Teaser Hook Card - Leads with Curiosity */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-r from-primary/15 via-card to-emerald-500/10 p-6 sm:p-8 text-center shadow-gold">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {isRtl ? "فحص القبول الذكي" : "Smart Eligibility Check"}
            </span>
            <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground">
              {isRtl ? "هل ترغب في معرفة الجامعات التي تقبل معدلك الحالي؟" : "Want to know which universities match your current GPA?"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {isRtl
                ? "اكتشف فوراً بوابات التقديم والحد الأدنى للنسب المئوية والمنح السنوية المضمونة لأكثر من 19 دولة حول العالم بنقرة واحدة."
                : "Instantly discover admission requirements, minimum percentages, and guaranteed annual scholarships across 19+ nations."}
            </p>
            <div className="pt-2">
              <Button
                variant="luxe"
                size="lg"
                onClick={() => goApp("arabUnis")}
                className="px-8 py-3 text-sm font-bold shadow-gold hover:scale-105 transition-transform inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>{isRtl ? "فحص ومطابقة معدلي ←" : "Match My GPA Now ←"}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Synchronized Live Scholarships Preview */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-2xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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

          {/* Dual browsing mode highlights */}
          <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/80 border border-primary/25 text-xs text-foreground font-semibold shadow-sm">
              <List className="w-3.5 h-3.5 text-primary" />
              <span>{isRtl ? "القائمة الشاملة الفورية" : "Instant Comprehensive List"}</span>
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/80 border border-primary/25 text-xs text-foreground font-semibold shadow-sm">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>{isRtl ? "بطاقات النخبة (سحب تفاعلي)" : "Interactive Swipe Elite Deck"}</span>
            </span>
          </div>
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
                    
                    {/* Modern Luxe Badges row matching application card standard */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-primary/10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/90 border border-primary/20 text-2xs font-semibold text-foreground shadow-sm">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{displayCountry}</span>
                      </span>
                      {displayAmount && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-2xs font-bold text-emerald-400 shadow-sm">
                          <Award className="w-3 h-3 text-emerald-400" />
                          <span>{displayAmount}</span>
                        </span>
                      )}
                      {s.deadline && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/90 border border-primary/20 text-2xs font-medium text-muted-foreground shadow-sm me-auto">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{s.deadline}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="luxe" size="lg" onClick={() => goApp("scholarships")} className="px-8 shadow-gold inline-flex items-center gap-2 whitespace-nowrap font-bold">
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
                    <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold">
                      💰 {earning}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-1 mb-1">{displayTitle}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{displayDesc}</p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-primary/10 flex items-center justify-between text-2xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {((lang === "en" ? (job.skillsEn || job.skills) : job.skills) || []).slice(0, 2).map((sk) => (
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
          <Button variant="luxe" size="lg" onClick={() => goApp("jobs")} className="px-8 shadow-gold inline-flex items-center gap-2 whitespace-nowrap font-bold">
            <span>{t("landingFreelanceViewAll")}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </section>

      {/* 👑 UNIFIED SECTION: ركائز منظومة الفُرَص (The 3 Pillars of Excellence) */}
      <section className="relative z-10 px-5 sm:px-10 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-2xs font-bold mb-2.5 shadow-sm">
            <Target className="w-3.5 h-3.5" />
            <span>{isRtl ? "منظومة واحدة لكل طموحاتك" : "One Ecosystem for All Your Ambitions"}</span>
          </div>
          <h2
            className="group font-bold text-2xl sm:text-3xl text-gold-gradient cursor-default"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {lang === "ar" ? <TashkeelText>{t("landingWhyTitle")}</TashkeelText> : t("landingWhyTitle")}
          </h2>
          <div className="w-16 h-1 rounded-full bg-gold-gradient mx-auto mt-3 opacity-80" />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            onClick={() => goApp("scholarships")}
            className="glass rounded-3xl p-6 border border-primary/30 shadow-luxe flex flex-col justify-between cursor-pointer group hover:bg-card/90 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mb-4 shadow-gold">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                {isRtl ? "منح دراسية معتمدة 100%" : "100% Verified Scholarships"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {isRtl
                  ? "تغطية مباشرة لأقوى المنح الحكومية العالمية والعربية ممولة بالكامل مع مخصصات معيشية وتذاكر سفر."
                  : "Direct access to top global and Arab government scholarships, fully funded with living stipends."}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-primary/10 flex items-center justify-between text-2xs font-bold text-primary group-hover:text-primary-glow">
              <span>{isRtl ? "استكشف المنح الدراسية" : "Explore Scholarships"}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => goApp("jobs")}
            className="glass rounded-3xl p-6 border border-sky-500/30 shadow-luxe flex flex-col justify-between cursor-pointer group hover:bg-card/90 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-sky-400 transition-colors">
                {isRtl ? "عمل حر ودخل بالدولار" : "Remote Freelance & USD"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {isRtl
                  ? "عقود عمل عن بعد موثوقة مع دليل حصري لسحب وتسييل الأرباح بالعملات الأجنبية في بلدك."
                  : "Verified remote job contracts with localized step-by-step guides for international payouts."}
              </p>
            </div>
            <div className="mt-5 pt-3 border-sky-500/10 flex items-center justify-between text-2xs font-bold text-sky-400 group-hover:text-sky-300">
              <span>{isRtl ? "تصفح وظائف العمل الحر" : "Explore Freelance Jobs"}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            onClick={() => goApp("profile")}
            className="glass rounded-3xl p-6 border border-emerald-500/30 shadow-luxe flex flex-col justify-between cursor-pointer group hover:bg-card/90 transition-all"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-emerald-400 transition-colors">
                {isRtl ? "مطابقة ذكية وفحص ATS" : "AI Match & ATS Review"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {isRtl
                  ? "خوارزميات ذكاء اصطناعي تفحص سيرتك الذاتية وتطابق معدلك مع الشروط الدقيقة لكل فرصة تلقائياً."
                  : "AI algorithms matching your profile and resume with exact eligibility criteria automatically."}
              </p>
            </div>
            <div className="mt-5 pt-3 border-emerald-500/10 flex items-center justify-between text-2xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>{isRtl ? "فحص تطابق ملفك الآن" : "Check Your Match Score"}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </div>
          </motion.div>
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

      {/* Floating AI Advisor accessible from landing page */}
      <AIAdvisor />
    </div>
  );
};

export default Landing;

