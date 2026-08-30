import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  FileText,
  Coins,
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Brain,
  Globe2,
  Bot,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VisualInfographicProps {
  onNavigate?: (tab: string) => void;
}

export const FeaturesVisualInfographic = ({ onNavigate }: VisualInfographicProps) => {
  const { lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [selectedFeature, setSelectedFeature] = useState<number>(0);

  const nodes = [
    {
      id: "matching",
      tab: "scholarships",
      num: 1,
      icon: ShieldCheck,
      badgeAr: "ذكاء اصطناعي وموثوق",
      badgeEn: "AI & Verified",
      titleAr: "مصادر موثوقة ومطابقة ذكية",
      titleEn: "Smart Matching & Verified Grants",
      descAr: "منح دراسية معتمدة رسمياً ومحدثة يومياً مع خوارزمية ذكية تطابق ملفك الأكاديمي ومعدلك بالفرص المناسبة فوراً بنسبة قبول دقيقة.",
      descEn: "Officially accredited scholarships synced with an AI algorithm matching your profile & GPA for optimal acceptance rates.",
      statAr: "100% جهات معتمدة",
      statEn: "100% Verified",
      bulletPointsAr: ["فحص وتدقيق يدوي ورسمي", "مطابقة ذكية حسب المعدل والتخصص", "تنبيهات فورية بمواعيد الإغلاق"],
      bulletPointsEn: ["Official verified sources", "Smart GPA & major matching", "Deadline closing alerts"],
      colorClass: "from-amber-500/30 to-amber-600/10 border-amber-500/60 text-amber-300",
      accentBg: "bg-amber-500/20 border-amber-500/40",
      glowColor: "hsl(43 74% 49%)",
    },
    {
      id: "universities",
      tab: "arabUnis",
      num: 2,
      icon: GraduationCap,
      badgeAr: "دليل أكاديمي 8+ دول",
      badgeEn: "8+ Arab Nations",
      titleAr: "أركان ودليل الجامعات العربية",
      titleEn: "Arab Universities & Country Hubs",
      descAr: "تغطية شاملة لأكثر من 8 دولة عربية (وفي مقدمتها السودان 🇸🇩) تشمل الجامعات الحكومية والخاصة ونسب القبول والرسوم والمنح المتاحة.",
      descEn: "Comprehensive coverage of 8+ Arab countries (featuring Sudan 🇸🇩 first), public/private universities, acceptance rates, and fees.",
      statAr: "8+ دول عربية",
      statEn: "8+ Countries",
      bulletPointsAr: ["دليل شامل وموثق لكل دولة", "حساب نسب القبول ورسوم الساعات", "بوابة التقديم الإلكتروني المباشر"],
      bulletPointsEn: ["Accredited national guides", "Acceptance rates & tuition fees", "Direct online portal links"],
      colorClass: "from-emerald-500/30 to-emerald-600/10 border-emerald-500/60 text-emerald-300",
      accentBg: "bg-emerald-500/20 border-emerald-500/40",
      glowColor: "hsl(158 64% 52%)",
    },
    {
      id: "jobs",
      tab: "jobs",
      num: 3,
      icon: Briefcase,
      badgeAr: "دخل بالدولار $",
      badgeEn: "USD Earnings",
      titleAr: "وظائف دولية وعمل حر عن بُعد",
      titleEn: "Remote Freelance & Global Jobs",
      descAr: "مشاريع وفرص عمل مستقلة بمدفوعات دولية بالدولار عبر كبرى المنصات العالمية تناسب مجالات التقنية، التصميم، والمهام الرقمية.",
      descEn: "Global projects and remote jobs paid in USD across tech, design, translation, and digital tasks.",
      statAr: "مدفوعات بالدولار",
      statEn: "Paid in USD",
      bulletPointsAr: ["عقود عمل عن بُعد موثوقة", "دفع آمن بعملات أجنبية", "مشاريع للمبتدئين والمحترفين"],
      bulletPointsEn: ["Reliable remote contracts", "Secure payments in USD", "Projects for all skill levels"],
      colorClass: "from-sky-500/30 to-sky-600/10 border-sky-500/60 text-sky-300",
      accentBg: "bg-sky-500/20 border-sky-500/40",
      glowColor: "hsl(199 89% 48%)",
    },
    {
      id: "cv",
      tab: "profile",
      num: 4,
      icon: FileText,
      badgeAr: "معايير الفرز الآلي ATS",
      badgeEn: "Global ATS Standards",
      titleAr: "منشئ السيرة الذاتية الاحترافي",
      titleEn: "Professional ATS Resume Builder",
      descAr: "صياغة وتجهيز سيرة ذاتية عالمية متوافقة مع أنظمة الفرز والتوظيف الذكي (ATS) وتصديرها بصيغة PDF فورية جاهزة للمنح والوظائف.",
      descEn: "Build ATS-compatible global resumes formatted for modern recruiters and export to high-resolution PDF instantly.",
      statAr: "تصدير PDF فوري",
      statEn: "Instant PDF Export",
      bulletPointsAr: ["هيكل معتمد لدى مسؤولي التوظيف", "تحليل الكلمات المفتاحية", "تصدير بنقرة واحدة بدون علامة مائية"],
      bulletPointsEn: ["Recruiter-approved layout", "Keyword optimization", "1-click clean PDF export"],
      colorClass: "from-purple-500/30 to-purple-600/10 border-purple-500/60 text-purple-300",
      accentBg: "bg-purple-500/20 border-purple-500/40",
      glowColor: "hsl(271 91% 65%)",
    },
    {
      id: "crypto",
      tab: "news",
      num: 5,
      icon: Coins,
      badgeAr: "تحديثات حية وأسعار لحظية",
      badgeEn: "Live Rates & Economy",
      titleAr: "الأخبار والذهب والعملات",
      titleEn: "Live News, Gold & Crypto Rates",
      descAr: "متابعة دقيقة ومحدثة لأسعار صرف العملات والذهب والعملات الرقمية مع تحليلات اقتصادية وحاسبة تحويل تكاليف الدراسة والمعيشة.",
      descEn: "Real-time rates for global currencies, gold, crypto, and market news with living cost converters.",
      statAr: "أسعار لحظية",
      statEn: "Real-time Rates",
      bulletPointsAr: ["أسعار الذهب والعملات بالثانية", "حاسبة تكاليف الدراسة والسكن", "تغطية لأهم الفرص الاقتصادية"],
      bulletPointsEn: ["Per-second rates update", "Tuition & living calculator", "Economic & academic insights"],
      colorClass: "from-yellow-500/30 to-yellow-600/10 border-yellow-500/60 text-yellow-300",
      accentBg: "bg-yellow-500/20 border-yellow-500/40",
      glowColor: "hsl(48 96% 53%)",
    },
  ];

  const curr = nodes[selectedFeature];
  const CurrIcon = curr.icon;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 5-Node Interactive Visual Flow Timeline */}
      <div className="relative rounded-3xl p-5 sm:p-7 bg-card/90 border-2 border-primary/40 backdrop-blur-2xl overflow-hidden shadow-luxe">
        {/* Ambient Glow Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row: Central Core & 5 Connected Pillars */}
        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6 pb-6 border-b border-primary/25">
          {/* Central AI Advisor & Platform Core Badge */}
          <div className="flex-shrink-0 flex items-center lg:flex-col justify-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-card to-background border-2 border-primary/50 shadow-gold text-center min-w-[180px]">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-primary-foreground shadow-gold relative flex-shrink-0">
              <Bot className="w-7 h-7 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-card" />
            </div>
            <div className="text-right lg:text-center">
              <h4
                className="text-base sm:text-lg font-bold text-gold-gradient leading-tight"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {isRtl ? "منظومة الفُرَص" : "Al-Foras Hub"}
              </h4>
              <span className="text-xs sm:text-sm font-semibold text-gray-200 block mt-0.5">
                {isRtl ? "5 ركائز متكاملة للمستقبل" : "5 Integrated Core Pillars"}
              </span>
            </div>
          </div>

          {/* Interactive Connected Nodes (1 to 5) */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 w-full">
            {nodes.map((node, idx) => {
              const Icon = node.icon;
              const isSelected = selectedFeature === idx;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedFeature(idx)}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 group cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-b ${node.colorClass} shadow-gold scale-105 z-10 border-primary`
                      : "bg-card/60 border-primary/25 hover:border-primary/60 hover:bg-primary/10 text-gray-300 hover:text-white"
                  }`}
                >
                  {/* Step Number Tag */}
                  <span
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mb-2 transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                        : "bg-primary/20 text-primary border border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    {node.num}
                  </span>

                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-110 mb-1.5 ${
                      isSelected ? "text-white scale-110" : "text-primary"
                    }`}
                  />

                  <span className="text-xs sm:text-sm font-bold text-center leading-snug w-full px-1">
                    {isRtl ? node.titleAr.split(" ")[0] + " " + (node.titleAr.split(" ")[1] || "") : node.titleEn.split(" ")[0]}
                  </span>

                  <span className="text-[11px] font-medium text-gray-300 mt-1 hidden sm:block">
                    {isRtl ? node.statAr : node.statEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Section for Active Node with Rich Content & Actions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={curr.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="mt-6 pt-2 flex flex-col lg:flex-row items-stretch justify-between gap-6 bg-card/80 p-5 sm:p-7 rounded-2xl border-2 border-primary/30 shadow-inner"
          >
            {/* Left Side: Icon, Badge, Full Description & Bullet Points */}
            <div className="flex-1 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${curr.accentBg} border flex items-center justify-center flex-shrink-0 shadow-gold`}>
                <CurrIcon className="w-8 h-8 text-primary" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRtl ? curr.badgeAr : curr.badgeEn}</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-card border border-primary/30 text-gray-200">
                    {isRtl ? curr.statAr : curr.statEn}
                  </span>
                </div>

                <h3
                  className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {isRtl ? curr.titleAr : curr.titleEn}
                </h3>

                <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-3xl mb-4 font-normal">
                  {isRtl ? curr.descAr : curr.descEn}
                </p>

                {/* Key Bullet Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-primary/20">
                  {(isRtl ? curr.bulletPointsAr : curr.bulletPointsEn).map((point, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-200 bg-primary/5 px-3 py-2 rounded-xl border border-primary/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Quick Action Button & Navigation */}
            {onNavigate && (
              <div className="flex lg:flex-col items-center justify-center gap-3 flex-shrink-0 border-t lg:border-t-0 lg:border-r border-primary/20 pt-4 lg:pt-0 lg:pr-6">
                <button
                  onClick={() => onNavigate(curr.tab)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gold-gradient text-primary-foreground text-sm sm:text-base font-bold shadow-gold hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isRtl ? "استكشف هذا القسم الآن" : "Open Feature Now"}</span>
                  {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
