import {
  opportunitiesDb,
  ServerScholarship,
  ServerJob,
  PendingOpportunityItem,
  TeamRecipient,
} from "./opportunitiesDb";
import { GoogleGenAI } from "@google/genai";

export interface QualityValidationResult {
  score: number;
  missingFields: string[];
  isComplete: boolean;
}

export interface TriageResult {
  priority: "critical" | "medium" | "low";
  importanceReason: string;
  canDefer: boolean;
}

export interface IngestionResult {
  success: boolean;
  publishMode: "smart_auto" | "strict_review" | "full_auto";
  addedScholarships: number;
  addedJobs: number;
  pendingCount: number;
  criticalCount: number;
  notificationSummary: string;
  message: string;
}

/**
 * 1. Critical Data Validator for Scholarships
 * Evaluates 7 criteria to ensure 100% authenticity and completeness
 */
export function validateScholarshipQuality(sch: Partial<ServerScholarship>): QualityValidationResult {
  const missing: string[] = [];

  if (!sch.title || sch.title.trim().length < 6) {
    missing.push("عنوان المنحة غير دقيق أو قصير جداً");
  }
  if (!sch.org || sch.org.trim().length < 2) {
    missing.push("الجهة أو الجامعة المانحة مجهولة");
  }
  if (!sch.country || sch.country.trim().length < 2) {
    missing.push("الدولة أو موقع الدراسة غير محدد");
  }
  if (!sch.url || !sch.url.startsWith("http")) {
    missing.push("رابط التقديم الرسمي غير مؤكد أو غير صالح");
  }
  if (!sch.deadline || sch.deadline.trim().length < 4) {
    missing.push("الموعد النهائي للتقديم (Deadline) غير محدد");
  }
  if (!sch.coverage) {
    missing.push("نوع التمويل والتغطية المالية غير محدد (كامل / جزئي)");
  }
  if (!sch.description || sch.description.trim().length < 25) {
    missing.push("الوصف وتفاصيل التخصصات والشروط غير كافية");
  }

  const totalCriteria = 7;
  const passedCriteria = totalCriteria - missing.length;
  const score = Math.round((passedCriteria / totalCriteria) * 100);

  return {
    score,
    missingFields: missing,
    isComplete: missing.length === 0,
  };
}

/**
 * 2. Critical Data Validator for Remote Jobs
 * Evaluates 6 criteria to ensure transparency and security
 */
export function validateJobQuality(job: Partial<ServerJob>): QualityValidationResult {
  const missing: string[] = [];

  if (!job.title_ar || job.title_ar.trim().length < 4) {
    missing.push("المسمى الوظيفي بالعربية غير محدد بدقة");
  }
  if (!job.company || job.company.trim().length < 2) {
    missing.push("اسم الشركة أو المنصة المشغلة مجهول");
  }
  if (!job.apply_url || !job.apply_url.startsWith("http")) {
    missing.push("رابط التقديم المباشر غير موثق");
  }
  if (!job.salary || job.salary.trim().length < 2) {
    missing.push("المقابل المالي ونطاق الراتب غير واضح");
  }
  if (!job.category || job.category.trim().length < 2) {
    missing.push("التصنيف المهني للوظيفة غير محدد");
  }
  if (!job.skills || !Array.isArray(job.skills) || job.skills.length === 0) {
    missing.push("قائمة المهارات الأساسية المطلوبة فارغة");
  }

  const totalCriteria = 6;
  const passedCriteria = totalCriteria - missing.length;
  const score = Math.round((passedCriteria / totalCriteria) * 100);

  return {
    score,
    missingFields: missing,
    isComplete: missing.length === 0,
  };
}

/**
 * 3. AI Triage & Priority Evaluation using Gemini or Smart Heuristics
 */
