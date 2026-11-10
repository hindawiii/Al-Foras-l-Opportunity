import React from "react";
import { GraduationCap } from "lucide-react";
import type { ProfileExtras } from "@/lib/profileExtras";
import { DEGREE_OPTIONS } from "./profileTypes";

interface ProfileAcademicViewProps {
  extras: ProfileExtras;
  educationNotes?: string;
  ar: boolean;
}

export const ProfileAcademicView: React.FC<ProfileAcademicViewProps> = ({
  extras,
  educationNotes,
  ar,
}) => {
  const degreeLabel = DEGREE_OPTIONS.find(d => d.value === extras.degree);

  return (
    <div className="bg-card-gradient border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-luxe">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-gold-gradient flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gold flex-shrink-0" />
          <span>{ar ? "المؤهلات الأكاديمية والتعليم" : "Academic Background & Education"}</span>
        </h3>
        {degreeLabel && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            {ar ? degreeLabel.labelAr : degreeLabel.labelEn}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {extras.university && (
          <div className="bg-background/70 border border-primary/20 rounded-xl p-3.5 space-y-1">
            <p className="text-xs text-foreground/75 font-semibold">{ar ? "الجامعة / الكلية" : "University / College"}</p>
            <p className="font-bold text-foreground text-sm sm:text-base">{extras.university}</p>
          </div>
        )}
        {extras.highSchool && (
          <div className="bg-background/70 border border-primary/20 rounded-xl p-3.5 space-y-1">
            <p className="text-xs text-foreground/75 font-semibold">{ar ? "المدرسة الثانوية" : "High School"}</p>
            <p className="font-bold text-foreground text-sm sm:text-base">{extras.highSchool}</p>
          </div>
        )}
        {extras.major && (
          <div className="bg-background/70 border border-primary/20 rounded-xl p-3.5 space-y-1">
            <p className="text-xs text-foreground/75 font-semibold">{ar ? "التخصص الأكاديمي" : "Field / Major"}</p>
            <p className="font-bold text-foreground text-sm sm:text-base">{extras.major}</p>
          </div>
        )}
        {extras.gpa && (
          <div className="bg-background/70 border border-primary/20 rounded-xl p-3.5 space-y-1">
            <p className="text-xs text-foreground/75 font-semibold">{ar ? "المعدل التراكمي / النسبة" : "GPA / Grade"}</p>
            <p className="font-bold text-amber-300 text-sm sm:text-base font-mono">
              {extras.gpa} {extras.gpaScale === "100" ? "%" : `/ ${extras.gpaScale}`}
            </p>
          </div>
        )}
      </div>

      {educationNotes && (
        <p className="text-xs sm:text-sm text-foreground/95 leading-relaxed pt-2 border-t border-border/60">
          {educationNotes}
        </p>
      )}
    </div>
  );
};
