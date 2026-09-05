import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Briefcase, Globe, ExternalLink, Sparkles, Filter, Clock,
  DollarSign, CheckCircle2, ShieldAlert, Award, Star, ArrowRight, ArrowLeft,
  BookOpen, HelpCircle, ChevronDown, ChevronUp, MapPin, Building2,
  TrendingUp, Wallet, Check, AlertCircle, Share2, Layers, RefreshCw,
  ShieldCheck, Info, FileText, CreditCard, Smartphone, Zap, ArrowUpRight,
  Download, QrCode, Shield, CheckCircle, Copy
} from "lucide-react";
import { JOBS, JOB_CATEGORIES, REGIONS_LIST, Job, JobCategory, JobRegion } from "@/lib/jobsData";
import {
  PAYMENT_METHODS,
  PAYMENT_CATEGORIES_LIST,
  PaymentMethodItem,
  PaymentCategory
} from "@/lib/paymentMethodsData";
import { dynamicStore } from "@/lib/dynamicStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { nativeShare } from "@/lib/share";
import { OpportunityAICopilot } from "@/components/foras/OpportunityAICopilot";
import { SmartPayoutRoadmapBanner } from "@/components/foras/SmartPayoutRoadmapBanner";

export const JobsTab = () => {
  const { t, lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  // Main Section Pillar Switcher: "jobs" (مواقع ومنصات) or "payments" (طرق الدفع والاستلام)
  const [mainPillar, setMainPillar] = useState<"jobs" | "payments">("jobs");

  // Jobs section filters and state
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<JobRegion>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [eligibilityModalJob, setEligibilityModalJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "guide" | "stories" | "payment">("overview");

  // Payments section filters and state
  const [selectedPaymentCat, setSelectedPaymentCat] = useState<PaymentCategory>("all");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const convertCustomJobs = (custom: any[]): Job[] => {
    if (!Array.isArray(custom)) return [];
    return custom.filter(Boolean).map(c => ({
      id: c.id,
      title: c.title_ar || "فرصة عمل عن بعد",
      titleEn: c.title_en || c.title_ar,
      company: c.company || "شركة عالمية",
      emoji: "💼",
      type: "عن بعد",
      typeEn: "Remote",
      region: "arab" as any,
      category: (c.category as any) || "programming",
      availability: {
        global: true,
        countries: ["كل الدول العربية", "عالمي"],
        restrictedCountries: [],
      },
      salary: {
        min: 500,
        max: 3500,
        currency: "$",
        period: "month",
        average: c.salary || "$1,500/month",
      },
      withdrawal: {
        minAmount: 50,
        currency: "$",
        methods: [
          {
            name: (c as any).payout_method || "تحويل بنكي / بايبال / بايونير",
            nameEn: (c as any).payout_method || "Bank Wire / PayPal / Payoneer",
            availableInSudan: true,
          }
        ],
        processingTime: "خلال 24 - 48 ساعة",
        processingTimeEn: "24 - 48 hours",
      },
      rating: {
        score: 4.8,
        reviewsCount: 120,
        trustLevel: "عالي جداً",
        trustLevelEn: "Very High",
      },
      description: c.description_ar || "فرصة مميزة للمستقلين للعمل عن بعد.",
      descriptionEn: c.description_en || c.description_ar,
      requirements: (Array.isArray(c.requirements_ar) && c.requirements_ar.length > 0) ? c.requirements_ar : ["مهارات مناسبة", "الالتزام والجودة"],
      requirementsEn: (c as any).requirements_en || ["Relevant skills", "Dedication & Quality"],
      registrationGuide: {
        steps: [
          {
            step: 1,
            title: "الانتقال لرابط التقديم الرسمي",
            titleEn: "Visit Official Application Portal",
            description: "ادخل إلى الرابط الرسمي للوظيفة وتأكد من قراءة الشروط.",
          },
          {
            step: 2,
            title: "إرسال السيرة الذاتية ونماذج العمل",
            titleEn: "Submit Resume & Portfolio",
            description: "ارفق سيرتك الذاتية المحدثة ورابط حسابك المهني.",
          },
        ],
        estimatedTime: "5 - 10 دقائق",
        estimatedTimeEn: "5 - 10 mins",
      },
      pros: (Array.isArray(c.benefits_ar) && c.benefits_ar.length > 0) ? c.benefits_ar : ["مرونة العمل من أي مكان", "دخل بالدولار الأمريكي"],
      prosEn: ["100% Remote flexibility", "USD compensation"],
      cons: ["تتطلب إدارة ذاتية للوقت والمهام"],
      consEn: ["Requires self time management"],
      skills: Array.isArray(c.skills) && c.skills.length > 0
        ? c.skills
        : (Array.isArray(c.skills_ar) && c.skills_ar.length > 0
            ? c.skills_ar
            : ["العمل الحر", "إدارة الوقت", "التواصل"]),
      skillsEn: Array.isArray(c.skillsEn) && c.skillsEn.length > 0
        ? c.skillsEn
        : (Array.isArray(c.skills_en) && c.skills_en.length > 0
            ? c.skills_en
            : (Array.isArray(c.skills) && c.skills.length > 0 ? c.skills : ["Freelancing", "Time Management", "Communication"])),
      successStories: Array.isArray(c.successStories) ? c.successStories : [],
      isVerified: true,
      eligibility: c.eligibility || {
        type: "global_remote",
        badgeAr: "🌐 متاح للعمل عن بُعد",
        badgeEn: "🌐 Remote Eligible",
        reasonAr: "فرصة عمل عن بُعد متاحة للتقديم الرقمي للمؤهلين بدون قيود جغرافية.",
        reasonEn: "Remote position open for qualified applicants worldwide.",
        proofSourceUrl: c.apply_url || "https://example.com",
        proofSourceNameAr: "بوابة التقديم الرسمية للوظيفة",
        proofSourceNameEn: "Official Job Portal",
        targetCountries: ["GLOBAL"]
      },
      dateAdded: (c as any).posted_date || new Date().toISOString().split("T")[0],
      contact: { website: c.apply_url || "https://example.com" },
      ...((c as any).custom_fields ? { custom_fields: (c as any).custom_fields } : {}),
    } as any));
  };

  const [liveJobs, setLiveJobs] = useState<Job[]>(() => {
    const custom = dynamicStore.getJobs();
    const converted = convertCustomJobs(custom);
    const customIds = new Set(converted.map(j => j.id));
    return [...converted, ...JOBS.filter(j => !customIds.has(j.id))];
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const custom = dynamicStore.getJobs();
      const converted = convertCustomJobs(custom);
      const customIds = new Set(converted.map(j => j.id));
      setLiveJobs([...converted, ...JOBS.filter(j => !customIds.has(j.id))]);

      if (e?.detail?.type === "job") {
        setSelectedCategory("all");
        setSelectedRegion("all");
      }
    };
    window.addEventListener("foras:data-updated", handleUpdate);
    return () => window.removeEventListener("foras:data-updated", handleUpdate);
  }, []);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return liveJobs.filter((job) => {
      if (!job) return false;
      if (selectedCategory !== "all" && job.category !== selectedCategory) {
        return false;
      }
      if (selectedRegion !== "all") {
        if (selectedRegion === "arab" && job.region !== "arab") return false;
        if (selectedRegion === "americas" && job.region !== "americas") return false;
        if (selectedRegion === "europe" && job.region !== "europe") return false;
        if (selectedRegion === "asia_africa" && job.region !== "asia_africa") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (job.title || "").toLowerCase().includes(q) || (job.titleEn && job.titleEn.toLowerCase().includes(q));
        const companyMatch = (job.company || "").toLowerCase().includes(q);
        const descMatch = (job.description || "").toLowerCase().includes(q) || (job.descriptionEn && job.descriptionEn.toLowerCase().includes(q));
        const skillMatch = (job.skills || []).some(s => s && s.toLowerCase().includes(q)) || (job.skillsEn && job.skillsEn.some(s => s && s.toLowerCase().includes(q)));
        return Boolean(titleMatch || companyMatch || descMatch || skillMatch);
      }
      return true;
    });
  }, [selectedCategory, selectedRegion, searchQuery, liveJobs]);

  // Filtered payment methods list
  const filteredPaymentMethods = useMemo(() => {
    return PAYMENT_METHODS.filter((item) => {
      if (!item) return false;
      if (selectedPaymentCat !== "all" && item.category !== selectedPaymentCat) {
        return false;
      }
      if (paymentSearchQuery.trim()) {
        const q = paymentSearchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(q) || item.nameEn.toLowerCase().includes(q);
        const descMatch = item.shortDesc.toLowerCase().includes(q) || item.shortDescEn.toLowerCase().includes(q);
        const overviewMatch = item.overview.toLowerCase().includes(q) || item.overviewEn.toLowerCase().includes(q);
        const currencyMatch = item.supportedCurrencies.some(c => c.toLowerCase().includes(q));
        return Boolean(nameMatch || descMatch || overviewMatch || currencyMatch);
      }
      return true;
    });
  }, [selectedPaymentCat, paymentSearchQuery]);

  const shareJob = async (job: Job) => {
    const title = ar ? job.title : (job.titleEn || job.title);
    await nativeShare({
      title: `${ar ? "منصة عمل حر" : "Freelance Platform"}: ${job.company}`,
      text: `${title} - ${job.company}`,
      url: job.contact.website || window.location.href,
    });
  };

  const sharePaymentMethod = async (method: PaymentMethodItem) => {
    const name = ar ? method.name : method.nameEn;
    await nativeShare({
      title: `${ar ? "وسيلة دفع وسحب أرباح" : "Payout & Wallet"}: ${name}`,
      text: ar ? method.shortDesc : method.shortDescEn,
      url: method.links.websiteUrl,
    });
  };

  return (
    <div className="space-y-5 w-full pb-12">
      {/* 🌟 LUXE PRO TWO-PILLAR SEGMENTED SWITCHER 🌟 */}
      <div className="p-1.5 bg-card/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-luxe flex items-center justify-between gap-1.5">
        <button
          onClick={() => setMainPillar("jobs")}
          className={`flex-1 h-12 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
            mainPillar === "jobs"
              ? "bg-gradient-to-r from-[hsl(210_70%_50%)] to-[hsl(220_60%_45%)] text-white shadow-md font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Briefcase className="w-4 h-4 text-primary-foreground/90" />
          <span>{ar ? "منصات العمل الحر" : "Freelance Platforms"}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            mainPillar === "jobs" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}>
            {liveJobs.length}
          </span>
        </button>

        <button
          onClick={() => setMainPillar("payments")}
          className={`flex-1 h-12 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
            mainPillar === "payments"
              ? "bg-gold-gradient text-primary-foreground shadow-gold font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{ar ? "طرق الدفع والاستلام" : "Payment & Payout Methods"}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            mainPillar === "payments" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-amber-500/10 text-amber-500"
          }`}>
            {PAYMENT_METHODS.length}
          </span>
        </button>
      </div>

      {/* ======================================================================= */}
      {/* 💼 PILLAR 1: FREELANCE PLATFORMS (منصات العمل الحر)                       */}
      {/* ======================================================================= */}
      {mainPillar === "jobs" && (
        <div className="space-y-4">
          {/* Radiant Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(210_70%_50%)] via-[hsl(43_90%_55%)] to-[hsl(220_60%_45%)] rounded-2xl blur-md opacity-40 group-hover:opacity-75 group-focus-within:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center w-full bg-card/90 backdrop-blur-xl border-2 border-primary/40 rounded-2xl shadow-luxe focus-within:border-primary transition-all">
              <div className={`flex items-center justify-center w-11 h-11 ${isRtl ? "pr-1" : "pl-1"} text-primary flex-shrink-0`}>
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Search className="w-4 h-4 text-primary" strokeWidth={2.5} />
                </div>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ar ? "ابحث عن منصة، مهارة..." : "Search platform, skill..."}
                className={`w-full h-12 py-2.5 ${isRtl ? "pr-2 pl-10" : "pl-2 pr-10"} text-xs sm:text-sm bg-transparent font-medium text-foreground placeholder:text-muted-foreground/80 focus:outline-none`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute ${isRtl ? "left-3" : "right-3"} w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Region Filter (Continents & Arab World) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[11px] font-bold text-muted-foreground flex-shrink-0 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-primary" />
              {ar ? "النطاق الجغرافي:" : "Region:"}
            </span>
            {REGIONS_LIST.map((r) => {
              const active = selectedRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                    active
                      ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold scale-[1.02]"
                      : "bg-card/60 border-border text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <span>{r.flag}</span>
                  <span>{ar ? r.labelAr : r.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Category Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {JOB_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    active
                      ? "bg-gradient-to-r from-[hsl(210_70%_50%)] to-[hsl(220_60%_45%)] text-white border-transparent shadow-md"
                      : "bg-card/50 border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{ar ? cat.label : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Count Header */}
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {ar ? `تم العثور على ${filteredJobs.length} منصة وفرصة عمل حر` : `Found ${filteredJobs.length} freelance platforms`}
            </span>
            <span className="text-[11px] text-primary/80 font-normal">
              {ar ? "مرتبة وفق الأولوية الدقيقة (القمة العالمية ثم الريادة العربية)" : "Ranked by Global Giants & Arab Leaders"}
            </span>
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredJobs.map((job, idx) => {
              const title = ar ? job.title : (job.titleEn || job.title);
              const desc = ar ? job.description : (job.descriptionEn || job.description);
              const type = ar ? job.type : (job.typeEn || job.type);
              const trust = ar ? job.rating.trustLevel : (job.rating.trustLevelEn || job.rating.trustLevel);
              const region = job.regionLabel ? (ar ? job.regionLabel.ar : job.regionLabel.en) : "";

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedJob(job)}
                  className={`cursor-pointer rounded-2xl p-4 bg-card/60 backdrop-blur-md border border-primary/20 hover:border-primary/60 hover:bg-card/90 transition-all shadow-sm hover:shadow-gold flex flex-col justify-between ${alignClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                          {job.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-muted-foreground/80">#{idx + 1}</span>
                            <h3 className="font-bold text-sm text-foreground">{job.company}</h3>
                            {job.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-primary font-semibold">{type}</p>
                        </div>
                      </div>
                      {region && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border">
                          {region}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-foreground/90 leading-snug line-clamp-1 mb-1.5">
                      {title}
                    </h4>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">
                      {desc}
                    </p>

                    {/* Smart Eligibility Badge */}
                    {job.eligibility && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setEligibilityModalJob(job);
                        }}
                        className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all flex items-center justify-between gap-2 group/badge cursor-pointer"
                        title={ar ? "انقر لعرض الدليل والمصدر الرسمي للإتاحة" : "Click to view official eligibility proof"}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-[11px] font-bold text-foreground truncate">
                            {ar ? job.eligibility.badgeAr : (job.eligibility.badgeEn || job.eligibility.badgeAr)}
                          </span>
                        </div>
                        <span className="text-[10px] text-primary group-hover/badge:underline flex items-center gap-0.5 flex-shrink-0 font-medium">
                          <span>{ar ? "الدليل والسبب" : "Proof & Reason"}</span>
                          <Info className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                    {/* Skills tags */}
                    {(() => {
                      const skillsList = (ar ? (job.skills || []) : (job.skillsEn || job.skills || [])) || [];
                      if (!Array.isArray(skillsList) || skillsList.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {skillsList.slice(0, 3).map((sk) => (
                            <span key={sk} className="px-2 py-0.5 rounded-md text-[10px] bg-primary/10 text-primary border border-primary/20">
                              {sk}
                            </span>
                          ))}
                          {skillsList.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground">
                              +{skillsList.length - 3}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-bold text-gold-gradient">
                      <DollarSign className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {job.salary.min} - {job.salary.max} {job.salary.currency}
                        <span className="text-[10px] text-muted-foreground font-normal">/{ar ? (job.salary.period === "hour" ? "ساعة" : "مشروع") : job.salary.period}</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-primary font-bold text-[11px] group-hover:underline">
                      {ar ? "دليل التسجيل والبدء" : "Start Guide"}
                      {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 💳 PILLAR 2: PAYMENTS, WITHDRAWALS & WALLETS (طرق الدفع والمحافظ)         */}
      {/* ======================================================================= */}
      {mainPillar === "payments" && (
        <div className="space-y-4">
          {/* Smart Geo-Personalized Guidance Banner */}
          <SmartPayoutRoadmapBanner />

          {/* Payment Radiant Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-primary to-emerald-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 group-focus-within:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center w-full bg-card/90 backdrop-blur-xl border-2 border-amber-500/40 rounded-2xl shadow-luxe focus-within:border-amber-500 transition-all">
              <div className={`flex items-center justify-center w-11 h-11 ${isRtl ? "pr-1" : "pl-1"} text-amber-500 flex-shrink-0`}>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Search className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                </div>
              </div>
              <input
                type="text"
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                placeholder={ar ? "ابحث عن محفظة، عملة، بنك (مثل Payoneer, بنكك, Binance, USDT)..." : "Search wallet, USD bank, currency..."}
                className={`w-full h-12 py-2.5 ${isRtl ? "pr-2 pl-10" : "pl-2 pr-10"} text-xs sm:text-sm bg-transparent font-medium text-foreground placeholder:text-muted-foreground/80 focus:outline-none`}
              />
              {paymentSearchQuery && (
                <button
                  onClick={() => setPaymentSearchQuery("")}
                  className={`absolute ${isRtl ? "left-3" : "right-3"} w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Payment Categories Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {PAYMENT_CATEGORIES_LIST.map((cat) => {
              const active = selectedPaymentCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedPaymentCat(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    active
                      ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold scale-[1.02]"
                      : "bg-card/50 border-border/80 text-muted-foreground hover:text-foreground hover:border-amber-500/40"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{ar ? cat.labelAr : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Payments Results Count */}
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {ar ? `تم إيجاد ${filteredPaymentMethods.length} وسيلة ومحفظة دفع معتمدة` : `Found ${filteredPaymentMethods.length} verified payout options`}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {ar ? "روابط وتطبيقات رسمية 100%" : "100% Official Links & Apps"}
            </span>
          </div>

          {/* Payment Methods Luxe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredPaymentMethods.map((method, idx) => {
              const name = ar ? method.name : method.nameEn;
              const badge = ar ? method.badge : method.badgeEn;
              const desc = ar ? method.shortDesc : method.shortDescEn;
              const speed = ar ? method.transferSpeed : method.transferSpeedEn;
              const fees = ar ? method.typicalFees : method.typicalFeesEn;

              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`cursor-pointer rounded-2xl p-4 bg-card/65 backdrop-blur-md border border-amber-500/25 hover:border-amber-500 hover:bg-card/95 transition-all shadow-sm hover:shadow-gold flex flex-col justify-between ${alignClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl ${method.logoBg} text-white flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                          {method.logoEmoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-muted-foreground/80">#{idx + 1}</span>
                            <h3 className="font-bold text-sm text-foreground">{name}</h3>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{method.rating}</span>
                            <span className="text-[10px] text-muted-foreground">({method.reviewCount.toLocaleString()})</span>
                          </div>
                        </div>
                      </div>

                      {/* Sudan Availability Status Tag */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        method.sudanAvailability.supported
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}>
                        {ar ? method.sudanAvailability.statusBadgeAr : method.sudanAvailability.statusBadgeEn}
                      </span>
                    </div>

                    {/* Tag badge */}
                    <div className="mb-2">
                      <span className="inline-block text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                        {badge}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {desc}
                    </p>

                    {/* Currencies Pills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {method.supportedCurrencies.map((curr) => (
                        <span key={curr} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted/70 text-foreground border border-border">
                          {curr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-semibold text-muted-foreground text-[11px]">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">{speed}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px] hover:underline">
                      {ar ? "تفاصيل المحفظة وروابطها" : "Details & Links"}
                      {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 💼 MODAL 1: JOB PLATFORM DETAILS SHEET                                   */}
      {/* ======================================================================= */}
      <Sheet open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
          {selectedJob && (
            <div className={`space-y-4 ${alignClass}`}>
              <SheetHeader className={alignClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl flex-shrink-0">
                      {selectedJob.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <SheetTitle className="text-base sm:text-lg font-bold">
                          {selectedJob.company}
                        </SheetTitle>
                        {selectedJob.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-primary font-semibold">
                        {ar ? selectedJob.type : (selectedJob.typeEn || selectedJob.type)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => shareJob(selectedJob)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title={ar ? "مشاركة" : "Share"}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </SheetHeader>

              {/* Sub-tabs selector in Job Sheet */}
              <div className="flex border-b border-border text-xs font-bold">
                {[
                  { id: "overview", labelAr: "نظرة عامة", labelEn: "Overview" },
                  { id: "guide", labelAr: "دليل التسجيل", labelEn: "How to Start" },
                  { id: "stories", labelAr: `قصص نجاح (${selectedJob.successStories?.length || 0})`, labelEn: `Stories (${selectedJob.successStories?.length || 0})` },
                  { id: "payment", labelAr: "طرق السحب والعمولة", labelEn: "Payouts" },
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    onClick={() => setActiveTab(tItem.id as any)}
                    className={`flex-1 py-2 text-center border-b-2 transition-all ${
                      activeTab === tItem.id
                        ? "border-primary text-primary font-extrabold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ar ? tItem.labelAr : tItem.labelEn}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      {ar ? "عن المنصة وطبيعة العمل:" : "About Platform:"}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {ar ? selectedJob.description : (selectedJob.descriptionEn || selectedJob.description)}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      {ar ? "متطلبات القبول والعمل:" : "Requirements:"}
                    </h4>
                    <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                      {(ar ? selectedJob.requirements : (selectedJob.requirementsEn || selectedJob.requirements)).map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Copilot in Job Modal */}
                  <OpportunityAICopilot
                    opportunity={{
                      id: selectedJob.id,
                      title: ar ? selectedJob.title : (selectedJob.titleEn || selectedJob.title),
                      company: selectedJob.company,
                      category: selectedJob.category,
                      type: "job",
                      requirements: ar ? selectedJob.requirements : (selectedJob.requirementsEn || selectedJob.requirements),
                      skills: ((ar ? (selectedJob.skills || []) : (selectedJob.skillsEn || selectedJob.skills || [])) || []),
                      payoutMethods: (selectedJob.withdrawal?.methods || []).map(m => ar ? m.name : (m.nameEn || m.name)),
                      tips: selectedJob.successStories?.[0]?.tips ? [selectedJob.successStories[0].tips] : []
                    }}
                  />
                </div>
              )}

              {/* Tab 2: Guide */}
              {activeTab === "guide" && (
                <div className="space-y-3 text-xs">
                  <p className="text-muted-foreground">
                    {ar
                      ? `الوقت المقدر للبدء: ${selectedJob.registrationGuide.estimatedTime}`
                      : `Estimated onboarding time: ${selectedJob.registrationGuide.estimatedTimeEn || selectedJob.registrationGuide.estimatedTime}`}
                  </p>
                  <div className="space-y-2.5">
                    {selectedJob.registrationGuide.steps.map((st) => (
                      <div key={st.step} className="p-3 rounded-xl bg-card border border-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {st.step}
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-foreground">
                            {ar ? st.title : (st.titleEn || st.title)}
                          </h5>
                          <p className="text-muted-foreground leading-relaxed">
                            {ar ? st.description : (st.descriptionEn || st.description)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Success Stories */}
              {activeTab === "stories" && (
                <div className="space-y-3 text-xs">
                  {selectedJob.successStories && selectedJob.successStories.length > 0 ? (
                    selectedJob.successStories.map((st, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-card border border-primary/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground">{ar ? st.name : (st.nameEn || st.name)}</span>
                                {st.age && (
                                  <span className="text-[10px] text-muted-foreground">({st.age} {ar ? "سنة" : "yo"})</span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {st.countryOfOrigin ? `${ar ? st.countryOfOrigin : (st.countryOfOriginEn || st.countryOfOrigin)} • ` : ""}
                                {ar ? st.city : (st.cityEn || st.city)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-gold-gradient">{ar ? st.earnings : (st.earningsEn || st.earnings)}</span>
                        </div>

                        {st.role && (
                          <div className="text-[11px] font-bold text-primary">
                            💼 {ar ? st.role : (st.roleEn || st.role)}
                          </div>
                        )}

                        <p className="text-muted-foreground italic leading-relaxed">
                          "{ar ? st.story : (st.storyEn || st.story)}"
                        </p>

                        {st.tips && (
                          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-foreground text-[11px]">
                            💡 <span className="font-bold">{ar ? "نصيحة ذهبية:" : "Pro Tip:"}</span> {ar ? st.tips : (st.tipsEn || st.tips)}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      {ar ? "لا توجد قصص نجاح مدخلة لهذه المنصة حالياً." : "No success stories recorded yet."}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Payments and Withdrawals */}
              {activeTab === "payment" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-primary" />
                      {ar ? "طرق السحب المتاحة بالمنصة:" : "Available Payout Methods:"}
                    </h4>
                    <div className="space-y-1.5">
                      {(selectedJob.withdrawal?.methods || []).map((m, i) => (
                        <div key={i} className="p-2 rounded-xl bg-background/50 border border-border flex items-center justify-between">
                          <span className="font-medium text-foreground">{ar ? m.name : (m.nameEn || m.name)}</span>
                          {m.availableInSudan && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                              {ar ? "متاح بالسودان" : "Sudan Ready"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                    <span className="font-bold text-muted-foreground">{ar ? "مدة معالجة السحب:" : "Processing Time:"}</span>
                    <p className="font-semibold text-foreground">
                      {selectedJob.withdrawal?.processingTime ? (ar ? selectedJob.withdrawal.processingTime : (selectedJob.withdrawal.processingTimeEn || selectedJob.withdrawal.processingTime)) : (ar ? "خلال 24 - 48 ساعة" : "24 - 48 hours")}
                    </p>
                  </div>

                  {/* Switch to Pillar 2 Link */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold text-amber-500 border-amber-500/40 hover:bg-amber-500/10"
                    onClick={() => {
                      setSelectedJob(null);
                      setMainPillar("payments");
                    }}
                  >
                    <Wallet className="w-3.5 h-3.5 me-1.5" />
                    {ar ? "استعراض محافظ وطرق الدفع المقترحة لسحب هذا الرصيد" : "Browse Supported Cashout Wallets"}
                  </Button>
                </div>
              )}

              {/* Apply / Visit Official Website CTA */}
              <div className="pt-2">
                <Button asChild variant="luxe" className="w-full h-11 text-sm font-bold shadow-luxe">
                  <a
                    href={selectedJob.contact.website}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>{ar ? `الانتقال لموقع ${selectedJob.company} الرسمي` : `Visit Official ${selectedJob.company}`}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ======================================================================= */}
      {/* 💳 MODAL 2: PAYMENT METHOD LUXE DETAILS SHEET                           */}
      {/* ======================================================================= */}
      <Sheet open={Boolean(selectedPaymentMethod)} onOpenChange={(open) => !open && setSelectedPaymentMethod(null)}>
        <SheetContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
          {selectedPaymentMethod && (
            <div className={`space-y-4 ${alignClass}`}>
              <SheetHeader className={alignClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${selectedPaymentMethod.logoBg} text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                      {selectedPaymentMethod.logoEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <SheetTitle className="text-base sm:text-lg font-bold">
                          {ar ? selectedPaymentMethod.name : selectedPaymentMethod.nameEn}
                        </SheetTitle>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                        {ar ? selectedPaymentMethod.badge : selectedPaymentMethod.badgeEn}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sharePaymentMethod(selectedPaymentMethod)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title={ar ? "مشاركة" : "Share"}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </SheetHeader>

              {/* Status and Coverage Box */}
              <div className="p-3.5 rounded-2xl bg-card border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {ar ? "حالة الإتاحة في السودان:" : "Availability in Sudan:"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedPaymentMethod.sudanAvailability.supported
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}>
                    {ar ? selectedPaymentMethod.sudanAvailability.statusBadgeAr : selectedPaymentMethod.sudanAvailability.statusBadgeEn}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ar ? selectedPaymentMethod.sudanAvailability.notesAr : selectedPaymentMethod.sudanAvailability.notesEn}
                </p>
                <div className="pt-1 text-[11px] text-muted-foreground/90 border-t border-border/60">
                  <span className="font-bold text-foreground">{ar ? "الدول العربية: " : "Arab Countries: "}</span>
                  {ar ? selectedPaymentMethod.arabCountriesAvailability : selectedPaymentMethod.arabCountriesAvailabilityEn}
                </div>
              </div>

              {/* Overview */}
              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  {ar ? "نبذة وكيفية عمل هذه الوسيلة:" : "Overview & Operational Mechanics:"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ar ? selectedPaymentMethod.overview : selectedPaymentMethod.overviewEn}
                </p>
              </div>

              {/* Financial Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {ar ? "سرعة التحويل:" : "Transfer Speed:"}
                  </span>
                  <p className="font-bold text-foreground">
                    {ar ? selectedPaymentMethod.transferSpeed : selectedPaymentMethod.transferSpeedEn}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
                  <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    {ar ? "الحد الأدنى للسحب:" : "Minimum Cashout:"}
                  </span>
                  <p className="font-bold text-foreground">
                    {ar ? selectedPaymentMethod.minimumWithdrawal : selectedPaymentMethod.minimumWithdrawalEn}
                  </p>
                </div>
              </div>

              {/* Fees details */}
              <div className="p-3 rounded-xl bg-background/50 border border-border text-xs space-y-1">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {ar ? "الرسوم والعمولات النموذجية:" : "Typical Fees & Tariffs:"}
                </span>
                <p className="font-bold text-foreground">
                  {ar ? selectedPaymentMethod.typicalFees : selectedPaymentMethod.typicalFeesEn}
                </p>
              </div>

              {/* Verification requirements */}
              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  {ar ? "المستندات المطلوبة لتوثيق الحساب (KYC):" : "Verification Requirements (KYC):"}
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                  {(ar ? selectedPaymentMethod.verificationRequirements.ar : selectedPaymentMethod.verificationRequirements.en).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* How to link with freelance platforms */}
              {selectedPaymentMethod.howToLinkWithPlatforms && selectedPaymentMethod.howToLinkWithPlatforms.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2.5">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {ar ? "طريقة الربط مع منصات العمل الحر:" : "Integration with Freelance Platforms:"}
                  </h4>
                  {selectedPaymentMethod.howToLinkWithPlatforms.map((pl, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-background/60 border border-border space-y-1 text-xs">
                      <span className="font-bold text-primary block">
                        📍 {pl.platformName}
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        {(ar ? pl.stepsAr : pl.stepsEn).map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

              {/* Pro Tip */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30 text-xs space-y-1">
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  💡 {ar ? "نصيحة ذهبية لأعلى أمان وتوفير:" : "Pro Cashout & Security Tip:"}
                </span>
                <p className="text-foreground leading-relaxed">
                  {ar ? selectedPaymentMethod.proTip : selectedPaymentMethod.proTipEn}
                </p>
              </div>

              {/* Official Apps and Links Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPaymentMethod.links.androidAppUrl && (
                    <Button asChild variant="outline" className="w-full h-11 text-xs font-bold border-border hover:bg-muted">
                      <a
                        href={selectedPaymentMethod.links.androidAppUrl}
                        target="_blank"
                        rel="noopener noreferrer external"
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{ar ? "تطبيق أندرويد (Google Play)" : "Android App (Play Store)"}</span>
                      </a>
                    </Button>
                  )}

                  {selectedPaymentMethod.links.iosAppUrl && (
                    <Button asChild variant="outline" className="w-full h-11 text-xs font-bold border-border hover:bg-muted">
                      <a
                        href={selectedPaymentMethod.links.iosAppUrl}
                        target="_blank"
                        rel="noopener noreferrer external"
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        <span>{ar ? "تطبيق آيفون (App Store)" : "iOS App (App Store)"}</span>
                      </a>
                    </Button>
                  )}
                </div>

                <Button asChild variant="luxe" className="w-full h-11 text-xs sm:text-sm font-bold shadow-luxe">
                  <a
                    href={selectedPaymentMethod.links.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>{ar ? `الانتقال للموقع الرسمي لـ ${selectedPaymentMethod.name}` : `Visit Official Website`}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ======================================================================= */}
      {/* 🛡️ MODAL 3: ELIGIBILITY SOURCE PROOF DIALOG                              */}
      {/* ======================================================================= */}
      <Dialog open={Boolean(eligibilityModalJob)} onOpenChange={(open) => !open && setEligibilityModalJob(null)}>
        <DialogContent className={`max-w-md ${alignClass}`}>
          {eligibilityModalJob && (
            <div className="space-y-4">
              <DialogHeader className={alignClass}>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <span className="text-xl">{eligibilityModalJob.emoji}</span>
                  <span>{ar ? "إثبات الإتاحة والاعتماد الرسمي" : "Official Eligibility Proof"}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {ar ? `التحقق الميداني والتوثيق لمنصة ${eligibilityModalJob.company}` : `Verified accessibility documentation for ${eligibilityModalJob.company}`}
                </DialogDescription>
              </DialogHeader>

              {/* Badge highlight */}
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-bold text-foreground">
                  {ar ? eligibilityModalJob.eligibility?.badgeAr : (eligibilityModalJob.eligibility?.badgeEn || eligibilityModalJob.eligibility?.badgeAr)}
                </span>
              </div>

              {/* Detailed Reason & Analysis */}
              <div className="space-y-1.5 bg-background/50 border border-border rounded-2xl p-3.5">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  {ar ? "لماذا المنصة متاحة أو معتمدة لبلدك؟" : "Why is this platform eligible for your country?"}
                </h4>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {ar ? eligibilityModalJob.eligibility?.reasonAr : (eligibilityModalJob.eligibility?.reasonEn || eligibilityModalJob.eligibility?.reasonAr)}
                </p>
              </div>

              {/* Official Proof & Source Document */}
              {eligibilityModalJob.eligibility?.proofSourceUrl && (
                <div className="p-3 rounded-2xl bg-card border border-primary/30 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    {ar ? "📜 الدليل والمصدر الرسمي للتحقق المباشر:" : "📜 Official source proof for direct verification:"}
                  </p>
                  <Button asChild variant="luxe" size="sm" className="w-full">
                    <a
                      href={eligibilityModalJob.eligibility.proofSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer external"
                      className="flex items-center justify-center gap-2"
                    >
                      <span>{ar ? eligibilityModalJob.eligibility.proofSourceNameAr : (eligibilityModalJob.eligibility.proofSourceNameEn || "المصدر الرسمي")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              )}

              {/* Payout Channels Guarantee */}
              <div className="p-3 rounded-2xl bg-background/40 border border-border text-xs space-y-1">
                <span className="font-bold text-foreground block">
                  {ar ? "💳 طرق سحب الأرباح المعتمدة:" : "💳 Supported Cashout Methods:"}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {eligibilityModalJob.withdrawal.methods.map(m => ar ? m.name : (m.nameEn || m.name)).join(" • ")}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setEligibilityModalJob(null)}
              >
                {ar ? "إغلاق" : "Close"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
