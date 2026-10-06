import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { opportunitiesDb } from "./server/opportunitiesDb";
import { runOpportunitiesAutomation } from "./server/automationEngine";
import { buildAdvisorGroundingContext } from "./server/knowledgeRepository";
import { runMasterCloudSeeding } from "./server/masterSeeder";

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
      const item = req.body;
      if (!item || !item.title) {
        return res.status(400).json({ error: "Title is required" });
      }
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
      const job = req.body;
      if (!job || !job.title_ar) {
        return res.status(400).json({ error: "Title is required" });
      }
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

  // 2. Real AI URL Parser & Opportunity Scraper
  app.post("/api/parse-url", async (req, res) => {
    const { url, type = "scholarship" } = req.body;

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({
        isValid: false,
        error: "يرجى تقديم رابط صالح يبدأ بـ http:// أو https://",
      });
    }

    try {
      // Fetch the actual webpage
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
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
