export interface Scholarship {
  id: string;
  title: string;
  titleEn?: string;
  org: string;
  orgEn?: string;
  country: string;
  countryEn?: string;
  countryCode: string;     // ISO 3166-1 alpha-2
  flag: string;            // emoji flag
  category: "arab" | "global";
  studyLang: "ar" | "en" | "both";
  deadline: string;
  amount: string;
  amountEn?: string;
  field: string;
  fieldEn?: string;
  level: string;
  levelEn?: string;
  verified: boolean;
  manualReview?: boolean;
  description: string;
  descriptionEn?: string;
  tags: string[];
  sourceUrl: string;
  officialUrl: string;
  interests: string[];
}

const mk = (s: Omit<Scholarship, "sourceUrl" | "officialUrl" | "interests"> & Partial<Pick<Scholarship, "sourceUrl" | "officialUrl" | "interests">>): Scholarship => ({
  sourceUrl: s.sourceUrl ?? "https://www.scholars4dev.com",
  officialUrl: s.officialUrl ?? "https://www.scholars4dev.com",
  interests: s.interests ?? [],
  ...s,
});

export const SCHOLARSHIPS: Scholarship[] = [
  mk({
    id: "s1",
    title: "منحة تشيفنينغ البريطانية الكاملة",
    titleEn: "Chevening UK Fully Funded Scholarship",
    org: "الحكومة البريطانية",
    orgEn: "UK Government (FCDO)",
    country: "المملكة المتحدة",
    countryEn: "United Kingdom",
    countryCode: "GB", flag: "🇬🇧", category: "global", studyLang: "en",
    deadline: "2026-11-01",
    amount: "تمويل كامل",
    amountEn: "Fully Funded",
    field: "متعدد التخصصات",
    fieldEn: "Multidisciplinary",
    level: "ماجستير",
    levelEn: "Master's Degree",
    verified: true,
    description: "منحة دراسية كاملة لقادة المستقبل تشمل الرسوم والإقامة والسفر.",
    descriptionEn: "Fully funded master's degree scholarship in the UK for future global leaders, covering tuition, accommodation, and flights.",
    tags: ["قيادة", "ماجستير", "أوروبا"],
    interests: ["قيادة", "إدارة", "سياسات"],
    officialUrl: "https://www.chevening.org/", sourceUrl: "https://www.chevening.org/scholarship/",
  }),
  mk({
    id: "s2",
    title: "منحة فولبرايت للدراسات العليا",
    titleEn: "Fulbright Foreign Student Program",
    org: "السفارة الأمريكية",
    orgEn: "US Department of State / Embassy",
    country: "الولايات المتحدة",
    countryEn: "United States",
    countryCode: "US", flag: "🇺🇸", category: "global", studyLang: "en",
    deadline: "2026-09-15",
    amount: "$45,000",
    amountEn: "$45,000 / year",
    field: "العلوم والهندسة",
    fieldEn: "Science & Engineering",
    level: "ماجستير ودكتوراه",
    levelEn: "Master's & PhD",
    verified: true,
    description: "برنامج تبادل أكاديمي مرموق يدعم الدراسات العليا والبحث العلمي في أمريكا.",
    descriptionEn: "Prestigious US academic exchange scholarship supporting graduate studies and research at top American universities.",
    tags: ["بحث", "أمريكا", "دكتوراه"],
    interests: ["تكنولوجيا", "هندسة", "علوم"],
    officialUrl: "https://foreign.fulbrightonline.org/", sourceUrl: "https://foreign.fulbrightonline.org/about",
  }),
  mk({
    id: "s3",
    title: "منحة DAAD الألمانية",
    titleEn: "DAAD Germany Study Scholarship",
    org: "الهيئة الألمانية للتبادل",
    orgEn: "DAAD German Academic Exchange",
    country: "ألمانيا",
    countryEn: "Germany",
    countryCode: "DE", flag: "🇩🇪", category: "global", studyLang: "en",
    deadline: "2026-10-20",
    amount: "€934/شهر",
    amountEn: "€934 / month",
    field: "هندسة وتكنولوجيا",
    fieldEn: "Engineering & Technology",
    level: "ماجستير",
    levelEn: "Master's Degree",
    verified: true,
    description: "منح شهرية مع تأمين صحي ودعم لتعلم اللغة الألمانية.",
    descriptionEn: "Monthly stipend with full health insurance coverage and German language preparatory support.",
    tags: ["ألمانيا", "هندسة"],
    interests: ["هندسة", "تكنولوجيا"],
    officialUrl: "https://www.daad.de/en/", sourceUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
  }),
  mk({
    id: "s4",
    title: "منحة الملك عبدالله للتميز العلمي",
    titleEn: "KAUST Fellowship for Scientific Excellence",
    org: "جامعة كاوست",
    orgEn: "King Abdullah University of Science & Tech (KAUST)",
    country: "المملكة العربية السعودية",
    countryEn: "Saudi Arabia",
    countryCode: "SA", flag: "🇸🇦", category: "arab", studyLang: "both",
    deadline: "2026-12-01",
    amount: "تمويل كامل + راتب",
    amountEn: "Full Tuition + Stipend & Housing",
    field: "علوم وتكنولوجيا",
    fieldEn: "Science & Technology",
    level: "ماجستير ودكتوراه",
    levelEn: "Master's & PhD",
    verified: true,
    description: "تمويل كامل مع راتب شهري وسكن للدراسات العليا في كاوست.",
    descriptionEn: "Full tuition support, generous living stipend, private on-campus housing, and relocation allowance for graduate research.",
    tags: ["السعودية", "كاوست"],
    interests: ["علوم", "تكنولوجيا", "بحث"],
    officialUrl: "https://www.kaust.edu.sa/", sourceUrl: "https://www.kaust.edu.sa/en/study/fellowship",
  }),
  mk({
    id: "s5",
    title: "برنامج إيراسموس موندوس",
    titleEn: "Erasmus Mundus Joint Master Degrees",
    org: "الاتحاد الأوروبي",
    orgEn: "European Union",
    country: "أوروبا",
    countryEn: "European Union",
    countryCode: "EU", flag: "🇪🇺", category: "global", studyLang: "en",
    deadline: "2026-01-10",
    amount: "€1,400/شهر",
    amountEn: "€1,400 / month",
    field: "متعدد التخصصات",
    fieldEn: "Multidisciplinary",
    level: "ماجستير مشترك",
    levelEn: "Joint Master's Degree",
    verified: false, manualReview: true,
    description: "برنامج ماجستير مشترك بين عدة جامعات أوروبية مع منحة شاملة.",
    descriptionEn: "Prestigious joint master's degree program across multiple top European universities with full financial support.",
    tags: ["أوروبا", "تبادل"],
    interests: ["تبادل", "أوروبا"],
    officialUrl: "https://erasmus-plus.ec.europa.eu/", sourceUrl: "https://erasmus-plus.ec.europa.eu/opportunities",
  }),
  mk({
    id: "s6",
    title: "منحة جامعة طوكيو الدولية",
    titleEn: "MEXT Japan University of Tokyo Scholarship",
    org: "MEXT اليابان",
    orgEn: "MEXT Japanese Government",
    country: "اليابان",
    countryEn: "Japan",
    countryCode: "JP", flag: "🇯🇵", category: "global", studyLang: "en",
    deadline: "2026-06-30",
    amount: "¥147,000/شهر",
    amountEn: "¥147,000 / month",
    field: "هندسة وعلوم",
    fieldEn: "Engineering & Natural Sciences",
    level: "بكالوريوس وماجستير",
    levelEn: "Bachelor's & Master's",
    verified: true,
    description: "منحة حكومية يابانية كاملة تشمل الرسوم وتذاكر السفر والراتب.",
    descriptionEn: "Full Japanese government scholarship covering full tuition, roundtrip airfare, and monthly living allowance.",
    tags: ["اليابان", "آسيا"],
    interests: ["هندسة", "علوم"],
    officialUrl: "https://www.studyinjapan.go.jp/en/", sourceUrl: "https://www.studyinjapan.go.jp/en/planning/scholarship/",
  }),
  mk({
    id: "s7",
    title: "منحة قطر للتنمية البشرية",
    titleEn: "Qatar Foundation Leadership Scholarship",
    org: "مؤسسة قطر",
    orgEn: "Qatar Foundation",
    country: "قطر",
    countryEn: "Qatar",
    countryCode: "QA", flag: "🇶🇦", category: "arab", studyLang: "both",
    deadline: "2026-08-15",
    amount: "تمويل كامل",
    amountEn: "Full Scholarship",
    field: "السياسات والإدارة",
    fieldEn: "Public Policy & Leadership",
    level: "ماجستير",
    levelEn: "Master's Degree",
    verified: false, manualReview: true,
    description: "برنامج رائد لتنمية الكوادر القيادية في المنطقة العربية.",
    descriptionEn: "Flagship scholarship fostering executive leadership and public policy excellence in Education City.",
    tags: ["قطر", "قيادة"],
    interests: ["قيادة", "إدارة"],
    officialUrl: "https://www.qf.org.qa/", sourceUrl: "https://www.qf.org.qa/education",
  }),
  mk({
    id: "s8",
    title: "منحة ETH زيورخ للهندسة",
    titleEn: "ETH Zurich Excellence Scholarship",
    org: "ETH Zürich",
    orgEn: "ETH Zurich University",
    country: "سويسرا",
    countryEn: "Switzerland",
    countryCode: "CH", flag: "🇨🇭", category: "global", studyLang: "en",
    deadline: "2026-12-15",
    amount: "CHF 11,000/سنة",
    amountEn: "CHF 11,000 / semester",
    field: "هندسة وحاسوب",
    fieldEn: "Engineering & Computer Science",
    level: "ماجستير",
    levelEn: "Master's Degree",
    verified: true,
    description: "منحة تميز للطلاب الدوليين المتفوقين في تخصصات الهندسة.",
    descriptionEn: "Excellence Scholarship & Opportunity Programme (ESOP) for top-tier master's candidates in engineering and computer science.",
    tags: ["سويسرا", "تميز"],
    interests: ["هندسة", "تكنولوجيا"],
    officialUrl: "https://ethz.ch/", sourceUrl: "https://ethz.ch/students/en/studies/financial/scholarships.html",
  }),
  mk({
    id: "s9",
    title: "منحة جامعة الإمارات للماجستير",
    titleEn: "UAE University Graduate Fellowship",
    org: "جامعة الإمارات",
    orgEn: "United Arab Emirates University (UAEU)",
    country: "الإمارات",
    countryEn: "United Arab Emirates",
    countryCode: "AE", flag: "🇦🇪", category: "arab", studyLang: "both",
    deadline: "2026-07-20",
    amount: "تمويل كامل + سكن",
    amountEn: "Full Tuition + Campus Housing",
    field: "متعدد التخصصات",
    fieldEn: "Multidisciplinary",
    level: "ماجستير",
    levelEn: "Master's Degree",
    verified: true,
    description: "منحة شاملة تغطي الرسوم والسكن لطلاب الدراسات العليا في الإمارات.",
    descriptionEn: "Comprehensive fellowship covering full tuition waiver, monthly stipend, and student housing for graduate researchers.",
    tags: ["الإمارات", "ماجستير"],
    interests: ["إدارة", "هندسة"],
    officialUrl: "https://www.uaeu.ac.ae/", sourceUrl: "https://www.uaeu.ac.ae/en/admission/",
  }),
  mk({
    id: "s10",
    title: "منحة الأزهر الشريف للوافدين",
    titleEn: "Al-Azhar Islamic Mission Scholarship",
    org: "جامعة الأزهر",
    orgEn: "Al-Azhar Al-Sharif",
    country: "مصر",
    countryEn: "Egypt",
    countryCode: "EG", flag: "🇪🇬", category: "arab", studyLang: "ar",
    deadline: "2026-09-30",
    amount: "رسوم + إقامة",
    amountEn: "Tuition + Free Hostel & Meals",
    field: "علوم شرعية ولغوية",
    fieldEn: "Islamic Studies & Arabic",
    level: "بكالوريوس وماجستير",
    levelEn: "Bachelor's & Master's",
    verified: true,
    description: "منحة الأزهر الشريف للطلاب الوافدين لدراسة العلوم الشرعية واللغة العربية.",
    descriptionEn: "Full scholarship for international Muslim students studying Islamic theology, Arabic language, and sciences with free dormitory accommodation.",
    tags: ["مصر", "الأزهر"],
    interests: ["تعليم", "بحث"],
    officialUrl: "https://www.azhar.edu.eg/", sourceUrl: "https://www.azhar.edu.eg/",
  }),
];

