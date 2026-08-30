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
  {
    id: "u-azhari",
    name: "جامعة الزعيم الأزهري",
    nameEn: "Al-Zaiem Al-Azhari University",
    city: "الخرطوم",
    type: "government",
    founded: 1993,
    website: "https://aau.edu.sd/",
    faculties: ["الطب", "طب الأسنان", "المختبرات الطبية", "الأشعة والعلوم الطبية", "الصيدلة", "الهندسة", "العلوم السياسية والدراسات الاستراتيجية", "العلوم الحضرية"],
    minPercentage: 78,
    highlights: "جامعة حكومية كبرى تحمل اسم الرئيس الأزهري؛ متميزة بمجمع كلياتها الطبية والمختبرات والأشعة والعلوم السياسية.",
  },
  {
    id: "u-bahri",
    name: "جامعة بحري",
    nameEn: "University of Bahri",
    city: "الخرطوم",
    type: "government",
    founded: 2011,
    website: "https://bahri.edu.sd/",
    faculties: ["الطب", "التمريض", "الهندسة", "القانون", "الاقتصاد والعلوم الإدارية", "الطب البيطري والإنتاج الحيواني", "الموارد الطبيعية والدراسات البيئية"],
    minPercentage: 75,
    highlights: "إحدى كبريات الجامعات الحكومية بالعاصمة وتضم مجمع كليات طبية وهندسية وبترولية وقانونية متكاملة ببحري والكدرو.",
  },
  {
    id: "u-quran",
    name: "جامعة القرآن الكريم والعلوم الإسلامية",
    nameEn: "University of the Holy Quran & Islamic Sciences",
    city: "أم درمان",
    type: "government",
    founded: 1990,
    website: "https://uofq.edu.sd/",
    faculties: ["القرآن الكريم والقراءات", "الشريعة والدراسات الإسلامية", "الدعوة والإعلام", "الطب والعلوم الصحية", "الاقتصاد والعلوم الإدارية", "التربية واللغة العربية"],
    minPercentage: 68,
    highlights: "الصرح الأكاديمي الحكومي الأول المتخصص في علوم القرآن والشريعة والدراسات الإسلامية إلى جانب الكليات الطبية والاقتصادية.",
  },
  {
    id: "u-gadarif",
    name: "جامعة القضارف",
    nameEn: "University of Gadarif",
    city: "القضارف",
    type: "government",
    founded: 1994,
    website: "https://gadarif.edu.sd/",
    faculties: ["الطب والعلوم الصحية", "العلوم الزراعية والبيئية", "علوم الحاسوب وتقنية المعلومات", "الاقتصاد والعلوم الإدارية", "التربية"],
    minPercentage: 70,
    highlights: "القطب الأكاديمي الحكومي الرائد بولاية القضارف؛ متميزة بالطب البشري والعلوم الزراعية وأبحاث الأمن الغذائي بشرق السودان.",
  },
  {
    id: "u-kassala",
    name: "جامعة كسلا",
    nameEn: "University of Kassala",
    city: "كسلا",
    type: "government",
    founded: 1990,
    website: "https://kassalauni.edu.sd/",
    faculties: ["الطب والعلوم الصحية", "علوم التمريض", "الهندسة", "التربية", "الاقتصاد والعلوم الإدارية", "علوم الحاسوب وتقانة المعلومات"],
    minPercentage: 70,
    highlights: "صرح جامعي حكومي يخدم ولاية كسلا والشرق، ويتميز بكلية الطب البشري ومستشفياتها التعليمية والهندسة والتربية.",
  },
  {
    id: "u-dongola",
    name: "جامعة دنقلا",
    nameEn: "Dongola University",
    city: "دنقلا",
    type: "government",
    founded: 1994,
    website: "https://uofd.edu.sd/",
    faculties: ["الطب والعلوم الصحية", "علوم الأرض والتعدين", "الهندسة", "الزراعة والموارد الطبيعية", "التربية", "الآداب والدراسات الإنسانية"],
    minPercentage: 68,
    highlights: "الصرح الجامعي الحكومي الرائد بالولاية الشمالية؛ يتميز بكليات الطب وعلوم الأرض والتعدين والآثار والزراعة.",
  },
  {
    id: "u-fasher",
    name: "جامعة الفاشر",
    nameEn: "Al Fashir University",
    city: "الفاشر",
    type: "government",
    founded: 1990,
    website: "https://fashir.edu.sd/",
    faculties: ["الطب البشري", "علوم البيئة والموارد الطبيعية", "التربية", "الآداب والعلوم الإنسانية", "الشريعة والقانون", "الزراعة"],
    minPercentage: 68,
    highlights: "أعرق وأكبر جامعات إقليم دارفور؛ متميزة بالطب البشري وأبحاث البيئة والتنمية الريفية والشريعة والقانون.",
  },
  {
    id: "u-nyala",
    name: "جامعة نيالا",
    nameEn: "Nyala University",
    city: "نيالا",
    type: "government",
    founded: 1994,
    website: "https://nyalau.edu.sd/",
    faculties: ["الطب البشري", "الهندسة", "العلوم البيطرية والإنتاج الحيواني", "الاقتصاد والدراسات المصرفية", "التربية", "العلوم والمختبرات"],
    minPercentage: 68,
    highlights: "الصرح الجامعي الأكبر بجنوب دارفور؛ رائدة في الطب البشري، العلوم البيطرية والثروة الحيوانية، والهندسة.",
  },
  {
    id: "u-mahdi",
    name: "جامعة الإمام المهدي",
    nameEn: "University of El Imam El Mahdi",
    city: "كوستي",
    type: "government",
    founded: 1994,
    website: "https://mahdi.edu.sd/",
    faculties: ["الطب والعلوم الصحية", "الهندسة وتكنولوجيا المعلومات", "علوم وتكنولوجيا الأسماك", "الآداب والعلوم الإنسانية", "الشريعة والقانون", "التمريض"],
    minPercentage: 70,
    highlights: "تقع في كوستي وتخدم ولاية النيل الأبيض؛ متميزة بالطب البشري والهندسة وكلية علوم وتكنولوجيا الأسماك الفريدة.",
  },
  {
    id: "u-bluenile",
    name: "جامعة النيل الأزرق",
    nameEn: "Blue Nile University",
    city: "الدمازين",
    type: "government",
    founded: 1995,
    website: "https://uobn.edu.sd/",
    faculties: ["الطب والعلوم الصحية", "الهندسة", "التربية", "العلوم الزراعية والموارد الطبيعية", "الاقتصاد والعلوم الإدارية"],
    minPercentage: 65,
    highlights: "الصرح الجامعي الحكومي في إقليم النيل الأزرق بالدمازين؛ متخصصة في الكليات الطبية والهندسة والزراعة المطرية.",
  },
  {
    id: "u-westkordofan",
    name: "جامعة غرب كردفان",
    nameEn: "West Kordofan University",
    city: "النهود",
    type: "government",
    founded: 1997,
    website: "https://wku.edu.sd/",
    faculties: ["الطب والعلوم الصحية", "هندسة النفط والغاز", "الإنتاج الحيواني والمراعي", "التربية", "علوم الحاسوب"],
    minPercentage: 65,
    highlights: "تخدم ولاية غرب كردفان بالنهود وبابنوسة؛ متميزة بهندسة النفط والغاز وتخصصات الثروة الحيوانية والطب.",
  },
  {
    id: "u-merowe",
    name: "جامعة عبد اللطيف الحمد التكنولوجية (مروي)",
    nameEn: "Merowe University of Technology",
    city: "مروي",
    type: "government",
    founded: 2015,
    website: "https://mut.edu.sd/",
    faculties: ["الهندسة الميكانيكية والكهربائية", "الهندسة المدنية والتشييد", "العلوم الطبية والتمريض", "تكنولوجيا المعلومات والاتصالات"],
    minPercentage: 70,
    highlights: "أحدث جامعة تكنولوجية حكومية متخصصة في مروي (سد مروي)؛ تركز على التعليم الهندسي التطبيقي والمعامل المتقدمة.",
  },
  {
    id: "u-iua",
    name: "جامعة إفريقيا العالمية (IUA)",
    nameEn: "International University of Africa",
    city: "الخرطوم",
    type: "private",
    founded: 1966,
    website: "https://iua.edu.sd/",
    faculties: ["الطب البشري", "طب الأسنان", "الصيدلة", "التمريض", "الهندسة", "الشريعة والقانون", "الدراسات الإسلامية واللغة العربية", "علوم الحاسوب"],
    minPercentage: 75,
    highlights: "صرح دولي إسلامي عريق يستقطب طلاباً من أكثر من 85 دولة مع سكن جامعي ومنح دراسية واسعة ومستشفى تعليمي متكامل.",
  },
  {
    id: "u-alribat",
    name: "جامعة الرباط الوطني",
    nameEn: "The National Ribat University",
    city: "الخرطوم",
    type: "private",
    founded: 1999,
    website: "https://ribat.edu.sd/",
    faculties: ["الطب والجراحة", "علوم المختبرات الطبية والأدلة الجنائية", "الصيدلة", "طب الأسنان", "التمريض", "علوم الحاسوب وتقنية المعلومات", "الهندسة والعلوم الشرطية"],
    minPercentage: 76,
    highlights: "جامعة شبه حكومية رائدة تابعة لوزارة الداخلية؛ تضم مستشفى الرباط التعليمي وتتفرد بتدريس علوم الأدلة الجنائية والطب البشري.",
  },
  {
    id: "u-alrazi",
    name: "جامعة الرازي",
    nameEn: "Al Razi University",
    city: "الخرطوم",
    type: "private",
    founded: 2007,
    website: "https://alrazi.edu.sd/",
    faculties: ["الطب البشري", "طب وجراحة الفم والأسنان", "الصيدلة السريرية", "علوم المختبرات الطبية", "علوم التمريض", "علوم الحاسوب وتقنية المعلومات", "العلوم الإدارية"],
    minPercentage: 74,
    highlights: "جامعة خاصة مرموقة في أزهري/الخرطوم؛ متميزة بمستشفى الأسنان الجامعي المتقدم وكلية الصيدلة والمختبرات.",
  },
  {
    id: "u-ibnsina",
    name: "جامعة ابن سينا",
    nameEn: "Ibn Sina University",
    city: "الخرطوم",
    type: "private",
    founded: 2016,
    website: "https://isu.edu.sd/",
    faculties: ["الطب والجراحة", "طب الأسنان", "الصيدلة", "المختبرات الطبية", "العلاج الطبيعي والتأهيل", "العلوم الإدارية"],
    minPercentage: 75,
    highlights: "جامعة طبية خاصة حديثة متخصصة ومعتمدة بمعايير دولية؛ تركز على العلوم الصحية المتقدمة وتدريب المشافي السريري.",
  },
  {
    id: "u-mughtaribeen",
    name: "جامعة المغتربين",
    nameEn: "Al-Mughtaribeen University",
    city: "الخرطوم",
    type: "private",
    founded: 2010,
    website: "https://mu.edu.sd/",
    faculties: ["الطب البشري", "طب الأسنان", "الصيدلة", "الهندسة", "اللغات والترجمة", "العلوم الإدارية والمالية"],
    minPercentage: 72,
    highlights: "أنشئت بمبادرة من جهاز شؤون السودانيين العاملين بالخارج؛ متميزة في الطب والهندسة وإدارة الأعمال واللغات.",
  },
  {
    id: "u-neel",
    name: "جامعة النيل",
    nameEn: "Al-Neel University",
    city: "الخرطوم",
    type: "private",
    founded: 2000,
    website: "https://neeluni.edu.sd/",
    faculties: ["الطب البشري", "طب وجراحة الأسنان", "الصيدلة", "المختبرات الطبية", "علوم الحاسوب وتقنية المعلومات", "الهندسة"],
    minPercentage: 72,
    highlights: "جامعة خاصة متميزة بالمجمعات الطبية الحديثة وكليات طب الأسنان والمختبرات وتكنولوجيا المعلومات.",
  },
  {
    id: "u-yarmouk",
    name: "جامعة اليرموك",
    nameEn: "Al-Yarmouk University College",
    city: "الخرطوم",
    type: "private",
    founded: 1997,
    website: "https://yarmouk.edu.sd/",
    faculties: ["الطب والجراحة", "طب الأسنان", "الصيدلة", "علوم المختبرات الطبية", "هندسة البرمجيات وتقنية المعلومات", "العلوم الإدارية"],
    minPercentage: 70,
    highlights: "من أقدم الكليات الجامعية الخاصة بالخرطوم، متخصصة في العلوم الطبية السريرية وهندسة الحاسوب وإدارة الأعمال.",
  },
  {
    id: "u-albayan",
    name: "جامعة البيان",
    nameEn: "Al Bayan University",
    city: "الخرطوم",
    type: "private",
    founded: 1997,
    website: "https://albayan.edu.sd/",
    faculties: ["الهندسة المدنية والمعمارية", "علوم الحاسوب ونظم المعلومات", "التمريض والعلوم الطبية", "العلوم المالية والإدارية"],
    minPercentage: 65,
    highlights: "جامعة خاصة رائدة في الهندسة المعمارية والمدنية وعلوم التمريض وتطبيقات الحاسوب والمالية.",
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
  "u-azhari": {
    alumni: ["أطباء واستشاريون في مستشفيات الخرطوم وبحري والخليج", "أخصائيو أشعة ومختبرات طبية في كبرى المراكز التشخيصية"],
    experience: "كليات الطب والمختبرات والأشعة ذات سمعة تطبيقية ممتازة مع تدريب سريري مبكر بمستشفيات بحري والخرطوم.",
  },
  "u-bahri": {
    alumni: ["قضاة ومحامون ومستشارون قانونيون", "مهندسو بترول وموارد طبيعية في قطاع الطاقة"],
    experience: "جامعة حكومية حيوية بمجمعات متعددة في الخرطوم بحري والكدرو؛ قوية في الحقوق والهندسة والعلوم البيطرية.",
  },
  "u-quran": {
    alumni: ["قراء ومجازون في القراءات العشر", "أساتذة شريعة ودراسات إسلامية بالجامعات العربية والإسلامية"],
    experience: "بيئة أكاديمية إسلامية رائدة في أم درمان، مع كليات طبية واقتصادية متنامية ورسوم دراسية مناسبة.",
  },
  "u-iua": {
    alumni: ["وزراء ودبلوماسيون وأطباء في أكثر من 50 دولة إفريقية وآسيوية"],
    experience: "بيئة دولية متعددة الثقافات مع مدينة جامعية وسكن داخلي ومنح دراسية، والتدريس بالعربية والإنجليزية.",
  },
  "u-alribat": {
    alumni: ["خبراء أدلة جنائية وضباط مؤهلون", "أطباء وجراحون بمستشفى الرباط التعليمي والمشافي المرجعية"],
    experience: "انضباط عالي وتدريب عملي مكثف في مستشفى الشرطة التعليمي والمختبرات الجنائية المتقدمة.",
  },
  "u-red-sea": {
    alumni: ["ربابنة ومسؤولون بحريون بموانئ بورتسودان والشركات الملاحية الدولية", "مهندسو تعدين وجيولوجيون"],
    experience: "موقع فريد على ساحل البحر الأحمر في بورتسودان مع تدريب عملي مباشر في الموانئ والمحطات البحرية.",
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
