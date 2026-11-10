import React from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TashkeelText } from "./TashkeelText";

interface LandingArabHubSectionProps {
  t: (key: string) => string;
  isRtl: boolean;
  lang: string;
  onCheckGpa: () => void;
}

export const LandingArabHubSection: React.FC<LandingArabHubSectionProps> = ({
  t,
  isRtl,
  lang,
  onCheckGpa,
}) => {
  return (
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

      {/* 🏆 High-Impact Metrics Ticker */}
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

      {/* 🎯 Interactive Teaser Hook Card */}
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
              onClick={onCheckGpa}
              className="px-8 py-3 text-sm font-bold shadow-gold hover:scale-105 transition-transform inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>{isRtl ? "فحص ومطابقة معدلي ←" : "Match My GPA Now ←"}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
