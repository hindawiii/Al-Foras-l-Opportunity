import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { BadgeCheck, Clock, MapPin, Award, X, Heart, Search, Link2, Share2, Sparkles, Languages, GraduationCap } from "lucide-react";
import { Scholarship } from "@/lib/mockData";
import { nativeShare } from "@/lib/share";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  scholarship: Scholarship;
  onSwipe: (dir: "left" | "right") => void;
  onTap: () => void;
  active: boolean;
  index: number;
  matchScore: number;
}

const buildShareUrl = (id: string) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?scholarship=${encodeURIComponent(id)}`;
};

const TAG_TRANSLATIONS: Record<string, string> = {
  "ممولة بالكامل": "Fully Funded",
  "طب": "Medicine",
  "علوم صحية": "Health Sciences",
  "رواتب شهرية": "Monthly Stipend",
  "ماجستير": "Master's",
  "دكتوراه": "PhD",
  "هندسة": "Engineering",
  "تقنية": "Technology",
  "ذكاء اصطناعي": "AI",
  "بريطانيا": "UK",
  "قيادة": "Leadership",
  "علاقات دولية": "International Relations",
  "ألمانيا": "Germany",
  "بحث علمي": "Scientific Research",
  "أوروبا": "Europe",
  "تنقل": "Exchange",
  "أمريكا": "USA",
  "تبادل ثقافي": "Cultural Exchange",
  "علوم إنسانية": "Humanities",
  "شريعة": "Islamic Studies",
  "لغة عربية": "Arabic Language",
  "دراسات إسلامية": "Islamic Studies",
  "مكافأة مالية": "Stipend",
  "كندا": "Canada",
  "سكن مجاني": "Free Accommodation",
  "تأمين صحي": "Health Insurance",
};

export const ScholarshipCard = ({ scholarship, onSwipe, onTap, active, index, matchScore }: Props) => {
  const { lang, t, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0]);
  const saveOpacity = useTransform(x, [10, 70], [0, 1]);
  const ignoreOpacity = useTransform(x, [-70, -10], [1, 0]);

  if (!scholarship) return null;

  const handleEnd = (_: unknown, info: PanInfo) => {
    // Soft touch responsiveness: triggers with gentle displacement (>= 50px) or quick flick (velocity >= 250)
    const isSoftSwipeRight = info.offset.x > 50 || info.velocity.x > 250;
    const isSoftSwipeLeft = info.offset.x < -50 || info.velocity.x < -250;

    if (isSoftSwipeRight) {
      onSwipe("right");
    } else if (isSoftSwipeLeft) {
      onSwipe("left");
    }
  };

  const titleText = ar
    ? (scholarship?.title || (scholarship as any)?.title_ar || "")
    : (scholarship?.titleEn || (scholarship as any)?.title_en || scholarship?.title || "");
  const orgText = ar
    ? (scholarship?.org || (scholarship as any)?.university || "")
    : (scholarship?.orgEn || (scholarship as any)?.university || scholarship?.org || "");
  const countryText = ar ? scholarship?.country : (scholarship?.countryEn || scholarship?.country);
  const amountText = ar
    ? (scholarship?.amount || (scholarship as any)?.stipend || (scholarship?.coverage === "full" ? "ممولة بالكامل" : ""))
    : (scholarship?.amountEn || (scholarship as any)?.stipend || (scholarship?.coverage === "full" ? "Fully Funded" : ""));
  const levelText = ar ? scholarship?.level : (scholarship?.levelEn || scholarship?.level || "بكالوريوس / ماجستير");
  const descText = ar
    ? (scholarship?.description || (scholarship as any)?.description_ar || "")
    : (scholarship?.descriptionEn || (scholarship as any)?.description_en || scholarship?.description || "");

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await nativeShare({
      title: `${ar ? "الفرص" : "Al-Foras"} — ${titleText}`,
      text: `${titleText} — ${orgText} (${countryText})`,
      url: buildShareUrl(scholarship.id),
    });
  };

  const isArab = scholarship?.category === "arab";
  // Category-driven accents: gold-ish for Arab, cool silver/blue for Global.
  const borderClass = isArab
    ? "border-[hsl(43_74%_45%/0.55)]"
    : "border-[hsl(210_70%_60%/0.45)]";
  const glowClass = isArab
    ? "shadow-[0_25px_60px_-25px_hsl(43_74%_38%/0.55)]"
    : "shadow-[0_25px_60px_-25px_hsl(210_70%_50%/0.5)]";
  const stripClass = isArab ? "bg-gold-gradient" : "bg-gradient-to-r from-[hsl(210_70%_55%)] via-[hsl(200_80%_70%)] to-[hsl(220_60%_55%)]";
  const studyLangLabel =
    scholarship.studyLang === "ar" ? t("langArabic")
      : scholarship.studyLang === "en" ? t("langEnglish")
      : t("langBoth");

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleEnd}
      onClick={() => active && onTap()}
      style={{ x, rotate, opacity, zIndex: 10 - index }}
      initial={{ scale: 1 - index * 0.04, y: index * -8 }}
      animate={{ scale: 1 - index * 0.04, y: index * -8 }}
      whileHover={active ? { scale: 1.015, y: index * -8 - 4 } : undefined}
      whileTap={{ cursor: active ? "grabbing" : "default", scale: active ? 0.985 : undefined }}
      className="absolute inset-0 select-none touch-pan-y"
    >
      <div
        className={`relative h-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing flex flex-col border backdrop-blur-xl bg-card/40 ${borderClass} ${glowClass} transition-all duration-300`}
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        {/* subtle inner gradient sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
        <div className={`h-1.5 ${stripClass} flex-shrink-0 relative z-10`} />

        <motion.div
          style={{ opacity: saveOpacity }}
          className="absolute top-20 right-8 border-4 border-success rounded-2xl px-4 py-2 rotate-12 z-20"
        >
          <span className="text-success font-bold text-2xl">{t("saved").split("·")[0]?.trim() || t("saved")}</span>
        </motion.div>
        <motion.div
          style={{ opacity: ignoreOpacity }}
          className="absolute top-20 left-8 border-4 border-destructive rounded-2xl px-4 py-2 -rotate-12 z-20"
        >
          <span className="text-destructive font-bold text-2xl">{t("dismissed")}</span>
        </motion.div>

        <div className="p-4 sm:p-5 pt-4 flex flex-col flex-1 relative z-10 overflow-hidden" dir={dir}>
          {/* Scrollable Card Body (Ensures content never overflows or pushes buttons off) */}
          <div className="flex-1 overflow-y-auto pe-1 space-y-3 overscroll-contain">
            {/* Top row: flag avatar + match pill (start) | badges + share (end) */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-background/70 border ${
                    isArab ? "border-primary/50" : "border-[hsl(210_70%_60%/0.5)]"
                  } shadow-inner`}
                  aria-label={countryText}
                >
                  <span>{scholarship.flag}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md
                    ${
                      isArab
                        ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_18px_-2px_hsl(43_74%_45%/0.55)]"
                        : "bg-[hsl(210_70%_55%/0.15)] border-[hsl(210_70%_60%/0.5)] text-[hsl(210_90%_75%)] shadow-[0_0_18px_-2px_hsl(210_70%_55%/0.55)]"
                    }`}
                >
                  <Sparkles className="w-3 h-3" /> {matchScore}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {scholarship.verified && (
                  <span className="flex items-center gap-1 bg-verified/15 border border-verified/40 text-verified px-2 py-0.5 rounded-full text-[11px] font-medium">
                    <BadgeCheck className="w-3 h-3" /> {t("verified")}
                  </span>
                )}
                {scholarship.manualReview && (
                  <span className="flex items-center gap-1 bg-review/15 border border-review/40 text-review px-2 py-0.5 rounded-full text-[11px] font-medium">
                    <Search className="w-3 h-3" /> {t("manualReview")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm border border-primary/30 hover:bg-primary/20 flex items-center justify-center flex-shrink-0 cursor-pointer"
                  aria-label="share"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
            </div>

            {/* Title block */}
            <div className="text-start">
              <p className="text-primary text-xs sm:text-sm font-extrabold mb-1">{orgText}</p>
              <h3 className="font-display text-xl sm:text-2xl text-foreground leading-tight line-clamp-2">
                {titleText}
              </h3>
            </div>

            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3 text-start">
              {descText}
            </p>

            {/* Detail rows - only render if value exists and is non-empty */}
            <div className="space-y-1.5">
              {countryText && <Row icon={MapPin} label={t("country")} value={countryText} />}
              {amountText && <Row icon={Award} label={t("amount")} value={amountText} />}
              {levelText && <Row icon={GraduationCap} label={t("level")} value={levelText} />}
              {scholarship.deadline && (
                <Row
                  icon={Clock}
                  label={t("deadline")}
                  value={new Date(scholarship.deadline).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                />
              )}
            </div>

            {/* Tags + study language */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] bg-background/60 border border-primary/30 text-primary px-2.5 py-1 rounded-full font-medium">
                <Languages className="w-3 h-3" /> {t("studyLanguage")}: {studyLangLabel}
              </span>
              {(scholarship.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full"
                >
                  {ar ? tag : (TAG_TRANSLATIONS[tag] || tag)}
                </span>
              ))}
            </div>

            {scholarship.sourceUrl && (
              <a
                href={scholarship.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors truncate"
              >
                <Link2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" dir="ltr">
                  {scholarship.sourceUrl}
                </span>
              </a>
            )}
          </div>

          {/* Guaranteed Sticky Bottom Action Bar with X & Heart (dir="ltr" ensures physical Left=Dismiss ❌ and physical Right=Save ❤️ matching swipe physics) */}
          <div dir="ltr" className="shrink-0 pt-3 pb-2 border-t border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-center gap-6 z-30">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSwipe("left");
              }}
              title={t("dismissed")}
              aria-label={t("dismissed")}
              className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-card border-2 border-destructive/50 hover:bg-destructive/20 hover:border-destructive active:scale-90 flex items-center justify-center transition-all shadow-luxe cursor-pointer group"
            >
              <X className="w-6 h-6 text-destructive group-hover:scale-110 transition-transform" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSwipe("right");
              }}
              title={t("saved")}
              aria-label={t("saved")}
              className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gold-gradient hover:opacity-95 active:scale-90 flex items-center justify-center shadow-gold hover:scale-105 transition-all cursor-pointer group"
            >
              <Heart className="w-6 h-6 text-primary-foreground fill-current drop-shadow-sm group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Row = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-2 bg-background/40 border border-border rounded-xl px-3.5 py-2.5">
    <div className="flex items-center gap-2 text-muted-foreground text-xs flex-shrink-0 font-medium">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span>{label}</span>
    </div>
    <span className="text-foreground text-sm font-semibold truncate text-end">{value}</span>
  </div>
);
