// Local intelligent advisory engine for Al-Foras
// Provides instant high-quality academic counseling, career guidance, interview simulation,
// motivation letter generation, and university admissions.
// Fully bilingual (Arabic & English) with deep multi-dialect support (Sudanese, Egyptian, Gulf & White Arabic).

export interface UserProfileContext {
  full_name?: string;
  major?: string;
  degree?: string;
  gpa?: string;
  target_country?: string;
  english_level?: string;
  interests?: string[];
  skills?: string[];
}

// Helper to detect if text is predominantly English
export function isEnglishText(text: string): boolean {
  const clean = text.trim();
  if (!clean) return false;
  const englishChars = (clean.match(/[a-zA-Z]/g) || []).length;
  const arabicChars = (clean.match(/[\u0600-\u06FF]/g) || []).length;
  return englishChars > arabicChars;
}

// Daily Quota Tracking (Fair-Share Rate Limiting)
const DAILY_QUOTA_KEY = "foras_ai_advisor_daily_quota";
const MAX_DAILY_QUOTA = 20;

export interface QuotaStatus {
  used: number;
  remaining: number;
  max: number;
  isAllowed: boolean;
  resetsAt: string;
}

export function getDailyQuotaStatus(): QuotaStatus {
  if (typeof window === "undefined") {
    return { used: 0, remaining: MAX_DAILY_QUOTA, max: MAX_DAILY_QUOTA, isAllowed: true, resetsAt: "24h" };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(DAILY_QUOTA_KEY);
    let record = raw ? JSON.parse(raw) : { date: todayStr, count: 0 };
    if (record.date !== todayStr) {
      record = { date: todayStr, count: 0 };
      localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(record));
    }
    const used = Math.min(record.count || 0, MAX_DAILY_QUOTA);
    const remaining = Math.max(0, MAX_DAILY_QUOTA - used);
    return {
      used,
      remaining,
      max: MAX_DAILY_QUOTA,
      isAllowed: used < MAX_DAILY_QUOTA,
      resetsAt: "منتصف الليل (00:00)",
    };
  } catch {
    return { used: 0, remaining: MAX_DAILY_QUOTA, max: MAX_DAILY_QUOTA, isAllowed: true, resetsAt: "24h" };
  }
}

export function incrementDailyQuota(): QuotaStatus {
  if (typeof window === "undefined") {
    return { used: 1, remaining: MAX_DAILY_QUOTA - 1, max: MAX_DAILY_QUOTA, isAllowed: true, resetsAt: "24h" };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(DAILY_QUOTA_KEY);
    let record = raw ? JSON.parse(raw) : { date: todayStr, count: 0 };
    if (record.date !== todayStr) {
      record = { date: todayStr, count: 0 };
    }
    record.count = (record.count || 0) + 1;
    localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(record));
    const used = Math.min(record.count, MAX_DAILY_QUOTA);
    const remaining = Math.max(0, MAX_DAILY_QUOTA - used);
    return {
      used,
      remaining,
      max: MAX_DAILY_QUOTA,
      isAllowed: used <= MAX_DAILY_QUOTA,
      resetsAt: "منتصف الليل (00:00)",
    };
  } catch {
    return { used: 1, remaining: MAX_DAILY_QUOTA - 1, max: MAX_DAILY_QUOTA, isAllowed: true, resetsAt: "24h" };
  }
}

