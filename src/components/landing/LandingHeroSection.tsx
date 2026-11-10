import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroSectionProps {
  t: (key: string) => string;
  isRtl: boolean;
  onPrimaryCta: () => void;
}

export const LandingHeroSection: React.FC<LandingHeroSectionProps> = ({
  t,
  isRtl,
  onPrimaryCta,
}) => {
  return (
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

        {/* Call To Action Button */}
        <div className="mt-8 flex items-center justify-center max-w-md mx-auto">
          <Button
            variant="luxe"
            size="xl"
            onClick={onPrimaryCta}
            className="w-full sm:w-[320px] py-4 text-base font-bold shadow-gold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t("landingCtaPrimary")}</span>
            <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </motion.div>
    </section>
  );
};
