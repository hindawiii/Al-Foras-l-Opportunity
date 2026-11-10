import React from "react";
import { Clock, Briefcase } from "lucide-react";
import type { ProfileExtras } from "@/lib/profileExtras";
import { EXPERIENCE_OPTIONS } from "./profileTypes";

interface ProfileExperienceViewProps {
  extras: ProfileExtras;
  ar: boolean;
}

export const ProfileExperienceView: React.FC<ProfileExperienceViewProps> = ({
  extras,
  ar,
}) => {
  const expLabel = EXPERIENCE_OPTIONS.find(e => e.value === extras.experienceYears);
  if (!expLabel) return null;

  return (
    <div className="bg-card-gradient border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-3 shadow-luxe">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-gold-gradient flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold flex-shrink-0" />
          <span>{ar ? "سنوات الخبرة العملية" : "Work Experience"}</span>
        </h3>
        <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-bold border border-primary/20">
          {ar ? "موثق" : "Verified"}
        </span>
      </div>
      <div className="bg-background/70 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">
          {ar ? expLabel.labelAr : expLabel.labelEn}
        </span>
        <Briefcase className="w-4 h-4 text-primary/70" />
      </div>
    </div>
  );
};
