// Sudanese universities directory — Phase 2 of AI Advisor project.
// Source: publicly available admission data from official university websites
// and the Ministry of Higher Education and Scientific Research (SD).

export type UniType = "government" | "private" | "technical";

export interface SudanUniversity {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  type: UniType;
  founded: number;
  website: string;
  faculties: string[];
  minPercentage: number; // approximate minimum admission percentage
  highlights: string;
}

export const SUDAN_UNIVERSITIES: SudanUniversity[] = [
  {
    id: "u-khartoum",
    name: "جامعة الخرطوم",
    nameEn: "University of Khartoum",
    city: "الخرطوم",
    type: "government",
    founded: 1902,
    website: "https://www.uofk.edu/",
    faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد", "القانون", "الآداب", "الصيدلة", "طب الأسنان"],
    minPercentage: 85,
    highlights: "أعرق الجامعات السودانية، وأعلى الجامعات تنافساً في القبول.",
  },
  {
    id: "u-sust",
    name: "جامعة السودان للعلوم والتكنولوجيا",
    nameEn: "Sudan University of Science and Technology",
    city: "الخرطوم",
    type: "government",
    founded: 1990,
    website: "https://sustech.edu/",
    faculties: ["الهندسة", "الحاسوب", "الطب", "علوم الاتصالات", "التربية", "الإعلام", "الموسيقى والدراما"],
    minPercentage: 78,
    highlights: "أكبر جامعة تقنية في السودان بأكثر من 20 كلية.",
  },
  {
    id: "u-gezira",
    name: "جامعة الجزيرة",
    nameEn: "University of Gezira",
    city: "ود مدني",
    type: "government",
    founded: 1975,
    website: "https://uofg.edu.sd/",
    faculties: ["الطب", "الزراعة", "الاقتصاد الريفي", "الهندسة", "العلوم", "التربية", "الطب البيطري"],
    minPercentage: 80,
    highlights: "رائدة في الطب المجتمعي والزراعة، مشروع الجزيرة.",
  },
  {
    id: "u-neelain",
    name: "جامعة النيلين",
    nameEn: "Al-Neelain University",
    city: "الخرطوم",
    type: "government",
    founded: 1955,
    website: "https://neelain.edu.sd/",
    faculties: ["الطب", "القانون", "الاقتصاد", "العلوم السياسية", "الهندسة", "الحاسوب", "الآداب"],
    minPercentage: 75,
    highlights: "أصلها فرع جامعة القاهرة بالخرطوم، متعددة التخصصات.",
  },
  {
    id: "u-omdurman",
    name: "جامعة أم درمان الإسلامية",
    nameEn: "Omdurman Islamic University",
    city: "أم درمان",
    type: "government",
    founded: 1912,
    website: "https://oiu.edu.sd/",
    faculties: ["الشريعة والقانون", "أصول الدين", "الدعوة", "الطب", "الصيدلة", "الهندسة"],
    minPercentage: 72,
    highlights: "متخصصة في العلوم الإسلامية إلى جانب الطب والهندسة.",
  },
  {
    id: "u-bakht-alruda",
    name: "جامعة بخت الرضا",
    nameEn: "Bakht Al-Ruda University",
    city: "الدويم",
    type: "government",
    founded: 1990,
    website: "https://bakhtalruda.edu.sd/",
    faculties: ["التربية", "الآداب", "الاقتصاد", "الزراعة", "علوم الحاسوب"],
    minPercentage: 65,
    highlights: "امتداد لمعهد بخت الرضا التاريخي، متميزة في إعداد المعلمين.",
  },
  {
    id: "u-dilling",
    name: "جامعة الدلنج",
    nameEn: "Dilling University",
    city: "الدلنج",
    type: "government",
    founded: 1994,
    website: "https://dilling.edu.sd/",
    faculties: ["التربية", "الطب", "العلوم الطبية التطبيقية", "الاقتصاد", "الغابات والمراعي"],
    minPercentage: 62,
    highlights: "خدمة لولاية جنوب كردفان بتخصصات طبية وزراعية.",
  },
  {
    id: "u-kordofan",
    name: "جامعة كردفان",
    nameEn: "University of Kordofan",
    city: "الأبيض",
    type: "government",
    founded: 1990,
    website: "https://kord.edu.sd/",
    faculties: ["الطب", "الطب البيطري", "الزراعة", "علوم الأغذية", "التربية", "الهندسة"],
    minPercentage: 70,
    highlights: "أشهر جامعات غرب السودان، متميزة في الطب البيطري.",
  },
  {
    id: "u-red-sea",
    name: "جامعة البحر الأحمر",
    nameEn: "Red Sea University",
    city: "بورتسودان",
    type: "government",
    founded: 1994,
    website: "https://rsu.edu.sd/",
    faculties: ["علوم البحار", "الهندسة البحرية", "التعدين", "الطب", "الاقتصاد"],
    minPercentage: 68,
    highlights: "الوحيدة المتخصصة في علوم البحار والهندسة البحرية.",
  },
  {
    id: "u-nile-valley",
    name: "جامعة وادي النيل",
    nameEn: "Nile Valley University",
    city: "عطبرة",
    type: "government",
    founded: 1990,
    website: "https://nilevalley.edu.sd/",
    faculties: ["الطب", "الصيدلة", "الهندسة", "التعدين", "الآداب", "التربية"],
    minPercentage: 74,
    highlights: "متميزة في هندسة التعدين والطب.",
  },
  {
    id: "u-shendi",
    name: "جامعة شندي",
    nameEn: "Shendi University",
    city: "شندي",
    type: "government",
    founded: 1994,
    website: "https://ush.sd/",
    faculties: ["الطب", "طب الأسنان", "الصيدلة", "التمريض", "العلوم الطبية التطبيقية"],
    minPercentage: 76,
    highlights: "معروفة بكلياتها الطبية والصحية المتقدمة.",
  },
  {
    id: "u-sennar",
    name: "جامعة سنار",
    nameEn: "Sennar University",
    city: "سنار",
    type: "government",
    founded: 1977,
    website: "https://sinnaru.edu.sd/",
    faculties: ["الطب", "الزراعة", "علوم الحاسوب", "التربية", "الاقتصاد"],
    minPercentage: 68,
    highlights: "قوية في الزراعة وعلوم الري.",
  },
  {
    id: "u-ahfad",
    name: "جامعة الأحفاد للبنات",
    nameEn: "Ahfad University for Women",
    city: "أم درمان",
    type: "private",
    founded: 1966,
    website: "https://www.ahfad.edu.sd/",
    faculties: ["الطب", "الصيدلة", "علم النفس", "التنمية الريفية", "إدارة الأعمال", "العلوم الصحية"],
    minPercentage: 70,
    highlights: "الجامعة الرائدة في تعليم المرأة على مستوى إفريقيا.",
  },
  {
    id: "u-mashreq",
    name: "جامعة المشرق",
    nameEn: "Al-Mashreq University",
    city: "الخرطوم",
    type: "private",
    founded: 1997,
    website: "https://almashreq.edu.sd/",
    faculties: ["الحاسوب", "الهندسة", "علوم الاتصالات", "إدارة الأعمال", "الصيدلة"],
    minPercentage: 60,
    highlights: "خاصة، متميزة في تقنية المعلومات والاتصالات.",
  },
  {
    id: "u-future",
    name: "جامعة المستقبل",
    nameEn: "Future University",
    city: "الخرطوم",
    type: "private",
    founded: 1991,
    website: "https://fu.edu.sd/",
    faculties: ["الهندسة", "الحاسوب", "الاتصالات", "الطاقة", "إدارة الأعمال"],
    minPercentage: 60,
    highlights: "من أوائل الجامعات الخاصة، قوية في الهندسة والطاقة.",
  },
  {
    id: "u-mut",
    name: "الجامعة الحديثة للعلوم والتكنولوجيا",
    nameEn: "Modern University for Sciences & Technology",
    city: "الخرطوم",
    type: "private",
    founded: 2001,
    website: "https://must.edu.sd/",
    faculties: ["الطب", "طب الأسنان", "الصيدلة", "الهندسة", "علوم الحاسوب"],
    minPercentage: 68,
    highlights: "خاصة، مركزة على العلوم الطبية والتكنولوجية.",
  },
];

