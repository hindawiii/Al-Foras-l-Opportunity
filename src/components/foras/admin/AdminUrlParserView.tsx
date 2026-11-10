import React from "react";
import { Sparkles, GraduationCap, Briefcase, Link2, Copy, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UrlDuplicateNotice } from "@/components/foras/ScholarshipDuplicateGuard";
import { ExtractedOpportunityPreview } from "@/components/foras/ExtractedOpportunityPreview";
import { dynamicStore } from "@/lib/dynamicStore";
import { toast } from "sonner";

interface AdminUrlParserViewProps {
  isRtl: boolean;
  t: (key: string) => string;
  urlType: "scholarship" | "job";
  setUrlType: (type: "scholarship" | "job") => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  isParsing: boolean;
  setIsParsing: (isParsing: boolean) => void;
  parsedPreview: any;
  setParsedPreview: (parsed: any) => void;
  urlDuplicateResult: {
    isDuplicate: boolean;
    confidence: number;
    matchedItem?: any;
    reasonAr?: string;
    reasonEn?: string;
  };
  onNavigateToExisting: (item: any, type: "scholarship" | "job") => void;
  onApproveParsed: (approvedData: any) => void;
}

export const AdminUrlParserView: React.FC<AdminUrlParserViewProps> = ({
  isRtl,
  t,
  urlType,
  setUrlType,
  urlInput,
  setUrlInput,
  isParsing,
  setIsParsing,
  parsedPreview,
  setParsedPreview,
  urlDuplicateResult,
  onNavigateToExisting,
  onApproveParsed,
}) => {
  return (
    <div className="h-full overflow-y-auto p-1 sm:p-2 space-y-4 max-w-3xl mx-auto scrollbar-thin scrollbar-thumb-primary/25 pb-24">
      <div className="p-5 rounded-2xl bg-card border-2 border-primary/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">{t("adminAiUrlExtractor")}</h4>
            <p className="text-xs text-gray-300">{t("adminAiUrlExtractorDesc")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setUrlType("scholarship")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                urlType === "scholarship"
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "bg-card border border-primary/20 text-gray-300 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isRtl ? "منحة دراسية" : "Scholarship"}</span>
            </button>
            <button
              onClick={() => setUrlType("job")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                urlType === "job"
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "bg-card border border-primary/20 text-gray-300 hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isRtl ? "فرصة عمل عن بعد" : "Remote Job"}</span>
            </button>
          </div>

          {/* URL Input Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div
                className={`relative flex-1 flex items-center rounded-xl bg-background/90 border transition-all h-11 px-3.5 ${
                  urlDuplicateResult.isDuplicate
                    ? "border-amber-500/60 focus-within:border-amber-400"
                    : urlInput.trim().length > 10
                    ? "border-emerald-500/50 focus-within:border-emerald-400"
                    : "border-primary/30 focus-within:border-primary"
                }`}
              >
                <Link2 className="w-4 h-4 text-primary shrink-0 me-2.5" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUrlInput(val);
                    const lower = val.toLowerCase();
                    if (
                      lower.includes("burslari") ||
                      lower.includes("scholarship") ||
                      lower.includes("daad") ||
                      lower.includes("chevening") ||
                      lower.includes("fulbright") ||
                      lower.includes("university") ||
                      lower.includes("edu")
                    ) {
                      setUrlType("scholarship");
                    } else if (
                      lower.includes("job") ||
                      lower.includes("career") ||
                      lower.includes("remote") ||
                      lower.includes("weworkremotely") ||
                      lower.includes("upwork") ||
                      lower.includes("freelance") ||
                      lower.includes("linkedin.com/jobs")
                    ) {
                      setUrlType("job");
                    }
                  }}
                  placeholder={
                    urlType === "scholarship"
                      ? "https://turkiyeburslari.gov.tr أو https://for9a.com/opportunity..."
                      : "https://weworkremotely.com/jobs/..."
                  }
                  className="w-full bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-gray-500 font-mono tracking-tight"
                  dir="ltr"
                />

                {urlInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput("");
                      setParsedPreview(null);
                      toast.info(isRtl ? "تم مسح الرابط" : "URL cleared");
                    }}
                    title={isRtl ? "مسح الرابط الحالي" : "Clear current URL"}
                    className="ms-1.5 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Paste Button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                      const text = await navigator.clipboard.readText();
                      if (text && (text.startsWith("http://") || text.startsWith("https://") || text.includes("."))) {
                        const trimmed = text.trim();
                        setUrlInput(trimmed);
                        setParsedPreview(null);

                        const lower = trimmed.toLowerCase();
                        if (
                          lower.includes("burslari") ||
                          lower.includes("scholarship") ||
                          lower.includes("daad") ||
                          lower.includes("chevening") ||
                          lower.includes("fulbright") ||
                          lower.includes("university") ||
                          lower.includes("edu")
                        ) {
                          setUrlType("scholarship");
                        } else if (
                          lower.includes("job") ||
                          lower.includes("career") ||
                          lower.includes("remote") ||
                          lower.includes("weworkremotely") ||
                          lower.includes("upwork") ||
                          lower.includes("freelance") ||
                          lower.includes("linkedin.com/jobs")
                        ) {
                          setUrlType("job");
                        }

                        toast.success(isRtl ? "تم سحب ولصق الرابط من الحافظة تلقائياً!" : "Pasted URL from clipboard!");
                        return;
                      }
                    }
                  } catch {
                    // Fallback
                  }

                  const manualUrl = window.prompt(
                    isRtl
                      ? "يرجى لصق الرابط (Ctrl+V أو Cmd+V) هنا:"
                      : "Please paste (Ctrl+V) the URL here:"
                  );
                  if (manualUrl && manualUrl.trim()) {
                    const trimmed = manualUrl.trim();
                    setUrlInput(trimmed);
                    setParsedPreview(null);
                    toast.success(isRtl ? "تم اعتماد الرابط بنجاح!" : "URL pasted successfully!");
                  }
                }}
                title={isRtl ? "سحب ولصق الرابط المنسوخ تلقائياً" : "Paste copied URL automatically"}
                className="h-11 px-4 rounded-xl text-xs sm:text-sm font-bold bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
              >
                <Copy className="w-4 h-4" />
                <span>{isRtl ? "لصق الرابط" : "Paste Link"}</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="luxe"
                disabled={isParsing || !urlInput.trim()}
                onClick={async () => {
                  if (urlDuplicateResult.isDuplicate) {
                    toast.warning(
                      isRtl
                        ? `⚠️ تنبيه: هذا الرابط مسجل مسبقاً! جاري المتابعة بناءً على طلبك...`
                        : `⚠️ Warning: URL already exists. Parsing anyway...`
                    );
                  }
                  setIsParsing(true);
                  try {
                    const parsed = await dynamicStore.parseFromUrl(urlInput, urlType);
                    setParsedPreview(parsed);
                    toast.success(isRtl ? "تم استخراج ومعالجة بيانات الرابط بنجاح" : "Parsed successfully");
                  } catch (err: any) {
                    toast.error(
                      err?.message || (isRtl ? "تعذر الاستخراج من الرابط" : "Failed to parse"),
                      { duration: 6000 }
                    );
                  } finally {
                    setIsParsing(false);
                  }
                }}
                className="font-bold text-xs sm:text-sm shadow-gold cursor-pointer w-full sm:w-auto px-6 h-11 rounded-xl"
              >
                {isParsing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? "جاري الاستخراج والتدقيق..." : "Extracting..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{t("adminExtractBtn")}</span>
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Real-time URL Duplicate Notice */}
          <UrlDuplicateNotice
            urlInput={urlInput}
            urlType={urlType}
            duplicateItem={urlDuplicateResult.matchedItem}
            confidence={urlDuplicateResult.confidence}
            reasonAr={urlDuplicateResult.reasonAr}
            reasonEn={urlDuplicateResult.reasonEn}
            isRtl={isRtl}
            onNavigateToExisting={onNavigateToExisting}
          />
        </div>
      </div>

      {parsedPreview && (
        <ExtractedOpportunityPreview
          data={parsedPreview}
          type={urlType}
          isRtl={isRtl}
          onApprove={onApproveParsed}
          onCancel={() => {
            setParsedPreview(null);
            toast.info(
              isRtl ? "تم إلغاء وتجاهل نتيجة الاستخراج" : "Extracted result cancelled and dismissed"
            );
          }}
        />
      )}
    </div>
  );
};
