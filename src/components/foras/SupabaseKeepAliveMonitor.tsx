import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ExternalLink,
  Activity,
  Zap,
  Server,
  Lock,
  Flame,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface SupabaseHealthData {
  isConfigured: boolean;
  projectUrl: string;
  maskedKey: string;
  status: "connected" | "paused" | "auth_error" | "unreachable" | "not_configured";
  statusMessageAr: string;
  statusMessageEn: string;
  lastPingTime: string | null;
  lastLatencyMs: number | null;
  totalPings: number;
  successfulPings: number;
  consecutiveFailures: number;
  nextScheduledPing: string | null;
  daemonActive: boolean;
  intervalHours: number;
  history: Array<{
    timestamp: string;
    status: "success" | "warning" | "error";
    latencyMs: number;
    messageAr: string;
    messageEn: string;
  }>;
}

export const SupabaseKeepAliveMonitor: React.FC<{
  isRtl?: boolean;
}> = ({ isRtl = true }) => {
  const [data, setData] = useState<SupabaseHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/supabase/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SupabaseHealthData = await res.json();
      setData(json);
    } catch (err: any) {
      if (!silent) {
        toast.error(isRtl ? "تعذر جلب حالة اتصال Supabase" : "Failed to fetch Supabase status");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchStatus();
    // Auto-poll status every 30 seconds while open
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleManualPing = async () => {
    setIsPinging(true);
    try {
      const res = await fetch("/api/supabase/ping", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: SupabaseHealthData = await res.json();
      setData(updated);

      if (updated.status === "connected") {
        toast.success(
          isRtl
            ? `تم إرسال نبضة التنشيط بنجاح! الاستجابة: ${updated.lastLatencyMs}ms (تم تصفير عداد الخمول)`
            : `Keep-Alive ping successful! Latency: ${updated.lastLatencyMs}ms`
        );
      } else if (updated.status === "paused") {
        toast.error(
          isRtl
            ? "المشروع مجمد في Supabase (503/ENOTFOUND). يرجى فتح app.supabase.com والضغط على Restore Project."
            : "Supabase project is paused. Please restore it in app.supabase.com."
        );
      } else {
        toast.warning(isRtl ? updated.statusMessageAr : updated.statusMessageEn);
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "فشل تنفيذ فحص الاتصال" : "Failed to ping Supabase"));
    } finally {
      setIsPinging(false);
    }
  };

  const getStatusBadge = () => {
    if (!data) {
      return {
        bg: "bg-slate-500/15 border-slate-500/30 text-slate-300",
        dot: "bg-slate-400",
        label: isRtl ? "جاري الفحص..." : "Checking...",
      };
    }
    if (data.status === "connected") {
      return {
        bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
        dot: "bg-emerald-500 animate-pulse",
        label: isRtl ? "متصل ومباشر 24/7 (نشط)" : "Live & Connected 24/7",
      };
    }
    if (data.status === "paused") {
      return {
        bg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
        dot: "bg-amber-400 animate-ping",
        label: isRtl ? "مجمد بسبب الخمول (Paused)" : "Paused (Inactive)",
      };
    }
    if (data.status === "auth_error") {
      return {
        bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
        dot: "bg-rose-500",
        label: isRtl ? "خطأ في مفتاح الصلاحيات" : "Auth Key Error",
      };
    }
    if (data.status === "unreachable") {
      return {
        bg: "bg-destructive/15 border-destructive/40 text-destructive",
        dot: "bg-destructive",
        label: isRtl ? "غير متاح أو انقطاع شبكة" : "Unreachable",
      };
    }
    return {
      bg: "bg-primary/15 border-primary/30 text-primary",
      dot: "bg-primary",
      label: isRtl ? "بانتظار ضبط المتغيرات" : "Awaiting Config",
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-4 max-w-5xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Banner & Quick Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border-2 border-primary/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0 text-primary-foreground">
              <Database className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {isRtl ? "نظام مراقبة قاعدة البيانات ومنع التجميد (Supabase Keep-Alive)" : "Supabase Live Connection & Keep-Alive Daemon"}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                  <span>{statusBadge.label}</span>
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {isRtl
                  ? "محرك نبضات دوري مدمج يرسل استعلاماً مشفراً كل 24 ساعة لتصفير عداد الخمول ومنع إيقاف أو تجميد المشروع في باقة Supabase المجانية نهائياً."
                  : "Automated heartbeat daemon sending 24h pings to reset Supabase inactivity timer and prevent the free tier 7-day auto-pause permanently."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStatus(false)}
              disabled={isLoading || isPinging}
              className="border-primary/30 hover:border-primary text-xs font-bold gap-1.5 h-10 px-3.5 rounded-xl cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isRtl ? "تحديث الحالة" : "Refresh"}</span>
            </Button>

            <Button
              variant="luxe"
              size="sm"
              onClick={handleManualPing}
              disabled={isPinging}
              className="text-xs font-bold shadow-gold gap-2 h-10 px-4 rounded-xl cursor-pointer"
            >
              {isPinging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? "جاري الفحص والتنشيط..." : "Pinging..."}</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>{isRtl ? "فحص وتنشيط الاتصال الآن" : "Ping & Keep-Alive Now"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Latency & Speed */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card/80 border border-primary/25 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>{isRtl ? "زمن استجابة الشبكة (Latency)" : "Network Latency"}</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {data?.lastLatencyMs !== null && data?.lastLatencyMs !== undefined ? `${data.lastLatencyMs}` : "—"}
            </span>
            <span className="text-xs font-bold text-gray-400">ms</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            {data?.lastLatencyMs ? (data.lastLatencyMs < 200 ? (isRtl ? "⚡ فائق السرعة واستجابة ممتازة" : "⚡ Ultra fast") : (isRtl ? "سرعة جيدة" : "Good speed")) : (isRtl ? "بانتظار الفحص" : "Awaiting check")}
          </span>
        </div>

        {/* Metric 2: Keep-Alive Daemon Status */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card/80 border border-primary/25 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>{isRtl ? "محرك التنشيط الآلي (Daemon)" : "Heartbeat Daemon"}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {data?.daemonActive ? (isRtl ? "نشط 24h" : "Active 24h") : (isRtl ? "معطل" : "Inactive")}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold block truncate">
            {isRtl ? `تكرار النبضة: كل ${data?.intervalHours || 24} ساعة` : `Frequency: every ${data?.intervalHours || 24}h`}
          </span>
        </div>

        {/* Metric 3: Success Rate & Pings */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card/80 border border-primary/25 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>{isRtl ? "إجمالي النبضات والنجاح" : "Pings / Success Rate"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {data?.successfulPings || 0}
            </span>
            <span className="text-xs text-gray-400">/ {data?.totalPings || 0}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            {data?.totalPings ? `${Math.round(((data.successfulPings || 0) / data.totalPings) * 100)}% ${isRtl ? "نسبة النجاح" : "Success"}` : (isRtl ? "لا توجد سجلات بعد" : "No pings yet")}
          </span>
        </div>

        {/* Metric 4: Next Scheduled Ping */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card/80 border border-primary/25 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>{isRtl ? "النبضة القادمة المجدولة" : "Next Scheduled Ping"}</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-white font-mono truncate">
              {data?.nextScheduledPing ? new Date(data.nextScheduledPing).toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" }) : (isRtl ? "تلقائي" : "Auto")}
            </span>
          </div>
          <span className="text-[10px] text-sky-400 font-semibold block">
            {isRtl ? "يمنع تجاوز 7 أيام خمول" : "Guarantees <7d inactivity"}
          </span>
        </div>
      </div>

      {/* Main Status & Configuration Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card/90 border border-primary/20 space-y-3 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {isRtl ? "تفاصيل الاتصال والمشروع" : "Project Connection Details"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">{isRtl ? "آخر فحص:" : "Last Ping:"}</span>
            <span className="font-mono text-gray-200">
              {data?.lastPingTime ? new Date(data.lastPingTime).toLocaleTimeString(isRtl ? "ar-EG" : "en-US") : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-1">
            <span className="text-gray-400 block text-[11px] font-semibold">
              {isRtl ? "رابط مشروع Supabase (Project URL):" : "Supabase Project URL:"}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-white truncate">
                {data?.projectUrl || "VITE_SUPABASE_URL"}
              </span>
              {data?.projectUrl && !data.projectUrl.includes("غير") && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(data.projectUrl);
                    toast.success(isRtl ? "تم نسخ الرابط" : "Copied URL");
                  }}
                  className="p-1 rounded text-gray-400 hover:text-white"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-1">
            <span className="text-gray-400 block text-[11px] font-semibold">
              {isRtl ? "مفتاح الوصول العام (Anon Key):" : "Public Anon Key:"}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-gray-300 truncate">
                {data?.maskedKey || "VITE_SUPABASE_PUBLISHABLE_KEY"}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {isRtl ? "محمي ومقنع" : "Masked"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Message Details */}
        <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
          data?.status === "connected"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : data?.status === "paused"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
            : "bg-primary/10 border-primary/25 text-gray-200"
        }`}>
          {data?.status === "connected" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : data?.status === "paused" ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block mb-0.5">
              {isRtl ? "تقرير الحالة المباشر:" : "Live Status Report:"}
            </span>
            <span>{isRtl ? data?.statusMessageAr : data?.statusMessageEn}</span>
          </div>
        </div>
      </div>

      {/* Accordion: Full Guide on Preventing Supabase Auto-Pause */}
      <div className="rounded-2xl bg-card border border-primary/25 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => setShowGuide(prev => !prev)}
          className="w-full p-4 flex items-center justify-between gap-3 text-start hover:bg-primary/5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isRtl
                  ? "الدليل الهندسي: كيف تتأكد من الاتصال وكيف تمنع تجميد Supabase نهائياً؟"
                  : "Engineering Guide: Verifying Connection & Permanent Keep-Alive Solutions"}
              </h4>
              <span className="text-[11px] text-gray-400">
                {isRtl ? "شرح آلية الـ 7 أيام لخمول Supabase، والحلول الأربعة لمنعها تماماً" : "Explaining 7-day auto-pause and 4 ways to keep it alive forever"}
              </span>
            </div>
          </div>
          <div className="p-1 rounded-lg bg-white/5 text-gray-300">
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-primary/20 p-4 sm:p-5 space-y-4 text-xs leading-relaxed text-gray-300 bg-background/50"
            >
              {/* Point 1 */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>1. لماذا يقوم Supabase بإيقاف أو تجميد المشروع (Auto-Pause)؟</span>
                </h5>
                <p className="text-gray-300">
                  في الخطة المجانية (Free Tier)، تفرض شركة Supabase سياسة تجميد تلقائي: إذا مرت <strong className="text-white">7 أيام متتالية</strong> دون أن يتلقى مشروعك أي طلبات عبر واجهة البرمجة (API Request) أو استعلام قاعدة بيانات، يُعطّل خادم Postgres مؤقتاً لتوفير موارد السحابة، مما يؤدي لظهور خطأ <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300">ENOTFOUND</code> أو <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300">503 Service Unavailable</code>.
                </p>
              </div>

              {/* Point 2 */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>2. كيف قمنا بحل المشكلة برمجياً (Keep-Alive Daemon المدمج)؟</span>
                </h5>
                <p className="text-gray-300">
                  قمنا ببرمجة <strong className="text-white">محرك نبضات دوري (Keep-Alive Cron Daemon)</strong> يعمل مباشرة داخل خادم التطبيق. يرسل هذا المحرك نبضة استعلام خفيفة وموثقة كل <strong className="text-white">24 ساعة</strong> إلى نقطة النهاية <code className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-400">/rest/v1/</code> في Supabase. هذه النبضة تقوم <strong className="text-white">بتصفير عداد الخمول يومياً</strong>، مما يمنع المشروع من الوصول إلى حد الـ 7 أيام نهائياً!
                </p>
              </div>

              {/* Point 3 */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-sky-400 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>3. خيار الترقية إلى Supabase Pro ($25/شهر) — الحل المؤسسي النهائي:</span>
                </h5>
                <p className="text-gray-300">
                  إذا أردت ضماناً بنسبة 100% مدعوماً باتفاقية مستوى خدمة رسمية (SLA)، يمكنك ترقية المشروع في <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">Supabase Dashboard</a> إلى باقة <strong className="text-white">Pro Plan</strong>. في باقة Pro، <strong className="text-white">تُلغى ميزة التجميد تماماً ولا يتم إيقاف المشروع مطلقاً</strong> تحت أي ظرف حتى وإن توقفت الحركة لشهور.
                </p>
              </div>

              {/* Point 4 */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-purple-400 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>4. حماية إضافية مجانية (External Webhook Ping):</span>
                </h5>
                <p className="text-gray-300">
                  يمكنك أيضاً إضافة رابط الفحص المباشر لتطبيقك: <code className="px-1.5 py-0.5 rounded bg-black/40 text-purple-300 font-mono">https://[YOUR_APP_DOMAIN]/api/supabase/ping</code> في أي خدمة مراقبة مجانية مثل <strong className="text-white">UptimeRobot</strong> أو <strong className="text-white">Cron-job.org</strong> ليقوم بضرب الرابط يومياً كنبضة إضافية في الخلفية.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Heartbeat History Log */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card/80 border border-primary/20 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-white">
              {isRtl ? "سجل نبضات التنشيط الأخيرة (Heartbeat Telemetry)" : "Recent Heartbeat History"}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            {isRtl ? `آخر ${data?.history?.length || 0} نبضات` : `Last ${data?.history?.length || 0} pings`}
          </span>
        </div>

        {(!data?.history || data.history.length === 0) ? (
          <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-primary/20 rounded-xl">
            {isRtl ? "لا توجد سجلات بعد. انقر على 'فحص وتنشيط الاتصال الآن' لبدء أول نبضة." : "No history yet. Click 'Ping & Keep-Alive Now' to send your first heartbeat."}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
            {data.history.map((h, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-background/60 border border-primary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      h.status === "success"
                        ? "bg-emerald-400"
                        : h.status === "warning"
                        ? "bg-amber-400"
                        : "bg-destructive"
                    }`}
                  />
                  <span className="font-semibold text-gray-200 truncate">
                    {isRtl ? h.messageAr : h.messageEn}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-gray-400 font-mono text-[11px]">
                  {h.latencyMs > 0 && (
                    <span className="text-emerald-400 font-bold">{h.latencyMs}ms</span>
                  )}
                  <span>
                    {new Date(h.timestamp).toLocaleTimeString(isRtl ? "ar-EG" : "en-US")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
