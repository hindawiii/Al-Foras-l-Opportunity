import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Search, ExternalLink, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, X } from "lucide-react";
import { Scholarship } from "@/lib/mockData";
import { DuplicateCheckResult, findExistingScholarshipByQuery } from "@/lib/duplicateChecker";
import { Button } from "@/components/ui/button";

interface DuplicateBannerProps {
  checkResult: DuplicateCheckResult;
  isRtl: boolean;
  onSelectExisting: (s: Scholarship) => void;
  onDismissOverride?: () => void;
  isOverridden?: boolean;
}

/**
 * Real-time Banner displayed inside the scholarship editor
 */
export const ScholarshipDuplicateBanner: React.FC<DuplicateBannerProps> = ({
  checkResult,
  isRtl,
  onSelectExisting,
  onDismissOverride,
  isOverridden = false,
}) => {
  if (!checkResult.isDuplicate && checkResult.confidence === 0) {
    return null;
  }

  // If duplicate was flagged
  if (checkResult.isDuplicate && checkResult.matchedItem && !isOverridden) {
    const matched = checkResult.matchedItem;
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 backdrop-blur-sm space-y-2.5 my-2 shadow-md"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300">
                  {isRtl ? "⚠️ تنبيه نظام النزاهة: تم رصد منحة مطابقة مسبقاً!" : "⚠️ Integrity Alert: Duplicate Scholarship Detected!"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isRtl ? `تطابق ${checkResult.confidence}%` : `${checkResult.confidence}% Match`}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                {isRtl ? checkResult.reasonAr : checkResult.reasonEn}
              </p>
            </div>
          </div>
        </div>

        {/* Existing scholarship card summary */}
        <div className="p-2.5 rounded-lg bg-background/80 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white truncate">
              {matched.title}
            </div>
            <div className="text-[11px] text-gray-400 truncate flex items-center gap-2 mt-0.5">
              <span>{matched.org || matched.country}</span>
              <span>•</span>
              <span>{matched.deadline}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-primary">{matched.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              type="button"
              variant="luxe"
              size="sm"
              onClick={() => onSelectExisting(matched)}
              className="h-7 px-2.5 rounded-lg text-xs font-bold shadow-gold cursor-pointer flex items-center gap-1"
            >
              <span>{isRtl ? "تعديل المنحة المسجلة" : "Edit Existing"}</span>
              {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </Button>
            {onDismissOverride && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDismissOverride}
                className="h-7 px-2 rounded-lg text-[11px] text-gray-300 hover:text-white cursor-pointer"
                title={isRtl ? "متابعة الحفظ كمنحة منفصلة" : "Save as separate"}
              >
                {isRtl ? "تجاوز" : "Ignore"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // If unique & verified
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-2 text-xs my-1.5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-[11px] font-bold text-emerald-300">
          {isRtl ? "فحص النزاهة: منحة جديدة وفريدة (غير مكررة في قاعدة البيانات)" : "Integrity Check: Unique listing (No duplicate in database)"}
        </span>
      </div>
      <span className="text-[10px] text-emerald-400/80 font-mono">100% Unique</span>
    </motion.div>
  );
};

interface QuickExistenceCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarships: Scholarship[];
  isRtl: boolean;
  onSelectScholarship: (s: Scholarship) => void;
  onCreateNewWithQuery: (query: string) => void;
}

/**
 * Dedicated Quick Existence & Duplicate Lookup Tool
 */
export const QuickExistenceCheckerModal: React.FC<QuickExistenceCheckerModalProps> = ({
  isOpen,
  onClose,
  scholarships,
  isRtl,
  onSelectScholarship,
  onCreateNewWithQuery,
}) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const result = findExistingScholarshipByQuery(query, scholarships);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-card border border-primary/30 shadow-2xl overflow-hidden flex flex-col"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-4 border-b border-primary/20 bg-background/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isRtl ? "فاحص وجود وتكرار المنح" : "Scholarship Existence & Duplicate Inspector"}
              </h3>
              <p className="text-[11px] text-gray-400">
                {isRtl ? "تحقق فوراً مما إذا كانت المنحة مسجلة مسبقاً قبل إضافتها" : "Check whether a scholarship is already registered before adding"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-primary/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"} text-primary`} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRtl ? "اكتب اسم المنحة، الجامعة، أو الصق رابط التقديم..." : "Enter scholarship title, university or paste link..."}
              className={`w-full py-2.5 ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} rounded-xl bg-background border border-primary/40 text-xs sm:text-sm text-white focus:border-primary outline-none shadow-inner`}
            />
          </div>

          {/* Results Area */}
          <div className="min-h-[140px] flex flex-col justify-center">
            {query.trim().length < 3 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 opacity-40" />
                <p>{isRtl ? "اكتب 3 أحرف على الأقل أو الصق الرابط للبدء بالفحص الفوري" : "Type at least 3 characters or paste a URL to scan"}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {isRtl ? `يتم الفحص في قاعدة بيانات تضم (${scholarships.length}) منحة معتمدة` : `Scanning across (${scholarships.length}) registered scholarships`}
                </p>
              </div>
            ) : result.found && result.scholarship ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {isRtl ? "مسجلة بالفعل في النظام!" : "Already Registered in System!"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {result.confidence}%
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-background border border-amber-500/30">
                  <div className="font-bold text-white text-xs sm:text-sm">
                    {result.scholarship.title}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-1">
                    <span>{result.scholarship.org || result.scholarship.country}</span>
                    <span>•</span>
                    <span>{result.scholarship.deadline}</span>
                    <span>•</span>
                    <span className="text-primary font-mono text-[10px]">{result.scholarship.id}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 mt-2 leading-relaxed">
                    {isRtl ? result.reasonAr : result.reasonEn}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="luxe"
                    size="sm"
                    onClick={() => {
                      onSelectScholarship(result.scholarship!);
                      onClose();
                    }}
                    className="h-8 px-3 rounded-xl text-xs font-bold shadow-gold cursor-pointer"
                  >
                    {isRtl ? "الانتقال للمنحة وتعديلها" : "Open & Edit Scholarship"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 text-center space-y-2.5"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
                    {isRtl ? "المنحة غير مسجلة بتاتاً — جاهزة للإضافة!" : "Scholarship Not Found — Ready to Add!"}
                  </h4>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    {isRtl ? "لم يتم العثور على أي تطابق في العناوين أو الروابط. يمكنك إضافتها الآن بأمان." : "No duplicate found. You can safely add it now."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="luxe"
                  size="sm"
                  onClick={() => {
                    onCreateNewWithQuery(query);
                    onClose();
                  }}
                  className="h-8 px-4 rounded-xl text-xs font-bold shadow-gold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 me-1" />
                  {isRtl ? "+ إضافة هذه المنحة فوراً" : "+ Create This Scholarship Now"}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-primary/20 bg-background/50 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-3 rounded-xl text-xs text-gray-300 hover:text-white"
          >
            {isRtl ? "إغلاق" : "Close"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
