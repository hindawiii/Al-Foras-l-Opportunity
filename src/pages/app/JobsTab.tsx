import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Briefcase, Globe, ExternalLink, Sparkles, Filter, Clock,
  DollarSign, CheckCircle2, ShieldAlert, Award, Star, ArrowRight, ArrowLeft,
  BookOpen, HelpCircle, ChevronDown, ChevronUp, MapPin, Building2,
  TrendingUp, Wallet, Check, AlertCircle, Share2, Layers, RefreshCw
} from "lucide-react";
import { JOBS, JOB_CATEGORIES, REGIONS_LIST, Job, JobCategory, JobRegion } from "@/lib/jobsData";
import { dynamicStore } from "@/lib/dynamicStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { nativeShare } from "@/lib/share";
import { OpportunityAICopilot } from "@/components/foras/OpportunityAICopilot";

export const JobsTab = () => {
  const { t, lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [selectedCategory, setSelectedCategory] = useState<JobCategory | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<JobRegion>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "guide" | "stories" | "payment">("overview");

  const convertCustomJobs = (custom: any[]): Job[] => {
    return custom.map(c => ({
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
        totalReviews: 120,
        trustLevel: "موثوقة ومحققة",
        trustLevelEn: "Verified Platform",
      },
      skills: (c.skills && c.skills.length > 0) ? c.skills : ["مهارات تقنية", "التزام بالعمل"],
      skillsEn: (c.skills && c.skills.length > 0) ? c.skills : ["Technical Skills", "Work Commitment"],
      description: c.description_ar || "تفاصيل فرصة العمل والمهام المطلوبة من المتقدم.",
      descriptionEn: c.description_en || c.description_ar,
      requirements: (c as any).requirements_ar || ["مهارات مهنية مناسبة", "الالتزام بالمواعيد والجودة"],
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
      pros: (c.benefits_ar && c.benefits_ar.length > 0) ? c.benefits_ar : ["مرونة العمل من أي مكان", "دخل بالدولار الأمريكي"],
      prosEn: ["100% Remote flexibility", "USD compensation"],
      cons: ["تتطلب إدارة ذاتية للوقت والمهام"],
      consEn: ["Requires self time management"],
      successStories: [],
      isVerified: true,
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
    const handleUpdate = () => {
      const custom = dynamicStore.getJobs();
      const converted = convertCustomJobs(custom);
      const customIds = new Set(converted.map(j => j.id));
      setLiveJobs([...converted, ...JOBS.filter(j => !customIds.has(j.id))]);
    };
    window.addEventListener("foras:data-updated", handleUpdate);
    return () => window.removeEventListener("foras:data-updated", handleUpdate);
  }, []);

  // Filtering based on category, region, and search query
  const filteredJobs = useMemo(() => {
    return liveJobs.filter((job) => {
      // Category filter
      if (selectedCategory !== "all" && job.category !== selectedCategory) {
        return false;
      }
      // Region filter
      if (selectedRegion !== "all") {
        if (selectedRegion === "arab" && job.region !== "arab") return false;
        if (selectedRegion === "americas" && job.region !== "americas") return false;
        if (selectedRegion === "europe" && job.region !== "europe") return false;
        if (selectedRegion === "asia_africa" && job.region !== "asia_africa") return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = job.title.toLowerCase().includes(q) || (job.titleEn && job.titleEn.toLowerCase().includes(q));
        const companyMatch = job.company.toLowerCase().includes(q);
        const descMatch = job.description.toLowerCase().includes(q) || (job.descriptionEn && job.descriptionEn.toLowerCase().includes(q));
        const skillMatch = job.skills.some(s => s.toLowerCase().includes(q)) || (job.skillsEn && job.skillsEn.some(s => s.toLowerCase().includes(q)));
        return titleMatch || companyMatch || descMatch || skillMatch;
      }
      return true;
    });
  }, [selectedCategory, selectedRegion, searchQuery, liveJobs]);

  const shareJob = async (job: Job) => {
    const title = ar ? job.title : (job.titleEn || job.title);
    await nativeShare({
      title: `${ar ? "منصة عمل حر" : "Freelance Platform"}: ${job.company}`,
      text: `${title} - ${job.company}`,
      url: job.contact.website || window.location.href,
    });
  };

  return (
    <div className="space-y-4 w-full pb-10">
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
            placeholder={ar ? "ابحث عن منصة، مهارة (برمجة، تصميم، ترجمة، كتابة، تسويق)..." : "Search platform or skill (dev, design, translation, writing)..."}
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
          {ar ? "محدثة ومحققة 100%" : "Verified & Live"}
        </span>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredJobs.map((job) => {
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
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-card border border-primary/30 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                      {job.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-base text-foreground">{job.company}</h3>
                        {job.isVerified && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-verified/15 text-verified text-[10px] font-bold">
                            ✓ {ar ? "موثوقة" : "Verified"}
                          </span>
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

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  {desc}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(ar ? job.skills : (job.skillsEn || job.skills)).slice(0, 3).map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded-md text-[10px] bg-primary/10 text-primary border border-primary/20">
                      {sk}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground">
                      +{job.skills.length - 3}
                    </span>
                  )}
                </div>
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

      {filteredJobs.length === 0 && (
        <div className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-border p-6">
          <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-bold text-foreground text-base mb-1">
            {ar ? "لم يتم العثور على منصات مطابقة" : "No matching platforms found"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {ar ? "جرب تغيير كلمات البحث أو اختيار قارة وتصنيف آخر" : "Try changing your search terms or region filter"}
          </p>
          <Button
            variant="luxe"
            size="sm"
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedRegion("all"); }}
          >
            {ar ? "إعادة تعيين الفلاتر" : "Reset Filters"}
          </Button>
        </div>
      )}

      {/* Detail & Step-by-Step Registration Sheet */}
      <Sheet open={!!selectedJob} onOpenChange={(v) => !v && setSelectedJob(null)}>
        <SheetContent side="bottom" className="bg-card border-gold/30 rounded-t-3xl max-h-[92vh] overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-card border-2 border-primary/40 flex items-center justify-center text-3xl shadow-gold">
                      {selectedJob.emoji}
                    </div>
                    <div>
                      <SheetTitle className={`${alignClass} font-display text-xl text-gold-gradient`}>
                        {selectedJob.company}
                      </SheetTitle>
                      <p className={`text-xs text-primary font-bold ${alignClass}`}>
                        {ar ? selectedJob.type : (selectedJob.typeEn || selectedJob.type)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => shareJob(selectedJob)}
                    className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <h3 className={`font-bold text-base text-foreground leading-snug ${alignClass}`}>
                  {ar ? selectedJob.title : (selectedJob.titleEn || selectedJob.title)}
                </h3>
              </SheetHeader>

              {/* Sub-Tabs inside Modal */}
              <div className="flex border-b border-border my-4 gap-2 overflow-x-auto scrollbar-hide">
                {[
                  { id: "overview" as const, labelAr: "نظرة عامة", labelEn: "Overview" },
                  { id: "guide" as const, labelAr: "خطوات التسجيل", labelEn: "Step-by-Step Guide" },
                  { id: "payment" as const, labelAr: "سحب الأرباح", labelEn: "Withdrawal & Payout" },
                  { id: "stories" as const, labelAr: "قصص نجاح", labelEn: "Success Stories" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveTab(st.id)}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                      activeTab === st.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ar ? st.labelAr : st.labelEn}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="bg-card-gradient border border-border rounded-2xl p-4 leading-relaxed text-sm text-foreground">
                    <p>{ar ? selectedJob.description : (selectedJob.descriptionEn || selectedJob.description)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-background/50 border border-border rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground font-semibold">{ar ? "متوسط الأجور" : "Average Pay"}</p>
                      <p className="text-sm font-bold text-gold-gradient mt-0.5">
                        {selectedJob.salary.min} - {selectedJob.salary.max} {selectedJob.salary.currency}
                      </p>
                    </div>
                    <div className="bg-background/50 border border-border rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground font-semibold">{ar ? "عمولة المنصة" : "Platform Fee"}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {selectedJob.commission?.percentage || "0%"}
                      </p>
                    </div>
                  </div>

                  {/* Requirements & Skills */}
                  <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {ar ? "متطلبات البدء والمهارات المطلوبة" : "Requirements & Skills"}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-foreground/90">
                      {(ar ? selectedJob.requirements : (selectedJob.requirementsEn || selectedJob.requirements)).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dynamic Custom Fields if present */}
                  {((selectedJob as any).custom_fields || []).filter((f: any) => f && f.label && f.value && f.label.trim() && f.value.trim()).length > 0 && (
                    <div className="bg-primary/5 border border-primary/30 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {ar ? "شروط وملاحظات مخصصة إضافية" : "Additional Custom Criteria"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {((selectedJob as any).custom_fields || []).filter((f: any) => f && f.label && f.value && f.label.trim() && f.value.trim()).map((f: any, idx: number) => (
                          <div key={idx} className="bg-background/60 border border-primary/20 rounded-xl p-2.5">
                            <span className="block text-[11px] text-primary font-bold">{f.label}</span>
                            <span className="text-xs text-foreground font-medium">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 space-y-1.5">
                      <p className="text-xs font-bold text-emerald-400">{ar ? "المميزات" : "Pros"}</p>
                      {(ar ? selectedJob.pros : (selectedJob.prosEn || selectedJob.pros))?.map((p, i) => (
                        <p key={i} className="text-[11px] text-foreground flex items-center gap-1.5">
                          <span className="text-emerald-400">✓</span> {p}
                        </p>
                      ))}
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 space-y-1.5">
                      <p className="text-xs font-bold text-amber-400">{ar ? "ملاحظات وتحديات" : "Notes & Cons"}</p>
                      {(ar ? selectedJob.cons : (selectedJob.consEn || selectedJob.cons))?.map((c, i) => (
                        <p key={i} className="text-[11px] text-foreground flex items-center gap-1.5">
                          <span className="text-amber-400">!</span> {c}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STEP BY STEP REGISTRATION */}
              {activeTab === "guide" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-primary/10 p-3 rounded-xl border border-primary/30">
                    <span className="font-bold text-primary">{ar ? "الوقت التقديري لإكمال التسجيل:" : "Estimated Setup Time:"}</span>
                    <span className="font-bold text-foreground">
                      {ar ? selectedJob.registrationGuide.estimatedTime : (selectedJob.registrationGuide.estimatedTimeEn || selectedJob.registrationGuide.estimatedTime)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedJob.registrationGuide.steps.map((st) => (
                      <div key={st.step} className="bg-card-gradient border border-border rounded-2xl p-4 relative">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-gold-gradient text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-gold">
                            {st.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-foreground mb-1">
                              {ar ? st.title : (st.titleEn || st.title)}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {ar ? st.description : (st.descriptionEn || st.description)}
                            </p>
                            {(st.tips || st.tipsEn) && (
                              <div className="mt-2 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-lg p-2 font-medium">
                                💡 {ar ? "نصيحة ذهبية:" : "Pro Tip:"} {ar ? st.tips : (st.tipsEn || st.tips)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WITHDRAWAL & PAYOUT */}
              {activeTab === "payment" && (
                <div className="space-y-3">
                  <div className="bg-card-gradient border border-border rounded-2xl p-4">
                    <p className="text-xs text-primary font-bold mb-1">{ar ? "الحد الأدنى للسحب ووقت المعالجة" : "Min Payout & Processing"}</p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedJob.withdrawal.minAmount} {selectedJob.withdrawal.currency} — {ar ? selectedJob.withdrawal.processingTime : (selectedJob.withdrawal.processingTimeEn || selectedJob.withdrawal.processingTime)}
                    </p>
                  </div>

                  <h4 className="text-xs font-bold text-foreground px-1">{ar ? "طرق السحب المتاحة والبدائل للمنطقة:" : "Available Payout Methods & Alternatives:"}</h4>
                  <div className="space-y-2">
                    {selectedJob.withdrawal.methods.map((m, idx) => (
                      <div key={idx} className="bg-background/60 border border-border rounded-xl p-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">{ar ? m.name : (m.nameEn || m.name)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.availableInSudan ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                            {m.availableInSudan ? (ar ? "متاح في منطقتك" : "Supported in region") : (ar ? "يحتاج بديل" : "Alternative needed")}
                          </span>
                        </div>
                        {(m.notes || m.notesEn) && (
                          <p className="text-[11px] text-muted-foreground">{ar ? m.notes : (m.notesEn || m.notes)}</p>
                        )}
                        {m.alternativeForSudan && (
                          <p className="text-[11px] text-primary font-medium">
                            👉 {ar ? "البديل الموصى به:" : "Recommended Alternative:"} {ar ? m.alternativeForSudan : (m.alternativeForSudanEn || m.alternativeForSudan)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SUCCESS STORIES */}
              {activeTab === "stories" && (
                <div className="space-y-3">
                  {selectedJob.successStories.length > 0 ? (
                    selectedJob.successStories.map((st, i) => (
                      <div key={i} className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{ar ? st.name : (st.nameEn || st.name)}</h4>
                            <p className="text-[10px] text-muted-foreground">{ar ? st.city : (st.cityEn || st.city)}</p>
                          </div>
                          {st.earnings && (
                            <span className="px-2 py-1 rounded-lg bg-gold-gradient text-primary-foreground text-xs font-bold shadow-gold">
                              {ar ? st.earnings : (st.earningsEn || st.earnings)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed italic">
                          "{ar ? st.story : (st.storyEn || st.story)}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-muted-foreground py-8">
                      {ar ? "سيتم إضافة المزيد من قصص النجاح قريباً" : "More success stories coming soon"}
                    </p>
                  )}
                </div>
              )}

              {/* Dedicated Opportunity AI Copilot */}
              <OpportunityAICopilot
                type="job"
                item={selectedJob}
                onOpenAdvisor={() => setSelectedJob(null)}
              />

              {/* Direct Link Button */}
              <div className="pt-2 mt-1">
                <Button asChild variant="luxe" size="lg" className="w-full">
                  <a
                    href={selectedJob.contact.website}
                    target="_blank"
                    rel="noopener noreferrer external"
                  >
                    <ExternalLink className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                    {ar ? `الانتقال إلى موقع ${selectedJob.company} الرسمي` : `Visit Official ${selectedJob.company} Website`}
                  </a>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
