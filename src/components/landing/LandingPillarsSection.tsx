import React from "react";
import { motion } from "framer-motion";
import { Target, GraduationCap, Briefcase, Brain, ArrowRight } from "lucide-react";
import { TashkeelText } from "./TashkeelText";

interface LandingPillarsSectionProps {
  t: (key: string) => string;
  isRtl: boolean;
  lang: string;
  onSelectPillar: (tab: string) => void;
}

export const LandingPillarsSection: React.FC<LandingPillarsSectionProps> = ({
  t,
  isRtl,
  lang,
  onSelectPillar,
}) => {
  return (
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
          onClick={() => onSelectPillar("scholarships")}
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
          onClick={() => onSelectPillar("jobs")}
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
          onClick={() => onSelectPillar("profile")}
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
  );
};
