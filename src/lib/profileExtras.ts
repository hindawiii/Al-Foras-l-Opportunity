import localforage from "localforage";

localforage.config({
  name: "al-foras",
  storeName: "profile_extras",
  description: "Local IndexedDB store for extended profile data",
});

export type LinkType =
  | "portfolio" | "linkedin" | "twitter" | "telegram"
  | "instagram" | "youtube" | "github" | "behance"
  | "medium" | "cv" | "other";

export interface PersonalLink {
  id: string;
  type: LinkType;
  url: string;
}

export interface SkillEntry {
  name: string;
  level: number; // 1..5
  category: "tech" | "creative" | "language" | "other";
}

export interface ProfileExtras {
  persona?: "student" | "professional"; // User profile archetype
  phoneCountryCode: string;       // e.g. "+249"
  phoneCountryIso: string;        // e.g. "SD"
  links: PersonalLink[];
  highSchool: string;
  university: string;
  major: string;
  gpa: string;
  gpaScale: "4" | "5" | "100";
  degree: "" | "secondary" | "diploma" | "bachelor" | "master" | "phd";
  detailedSkills: SkillEntry[];
  experienceYears: "" | "none" | "0-1" | "1-3" | "3-5" | "5-10" | "10+";
  updatedAt: string;
}

const KEY = "profile_extras_v1";

export const defaultExtras: ProfileExtras = {
  persona: "student",
  phoneCountryCode: "+249",
  phoneCountryIso: "SD",
  links: [],
  highSchool: "",
  university: "",
  major: "",
  gpa: "",
  gpaScale: "4",
  degree: "",
  detailedSkills: [],
  experienceYears: "",
  updatedAt: new Date().toISOString(),
};

export const profileExtras = {
  async load(): Promise<ProfileExtras> {
    try {
      const v = await localforage.getItem<ProfileExtras>(KEY);
      if (v) return { ...defaultExtras, ...v };
    } catch (e) { console.error("profileExtras.load", e); }
    // Fallback to localStorage (older data)
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...defaultExtras, ...JSON.parse(raw) };
    } catch {}
    return { ...defaultExtras };
  },
  async save(v: ProfileExtras): Promise<void> {
    const withTs = { ...v, updatedAt: new Date().toISOString() };
    try { await localforage.setItem(KEY, withTs); } catch (e) { console.error("profileExtras.save", e); }
    // Also mirror to localStorage as backup
    try { localStorage.setItem(KEY, JSON.stringify(withTs)); } catch {}
  },
  async clear(): Promise<void> {
    try { await localforage.removeItem(KEY); } catch {}
    try { localStorage.removeItem(KEY); } catch {}
  },
};

/**
 * Automatically formats input into a valid URL based on platform type,
 * supporting both direct usernames (e.g., "johndoe") and complete URLs.
 */
export function formatPlatformUrl(type: LinkType, rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const cleanHandle = trimmed.replace(/^@/, "");

  switch (type) {
    case "linkedin":
      if (trimmed.includes("linkedin.com")) return `https://${trimmed}`;
      return `https://linkedin.com/in/${cleanHandle}`;
    case "github":
      if (trimmed.includes("github.com")) return `https://${trimmed}`;
      return `https://github.com/${cleanHandle}`;
    case "behance":
      if (trimmed.includes("behance.net")) return `https://${trimmed}`;
      return `https://behance.net/${cleanHandle}`;
    case "twitter":
      if (trimmed.includes("x.com") || trimmed.includes("twitter.com")) return `https://${trimmed}`;
      return `https://x.com/${cleanHandle}`;
    case "telegram":
      if (trimmed.includes("t.me") || trimmed.includes("telegram.me")) return `https://${trimmed}`;
      return `https://t.me/${cleanHandle}`;
    case "instagram":
      if (trimmed.includes("instagram.com")) return `https://${trimmed}`;
      return `https://instagram.com/${cleanHandle}`;
    case "youtube":
      if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) return `https://${trimmed}`;
      return `https://youtube.com/@${cleanHandle}`;
    case "medium":
      if (trimmed.includes("medium.com")) return `https://${trimmed}`;
      return `https://medium.com/@${cleanHandle}`;
    default:
      return `https://${trimmed}`;
  }
}