export const CITY_LIST = Array.from(new Set(SUDAN_UNIVERSITIES.map((u) => u.city))).sort();
export const FACULTY_LIST = Array.from(
  new Set(SUDAN_UNIVERSITIES.flatMap((u) => u.faculties))
).sort();

/* ------------------------------------------------------------------ */
/* تفاصيل موسّعة للجامعات السودانية (بيانات إرشادية)                    */
/* ------------------------------------------------------------------ */

export interface SudanUniDetails {
  tuition: string;
  living: string;
  seasons: string;
  docs: string[];
  steps: string[];
  alumni: string[];
  experience: string;
}

/** أبرز الخريجين وتجارب الطلاب — لبعض الجامعات الكبرى */
const CURATED: Record<string, { alumni: string[]; experience: string }> = {
  "u-khartoum": {
    alumni: [
      "الطيب صالح — أديب عالمي (موسم الهجرة إلى الشمال)",
      "أ.د. مامون حميدة — طبيب ووزير صحة سابق",
      "قيادات في الأمم المتحدة والبنك الدولي من كليتي الاقتصاد والقانون",
    ],
    experience:
      "المنافسة على القبول عالية جداً، لكن الحياة الجامعية غنية بالأنشطة والجمعيات العلمية. الدراسة بالإنجليزية في الكليات العلمية، والسكن الجامعي متوفر لطلاب الولايات.",
  },
  "u-sust": {
    alumni: [
      "مهندسون في شركات الاتصالات والطاقة داخل السودان والخليج",
      "رواد أعمال في مجال البرمجيات والتقنية",
    ],
    experience:
      "أقوى الجامعات في الجانب التطبيقي والمعامل الهندسية، مع فرص تدريب صيفي داخل الشركات. الحرم الجامعي في وسط الخرطوم قريب من المواصلات.",
  },
  "u-gezira": {
    alumni: [
      "كوادر طبية وزراعية بارزة في السودان وشرق أفريقيا",
      "باحثون في مجال المحاصيل والري",
    ],
    experience:
      "تجربة أكاديمية هادئة في ودمدني بتكاليف معيشة منخفضة، وتميز واضح في الطب المجتمعي والزراعة.",
  },
  "u-omdurman": {
    alumni: ["علماء شريعة وقضاة ودعاة في السودان والعالم الإسلامي"],
    experience: "بيئة دراسية مناسبة لطلاب الشريعة واللغة العربية، ورسوم منخفضة نسبياً.",
  },
};

