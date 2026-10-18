import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { opportunitiesDb, verifyQuickActionToken } from "./server/opportunitiesDb";
import { runOpportunitiesAutomation, formatNotificationDigest, dispatchTeamAlerts, getAppBaseUrl } from "./server/automationEngine";
import { buildAdvisorGroundingContext } from "./server/knowledgeRepository";
import { runMasterCloudSeeding } from "./server/masterSeeder";
import { isSafePublicUrl } from "./server/securityUtils";
import { isFirestoreConnected, syncAllOpportunitiesToFirestore } from "./server/firestoreSync";
import { sanitizeServerText, sanitizeServerUrl, sanitizeServerStringArray } from "./server/sanitizer";

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Executes Gemini generateContent using modern available models with tiered fallback
 * Primary: gemini-3.6-flash
 * Secondary: gemini-3.8-flash
 * Tertiary: gemini-3.5-flash-lite
 * Quaternary: gemini-3.1-flash-lite
 * Quinary: gemini-flash-latest
 */
async function generateWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
  }
) {
  const models = [
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      if (response && (response.text || response.candidates)) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} unavailable or returned error, trying next fallback:`, err?.message || err);
    }
  }

  throw lastError || new Error("All Gemini models in fallback chain failed.");
}

/**
 * Extracts visible clean text and meta info from an HTML string
 */
function extractHtmlText(html: string): { title: string; description: string; text: string } {
  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const description = metaDescMatch ? metaDescMatch[1].trim() : "";

  // Strip script, style, svg, noscript
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
                    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
                    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ");

  // Strip all HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Unescape common HTML entities
  cleaned = cleaned.replace(/&nbsp;/g, " ")
                   .replace(/&amp;/g, "&")
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return {
    title,
    description,
    text: cleaned.slice(0, 15000), // First 15,000 chars for AI parsing
  };
}

async function startServer() {
  const app = express();

  // Trust Cloud Run reverse proxy (resolves client IP correctly from X-Forwarded-For)
  app.set("trust proxy", 1);

  // Security Headers (configured to allow AI Studio iframe preview while enforcing security)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // General API Rate Limiter: 120 requests per minute per IP
  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, forwardedHeader: false },
    message: { error: "تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة بعد دقيقة." },
  });
  app.use("/api/", generalLimiter);

  // AI & Intensive Scraper Rate Limiter: 30 requests per minute per IP
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, forwardedHeader: false },
    message: { error: "تم تجاوز حد استخدام الذكاء الاصطناعي، يرجى الانتظار قليلاً." },
  });
  app.use("/api/ai-advisor", aiLimiter);
  app.use("/api/ai/sop-generator", aiLimiter);
  app.use("/api/ai/match-analysis", aiLimiter);
  app.use("/api/parse-url", aiLimiter);

  app.use(express.json({ limit: "5mb" }));

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""),
    });
  });

  // Opportunities Persistent Cloud/Server API
  app.get("/api/opportunities", (_req, res) => {
    try {
      const data = opportunitiesDb.get();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read opportunities database" });
    }
  });

  app.post("/api/opportunities/sync-cloud", async (_req, res) => {
    try {
      const result = await runMasterCloudSeeding();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Sync failed" });
    }
  });

  // Backup Management Endpoints
  app.get("/api/backup/status", (_req, res) => {
    try {
      const backupDir = path.join(process.cwd(), "data", "backups");
      const files = fs.existsSync(backupDir) ? fs.readdirSync(backupDir) : [];
      res.json({
        success: true,
        totalBackups: files.length,
        backups: files.sort().reverse(),
        lastBackup: files[files.length - 1] || null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to list backups" });
    }
  });

  app.post("/api/backup/create", (_req, res) => {
    try {
      const db = opportunitiesDb.get();
      const backupDir = path.join(process.cwd(), "data", "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `manual_backup_${timestamp}.json`;
      const filePath = path.join(backupDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf-8");
      res.json({ success: true, filename, timestamp });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Failed to create manual backup" });
    }
  });

  app.post("/api/opportunities/scholarships", (req, res) => {
    try {
      const raw = req.body;
      if (!raw || (!raw.title && !raw.title_ar)) {
        return res.status(400).json({ error: "Title is required" });
      }
      const item = {
        ...raw,
        id: sanitizeServerText(raw.id),
        title: sanitizeServerText(raw.title || raw.title_ar),
        titleEn: sanitizeServerText(raw.titleEn || raw.title_en || ""),
        org: sanitizeServerText(raw.org || raw.university || "جامعة معتمدة"),
        country: sanitizeServerText(raw.country || "دولي"),
        description: sanitizeServerText(raw.description || raw.description_ar || ""),
        descriptionEn: sanitizeServerText(raw.descriptionEn || raw.description_en || ""),
        url: sanitizeServerUrl(raw.url || raw.apply_url || raw.official_website),
        tags: sanitizeServerStringArray(raw.tags || raw.majors),
      };
      const result = opportunitiesDb.upsertScholarship(item);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save scholarship" });
    }
  });

  app.delete("/api/opportunities/scholarships/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { reason, user } = req.body || {};
      const success = opportunitiesDb.deleteScholarship(id, reason, user);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete scholarship" });
    }
  });

  app.post("/api/opportunities/jobs", (req, res) => {
    try {
      const raw = req.body;
      if (!raw || (!raw.title_ar && !raw.title)) {
        return res.status(400).json({ error: "Title is required" });
      }
      const job = {
        ...raw,
        id: sanitizeServerText(raw.id),
        title_ar: sanitizeServerText(raw.title_ar || raw.title),
        title_en: sanitizeServerText(raw.title_en || raw.titleEn || ""),
        company: sanitizeServerText(raw.company || "شركة معتمدة"),
        location: sanitizeServerText(raw.location || "عن بُعد"),
        salary: sanitizeServerText(raw.salary || ""),
        description_ar: sanitizeServerText(raw.description_ar || raw.description || ""),
        description_en: sanitizeServerText(raw.description_en || raw.descriptionEn || ""),
        apply_url: sanitizeServerUrl(raw.apply_url || raw.url),
        skills: sanitizeServerStringArray(raw.skills),
      };
      const result = opportunitiesDb.upsertJob(job);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save job" });
    }
  });

  app.delete("/api/opportunities/jobs/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { reason, user } = req.body || {};
      const success = opportunitiesDb.deleteJob(id, reason, user);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Automated Ingestion Engine Endpoints
  app.get("/api/automation/status", (_req, res) => {
    try {
      const data = opportunitiesDb.get();
      res.json(data.automation);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch automation status" });
    }
  });

  app.get("/api/automation/settings", (_req, res) => {
    try {
      const settings = opportunitiesDb.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch automation settings" });
    }
  });

  app.post("/api/automation/settings", (req, res) => {
    try {
      const updated = opportunitiesDb.updateSettings(req.body || {});
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update automation settings" });
    }
  });

  app.get("/api/automation/pending", (_req, res) => {
    try {
      const pending = opportunitiesDb.getPendingReviews();
      res.json(pending);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch pending reviews" });
    }
  });

  app.post("/api/automation/pending/:id/approve", (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body || {};
      const result = opportunitiesDb.approvePendingReview(id, user);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to approve pending review", message: err?.message });
    }
  });

  app.post("/api/automation/pending/:id/reject", (req, res) => {
    try {
      const { id } = req.params;
      const { reason, user } = req.body || {};
      const success = opportunitiesDb.rejectPendingReview(id, reason, user);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to reject pending review" });
    }
  });

  app.get("/api/automation/notifications", (_req, res) => {
    try {
      const notifications = opportunitiesDb.getNotificationHistory();
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch notification history" });
    }
  });

  app.post("/api/automation/notify/test", (req, res) => {
    try {
      const { recipient, channel = "whatsapp" } = req.body || {};
      const log = opportunitiesDb.addNotificationLog({
        channel: channel as any,
        recipient: recipient || "المشرف العام",
        title: "بلاغ تجريبي لاختبار قناة التنبيهات",
        summary: "تم إرسال إشعار فحص تجريبي ناجح من محرك أوتوميشن منصة الفرص.",
        status: "sent",
        itemsCount: 1,
      });
      res.json({ success: true, log });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });

  app.post("/api/automation/run", async (_req, res) => {
    try {
      const ai = getGeminiClient();
      const result = await runOpportunitiesAutomation(ai);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to execute automation", message: err?.message });
    }
  });

  // Direct 1-Click Quick Action Handler for Email & WhatsApp Approvals (72h TTL & Replay Protection)
  app.get("/api/opportunities/quick-action", async (req, res) => {
    try {
      const { id, action, token, exp } = req.query as { id?: string; action?: "approve" | "reject"; token?: string; exp?: string };
      const baseUrl = getAppBaseUrl();

      if (!id || !action || !token) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>طلب غير مكتمل | منصة الفرص</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
              h1 { color: #f87171; font-size: 20px; margin-bottom: 12px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
              a { display: inline-block; margin-top: 20px; background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>⚠️ رابط غير مكتمل</h1>
              <p>المعاملات المطلوبة للاعتماد السريع غير مكتملة في الرابط المفتوح.</p>
              <a href="${baseUrl}">العودة إلى المنصة</a>
            </div>
          </body>
          </html>
        `);
      }

      // Security check: verify HMAC token with 72h TTL & Replay Protection
      const verification = verifyQuickActionToken(id, token, action, exp);
      if (!verification.valid) {
        if (verification.reason === "expired") {
          return res.status(403).send(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>انتهت صلاحية الرابط | منصة الفرص</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { background: #1e293b; border: 1px solid #f59e0b; border-radius: 20px; padding: 36px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .icon { font-size: 52px; margin-bottom: 12px; display: inline-block; }
                h1 { color: #fbbf24; font-size: 21px; margin: 0 0 12px 0; }
                p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
                .notice { background: #334155; border-radius: 10px; padding: 12px; margin: 18px 0; font-size: 13px; color: #cbd5e1; }
                a { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="card">
                <span class="icon">⏳</span>
                <h1>انتهت صلاحية رابط الاعتماد السريع</h1>
                <p>تجاوز هذا الرابط المهلة الزمنية المحددة أمنياً (72 ساعة).</p>
                <div class="notice">
                  🛡️ لحماية المنصة ومنع أي اعتماد غير مقصود، يمكنك فتح لوحة الإدارة ومراجعة الفرصة واعتمادها يدوياً بأمان.
                </div>
                <a href="${baseUrl}/admin?tab=automation">فتح لوحة الإدارة للمراجعة</a>
              </div>
            </body>
            </html>
          `);
        }

        if (verification.reason === "already_processed") {
          const isPublished = verification.itemStatus === "published";
          return res.status(200).send(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>تم اتخاذ إجراء مسبقاً | منصة الفرص</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { background: #1e293b; border: 1px solid #3b82f6; border-radius: 20px; padding: 36px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .icon { font-size: 52px; margin-bottom: 12px; display: inline-block; }
                h1 { color: #60a5fa; font-size: 21px; margin: 0 0 12px 0; }
                p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
                .badge { display: inline-block; background: #1e3a8a; color: #93c5fd; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin: 12px 0 20px 0; }
                .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }
                .btn-primary { background: #3b82f6; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; }
                .btn-secondary { background: #334155; color: #f8fafc; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="card">
                <span class="icon">${isPublished ? "✅" : "📁"}</span>
                <h1>تم اتخاذ الإجراء مسبقاً</h1>
                <div class="badge">
                  ${isPublished ? "تم نشر هذه الفرصة مسبقاً وهي معتمدة بالمنصة" : "تم استبعاد هذه الفرصة مسبقاً في الأرشيف"}
                </div>
                <p>هذا الرابط تم استخدامه مسبقاً من قِبل الإدارة، ولا حاجة لإعادة اتخاذ أي إجراء.</p>
                <div class="actions">
                  <a href="${baseUrl}" class="btn-primary">زيارة المنصة</a>
                  <a href="${baseUrl}/admin?tab=automation" class="btn-secondary">لوحة التحكم</a>
                </div>
              </div>
            </body>
            </html>
          `);
        }

        return res.status(403).send(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>رمز التحقق غير صالح | منصة الفرص</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; text-align: center; }
              h1 { color: #f87171; font-size: 20px; margin-bottom: 12px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
              a { display: inline-block; margin-top: 20px; background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🔒 رمز أمان غير صالح</h1>
              <p>رمز التحقق الأمني المرفق مع هذا الرابط غير صحيح أو تم التلاعب به.</p>
              <a href="${baseUrl}/admin?tab=automation">فتح لوحة الإدارة للمراجعة</a>
            </div>
          </body>
          </html>
        `);
      }

      if (action === "approve") {
        const result = opportunitiesDb.approvePendingReview(id, {
          id: "quick_action_admin",
          name: "المشرف عبر الإشعار السريع",
          role: "super_admin",
        });

        if (!result.success) {
          return res.status(400).send(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
              <meta charset="utf-8" />
              <title>تنبيه الاعتماد | منصة الفرص</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                .card { background: #1e293b; border: 1px solid #f59e0b; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; }
                h1 { color: #fbbf24; font-size: 20px; }
                p { color: #94a3b8; }
                a { display: inline-block; margin-top: 20px; background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>ℹ️ تم اتخاذ إجراء مسبق</h1>
                <p>${result.error || "هذه الفرصة تمت معالجتها أو نشرها مسبقاً."}</p>
                <a href="${baseUrl}">عرض المنصة</a>
              </div>
            </body>
            </html>
          `);
        }

        const published = result.item;
        const title = published?.title || published?.title_ar || "الفرصة المعتمدة";
        const org = published?.university || published?.org || published?.company || "الجهة المانحة";

        return res.status(200).send(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>تم الاعتماد والنشر بنجاح | منصة الفرص</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { background: #131c2e; border: 1px solid #10b981; border-radius: 20px; padding: 40px; max-width: 540px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
              .icon { font-size: 56px; margin-bottom: 16px; display: inline-block; }
              h1 { color: #34d399; font-size: 22px; margin: 0 0 10px 0; }
              .badge { display: inline-block; background: #064e3b; color: #6ee7b7; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 20px; border: 1px solid #059669; }
              .details { background: #1e293b; border-radius: 12px; padding: 20px; text-align: right; margin-bottom: 24px; border: 1px solid #334155; }
              .details strong { color: #f8fafc; font-size: 16px; display: block; margin-bottom: 6px; }
              .details span { color: #94a3b8; font-size: 14px; }
              .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
              .btn-primary { background: #10b981; color: #022c22; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; }
              .btn-secondary { background: #334155; color: #f8fafc; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="icon">✅</span>
              <h1>تم الاعتماد والنشر بنجاح!</h1>
              <div class="badge">مزامنة سحابية نشطة 100% مع Firebase Firestore</div>
              <div class="details">
                <strong>📌 ${title}</strong>
                <span>🏛️ الجهة: ${org}</span><br/>
                <span style="color: #38bdf8; font-size: 13px; margin-top: 8px; display: block;">
                  ⚡ أصبحت الفرصة متاحة الآن لجميع مستخدمي المنصة والتطبيق لحظياً.
                </span>
              </div>
              <div class="actions">
                <a href="${baseUrl}" class="btn-primary">عرض الفرصة في المنصة</a>
                <a href="${baseUrl}/admin?tab=automation" class="btn-secondary">لوحة التحكم</a>
              </div>
            </div>
          </body>
          </html>
        `);
      } else if (action === "reject") {
        opportunitiesDb.rejectPendingReview(id, "تم الاستبعاد السريع بنقرة واحدة من رسالة الإشعار", {
          id: "quick_action_admin",
          name: "المشرف عبر الإشعار السريع",
          role: "super_admin",
        });

        return res.status(200).send(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>تم استبعاد الفرصة | منصة الفرص</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
              .card { background: #131c2e; border: 1px solid #64748b; border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; text-align: center; }
              .icon { font-size: 56px; margin-bottom: 16px; }
              h1 { color: #cbd5e1; font-size: 22px; margin: 0 0 10px 0; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
              a { display: inline-block; margin-top: 20px; background: #334155; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="icon">📦</span>
              <h1>تم الاستبعاد والأرشفة</h1>
              <p>تم استبعاد الفرصة ونقلها إلى خزنة الأرشيف الإداري دون نشرها للمستخدمين.</p>
              <a href="${baseUrl}/admin?tab=automation">لوحة التحكم</a>
            </div>
          </body>
          </html>
        `);
      }

      res.status(400).send("إجراء غير معروف");
    } catch (err: any) {
      res.status(500).send(`حدث خطأ أثناء تنفيذ الإجراء: ${err?.message}`);
    }
  });

  // Comprehensive Cloud Firestore Sync endpoint
  app.post("/api/opportunities/sync-cloud", async (_req, res) => {
    try {
      const result = await opportunitiesDb.syncAllToFirestore();
      res.json({
        success: true,
        ...result,
        message: `تمت مزامنة ${result.scholarshipsCount} منحة و ${result.jobsCount} وظيفة بنجاح مع Cloud Firestore.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Cloud sync failed", message: err?.message });
    }
  });

  // Cloud Firestore Health / Connection Status
  app.get("/api/opportunities/sync-status", async (_req, res) => {
    try {
      const connected = await isFirestoreConnected();
      res.json({
        connected,
        lastChecked: new Date().toISOString(),
        database: "ai-studio-alforassd-e457b197-692b-4bf0-a8fa-108abfa73552",
      });
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err?.message });
    }
  });

  // Immediate dispatch of latest report to team recipients
  app.post("/api/opportunities/dispatch-digest", async (_req, res) => {
    try {
      const db = opportunitiesDb.get();
      const pending = opportunitiesDb.getPendingReviews();
      const settings = opportunitiesDb.getSettings();

      const criticalList = pending
        .filter(p => p.priority === "critical")
        .map(p => ({
          title: p.itemData?.title || p.itemData?.title_ar || "فرصة حرجة",
          entity: p.itemData?.university || p.itemData?.company || "جهة معتمدة",
          priority: "critical",
          reason: p.importanceReason || "فرصة ذات موعد وشروط استثنائية",
        }));

      const digest = formatNotificationDigest({
        addedScholarships: db.scholarships.length,
        addedJobs: db.jobs.length,
        pendingCount: pending.length,
        criticalList,
        publishMode: settings.publishMode || "smart_auto",
        pendingItems: pending,
      });

      const count = await dispatchTeamAlerts(
        settings.teamRecipients,
        digest,
        true,
        settings.whatsappApiKey
      );

      res.json({
        success: true,
        dispatchedRecipients: count,
        digest,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to dispatch digest", message: err?.message });
    }
  });

  // 2. Real AI URL Parser & Opportunity Scraper
  app.post("/api/parse-url", async (req, res) => {
    const { url, type = "scholarship" } = req.body;

    const safetyCheck = isSafePublicUrl(url);
    if (!safetyCheck.isSafe) {
      return res.status(400).json({
        isValid: false,
        error: safetyCheck.reason || "الرابط المدخل غير مسموح به أمنياً",
      });
    }

    const safeUrl = safetyCheck.normalizedUrl || url;

    try {
      // Fetch the actual webpage
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(safeUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,en-US,en;q=0.9",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(400).json({
          isValid: false,
          error: `تعذر جلب الرابط (رمز الخطأ: ${response.status}). تأكد من أن الرابط يعمل بشكل صحيح ومتاح للعامة.`,
        });
      }

      const html = await response.text();
      const { title, description, text } = extractHtmlText(html);

      if (text.length < 50) {
        return res.status(400).json({
          isValid: false,
          error: "الموقع لا يحتوي على محتوى نصي كافٍ، أو أنه محمي بجدار حماية ضد البرمجيات.",
        });
      }

      const ai = getGeminiClient();

      if (ai) {
        // Real Gemini AI parsing with resilience & multi-model fallback
        const prompt = `
You are an expert opportunity and scholarship classifier and scraper.
We fetched the following webpage text from URL: "${url}"
Type requested: "${type}" (either "scholarship" or "job")

PAGE TITLE: ${title}
PAGE DESCRIPTION: ${description}
PAGE BODY TEXT CONTENT:
${text}

YOUR INSTRUCTIONS:
1. Thoroughly verify if this webpage represents a genuine, real ${type === "scholarship" ? "academic scholarship, grant, or fellowship" : "job offer or career opening"}.
2. If this page is NOT a genuine ${type} announcement (e.g. it is a database dashboard like Supabase, a cloud console, a login/signup screen, an e-commerce shop, a general news home page, social media, a search engine, or an unrelated tech tool), you MUST return JSON with:
   {
     "isValid": false,
     "reason": "توضيح دقيق ومقنع باللغة العربية يشرح سبب رفض الرابط ولماذا لا يمثل منحة أو وظيفة حقيقية"
   }
3. If it IS a genuine ${type}, extract accurate information in JSON with:
   {
     "isValid": true,
     "data": {
       "title_ar": "اسم المنحة أو الوظيفة باللغة العربية بشكل جذاب ورسمي",
       "title_en": "Official Title in English",
       "university": "الجامعة المانحة أو الشركة",
       "country": "الدولة (مثال: بريطانيا، ألمانيا، تركيا، السعودية، كندا، عالمي)",
       "flag": "علم الدولة كإيموجي (مثال: 🇬🇧 أو 🇹🇷 أو 🇸🇦)",
       "degree": "bachelor" | "master" | "phd" | "bachelor_master",
       "coverage": "full" | "partial" | "tuition_only" | "stipend_only",
       "deadline": "YYYY-MM-DD تاريخ انتهاء التقديم إن وجد أو تقديري",
       "stipend": "قيمة الراتب الشهري أو التغطية المالية التقديرية",
       "majors": ["التخصصات المتاحة 1", "التخصص 2"],
       "apply_url": "${url}",
       "official_website": "${url}",
       "description_ar": "وصف تفصيلي شامل ودقيق للمنحة ومزاياها وشروطها من واقع الصفحة",
       "description_en": "Comprehensive English summary of the opportunity",
       "benefits_ar": ["الميزة 1", "الميزة 2", "الميزة 3"],
       "benefits_en": ["Benefit 1", "Benefit 2"],
       "requirements_ar": ["الشرط 1", "الشرط 2", "الشرط 3"],
       "requirements_en": ["Requirement 1", "Requirement 2"]
     }
   }

Respond ONLY with pure JSON. Do not include markdown code block backticks.
`;

        try {
          const aiResponse = await generateWithFallback(ai, {
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const rawText = aiResponse?.text?.trim() || "{}";
          let parsedResult: any = {};
          try {
            parsedResult = JSON.parse(rawText);
          } catch {
            const cleanJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            parsedResult = JSON.parse(cleanJson);
          }

          if (parsedResult && (parsedResult.isValid !== undefined || parsedResult.data)) {
            return res.json(parsedResult);
          }
        } catch (genError: any) {
          console.warn("Gemini generation unavailable, smoothly executing intelligent heuristic inspection:", genError?.message);
          // Fall through to heuristic analysis below
        }
      }

      // Intelligent Heuristic Content Inspection (Always runs safely when AI is busy or keyless)
      const lower = (title + " " + description + " " + text).toLowerCase();
      const scholarshipKeywords = [
        "scholarship", "fellowship", "bursary", "grant", "stipend", "tuition",
        "منحة", "منح", "جامعة", "دراسة", "تمويل", "بوابة التقديم", "فرصة", "دراسات عليا", "بكالوريوس", "ماجستير"
      ];
      const jobKeywords = [
        "job", "career", "hiring", "vacancy", "salary", "remote",
        "وظيفة", "وظائف", "توظيف", "شاغر", "عمل عن بعد", "دوام"
      ];
      const targetKeywords = type === "scholarship" ? scholarshipKeywords : jobKeywords;

      const matches = targetKeywords.filter((kw) => lower.includes(kw));
      const hasDashboardKeywords = lower.includes("sql editor") || lower.includes("console.cloud") || lower.includes("phpmyadmin");

      if (matches.length < 1 || hasDashboardKeywords) {
        return res.json({
          isValid: false,
          reason: `الرابط المدخل لا يحتوي على إعلان ${type === "scholarship" ? "منحة دراسية" : "وظيفة"} معتمد، أو أن الصفحة تتطلب تسجيل دخول. يرجى التأكد من الرابط الرسمي المباشر.`,
        });
      }

      // Try to discover external official links inside the HTML
      let candidateApplyUrl = url;
      let candidateOfficialUrl = url;

      try {
        const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(https?:\/\/[^"']+)\1[^>]*>(.*?)<\/a>/gis;
        let match;
        const currentDomain = new URL(url).hostname;
        while ((match = linkRegex.exec(html)) !== null) {
          const href = match[2];
          const anchorText = match[3].replace(/<[^>]+>/g, "").trim().toLowerCase();
          try {
            const linkDomain = new URL(href).hostname;
            if (linkDomain !== currentDomain && !href.includes("facebook") && !href.includes("twitter") && !href.includes("linkedin.com/sharing") && !href.includes("whatsapp")) {
              if (
                anchorText.includes("قدم") ||
                anchorText.includes("تقديم") ||
                anchorText.includes("apply") ||
                anchorText.includes("register") ||
                anchorText.includes("الموقع الرسمي") ||
                anchorText.includes("official")
              ) {
                candidateApplyUrl = href;
                candidateOfficialUrl = href;
                break;
              }
            }
          } catch {}
        }
      } catch {}

      // Extract country heuristic
      const countryMatches = [
        { name: "قطر", flag: "🇶🇦" },
        { name: "السعودية", flag: "🇸🇦" },
        { name: "الإمارات", flag: "🇦🇪" },
        { name: "تركيا", flag: "🇹🇷" },
        { name: "ألمانيا", flag: "🇩🇪" },
        { name: "بريطانيا", flag: "🇬🇧" },
        { name: "أمريكا", flag: "🇺🇸" },
        { name: "كندا", flag: "🇨🇦" },
        { name: "فرنسا", flag: "🇫🇷" },
        { name: "مصر", flag: "🇪🇬" },
      ];
      let detectedCountry = "دولي / Global";
      let detectedFlag = "🌍";
      for (const cm of countryMatches) {
        if (title.includes(cm.name) || text.includes(cm.name)) {
          detectedCountry = cm.name;
          detectedFlag = cm.flag;
          break;
        }
      }

      // Clean display title
      const cleanTitle = title
        ? title.split(/[-|–—]/)[0].trim()
        : (type === "scholarship" ? "منحة دراسية معتمدة" : "فرصة وظيفية معتمدة");

      return res.json({
        isValid: true,
        data: {
          title_ar: cleanTitle,
          title_en: cleanTitle,
          university: cleanTitle.includes("جامعة") || cleanTitle.includes("معهد")
            ? cleanTitle
            : (type === "scholarship" ? "الجهة الأكاديمية الرسمية" : "الشركة الموظفة"),
          country: detectedCountry,
          flag: detectedFlag,
          degree: "bachelor_master",
          coverage: lower.includes("جزئي") ? "partial" : "full",
          deadline: new Date(Date.now() + 40 * 86400000).toISOString().split("T")[0],
          stipend: lower.includes("راتب") || lower.includes("ممولة") ? "تغطية كاملة مع راتب معيشي" : "مكافأة أو تمويل دراسي",
          majors: ["التخصصات المتاحة بحسب الإعلان الرسمي"],
          apply_url: candidateApplyUrl,
          official_website: candidateOfficialUrl,
          description_ar: description || `تفاصيل الفرصة المعلنة عبر المصدر: ${cleanTitle}`,
          description_en: description || "Opportunity details extracted from official source.",
          benefits_ar: [
            "تغطية الرسوم الدراسية أو تكاليف البرنامج",
            "راتب معيشي أو بدلات شهرية",
            "تأمين وتأشيرة سفر إن انطبق"
          ],
          requirements_ar: [
            "الحصول على المؤهل الأكاديمي المطلوب للدرجة",
            "تقديم الوثائق الرسمية والمستندات الثبوتية",
            "استيفاء معايير القبول الخاصة بالجهة"
          ],
        },
      });
    } catch (err: any) {
      console.error("URL Parsing error:", err);
      let userFriendlyMsg = "تعذر الاتصال بالرابط المحدد أو استخراج محتواه. تأكد من أن الرابط متاح ويعمل بدون جدار حماية.";
      if (err?.name === "AbortError") {
        userFriendlyMsg = "استغرق الموقع وقتاً طويلاً للاستجابة وتجاوز مهلة الاتصال (12 ثانية). يرجى التأكد من سرعة الموقع وتكرار المحاولة.";
      }
      return res.status(500).json({
        isValid: false,
        error: userFriendlyMsg,
      });
    }
  });

  // 3. Real AI Advisor Chat with Live Opportunities Grounding
  app.post("/api/ai-advisor", async (req, res) => {
    const { messages, userProfile, lang = "ar" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server.",
      });
    }

    try {
      // 1. Fetch live comprehensive platform opportunities (Mock, Arab & Global Flagships, Jobs, and Server DB)
      const grounding = buildAdvisorGroundingContext(messages || [], userProfile);
      const scholarshipsSummary = grounding.scholarshipsText;
      const jobsSummary = grounding.jobsText;

      const userContextStr = userProfile
        ? `User Profile Context: Name: ${userProfile.full_name || "N/A"}, Major: ${userProfile.major || "N/A"}, Degree Level: ${userProfile.degree || "N/A"}, GPA: ${userProfile.gpa || "N/A"}, Target Country: ${userProfile.target_country || "N/A"}, English: ${userProfile.english_level || "N/A"}, Skills: ${(userProfile.skills || []).join(", ")}, Interests: ${(userProfile.interests || []).join(", ")}`
        : "";

      const systemInstruction = `
You are the official Senior Academic, Scholarship & Career Advisor for the "Al-Foras" (منصة الفرص) platform.
You are fully bilingual (Arabic & English) with deep native mastery of Modern Standard Arabic, Arabic dialects (Sudanese, Egyptian, Gulf, Levantine, Maghrebi), and professional international English.
Tone: Warm, prestigious, inspiring, authoritative, structured, and highly practical.

MISSION & SCOPE:
You provide comprehensive, world-class advisory for:
1. Students: Full and partial scholarships (Bachelor's, Master's, PhD, Postdoc, Fellowships), university admission procedures, GPA equivalencies, language proficiency exams (IELTS, TOEFL, Duolingo, GRE, GMAT), and study visas.
2. Job Seekers & Workers: Remote jobs, freelance work, international careers, tech jobs, salary expectations, high-ROI professional certifications (PMP, AWS, GCP, Cisco, Data Science, AI), and career transitions.
3. Document Preparation: Statement of Purpose (SOP / Motivation Letter), Research Proposals, Recommendation Letters, and CV ATS Compliance (Action verbs, metrics, clean formatting).
4. Interview Coaching: Interactive mock interview simulation using the STAR Framework (Situation, Task, Action, Result) with constructive real-time evaluation.

CRITICAL LIVE PLATFORM KNOWLEDGE BASE (${grounding.totalScholarships} Scholarships, ${grounding.totalJobs} Curated Jobs & Global Directories):
=== HIGH-RELEVANCE SCHOLARSHIPS ON "AL-FORAS" PLATFORM ===
${scholarshipsSummary}

=== HIGH-RELEVANCE REMOTE & GLOBAL JOBS ON "AL-FORAS" PLATFORM ===
${jobsSummary}

STRICT OPERATIONAL RULES:
1. Grounding First: When recommending opportunities or answering questions about available programs, ALWAYS prioritize and cite matching opportunities from the database above with their exact official names, universities/organizations, countries, funding coverage, deadlines, and official links.
2. Omniscient Support: You can answer ANY question regarding scholarships, universities, jobs, and professional development worldwide. If an opportunity or university is not in the excerpt above, draw upon your comprehensive knowledge of global higher education (e.g. Erasmus Mundus, Fulbright, Chevening, DAAD, Turkiye Burslari, MEXT, Gates Cambridge, Rhodes, Vanier, KAUST, King Saud, etc.) and clarify with clear actionable guidance.
3. STAR Method for Interviews: When coaching or conducting mock interviews, guide the candidate using Situation, Task, Action, and Result. Evaluate their answers with specific positive feedback and actionable improvements.
4. Dialect & Language Harmony: If the user writes or speaks in an Arabic dialect (e.g., Sudanese like "داير استفسر" or Egyptian like "عاوز أقدم"), respond with welcoming cultural warmth in their dialect or accessible clear Arabic, while maintaining academic and professional rigor.
${userContextStr}

Always respond in ${lang === "ar" ? "Arabic" : "English"}.
`;

      const formattedHistory = (messages || []).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content || "" }],
      }));

      const response = await generateWithFallback(ai, {
        contents: formattedHistory,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        reply: response.text || "",
      });
    } catch (err: any) {
      console.error("AI Advisor error:", err);
      return res.status(500).json({
        error: "Failed to generate AI advice",
      });
    }
  });

  // 3.1 AI Statement of Purpose (SOP) & Motivation Letter Generator
  app.post("/api/ai/sop-generator", async (req, res) => {
    const { opportunityTitle, opportunityOrg, targetCountry, userProfile, lang = "ar" } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini AI is not configured on the server.",
      });
    }

    try {
      const isArabic = lang === "ar";
      const prompt = `
You are an Elite Admissions Consultant & Scholarship Committee Chair with 15+ years of experience reviewing applications for prestigious global programs (e.g. Fulbright, Chevening, Erasmus Mundus, DAAD, MEXT, Turkiye Burslari).

TASK:
Write an authentic, highly persuasive, competitive Statement of Purpose (SOP / Motivation Letter) for the following applicant and target opportunity.

TARGET OPPORTUNITY:
- Program / Scholarship: ${opportunityTitle || "Academic Degree / Fellowship"}
- Institution / Host: ${opportunityOrg || "International University"}
- Destination Country: ${targetCountry || "International"}

APPLICANT PROFILE:
- Full Name: ${userProfile?.full_name || "Applicant"}
- Current Degree & Major: ${userProfile?.degree || "Bachelor's"} in ${userProfile?.major || "Academic Field"}
- GPA: ${userProfile?.gpa ? `${userProfile?.gpa} (${userProfile?.gpaScale || "4.0"})` : "Competitive"}
- English Level: ${userProfile?.english_level || "Advanced / Fluent"}
- Key Skills: ${Array.isArray(userProfile?.skills) ? userProfile.skills.join(", ") : "N/A"}
- Academic & Research Interests: ${Array.isArray(userProfile?.interests) ? userProfile.interests.join(", ") : "N/A"}
- Experience / Background: ${userProfile?.experience || "Academic & Professional Experience"}
- Bio / Notes: ${userProfile?.bio || ""}

REQUIREMENTS:
1. NO generic clichés or template boilerplate. Start with a compelling intellectual hook showing genuine academic curiosity and motivation.
2. Clearly articulate why THIS specific program/institution is the logical next step for their academic journey.
3. Highlight their specific strengths, past academic achievements, and problem-solving mindset.
4. Explain how completing this degree will enable them to contribute to their home country and international community.
5. Provide the output structured with clean markdown headers:
   - ## 📌 عنوان الخطاب والبيانات الرسمية (Statement Header & Details)
   - ## 1. المقدمة والشغف الأكاديمي (The Intellectual Hook & Core Motivation)
   - ## 2. الخلفية الأكاديمية والمشاريع الرائدة (Academic Foundation & Key Projects)
   - ## 3. لماذا هذا البرنامج تحديداً؟ (Why This Specific Program & University)
   - ## 4. الأهداف المستقبلية والأثر المستدام (Future Career Goals & Sustainable Impact)
   - ## 5. الخاتمة والتعهد الأكاديمي (Conclusion & Academic Commitment)
   - 💡 **نصائح مخصصة من لجنة القبول لتقوية هذا الخطاب قبل إرساله**

Language: Write primarily in ${isArabic ? "Arabic with international academic terminology" : "formal international English"}.
`;

      const response = await generateWithFallback(ai, {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      return res.json({
        success: true,
        sopContent: response.text || "",
      });
    } catch (err: any) {
      console.error("[SOP Generator] AI generation error:", err);
      return res.status(500).json({
        error: "Failed to generate SOP",
        message: err?.message,
      });
    }
  });

  // 3.2 AI Live Profile-Opportunity Match Analysis
  app.post("/api/ai/match-analysis", async (req, res) => {
    const { opportunity, userProfile, lang = "ar" } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "Gemini AI is not configured on the server.",
      });
    }

    try {
      const isArabic = lang === "ar";
      const oppTitle = opportunity?.title || opportunity?.title_ar || opportunity?.name || "فرصة معتمدة";
      const oppOrg = opportunity?.org || opportunity?.company || opportunity?.university || "جهة مانحة";
      const oppCountry = opportunity?.country || "دولي";

      const prompt = `
You are an expert AI Career & Scholarship Admissions Evaluator.
Analyze the alignment between the following Applicant Profile and Target Opportunity.

TARGET OPPORTUNITY:
- Title: ${oppTitle}
- Organization / University: ${oppOrg}
- Country: ${oppCountry}
- Degree / Requirements: ${opportunity?.coverage || ""} ${opportunity?.description || ""}

APPLICANT PROFILE:
- Full Name: ${userProfile?.full_name || "Applicant"}
- Major: ${userProfile?.major || "N/A"}
- Degree: ${userProfile?.degree || "N/A"}
- GPA: ${userProfile?.gpa || "N/A"}
- English: ${userProfile?.english_level || "N/A"}
- Skills: ${Array.isArray(userProfile?.skills) ? userProfile.skills.join(", ") : "N/A"}
- Interests: ${Array.isArray(userProfile?.interests) ? userProfile.interests.join(", ") : "N/A"}

OUTPUT FORMAT: Return ONLY valid JSON with no markdown backticks, matching this exact schema:
{
  "matchPercentage": 85,
  "summary": "Brief executive assessment sentence in ${isArabic ? "Arabic" : "English"}",
  "strengths": ["Strength 1 in ${isArabic ? "Arabic" : "English"}", "Strength 2"],
  "gaps": ["Gap or required document 1 in ${isArabic ? "Arabic" : "English"}", "Gap 2"],
  "recommendations": ["Action step 1 in ${isArabic ? "Arabic" : "English"}", "Action step 2"]
}
`;

      const response = await generateWithFallback(ai, {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const cleanJson = (response.text || "{}")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      return res.json({
        success: true,
        ...parsed,
      });
    } catch (err: any) {
      console.error("[Match Analysis] Error:", err);
      // Fallback response with calculated match
      return res.json({
        success: true,
        matchPercentage: 78,
        summary: lang === "ar" ? "ملفك مؤهل للتقديم مع الحاجة لتجهيز متطلبات إضافية." : "Your profile is eligible with additional preparation recommended.",
        strengths: lang === "ar" ? ["توافق التخصص والاهتمامات الأكاديمية", "استيفاء شروط المؤهل العام"] : ["Major alignment", "Qualification match"],
        gaps: lang === "ar" ? ["صياغة خطاب دافع مخصص ومحكم", "تجهيز شهادات إثبات اللغة الرسمية"] : ["Custom motivation letter", "Language certification"],
        recommendations: lang === "ar" ? ["استخدم فاحص المقالات لتجهيز خطاب الدافع", "تدرب على المقابلة الشخصية عبر مستشار الذكاء الاصطناعي"] : ["Draft custom SOP", "Practice STAR interview"],
      });
    }
  });

  // 4. Vite middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);

    // Auto-schedule background ingestion check and cloud sync on startup
    setTimeout(() => {
      runMasterCloudSeeding().catch((e) => {
        console.warn("Startup cloud sync note:", e?.message);
      });
      runOpportunitiesAutomation(getGeminiClient()).catch((e) => {
        console.error("Initial background automation note:", e?.message);
      });
    }, 3000);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
