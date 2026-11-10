import React from "react";
import { motion } from "framer-motion";
import { List, Layers, MapPin, Award, Clock, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Scholarship } from "@/lib/mockData";
import { TashkeelText } from "./TashkeelText";

interface LandingScholarshipsSectionProps {
  featuredScholarships: Scholarship[];
  t: (key: string) => string;
  isRtl: boolean;
  lang: string;
  onSelectScholarship: (id: string) => void;
  onViewMode: (view: "list" | "deck") => void;
  onViewAll: () => void;
}

export const LandingScholarshipsSection: React.FC<LandingScholarshipsSectionProps> = ({
  featuredScholarships,
  t,
  isRtl,
  lang,
  onSelectScholarship,
  onViewMode,
  onViewAll,
}) => {
  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-2xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{isRtl ? "محدثة تلقائياً مع الفرص الحية" : "Live Real-Time Sync"}</span>
        </div>
        <h2
          className="font-bold text-fluid-hero text-gold-gradient"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {lang === "ar" ? <TashkeelText>{t("landingScholarshipsTitle")}</TashkeelText> : t("landingScholarshipsTitle")}
        </h2>
        <p className="text-muted-foreground text-fluid-body mt-1 max-w-xl mx-auto">
          {t("landingScholarshipsSubtitle")}
        </p>

        {/* Dual browsing mode highlights */}
        <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => onViewMode("list")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/85 hover:bg-card border border-primary/25 hover:border-primary/50 text-xs text-foreground font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-primary" />
            <span>{isRtl ? "القائمة" : "List"}</span>
          </button>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <button
            onClick={() => onViewMode("deck")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/85 hover:bg-card border border-primary/25 hover:border-primary/50 text-xs text-foreground font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>{isRtl ? "بطاقات" : "Cards"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredScholarships.map((s, i) => {
          const displayTitle = lang === "en" ? (s.title_en || s.titleEn || s.title_ar || s.title) : (s.title_ar || s.title);
          const displayOrg = lang === "en" ? (s.orgEn || s.university || s.org) : (s.org || s.university);
          const displayCountry = lang === "en" ? (s.countryEn || s.country) : s.country;
          const displayAmount = lang === "en" ? (s.amountEn || s.stipend || s.amount) : (s.stipend || s.amount);

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="cursor-pointer rounded-2xl p-5 sm:p-6 bg-card/85 hover:bg-card backdrop-blur-md border border-primary/25 hover:border-primary/60 transition-all shadow-luxe flex flex-col justify-between min-h-[295px] sm:min-h-[315px] group"
              onClick={() => onSelectScholarship(s.id)}
            >
              <div>
                {/* Card Header: Flag + Organization Title (start) & Match Score Badge (end) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-background/90 border border-primary/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                      <span>{s.flag}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black truncate text-gold">{displayOrg}</p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap block truncate">
                        {s.category === "arab" ? (isRtl ? "منحة دراسية عربية" : "Arab Scholarship") : (isRtl ? "منحة دراسية عالمية" : "Global Scholarship")}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-gold/15 border border-gold/40 text-gold flex-shrink-0 shadow-xs">
                    {s.match_score || 95}%
                  </span>
                </div>

                {/* Full-width Title with Fluid Typography */}
                <h3 className="text-fluid-title font-bold text-foreground leading-relaxed line-clamp-2 my-2 group-hover:text-primary transition-colors">
                  {displayTitle}
                </h3>

                {/* Clean Vertical Metadata List (8-point spacing) */}
                <div className="space-y-2 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5 text-fluid-body">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-foreground/90 font-medium">{displayCountry}</span>
                  </div>
                  {displayAmount && (
                    <div className="flex items-center gap-2.5 text-fluid-body text-amber-400 font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{displayAmount}</span>
                    </div>
                  )}
                  {s.deadline && (
                    <div className="flex items-center gap-2.5 text-fluid-caption text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span>{s.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Dedicated Bottom Action Strip */}
              <div className="pt-3.5 mt-4 border-t border-border/40 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="h-10 px-4 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/35 text-primary text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isRtl ? "معاينة المنحة" : "View Details"}</span>
                  <span className="text-xs">↗</span>
                </button>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  {isRtl ? "انتقال فوري للمنحة" : "Direct In-App"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button
          variant="luxe"
          size="lg"
          onClick={onViewAll}
          className="px-8 shadow-gold inline-flex items-center gap-2 whitespace-nowrap font-bold cursor-pointer"
        >
          <span>{t("landingViewAll")}</span>
          <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </section>
  );
};
