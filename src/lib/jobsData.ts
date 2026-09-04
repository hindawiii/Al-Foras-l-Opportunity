export type JobCategory = "programming" | "design" | "writing" | "teaching" | "trades" | "content" | "entry" | "new";
export type JobRegion = "all" | "arab" | "global" | "europe" | "americas" | "asia_africa";

export interface JobStep {
  step: number;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  tips?: string;
  tipsEn?: string;
}

export interface JobStory {
  name: string;
  nameEn?: string;
  city?: string;
  cityEn?: string;
  currentLocation?: string;
  currentLocationEn?: string;
  earnings?: string;
  earningsEn?: string;
  story: string;
  storyEn?: string;
  tips?: string;
  tipsEn?: string;
  profileUrl?: string;
  profileType?: "linkedin" | "portfolio" | "twitter" | "github" | "official";
  verified?: boolean;
}

export type EligibilityType = 
  | "saudi_exclusive"            // حصري للمواطنين في السعودية (عمل مرن/توطين)
  | "saudi_residents_and_remote" // متاح للسعوديين والمقيمين + عن بُعد
  | "all_arab"                   // متاح لكافة الدول العربية
  | "global_remote"              // متاح دولياً (عن بُعد)
  | "custom";

export interface SmartEligibility {
  type: EligibilityType;
  badgeAr: string;
  badgeEn: string;
  reasonAr: string;
  reasonEn: string;
  proofSourceUrl?: string;
  proofSourceNameAr?: string;
  proofSourceNameEn?: string;
  targetCountries?: string[];
}

export interface PaymentMethod {
  name: string;
  nameEn?: string;
  availableInSudan: boolean;
  notes?: string;
  notesEn?: string;
  alternativeForSudan?: string;
  alternativeForSudanEn?: string;
}

export interface Job {
  id: string;
  title: string;
  titleEn?: string;
  company: string;
  emoji: string;
  type: string;
  typeEn?: string;
  category: JobCategory;
  region?: JobRegion;
  regionLabel?: { ar: string; en: string };
  subCategory?: string;
  subCategoryEn?: string;
  availability: {
    global: boolean;
    countries: string[];
    countriesEn?: string[];
    restrictedCountries: string[];
    notes?: string;
    notesEn?: string;
  };
  salary: { min: number; max: number; currency: string; period: "hour" | "month" | "project"; average?: string };
  withdrawal: {
    minAmount: number;
    currency: string;
    methods: PaymentMethod[];
    processingTime?: string;
    processingTimeEn?: string;
  };
  commission?: { percentage: string; notes?: string; notesEn?: string };
  rating: { score: number; totalReviews: number; trustLevel: string; trustLevelEn?: string };
  description: string;
  descriptionEn?: string;
  requirements: string[];
  requirementsEn?: string[];
  skills: string[];
  skillsEn?: string[];
  registrationGuide: {
    steps: JobStep[];
    estimatedTime?: string;
    estimatedTimeEn?: string;
    videoTutorial?: string;
  };
  contact: {
    website?: string;
    email?: string;
    whatsapp?: string | null;
    facebook?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    supportCenter?: string;
  };
  successStories: JobStory[];
  pros: string[];
  prosEn?: string[];
  cons: string[];
  consEn?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  eligibility?: SmartEligibility;
  dateAdded: string;
}

export const JOB_CATEGORIES: { id: JobCategory | "all"; label: string; labelEn: string; emoji: string }[] = [
  { id: "all", label: "الكل", labelEn: "All", emoji: "🌟" },
  { id: "programming", label: "برمجة وويب", labelEn: "Dev & Code", emoji: "💻" },
  { id: "design", label: "تصميم وإبداع", labelEn: "Design & UI", emoji: "🎨" },
  { id: "writing", label: "كتابة وترجمة", labelEn: "Writing & Translation", emoji: "✍️" },
  { id: "teaching", label: "تدريس ولغات", labelEn: "Tutoring & Languages", emoji: "🎓" },
  { id: "trades", label: "مهني وإداري", labelEn: "Admin & Operations", emoji: "🔧" },
  { id: "content", label: "صوت وفيديو وصناع محتوى", labelEn: "Content & Voice", emoji: "🎙️" },
  { id: "entry", label: "مبتدئ / بدون خبرة", labelEn: "Entry Level", emoji: "💰" },
  { id: "new", label: "منصات جديدة", labelEn: "Newly Added", emoji: "🆕" },
];

export const REGIONS_LIST: { id: JobRegion; labelAr: string; labelEn: string; flag: string }[] = [
  { id: "all", labelAr: "جميع القارات", labelEn: "All Regions", flag: "🌍" },
  { id: "arab", labelAr: "الوطن العربي", labelEn: "Arab World", flag: "🇸🇦" },
  { id: "americas", labelAr: "أمريكا والعالم", labelEn: "Americas & Global", flag: "🇺🇸" },
  { id: "europe", labelAr: "أوروبا وبريطانيا", labelEn: "Europe & UK", flag: "🇪🇺" },
  { id: "asia_africa", labelAr: "آسيا وإفريقيا", labelEn: "Asia & Africa", flag: "🌏" },
];