const GENERIC_EXPERIENCE =
  "طلاب الجامعة ينصحون بالتقديم مبكراً عبر بوابة القبول، ومتابعة إعلانات الرسوم فصلياً، والاستفادة من مجموعات الطلاب للحصول على المقررات والملازم.";

export const getSudanUniDetails = (u: SudanUniversity): SudanUniDetails => {
  const gov = u.type === "government";
  const tech = u.type === "technical";
  const tuition = gov
    ? "رسوم حكومية مدعومة — تقديرياً 150,000 – 600,000 جنيه سنوياً حسب الكلية"
    : tech
    ? "تقديرياً 300,000 – 900,000 جنيه سنوياً"
    : "رسوم خاصة — تقديرياً 1.5 – 6 مليون جنيه سنوياً (الكليات الطبية أعلى)";
  const capital = u.city === "الخرطوم" || u.city === "أم درمان" || u.city === "بحري";
  const living = capital
    ? "تقديرياً 120 – 220 دولار شهرياً (سكن + مواصلات + إعاشة)"
    : "تقديرياً 70 – 140 دولار شهرياً — تكلفة أقل خارج العاصمة";

  const curated = CURATED[u.id];
  return {
    tuition,
    living,
    seasons:
      "القبول العام عبر إدارة القبول بوزارة التعليم العالي: يفتح عادة بعد نتيجة الشهادة السودانية (أغسطس – أكتوبر)، مع دور تكميلي محدود.",
    docs: [
      "شهادة الثانوية السودانية + كشف الدرجات",
      "الرقم الوطني أو شهادة الميلاد",
      "صور شخصية حديثة",
      "إيصال سداد رسوم استمارة القبول",
      gov ? "استمارة القبول العام الإلكترونية" : "استمارة تقديم الجامعة مباشرة",
    ],
    steps: gov
      ? [
          "احصل على رقم الجلوس ونتيجة الشهادة السودانية",
          "اشترِ رقم استمارة القبول العام وسجّل في بوابة القبول",
          "رتّب الرغبات بحيث تبدأ بالأعلى تنافساً ثم البدائل الآمنة",
          "أكّد الاستمارة قبل انتهاء المهلة واحفظ رقمها",
          "تابع نتيجة القبول ثم أكمل التسجيل بالجامعة وسدّد الرسوم",
        ]
      : [
          "تواصل مع إدارة القبول بالجامعة أو بوابتها الإلكترونية",
          "ارفع الشهادة وكشف الدرجات والمستندات الشخصية",
          "اجتز المقابلة أو اختبار القبول إن وُجد",
          "سدّد الدفعة الأولى من الرسوم لتثبيت المقعد",
          "أكمل التسجيل واستلم الجدول الدراسي",
        ],
    alumni: curated?.alumni ?? [
      "خريجون يعملون في القطاعين العام والخاص داخل السودان",
      "خريجون مهاجرون في دول الخليج وشرق أفريقيا",
    ],
    experience: curated?.experience ?? GENERIC_EXPERIENCE,
  };
};
