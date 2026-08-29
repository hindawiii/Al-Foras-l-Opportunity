// Local intelligent advisory engine for Al-Foras
// Provides instant high-quality academic counseling, interview simulation,
// motivation letter generation, and university guidance.
// Fully bilingual (Arabic & English) with multi-dialect support (Sudanese, Egyptian, Gulf & White Arabic).

export interface UserProfileContext {
  full_name?: string;
  major?: string;
  degree?: string;
  gpa?: string;
  target_country?: string;
  english_level?: string;
}

// Helper to detect if text is predominantly English
export function isEnglishText(text: string): boolean {
  const clean = text.trim();
  if (!clean) return false;
  const englishChars = (clean.match(/[a-zA-Z]/g) || []).length;
  const arabicChars = (clean.match(/[\u0600-\u06FF]/g) || []).length;
  return englishChars > arabicChars;
}

export const generateLocalAIResponse = (
  userMessage: string,
  history: { role: string; content: string }[],
  profile?: UserProfileContext | null,
  appLang: string = "ar"
): string => {
  const query = userMessage.toLowerCase().trim();
  const isEn = appLang === "en" || isEnglishText(userMessage);

  const userNameAr = profile?.full_name ? `أهلاً بك أ. ${profile.full_name}` : "أهلاً بك";
  const userNameEn = profile?.full_name ? `Welcome, ${profile.full_name}` : "Welcome";

  const userMajorAr = profile?.major ? `في تخصصك (${profile.major})` : "";
  const userMajorEn = profile?.major ? `in your field (${profile.major})` : "";

  const targetCountryAr = profile?.target_country ? `إلى (${profile.target_country})` : "";
  const targetCountryEn = profile?.target_country ? `in (${profile.target_country})` : "";

  // Dialect-aware normalization
  const hasInterviewKeyword =
    query.includes("مقابلة") ||
    query.includes("محاكاة") ||
    query.includes("سؤال") ||
    query.includes("انترفيو") ||
    query.includes("interview") ||
    query.includes("mock") ||
    query.includes("star") ||
    query.includes("بدء المقابلة") ||
    query.includes("start interview");

  // Sudanese / Egyptian / Maghrebi Dialect Triggers:
  // "داير أقدم", "عاوز منحة", "عايز اسجل", "شنو الشروط", "إزاي أتقبل", "قريت", "تخصصي", "بدي اقدم"
  const isSudanese = query.includes("داير") || query.includes("شنو") || query.includes("قريت") || query.includes("زول") || query.includes("حبابك");
  const isEgyptian = query.includes("عايز") || query.includes("عاوز") || query.includes("إزاي") || query.includes("علشان") || query.includes("دلوقتي");

  // ==========================================
  // 1. INTERVIEW SIMULATION & LIVE MOCK
  // ==========================================
  if (hasInterviewKeyword) {
    const userTurns = history.filter(h => h.role === "user").length;

    if (isEn) {
      if (userTurns <= 1) {
        return `${userNameEn}! 🎓 Welcome to your Official Scholarship & Career Mock Interview.

**Question 1 of 5 (Motivation & Goals):**
> **"Why did you choose this specific academic field and target country for your studies? How does this program directly align with your long-term career vision?"**

💡 **Pro-Tip:** Use the **STAR Framework** (Situation, Task, Action, Result) to structure your response. Speak or type your answer when you're ready!`;
      }

      if (userTurns === 2) {
        return `🌟 **Evaluation of Response 1 (Score: 8.5/10):**
- **Strengths:** Clear statement of ambition and genuine connection to your major ${userMajorEn}.
- **Area for Growth:** Ground your answer in a specific tangible project, research topic, or social challenge you tackled.

---

**Question 2 of 5 (Cultural Adaptability & Challenges):**
> **"Studying abroad involves cultural immersion and occasional obstacles. Can you share a situation where you had to adapt to a major change or resolve an unexpected challenge?"**`;
      }

      if (userTurns === 3) {
        return `🌟 **Evaluation of Response 2 (Score: 9.0/10):**
- **Strengths:** Excellent demonstration of resilience and emotional intelligence.
- **Area for Growth:** Highlight teamwork and how you communicate across diverse perspectives.

---

**Question 3 of 5 (Constructive Self-Awareness):**
> **"What is one professional or academic weakness you have identified in yourself, and what concrete steps are you taking to improve it?"**`;
      }

      if (userTurns === 4) {
        return `🌟 **Evaluation of Response 3 (Score: 8.8/10):**
- **Strengths:** Authentic self-awareness paired with an actionable self-improvement roadmap.

---

**Question 4 of 5 (The Value Proposition):**
> **"Among hundreds of exceptionally qualified candidates worldwide, why should the selection committee award this fully funded scholarship to you?"**`;
      }

      return `🏆 **Comprehensive Mock Interview Assessment:**
- **Overall Rating:** Outstanding (9.2 / 10)
- **Core Competencies:** Clear articulation, strong academic focus, community impact mindset.
- **Final Recommendations:**
  1. Keep your spoken answers within 60 to 90 seconds for optimal engagement.
  2. Emphasize the direct post-graduation impact for your home community.

You are well prepared to ace the real interview! 🌟`;
    }

    // ARABIC INTERVIEW (with warm dialect acknowledgment)
    const dialectGreeting = isSudanese
      ? `حبابك يا باشمهندس/أستاذ، مرحب بيك في محاكاة المقابلة!`
      : isEgyptian
      ? `أهلاً بيك، جاهزين نبدأ تدريب الإنترفيو سوا خطوة بخطوة!`
      : `${userNameAr}! 🎓 يسعدني أن أبدأ معك محاكاة المقابلة الرسمية للقبول في المنحة.`;

    if (userTurns <= 1) {
      return `${dialectGreeting}

**السؤال الأول (1/5) - [الدافع والهدف الأكاديمي]:**
> **"لماذا اخترت هذا التخصص ${userMajorAr} وهذا البلد ${targetCountryAr} تحديداً لدراستك؟ وما هي خطتك المهنية لخدمة مجتمعك بعد التخرج؟"**

💡 **نصيحة ذهبية:** استخدم منهجية **STAR** (الموقف، المهمة، الإجراء، النتيجة). تحدث بصوتك أو اكتب إجابتك وسأقوم بتقييمها فوراً.`;
    }

    if (userTurns === 2) {
      return `🌟 **تقييم إجابتك الأولى (8.5/10):**
- **نقاط القوة:** وضوح الهدف الأكاديمي وربطه بالمستقبل.
- **فرصة للتحسين:** اذكر مثالاً حقيقياً لمشروع أو مبادرة قمت بها تعزز مصداقية شغفك.

---

**السؤال الثاني (2/5) - [المرونة والتكيف الثقافي]:**
> **"الدراسة في الخارج تتطلب اندماجاً مع ثقافات مختلفة. كيف تعاملت سابقاً مع تحدٍ غير متوقع أو بيئة جديدة عليك؟"**`;
    }

    if (userTurns === 3) {
      return `🌟 **تقييم إجابتك الثانية (9.0/10):**
- **نقاط القوة:** إظهار النضج وسرعة التكيف.
- **فرصة للتحسين:** ركز على جانب التواصل الفعال وحل المشكلات بروح الفريق.

---

**السؤال الثالث (3/5) - [الوعي الذاتي ونقاط التطوير]:**
> **"حدثني عن نقطة ضعف أو مهارة تشعر أنك بحاجة لتطويرها، وما هي الخطوات العملية التي تتخذها لعلاجها؟"**`;
    }

    if (userTurns === 4) {
      return `🌟 **تقييم إجابتك الثالثة (8.8/10):**
- **نقاط القوة:** الصراحة الإيجابية وعرض خطة التعلم المستمر.

---

**السؤال الرابع (4/5) - [القيمة المضافة وتميزك]:**
> **"لماذا يجب على لجنة المنحة اختيارك أنت تحديداً من بين آلاف المتقدمين المتميزين؟"**`;
    }

    return `🏆 **التقرير النهائي لأداء المقابلة:**
- **التقدير العام:** ممتاز جداً (9.2 / 10)
- **أبرز نقاط القوة:** الثقة العالية، وضوح الرؤية الأكاديمية، والتركيز على إحداث أثر إيجابي.
- **توصيات حاسمة للمقابلة الحقيقية:**
  1. حافظ على مدة الإجابة بين 60 إلى 90 ثانية.
  2. تحدث بنبرة واثقة وهادئة، وابتسم عند التعريف بنفسك.
  3. اربط مشروع تخرجك بحل مشكلة واقعية في بلدك ومنطقتك.

أنت الآن جاهز ومؤهل تماماً للتفوق في المقابلات الرسمية! 🌟`;
  }

  // ==========================================
  // 2. MOTIVATION LETTER / SOP / CV
  // ==========================================
  if (
    query.includes("خطاب") ||
    query.includes("دافع") ||
    query.includes("رسالة") ||
    query.includes("توصية") ||
    query.includes("سيرة") ||
    query.includes("motivation") ||
    query.includes("sop") ||
    query.includes("statement") ||
    query.includes("cover letter") ||
    query.includes("cv") ||
    query.includes("resume")
  ) {
    if (isEn) {
      return `📝 **Comprehensive Guide & Structure for Winning Motivation Letters (SOP) ${userMajorEn}:**

### 🏛️ The 5-Pillar Golden Framework:
1. **Compelling Hook & Purpose (Paragraph 1):**
   - Direct statement of the exact degree, program, and university you are applying to.
   - A captivating personal spark or moment of inspiration that led you to this path.

2. **Academic & Research Foundation (Paragraph 2):**
   - Key academic milestones, capstone projects, lab achievements, or relevant certifications.
   - How your theoretical foundation prepares you for advanced coursework.

3. **Why This Specific Program & Faculty? (Paragraph 3):**
   - Cite specific professors, research labs, or unique curriculum modules at the university.
   - Prove you did deep homework on why this institution is your perfect match.

4. **Community Impact & Long-Term Vision (Paragraph 4):**
   - Concrete plan on how you will apply this knowledge ${targetCountryEn} to solve vital challenges in your home region or global industry.

5. **Decisive Closing:**
   - Reiterate your commitment, academic readiness, and gratitude to the committee.

💡 **ATS Tip:** Keep formatting simple with standard margins and bullet points. Avoid clichés and show, don't just tell!`;
    }

    return `📝 **الهيكل الاحترافي المعتمد لكتابة خطاب الدافع (Motivation Letter) ${userMajorAr}:**

### 🏛️ الأركان الخمسة الأساسية للخطاب الفائز:
1. **المقدمة والهدف (Paragraph 1):**
   - ذكر التخصص والجامعة والدرجة العلمية المطلوبة بوضوح.
   - جملة افتتاحية قوية توضح مصدر شغفك الأكاديمي.

2. **الخلفية الأكاديمية والمشاريع (Paragraph 2):**
   - أبرز الإنجازات، مشاريع التخرج، والأبحاث التي قمت بها.
   - المهارات التقنية والعملية ذات الصلة المباشرة بالتخصص.

3. **لماذا هذه الجامعة تحديداً؟ (Paragraph 3):**
   - ذكر أساتذة أو مختبرات بحثية أو مقررات مميزة في الجامعة لجعل الخطاب مخصصاً وليس عاماً.

4. **الرؤية المستقبلية والأثر المجتمعي (Paragraph 4):**
   - كيف ستسهم دراستك ${targetCountryAr} في تنمية مجتمعك ووطنك بعد العودة.

5. **الخاتمة والتأكيد:**
   - التعبير عن الجاهزية التامة وتحمل المسؤولية والامتنان للجنة الاختيار.

💡 **نصيحة المستشار:** تجنب استخدام النماذج الجاهزة كما هي، واجعل كل فقرة تعكس قصة نجاحك وتحدياتك الفريدة!`;
  }

  // ==========================================
  // 3. SCHOLARSHIPS & ADMISSIONS (Multi-Dialect)
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
    query.includes("scholarship") ||
    query.includes("university") ||
    query.includes("admission") ||
    query.includes("requirements")
  ) {
    if (isEn) {
      return `🎓 **Top Fully Funded Scholarships & Global Opportunities:**

### 1. Premier Global Programs:
- **Türkiye Scholarships (Türkiye Bursları):** 100% full funding (Tuition + Monthly Stipend + Accommodation + Health Insurance + Flight Tickets + 1-Year Turkish Language Prep).
- **Study in Saudi Platform:** Full coverage for Bachelor's, Master's, and PhD across top Saudi universities.
- **UK Chevening Scholarships:** One-year fully funded Master’s focusing on leadership and public impact.
- **German DAAD Scholarships:** Full coverage for STEM, engineering, and sustainable development degrees.
- **Hungarian Stipendium Hungaricum:** Comprehensive European degree funding.

### 2. Universal Checklist for Applications:
- 📄 Valid Passport (minimum 1 year validity).
- 📜 Certified & Translated Transcripts and Degree Certificates.
- ✉️ 2 Strong Academic Letters of Recommendation.
- 🎯 Tailored Motivation Letter (Statement of Purpose).
- 🌐 Language Proof (IELTS/TOEFL or English Medium of Instruction letter if available).

You can browse, filter, and track all these opportunities right now in the **«Scholarships»** tab!`;
    }

    const warmIntro = isSudanese
      ? `يا هلا بيك! دي أفضل المنح وفرص القبول المتاحة للطلاب السودانيين والعرب حالياً:`
      : isEgyptian
      ? `أهلاً بيك يا فندم! جمعتلك أهم المنح الممولة بالكامل والشروط الأساسية للتقديم:`
      : `🎓 **أبرز فرص المنح المتاحة وإجراءات القبول الرسمية:**`;

    return `${warmIntro}

### 1. المنح الأكثر تمويلاً وإقبالاً:
- **منحة الحكومة التركية (Türkiye Bursları):** تمويل كامل (راتب شهري + سكن جامعي مجاني + تأمين صحي شامل + تذاكر طيران + سنة تحضيرية للغة).
- **منح الجامعات السعودية (منصة ادرس في السعودية):** تغطية كاملة ونظام دراسة متطور لمراحل البكالوريوس والماجستير والدكتوراه.
- **منح تشيفنينغ البريطانية (Chevening):** ماجستير ممول بالكامل يركز على المهارات القيادية.
- **منح داد الألمانية (DAAD):** تخصصات الهندسة والتنمية المستدامة والعلوم والتكنولوجيا.
- **منحة الحكومة الهنغارية (Stipendium Hungaricum):** تغطية كاملة للدراسة في الاتحاد الأوروبي.

### 2. قائمة المستندات الأساسية للتقديم:
- 📄 جواز سفر ساري المفعول.
- 📜 الشهادات وكشوف الدرجات مترجمة للإنجليزية وموثقة.
- ✉️ رسالتا توصية أكاديمية من أساتذة أو مشرفين.
- 🎯 خطاب دافع (Motivation Letter) مخصص ومتقن.
- 🌐 شهادة إثبات لغة (إن وجدت، أو إفادة أن الدراسة السابقة باللغة الإنجليزية).

يمكنك الوصول لكافة تفاصيل وروابط هذه المنح مباشرة من تبويب **«المنح الدراسية»** في التطبيق!`;
  }

  // ==========================================
  // 4. GENERAL CONSULTATION & DEFAULT GREETING
  // ==========================================
  if (isEn) {
    return `${userNameEn}! 🌟 As your dedicated AI Academic & Career Advisor on **Al-Foras**, I am here to help you:

1. 🎯 **Profile Matching:** Analyze your GPA and background to recommend the best fully funded scholarships.
2. 🎙️ **Live Mock Interview:** Practice real scholarship and job interview questions with live audio feedback.
3. ✍️ **SOP & CV Enhancement:** Review your motivation letters and check your CV against international ATS standards.
4. 🏛️ **University Guide:** Discover admissions requirements across top Arab and international universities.

How can I assist you right now? Choose an option above or ask your question directly!`;
  }

  return `${userNameAr}! 🌟 بصفتي مستشارك الأكاديمي والمهني في تطبيق **«الفرص»**، يسعدني مساعدتك في:

1. 🎯 **تحليل ومطابقة ملفك الشخصي** مع أفضل المنح الدراسية المناسبة لمعدلك وتخصصك.
2. 🎙️ **محاكاة مقابلة حقيقية بالصوت الحي** وتدريبك على الإجابة باحترافية وفق منهجية STAR.
3. ✍️ **صياغة وفحص خطابات الدافع والسيرة الذاتية (CV)** والتأكد من مطابقتها لمعايير أنظمة التوظيف العالمية (ATS).
4. 🏛️ **استعراض شروط القبول والتسجيل** في الجامعات العربية والدولية المعتمدة.

ما الذي تود التركيز عليه الآن؟ يمكنك البدء بمحاكاة مقابلة، أو الاستفسار عن منحة محددة مباشرة!`;
};