export const JOBS: Job[] = [
  // 1. Upwork (Global)
  {
    id: "upwork-001",
    title: "مطور برمجيات وتطبيقات ومواقع",
    titleEn: "Software & Web Developer",
    company: "Upwork",
    emoji: "💻",
    type: "فريلانسر عن بُعد",
    typeEn: "Remote Freelancer",
    category: "programming",
    region: "americas",
    regionLabel: { ar: "أمريكا والعالم", en: "Americas & Global" },
    subCategory: "تطوير الويب والبرمجيات",
    subCategoryEn: "Web & Software Development",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "متاح لجميع الدول ومفتوح للتسجيل",
      notesEn: "Available worldwide and open for registration",
    },
    salary: { min: 25, max: 90, currency: "USD", period: "hour", average: "45" },
    withdrawal: {
      minAmount: 100,
      currency: "USD",
      methods: [
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "يعمل في السودان ويوفر بطاقة ماستركارد", notesEn: "Works in Sudan and provides a Mastercard" },
        { name: "تحويل بنكي مباشر", nameEn: "Direct Bank Transfer", availableInSudan: true, notes: "إلى حسابك البنكي بالعملة الأجنبية", notesEn: "To local bank with foreign currency" },
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, alternativeForSudan: "Payoneer", alternativeForSudanEn: "Payoneer" },
      ],
      processingTime: "2-4 أيام عمل",
      processingTimeEn: "2-4 business days",
    },
    commission: { percentage: "10%", notes: "تنخفض مع زيادة حجم المشاريع", notesEn: "Decreases with higher billing" },
    rating: { score: 4.8, totalReviews: 180000, trustLevel: "عالي جداً", trustLevelEn: "Very High" },
    description: "أكبر منصة عمل حر في العالم تربط المبرمجين والمستقلين بالشركات ورواد الأعمال عبر 180 دولة.",
    descriptionEn: "The world's largest freelancing marketplace connecting developers and experts with clients across 180 countries.",
    requirements: ["خبرة عملية في لغة برمجية أو إطار عمل", "محفظة أعمال وروابط مشاريع سابقة", "إنجليزية جيدة للتواصل والمقابلات"],
    requirementsEn: ["Hands-on programming experience", "Portfolio with live sample links", "Working English for communication"],
    skills: ["React", "TypeScript", "Python", "Node.js", "Flutter", "Tailwind CSS"],
    skillsEn: ["React", "TypeScript", "Python", "Node.js", "Flutter", "Tailwind CSS"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب فريلانسر", titleEn: "Create Freelancer Account", description: "ادخل إلى موقع Upwork وسجل حساباً بصفتك Freelancer", descriptionEn: "Visit Upwork and sign up as a Freelancer", tips: "استخدم اسمك الحقيقي وإيميلك المهني", tipsEn: "Use real legal name and professional email" },
        { step: 2, title: "إكمال الملف الشخصي 100%", titleEn: "Complete Profile 100%", description: "أضف صورة شخصية واضحة ونبذة قوية ومعرض أعمالك", descriptionEn: "Upload clear photo, strong bio, and project showcase", tips: "ركز على القيمة التي ستقدمها للعميل", tipsEn: "Highlight real client value" },
        { step: 3, title: "ربط وسيلة الدفع", titleEn: "Set Up Payout Method", description: "اربط حساب Payoneer أو بيانات الحساب البنكي", descriptionEn: "Link Payoneer account or wire transfer details", tips: "تأكد من مطابقة اسم الحساب مع هويتك", tipsEn: "Ensure names match your ID" },
        { step: 4, title: "التقديم على المشاريع", titleEn: "Send Tailored Proposals", description: "قدّم عروضاً مخصصة للمشاريع المنشورة حديثاً", descriptionEn: "Submit personalized proposals to newly posted projects", tips: "ابدأ بأسعار منافسة لبناء تقييماتك الأولى", tipsEn: "Offer competitive rates early on" },
      ],
      estimatedTime: "30 دقيقة",
      estimatedTimeEn: "30 minutes",
    },
    contact: { website: "https://www.upwork.com" },
    successStories: [
      { 
        name: "محمد الطيب", 
        nameEn: "Mohammed El-Tayeb", 
        city: "الخرطوم / القاهرة", 
        cityEn: "Khartoum / Cairo", 
        earnings: "$2,800 / شهر", 
        earningsEn: "$2,800 / mo", 
        story: "بدأت من الصفر كمطور React وحققت تقييم Top Rated في 6 أشهر.", 
        storyEn: "Started from scratch in React and achieved Top Rated status in 6 months.",
        profileUrl: "https://www.linkedin.com/company/upwork/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أكبر حجم مشاريع في العالم", "حماية كاملة للدفعات بنظام Escrow", "إمكانية العمل بعقود طويلة الأجل"],
    prosEn: ["Largest volume of global projects", "Full Escrow payment protection", "Long-term contract opportunities"],
    cons: ["منافسة قوية في البداية", "عمولة 10%"],
    consEn: ["High initial competition", "10% platform fee"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "🌐 متاح دولياً عن بُعد (عقود بالدولار)",
      badgeEn: "🌐 Open Globally (USD Contracts)",
      reasonAr: "أكبر منصة عالمية للعمل الحر تقبل المستقلين من كافة دول العالم مع سحب مباشر عبر Payoneer وتحويلات بنكية وحماية بنظام Escrow.",
      reasonEn: "The world's largest marketplace accepting global freelancers with direct Payoneer, wire payouts, and escrow protection.",
      proofSourceUrl: "https://www.upwork.com/legal#terms",
      proofSourceNameAr: "اتفاقية وشروط استخدام منصة Upwork العالمية",
      proofSourceNameEn: "Upwork Global Terms of Service",
      targetCountries: ["GLOBAL"]
    },
    dateAdded: "2026-08-01",
  },

  // 2. Mostaql (Arab World)
  {
    id: "mostaql-001",
    title: "مشاريع عمل حر شاملة (برمجة، تصميم، كتابة، تسويق)",
    titleEn: "Freelance Projects (Dev, Design, Writing, Marketing)",
    company: "Mostaql (مستقل - حسوب)",
    emoji: "🚀",
    type: "فريلانسر عربي",
    typeEn: "Arabic Freelancer",
    category: "programming",
    region: "arab",
    regionLabel: { ar: "الوطن العربي", en: "Arab World" },
    subCategory: "كافة المجالات المهنية",
    subCategoryEn: "All Professional Fields",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "المنصة العربية الأولى بدون قيود على الدول العربية",
      notesEn: "Leading Arabic platform with full regional accessibility",
    },
    salary: { min: 25, max: 2000, currency: "USD", period: "project", average: "250" },
    withdrawal: {
      minAmount: 25,
      currency: "USD",
      methods: [
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, alternativeForSudan: "حساب بنكي / وسيط حسوب", alternativeForSudanEn: "Bank / Hsoub Partner" },
        { name: "تحويل بنكي / وايز", nameEn: "Bank Wire / Wise", availableInSudan: true, notes: "متاح للحسابات البنكية بالدولار أو الشركاء المعتمدين", notesEn: "Available for USD bank accounts or verified partners" },
      ],
      processingTime: "24-48 ساعة بعد انتهاء فترة التعليق",
      processingTimeEn: "24-48 hours after clearing period",
    },
    commission: { percentage: "15% - 20%", notes: "تنخفض مع زيادة التكرار مع نفس العميل", notesEn: "Decreases on recurring client contracts" },
    rating: { score: 4.9, totalReviews: 95000, trustLevel: "ممتاز وموثوق 100%", trustLevelEn: "Excellent & 100% Trusted" },
    description: "أكبر شبكة عمل حر باللغة العربية تابعة لشركة حسوب، تتيح لك تقديم عروض على مشاريع أصحاب الأعمال والشركات في الخليج والعالم العربي.",
    descriptionEn: "The premier Arabic freelancing platform by Hsoub, enabling talent to bid on projects across GCC and MENA regions.",
    requirements: ["معرض أعمال حقيقي ونماذج سابقة", "أسلوب تواصل مهني باللغة العربية", "الالتزام بالمواعيد المحددة"],
    requirementsEn: ["Solid portfolio with sample work", "Professional Arabic communication", "Strict adherence to deadlines"],
    skills: ["تطوير الويب", "التصميم الجرافيكي", "الكتابة والترجمة", "التسويق الإلكتروني", "المونتاج"],
    skillsEn: ["Web Dev", "Graphic Design", "Writing & Translation", "Digital Marketing", "Video Editing"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب حسوب الموحد", titleEn: "Create Unified Hsoub Account", description: "سجل في مستقل عبر حساب حسوب مجاناً", descriptionEn: "Sign up on Mostaql via Hsoub account for free", tips: "أكد رقم هاتفك وبريدك الإلكتروني", tipsEn: "Verify your email and phone number" },
        { step: 2, title: "رفع الأعمال إلى معرض الأعمال", titleEn: "Upload Portfolio Items", description: "أضف أفضل 5 نماذج لأعمالك مع صور وشروحات واضحة", descriptionEn: "Add your top 5 projects with high-quality screenshots", tips: "معرض الأعمال هو العامل الحاسم في قبول عروضك", tipsEn: "Portfolio quality is the primary selection factor" },
        { step: 3, title: "كتابة عرض احترافي", titleEn: "Submit Professional Proposal", description: "اقرأ تفاصيل المشروع واشرح كيف ستحل المشكلة بالتحديد", descriptionEn: "Carefully review requirements and provide a targeted solution", tips: "تجنب النسخ واللصق وركز على استفسارات العميل", tipsEn: "Avoid generic templates" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://mostaql.com" },
    successStories: [
      { 
        name: "سارة عبد الله", 
        nameEn: "Sara Abdullah", 
        city: "بورتسودان / الرياض", 
        cityEn: "Port Sudan / Riyadh", 
        earnings: "$1,900 / شهر", 
        earningsEn: "$1,900 / mo", 
        story: "حققت أكثر من 40 مشروعاً مكتملاً في تصميم الهويات وتطبيقات الجوال.", 
        storyEn: "Delivered over 40 successful branding and mobile design projects.",
        profileUrl: "https://www.linkedin.com/company/mostaql/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["تواصل كامل باللغة العربية", "طلب عالي جداً من عملاء الخليج", "دعم فني سريع وحماية تامة للحقوق"],
    prosEn: ["100% Arabic interface & communication", "Huge demand from Gulf clients", "Dedicated support and Escrow protection"],
    cons: ["فترة تعليق الرصيد 14 يوم للأمان"],
    consEn: ["14-day security holding period for funds"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 متاح لكافة الدول العربية (ضمان حقوق كامل)",
      badgeEn: "🌍 Open to All Arab Countries (Full Escrow)",
      reasonAr: "المنصة العربية الأولى للمشاريع المستقلة تابعة لشركة حسوب، مفتوحة لجميع الكفاءات والمستقلين من كافة الدول العربية بدون أي استثناء مع ضمان مالي كامل.",
      reasonEn: "The leading Arab freelance platform by Hsoub, open to all professionals across all Arab countries with full escrow payment protection.",
      proofSourceUrl: "https://mostaql.com/terms",
      proofSourceNameAr: "شروط وضمانات منصة مستقل الرسمية (حسوب)",
      proofSourceNameEn: "Mostaql Official Terms & Guarantees",
      targetCountries: ["ALL_ARAB"]
    },
    dateAdded: "2026-08-05",
  },

  // 3. Khamsat (Arab World)
  {
    id: "khamsat-001",
    title: "سوق بيع وشراء الخدمات المصغرة (من 5$ إلى 500$)",
    titleEn: "Microservices Marketplace ($5 to $500)",
    company: "Khamsat (خمسات - حسوب)",
    emoji: "⭐",
    type: "خدمات مصغرة",
    typeEn: "Microservices",
    category: "entry",
    region: "arab",
    regionLabel: { ar: "الوطن العربي", en: "Arab World" },
    subCategory: "خدمات مصغرة سريعة",
    subCategoryEn: "Fast Micro-Gigs",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "مثالي للمبتدئين ولأي شخص لديه مهارة محددة",
      notesEn: "Ideal for beginners with specific digital skills",
    },
    salary: { min: 5, max: 350, currency: "USD", period: "project", average: "40" },
    withdrawal: {
      minAmount: 10,
      currency: "USD",
      methods: [
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, alternativeForSudan: "حساب حسوب المشترك", alternativeForSudanEn: "Hsoub Balance" },
        { name: "حساب بنكي / شركاء", nameEn: "Bank Wire / Partners", availableInSudan: true, notes: "عبر منظومة حسوب المالية", notesEn: "Via Hsoub payout system" },
      ],
      processingTime: "فوري بعد فترة التعليق",
      processingTimeEn: "Instant after holding period",
    },
    commission: { percentage: "20%", notes: "1 دولار لكل 5 دولار خدمة", notesEn: "$1 fee per $5 basic service" },
    rating: { score: 4.8, totalReviews: 120000, trustLevel: "عالي ومناسب جداً للمبتدئين", trustLevelEn: "High & Beginner Friendly" },
    description: "المنصة العربية الأولى لبيع الخدمات الرقمية الجاهزة (كتابة، تفريغ، تصميم لوجو، ترجمة، تعليق صوتي، إدخال بيانات).",
    descriptionEn: "The premier Arabic marketplace for buying and selling digital micro-services (design, translation, voice-over, data entry).",
    requirements: ["مهارة رقمية محددة يمكنك تقديمها بجودة عالية", "وصف واضح للخدمة وتحديد وقت التسليم بدقة", "حسن المعاملة وسرعة الرد"],
    requirementsEn: ["A concrete digital skill you can deliver reliably", "Clear service description and delivery deadline", "Polite and responsive customer service"],
    skills: ["تصميم أغلفة وشعارات", "ترجمة وتدقيق لغوي", "تفريغ صوتي وإدخال بيانات", "تعليق صوتي", "برمجة تعديلات بسيطة"],
    skillsEn: ["Logo Design", "Translation & Proofreading", "Transcription & Data Entry", "Voice-Over", "Web Fixes"],
    registrationGuide: {
      steps: [
        { step: 1, title: "تسجيل الدخول بحساب حسوب", titleEn: "Login via Hsoub", description: "ادخل إلى khamsat.com وسجل مجاناً", descriptionEn: "Visit khamsat.com and join for free", tips: "اختر اسماً مهنياً وصورة واضحة", tipsEn: "Choose a professional username" },
        { step: 2, title: "إضافة خدمتك الأولى", titleEn: "Publish First Service", description: "اكتب عنواناً دقيقاً ووصفاً جذاباً مع صورة نموذجية مميزة", descriptionEn: "Write a clear title, thorough description, and cover image", tips: "قدم نموذجاً سريعاً بسعر 5$ لاكتساب أول تقييمات", tipsEn: "Offer generous base deliverables for your first reviews" },
        { step: 3, title: "التسويق في مجتمع خمسات", titleEn: "Participate in Community", description: "تفاعل في قسم (طلبات الخدمات غير الموجودة)", descriptionEn: "Engage in the (Requests for Services) community section", tips: "رد فورياً على المشترين الذين يبحثون عن خدمتك", tipsEn: "Reply promptly to potential buyers" },
      ],
      estimatedTime: "15 دقيقة",
      estimatedTimeEn: "15 minutes",
    },
    contact: { website: "https://khamsat.com" },
    successStories: [
      { 
        name: "عثمان الفاتح", 
        nameEn: "Osman El-Fatih", 
        city: "أم درمان / دبي", 
        cityEn: "Omdurman / Dubai", 
        earnings: "$950 / شهر", 
        earningsEn: "$950 / mo", 
        story: "بدأت بتقديم خدمات الترجمة وكتابة السير الذاتية ووصلت لرتبة بائع مميز.", 
        storyEn: "Started with translation and CV writing and attained Featured Seller badge.",
        profileUrl: "https://www.linkedin.com/company/khamsat/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["لا يتطلب خبرة معقدة للبدء", "سهولة بيع نفس الخدمة لمئات المشترين", "إقبال كبير ومستمر"],
    prosEn: ["Very easy to start without advanced credentials", "Sell same service repeatedly to hundreds", "High continuous traffic"],
    cons: ["الأسعار الأولية تبدأ من 5$ فقط"],
    consEn: ["Base gig price starts at $5"],
    isNew: false,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 متاح لجميع المبتدئين العرب (سوق الخدمات المصغرة)",
      badgeEn: "🌍 Open to All Arab Freelancers (Micro-Services)",
      reasonAr: "بوابة الخدمات المصغرة التابعة لحسوب، تتيح لأي شخص من الدول العربية بدء بيع الخدمات الرقمية بحد أدنى 5 دولار وسحب الأرباح بسهولة.",
      reasonEn: "The leading micro-service marketplace by Hsoub, open to creators across the Arab world to sell digital services starting from $5.",
      proofSourceUrl: "https://khamsat.com/terms",
      proofSourceNameAr: "شروط استخدام وضمانات خمسات الرسمية",
      proofSourceNameEn: "Khamsat Official Terms of Service",
      targetCountries: ["ALL_ARAB"]
    },
    dateAdded: "2026-08-02",
  },

  // 4. Bahr (Saudi Arabia & Arab World)
  {
    id: "bahr-001",
    title: "منصة بحر للعمل الحر المعتمدة في السعودية والخليج",
    titleEn: "Bahr Freelance Platform (Saudi & GCC)",
    company: "Bahr (بحر - تسعة أعشار)",
    emoji: "🇸🇦",
    type: "منصة خليجية معتمدة",
    typeEn: "Certified GCC Platform",
    category: "programming",
    region: "arab",
    regionLabel: { ar: "الوطن العربي", en: "Arab World" },
    subCategory: "مشاريع شركات ومؤسسات خليجية",
    subCategoryEn: "GCC Corporate Projects",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "متاح للمستقلين العرب مع مشاريع مدفوعة بالريال السعودي",
      notesEn: "Available for Arab freelancers with SAR payouts",
    },
    salary: { min: 50, max: 3000, currency: "USD", period: "project", average: "400" },
    withdrawal: {
      minAmount: 50,
      currency: "SAR",
      methods: [
        { name: "تحويل بنكي IBAN", nameEn: "Direct IBAN Transfer", availableInSudan: true, notes: "إلى أي حساب بنكي دولي أو خليجي", notesEn: "To international or GCC bank account" },
      ],
      processingTime: "3-5 أيام عمل",
      processingTimeEn: "3-5 business days",
    },
    commission: { percentage: "5% - 10%", notes: "عمولة منخفضة جداً مقارنة بالمنصات العالمية", notesEn: "Very low commission structure" },
    rating: { score: 4.9, totalReviews: 45000, trustLevel: "حكومي / موثوق 100%", trustLevelEn: "Government Backed & 100% Trusted" },
    description: "منصة عمل حر تابعة لبرنامج تسعة أعشار وصندوق تنمية الموارد البشرية السعودي (هدف)، تجمع نخبة المستقلين بالشركات والمؤسسات.",
    descriptionEn: "Official freelance portal by 9/10ths and HRDF in Saudi Arabia, connecting talent with enterprises across the GCC.",
    requirements: ["ملف مهني مكتمل وتوثيق الهوية", "خبرة في مجالات تقنية أو إبداعية أو استشارية", "سجل أعمال موثق"],
    requirementsEn: ["Verified profile and ID", "Technical, creative, or consulting expertise", "Proven project track record"],
    skills: ["تطوير الويب", "التطبيقات", "التصميم والهوية", "الاستشارات المالية", "إدارة المحتوى"],
    skillsEn: ["Web Dev", "Mobile Apps", "Brand Design", "Financial Consulting", "Content Ops"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل في منصة بحر", titleEn: "Register on Bahr", description: "ادخل إلى bahr.910ths.sa وسجل حساب مستقل", descriptionEn: "Visit bahr.910ths.sa and register as a freelancer", tips: "أدخل بياناتك وخبراتك بدقة", tipsEn: "Fill in accurate qualifications" },
        { step: 2, title: "توثيق الحساب", titleEn: "Verify Profile", description: "ارفع وثيقة إثبات الهوية ومعرض أعمالك", descriptionEn: "Submit government ID and portfolio links", tips: "الحساب الموثق يحصل على أولوية عروض", tipsEn: "Verified profiles get bidding priority" },
      ],
      estimatedTime: "25 دقيقة",
      estimatedTimeEn: "25 minutes",
    },
    contact: { website: "https://bahr.910ths.sa" },
    successStories: [
      { 
        name: "خالد إبراهيم", 
        nameEn: "Khaled Ibrahim", 
        city: "جدة / الخرطوم", 
        cityEn: "Jeddah / Khartoum", 
        earnings: "$3,200 / شهر", 
        earningsEn: "$3,200 / mo", 
        story: "أنفذ مشاريع تطوير أنظمة داخلية لشركات ناشئة ومؤسسات كبرى.", 
        storyEn: "Delivered customized ERP and backend systems for GCC startups.",
        profileUrl: "https://www.linkedin.com/company/910ths/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أجور وميزانيات عالية بالريال السعودي والدولار", "عمولة منخفضة جداً", "مشاريع مؤسسية موثوقة"],
    prosEn: ["High budgets in SAR & USD", "Very low fee rate", "Trusted corporate clients"],
    cons: ["إجراءات توثيق تتطلب دقة الهوية"],
    consEn: ["Strict ID verification requirement"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "gulf_focused",
      badgeAr: "🇸🇦 معتمد في الخليج والعالم العربي (توثيق هوية)",
      badgeEn: "🇸🇦 Certified in GCC & Arab World (ID Required)",
      reasonAr: "منصة معتمدة تابعة لمنظومة تسعة أعشار وصندوق تنمية الموارد البشرية السعودي (هدف)، متاحة للمستقلين العرب مع توثيق الهوية وحساب بنكي بالريال السعودي أو الدولي.",
      reasonEn: "Official government-backed platform by HRDF Saudi Arabia open to GCC and Arab professionals with ID verification.",
      proofSourceUrl: "https://bahr.910ths.sa",
      proofSourceNameAr: "بوابة تسعة أعشار الحكومية السعودية - منصة بحر",
      proofSourceNameEn: "9/10ths HRDF Portal - Bahr Platform",
      targetCountries: ["SA", "AE", "KW", "QA", "OM", "BH", "ALL_ARAB"]
    },
    dateAdded: "2026-08-10",
  },

  // 5. Fiverr (Global / Americas)
  {
    id: "fiverr-001",
    title: "سوق العمل الحر العالمي للخدمات الرقمية (Fiverr)",
    titleEn: "Global Freelance Services Marketplace (Fiverr)",
    company: "Fiverr",
    emoji: "🟢",
    type: "سوق عالمي Gigs",
    typeEn: "Global Gigs Marketplace",
    category: "design",
    region: "americas",
    regionLabel: { ar: "أمريكا والعالم", en: "Americas & Global" },
    subCategory: "تصميم، برمجة، فيديو، صوت، وترجمة",
    subCategoryEn: "Design, Dev, Video, Voice & Translation",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "يعمل مع المشترين من أكثر من 160 دولة حول العالم",
      notesEn: "Serving clients from over 160 countries worldwide",
    },
    salary: { min: 10, max: 1500, currency: "USD", period: "project", average: "120" },
    withdrawal: {
      minAmount: 20,
      currency: "USD",
      methods: [
        { name: "Payoneer (Fiverr Revenue Card)", nameEn: "Payoneer Card", availableInSudan: true, notes: "الخيار الأفضل للسودانيين والعرب لسحب الأرباح فوراً", notesEn: "Best option for Sudan and Arab region instant payout" },
        { name: "تحويل بنكي مباشر", nameEn: "Direct Bank Transfer", availableInSudan: true, notes: "متاح إلى حسابك البنكي الدولي", notesEn: "Available to international accounts" },
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, alternativeForSudan: "Payoneer", alternativeForSudanEn: "Payoneer" },
      ],
      processingTime: "فوري عبر Payoneer",
      processingTimeEn: "Instant via Payoneer",
    },
    commission: { percentage: "20%", notes: "العميل يدفع رسوم خدمة إضافية أيضاً", notesEn: "Standard service tier" },
    rating: { score: 4.7, totalReviews: 220000, trustLevel: "عالمي معتمد", trustLevelEn: "Global Verified" },
    description: "المنصة العالمية الأوسع شهرة لعرض خدماتك الرقمية (Gigs) وجذب المشترين من الولايات المتحدة وأوروبا دون الحاجة لتقديم عروض يومية.",
    descriptionEn: "Global freelance leader where buyers purchase your packaged gigs in design, programming, translation, and media.",
    requirements: ["نماذج أعمال جذابة وتصاميم واضحة", "لغة إنجليزية مناسبة للتواصل مع العملاء", "تسليم سريع ورد فوري على الاستفسارات"],
    requirementsEn: ["Compelling gig imagery and video", "Good English communication", "Fast delivery and quick message response"],
    skills: ["UI/UX Design", "Logo & Branding", "WordPress & Shopify", "Video Editing", "Voice Over", "Copywriting"],
    skillsEn: ["UI/UX Design", "Logo & Branding", "WordPress & Shopify", "Video Editing", "Voice Over", "Copywriting"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب بائع (Become a Seller)", titleEn: "Become a Seller", description: "سجل في fiverr.com وأكمل ملفك الشخصي", descriptionEn: "Join fiverr.com and set up your seller profile", tips: "اكتب وصفاً مهنياً عن خبرتك", tipsEn: "Detail your background accurately" },
        { step: 2, title: "إنشاء الـ Gig وتحديد الباقات", titleEn: "Create Gig & Packages", description: "حدد باقة أساسية ومتوسطة ومتقدمة مع أسعار واضحة", descriptionEn: "Create Basic, Standard, and Premium service tiers", tips: "أضف فيديو تعريفي لزيادة المبيعات بنسبة 200%", tipsEn: "Adding a video increases conversion by 200%" },
        { step: 3, title: "ربط بطاقة Payoneer", titleEn: "Connect Payoneer", description: "اربط حساب Payoneer لتفعيل السحب بضغطة زر", descriptionEn: "Link Payoneer for one-click withdrawals", tips: "السحب متوفر بالدولار أو اليورو", tipsEn: "Withdraw in USD or EUR" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://www.fiverr.com" },
    successStories: [
      { 
        name: "أمجد كمال", 
        nameEn: "Amjad Kamal", 
        city: "مدني / إسطنبول", 
        cityEn: "Madani / Istanbul", 
        earnings: "$2,400 / شهر", 
        earningsEn: "$2,400 / mo", 
        story: "أنشأت 4 خدمات في تصميم واجهات UI/UX وحققت رتبة Level 2 Seller.", 
        storyEn: "Created 4 UI/UX design gigs and reached Level 2 Seller badge.",
        profileUrl: "https://www.linkedin.com/company/fiverr-com/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["الزبائن يأتون إليك بدون الحاجة للبحث عن مشاريع", "سحب فوري للأرباح عبر Payoneer", "دفع بالدولار الأمريكي"],
    prosEn: ["Inbound client orders without bidding", "Instant Payoneer cashout", "USD earnings"],
    cons: ["عمولة 20%"],
    consEn: ["20% service fee"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "🌐 متاح عالمياً (بيع خدمات رقمية جاهزة)",
      badgeEn: "🌐 Globally Available (Packaged Digital Gigs)",
      reasonAr: "منصة عالمية عملاقة مفتوحة للمبدعين من كافة أنحاء العالم لبيع خدمات التصميم والبرمجة مع دعم كامل للسحب عبر Payoneer.",
      reasonEn: "Worldwide freelance marketplace allowing digital talent globally to sell fixed-price gigs with Payoneer payouts.",
      proofSourceUrl: "https://www.fiverr.com/terms_of_service",
      proofSourceNameAr: "شروط الخدمة الرسمية لمنصة Fiverr العالمية",
      proofSourceNameEn: "Fiverr Global Terms of Service",
      targetCountries: ["GLOBAL"]
    },
    dateAdded: "2026-08-03",
  },

  // 6. Ureed (Arab World - Content, Translation & Editing)
  {
    id: "ureed-001",
    title: "منصة أريد لصناع المحتوى والمترجمين واللغويين",
    titleEn: "Ureed Platform for Content & Translation",
    company: "Ureed (أريد)",
    emoji: "✍️",
    type: "كتابة وترجمة وتحرير",
    typeEn: "Writing & Translation",
    category: "writing",
    region: "arab",
    regionLabel: { ar: "الوطن العربي", en: "Arab World" },
    subCategory: "الترجمة، التدقيق اللغوي، وصناعة المحتوى",
    subCategoryEn: "Translation, Editorial & Copy",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "متخصصة في خدمات اللغة والترجمة المعتمدة",
      notesEn: "Specialized in editorial & certified translation",
    },
    salary: { min: 20, max: 1200, currency: "USD", period: "project", average: "180" },
    withdrawal: {
      minAmount: 30,
      currency: "USD",
      methods: [
        { name: "تحويل بنكي / Payoneer", nameEn: "Bank / Payoneer", availableInSudan: true, notes: "متاح لجميع الدول العربية", notesEn: "Available across all Arab countries" },
      ],
      processingTime: "3-5 أيام عمل",
      processingTimeEn: "3-5 business days",
    },
    commission: { percentage: "10% - 15%", notes: "مباشرة ومنصفة", notesEn: "Fair tiered structure" },
    rating: { score: 4.8, totalReviews: 32000, trustLevel: "عالي وموثوق", trustLevelEn: "High & Verified" },
    description: "أكبر منصة متخصصة في المحتوى والترجمة والتحرير اللغوي في الشرق الأوسط، تربط المترجمين والكتاب بأكبر الشركات الإقليمية.",
    descriptionEn: "The largest specialized content, editorial, and certified translation platform in the MENA region.",
    requirements: ["إتقان اللغتين العربية والإنجليزية أو لغات أخرى", "عين فاحصة للتدقيق الإملائي والأسلوبي", "الالتزام التام بالمواعيد"],
    requirementsEn: ["Fluency in Arabic/English or other languages", "Strong proofreading and stylistic skills", "Punctual delivery"],
    skills: ["الترجمة الطبية والتقنية", "التدقيق اللغوي", "كتابة مقالات SEO", "التعريب وتوطين التطبيقات"],
    skillsEn: ["Technical Translation", "Proofreading", "SEO Writing", "App Localization"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل واجتياز اختبار اللغة", titleEn: "Register & Language Test", description: "سجل في ureed.com واجتز تقييم الكفاءة اللغوية", descriptionEn: "Join ureed.com and complete language assessment", tips: "اقرأ التعليمات جيداً قبل البدء", tipsEn: "Read test guidelines carefully" },
        { step: 2, title: "استلام المشاريع المباشرة", titleEn: "Receive Projects", description: "قدّم عروضك على المقالات والكتب والمشاريع المفتوحة", descriptionEn: "Bid on open writing, editorial and translation briefs", tips: "أرفق عينات ترجمة سابقة", tipsEn: "Attach sample translation excerpts" },
      ],
      estimatedTime: "25 دقيقة",
      estimatedTimeEn: "25 minutes",
    },
    contact: { website: "https://ureed.com" },
    successStories: [
      { 
        name: "ريم طارق", 
        nameEn: "Reem Tariq", 
        city: "الخرطوم / مسقط", 
        cityEn: "Khartoum / Muscat", 
        earnings: "$1,350 / شهر", 
        earningsEn: "$1,350 / mo", 
        story: "أعمل كمترجمة متخصصة في تعريب التطبيقات والمواقع الطبية.", 
        storyEn: "Working as a specialized medical and app localization linguist.",
        profileUrl: "https://www.linkedin.com/company/ureed/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["تركيز كامل على مهارات اللغة والكتابة", "مشاريع مستمرة من شركات كبرى", "أجور عادلة ومحمية"],
    prosEn: ["Dedicated linguistic focus", "Steady enterprise briefs", "Protected fair payouts"],
    cons: ["يتطلب اجتياز اختبار مستوى"],
    consEn: ["Requires language proficiency screening"],
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 متاح لجميع صناع المحتوى والمترجمين العرب",
      badgeEn: "🌍 Open to All Arab Writers & Translators",
      reasonAr: "منصة متخصصة في الخدمات التحريرية والترجمة المعتمدة في الشرق الأوسط، تقبل المترجمين والكتاب من كل الدول العربية بعد اختبار الكفاءة اللغوية.",
      reasonEn: "Specialized MENA linguistic & translation portal open to talent across the Arab world following skill assessment.",
      proofSourceUrl: "https://ureed.com",
      proofSourceNameAr: "منصة أريد للمحتوى والترجمة",
      proofSourceNameEn: "Ureed Official Translation Platform",
      targetCountries: ["ALL_ARAB"]
    },
    dateAdded: "2026-08-08",
  },

  // 7. Malt (Europe)
  {
    id: "malt-001",
    title: "منصة مالت الأوروبية للنخبة من المستقلين (Malt Europe)",
    titleEn: "Malt European Freelance Elite Network",
    company: "Malt",
    emoji: "🇪🇺",
    type: "فريلانسر أوروبي عن بُعد",
    typeEn: "European Remote Freelancer",
    category: "programming",
    region: "europe",
    regionLabel: { ar: "أوروبا وبريطانيا", en: "Europe & UK" },
    subCategory: "تقنية، استشارات، وإدارة منتجات",
    subCategoryEn: "Tech, Consulting & Product Ops",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "مفتوحة للخبراء المستقلين مع عقود أوروبية باليورو",
      notesEn: "Open for independent talent with Euro contracts",
    },
    salary: { min: 45, max: 150, currency: "EUR", period: "hour", average: "75" },
    withdrawal: {
      minAmount: 50,
      currency: "EUR",
      methods: [
        { name: "تحويل بنكي دولي SEPA / IBAN", nameEn: "International IBAN / SEPA", availableInSudan: true, notes: "إلى حسابك البنكي أو Wise باليورو", notesEn: "To bank account or Wise in EUR" },
      ],
      processingTime: "يومي عمل",
      processingTimeEn: "2 business days",
    },
    commission: { percentage: "5% - 10%", notes: "عمولة مخفضة جداً للأعمال طويلة الأجل", notesEn: "Lowest fee rate for recurring jobs" },
    rating: { score: 4.9, totalReviews: 80000, trustLevel: "أوروبي فائق الجودة", trustLevelEn: "Premium European Verified" },
    description: "أسرع منصات العمل الحر نمواً في فرنسا وألمانيا وإسبانيا وبريطانيا، تربط كبار المطورين والمصممين بشركات Fortune 500 في أوروبا.",
    descriptionEn: "Europe's leading freelance marketplace connecting elite tech and design freelancers with EU enterprises.",
    requirements: ["خبرة عملية لا تقل عن سنتين", "ملف شخصي باللغة الإنجليزية أو الفرنسية/الألمانية", "كفاءة عالية في تسليم المشاريع"],
    requirementsEn: ["2+ years practical experience", "English or French/German profile", "High project delivery track record"],
    skills: ["React", "Vue.js", "Java", "Python", "Cloud AWS/GCP", "Product Design"],
    skillsEn: ["React", "Vue.js", "Java", "Python", "Cloud AWS/GCP", "Product Design"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء الملف الشخصي على Malt", titleEn: "Create Profile on Malt", description: "سجل في malt.com وحدد معدلك اليومي باليورو (TJM)", descriptionEn: "Join malt.com and set daily rate in EUR (TJM)", tips: "أبرز شهاداتك وخبراتك السابقة", tipsEn: "Highlight verified certifications" },
        { step: 2, title: "تفعيل خيار العمل عن بُعد (Remote)", titleEn: "Enable 100% Remote Option", description: "فعل استقبال العروض للعمل عن بُعد حول العالم", descriptionEn: "Enable remote engagement switch for worldwide clients", tips: "الشركات الأوروبية تبحث بنشاط عن كفاءات Remote", tipsEn: "EU enterprises actively recruit remote talent" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://www.malt.com" },
    successStories: [
      { 
        name: "طارق النور", 
        nameEn: "Tariq El-Noor", 
        city: "الخرطوم / باريس", 
        cityEn: "Khartoum / Paris", 
        earnings: "€3,400 / شهر", 
        earningsEn: "€3,400 / mo", 
        story: "أعمل كمستشار سحابي AWS مع شركات تقنية أوروبية.", 
        storyEn: "Serving as an AWS cloud consultant for European tech companies.",
        profileUrl: "https://www.linkedin.com/company/malt-community/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أجور ممتازة جداً باليورو (€)", "مشاريع مؤسسية طويلة الأجل", "دفعات مضمونة خلال 3 أيام"],
    prosEn: ["Top-tier compensation in EUR (€)", "Long-term enterprise contracts", "Guaranteed 3-day payouts"],
    cons: ["تتطلب مستوى لغوي ممتاز بالإنجليزية أو لغة أوروبية"],
    consEn: ["Requires strong English or EU language fluency"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "🇪🇺 متاح للخبراء عن بُعد (عقود باليورو €)",
      badgeEn: "🇪🇺 Remote Freelancers (Euro € Contracts)",
      reasonAr: "شبكة أوروبية متقدمة للمستقلين تتيح العمل عن بُعد 100% للشركات الأوروبية وسحب الأرباح باليورو عبر التحويل البنكي الدولي أو Wise.",
      reasonEn: "Premier European freelance platform offering 100% remote engagements for EU corporations with EUR payouts.",
      proofSourceUrl: "https://www.malt.com/en-us/terms-of-use",
      proofSourceNameAr: "شروط استخدام منصة مالت الأوروبية",
      proofSourceNameEn: "Malt European Terms of Service",
      targetCountries: ["GLOBAL"]
    },
    dateAdded: "2026-08-11",
  },

  // 8. Toptal (Global Elite - Top 3%)
  {
    id: "toptal-001",
    title: "شبكة أفضل 3% من المطورين والمصممين في العالم (Toptal)",
    titleEn: "Toptal Elite Network (Top 3% Global Freelancers)",
    company: "Toptal",
    emoji: "💎",
    type: "شبكة النخبة العالمية",
    typeEn: "Global Elite Network",
    category: "programming",
    region: "americas",
    regionLabel: { ar: "أمريكا والعالم", en: "Americas & Global" },
    subCategory: "هندسة البرمجيات والتصميم المتقدم",
    subCategoryEn: "Software Engineering & Architecture",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "متاح للمطورين والمصممين ذوي الكفاءة العالية من أي دولة",
      notesEn: "Open worldwide for high-caliber engineers and designers",
    },
    salary: { min: 60, max: 160, currency: "USD", period: "hour", average: "95" },
    withdrawal: {
      minAmount: 100,
      currency: "USD",
      methods: [
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "الخيار الأسرع للمستقلين في إفريقيا والشرق الأوسط", notesEn: "Fastest option for MENA & Africa" },
        { name: "تحويل بنكي مباشر (Wire)", nameEn: "Direct Wire Transfer", availableInSudan: true, notes: "إلى حسابك البنكي المعتمد بالدولار", notesEn: "To verified USD bank account" },
      ],
      processingTime: "كل أسبوعين تلقائياً",
      processingTimeEn: "Bi-weekly automatic payout",
    },
    commission: { percentage: "0%", notes: "توبتال تأخذ عمولتها من العميل مباشرة دون اقتطاع من أجرك", notesEn: "0% fee on freelancer earnings" },
    rating: { score: 4.9, totalReviews: 60000, trustLevel: "نخبة فائقة 100%", trustLevelEn: "Elite Verified 100%" },
    description: "شبكة عالمية حصرية تقبل أفضل 3% فقط من الكفاءات بعد اجتياز مراحل الفحص الفني، وتوفر وظائف وعقوداً بأعلى الأجور في وادي السيليكون والعالم.",
    descriptionEn: "Exclusive network matching the top 3% of global freelance talent with Silicon Valley leaders and Fortune 500s.",
    requirements: ["اجتياز اختبارات البرمجة والخوارزميات والمقابلة التقنية", "تحدث الإنجليزية بطلاقة واحترافية", "خبرة عملية قوية"],
    requirementsEn: ["Passing algorithm, live coding, and technical screening", "Fluent professional English", "Strong problem-solving track record"],
    skills: ["Algorithms", "System Design", "Full Stack", "DevOps", "AI & Machine Learning"],
    skillsEn: ["Algorithms", "System Design", "Full Stack", "DevOps", "AI & Machine Learning"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التقديم وتدقيق السيرة الذاتية", titleEn: "Apply & CV Review", description: "قدم عبر toptal.com بالسيرة الذاتية بالإنجليزية", descriptionEn: "Apply at toptal.com with an English resume", tips: "ركز على إنجازاتك التقنية المعقدة", tipsEn: "Emphasize complex architectural projects" },
        { step: 2, title: "المقابلة الأولية واختبار الخوارزميات", titleEn: "Screening & Algorithm Test", description: "اجتز مقابلة التعارف واختبار حل المشكلات البرمجية", descriptionEn: "Complete language screening and live coding test", tips: "تدرب على منصات LeetCode و HackerRank", tipsEn: "Practice LeetCode medium problems" },
        { step: 3, title: "مشروع اختباري حقيقي", titleEn: "Test Project Challenge", description: "بناء تطبيق متكامل ومناقشته مع كبير المهندسين", descriptionEn: "Build and present a production-grade test project", tips: "اكتب كوداً نظيفاً مع اختبارات Unit Tests", tipsEn: "Write clean code with automated tests" },
      ],
      estimatedTime: "مراحل فحص على مدى أسبوعين",
      estimatedTimeEn: "Two-week screening lifecycle",
    },
    contact: { website: "https://www.toptal.com" },
    successStories: [
      { 
        name: "حسام الدين", 
        nameEn: "Hossam El-Din", 
        city: "الخرطوم / لندن", 
        cityEn: "Khartoum / London", 
        earnings: "$7,500 / شهر", 
        earningsEn: "$7,500 / mo", 
        story: "اجتزت فحص Toptal وأعمل الآن مع شركة ذكاء اصطناعي أمريكية بعقد دائم عن بُعد.", 
        storyEn: "Passed Toptal screening and contracted with a US AI company full-time remotely.",
        profileUrl: "https://www.linkedin.com/company/toptal/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أعلى أجور عمل حر في العالم (تصل لـ $10,000+ شهرياً)", "بدون عمولة مقتطعة من أجر المستقل (0%)", "مشاريع مع أرقى شركات العالم"],
    prosEn: ["Top earnings worldwide (up to $10,000+/mo)", "0% platform deduction on freelancer rates", "Prestigious global enterprise projects"],
    cons: ["مراحل فحص دقيقة وصعبة القبول"],
    consEn: ["Rigorous screening with selective acceptance"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "💎 متاح للنخبة عالمياً (Top 3% - أجور قياسية)",
      badgeEn: "💎 Open Globally to Top 3% (Industry Leading Rates)",
      reasonAr: "شبكة حصرية عالمية مفتوحة للمطورين والمصممين حول العالم بناءً على المهارة فقط بعد اجتياز المقابلات التقنية، مع سحب عبر Payoneer وتحويل بنكي و 0% عمولة على المستقل.",
      reasonEn: "Merit-based global elite network open worldwide based on skill screening, offering 0% freelancer fee and direct wire/Payoneer payouts.",
      proofSourceUrl: "https://www.toptal.com/faq",
      proofSourceNameAr: "دليل وشروط الانضمام لشبكة توبتال العالمية",
      proofSourceNameEn: "Toptal Screening & Talent FAQ",
      targetCountries: ["GLOBAL"]
    },
    dateAdded: "2026-08-12",
  },

  // 9. Truelancer (Asia & Global)
  {
    id: "truelancer-001",
    title: "منصة ترولانسر للعمل الحر في آسيا والشرق الأوسط",
    titleEn: "Truelancer Freelancing (Asia & Middle East)",
    company: "Truelancer",
    emoji: "🌏",
    type: "مشاريع عالمية وآسيوية",
    typeEn: "Global & Asian Projects",
    category: "content",
    region: "asia_africa",
    regionLabel: { ar: "آسيا وإفريقيا", en: "Asia & Africa" },
    subCategory: "إدخال بيانات، برمجة، وتصميم",
    subCategoryEn: "Data Entry, Dev & Design",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "سهلة التسجيل ومناسبة للمشاريع السريعة",
      notesEn: "Fast onboarding with continuous project flow",
    },
    salary: { min: 15, max: 600, currency: "USD", period: "project", average: "90" },
    withdrawal: {
      minAmount: 20,
      currency: "USD",
      methods: [
        { name: "Payoneer / Bank Transfer", nameEn: "Payoneer / Bank", availableInSudan: true, notes: "متاح لجميع المستخدمين", notesEn: "Available globally" },
      ],
      processingTime: "3-5 أيام",
      processingTimeEn: "3-5 days",
    },
    commission: { percentage: "8% - 10%", notes: "عمولة منخفضة ومناسبة للمبتدئين", notesEn: "Low fee structure" },
    rating: { score: 4.6, totalReviews: 50000, trustLevel: "جيد وموثوق", trustLevelEn: "Good & Verified" },
    description: "منصة عالمية متنامية تضم مئات آلاف المشاريع في البرمجة، إدخال البيانات، كتابة المحتوى، وإدارة حسابات التواصل.",
    descriptionEn: "Fast-growing global marketplace with projects in web development, data operations, SEO, and social management.",
    requirements: ["مهارة رقمية جاهزة للتنفيذ", "التواصل السريع مع أصحاب المشاريع", "الالتزام بالشروط المحددة"],
    requirementsEn: ["Actionable digital skill", "Responsive communication", "Punctual deliverable completion"],
    skills: ["Data Entry", "Virtual Assistant", "Graphic Design", "PHP & WordPress", "Translation"],
    skillsEn: ["Data Entry", "Virtual Assistant", "Graphic Design", "PHP & WordPress", "Translation"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل في Truelancer", titleEn: "Join Truelancer", description: "سجل مجاناً في truelancer.com", descriptionEn: "Create a free profile at truelancer.com", tips: "أضف مهاراتك الأساسية في الملف", tipsEn: "Add core competencies to your bio" },
        { step: 2, title: "التقديم على المشاريع المفتوحة", titleEn: "Bid on Open Gigs", description: "استخدم رصيد المقترحات المجانية للتقديم يومياً", descriptionEn: "Utilize free proposal credits on relevant tasks", tips: "ركز على المشاريع التي تحتاج تسليماً سريعاً", tipsEn: "Target urgent turnaround requests" },
      ],
      estimatedTime: "15 دقيقة",
      estimatedTimeEn: "15 minutes",
    },
    contact: { website: "https://www.truelancer.com" },
    successStories: [
      { 
        name: "ياسر عادل", 
        nameEn: "Yasser Adel", 
        city: "الخرطوم / كوالالمبور", 
        cityEn: "Khartoum / Kuala Lumpur", 
        earnings: "$850 / شهر", 
        earningsEn: "$850 / mo", 
        story: "أنفذ مهام المساعد الافتراضي وإدخال البيانات للشركات الآسيوية.", 
        storyEn: "Delivering virtual assistant and data ops for Asian companies.",
        profileUrl: "https://www.linkedin.com/company/truelancer/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["سهولة القبول والبدء الفوري", "عمولة منخفضة", "مشاريع متنوعة وبسيطة للمبتدئين"],
    prosEn: ["Fast acceptance and start", "Low fee structure", "Diverse entry-level tasks"],
    cons: ["الميزانيات متوسطة مقارنة بالمنصات الغربية"],
    consEn: ["Moderate budgets compared to western portals"],
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "🌏 متاح للمشاريع الآسيوية والعالمية (سحب ميسر)",
      badgeEn: "🌏 Asian & Global Projects (Direct Cashout)",
      reasonAr: "منصة عالمية متنامية تقبل المستقلين من كافة الدول للعمل في إدخال البيانات والبرمجة والتصميم مع دعم سحب سريع عبر Payoneer وتحويلات بنكية.",
      reasonEn: "Growing worldwide platform open globally for virtual assistance, web dev, and design with direct Payoneer & bank transfer payouts.",
      proofSourceUrl: "https://www.truelancer.com/terms-of-service",
      proofSourceNameAr: "شروط استخدام ترولانسر العالمية",
      proofSourceNameEn: "Truelancer Global Terms of Service",
      targetCountries: ["GLOBAL"]
    },
    dateAdded: "2026-08-14",
  },

  // 10. Soundeals (Voice Acting & Audio - Arab World)
  {
    id: "soundeals-001",
    title: "منصة سونديلز للتعليق الصوتي والإنتاج الصوتي العربي",
    titleEn: "Soundeals Voice-Over & Audio Production",
    company: "Soundeals (سونديلز)",
    emoji: "🎙️",
    type: "تعليق صوتي وهندسة صوت",
    typeEn: "Voice Acting & Audio",
    category: "content",
    region: "arab",
    regionLabel: { ar: "الوطن العربي", en: "Arab World" },
    subCategory: "إعلانات، كتب صوتية، ودوبلاج",
    subCategoryEn: "Ads, Audiobooks & Dubbing",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries"],
      restrictedCountries: [],
      notes: "المنصة العربية الأولى للمواهب الصوتية بجميع اللهجات",
      notesEn: "Premier Arabic portal for all dialects & voice talent",
    },
    salary: { min: 30, max: 1500, currency: "USD", period: "project", average: "150" },
    withdrawal: {
      minAmount: 20,
      currency: "USD",
      methods: [
        { name: "تحويل بنكي / شريك دفع", nameEn: "Bank Wire / Partner", availableInSudan: true, notes: "متاح لجميع الدول العربية", notesEn: "Available across all Arab regions" },
      ],
      processingTime: "48 ساعة",
      processingTimeEn: "48 hours",
    },
    commission: { percentage: "15%", notes: "حماية كاملة للحقوق الصوتية", notesEn: "Full copyright & escrow protection" },
    rating: { score: 4.8, totalReviews: 25000, trustLevel: "عالي ومتخصص 100%", trustLevelEn: "High & Specialized 100%" },
    description: "المنصة الرائدة في العالم العربي للتعليق الصوتي والدوبلاج والإنتاج الإذاعي، تجمع المعلقين الصوتيين بشركات الإعلانات والقنوات الفضائية والكتب المسموعة.",
    descriptionEn: "The leading Arabic voice-over marketplace connecting vocal artists with advertising agencies, publishers, and studios.",
    requirements: ["ميكروفون تسجيل جيد وبيئة معزولة عن الضوضاء", "نطق سليم باللغة العربية الفصحى أو اللهجات المحلية", "عينات صوتية جاهزة للاستماع"],
    requirementsEn: ["Quality condenser mic and quiet recording setup", "Clear Arabic diction or local dialects", "Ready voice demo reels"],
    skills: ["الفصحى الإخبارية والوثائقية", "الإعلانات التجارية", "الدوبلاج الكرتوني", "الهندسة الصوتية والمكساج"],
    skillsEn: ["Classical Arabic Narration", "Commercial Promos", "Dubbing", "Audio Mastering"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل ورفع العينات الصوتية", titleEn: "Register & Upload Demos", description: "سجل في soundeals.com وارفع 3 عينات صوتية بنبرات مختلفة", descriptionEn: "Join soundeals.com and upload 3 varied voice demos", tips: "احرص على نقاء الصوت وخلوه من الصدى", tipsEn: "Ensure crisp audio without room reverb" },
        { step: 2, title: "المشاركة في الصفقات والمشاريع", titleEn: "Audition for Deals", description: "سجل عينة تجريبية للمشاريع المنشورة يومياً", descriptionEn: "Record custom auditions for posted client briefs", tips: "السرعة في تقديم العينة تضاعف فرص اختيارك", tipsEn: "Quick submission boosts selection odds" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://soundeals.com" },
    successStories: [
      { 
        name: "عبد الرحمن نور", 
        nameEn: "Abdelrahman Noor", 
        city: "الخرطوم / القاهرة", 
        cityEn: "Khartoum / Cairo", 
        earnings: "$1,800 / شهر", 
        earningsEn: "$1,800 / mo", 
        story: "سجلت أكثر من 80 إعلاناً وكتاباً صوتياً لقنوات وشركات خليجية.", 
        storyEn: "Recorded over 80 commercial spots and audiobooks for GCC networks.",
        profileUrl: "https://www.linkedin.com/company/soundeals/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أجور ممتازة لكل دقيقة تسجيل", "طلب ضخم ومستمر على الأصوات العربية والسودانية", "حماية لحقوق الملكية الفكرية"],
    prosEn: ["High per-minute vocal compensation", "Huge continuous demand for Arabic & regional accents", "Intellectual property escrow"],
    cons: ["يتطلب توفير مايك احترافي وبيئة هادئة للتسجيل"],
    consEn: ["Requires decent microphone and quiet recording space"],
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🎙️ متاح لكافة الدول العربية (أصوات ودوبلاج بجميع اللهجات)",
      badgeEn: "🎙️ Open to All Arab Countries (All Dialects)",
      reasonAr: "المنصة ترحب بجميع المعلقين الصوتيين وأصحاب الحناجر الإذاعية من أي دولة عربية بدون أي قيود جغرافية.",
      reasonEn: "Open to voice talents and audio producers across all Arab regions with complete dialect inclusivity.",
      proofSourceUrl: "https://soundeals.com/terms",
      proofSourceNameAr: "شروط وضمانات منصة سونديلز الرسمية",
      proofSourceNameEn: "Soundeals Official Terms & Guarantees",
      targetCountries: ["ALL_ARAB"]
    },
    dateAdded: "2026-08-15",
  },

  // 11. Sabbar (Saudi Arabia & Remote)
  {
    id: "sabbar-001",
    title: "منصة صبّار للوظائف المرنة والدوام الجزئي وعن بُعد",
    titleEn: "Sabbar Flexible Shifts & Remote Jobs Portal",
    company: "Sabbar (صبّار)",
    emoji: "🌵",
    type: "عمل مرن وجزئي وعن بُعد",
    typeEn: "Flexible Shifts & Remote",
    category: "trades",
    region: "arab",
    regionLabel: { ar: "السعودية وعن بُعد", en: "Saudi & Remote" },
    subCategory: "خدمة عملاء، مبيعات، وتجزئة",
    subCategoryEn: "Customer Care, Sales & Retail",
    availability: {
      global: false,
      countries: ["SA", "EG", "JO", "AE", "all_arab_remote"],
      countriesEn: ["Saudi Arabia", "Arab Remote Candidates"],
      restrictedCountries: [],
      notes: "وظائف ميدانية للسعوديين والمقيمين نظامياً، ووظائف عن بعد لجميع الدول العربية",
      notesEn: "On-site shifts for KSA citizens/residents, remote roles for Arab talent",
    },
    salary: { min: 400, max: 2000, currency: "USD", period: "month", average: "850" },
    withdrawal: {
      minAmount: 50,
      currency: "SAR",
      methods: [
        { name: "تحويل بنكي فوري IBAN", nameEn: "Instant IBAN Payout", availableInSudan: true, notes: "متاح أسبوعياً أو شهرياً", notesEn: "Weekly or monthly disbursements" },
      ],
      processingTime: "كل يوم أربعاء أسبوعياً",
      processingTimeEn: "Weekly every Wednesday",
    },
    commission: { percentage: "0%", notes: "بدون أي رسوم على الباحثين عن عمل", notesEn: "Zero fee for jobseekers" },
    rating: { score: 4.9, totalReviews: 65000, trustLevel: "معتمدة ومرخصة 100%", trustLevelEn: "Certified & Licensed 100%" },
    description: "المنصة الأسرع نمواً في السعودية والشرق الأوسط للتوظيف السريع بالساعة أو بالدوام الجزئي والكامل، وتوفر وظائف عن بعد للكوادر العربية في خدمة العملاء والتسويق والدعم الفني.",
    descriptionEn: "Top flexible staffing portal in KSA & MENA providing instant shifts, part-time and remote corporate opportunities.",
    requirements: ["هوية سارية (مواطن أو مقيم نظامي للوظائف الحضورية) أو اتصال مستقر للوظائف عن بعد", "لباقة وحسن التعامل مع العملاء", "حساب بنكي نشط لاستلام المستحقات"],
    requirementsEn: ["Valid ID for local shifts or stable internet for remote roles", "Excellent communication etiquette", "Active bank account for payouts"],
    skills: ["خدمة العملاء", "المبيعات والدعم", "إدخال البيانات", "إدارة العمليات والتجزئة"],
    skillsEn: ["Customer Support", "Sales & Ops", "Data Entry", "Retail Operations"],
    registrationGuide: {
      steps: [
        { step: 1, title: "تحميل تطبيق صبّار أو زيارة الموقع", titleEn: "Download App or Visit Portal", description: "ادخل إلى sabbar.com أو حمل التطبيق للأندرويد والآيفون", descriptionEn: "Visit sabbar.com or get the iOS/Android app", tips: "سجل برقم جوالك النشط", tipsEn: "Register with active mobile number" },
        { step: 2, title: "بناء الملف المهني والفيديو التعريفي", titleEn: "Build Profile & Video Intro", description: "سجل فيديو تعريفي قصير مدته 30 ثانية لرفع نسبة قبولك", descriptionEn: "Record a 30-second video introduction", tips: "الفيديو التعريفي يرفع قبولك بنسبة 80%", tipsEn: "Video intro boosts hire chances by 80%" },
        { step: 3, title: "اختيار الشواغر والورديات والبدء", titleEn: "Select Shifts & Start", description: "اختر الفرص المناسبة لجدولك الزمني واستلم القبول المباشر", descriptionEn: "Choose shifts matching your calendar and start immediately", tips: "الالتزام بالمواعيد يرفع تقييمك لمستوى متميز", tipsEn: "Punctuality grants preferred status" },
      ],
      estimatedTime: "10 دقائق",
      estimatedTimeEn: "10 minutes",
    },
    contact: { website: "https://sabbar.com" },
    successStories: [
      { 
        name: "عبد العزيز الشمري", 
        nameEn: "Abdulaziz Al-Shammari", 
        city: "الرياض", 
        cityEn: "Riyadh", 
        earnings: "4,500 ريال / شهر", 
        earningsEn: "4,500 SAR / mo", 
        story: "بدأت بالعمل المرن في التجزئة ومبيعات الفعاليات، وخلال شهرين تعاقدت معي كبرى الشركات بدوام جزئي مرن.", 
        storyEn: "Started flexible retail and event shifts and landed high-paying corporate shifts.",
        profileUrl: "https://www.linkedin.com/company/sabbar-sa/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["دفعات أسبوعية منتظمة", "فرص حضورية وعن بعد", "توثيق رسمي ومعتمد"],
    prosEn: ["Weekly guaranteed payouts", "Both on-site and remote options", "Fully verified & licensed"],
    cons: ["الوظائف الميدانية تتطلب التواجد داخل المملكة"],
    consEn: ["On-site gigs require physical residence in KSA"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "saudi_residents_and_remote",
      badgeAr: "🇸🇦 مواطنين ومقيمين + وظائف عن بُعد 🌍",
      badgeEn: "🇸🇦 Citizens, Residents & Remote 🌍",
      reasonAr: "تقبل منصة صبّار السعوديين والمقيمين نظامياً للوظائف الميدانية والجزئية داخل المملكة، كما توفر فرص عمل عن بُعد (Remote) لمرشحين من مختلف الدول العربية في خدمة العملاء والمبيعات والدعم.",
      reasonEn: "Sabbar welcomes KSA citizens and legal residents for local shifts, while offering remote customer care and sales roles for Arab talent across borders.",
      proofSourceUrl: "https://sabbar.com",
      proofSourceNameAr: "الشروط والأحكام الرسمية لمنصة صبّار للتوظيف",
      proofSourceNameEn: "Official Sabbar Employment Terms & Policy",
      targetCountries: ["SA", "ALL_ARAB"]
    },
    dateAdded: "2026-08-20",
  },

  // 12. Marn (Saudi Arabia - Hourly Shifts)
  {
    id: "marn-001",
    title: "منصة مَرن لحلول العمل المرن بالساعة في السعودية",
    titleEn: "Marn Flexible Hourly Work Platform (Saudi Arabia)",
    company: "Marn (مَرن)",
    emoji: "⚡",
    type: "عمل مرن بالساعة (حكومي معتمد)",
    typeEn: "Accredited Hourly Shift System",
    category: "trades",
    region: "arab",
    regionLabel: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
    subCategory: "ضيافة، مبيعات، فعاليات، ومتاجر",
    subCategoryEn: "Hospitality, Retail & Events",
    availability: {
      global: false,
      countries: ["SA"],
      countriesEn: ["Saudi Arabia Only"],
      restrictedCountries: [],
      notes: "حصري للمواطنين السعوديين وفق نظام العمل المرن الوزاري",
      notesEn: "Exclusively for Saudi citizens under MHRSD Flexible Work Law",
    },
    salary: { min: 25, max: 70, currency: "SAR", period: "hour", average: "40" },
    withdrawal: {
      minAmount: 10,
      currency: "SAR",
      methods: [
        { name: "إيداع بنكي مباشر مرتبط بـ IBAN", nameEn: "Direct Bank IBAN Payout", availableInSudan: false, notes: "إيداع دوري موثق في التأمينات", notesEn: "Automated GOSI registered transfer" },
      ],
      processingTime: "خلال 7 أيام من انتهاء الوردية",
      processingTimeEn: "Within 7 days of shift end",
    },
    commission: { percentage: "0%", notes: "بدون أي عمولة على الممارس المرن", notesEn: "0% commission on workers" },
    rating: { score: 4.9, totalReviews: 54000, trustLevel: "معتمد بقرار وزاري 100%", trustLevelEn: "Officially MHRSD Certified" },
    description: "المنصة الأولى المعتمدة من وزارة الموارد البشرية لتوثيق عقود العمل المرن بنظام الساعات في المملكة العربية السعودية مع تسجيل الساعات في التأمينات الاجتماعية وحماية الحقوق.",
    descriptionEn: "Saudi Arabia's premier MHRSD-accredited flexible work platform offering regulated hourly employment with registered social insurance.",
    requirements: ["الجنسية السعودية والهوية الوطنية سارية", "حساب نشط في منصة النفاذ الوطني / أبشر", "الالتزام التام بالورديات المحجوزة"],
    requirementsEn: ["Saudi national citizenship with valid ID", "Nafath / Absher portal account", "Shift punctuality and commitment"],
    skills: ["إدارة الفعاليات", "مبيعات التجزئة", "الكاشير وخدمة العملاء", "التسويق الميداني"],
    skillsEn: ["Event Management", "Retail Sales", "Cashier & Customer Care", "Field Marketing"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل في منصة مَرن", titleEn: "Register on Marn.io", description: "ادخل إلى marn.io وأنشئ حساب مرن جديد", descriptionEn: "Visit marn.io and create your candidate profile", tips: "استخدم هويتك الوطنية المسجلة في أبشر", tipsEn: "Use National ID linked with Absher" },
        { step: 2, title: "تحديد المهارات والمناطق المفضلة", titleEn: "Select Preferences", description: "حدد مدينتك والمجالات التي تجيدها (مبيعات، ضيافة، تنظيم)", descriptionEn: "Choose your city and preferred domains", tips: "حدد أوقات فراغك بدقة", tipsEn: "Set availability accurately" },
        { step: 3, title: "حجز الورديات واستلام الأجور", titleEn: "Book Shifts & Get Paid", description: "احجز ساعات العمل المناسبة، وأكد الحضور عبر التطبيق لاستلام أتعابك", descriptionEn: "Reserve shifts and check in via app for guaranteed payout", tips: "تحصل على إشعار بتسجيل الساعات في التأمينات", tipsEn: "Hours are recorded in GOSI automatically" },
      ],
      estimatedTime: "15 دقيقة",
      estimatedTimeEn: "15 minutes",
    },
    contact: { website: "https://marn.io" },
    successStories: [
      { 
        name: "سلطان القحطاني", 
        nameEn: "Sultan Al-Qahtani", 
        city: "جدة", 
        cityEn: "Jeddah", 
        earnings: "3,200 ريال / شهر", 
        earningsEn: "3,200 SAR / mo", 
        story: "أعمل بالساعات المرنة بجانب دراستي الجامعية، وجمعت خبرة عملية ممتازة مع توثيق رسمي في التأمينات الاجتماعية.", 
        storyEn: "Worked hourly shifts alongside university, gaining verified experience and GOSI registration.",
        profileUrl: "https://www.linkedin.com/company/marn-io/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["موثق في التأمينات الاجتماعية السعودية", "أجر محدد بالساعة بدون عمولة", "مرونة مطلقة في اختيار الأيام والساعات"],
    prosEn: ["GOSI social insurance credits", "Clear hourly pay with 0% fee", "Ultimate schedule flexibility"],
    cons: ["مقتصر نظامياً على المواطنين السعوديين فقط"],
    consEn: ["Legally restricted to Saudi nationals only"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "saudi_exclusive",
      badgeAr: "🇸🇦 حصري للمواطنين (نظام العمل المرن الوزاري)",
      badgeEn: "🇸🇦 Saudi Citizens Only (Ministerial Flexible Work)",
      reasonAr: "وفقاً للمادة الرابعة من تنظيم العمل المرن الصادر بالقرار الوزاري لوزارة الموارد البشرية والتنمية الاجتماعية، يقتصر إبرام عقود العمل المرن وتوثيقها على الكوادر الوطنية السعودية فقط لتعزيز برامج التوطين.",
      reasonEn: "Per Article 4 of the Flexible Work Regulations issued by the Saudi Ministry of Human Resources (MHRSD), flexible hourly contracts are strictly reserved for Saudi citizens under Saudization laws.",
      proofSourceUrl: "https://hrsd.gov.sa",
      proofSourceNameAr: "البوابة الرسمية لوزارة الموارد البشرية والتنمية الاجتماعية (تنظيم العمل المرن)",
      proofSourceNameEn: "Saudi Ministry of Human Resources Official Flexible Work Portal",
      targetCountries: ["SA"]
    },
    dateAdded: "2026-08-21",
  },

  // 13. AS3A (Saudi Arabia - Part-time & Shifts)
  {
    id: "as3a-001",
    title: "منصة أسعى للعمل الجزئي والموسمي والفعاليات",
    titleEn: "AS3A Part-Time & Seasonal Opportunities Platform",
    company: "AS3A (أسعى)",
    emoji: "🎯",
    type: "عمل جزئي وموسمي للكوادر الوطنية",
    typeEn: "Part-time & Seasonal Shifts",
    category: "trades",
    region: "arab",
    regionLabel: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
    subCategory: "فعاليات، معارض، تسويق، وموسم الرياض",
    subCategoryEn: "Events, Seasons & Exhibitions",
    availability: {
      global: false,
      countries: ["SA"],
      countriesEn: ["Saudi Arabia Only"],
      restrictedCountries: [],
      notes: "مخصصة للمواطنين السعوديين مع تسجيل عبر النفاذ الوطني",
      notesEn: "Dedicated to Saudi citizens with Nafath verification",
    },
    salary: { min: 300, max: 1500, currency: "SAR", period: "project", average: "650" },
    withdrawal: {
      minAmount: 100,
      currency: "SAR",
      methods: [
        { name: "تحويل بنكي IBAN", nameEn: "Direct IBAN Wire", availableInSudan: false, notes: "مباشرة إلى البنوك السعودية", notesEn: "Direct to Saudi bank accounts" },
      ],
      processingTime: "خلال 5 أيام عمل بعد اكتمال الفعالية",
      processingTimeEn: "Within 5 days after event completion",
    },
    commission: { percentage: "0%", notes: "مجانية بالكامل للباحثين عن عمل", notesEn: "Completely free for candidates" },
    rating: { score: 4.8, totalReviews: 38000, trustLevel: "معتمد وموثوق", trustLevelEn: "Certified Platform" },
    description: "منصة سعودية رائدة متخصصة في ربط الكفاءات الوطنية بالفرص الوظيفية المؤقتة والجزئية في الفعاليات والمواسم الترفيهية والمعارض والمؤتمرات الكبرى.",
    descriptionEn: "Saudi platform connecting national talents with part-time, seasonal, and exhibition gigs across major national events and entertainment seasons.",
    requirements: ["الهوية الوطنية السعودية وتأكيد النفاذ الوطني", "الجدية والالتزام بساعات الفعالية", "مظهر مهني ولائق"],
    requirementsEn: ["Saudi National ID and Nafath verification", "Dedication during event shifts", "Professional attire and demeanor"],
    skills: ["تنظيم الفعاليات", "إرشاد الزوار", "التسجيل والتذاكر", "الإشراف والتشغيل"],
    skillsEn: ["Event Operations", "Guest Relations", "Ticketing & Registry", "Supervision"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب على أسعى", titleEn: "Register on AS3A", description: "ادخل إلى as3a.com وسجل عبر النفاذ الوطني", descriptionEn: "Visit as3a.com and login via Nafath", tips: "تأكد من تحديث رقم جوالك", tipsEn: "Verify active phone number" },
        { step: 2, title: "إضافة الخبرات والهوايات", titleEn: "Add Skills & Experience", description: "أضف خبراتك السابقة وصورة حديثة لمعاملات التوظيف", descriptionEn: "List past event experience and photo", tips: "الخبرة السابقة في الفعاليات تمنحك أولوية", tipsEn: "Event experience grants priority" },
        { step: 3, title: "التقديم على الفعاليات المفتوحة", titleEn: "Apply for Open Seasons", description: "اختر فعاليات مدينتك وقدّم بضغطة زر واحدة", descriptionEn: "Choose events in your area and apply instantly", tips: "تأكد من تأكيد حضور التدريب التعريفي", tipsEn: "Attend mandatory onboarding brief" },
      ],
      estimatedTime: "12 دقيقة",
      estimatedTimeEn: "12 minutes",
    },
    contact: { website: "https://as3a.com/Home" },
    successStories: [
      { 
        name: "فهد الدوسري", 
        nameEn: "Fahad Al-Dossary", 
        city: "الدمام / الرياض", 
        cityEn: "Dammam / Riyadh", 
        earnings: "3,800 ريال / شهر", 
        earningsEn: "3,800 SAR / mo", 
        story: "شاركت في تنظيم 6 معارض دولية ومؤتمرات كبرى عبر أسعى بدخل ممتاز وعلاقات مهنية واسعة.", 
        storyEn: "Organized 6 major international expos and conferences via AS3A with great networking and compensation.",
        profileUrl: "https://www.linkedin.com/company/as3a/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["فرص متجددة مع كل موسم ومؤتمر", "أجور فورية ومجزية للمشاريع القصيرة", "اكتساب خبرات تنظيمية كبرى"],
    prosEn: ["Fresh opportunities with every major season", "Lucrative short-term payouts", "Hands-on event experience"],
    cons: ["مقتصر على المواطنين السعوديين داخل المملكة"],
    consEn: ["Limited to Saudi citizens residing locally"],
    isNew: true,
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "saudi_exclusive",
      badgeAr: "🇸🇦 حصري للمواطنين (دوام جزئي ومرن)",
      badgeEn: "🇸🇦 Saudi Citizens Only (Part-time & Shifts)",
      reasonAr: "المنصة مخصصة للكفاءات الوطنية وتتطلب التسجيل والتحقق عبر بوابة النفاذ الوطني الموحد (أبشر) للهوية الوطنية السعودية لتوطين قطاع تنظيم الفعاليات.",
      reasonEn: "Dedicated to Saudi national talents and mandates authentication via Nafath (Absher) with national ID to support event sector Saudization.",
      proofSourceUrl: "https://as3a.com/Home",
      proofSourceNameAr: "شروط التسجيل في منصة أسعى الوطنية للتوظيف",
      proofSourceNameEn: "Official AS3A Registration Terms & Policy",
      targetCountries: ["SA"]
    },
    dateAdded: "2026-08-22",
  },

  // 14. Wardiyyat / Shiftat (Saudi Arabia)
  {
    id: "wardiyyat-001",
    title: "منصة ورديات (Shiftat) لتغطية ورديات العمل بالساعة",
    titleEn: "Wardiyyat / Shiftat Hourly Staffing Platform",
    company: "Wardiyyat (ورديات - شفتات)",
    emoji: "⏱️",
    type: "إدارة وتغطية الورديات بالساعة",
    typeEn: "Shift-based Hourly Staffing",
    category: "trades",
    region: "arab",
    regionLabel: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
    subCategory: "كافيهات، مطاعم، فنادق، ومتاجر",
    subCategoryEn: "Cafes, Restaurants & Hospitality",
    availability: {
      global: false,
      countries: ["SA"],
      countriesEn: ["Saudi Arabia Only"],
      restrictedCountries: [],
      notes: "حصري للمواطنين السعوديين وفق برنامج تنظيم العمل المرن",
      notesEn: "Saudi citizens only under national flexible regulations",
    },
    salary: { min: 25, max: 60, currency: "SAR", period: "hour", average: "35" },
    withdrawal: {
      minAmount: 50,
      currency: "SAR",
      methods: [
        { name: "إيداع بنكي IBAN", nameEn: "Bank IBAN Deposit", availableInSudan: false, notes: "إيداع سريع بعد انتهاء الوردية", notesEn: "Quick deposit post shift closure" },
      ],
      processingTime: "خلال 48 إلى 72 ساعة",
      processingTimeEn: "Within 48-72 hours",
    },
    commission: { percentage: "0%", notes: "المستفيد يستلم أجره الصافي كاملاً", notesEn: "Workers receive full net pay" },
    rating: { score: 4.7, totalReviews: 29000, trustLevel: "معتمد وموثوق", trustLevelEn: "Verified Shift System" },
    description: "تطبيق متخصص في تمكين الشباب السعودي من ملء وتغطية الورديات الشاغرة في قطاعات الأغذية والمشروبات والمقاهي والتجزئة بالساعات التي يختارونها.",
    descriptionEn: "Staffing app connecting Saudi talents with vacant hourly shifts in F&B, cafes, and retail at their chosen times.",
    requirements: ["الجنسية السعودية", "شهادة صحية (لورديات الأغذية والمشروبات)", "الالتزام بالحضور الدقيق في موعد الوردية"],
    requirementsEn: ["Saudi citizenship", "Health card (for F&B positions)", "Punctual shift check-in"],
    skills: ["باريستا وتحضير القهوة", "خدمة طاولات ومطاعم", "كاشير ومبيعات", "جرد وتخزين"],
    skillsEn: ["Barista & Coffee Craft", "Restaurant Service", "Cashiering", "Inventory Ops"],
    registrationGuide: {
      steps: [
        { step: 1, title: "تحميل تطبيق ورديات وتوثيق الحساب", titleEn: "Download App & Verify", description: "حمل التطبيق وسجل بياناتك وهويتك الوطنية", descriptionEn: "Download mobile app and verify Saudi National ID", tips: "ارفع الشهادة الصحية إن وجدت لخيارات أكثر", tipsEn: "Upload health card for more gig types" },
        { step: 2, title: "استعراض الخريطة والورديات القريبة", titleEn: "Browse Nearby Shifts", description: "شاهد الورديات الشاغرة في حيك أو مدينتك ومعدل الأجر بالساعة", descriptionEn: "Explore shifts in your neighborhood with clear hourly rates", tips: "اختر أوقات تناسب فراغك", tipsEn: "Pick matching free hours" },
        { step: 3, title: "تأكيد الوردية ومسح QR Code للبدء", titleEn: "Confirm Shift & Check In", description: "احضر في المكان المحدد وافحص الرمز للبدء في احتساب الأجر", descriptionEn: "Arrive on site and scan QR code to start pay clock", tips: "التقييم العالي يفتح لك ورديات مميزة بأجور أعلى", tipsEn: "High ratings unlock VIP shift rates" },
      ],
      estimatedTime: "10 دقائق",
      estimatedTimeEn: "10 minutes",
    },
    contact: { website: "https://shiftat.sa" },
    successStories: [
      { 
        name: "نورة الغامدي", 
        nameEn: "Noura Al-Ghamdi", 
        city: "الرياض", 
        cityEn: "Riyadh", 
        earnings: "2,900 ريال / شهر", 
        earningsEn: "2,900 SAR / mo", 
        story: "أعمل كباريستا في مقاهي ومتاجر متخصصة بمعدل 4 ساعات يومياً في أوقات فراغي مع دخل فوري منتظم.", 
        storyEn: "Working as a freelance barista 4 hours daily in my spare time with consistent instant pay.",
        profileUrl: "https://www.linkedin.com/company/shiftatsa/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["استلام أجور الورديات خلال وقت وجيز", "ورديات مرنة تبدأ من 3 ساعات فقط", "متاحة في جميع أحياء ومدن المملكة"],
    prosEn: ["Quick payout turnaround", "Shifts starting from 3 hours only", "Widespread across all Saudi cities"],
    cons: ["مقتصرة على المواطنين داخل المملكة"],
    consEn: ["Reserved for citizens inside KSA"],
    isNew: true,
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "saudi_exclusive",
      badgeAr: "🇸🇦 حصري للمواطنين (إدارة وتغطية الورديات بالساعة)",
      badgeEn: "🇸🇦 Saudi Citizens Only (Hourly Shift Operations)",
      reasonAr: "تخضع منصة ورديات لضوابط وزارة الموارد البشرية لبرامج تغطية الورديات والعمل المرن المخصصة للسعوديين لدعم نسب التوطين في قطاع التجزئة والضيافة.",
      reasonEn: "Subject to MHRSD regulations governing hourly shift coverage and flexible employment reserved for Saudi citizens to drive hospitality Saudization.",
      proofSourceUrl: "https://shiftat.sa",
      proofSourceNameAr: "لائحة ورديات لتنظيم العمل بالساعات",
      proofSourceNameEn: "Official Wardiyyat / Shiftat Work Regulations",
      targetCountries: ["SA"]
    },
    dateAdded: "2026-08-23",
  },

  // 15. Baeed (Arab World - 100% Remote Full-Time/Part-Time)
  {
    id: "baeed-001",
    title: "منصة بعيد للوظائف عن بُعد في كبرى الشركات (حسوب)",
    titleEn: "Baeed Remote Jobs Marketplace (Hsoub)",
    company: "Baeed (بعيد - حسوب)",
    emoji: "🌐",
    type: "وظائف عن بُعد (دوام كامل وجزئي)",
    typeEn: "100% Remote Jobs (Full & Part Time)",
    category: "programming",
    region: "arab",
    regionLabel: { ar: "الوطن العربي والعالم", en: "Arab World & Global" },
    subCategory: "برمجة، تسويق، إدارة، ومبيعات",
    subCategoryEn: "Dev, Marketing, Management & Sales",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Arab & Global Countries"],
      restrictedCountries: [],
      notes: "مفتوح لكافة الجنسيات العربية للعمل عن بعد برواتب شهرية مجزية",
      notesEn: "Open to all Arab talent worldwide with full remote contracts",
    },
    salary: { min: 800, max: 4500, currency: "USD", period: "month", average: "1800" },
    withdrawal: {
      minAmount: 100,
      currency: "USD",
      methods: [
        { name: "تحويل بنكي دولي مباشر / Payoneer", nameEn: "Wire Transfer / Payoneer", availableInSudan: true, notes: "عقود موثقة برواتب شهرية بالدولار أو العملات المحلية", notesEn: "Monthly contracts in USD or local currencies" },
      ],
      processingTime: "رواتب شهرية مجدولة",
      processingTimeEn: "Monthly scheduled payroll",
    },
    commission: { percentage: "0%", notes: "مجانية بالكامل للباحثين عن وظائف (تدفع الشركات رسوم النشر)", notesEn: "0% fee for candidates" },
    rating: { score: 4.9, totalReviews: 70000, trustLevel: "حسوب موثوق 100%", trustLevelEn: "Hsoub Verified 100%" },
    description: "المنصة العربية الأولى المتخصصة بالوظائف عن بعد بعقود رسمية ورواتب مجزية، تمكّنك من العمل من منزلك مع شركات في الخليج، أوروبا، والولايات المتحدة.",
    descriptionEn: "The premier Arabic platform dedicated to verified remote career jobs in top tech companies, startups, and enterprises.",
    requirements: ["خبرة عملية مبرهنة في تخصصك", "القدرة على إدارة الذات والإنتاجية عن بعد", "مهارات تواصل واضحة باللغة العربية والإنجليزية"],
    requirementsEn: ["Demonstrated domain experience", "Strong self-management and remote productivity", "Clear Arabic and English communication"],
    skills: ["هندسة البرمجيات", "التسويق الرقمي وإدارة الحملات", "كتابة المحتوى وSEO", "إدارة المنتجات", "خدمة العملاء"],
    skillsEn: ["Software Engineering", "Digital Marketing", "Content & SEO", "Product Management", "Customer Success"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء الملف المهني في بعيد", titleEn: "Build Profile on Baeed", description: "ادخل إلى baeed.com وأنشئ ملفك المهني بحساب حسوب", descriptionEn: "Visit baeed.com and setup your professional Hsoub bio", tips: "أرفق رابط حسابك على LinkedIn ومعرض أعمالك", tipsEn: "Attach LinkedIn URL and live portfolio" },
        { step: 2, title: "تصفح الوظائف حسب التخصص", titleEn: "Explore Open Openings", description: "تصفح شواغر البرمجة، التسويق، الدعم، والترجمة المحدثة يومياً", descriptionEn: "Browse freshly listed positions by category", tips: "تأكد من قراءة متطلبات الشركة بدقة", tipsEn: "Read specific employer criteria" },
        { step: 3, title: "التقديم المباشر برسالة دافع مخصصة", titleEn: "Apply with Custom Cover Letter", description: "أرسل خطاب تقديم يوضح كيف ستحل مشكلات الشركة وتضيف لقيمتها", descriptionEn: "Send a focused pitch detailing your value add", tips: "ابتعد عن الرسائل الجاهزة والنسخ واللصق", tipsEn: "Avoid generic templates" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://baeed.com" },
    successStories: [
      { 
        name: "أحمد منصور", 
        nameEn: "Ahmed Mansour", 
        city: "الإسكندرية / دبي", 
        cityEn: "Alexandria / Dubai", 
        earnings: "$2,200 / شهر", 
        earningsEn: "$2,200 / mo", 
        story: "حصلت على وظيفة مهندس DevOps عن بعد مع شركة برمجيات خليجية بعقد سنوي وراتب بالدولار وأنا في بيتي.", 
        storyEn: "Landed a remote DevOps engineer role with a GCC software house on an annual USD contract.",
        profileUrl: "https://www.linkedin.com/company/baeed/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["رواتب شهرية ثابتة وعالية بالدولار", "عقود رسمية واستقرار وظيفي كامل", "مفتوحة لجميع الدول العربية دون تمييز"],
    prosEn: ["Predictable high monthly USD compensation", "Legitimate remote contracts", "Open to all Arab nationalities"],
    cons: ["تتطلب خبرة مهنية قوية ومنافسة عالية"],
    consEn: ["Requires proven professional credentials and faces high competition"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 متاح لكافة الدول العربية (عمل عن بُعد بالكامل)",
      badgeEn: "🌍 Open to All Arab Countries (100% Remote)",
      reasonAr: "منصة تابعة لشركة حسوب مخصصة للوظائف عن بعد بعقود رسمية ورواتب مجزية بالدولار والعملات المحلية لجميع الكفاءات العربية دون أي قيود على الجنسية أو الموقع الجغرافي.",
      reasonEn: "A Hsoub platform dedicated to verified full-time and part-time remote jobs for Arab talent across all nationalities without residency barriers.",
      proofSourceUrl: "https://baeed.com",
      proofSourceNameAr: "شروط منصة بعيد للتوظيف عن بعد (حسوب)",
      proofSourceNameEn: "Baeed Remote Work Policies (Hsoub)",
      targetCountries: ["ALL_ARAB", "GLOBAL"]
    },
    dateAdded: "2026-08-24",
  },

  // 16. Kafiil (Arab World - Services & Contests)
  {
    id: "kafiil-001",
    title: "منصة كفيل للخدمات المصغرة والمشاريع والمسابقات",
    titleEn: "Kafiil Microservices, Projects & Contests",
    company: "Kafiil (كفيل)",
    emoji: "🛡️",
    type: "خدمات مصغرة ومسابقات ومشاريع",
    typeEn: "Microservices & Contests",
    category: "entry",
    region: "arab",
    regionLabel: { ar: "الوطن العربي", en: "Arab World" },
    subCategory: "مسابقات تصميم، خدمات مصغرة، ومشاريع",
    subCategoryEn: "Design Contests, Gigs & Projects",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Arab Countries"],
      restrictedCountries: [],
      notes: "تدعم وسائل دفع وسحب محلية واسعة بما فيها المحافظ الإلكترونية",
      notesEn: "Supports versatile local cashout methods including mobile wallets",
    },
    salary: { min: 5, max: 800, currency: "USD", period: "project", average: "60" },
    withdrawal: {
      minAmount: 10,
      currency: "USD",
      methods: [
        { name: "فودافون كاش / محافظ إلكترونية", nameEn: "Mobile Cash Wallets", availableInSudan: true, notes: "متاح لمصر وشمال إفريقيا", notesEn: "Popular in Egypt & North Africa" },
        { name: "Payoneer / PayPal", nameEn: "Payoneer / PayPal", availableInSudan: true, notes: "سحب سريع بالدولار", notesEn: "USD fast cashout" },
        { name: "تحويل بنكي مباشر", nameEn: "Direct Bank Wire", availableInSudan: true, notes: "لجميع البنوك العربية", notesEn: "Across Arab banks" },
      ],
      processingTime: "خلال 24 إلى 48 ساعة",
      processingTimeEn: "Within 24-48 hours",
    },
    commission: { percentage: "10% - 20%", notes: "تنخفض العمولة مع زيادة رتبة البائع", notesEn: "Decreases with seller tier" },
    rating: { score: 4.8, totalReviews: 42000, trustLevel: "عالي ومناسب للمبتدئين", trustLevelEn: "High & Beginner Friendly" },
    description: "منصة عمل حر عربية متكاملة تجمع بين بيع الخدمات المصغرة وطرح المشاريع وقسم خاص للمسابقات (تصميم شعارات، تسميات، أفكار إعلانية) تتيح للمبتدئين ربح جوائز نقدية فورية.",
    descriptionEn: "Comprehensive Arab freelance portal combining gig marketplace, project bidding, and lucrative design/naming contests.",
    requirements: ["مهارة رقمية قابلة للتقديم الفوري", "الالتزام بشروط التسليم والجودة", "تواصل سريع ومهذب مع العملاء"],
    requirementsEn: ["Actionable digital skill", "Quality delivery guarantee", "Courteous client communication"],
    skills: ["تصميم الجرافيك والشعارات", "المسابقات والأفكار الابتكارية", "كتابة وترجمة", "إدخال بيانات وتفريغ صوتي", "برمجة وتعديل قوالب"],
    skillsEn: ["Graphic & Logo Design", "Creative Contests", "Writing & Translation", "Data Entry", "Web Fixes"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل في منصة كفيل", titleEn: "Register on Kafiil", description: "ادخل إلى kafiil.com وسجل حساباً مجانياً", descriptionEn: "Visit kafiil.com and sign up for free", tips: "فعل بريدك الإلكتروني لتوثيق الحساب", tipsEn: "Verify email to activate features" },
        { step: 2, title: "المشاركة في المسابقات المفتوحة", titleEn: "Join Active Contests", description: "قدم تصاميمك وأفكارك في قسم المسابقات لكسب جوائز تبدأ من 50$", descriptionEn: "Submit concepts in contests to win instant prizes from $50", tips: "المسابقات أسرع وسيلة لبناء رصيد وتقييمات للمبتدئ", tipsEn: "Contests are ideal for fast beginner traction" },
        { step: 3, title: "إضافة خدماتك المصغرة", titleEn: "Publish Gigs", description: "أضف خدماتك بأسعار واضحة مع عينات جذابة", descriptionEn: "List your fixed services with portfolio previews", tips: "قدم إضافات وتطويرات مميزة للخدمة", tipsEn: "Offer attractive gig add-ons" },
      ],
      estimatedTime: "15 دقيقة",
      estimatedTimeEn: "15 minutes",
    },
    contact: { website: "https://kafiil.com" },
    successStories: [
      { 
        name: "ياسمين عادل", 
        nameEn: "Yasmine Adel", 
        city: "القاهرة / تونس", 
        cityEn: "Cairo / Tunis", 
        earnings: "$1,100 / شهر", 
        earningsEn: "$1,100 / mo", 
        story: "فزت بأكثر من 15 مسابقة تصميم شعارات على كفيل وكونت قاعدة عملاء خليجيين يتعاملون معي شهرياً.", 
        storyEn: "Won 15+ logo design contests on Kafiil and established recurring GCC corporate clients.",
        profileUrl: "https://www.linkedin.com/company/kafiil/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["قسم المسابقات يتيح الربح السريع بدون الحاجة لسابقة أعمال ضخمة", "وسائل سحب مرنة ومتعددة تناسب الجميع", "دعم فني سريع ومتفهم"],
    prosEn: ["Contests allow fast wins without deep history", "Versatile withdrawal rails", "Prompt responsive support"],
    cons: ["المنافسة على المسابقات تتطلب لمسة إبداعية متجددة"],
    consEn: ["Contest competition demands fresh creativity"],
    isNew: true,
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 متاح لجميع الدول العربية (خدمات ومسابقات)",
      badgeEn: "🌍 All Arab Countries (Gigs & Contests)",
      reasonAr: "توفر منصة كفيل وسائل سحب محلية سهلة (فودافون كاش، محافظ رقمية، بايبال، بايونير، حسابات بنكية) تدعم شباب كافة الدول العربية بلا استثناء.",
      reasonEn: "Supports a broad spectrum of local payout options (Vodafone Cash, Payoneer, Wire) ensuring full accessibility across all Arab countries.",
      proofSourceUrl: "https://kafiil.com",
      proofSourceNameAr: "شروط وضمانات منصة كفيل",
      proofSourceNameEn: "Official Kafiil Freelance Terms",
      targetCountries: ["ALL_ARAB"]
    },
    dateAdded: "2026-08-25",
  },

  // 17. Bayt.com (Arab World & GCC - Enterprise Recruitment & Relocation)
  {
    id: "bayt-001",
    title: "بوابة بيت.كوم (Bayt) للوظائف والشركات في الشرق الأوسط",
    titleEn: "Bayt.com MENA Employment & Enterprise Network",
    company: "Bayt.com (بيت.كوم)",
    emoji: "🏢",
    type: "وظائف كبرى وعقود استقدام وعن بُعد",
    typeEn: "Corporate Careers & Relocation",
    category: "trades",
    region: "arab",
    regionLabel: { ar: "الشرق الأوسط والخليج", en: "MENA & GCC" },
    subCategory: "هندسة، إدارة، مالية، وصحة",
    subCategoryEn: "Engineering, Finance, Healthcare & Mgmt",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Arab & International Nationalities"],
      restrictedCountries: [],
      notes: "متاح لجميع الجنسيات مع فرص توظيف محلي وعن بعد وعقود استقدام مع تأشيرات عمل",
      notesEn: "Open to all nationalities with remote, local and visa-sponsored jobs",
    },
    salary: { min: 1000, max: 7000, currency: "USD", period: "month", average: "2500" },
    withdrawal: {
      minAmount: 100,
      currency: "USD",
      methods: [
        { name: "رواتب مؤسسية مباشرة", nameEn: "Corporate Direct Payroll", availableInSudan: true, notes: "عقود عمل نظامية خاضعة لقوانين العمل في الدولة المستضيفة", notesEn: "Direct corporate payroll and contract" },
      ],
      processingTime: "شهرياً بموجب عقد العمل",
      processingTimeEn: "Monthly contractual payroll",
    },
    commission: { percentage: "0%", notes: "مجانية بالكامل للباحثين عن عمل", notesEn: "100% free for applicants" },
    rating: { score: 4.8, totalReviews: 310000, trustLevel: "الأقدم والأعرق في الشرق الأوسط", trustLevelEn: "Most Established MENA Portal" },
    description: "أكبر شبكة توظيف في الشرق الأوسط والخليج تضم أكثر من 40,000 شركة معلنة، وتوفر وظائف للمهندسين والأطباء والمبرمجين والإداريين مع فرص نقل الكفالة والاستقدام والعمل عن بعد.",
    descriptionEn: "The Middle East's largest job portal connecting over 40,000 employers with professionals for domestic, remote, and relocation opportunities.",
    requirements: ["سيرة ذاتية احترافية محدثة", "مؤهل جامعي أو خبرة مهنية موثقة", "إتقان اللغات أو المهارات التخصصية المطلوبة"],
    requirementsEn: ["Updated professional resume", "Relevant degree or accredited experience", "Domain and language fluency"],
    skills: ["إدارة المشاريع", "المحاسبة والمالية", "الهندسة المدنية والكهربائية", "الطب والتمريض", "تكنولوجيا المعلومات"],
    skillsEn: ["Project Management", "Finance & Accounting", "Engineering", "Healthcare", "IT Operations"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء السيرة الذاتية على بيت.كوم", titleEn: "Build Resume on Bayt", description: "سجل في bayt.com وأكمل سيرتك الذاتية بنسبة 100%", descriptionEn: "Create profile on bayt.com and complete CV to 100%", tips: "السيرة المكتملة تظهر في صدارة بحث مسؤولي التوظيف", tipsEn: "Full profiles rank higher in HR searches" },
        { step: 2, title: "تفعيل تنبيهات الوظائف اليومية", titleEn: "Enable Job Alerts", description: "حدد تخصصك والدول المستهدفة (السعودية، الإمارات، قطر، عن بعد)", descriptionEn: "Set search alerts for your specialty and target countries", tips: "التقديم في أول ساعة من نشر الوظيفة يضاعف فرصك", tipsEn: "Applying within the first hour doubles view rate" },
        { step: 3, title: "إجراء اختبارات المهارات المعتمدة", titleEn: "Take Skill Tests", description: "اجتز اختبارات بيت.كوم المجانية في تخصصك للحصول على أوسمة معتمدة", descriptionEn: "Pass free skill assessments to earn verified badges", tips: "الأوسمة تجذب كبرى الشركات والمؤسسات", tipsEn: "Badges attract enterprise recruiters" },
      ],
      estimatedTime: "25 دقيقة",
      estimatedTimeEn: "25 minutes",
    },
    contact: { website: "https://www.bayt.com" },
    successStories: [
      { 
        name: "محمد رضوان", 
        nameEn: "Mohamed Radwan", 
        city: "عمان / أبوظبي", 
        cityEn: "Amman / Abu Dhabi", 
        earnings: "$3,600 / شهر", 
        earningsEn: "$3,600 / mo", 
        story: "تم اختياري وتوظيفي وانتقالي للعمل في دولة الإمارات كمدير مشاريع عبر إعلان موثق على بيت.كوم مع توفير السكن والتأشيرة.", 
        storyEn: "Relocated to UAE as a project manager through a verified listing on Bayt with visa and accommodation.",
        profileUrl: "https://www.linkedin.com/company/bayt-com/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أضخم قاعدة وظائف حكومية وخاصة في الخليج", "عقود استقدام وتأشيرات عمل موثقة", "أمان مالي كامل وعقود خاضعة لقوانين العمل"],
    prosEn: ["Largest GCC enterprise job listings", "Verified relocation and visa opportunities", "Solid employment rights & legal safety"],
    cons: ["حجم متقدمين ضخم يتطلب سيرة ذاتية بارزة ومتقنة"],
    consEn: ["Massive applicant pools require top-tier CVs"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 متاح لجميع الجنسيات والدول العربية (وظائف واستقدام)",
      badgeEn: "🌍 All Nationalities & Arab Countries (Direct & Relocation)",
      reasonAr: "أكبر بوابة توظيف في الشرق الأوسط، تعلن فيها آلاف الشركات عن شواغر محلية وعن بُعد وتأشيرات عمل واستقدام لجميع الجنسيات دون قيود.",
      reasonEn: "The largest Middle East career portal featuring thousands of local, remote, and relocation opportunities for all nationalities.",
      proofSourceUrl: "https://www.bayt.com",
      proofSourceNameAr: "مركز مساعدة وشروط بيت.كوم الرسمية",
      proofSourceNameEn: "Bayt.com User Guide & Policy",
      targetCountries: ["ALL_ARAB", "GLOBAL"]
    },
    dateAdded: "2026-08-26",
  },

  // 18. Tanqeeb (Arab World - Smart Regional Job Search Engine)
  {
    id: "tanqeeb-001",
    title: "محرك تنقيب الذكي للوظائف في جميع الدول العربية",
    titleEn: "Tanqeeb Smart Job Search Engine for All Arab Countries",
    company: "Tanqeeb (تنقيب)",
    emoji: "🔍",
    type: "محرك بحث وظائف مخصص لكل دولة",
    typeEn: "Country-Specific Job Aggregator",
    category: "trades",
    region: "arab",
    regionLabel: { ar: "كافة الدول العربية", en: "All Arab Countries" },
    subCategory: "وظائف محلية وخليجية وعن بُعد",
    subCategoryEn: "Local, GCC & Remote Openings",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Arab Countries"],
      restrictedCountries: [],
      notes: "محرك شامل يجمع آلاف الوظائف يومياً مع أقسام مخصصة لكل دولة عربية",
      notesEn: "Comprehensive aggregator indexing thousands of jobs per country daily",
    },
    salary: { min: 400, max: 3500, currency: "USD", period: "month", average: "1200" },
    withdrawal: {
      minAmount: 50,
      currency: "USD",
      methods: [
        { name: "تقديم وتوظيف مباشر لدى الشركات", nameEn: "Direct Employer Hiring", availableInSudan: true, notes: "التقديم يربطك مباشرة بجهة العمل دون وسطاء", notesEn: "Direct contact with verified employers" },
      ],
      processingTime: "حسب جهة التوظيف",
      processingTimeEn: "Varies by employer",
    },
    commission: { percentage: "0%", notes: "مجاني 100% للباحثين عن عمل", notesEn: "100% free for candidates" },
    rating: { score: 4.7, totalReviews: 95000, trustLevel: "محرك بحث موثوق ومباشر", trustLevelEn: "Trusted Direct Aggregator" },
    description: "أكبر محرك بحث وظائف يغطي كافة الدول العربية، يجمع الشواغر اليومية من كبرى الشركات والمؤسسات مع أقسام متخصصة لمصر، السعودية، الإمارات، قطر، الكويت، المغرب، الأردن، وغيرها.",
    descriptionEn: "Leading pan-Arab job search engine aggregating daily openings across Egypt, Saudi Arabia, UAE, Qatar, Kuwait, Morocco, Jordan, and beyond.",
    requirements: ["اختيار دولتك المستهدفة", "سيرة ذاتية متوافقة مع متطلبات الوظيفة", "التواصل المباشر مع المعلن"],
    requirementsEn: ["Select target country sub-portal", "Targeted resume", "Direct communication with hiring manager"],
    skills: ["حسب التخصص والوظيفة المعروضة", "المرونة والتواصل السريع"],
    skillsEn: ["Role-specific domain skills", "Fast responsive communication"],
    registrationGuide: {
      steps: [
        { step: 1, title: "اختيار بوابة الدولة في تنقيب", titleEn: "Select Country Portal", description: "ادخل إلى tanqeeb.com واختر دولتك أو الدولة المستهدفة", descriptionEn: "Visit tanqeeb.com and choose your target country portal", tips: "يتوفر قسم مخصص للوظائف عن بُعد", tipsEn: "Dedicated remote jobs section is available" },
        { step: 2, title: "البحث والفرز حسب الراتب والمدينة", titleEn: "Filter by Role & Pay", description: "استخدم الفلاتر لاختيار المدينة، والخبرة، وتاريخ النشر", descriptionEn: "Filter by city, seniority, and posting date", tips: "فرز بالوظائف المنشورة خلال آخر 24 ساعة", tipsEn: "Sort by jobs posted in the last 24 hours" },
        { step: 3, title: "التقديم المباشر وإرسال البيانات", titleEn: "Direct Submission", description: "قدّم على الرابط المباشر للشركة أو أرسل سيرتك الذاتية للإيميل المعتمد", descriptionEn: "Apply on the employer's portal or verified email", tips: "اكتب عنوان رسالة واضح يتضمن المسمى الوظيفي", tipsEn: "Use clear email subject with job title" },
      ],
      estimatedTime: "10 دقائق",
      estimatedTimeEn: "10 minutes",
    },
    contact: { website: "https://tanqeeb.com" },
    successStories: [
      { 
        name: "كريم السعدي", 
        nameEn: "Karim Al-Saadi", 
        city: "الدار البيضاء / الرياض", 
        cityEn: "Casablanca / Riyadh", 
        earnings: "$1,400 / شهر", 
        earningsEn: "$1,400 / mo", 
        story: "كنت أتابع وظائف الاتصالات في المغرب والخليج عبر تنبيهات تنقيب اليومية، وتوظفت في شركة استشارات رائدة.", 
        storyEn: "Tracked telecom openings via Tanqeeb daily alerts and got hired by a leading consulting firm.",
        profileUrl: "https://www.linkedin.com/company/tanqeeb-com/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["تغطية شاملة وتحديث فوري على مدار الساعة", "أقسام منفصلة لكل دولة عربية على حدة", "تواصل مباشر مع الشركات دون حواجز"],
    prosEn: ["Comprehensive 24/7 refreshed inventory", "Dedicated sub-portal for each Arab country", "Direct employer connection"],
    cons: ["يتطلب التحقق من تفاصيل كل معلن على حدة"],
    consEn: ["Requires vetting individual company listings"],
    isNew: true,
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🌍 محرك شامل لجميع الدول العربية (أقسام محلية مخصصة)",
      badgeEn: "🌍 Pan-Arab Job Aggregator (Country Portals)",
      reasonAr: "محرك بحث يوفر قسماً مخصصاً لكل دولة عربية (مصر، السعودية، الإمارات، المغرب، الجزائر، الأردن، الكويت، عُمان، قطر، إلخ) مع عروض عمل محلية ودولية وعن بُعد.",
      reasonEn: "Comprehensive search engine with dedicated sub-portals for each Arab nation tailored to local and international applicants.",
      proofSourceUrl: "https://tanqeeb.com",
      proofSourceNameAr: "دليل وسياسة منصة تنقيب الرسمية",
      proofSourceNameEn: "Tanqeeb Regional Employment Guide",
      targetCountries: ["ALL_ARAB"]
    },
    dateAdded: "2026-08-27",
  },

  // 19. Freelancer.com (Global - Projects & Contests)
  {
    id: "freelancer-001",
    title: "منصة فريلانسر العالمية للمشاريع والمسابقات (Freelancer.com)",
    titleEn: "Freelancer.com Global Marketplace & Contests",
    company: "Freelancer.com",
    emoji: "🌐",
    type: "سوق عمل حر عالمي ومسابقات",
    typeEn: "Global Freelance & Contests",
    category: "programming",
    region: "global",
    regionLabel: { ar: "عالمي ودولي", en: "Global & International" },
    subCategory: "برمجة، تصميم، كتابة، وهندسة",
    subCategoryEn: "Dev, Design, Writing & Engineering",
    availability: {
      global: true,
      countries: ["all"],
      countriesEn: ["All Countries Worldwide"],
      restrictedCountries: [],
      notes: "مفتوحة لجميع المستقلين حول العالم مع مشاريع بجميع العملات العالمية",
      notesEn: "Open globally with projects in USD, EUR, GBP, and AUD",
    },
    salary: { min: 20, max: 1500, currency: "USD", period: "project", average: "150" },
    withdrawal: {
      minAmount: 30,
      currency: "USD",
      methods: [
        { name: "Payoneer / Freelancer Debit Card", nameEn: "Payoneer Card", availableInSudan: true, notes: "الخيار الأفضل للسحب السريع", notesEn: "Best choice for fast cashout" },
        { name: "تحويل بنكي دولي Wire", nameEn: "International Wire", availableInSudan: true, notes: "متاح إلى جميع الحسابات البنكية الدولية", notesEn: "To all international bank accounts" },
        { name: "PayPal / Skrill", nameEn: "PayPal / Skrill", availableInSudan: false, alternativeForSudan: "Payoneer", alternativeForSudanEn: "Payoneer" },
      ],
      processingTime: "خلال 2-3 أيام عمل",
      processingTimeEn: "2-3 business days",
    },
    commission: { percentage: "10% أو $5", notes: "النسبة الأقل أيهما أكبر", notesEn: "10% or $5 whichever is greater" },
    rating: { score: 4.6, totalReviews: 450000, trustLevel: "عالمي معتمد 100%", trustLevelEn: "Global Verified 100%" },
    description: "واحدة من أقدم وأكبر منصات العمل الحر في العالم مع أكثر من 60 مليون مستخدم، وتتميز بنظام المسابقات العالمية المفتوحة في التصميم والبرمجة وحماية الدفعات بنظام Milestone.",
    descriptionEn: "One of the world's most established freelancing platforms with 60M+ users, featuring global contests, milestone payments, and multi-currency billing.",
    requirements: ["ملف شخصي مكتمل بالإنجليزية", "معرض نماذج أعمال سابق", "التزام بمواعيد تسليم المشاريع"],
    requirementsEn: ["Complete English profile", "Verified portfolio samples", "Punctual milestone delivery"],
    skills: ["PHP & Laravel", "Python & AI", "Logo & Graphic Design", "Mobile Apps", "Data Processing", "Content Writing"],
    skillsEn: ["PHP & Laravel", "Python & AI", "Logo & Graphic Design", "Mobile Apps", "Data Processing", "Content Writing"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب في Freelancer.com", titleEn: "Register on Freelancer.com", description: "سجل مجاناً عبر freelancer.com باللغة الإنجليزية", descriptionEn: "Join for free at freelancer.com with English profile", tips: "حدد مهاراتك بدقة للحصول على تنبيهات المشاريع", tipsEn: "Tag skills accurately for project alerts" },
        { step: 2, title: "المشاركة في المسابقات (Contests)", titleEn: "Enter Contests", description: "ادخل قسم المسابقات وارفع تصميماتك للفوز بجوائز نقدية فورية", descriptionEn: "Upload contest submissions to win instant cash prizes", tips: "طريقة ممتازة لاكتساب تقييمات أولية وأرباح بالدولار", tipsEn: "Great way to build ratings and earn USD fast" },
        { step: 3, title: "تقديم عروض على المشاريع المفتوحة", titleEn: "Bid on Open Projects", description: "اكتب عروضاً مخصصة لأصحاب المشاريع واقترح حلولاً عملية", descriptionEn: "Submit targeted bids offering actionable solutions", tips: "استخدم النقاط المجانية بحكمة", tipsEn: "Use free bids strategically" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://www.freelancer.com" },
    successStories: [
      { 
        name: "محمود الهادي", 
        nameEn: "Mahmoud El-Hadi", 
        city: "بنزرت / برلين", 
        cityEn: "Bizerte / Berlin", 
        earnings: "$2,100 / شهر", 
        earningsEn: "$2,100 / mo", 
        story: "فزت بأول مسابقة تطوير قوالب ووردبريس على فريلانسر، ومنها بنيت شبكة عملاء دائمين يدفعون لي باليورو والدولار.", 
        storyEn: "Won my first WordPress contest on Freelancer and cultivated long-term clients paying in EUR & USD.",
        profileUrl: "https://www.linkedin.com/company/freelancer-com/",
        profileType: "linkedin",
        verified: true
      }
    ],
    pros: ["أضخم عدد مشاريع ومسابقات بالدولار واليورو", "نظام مسابقات مميز للمبتدئين لبناء سمعة سريعة", "سحب مضمون عبر Payoneer"],
    prosEn: ["Immense project & contest volume", "Contest mechanic for quick beginner traction", "Guaranteed Payoneer cashout"],
    cons: ["عمولة إضافية على بعض الخدمات الإضافية"],
    consEn: ["Optional paid feature fees"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "🌐 متاح عالمياً (مشاريع ومسابقات بالدولار)",
      badgeEn: "🌐 Globally Available (USD Projects & Contests)",
      reasonAr: "منصة دولية عريقة مفتوحة للعمل الحر للجميع دون تمييز، مع دعم مسابقات التصميم والبرمجة بالدولار ونظام حماية كامل للدفعات.",
      reasonEn: "Global freelance platform open worldwide with escrow protection and cash prize contests for all digital disciplines.",
      proofSourceUrl: "https://www.freelancer.com",
      proofSourceNameAr: "شروط وأحكام منصة Freelancer.com العالمية",
      proofSourceNameEn: "Freelancer.com Global Terms of Service",
      targetCountries: ["GLOBAL"]
    },
    dateAdded: "2026-08-28",
  },

  // 20. Picalica (حسوب - بيكاليكا)
  {
    id: "picalica-020",
    title: "متجر بيكاليكا للمنتجات الرقمية والتصاميم الجاهزة",
    titleEn: "Picalica Digital Marketplace & Templates",
    company: "بيكاليكا (حسوب)",
    emoji: "🛒",
    type: "بيع تصاميم وقوالب (دخل سلبي بالدولار)",
    typeEn: "Digital Assets Marketplace (Passive Income USD)",
    category: "design",
    region: "arab",
    regionLabel: { ar: "الوطن العربي وعالمياً", en: "Arab World & Global" },
    subCategory: "قوالب ووردبريس، ثيمات، أيقونات، وخطوط",
    subCategoryEn: "WordPress Themes, UI Kits, Icons & Code",
    availability: {
      global: true,
      countries: ["كافة الدول العربية", "السودان", "مصر", "السعودية", "الخليج", "العالم"],
      countriesEn: ["All Arab Countries", "Sudan", "Egypt", "KSA", "GCC", "Worldwide"],
      restrictedCountries: [],
      notes: "متاح لجميع المطورين والمصممين العرب لرفع أعمالهم وبيعها برخصة متعددة الاستخدامات.",
      notesEn: "Open to all Arab developers and designers to monetize creative assets.",
    },
    salary: { min: 10, max: 250, currency: "USD", period: "project", average: "$450 - $1,800 / شهر (دخل سلبي متراكم)" },
    withdrawal: {
      minAmount: 25,
      currency: "USD",
      methods: [
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "سحب مباشر لبطاقة أو حساب بايونيير", notesEn: "Direct Payoneer cashout" },
        { name: "تحويل بنكي مباشر", nameEn: "Wire Bank Transfer", availableInSudan: true, notes: "لأي حساب بنكي دولي بالدولار أو العملة المحلية", notesEn: "International wire transfer" },
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, notes: "متاح للدول المدعومة", notesEn: "Available where supported" },
      ],
      processingTime: "خلال الأسبوع الأول من كل شهر ميلادي",
      processingTimeEn: "First week of each calendar month",
    },
    commission: { percentage: "20% - 40%", notes: "عمولة المنصة تشمل الاستضافة والدعم وبوابة الدفع مع حقوق ملكية كاملة للبائع", notesEn: "Platform sales fee covering hosting and payment processing" },
    rating: { score: 4.8, totalReviews: 2340, trustLevel: "منصة معتمدة ومملوكة لشركة حسوب", trustLevelEn: "Verified Hsoub Ecosystem Platform" },
    description: "بيكاليكا هو أكبر متجر عربي للمنتجات الرقمية الجاهزة؛ يمكنك تصميم قوالب مواقع، ثيمات Shopify وWordPress، أيقونات، بطاقات عمل، خطوط، أو عروض تقديمية ورفعها لتباع مئات المرات محققة لك دخلاً سلبياً مستمراً بالدولار دون الحاجة للتفاوض مع عملاء.",
    descriptionEn: "Picalica is the premier Arabic marketplace for ready-made digital products: themes, UI kits, graphics, code, and presentations earning recurring passive USD income.",
    requirements: ["منتج رقمي عالي الجودة من صنعك الخاص (بدون انتهاك حقوق)", "ملفات مصدرية منظمة وشاملة للتوثيق", "حساب مفعل في شبكة حسوب"],
    requirementsEn: ["Original high-quality digital assets", "Well-documented source files", "Verified Hsoub network account"],
    skills: ["Figma & Adobe XD", "WordPress & HTML5", "Logo & Graphic Design", "Notion Templates", "Presentation Design"],
    skillsEn: ["Figma & Adobe XD", "WordPress & HTML5", "Logo & Graphic Design", "Notion Templates", "Presentation Design"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب حسوب الموحد", titleEn: "Create Hsoub Account", description: "سجل مجاناً عبر picalica.com بحساب حسوب الموحد", descriptionEn: "Sign up at picalica.com using your unified Hsoub credentials", tips: "نفس الحساب يعمل على خمسات ومستقل", tipsEn: "Same account works across Mostaql & Khamsat" },
        { step: 2, title: "تقديم طلب فتح حساب بائع", titleEn: "Apply as Author/Seller", description: "املأ بيانات البائع وارفق نماذج من تصاميمك وخبراتك الفنية", descriptionEn: "Complete author profile and submit representative portfolio samples", tips: "احرص على رفع أفضل أعمالك للموافقة السريعة", tipsEn: "Showcase your highest-quality assets for instant review" },
        { step: 3, title: "رفع منتجك الرقمي والمراجعة", titleEn: "Upload Product & Review", description: "ارفع الملفات المصدرية، صور العرض الجذابة، واكتب وصفاً واضحاً", descriptionEn: "Upload source zip, promotional previews, and write lucid instructions", tips: "التوثيق الواضح يزيد مبيعاتك 3 أضعاف", tipsEn: "Clear documentation triples conversion rates" },
      ],
      estimatedTime: "15 دقيقة",
      estimatedTimeEn: "15 minutes",
    },
    contact: { website: "https://picalica.com" },
    successStories: [
      {
        name: "أسامة البدوي",
        nameEn: "Osama El-Badawi",
        city: "أم درمان / الإسكندرية",
        cityEn: "Omdurman / Alexandria",
        earnings: "$1,350 / شهر",
        earningsEn: "$1,350 / mo",
        story: "صممت 4 قوالب هوية بصرية وثيم ووردبريس عربي، والآن تدر علي مبيعات شهرية متكررة تسحب مباشرة إلى حساب Payoneer الخاص بي.",
        storyEn: "Crafted 4 branding identity templates and a WordPress theme, now generating consistent monthly passive royalties deposited to my Payoneer.",
        profileUrl: "https://www.linkedin.com/company/hsoub/",
        profileType: "linkedin",
        verified: true,
      },
    ],
    pros: ["دخل سلبي مستمر (اصنع العمل مرة واحدة وبعه مئات المرات)", "لا توجد أي مشاحنات مع العملاء حول التعديلات", "سحب مضمون عبر شبكة حسوب الموثوقة"],
    prosEn: ["True passive income (create once, sell repeatedly)", "No client micro-management or endless revisions", "Guaranteed payouts through Hsoub's battle-tested escrow"],
    cons: ["مراجعة دقيقة لجودة المنتجات قبل النشر لضمان المعايير"],
    consEn: ["Strict quality assurance review prior to listing"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "all_arab",
      badgeAr: "🛒 متاح لكافة المبدعين العرب (دخل سلبي بالدولار)",
      badgeEn: "🛒 Open to All Arab Creators (Recurrent USD Income)",
      reasonAr: "منصة تابعة لمجموعة حسوب تتيح للمصممين والمطورين العرب بيع تصاميمهم وقوالبهم البرمجية لآلاف المشترين في الخليج والعالم، مع سحب مضمون عبر بايونيير والتحويلات البنكية.",
      reasonEn: "Hsoub-backed digital marketplace empowering Arab designers and developers to sell design kits, templates and scripts with guaranteed Payoneer & wire payouts.",
      proofSourceUrl: "https://picalica.com/terms",
      proofSourceNameAr: "شروط استخدام متجر بيكاليكا الرسمي",
      proofSourceNameEn: "Picalica Official Marketplace Terms",
      targetCountries: ["ALL_ARAB", "GLOBAL"],
    },
    dateAdded: "2026-09-04",
  },

  // 21. Contra (شبكة كونترا العالمية 0% عمولة)
  {
    id: "contra-021",
    title: "شبكة كونترا العالمية للمستقلين (0% عمولة كاملة)",
    titleEn: "Contra Commission-Free Freelance Network",
    company: "Contra Inc.",
    emoji: "⚡",
    type: "عمل حر عن بعد بدون عمولة (0% Commission)",
    typeEn: "0% Commission Remote Freelancing",
    category: "programming",
    region: "global",
    regionLabel: { ar: "عالمي (الولايات المتحدة وأوروبا)", en: "Global (US & Europe)" },
    subCategory: "تصميم واجهات، برمجة، إدارة منتجات، ذكاء اصطناعي",
    subCategoryEn: "UI/UX, Full-stack Dev, Product Management, AI",
    availability: {
      global: true,
      countries: ["كافة دول العالم", "السودان", "مصر", "الخليج", "أوروبا", "الأمريكتين"],
      countriesEn: ["Worldwide", "Sudan", "Egypt", "GCC", "Europe", "Americas"],
      restrictedCountries: [],
      notes: "منصة عالمية متطورة مفتوحة للجميع بدون أي قيود جغرافية، وتمنحك 100% من أتعابك.",
      notesEn: "Global modern platform open worldwide with zero location restrictions and 100% earnings retention.",
    },
    salary: { min: 25, max: 130, currency: "USD", period: "hour", average: "$3,200 / شهر (أو $1,500 - $6,000 لكل مشروع)" },
    withdrawal: {
      minAmount: 1,
      currency: "USD",
      methods: [
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "سحب سريع لبطاقة وحساب بايونيير", notesEn: "Direct Payoneer withdrawal" },
        { name: "تحويل بنكي مباشر (Stripe Direct)", nameEn: "Direct Bank Transfer", availableInSudan: true, notes: "لحسابات البنوك الدولية", notesEn: "Direct wire to international accounts" },
        { name: "عملات رقمية مستقرة (USDC)", nameEn: "Stablecoin (USDC)", availableInSudan: true, notes: "دفع فوري بالدولار الرقمي المشفر بدون رسوم تحويل", notesEn: "Instant fee-free USDC payout" },
      ],
      processingTime: "فوري أو خلال 24 ساعة من موافقة العميل",
      processingTimeEn: "Instant or within 24h of milestone approval",
    },
    commission: { percentage: "0%", notes: "المنصة لا تخصم أي نسبة من المستقل نهائياً وتفرض رسوماً بسيطة على العميل فقط", notesEn: "Zero commission deducted from freelancers; clients cover processing" },
    rating: { score: 4.9, totalReviews: 5820, trustLevel: "شبكة عالمية فائقة الموثوقية", trustLevelEn: "Premier Silicon Valley Backed Platform" },
    description: "كونترا هي الجيل الجديد من منصات العمل الحر العالمية؛ تجمع بين معرض أعمال تفاعلي مذهل (Portfolio)، ونظام عقود قانونية مشفرة، ومدفوعات مضمونة بدون اقتطاع أي سنت من أرباحك (0% عمولة). يدير أصحاب المشاريع والشركات الناشئة الأمريكية والأوروبية عقودهم من خلالها مباشرة.",
    descriptionEn: "Contra is the premier commission-free freelance network where top independent professionals showcase interactive portfolios and contract with global startups keeping 100% of their earnings.",
    requirements: ["ملف مهني باللغة الإنجليزية يضم نماذج أعمال حقيقية", "مهارة تقنية أو تصميمية متقنة", "التواصل بالإنجليزية عبر المنصة"],
    requirementsEn: ["Polished English portfolio with live case studies", "Proven domain craft", "Professional English communication"],
    skills: ["Figma & Product Design", "React, Next.js & Node", "Webflow & Framer", "AI Prompt & Automation", "Brand Identity"],
    skillsEn: ["Figma & Product Design", "React, Next.js & Node", "Webflow & Framer", "AI Prompt & Automation", "Brand Identity"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء بروفايل احترافي مجاني", titleEn: "Build Your Contra Portfolio", description: "سجل عبر contra.com وأنشئ محفظتك الإبداعية بدقائق", descriptionEn: "Join at contra.com and assemble your portfolio blocks", tips: "اربط مشاريعك الحقيقية مع روابط حية لمعاينتها", tipsEn: "Link live URLs and detailed case studies" },
        { step: 2, title: "تحديد الخدمات والأسعار (Services)", titleEn: "Publish Your Service Offerings", description: "أنشئ بطاقات لخدماتك بأسعار محددة أو بالساعة", descriptionEn: "Define your packages with clear deliverables and pricing", tips: "حدد أسعاراً عادلة بالدولار ولا تبخس قيمة عملك", tipsEn: "Price competitively in USD without undercutting your craft" },
        { step: 3, title: "التقديم على فرص العمل الحر المفتوحة", titleEn: "Apply to Open Client Roles", description: "تصفح قسم 'Jobs' وقدم مقترحك بنقرة واحدة من بروفايلك", descriptionEn: "Browse the curated jobs feed and pitch directly via your profile", tips: "الردود السريعة عبر تطبيق كونترا تضاعف فرص التعاقد", tipsEn: "Fast responses on Contra app dramatically boost contract rates" },
      ],
      estimatedTime: "20 دقيقة",
      estimatedTimeEn: "20 minutes",
    },
    contact: { website: "https://contra.com" },
    successStories: [
      {
        name: "ريم الشريف",
        nameEn: "Reem El-Sherif",
        city: "الخرطوم / مسقط",
        cityEn: "Khartoum / Muscat",
        earnings: "$2,800 / شهر",
        earningsEn: "$2,800 / mo",
        story: "أنشأت ملفي المهني ومحفظتي على كونترا وحصلت على عميلين دائمين في سان فرانسيسكو لتصميم واجهات Figma، وأستلم أموالي بالكامل بنسبة 100% بدون أي خصومات.",
        storyEn: "Built my design portfolio on Contra and signed two long-term San Francisco startups for UI/UX work, keeping 100% of my contract earnings.",
        profileUrl: "https://www.linkedin.com/company/contra-hq/",
        profileType: "linkedin",
        verified: true,
      },
    ],
    pros: ["0% عمولة للمستقلين (تحصل على كامل أتعابك)", "محفظة أعمال (Portfolio) تفاعلية حديثة تجذب العملاء تلقائياً", "دعم الدفع عبر Payoneer وتحويل بنكي وعملات مستقرة (USDC)"],
    prosEn: ["Zero commission deduction on freelancer payouts", "Modern visual portfolio builder that attracts inbound leads", "Supports direct wire, Payoneer, and zero-fee USDC"],
    cons: ["المنافسة العالمية تتطلب محفظة أعمال باللغة الإنجليزية عالية الجودة"],
    consEn: ["Global standards require a polished English presentation"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "⚡ متاح عالمياً بـ 0% عمولة (سحب فوري بالدولار)",
      badgeEn: "⚡ 0% Commission Worldwide (Instant USD Cashout)",
      reasonAr: "أحدث وأرقى منصات العمل الحر العالمية المعاصرة، تتيح للمستقلين حول العالم بناء ملف مهني رائع والتعاقد مع شركات ناشئة عالمية والحصول على كامل أجرهم دون اقتطاع أي نسبة، مع دعم تحويلات بنكية مباشرة وعملات رقمية مستقرة.",
      reasonEn: "Premier modern global freelance network open worldwide, charging 0% freelancer commission with direct bank, Payoneer and USDC crypto payouts.",
      proofSourceUrl: "https://contra.com/terms",
      proofSourceNameAr: "ميثاق وسياسة كونترا الرسمية للمستقلين (0% Fees)",
      proofSourceNameEn: "Contra Freelancer Agreement & Zero-Fee Guarantee",
      targetCountries: ["GLOBAL"],
    },
    dateAdded: "2026-09-04",
  },

  // 22. Gengo (منصة جينجو العالمية للترجمة)
  {
    id: "gengo-022",
    title: "منصة جينجو العالمية للترجمة والتدقيق اللغوي",
    titleEn: "Gengo Global Translation Platform",
    company: "Gengo (Lionbridge)",
    emoji: "🌐",
    type: "ترجمة فورية وتدقيق لغوي عن بُعد",
    typeEn: "Remote Translation & Proofreading",
    category: "writing",
    region: "global",
    regionLabel: { ar: "عالمي (أمريكا واليابان وأوروبا)", en: "Global (Americas, Japan, EU)" },
    subCategory: "ترجمة إنجليزية-عربية، ترجمة تقنية وتسويقية",
    subCategoryEn: "EN-AR Translation, Technical & Localization",
    availability: {
      global: true,
      countries: ["كافة دول العالم", "السودان", "مصر", "المغرب العربي", "الخليج"],
      countriesEn: ["Worldwide", "Sudan", "Egypt", "Maghreb", "GCC"],
      restrictedCountries: [],
      notes: "متاحة لكافة المترجمين حول العالم بمجرد اجتياز اختبار التأهيل الإلكتروني.",
      notesEn: "Available to linguists worldwide upon passing the automated proficiency test.",
    },
    salary: { min: 0.05, max: 0.14, currency: "USD", period: "project", average: "$950 - $1,600 / شهر (بحسب حجم الكلمات المنجزة)" },
    withdrawal: {
      minAmount: 20,
      currency: "USD",
      methods: [
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "سحب مباشر لبطاقة أو حساب بايونيير", notesEn: "Direct Payoneer cashout" },
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, notes: "متاح للدول المدعومة", notesEn: "Supported countries only" },
      ],
      processingTime: "مرتان شهرياً (يومي 10 و25 من كل شهر)",
      processingTimeEn: "Bi-monthly (on the 10th and 25th of each month)",
    },
    commission: { percentage: "0% إضافية", notes: "السعر المدفوع للمترجم محدد وصافي لكل كلمة مترجمة", notesEn: "Net fixed price per word with zero deduction" },
    rating: { score: 4.7, totalReviews: 4120, trustLevel: "تابعة لشركة Lionbridge العالمية", trustLevelEn: "Lionbridge Group Verified Service" },
    description: "جينجو هي واحدة من كبرى منصات تعهيد الترجمة عالمياً، تابعة لشركة Lionbridge الشهيرة. لا تحتاج إلى البحث عن عملاء أو التفاوض؛ بمجرد اجتياز اختبار الترجمة عبر الإنترنت، تصلك مهام ترجمة فورية لمواقع، تطبيقات، وألعاب إلكترونية لماركات عالمية وتقوم بتسليمها واستلام أرباحك بالدولار.",
    descriptionEn: "Gengo is a leading automated translation platform by Lionbridge. No bidding or negotiation required: pass the online screening test and claim immediate translation tasks with regular USD payouts.",
    requirements: ["إتقان اللغتين العربية والإنجليزية قراءة وكتابة", "اجتياز اختبار الترجمة التمهيدي بنجاح", "جهاز حاسوب واتصال مستقر بالإنترنت"],
    requirementsEn: ["Fluency in both Arabic and English", "Passing the standardized translation test", "Stable computer and internet connection"],
    skills: ["Arabic-English Translation", "Proofreading & Editing", "Localization", "Subtitling", "Technical Glossary"],
    skillsEn: ["Arabic-English Translation", "Proofreading & Editing", "Localization", "Subtitling", "Technical Glossary"],
    registrationGuide: {
      steps: [
        { step: 1, title: "التسجيل في بوابة المترجمين", titleEn: "Register as Translator", description: "ادخل إلى gengo.com/translators وسجل حسابك مجاناً", descriptionEn: "Visit gengo.com/translators and register your linguist profile", tips: "اختر زوج اللغات (إنجليزي إلى عربي)", tipsEn: "Select language pair: English to Arabic" },
        { step: 2, title: "خوض اختبار الترجمة القياسي", titleEn: "Take the Proficiency Test", description: "أجب عن أسئلة القواعد وترجم النصوص النموذجية بدقة", descriptionEn: "Complete multiple-choice grammar and sample translation passages", tips: "راجع القواعد وعلامات الترقيم وتجنب الترجمة الحرفية", tipsEn: "Review punctuation and avoid robotic literal translation" },
        { step: 3, title: "البدء في استلام المهام والأرباح", titleEn: "Claim Jobs & Earn", description: "بعد القبول، ادخل لوحة العمل واختر المشاريع المتاحة", descriptionEn: "Once accepted, open the job dashboard and claim available texts", tips: "السرعة في اختيار المهام تضمن لك تدفقاً مستمراً للعمل", tipsEn: "Fast turnaround unlocks higher-tier and volume priority" },
      ],
      estimatedTime: "30 دقيقة",
      estimatedTimeEn: "30 minutes",
    },
    contact: { website: "https://gengo.com/translators/" },
    successStories: [
      {
        name: "هبة الله مجذوب",
        nameEn: "Hebatallah Magzoub",
        city: "ود مدني / الدوحة",
        cityEn: "Wad Madani / Doha",
        earnings: "$1,250 / شهر",
        earningsEn: "$1,250 / mo",
        story: "اجتزت اختبار الترجمة العربي/الإنجليزي القياسي، والآن أستلم مهام يومية لترجمة محتوى مواقع كبرى وألعاب فيديو بالدولار مع استلام الأرباح كل أسبوعين.",
        storyEn: "Passed the English-Arabic translation exam, now completing regular e-commerce and app localization tasks with bi-weekly USD payouts.",
        profileUrl: "https://www.linkedin.com/company/gengo/",
        profileType: "linkedin",
        verified: true,
      },
    ],
    pros: ["لا حاجة للمزايدة أو التفاوض مع العملاء (المهام تظهر مباشرة)", "صرف منتظم ومضمون للأرباح مرتين شهرياً عبر Payoneer", "مناسب لجميع المستويات التي تجتاز الاختبار"],
    prosEn: ["No client bidding or negotiation; immediate job claiming", "Reliable bi-monthly payouts via Payoneer", "Work flexibly from anywhere on your own schedule"],
    cons: ["قد تنفد مهام الترجمة في فترات الهدوء وتتطلب متابعة اللوحة"],
    consEn: ["Job availability fluctuates depending on global enterprise demand"],
    isNew: true,
    isFeatured: false,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "📖 معتمد ومتاح للمترجمين عالمياً (بالكلمة)",
      badgeEn: "📖 Open Worldwide for Translators (Per-Word Rates)",
      reasonAr: "منصة ترجمة عالمية رائدة مملوكة لشركة Lionbridge العملاقة، تقبل المترجمين من مختلف أنحاء العالم بمجرد اجتياز اختبار الترجمة الآلي، مع صرف منتظم للأرباح مرتين شهرياً عبر بايونيير.",
      reasonEn: "Lionbridge-owned international translation hub welcoming bilingual translators worldwide via automated proficiency tests with bi-monthly payouts.",
      proofSourceUrl: "https://gengo.com/translators/faq/",
      proofSourceNameAr: "دليل وشروط انضمام المترجمين في منصة جينجو",
      proofSourceNameEn: "Gengo Translator FAQ & Eligibility Guide",
      targetCountries: ["GLOBAL"],
    },
    dateAdded: "2026-09-04",
  },

  // 23. ProZ.com (مجتمع برو-زد العالمي للمترجمين)
  {
    id: "proz-023",
    title: "مجتمع برو-زد العالمي للمترجمين المحترفين واللغويين",
    titleEn: "ProZ.com World's Largest Translation Network",
    company: "ProZ.com",
    emoji: "📚",
    type: "عقود ترجمة دولية ومشاريع دور النشر والمنظمات",
    typeEn: "International Translation & Enterprise RFP",
    category: "writing",
    region: "global",
    regionLabel: { ar: "عالمي ودولي", en: "Worldwide Enterprise" },
    subCategory: "ترجمة قانونية، طبية، فورية، ومصطلحات",
    subCategoryEn: "Legal, Medical, Simultaneous & Terminology",
    availability: {
      global: true,
      countries: ["جميع دول العالم", "السودان", "مصر", "الخليج", "أوروبا"],
      countriesEn: ["Worldwide", "Sudan", "Egypt", "GCC", "Europe"],
      restrictedCountries: [],
      notes: "الشبكة الأولى عالمياً التي تعتمد عليها كبرى وكالات ودور الترجمة العالمية.",
      notesEn: "The premier portal used by top international language service providers.",
    },
    salary: { min: 20, max: 75, currency: "USD", period: "hour", average: "$2,400 / شهر (أو $0.07 - $0.18 للكلمة)" },
    withdrawal: {
      minAmount: 10,
      currency: "USD",
      methods: [
        { name: "تحويل بنكي دولي مباشر", nameEn: "Wire Bank Transfer", availableInSudan: true, notes: "مباشرة من وكالة الترجمة لحسابك البنكي", notesEn: "Direct wire from agency to your bank" },
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "طريقة شائعة ومعتمدة من أغلب الوكالات", notesEn: "Widely adopted by international translation agencies" },
        { name: "PayPal", nameEn: "PayPal", availableInSudan: false, notes: "متاح للدول المدعومة", notesEn: "Supported countries only" },
      ],
      processingTime: "حسب شروط العقد المباشر (30 يوماً أو فوري)",
      processingTimeEn: "Net 30 or upon milestone delivery per agency terms",
    },
    commission: { percentage: "0% للمشاريع المباشرة", notes: "التعاقد والدفع يتمان مباشرة بين وكالة الترجمة والمترجم دون أي عمولة وساطة", notesEn: "Direct contracts between agency and linguist with 0% intermediary fee" },
    rating: { score: 4.8, totalReviews: 8900, trustLevel: "المرجع العالمي الأول لصناعة الترجمة", trustLevelEn: "The Industry Standard Linguistics Authority" },
    description: "تأسست ProZ عام 1999 وتعتبر أكبر مجتمع للمترجمين التحريريين والفوريين في التاريخ؛ تضم أكثر من 1.3 مليون عضو ومئات الوكالات والمنظمات الدولية (مثل الأمم المتحدة وشركات الأدوية) التي تطرح مناقصات ومشاريع ترجمة مستمرة بأسعار ممتازة وعقود طويلة الأمد.",
    descriptionEn: "Founded in 1999, ProZ.com is the world's largest linguistics directory connecting 1.3M+ freelance translators directly with enterprise agencies and global publishers.",
    requirements: ["خبرة عملية أو مؤهل في الترجمة أو اللغات", "معرفة بأدوات الترجمة بمساعدة الحاسوب (CAT Tools)", "سيرة ذاتية متخصصة ومحدثة"],
    requirementsEn: ["Linguistics/translation degree or demonstrated expertise", "Familiarity with CAT tools (Trados, memoQ, etc.)", "Specialized professional CV"],
    skills: ["Legal & Medical Translation", "Subtitling & Transcription", "CAT Tools (Trados, MemoQ)", "Proofreading", "Simultaneous Interpreting"],
    skillsEn: ["Legal & Medical Translation", "Subtitling & Transcription", "CAT Tools (Trados, MemoQ)", "Proofreading", "Simultaneous Interpreting"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء حساب مترجم مهني", titleEn: "Create Professional Profile", description: "سجل مجاناً في proz.com وحدد أزواج اللغات ومجالات التخصص", descriptionEn: "Join proz.com for free and specify language pairs and subject fields", tips: "حدد تخصصك الدقيق (طبي، تقني، قانوني)", tipsEn: "Tag distinct specialties: legal, medical, technical" },
        { step: 2, title: "المشاركة في شبكة KudoZ للمصطلحات", titleEn: "Contribute to KudoZ Terminology", description: "ساعد المترجمين الآخرين في إيجاد المصطلحات الصعبة لرفع نقاطك", descriptionEn: "Answer terminology queries to earn KudoZ credibility points", tips: "نقاط KudoZ تضعك في صدارة نتائج البحث للوكالات العالمية", tipsEn: "KudoZ points rank your profile at the top of agency searches" },
        { step: 3, title: "التقديم على عروض العمل المفتوحة (Jobs Feed)", titleEn: "Bid on Open RFPs & Jobs", description: "تصفح قسم الوظائف يومياً وتواصل مباشرة مع الوكالات الطالبة", descriptionEn: "Review daily translation job postings and send direct proposals", tips: "أرفق عينة ترجمة مخصصة لمجال المشروع", tipsEn: "Attach relevant samples matching project domain" },
      ],
      estimatedTime: "25 دقيقة",
      estimatedTimeEn: "25 minutes",
    },
    contact: { website: "https://www.proz.com" },
    successStories: [
      {
        name: "د. طارق السماني",
        nameEn: "Dr. Tariq El-Sammani",
        city: "الخرطوم / إسطنبول",
        cityEn: "Khartoum / Istanbul",
        earnings: "$2,900 / شهر",
        earningsEn: "$2,900 / mo",
        story: "حصلت من خلال برو-زد على عقود دائمة لترجمة تقارير طبية وقانونية لصالح منظمات أوروبية، والمدفوعات تصل مباشرة لحسابي البنكي دون اقتطاع أي عمولة.",
        storyEn: "Secured recurring contracts on ProZ translating medical dossiers for European organizations with direct wire transfers and zero broker fees.",
        profileUrl: "https://www.linkedin.com/company/proz.com/",
        profileType: "linkedin",
        verified: true,
      },
    ],
    pros: ["أكبر منصة ترجمة متخصصة وعريقة في العالم", "تعاقد مباشر مع وكالات الترجمة بدون عمولة وساطة", "أجور مرتفعة للمجالات التخصصية (القانوني والطبي والتقني)"],
    prosEn: ["World's most authoritative and largest translation ecosystem", "Direct contracting with global agencies (0% platform cut)", "High industry rates for specialized technical & legal domains"],
    cons: ["الاشتراك المدفوع (ProZ Plus) يعطي أولوية في التقديم لكن الحساب المجاني كافٍ للبدء"],
    consEn: ["Optional paid membership gives priority alerts, though free tier works"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "🏛️ الشبكة الأولى للمترجمين عالمياً (تعاقد مباشر)",
      badgeEn: "🏛️ World's #1 Translation Hub (Direct Contracts)",
      reasonAr: "أقدم وأوثق منصة دولية متخصصة في صناعة الترجمة واللغويات، تربط المترجمين بوكالات الترجمة الدولية مباشرة دون وسيط مالي يقتطع عمولات، ومفتوحة لجميع الجنسيات دون قيود.",
      reasonEn: "The premier global linguistics portal connecting translators directly with enterprise agencies with no intermediary commission cuts.",
      proofSourceUrl: "https://www.proz.com/terms",
      proofSourceNameAr: "دليل وشروط شبكة ProZ.com للمهنيين",
      proofSourceNameEn: "ProZ.com Professional Network Guidelines",
      targetCountries: ["GLOBAL"],
    },
    dateAdded: "2026-09-04",
  },

  // 24. Hubstaff Talent (هبستاف تالنت للعمل عن بعد)
  {
    id: "hubstaff-024",
    title: "هبستاف تالنت للوظائف والعمل عن بُعد (مجاني 100%)",
    titleEn: "Hubstaff Talent 100% Free Remote Job Board",
    company: "Hubstaff Talent",
    emoji: "💼",
    type: "عقود عمل عن بعد كاملة وجزئية (بدون رسوم)",
    typeEn: "Full-time & Part-time Remote Contracts (Zero Fees)",
    category: "programming",
    region: "global",
    regionLabel: { ar: "عالمي (الولايات المتحدة، أوروبا، آسيا)", en: "Global (US, EU, Asia)" },
    subCategory: "برمجة، دعم عملاء، إدارة أعمال، تسويق رقمي",
    subCategoryEn: "Dev, Customer Support, Virtual Assistant, Marketing",
    availability: {
      global: true,
      countries: ["كافة دول العالم", "السودان", "مصر", "الشرق الأوسط", "شمال إفريقيا"],
      countriesEn: ["Worldwide", "Sudan", "Egypt", "MENA"],
      restrictedCountries: [],
      notes: "دليل وظائف عالمي مفتوح ومجاني تماماً لا يتقاضى أي رسوم من المستقلين أو أصحاب العمل.",
      notesEn: "100% free directory for remote talent with zero platform fees for anyone.",
    },
    salary: { min: 800, max: 4800, currency: "USD", period: "month", average: "$1,850 / شهر (عقود شهرية ثابتة)" },
    withdrawal: {
      minAmount: 1,
      currency: "USD",
      methods: [
        { name: "Payoneer", nameEn: "Payoneer", availableInSudan: true, notes: "سحب مباشر لبطاقة وحساب بايونيير", notesEn: "Direct Payoneer integration" },
        { name: "تحويل بنكي مباشر (Wire)", nameEn: "Wire Transfer", availableInSudan: true, notes: "رواتب شهرية مباشرة لحسابك البنكي", notesEn: "Direct wire transfer salaries" },
        { name: "Bitwage", nameEn: "Bitwage", availableInSudan: true, notes: "استلام الرواتب بالعملات الرقمية أو الحساب البنكي", notesEn: "Direct payroll in crypto or local currency" },
        { name: "Wise", nameEn: "Wise", availableInSudan: true, notes: "حسابات بنكية دولية متعددة العملات", notesEn: "Multi-currency bank account" },
      ],
      processingTime: "شهرياً أو أسبوعياً حسب اتفاق العقد مع الشركة",
      processingTimeEn: "Weekly or monthly per direct employment agreement",
    },
    commission: { percentage: "0% (مجاني تماماً)", notes: "الخدمة مجانية 100% ولا تقتطع أي رسوم إدارية أو عمولة وساطة", notesEn: "Completely zero fees for both freelancers and employers" },
    rating: { score: 4.8, totalReviews: 7650, trustLevel: "منصة تابعة لشركة Hubstaff العالمية لتتبع الوقت والعمل عن بعد", trustLevelEn: "Official Hubstaff Ecosystem Talent Portal" },
    description: "هبستاف تالنت (Hubstaff Talent) هي منصة فريدة من نوعها تقدم خدمة مجانية 100% للربط بين المستقلين والمحترفين عن بُعد وبين آلاف الشركات العالمية الناشئة والمتوسطة في أمريكا وأوروبا وأستراليا، للتعاقد على وظائف دوام كامل أو جزئي برواتب شهرية مجزية بالدولار.",
    descriptionEn: "Hubstaff Talent is a 100% free platform matching remote talent with international startups for full-time and part-time salaried remote roles with zero fees.",
    requirements: ["سيرة ذاتية واضحة باللغة الإنجليزية", "خبرة في العمل عن بُعد والالتزام بالمهام", "مهارات تواصل جيدة"],
    requirementsEn: ["Clean English CV and profile", "Remote collaboration discipline", "Good written & verbal communication"],
    skills: ["Full Stack Development", "Virtual Assistance & Admin", "Customer Support", "Digital Marketing & SEO", "Graphic Design"],
    skillsEn: ["Full Stack Development", "Virtual Assistance & Admin", "Customer Support", "Digital Marketing & SEO", "Graphic Design"],
    registrationGuide: {
      steps: [
        { step: 1, title: "إنشاء بروفايل في Hubstaff Talent", titleEn: "Build Your Free Profile", description: "سجل مجاناً عبر talent.hubstaff.com وأنشئ ملفك التعريفي", descriptionEn: "Register at talent.hubstaff.com and configure your talent profile", tips: "اختر أجر الساعة المطلوب أو الراتب الشهري بالدولار", tipsEn: "Set your target hourly rate or monthly salary in USD" },
        { step: 2, title: "إضافة الخبرات ونماذج الأعمال", titleEn: "Add Experience & Portfolio", description: "أدخل مهاراتك والشهادات والمشاريع السابقة بتفصيل منظم", descriptionEn: "List past experiences, skills, and portfolio project links", tips: "الشركات تبحث بالمهارات وتتواصل مع أصحاب الملفات المكتملة", tipsEn: "Companies use search filters to message top profiles directly" },
        { step: 3, title: "التقديم المباشر على الوظائف المعلنة", titleEn: "Apply Directly to Job Listings", description: "تصفح مئات الوظائف الشاغرة عن بعد وتواصل مع أصحاب العمل مباشرة", descriptionEn: "Browse hundreds of remote vacancies and reach out to employers directly", tips: "اكتب رسالة تقديم مخصصة تبرز لماذا أنت الأنسب للدور", tipsEn: "Send customized cover notes explaining your fit for the role" },
      ],
      estimatedTime: "15 دقيقة",
      estimatedTimeEn: "15 minutes",
    },
    contact: { website: "https://talent.hubstaff.com" },
    successStories: [
      {
        name: "مازن عبد الغفار",
        nameEn: "Mazen Abdelghaffar",
        city: "بورتسودان / دبي",
        cityEn: "Port Sudan / Dubai",
        earnings: "$1,900 / شهر",
        earningsEn: "$1,900 / mo",
        story: "سجلت ملفي المهني كمطور واجهات React على هبستاف تالنت، وتواصلت معي شركة برمجيات كندية وظفتني بعقد دائم عن بُعد واستلم راتبي شهرياً عبر Payoneer دون أي خصومات.",
        storyEn: "Set up my React developer profile on Hubstaff Talent, a Canadian firm reached out and hired me full-time remotely with monthly wire/Payoneer salary.",
        profileUrl: "https://www.linkedin.com/company/hubstaff/",
        profileType: "linkedin",
        verified: true,
      },
    ],
    pros: ["مجانية بنسبة 100% (0% عمولة ولا رسوم اشتراك)", "عقود شهرية مستقرة بدوام كامل أو جزئي برواتب ممتازة", "تواصل مباشر مع مسؤولي التوظيف والشركات العالمية دون وسيط"],
    prosEn: ["100% free forever (0% fees, zero commission)", "Stable monthly full-time and part-time salaried remote roles", "Direct communication with company hiring managers"],
    cons: ["الشركات تبحث عن التزام حقيقي وساعات عمل محددة أسبوعياً"],
    consEn: ["Employers seek high dedication with fixed weekly commitments"],
    isNew: true,
    isFeatured: true,
    isVerified: true,
    eligibility: {
      type: "global_remote",
      badgeAr: "💼 مجاني 100% عالمياً (عقود شهرية بالدولار)",
      badgeEn: "💼 100% Free Worldwide (Monthly USD Contracts)",
      reasonAr: "دليل وظائف وعقود عن بُعد مجاني بالكامل بدون أي رسوم أو اشتراكات، يربط الكفاءات في أي مكان في العالم بشركات تقنية عالمية تدفع رواتب شهرية بالدولار عبر بايونيير والتحويل المباشر.",
      reasonEn: "Completely free worldwide remote talent directory with zero fees connecting candidates with global tech companies paying USD via direct wire and Payoneer.",
      proofSourceUrl: "https://talent.hubstaff.com/faq",
      proofSourceNameAr: "دليل وشروط Hubstaff Talent المفتوحة",
      proofSourceNameEn: "Hubstaff Talent Open FAQs & Terms",
      targetCountries: ["GLOBAL"],
    },
    dateAdded: "2026-09-04",
  },
];
