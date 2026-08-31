import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Award,
  Link as LinkIcon,
  BookOpen,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  AIMatchingReadinessResult,
  AIMatchingSignal,
} from "@/lib/profileExtras";

interface AIMatchingReadinessCardProps {
  readiness: AIMatchingReadinessResult;
  onQuickActionClick: (signal: AIMatchingSignal) => void;
  hideDetails?: boolean;
}

export const AIMatchingReadinessCard: React.FC<AIMatchingReadinessCardProps> = ({
  readiness,
  onQuickActionClick,
  hideDetails = false,
}) => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [expanded, setExpanded] = useState(false);

  const isProfessional = readiness.persona === "professional";
  const NextIcon = ar ? ArrowLeft : ArrowRight;

  // Determine theme colors based on score
  const isElite = readiness.score >= 90;
  const isOptimized = readiness.score >= 70 && readiness.score < 90;
  const isGood = readiness.score >= 45 && readiness.score < 70;

  const statusColor = isElite
    ? "text-emerald-400"
    : isOptimized
    ? "text-amber-400"
    : isGood
    ? "text-primary"
    : "text-amber-500";

  const getSignalIcon = (iconName: string) => {
    switch (iconName) {
      case "gpa":
      case "degree":
        return <GraduationCap className="w-4 h-4" />;
      case "experience":
        return <Briefcase className="w-4 h-4" />;
      case "skills":
        return <Award className="w-4 h-4" />;
      case "links":
        return <LinkIcon className="w-4 h-4" />;
      case "major":
        return <Target className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      case "bio":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden border border-primary/40 bg-card/90 backdrop-blur-md shadow-luxe transition-all duration-300 group hover:border-primary/60"
    >
      {/* Dynamic ambient backdrop glow */}
      <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%),linear-gradient(180deg,hsl(var(--card)/0.9),hsl(var(--background)/0.95))]" />
      <div className="pointer-events-none absolute -top-12 -end-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gold-gradient opacity-90" />

      <div className="relative p-5 sm:p-6 space-y-4">
        {/* Header: AI Badge & Tier Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-gradient p-[1px] shadow-gold flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[15px] bg-background/90 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-1.5">
                  <span>
                    {ar
                      ? isProfessional
                        ? "دقة المطابقة الذكية للوظائف (AI Match)"
                        : "دقة المطابقة الذكية للمنح (AI Match)"
                      : isProfessional
                      ? "AI Job Matching Precision"
                      : "AI Scholarship Matching Precision"}
                  </span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-bold">
                  PRO AI
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ar ? readiness.tierLabelAr : readiness.tierLabelEn}
              </p>
            </div>
          </div>

          {/* Precision Score & Unlocked Matches Pill */}
          <div className="flex items-center gap-2 sm:gap-3 ms-auto">
            <div className="bg-background/80 border border-primary/30 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col text-start">
                <span className="text-[10px] text-muted-foreground leading-none">
                  {ar ? "الفرص المؤهلة" : "Eligible"}
                </span>
                <span className="text-xs font-bold text-foreground font-mono">
                  ~{readiness.unlockedMatchesEstimate}+ {ar ? (isProfessional ? "وظيفة" : "منحة") : (isProfessional ? "Jobs" : "Grants")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center min-w-[56px] h-10 rounded-2xl bg-gold-gradient text-primary-foreground font-display font-bold text-base shadow-gold px-2.5">
              {readiness.score}%
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar with Milestones */}
        <div className="space-y-1.5">
          <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden p-[2px] border border-border/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(6, readiness.score)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isElite
                  ? "bg-gradient-to-r from-primary via-emerald-400 to-primary-glow shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  : "bg-gold-gradient shadow-gold"
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
            <span>
              {ar
                ? `تم إكمال ${readiness.completedCount} من أصل ${readiness.totalCount} مؤشرات حيوية`
                : `${readiness.completedCount} of ${readiness.totalCount} key signals completed`}
            </span>
            <span className={`font-semibold ${statusColor}`}>
              {readiness.score >= 90
                ? ar
                  ? "جاهز للمطابقة بنسبة 100% 🎯"
                  : "100% Matching Ready 🎯"
                : ar
                ? `متبقي ${readiness.missingCritical.length} مؤشرات لرفع الدقة`
                : `${readiness.missingCritical.length} signals left`}
            </span>
          </div>
        </div>

        {/* Critical Missing Signals Spotlight (Primary Action Area) */}
        {readiness.missingCritical.length > 0 && !hideDetails && (
          <div className="bg-background/70 border border-primary/25 rounded-2xl p-3.5 sm:p-4 space-y-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>
                  {ar
                    ? "معلومات حاسمة مطلوبة لضمان دقة خوارزمية الذكاء الاصطناعي:"
                    : "Crucial information required for AI matching algorithm:"}
                </span>
              </div>
            </div>

            {/* Top Critical Recommendation */}
            {readiness.missingCritical.slice(0, 2).map((signal) => (
              <div
                key={signal.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all group/item shadow-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getSignalIcon(signal.iconName)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground truncate">
                        {ar ? signal.labelAr : signal.labelEn}
                      </p>
                      <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">
                        {ar ? "هام جداً" : "Crucial"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1 sm:line-clamp-none">
                      {ar ? signal.whyImportantAr : signal.whyImportantEn}
                    </p>
                    <p className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{ar ? signal.unlocksCountHintAr : signal.unlocksCountHintEn}</span>
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => onQuickActionClick(signal)}
                  size="sm"
                  variant="gold"
                  className="h-8 px-3 text-xs font-bold rounded-xl flex-shrink-0 self-end sm:self-center shadow-gold group-hover/item:scale-105 transition-transform"
                >
                  <span>{ar ? "إكمال الحقل الآن" : "Fill Now"}</span>
                  <NextIcon className="w-3.5 h-3.5 ms-1" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Accordion / Drawer for all signals preview */}
        {!hideDetails && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary-glow font-bold transition-colors"
            >
              <span>
                {expanded
                  ? ar
                    ? "إخفاء التفاصيل وخريطة الإشارات"
                    : "Hide AI signal breakdown"
                  : ar
                  ? "عرض تفاصيل جميع معايير ومؤشرات الذكاء الاصطناعي"
                  : "View all AI matching signals breakdown"}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-2 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {readiness.allSignals.map((signal) => (
                      <div
                        key={signal.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          signal.isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/25"
                            : "bg-background/50 border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                signal.isCompleted
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {getSignalIcon(signal.iconName)}
                            </span>
                            <span className="font-bold text-foreground truncate">
                              {ar ? signal.labelAr : signal.labelEn}
                            </span>
                          </div>
                          {signal.isCompleted ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{ar ? "مكتمل" : "Ready"}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onQuickActionClick(signal)}
                              className="text-[11px] text-primary font-bold hover:underline"
                            >
                              {ar ? "إضافة" : "Add"}
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">
                          {ar ? signal.whyImportantAr : signal.whyImportantEn}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 text-xs text-foreground/90 mt-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      {ar
                        ? "نظام المطابقة الحصري لدينا يعتمد على تحليل البيانات دلالياً وربطها بقواعد بيانات الجامعات والمؤسسات المانحة والشركات العالمية الموثقة لتوفير فرص تناسبك بدقة 100%."
                        : "Our proprietary AI matching engine semantically cross-references your profile signals against verified international scholarships and global job listings for precision accuracy."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
