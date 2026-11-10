import React from "react";
import { Label } from "@/components/ui/label";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  alignClass?: string;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  alignClass = "text-right",
  className = "",
}) => (
  <div className={`bg-card-gradient border border-primary/25 rounded-3xl p-5 space-y-4 shadow-luxe ${className}`}>
    <h3 className={`font-display text-base sm:text-lg font-bold text-gold-gradient ${alignClass}`}>
      {title}
    </h3>
    {children}
  </div>
);

interface FieldProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  icon: Icon,
  label,
  children,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-xs sm:text-sm text-foreground/95 flex items-center gap-2 font-bold leading-relaxed">
      <Icon className="w-4 h-4 text-gold flex-shrink-0" />
      <span>{label}</span>
    </Label>
    {children}
  </div>
);
