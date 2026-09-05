/**
 * Foras Self-Healing & Resilience Engine (محرك المرونة والإصلاح التلقائي)
 * 
 * Provides:
 * 1. Global uncaught error & rejection interception
 * 2. Breadcrumbs tracking (recording user journey before crashes)
 * 3. Client-side self-healing & data schema auto-recovery
 * 4. Error telemetry storage with admin dashboard synchronization
 * 5. One-click AI Diagnostic Prompt Generator for instant developer fixing
 */

import { adminAuthStore } from "./adminAuthStore";

export interface AppErrorEvent {
  id: string;
  timestamp: string;
  type: "react_render" | "unhandled_rejection" | "window_error" | "network_failure" | "schema_drift";
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  locale: string;
  resolvedAutomatically?: boolean;
  actionTaken?: string;
  recoveryStrategy?: "cache_cleared" | "state_reset" | "fallback_applied" | "reload_required";
  breadcrumbs: string[];
}

const ERROR_LOGS_KEY = "foras_error_telemetry_v1";
const MAX_ERROR_LOGS = 30;
const MAX_BREADCRUMBS = 15;

class SelfHealingEngine {
  private breadcrumbs: string[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.addBreadcrumb("تطبيق فرص: بدء الجلسة (Session Initialized)");
    }
  }

  /**
   * Initialize global listeners for runtime resilience
   */
  public init(): void {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    // 1. Listen for uncaught window errors
    window.addEventListener("error", (event) => {
      // Ignore benign external script/iframe or resize observer warnings
      if (
        event.message?.includes("ResizeObserver") ||
        event.message?.includes("Script error")
      ) {
        return;
      }

      this.reportError({
        type: "window_error",
        message: event.message || "Unknown runtime window error",
        stack: event.error?.stack,
        autoHeal: true,
      });
    });

    // 2. Listen for unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : reason?.message || "Unhandled Promise Rejection";
      
      this.reportError({
        type: "unhandled_rejection",
        message,
        stack: reason?.stack,
        autoHeal: true,
      });
    });

    // 3. Track URL/route changes as breadcrumbs
    window.addEventListener("popstate", () => {
      this.addBreadcrumb(`الانتقال للمسار: ${window.location.pathname}${window.location.search}`);
    });

    // 4. Perform preliminary startup data health check
    this.runStartupDataHealing();
  }

  /**
   * Add a breadcrumb to reconstruct user journey before error
   */
  public addBreadcrumb(crumb: string): void {
    const time = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    this.breadcrumbs.push(`[${time}] ${crumb}`);
    if (this.breadcrumbs.length > MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Report an error to the self-healing telemetry system
   */
  public reportError(params: {
    type: AppErrorEvent["type"];
    message: string;
    stack?: string;
    componentStack?: string;
    autoHeal?: boolean;
  }): { event: AppErrorEvent; autoResolved: boolean; actionTaken: string } {
    const { type, message, stack, componentStack, autoHeal = true } = params;

    let autoResolved = false;
    let actionTaken = "تم تسجيل الخطأ وحفظ سياق النظام.";
    let recoveryStrategy: AppErrorEvent["recoveryStrategy"] = "state_reset";

    // Attempt Self-Healing if requested
    if (autoHeal) {
      const healingResult = this.attemptAutoHeal(message, stack);
      autoResolved = healingResult.resolved;
      actionTaken = healingResult.actionTaken;
      recoveryStrategy = healingResult.strategy;
    }

    const errorEvent: AppErrorEvent = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type,
      message: message || "Unknown error occurred",
      stack,
      componentStack,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      locale: typeof navigator !== "undefined" ? navigator.language : "ar",
      resolvedAutomatically: autoResolved,
      actionTaken,
      recoveryStrategy,
      breadcrumbs: [...this.breadcrumbs],
    };

    // Store in Telemetry Logs
    this.persistError(errorEvent);

    // Sync to Admin Audit Logs
    try {
      adminAuthStore.logActivity(
        {
          id: "system_shield",
          name: "درع الأمان التلقائي (Self-Healing Shield)",
          email: "shield@foras.app",
          role: "super_admin",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        `Error Telemetry: ${type}`,
        autoResolved ? "رصد عطل ومعالجته ذاتياً" : "رصد خطأ بحاجة لمراجعة المطور",
        `[${type}] ${message.substring(0, 120)} | الإجراء: ${actionTaken}`
      );
    } catch {
      // Avoid crash on logging failure
    }

    // Dispatch event for UI reactivity
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:telemetry-error", { detail: errorEvent }));
    }

    return { event: errorEvent, autoResolved, actionTaken };
  }

  /**
   * Analyze error message and perform automated recovery
   */
  private attemptAutoHeal(message: string, stack?: string): {
    resolved: boolean;
    actionTaken: string;
    strategy: AppErrorEvent["recoveryStrategy"];
  } {
    const combined = `${message} ${stack || ""}`.toLowerCase();

    // Strategy 1: Data corruption / slice / map on undefined in dynamic store
    if (combined.includes("cannot read properties of undefined") || combined.includes("reading 'slice'") || combined.includes("reading 'map'")) {
      try {
        // Sanitize dynamic store jobs and scholarships cache
        const customJobsRaw = localStorage.getItem("foras_custom_jobs");
        if (customJobsRaw) {
          const parsed = JSON.parse(customJobsRaw);
          if (Array.isArray(parsed)) {
            const healed = parsed.map((item: any) => ({
              ...item,
              skills: Array.isArray(item.skills) ? item.skills : ["العمل الحر", "مهارات تقنية"],
              skillsEn: Array.isArray(item.skillsEn) ? item.skillsEn : ["Freelancing", "Skills"],
              requirements: Array.isArray(item.requirements) ? item.requirements : ["المؤهل المناسب"],
              requirementsEn: Array.isArray(item.requirementsEn) ? item.requirementsEn : ["Relevant skills"],
              withdrawal: item.withdrawal || { methods: [], processingTime: "خلال 48 ساعة" },
            }));
            localStorage.setItem("foras_custom_jobs", JSON.stringify(healed));
          }
        }
        return {
          resolved: true,
          actionTaken: "تم فحص الذاكرة وتصحيح الحقول المفقودة تلقائياً وتفعيل البيانات البديلة السليمة.",
          strategy: "fallback_applied",
        };
      } catch {
        return {
          resolved: false,
          actionTaken: "محاولة تنظيف الذاكرة واجهت قيوداً.",
          strategy: "cache_cleared",
        };
      }
    }

    // Strategy 2: QuotaExceededError (LocalStorage Full)
    if (combined.includes("quotaexceedederror") || combined.includes("storage quota")) {
      try {
        // Safely clear old cache keys without touching core user profile
        const safeToClear = ["foras_news_cache", "foras_cv_backup", "foras_audit_logs_v2"];
        safeToClear.forEach((key) => localStorage.removeItem(key));
        return {
          resolved: true,
          actionTaken: "تم تحرير مساحة الذاكرة المحلية تلقائياً وإزالة السجلات المؤقتة القديمة.",
          strategy: "cache_cleared",
        };
      } catch {
        return {
          resolved: false,
          actionTaken: "فشل تحرير الذاكرة المحلية.",
          strategy: "reload_required",
        };
      }
    }

    // Strategy 3: Corrupt JSON parse error
    if (combined.includes("unexpected token") || combined.includes("is not valid json")) {
      this.healAllJsonStorage();
      return {
        resolved: true,
        actionTaken: "تم فحص وتنظيف كافة مفاتيح JSON التالفة في الذاكرة بنجاح.",
        strategy: "cache_cleared",
      };
    }

    return {
      resolved: false,
      actionTaken: "تم تأمين الجلسة وتجهيز تقرير الإصلاح الدقيق للمطور.",
      strategy: "state_reset",
    };
  }

  /**
   * Inspect and heal all JSON in localStorage
   */
  public healAllJsonStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("foras_")) {
          const val = localStorage.getItem(key);
          if (val && (val.startsWith("{") || val.startsWith("["))) {
            try {
              JSON.parse(val);
            } catch {
              // Corrupt JSON detected -> remove or repair
              localStorage.removeItem(key);
              this.addBreadcrumb(`إصلاح ذاتي: إزالة المفتاح التالف (${key})`);
            }
          }
        }
      }
    } catch {}
  }

  /**
   * Run health check on startup
   */
  private runStartupDataHealing(): void {
    try {
      this.healAllJsonStorage();
    } catch {}
  }

  /**
   * Save error to telemetry history
   */
  private persistError(err: AppErrorEvent): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getErrors();
      existing.unshift(err);
      localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(existing.slice(0, MAX_ERROR_LOGS)));
    } catch {}
  }

  /**
   * Get all registered errors
   */
  public getErrors(): AppErrorEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(ERROR_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear error logs
   */
  public clearErrors(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ERROR_LOGS_KEY);
    window.dispatchEvent(new CustomEvent("foras:telemetry-error"));
  }

  /**
   * Format a complete AI Prompt Diagnostic Report for instant fixing by the AI assistant
   */
  public generateAIFixPrompt(error: AppErrorEvent): string {
    return `[طلب إصلاح فوري للمطور / AI BUG FIX DISPATCHER]
عزيزي المطور، رصد محرك الأمان التلقائي لتطبيق "فرص" خطأً واجه أحد المستخدمين:

📌 معلومات الخطأ الأساسية:
- الرمز المعرف: ${error.id}
- التوقيت: ${new Date(error.timestamp).toLocaleString("ar-EG")}
- النوع: ${error.type}
- الرسالة: ${error.message}
- الرابط المتأثر: ${error.url}
- اللغة والمتصفح: ${error.locale} | ${error.userAgent.substring(0, 80)}

🛡️ نتيجة التدخل التلقائي:
- هل تم الحل ذاتياً للمستخدم: ${error.resolvedAutomatically ? "نعم ✅" : "لا ❌ (بحاجة لتعديل المطور)"}
- الإجراء المتخذ: ${error.actionTaken}

📍 المسار والخطوات السابقة لوقوع الخطأ (User Breadcrumbs):
${error.breadcrumbs.map((b, i) => `  ${i + 1}. ${b}`).join("\n")}

💻 سياق المكدس والشيفرة (Stack Trace):
\`\`\`
${error.stack || error.componentStack || "لا يوجد مكدس إضافي"}
\`\`\`

الرجاء تحليل هذا العطل وتعديل الشيفرة المسببة له فوراً في الملف المناسب لمنع تكراره مستقبلاً.`;
  }
}

export const selfHealingEngine = new SelfHealingEngine();
