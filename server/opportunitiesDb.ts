import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

export interface ServerScholarship {
  id: string;
  title: string;
  titleEn?: string;
  org: string;
  country: string;
  flag?: string;
  amount?: string;
  level?: string;
  category?: "arab" | "global";
  deadline?: string;
  url: string;
  tags?: string[];
  interests?: string[];
  coverage?: "full" | "partial";
  description?: string;
  descriptionEn?: string;
  benefits?: string[];
  requirements?: string[];
  is_featured?: boolean;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServerJob {
  id: string;
  title_ar: string;
  title_en: string;
  company: string;
  location: string;
  salary: string;
  category: string;
  type?: string;
  country?: string;
  flag?: string;
  deadline?: string;
  apply_url: string;
  company_url?: string;
  skills: string[];
  benefits_ar?: string[];
  description_ar?: string;
  description_en?: string;
  verified?: boolean;
  featured?: boolean;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServerArchivedItem {
  id: string;
  type: "scholarship" | "job";
  itemData: any;
  deletedAt: string;
  deletedBy?: {
    id: string;
    name: string;
    role: string;
  };
  reason?: string;
}

export interface TeamRecipient {
  id: string;
  name: string;
  email: string;
  whatsappPhone: string;
  role: string;
  notifyOn: "all" | "critical_only";
  active: boolean;
  addedAt: string;
}

export interface PendingOpportunityItem {
  id: string;
  type: "scholarship" | "job";
  itemData: any;
  completenessScore: number;
  missingFields: string[];
  priority: "critical" | "medium" | "low";
  importanceReason: string;
  canDefer: boolean;
  status: "pending" | "approved" | "rejected";
  addedAt: string;
  evaluatedAt?: string;
  reviewedBy?: string;
}

export interface AutomationSettings {
  publishMode: "smart_auto" | "strict_review" | "full_auto";
  qualityThreshold: number;
  emailNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  whatsappApiKey?: string;
  teamRecipients: TeamRecipient[];
  autoScheduleIntervalHours: number;
}

export interface NotificationHistoryEntry {
  id: string;
  timestamp: string;
  channel: "email" | "whatsapp" | "system";
  recipient: string;
  title: string;
  summary: string;
  status: "sent" | "simulated" | "failed";
  itemsCount: number;
}

export interface AutomationLogEntry {
  timestamp: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
}

export interface OpportunitiesDatabase {
  scholarships: ServerScholarship[];
  jobs: ServerJob[];
  archived: ServerArchivedItem[];
  pendingReviews: PendingOpportunityItem[];
  settings: AutomationSettings;
  notifications: NotificationHistoryEntry[];
  lastUpdated: string;
  automation: {
    isRunning: boolean;
    lastRun: string | null;
    lastStatus: "idle" | "running" | "completed" | "failed";
    totalIngested: number;
    logs: AutomationLogEntry[];
  };
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "opportunities_db.json");

const INITIAL_SEED_SCHOLARSHIPS: ServerScholarship[] = [
  {
    id: "turkiye-burslari-2026",
    title: "منحة الحكومة التركية الممولة بالكامل (Türkiye Bursları)",
    title_ar: "منحة الحكومة التركية الممولة بالكامل (Türkiye Bursları)",
    title_en: "Turkiye Scholarships (Fully Funded Government Scholarship)",
    university: "كافة الجامعات الحكومية والخاصة في تركيا",
    country: "تركيا",
    flag: "🇹🇷",
    degree: "all",
    coverage: "full",
    category: "full",
    deadline: "2026-11-30",
    majors: ["الطب والهندسة", "العلوم الإنسانية", "إدارة الأعمال", "الذكاء الاصطناعي", "العلوم الأساسية"],
    apply_url: "https://turkiyeburslari.gov.tr",
    official_website: "https://turkiyeburslari.gov.tr",
    stipend: "راتب شهري + تذاكر طيران + سكن مجاني + تأمين صحي شامل + سنة تحضيرية للغة التركية",
    description: "منحة الحكومة التركية الرسمية لجميع المراحل الدراسية (بكالوريوس، ماجستير، دكتوراه، وبحوث) ممولة بالكامل 100%.",
    description_ar: "منحة الحكومة التركية الرسمية لجميع المراحل الدراسية ممولة بالكامل وتشمل الرسوم وراتب شهري وسكن وتأمين وطيران.",
    description_en: "Fully funded Turkish Government scholarship for Bachelor, Master, PhD with monthly stipend, airfare, and housing.",
    benefits_ar: ["إعفاء كامل 100% من الرسوم الدراسية", "راتب شهري منتظم طوال فترة الدراسة", "سكن جامعي مؤمن ومجاني", "تذاكر طيران ذهاب وعودة", "تأمين صحي شامل"],
    requirements_ar: ["معدل لا يقل عن 70% للتخصصات العامة و90% للطب", "شهادة الثانوية العامة أو البكالوريوس", "جواز سفر ساري المفعول"],
    is_featured: true,
    views_count: 1420,
    source: "curated_flagship",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "chevening-uk-2026",
    title: "منحة تشيفنينغ البريطانية للماجستير (Chevening UK Scholarship)",
    title_ar: "منحة تشيفنينغ البريطانية للماجستير (Chevening UK Scholarship)",
    title_en: "Chevening UK Government Master's Scholarship",
    university: "أي جامعة في المملكة المتحدة (أكسفورد، كامبريدج، إمبريال...)",
    country: "المملكة المتحدة",
    flag: "🇬🇧",
    degree: "master",
    coverage: "full",
    category: "full",
    deadline: "2026-11-05",
    majors: ["السياسات العامة", "التكنولوجيا والهندسة", "الصحة العامة", "القيادة والتنمية"],
    apply_url: "https://www.chevening.org/apply/",
    official_website: "https://www.chevening.org",
    stipend: "تغطية شاملة لكافة الرسوم + راتب شهري يغطي المعيشة في بريطانيا + تذاكر الطيران",
    description: "برنامج المنح العالمية للحكومة البريطانية، الممول من وزارة الخارجية والتنمية البريطانية (FCDO) لدراسة الماجستير لمدة عام كامل.",
    description_ar: "منحة قادة المستقبل من الحكومة البريطانية لدراسة الماجستير في أي جامعة بريطانية ممولة بالكامل 100%.",
    description_en: "UK government's global scholarship program funded by FCDO for one-year master's degrees in any UK university.",
    benefits_ar: ["تغطية رسوم الدراسة كاملة مهما بلغت", "راتب معيشة شهري بالجنيه الإسترليني", "تذاكر سفر من وإلى المملكة المتحدة", "بدل وصول وإقامة"],
    requirements_ar: ["شهادة جامعية بكالوريوس", "خبرة عمل لا تقل عن سنتين (2,800 ساعة)", "العودة للوطن بعد التخرج لمدة عامين على الأقل"],
    is_featured: true,
    views_count: 2150,
    source: "curated_flagship",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "daad-germany-2026",
    title: "منحة الهيئة الألمانية للتبادل الثقافي (DAAD Helmut-Schmidt)",
    title_ar: "منحة الهيئة الألمانية للتبادل الثقافي (DAAD Germany)",
    title_en: "DAAD German Academic Exchange Service Scholarship",
    university: "أفضل الجامعات ومعاهد البحوث في ألمانيا",
    country: "ألمانيا",
    flag: "🇩🇪",
    degree: "master",
    coverage: "full",
    category: "full",
    deadline: "2026-10-31",
    majors: ["الهندسة والعلوم التطبيقية", "التنمية المستدامة", "الاقتصاد والإدارة", "الذكاء الاصطناعي"],
    apply_url: "https://www.daad.de/en/find-funding/",
    official_website: "https://www.daad.de",
    stipend: "934 يورو شهرياً للماجستير + تأمين صحي + بدلات سفر وبحوث",
    description: "أكبر منظمة تمويل للطلاب والباحثين الدوليين في العالم، تقدم منحاً ممولة بالكامل للدراسة باللغة الإنجليزية في ألمانيا.",
    description_ar: "منح داد DAAD الألمانية الشهيرة لدراسة الماجستير والدكتوراه باللغة الإنجليزية في كبرى جامعات ألمانيا.",
    description_en: "DAAD Germany fully funded scholarships for Master's and PhD programs taught in English with €934 monthly stipend.",
    benefits_ar: ["راتب شهري بقيمة 934 يورو", "بدل سفر وتذاكر طيران", "تأمين صحي وتأمين ضد الحوادث", "دورة لغة ألمانية مجانية مكثفة"],
    requirements_ar: ["شهادة بكالوريوس متميزة بحد أقصى 6 سنوات منذ التخرج", "إجادة اللغة الإنجليزية (IELTS / TOEFL)", "خطاب دافع قوي وسيرة ذاتية"],
    is_featured: true,
    views_count: 1890,
    source: "curated_flagship",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "fulbright-usa-2026",
    title: "منحة فولبرايت الأمريكية للماجستير والأبحاث (Fulbright Foreign Student)",
    title_ar: "منحة فولبرايت الأمريكية (Fulbright Foreign Student Program)",
    title_en: "Fulbright Foreign Student Program USA",
    university: "كافة الجامعات الرائدة في الولايات المتحدة الأمريكية",
    country: "الولايات المتحدة الأمريكية",
    flag: "🇺🇸",
    degree: "master",
    coverage: "full",
    category: "full",
    deadline: "2026-10-15",
    majors: ["كافة التخصصات الأكاديمية (باستثناء التدريب السريري الطبي)"],
    apply_url: "https://foreign.fulbrightonline.org/apply",
    official_website: "https://foreign.fulbrightonline.org",
    stipend: "راتب شهري بالدولار + تغطية الرسوم الدراسية بالكامل + سكن وتأمين صحي",
    description: "البرنامج الرائد للتبادل التعليمي الدولي الذي ترعاه حكومة الولايات المتحدة، ممول بالكامل للطلاب والخريجين المتميزين.",
    description_ar: "المنحة الأمريكية الأعرق لطلاب الدراسات العليا للدراسة في أفضل جامعات أمريكا بتمويل شامل.",
    description_en: "Prestigious US Department of State fellowship for international students to pursue graduate study at US universities.",
    benefits_ar: ["رسوم دراسية كاملة", "راتب شهري لتغطية نفقات المعيشة", "تأمين صحي وإعفاء فيزا J-1", "تذاكر طيران دولية"],
    requirements_ar: ["شهادة جامعية تعادل البكالوريوس الأمريكي", "إتقان اللغة الإنجليزية", "أداء أكاديمي قوي وسجل قيادي"],
    is_featured: true,
    views_count: 2310,
    source: "curated_flagship",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_SEED_JOBS: ServerJob[] = [
  {
    id: "picalica-020",
    title_ar: "متجر بيكاليكا للمنتجات والتصاميم الرقمية (عائدات بالدولار)",
    title_en: "Picalica Digital Products & UI Marketplace",
    company: "Picalica (حسوب)",
    location: "عن بعد - العالم العربي والعالم",
    salary: "$50 - $2,500 / مبيعات متكررة",
    category: "design",
    type: "remote_freelance",
    country: "الوطن العربي / دولي",
    flag: "🎨",
    deadline: "مستمر طوال العام",
    apply_url: "https://picalica.com",
    company_url: "https://picalica.com",
    skills: ["UI Kits", "Figma", "WordPress", "Web Templates", "Graphic Assets"],
    benefits_ar: ["دخل سلبي مستمر", "سحب دوري للأرباح بالدولار", "منصة عربية موثوقة 100%"],
    description_ar: "منصة بيكاليكا التابعة لحسوب تتيح للمصممين والمطورين بيع قوالبهم وتصاميمهم الرقمية وجني دخل سلبي مستمر بالدولار.",
    description_en: "Leading Arabic digital assets marketplace by Hsoub for UI themes, code scripts, and creative goods.",
    verified: true,
    featured: true,
    source: "curated_platform",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "contra-021",
    title_ar: "شبكة كونترا العالمية للعمل الحر (0% عمولة وسحب فوري)",
    title_en: "Contra Commission-Free Global Freelance Network",
    company: "Contra Inc.",
    location: "عن بعد / Global Remote",
    salary: "$1,500 - $6,000 / شهر",
    category: "tech",
    type: "remote_contract",
    country: "عالمي",
    flag: "⚡",
    deadline: "مستمر",
    apply_url: "https://contra.com",
    company_url: "https://contra.com",
    skills: ["Frontend", "Product Design", "Marketing", "Writing", "NoCode"],
    benefits_ar: ["0% اقتطاع من الأرباح", "حماية العقود والدفع الفوري", "تواصل مباشر مع الشركات العالمية"],
    description_ar: "أحدث شبكة عمل حر عالمية تتيح للمستقلين إبراز مشاريعهم والتعاقد مع الشركات الناشئة مع الاحتفاظ بـ 100% من أتعابهم دون أي عمولة وساطة.",
    description_en: "Modern freelance platform charging 0% commission on independent contracts with top international clients.",
    verified: true,
    featured: true,
    source: "curated_platform",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "gengo-022",
    title_ar: "منصة جينجو العالمية للترجمة المباشرة (دفع بالكلمة)",
    title_en: "Gengo Global Translation Platform (Lionbridge)",
    company: "Gengo (Lionbridge)",
    location: "عن بعد / Global Remote",
    salary: "$0.06 - $0.12 / كلمة ($800 - $2,500 شهرياً)",
    category: "writing",
    type: "remote_freelance",
    country: "عالمي",
    flag: "✍️",
    deadline: "مفتوح دائماً",
    apply_url: "https://gengo.com/translators/",
    company_url: "https://gengo.com",
    skills: ["Translation", "Arabic Localization", "Proofreading", "English C1"],
    benefits_ar: ["مهام ترجمة جاهزة بدون مزايدات", "سحب منتظم عبر PayPal وبايونيير", "مرونة كاملة في ساعات العمل"],
    description_ar: "منصة تابعة لـ Lionbridge للترجمة السريعة: تجتاز اختباراً بسيطاً وتبدأ فوراً باستلام نصوص للترجمة من الإنجليزية للعربية أو العكس والدفع يتم بالكلمة.",
    description_en: "Premier cloud translation platform offering immediate translation tasks with reliable per-word USD payouts.",
    verified: true,
    featured: true,
    source: "curated_platform",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "proz-023",
    title_ar: "شبكة بروز ProZ العالمية للمترجمين المحترفين (عقود كبرى الوكالات)",
    title_en: "ProZ.com World's Largest Translation Network",
    company: "ProZ.com",
    location: "عن بعد / Global Remote",
    salary: "$1,200 - $4,500 / عقود شهرية ومشاريع",
    category: "writing",
    type: "remote_contract",
    country: "عالمي",
    flag: "🏛️",
    deadline: "مستمر",
    apply_url: "https://www.proz.com",
    company_url: "https://www.proz.com",
    skills: ["Legal Translation", "Medical Translation", "Technical Localization", "CAT Tools"],
    benefits_ar: ["أكبر قاعدة عملاء ووكالات ترجمة في العالم", "0% عمولة وسيط على العقود المباشرة", "أسعار عالمية مرتفعة"],
    description_ar: "أكبر وأعرق منصة ومجتمع للمترجمين في العالم، تضم أكثر من 1.3 مليون عضو ومئات الوكالات والمنظمات الدولية التي تطرح مشاريع مستمرة.",
    description_en: "The world's largest linguistics directory connecting translators directly with enterprise agencies and global publishers.",
    verified: true,
    featured: true,
    source: "curated_platform",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "hubstaff-024",
    title_ar: "دليل هبستاف تالنت للوظائف والتعاقد عن بعد (0% عمولة)",
    title_en: "Hubstaff Talent 100% Free Remote Job Directory",
    company: "Hubstaff Talent",
    location: "عن بعد / Global Remote",
    salary: "$1,200 - $5,000 / راتب شهري بالدولار",
    category: "tech",
    type: "remote_fulltime",
    country: "عالمي",
    flag: "💼",
    deadline: "مستمر طوال العام",
    apply_url: "https://talent.hubstaff.com",
    company_url: "https://talent.hubstaff.com",
    skills: ["Software Engineering", "Customer Support", "Digital Marketing", "Virtual Assistant"],
    benefits_ar: ["مجاني 100% مدى الحياة دون أي رسوم", "رواتب شهرية مستقرة بالدولار", "تواصل وتفاوض مباشر مع الشركات"],
    description_ar: "منصة عالمية مجانية 100% بدون أي رسوم أو اقتطاعات تربط المستقلين والمحترفين بشركات أمريكية وأوروبية تبحث عن موظفين عن بُعد برواتب شهرية.",
    description_en: "100% free platform matching remote talent with international tech startups for salaried full-time and part-time roles.",
    verified: true,
    featured: true,
    source: "curated_platform",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS: AutomationSettings = {
  publishMode: "smart_auto",
  qualityThreshold: 90,
  emailNotificationsEnabled: true,
  whatsappNotificationsEnabled: true,
  whatsappApiKey: "",
  teamRecipients: [
    {
      id: "team_super_admin",
      name: "المشرف العام (محسن)",
      email: "mohsentiben@gmail.com",
      whatsappPhone: "",
      role: "super_admin",
      notifyOn: "all",
      active: true,
      addedAt: new Date().toISOString(),
    },
  ],
  autoScheduleIntervalHours: 24,
};

function ensureDbExists(): OpportunitiesDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: OpportunitiesDatabase = {
        scholarships: INITIAL_SEED_SCHOLARSHIPS,
        jobs: INITIAL_SEED_JOBS,
        archived: [],
        pendingReviews: [],
        settings: DEFAULT_SETTINGS,
        notifications: [],
        lastUpdated: new Date().toISOString(),
        automation: {
          isRunning: false,
          lastRun: null,
          lastStatus: "idle",
          totalIngested: 0,
          logs: [
            {
              timestamp: new Date().toISOString(),
              level: "info",
              message: "تم تهيئة قاعدة بيانات الخادم المركزية للفرص والمنح بنجاح مع المنصات والمنح الكبرى المعتمدة.",
            },
          ],
        },
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed: OpportunitiesDatabase = JSON.parse(raw);

    // Merge seed data if empty & ensure fields exist
    let mutated = false;
    if (!parsed.scholarships || parsed.scholarships.length === 0) {
      parsed.scholarships = INITIAL_SEED_SCHOLARSHIPS;
      mutated = true;
    }
    if (!parsed.jobs || parsed.jobs.length === 0) {
      parsed.jobs = INITIAL_SEED_JOBS;
      mutated = true;
    }
    if (!Array.isArray(parsed.pendingReviews)) {
      parsed.pendingReviews = [];
      mutated = true;
    }
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
      mutated = true;
    } else {
      if (!parsed.settings.publishMode) {
        parsed.settings.publishMode = "smart_auto";
        mutated = true;
      }
      if (!Array.isArray(parsed.settings.teamRecipients)) {
        parsed.settings.teamRecipients = DEFAULT_SETTINGS.teamRecipients;
        mutated = true;
      }
    }
    if (!Array.isArray(parsed.notifications)) {
      parsed.notifications = [];
      mutated = true;
    }
    if (mutated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (err) {
    console.error("Error ensuring opportunities DB exists:", err);
    return {
      scholarships: INITIAL_SEED_SCHOLARSHIPS,
      jobs: INITIAL_SEED_JOBS,
      archived: [],
      pendingReviews: [],
      settings: DEFAULT_SETTINGS,
      notifications: [],
      lastUpdated: new Date().toISOString(),
      automation: {
        isRunning: false,
        lastRun: null,
        lastStatus: "idle",
        totalIngested: 0,
        logs: [],
      },
    };
  }
}

function writeDb(db: OpportunitiesDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write opportunities DB:", err);
  }
}

export const opportunitiesDb = {
  get(): OpportunitiesDatabase {
    return ensureDbExists();
  },

  // Add or Update Scholarship
  upsertScholarship(item: ServerScholarship): { success: boolean; item: ServerScholarship; isNew: boolean } {
    const db = ensureDbExists();
    const now = new Date().toISOString();

    const normalized: ServerScholarship = {
      ...item,
      id: item.id || `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || now,
      updatedAt: now,
      is_featured: item.is_featured ?? false,
    };

    const idx = db.scholarships.findIndex(
      s => s.id === normalized.id || (s.url && normalized.url && s.url.trim().toLowerCase() === normalized.url.trim().toLowerCase())
    );

    let isNew = false;
    if (idx >= 0) {
      db.scholarships[idx] = { ...db.scholarships[idx], ...normalized, updatedAt: now };
    } else {
      db.scholarships.unshift(normalized);
      isNew = true;
    }

    // Remove from archived if present
    db.archived = db.archived.filter(a => a.id !== normalized.id);

    writeDb(db);
    return { success: true, item: normalized, isNew };
  },

  // Delete / Archive Scholarship
  deleteScholarship(id: string, reason?: string, user?: any): boolean {
    const db = ensureDbExists();
    const existing = db.scholarships.find(s => s.id === id);
    if (!existing) return false;

    db.scholarships = db.scholarships.filter(s => s.id !== id);
    db.archived.unshift({
      id,
      type: "scholarship",
      itemData: existing,
      deletedAt: new Date().toISOString(),
      deletedBy: user || { id: "admin", name: "إدارة النظام", role: "super_admin" },
      reason: reason || "حذف من لوحة الإدارة",
    });

    writeDb(db);
    return true;
  },

  // Add or Update Job
  upsertJob(job: ServerJob): { success: boolean; item: ServerJob; isNew: boolean } {
    const db = ensureDbExists();
    const now = new Date().toISOString();

    const normalized: ServerJob = {
      ...job,
      id: job.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: job.createdAt || now,
      updatedAt: now,
      verified: job.verified ?? true,
    };

    const idx = db.jobs.findIndex(
      j => j.id === normalized.id || (j.apply_url && normalized.apply_url && j.apply_url.trim().toLowerCase() === normalized.apply_url.trim().toLowerCase())
    );

    let isNew = false;
    if (idx >= 0) {
      db.jobs[idx] = { ...db.jobs[idx], ...normalized, updatedAt: now };
    } else {
      db.jobs.unshift(normalized);
      isNew = true;
    }

    // Remove from archived if present
    db.archived = db.archived.filter(a => a.id !== normalized.id);

    writeDb(db);
    return { success: true, item: normalized, isNew };
  },

  // Delete / Archive Job
  deleteJob(id: string, reason?: string, user?: any): boolean {
    const db = ensureDbExists();
    const existing = db.jobs.find(j => j.id === id);
    if (!existing) return false;

    db.jobs = db.jobs.filter(j => j.id !== id);
    db.archived.unshift({
      id,
      type: "job",
      itemData: existing,
      deletedAt: new Date().toISOString(),
      deletedBy: user || { id: "admin", name: "إدارة النظام", role: "super_admin" },
      reason: reason || "حذف من لوحة الإدارة",
    });

    writeDb(db);
    return true;
  },

  // Append automation log
  addLog(level: "info" | "success" | "warn" | "error", message: string): void {
    const db = ensureDbExists();
    db.automation.logs.unshift({
      timestamp: new Date().toISOString(),
      level,
      message,
    });
    // Keep last 100 logs
    if (db.automation.logs.length > 100) {
      db.automation.logs = db.automation.logs.slice(0, 100);
    }
    writeDb(db);
  },

  setAutomationRunning(isRunning: boolean, status: "idle" | "running" | "completed" | "failed"): void {
    const db = ensureDbExists();
    db.automation.isRunning = isRunning;
    db.automation.lastStatus = status;
    if (isRunning) {
      db.automation.lastRun = new Date().toISOString();
    }
    writeDb(db);
  },

  incrementIngestedCount(count: number): void {
    const db = ensureDbExists();
    db.automation.totalIngested = (db.automation.totalIngested || 0) + count;
    writeDb(db);
  },

  // Settings Management
  getSettings(): AutomationSettings {
    const db = ensureDbExists();
    return db.settings || DEFAULT_SETTINGS;
  },

  updateSettings(partial: Partial<AutomationSettings>): AutomationSettings {
    const db = ensureDbExists();
    db.settings = {
      ...(db.settings || DEFAULT_SETTINGS),
      ...partial,
      teamRecipients: partial.teamRecipients || db.settings?.teamRecipients || DEFAULT_SETTINGS.teamRecipients,
    };
    writeDb(db);
    return db.settings;
  },

  // Pending Reviews Management
  getPendingReviews(): PendingOpportunityItem[] {
    const db = ensureDbExists();
    return db.pendingReviews || [];
  },

  addPendingReview(item: Omit<PendingOpportunityItem, "id" | "addedAt" | "status">): PendingOpportunityItem {
    const db = ensureDbExists();
    const newItem: PendingOpportunityItem = {
      ...item,
      id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      addedAt: new Date().toISOString(),
      status: "pending",
    };

    if (!Array.isArray(db.pendingReviews)) {
      db.pendingReviews = [];
    }

    // Check if already in pending
    const existingIdx = db.pendingReviews.findIndex(p => {
      if (p.type === item.type) {
        if (p.type === "scholarship") {
          return p.itemData?.url && item.itemData?.url && p.itemData.url === item.itemData.url;
        } else {
          return p.itemData?.apply_url && item.itemData?.apply_url && p.itemData.apply_url === item.itemData.apply_url;
        }
      }
      return false;
    });

    if (existingIdx >= 0) {
      db.pendingReviews[existingIdx] = {
        ...db.pendingReviews[existingIdx],
        ...newItem,
        id: db.pendingReviews[existingIdx].id,
      };
    } else {
      db.pendingReviews.unshift(newItem);
    }

    writeDb(db);
    return newItem;
  },

  approvePendingReview(id: string, reviewerUser?: any): { success: boolean; item?: any; error?: string } {
    const db = ensureDbExists();
    const idx = (db.pendingReviews || []).findIndex(p => p.id === id);
    if (idx === -1) {
      return { success: false, error: "العنصر غير موجود في المراجعات المعلقة" };
    }

    const pendingItem = db.pendingReviews[idx];
    let publishedItem: any = null;

    if (pendingItem.type === "scholarship") {
      const res = this.upsertScholarship({
        ...pendingItem.itemData,
        source: pendingItem.itemData?.source ? `${pendingItem.itemData.source} (تمت المراجعة والاعتماد)` : "معتمد من الإدارة",
      });
      publishedItem = res.item;
    } else {
      const res = this.upsertJob({
        ...pendingItem.itemData,
        verified: true,
        source: pendingItem.itemData?.source ? `${pendingItem.itemData.source} (تمت المراجعة والاعتماد)` : "معتمد من الإدارة",
      });
      publishedItem = res.item;
    }

    // Remove from pending reviews
    db.pendingReviews.splice(idx, 1);
    writeDb(db);

    this.addLog(
      "success",
      `تمت الموافقة ونشر الفرصة (${pendingItem.type === "scholarship" ? "منحة" : "وظيفة"}): ${
        pendingItem.itemData?.title || pendingItem.itemData?.title_ar
      } بواسطة ${reviewerUser?.name || "المشرف"}`
    );

    return { success: true, item: publishedItem };
  },

  rejectPendingReview(id: string, reason?: string, reviewerUser?: any): boolean {
    const db = ensureDbExists();
    const idx = (db.pendingReviews || []).findIndex(p => p.id === id);
    if (idx === -1) return false;

    const rejected = db.pendingReviews[idx];
    db.pendingReviews.splice(idx, 1);

    // Archive rejection
    db.archived.unshift({
      id: rejected.id,
      type: rejected.type,
      itemData: rejected.itemData,
      deletedAt: new Date().toISOString(),
      deletedBy: reviewerUser || { id: "admin", name: "إدارة النظام", role: "super_admin" },
      reason: reason || "تم رفض النشر من المراجعات المعلقة (غير مكتملة أو غير مناسبة)",
    });

    writeDb(db);
    this.addLog(
      "warn",
      `تم رفض واستبعاد الفرصة المعلقة: ${rejected.itemData?.title || rejected.itemData?.title_ar} - السبب: ${
        reason || "استبعاد المشرف"
      }`
    );
    return true;
  },

  // Notification logs
  addNotificationLog(entry: Omit<NotificationHistoryEntry, "id" | "timestamp">): NotificationHistoryEntry {
    const db = ensureDbExists();
    const newLog: NotificationHistoryEntry = {
      ...entry,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    if (!Array.isArray(db.notifications)) {
      db.notifications = [];
    }
    db.notifications.unshift(newLog);
    if (db.notifications.length > 50) {
      db.notifications = db.notifications.slice(0, 50);
    }
    writeDb(db);
    return newLog;
  },

  getNotificationHistory(): NotificationHistoryEntry[] {
    const db = ensureDbExists();
    return db.notifications || [];
  },
};