export interface NewsItem {
  id: string; title: string; category: "global" | "local" | "sports" | "economy";
  summary: string; time: string; source: string; image?: string; aiLink?: string;
}

export const NEWS: NewsItem[] = [
  { id: "n1", category: "economy", title: "ارتفاع الذهب لأعلى مستوياته خلال شهر", summary: "سجل سعر الذهب ارتفاعاً ملحوظاً مع تراجع الدولار الأمريكي.", time: "قبل ساعة", source: "رويترز",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=70",
    aiLink: "هذا الارتفاع قد يؤثر على المنح الممولة بالدولار — راجع منح فولبرايت." },
  { id: "n2", category: "global", title: "الاتحاد الأوروبي يوسع برامج المنح للطلاب الدوليين", summary: "إعلان عن زيادة مخصصات إيراسموس بنسبة 15% للعام القادم.", time: "قبل 3 ساعات", source: "EU News",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=70",
    aiLink: "فرصة جديدة! تحقق من برنامج إيراسموس موندوس في صفحة المنح." },
  { id: "n3", category: "local", title: "افتتاح مركز ابتكار جديد في الرياض", summary: "يستهدف المركز دعم رواد الأعمال والباحثين الشباب.", time: "قبل 5 ساعات", source: "العربية",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=70" },
  { id: "n4", category: "sports", title: "كأس العالم 2026: التحضيرات تدخل مرحلتها النهائية", summary: "ثلاث دول مستضيفة تستعد لاستقبال أكبر بطولة كروية.", time: "قبل 6 ساعات", source: "BBC",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=70" },
  { id: "n6", category: "economy", title: "البنك المركزي الأوروبي يبقي أسعار الفائدة دون تغيير", summary: "قرار متوقع من قبل المحللين وسط استقرار التضخم.", time: "قبل 8 ساعات", source: "Bloomberg",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=70" },
];

export interface Currency {
  code: string;
  name: string;
  rate: number;
  flag: string;
  symbol: string;
  apiCode?: string; // code used by external rates API
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "دولار أمريكي", rate: 1,      flag: "🇺🇸", symbol: "$",   apiCode: "USD" },
  { code: "EUR", name: "يورو",          rate: 0.92,  flag: "🇪🇺", symbol: "€",   apiCode: "EUR" },
  { code: "SAR", name: "ريال سعودي",    rate: 3.75,  flag: "🇸🇦", symbol: "ر.س", apiCode: "SAR" },
  { code: "AED", name: "درهم إماراتي",  rate: 3.67,  flag: "🇦🇪", symbol: "د.إ", apiCode: "AED" },
  { code: "QTR", name: "ريال قطري",     rate: 3.64,  flag: "🇶🇦", symbol: "ر.ق", apiCode: "QAR" },
  { code: "SDG", name: "جنيه سوداني",   rate: 600,   flag: "🇸🇩", symbol: "ج.س", apiCode: "SDG" },
  { code: "EGP", name: "جنيه مصري",     rate: 49,    flag: "🇪🇬", symbol: "ج.م", apiCode: "EGP" },
  { code: "DZD", name: "دينار جزائري",  rate: 134,   flag: "🇩🇿", symbol: "د.ج", apiCode: "DZD" },
  { code: "MAD", name: "درهم مغربي",    rate: 9.95,  flag: "🇲🇦", symbol: "د.م", apiCode: "MAD" },
  { code: "GOLD", name: "غرام ذهب 24",  rate: 0.0144, flag: "🥇", symbol: "g",   apiCode: "XAU" },
];

export interface InterestItem {
  id: string;
  labelAr: string;
  labelEn: string;
}

export const INTEREST_ITEMS: InterestItem[] = [
  { id: "طب", labelAr: "طب", labelEn: "Medicine" },
  { id: "هندسة", labelAr: "هندسة", labelEn: "Engineering" },
  { id: "تكنولوجيا", labelAr: "تكنولوجيا", labelEn: "Technology" },
  { id: "علوم", labelAr: "علوم", labelEn: "Sciences" },
  { id: "إدارة", labelAr: "إدارة", labelEn: "Management" },
  { id: "سياسات", labelAr: "سياسات", labelEn: "Public Policy" },
  { id: "قيادة", labelAr: "قيادة", labelEn: "Leadership" },
  { id: "بحث", labelAr: "بحث", labelEn: "Research" },
  { id: "فنون", labelAr: "فنون", labelEn: "Arts & Design" },
  { id: "اقتصاد", labelAr: "اقتصاد", labelEn: "Economics" },
  { id: "قانون", labelAr: "قانون", labelEn: "Law" },
  { id: "تعليم", labelAr: "تعليم", labelEn: "Education" },
  { id: "تبادل", labelAr: "تبادل", labelEn: "Exchange" },
];

export const INTEREST_OPTIONS = INTEREST_ITEMS.map(i => i.id);

export const getInterestLabel = (idOrLabel: string, lang: "ar" | "en" = "ar"): string => {
  const item = INTEREST_ITEMS.find(i => i.id === idOrLabel || i.labelAr === idOrLabel || i.labelEn.toLowerCase() === idOrLabel.toLowerCase());
  if (!item) return idOrLabel;
  return lang === "en" ? item.labelEn : item.labelAr;
};

export const computeMatchScore = (
  s: Scholarship,
  profile?: { location?: string | null; skills?: string[] | null; interests?: string[] | null } | null
): number => {
  if (!s) return 50;
  let score = 50;
  const loc = (profile?.location || "").toLowerCase();
  if (loc && s.country && (loc.includes(s.country.toLowerCase()) || s.country.toLowerCase().includes(loc))) score += 20;
  const interests = Array.isArray(profile?.interests) ? profile.interests : [];
  const sInterests = Array.isArray(s.interests) ? s.interests : (Array.isArray(s.tags) ? s.tags : []);
  const matchInterests = sInterests.filter(i => {
    if (!i) return false;
    return interests.some(userI => {
      if (!userI) return false;
      const item = INTEREST_ITEMS.find(it => it.id === it.id);
      return userI === i || (item && (userI === item.labelEn || userI === item.labelAr));
    });
  }).length;
  score += Math.min(20, matchInterests * 10);
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const sTags = Array.isArray(s.tags) ? s.tags : [];
  const matchSkills = sTags.filter(t => t && skills.some(sk => sk && (sk.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(sk.toLowerCase())))).length;
  score += Math.min(10, matchSkills * 5);
  return Math.min(99, Math.max(40, score));
};
