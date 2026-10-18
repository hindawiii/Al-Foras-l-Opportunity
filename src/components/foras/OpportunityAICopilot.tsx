import React, { useState } from "react";
import { Sparkles, Bot, CheckCircle2, TrendingUp, HelpCircle, ArrowRight, ArrowLeft, MessageSquare, Award, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface OpportunityAICopilotProps {
  type?: "scholarship" | "job";
  item?: any;
  opportunity?: any;
  onOpenAdvisor?: (prompt?: string) => void;
}

export const OpportunityAICopilot: React.FC<OpportunityAICopilotProps> = ({
  type = "scholarship",
  item,
  opportunity,
  onOpenAdvisor,
}) => {
  const { lang, dir } = useLanguage();
  const { user } = useAuth();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";

  const [activeStep, setActiveStep] = useState<"actions" | "match_analysis" | "interview_prep">("actions");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const target = item || opportunity;
  if (!target) {
    return null;
  }

  const title =
    (ar
      ? target?.title || target?.title_ar || target?.name
      : target?.titleEn || target?.title_en || target?.title || target?.title_ar || target?.name) ||
    (ar ? "الفرصة المحددة" : "Selected Opportunity");

  const org =
    (ar
      ? target?.org || target?.company || target?.university
      : target?.orgEn || target?.company || target?.org || target?.university) ||
    (ar ? "الجهة المانحة" : "Offering Organization");

  // Trigger Advisor with loaded context
  const handleAskAdvisor = (actionType: "inquiry" | "eligibility" | "sop" | "interview") => {
    let customPrompt = "";
    if (actionType === "inquiry") {
      customPrompt = ar
        ? `أريد الاستفسار بالتفصيل عن فرصة: "${title}" المقدمة من "${org}". ما هي الشروط الدقيقة والمستندات المطلوبة وطريقة التقديم خطوة بخطوة؟`
        : `I want detailed inquiry regarding "${title}" by "${org}". What are the exact requirements, documents, and step-by-step application process?`;
      window.dispatchEvent(new CustomEvent("open-ai-advisor", { detail: { mode: "chat", prompt: customPrompt } }));
    } else if (actionType === "eligibility") {
      customPrompt = ar
        ? `قارن ملفي الشخصي وسيرتي الذاتية مع متطلبات "${title}". ما هي نسبة القبول المتوقعة، نقاط القوة لدي، والنقاط التي يجب علي تجهيزها؟`
        : `Compare my profile and CV against the requirements for "${title}". What is my acceptance probability and what gaps should I improve?`;
      window.dispatchEvent(new CustomEvent("open-ai-advisor", { detail: { mode: "chat", prompt: customPrompt } }));
    } else if (actionType === "sop") {
      window.dispatchEvent(new CustomEvent("open-ai-advisor", { detail: { mode: "essay", opportunity: target } }));
      toast.success(ar ? "تم فتح مولد خطابات الدافع المخصص لهذه الفرصة ✨" : "Opened AI SOP Generator for this opportunity ✨");
      return;
    } else {
      customPrompt = ar
        ? `أريد الدخول في محاكاة مقابلة وتجهيز كامل للقبول في "${title}". اسألني أول سؤال من أسئلة المقابلة المتوقعة وقيّم إجاباتي بدقة.`
        : `Start a full acceptance preparation and mock interview for "${title}". Ask me the first expected interview question and evaluate my answer.`;
      window.dispatchEvent(new CustomEvent("open-ai-advisor", { detail: { mode: "chat", prompt: customPrompt } }));
    }

    if (onOpenAdvisor && customPrompt) {
      onOpenAdvisor(customPrompt);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-card/95 via-[#0e2714]/60 to-card/95 border-2 border-primary/40 p-4 space-y-3.5 shadow-luxe my-3">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#B8860B] border border-primary/50 flex items-center justify-center text-white shadow-gold p-1">
            <img src="/al-foras-icon.png" alt="AI Copilot" className="w-full h-full object-contain drop-shadow" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gold-gradient leading-tight flex items-center gap-1.5">
              <span>{ar ? "مستشار الذكاء الاصطناعي الخاص بهذه الفرصة" : "Dedicated AI Copilot for this Opportunity"}</span>
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {ar
                ? "استفسار فوري • صياغة خطاب الدافع • فحص التطابق • محاكاة المقابلات لضمان القبول"
                : "Live inquiry • AI SOP drafting • Match analysis • Mock interview prep"}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Main Action Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Action 1: Instant Inquire */}
        <button
          onClick={() => handleAskAdvisor("inquiry")}
          className="p-3 rounded-xl bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-start gap-1.5 text-right cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
              {ar ? "استفسار" : "Inquire"} {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </span>
          </div>
          <span className="text-xs font-bold text-foreground truncate max-w-full">{ar ? "شروط وتفاصيل" : "Requirements"}</span>
          <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
            {ar ? "المواعيد والأوراق" : "Dates & papers"}
          </span>
        </button>

        {/* Action 2: Profile Match & Gap Comparison */}
        <button
          onClick={() => handleAskAdvisor("eligibility")}
          className="p-3 rounded-xl bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-start gap-1.5 text-right cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
              {ar ? "فحص" : "Match"} {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </span>
          </div>
          <span className="text-xs font-bold text-foreground truncate max-w-full">{ar ? "نسبة التطابق" : "Profile Fit"}</span>
          <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
            {ar ? "نقاط القوة والنواقص" : "Gaps & strengths"}
          </span>
        </button>

        {/* Action 3: AI SOP Statement of Purpose Drafting */}
        <button
          onClick={() => handleAskAdvisor("sop")}
          className="p-3 rounded-xl bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-start gap-1.5 text-right cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-sky-400 flex items-center gap-0.5">
              {ar ? "صياغة" : "Draft"} {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </span>
          </div>
          <span className="text-xs font-bold text-foreground truncate max-w-full">{ar ? "خطاب الدافع SOP" : "Draft SOP"}</span>
          <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
            {ar ? "صياغة أكاديمية فائزة" : "Winning motivation"}
          </span>
        </button>

        {/* Action 4: Mock Interview & STAR Simulator */}
        <button
          onClick={() => handleAskAdvisor("interview")}
          className="p-3 rounded-xl bg-card/80 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-start gap-1.5 text-right cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
              {ar ? "مقابلة" : "Interview"} {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </span>
          </div>
          <span className="text-xs font-bold text-foreground truncate max-w-full">{ar ? "محاكي المقابلة" : "Mock Interview"}</span>
          <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
            {ar ? "تقييم أسلوب STAR" : "STAR coaching"}
          </span>
        </button>
      </div>
    </div>
  );
};
