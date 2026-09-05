/**
 * Supabase Keep-Alive & Direct Connection Health Monitor
 * 
 * Purpose:
 * 1. Verifies direct connection, latency, and status with the live Supabase project.
 * 2. Runs an automated background "Keep-Alive" heartbeat daemon every 24 hours to
 *    prevent the Supabase Free Tier 7-day auto-pause/freeze mechanism.
 * 3. Provides real-time diagnostics, manual ping endpoints, and actionable telemetry.
 */

export interface SupabaseHealthState {
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

const state: SupabaseHealthState = {
  isConfigured: false,
  projectUrl: "",
  maskedKey: "",
  status: "not_configured",
  statusMessageAr: "لم يتم ضبط متغيرات Supabase بعد",
  statusMessageEn: "Supabase environment variables not configured yet",
  lastPingTime: null,
  lastLatencyMs: null,
  totalPings: 0,
  successfulPings: 0,
  consecutiveFailures: 0,
  nextScheduledPing: null,
  daemonActive: false,
  intervalHours: 24,
  history: [],
};

let daemonIntervalTimer: NodeJS.Timeout | null = null;

function getSupabaseConfig(): { url: string; key: string } {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const key = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  return { url, key };
}

function maskKey(key: string): string {
  if (!key) return "N/A";
  if (key.length <= 10) return "******";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function maskUrl(url: string): string {
  if (!url) return "N/A";
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

/**
 * Executes a live health check and keep-alive ping to Supabase
 */
export async function pingSupabase(triggerSource: "daemon" | "manual" | "startup" = "manual"): Promise<SupabaseHealthState> {
  const { url, key } = getSupabaseConfig();
  state.totalPings += 1;
  const now = new Date();
  state.lastPingTime = now.toISOString();

  if (!url || !key || url.includes("placeholder-project")) {
    state.isConfigured = false;
    state.projectUrl = url || "غير مضبوط";
    state.maskedKey = maskKey(key);
    state.status = "not_configured";
    state.statusMessageAr = "متغيرات VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY غير مكتملة في الخادم.";
    state.statusMessageEn = "Supabase URL and API Key are missing or set to placeholder.";
    state.consecutiveFailures += 1;

    state.history.unshift({
      timestamp: now.toISOString(),
      status: "warning",
      latencyMs: 0,
      messageAr: "فشل الفحص: بيانات الاتصال غير مضبوطة في متغيرات البيئة.",
      messageEn: "Check skipped: Supabase credentials not set in environment.",
    });
    if (state.history.length > 20) state.history.pop();
    return state;
  }

  state.isConfigured = true;
  state.projectUrl = maskUrl(url);
  state.maskedKey = maskKey(key);

  const startTime = Date.now();
  try {
    // Send a lightweight HTTP GET to PostgREST root /rest/v1/ with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const pingUrl = `${url.replace(/\/$/, "")}/rest/v1/`;
    const response = await fetch(pingUrl, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "User-Agent": "AlForas-KeepAlive-Daemon/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    state.lastLatencyMs = latency;

    if (response.ok || response.status === 200 || response.status === 204) {
      state.status = "connected";
      state.statusMessageAr = `الاتصال مباشر ومستقر بنجاح مع Supabase (زمن الاستجابة: ${latency} مللي ثانية). تم تنشيط المشروع وتصفير عداد الخمول.`;
      state.statusMessageEn = `Live direct connection verified (${latency}ms latency). Heartbeat ping sent successfully; auto-pause counter reset.`;
      state.successfulPings += 1;
      state.consecutiveFailures = 0;

      state.history.unshift({
        timestamp: now.toISOString(),
        status: "success",
        latencyMs: latency,
        messageAr: `نبضة تنشيط ناجحة (${triggerSource === "daemon" ? "تلقائي" : triggerSource === "startup" ? "بدء التشغيل" : "يدوي"}): الاستجابة ${latency}ms - المشروع نشط.`,
        messageEn: `Heartbeat successful (${triggerSource}): ${latency}ms latency - Project active.`,
      });
    } else if (response.status === 401 || response.status === 403) {
      state.status = "auth_error";
      state.statusMessageAr = `تم الوصول للخادم ولكن مفتاح API (Anon Key) غير صالح أو منتهي الصلاحية (رمز ${response.status}).`;
      state.statusMessageEn = `Reached Supabase server but API key is unauthorized (HTTP ${response.status}).`;
      state.consecutiveFailures += 1;

      state.history.unshift({
        timestamp: now.toISOString(),
        status: "error",
        latencyMs: latency,
        messageAr: `خطأ في مفتاح الصلاحيات: HTTP ${response.status}`,
        messageEn: `Authentication failed: HTTP ${response.status}`,
      });
    } else if (response.status === 503) {
      state.status = "paused";
      state.statusMessageAr = "المشروع في حالة تجميد أو إيقاف مؤقت (503 Service Unavailable). يرجى فتح لوحة Supabase والنقر على Restore Project.";
      state.statusMessageEn = "Project appears to be paused (503). Restore it via supabase.com dashboard.";
      state.consecutiveFailures += 1;

      state.history.unshift({
        timestamp: now.toISOString(),
        status: "error",
        latencyMs: latency,
        messageAr: "المشروع مجمد (503 Service Unavailable)",
        messageEn: "Project paused (503 Service Unavailable)",
      });
    } else {
      state.status = "connected";
      state.statusMessageAr = `تم استلام استجابة من Supabase (رمز ${response.status}) بزمن ${latency} مللي ثانية.`;
      state.statusMessageEn = `Received response from Supabase (HTTP ${response.status}) in ${latency}ms.`;
      state.successfulPings += 1;

      state.history.unshift({
        timestamp: now.toISOString(),
        status: "success",
        latencyMs: latency,
        messageAr: `استجابة HTTP ${response.status} (${latency}ms)`,
        messageEn: `HTTP ${response.status} response (${latency}ms)`,
      });
    }
  } catch (err: any) {
    const latency = Date.now() - startTime;
    state.lastLatencyMs = latency;
    state.consecutiveFailures += 1;

    const errMsg = err?.message || String(err);
    if (errMsg.includes("ENOTFOUND") || errMsg.includes("getaddrinfo")) {
      state.status = "paused";
      state.statusMessageAr = "تعذر العثور على عنوان المشروع (ENOTFOUND). هذا يحدث عندما يقوم Supabase بإيقاف المشروع وتجميد نطاق DNS الخاص به بسبب الخمول لأكثر من 7 أيام. قم باستعادة المشروع من app.supabase.com.";
      state.statusMessageEn = "DNS lookup failed (ENOTFOUND). Typically happens when Supabase pauses the project after 7 days of inactivity. Restore it in app.supabase.com.";
    } else if (err?.name === "AbortError") {
      state.status = "unreachable";
      state.statusMessageAr = "تجاوز الاتصال مهلة الانتظار (8 ثوانٍ) دون استجابة.";
      state.statusMessageEn = "Connection timed out after 8 seconds.";
    } else {
      state.status = "unreachable";
      state.statusMessageAr = `تعذر الاتصال بخادم Supabase: ${errMsg}`;
      state.statusMessageEn = `Connection failed: ${errMsg}`;
    }

    state.history.unshift({
      timestamp: now.toISOString(),
      status: "error",
      latencyMs: latency,
      messageAr: `فشل الاتصال: ${errMsg}`,
      messageEn: `Ping failed: ${errMsg}`,
    });
  }

  // Calculate next scheduled ping
  const nextDate = new Date(Date.now() + state.intervalHours * 60 * 60 * 1000);
  state.nextScheduledPing = nextDate.toISOString();

  if (state.history.length > 20) state.history.pop();
  return state;
}

/**
 * Initializes the background 24-hour Keep-Alive daemon
 */
export function startSupabaseKeepAliveDaemon(intervalHours = 24): void {
  state.intervalHours = intervalHours;
  state.daemonActive = true;

  // Clear existing timer if any
  if (daemonIntervalTimer) {
    clearInterval(daemonIntervalTimer);
  }

  console.log(`[Supabase Keep-Alive] Initializing heartbeat daemon (every ${intervalHours}h)...`);

  // First ping 6 seconds after server starts
  setTimeout(() => {
    pingSupabase("startup").then((res) => {
      console.log(`[Supabase Keep-Alive] Initial ping finished: status=${res.status}, latency=${res.lastLatencyMs}ms`);
    }).catch(e => {
      console.warn(`[Supabase Keep-Alive] Initial ping error:`, e?.message);
    });
  }, 6000);

  // Set recurring interval (default: 24 hours)
  const intervalMs = intervalHours * 60 * 60 * 1000;
  daemonIntervalTimer = setInterval(() => {
    console.log("[Supabase Keep-Alive] Running scheduled heartbeat ping to prevent auto-pause...");
    pingSupabase("daemon").catch(e => {
      console.error("[Supabase Keep-Alive] Daemon heartbeat error:", e?.message);
    });
  }, intervalMs);
}

export function getSupabaseHealthState(): SupabaseHealthState {
  const { url, key } = getSupabaseConfig();
  state.isConfigured = Boolean(url && key && !url.includes("placeholder-project"));
  state.projectUrl = maskUrl(url);
  state.maskedKey = maskKey(key);

  return { ...state };
}
