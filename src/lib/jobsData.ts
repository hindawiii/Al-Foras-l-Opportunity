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
      { name: "محمد الطيب", nameEn: "Mohammed El-Tayeb", city: "الخرطوم / القاهرة", cityEn: "Khartoum / Cairo", earnings: "$2,800 / شهر", earningsEn: "$2,800 / mo", story: "بدأت من الصفر كمطور React وحققت تقييم Top Rated في 6 أشهر.", storyEn: "Started from scratch in React and achieved Top Rated status in 6 months." }
    ],
    pros: ["أكبر حجم مشاريع في العالم", "حماية كاملة للدفعات بنظام Escrow", "إمكانية العمل بعقود طويلة الأجل"],
    prosEn: ["Largest volume of global projects", "Full Escrow payment protection", "Long-term contract opportunities"],
    cons: ["منافسة قوية في البداية", "عمولة 10%"],
    consEn: ["High initial competition", "10% platform fee"],
    isFeatured: true,
    isVerified: true,
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
      { name: "سارة عبد الله", nameEn: "Sara Abdullah", city: "بورتسودان / الرياض", cityEn: "Port Sudan / Riyadh", earnings: "$1,900 / شهر", earningsEn: "$1,900 / mo", story: "حققت أكثر من 40 مشروعاً مكتملاً في تصميم الهويات وتطبيقات الجوال.", storyEn: "Delivered over 40 successful branding and mobile design projects." }
    ],
    pros: ["تواصل كامل باللغة العربية", "طلب عالي جداً من عملاء الخليج", "دعم فني سريع وحماية تامة للحقوق"],
    prosEn: ["100% Arabic interface & communication", "Huge demand from Gulf clients", "Dedicated support and Escrow protection"],
    cons: ["فترة تعليق الرصيد 14 يوم للأمان"],
    consEn: ["14-day security holding period for funds"],
    isFeatured: true,
    isVerified: true,
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
      { name: "عثمان الفاتح", nameEn: "Osman El-Fatih", city: "أم درمان / دبي", cityEn: "Omdurman / Dubai", earnings: "$950 / شهر", earningsEn: "$950 / mo", story: "بدأت بتقديم خدمات الترجمة وكتابة السير الذاتية ووصلت لرتبة بائع مميز.", storyEn: "Started with translation and CV writing and attained Featured Seller badge." }
    ],
    pros: ["لا يتطلب خبرة معقدة للبدء", "سهولة بيع نفس الخدمة لمئات المشترين", "إقبال كبير ومستمر"],
    prosEn: ["Very easy to start without advanced credentials", "Sell same service repeatedly to hundreds", "High continuous traffic"],
    cons: ["الأسعار الأولية تبدأ من 5$ فقط"],
    consEn: ["Base gig price starts at $5"],
    isNew: false,
    isFeatured: true,
    isVerified: true,
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
      { name: "خالد إبراهيم", nameEn: "Khaled Ibrahim", city: "جدة / الخرطوم", cityEn: "Jeddah / Khartoum", earnings: "$3,200 / شهر", earningsEn: "$3,200 / mo", story: "أنفذ مشاريع تطوير أنظمة داخلية لشركات ناشئة ومؤسسات كبرى.", storyEn: "Delivered customized ERP and backend systems for GCC startups." }
    ],
    pros: ["أجور وميزانيات عالية بالريال السعودي والدولار", "عمولة منخفضة جداً", "مشاريع مؤسسية موثوقة"],
    prosEn: ["High budgets in SAR & USD", "Very low fee rate", "Trusted corporate clients"],
    cons: ["إجراءات توثيق تتطلب دقة الهوية"],
    consEn: ["Strict ID verification requirement"],
    isFeatured: true,
    isVerified: true,
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
      { name: "أمجد كمال", nameEn: "Amjad Kamal", city: "مدني / إسطنبول", cityEn: "Madani / Istanbul", earnings: "$2,400 / شهر", earningsEn: "$2,400 / mo", story: "أنشأت 4 خدمات في تصميم واجهات UI/UX وحققت رتبة Level 2 Seller.", storyEn: "Created 4 UI/UX design gigs and reached Level 2 Seller badge." }
    ],
    pros: ["الزبائن يأتون إليك بدون الحاجة للبحث عن مشاريع", "سحب فوري للأرباح عبر Payoneer", "دفع بالدولار الأمريكي"],
    prosEn: ["Inbound client orders without bidding", "Instant Payoneer cashout", "USD earnings"],
    cons: ["عمولة 20%"],
    consEn: ["20% service fee"],
    isFeatured: true,
    isVerified: true,
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
      { name: "ريم طارق", nameEn: "Reem Tariq", city: "الخرطوم / مسقط", cityEn: "Khartoum / Muscat", earnings: "$1,350 / شهر", earningsEn: "$1,350 / mo", story: "أعمل كمترجمة متخصصة في تعريب التطبيقات والمواقع الطبية.", storyEn: "Working as a specialized medical and app localization linguist." }
    ],
    pros: ["تركيز كامل على مهارات اللغة والكتابة", "مشاريع مستمرة من شركات كبرى", "أجور عادلة ومحمية"],
    prosEn: ["Dedicated linguistic focus", "Steady enterprise briefs", "Protected fair payouts"],
    cons: ["يتطلب اجتياز اختبار مستوى"],
    consEn: ["Requires language proficiency screening"],
    isFeatured: false,
    isVerified: true,
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
      { name: "طارق النور", nameEn: "Tariq El-Noor", city: "الخرطوم / باريس", cityEn: "Khartoum / Paris", earnings: "€3,400 / شهر", earningsEn: "€3,400 / mo", story: "أعمل كمستشار سحابي AWS مع شركات تقنية أوروبية.", storyEn: "Serving as an AWS cloud consultant for European tech companies." }
    ],
    pros: ["أجور ممتازة جداً باليورو (€)", "مشاريع مؤسسية طويلة الأجل", "دفعات مضمونة خلال 3 أيام"],
    prosEn: ["Top-tier compensation in EUR (€)", "Long-term enterprise contracts", "Guaranteed 3-day payouts"],
    cons: ["تتطلب مستوى لغوي ممتاز بالإنجليزية أو لغة أوروبية"],
    consEn: ["Requires strong English or EU language fluency"],
    isFeatured: true,
    isVerified: true,
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
      { name: "حسام الدين", nameEn: "Hossam El-Din", city: "الخرطوم / لندن", cityEn: "Khartoum / London", earnings: "$7,500 / شهر", earningsEn: "$7,500 / mo", story: "اجتزت فحص Toptal وأعمل الآن مع شركة ذكاء اصطناعي أمريكية بعقد دائم عن بُعد.", storyEn: "Passed Toptal screening and contracted with a US AI company full-time remotely." }
    ],
    pros: ["أعلى أجور عمل حر في العالم (تصل لـ $10,000+ شهرياً)", "بدون عمولة مقتطعة من أجر المستقل (0%)", "مشاريع مع أرقى شركات العالم"],
    prosEn: ["Top earnings worldwide (up to $10,000+/mo)", "0% platform deduction on freelancer rates", "Prestigious global enterprise projects"],
    cons: ["مراحل فحص دقيقة وصعبة القبول"],
    consEn: ["Rigorous screening with selective acceptance"],
    isFeatured: true,
    isVerified: true,
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
      { name: "ياسر عادل", nameEn: "Yasser Adel", city: "الخرطوم / كوالالمبور", cityEn: "Khartoum / Kuala Lumpur", earnings: "$850 / شهر", earningsEn: "$850 / mo", story: "أنفذ مهام المساعد الافتراضي وإدخال البيانات للشركات الآسيوية.", storyEn: "Delivering virtual assistant and data ops for Asian companies." }
    ],
    pros: ["سهولة القبول والبدء الفوري", "عمولة منخفضة", "مشاريع متنوعة وبسيطة للمبتدئين"],
    prosEn: ["Fast acceptance and start", "Low fee structure", "Diverse entry-level tasks"],
    cons: ["الميزانيات متوسطة مقارنة بالمنصات الغربية"],
    consEn: ["Moderate budgets compared to western portals"],
    isFeatured: false,
    isVerified: true,
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
      { name: "عبد الرحمن نور", nameEn: "Abdelrahman Noor", city: "الخرطوم / القاهرة", cityEn: "Khartoum / Cairo", earnings: "$1,800 / شهر", earningsEn: "$1,800 / mo", story: "سجلت أكثر من 80 إعلاناً وكتاباً صوتياً لقنوات وشركات خليجية.", storyEn: "Recorded over 80 commercial spots and audiobooks for GCC networks." }
    ],
    pros: ["أجور ممتازة لكل دقيقة تسجيل", "طلب ضخم ومستمر على الأصوات العربية والسودانية", "حماية لحقوق الملكية الفكرية"],
    prosEn: ["High per-minute vocal compensation", "Huge continuous demand for Arabic & regional accents", "Intellectual property escrow"],
    cons: ["يتطلب توفير مايك احترافي وبيئة هادئة للتسجيل"],
    consEn: ["Requires decent microphone and quiet recording space"],
    isFeatured: true,
    isVerified: true,
    dateAdded: "2026-08-15",
  },
];
