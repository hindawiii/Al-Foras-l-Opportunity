import React from "react";
import { Mail } from "lucide-react";
import { BrandMark } from "@/components/foras/Logo";

interface LandingFooterProps {
  t: (key: string) => string;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ t }) => {
  return (
    <footer className="relative z-10 px-5 py-12 border-t border-primary/15 bg-card/40">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 text-center">
        <BrandMark size={160} />

        <a
          href="mailto:alforas.one@gmail.com"
          dir="ltr"
          className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/30 hover:border-primary/60 transition-all duration-300 shadow-luxe cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
            <Mail className="w-3 h-3 text-primary" />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-foreground/90 tracking-wide transition-all duration-300 group-hover:text-primary">
            alforas.one@gmail.com
          </span>
        </a>

        <p className="text-2xs text-muted-foreground">{t("landingFooter")}</p>
      </div>
    </footer>
  );
};