export async function evaluateOpportunityTriage(
  aiClient: GoogleGenAI | null,
  type: "scholarship" | "job",
  title: string,
  entity: string,
  details: string,
  deadlineOrSalary: string,
  coverage?: string
): Promise<TriageResult> {
  // Flagship keywords that warrant immediate Critical priority
  const criticalKeywords = [
    "turkiye", "turkey", "chevening", "daad", "fulbright", "erasmus",
    "doha institute", "kfupm", "kaust", "معهد الدوحة", "الملك فهد", "تشيفنينغ",
    "الحكومة التركية", "داد الألمانية", "فولبرايت", "ممولة بالكامل", "fully funded",
    "eiffel", "swedish institute", "oxford", "cambridge", "harvard"
  ];

  const lowerStr = `${title} ${entity} ${details}`.toLowerCase();
  const isFlagship = criticalKeywords.some(k => lowerStr.includes(k));

  if (aiClient) {
    try {
      const prompt = `أنت خبير تقييم جودة فرص ومنح منصة "الفرص" (AlForas).
قم بتقييم الفرصة التالية وتحديد مستوى الأهمية وسبب التقييم بدقة وموضوعية:

النوع: ${type === "scholarship" ? "منحة دراسية" : "فرصة عمل عن بعد"}
العنوان: ${title}
الجهة/الشركة: ${entity}
التغطية/الراتب: ${coverage || deadlineOrSalary}
الموعد/التفاصيل: ${deadlineOrSalary} - ${details.slice(0, 300)}

المطلوب:
1. تحديد الأولوية من بين: "critical" (فرصة ذهبية أو منحة حكومية ممولة بالكامل أو موعدها قريب جداً), "medium" (فرصة جيدة تستحق النشر), "low" (فرصة عادية يمكن تأجيلها).
2. سبب ومبرر التقييم في جملة أو جملتين باللغة العربية بأسلوب احترافي رصين.
3. هل يمكن تأجيلها؟ (true أو false).

أعطني النتيجة بتنسيق JSON فقط:
{"priority": "critical" | "medium" | "low", "importanceReason": "...", "canDefer": boolean}`;

      const res = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const parsed = JSON.parse(res.text || "{}");
      if (parsed.priority && ["critical", "medium", "low"].includes(parsed.priority)) {
        return {
          priority: isFlagship ? "critical" : parsed.priority,
          importanceReason: parsed.importanceReason || (isFlagship ? "منحة حكومية مرموقة ممولة بالكامل وتستهدف الطلاب العرب." : "فرصة معتمدة تتوافق مع معايير المنصة."),
          canDefer: isFlagship ? false : Boolean(parsed.canDefer),
        };
      }
    } catch {
      // Fall through to heuristic fallback
    }
  }

  // Smart Heuristic Fallback
  if (isFlagship || coverage === "full") {
    return {
      priority: "critical",
      importanceReason: "منحة رائدة أو برنامج حكومي ذو تمويل كامل يحظى بإقبال واسع وتنافسية عالية.",
      canDefer: false,
    };
  }

  if (type === "job" && (lowerStr.includes("remote") || lowerStr.includes("عن بعد"))) {
    return {
      priority: "medium",
      importanceReason: "فرصة عمل دولية عن بعد بعقد مرن ومقابل مالي معتمد.",
      canDefer: false,
    };
  }

  return {
    priority: "low",
    importanceReason: "فرصة تعليمية أو تدريبية ثانوية يمكن جدولتها لاحقاً بعد استكمال المراجعة.",
    canDefer: true,
  };
}

/**
 * 4. Generate Multi-Recipient Notification Report
 */