/**
 * Extracts a concise human-readable handle or domain for UI badges
 */
export function getLinkDisplayHandle(type: LinkType, url: string): string {
  if (!url) return "";
  const clean = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  
  if (type === "linkedin" && clean.includes("linkedin.com/in/")) {
    return "@" + clean.split("linkedin.com/in/")[1];
  }
  if (type === "github" && clean.startsWith("github.com/")) {
    return "@" + clean.replace("github.com/", "");
  }
  if (type === "behance" && clean.startsWith("behance.net/")) {
    return "@" + clean.replace("behance.net/", "");
  }
  if (type === "twitter" && (clean.startsWith("x.com/") || clean.startsWith("twitter.com/"))) {
    return "@" + clean.replace(/^(x\.com|twitter\.com)\//, "");
  }
  if (type === "telegram" && clean.startsWith("t.me/")) {
    return "@" + clean.replace("t.me/", "");
  }
  if (type === "instagram" && clean.startsWith("instagram.com/")) {
    return "@" + clean.replace("instagram.com/", "");
  }
  if (type === "youtube" && clean.startsWith("youtube.com/@")) {
    return clean.replace("youtube.com/", "");
  }
  if (type === "medium" && clean.startsWith("medium.com/@")) {
    return clean.replace("medium.com/", "");
  }

  return clean.length > 32 ? clean.slice(0, 29) + "..." : clean;
}

export interface PlatformConfig {
  type: LinkType;
  labelAr: string;
  labelEn: string;
  emoji: string;
  placeholderAr: string;
  placeholderEn: string;
  hintAr: string;
  hintEn: string;
}

export const PLATFORMS_LIST: PlatformConfig[] = [
  {
    type: "linkedin",
    labelAr: "لينكد إن (LinkedIn)",
    labelEn: "LinkedIn",
    emoji: "💼",
    placeholderAr: "اسم المستخدم (مثل: your-name) أو الرابط كاملاً",
    placeholderEn: "Username (e.g. your-name) or full URL",
    hintAr: "يمكنك كتابة اسم المستخدم فقط أو لصق رابط حسابك الشخصي",
    hintEn: "You can enter your username or paste the full profile URL",
  },
  {
    type: "github",
    labelAr: "جيت هاب (GitHub)",
    labelEn: "GitHub",
    emoji: "💻",
    placeholderAr: "اسم المستخدم (مثل: developer) أو الرابط كاملاً",
    placeholderEn: "Username (e.g. developer) or full URL",
    hintAr: "مثالي للمبرمجين ومهندسي الحاسوب ومطوري البرمجيات",
    hintEn: "Great for developers, software engineers, and tech contributors",
  },
  {
    type: "portfolio",
    labelAr: "موقع شخصي / معرض أعمال",
    labelEn: "Portfolio / Website",
    emoji: "🌐",
    placeholderAr: "رابط موقعك (مثل: myportfolio.com)",
    placeholderEn: "Website URL (e.g. myportfolio.com)",
    hintAr: "موقعك الشخصي أو مدونتك المستقلة لعرض مشاريعك",
    hintEn: "Your personal domain, portfolio showcase, or blog",
  },
  {
    type: "cv",
    labelAr: "رابط السيرة الذاتية (CV / Drive)",
    labelEn: "Resume / CV (Drive)",
    emoji: "📄",
    placeholderAr: "رابط ملف السيرة الذاتية (Google Drive, Notion, PDF...)",
    placeholderEn: "CV file URL (Google Drive, Notion, PDF...)",
    hintAr: "تأكد من جعل الرابط متاحاً للمشاهدة العامة (Anyone with link)",
    hintEn: "Ensure link sharing permission is set to public viewer",
  },
  {
    type: "behance",
    labelAr: "بيهانس (Behance)",
    labelEn: "Behance",
    emoji: "🎨",
    placeholderAr: "اسم المستخدم (مثل: designer) أو الرابط كاملاً",
    placeholderEn: "Username (e.g. designer) or full URL",
    hintAr: "لمصممي الجرافيك، واجهات المستخدم UX/UI، والفنانين",
    hintEn: "For UI/UX designers, visual artists, and creatives",
  },
  {
    type: "twitter",
    labelAr: "تويتر / إكس (Twitter / X)",
    labelEn: "Twitter / X",
    emoji: "🐦",
    placeholderAr: "اسم الحساب بدون @ أو الرابط كاملاً",
    placeholderEn: "Handle without @ or full URL",
    hintAr: "حسابك المهني على منصة إكس لمتابعة النقاشات والتواصل",
    hintEn: "Your professional profile on X / Twitter",
  },
  {
    type: "telegram",
    labelAr: "تيليجرام (Telegram)",
    labelEn: "Telegram",
    emoji: "📱",
    placeholderAr: "اسم المستخدم (مثل: username) أو الرابط",
    placeholderEn: "Username (e.g. username) or URL",
    hintAr: "لتسهيل تواصل مسؤولي التوظيف والفرص معك مباشرة",
    hintEn: "For direct communication and networking",
  },
  {
    type: "youtube",
    labelAr: "يوتيوب (YouTube)",
    labelEn: "YouTube",
    emoji: "🎥",
    placeholderAr: "اسم القناة أو الرابط كاملاً",
    placeholderEn: "Channel name or full URL",
    hintAr: "قناتك التعليمية، بودكاست، أو شروحات المشاريع",
    hintEn: "Your educational channel, podcast, or project demos",
  },
  {
    type: "medium",
    labelAr: "ميديوم (Medium)",
    labelEn: "Medium",
    emoji: "📝",
    placeholderAr: "اسم حسابك (مثل: author) أو الرابط",
    placeholderEn: "Username (e.g. author) or URL",
    hintAr: "مقالاتك التخصصية، أبحاثك، وتدويناتك المعرفية",
    hintEn: "Articles, academic blogs, and publications",
  },
  {
    type: "instagram",
    labelAr: "إنستغرام (Instagram)",
    labelEn: "Instagram",
    emoji: "📸",
    placeholderAr: "اسم المستخدم أو الرابط",
    placeholderEn: "Username or URL",
    hintAr: "حسابك المهني أو معرض الصور",
    hintEn: "Professional Instagram profile",
  },
  {
    type: "other",
    labelAr: "رابط مخصص آخر",
    labelEn: "Other Custom Link",
    emoji: "🔗",
    placeholderAr: "https://yourlink.com",
    placeholderEn: "https://yourlink.com",
    hintAr: "أي منصة مهنية أو أكاديمية أخرى (ResearchGate, Kaggle...)",
    hintEn: "Any other professional platform (ResearchGate, Kaggle...)",
  },
];

/**
 * AI Matching Signals & Readiness calculation
 */
export interface AIMatchingSignal {
  id: string;
  fieldKey: string;
  labelAr: string;
  labelEn: string;
  category: "critical" | "high" | "recommended";
  weight: number; // Percentage contribution (sum = 100)
  isCompleted: boolean;
  whyImportantAr: string;
  whyImportantEn: string;
  unlocksCountHintAr: string;
  unlocksCountHintEn: string;
  iconName: "gpa" | "major" | "links" | "skills" | "experience" | "degree" | "location" | "bio" | "phone";
}

export interface AIMatchingReadinessResult {
  score: number; // 0 to 100
  tier: "developing" | "good" | "optimized" | "elite";
  tierLabelAr: string;
  tierLabelEn: string;
  persona: "student" | "professional";
  completedCount: number;
  totalCount: number;
  missingCritical: AIMatchingSignal[];
  allSignals: AIMatchingSignal[];
  unlockedMatchesEstimate: number; // Dynamic simulated matched count
}

export function calculateAIMatchingReadiness(
  profile: {
    full_name?: string;
    bio?: string;
    education?: string;
    location?: string;
    phone?: string;
    skills?: string[];
  },
  extras: ProfileExtras
): AIMatchingReadinessResult {
  const isProfessional = extras.persona === "professional";

  let signals: AIMatchingSignal[] = [];

  if (isProfessional) {
    signals = [
      {
        id: "skills_detailed",
        fieldKey: "detailedSkills",
        labelAr: "المهارات والتقنيات مع مستوى الإتقان",
        labelEn: "Tech Skills with Proficiency Rating",
        category: "critical",
        weight: 25,
        isCompleted: (extras.detailedSkills && extras.detailedSkills.length >= 2) || (profile.skills && profile.skills.length >= 3),
        whyImportantAr: "يستخدمها الذكاء الاصطناعي لمطابقة المتطلبات البرمجية والمهنية الدقيقة للوظائف العالمية والعمل عن بعد.",
        whyImportantEn: "Used by AI to precisely match required tech stacks for global & remote opportunities.",
        unlocksCountHintAr: "يرفع دقة ترشيح الوظائف المناسبة بنسبة 90%",
        unlocksCountHintEn: "Increases relevant job recommendations by 90%",
        iconName: "skills",
      },
      {
        id: "experience_years",
        fieldKey: "experienceYears",
        labelAr: "سنوات الخبرة والمستوى المهني",
        labelEn: "Years of Experience & Seniority",
        category: "critical",
        weight: 20,
        isCompleted: Boolean(extras.experienceYears && extras.experienceYears !== "none"),
        whyImportantAr: "عامل التصفية الأول لأصحاب العمل والشركات لتحديد ملاءمتك للمناصب (Junior / Mid / Senior).",
        whyImportantEn: "The primary filter used by recruiters to determine seniority fit.",
        unlocksCountHintAr: "يفتح التقديم على المناصب القيادية والمتقدمة",
        unlocksCountHintEn: "Unlocks Senior & Lead roles matching your track",
        iconName: "experience",
      },
      {
        id: "portfolio_links",
        fieldKey: "links",
        labelAr: "رابط LinkedIn أو معرض الأعمال (GitHub / Portfolio)",
        labelEn: "LinkedIn, GitHub or Portfolio Link",
        category: "critical",
        weight: 20,
        isCompleted: Boolean(extras.links && extras.links.some(l => l.url.trim().length > 0)),
        whyImportantAr: "مطلوب لتجاوز فحص الذكاء الاصطناعي الأولي وتأكيد مصداقية ملفك لدى الشركات الدولية.",
        whyImportantEn: "Required for ATS AI screening to verify projects & professional identity.",
        unlocksCountHintAr: "يضاعف فرصة استدعائك للمقابلات الوظيفية 3x",
        unlocksCountHintEn: "Triples your interview invitation rate",
        iconName: "links",
      },
      {
        id: "major_field",
        fieldKey: "major",
        labelAr: "المسمى الوظيفي / التخصص المهني",
        labelEn: "Target Job Title / Specialization",
        category: "high",
        weight: 15,
        isCompleted: Boolean(extras.major && extras.major.trim().length > 1),
        whyImportantAr: "يوجه محرك الذكاء الاصطناعي لاستهداف الصناعة ومجال العمل المفضل لديك.",
        whyImportantEn: "Guides the AI search engine to target your preferred sector and role.",
        unlocksCountHintAr: "يضمن عدم اقتراح وظائف خارج تخصصك",
        unlocksCountHintEn: "Filters out irrelevant job domains",
        iconName: "major",
      },
      {
        id: "location_remote",
        fieldKey: "location",
        labelAr: "الموقع الجغرافي واستعداد العمل عن بُعد",
        labelEn: "Location & Remote Availability",
        category: "recommended",
        weight: 10,
        isCompleted: Boolean(profile.location && profile.location.trim().length > 1),
        whyImportantAr: "لتحديد فرص العمل الإقليمية والتأكد من مطابقة المنطقة الزمنية (Timezone Fit).",
        whyImportantEn: "Used for regional & remote time-zone compatibility matching.",
        unlocksCountHintAr: "يفتح الفرص المحلية والإقليمية المناسبة لمنطقتك",
        unlocksCountHintEn: "Enables regional & compatible timezone jobs",
        iconName: "location",
      },
      {
        id: "bio_summary",
        fieldKey: "bio",
        labelAr: "الملخص المهني ونقاط القوة (Bio)",
        labelEn: "Executive Summary / Bio",
        category: "recommended",
        weight: 10,
        isCompleted: Boolean(profile.bio && profile.bio.trim().length > 15),
        whyImportantAr: "يقوم الذكاء الاصطناعي بتحليله دلالياً (Semantic NLP) لمطابقة ثقافة العمل المناسبة لشخصيتك.",
        whyImportantEn: "Parsed via Semantic NLP to match organizational culture and soft skills.",
        unlocksCountHintAr: "يعزز التوافق مع بيئات العمل المفضلة",
        unlocksCountHintEn: "Enhances soft skills & culture-fit matching",
        iconName: "bio",
      },
    ];
  } else {
    // STUDENT PERSONA
    signals = [
      {
        id: "gpa_score",
        fieldKey: "gpa",
        labelAr: "المعدل التراكمي الدقيق (GPA)",
        labelEn: "Exact GPA / Academic Score",
        category: "critical",
        weight: 25,
        isCompleted: Boolean(extras.gpa && extras.gpa.trim().length > 0),
        whyImportantAr: "أكثر من 85% من المنح الدولية والجامعية تشترط حداً أدنى للمعدل للمطابقة الفورية.",
        whyImportantEn: "Over 85% of international scholarships require GPA minimums for eligibility filtering.",
        unlocksCountHintAr: "يفتح أكثر من 40+ منحة دراسية ممولة بالكامل تطابق معدلك",
        unlocksCountHintEn: "Unlocks 40+ fully-funded scholarships matching your GPA",
        iconName: "gpa",
      },
      {
        id: "academic_degree",
        fieldKey: "degree",
        labelAr: "الدرجة العلمية المستهدفة (بكالوريوس / ماجستير / دكتوراه)",
        labelEn: "Target Academic Degree Level",
        category: "critical",
        weight: 20,
        isCompleted: Boolean(extras.degree && extras.degree.trim().length > 0),
        whyImportantAr: "يضمن عدم عرض منح لدرجات علمية لا تطابق مستواك الحالي أو مرحلتك القادمة.",
        whyImportantEn: "Prevents showing scholarships irrelevant to your current or target academic stage.",
        unlocksCountHintAr: "يخصص برامج التبادل والمنح الدراسية لمرحلتك",
        unlocksCountHintEn: "Customizes scholarships strictly for your level",
        iconName: "degree",
      },
      {
        id: "major_interest",
        fieldKey: "major",
        labelAr: "التخصص الدراسي أو مجال الاهتمام",
        labelEn: "Academic Major or Study Field",
        category: "critical",
        weight: 20,
        isCompleted: Boolean(extras.major && extras.major.trim().length > 1),
        whyImportantAr: "يحدد كليات وجامعات الابتعاث المتوافقة مع طموحك الدراسي.",
        whyImportantEn: "Identifies top universities and faculty programs tailored to your ambitions.",
        unlocksCountHintAr: "يربطك بمنح الكليات العالمية المتخصصة",
        unlocksCountHintEn: "Matches faculty-specific grant opportunities",
        iconName: "major",
      },
      {
        id: "cv_link",
        fieldKey: "links",
        labelAr: "رابط السيرة الذاتية (CV / Google Drive)",
        labelEn: "Resume / Academic CV Link (Drive)",
        category: "high",
        weight: 15,
        isCompleted: Boolean(extras.links && extras.links.some(l => l.url.trim().length > 0)),
        whyImportantAr: "مطلوب لمعاينة خطابات الدافع وسجل الأنشطة التطوعية والبحثية أثناء التقديم.",
        whyImportantEn: "Crucial for reviewing motivation letters, research and extracurricular activities.",
        unlocksCountHintAr: "يرفع نسبة قبول طلبات المنح إلى 80%",
        unlocksCountHintEn: "Boosts grant application acceptance up to 80%",
        iconName: "links",
      },
      {
        id: "skills_languages",
        fieldKey: "skills",
        labelAr: "المهارات واللغات (الإنجليزية / IELTS / مهارات بحثية)",
        labelEn: "Skills & Languages (English/IELTS/Research)",
        category: "high",
        weight: 10,
        isCompleted: (profile.skills && profile.skills.length >= 2) || (extras.detailedSkills && extras.detailedSkills.length >= 1),
        whyImportantAr: "شرط أساسي للمنح الدولية الناطقة بالإنجليزية مثل تشيفنينغ، فولبرايت، ومنح DAAD.",
        whyImportantEn: "Essential for flagship international scholarships (Chevening, Fulbright, DAAD).",
        unlocksCountHintAr: "يؤهلك للمنح العالمية الحكومية والكاملة",
        unlocksCountHintEn: "Qualifies you for premier government grants",
        iconName: "skills",
      },
      {
        id: "university_school",
        fieldKey: "university",
        labelAr: "اسم الجامعة أو المدرسة الحالية",
        labelEn: "Current University / High School",
        category: "recommended",
        weight: 10,
        isCompleted: Boolean((extras.university && extras.university.trim().length > 1) || (extras.highSchool && extras.highSchool.trim().length > 1)),
        whyImportantAr: "يفتح منح الشراكات الأكاديمية والتبادل الطلابي المباشر بين الجامعات.",
        whyImportantEn: "Unlocks direct academic exchange partnerships & university agreements.",
        unlocksCountHintAr: "يتحقق من اتفاقيات الشراكة والتبادل الثقافي",
        unlocksCountHintEn: "Checks direct university exchange agreements",
        iconName: "degree",
      },
    ];
  }

  // Calculate weighted score
  const totalScore = signals.reduce((acc, sig) => acc + (sig.isCompleted ? sig.weight : 0), 0);
  const completedCount = signals.filter(s => s.isCompleted).length;
  const missingCritical = signals.filter(s => !s.isCompleted);

  // Dynamic simulated matches count based on precision
  const baseMatches = isProfessional ? 28 : 34;
  const unlockedMatchesEstimate = Math.max(
    5,
    Math.round(baseMatches * (totalScore / 100)) + Math.round((totalScore > 75 ? 12 : 3))
  );

  let tier: AIMatchingReadinessResult["tier"] = "developing";
  let tierLabelAr = "مطابقة أولية (بيانات أساسية)";
  let tierLabelEn = "Basic Matching (Initial Signals)";

  if (totalScore >= 90) {
    tier = "elite";
    tierLabelAr = "مطابقة فائقة الدقة 🎯 (جاهزية 100%)";
    tierLabelEn = "Elite Precision 🎯 (100% Ready)";
  } else if (totalScore >= 70) {
    tier = "optimized";
    tierLabelAr = "مطابقة ذكية متقدمة ⚡";
    tierLabelEn = "Advanced Smart Match ⚡";
  } else if (totalScore >= 45) {
    tier = "good";
    tierLabelAr = "مطابقة جيدة (تحتاج مؤشرات هامة)";
    tierLabelEn = "Good Match (Needs Key Signals)";
  }

  return {
    score: totalScore,
    tier,
    tierLabelAr,
    tierLabelEn,
    persona: extras.persona || "student",
    completedCount,
    totalCount: signals.length,
    missingCritical,
    allSignals: signals,
    unlockedMatchesEstimate,
  };
}


