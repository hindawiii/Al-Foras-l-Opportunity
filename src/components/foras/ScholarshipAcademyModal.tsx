import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  SCHOLARSHIP_ACADEMY_TRACKS, 
  AcademyModuleTrack 
} from "@/lib/scholarshipAcademyData";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  FileText, 
  Mail, 
  Users, 
  BookOpen, 
  Clock, 
  Copy, 
  Check, 
  Lightbulb, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles,
  ExternalLink,
  BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ScholarshipAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackId?: string;
}

export function ScholarshipAcademyModal({
  isOpen,
  onClose,
  initialTrackId,
}: ScholarshipAcademyModalProps) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    initialTrackId || null
  );
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  // Template language toggle: "ar" for Arabic explanation/translated version, "en" for English official format
  const [templateLangs, setTemplateLangs] = useState<Record<string, "ar" | "en">>({});

  const selectedTrack = SCHOLARSHIP_ACADEMY_TRACKS.find(
    (t) => t.id === (selectedTrackId || initialTrackId)
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success(
      isAr 
        ? "تم نسخ النموذج بنجاح! يمكنك لصقه وتعديله الآن." 
        : "Template copied to clipboard successfully!"
    );
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const toggleTemplateLang = (templateKey: string, lang: "ar" | "en") => {
    setTemplateLangs((prev) => ({ ...prev, [templateKey]: lang }));
  };

  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText":
        return <FileText className="w-5 h-5" />;
      case "Mail":
        return <Mail className="w-5 h-5" />;
      case "Users":
        return <Users className="w-5 h-5" />;
      case "BookOpen":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl"
        dir={dir}
      >
        {/* Header Ribbon */}
        <div className="relative p-5 sm:p-7 bg-gradient-to-br from-amber-500/15 via-primary/10 to-transparent border-b border-border/40 overflow-hidden">
          <div className="absolute top-0 end-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-2xs sm:text-xs px-2.5 py-0.5 font-medium">
                    <Sparkles className="w-3 h-3 me-1 inline text-amber-500 animate-pulse" />
                    {isAr ? "أكاديمية القبول" : "Admissions Academy"}
                  </Badge>
                </div>
                <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {isAr ? "أكاديمية المنح والقبول" : "Scholarships & Admissions Academy"}
                </DialogTitle>
                <DialogDescription className="text-2xs sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {isAr 
                    ? "مسارات تدريبية ونماذج معتمدة لرفع نسبة قبولك في كبرى المنح الدولية إلى +85%"
                    : "Certified training modules & blueprints to boost your acceptance rate to +85%"}
                </DialogDescription>
              </div>
            </div>

            {selectedTrack && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTrackId(null)}
                className="text-xs h-8 sm:h-9 rounded-xl border-border/60 hover:bg-muted/80 gap-1.5 shrink-0"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                {isAr ? "كافة المسارات" : "All Tracks"}
              </Button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!selectedTrack ? (
              /* Tracks Grid */
              <motion.div
                key="tracks-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {SCHOLARSHIP_ACADEMY_TRACKS.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrackId(track.id)}
                      className="group relative p-5 sm:p-6 rounded-2xl border border-border/60 bg-card hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-muted/80 border border-border/60 flex items-center justify-center ${track.colorClass} group-hover:scale-110 transition-transform duration-300`}>
                            {getTrackIcon(track.iconName)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isAr ? track.estimatedReadTime : track.estimatedReadTimeEn}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors">
                            {isAr ? track.title : track.titleEn}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {isAr ? track.subtitle : track.subtitleEn}
                          </p>
                        </div>

                        <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40">
                          {isAr ? track.summary : track.summaryEn}
                        </p>
                      </div>

                      <div className="pt-4 mt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-amber-500">
                        <span>{isAr ? "دخول المسار والاطلاع على النماذج" : "Open Module & Templates"}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Academy Pro Notice */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground font-semibold">
                      {isAr ? "ميزة مجانية وتفاعلية 100%:" : "100% Free & Interactive Resource:"}
                    </strong>{" "}
                    {isAr 
                      ? "تم إعداد هذه المسارات وفق أحدث المعايير الأكاديمية بالتعاون مع مبتعثين وخريجي كبرى المنح العالمية لتمكين الطلاب في الوطن العربي مجاناً."
                      : "Curated in accordance with top tier international scholarship standards to empower scholars across the MENA region."}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Selected Track Detail View */
              <motion.div
                key={`track-detail-${selectedTrack.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Track Hero Banner */}
                <div className={`p-6 rounded-2xl bg-gradient-to-r ${selectedTrack.bgGradient} border border-border/60 space-y-2`}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {isAr ? selectedTrack.estimatedReadTime : selectedTrack.estimatedReadTimeEn}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {isAr ? selectedTrack.title : selectedTrack.titleEn}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isAr ? selectedTrack.subtitle : selectedTrack.subtitleEn}
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                  {selectedTrack.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-4 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/60">
                      <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {isAr ? sec.heading : sec.headingEn}
                      </h3>

                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {isAr ? sec.content : sec.contentEn}
                      </p>

                      {/* Bullet points */}
                      {sec.bulletPoints && (
                        <div className="space-y-2.5 pt-1">
                          {(isAr ? sec.bulletPoints : sec.bulletPointsEn || sec.bulletPoints).map((point, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/30">
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pro Tip */}
                      {(sec.proTip || sec.proTipEn) && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs sm:text-sm text-foreground leading-relaxed">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-600 dark:text-amber-400 font-semibold block mb-0.5">
                              {isAr ? "نصيحة الخبراء (Pro Tip):" : "Expert Pro Tip:"}
                            </strong>
                            <span className="text-muted-foreground">{isAr ? sec.proTip : sec.proTipEn}</span>
                          </div>
                        </div>
                      )}

                      {/* Copyable Template Box */}
                      {sec.copyableTemplate && (() => {
                        const templateKey = `${selectedTrack.id}-${idx}`;
                        const currentTplLang = templateLangs[templateKey] || (isAr ? "en" : "en"); // default to english official version
                        const isShowingAr = currentTplLang === "ar";
                        const activeBody = isShowingAr ? sec.copyableTemplate.templateBody : sec.copyableTemplate.templateBodyEn;

                        return (
                          <div className="mt-4 p-4 sm:p-5 rounded-xl border border-border/80 bg-muted/50 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                                  {isAr ? sec.copyableTemplate.templateTitle : sec.copyableTemplate.templateTitleEn}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Bilingual Switcher Tabs */}
                                <div className="flex items-center p-0.5 bg-background/80 rounded-lg border border-border/60 text-2xs font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => toggleTemplateLang(templateKey, "en")}
                                    className={`px-2 py-1 rounded-md transition-all ${!isShowingAr ? "bg-amber-500 text-white shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
                                  >
                                    🇬🇧 English
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleTemplateLang(templateKey, "ar")}
                                    className={`px-2 py-1 rounded-md transition-all ${isShowingAr ? "bg-amber-500 text-white shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
                                  >
                                    🇸🇦 {isAr ? "الترجمة العربية" : "Arabic"}
                                  </button>
                                </div>

                                <Button
                                  size="sm"
                                  variant={copiedIndex === templateKey ? "default" : "outline"}
                                  onClick={() => handleCopy(activeBody, templateKey)}
                                  className="h-8 text-xs rounded-lg gap-1.5 px-3 shadow-sm"
                                >
                                  {copiedIndex === templateKey ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>{isAr ? "تم النسخ" : "Copied"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>{isAr ? "نسخ النموذج" : "Copy Template"}</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div 
                              className="p-4 rounded-lg bg-background/90 border border-border/40 font-mono text-xs text-foreground/90 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-72 shadow-inner" 
                              dir={isShowingAr ? "rtl" : "ltr"}
                            >
                              {activeBody}
                            </div>

                            {sec.copyableTemplate.note && (
                              <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{isAr ? sec.copyableTemplate.note : sec.copyableTemplate.noteEn}</span>
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>

                {/* Bottom navigation */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrackId(null)}
                    className="text-xs h-9 rounded-xl gap-1.5"
                  >
                    <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                    {isAr ? "العودة للمسارات" : "Back to Modules"}
                  </Button>

                  <Button
                    size="sm"
                    onClick={onClose}
                    className="text-xs h-9 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20"
                  >
                    {isAr ? "فهمت الدليل، ابدأ التقديم" : "Understood, Apply Now"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
