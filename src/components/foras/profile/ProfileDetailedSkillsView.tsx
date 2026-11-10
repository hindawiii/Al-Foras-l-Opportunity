import React from "react";
import { Award } from "lucide-react";
import type { SkillEntry } from "@/lib/profileExtras";
import { SKILL_CATEGORY_META } from "./profileTypes";

interface ProfileDetailedSkillsViewProps {
  skills: SkillEntry[];
  ar: boolean;
}

export const ProfileDetailedSkillsView: React.FC<ProfileDetailedSkillsViewProps> = ({
  skills,
  ar,
}) => {
  if (skills.length === 0) return null;

  return (
    <div className="bg-card-gradient border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-3 shadow-luxe">
      <h3 className="text-xs sm:text-sm font-bold text-gold-gradient flex items-center gap-2">
        <Award className="w-4 h-4 text-gold flex-shrink-0" />
        <span>{ar ? "المهارات المتقدمة ومستوى الإتقان" : "Detailed Skills & Proficiency"}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {skills.map((sk, idx) => {
          const cat = SKILL_CATEGORY_META[sk.category];
          return (
            <div key={idx} className="bg-background/70 border border-border/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex-shrink-0">{cat?.emoji || "⚡"}</span>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-foreground truncate">{sk.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ar ? cat?.labelAr : cat?.labelEn}</p>
                </div>
              </div>
              <div className="flex gap-1 items-center flex-shrink-0" title={`Level: ${sk.level} / 5`}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 w-3 rounded-full transition-colors ${lvl <= sk.level ? "bg-primary" : "bg-muted/70"}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
