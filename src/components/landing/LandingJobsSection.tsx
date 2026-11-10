import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Globe2, DollarSign, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobsData";
import { TashkeelText } from "./TashkeelText";

interface LandingJobsSectionProps {
  featuredJobs: Job[];
  t: (key: string) => string;
  isRtl: boolean;
  lang: string;
  onSelectJob: (id: string) => void;
  onViewAll: () => void;
}

export const LandingJobsSection: React.FC<LandingJobsSectionProps> = ({
  featuredJobs,
  t,
  isRtl,
  lang,
  onSelectJob,
  onViewAll,
}) => {
  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-2xs font-bold mb-2.5 shadow-sm">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{isRtl ? "دخل بالدولار ومشاريع عالمية" : "USD Earnings & Global Projects"}</span>
        </div>
        <h2
          className="font-bold text-fluid-hero text-gold-gradient"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {lang === "ar" ? <TashkeelText>{t("landingFreelanceTitle")}</TashkeelText> : t("landingFreelanceTitle")}
        </h2>
        <p className="text-muted-foreground text-fluid-body mt-1.5 max-w-xl mx-auto">
          {t("landingFreelanceSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredJobs.map((job, idx) => {
          const displayTitle = lang === "en" ? job.titleEn || job.title : job.title;
          const earning =
            job.salary.average ||
            `$${job.salary.min} - $${job.salary.max} / ${job.salary.period === "month" ? (isRtl ? "شهر" : "mo") : (isRtl ? "مشروع" : "proj")}`;

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              onClick={() => onSelectJob(job.id)}
              className="cursor-pointer rounded-2xl p-5 sm:p-6 bg-card/85 hover:bg-card backdrop-blur-md border border-primary/25 hover:border-primary/60 transition-all shadow-luxe flex flex-col justify-between min-h-[295px] sm:min-h-[315px] group"
            >
              <div>
                {/* Card Header: Job Icon + Company (start) & Match Score Badge (end) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-background/90 border border-sky-500/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                      <span>{job.emoji || "💼"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black truncate text-sky-400">{job.company}</p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap block truncate">
                        {isRtl ? "عمل عن بُعد 100% · حر" : "100% Remote · Freelance"}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-sky-500/15 border border-sky-500/40 text-sky-400 flex-shrink-0 shadow-xs">
                    98%
                  </span>
                </div>

                {/* Full-width Title with Fluid Typography */}
                <h3 className="text-fluid-title font-bold text-foreground leading-relaxed line-clamp-2 my-2 group-hover:text-primary transition-colors">
                  {displayTitle}
                </h3>

                {/* Clean Vertical Metadata List (8-point spacing) */}
                <div className="space-y-2 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5 text-fluid-body">
                    <Globe2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-foreground/90 font-medium">
                      {isRtl ? "العمل متاح لجميع الدول العربية والعالمية" : "Available Globally & Arab Countries"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-fluid-body text-amber-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{earning}</span>
                  </div>
                  {((lang === "en" ? (job.skillsEn || job.skills) : job.skills) || []).length > 0 && (
                    <div className="flex items-center gap-2.5 text-fluid-caption text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">
                        {((lang === "en" ? (job.skillsEn || job.skills) : job.skills) || []).slice(0, 3).join(" • ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Dedicated Bottom Action Strip */}
              <div className="pt-3.5 mt-4 border-t border-border/40 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="h-10 px-4 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-400 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isRtl ? "معاينة الفرصة" : "View Details"}</span>
                  <span className="text-xs">↗</span>
                </button>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  {isRtl ? "انتقال فوري للفرصة" : "Direct In-App"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Button
          variant="luxe"
          size="lg"
          onClick={onViewAll}
          className="px-8 shadow-gold inline-flex items-center gap-2 whitespace-nowrap font-bold cursor-pointer"
        >
          <span>{t("landingFreelanceViewAll")}</span>
          <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </section>
  );
};
