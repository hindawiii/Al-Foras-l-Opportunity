import React from "react";
import { Languages } from "lucide-react";
import { BrandMark } from "@/components/foras/Logo";

interface LandingHeaderProps {
  lang: string;
  toggleLang: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ lang, toggleLang }) => {
  return (
    <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5 border-b border-primary/10 bg-background/50 backdrop-blur-md">
      <BrandMark size={78} />

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          className="group flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3.5 py-2 rounded-full hover:bg-primary/20 hover:border-primary/50 transition-all shadow-sm cursor-pointer"
          title={lang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
        >
          <Languages className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
          <span>{lang === "ar" ? "English 🌐" : "العربية 🌐"}</span>
        </button>
      </div>
    </header>
  );
};
