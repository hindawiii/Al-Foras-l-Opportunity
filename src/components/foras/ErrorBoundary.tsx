import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  RefreshCw, Home, AlertTriangle, ShieldCheck, Copy, Check,
  ChevronDown, ChevronUp, Sparkles, Terminal, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { selfHealingEngine, AppErrorEvent } from "@/lib/selfHealingEngine";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorEvent: AppErrorEvent | null;
  isAutoHealing: boolean;
  autoHealSuccess: boolean | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorEvent: null,
    isAutoHealing: false,
    autoHealSuccess: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Foras Self-Healing Shield] Intercepted Error:", error, errorInfo);
    
    // Automatically report to Self-Healing Engine
    try {
      const { event, autoResolved } = selfHealingEngine.reportError({
        type: "react_render",
        message: error.message || "React Render Crash",
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        autoHeal: true,
      });

      this.setState({
        errorEvent: event,
        autoHealSuccess: autoResolved,
      });
    } catch (e) {
      console.error("[Foras Shield] Telemetry reporting failed:", e);
    }
  }

  private handleAutoHealAndRetry = () => {
    this.setState({ isAutoHealing: true });

    setTimeout(() => {
      try {
        selfHealingEngine.healAllJsonStorage();
        this.setState({
          hasError: false,
          error: null,
          isAutoHealing: false,
          autoHealSuccess: true,
        });
      } catch {
        this.setState({ isAutoHealing: false });
        window.location.reload();
      }
    }, 600);
  };

  private handleCopyAIFixPrompt = async () => {
    if (!this.state.errorEvent && !this.state.error) return;

    try {
      const prompt = this.state.errorEvent
        ? selfHealingEngine.generateAIFixPrompt(this.state.errorEvent)
        : `[طلب إصلاح فوري للمطور]\nرصد خطأ: ${this.state.error?.message || "غير معروف"}\nالمكدس: ${this.state.error?.stack || "لا يوجد"}`;

      await navigator.clipboard.writeText(prompt);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      this.setState({ showDetails: true });
    }
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      const lang = typeof window !== "undefined" ? localStorage.getItem("foras_lang") || "ar" : "ar";
      const isRtl = lang === "ar";
      const ar = isRtl;

      return (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 sm:p-6"
          style={{ fontFamily: isRtl ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', sans-serif" }}
        >
          <div className="max-w-lg w-full bg-card/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border-2 border-primary/30 text-center shadow-luxe space-y-5">
            {/* Self-Healing Shield Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>{ar ? "درع الأمان والإصلاح الذاتي مفعّل" : "Self-Healing Shield Active"}</span>
            </div>

            {/* Error Graphic Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Headline and Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {ar ? "تم اعتراض خطأ غير متوقع وحماية بياناتك" : "Unexpected Error Intercepted & Data Safeguarded"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {ar
                  ? "قام محرك الأمان التلقائي بحفظ سياق جلستك وتجهيز تقرير المعالجة دون فقدان أي من بياناتك المحفوظة."
                  : "The runtime resilience engine protected your session data and generated an automated diagnostics report."}
              </p>
            </div>

            {/* Auto-heal Result Feedback Box */}
            {this.state.errorEvent && (
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border text-xs text-start space-y-1">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    {ar ? "التشخيص التلقائي:" : "Diagnostics:"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-background border border-border">
                    {this.state.errorEvent.type}
                  </span>
                </div>
                <p className="text-foreground font-medium text-xs truncate">
                  {this.state.errorEvent.message}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ {this.state.errorEvent.actionTaken}
                </p>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              {/* Button 1: Auto-Heal & Recover */}
              <Button
                variant="luxe"
                onClick={this.handleAutoHealAndRetry}
                disabled={this.state.isAutoHealing}
                className="h-12 w-full text-xs sm:text-sm font-bold shadow-gold flex items-center justify-center gap-2"
              >
                {this.state.isAutoHealing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{ar ? "جارٍ إصلاح البيانات واستعادة الجلسة..." : "Repairing Cache & Restoring..."}</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    <span>{ar ? "إصلاح المشكلة واستئناف التصفح فوراً" : "Auto-Repair & Resume Session"}</span>
                  </>
                )}
              </Button>

              {/* Button 2: Copy AI Diagnostic Report for Developer */}
              <Button
                variant="outline"
                onClick={this.handleCopyAIFixPrompt}
                className="h-11 w-full text-xs font-bold border-primary/30 hover:bg-primary/10 flex items-center justify-center gap-2"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {ar ? "تم نسخ تقرير الإصلاح الذكي للمطور!" : "AI Fix Report Copied to Clipboard!"}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-primary" />
                    <span>{ar ? "نسخ تقرير الإصلاح الذكي لإرساله للمطور" : "Copy AI Diagnostic Report for Developer"}</span>
                  </>
                )}
              </Button>

              {/* Secondary Navigation Row */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="ghost"
                  onClick={this.handleReload}
                  className="flex-1 h-10 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{ar ? "إعادة تحميل الصفحة" : "Reload Page"}</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={this.handleGoHome}
                  className="flex-1 h-10 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{ar ? "الرئيسية" : "Home"}</span>
                </Button>
              </div>
            </div>

            {/* Collapsible Technical Details for Developer */}
            <div className="pt-2 border-t border-border/80 text-start">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between text-[11px] font-bold text-muted-foreground hover:text-foreground py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span>{ar ? "التفاصيل التقنية الدقيقة للمطور" : "Developer Technical Stack"}</span>
                </span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-44 text-left dir-ltr space-y-1">
                  <div className="text-red-400 font-bold">{this.state.error?.name}: {this.state.error?.message}</div>
                  <pre className="whitespace-pre-wrap opacity-80 leading-relaxed">
                    {this.state.error?.stack || "No additional stack trace"}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

