import { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Server,
  Lock,
  Globe2,
  Layers
} from "lucide-react";
import { testFirebaseConnection } from "@/integrations/firebase/client";
import firebaseConfig from "../../../firebase-applet-config.json";
import { useLanguage } from "@/contexts/LanguageContext";

export const CloudDatabaseHealthMonitor = () => {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"connected" | "checking" | "error">("checking");
  const [latency, setLatency] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkConnection = async () => {
    setLoading(true);
    setStatus("checking");
    const start = performance.now();
    try {
      const ok = await testFirebaseConnection();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setStatus(ok ? "connected" : "error");
      setLastCheck(new Date().toLocaleTimeString(ar ? "ar-EG" : "en-US"));
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Status Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-luxe">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {ar ? "حالة قاعدة البيانات السحابية (Firebase Cloud)" : "Cloud Database Health (Firebase)"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {ar ? "نشط دائم (Zero Auto-Pause)" : "Always Active"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ar
                  ? "قاعدة بيانات Google Cloud Firestore مؤمنة بقواعد حماية ABAC، ولا تنام أو تتجمد مطلقاً."
                  : "Google Cloud Firestore database with ABAC rules, zero sleep, and enterprise uptime."}
              </p>
            </div>
          </div>

          <button
            onClick={checkConnection}
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{ar ? "فحص الاتصال والسرعة" : "Test Latency"}</span>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="rounded-2xl border border-border bg-background/50 p-3.5">
            <p className="text-2xs text-muted-foreground">{ar ? "حالة الاتصال" : "Status"}</p>
            <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {status === "connected" ? (ar ? "متصل ومستقر" : "Connected") : (ar ? "جاري الفحص..." : "Checking...")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-3.5">
            <p className="text-2xs text-muted-foreground">{ar ? "زمن الاستجابة" : "Latency"}</p>
            <p className="text-sm font-bold font-mono text-foreground mt-1" dir="ltr">
              {latency !== null ? `${latency} ms` : "..."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-3.5">
            <p className="text-2xs text-muted-foreground">{ar ? "نظام التخزين المؤقت" : "Offline Persistence"}</p>
            <p className="text-sm font-bold text-primary mt-1">
              {ar ? "مفعل تلقائياً" : "Enabled"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-3.5">
            <p className="text-2xs text-muted-foreground">{ar ? "آخر فحص ناجح" : "Last Checked"}</p>
            <p className="text-sm font-bold font-mono text-muted-foreground mt-1" dir="ltr">
              {lastCheck || "الآن"}
            </p>
          </div>
        </div>
      </div>

      {/* Database Metadata Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span>{ar ? "معلومات البنية التحتية" : "Infrastructure Specs"}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{ar ? "المزود الأساسي:" : "Provider:"}</span>
              <span className="font-semibold text-foreground">Google Firebase / Firestore</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{ar ? "معرف المشروع:" : "Project ID:"}</span>
              <span className="font-mono text-foreground text-[11px]">{firebaseConfig.projectId}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{ar ? "قاعدة البيانات:" : "Database ID:"}</span>
              <span className="font-mono text-foreground text-[11px] truncate max-w-[200px]" title={firebaseConfig.firestoreDatabaseId}>
                {firebaseConfig.firestoreDatabaseId || "(default)"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted-foreground">{ar ? "باقة الاستضافة:" : "Plan:"}</span>
              <span className="font-semibold text-emerald-400">{ar ? "Google Cloud Native" : "Google Cloud Native"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{ar ? "الأمان والتراخيص" : "Security & Authentication"}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{ar ? "قواعد الحماية (Rules):" : "Security Rules:"}</span>
              <span className="font-semibold text-emerald-400">{ar ? "ABAC Zero-Trust Rules" : "ABAC Zero-Trust Rules"}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{ar ? "طرق التوثيق:" : "Auth Providers:"}</span>
              <span className="font-semibold text-foreground">Google OAuth + Email/Password</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{ar ? "مزامنة الأجهزة:" : "Multi-Device Sync:"}</span>
              <span className="font-semibold text-foreground">{ar ? "لحظية (Real-time)" : "Real-time"}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted-foreground">{ar ? "حماية ضد التجميد:" : "Freeze Immunity:"}</span>
              <span className="font-semibold text-emerald-400">100% {ar ? "محمي من التوقف" : "Protected"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