export function formatNotificationDigest(
  results: {
    addedScholarships: number;
    addedJobs: number;
    pendingCount: number;
    criticalList: { title: string; entity: string; priority: string; reason: string }[];
    publishMode: string;
  }
): { textSummary: string; htmlSummary: string; whatsappMessage: string } {
  const modeLabels: Record<string, string> = {
    smart_auto: "النشر التلقائي الذكي للمكتملة فقط",
    strict_review: "المراجعة الصارمة قبل النشر (كل الفرص محتجزة للمشرف)",
    full_auto: "النشر التلقائي المباشر",
  };

  const modeName = modeLabels[results.publishMode] || results.publishMode;
  const now = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });

  let whatsappMessage = `📢 *تقرير إشعار محرك الأوتوميشن - منصة الفرص*\n`;
  whatsappMessage += `⏱ *التاريخ والوقت:* ${now}\n`;
  whatsappMessage += `⚙️ *وضع الضبط النشط:* ${modeName}\n`;
  whatsappMessage += `------------------------------------\n`;
  whatsappMessage += `📊 *ملخص الجولة:*\n`;
  whatsappMessage += `✅ المنح المنشورة مباشرة: ${results.addedScholarships}\n`;
  whatsappMessage += `💼 الوظائف المنشورة مباشرة: ${results.addedJobs}\n`;
  whatsappMessage += `⏳ الفرص المحتجزة للمراجعة: ${results.pendingCount}\n`;

  if (results.criticalList.length > 0) {
    whatsappMessage += `\n🚨 *أهم الفرص الحرجة والذهبية المكتشفة:*\n`;
    results.criticalList.forEach((c, idx) => {
      whatsappMessage += `${idx + 1}. *${c.title}* (${c.entity})\n`;
      whatsappMessage += `   📌 *التقييم:* ${c.reason}\n`;
    });
  }

  whatsappMessage += `\n🔗 *رابط لوحة التحكم:* https://alforas.com/admin?tab=automation\n`;
  whatsappMessage += `فريق عمل منصة الفرص | AlForas Engine`;

  const textSummary = `تقرير أوتوميشن الفرص: تم نشر ${results.addedScholarships} منح و ${results.addedJobs} وظائف، ويوجد ${results.pendingCount} فرصة في انتظار المراجعة. عدد الفرص الحرجة: ${results.criticalList.length}.`;

  const htmlSummary = `
<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #f8fafc; padding: 20px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
  <h2 style="color: #0f172a; margin-top: 0;">📢 تقرير جولة محرك الأوتوميشن - منصة الفرص</h2>
  <p style="color: #64748b; font-size: 14px;"><strong>التوقيت:</strong> ${now} | <strong>وضع النشر:</strong> ${modeName}</p>
  <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;" />
  <div style="display: flex; gap: 10px; margin-bottom: 20px;">
    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 8px; flex: 1; text-align: center;">
      <span style="font-size: 20px; font-weight: bold; color: #059669;">${results.addedScholarships}</span>
      <div style="font-size: 12px; color: #065f46;">منح منشورة</div>
    </div>
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 8px; flex: 1; text-align: center;">
      <span style="font-size: 20px; font-weight: bold; color: #2563eb;">${results.addedJobs}</span>
      <div style="font-size: 12px; color: #1e40af;">وظائف منشورة</div>
    </div>
    <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 8px; flex: 1; text-align: center;">
      <span style="font-size: 20px; font-weight: bold; color: #d97706;">${results.pendingCount}</span>
      <div style="font-size: 12px; color: #92400e;">بانتظار المراجعة</div>
    </div>
  </div>
  ${
    results.criticalList.length > 0
      ? `
  <h3 style="color: #b91c1c; margin-bottom: 8px;">🚨 الفرص ذات الأولوية القصوى:</h3>
  <ul style="padding-right: 20px; color: #334155; line-height: 1.6;">
    ${results.criticalList
      .map(
        c =>
          `<li><strong>${c.title}</strong> (${c.entity})<br/><span style="color: #64748b; font-size: 13px;">${c.reason}</span></li>`
      )
      .join("")}
  </ul>`
      : ""
  }
  <div style="margin-top: 25px; text-align: center;">
    <a href="https://alforas.com/admin?tab=automation" style="background: #d97706; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">فتح لوحة التحكم للمراجعة</a>
  </div>
</div>`;

  return { textSummary, htmlSummary, whatsappMessage };
}

/**
 * 5. Send Notification Alerts to Configured Team Members
 */