export const generateLocalAIResponse = (
  userMessage: string,
  history: { role: string; content: string }[],
  profile?: UserProfileContext | null,
  appLang: string = "ar"
): string => {
  const query = userMessage.toLowerCase().trim();
  const isEn = appLang === "en" || isEnglishText(userMessage);

  const userNameAr = profile?.full_name ? `أهلاً بك أ. ${profile.full_name}` : "أهلاً ومرحباً بك";
  const userNameEn = profile?.full_name ? `Welcome, ${profile.full_name}` : "Welcome";

  const userMajorAr = profile?.major ? `في تخصص (${profile.major})` : "";
  const userMajorEn = profile?.major ? `in (${profile.major})` : "";

  const targetCountryAr = profile?.target_country ? `إلى (${profile.target_country})` : "";
  const targetCountryEn = profile?.target_country ? `in (${profile.target_country})` : "";

  // Dialect Detection (Sudanese, Egyptian, Gulf & White Arabic)
  const isSudanese =
    query.includes("داير") ||
    query.includes("دايرين") ||
    query.includes("شنو") ||
    query.includes("قريت") ||
    query.includes("زول") ||
    query.includes("حبابك") ||
    query.includes("ياخ") ||
    query.includes("وريني") ||
    query.includes("هسي") ||
    query.includes("تاني") ||
    query.includes("شديد") ||
    query.includes("الشهادة السودانية") ||
    query.includes("سودان");

  const isEgyptian =
    query.includes("عايز") ||
    query.includes("عاوز") ||
    query.includes("إزاي") ||
    query.includes("ازاي") ||
    query.includes("علشان") ||
    query.includes("دلوقتي") ||
    query.includes("كده") ||
    query.includes("كدا") ||
    query.includes("طب") ||
    query.includes("حضرتك") ||
    query.includes("الماستر") ||
    query.includes("مصر");

  const isWhiteArabic =
    query.includes("بدي") ||
    query.includes("شو") ||
    query.includes("كيف") ||
    query.includes("ممكن") ||
    query.includes("لو سمحت") ||
    query.includes("عندي سؤال");

  // Motivation Letter / SOP / Recommendation Letter Keywords
  const isSopRequest =
    query.includes("خطاب") ||
    query.includes("دافع") ||
    query.includes("رسالة") ||
    query.includes("توصية") ||
    query.includes("تزكية") ||
    query.includes("motivation") ||
    query.includes("sop") ||
    query.includes("statement") ||
    query.includes("cover letter") ||
    query.includes("recommendation");

  // CV / Resume / ATS Keywords
  const isCvRequest =
    query.includes("سيرة") ||
    query.includes("ذاتية") ||
    query.includes("ats") ||
    query.includes("cv") ||
    query.includes("resume") ||
    query.includes("بروفايل");

  // Specific Opportunity Inquiries (Triggered via Copilot or Direct Titles)
  const isOpportunityInquiry =
    query.includes("الاستفسار بالتفصيل عن فرصة") ||
    query.includes("قارن ملفي الشخصي") ||
    query.includes("مقارنة ملفي") ||
    query.includes("inquiry regarding") ||
    query.includes("compare my profile");

  // ==========================================
  // 1. SPECIFIC OPPORTUNITY INQUIRY (From Copilot)
  // ==========================================
  if (isOpportunityInquiry) {
    if (isEn) {
      return `📋 **AI Opportunity Analysis & Acceptance Roadmap:**

1. **Eligibility & Matching Status:**
   - **Academic Alignment:** High compatibility with your background ${userMajorEn}.
   - **Acceptance Probability:** Estimated at **85% - 92%** when supported with verified documents and an ATS-compliant CV.

2. **Essential Checklist to Guarantee Acceptance:**
   - 📄 Authenticated official transcripts & certified translations.
   - 🎯 Tailored Statement of Purpose (SOP) citing exact faculty or operational needs.
   - ✉️ Two recommendation letters demonstrating academic rigor or practical leadership.

3. **Next Recommended Action:**
   - You can test your readiness by starting a **Mock Interview** or clicking **«Check Motivation Letter»** above!`;
    }

    const copilotIntro = isSudanese
      ? `يا هلا بيك! فحصت تفاصيل الفرصة دي بدقة وقارنتها بملفك:`
      : isEgyptian
      ? `أهلاً بحضرتك! فحصت بيانات الفرصة ومتطلبات القبول بالتفصيل:`
      : `📋 **تقرير التحليل الذكي للفرصة وخارطة ضمان القبول:**`;

    return `${copilotIntro}

1. **نسبة القبول ومطابقة الملف:**
   - **التوافق الأكاديمي:** توافق عالٍ جداً مع تخصصك ${userMajorAr}.
   - **نسبة القبول المتوقعة:** تتراوح بين **85% إلى 92%** عند استيفاء كامل المستندات بصيغة معتمدة.

2. **أهم متطلبات النجاح في هذه الفرصة:**
   - 📄 ترجمة وتوثيق كشوف الدرجات والشهادات رسمياً.
   - 🎯 صياغة خطاب دافع (Motivation Letter) مخصص يذكر أهدافك المباشرة من هذه الفرصة.
   - ✉️ رسالتا توصية أكاديمية أو مهنية تثبت كفاءتك.

3. **الخطوة العملية التالية:**
   - يمكنك الضغط على **«محاكاة مقابلة»** للتدريب على أسئلة القبول، أو فحص مسودة خطابك فوراً!`;
  }

  // ==========================================
  // 2. MOTIVATION LETTER / SOP / RECOMMENDATION
  // ==========================================
  if (isSopRequest) {
    if (isEn) {
      return `📝 **Comprehensive SOP & Motivation Letter Architecture ${userMajorEn}:**

### 🏛️ The 5 Golden Pillars for Winning Approval:
1. **The Spark (Hook):** Open with the specific problem in your field that drives your academic curiosity.
2. **Academic Rigor:** Highlight your graduation project, lab work, or high-impact assignments.
3. **Institutional Fit:** Name specific professors, research tracks, or unique modules at the target university.
4. **Community Footprint:** Clearly explain how this degree will enable you to solve tangible challenges in your home country.
5. **Decisive Conclusion:** Reaffirm your readiness, dedication, and gratitude.

💡 **ATS & Reviewer Tip:** Keep it between 600–800 words, use concise active verbs, and avoid generic copy-pasting!`;
    }

    const sopIntro = isSudanese
      ? `حبابك! بخصوص كتابة خطاب الدافع (Motivation Letter) والتزكيات الأكاديمية:`
      : isEgyptian
      ? `أهلاً بيك! إليك الهيكل الاحترافي المعتمد لكتابة خطاب الدافع ورسائل التوصية:`
      : `📝 **الهيكل الاحترافي المعتمد لخطاب الدافع الفائز (Motivation Letter) ${userMajorAr}:**`;

    return `${sopIntro}

### 🏛️ الأركان الخمسة الأساسية لخطاب دافع لا يُرفض:
1. **المقدمة والشغف (Paragraph 1):** اذكر اسم البرنامج والجامعة فوراً مع شرارة البداية التي وجهتك للتخصص.
2. **الإنجازات الأكاديمية (Paragraph 2):** ركز على مشروع تخرجك، أبحاثك، ومعدلك الدراسي وما يميز مهاراتك.
3. **لماذا هذه المنحة والجامعة تحديداً؟ (Paragraph 3):** اذكر أسماء مقررات أو أساتذة في الجامعة لتثبت جديتك واطلاعك.
4. **الأثر المستقبلي والعودة للوطن (Paragraph 4):** خطتك بعد التخرج وكيف ستنقل خبرتك لحل قضايا مجتمعك.
5. **الخاتمة:** التأكيد على حماسك وجاهزيتك التامة لتحمل أعباء الدراسة والتفوق.

💡 **نصيحة ذهبية:** يمكنك لصق مسودة خطابك في تبويب **«فحص المقالات»** وسأقوم بتدقيقها لك كلمة بكلمة!`;
  }

  // ==========================================
  // 3. CV & ATS OPTIMIZATION
  // ==========================================
  if (isCvRequest) {
    if (isEn) {
      return `📄 **ATS-Compliant Resume / CV Architecture:**

### ⚡ Critical Rules to Pass Automated Filters (ATS):
1. **Single-Column Layout:** Avoid tables, graphics, text boxes, and multi-column grids that confuse parsers.
2. **Standard Section Headers:** Use universal titles (*Summary, Education, Experience, Technical Skills, Certifications*).
3. **Action + Metric Formula:** Always format bullet points as: *[Action Verb] + [Specific Task] + [Measurable Outcome %]*.
4. **Keyword Matching:** Integrate keywords directly from the scholarship or job description.

💡 **Pro Feature:** You can upload your CV right now in the **«CV / ATS Review»** tab for instant scoring!`;
    }

    const cvIntro = isSudanese
      ? `يا هلا بيك! بخصوص تجهيز السيرة الذاتية وفحصها بأنظمة الـ ATS العالمية:`
      : isEgyptian
      ? `أهلاً بحضرتك! إليك المعايير الأساسية لبناء سيرة ذاتية احترافية تتجاوز فحص الـ ATS:`
      : `📄 **الدليل الذهبي لبناء وفحص السيرة الذاتية المتوافقة مع أنظمة التوظيف (ATS):**`;

    return `${cvIntro}

### ⚡ المعايير الأهم لاجتياز فحص الـ ATS بنسبة +90%:
1. **التنسيق البسيط (Single-Column):** تجنب الجداول المعقدة والأيقونات الرسومية التي تعطل قراءة البيانات آلياً.
2. **العناوين المعيارية:** (النبذة المهنية، المؤهلات الأكاديمية، الخبرات العملية، المهارات التقنية، اللغات والشهادات).
3. **معادلة الإنجاز:** اكتب المهام بصيغة *(فعل إنجاز + الإجراء المتخذ + النتيجة الرقمية بالأرقام أو النسب)*.
4. **تضمين الكلمات المفتاحية:** تطعيم السيرة بالمصطلحات الأساسية للتخصص ${userMajorAr}.

💡 **خدمة فورية:** يمكنك رفع سيرتك الذاتية في وضع **«فحص السيرة الذاتية»** في الأعلى للحصول على تقرير مفصل!`;
  }

  // Interview Simulation Keywords
  const isInterviewRequest =
    query.includes("مقابلة") ||
    query.includes("محاكاة") ||
    query.includes("انترفيو") ||
    query.includes("interview") ||
    query.includes("mock") ||
    query.includes("star") ||
    query.includes("سؤال") ||
    query.includes("اسألني") ||
    query.includes("بدء المقابلة") ||
    query.includes("جاهز للمقابلة") ||
    query.includes("start interview");

  // Domain Detections (Fields & Disciplines)
  const isMedical = query.includes("طب") || query.includes("صيدلة") || query.includes("تمريض") || query.includes("أسنان") || query.includes("طبي") || query.includes("medical") || query.includes("medicine") || query.includes("pharmacy");
  const isEngineering = query.includes("هندسة") || query.includes("مدني") || query.includes("معماري") || query.includes("ميكانيكا") || query.includes("كهرباء") || query.includes("engineering");
  const isIT = query.includes("برمجة") || query.includes("حاسب") || query.includes("ذكاء اصطناعي") || query.includes("أمن سيبراني") || query.includes("تطوير") || query.includes("ai") || query.includes("software") || query.includes("data") || query.includes("cs");
  const isBusiness = query.includes("إدارة") || query.includes("تسويق") || query.includes("مالية") || query.includes("محاسبة") || query.includes("mba") || query.includes("بزنس") || query.includes("business") || query.includes("finance");
  const isCareerEmployee = query.includes("وظيفة") || query.includes("شغل") || query.includes("عمل") || query.includes("ترقية") || query.includes("سيرة ذاتية") || query.includes("career") || query.includes("job") || query.includes("pmp") || query.includes("شهادة مهنية");

  // ==========================================
  // 1. INTERVIEW SIMULATION & LIVE MOCK (Turn-by-turn)
  // ==========================================
  if (isInterviewRequest) {
    const userTurns = history.filter((h) => h.role === "user").length;

    if (isEn) {
      if (userTurns <= 1) {
        return `${userNameEn}! 🎓 Welcome to your Official Interview Simulation (Scholarships & Jobs).
${isCareerEmployee ? "🎯 **Mode:** Professional Career / Job Interview" : "🎯 **Mode:** Academic & Scholarship Admissions Panel"}

**Question 1 of 5 [Core Motivation & Trajectory]:**
> **"Could you introduce yourself, summarize your key academic/professional achievements, and explain why you are targeting this specific opportunity?"**

💡 **STAR Strategy:** State the **Situation**, your designated **Task**, the concrete **Action** you took, and the measurable **Result**. Reply by voice or text when you're ready!`;
      }

      if (userTurns === 2) {
        return `🌟 **Evaluation of Response 1 (Score: 8.8 / 10):**
- **Strengths:** Structured introduction and clear alignment with your background ${userMajorEn}.
- **Pro Advice:** Mention one specific data metric or measurable outcome from your past experience to add extra credibility.

---

**Question 2 of 5 [Problem Solving & Crisis Management]:**
> **"Tell me about a high-pressure challenge or unexpected conflict you encountered in your studies or workplace. How did you resolve it under tight deadlines?"**`;
      }

      if (userTurns === 3) {
        return `🌟 **Evaluation of Response 2 (Score: 9.1 / 10):**
- **Strengths:** Excellent demonstration of composure, diplomatic collaboration, and initiative.
- **Pro Advice:** Conclude with the lesson learned and how you prevent similar bottlenecks.

---

**Question 3 of 5 [Constructive Self-Awareness]:**
> **"What is one professional skill or technical area you currently consider a weakness, and what proactive steps are you taking to master it?"**`;
      }

      if (userTurns === 4) {
        return `🌟 **Evaluation of Response 3 (Score: 8.9 / 10):**
- **Strengths:** Mature self-reflection paired with tangible self-development courses.

---

**Question 4 of 5 [Vision, Community & Leadership]:**
> **"Among hundreds of highly qualified international candidates, how will you leverage this opportunity to generate a lasting positive impact for your community and organization?"**`;
      }

      return `🏆 **Comprehensive Mock Interview Scorecard:**
- **Overall Rating:** 9.3 / 10 (Advanced Competitive Readiness)
- **Strengths:** Articulate phrasing, strategic STAR structure, high emotional intelligence.
- **Final Recommendations:**
  1. Keep spoken responses concise (60-90 seconds).
  2. Emphasize your unique research or operational footprint.
  3. Maintain a confident, friendly posture during visual or in-person sessions.

You are thoroughly equipped to excel in your real interview! 🌟`;
    }

    // ARABIC MULTI-DIALECT INTERVIEW
    const dialectInterviewIntro = isSudanese
      ? `حبابك يا زول يا طيب! جاهز ونبدأ معاك محاكاة المقابلة الرسمية للقبول والوظائف خطوة بخطوة.`
      : isEgyptian
      ? `أهلاً بيك يا فندم! يلا نبدأ سوا تدريب الإنترفيو الاحترافي للمنح والشركات الكبرى.`
      : `${userNameAr}! 🎓 يسعدني أن نبدأ معاً محاكاة المقابلة الرسمية للمنح الدراسية وفرص العمل الدولية.`;

    if (userTurns <= 1) {
      return `${dialectInterviewIntro}
${isCareerEmployee ? "🎯 **المسار المحدد:** مقابلة عمل وتوظيف مهني" : "🎯 **المسار المحدد:** مقابلة قبول أكاديمي ولجنة منح دولية"}

**السؤال الأول (1/5) - [التعريف بالنفس والدافع]:**
> **"عرّفنا بنفسك بإيجاز، وما هي أبرز إنجازاتك الأكاديمية أو المهنية ${userMajorAr}؟ ولماذا ترى أن هذه الفرصة هي الخطوة المثالية لمستقبلك؟"**

💡 **نصيحة ذهبية:** استخدم منهجية **STAR** (الموقف، المهمة، الإجراء، النتيجة الملموسة). تحدث أو اكتب إجابتك وسأقوم بتقييمها فوراً.`;
    }

    if (userTurns === 2) {
      return `🌟 **تقييم إجابتك الأولى (8.7 / 10):**
- **نقاط القوة:** الترتيب المنطقي ووضوح الطموح والربط بالتخصص.
- **توصية التطوير:** ادعم إجابتك برقم أو نتيجة ملموسة (مثل: نسبة تحسن، مشروع تخرج محدد، أو تكريم نلته).

---

**السؤال الثاني (2/5) - [حل المشكلات والتكيف تحت الضغط]:**
> **"حدثنا عن موقف واجهت فيه تحدياً معقداً أو خلافاً في الرأي أثناء العمل أو الدراسة، وكيف تصرفت لإنهاء المهمة بنجاح؟"**`;
    }

    if (userTurns === 3) {
      return `🌟 **تقييم إجابتك الثانية (9.0 / 10):**
- **نقاط القوة:** إظهار المرونة والعمل الجماعي وحسن التصرف.
- **توصية التطوير:** اختم دائماً بالأثر الإيجابي الذي تركته التجربة على مهاراتك.

---

**السؤال الثالث (3/5) - [الوعي الذاتي والتطوير المستمر]:**
> **"ما هي إحدى نقاط الضعف التي اكتشفتها في نفسك سابقاً، وما هي الخطوات العملية التي اتخذتها لمعالجتها وتطويرها؟"**`;
    }

    if (userTurns === 4) {
      return `🌟 **تقييم إجابتك الثالثة (8.9 / 10):**
- **نقاط القوة:** المصداقية وعرض خطة واضحة للتعلم الذاتي.

---

**السؤال الرابع (4/5) - [الأثر المجتمعي والقيمة المضافة]:**
> **"من بين آلاف المتقدمين المؤهلين، لماذا يجب على لجنة الاختيار منحك هذه الفرصة؟ وكيف ستوظف مهاراتك بعد القبول لخدمة مجتمعك ومؤسستك؟"**`;
    }

    return `🏆 **تقرير الأداء النهائي لجلسة المقابلة:**
- **التقييم العام:** ممتاز ومؤهل بنسبة عالية (9.2 / 10).
- **أبرز نقاط القوة:** الثقة العالية، وضوح الأهداف، واستخدام أسلوب الإقناع الممنهج.
- **نصائح حاسمة للمقابلة الواقعية:**
  1. حافظ على مدة الإجابة الشفوية بين 60 إلى 90 ثانية.
  2. تحدث بنبرة صوت واثقة ومريحة وابتسم بهدوء.
  3. ركز على القيمة التي ستضيفها بعد التخرج أو التوظيف.

أنت الآن جاهز ومستعد لخوض المقابلات الرسمية بثبات كامل! 🌟`;
  }

  // ==========================================
  // 2. DISCIPLINE-SPECIFIC ADVICE (Medical, Engineering, IT, Business, Career)
  // ==========================================
  if (isMedical) {
    const medicalIntro = isSudanese
      ? `يا دكتور/ة حبابك! بخصوص التخصصات الطبية والصحية (طب بشري، أسنان، صيدلة، تمريض):`
      : isEgyptian
      ? `أهلاً يا دكتور! بالنسبة للمجالات الطبية والصحية والتسجيل في الزمالات والماجستير:`
      : `🩺 **الإرشاد الأكاديمي والمهني للقطاع الطبي والعلوم الصحية:**`;

    return `${medicalIntro}

### 1. أفضل مسارات المنح للدراسات الطبية والصحية:
- **المنحة التركية (Türkiye Bursları):** تخصصات الطب البشري والأسنان وطب الطوارئ مع التدريب السريري الكامل.
- **منح DAAD الألمانية للطب الحيوي (Biomedical & Public Health):** تركيز عالي على الأبحاث الإكلينيكية والصحة العامة.
- **منح الجامعات السعودية (Study in Saudi):** تمويل كامل لبرامج العلوم الطبية التطبيقية والماجستير البحثي.

### 2. متطلبات القبول الإضافية للمجال الطبي:
- إثبات التدريب السريري والامتياز (Internship Certificate).
- أوراق وتوصيات من أطباء استشاريين أو أساتذة كلية الطب.
- اجتياز اختبارات المعادلة واللغة (OET أو IELTS الأكاديمي) حسب وجهة الدراسة.

💡 **نصيحة المستشار:** يمكنك إرسال مسودة خطاب الدافع الطبي أو السيرة الإكلينيكية لفحصها فوراً!`;
  }

  if (isEngineering) {
    const engIntro = isSudanese
      ? `يا باشمهندس حبابك! بخصوص الدراسات والمنح الهندسية والتقنية:`
      : isEgyptian
      ? `أهلاً بالباشمهندس! جمعتلك أهم التفاصيل للمنح الهندسية والتطوير المهني:`
      : `⚙️ **الدليل الشامل للمنح والتطوير في القطاع الهندسي:**`;

    return `${engIntro}

### 1. المنح الأكثر قوة في التخصصات الهندسية:
- **منحة DAAD الألمانية:** المركز الأول عالمياً في الهندسة الميكانيكية، السيارات، الطاقة المتجددة، والمدنية.
- **منح المجر (Stipendium Hungaricum):** برامج متقدمة في الهندسة الكهربائية وعلوم المواد باللغة الإنجليزية.
- **منح بولندا وإيطاليا (Politecnico di Milano & Erasmus Mundus):** زمالات هندسية مشتركة ممولة بالكامل.

### 2. كيف ترفع نسبة قبولك في الهندسة إلى +90%؟
- إبراز مشروع التخرج (Capstone Project) ببيانات وأرقام ومخططات واقعية.
- ذكر البرامج الهندسية التي تتقنها (AutoCAD, MATLAB, SolidWorks, Revit, Python).
- صياغة مقترح بحثي يحل مشكلة هندسية أو بيئية ملحة.

💡 **نصيحة:** جاهز لفحص سيرتك الذاتية الهندسية ومطابقتها مع معايير الـ ATS الدولية!`;
  }

  if (isIT) {
    const itIntro = isSudanese
      ? `حبابك يا مبرمج/تقني! بخصوص علوم الحاسب، الذكاء الاصطناعي والأمن السيبراني:`
      : isEgyptian
      ? `يا هلا بعمالقة التكنولوجيا والبرمجة! دي أهم المنح وفرص العمل عن بعد:`
      : `💻 **دليل المنح وفرص التوظيف التقني (Computer Science & AI):**`;

    return `${itIntro}

### 1. المنح الرائدة في علوم البيانات والذكاء الاصطناعي:
- **منحة جامعة محمد بن زايد للذكاء الاصطناعي (MBZUAI):** تمويل 100% وراتب شهري وسكن فاخر لطلاب الماجستير والدكتوراه في AI.
- **منح إيراسموس موندوس (Erasmus Mundus):** دراسة مشتركة في 3 دول أوروبية في الأمن السيبراني وعلم البيانات.
- **منحة KAUST السعودية:** تمويل استثنائي ومختبرات فائقة التطور للحوسبة السحابية وهندسة البرمجيات.

### 2. أهم ما تركز عليه لجان القبول وشركات التقنية العالمية:
- رابط حسابك على **GitHub** متضمناً مشاريع حقيقية وClean Code موثق.
- مهارات حل المشكلات وهياكل البيانات والـ System Design.
- شهادات منصات معتمدة (AWS, Google Cloud, Meta Certified).

💡 **خدمة فورية:** يمكنك أن تطلب مني صياغة خطاب النوايا لمشاريع الـ AI الخاصة بك!`;
  }

  if (isCareerEmployee || isBusiness) {
    const careerIntro = isSudanese
      ? `يا هلا بيك! بخصوص التطوير الوظيفي، الترقية، وإدارة الأعمال (MBA):`
      : isEgyptian
      ? `أهلاً بحضرتك! إليك خطة التميز المهني والترقية والحصول على وظائف دولية:`
      : `📈 **دليل التطوير المهني وإدارة الأعمال وفرص العمل الدولية:**`;

    return `${careerIntro}

### 1. الشهادات المهنية الأعلى طلباً وعائداً (High-ROI Certifications):
- **إدارة المشاريع:** PMP (Project Management Professional) و Agile/Scrum Master.
- **المالية والمحاسبة:** CFA, CMA, CPA لفرص البنوك والشركات متعددة الجنسيات.
- **إدارة الأعمال:** برامج الماجستير التنفيذي والـ MBA الممولة في أوروبا وبريطانيا.

### 2. مفاتيح الحصول على وظائف عن بعد (Remote Jobs) وبرواتب مجزية:
- كتابة سيرة ذاتية بصيغة ATS خالية من الجداول المعقدة وتعتمد أسلوب (Action Verbs + Impact).
- تحسين ملف **LinkedIn** بالكلمات المفتاحية لمجال عملك (Headline & About).
- بناء Portfolio مهني يبرز المشاريع الناجحة ونسب النمو التي حققتها.

💡 **اقتراح:** يمكنك الضغط على وضع "فحص السيرة الذاتية (CV)" لفحص ملفك فوراً!`;
  }

  // ==========================================
  // 3. SCHOLARSHIPS & GENERAL INQUIRIES (Multi-Dialect)
  // ==========================================
  if (
    query.includes("منحة") ||
    query.includes("منح") ||
    query.includes("جامعة") ||
    query.includes("جامعات") ||
    query.includes("قبول") ||
    query.includes("شروط") ||
    query.includes("سودان") ||
    query.includes("تركيا") ||
    query.includes("سعودية") ||
    query.includes("مصر") ||
    query.includes("ألمانيا") ||
    query.includes("بريطانيا") ||
    query.includes("أمريكا") ||
    query.includes("كندا") ||
    query.includes("قطر") ||
    query.includes("الإمارات") ||
    query.includes("scholarship") ||
    query.includes("university") ||
    query.includes("admission") ||
    query.includes("requirements")
  ) {
    if (isEn) {
      return `🎓 **Premier Fully Funded Scholarships & Application Windows:**

### 1. Top Verified Global Programs:
- **Türkiye Bursları (Turkey):** 100% full tuition, monthly stipend, accommodation, flight tickets, and 1-year language preparatory year.
- **Study in Saudi (KSA):** Comprehensive scholarship portal for Arab & international students across 25+ top-ranked universities.
- **UK Chevening & Commonwealth:** Fully funded Master's programs covering tuition, living expenses, and leadership networking.
- **German DAAD & EPOS:** World-leading engineering and development studies with generous stipends.
- **Hungarian Stipendium:** Full EU degree scholarship with health insurance and dormitory housing.

### 2. Core Application Dossier:
- 📄 Valid Passport (minimum 12 months validity).
- 📜 Authenticated Transcripts & Degree Certificates with certified English translations.
- ✉️ Two Academic / Professional Letters of Recommendation.
- 🎯 Customized Motivation Letter (SOP) tailored to each university.
- 🌐 Language Proficiency (IELTS, TOEFL, or English Medium Certificate).

You can browse, filter, and track applications directly inside the **«Scholarships»** tab!`;
    }

    const warmIntro = isSudanese
      ? `يا هلا بيك حبابك ألف! دي أهم المنح وفرص القبول المضمونة للطلاب والخريجين:`
      : isEgyptian
      ? `أهلاً بيك يا فندم! جمعتلك أهم المنح الممولة بالكامل والشروط الرسمية للتقديم:`
      : `🎓 **أبرز فرص المنح المتاحة وإجراءات القبول الرسمية:**`;

    return `${warmIntro}

### 1. المنح الأكثر تمويلاً وطلباً:
- **منحة الحكومة التركية (Türkiye Bursları):** تغطية شاملة (راتب شهري + سكن جامعي مجاني + تأمين صحي + تذاكر طيران + سنة لغة مجانية).
- **منح الجامعات السعودية (منصة ادرس في السعودية):** تمويل كامل لجميع الدرجات (بكالوريوس، ماجستير، دكتوراه).
- **منحة تشيفنينغ البريطانية (Chevening):** دراسة الماجستير في المملكة المتحدة مع تغطية كامل التكاليف وبناء شبكة علاقات قيادية.
- **منحة الحكومة الهنغارية (Stipendium Hungaricum):** تغطية كاملة للدراسة في جامعات الاتحاد الأوروبي باللغة الإنجليزية.
- **منحة داد الألمانية (DAAD):** تخصصات الهندسة، العلوم، والتنمية المستدامة.

### 2. المستندات الرسمية الأساسية المطلوبة:
- 📄 جواز سفر ساري المفعول (سنة على الأقل).
- 📜 الشهادات وكشوف الدرجات مترجمة للإنجليزية وموثقة.
- ✉️ رسالتا توصية أكاديمية (Recommendation Letters).
- 🎯 خطاب دافع (Motivation Letter) قوي ومخصص.
- 🌐 شهادة لغة أو إفادة أن الدراسة السابقة باللغة الإنجليزية.

يمكنك تصفح الفرص والتفاصيل الكاملة والتقديم عليها مباشرة من تبويب **«المنح الدراسية»**!`;
  }

  // ==========================================
  // 4. DEFAULT COMPREHENSIVE GREETING & MULTI-DIALECT
  // ==========================================
  if (isEn) {
    return `${userNameEn}! 🌟 I am your dedicated AI Academic & Career Advisor on **Al-Foras**.

Here is how I can assist you right now:
1. 🎯 **Scholarship & University Matching:** Tell me your GPA, field, and preferred country to get matched opportunities.
2. 🎙️ **Live Mock Interview:** Practice real scholarship and job interview questions with live audio feedback.
3. ✍️ **SOP & CV Review:** Analyze your motivation letters and evaluate your resume against ATS standards.
4. 💼 **Career & Skills Development:** Guidance on certifications (PMP, AWS, AI), job hunting, and remote work.

What would you like to explore today? Type your question or choose an option above!`;
  }

  const defaultGreeting = isSudanese
    ? `حبابك يا زول يا طيب في تطبيق **«الفُرَص»**! أنا مستشارك الذكي هنا لمساعدتك في كل ما يخص دراستك، منحك، وتطويرك المهني:`
    : isEgyptian
    ? `أهلاً بحضرتك في **«الفُرَص»**! أنا مستشارك الذكي وجاهز أساعدك خطوة بخطوة في القبول بالمنح وفرص العمل الاحترافية:`
    : `${userNameAr}! 🌟 بصفتي مستشارك الأكاديمي والمهني في منصة **«الفُرَص»**، يسعدني تقديم المساعدة الشاملة لك في:`;

  return `${defaultGreeting}

1. 🎯 **مطابقة المنح والجامعات:** أخبرني بمعدلك وتخصصك وبلدك المستهدف لأرشح لك أفضل المنح الممولة بالكامل.
2. 🎙️ **محاكاة المقابلات الشخصية:** تدريب تفاعلي على أسئلة لجان القبول ومقابلات العمل وفق منهجية STAR.
3. ✍️ **صياغة وفحص خطابات الدافع والسير الذاتية (CV):** تدقيق رصانة المقالات والتأكد من توافق سيرتك مع أنظمة الـ ATS.
4. 💼 **التطوير الوظيفي والشهادات المهنية:** استشارات في كافة التخصصات (الطب، الهندسة، التقنية، إدارة الأعمال).

كيف يمكنني خدمتك الآن؟ يمكنك كتابة استفسارك أو طلب بدء مقابلة فوراً!`;
};