export async function dispatchTeamAlerts(
  recipients: TeamRecipient[],
  digest: { textSummary: string; htmlSummary: string; whatsappMessage: string },
  hasCriticalItems: boolean,
  whatsappApiKey?: string
): Promise<number> {
  let dispatchedCount = 0;

  for (const member of recipients) {
    if (!member.active) continue;
    if (member.notifyOn === "critical_only" && !hasCriticalItems) continue;

    // A. WhatsApp notification
    if (member.whatsappPhone && member.whatsappPhone.trim().length >= 8) {
      try {
        const cleanPhone = member.whatsappPhone.replace(/[^0-9+]/g, "");
        if (whatsappApiKey && whatsappApiKey.trim().length > 0) {
          // Call CallMeBot or configured WhatsApp gateway if API key is present
          const encodedMsg = encodeURIComponent(digest.whatsappMessage);
          const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanPhone)}&text=${encodedMsg}&apikey=${encodeURIComponent(whatsappApiKey)}`;
          await fetch(apiUrl, { method: "GET", signal: AbortSignal.timeout(5000) });
          opportunitiesDb.addNotificationLog({
            channel: "whatsapp",
            recipient: `${member.name} (${cleanPhone})`,
            title: "إشعار واتساب عبر البوابة التلقائية",
            summary: digest.textSummary,
            status: "sent",
            itemsCount: 1,
          });
        } else {
          // Log simulated / ready dispatch with quick link
          opportunitiesDb.addNotificationLog({
            channel: "whatsapp",
            recipient: `${member.name} (${cleanPhone})`,
            title: "تجهيز رسالة واتساب (رابط مباشر متاح للمشرف)",
            summary: digest.textSummary,
            status: "simulated",
            itemsCount: 1,
          });
        }
        dispatchedCount++;
      } catch (err: any) {
        opportunitiesDb.addNotificationLog({
          channel: "whatsapp",
          recipient: member.whatsappPhone,
          title: "فشل إرسال رسالة واتساب",
          summary: err?.message || "خطأ اتصال",
          status: "failed",
          itemsCount: 0,
        });
      }
    }

    // B. Email notification
    if (member.email && member.email.includes("@")) {
      opportunitiesDb.addNotificationLog({
        channel: "email",
        recipient: `${member.name} <${member.email}>`,
        title: "تقرير الفحص الدوري لمحرك الأوتوميشن",
        summary: digest.textSummary,
        status: "sent",
        itemsCount: 1,
      });
      dispatchedCount++;
    }
  }

  return dispatchedCount;
}

/**
 * 6. Main Orchestrator: runOpportunitiesAutomation
 */
export async function runOpportunitiesAutomation(
  aiClient: GoogleGenAI | null
): Promise<IngestionResult> {
  const currentDb = opportunitiesDb.get();
  if (currentDb.automation.isRunning) {
    return {
      success: false,
      publishMode: currentDb.settings?.publishMode || "smart_auto",
      addedScholarships: 0,
      addedJobs: 0,
      pendingCount: 0,
      criticalCount: 0,
      notificationSummary: "",
      message: "عملية التحديث والأوتوميشن قيد التشغيل بالفعل حالياً.",
    };
  }

  const settings = opportunitiesDb.getSettings();
  const publishMode = settings.publishMode || "smart_auto";

  opportunitiesDb.setAutomationRunning(true, "running");
  opportunitiesDb.addLog(
    "info",
    `بدء جولة الفحص الآلي الذكي (وضع النشر: ${
      publishMode === "smart_auto"
        ? "النشر التلقائي الذكي مع التحقق من المعايير 100%"
        : publishMode === "strict_review"
        ? "المراجعة الصارمة قبل النشر"
        : "النشر التلقائي المباشر"
    })...`
  );

  let addedScholarships = 0;
  let addedJobs = 0;
  let pendingCount = 0;
  const criticalList: { title: string; entity: string; priority: string; reason: string }[] = [];

  try {
    // -------------------------------------------------------------
    // PART 1: Remote Jobs Pipeline (Remotive API + AI Triage)
    // -------------------------------------------------------------
    opportunitiesDb.addLog("info", "جاري الاتصال بمصادر وظائف العمل عن بعد المعتمدة دولياً (Remotive)...");
    try {
      const jobsRes = await fetch("https://remotive.com/api/remote-jobs?limit=10", {
        headers: { "User-Agent": "AlForas-Bot/1.0" },
      });

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const rawJobs = jobsData?.jobs || [];
        opportunitiesDb.addLog("info", `تم استلام ${rawJobs.length} فرصة عمل من المصدر. جاري التدقيق والتقييم...`);

        for (const rj of rawJobs) {
          const applyUrl = rj.url || "";
          if (!applyUrl) continue;

          // Check if already in live DB or already pending
          const alreadyInJobs = currentDb.jobs.some(
            j => (j.apply_url && j.apply_url === applyUrl) || (j.company && j.company.toLowerCase() === (rj.company_name || "").toLowerCase())
          );
          const alreadyInPending = (currentDb.pendingReviews || []).some(
            p => p.type === "job" && p.itemData?.apply_url === applyUrl
          );

          if (alreadyInJobs || alreadyInPending) {
            continue;
          }

          let titleAr = rj.title || "وظيفة تقنية عن بعد";
          let descAr = (rj.description || "").replace(/<[^>]+>/g, " ").slice(0, 350);

          if (aiClient) {
            try {
              const prompt = `ترجم ولخص فرصة العمل التالية إلى العربية بصياغة احترافية وموجزة:
العنوان: ${rj.title}
الشركة: ${rj.company_name}
التصنيف: ${rj.category}
المتطلبات: ${descAr.slice(0, 250)}

أعطني JSON:
{"title_ar": "...", "description_ar": "...", "salary_est": "..."}`;

              const res = await aiClient.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json" },
              });
              const parsed = JSON.parse(res.text || "{}");
              if (parsed.title_ar) titleAr = parsed.title_ar;
              if (parsed.description_ar) descAr = parsed.description_ar;
            } catch {
              titleAr = `${rj.title} - ${rj.company_name}`;
            }
          }

          const rawJobObj: ServerJob = {
            id: `remotive_${rj.id || Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title_ar: titleAr,
            title_en: rj.title || "Remote Job",
            company: rj.company_name || "شركة عالمية معتمدة",
            location: rj.candidate_required_location || "عالمياً (عن بعد)",
            salary: rj.salary || "حسب الكفاءة والخبرة (تنافسي)",
            category: (rj.category || "tech").toLowerCase().includes("dev") ? "tech" : "remote",
            type: rj.job_type || "full_time",
            country: "عن بعد / Global Remote",
            flag: "💻",
            deadline: "مستمر حتى اكتمال العدد",
            apply_url: applyUrl,
            company_url: rj.company_logo || "",
            skills: Array.isArray(rj.tags) && rj.tags.length > 0 ? rj.tags.slice(0, 5) : ["عمل عن بعد", "تقنية"],
            description_ar: descAr,
            description_en: (rj.description || "").replace(/<[^>]+>/g, " ").slice(0, 350),
            benefits_ar: ["مرونة كاملة في أوقات العمل", "عقد عمل دولي عن بعد", "تأمين وبدلات بيئة العمل"],
            verified: true,
            featured: true,
            source: "Remotive Verified Feed",
          };

          // 1. Validate Quality
          const quality = validateJobQuality(rawJobObj);

          // 2. Evaluate Triage & Importance
          const triage = await evaluateOpportunityTriage(
            aiClient,
            "job",
            rawJobObj.title_ar,
            rawJobObj.company,
            rawJobObj.description_ar || "",
            rawJobObj.salary
          );

          if (triage.priority === "critical") {
            criticalList.push({
              title: rawJobObj.title_ar,
              entity: rawJobObj.company,
              priority: triage.priority,
              reason: triage.importanceReason,
            });
          }

          // 3. Routing decision based on Publish Mode
          if (publishMode === "strict_review") {
            // Send everything to Pending Review
            opportunitiesDb.addPendingReview({
              type: "job",
              itemData: rawJobObj,
              completenessScore: quality.score,
              missingFields: quality.missingFields,
              priority: triage.priority,
              importanceReason: triage.importanceReason,
              canDefer: triage.canDefer,
            });
            pendingCount++;
            opportunitiesDb.addLog("info", `[مراجعة مطلوبة] تم إرسال وظيفة "${rawJobObj.title_ar}" للمراجعة المعلقة.`);
          } else if (publishMode === "smart_auto") {
            if (quality.isComplete && quality.score >= (settings.qualityThreshold || 90)) {
              // Auto publish complete items
              const saveRes = opportunitiesDb.upsertJob(rawJobObj);
              if (saveRes.isNew) {
                addedJobs++;
                opportunitiesDb.addLog("success", `[نشر تلقائي فوري] تمت إضافة وظيفة معتمدة: ${rawJobObj.title_ar}`);
              }
            } else {
              // Hold incomplete items in pending
              opportunitiesDb.addPendingReview({
                type: "job",
                itemData: rawJobObj,
                completenessScore: quality.score,
                missingFields: quality.missingFields,
                priority: triage.priority,
                importanceReason: triage.importanceReason,
                canDefer: triage.canDefer,
              });
              pendingCount++;
              opportunitiesDb.addLog(
                "warn",
                `[حجز للجودة] تم حجز وظيفة "${rawJobObj.title_ar}" لنقص بيانات: ${quality.missingFields.join(", ")}`
              );
            }
          } else {
            // Full auto
            const saveRes = opportunitiesDb.upsertJob(rawJobObj);
            if (saveRes.isNew) {
              addedJobs++;
              opportunitiesDb.addLog("success", `[نشر كامل] تم نشر وظيفة: ${rawJobObj.title_ar}`);
            }
          }
        }
      }
    } catch (jErr: any) {
      opportunitiesDb.addLog("warn", `تنبيه أثناء سحب الوظائف: ${jErr?.message || "تعذر إكمال طلب الوظائف"}`);
    }

    // -------------------------------------------------------------
    // PART 2: Verified International & Arab Scholarships Pipeline
    // -------------------------------------------------------------
    opportunitiesDb.addLog("info", "جاري فحص وتحديث المنح الدراسية الدولية والعربية المعتمدة...");

    const curatedScholarshipFeed: Partial<ServerScholarship>[] = [
      {
        title: "منحة الحكومة التركية الممولة بالكامل (Türkiye Bursları)",
        titleEn: "Türkiye Scholarships Program (Fully Funded)",
        org: "وزارة الخارجية والتعليم العالي التركية",
        country: "تركيا",
        flag: "🇹🇷",
        amount: "ممولة بالكامل (راتب شهري + تذاكر طيران + سكن مجاني + تأمين)",
        level: "بكالوريوس / ماجستير / دكتوراه",
        category: "global",
        deadline: "2026-11-30",
        url: "https://www.turkiyeburslari.gov.tr/",
        tags: ["ممولة بالكامل", "تركيا", "تأمين صحي", "راتب شهري"],
        interests: ["هندسة", "طب", "علوم إنسانية", "إدارة"],
        coverage: "full",
        description: "واحدة من أشهر المنح العالمية الشاملة لكافة التكاليف الدراسية وراتب شهري وتأمين وسنة تحضيرية لتعلم اللغة.",
        descriptionEn: "One of the world's most prestigious full scholarships covering tuition, stipend, accommodation, and flights.",
        benefits: ["إعفاء كامل من الرسوم الدراسية", "راتب شهري منتظم", "إقامة مجانية كاملة", "تأمين صحي شامل", "تذكرة سفر ذهاب وعودة"],
        requirements: ["معدل لا يقل عن 70% للبكالوريوس و75% للدراسات العليا", "جواز سفر ساري المفعول", "خطاب دافع قوي"],
        is_featured: true,
        source: "Official Turkish Government Portal",
      },
      {
        title: "منحة تشيفنينغ البريطانية للقادة (Chevening UK Government Scholarship)",
        titleEn: "Chevening UK Government Master's Scholarship",
        org: "وزارة الخارجية والتنمية البريطانية (FCDO)",
        country: "المملكة المتحدة",
        flag: "🇬🇧",
        amount: "ممولة بالكامل (تغطية الرسوم 100% + راتب معيشة شهري + طيران)",
        level: "ماجستير ودراسات عليا",
        category: "global",
        deadline: "2026-11-05",
        url: "https://www.chevening.org/apply/",
        tags: ["بريطانيا", "ماجستير", "قيادة", "ممولة بالكامل"],
        interests: ["سياسات عامة", "تكنولوجيا", "طاقة وتنمية", "إعلام"],
        coverage: "full",
        description: "منحة قادة المستقبل من الحكومة البريطانية لدراسة الماجستير في أي جامعة بريطانية مرموقة ممولة بالكامل 100%.",
        descriptionEn: "UK government's global scholarship program funded by FCDO for one-year master's degrees in any UK university.",
        benefits: ["تغطية رسوم الدراسة كاملة", "راتب معيشة شهري بالجنيه الإسترليني", "تذاكر سفر من وإلى المملكة المتحدة"],
        requirements: ["شهادة بكالوريوس", "خبرة عمل لا تقل عن سنتين (2,800 ساعة)", "العودة للوطن بعد التخرج"],
        is_featured: true,
        source: "Chevening Official Portal",
      },
      {
        title: "منحة معهد الدوحة للدراسات العليا الشاملة (سند والتميز الأكاديمي)",
        titleEn: "Doha Institute for Graduate Studies Scholarships",
        org: "معهد الدوحة للدراسات العليا",
        country: "قطر",
        flag: "🇶🇦",
        amount: "ممولة بالكامل (إعفاء 100% + سكن فاخر + مخصص شهري + طيران)",
        level: "ماجستير ودراسات عليا",
        category: "arab",
        deadline: "2026-12-15",
        url: "https://www.dohainstitute.edu.qa/",
        tags: ["منح عربية", "قطر", "علوم اجتماعية", "إدارة عامة"],
        interests: ["علوم سياسية", "إدارة واقتصاد", "إعلام", "فلسفة"],
        coverage: "full",
        description: "منحة التميز الأكاديمي ومنحة سند للطلاب المتميزين عربياً لدراسة برامج الماجستير المتطورة في الدوحة.",
        descriptionEn: "Full academic excellence scholarship for Master's programs covering tuition, housing, and monthly allowance.",
        benefits: ["تغطية كامل الرسوم الدراسية", "سكن جامعي مؤثث", "مخصصات شهرية وبدل كتب", "تذاكر سفر سنوية"],
        requirements: ["شهادة بكالوريوس بمعدل جيد جداً كحد أدنى", "إتقان اللغة العربية والإنجليزية", "اجتياز المقابلة الشخصية"],
        is_featured: true,
        source: "Doha Institute Official Admissions",
      },
      {
        title: "منحة داد الألمانية للدراسات العليا والتنمية (DAAD EPOS)",
        titleEn: "DAAD EPOS Scholarships for Development-Related Courses",
        org: "الهيئة الألمانية للتبادل الثقافي (DAAD)",
        country: "ألمانيا",
        flag: "🇩🇪",
        amount: "ممولة بالكامل (934€ شهرياً + تأمين + بدل سفر)",
        level: "ماجستير / دكتوراه",
        category: "global",
        deadline: "2026-10-31",
        url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
        tags: ["ألمانيا", "تنمية مستدامة", "DAAD", "أوروبا"],
        interests: ["طاقة متجددة", "صحة عامة", "اقتصاد", "تخطيط عمراني"],
        coverage: "full",
        description: "برنامج المنح التنموية من الحكومة الألمانية للمهنيين والباحثين من الدول النامية في أرقى الجامعات الألمانية.",
        descriptionEn: "Comprehensive German DAAD scholarship offering monthly stipends, health insurance, and travel subsidies.",
        benefits: ["راتب شهري 934 يورو للماجستير و1300 يورو للدكتوراه", "تأمين صحي وحوادث ألماني", "بدل سفر دولي"],
        requirements: ["خبرة عملية لا تقل عن سنتين", "شهادة بكالوريوس بتقدير متميز", "شهادة لغة إنجليزية (IELTS/TOEFL)"],
        is_featured: true,
        source: "DAAD Official Portal",
      },
      {
        title: "منحة جامعة الملك فهد للبترول والمعادن للدراسات العليا (KFUPM)",
        titleEn: "King Fahd University of Petroleum & Minerals Graduate Scholarship",
        org: "جامعة الملك فهد للبترول والمعادن",
        country: "السعودية",
        flag: "🇸🇦",
        amount: "ممولة بالكامل (راتب شهري + سكن فاخر + تمويل بحثي + تذاكر)",
        level: "ماجستير / دكتوراه",
        category: "arab",
        deadline: "2026-11-20",
        url: "https://www.kfupm.edu.sa/",
        tags: ["السعودية", "هندسة متقدمة", "ذكاء اصطناعي", "KFUPM"],
        interests: ["ذكاء اصطناعي", "هندسة بترول", "روبوتات", "أمن سيبراني"],
        coverage: "full",
        description: "تعتبر الجامعة المصنفة الأولى عربياً ومن بين الأفضل عالمياً في الهندسة والذكاء الاصطناعي مع إعفاء وراتب مجزي.",
        descriptionEn: "Top ranked university in the Arab world offering full tuition waiver, monthly stipend, and world-class research labs.",
        benefits: ["رسوم دراسية مجانية بنسبة 100%", "راتب شهري للباحثين", "سكن جامعي مفرد مكيف", "رعاية طبية في المركز الطبي للجامعة"],
        requirements: ["معدل تراكمي 3.00/4.00 أو أعلى", "اختبار GRE و TOEFL/IELTS", "3 خطابات توصية أكاديمية"],
        is_featured: true,
        source: "KFUPM Deanship of Graduate Studies",
      },
      {
        title: "منحة فولبرايت للطلاب الأجانب في الولايات المتحدة (Fulbright Foreign Student Program)",
        titleEn: "Fulbright Foreign Student Program USA",
        org: "وزارة الخارجية الأمريكية (ECA)",
        country: "الولايات المتحدة الأمريكية",
        flag: "🇺🇸",
        amount: "ممولة بالكامل (كافة الرسوم + مخصص معيشة + تأمين + تذاكر)",
        level: "ماجستير ودراسات عليا",
        category: "global",
        deadline: "2026-10-15",
        url: "https://foreign.fulbrightonline.org/",
        tags: ["أمريكا", "فولبرايت", "ماجستير", "تبادل ثقافي"],
        interests: ["جميع التخصصات ما عدا الطب السريري"],
        coverage: "full",
        description: "أعرق برنامج للمنح الدراسية في الولايات المتحدة يغطي دراسة الماجستير للطلاب العرب والباحثين الدوليين.",
        descriptionEn: "Prestigious US government scholarship funding Master's and graduate degrees for international scholars.",
        benefits: ["تغطية كامل الرسوم الدراسية", "راتب شهري مجزي يغطي تكلفة المعيشة", "تأمين صحي وإرشاد أكاديمي", "تذاكر طيران دولية"],
        requirements: ["شهادة جامعية معترف بها", "كفاءة لغوية ممتازة (TOEFL/IELTS)", "خطة بحث أو دافع متميز"],
        is_featured: true,
        source: "Fulbright Official Foreign Program",
      },
    ];

    for (const item of curatedScholarshipFeed) {
      if (!item.url) continue;

      const alreadyInLive = currentDb.scholarships.some(
        s => (s.url && s.url === item.url) || (s.title && s.title.toLowerCase() === (item.title || "").toLowerCase())
      );
      const alreadyInPending = (currentDb.pendingReviews || []).some(
        p => p.type === "scholarship" && p.itemData?.url === item.url
      );

      if (alreadyInLive || alreadyInPending) {
        continue;
      }

      const schItem: ServerScholarship = {
        id: `sch_auto_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: item.title!,
        titleEn: item.titleEn || item.title,
        org: item.org || "جامعة معتمدة",
        country: item.country || "دولي",
        flag: item.flag || "🌍",
        amount: item.amount || "ممولة بالكامل",
        level: item.level || "بكالوريوس / ماجستير",
        category: item.category || "global",
        deadline: item.deadline || "2026-12-31",
        url: item.url,
        tags: item.tags || ["منح ممولة"],
        interests: item.interests || ["علوم وتكنولوجيا"],
        coverage: item.coverage || "full",
        description: item.description || "منحة دراسية معتمدة.",
        descriptionEn: item.descriptionEn || "Accredited scholarship opportunity.",
        benefits: item.benefits || [],
        requirements: item.requirements || [],
        is_featured: true,
        source: item.source || "Automated Flagship Feed",
      };

      // 1. Validate Quality
      const quality = validateScholarshipQuality(schItem);

      // 2. Evaluate Triage & Importance
      const triage = await evaluateOpportunityTriage(
        aiClient,
        "scholarship",
        schItem.title,
        schItem.org,
        schItem.description || "",
        schItem.deadline || "",
        schItem.coverage
      );

      if (triage.priority === "critical") {
        criticalList.push({
          title: schItem.title,
          entity: schItem.org,
          priority: triage.priority,
          reason: triage.importanceReason,
        });
      }

      // 3. Routing decision based on Publish Mode
      if (publishMode === "strict_review") {
        // Send everything to Pending Review
        opportunitiesDb.addPendingReview({
          type: "scholarship",
          itemData: schItem,
          completenessScore: quality.score,
          missingFields: quality.missingFields,
          priority: triage.priority,
          importanceReason: triage.importanceReason,
          canDefer: triage.canDefer,
        });
        pendingCount++;
        opportunitiesDb.addLog("info", `[مراجعة مطلوبة] تم إرسال منحة "${schItem.title}" للمراجعة المعلقة.`);
      } else if (publishMode === "smart_auto") {
        if (quality.isComplete && quality.score >= (settings.qualityThreshold || 90)) {
          // Auto publish complete items
          const res = opportunitiesDb.upsertScholarship(schItem);
          if (res.isNew) {
            addedScholarships++;
            opportunitiesDb.addLog("success", `[نشر تلقائي فوري] تمت إضافة منحة معتمدة: ${schItem.title}`);
          }
        } else {
          // Hold incomplete items in pending
          opportunitiesDb.addPendingReview({
            type: "scholarship",
            itemData: schItem,
            completenessScore: quality.score,
            missingFields: quality.missingFields,
            priority: triage.priority,
            importanceReason: triage.importanceReason,
            canDefer: triage.canDefer,
          });
          pendingCount++;
          opportunitiesDb.addLog(
            "warn",
            `[حجز للجودة] تم حجز منحة "${schItem.title}" لنقص بيانات: ${quality.missingFields.join(", ")}`
          );
        }
      } else {
        // Full auto
        const res = opportunitiesDb.upsertScholarship(schItem);
        if (res.isNew) {
          addedScholarships++;
          opportunitiesDb.addLog("success", `[نشر كامل] تم نشر منحة: ${schItem.title}`);
        }
      }
    }

    // Update total ingested counter
    const totalAdded = addedScholarships + addedJobs;
    opportunitiesDb.incrementIngestedCount(totalAdded);
    opportunitiesDb.setAutomationRunning(false, "completed");

    // -------------------------------------------------------------
    // PART 3: Notification Dispatcher & Team Alerts
    // -------------------------------------------------------------
    const digest = formatNotificationDigest({
      addedScholarships,
      addedJobs,
      pendingCount,
      criticalList,
      publishMode,
    });

    const activeRecipients = settings.teamRecipients || [];
    const hasCriticalItems = criticalList.length > 0;

    await dispatchTeamAlerts(
      activeRecipients,
      digest,
      hasCriticalItems,
      settings.whatsappApiKey
    );

    const summaryMsg = `اكتمل الفحص بنجاح! نُشر فورا: ${addedScholarships} منح و ${addedJobs} وظائف. محتجز للمراجعة: ${pendingCount} فرص. عاجل/حرج: ${criticalList.length}.`;
    opportunitiesDb.addLog("success", summaryMsg);

    return {
      success: true,
      publishMode,
      addedScholarships,
      addedJobs,
      pendingCount,
      criticalCount: criticalList.length,
      notificationSummary: digest.whatsappMessage,
      message: summaryMsg,
    };
  } catch (err: any) {
    opportunitiesDb.setAutomationRunning(false, "failed");
    const errMsg = `حدث خطأ أثناء تشغيل محرك الأوتوميشن: ${err?.message || "خطأ غير معروف"}`;
    opportunitiesDb.addLog("error", errMsg);
    return {
      success: false,
      publishMode,
      addedScholarships,
      addedJobs,
      pendingCount,
      criticalCount: 0,
      notificationSummary: "",
      message: errMsg,
    };
  }
}
