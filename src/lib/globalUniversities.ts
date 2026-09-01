import { GLOBAL_FLAGSHIP_ENRICHMENTS } from "./globalFlagshipEnrichments.ts";

export type GlobalCategory =
  | "arab_popular"
  | "eu_grants"
  | "anglophone"
  | "eurasia_eastasia";

export type PeerConnectionType =
  | "classmate_same_major" // نفس التخصص ونفس الفترة
  | "contemporary_peer"   // نفس الفترة الزمنية في كليات متقاربة
  | "alumni_legacy";      // خريج من نفس الصرح الأكاديمي

export interface NotableAlumniRecord {
  pioneerName: string;
  pioneerNameEn: string;
  pioneerCountry: string; // البلد الأصلي للرائد (مثلاً: اليمن، مصر، السعودية، فلسطين، إلخ)
  pioneerCountryEn: string;
  major: string;
  majorEn: string;
  entryYear?: number | string;
  gradYear?: number | string;
  roleOrAchievement: string;
  roleOrAchievementEn: string;

  // الشخصية العالمية المقترنة المعاصرة أو الزميلة في الصرح
  globalPeerName: string;
  globalPeerNameEn: string;
  globalPeerRole: string;
  globalPeerRoleEn: string;
  globalPeerGradYear?: number | string;

  // طبيعة الزمالة والتزامن
  connectionType: PeerConnectionType;
  connectionNote?: string;
  connectionNoteEn?: string;
}

export interface StudentPresenceData {
  communityDensity: "very_high" | "high" | "medium" | "emerging";
  topNationalities: string[];
  studentUnionOrClub?: string;
  studentUnionOrClubEn?: string;
  presenceNote: string;
  presenceNoteEn: string;
}

export interface ActiveScholarshipProgram {
  name: string;
  nameEn: string;
  fundingLevel: "full_100" | "partial_50_80" | "research_assistantship" | "periodic_merit";
  coverageSummary: string;
  coverageSummaryEn: string;
  frequency: "annual_continuous" | "periodic_seasonal" | "rolling";
  isDirectUniversityAward: boolean;
}

export interface GlobalUniversity {
  name: string;
  nameEn: string;
  city: string;
  cityEn: string;
  ranking?: string;
  type?: string;
  typeEn?: string;
  highlights: string;
  highlightsEn: string;
  website: string;
  faculties?: string[];
  facultiesEn?: string[];
  activeScholarship?: ActiveScholarshipProgram;
  studentPresence?: StudentPresenceData;
  notableAlumni?: NotableAlumniRecord[];
}

export interface GlobalCountryStat {
  country: string;
  countryEn: string;
  flag: string;
  region: string;
  regionEn: string;
  tier: "guaranteed" | "periodic";
  category: GlobalCategory;
  scholarshipName: string;
  scholarshipNameEn: string;
  applicationWindow: string;
  applicationWindowEn: string;
  fundingType: string;
  fundingTypeEn: string;
  coverage: string[];
  coverageEn: string[];
  studyLanguages: string[];
  degreeLevels: string[];
  officialPortals: Array<{
    name: string;
    nameEn: string;
    url: string;
  }>;
  overview: string;
  overviewEn: string;
  topUniversities: GlobalUniversity[];
}

const RAW_GLOBAL_COUNTRIES: GlobalCountryStat[] = [
  // ==========================================
  // 1. الوجهات الأكثر طلباً للطلاب العرب (Arab Popular Destinations)
  // ==========================================
  {
    country: "تركيا",
    countryEn: "Turkey",
    flag: "🇹🇷",
    region: "أوراسيا",
    regionEn: "Eurasia",
    tier: "guaranteed",
    category: "arab_popular",
    scholarshipName: "منحة الحكومة التركية (Türkiye Bursları)",
    scholarshipNameEn: "Türkiye Scholarships (Government of Turkey)",
    applicationWindow: "10 يناير – 20 فبراير (سنوياً)",
    applicationWindowEn: "Jan 10 – Feb 20 (Annually)",
    fundingType: "ممولة بالكامل 100%",
    fundingTypeEn: "Fully Funded 100%",
    coverage: ["رسوم دراسية كاملة", "راتب شهري منتظم", "سكن جامعي مجاني", "تذاكر طيران ذهاب وإياب", "تأمين صحي شامل", "سنة تحضيرية مجانية لتعلم اللغة التركية"],
    coverageEn: ["Full Tuition Waiver", "Monthly Living Stipend", "Free University Dormitory", "Round-Trip Flight Tickets", "Comprehensive Health Insurance", "1-Year Free Turkish Language Course (TÖMER)"],
    studyLanguages: ["التركية", "الإنجليزية"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "بحوث"],
    officialPortals: [
      { name: "بوابة منحة تركيا الرسمية", nameEn: "Türkiye Bursları Portal", url: "https://www.turkiyeburslari.gov.tr/" },
      { name: "مجلس التعليم العالي التركي (YÖK)", nameEn: "Council of Higher Education (YÖK)", url: "https://www.yok.gov.tr/" }
    ],
    overview: "البرنامج الحكومي الأشهر والأشمل في العالم، يوفر مقاعد سنوية مضمونة لآلاف الطلاب العرب مع سنة لغة وسكن وراتب مجزي.",
    overviewEn: "One of the world's most comprehensive scholarship schemes, awarding thousands of fully funded seats annually.",
    topUniversities: [
      {
        name: "جامعة الشرق الأوسط التقنية",
        nameEn: "Middle East Technical University (METU)",
        city: "أنقرة",
        cityEn: "Ankara",
        ranking: "Top 350 QS",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "أقوى جامعة هندسية وتقنية في تركيا، التدريس باللغة الإنجليزية 100% مع اعتمادات ABET الدولية.",
        highlightsEn: "Leading engineering and technical powerhouse in Turkey, taught 100% in English with ABET accreditation.",
        website: "https://www.metu.edu.tr/",
        faculties: ["الهندسة المدنية والمعمارية", "علوم وهندسة الحاسوب", "الهندسة الميكانيكية والكهربائية", "العلوم الإدارية والاقتصاد", "الفيزياء والرياضيات"],
        facultiesEn: ["Civil & Architectural Eng.", "Computer Science & Eng.", "Mechanical & Electrical Eng.", "Economics & Admin Sciences", "Physics & Mathematics"]
      },
      {
        name: "جامعة إسطنبول",
        nameEn: "Istanbul University",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Historic Top (1453)",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "أعرق وأكبر جامعات تركيا، مشهورة بكليات الطب البشري، طب الأسنان، الحقوق، والعلوم السياسية.",
        highlightsEn: "Oldest and largest prestigious Turkish institution with historic medicine, dentistry, and law faculties.",
        website: "https://www.istanbul.edu.tr/",
        faculties: ["الطب البشري وطب الأسنان", "الحقوق والقانون الدولي", "الصيدلة والعلوم الصحية", "الآداب والعلوم الإنسانية", "إدارة الأعمال والاتصال"],
        facultiesEn: ["Medicine & Dentistry", "Law & International Law", "Pharmacy & Health Sciences", "Letters & Humanities", "Business & Communication"]
      },
      {
        name: "جامعة بوغازيتشي",
        nameEn: "Boğaziçi University",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Top QS World",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "صرح نخبوي يطل على البوسفور، لغة التدريس إنجليزية بالكامل ومصنفة الأولى في العلوم وإدارة الأعمال.",
        highlightsEn: "Elite scenic institution on the Bosphorus, 100% English instruction, globally top-ranked in business & sciences.",
        website: "https://www.boun.edu.tr/",
        faculties: ["الهندسة المتقدمة", "العلوم الأساسية والفيزياء", "الاقتصاد والعلوم الإدارية", "العلوم الإنسانية واللغات", "العلوم التربوية"],
        facultiesEn: ["Advanced Engineering", "Fundamental Sciences & Physics", "Economics & Admin Sciences", "Humanities & Languages", "Educational Sciences"]
      },
      {
        name: "جامعة إسطنبول التقنية (İTÜ)",
        nameEn: "Istanbul Technical University (İTÜ)",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Top 400 QS Tech",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "ثالث أقدم جامعة تقنية في العالم (1773)، رائدة في علوم الفضاء والطيران والذكاء الاصطناعي والهندسة المعمارية.",
        highlightsEn: "Third oldest technical university in the world (1773), premier hub for aerospace, AI, and architecture.",
        website: "https://www.itu.edu.tr/",
        faculties: ["علوم الطيران والفضاء", "هندسة الحاسوب والذكاء الاصطناعي", "الهندسة المعمارية والتخطيط", "الهندسة الكيميائية والتعدين", "الهندسة البحرية وبناء السفن"],
        facultiesEn: ["Aeronautics & Astronautics", "Computer & AI Engineering", "Architecture & Urban Planning", "Chemical & Mining Eng.", "Naval Architecture & Marine Eng."]
      },
      {
        name: "جامعة كوتش",
        nameEn: "Koç University",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Top 300 QS (#1 Private)",
        type: "وقفية خاصة",
        typeEn: "Private Foundation",
        highlights: "الجامعة الخاصة الأولى في تركيا، تميز بحثي فائق ومستشفى جامعي متقدم مع تدريس باللغة الإنجليزية بالكامل.",
        highlightsEn: "Turkey's #1 private research university with world-class hospital and top global faculty.",
        website: "https://www.ku.edu.tr/",
        faculties: ["الطب البشري والعلوم الصحية", "الهندسة وعلوم الحاسوب", "كلية إدارة الأعمال والاقتصاد", "العلوم الاجتماعية والإنسانية", "الحقوق والقانون"],
        facultiesEn: ["School of Medicine", "Engineering & Computer Science", "Business & Economics", "Social Sciences & Humanities", "Law School"]
      },
      {
        name: "جامعة سابانجي",
        nameEn: "Sabancı University",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Top 400 QS",
        type: "وقفية خاصة",
        typeEn: "Private Foundation",
        highlights: "نموذج تعليمي أمريكي فريد يتيح للطالب اختيار تخصصه بعد السنة الأولى، تدريس إنجليزي 100% ومختبرات نانو متقدمة.",
        highlightsEn: "Innovative liberal arts curriculum allowing major selection after year one, 100% English taught.",
        website: "https://www.sabanciuniv.edu/",
        faculties: ["الهندسة والعلوم الطبيعية", "إدارة الأعمال والتمويل", "العلوم السياسية والعلاقات الدولية", "الميكاترونكس والذكاء الاصطناعي", "الفنون والتصميم"],
        facultiesEn: ["Engineering & Natural Sciences", "Management & Finance", "Political Science & Int. Relations", "Mechatronics & AI", "Arts & Social Sciences"]
      },
      {
        name: "جامعة بيلكنت",
        nameEn: "Bilkent University",
        city: "أنقرة",
        cityEn: "Ankara",
        ranking: "Top Private Ankara",
        type: "وقفية خاصة",
        typeEn: "Private Foundation",
        highlights: "أول جامعة خاصة تأسست في تركيا، تشتهر ببرامج الهندسة وإدارة الأعمال والموسيقى والفنون والتدريس الإنجليزي.",
        highlightsEn: "Turkey's first private foundation university, internationally recognized in engineering, business, and arts.",
        website: "https://www.bilkent.edu.tr/",
        faculties: ["الهندسة وعلوم النظم", "إدارة الأعمال والعلوم الإنسانية", "الموسيقى والفنون المسرحية", "العلوم والتكنولوجيا", "الحقوق"],
        facultiesEn: ["Engineering & Systems Science", "Business Administration", "Music & Performing Arts", "Sciences & Technology", "Faculty of Law"]
      },
      {
        name: "جامعة حجي تبه",
        nameEn: "Hacettepe University",
        city: "أنقرة",
        cityEn: "Ankara",
        ranking: "#1 Medical Turkey",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "الصرح الطبي والصحي الأول في تركيا وأحد أفضل المراكز الطبية في منطقة الشرق الأوسط وأوروبا الشرقية.",
        highlightsEn: "Premier medical, healthcare, and pharmacy institution in Turkey and Central Europe.",
        website: "https://www.hacettepe.edu.tr/",
        faculties: ["الطب البشري (تركي وإنجليزي)", "طب الأسنان", "الصيدلة والعلوم الطبية", "الهندسة الطبية والحيوية", "العلوم والتربية"],
        facultiesEn: ["Faculty of Medicine (TR/EN)", "Faculty of Dentistry", "Faculty of Pharmacy", "Biomedical Engineering", "Sciences & Education"]
      },
      {
        name: "جامعة أنقرة",
        nameEn: "Ankara University",
        city: "أنقرة",
        cityEn: "Ankara",
        ranking: "Historic National Top",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "أول جامعة تأسست في الجمهورية التركية، رائدة في العلوم السياسية والقانون والطب واللغات.",
        highlightsEn: "First university established in the Republic of Turkey, renowned in political science, law, and medicine.",
        website: "https://www.ankara.edu.tr/",
        faculties: ["العلوم السياسية (Mülkiye)", "الحقوق والقانون الدولي", "الطب البشري والبيطري", "اللغات والتاريخ والجغرافيا", "العلوم والزراعة"],
        facultiesEn: ["Political Science", "Faculty of Law", "Medicine & Veterinary", "Languages, History & Geography", "Agriculture & Applied Sciences"]
      },
      {
        name: "جامعة إيجه",
        nameEn: "Ege University",
        city: "إزمير",
        cityEn: "Izmir",
        ranking: "Top Aegean Region",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "أكبر صرح جامعي في إزمير وبحر إيجه، متميزة في الطب والهندسة والعلوم الزراعية والمختبرات المتقدمة.",
        highlightsEn: "Flagship university in Izmir and the Aegean region, prominent in medicine, engineering, and agriculture.",
        website: "https://ege.edu.tr/",
        faculties: ["الطب البشري والمستشفى الجامعي", "الهندسة وتكنولوجيا النانو", "التمريض والعلوم الصحية", "الصيدلة والبيولوجيا", "الآداب والتجارة"],
        facultiesEn: ["Faculty of Medicine", "Engineering & Nanotech", "Nursing & Health Sciences", "Pharmacy & Biology", "Letters & Economics"]
      },
      {
        name: "جامعة بهتشه شهير (BAU)",
        nameEn: "Bahçeşehir University (BAU)",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Global Network BAU",
        type: "خاصة",
        typeEn: "Private",
        highlights: "جامعة عالمية تمتلك فروعاً في واشنطن وبرلين وروما، تتميز بالطب والهندسة والإعلام والموقع على البوسفور.",
        highlightsEn: "Global educational network with campuses in Washington and Berlin, prominent in medicine and media.",
        website: "https://bau.edu.tr/",
        faculties: ["الطب البشري والعلوم الصحية", "الهندسة ونظم المعلومات", "الإعلام والاتصال والسينما", "العمارة والتصميم", "الحقوق وإدارة الأعمال"],
        facultiesEn: ["Medicine & Health Sciences", "Engineering & Info Systems", "Communication & Media", "Architecture & Design", "Law & Business Administration"]
      },
      {
        name: "جامعة إسطنبول أيدن (IAU)",
        nameEn: "Istanbul Aydın University (IAU)",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Top International Body",
        type: "خاصة",
        typeEn: "Private",
        highlights: "تحتضن أكبر عدد من الطلاب الدوليين والعرب في تركيا، مراكز تدريب ومستشفيات أسنان وطب متطورة.",
        highlightsEn: "Top choice for international and Arab students, featuring comprehensive dental and medical hospitals.",
        website: "https://www.aydin.edu.tr/",
        faculties: ["طب الأسنان والطب البشري", "الهندسة وتطوير البرمجيات", "العلوم التطبيقية واللغات", "الصحافة والإعلام الرقمي", "إدارة الأعمال واللوجستيات"],
        facultiesEn: ["Dentistry & Medicine", "Engineering & Software", "Applied Sciences & Languages", "Journalism & Digital Media", "Business & Logistics"]
      },
      {
        name: "جامعة إسطنبول ميديبول",
        nameEn: "Istanbul Medipol University",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Mega Medical Group",
        type: "خاصة",
        typeEn: "Private",
        highlights: "الصرح الطبي والبحثي الأحدث والأضخم في تركيا، مجمعات مستشفيات ميديبول الجامعية العملاقة وتدريس بالإنجليزية.",
        highlightsEn: "Turkey's largest healthcare and biomedical education group with state-of-the-art hospitals.",
        website: "https://www.medipol.edu.tr/",
        faculties: ["الطب البشري الدولي (إنجليزي)", "طب الأسنان والصيدلة", "الهندسة الطبية والذكاء الاصطناعي", "العلوم الصحية والتأهيل", "الحقوق والعلوم الإدارية"],
        facultiesEn: ["International Medicine (EN)", "Dentistry & Pharmacy", "Biomedical & AI Engineering", "Health Sciences & Rehabilitation", "Law & Business"]
      },
      {
        name: "جامعة غازي",
        nameEn: "Gazi University",
        city: "أنقرة",
        cityEn: "Ankara",
        ranking: "Top 500 QS Education",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "إحدى كبرى الجامعات الحكومية في العاصمة أنقرة، رائدة في كليات التربية والهندسة والعلوم التقنية.",
        highlightsEn: "Major public research university in Ankara, nationally renowned in education, engineering, and technology.",
        website: "https://gazi.edu.tr/",
        faculties: ["كلية غازي للتربية", "الهندسة والتقنيات الصناعية", "الطب البشري وطب الأسنان", "العلوم المعمارية", "الصيدلة والعلوم"],
        facultiesEn: ["Gazi Faculty of Education", "Engineering & Technology", "Medicine & Dentistry", "Architecture", "Pharmacy & Science"]
      },
      {
        name: "جامعة مرمرة",
        nameEn: "Marmara University",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Multilingual Pioneer",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "الجامعة الوحيدة في تركيا التي تقدم برامج البكالوريوس والدراسات العليا بخمس لغات، ومتميزة في الطب والاقتصاد.",
        highlightsEn: "Unique multilingual university in Turkey offering degree programs in 5 languages across medicine and economics.",
        website: "https://www.marmara.edu.tr/",
        faculties: ["الطب البشري (إنجليزي وتركي)", "الاقتصاد والعلوم الإدارية", "الهندسة وعلوم البيانات", "الشريعة والعلوم الإسلامية", "الفنون الجميلة والسينما"],
        facultiesEn: ["Faculty of Medicine (EN/TR)", "Economics & Admin Sciences", "Engineering & Data Science", "Theology & Islamic Studies", "Fine Arts & Cinema"]
      },
      {
        name: "جامعة يلدز التقنية (YTU)",
        nameEn: "Yıldız Technical University (YTU)",
        city: "إسطنبول",
        cityEn: "Istanbul",
        ranking: "Top Engineering & Architecture",
        type: "حكومية",
        typeEn: "Public / State",
        highlights: "جامعة تقنية وتاريخية مرموقة تشتهر بأقوى حاضنات الأعمال التكنولوجية (Technopark) ومجالات الهندسة المعمارية والبرمجة.",
        highlightsEn: "Premier technical institution renowned for Turkey's largest Technopark, architecture, and engineering.",
        website: "https://www.yildiz.edu.tr/",
        faculties: ["الهندسة المعمارية والتصميم", "الهندسة الكهربائية والإلكترونية", "الهندسة الميكانيكية والكيميائية", "علوم الحاسوب والمعلومات", "العلوم البحرية"],
        facultiesEn: ["Faculty of Architecture", "Electrical & Electronics Eng.", "Mechanical & Chemical Eng.", "Computer & Information Science", "Naval Architecture"]
      }
    ]
  },
  {
    country: "روسيا",
    countryEn: "Russia",
    flag: "🇷🇺",
    region: "أوروبا الشرقية وآسيا",
    regionEn: "Eastern Europe & North Asia",
    tier: "guaranteed",
    category: "arab_popular",
    scholarshipName: "منحة الحكومة الروسية ومقاعد البيت الروسي (Rossotrudnichestvo)",
    scholarshipNameEn: "Russian Government Quota Scholarship & Open Doors",
    applicationWindow: "سبتمبر – ديسمبر (سنوياً)",
    applicationWindowEn: "Sep – Dec (Annually)",
    fundingType: "ممولة بالكامل (رسوم وسكن وسنة تحضيرية)",
    fundingTypeEn: "Fully Funded Tuition & Subsidized Housing",
    coverage: ["إعفاء 100% من الرسوم الدراسية", "سكن جامعي رمزي مدعوم", "سنة تحضيرية لتعلم اللغة الروسية", "راتب شهري حكومي"],
    coverageEn: ["100% Tuition Exemption", "Subsidized Dormitory Housing", "1-Year Russian Preparatory Course", "Monthly Government Stipend"],
    studyLanguages: ["الروسية", "الإنجليزية"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "إقامة طبية (Residency)"],
    officialPortals: [
      { name: "بوابة التقديم على المنحة الروسية", nameEn: "Education in Russia Portal", url: "https://education-in-russia.com/" },
      { name: "بوابة أولمبياد Open Doors للماجستير والدكتوراه", nameEn: "Open Doors Russian Scholarship", url: "https://od.globaluni.ru/en/" }
    ],
    overview: "تقدم روسيا أكثر من 15,000 مقعد دراسي مجاني سنوياً للطلاب الأجانب، ومشهورة بالطب البشري وهندسة الفضاء والطيران والتكنولوجيا النووية.",
    overviewEn: "Offers 15,000+ government quota seats yearly, famous for medicine, aerospace, nuclear, and software engineering.",
    topUniversities: [
      {
        name: "جامعة لومونوسوف موسكو الحكومية (MSU)",
        nameEn: "Lomonosov Moscow State University (MSU)",
        city: "موسكو",
        cityEn: "Moscow",
        ranking: "Top 90 QS World",
        type: "حكومية فيدرالية",
        typeEn: "Federal Public",
        highlights: "الجامعة الروسية الأولى عالمياً، مبناها الأيقوني يضم أعظم كليات الرياضيات، الفيزياء، الطب، والعلوم الطبيعية.",
        highlightsEn: "Russia's #1 world-ranked university, prestigious faculty of mathematics, physics, medicine, and natural sciences.",
        website: "https://www.msu.ru/",
        faculties: ["الطب البشري والرعاية الصحية", "الرياضيات والميكانيكا", "الفيزياء والعلوم النووية", "علوم الحاسوب والسيبرانية الحسابية", "الكيمياء والمواد المتقدمة"],
        facultiesEn: ["Faculty of Medicine", "Mathematics & Mechanics", "Physics & Nuclear Sciences", "Computational Cybernetics", "Chemistry & Advanced Materials"]
      },
      {
        name: "جامعة سانت بطرسبرغ الحكومية (SPbU)",
        nameEn: "Saint Petersburg State University (SPbU)",
        city: "سانت بطرسبرغ",
        cityEn: "Saint Petersburg",
        ranking: "Top 300 QS",
        type: "حكومية فيدرالية",
        typeEn: "Federal Public",
        highlights: "صرح إمبراطوري عريق تخرج منه 9 من حائزي نوبل ورؤساء دول، رائدة في القانون الدولي، الطب، والفيزياء.",
        highlightsEn: "Historic imperial university educating 9 Nobel laureates and world leaders, leader in international law and medicine.",
        website: "https://spbu.ru/",
        faculties: ["الطب البشري وطب الأسنان", "القانون والعلاقات الدولية", "الفيزياء والرياضيات التطبيقية", "الإدارة والاقتصاد العالمي", "الاستشراق والدراسات الشرقية"],
        facultiesEn: ["Medicine & Dentistry", "Law & International Relations", "Physics & Applied Math", "Management & World Economics", "Oriental Studies"]
      },
      {
        name: "جامعة الصداقة بين الشعوب (RUDN)",
        nameEn: "Peoples' Friendship University of Russia (RUDN)",
        city: "موسكو",
        cityEn: "Moscow",
        ranking: "Top International Medical",
        type: "حكومية فيدرالية",
        typeEn: "Federal Public",
        highlights: "أشهر جامعة دولية في روسيا تحتضن طلاباً من 160 دولة، رائدة الطب البشري، طب الأسنان، والصيدلة باللغة الإنجليزية والروسية.",
        highlightsEn: "Most diverse international university in Russia, prestigious English/Russian-taught medical and dental faculties.",
        website: "https://www.rudn.ru/",
        faculties: ["المعهد الطبي (طب بشري، أسنان، صيدلة)", "كلية الهندسة والنفط والغاز", "كلية العلوم الإنسانية واللغات", "كلية العلوم الاقتصادية والقانون", "معهد التكنولوجيا الحيوية"],
        facultiesEn: ["Medical Institute (Medicine, Dental, Pharmacy)", "Faculty of Engineering & Petroleum", "Humanities & Languages", "Economics & Law", "Biotechnology Institute"]
      },
      {
        name: "جامعة كازان الفيدرالية (KFU)",
        nameEn: "Kazan Federal University (KFU)",
        city: "كازان",
        cityEn: "Kazan",
        ranking: "Top 350 QS",
        type: "حكومية فيدرالية",
        typeEn: "Federal Public",
        highlights: "ثالث أقدم جامعة في روسيا (1804)، تتميز ببيئة إسلامية وثقافية مرحبة للطلاب العرب وتفوق في الطب وهندسة البترول.",
        highlightsEn: "Third oldest Russian university (1804), prominent in general medicine, petroleum engineering, and AI in Tatarstan.",
        website: "https://kpfu.ru/",
        faculties: ["معهد الطب والبيولوجيا الأساسية", "معهد الجيولوجيا وهندسة النفط", "معهد الرياضيات وتكنولوجيا المعلومات", "معهد العلاقات الدولية والاستشراق", "كلية الحقوق"],
        facultiesEn: ["Institute of Medicine & Biology", "Geology & Petroleum Engineering", "Math & IT Institute", "International Relations", "Faculty of Law"]
      },
      {
        name: "جامعة سيتشينوف الطبية الأولى بموسكو",
        nameEn: "Sechenov First Moscow State Medical University",
        city: "موسكو",
        cityEn: "Moscow",
        ranking: "#1 Medical in Russia",
        type: "حكومية بحثية طبية",
        typeEn: "National Research Medical",
        highlights: "الجامعة الطبية الأقدم والأعرق في روسيا (تأسست 1758)، معترف بها عالمياً في كل الدول العربية ومؤهلة لـ USMLE.",
        highlightsEn: "Russia's oldest and most prestigious medical school (1758), globally recognized with English-taught MBBS.",
        website: "https://www.sechenov.ru/",
        faculties: ["الطب العام والجراحة (إنجليزي وروسي)", "طب وجراحة الفم والأسنان", "الصيدلة وتكنولوجيا الأدوية", "طب الأطفال والتمريض التخصصي", "الهندسة الحيوية الطبية"],
        facultiesEn: ["General Medicine (MBBS)", "Dentistry & Oral Surgery", "Pharmacy & Pharmacology", "Pediatrics & Nursing", "Biomedical Engineering"]
      },
      {
        name: "جامعة باومان موسكو التقنية الحكومية (BMSTU)",
        nameEn: "Bauman Moscow State Technical University (BMSTU)",
        city: "موسكو",
        cityEn: "Moscow",
        ranking: "#1 Engineering & Aerospace",
        type: "حكومية تقنية وطنية",
        typeEn: "National Technical",
        highlights: "MIT روسيا؛ الجامعة المصنفة الأولى في هندسة الطيران، الفضاء، الصواريخ، الروبوتات، والذكاء الاصطناعي.",
        highlightsEn: "Russia's premier engineering powerhouse, leading the world in aerospace, robotics, nuclear, and software systems.",
        website: "https://bmstu.ru/",
        faculties: ["هندسة الفضاء والطيران والصواريخ", "علوم الحاسوب والتحكم الآلي", "الروبوتات والميكاترونكس المتقدمة", "الهندسة الطبية الحيوية", "الهندسة النووية والحرارية"],
        facultiesEn: ["Aerospace & Rocket Engineering", "Computer Science & Control", "Robotics & Mechatronics", "Biomedical Engineering", "Nuclear & Power Engineering"]
      },
      {
        name: "جامعة تومسك الحكومية (TSU)",
        nameEn: "Tomsk State University (TSU)",
        city: "تومسك",
        cityEn: "Tomsk",
        ranking: "Top 250 QS (#1 Siberia)",
        type: "حكومية بحثية وطنية",
        typeEn: "National Research",
        highlights: "عاصمة الطلاب والعلوم في سيبيريا، جامعة بحثية مرموقة توفر تعليماً ممتازاً وتكاليف معيشية منخفضة للغاية.",
        highlightsEn: "Russia's premier Siberian research institution, top-ranked in physics, computer science, and life sciences.",
        website: "https://en.tsu.ru/",
        faculties: ["معهد العلوم الحسابية والبرمجة", "الفيزياء والتكنولوجيا النووية", "الكيمياء والبيولوجيا الجزيئية", "العلوم الإنسانية واللغات", "معهد الاقتصاد والإدارة"],
        facultiesEn: ["Computer Science & Programming", "Physics & Nuclear Tech", "Chemistry & Molecular Biology", "Humanities & Languages", "Economics & Management"]
      },
      {
        name: "جامعة نوفوسيبيرسك الحكومية (NSU)",
        nameEn: "Novosibirsk State University (NSU)",
        city: "نوفوسيبيرسك",
        cityEn: "Novosibirsk",
        ranking: "Top 250 QS",
        type: "حكومية بحثية وطنية",
        typeEn: "National Research",
        highlights: "تقع في قلب المدينة الأكاديمية (أكاديمجورودوك)، تضم 35 معهد أبحاث وتتميز بالطب والذكاء الاصطناعي والرياضيات.",
        highlightsEn: "Located in the Silicon Forest of Akademgorodok, famous for medicine, AI, mathematics, and high-energy physics.",
        website: "https://www.nsu.ru/n/",
        faculties: ["كلية الطب البشري (مسار إنجليزي)", "كلية تكنولوجيا المعلومات والبرمجة", "كلية الفيزياء والعلوم الدقيقة", "كلية الميكانيكا والرياضيات", "معهد الاقتصاد والتنظيم الصناعي"],
        facultiesEn: ["V. Zelman School of Medicine (EN)", "Information Technology", "Faculty of Physics", "Mechanics & Mathematics", "Economics & Industrial Mgmt"]
      },
      {
        name: "جامعة بيروغوف الطبية الوطنية الروسية (RNRMU)",
        nameEn: "Pirogov Russian National Research Medical University",
        city: "موسكو",
        cityEn: "Moscow",
        ranking: "Premier Clinical Medical",
        type: "حكومية بحثية طبية",
        typeEn: "National Research Medical",
        highlights: "ثاني أكبر جامعة طبية في موسكو، مركز متميز للتدريب السريري وجراحة القلب والأورام وتدريس باللغة الإنجليزية.",
        highlightsEn: "Leading clinical and scientific medical university in Moscow, famous for clinical surgery and pediatrics.",
        website: "https://rsmu.ru/",
        faculties: ["الطب العام والجراحة العامة", "طب الأطفال وحديثي الولادة", "طب وجراحة الفم والأسنان", "البيولوجيا الطبية والوراثة", "الصيدلة الإكلينيكية"],
        facultiesEn: ["Faculty of General Medicine", "Faculty of Pediatrics", "Faculty of Dentistry", "Medical Biology & Genetics", "Clinical Pharmacy"]
      },
      {
        name: "المدرسة العليا للاقتصاد (HSE University)",
        nameEn: "HSE University (Higher School of Economics)",
        city: "موسكو",
        cityEn: "Moscow",
        ranking: "Top 300 QS (#1 Social & IT)",
        type: "حكومية بحثية وطنية",
        typeEn: "National Research",
        highlights: "الجامعة الأكثر حداثة وعالمية في روسيا، شريك مع أرقى جامعات العالم، رائدة في علوم البيانات والذكاء الاصطناعي وإدارة الأعمال.",
        highlightsEn: "Highly internationalized Russian research university, leading in data science, AI, finance, and international business.",
        website: "https://www.hse.ru/en/",
        faculties: ["علوم الحاسوب والذكاء الاصطناعي", "الاقتصاد القياسي والمالية", "العلاقات الدولية والشؤون العالمية", "إدارة الأعمال واللوجستيات", "العلوم الاجتماعية والإنسانية"],
        facultiesEn: ["Computer Science & AI", "Economics & Finance", "World Economy & Int. Affairs", "Business Administration", "Social Sciences"]
      },
      {
        name: "جامعة الأورال الفيدرالية (UrFU)",
        nameEn: "Ural Federal University (UrFU)",
        city: "يكاترينبورغ",
        cityEn: "Yekaterinburg",
        ranking: "Top 350 QS",
        type: "حكومية فيدرالية",
        typeEn: "Federal Public",
        highlights: "إحدى أضخم الجامعات الروسية تقع في عاصمة جبال الأورال، معقل الهندسة الميكانيكية وتكنولوجيا المعلومات والمعادن.",
        highlightsEn: "One of Russia's largest federal universities in Yekaterinburg, industrial hub for IT, robotics, and metallurgy.",
        website: "https://urfu.ru/en/",
        faculties: ["معهد هندسة الراديو وتكنولوجيا المعلومات", "المعهد الهندسي والميكانيكي", "معهد الكيمياء والمواد المتقدمة", "معهد الاقتصاد والإدارة", "معهد العلوم الإنسانية"],
        facultiesEn: ["Radio Engineering & IT", "Engineering & Mechanical Institute", "Chemistry & Advanced Materials", "Economics & Management", "Humanities Institute"]
      },
      {
        name: "معهد موسكو للفيزياء والتكنولوجيا (MIPT)",
        nameEn: "Moscow Institute of Physics and Technology (MIPT / Phystech)",
        city: "دولغوبرودني",
        cityEn: "Dolgoprudny",
        ranking: "Top 300 QS (Russian MIT)",
        type: "حكومية بحثية وطنية",
        typeEn: "National Research",
        highlights: "الصرح النخبوي الذي تخرج منه 10 من علماء نوبل، تخصصات فائقة الدقة في الحوسبة الكمومية، الذكاء الاصطناعي، والفيزياء الحيوية.",
        highlightsEn: "Elite institution educating 10 Nobel laureates, world leader in quantum computing, AI, and biophysics.",
        website: "https://mipt.ru/english/",
        faculties: ["الفيزياء الحيوية وهندسة الجينوم", "الرياضيات التطبيقية وعلوم الحاسوب", "الالكترونيات الكمومية وهندسة الفضاء", "الذكاء الاصطناعي والتعلم الآلي", "تكنولوجيا النانو والمواد النانوية"],
        facultiesEn: ["Biophysics & Genome Engineering", "Applied Mathematics & CS", "Quantum Electronics & Aerospace", "Artificial Intelligence & ML", "Nanotechnology & Materials"]
      },
      {
        name: "جامعة إيمانويل كانط البلطيق الفيدرالية (IKBFU)",
        nameEn: "Immanuel Kant Baltic Federal University (IKBFU)",
        city: "كالينينغراد",
        cityEn: "Kaliningrad",
        ranking: "Top Baltic Hub",
        type: "حكومية فيدرالية",
        typeEn: "Federal Public",
        highlights: "تقع في جيب كالينينغراد الأوروبي على بحر البلطيق، جامعة فيدرالية حديثة تقدم برامج طبية وهندسية باللغة الإنجليزية في قلب أوروبا.",
        highlightsEn: "European-located Russian federal university in Kaliningrad, offering English-taught medicine and AI programs.",
        website: "https://eng.kantiana.ru/",
        faculties: ["الطب العام والعلوم الصحية", "الذكاء الاصطناعي وعلم الأعصاب الحسابي", "الهندسة وتكنولوجيا الليزر", "القانون واللغات الأوروبية", "العلوم الكيميائية الحيوية"],
        facultiesEn: ["General Medicine & Health", "Artificial Intelligence & Neurotech", "Engineering & Laser Physics", "Law & European Languages", "Biochemistry"]
      },
      {
        name: "جامعة بطرس الأكبر سانت بطرسبرغ للبوليتكنيك (SPbPU)",
        nameEn: "Peter the Great St. Petersburg Polytechnic University (SPbPU)",
        city: "سانت بطرسبرغ",
        cityEn: "Saint Petersburg",
        ranking: "Top 350 QS",
        type: "حكومية تقنية وطنية",
        typeEn: "National Technical",
        highlights: "أعرق صرح للبوليتكنيك في روسيا، مراكز ابتكار كبرى في الهندسة الميكانيكية، الطاقة النووية، والتصميم الرقمي للسيارات والطائرات.",
        highlightsEn: "Russia's legendary polytechnic university, premier center for digital engineering, nuclear power, and AI.",
        website: "https://english.spbstu.ru/",
        faculties: ["معهد علوم الحاسوب والتحكم", "معهد الهندسة الميكانيكية والمواد", "معهد الطاقة النووية والمتجددة", "معهد الهندسة المدنية والمعمارية", "معهد الهندسة الحيوية الطبية"],
        facultiesEn: ["Computer Science & Control", "Mechanical Engineering & Materials", "Energy & Nuclear Tech", "Civil Engineering & Architecture", "Biomedical Engineering"]
      }
    ]
  },
  {
    country: "ماليزيا",
    countryEn: "Malaysia",
    flag: "🇲🇾",
    region: "جنوب شرق آسيا",
    regionEn: "Southeast Asia",
    tier: "periodic",
    category: "arab_popular",
    scholarshipName: "المنحة الدولية الماليزية (MIS - Malaysia International Scholarship)",
    scholarshipNameEn: "Malaysia International Scholarship (MIS)",
    applicationWindow: "مايو – يونيو (سنوياً)",
    applicationWindowEn: "May – Jun (Annually)",
    fundingType: "ممولة للدراسات العليا",
    fundingTypeEn: "Funded Postgraduate Scholarship",
    coverage: ["إعفاء كامل من الرسوم الدراسية", "راتب شهري للمعيشة (1,500 رينغيت)", "تأمين صحي وبدل سفر ومراجع", "تأشيرة دراسية مجانية"],
    coverageEn: ["Full Tuition Fees Exemption", "Monthly Living Allowance (1,500 MYR)", "Travel Grant & Medical Insurance", "Student Visa Sponsorship"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير", "دكتوراه", "بحوث"],
    officialPortals: [
      { name: "بوابة وزارة التعليم العالي الماليزية (MOHE)", nameEn: "MOHE Malaysia Scholarship Portal", url: "https://biasiswa.mohe.gov.my/MIS/" },
      { name: "بوابة الدراسة الرسمية في ماليزيا (Education Malaysia)", nameEn: "Study in Malaysia Global Portal", url: "https://educationmalaysia.gov.my/" }
    ],
    overview: "وجهة تعليمية إسلامية ودولية رائدة تجمع بين جودة التعليم البريطاني/الأمريكي وتكلفة المعيشة الاقتصادية مع تدريس 100% باللغة الإنجليزية في أفضل 100 جامعة عالمياً.",
    overviewEn: "Top Southeast Asian education hub offering 100% English-taught degrees at world top 100 research universities.",
    topUniversities: [
      {
        name: "جامعة مالايا (UM)",
        nameEn: "Universiti Malaya (UM)",
        city: "كوالالمبور",
        cityEn: "Kuala Lumpur",
        ranking: "Top 60 QS World (#1 Malaysia)",
        type: "حكومية بحثية وطنية",
        typeEn: "National Public Research",
        highlights: "الجامعة الأولى والأعرق في ماليزيا (1905)، مصنفة 60 عالمياً، ومتميزة في الطب والهندسة والذكاء الاصطناعي وإدارة الأعمال.",
        highlightsEn: "Malaysia's premier university ranked in world top 60, renowned in medicine, engineering, and business.",
        website: "https://www.um.edu.my/",
        faculties: ["كلية الطب البشري والمركز الطبي الجامعي", "كلية الهندسة والذكاء الاصطناعي", "كلية علوم الحاسوب وتكنولوجيا المعلومات", "كلية إدارة الأعمال والاقتصاد", "كلية الحقوق والقانون الدولي"],
        facultiesEn: ["Faculty of Medicine & UMMC", "Faculty of Engineering & AI", "Computer Science & Information Tech", "Business & Economics", "Faculty of Law"]
      },
      {
        name: "الجامعة الوطنية الماليزية (UKM)",
        nameEn: "Universiti Kebangsaan Malaysia (UKM)",
        city: "بانغي / كوالالمبور",
        cityEn: "Bangi / Kuala Lumpur",
        ranking: "Top 140 QS World",
        type: "حكومية بحثية",
        typeEn: "Public Research",
        highlights: "الصرح الوطني وحاضنة الهوية الماليزية، تمتلك مستشفى تعليمياً عملاقاً ومراكز متقدمة لأبحاث الفضاء وهندسة الجينات.",
        highlightsEn: "Malaysia's National University ranked in the world top 140, featuring major teaching hospitals and space research.",
        website: "https://www.ukm.my/",
        faculties: ["كلية الطب والعلوم الصحية (UKM Medical)", "كلية الهندسة والبيئة المبنية", "كلية تكنولوجيا وعلوم المعلومات", "كلية الصيدلة وطب الأسنان", "كلية الاقتصاد والإدارة"],
        facultiesEn: ["Faculty of Medicine & Health Sciences", "Engineering & Built Environment", "Information Science & Tech", "Pharmacy & Dentistry", "Economics & Management"]
      },
      {
        name: "جامعة بوترا ماليزيا (UPM)",
        nameEn: "Universiti Putra Malaysia (UPM)",
        city: "سيردانغ",
        cityEn: "Serdang",
        ranking: "Top 150 QS World",
        type: "حكومية بحثية",
        typeEn: "Public Research",
        highlights: "الجامعة المصنفة الأولى آسيوياً في العلوم الزراعية والبيئية والبيوتكنولوجي، ومتميزة في الهندسة وعلوم الحاسوب.",
        highlightsEn: "Premier agricultural and life sciences powerhouse in Asia, top-ranked in biotechnology and engineering.",
        website: "https://www.upm.edu.my/",
        faculties: ["الزراعة والبيوتكنولوجي والعلوم الجزيئية", "الطب البشري والعلوم الصحية", "الهندسة والميكاترونكس", "علوم الحاسوب وتكنولوجيا المعلومات", "الطب البيطري والعلوم البحرية"],
        facultiesEn: ["Agriculture & Biotechnology", "Medicine & Health Sciences", "Engineering & Mechatronics", "Computer Science & IT", "Veterinary Medicine & Marine Sci"]
      },
      {
        name: "جامعة العلوم الماليزية (USM)",
        nameEn: "Universiti Sains Malaysia (USM)",
        city: "بينانغ",
        cityEn: "Penang",
        ranking: "Top 140 QS World",
        type: "حكومية بحثية (APEX)",
        typeEn: "Public Research (APEX Status)",
        highlights: "الجامعة الوحيدة التي نالت تصنيف APEX للتميز المتسارع، رائدة الصيدلة، الهندسة الكيميائية، والعلوم الطبية في جزيرة بينانغ.",
        highlightsEn: "Malaysia's only APEX-status university, world leader in pharmacy, chemical engineering, and medical sciences in Penang.",
        website: "https://www.usm.my/",
        faculties: ["العلوم الصيدلانية وتطوير الأدوية", "العلوم الطبية وطب الأسنان", "الهندسة الكهربائية والإلكترونية", "علوم الحاسوب والذكاء الاصطناعي", "العلوم الإدارية والاجتماعية"],
        facultiesEn: ["Pharmaceutical Sciences", "Medical Sciences & Dentistry", "Electrical & Electronic Eng.", "Computer Sciences & AI", "Management & Social Sciences"]
      },
      {
        name: "جامعة التكنولوجيا الماليزية (UTM)",
        nameEn: "Universiti Teknologi Malaysia (UTM)",
        city: "جوهور بهرو / كوالالمبور",
        cityEn: "Johor Bahru / Kuala Lumpur",
        ranking: "Top 180 QS (#1 Engineering)",
        type: "حكومية تقنية",
        typeEn: "Public Technical",
        highlights: "قلب الابتكار الهندسي والتكنولوجي في ماليزيا، رائدة الذكاء الاصطناعي، الروبوتات، وهندسة البترول والعمارة.",
        highlightsEn: "Malaysia's leading engineering and technology institution, renowned in AI, robotics, and petroleum engineering.",
        website: "https://www.utm.my/",
        faculties: ["الهندسة المدنية والميكانيكية والكيميائية", "الذكاء الاصطناعي وعلوم الحاسوب", "الهندسة الكهربائية وهندسة الاتصالات", "العمارة والبيئة المبنية", "إدارة التكنولوجيا وريادة الأعمال"],
        facultiesEn: ["Civil, Mech & Chem Engineering", "AI & Computing", "Electrical & Telecom Engineering", "Architecture & Built Environment", "Tech Management & Entrepreneurship"]
      },
      {
        name: "الجامعة الإسلامية العالمية بماليزيا (IIUM)",
        nameEn: "International Islamic University Malaysia (IIUM)",
        city: "غومباك / كوالالمبور",
        cityEn: "Gombak / Kuala Lumpur",
        ranking: "Top Islamic & Global Values",
        type: "حكومية دولية برعاية منظمة OIC",
        typeEn: "Public International (OIC-sponsored)",
        highlights: "الصرح الأحب للطلاب العرب والإسلاميين، تجمع بين العلوم الحديثة والقيم الإسلامية بتدريس كامل باللغة الإنجليزية في جميع التخصصات.",
        highlightsEn: "Premier multicultural university sponsored by OIC, blending modern sciences with values, 100% English taught.",
        website: "https://www.iium.edu.my/",
        faculties: ["كلية كولية الهندسة", "كلية الطب والعلوم الطبية الحيوية", "كلية كولية الحقوق (أحمد إبراهيم)", "كلية تكنولوجيا المعلومات والاتصال", "كلية الاقتصاد والعلوم الإدارية", "كلية الشريعة والعلوم الإسلامية"],
        facultiesEn: ["Kulliyyah of Engineering", "Kulliyyah of Medicine", "Ahmad Ibrahim Kulliyyah of Law", "Kulliyyah of ICT", "Economics & Management Sciences", "Islamic Revealed Knowledge"]
      },
      {
        name: "جامعة بتروناس التكنولوجية (UTP)",
        nameEn: "Universiti Teknologi PETRONAS (UTP)",
        city: "بيراك",
        cityEn: "Perak",
        ranking: "Top 250 QS (#1 Private Tech)",
        type: "خاصة وقفية (بتروناس)",
        typeEn: "Private Foundation (PETRONAS)",
        highlights: "مملوكة لعملاق الطاقة العالمي بتروناس، مصنفة الأولى في هندسة البترول والغاز وتوفر شراكات توظيف عالمية.",
        highlightsEn: "Owned by national energy giant PETRONAS, globally top-ranked for petroleum and chemical engineering.",
        website: "https://www.utp.edu.my/",
        faculties: ["هندسة البترول وعلوم الأرض", "الهندسة الكيميائية وتكنولوجيا النانو", "علوم وهندسة الحاسوب والبيانات", "الهندسة الكهربائية والميكانيكية", "إدارة الأعمال والتحول الرقمي"],
        facultiesEn: ["Petroleum Eng. & Geosciences", "Chemical Eng. & Nanotech", "Computer Science & Data Science", "Electrical & Mechanical Eng.", "Business & Digital Transformation"]
      },
      {
        name: "جامعة تيناجا الوطنية (UNITEN)",
        nameEn: "Universiti Tenaga Nasional (UNITEN)",
        city: "كاجانغ / سيلانغور",
        cityEn: "Kajang / Selangor",
        ranking: "Energy & Infrastructure Hub",
        type: "خاصة تابعة لشركة الكهرباء TNB",
        typeEn: "Private (TNB Energy)",
        highlights: "الجامعة المتخصصة الأولى في هندسة الطاقة الكهربائية، الطاقة المتجددة، والشبكات الذكية في جنوب شرق آسيا.",
        highlightsEn: "Specialized powerhouse in electrical energy, renewable power, and smart grid engineering.",
        website: "https://www.uniten.edu.my/",
        faculties: ["كلية الهندسة والشبكات الذكية", "كلية علوم الحاسوب وتكنولوجيا المعلومات", "كلية الاقتصاد وإدارة الأعمال للطاقة"],
        facultiesEn: ["College of Engineering & Smart Grid", "Computer Science & IT", "Energy Business & Management"]
      },
      {
        name: "جامعة تايلورز (Taylor's University)",
        nameEn: "Taylor's University",
        city: "سوبانغ جايا",
        cityEn: "Subang Jaya",
        ranking: "Top 250 QS (#1 Private SE Asia)",
        type: "خاصة دولية",
        typeEn: "Private International",
        highlights: "الجامعة الخاصة رقم 1 في جنوب شرق آسيا، مصنفة ضمن أفضل 20 عالمياً في إدارة الضيافة والسياحة والفنون والتصميم.",
        highlightsEn: "Top private university in Southeast Asia, world top 20 in hospitality, business, architecture, and design.",
        website: "https://taylors.edu.my/",
        faculties: ["إدارة الضيافة والسياحة وفنون الطهي", "إدارة الأعمال والمالية والمحاسبة", "العمارة والتصميم الداخلي", "علوم الحاسوب والذكاء الاصطناعي", "الطب البشري والعلوم الصحية"],
        facultiesEn: ["Hospitality & Culinary Arts", "Business & Finance", "Architecture & Interior Design", "Computer Science & AI", "School of Medicine & Health"]
      },
      {
        name: "جامعة صنواي (Sunway University)",
        nameEn: "Sunway University",
        city: "صنواي سيتي / سيلانغور",
        cityEn: "Sunway City / Selangor",
        ranking: "Top 400 QS (Lancaster Partner)",
        type: "خاصة غير ربحية",
        typeEn: "Private Non-Profit",
        highlights: "برامج شهادة مزدوجة مباشرة مع جامعة لانكستر البريطانية، وتفوق في الحوسبة والمالية وأبحاث الاستدامة مع جامعة هارفارد.",
        highlightsEn: "Prestigious dual-degree programs with Lancaster University UK and Harvard research center.",
        website: "https://sunwayuniversity.edu.my/",
        faculties: ["علوم وتكنولوجيا الحاسوب", "كلية صنواي لإدارة الأعمال", "العلوم الرياضية والاكتوارية", "الفنون والتواصل الرقمي", "العلوم الطبية الحيوية"],
        facultiesEn: ["School of Computer Tech", "Sunway University Business School", "Mathematical & Actuarial Sciences", "Arts & Digital Communication", "Biomedical Sciences"]
      },
      {
        name: "جامعة موناش ماليزيا (Monash Malaysia)",
        nameEn: "Monash University Malaysia",
        city: "بندر صنواي",
        cityEn: "Bandar Sunway",
        ranking: "Top 40 QS (Australian Branch)",
        type: "فرع جامعة أسترالية حكومية",
        typeEn: "Foreign Branch Campus (Go8)",
        highlights: "فرع رسمي لجامعة موناش الأسترالية (من مجموعة الثمانية الكبرى)، يمنح نفس الشهادة الأسترالية بتكلفة معيشة ماليزية.",
        highlightsEn: "Official campus of Group of Eight Australian university Monash, awarding identical Australian degrees.",
        website: "https://www.monash.edu.my/",
        faculties: ["الطب البشري والعلوم النفسية (Jeffrey Cheah)", "الهندسة والميكانيكا", "تكنولوجيا المعلومات وعلوم البيانات", "الأعمال والاقتصاد", "العلوم الصيدلانية"],
        facultiesEn: ["Jeffrey Cheah School of Medicine", "School of Engineering", "School of Information Tech", "School of Business", "School of Pharmacy"]
      },
      {
        name: "جامعة نوتنغهام ماليزيا (UNM)",
        nameEn: "University of Nottingham Malaysia",
        city: "سيمينيه / سيلانغور",
        cityEn: "Semenyih / Selangor",
        ranking: "Top 100 QS (UK Branch)",
        type: "فرع جامعة بريطانية مرموقة",
        typeEn: "Foreign Branch Campus (Russell Group)",
        highlights: "أول فرع متكامل لجامعة بريطانية (مجموعة راسل) خارج بريطانيا، يقدم نفس المناهج والشهادات البريطانية المعترف بها دولياً.",
        highlightsEn: "Premier UK Russell Group branch campus awarding prestigious University of Nottingham degrees.",
        website: "https://www.nottingham.edu.my/",
        faculties: ["الهندسة الكيميائية والكهربائية والميكانيكية", "علوم الحاسوب والذكاء الاصطناعي", "كلية نوتنغهام لإدارة الأعمال", "العلوم الطبية الحيوية والصيدلة", "العلوم البيئية والجغرافية"],
        facultiesEn: ["Faculty of Engineering", "Computer Science", "Nottingham University Business School", "Biomedical Sciences & Pharmacy", "Environmental Sciences"]
      }
    ]
  },
  {
    country: "الصين",
    countryEn: "China",
    flag: "🇨🇳",
    region: "شرق آسيا",
    regionEn: "East Asia",
    tier: "guaranteed",
    category: "arab_popular",
    scholarshipName: "منحة الحكومة الصينية (CSC) ومنح المقاطعات والبلديات النخبوية",
    scholarshipNameEn: "Chinese Government Scholarship (CSC), Belt & Road & Municipal Grants",
    applicationWindow: "ديسمبر – أبريل (سنوياً)",
    applicationWindowEn: "Dec – Apr (Annually)",
    fundingType: "ممولة بالكامل 100% براتب شهري مرتفع",
    fundingTypeEn: "Fully Funded 100% with Generous Monthly Stipend",
    coverage: ["إعفاء كامل من رسوم الدراسة 100%", "سكن جامعي فردي أو مزدوج مجاني", "راتب شهري (2,500 للبكالوريوس، 3,000 للماجستير، 3,500 يوان للدكتوراه)", "تأمين طبي شامل لجميع المستشفيات الحكومية"],
    coverageEn: ["100% Tuition Waiver", "Free Modern University Dormitory", "Monthly Stipend (2,500 Bachelor / 3,000 Master / 3,500 RMB PhD)", "Comprehensive Medical Insurance"],
    studyLanguages: ["الإنجليزية", "الصينية (ماندرين)"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "بحوث ما بعد الدكتوراه"],
    officialPortals: [
      { name: "بوابة مجلس المنح الصيني الرسمي (CSC / Campus China)", nameEn: "China Scholarship Council (CSC)", url: "https://www.campuschina.org/" },
      { name: "بوابة معلومات الدراسة في الصين (CUCAS)", nameEn: "CUCAS Study in China Portal", url: "https://www.cucas.cn/" }
    ],
    overview: "قوة الابتكار التكنولوجي والاقتصادي الأولى عالمياً؛ تقدم الصين أكثر من 50,000 منحة سنوياً مع تدريس كامل باللغة الإنجليزية في مجالات الذكاء الاصطناعي، الهندسة، الطب البشري (MBBS)، والتجارة الدولية.",
    overviewEn: "Global technological powerhouse providing 50,000+ fully funded scholarships in English across AI, engineering, medicine, and trade.",
    topUniversities: [
      {
        name: "جامعة تسينغهوا",
        nameEn: "Tsinghua University",
        city: "بكين",
        cityEn: "Beijing",
        ranking: "Top 15 QS World (#1 Asia)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "MIT الصين والجامعة المصنفة الأولى في قارة آسيا، رائدة الذكاء الاصطناعي، علوم الحاسوب، الهندسة المدنية والفضائية والفيزياء النووية.",
        highlightsEn: "Asia's #1 university, ranked world top 15, premier leader in AI, computer science, aerospace, and finance.",
        website: "https://www.tsinghua.edu.cn/en/",
        faculties: ["معهد علوم الحاسوب والذكاء الاصطناعي (Yao Class)", "الهندسة المدنية والبيئية", "كلية الاقتصاد والإدارة (SEM)", "الهندسة الميكانيكية والفضائية", "العلوم الدقيقة ومعهد النانو"],
        facultiesEn: ["Computer Science & AI (Institute for Interdisciplinary Info)", "Civil & Environmental Eng.", "School of Economics & Mgmt (SEM)", "Mechanical & Aerospace Eng.", "Nanotechnology & Exact Sciences"]
      },
      {
        name: "جامعة بكين (PKU)",
        nameEn: "Peking University (PKU)",
        city: "بكين",
        cityEn: "Beijing",
        ranking: "Top 20 QS World (C9 League)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "هارفارد الشرق وأعرق جامعة حديثة في الصين (1898)، رائدة في الطب البشري، العلوم الأساسية، القانون الدولي، وإدارة الأعمال (Guanghua).",
        highlightsEn: "China's premier liberal arts, scientific, and medical institution, home to Guanghua School of Management.",
        website: "https://english.pku.edu.cn/",
        faculties: ["مركز العلوم الصحية والطب البشري (PKUHSC)", "كلية قوانغهوا لإدارة الأعمال", "الفيزياء والرياضيات المتقدمة", "العلاقات الدولية والدراسات الدبلوماسية", "علوم وتكنولوجيا الحاسوب"],
        facultiesEn: ["Health Science Center (Medicine & Dentistry)", "Guanghua School of Management", "Physics & Mathematics", "School of International Studies", "School of Computer Science"]
      },
      {
        name: "جامعة تشجيانغ (ZJU)",
        nameEn: "Zhejiang University (ZJU)",
        city: "هانغتشو",
        cityEn: "Hangzhou",
        ranking: "Top 45 QS World (C9 League)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "معقل الابتكار في مدينة هانغتشو (مقر علي بابا)، رائدة في علوم الروبوتات، الذكاء الاصطناعي، الهندسة الكيميائية والطب السريري.",
        highlightsEn: "Major tech innovation engine in Hangzhou, world-leading in robotics, AI, chemical engineering, and clinical medicine.",
        website: "https://www.zju.edu.cn/english/",
        faculties: ["هندسة وعلوم الحاسوب والبيانات", "كلية الطب البشري والمستشفيات التابعة", "الهندسة الزراعية والبيئية", "الهندسة الكيميائية وهندسة المواد", "كلية الإدارة والأعمال الدولية"],
        facultiesEn: ["Computer Science & Big Data", "School of Medicine", "Agriculture & Environmental Sciences", "Chemical Eng. & Materials", "School of Management"]
      },
      {
        name: "جامعة شانغهاي جياو تونغ (SJTU)",
        nameEn: "Shanghai Jiao Tong University (SJTU)",
        city: "شانغهاي",
        cityEn: "Shanghai",
        ranking: "Top 50 QS World (C9 League)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "مؤسسة التصنيف الأكاديمي العالمي لجامعات العالم (ARWU)، رائدة الهندسة البحرية، هندسة السيارات، الطب، والذكاء الاصطناعي في شانغهاي.",
        highlightsEn: "Creator of the Shanghai Ranking (ARWU), engineering and biomedical powerhouse in Shanghai.",
        website: "https://en.sjtu.edu.cn/",
        faculties: ["كلية الطب البشري (معهد الطب الفرنسي)", "الهندسة البحرية وبناء السفن", "الهندسة الإلكترونية والمعلومات والذكاء الاصطناعي", "الهندسة الميكانيكية وهندسة الطاقة", "كلية أنتاي للاقتصاد والإدارة"],
        facultiesEn: ["School of Medicine", "Naval Architecture & Ocean Eng.", "Electronic, Info & AI Engineering", "Mechanical & Energy Engineering", "Antai College of Economics & Mgmt"]
      },
      {
        name: "جامعة فودان (Fudan University)",
        nameEn: "Fudan University",
        city: "شانغهاي",
        cityEn: "Shanghai",
        ranking: "Top 40 QS World (C9 League)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "إحدى قمم التعليم في الصين، مشهورة ببرنامج الطب البشري باللغة الإنجليزية (MBBS) المعتمد دولياً، والاقتصاد والعلاقات الدولية.",
        highlightsEn: "Renowned globally for English-taught MBBS medical degree, international finance, and microelectronics.",
        website: "https://www.fudan.edu.cn/en/",
        faculties: ["كلية الطب البشري الدولي (MBBS)", "كلية الإدارة وإدارة الأعمال", "الالكترونيات الدقيقة وهندسة الرقائق", "الشؤون الدولية والعلاقات العامة", "علوم الحياة والبيولوجيا الجزيئية"],
        facultiesEn: ["Shanghai Medical College (MBBS)", "School of Management", "Microelectronics & Chip Design", "International Relations & Public Affairs", "School of Life Sciences"]
      },
      {
        name: "جامعة العلوم والتكنولوجيا في الصين (USTC)",
        nameEn: "University of Science and Technology of China (USTC)",
        city: "خفي / آنهوي",
        cityEn: "Hefei / Anhui",
        ranking: "Top 60 QS (Quantum Pioneer)",
        type: "حكومية تابعة للأكاديمية الصينية للعلوم (CAS)",
        typeEn: "National Public (CAS Affiliated)",
        highlights: "معقل الفيزياء الكمومية والحوسبة الفائقة في العالم التابع للأكاديمية الصينية للعلوم، مصنفة كأقوى جامعة أبحاث متقدمة.",
        highlightsEn: "World leader in quantum physics and supercomputing, run by the Chinese Academy of Sciences (CAS).",
        website: "https://en.ustc.edu.cn/",
        faculties: ["الفيزياء الكمومية والمعلومات الكمية", "علوم وهندسة الحاسوب الفائق", "العلوم الفيزيائية والنووية", "الهندسة والتكنولوجيا النانوية", "علوم الحياة والطب الانتقالي"],
        facultiesEn: ["Quantum Physics & Quantum Info", "Computer Science & Supercomputing", "Physical & Nuclear Sciences", "Engineering & Nanotech", "Life Sciences & Medicine"]
      },
      {
        name: "جامعة نانجينغ (Nanjing University)",
        nameEn: "Nanjing University (NJU)",
        city: "نانجينغ",
        cityEn: "Nanjing",
        ranking: "Top 75 QS World (C9 League)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "صرح تاريخي عريق في العاصمة الجنوبية السابقة نانجينغ، رائدة في علوم الفضاء والفيزياء الفلكية والكيمياء والعلوم الإنسانية.",
        highlightsEn: "Prestigious C9 League university renowned in astronomy, astrophysics, chemistry, and environmental science.",
        website: "https://www.nju.edu.cn/en/",
        faculties: ["علم الفلك وعلوم الفضاء", "الفيزياء والكيمياء والمواد المتقدمة", "الهندسة وعلوم الحاسوب", "الطب البشري", "كلية إدارة الأعمال والاقتصاد"],
        facultiesEn: ["Astronomy & Space Science", "Physics & Chemistry", "Computer Science & Engineering", "Medical School", "School of Business"]
      },
      {
        name: "معهد هاربين للتكنولوجيا (HIT)",
        nameEn: "Harbin Institute of Technology (HIT)",
        city: "هاربين / شنجن / ويهاي",
        cityEn: "Harbin / Shenzhen / Weihai",
        ranking: "Top Engineering Aerospace",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "القلب النابض لبرنامج الفضاء والصواريخ والأقمار الصناعية الصيني، رائدة الروبوتات والذكاء الاصطناعي مع فرع متقدم في شنجن.",
        highlightsEn: "Flagship institution for China's aerospace, satellite, robotics, and cyber defense programs with Shenzhen campus.",
        website: "https://en.hit.edu.cn/",
        faculties: ["علوم وهندسة الطيران والفضاء", "الروبوتات والميكاترونكس والذكاء الاصطناعي", "علوم الحاسوب والأمن السيبراني", "الهندسة المعمارية والمدنية", "الهندسة الميكانيكية والكهربائية"],
        facultiesEn: ["Astronautics & Aerospace Eng.", "Robotics, Mechatronics & AI", "Computer Science & Cybersecurity", "Architecture & Civil Eng.", "Mechanical & Electrical Eng."]
      },
      {
        name: "جامعة ووهان (WHU)",
        nameEn: "Wuhan University",
        city: "ووهان",
        cityEn: "Wuhan",
        ranking: "Top 150 QS (Most Scenic Campus)",
        type: "حكومية وطنية",
        typeEn: "National Public",
        highlights: "أجمل حرم جامعي في الصين، مركز عالمي في نظم المعلومات الجغرافية والاستشعار عن بعد (GIS)، والطب البشري والقانون الدولي.",
        highlightsEn: "World #1 in Remote Sensing & GIS, renowned for picturesque campus, international law, and medical sciences.",
        website: "https://en.whu.edu.cn/",
        faculties: ["الاستشعار عن بعد ونظم المعلومات الجغرافية (GIS)", "الطب البشري والعلوم الصحية (MBBS)", "القانون الدولي والمقارن", "هندسة الموارد المائية والطاقة الكهرومائية", "علوم الحاسوب والبرمجيات"],
        facultiesEn: ["Remote Sensing & Geodesy", "School of Medicine (MBBS)", "International Law", "Water Resources & Hydro-power", "Computer Science & Software"]
      },
      {
        name: "جامعة هواتشونغ للعلوم والتكنولوجيا (HUST)",
        nameEn: "Huazhong University of Science and Technology (HUST)",
        city: "ووهان",
        cityEn: "Wuhan",
        ranking: "Top 100 QS (Tech & Medical)",
        type: "حكومية وطنية",
        typeEn: "National Public",
        highlights: "وادي البصريات والإلكترونيات الصيني، تضم كلية تونغجي الطبية التاريخية الشهيرة دولياً وبرامج الهندسة الميكانيكية الرائدة.",
        highlightsEn: "Optics Valley anchor university featuring the world-famous Tongji Medical College and advanced engineering.",
        website: "https://english.hust.edu.cn/",
        faculties: ["كلية تونغجي للطب البشري والتمريض", "الهندسة الميكانيكية والتصنيع الذكي", "الهندسة البصرية والإلكترونية", "علوم وهندسة الحاسوب", "الهندسة الكهربائية والإلكترونية"],
        facultiesEn: ["Tongji Medical College", "Mechanical Science & Smart Mfg", "Optical & Electronic Information", "Computer Science & Tech", "Electrical & Electronic Eng."]
      },
      {
        name: "جامعة سون يات سين (SYSU)",
        nameEn: "Sun Yat-sen University (SYSU)",
        city: "غوانغتشو / شنجن / تشوهاي",
        cityEn: "Guangzhou / Shenzhen / Zhuhai",
        ranking: "Top 150 QS (#1 South China)",
        type: "حكومية وطنية",
        typeEn: "National Public",
        highlights: "الجامعة الأولى في منطقة خليج غوانغدونغ-هونغ كونغ الكبرى، رائدة في الأورام والطب السريري وإدارة الأعمال والعلوم البحرية.",
        highlightsEn: "South China's premier university in the Greater Bay Area, famous for medical oncology and business school.",
        website: "https://www.sysu.edu.cn/sysuen/",
        faculties: ["الطب البشري ومستشفى الأورام التخصصي", "كلية لينغنان لإدارة الأعمال", "علوم وهندسة المحيطات", "الذكاء الاصطناعي والروبوتات (فرع شنجن)", "علوم الصيدلة والبيوتكنولوجي"],
        facultiesEn: ["Zhongshan School of Medicine", "Lingnan College (Business)", "Marine Sciences & Ocean Eng.", "Artificial Intelligence (Shenzhen)", "School of Pharmaceutical Sciences"]
      },
      {
        name: "جامعة شيان جياوتونغ (XJTU)",
        nameEn: "Xi'an Jiaotong University (XJTU)",
        city: "شيان",
        cityEn: "Xi'an",
        ranking: "Top 250 QS (C9 League)",
        type: "حكومية وطنية (C9 League)",
        typeEn: "National Public (C9 League)",
        highlights: "عاصمة طريق الحرير التاريخية ومؤسس اتحاد جامعات طريق الحرير (UASR)، رائدة هندسة الطاقة، الكهرباء، والطب البشري.",
        highlightsEn: "Silk Road academic hub and C9 League leader in energy engineering, electrical power, and medicine.",
        website: "https://en.xjtu.edu.cn/",
        faculties: ["الهندسة الكهربائية وهندسة الطاقة", "الطب البشري الدولي (MBBS)", "الهندسة الميكانيكية والروبوتات", "علوم وتكنولوجيا الحاسوب", "كلية الإدارة والاقتصاد"],
        facultiesEn: ["Electrical & Energy Engineering", "Health Science Center (MBBS)", "Mechanical Engineering", "Computer Science & Tech", "School of Management"]
      },
      {
        name: "جامعة بكين للملاحة الجوية والفضائية (Beihang / BUAA)",
        nameEn: "Beihang University (BUAA)",
        city: "بكين",
        cityEn: "Beijing",
        ranking: "#1 Aviation & Drones",
        type: "حكومية وطنية",
        typeEn: "National Public",
        highlights: "الجامعة الأولى في الصين لتصميم الطائرات المدنية، الطائرات بدون طيار (الدرونز)، الصواريخ، وبرمجيات الفضاء.",
        highlightsEn: "China's premier aeronautics, aerospace, UAV drone, and space software engineering university.",
        website: "https://ev.buaa.edu.cn/",
        faculties: ["علوم وهندسة الطيران والملاحة الجوية", "علوم الفضاء وهندسة الصواريخ", "علوم الحاسوب والذكاء الاصطناعي", "هندسة الأتمتة والكهرباء", "هندسة المواد والنانو"],
        facultiesEn: ["Aeronautics Science & Flight Tech", "Astronautics & Rocket Eng.", "Computer Science & AI", "Automation Science & Electrical", "Materials Science & Eng."]
      },
      {
        name: "جامعة تونغجي (Tongji University)",
        nameEn: "Tongji University",
        city: "شانغهاي",
        cityEn: "Shanghai",
        ranking: "Top Architecture & Civil (#1)",
        type: "حكومية وطنية (German Heritage)",
        typeEn: "National Public (German Roots)",
        highlights: "الجامعة المصنفة الأولى في آسيا للهندسة المعمارية والهندسة المدنية وتصميم السيارات، تأسست على يد أطباء ومهندسين ألمان.",
        highlightsEn: "Asia's premier architecture, civil engineering, urban planning, and automotive design institution.",
        website: "https://en.tongji.edu.cn/",
        faculties: ["الهندسة المعمارية والتخطيط الحضري", "الهندسة المدنية وهندسة الجسور", "كلية تصميم السيارات والنقل الذكي", "الطب البشري وطب الأسنان", "التصميم البيئي والفنون الرقمية"],
        facultiesEn: ["College of Architecture & Urban Planning", "Civil Engineering", "Automotive & Clean Energy Tech", "School of Medicine & Dentistry", "Design & Innovation"]
      }
    ]
  },
  {
    country: "ألمانيا",
    countryEn: "Germany",
    flag: "🇩🇪",
    region: "أوروبا الغربية",
    regionEn: "Western Europe",
    tier: "guaranteed",
    category: "arab_popular",
    scholarshipName: "منح الهيئة الألمانية للتبادل الأكاديمي (DAAD) ومنح التفوق الوطني (Deutschlandstipendium)",
    scholarshipNameEn: "DAAD Scholarships & Deutschlandstipendium Excellence Grants",
    applicationWindow: "أغسطس – نوفمبر (سنوياً لـ DAAD) / مفتوحة طوال العام للبرامج",
    applicationWindowEn: "Aug – Nov (DAAD Annual) / Year-round for university admissions",
    fundingType: "مجانية التعليم الحكومي 100% + رواتب معيشية ممولة بالكامل",
    fundingTypeEn: "Tuition-Free Public Higher Education + Fully Funded DAAD Living Grants",
    coverage: ["مجانية الرسوم الدراسية 100% في جميع الجامعات الحكومية", "راتب شهري (934€ للماجستير و1,300€ للدكتوراه من DAAD)", "تذاكر طيران دولية وتأمين صحي شامل وبدل استقرار", "دورات مكثفة لتعليم اللغة الألمانية مجاناً", "تصريح عمل قانوني للطلاب للعمل 140 يوماً كاملاً سنوياً"],
    coverageEn: ["100% Free Tuition at all public universities", "Monthly Living Stipend (€934 Masters / €1,300 PhD via DAAD)", "International Airfare & Comprehensive Health Insurance", "Funded Intensive German Language Courses", "Official Student Work Permit (140 full days/year)"],
    studyLanguages: ["الإنجليزية (مئات برامج الماجستير والبكالوريوس)", "الألمانية (B2/C1)"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "أبحاث ما بعد الدكتوراه وتدريب الأطباء الإكلينيكي"],
    officialPortals: [
      { name: "بوابة منح DAAD الرسمية (Deutscher Akademischer Austauschdienst)", nameEn: "DAAD Official Scholarship Database", url: "https://www.daad.de/en/" },
      { name: "البوابة الرسمية للدراسة في ألمانيا (Study in Germany)", nameEn: "Official Study in Germany Portal", url: "https://www.study-in-germany.de/en/" },
      { name: "البوابة المركزية للتقديم للجامعات الألمانية (Uni-Assist)", nameEn: "Uni-Assist Application Portal", url: "https://www.uni-assist.de/en/" }
    ],
    overview: "قاطرة الصناعة والتكنولوجيا والطب في أوروبا؛ تتميز بنظام التعليم العالي الحكومي المجاني بالكامل، وتضم نخبة تحالف الجامعات التقنية التسع الكبرى (TU9) وجامعات التميز النخبوي العالمية.",
    overviewEn: "Europe's leading industrial, tech, and medical powerhouse offering tuition-free world-class education at TU9 and Excellence Universities.",
    topUniversities: [
      {
        name: "جامعة ميونخ التقنية (TUM)",
        nameEn: "Technical University of Munich (TUM)",
        city: "ميونخ / غارشينغ",
        cityEn: "Munich / Garching",
        ranking: "Top 28 QS World (#1 Germany & EU)",
        type: "حكومية تقنية (TU9 / جامعة التميز)",
        typeEn: "Public Technical (TU9 / Excellence University)",
        highlights: "الجامعة المصنفة الأولى في ألمانيا والاتحاد الأوروبي، شريك رئيسي لعمالقة التكنولوجيا وBMW وسيمنز، ورائدة الذكاء الاصطناعي وهندسة الفضاء والروبوتات.",
        highlightsEn: "Germany and EU's #1 ranked university, global pioneer in AI, aerospace, robotics, and corporate partnerships with BMW & Siemens.",
        website: "https://www.tum.de/en/",
        faculties: ["كلية الحسابات والمعلومات والتكنولوجيا (CIT)", "كلية الهندسة والتصميم (الميكانيكا والفضاء والمعمار)", "كلية الطب والعلوم الصحية (Klinikum rechts der Isar)", "كلية علوم الحياة (فايهنشتيفان)", "كلية إدارة الأعمال والإدارة التكنولوجية"],
        facultiesEn: ["School of Computation, Info & Tech (CIT)", "School of Engineering & Design", "School of Medicine & Health", "School of Life Sciences", "TUM School of Management"]
      },
      {
        name: "جامعة لودفيغ ماكسيميليان ميونخ (LMU)",
        nameEn: "Ludwig Maximilian University of Munich (LMU)",
        city: "ميونخ",
        cityEn: "Munich",
        ranking: "Top 50 QS World (Excellence University)",
        type: "حكومية بحثية شاملة (جامعة التميز)",
        typeEn: "Public Research (Excellence University)",
        highlights: "صرح بحثي وطبي تاريخي عريق تأسس عام 1472، أنجب 43 حائزاً على جائزة نوبل، ويتصدر في الطب البشري، الفيزياء، والعلوم الإنسانية والقانون.",
        highlightsEn: "Historic elite institution (est. 1472) with 43 Nobel laureates, world leader in medicine, physics, and humanities.",
        website: "https://www.lmu.de/en/",
        faculties: ["كلية الطب البشري ومستشفى ميونخ الجامعي (KUM)", "كلية الفيزياء وعلم الفلك", "كلية الحقوق والقانون الدولي", "كلية إدارة الأعمال والاقتصاد (Munich SOM)", "كلية الكيمياء والصيدلة"],
        facultiesEn: ["Faculty of Medicine (KUM Hospital)", "Faculty of Physics & Astronomy", "Faculty of Law", "Munich School of Management", "Chemistry & Pharmacy"]
      },
      {
        name: "جامعة هايدلبرغ (Heidelberg University)",
        nameEn: "Heidelberg University (Ruprecht-Karls)",
        city: "هايدلبرغ",
        cityEn: "Heidelberg",
        ranking: "Top 80 QS World (#1 Medicine in Germany)",
        type: "حكومية بحثية عريقة (جامعة التميز)",
        typeEn: "Public Research (Excellence University)",
        highlights: "أقدم جامعة في ألمانيا (تأسست 1386)، الصرح الطبي والبحثي رقم 1 في ألمانيا والمركز الألماني لأبحاث السرطان (DKFZ)، تخرج منها 56 حائزاً على نوبل.",
        highlightsEn: "Germany's oldest university (1386), #1 medical school in Germany, home to German Cancer Research Center (DKFZ).",
        website: "https://www.uni-heidelberg.de/en",
        faculties: ["كلية الطب البشري (هايدلبرغ ومانهايم)", "كلية العلوم البيولوجية والبيوتكنولوجي", "كلية الفيزياء وعلم الفلك", "كلية الرياضيات وعلوم الحاسوب", "كلية الحقوق والعلوم الإنسانية"],
        facultiesEn: ["Faculty of Medicine", "Faculty of Biosciences", "Faculty of Physics & Astronomy", "Mathematics & Computer Science", "Law & Humanities"]
      },
      {
        name: "جامعة آخن التقنية (RWTH Aachen)",
        nameEn: "RWTH Aachen University",
        city: "آخن",
        cityEn: "Aachen",
        ranking: "Top Engineering TU9 (Excellence Hub)",
        type: "حكومية تقنية (TU9 / جامعة التميز)",
        typeEn: "Public Technical (TU9 / Excellence)",
        highlights: "MIT ألمانيا وأكبر جامعة تقنية في أوروبا الوسطى، رائدة الهندسة الميكانيكية، هندسة السيارات، الكهرباء، وهندسة المعادن والمواد.",
        highlightsEn: "Germany's powerhouse for mechanical, automotive, metallurgical, and electrical engineering with huge campus labs.",
        website: "https://www.rwth-aachen.de/go/id/a/?lidx=1",
        faculties: ["كلية الهندسة الميكانيكية وهندسة السيارات", "كلية الهندسة الكهربائية وتكنولوجيا المعلومات", "كلية الهندسة المدنية وهندسة الموارد", "كلية الطب البشري (مستشفى آخن الجامعي)", "كلية الرياضيات وعلوم الحاسوب والعلوم الطبيعية"],
        facultiesEn: ["Faculty of Mechanical Engineering", "Electrical Eng. & Info Tech", "Civil Engineering & Georesources", "Faculty of Medicine (University Hospital Aachen)", "Mathematics, Computer Science & Natural Sciences"]
      },
      {
        name: "معهد كارلسروه للتكنولوجيا (KIT)",
        nameEn: "Karlsruhe Institute of Technology (KIT)",
        city: "كارلسروه",
        cityEn: "Karlsruhe",
        ranking: "Top 100 QS (#1 Computer Science in Germany)",
        type: "معهد وطني وجامعة التميز (Helmholtz & TU9)",
        typeEn: "National Research University (Helmholtz & TU9)",
        highlights: "الجامعة الوطنية الأولى لأبحاث الطاقة وعلوم الحاسوب، أُرسل منها أول بريد إلكتروني في ألمانيا وتضم مركز هلمهولتز للأبحاث النووية والطاقة.",
        highlightsEn: "The Research University in the Helmholtz Association, birth place of German internet and leading in computing and energy.",
        website: "https://www.kit.edu/english/",
        faculties: ["كلية المعلوماتية وعلوم الحاسوب والأمن السيبراني", "كلية الهندسة الميكانيكية", "كلية الهندسة الكهربائية وتكنولوجيا المعلومات", "كلية الهندسة الكيميائية وهندسة العمليات", "كلية الاقتصاد وهندسة الأعمال"],
        facultiesEn: ["Informatics (Computer Science & Cyber)", "Mechanical Engineering", "Electrical Engineering & IT", "Chemical & Process Engineering", "Economics & Management"]
      },
      {
        name: "مجمع شاريتيه الطبي وجامعة برلين الحرة وهومبولت (Charité Berlin)",
        nameEn: "Charité – Universitätsmedizin Berlin",
        city: "برلين",
        cityEn: "Berlin",
        ranking: "Top 5 Hospitals Worldwide (#1 EU Medicine)",
        type: "مجمع طبي جامعي حكومي مشترك",
        typeEn: "Joint Medical Faculty of FU & HU Berlin",
        highlights: "أكبر مستشفى جامعي وكلية طب في أوروبا، تخرج منها أكثر من نصف حائزي جائزة نوبل في الطب بألمانيا مثل روبرت كوخ وإميل فون بهرنغ.",
        highlightsEn: "One of Europe's largest university hospitals and medical faculties, associated with over half of German Nobel Prize medicine winners.",
        website: "https://www.charite.de/en/",
        faculties: ["كلية الطب البشري العام والعلوم السريرية", "كلية طب وجراحة الفم والأسنان", "كلية العلوم الطبية الحيوية والجينات", "معهد أبحاث الفيروسات والمناعة العالمية (Drosten Lab)", "كلية التمريض والعلوم الصحية التطبيقية"],
        facultiesEn: ["General Medicine & Clinical Sciences", "Dentistry & Oral Surgery", "Biomedical & Genomic Sciences", "Virology & Global Immunology", "Health & Nursing Sciences"]
      },
      {
        name: "جامعة برلين التقنية (TU Berlin)",
        nameEn: "Technical University of Berlin (TU Berlin)",
        city: "برلين",
        cityEn: "Berlin",
        ranking: "Top 150 QS (TU9 / Capital Innovation)",
        type: "حكومية تقنية (TU9)",
        typeEn: "Public Technical (TU9)",
        highlights: "القلب التكنولوجي للعاصمة الألمانية برلين، رائدة في الذكاء الاصطناعي، التخطيط الحضري، وهندسة النقل والاستدامة.",
        highlightsEn: "Leading technical university in Berlin, famous for AI, urban planning, green energy, and transportation engineering.",
        website: "https://www.tu.berlin/en/",
        faculties: ["كلية الهندسة الكهربائية وعلوم الحاسوب", "كلية الهندسة الميكانيكية وهندسة النظم", "كلية التخطيط والبناء والبيئة", "كلية الرياضيات والعلوم الطبيعية", "كلية الاقتصاد والإدارة"],
        facultiesEn: ["Electrical Engineering & Computer Science", "Mechanical Eng. & Transport Systems", "Planning, Building & Environment", "Mathematics & Natural Sciences", "Economics & Management"]
      },
      {
        name: "جامعة شتوتغارت (University of Stuttgart)",
        nameEn: "University of Stuttgart",
        city: "شتوتغارت",
        cityEn: "Stuttgart",
        ranking: "Top Automotive & Aerospace (TU9)",
        type: "حكومية تقنية (TU9)",
        typeEn: "Public Technical (TU9)",
        highlights: "عاصمة صناعة السيارات الألمانية (مقر مرسيدس-بنز، بورش، وبوش)، الجامعة رقم 1 في هندسة السيارات والتحكم الذاتي وهندسة الطيران.",
        highlightsEn: "Located in the heart of Germany's automotive capital (Mercedes, Porsche, Bosch), leading in automotive and aerospace.",
        website: "https://www.uni-stuttgart.de/en/",
        faculties: ["كلية هندسة الفضاء والسيارات وهندسة الإنتاج", "كلية علوم الحاسوب والكهرباء وتكنولوجيا المعلومات", "كلية الهندسة المدنية والبيئية", "كلية العمارة والتخطيط المدني", "كلية الكيمياء والمواد المتقدمة"],
        facultiesEn: ["Aerospace, Automotive & Production Eng.", "Computer Science & Electrical Eng.", "Civil & Environmental Engineering", "Architecture & Urban Planning", "Chemistry & Advanced Materials"]
      },
      {
        name: "جامعة دريسدن التقنية (TU Dresden)",
        nameEn: "TU Dresden (Technical University of Dresden)",
        city: "دريسدن",
        cityEn: "Dresden",
        ranking: "Top Excellence TU9 (Silicon Saxony)",
        type: "حكومية تقنية (TU9 / جامعة التميز)",
        typeEn: "Public Technical (TU9 / Excellence)",
        highlights: "قلب وادي السيليكون الأوروبي (Silicon Saxony)، رائدة أشباه الموصلات، شبكات الجيل الخامس والسادس 5G/6G، والطب التجديدي.",
        highlightsEn: "Anchor of 'Silicon Saxony' microelectronics cluster, world leader in 5G/6G wireless tech, semiconductors, and regenerative medicine.",
        website: "https://tu-dresden.de/?set_language=en",
        faculties: ["كلية علوم الحاسوب وتكنولوجيا الاتصالات اللاسلكية", "كلية الهندسة الميكانيكية وهندسة المواد", "كلية الهندسة الكهربائية وتكنولوجيا المعلومات", "كلية الطب البشري (كارل غوستاف كاروس)", "كلية العلوم الطبيعية والرياضيات"],
        facultiesEn: ["Computer Science & Wireless Communications", "Mechanical & Materials Engineering", "Electrical Engineering & IT", "Faculty of Medicine (Carl Gustav Carus)", "Natural Sciences & Mathematics"]
      },
      {
        name: "جامعة فرايبورغ (University of Freiburg)",
        nameEn: "University of Freiburg (Albert-Ludwigs)",
        city: "فرايبورغ",
        cityEn: "Freiburg im Breisgau",
        ranking: "Top 180 QS (Excellence University)",
        type: "حكومية بحثية عريقة",
        typeEn: "Public Research (Historic)",
        highlights: "تأسست عام 1457، رائدة في أبحاث البيولوجيا الجزيئية، الطب البشري، الطاقة الشمسية وهندسة النظم الدقيقة (IMTEK).",
        highlightsEn: "Founded in 1457, renowned for molecular biology, medical faculty, microsystems engineering (IMTEK), and solar energy.",
        website: "https://uni-freiburg.de/en/",
        faculties: ["كلية الطب البشري والمركز الطبي الجامعي", "كلية هندسة النظم الدقيقة وتكنولوجيا النانو (IMTEK)", "كلية البيولوجيا والعلوم الحيوية", "كلية البيئة والموارد الطبيعية", "كلية الحقوق والعلوم الاقتصادية"],
        facultiesEn: ["Faculty of Medicine & Medical Center", "Microsystems Engineering (IMTEK)", "Biology & Life Sciences", "Environment & Natural Resources", "Faculty of Law & Economics"]
      },
      {
        name: "جامعة توبنغن (University of Tübingen)",
        nameEn: "University of Tübingen (Eberhard Karls)",
        city: "توبنغن",
        cityEn: "Tübingen",
        ranking: "Top AI & Cyber Valley (Excellence)",
        type: "حكومية بحثية (جامعة التميز)",
        typeEn: "Public Research (Excellence University)",
        highlights: "مقر وادي السايبر الأوروبي (Cyber Valley) مع ماكس بلانك، الرائدة في أبحاث التعلم العميق والذكاء الاصطناعي والعلوم العصبية والطب.",
        highlightsEn: "Home of Europe's Cyber Valley AI hub and Max Planck Institutes, global leader in machine learning, neuroscience, and medicine.",
        website: "https://uni-tuebingen.de/en/",
        faculties: ["كلية الطب البشري وعلوم الأعصاب", "كلية العلوم والذكاء الاصطناعي (Cyber Valley)", "كلية الاقتصاد والعلوم الاجتماعية", "كلية الحقوق والقانون الدولي", "كلية الفلسفة والعلوم الإنسانية"],
        facultiesEn: ["Faculty of Medicine & Neuroscience", "Science & Artificial Intelligence", "Economics & Social Sciences", "Faculty of Law", "Humanities & Philosophy"]
      },
      {
        name: "جامعة بون (University of Bonn)",
        nameEn: "University of Bonn (Rheinische Friedrich-Wilhelms)",
        city: "بون",
        cityEn: "Bonn",
        ranking: "Top 90 QS (#1 Mathematics in Germany)",
        type: "حكومية بحثية (جامعة التميز)",
        typeEn: "Public Research (Excellence University)",
        highlights: "الجامعة الحاصلة على 6 مجموعات تميز نخبوي (الأعلى في ألمانيا)، المصنفة الأولى في الرياضيات النظرية وحائزة على ميدالية فيلدز ونوبل في الاقتصاد.",
        highlightsEn: "Winner of 6 Excellence Clusters, Germany's undisputed #1 in mathematics (Fields Medalists) and Nobel economics.",
        website: "https://www.uni-bonn.de/en",
        faculties: ["كلية الرياضيات والعلوم الطبيعية (مركز هاوسدورف للرياضيات)", "كلية الطب البشري والعلوم المناعية", "كلية الاقتصاد والعلوم القانونية", "كلية الزراعة وعلوم التغذية", "كلية الفلسفة والآداب"],
        facultiesEn: ["Mathematics & Natural Sciences (Hausdorff Center)", "Faculty of Medicine & ImmunoSensation", "Economics & Law", "Agriculture & Food Sciences", "Philosophy & Arts"]
      },
      {
        name: "جامعة دارمشتات التقنية (TU Darmstadt)",
        nameEn: "TU Darmstadt (Technical University of Darmstadt)",
        city: "دارمشتات",
        cityEn: "Darmstadt",
        ranking: "Top Cybersecurity & AI (TU9)",
        type: "حكومية تقنية (TU9)",
        typeEn: "Public Technical (TU9)",
        highlights: "مدينة العلوم دارمشتات، تضم أكبر مركز وطني لأبحاث الأمن السيبراني في أوروبا (ATHENE) وتفوق عالمي في الذكاء الاصطناعي وهندسة الكهرباء.",
        highlightsEn: "City of Science hub hosting Europe's largest cybersecurity research center (ATHENE) and premier AI institutes.",
        website: "https://www.tu-darmstadt.de/index.en.jsp",
        faculties: ["كلية علوم الحاسوب والأمن السيبراني (ATHENE)", "كلية الهندسة الكهربائية وتكنولوجيا المعلومات", "كلية الهندسة الميكانيكية", "كلية الهندسة المدنية والبيئية", "كلية علم المواد والفيزياء التطبيقية"],
        facultiesEn: ["Computer Science & Cybersecurity (ATHENE)", "Electrical Engineering & IT", "Mechanical Engineering", "Civil & Environmental Engineering", "Materials Science & Physics"]
      },
      {
        name: "جامعة إرلنغن نورنبرغ (FAU)",
        nameEn: "FAU Erlangen-Nürnberg",
        city: "إرلنغن / نورنبرغ",
        cityEn: "Erlangen / Nuremberg",
        ranking: "Top Innovation & Medical Tech",
        type: "حكومية بحثية ابتكارية",
        typeEn: "Public Research & Innovation",
        highlights: "الجامعة الأكثر ابتكاراً في ألمانيا (مقر شركة سيمنز هيلثينيرز ومعهد فراونهوفر مخترع MP3)، ورائدة الهندسة الطبية الحيوية والذكاء الاصطناعي.",
        highlightsEn: "Germany's most innovative university, home to Siemens Healthineers HQ and Fraunhofer MP3 inventor, leader in medical engineering.",
        website: "https://www.fau.eu/",
        faculties: ["كلية الهندسة والهندسة الطبية الحيوية", "كلية الطب البشري والمستشفى الجامعي", "كلية العلوم الطبيعية والفيزياء", "كلية إدارة الأعمال والاقتصاد (نورنبرغ)", "كلية العلوم الإنسانية واللاهوت"],
        facultiesEn: ["Faculty of Engineering (Biomedical Tech)", "Faculty of Medicine", "Faculty of Sciences", "School of Business & Economics", "Humanities & Social Sciences"]
      }
    ]
  },
  {
    country: "المجر (هنغاريا)",
    countryEn: "Hungary",
    flag: "🇭🇺",
    region: "الاتحاد الأوروبي",
    regionEn: "European Union",
    tier: "guaranteed",
    category: "arab_popular",
    scholarshipName: "منحة الحكومة المجرية (Stipendium Hungaricum) ومنحة الشتات المجري (Diaspora)",
    scholarshipNameEn: "Stipendium Hungaricum Scholarship & Hungarian Diaspora Grants",
    applicationWindow: "نوفمبر – 15 يناير (سنوياً)",
    applicationWindowEn: "Nov – Jan 15 (Annually)",
    fundingType: "ممولة بالكامل 100% داخل دول الاتحاد الأوروبي",
    fundingTypeEn: "Fully Funded 100% within the European Union (Schengen)",
    coverage: ["إعفاء كامل من الرسوم الدراسية 100% لجميع الدرجات والتخصصات", "راتب شهري للمعيشة طوال فترة الدراسة", "سكن جامعي مجاني حديث أو بدل سكن شهري نقدي", "تأمين صحي أوروبي شامل يغطي المستشفيات الحكومية والخاصة", "شهادة جامعية أوروبية معتمدة ومعترف بها في كافة دول الاتحاد الأوروبي والعالم العربي"],
    coverageEn: ["100% Tuition Exemption for all degrees including Medicine", "Monthly Living Allowance throughout studies", "Free Modern University Dormitory or Monthly Accommodation Contribution", "Full Health Insurance valid across EU", "EU-Accredited Degree recognized across Europe & worldwide"],
    studyLanguages: ["الإنجليزية 100% (لجميع البرامج والدرجات)", "المجرية"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "الطب البشري وطب الأسنان والصيدلة (برامج Master مدمجة من السنة الأولى)"],
    officialPortals: [
      { name: "البوابة الرسمية لمنحة Stipendium Hungaricum", nameEn: "Stipendium Hungaricum Official Application Portal", url: "https://stipendiumhungaricum.hu/" },
      { name: "مؤسسة تمبوس العامة المجرية (Tempus Public Foundation)", nameEn: "Tempus Public Foundation (TPF)", url: "https://tka.hu/english" },
      { name: "بوابة الدراسة الرسمية في المجر (Study in Hungary)", nameEn: "Study in Hungary Portal", url: "https://studyinhungary.hu/" }
    ],
    overview: "الوجهة الأوروبية الأقوى والأكثر شعبية وموثوقية للطلاب العرب؛ تقدم منحة حكومية ممولة بالكامل تشمل دراسة الطب البشري، طب الأسنان، الصيدلة، والهندسة باللغة الإنجليزية بدون رسوم دراسية مع سكن وراتب وتأمين.",
    overviewEn: "Europe's most popular full scholarship hub for international students, fully covering general medicine, dentistry, pharmacy, and engineering in English.",
    topUniversities: [
      {
        name: "جامعة سيملفيس الطبية (Semmelweis University)",
        nameEn: "Semmelweis University",
        city: "بودابست",
        cityEn: "Budapest",
        ranking: "Top 200 Times Higher (#1 Medicine in Central Europe)",
        type: "حكومية طبية متخصصة",
        typeEn: "Specialized Medical University",
        highlights: "أعرق وأقوى صرح طبي في وسط وشرق أوروبا تأسس عام 1769، مهد الطبيب إيغناتس سيملفيس، وتضم أكبر مركز تدريب إكلينيكي للطب البشري وطب الأسنان والصيدلة باللغة الإنجليزية.",
        highlightsEn: "Founded in 1769, Central Europe's top-ranked medical university, globally renowned for English-medium General Medicine, Dentistry, and Pharmacy.",
        website: "https://semmelweis.hu/english/",
        faculties: ["كلية الطب البشري العام (MD)", "كلية طب وجراحة الفم والأسنان (DMD)", "كلية العلوم الصيدلانية وتطوير الأدوية (PharmD)", "كلية العلوم الصحية والعلاج الطبيعي", "كلية دراسات الدكتوراه والعلوم الطبية الحيوية"],
        facultiesEn: ["Faculty of General Medicine (MD)", "Faculty of Dentistry (DMD)", "Faculty of Pharmaceutical Sciences (PharmD)", "Faculty of Health Sciences", "School of Ph.D. Studies"]
      },
      {
        name: "جامعة دبرتسن (University of Debrecen)",
        nameEn: "University of Debrecen (DE)",
        city: "دبرتسن",
        cityEn: "Debrecen",
        ranking: "Top 600 QS (#1 Comprehensive in Hungary)",
        type: "حكومية بحثية شاملة",
        typeEn: "Public Comprehensive Research",
        highlights: "الجامعة الأكبر والأكثر جذباً للطلاب الدوليين والعرب في المجر، تتميز بحرم جامعي أمريكي متكامل ومستشفيات تدريبية متقدمة وتدريس إنجليزي لجميع كليات الطب والهندسة والعلوم.",
        highlightsEn: "Hungary's largest and most international university, renowned for premier medical school, engineering, IT, and aviation programs in English.",
        website: "https://unideb.hu/en",
        faculties: ["كلية الطب البشري (معتمدة دولياً من WHO وWFME)", "كلية طب الأسنان", "كلية الصيدلة والعلوم الصيدلانية", "كلية الهندسة الميكانيكية والمدنية والميكاترونكس", "كلية المعلوماتية وعلوم الحاسوب", "كلية الطيران المدني وتدريب الطيارين (Professional Pilot)"],
        facultiesEn: ["Faculty of Medicine (WHO/WFME accredited)", "Faculty of Dentistry", "Faculty of Pharmacy", "Faculty of Engineering", "Faculty of Informatics", "Professional Pilot & Aviation"]
      },
      {
        name: "جامعة أوتفوش لوراند (ELTE)",
        nameEn: "Eötvös Loránd University (ELTE)",
        city: "بودابست",
        cityEn: "Budapest",
        ranking: "Top 500 QS (Hungary's #1 University in Budapest)",
        type: "حكومية وطنية عريقة",
        typeEn: "National Public Comprehensive",
        highlights: "أعرق وأكبر جامعات العاصمة بودابست تأسست عام 1635، تخرج منها 5 من حائزي جائزة نوبل، وتتصدر في علوم الحاسوب، الذكاء الاصطناعي، العلوم الطبيعية والقانون الدولي.",
        highlightsEn: "Founded in 1635, Hungary's leading comprehensive institution with 5 Nobel laureates, premier leader in Computer Science, Data Science, and Law.",
        website: "https://www.elte.hu/en/",
        faculties: ["كلية المعلوماتية وهندسة الحاسوب والذكاء الاصطناعي", "كلية العلوم الطبيعية والفيزياء والكيمياء", "كلية الحقوق والعلوم السياسية", "كلية العلوم الإنسانية واللغات الأجنبية", "كلية علم النفس والتربية البدنية"],
        facultiesEn: ["Faculty of Informatics (Computer Science & AI)", "Faculty of Science", "Faculty of Law & Political Science", "Faculty of Humanities", "Faculty of Education & Psychology"]
      },
      {
        name: "جامعة بودابست للتكنولوجيا والاقتصاد (BME)",
        nameEn: "Budapest University of Technology and Economics (BME)",
        city: "بودابست",
        cityEn: "Budapest",
        ranking: "Top Engineering Central Europe (#1 Tech)",
        type: "حكومية تقنية تاريخية",
        typeEn: "Public Technical (Founded 1782)",
        highlights: "أول معهد تقني جامعي في العالم يمنح درجات الهندسة (تأسس 1782)، أنجب 4 حائزين على جائزة نوبل ومخترعي الهولوغرام وبطاريات الطاقة، ورائدة الهندسة والمعمار.",
        highlightsEn: "World's oldest institute of technology (est. 1782) with 4 Nobel laureates, legendary for architecture, civil, electrical, and aerospace engineering.",
        website: "https://www.bme.hu/?language=en",
        faculties: ["كلية الهندسة المدنية وهندسة النظم الإنشائية", "كلية الهندسة الميكانيكية وتكنولوجيا الميكاترونكس", "كلية الهندسة المعمارية والتصميم الحضري", "كلية الهندسة الكيميائية والتكنولوجيا الحيوية", "كلية الهندسة الكهربائية والمعلوماتية والذكاء الاصطناعي", "كلية هندسة النقل وهندسة المركبات الذكية"],
        facultiesEn: ["Faculty of Civil Engineering", "Faculty of Mechanical Engineering", "Faculty of Architecture", "Faculty of Chemical Tech & Biotech", "Electrical Engineering & Informatics", "Transportation & Vehicle Engineering"]
      },
      {
        name: "جامعة سيغيد (University of Szeged - SZTE)",
        nameEn: "University of Szeged (SZTE)",
        city: "سيغيد",
        cityEn: "Szeged",
        ranking: "Top 600 QS (Nobel Prize Alma Mater)",
        type: "حكومية بحثية رائدة",
        typeEn: "Public Research Powerhouse",
        highlights: "مهد فيتامين C وموطن حائز نوبل ألبرت سانت جيورجي وكاتالين كاريكو (مخترعة لقاح mRNA لكوفيد)، تضم مجمع أبحاث الليزر الأوروبي ELI-ALPS وتفوق طبي عالمي.",
        highlightsEn: "Home of Nobelists Albert Szent-Györgyi and Katalin Karikó (mRNA pioneer), hosting the ELI-ALPS Laser Research Center.",
        website: "https://u-szeged.hu/english",
        faculties: ["كلية ألبرت سانت جيورجي للطب البشري (Albert Szent-Györgyi Medical School)", "كلية طب الأسنان", "كلية الصيدلة", "كلية العلوم والمعلوماتية", "كلية الاقتصاد وإدارة الأعمال", "كلية الهندسة والبيئة"],
        facultiesEn: ["Albert Szent-Györgyi Medical School", "Faculty of Dentistry", "Faculty of Pharmacy", "Faculty of Science & Informatics", "Economics & Business Admin", "Faculty of Engineering"]
      },
      {
        name: "جامعة بيتش (University of Pécs - PTE)",
        nameEn: "University of Pécs (PTE)",
        city: "بيتش",
        cityEn: "Pécs",
        ranking: "Oldest University in Hungary (Est. 1367)",
        type: "حكومية تاريخية شاملة",
        typeEn: "Historic Public University (1367)",
        highlights: "أقدم جامعة في المجر (تأسست 1367)، بدأت برامج التدريس الطبي الدولي باللغة الإنجليزية لأكثر من 30 عاماً، وتضم مستشفى جامعياً حديثاً وكليات هندسة وفنون عريقة.",
        highlightsEn: "Hungary's oldest university (1367), pioneer of international English-medium medical education with modern clinical centers.",
        website: "https://international.pte.hu/",
        faculties: ["كلية الطب البشري الدولي (PTE Medical School)", "كلية الصيدلة والعلوم الصحية", "كلية الهندسة وتكنولوجيا المعلومات (Pollack Mihály)", "كلية إدارة الأعمال والاقتصاد", "كلية العلوم والموسيقى والفنون البصرية"],
        facultiesEn: ["Medical School (General Medicine & Dentistry)", "Faculty of Pharmacy & Health Sciences", "Faculty of Engineering & IT", "Business & Economics", "Science & Visual Arts"]
      },
      {
        name: "جامعة كورفينوس بودابست (Corvinus University of Budapest)",
        nameEn: "Corvinus University of Budapest",
        city: "بودابست",
        cityEn: "Budapest",
        ranking: "Top Business & Economics in Hungary (AACSB/EQUIS)",
        type: "جامعة وقفية نخبوية لإدارة الأعمال",
        typeEn: "Elite Business & Social Sciences University",
        highlights: "الجامعة النخبوية الأولى في المجر ووسط أوروبا لإدارة الأعمال والمالية والعلاقات الدولية، حاصلة على أرقى الاعتمادات الدولية (AACSB وAMBA).",
        highlightsEn: "Hungary's premier business and economics school, accredited by AACSB and AMBA, training top economists and corporate executives.",
        website: "https://www.uni-corvinus.hu/?lang=en",
        faculties: ["معهد إدارة الأعمال والتمويل الدولي", "معهد الاقتصاد والسياسات العامة", "معهد العلاقات الدولية والعلوم السياسية", "معهد الاتصال والتحول الرقمي"],
        facultiesEn: ["Institute of Business & Finance", "Institute of Economics & Public Policy", "International Relations & Political Studies", "Communication & Digital Media"]
      },
      {
        name: "جامعة أوبودا (Óbuda University)",
        nameEn: "Óbuda University",
        city: "بودابست",
        cityEn: "Budapest",
        ranking: "Top Tech & Robotics in Hungary",
        type: "حكومية للعلوم التطبيقية والتقنية",
        typeEn: "Public Applied Sciences & Tech",
        highlights: "الصرح التقني الأكثر ابتكاراً في الروبوتات الطبية، الأمن السيبراني، الذكاء الاصطناعي، وهندسة الميكاترونكس في العاصمة بودابست.",
        highlightsEn: "Hungary's premier university of applied technical sciences, famous for medical robotics, cybersecurity, and smart manufacturing.",
        website: "https://uni-obuda.hu/en/",
        faculties: ["كلية جون فون نيومان للمعلوماتية والذكاء الاصطناعي", "كلية دونات بانكي للهندسة الميكانيكية وهندسة السيارات", "كلية كاندو كالمان للهندسة الكهربائية", "كلية كليتي كارولي للاقتصاد والأعمال", "كلية ريجلي إركي للهندسة البيئية والتصميم"],
        facultiesEn: ["John von Neumann Faculty of Informatics", "Donát Bánki Faculty of Mechanical & Safety Eng.", "Kálmán Kandó Faculty of Electrical Eng.", "Keleti Károly Faculty of Business", "Rejtő Sándor Faculty of Light Industry & Env. Eng."]
      },
      {
        name: "الجامعة المجرية للزراعة وعلوم الحياة (MATE)",
        nameEn: "Hungarian University of Agriculture and Life Sciences (MATE)",
        city: "غودولو / بودابست",
        cityEn: "Gödöllő / Budapest",
        ranking: "Top Agricultural & Biotech EU",
        type: "حكومية للعلوم الحيوية والزراعية",
        typeEn: "Public Life Sciences & AgTech",
        highlights: "إحدى كبرى جامعات العلوم الزراعية والبيوتكنولوجي والهندسة البيئية في وسط أوروبا، تقع في قصر غودولو الملكي التاريخي.",
        highlightsEn: "One of Central Europe's largest agricultural, food science, and biotechnology institutions with expansive research estates.",
        website: "https://uni-mate.hu/en",
        faculties: ["معهد العلوم الزراعية والإنتاج النباتي", "معهد التكنولوجيا الحيوية وعلم الوراثة", "معهد علوم وتكنولوجيا الأغذية", "معهد الهندسة الزراعية والبيئية", "معهد حماية البيئة وإدارة الموارد الطبيعية"],
        facultiesEn: ["Institute of Agricultural Sciences", "Biotechnology & Genetics", "Food Science & Technology", "Environmental & Rural Development Eng.", "Nature Conservation & Water Management"]
      },
      {
        name: "جامعة ميشكولتس (University of Miskolc)",
        nameEn: "University of Miskolc (ME)",
        city: "ميشكولتس",
        cityEn: "Miskolc",
        ranking: "Historic Mining & Materials Powerhouse",
        type: "حكومية بحثية شاملة",
        typeEn: "Public Research & Heavy Engineering",
        highlights: "تأسست عام 1735 كأكاديمية تعدين إمبراطورية، رائدة هندسة المواد، هندسة الطاقة والتعدين، الهندسة الميكانيكية وعلوم الحاسوب في المجر.",
        highlightsEn: "Established in 1735, historic powerhouse in materials science, mechanical engineering, raw materials, and earth science.",
        website: "https://www.uni-miskolc.hu/en",
        faculties: ["كلية علوم الأرض وهندسة البيئة والموارد", "كلية علوم وهندسة المواد والتصنيع النانوي", "كلية الهندسة الميكانيكية والمعلوماتية", "كلية الحقوق والعلوم السياسية", "كلية الاقتصاد والعلوم الصحية"],
        facultiesEn: ["Faculty of Earth & Environmental Science", "Materials & Chemical Engineering", "Mechanical Engineering & Informatics", "Faculty of Law", "Economics & Health Sciences"]
      }
    ]
  },

  // ==========================================
  // 2. منح الاتحاد الأوروبي والتمويل الكامل (EU & Full-Funding Grants)
  // ==========================================
  {
    country: "الاتحاد الأوروبي (إيراسموس)",
    countryEn: "European Union (Erasmus+)",
    flag: "🇪🇺",
    region: "الاتحاد الأوروبي المشترك",
    regionEn: "Pan-European / EU Consortiums",
    tier: "guaranteed",
    category: "eu_grants",
    scholarshipName: "منح إيراسموس موندوس للماجستير المشترك (Erasmus Mundus Joint Masters - EMJM)",
    scholarshipNameEn: "Erasmus Mundus Joint Masters (EMJM) Fully Funded Scholarships",
    applicationWindow: "أكتوبر – منتصف فبراير (سنوياً لبرامج الدليل)",
    applicationWindowEn: "Oct – Mid Feb (Annually via EMJM Catalogue)",
    fundingType: "ممولة بالكامل 100% براتب 1,400 يورو شهرياً + تذاكر وسفر",
    fundingTypeEn: "Fully Funded 100% + €1,400/Month Tax-Free Living Allowance",
    coverage: [
      "إعفاء كامل 100% من جميع الرسوم الدراسية والتسجيل في كافة الجامعات الشريكة",
      "راتب شهري معيشي معفى من الضرائب بقيمة 1,400 يورو شهرياً طوال 24 شهراً (ما مجموعه 33,600 يورو)",
      "تغطية كاملة لتكاليف السفر الدولي وتذاكر الطيران وبدلات الانتقال بين الدول الأوروبية",
      "تأمين صحي أوروبي شامل يغطي جميع دول الاتحاد الأوروبي وفترة التنقل",
      "الحصول على شهادة ماجستير مزدوجة أو متعددة (Dual/Multiple/Joint Degree) معتمدة من 2 إلى 4 جامعات أوروبية كبرى"
    ],
    coverageEn: [
      "100% Full Tuition & Registration Exemption at all partner universities",
      "Monthly Tax-Free Living Allowance of €1,400/month for up to 24 months (€33,600 total)",
      "Full Coverage for international travel, flights, and inter-EU mobility allowances",
      "Comprehensive Worldwide Health & Travel Insurance throughout mobility",
      "Accredited Joint, Double, or Multiple European Master Degrees from 2 to 4 top EU institutions"
    ],
    studyLanguages: ["الإنجليزية 100% (لجميع البرامج والكونسورتيومات)"],
    degreeLevels: ["ماجستير أوروبي مشترك (Joint Master Degrees - 120 ECTS)", "برامج دكتوراه وتدريب بحثي أوروبي"],
    officialPortals: [
      { name: "دليل برامج إيراسموس موندوس الرسمي (EMJM Catalogue)", nameEn: "Official Erasmus Mundus Catalogue (EACEA)", url: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en" },
      { name: "بوابة المفوضية الأوروبية لبرنامج إيراسموس بلس", nameEn: "European Commission Erasmus+ Portal", url: "https://erasmus-plus.ec.europa.eu/" },
      { name: "رابطة طلاب وخريجي إيراسموس موندوس (EMA)", nameEn: "Erasmus Mundus Association (EMA)", url: "https://www.em-a.eu/" }
    ],
    overview: "أرقى وأقوى منحة ماجستير مشترك في العالم تمولها المفوضية الأوروبية بالكامل؛ تتيح للباحث الدراسة في 2 إلى 4 دول أوروبية مختلفة خلال نفس الماجستير، مع راتب شهري 1,400 يورو وتأمين وتذاكر، والحصول على شهادات مزدوجة ومشتركة معتمدة عالمياً.",
    overviewEn: "The world's most prestigious European joint master scholarship funded by the European Commission. Study across 2 to 4 European countries with €1,400 monthly allowance, full tuition waiver, and dual/joint European degrees.",
    topUniversities: [
      {
        name: "تحالف برامج الحوسبة والبيانات الضخمة (BDMA & Big Data Consortium)",
        nameEn: "Big Data Management & Analytics Consortium (BDMA / DMIN)",
        city: "بروكسل / برشلونة / برلين / باريس",
        cityEn: "Brussels / Barcelona / Berlin / Paris",
        ranking: "Top EU Tech Excellence Consortia",
        type: "كونسورتيوم ماجستير أوروبي مشترك",
        typeEn: "Joint European University Consortium",
        highlights: "تحالف يجمع جامعة بروكسل الحرة (ULB)، وجامعة كاتالونيا التقنية (UPC)، وجامعة برلين التقنية (TU Berlin)، والجامعة المركزية بباريس في علوم البيانات والذكاء الاصطناعي.",
        highlightsEn: "Premier consortium uniting ULB Brussels, UPC Barcelona, and TU Berlin for advanced Big Data and Artificial Intelligence master degrees.",
        website: "https://bdma.ulb.ac.be/",
        faculties: ["علوم البيانات والحوسبة السحابية الموزعة", "الذكاء الاصطناعي والتعلم الآلي المتقدم", "تحليل البيانات الضخمة ونظم ذكاء الأعمال", "أمن المعلومات وخصوصية البيانات الأوروبية (GDPR)"],
        facultiesEn: ["Data Science & Distributed Cloud Computing", "Artificial Intelligence & Advanced Machine Learning", "Big Data Analytics & Business Intelligence", "Information Security & Data Privacy"]
      },
      {
        name: "تحالف علوم النانو والمواد المتقدمة (FAME+ & NANOMED)",
        nameEn: "Functional Advanced Materials & Nanomedicine Consortiums",
        city: "غرونوبل / لوفان / أوغسبورغ / بوردو",
        cityEn: "Grenoble / Leuven / Augsburg / Bordeaux",
        ranking: "Top Materials Science Europe",
        type: "كونسورتيوم ماجستير أوروبي مشترك",
        typeEn: "Joint European University Consortium",
        highlights: "تحالف تقوده معاهد غرونوبل التقنية (INP)، وجامعة لوفان الكاثوليكية (KU Leuven)، وجامعة أوغسبورغ الألمانية في أبحاث النانوتكنولوجي وتوصيل الأدوية النانوية.",
        highlightsEn: "Flagship master consortium in nanomaterials and nanomedicine uniting Grenoble INP, KU Leuven, and University of Augsburg.",
        website: "https://fame.grenoble-inp.fr/",
        faculties: ["المواد النانوية الوظيفية وتخزين الطاقة", "تكنولوجيا النانو الطبية وتوصيل الأدوية الموجهة", "الفيزياء التطبيقية وهندسة أشباه الموصلات", "الكيمياء النانوية وتطوير البوليمرات الذكية"],
        facultiesEn: ["Functional Nanomaterials & Energy Storage", "Nanomedicine & Targeted Drug Delivery", "Applied Physics & Semiconductor Eng.", "Nanochemistry & Smart Polymers"]
      },
      {
        name: "تحالف القانون والذكاء الاصطناعي والأمن الرقمي (EMILDAI & CyberSec)",
        nameEn: "European Master in Law, Data and AI (EMILDAI)",
        city: "دبلن / ليون / بيزا / مدريد",
        cityEn: "Dublin / Lyon / Pisa / Madrid",
        ranking: "Top Interdisciplinary LegalTech EU",
        type: "كونسورتيوم ماجستير أوروبي مشترك",
        typeEn: "Joint European University Consortium",
        highlights: "برنامج متعدد التخصصات يربط بين كلية مدينة دبلن (DCU)، وجامعة لوميير ليون 2، وجامعة بيزا، وجامعة كومبلوتنسي بمدريد في حوكمة الذكاء الاصطناعي والأمن السيبراني.",
        highlightsEn: "Interdisciplinary master uniting Dublin City University, Lyon 2, and University of Pisa in AI ethics, cybersecurity, and data protection law.",
        website: "https://emildai.eu/",
        faculties: ["قانون البيانات وحوكمة الذكاء الاصطناعي", "الأمن السيبراني والتحقيق الجنائي الرقمي", "الأخلاقيات وحقوق الإنسان في العصر الرقمي", "تنظيم الأسواق الرقمية وحقوق الملكية الفكرية"],
        facultiesEn: ["Data Protection Law & AI Governance", "Cybersecurity & Digital Forensics", "Ethics & Human Rights in Tech", "Digital Market Regulation & IP Law"]
      },
      {
        name: "تحالف الهندسة الطبية الحيوية والتصوير الطبي (BME Joint Consortium)",
        nameEn: "European Biomedical Engineering & Medical Imaging Consortium",
        city: "آخن / باريس / خرونينغن / براغ",
        cityEn: "Aachen / Paris / Groningen / Prague",
        ranking: "Top HealthTech Europe",
        type: "كونسورتيوم ماجستير أوروبي مشترك",
        typeEn: "Joint European University Consortium",
        highlights: "تحالف طبي هندسي رفيع بين جامعة آخن RWTH، وجامعة السوربون، وجامعة خرونينغن الهولندية والجامعة التقنية التشيكية في الروبوتات الطبية والتصوير بالرنين المغناطيسي.",
        highlightsEn: "Leading HealthTech consortium combining RWTH Aachen, Sorbonne, and Groningen in surgical robotics and advanced medical imaging.",
        website: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
        faculties: ["الروبوتات الجراحية والأطراف التعويضية الذكية", "التصوير الطبي ثلاثي الأبعاد ومعالجة الصور بالذكاء الاصطناعي", "المستشعرات الطبية الحيوية والأجهزة القابلة للزرع", "هندسة الأنسجة والمواد الحيوية المتوافقة"],
        facultiesEn: ["Surgical Robotics & Smart Prosthetics", "Medical Imaging & Bio-AI Processing", "Biomedical Sensors & Implantable Devices", "Tissue Engineering & Biomaterials"]
      },
      {
        name: "تحالف علوم البيئة والتغير المناخي والطاقة المتجددة (PANGEA & REM)",
        nameEn: "Renewable Energy in Marine Environment & Climate Change (REM / PANGEA)",
        city: "بلباو / تروندهايم / نانت / لشبونة",
        cityEn: "Bilbao / Trondheim / Nantes / Lisbon",
        ranking: "Top CleanTech & Climate Consortia",
        type: "كونسورتيوم ماجستير أوروبي مشترك",
        typeEn: "Joint European University Consortium",
        highlights: "تحالف يضم جامعة إقليم الباسك (UPV/EHU)، والجامعة النرويجية للعلوم والتكنولوجيا (NTNU)، وجامعة لشبونة في طاقة الرياح البحرية والهيدروجين الأخضر.",
        highlightsEn: "Consortium dedicated to offshore renewable energy, green hydrogen, and climate adaptation involving NTNU Norway, UPV/EHU Spain, and Lisbon.",
        website: "https://www.remmaster.eu/",
        faculties: ["طاقة الرياح البحرية وتوليد الطاقة الكهرومائية", "تكنولوجيا الهيدروجين الأخضر وخلايا الوقود", "النمذجة المناخية والسياسات البيئية الأوروبية", "إدارة السواحل والمحيطات المستدامة"],
        facultiesEn: ["Offshore Wind & Ocean Energy", "Green Hydrogen & Fuel Cells", "Climate Modeling & European Green Deal Policy", "Sustainable Marine Ecosystems"]
      }
    ]
  },
  {
    country: "إيطاليا",
    countryEn: "Italy",
    flag: "🇮🇹",
    region: "جنوب أوروبا",
    regionEn: "Southern Europe / Mediterranean",
    tier: "guaranteed",
    category: "eu_grants",
    scholarshipName: "منح الأقاليم الإيطالية (DSU / EDISU / ER.GO) ومنحة وزارة الخارجية الإيطالية (MAECI)",
    scholarshipNameEn: "Italian Regional DSU Grants (Right to Study) & Italian Govt MAECI Scholarships",
    applicationWindow: "يونيو – سبتمبر (DSU الأقاليم) / أبريل – يونيو (منحة MAECI)",
    applicationWindowEn: "Jun – Sep (Regional DSU) / Apr – Jun (Govt MAECI)",
    fundingType: "إعفاء دراسي كامل 100% + راتب وسكن معيشي مجاني بقيمة 6,500€ إلى 8,000€ سنوياً",
    fundingTypeEn: "100% Tuition Waiver + Free Student Housing, Meals & €6,500 - €8,000/Year Cash Stipend",
    coverage: [
      "إعفاء كامل 100% من الرسوم الدراسية الجامعية لجميع التخصصات وسنوات الدراسة",
      "راتب نقدي سنوي يتراوح بين 6,500 يورو و 8,500 يورو يُصرف على دفعات دورية",
      "سكن جامعي فردي أو مزدوج مجاني في الحرم الجامعي (أو بدل نقدي شهري للإيجار)",
      "وجبات يومية مجانية أو مدعومة بالكامل في مطاعم الجامعة (Mensa)",
      "تأمين صحي إيطالي وتصريح إقامة دراسي (Permesso di Soggiorno) يسمح بالسفر لكافة دول الشنغن والعمل القانوني 20 ساعة أسبوعياً"
    ],
    coverageEn: [
      "100% Full Tuition Exemption across all degree programs and study years",
      "Annual Cash Grant between €6,500 and €8,500 paid in periodic installments",
      "Free Student Residence Accommodation (or monthly rent contribution)",
      "Free or heavily subsidized daily meals at university canteens (Mensa)",
      "Full Italian National Healthcare (SSN) and 20h/week legal student work permit across Schengen"
    ],
    studyLanguages: ["الإنجليزية 100% (مئات البرامج في البكالوريوس والماجستير)", "الإيطالية"],
    degreeLevels: ["بكالوريوس (Laurea Triennale)", "ماجستير (Laurea Magistrale)", "دكتوراه (Dottorato di Ricerca)", "برامج الطب البشري المدمجة 6 سنوات (Single Cycle MD)"],
    officialPortals: [
      { name: "البوابة الرسمية الموحدة للدراسة في إيطاليا (Universitaly)", nameEn: "Universitaly Official Higher Ed Portal", url: "https://www.universitaly.it/" },
      { name: "بوابة منحة الخارجية الإيطالية (Study in Italy - MAECI)", nameEn: "Study in Italy - Ministry of Foreign Affairs (MAECI)", url: "https://studyinitaly.esteri.it/" },
      { name: "الهيئة الإقليمية لمنح إقليم لومبارديا (ميلانو)", nameEn: "Lombardy Regional Scholarship Agency", url: "https://www.dsu.polimi.it/" },
      { name: "الهيئة الإقليمية لمنح إقليم لاتسيو - روما (Disco Lazio)", nameEn: "Disco Lazio - Regional Right to Study Authority", url: "https://www.laziodisco.it/" }
    ],
    overview: "تعتبر إيطاليا من أسهل وأقوى الوجهات الأوروبية في الحصول على التمويل الكامل للطلاب العرب عبر نظام منح 'حق التعليم' الإقليمي (DSU)، حيث يُمنح الطالب المقبول إعفاءً شاملاً من الرسوم وسكناً جامعياً ووجبات وراتباً سنوياً بناءً على الحالة الاقتصادية للأسرة (ISEE Parificato)، مع تدريس مئات التخصصات والطب باللغة الإنجليزية.",
    overviewEn: "Italy is one of Europe's top destinations for guaranteed funding via regional 'Right to Study' (DSU) grants based on family income (ISEE), providing 100% tuition waivers, free dorms, meals, and stipends across prestigious English-medium programs.",
    topUniversities: [
      {
        name: "جامعة بولونيا (University of Bologna - UNIBO)",
        nameEn: "University of Bologna (Alma Mater Studiorum)",
        city: "بولونيا",
        cityEn: "Bologna",
        ranking: "Top 130 QS World (#1 in Italy / Est. 1088)",
        type: "حكومية بحثية عريقة (أقدم جامعة في العالم)",
        typeEn: "Historic Public Research (World's Oldest University)",
        highlights: "أقدم جامعة في العالم الغربي تعمل دون انقطاع منذ عام 1088، تحتل المركز الأول في إيطاليا، وتقدم أكثر من 90 برنامج ماجستير وبكالوريوس باللغة الإنجليزية في الطب والهندسة والذكاء الاصطناعي والقانون.",
        highlightsEn: "Founded in 1088, the world's oldest university in continuous operation, ranked #1 in Italy with extensive English-taught master and medical programs.",
        website: "https://www.unibo.it/en",
        faculties: ["كلية الطب البشري والعلوم الجراحية (برنامج الطب بالإنجليزية)", "كلية الهندسة وعلوم الحاسوب والذكاء الاصطناعي", "كلية الصيدلة والتكنولوجيا الحيوية", "كلية الاقتصاد والإدارة والمالية", "كلية الحقوق والعلوم السياسية والدولية"],
        facultiesEn: ["Faculty of Medicine & Surgery (English MD)", "School of Engineering & Computer Science", "Pharmacy & Biotechnology", "School of Economics & Management", "Faculty of Law & Political Sciences"]
      },
      {
        name: "جامعة بوليتكنيك ميلانو (Politecnico di Milano - PoliMi)",
        nameEn: "Politecnico di Milano (PoliMi)",
        city: "ميلانو",
        cityEn: "Milan",
        ranking: "Top 110 QS (#1 Engineering Italy / Top 7 Europe)",
        type: "حكومية تقنية وهندسية رائدة",
        typeEn: "Public Technical & Engineering University",
        highlights: "الصرح الهندسي والتكنولوجي الأول في إيطاليا ومن بين أفضل 7 جامعات في أوروبا والعالم في الهندسة الميكانيكية، الهندسة المدنية، الهندسة المعمارية والتصميم الصناعي.",
        highlightsEn: "Italy's premier engineering and technical university, globally ranked top 10 in Mechanical, Civil, Architecture, and Industrial Design.",
        website: "https://www.polimi.it/en",
        faculties: ["كلية الهندسة الميكانيكية وهندسة الفضاء والسيارات", "كلية الهندسة المدنية والبيئية وهندسة البناء", "كلية هندسة المعلومات والاتصالات والذكاء الاصطناعي", "كلية الهندسة المعمارية والتخطيط الحضري", "كلية التصميم الصناعي وتصميم المنتجات"],
        facultiesEn: ["School of Mechanical & Aerospace Eng.", "Civil, Environmental & Land Management Eng.", "Information Tech, Computer Science & AI", "Architecture, Urban Planning & Construction", "School of Industrial Design"]
      },
      {
        name: "جامعة روما سابينزا (Sapienza University of Rome)",
        nameEn: "Sapienza University of Rome",
        city: "روما",
        cityEn: "Rome",
        ranking: "Top 130 QS (#1 Classics & Ancient History in the World)",
        type: "حكومية وطنية ضخمة (تأسست 1303)",
        typeEn: "Historic National Public University",
        highlights: "أكبر جامعة في أوروبا من حيث عدد الطلاب (تأسست 1303)، مصنفة رقم 1 في العالم في الدراسات الكلاسيكية والآثار، ورائدة في الطب والفيزياء النووية وهندسة الفضاء والطاقة.",
        highlightsEn: "Europe's largest university by enrollment (est. 1303), world #1 in Classics & Archaeology, and top-tier in medicine, physics, and aerospace.",
        website: "https://www.uniroma1.it/en",
        faculties: ["كلية الطب البشري وطب الأسنان (مستشفى Policlinico Umberto I)", "كلية الهندسة المدنية والصناعية وهندسة الفضاء", "كلية علوم وتكنولوجيا المعلومات وعلوم البيانات", "كلية الرياضيات والفيزياء والعلوم الطبيعية", "كلية الاقتصاد والعلوم السياسية والإنسانيات"],
        facultiesEn: ["Medicine & Dentistry (Umberto I Hospital)", "Civil, Industrial & Aerospace Engineering", "Information Engineering & Data Science", "Mathematics, Physics & Natural Sciences", "Economics, Political Science & Humanities"]
      },
      {
        name: "جامعة بادوفا (University of Padua - UNIPD)",
        nameEn: "University of Padua (UNIPD)",
        city: "بادوفا",
        cityEn: "Padua",
        ranking: "Top 220 QS (Historic Alma Mater of Galileo / Est. 1222)",
        type: "حكومية بحثية عريقة",
        typeEn: "Historic Public Research University",
        highlights: "تأسست عام 1222 وتولى غاليليو غاليلي التدريس فيها، أول جامعة تمنح شهادة دكتوراه لامرأة في العالم، ورائدة الطب البشري، الفيزياء الفلكية، وعلم النفس الحيوي والتكنولوجيا الحيوية.",
        highlightsEn: "Founded in 1222 where Galileo Galilei taught, world-renowned in clinical medicine, astrophysics, psychology, and biotechnology.",
        website: "https://www.unipd.it/en/",
        faculties: ["كلية الطب البشري والجراحة (برنامج Medicine and Surgery بالإنجليزية)", "كلية الهندسة الصناعية والمدنية وهندسة النظم", "كلية علم النفس والعلوم المعرفية", "كلية العلوم الطبيعية والفيزياء الفلكية", "كلية الزراعة والطب البيطري"],
        facultiesEn: ["School of Medicine (English MD Program)", "School of Engineering", "School of Psychology & Cognitive Science", "School of Science & Astrophysics", "Agricultural Sciences & Veterinary Medicine"]
      },
      {
        name: "جامعة بوليتكنيك تورينو (Politecnico di Torino - PoliTo)",
        nameEn: "Politecnico di Torino (PoliTo)",
        city: "تورينو",
        cityEn: "Turin",
        ranking: "Top 250 QS (#1 Automotive & Mechanical Engineering)",
        type: "حكومية تقنية عريقة (تأسست 1859)",
        typeEn: "Public Technical & Polytechnic University",
        highlights: "عاصمة صناعة السيارات الإيطالية (مقر فيات، فيراري، ألفا روميو ومازيراتي)، الصرح الرائد في هندسة السيارات والتحكم، الميكاترونكس، الطاقة وهندسة البترول والتعدين.",
        highlightsEn: "Anchor of the Italian automotive industry (Fiat, Ferrari), world leader in automotive engineering, mechatronics, energy, and petroleum.",
        website: "https://www.polito.it/en/",
        faculties: ["قسم الهندسة الميكانيكية وهندسة السيارات والفضاء (DIMEAS)", "قسم هندسة الحاسوب والتحكم الآلي (DAUIN)", "قسم الهندسة الإنشائية والمدنية والمعمارية", "قسم الطاقة وهندسة البترول وتكنولوجيا النانو", "قسم الإلكترونيات والاتصالات اللاسلكية"],
        facultiesEn: ["Mechanical & Aerospace Engineering", "Computer & Control Engineering", "Structural & Architectural Engineering", "Energy & Petroleum Engineering", "Electronics & Telecommunications"]
      },
      {
        name: "جامعة ميلانو (University of Milan - Statale)",
        nameEn: "University of Milan (La Statale)",
        city: "ميلانو",
        cityEn: "Milan",
        ranking: "Top 280 QS (Premier Life Sciences & Medicine)",
        type: "حكومية بحثية شاملة",
        typeEn: "Public Comprehensive Research University",
        highlights: "الجامعة الحكومية الشاملة في عاصمة الاقتصاد ميلانو، العضو الوحيد في تحالف جامعات الأبحاث الأوروبية (LERU) في إيطاليا، ورائدة الطب، الصيدلة، والتكنولوجيا الحيوية.",
        highlightsEn: "Milan's major public research powerhouse, only Italian member of the League of European Research Universities (LERU), leader in medical sciences.",
        website: "https://www.unimi.it/en",
        faculties: ["كلية الطب البشري والعلوم الصحية الدولية (IMS Milano)", "كلية العلوم الصيدلانية وتطوير الأدوية", "كلية العلوم والتكنولوجيا وعلوم الحاسوب", "كلية العلوم السياسية والاقتصادية والاجتماعية", "كلية العلوم الزراعية والغذائية والبيئية"],
        facultiesEn: ["International Medical School (IMS Milano MD)", "Faculty of Pharmacy", "Faculty of Science & Technology", "Political, Economic & Social Sciences", "Agricultural & Food Sciences"]
      },
      {
        name: "جامعة بيزا (University of Pisa - UNIPI)",
        nameEn: "University of Pisa (UNIPI)",
        city: "بيزا / توسكانا",
        cityEn: "Pisa / Tuscany",
        ranking: "Top 350 QS (Cradle of Italian Computing / Est. 1343)",
        type: "حكومية تاريخية عريقة",
        typeEn: "Historic Public University (Tuscany)",
        highlights: "مسقط رأس غاليليو غاليلي وأول جامعة أنشأت قسماً لعلوم الحاسوب في إيطاليا، متميزة بمدارس التميز الأكاديمي (Scuola Normale Superiore) والفيزياء والذكاء الاصطناعي.",
        highlightsEn: "Birthplace of Galileo Galilei, pioneer of Italian computer science, renowned in physics, mathematics, and high-performance computing.",
        website: "https://www.unipi.it/index.php/english",
        faculties: ["كلية علوم الحاسوب والذكاء الاصطناعي وهندسة البيانات", "كلية الهندسة الميكانيكية والنووية والكهربائية", "كلية الطب البشري والجراحة", "كلية الرياضيات والفيزياء والكيمياء", "كلية العلوم الاقتصادية والقانونية"],
        facultiesEn: ["Computer Science & AI", "Engineering (Mechanical, Nuclear, Electrical)", "Faculty of Medicine & Surgery", "Mathematics & Physics", "Economics & Law"]
      },
      {
        name: "جامعة نابولي فيدريكو الثاني (University of Naples Federico II)",
        nameEn: "University of Naples Federico II (UNINA)",
        city: "نابولي",
        cityEn: "Naples",
        ranking: "Oldest State-Funded University (Est. 1224)",
        type: "حكومية وطنية تاريخية",
        typeEn: "Historic Public University (Est. 1224)",
        highlights: "أقدم جامعة حكومية عامة في العالم أسسها الإمبراطور فريدريك الثاني عام 1224، تستضيف أول أكاديمية مطورين لشركة آبل في أوروبا (Apple Developer Academy) ورائدة هندسة الطيران.",
        highlightsEn: "The world's oldest state-funded university (est. 1224), host to Europe's first Apple Developer Academy and premier aerospace engineering center.",
        website: "https://www.unina.it/en_GB/home",
        faculties: ["كلية الهندسة والعلوم المعمارية (وأكاديمية آبل Apple Academy)", "كلية الطب البشري والجراحة (برنامج Medicine بالإنجليزية)", "كلية التكنولوجيا الحيوية والعلوم الصيدلانية", "كلية العلوم الزراعية والطب البيطري", "كلية العلوم الإنسانية والقانون والاقتصاد"],
        facultiesEn: ["School of Engineering (Host to Apple Academy)", "Faculty of Medicine (English MD Program)", "Biotechnology & Pharmacy", "Agriculture & Veterinary Medicine", "Humanities, Law & Economics"]
      },
      {
        name: "جامعة فلورنسا (University of Florence - UNIFI)",
        nameEn: "University of Florence (UNIFI)",
        city: "فلورنسا / توسكانا",
        cityEn: "Florence / Tuscany",
        ranking: "Top Architecture, Humanities & Medicine (Est. 1321)",
        type: "حكومية تاريخية شاملة",
        typeEn: "Historic Public Research University",
        highlights: "صرح عصر النهضة في مدينة فلورنسا التاريخية (تأسست 1321)، رائدة عالمياً في الهندسة المعمارية والتصميم، الحفاظ على التراث، الطب البشري والعلوم الزراعية.",
        highlightsEn: "Renaissance academic hub in Florence (est. 1321), internationally renowned in architecture, heritage preservation, clinical medicine, and design.",
        website: "https://www.unifi.it/index.php?module=CMpro&func=viewpage&pageid=10122&newlang=eng",
        faculties: ["كلية الهندسة المعمارية والتصميم الحضري والترميم", "كلية الطب البشري والعلوم الصحية (مستشفى Careggi الجامعي)", "كلية الهندسة الصناعية والمدنية والمعلوماتية", "كلية الاقتصاد وإدارة الأعمال", "كلية الزراعة وعلوم البيئة والغابات"],
        facultiesEn: ["School of Architecture & Urban Design", "School of Human Health Sciences (Careggi Hospital)", "School of Engineering", "Economics & Management", "Agriculture & Environmental Sciences"]
      },
      {
        name: "جامعة تور فيرغاتا في روما (University of Rome Tor Vergata)",
        nameEn: "University of Rome Tor Vergata",
        city: "روما",
        cityEn: "Rome",
        ranking: "Top Young Research University in Italy",
        type: "حكومية بحثية حديثة",
        typeEn: "Modern Public Research University",
        highlights: "القطب العلمي الحديث في روما، تضم أكبر مستشفى جامعي إكلينيكي (Policlinico Tor Vergata) ومقر وكالة الفضاء الإيطالية (ASI)، وتقدم برامج طب وهندسة واقتصاد بالإنجليزية.",
        highlightsEn: "Rome's modern innovation campus hosting Policlinico Tor Vergata and the Italian Space Agency (ASI), offering English-taught Medicine and Business.",
        website: "https://en.uniroma2.it/",
        faculties: ["كلية الطب البشري والجراحة (Single-Cycle Medicine & Surgery بالإنجليزية)", "كلية الاقتصاد والمالية وإدارة الأعمال الدولية", "كلية الهندسة والذكاء الاصطناعي وعلوم الفضاء", "كلية العلوم والفيزياء وتكنولوجيا النانو", "كلية الحقوق والآداب"],
        facultiesEn: ["Faculty of Medicine (English MD Program)", "Economics, Finance & Global Governance", "Engineering & Aerospace Systems", "Science & Nanotechnology", "Faculty of Law & Humanities"]
      },
      {
        name: "جامعة بوكوني (Bocconi University)",
        nameEn: "Bocconi University",
        city: "ميلانو",
        cityEn: "Milan",
        ranking: "Top 5 Business & Finance Worldwide (AACSB/EQUIS/AMBA)",
        type: "خاصة غير ربحية نخبوية",
        typeEn: "Elite Private Non-Profit Business School",
        highlights: "الجامعة النخبوية الأولى في أوروبا لإدارة الأعمال، المالية، الاقتصاد والقانون، كلية إدارة الأعمال (SDA Bocconi) مصنفة التوب 3 عالمياً وتوفر منح تميز شاملة للمتفوقين.",
        highlightsEn: "Europe's premier business and finance university, ranked global top 5 for Business, Management, and MBA programs (SDA Bocconi).",
        website: "https://www.unibocconi.eu/",
        faculties: ["كلية إدارة الأعمال والتمويل الدولي (SDA Bocconi)", "كلية الاقتصاد والعلوم الاجتماعية والاكتوارية", "كلية علوم البيانات وعلوم القرار والذكاء الاصطناعي", "كلية القانون الدولي والحوكمة الاقتصادية", "كلية السياسات العامة والشؤون الأوروبية"],
        facultiesEn: ["School of Management & International Finance", "Economics & Actuarial Sciences", "Data Science & AI for Decision Making", "School of Law & Economic Governance", "Public Policy & European Affairs"]
      }
    ]
  },
  {
    country: "رومانيا",
    countryEn: "Romania",
    flag: "🇷🇴",
    region: "أوروبا الشرقية",
    regionEn: "Eastern Europe / European Union",
    tier: "guaranteed",
    category: "eu_grants",
    scholarshipName: "منحة وزارة الشؤون الخارجية الرومانية (Romanian MFA Scholarship) والمنح الحكومية المباشرة",
    scholarshipNameEn: "Romanian Ministry of Foreign Affairs (MFA) Scholarship & ARACIS Programs",
    applicationWindow: "ديسمبر – 15 مارس (سنوياً)",
    applicationWindowEn: "Dec – Mar 15 (Annually via MFA Portal)",
    fundingType: "ممولة بالكامل في الاتحاد الأوروبي + سنة لغة رومانية مجانية وسكن",
    fundingTypeEn: "Fully Funded EU Scholarship + Free Preparatory Language Year & Dormitory",
    coverage: [
      "إعفاء كامل 100% من جميع الرسوم الدراسية طوال سنوات البكالوريوس أو الماجستير أو الدكتوراه",
      "سنة تحضيرية مجانية بالكامل لتعلم اللغة الرومانية للمقبولين في برامج البكالوريوس والدراسات العليا",
      "سكن جامعي مجاني في المدن الجامعية التابعة للمؤسسات التعليمية الرومانية",
      "راتب شهري منتظم للمعيشة طوال فترة الدراسة والتدريب",
      "شهادة جامعية أوروبية معتمدة من مفوضية الاعتماد الأوروبية (ARACIS) ومعترف بها في كافة دول الاتحاد الأوروبي والعالم العربي"
    ],
    coverageEn: [
      "100% Free Tuition for the entire duration of Bachelor, Master, or PhD studies",
      "1-Year Free Preparatory Romanian Language Course included",
      "Free University Dormitory accommodation provided in student campuses",
      "Monthly Living Allowance throughout the academic year",
      "European Accredited Degree (ARACIS certified) recognized across all EU countries & Arab world"
    ],
    studyLanguages: ["الرومانية (مع سنة تحضيرية لغوية ممولة بالكامل)", "الإنجليزية والفرنسية (لبرامج الطب والهندسة المدفوعة والمنح المباشرة)"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "الطب البشري وطب الأسنان والصيدلة (في كليات UMF العريقة)"],
    officialPortals: [
      { name: "البوابة الرسمية لمنحة الخارجية الرومانية (Study in Romania - MFA)", nameEn: "Official MFA Scholarship Portal (Study in Romania)", url: "https://scholarships.studyinromania.gov.ro/" },
      { name: "وزارة التعليم العالي والبحث العلمي الرومانية (MEN)", nameEn: "Romanian Ministry of National Education", url: "https://www.edu.ro/" },
      { name: "الوكالة الرومانية لضمان جودة التعليم العالي (ARACIS)", nameEn: "Romanian Agency for Quality Assurance (ARACIS)", url: "https://www.aracis.ro/en/" }
    ],
    overview: "منحة حكومية أوروبية سنوية مرموقة ومضمونة تمنحها دولة رومانيا للطلاب من خارج الاتحاد الأوروبي للدراسة في جامعاتها العريقة مع تغطية كاملة للرسوم وسنة لغة مجانية وسكن، بالإضافة لكون رومانيا القطب الطبي الأبرز في شرق أوروبا لتدريس الطب وطب الأسنان والصيدلة باللغتين الإنجليزية والفرنسية.",
    overviewEn: "Prestigious annual EU government scholarship offered by Romania for international students, fully funding tuition, a free Romanian language prep year, dorms, and stipends, alongside renowned medical faculties in English and French.",
    topUniversities: [
      {
        name: "جامعة بوليتكنيك بوخارست الوطنية (POLITEHNICA Bucharest - UNSTPB)",
        nameEn: "National University of Science and Technology POLITEHNICA Bucharest",
        city: "بوخارست",
        cityEn: "Bucharest",
        ranking: "Top 600 QS (#1 Technical & Engineering in Romania / Est. 1818)",
        type: "حكومية تقنية وهندسية كبرى",
        typeEn: "National Public Polytechnic & Tech University",
        highlights: "أكبر وأعرق صرح هندسي وتكنولوجي في رومانيا وجنوب شرق أوروبا (تأسست 1818)، رائدة علوم الحاسوب والذكاء الاصطناعي، هندسة الطيران، الطاقة النووية والمتجددة، وهندسة الإلكترونيات والاتصالات.",
        highlightsEn: "Romania's largest and most prestigious engineering university (est. 1818), world leader in Computer Science, AI, Aerospace, Nuclear Energy, and Telecom.",
        website: "https://upb.ro/en/",
        faculties: ["كلية التحكم الآلي وعلوم الحاسوب والذكاء الاصطناعي (AC)", "كلية الإلكترونيات والاتصالات وتكنولوجيا المعلومات (ETTI)", "كلية هندسة الفضاء والطيران (Aerospace)", "كلية الهندسة الميكانيكية والميكاترونكس", "كلية هندسة الطاقة والكهرباء والبيئة", "كلية الهندسة باللغات الأجنبية (FILS - English/French/German)"],
        facultiesEn: ["Automatic Control & Computer Science", "Electronics, Telecom & Information Tech", "Faculty of Aerospace Engineering", "Mechanical Engineering & Mechatronics", "Power Engineering & Energy", "Faculty of Engineering in Foreign Languages"]
      },
      {
        name: "جامعة بوخارست (University of Bucharest - UniBuc)",
        nameEn: "University of Bucharest (UniBuc)",
        city: "بوخارست",
        cityEn: "Bucharest",
        ranking: "Top Comprehensive University in Romania (Est. 1864)",
        type: "حكومية وطنية شاملة",
        typeEn: "Historic National Public University",
        highlights: "الصرح الأكاديمي الوطني الرائد في العلوم الأساسية، الرياضيات، الفيزياء، الكيمياء، الحقوق والقانون الدولي، واللغات الأجنبية والإنسانيات في العاصمة بوخارست.",
        highlightsEn: "Romania's premier comprehensive university (est. 1864), renowned for mathematics, exact sciences, law, and international diplomacy.",
        website: "https://unibuc.ro/?lang=en",
        faculties: ["كلية الرياضيات وعلوم الحاسوب", "كلية الفيزياء وتكنولوجيا النانو (مركز ماغوريلي للأبحاث الذرية)", "كلية الكيمياء والبيولوجيا الجزيئية", "كلية الحقوق والقانون الدولي", "كلية الجغرافيا والعلوم البيئية", "كلية اللغات والآداب الأجنبية"],
        facultiesEn: ["Faculty of Mathematics & Computer Science", "Faculty of Physics (Măgurele Research Center)", "Faculty of Chemistry & Molecular Biology", "Faculty of Law", "Geography & Environmental Sciences", "Foreign Languages & Literatures"]
      },
      {
        name: "جامعة كارول دافيلا للطب والصيدلة (Carol Davila UMF Bucharest)",
        nameEn: "Carol Davila University of Medicine and Pharmacy (UMFCD)",
        city: "بوخارست",
        cityEn: "Bucharest",
        ranking: "Top 200 Shanghai Ranking Medical (#1 Medicine in Romania / Est. 1857)",
        type: "حكومية طبية متخصصة عريقة",
        typeEn: "National Specialized Medical University",
        highlights: "أعرق وأكبر جامعة طبية في رومانيا وأحد أشهر المجمعات الطبية في الاتحاد الأوروبي، تخرج منها الطبيب العالمي جورج بالاد (حائز نوبل)، وتقدم برامج الطب البشري وطب الأسنان والصيدلة باللغتين الإنجليزية والفرنسية.",
        highlightsEn: "Founded in 1857, Romania's top medical school and alma mater of Nobelist George Emil Palade, globally renowned for English and French medical training.",
        website: "https://umfcd.ro/en/",
        faculties: ["كلية الطب البشري العام (General Medicine - 6 Years MD بالإنجليزية والفرنسية)", "كلية طب وجراحة الفم والأسنان (Dental Medicine - DMD بالإنجليزية)", "كلية الصيدلة والعلوم الدوائية (Faculty of Pharmacy)", "كلية التمريض والتأهيل الطبي والعلوم الصحية", "مستشفيات التدريب السريري التابعة (أكثر من 20 مستشفى جامعي)"],
        facultiesEn: ["Faculty of General Medicine (MD in English/French)", "Faculty of Dental Medicine (DMD in English)", "Faculty of Pharmacy", "Faculty of Nursing & Health Sciences", "Clinical Training University Hospitals Network"]
      },
      {
        name: "جامعة بابيش بولياي (Babeș-Bolyai University - UBB)",
        nameEn: "Babeș-Bolyai University (UBB)",
        city: "كلوج-نابوكا",
        cityEn: "Cluj-Napoca / Transylvania",
        ranking: "Top 800 QS (#1 Comprehensive University in Romania by ARWU)",
        type: "حكومية بحثية كبرى عريقة (تأسست 1581)",
        typeEn: "Major Public Comprehensive Research University",
        highlights: "أكبر جامعة في رومانيا من حيث عدد الطلاب والإنتاج البحثي، مصنفة رقم 1 في رومانيا في التصنيفات العالمية، وتقع في عاصمة وادي التكنولوجيا والشركات الناشئة كلوج-نابوكا.",
        highlightsEn: "Romania's largest university and top research institution, situated in Cluj-Napoca (the Silicon Valley of Eastern Europe).",
        website: "https://www.ubbcluj.ro/en/",
        faculties: ["كلية الرياضيات وعلوم الحاسوب والذكاء الاصطناعي", "كلية الاقتصاد وإدارة الأعمال (FSEGA)", "كلية الفيزياء والكيمياء وهندسة الكيمياء", "كلية البيولوجيا والجيولوجيا", "كلية العلوم السياسية والإدارية والاتصال", "كلية الدراسات الأوروبية والعلاقات الدولية"],
        facultiesEn: ["Mathematics & Computer Science", "Economics & Business Administration (FSEGA)", "Physics, Chemistry & Chemical Eng.", "Biology & Geology", "Political, Admin & Communication Sciences", "Faculty of European Studies"]
      },
      {
        name: "جامعة يوليوس هاتسيغانو للطب والصيدلة (Iuliu Hațieganu UMF Cluj)",
        nameEn: "Iuliu Hațieganu University of Medicine and Pharmacy (UMF Cluj)",
        city: "كلوج-نابوكا",
        cityEn: "Cluj-Napoca",
        ranking: "Top Medical University in Central-Eastern Europe (CIDMEF Accredited)",
        type: "حكومية طبية متخصصة نخبوية",
        typeEn: "Elite Public Medical University",
        highlights: "الصرح الطبي الأكثر استقطاباً للطلاب الدوليين والفرنسيين والألمان والعرب في رومانيا، حاصلة على شهادة التميز الأوروبية في التعليم الطبي الإكلينيكي والمحاكاة الجراحية المتقدمة.",
        highlightsEn: "Central Europe's top destination for international medical students, holding prestigious European clinical accreditations with state-of-the-art simulation centers.",
        website: "https://umfcluj.ro/en/",
        faculties: ["كلية الطب البشري العام (القسم الدولي باللغتين الإنجليزية والفرنسية)", "كلية طب الأسنان وجراحة الوجه والفكين", "كلية الصيدلة والصيدلة الإكلينيكية", "مركز المحاكاة والمهارات الجراحية العملية المتقدمة", "معهد دراسات الدكتوراه والأبحاث الجينومية"],
        facultiesEn: ["Faculty of Medicine (English & French MD Programs)", "Faculty of Dental Medicine", "Faculty of Pharmacy", "Center for Practical Skills & Medical Simulation", "Doctoral School & Genomic Research Institute"]
      },
      {
        name: "جامعة غريغور تي بوبا للطب والصيدلة (Grigore T. Popa UMF Iași)",
        nameEn: "Grigore T. Popa University of Medicine and Pharmacy (UMF Iași)",
        city: "ياش",
        cityEn: "Iași",
        ranking: "Historic Medical Institution (Est. 1879 / WFME Recognized)",
        type: "حكومية طبية متخصصة تاريخية",
        typeEn: "Historic Public Medical University",
        highlights: "تأسست عام 1879 في العاصمة الثقافية ياش، متميزة ببرامج الطب البشري، طب الأسنان، الصيدلة، والهندسة الطبية الحيوية بالإنجليزية والفرنسية ومعتمدة من الفيدرالية العالمية للتعليم الطبي (WFME).",
        highlightsEn: "Founded in 1879 in historic Iași, WFME-accredited medical institution offering English and French MD, Dentistry, Pharmacy, and Biomedical Engineering.",
        website: "https://www.umfiasi.ro/en",
        faculties: ["كلية الطب البشري العام (Medicine in English & French)", "كلية طب الأسنان (Dentistry in English & French)", "كلية الصيدلة (Pharmacy)", "كلية الهندسة الطبية الحيوية والتقنيات الصحية (Biomedical Eng.)", "مستشفيات التدريب السريري وجراحة القلب والأعصاب"],
        facultiesEn: ["Faculty of Medicine (English & French MD)", "Faculty of Dental Medicine (DMD)", "Faculty of Pharmacy", "Faculty of Medical Bioengineering", "Clinical Teaching Hospitals & Cardiovascular Surgery"]
      },
      {
        name: "جامعة ألكسندرو إيوان كوزا (Alexandru Ioan Cuza University - UAIC)",
        nameEn: "Alexandru Ioan Cuza University of Iași (UAIC)",
        city: "ياش",
        cityEn: "Iași",
        ranking: "Oldest Modern University in Romania (Est. 1860)",
        type: "حكومية وطنية تاريخية",
        typeEn: "Historic National Public University",
        highlights: "أول جامعة حديثة تأسست في رومانيا (عام 1860) برعاية الأمير كوزا، رائدة في علوم الحاسوب والأمن الرقمي، الفيزياء التطبيقية، الاقتصاد، والعلوم القانونية والإنسانية.",
        highlightsEn: "First modern university in Romania (est. 1860), prominent in Computer Science, Applied Physics, Economics, and International Law.",
        website: "https://www.uaic.ro/en/",
        faculties: ["كلية علوم الحاسوب وتطوير النظم", "كلية الاقتصاد وإدارة الأعمال (FEAA)", "كلية الفيزياء والكيمياء", "كلية الحقوق والقانون الأوروبي", "كلية الجغرافيا والجيولوجيا", "كلية الفلسفة والعلوم الاجتماعية والسياسية"],
        facultiesEn: ["Faculty of Computer Science", "Economics & Business Administration (FEAA)", "Faculty of Physics & Chemistry", "Faculty of Law", "Geography & Geology", "Philosophy & Social-Political Sciences"]
      },
      {
        name: "جامعة بوليتكنيك تيميشوارا وجامعة الغرب (UPT & UVT Timișoara)",
        nameEn: "Politehnica University of Timișoara (UPT) & West University (UVT)",
        city: "تيميشوارا",
        cityEn: "Timișoara",
        ranking: "Top Engineering & IT Hub in Western Romania (Est. 1920)",
        type: "حكومية تقنية وبحثية",
        typeEn: "Public Technical & Comprehensive Alliance",
        highlights: "القلب التكنولوجي والصناعي في غرب رومانيا بالقرب من حدود المجر وصربيا، معقل شركات البرمجيات وصناعة السيارات القارية والإلكترونيات ومصنفة من أفضل البيئات الجامعية للطلاب.",
        highlightsEn: "Industrial and tech hub of Western Romania, leading in Automotive Embedded Systems, Telecom, Software Engineering, and Exact Sciences.",
        website: "https://www.upt.ro/en/",
        faculties: ["كلية الأتمتة وعلوم الحاسوب والبرمجيات المدمجة (Automotive & Embedded Systems)", "كلية الإلكترونيات والاتصالات وتكنولوجيا المعلومات", "كلية الهندسة الميكانيكية والميكاترونكس", "كلية الهندسة المدنية والمعمارية", "كلية الرياضيات والمعلوماتية والعلوم الطبيعية"],
        facultiesEn: ["Automation & Computer Science (Embedded Systems)", "Electronics & Telecom", "Mechanical Engineering & Mechatronics", "Civil Engineering & Architecture", "Mathematics & Informatics (UVT)"]
      }
    ]
  },
  {
    country: "فرنسا",
    countryEn: "France",
    flag: "🇫🇷",
    region: "أوروبا الغربية",
    regionEn: "Western Europe",
    tier: "guaranteed",
    category: "eu_grants",
    scholarshipName: "منحة إيفل للتميز الحكومي الفرنسي (Eiffel Excellence Scholarship) ومنح التميز الإقليمية والجامعية",
    scholarshipNameEn: "France Excellence Eiffel Scholarship (Campus France) & Grand Établissement Grants",
    applicationWindow: "سبتمبر – منتصف يناير (سنوياً عبر ترشيح الجامعات الفرنسية)",
    applicationWindowEn: "Sep – Mid Jan (Annually via French University Nomination)",
    fundingType: "ممولة بالكامل 100% براتب شهري (1,181€ للماجستير / 1,800€ للدكتوراه) وتذاكر وتأمين",
    fundingTypeEn: "Fully Funded 100% (€1,181/mo for Masters / €1,800/mo for PhD) + Flights & Social Security",
    coverage: [
      "راتب شهري معيشي معفى من الضرائب: 1,181 يورو شهرياً لطلبة الماجستير، و 1,800 يورو شهرياً لطلبة الدكتوراه والبحوث",
      "تذاكر طيران دولية ذهاباً وإياباً من بلد الإقامة إلى فرنسا مع بدلات النقل الداخلي",
      "تغطية الضمان الاجتماعي والتأمين الصحي الكامل طوال فترة الدراسة (Sécurité Sociale)",
      "أولوية مطلقة وحجز فوري في السكن الجامعي الحكومي التابع لمؤسسة (CROUS) مع دعم بدل السكن الشهري (CAF / APL)",
      "أنشطة ثقافية ورحلات تعريفية مجانية وتصريح إقامة دراسي يسمح بالعمل القانوني 20 ساعة أسبوعياً والولوج لجميع دول الشنغن"
    ],
    coverageEn: [
      "Tax-free monthly living stipend: €1,181/month for Master's, and €1,800/month for PhD researchers",
      "International round-trip airfare and local train transportation between airport and university",
      "Comprehensive French National Social Security and supplementary health insurance coverage",
      "Guaranteed priority placement in subsidized public student dormitories (CROUS) plus monthly CAF housing aid",
      "Cultural activities, student integration programs, and legal 20h/week work rights across Schengen"
    ],
    studyLanguages: ["الإنجليزية (مئات برامج الماجستير والهندسة)", "الفرنسية (جميع المستويات من البكالوريوس للدكتوراه)"],
    degreeLevels: ["ماجستير (Master 1 / Master 2)", "دكتوراه وبحوث متقدمة (Doctorat)", "دبلوم مهندس دولة (Diplôme d'Ingénieur)", "برامج الإدارة النخبوية (Grande École)"],
    officialPortals: [
      { name: "وكالة كامبوس فرانس الرسمية لدراسة ومنح إيفل (Campus France)", nameEn: "Campus France Official Eiffel Portal", url: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence" },
      { name: "وزارة أوروبا والشؤون الخارجية الفرنسية (MEAE)", nameEn: "French Ministry for Europe and Foreign Affairs", url: "https://www.diplomatie.gouv.fr/en/" },
      { name: "بوابة السكن والمعيشة الطلابية الفرنسية (CROUS / MesServices)", nameEn: "CROUS French Student Life & Housing Portal", url: "https://www.etudiant.gouv.fr/" }
    ],
    overview: "فرنسا هي عاصمة العلوم والابتكار الأوروبي؛ تمنح وزارة الخارجية الفرنسية عبر برنامج 'إيفل للتميز' تمويلاً كاملاً لنخبة الطلاب الدوليين في مجالات الهندسة، الذكاء الاصطناعي، الرياضيات، القانون والاقتصاد، مع رسوم جامعية رمزية جداً في الجامعات الحكومية ودعم حكومي مباشر للسكن (CAF) لجميع الطلاب.",
    overviewEn: "France is a global powerhouse for science and innovation, offering the prestigious state-funded Eiffel Excellence Scholarship covering monthly stipends, airfare, priority CROUS housing, and CAF subsidies across world-leading universities.",
    topUniversities: [
      {
        name: "جامعة باريس ساكلاي (Université Paris-Saclay)",
        nameEn: "Paris-Saclay University",
        city: "باريس / ساكلاي",
        cityEn: "Paris / Orsay / Saclay",
        ranking: "Top 15 Shanghai Ranking (#1 Mathematics in the World)",
        type: "حكومية بحثية نخبويّة (وادي السيليكون الفرنسي)",
        typeEn: "Elite Public Research Mega-University",
        highlights: "المصنفة رقم 1 في العالم في الرياضيات والتوب 15 عالمياً في تصنيف شنغهاي، مسؤولة عن 13% من كامل الأبحاث العلمية في فرنسا وتضم معاهد CNRS ومختبرات الذكاء الاصطناعي والفيزياء النووية.",
        highlightsEn: "Ranked #1 in the World for Mathematics (Shanghai ARWU) and top 15 globally, producing 13% of France's entire research output.",
        website: "https://www.universite-paris-saclay.fr/en",
        faculties: ["كلية العلوم والرياضيات والفيزياء النظرية (معهد IHES)", "كلية الهندسة وعلوم الحاسوب والذكاء الاصطناعي (Polytech Paris-Saclay)", "كلية الطب البشري والعلوم الصحية والصيدلة", "كلية الحقوق والاقتصاد وإدارة الأعمال", "كلية العلوم الزراعية والبيئية (AgroParisTech)"],
        facultiesEn: ["Faculty of Sciences & Mathematics (IHES Institute)", "Engineering, Computer Science & AI (Polytech)", "Faculty of Medicine & Health Sciences", "Law, Economics & Management", "Agricultural & Environmental Sciences (AgroParisTech)"]
      },
      {
        name: "جامعة السوربون (Sorbonne University)",
        nameEn: "Sorbonne University",
        city: "باريس",
        cityEn: "Paris",
        ranking: "Top 40 QS World (Historic Academic Beacon / Est. 1257)",
        type: "حكومية بحثية عريقة",
        typeEn: "Historic Public Research Powerhouse",
        highlights: "أعرق وأشهر صرح جامعي في التاريخ الفرنسي تأسست عام 1257 في قلب باريس، أنجبت 33 حائزاً على نوبل وماري كوري، وتتصدر علوم البحار، الطب المتقدم، الذكاء الاصطناعي والفلسفة.",
        highlightsEn: "France's historic beacon founded in 1257, alma mater of Marie Curie and 33 Nobel laureates, world leader in medicine, AI, marine science, and humanities.",
        website: "https://www.sorbonne-universite.fr/en",
        faculties: ["كلية العلوم والهندسة والمعلوماتية (حرم بيير وماري كوري)", "كلية الطب البشري والعلوم السريرية (مستشفيات Pitié-Salpêtrière)", "كلية الآداب والفنون والعلوم الإنسانية واللغات", "معهد أبحاث الذكاء الاصطناعي والروبوتات (ISIR)", "معهد هنري بوانكاريه للرياضيات والفيزياء (IHP)"],
        facultiesEn: ["Faculty of Science & Engineering (Pierre & Marie Curie)", "Faculty of Medicine (Pitié-Salpêtrière Hospital)", "Faculty of Arts & Humanities", "Institute for Intelligent Systems & Robotics (ISIR)", "Henri Poincaré Institute (IHP)"]
      },
      {
        name: "معهد بوليتكنيك باريس (Institut Polytechnique de Paris - IP Paris)",
        nameEn: "Institut Polytechnique de Paris (IP Paris)",
        city: "باليزو / باريس",
        cityEn: "Palaiseau / Paris",
        ranking: "Top 40 QS World (#1 Engineering Grande École Alliance)",
        type: "تحالف معاهد الهندسة النخبوية الفرنسية",
        typeEn: "Elite Engineering Grand Établissement Alliance",
        highlights: "التحالف الهندسي الأرقى في فرنسا يجمع École Polytechnique (X)، وENSTA، وENSAE، وTélécom Paris، وتليكوم سود باريس لتخريج كبار قادة التكنولوجيا والعلماء.",
        highlightsEn: "Elite alliance uniting École Polytechnique (l'X), Télécom Paris, ENSAE, ENSTA, and Télécom SudParis, world-ranked for Engineering & Data Science.",
        website: "https://www.ip-paris.fr/en",
        faculties: ["قسم علوم الحاسوب، الذكاء الاصطناعي وعلم البيانات (Hi! PARIS)", "قسم الهندسة الميكانيكية وهندسة الطاقة والنوويات", "قسم الرياضيات التطبيقية والاقتصاد القياسي والمالية الكمية", "قسم الإلكترونيات والاتصالات والأمن السيبراني", "قسم الفيزياء والمواد النانوية والبصريات الكمومية"],
        facultiesEn: ["Computer Science, AI & Data Science (Hi! PARIS)", "Mechanical, Energy & Nuclear Engineering", "Applied Mathematics & Quantitative Finance", "Electronics, Telecom & Cybersecurity", "Physics & Quantum Nano-Optics"]
      },
      {
        name: "جامعة باريس للعلوم والآداب (Université PSL - Paris)",
        nameEn: "Paris Sciences et Lettres University (PSL)",
        city: "باريس",
        cityEn: "Paris",
        ranking: "Top 25 QS World (#1 in France)",
        type: "جامعة بحثية كبرى ونخبوية",
        typeEn: "Collegiate Elite Research University",
        highlights: "المصنفة رقم 1 في فرنسا والتوب 25 عالمياً، تجمع المدرسة العليا للأساتذة (ENS Paris)، وكلية المناجم (Mines Paris)، ومعهد كوري، وكلية فرنسا، ومعهد دوفين باريس (Dauphine).",
        highlightsEn: "Ranked #1 in France and top 25 globally, uniting École Normale Supérieure (ENS), Mines Paris, Curie Institute, Collège de France, and Dauphine.",
        website: "https://psl.eu/en",
        faculties: ["المدرسة العليا للأساتذة في باريس (ENS Paris - العلوم والآداب)", "مدرسة المناجم للمهندسين (Mines Paris - PSL Tech)", "جامعة باريس دوفين (Dauphine - إدارة الأعمال والاقتصاد والمالية)", "معهد كوري للأبحاث البيولوجية وعلاج السرطان", "المدرسة الوطنية العليا للكيمياء والفيزياء (Chimie ParisTech)"],
        facultiesEn: ["École Normale Supérieure (ENS Paris)", "Mines ParisTech (Engineering & Earth Sciences)", "Paris Dauphine (Economics, Management & Finance)", "Curie Institute (Oncology & Biophysics)", "Chimie ParisTech (Chemical Sciences)"]
      },
      {
        name: "جامعة ليون (Université de Lyon - Claude Bernard & Lyon 1/2/3)",
        nameEn: "University of Lyon System (UdL)",
        city: "ليون",
        cityEn: "Lyon",
        ranking: "Top 150 QS World (France's 2nd Academic Capital)",
        type: "حكومية بحثية كبرى ومعهد INSA",
        typeEn: "Public Research University System & INSA Lyon",
        highlights: "العاصمة الأكاديمية الثانية لفرنسا، تضم مجمع ليون 1 للطب والعلوم، المعهد الوطني للعلوم التطبيقية (INSA Lyon)، والمدرسة العليا للأساتذة بليون (ENS Lyon).",
        highlightsEn: "France's second largest research pole uniting Claude Bernard Lyon 1 (Medicine/Science), INSA Lyon Engineering, and ENS de Lyon.",
        website: "https://www.universite-lyon.fr/en",
        faculties: ["كلية الطب البشري والصيدلة (المجمع الصحي الأكبر في ليون)", "المعهد الوطني للعلوم التطبيقية (INSA Lyon - كليات الهندسة)", "كلية العلوم وعلوم الحاسوب والكيمياء الحيوية", "المدرسة العليا للأساتذة في ليون (ENS Lyon - أبحاث العلوم الأساسية)", "معهد إدارة الأعمال والاقتصاد (IAE Lyon)"],
        facultiesEn: ["Faculty of Medicine & Pharmacy (Lyon East & South)", "INSA Lyon (Premier Engineering Grande École)", "Faculty of Sciences & Computer Science", "École Normale Supérieure de Lyon (ENS Lyon)", "IAE Lyon School of Management"]
      },
      {
        name: "جامعة غرونوبل ألب (Université Grenoble Alpes - UGA)",
        nameEn: "Grenoble Alpes University (UGA)",
        city: "غرونوبل / جبال الألب",
        cityEn: "Grenoble / French Alps",
        ranking: "Top 150 Shanghai (Capital of European Nanotechnology)",
        type: "حكومية تقنية وبحثية كبرى",
        typeEn: "Public Research & Microelectronics Mega-Center",
        highlights: "عاصمة تكنولوجيا النانو والإلكترونيات الدقيقة في أوروبا وتحتضن مركز الأبحاث الذرية (CEA) والسنكروترون الأوروبي (ESRF) ومعهد غرونوبل التقني (Grenoble INP).",
        highlightsEn: "European capital for nanotechnology and microelectronics, home to CEA-Leti research labs, ESRF Synchrotron, and Grenoble INP.",
        website: "https://www.univ-grenoble-alpes.fr/english/",
        faculties: ["معهد غرونوبل للهندسة والتكنولوجيا (Grenoble INP - Ensimag, Phelma)", "كلية العلوم والمعلوماتية والذكاء الاصطناعي (MIAI Grenoble)", "كلية الطب البشري والصيدلة والتقنيات الطبية", "كلية الفيزياء والهندسة النووية وأشباه الموصلات", "معهد العلوم السياسية وإدارة الأعمال (Sciences Po Grenoble)"],
        facultiesEn: ["Grenoble INP (Ensimag - CS & Applied Math, Phelma)", "Faculty of Science & AI Research Center (MIAI)", "Faculty of Medicine & Health Technologies", "Physics, Materials Science & Semiconductors", "Sciences Po Grenoble & Management (IAE)"]
      },
      {
        name: "جامعة تولوز ومعهد الفضاء الوطني (Université de Toulouse & ISAE-SUPAERO)",
        nameEn: "University of Toulouse & ISAE-SUPAERO",
        city: "تولوز",
        cityEn: "Toulouse",
        ranking: "#1 Aerospace Capital of Europe (Airbus Headquarters)",
        type: "حكومية بحثية وتحالف هندسة الطيران والفضاء",
        typeEn: "Public Research & Global Aerospace Institute",
        highlights: "عاصمة صناعة الطيران والفضاء الأوروبية (مقر شركة إيرباص Airbus والوكالة الفضائية الفرنسية CNES)، والمعهد الوطني لعلوم الفضاء ISAE-SUPAERO وجامعة بول ساباتييه.",
        highlightsEn: "Europe's aerospace capital (Airbus HQ, French Space Agency CNES), home to world-renowned ISAE-SUPAERO and Paul Sabatier University.",
        website: "https://www.univ-toulouse.fr/en",
        faculties: ["المعهد العالي للملاحة الجوية والفضاء (ISAE-SUPAERO)", "جامعة بول ساباتييه للعلوم والطب البشري (Toulouse III)", "المعهد الوطني للعلوم التطبيقية بتولوز (INSA Toulouse)", "مدرسة تولوز للاقتصاد (Toulouse School of Economics - TSE / نوبل تيرول)", "معهد الدراسات الفضائية والذكاء الاصطناعي (ANITI)"],
        facultiesEn: ["ISAE-SUPAERO (Global #1 Aerospace Engineering)", "Paul Sabatier University (Sciences & Medicine)", "INSA Toulouse (Engineering School)", "Toulouse School of Economics (TSE - Jean Tirole)", "ANITI Artificial Intelligence Institute"]
      }
    ]
  },
  {
    country: "إسبانيا",
    countryEn: "Spain",
    flag: "🇪🇸",
    region: "جنوب أوروبا",
    regionEn: "Southern Europe / Iberian Peninsula",
    tier: "guaranteed",
    category: "eu_grants",
    scholarshipName: "منح وزارة التعليم الإسبانية (Becas MEC) ومنح مؤسسة كارولينا (Fundación Carolina) والمنح الإقليمية",
    scholarshipNameEn: "Spanish Ministry of Education Grants (Becas MEC), Fundación Carolina & Regional Grants",
    applicationWindow: "يناير – مارس (مؤسسة كارولينا) / مارس – مايو (Becas MEC الإسبانية)",
    applicationWindowEn: "Jan – Mar (Fundación Carolina) / Mar – May (Becas MEC)",
    fundingType: "إعفاء كامل 100% من الرسوم + راتب شهري وسكن وتأمين صحي وتذاكر",
    fundingTypeEn: "100% Tuition Exemption + Monthly Living Stipend, Accommodation & Medical Insurance",
    coverage: [
      "إعفاء كامل 100% من الرسوم الدراسية والتسجيل في الجامعات الإسبانية الحكومية والخاصة المرموقة",
      "راتب شهري معيشي منتظم يتراوح بين 750 يورو و 1,200 يورو شهرياً طوال فترة البرنامج",
      "تغطية نفقات السفر وتذاكر الطيران ذهاباً وإياباً للبرامج الدولية وبرامج الدراسات العليا",
      "تأمين صحي شامل يغطي كامل فترة الإقامة في إسبانيا طوال مدة الدراسة",
      "تصريح إقامة دراسي إسباني يتيح العمل القانوني لمدة 30 ساعة أسبوعياً والولوج لجميع دول الشنغن"
    ],
    coverageEn: [
      "100% Tuition & Registration Exemption at top public & private universities in Spain",
      "Monthly Living Stipend ranging from €750 to €1,200/month",
      "Round-trip international flight tickets for postgraduates & international awards",
      "Full Medical & Health Insurance coverage throughout residency in Spain",
      "Spanish Student Visa & Residency allowing up to 30h/week legal employment and Schengen travel"
    ],
    studyLanguages: ["الإنجليزية (أكثر من 800 برنامج معتمد للبكالوريوس والماجستير)", "الإسبانية (ثاني أكثر اللغات تحدثاً بالعالم)"],
    degreeLevels: ["درجة البكالوريوس (Grado - 4 سنوات)", "درجة الماجستير الرسمي (Máster Universitario - سنة أو سنتين)", "درجة الدكتوراه (Doctorado)", "برامج ماجستير إدارة الأعمال العالمية (MBA)"],
    officialPortals: [
      { name: "البوابة الرسمية للدراسة في إسبانيا (Study in Spain - SEPIE)", nameEn: "SEPIE - Official Study in Spain Portal", url: "http://www.sepie.es/internacionalizacion.html" },
      { name: "بوابة منح مؤسسة كارولينا للدراسات العليا (Fundación Carolina)", nameEn: "Fundación Carolina Scholarships Portal", url: "https://www.fundacioncarolina.es/" },
      { name: "وزارة التعليم والتدريب المهني الإسبانية (MEFP)", nameEn: "Spanish Ministry of Education & Vocational Training", url: "https://www.educacionfpydeportes.gob.es/" }
    ],
    overview: "تجمع إسبانيا بين جودة التعليم الأوروبي المعتمد عالمياً والرسوم المعيشية والدراسية الاقتصادية، مع برامج منح حكومية ومؤسسية واسعة مثل منح 'كارولينا' و'Becas MEC' ومئات برامج الماجستير والهندسة وإدارة الأعمال باللغة الإنجليزية في مدن عالمية مثل مدريد وبرشلونة وفالنسيا.",
    overviewEn: "Spain provides high-quality European accredited education with affordable living costs, backed by prominent funding programs like Fundación Carolina and Becas MEC across top-tier universities in Madrid, Barcelona, and Valencia.",
    topUniversities: [
      {
        name: "جامعة برشلونة (University of Barcelona - UB)",
        nameEn: "University of Barcelona (UB)",
        city: "برشلونة / كاتالونيا",
        cityEn: "Barcelona / Catalonia",
        ranking: "Top 150 QS World (#1 in Spain / Est. 1450)",
        type: "حكومية بحثية عريقة",
        typeEn: "Historic Public Research University",
        highlights: "الجامعة المصنفة رقم 1 في إسبانيا والتوب 150 عالمياً، رائدة في الطب البشري، العلوم الحيوية، الصيدلة، الكيمياء، والعلوم الإنسانية، وتستحوذ على أكبر ميزانية بحثية في شبه الجزيرة الإيبيرية.",
        highlightsEn: "Ranked #1 in Spain and top 150 globally, leading Iberian research in Medicine, Biomedical Sciences, Pharmacy, and Chemistry.",
        website: "https://www.ub.edu/web/ub/en/",
        faculties: ["كلية الطب البشري والعلوم الصحية (مستشفى كبار الأطباء Hospital Clínic)", "كلية الصيدلة وعلوم الأغذية", "كلية الكيمياء والفيزياء", "كلية الاقتصاد والأعمال (UB Business School)", "كلية الحقوق والقانون الدولي"],
        facultiesEn: ["Faculty of Medicine & Health Sciences (Hospital Clínic)", "Faculty of Pharmacy & Food Science", "Faculty of Chemistry & Physics", "Faculty of Economics & Business", "Faculty of Law"]
      },
      {
        name: "جامعة مدريد المستقلة (Autonomous University of Madrid - UAM)",
        nameEn: "Autonomous University of Madrid (UAM)",
        city: "مدريد",
        cityEn: "Madrid",
        ranking: "Top 190 QS World (Alma Mater of King Felipe VI)",
        type: "حكومية بحثية نخبوية",
        typeEn: "Elite Public Research University",
        highlights: "جامعة العائلة الملكية ومصنفة رقم 1 في العاصمة مدريد، ترتبط مباشرة بمراكز المجلس الأعلى للبحوث العلمية الإسباني (CSIC) في الفيزياء النظرية، التكنولوجيا النانوية، والعلوم الطبية الحيوية.",
        highlightsEn: "Alma mater of King Felipe VI and #1 in Madrid, tightly integrated with CSIC national institutes in Theoretical Physics and Nanotechnology.",
        website: "https://www.uam.es/uam/en",
        faculties: ["كلية الطب البشري (مستشفى La Paz الجامعي الأكبر في مدريد)", "كلية العلوم والفيزياء النظرية وعلوم المواد (معهد نانوساينس IMDEA)", "كلية الحقوق والعلوم السياسية", "كلية الاقتصاد وإدارة الأعمال", "مدرسة الهندسة التطبيقية وتكنولوجيا المعلومات (EPS)"],
        facultiesEn: ["Faculty of Medicine (La Paz University Hospital)", "Faculty of Sciences & Physics (IMDEA Nanoscience)", "Faculty of Law & Political Science", "Faculty of Economics & Business", "Higher Polytechnic School (EPS - Computer Eng.)"]
      },
      {
        name: "جامعة بوليتكنيك كاتالونيا (Universitat Politècnica de Catalunya - UPC BarcelonaTech)",
        nameEn: "Universitat Politècnica de Catalunya (UPC BarcelonaTech)",
        city: "برشلونة",
        cityEn: "Barcelona",
        ranking: "Top 100 Engineering QS World (#1 Tech in Spain)",
        type: "حكومية تقنية وهندسية كبرى",
        typeEn: "Public Polytechnic & Technology Mega-University",
        highlights: "الصرح الهندسي والتكنولوجي الأول في إسبانيا، تستضيف مركز الحوسبة الفائقة في برشلونة (BSC) الذي يضم الحاسوب الخارق MareNostrum، ورائدة الذكاء الاصطناعي وهندسة الفضاء والاتصالات.",
        highlightsEn: "Spain's premier engineering and tech university, hosting the Barcelona Supercomputing Center (MareNostrum) and world-renowned in AI and Telecom.",
        website: "https://www.upc.edu/en",
        faculties: ["مدرسة برشلونة للمعلوماتية وعلوم الحاسوب والذكاء الاصطناعي (FIB)", "مدرسة الهندسة الصناعية والميكانيكية والميكاترونكس (ETSEIB)", "مدرسة هندسة الاتصالات والإلكترونيات (ETSETB)", "مدرسة برشلونة للهندسة المعمارية والتصميم الحضري (ETSAB)", "مدرسة هندسة الطيران والفضاء وتكنولوجيا النظم (ESEIAAT)"],
        facultiesEn: ["Barcelona School of Informatics & AI (FIB)", "Industrial & Mechanical Engineering (ETSEIB)", "Telecommunications & Electronics (ETSETB)", "Barcelona School of Architecture (ETSAB)", "Aerospace & Space Engineering (ESEIAAT)"]
      },
      {
        name: "جامعة كارلوس الثالث في مدريد (Carlos III University of Madrid - UC3M)",
        nameEn: "Carlos III University of Madrid (UC3M)",
        city: "مدريد / خيتافي / ليغانيس",
        cityEn: "Madrid / Getafe / Leganés",
        ranking: "Top 300 QS World (#1 Bilingual University in Spain)",
        type: "حكومية عصرية رائدة في التدريس الإنجليزي",
        typeEn: "Modern Public Research & Top Bilingual University",
        highlights: "الجامعة الإسبانية الأكثر ريادة في البرامج ثنائية اللغة والتدريس باللغة الإنجليزية بنسبة 100% في البكالوريوس والماجستير، معتمدة دولياً من AACSB في إدارة الأعمال والاقتصاد والهندسة المتقدمة.",
        highlightsEn: "Spain's top bilingual university with extensive 100% English-taught degrees in Economics, Business (AACSB accredited), and Engineering.",
        website: "https://www.uc3m.es/Home",
        faculties: ["كلية الاقتصاد وإدارة الأعمال والمالية الدولية (AACSB Accredited)", "مدرسة الهندسة والتكنولوجيا وعلوم الحاسوب (Leganés Campus)", "كلية العلوم الاجتماعية والسياسية والحوكمة الأوروبية", "كلية الحقوق والقانون الدولي والملكية الفكرية", "كلية الاتصال والإعلام الرقمي والعلوم الإنسانية"],
        facultiesEn: ["Faculty of Economics & Business (AACSB)", "School of Engineering & Computer Science (Leganés)", "Social Sciences & European Governance", "Faculty of Law & International Intellectual Property", "Communication & Digital Humanities"]
      },
      {
        name: "جامعة كومبلوتنسي بمدريد (Complutense University of Madrid - UCM)",
        nameEn: "Complutense University of Madrid (UCM)",
        city: "مدريد",
        cityEn: "Madrid",
        ranking: "Historic National University (Est. 1293 / Top 170 QS)",
        type: "حكومية تاريخية ضخمة",
        typeEn: "Historic National Mega-University",
        highlights: "أعرق وأكبر جامعة في مدريد (تأسست عام 1293)، أنجبت 7 من أصل 8 حائزين على نوبل في تاريخ إسبانيا، وتتصدر طب الأسنان، الصيدلة، العلوم السياسية، واللغات والآداب.",
        highlightsEn: "Historic giant founded in 1293, educated 7 of Spain's 8 Nobel laureates, globally ranked in Dentistry, Pharmacy, Veterinary, and Political Science.",
        website: "https://www.ucm.es/english",
        faculties: ["كلية طب الأسنان وجراحة الفم (مصنفة التوب 20 عالمياً)", "كلية الطب البشري والجراحة (مستشفى Clínico San Carlos)", "كلية الصيدلة والتكنولوجيا الكيميائية الحيوية", "كلية العلوم السياسية وعلم الاجتماع", "كلية الرياضيات وعلوم الحاسوب"],
        facultiesEn: ["Faculty of Dentistry (Global Top 20)", "Faculty of Medicine (Clínico San Carlos Hospital)", "Faculty of Pharmacy", "Political Science & Sociology", "Mathematics & Computer Science"]
      },
      {
        name: "جامعة IE في مدريد وسيغوفيا (IE University)",
        nameEn: "IE University",
        city: "مدريد / سيغوفيا",
        cityEn: "Madrid / Segovia",
        ranking: "Top 10 Business School Worldwide (IE Business School)",
        type: "خاصة دولية نخبوية",
        typeEn: "Elite International Private University & Business School",
        highlights: "أرقى جامعة خاصة ودولية في إسبانيا والاتحاد الأوروبي؛ كلية الأعمال (IE Business School) مصنفة من التوب 10 عالمياً، وتدرس برامجها باللغة الإنجليزية 100% وتمنح منح تميز سخية للطلاب المبدعين.",
        highlightsEn: "World-renowned international private powerhouse, home to IE Business School (Triple Crown accredited), offering 100% English-taught innovative programs.",
        website: "https://www.ie.edu/university/",
        faculties: ["كلية إدارة الأعمال والريادة العالمية (IE Business School)", "كلية العلوم والتكنولوجيا وعلوم البيانات والذكاء الاصطناعي (IE Sci-Tech)", "كلية الحقوق والقانون الدولي والتكنولوجيا (IE Law School)", "كلية العمارة والتصميم الابتكاري (IE School of Architecture)", "كلية السياسة والاقتصاد والشؤون العالمية (IE School of Politics)"],
        facultiesEn: ["IE Business School (Global MBA & Finance)", "IE School of Science & Technology (Data & AI)", "IE Law School", "IE School of Architecture & Design", "IE School of Politics, Economics & Global Affairs"]
      },
      {
        name: "جامعة فالنسيا وجامعة البوليتكنيك في فالنسيا (UV & UPV)",
        nameEn: "University of Valencia (UV) & Universitat Politècnica de València (UPV)",
        city: "فالنسيا",
        cityEn: "Valencia",
        ranking: "Top 300 QS World (Mediterranean Tech & Life Sciences Hub)",
        type: "حكومية كبرى وشاملة",
        typeEn: "Major Public Research & Polytechnic Alliance",
        highlights: "القطب الأكاديمي والتكنولوجي الثالث في إسبانيا على ساحل البحر الأبيض المتوسط؛ رائدة في الهندسة الزراعية والغذائية، الكيمياء وتكنولوجيا المواد، علوم الحاسوب والطب السريري.",
        highlightsEn: "Third major academic hub in Spain on the Mediterranean coast, world-class in Agri-Food Engineering, Chemical Technology, and Computer Systems.",
        website: "https://www.upv.es/en",
        faculties: ["المدرسة العليا لهندسة المعلوماتية والاتصالات (UPV Informatics)", "مدرسة الهندسة الزراعية والبيئية وتكنولوجيا الأغذية (ETSIAMN)", "كلية الطب البشري وطب الأسنان (جامعة فالنسيا UV)", "المدرسة العليا للهندسة الصناعية والميكانيكية (ETSII)", "كلية الاقتصاد والعلوم التجارية الدولية"],
        facultiesEn: ["School of Informatics & Telecom (UPV)", "Agro-Food Engineering & Biotechnology (ETSIAMN)", "Faculty of Medicine & Dentistry (UV)", "Industrial & Mechanical Engineering (ETSII)", "Faculty of Economics & Business"]
      }
    ]
  },
  {
    country: "بولندا",
    countryEn: "Poland",
    flag: "🇵🇱",
    region: "أوروبا الوسطى",
    regionEn: "Central Europe",
    tier: "guaranteed",
    category: "eu_grants",
    scholarshipName: "منحة الحكومة البولندية (NAWA Poland Scholarships - Banach & Zawacka Programmes) ومنح التميز الأكاديمي",
    scholarshipNameEn: "Polish National Agency for Academic Exchange (NAWA) & Polish Govt Scholarships",
    applicationWindow: "فبراير – مايو (سنوياً عبر بوابة NAWA)",
    applicationWindowEn: "Feb – May (Annually via NAWA Portal)",
    fundingType: "إعفاء كامل من الرسوم 100% + راتب شهري معيشي وسكن جامعي مدعوم",
    fundingTypeEn: "100% Tuition Waiver + Monthly Living Stipend (1,700 PLN - 2,500 PLN) + Subsidized Dorms",
    coverage: [
      "إعفاء دراسي كامل 100% من جميع الرسوم الجامعية في الجامعات الحكومية البولندية طوال مدة الماجستير أو الدكتوراه",
      "راتب شهري معيشي منتظم يُصرف طوال 12 شهراً في السنة من وكالة NAWA الوطنية للتبادل الأكاديمي",
      "سنة تحضيرية لغوية مجانية لتعلم اللغة البولندية أو بدء الدراسة المباشرة باللغة الإنجليزية",
      "سكن جامعي مدعوم بالكامل في المدن الجامعية التابعة للمؤسسات الأكاديمية البولندية",
      "تصريح إقامة دراسي أوروبي (Karta Pobytu) يتيح العمل القانوني وتأشيرة شنغن لجميع دول الاتحاد الأوروبي"
    ],
    coverageEn: [
      "100% Full Tuition Exemption at public Polish universities for Masters and PhD tracks",
      "Regular monthly tax-free living stipend paid throughout the year by NAWA agency",
      "Free 1-year language preparatory course or direct entry into English-taught degrees",
      "Guaranteed subsidized dormitory accommodation in university student campuses",
      "European Student Residency Permit (Karta Pobytu) allowing legal student work and Schengen travel"
    ],
    studyLanguages: ["الإنجليزية 100% (مئات البرامج في الطب والهندسة والتكنولوجيا)", "البولندية (مع سنة تحضيرية لغوية مجانية)"],
    degreeLevels: ["بكالوريوس (Licencjat / Inżynier)", "ماجستير (Magister)", "دكتوراه (Doktor)", "برامج الطب البشري وطب الأسنان 6 سنوات (MD / DDS بالإنجليزية)"],
    officialPortals: [
      { name: "وكالة التبادل الأكاديمي البولندية الوطنية الرسمية (NAWA)", nameEn: "Polish National Agency for Academic Exchange (NAWA)", url: "https://nawa.gov.pl/en/" },
      { name: "البوابة الرسمية للدراسة في بولندا (Study in Poland)", nameEn: "Study in Poland Official Portal", url: "https://studyinpoland.pl/" },
      { name: "وزارة التعليم والعلوم البولندية (MEiN)", nameEn: "Polish Ministry of Education and Science", url: "https://www.gov.pl/web/edukacja-i-nauka" }
    ],
    overview: "بولندا هي القطب التعليمي الأسرع نمواً في الاتحاد الأوروبي؛ تتميز ببرامج منح حكومية قوية (NAWA)، وتدريس آلاف التخصصات والبرامج الطبية والهندسية باللغة الإنجليزية برسوم وتكاليف معيشية اقتصادية جداً وشهادات معتمدة بالكامل في كافة دول الاتحاد الأوروبي والعالم.",
    overviewEn: "Poland is the fastest-growing higher education hub in the EU, offering national NAWA scholarships, world-class accredited medical and engineering degrees in English, and very affordable living standards.",
    topUniversities: [
      {
        name: "جامعة وارسو (University of Warsaw - UW)",
        nameEn: "University of Warsaw (UW)",
        city: "وارسو",
        cityEn: "Warsaw",
        ranking: "Top 260 QS World (#1 in Poland / Est. 1816)",
        type: "حكومية بحثية كبرى",
        typeEn: "Flagship Public Research University",
        highlights: "الجامعة الوطنية الأولى في بولندا وأعرق صروح العاصمة وارسو، أنجبت 6 حائزين على نوبل ورؤساء دول، وتتصدر علوم الحاسوب، الخوارزميات والبرمجة التنافسية، الرياضيات، الفيزياء، والعلاقات الدولية.",
        highlightsEn: "Poland's #1 flagship university (est. 1816), educated 6 Nobel laureates, world-famous for competitive programming, computer science, and international relations.",
        website: "https://en.uw.edu.pl/",
        faculties: ["كلية الرياضيات والمعلوماتية والميكانيكا (MIMUW - أبطال العالم في البرمجة ICPC)", "كلية الفيزياء وتكنولوجيا النانو (مركز النظم الكمومية)", "كلية الاقتصاد والعلوم الاقتصادية الدولية", "كلية العلوم السياسية والدراسات الدولية", "كلية الكيمياء والبيولوجيا الجزيئية"],
        facultiesEn: ["Faculty of Mathematics, Informatics & Mechanics (MIMUW)", "Faculty of Physics & Quantum Systems", "Faculty of Economic Sciences", "Political Science & International Studies", "Faculty of Chemistry & Molecular Biology"]
      },
      {
        name: "جامعة ياغيلونيان في كراكوف (Jagiellonian University)",
        nameEn: "Jagiellonian University (UJ)",
        city: "كراكوف",
        cityEn: "Krakow",
        ranking: "Top 300 QS World (Alma Mater of Copernicus / Est. 1364)",
        type: "حكومية تاريخية عريقة (أقدم جامعة في بولندا)",
        typeEn: "Historic Public University (Founded 1364)",
        highlights: "أقدم جامعة في بولندا وثاني أقدم جامعة في وسط أوروبا (تأسست عام 1364)، تخرج منها الفلكي العالمي نيكولاس كوبرنيكوس والبابا يوحنا بولس الثاني، وتضم أرقى مجمع طبي وبحثي في كراكوف.",
        highlightsEn: "Founded in 1364, one of Europe's oldest universities, alma mater of Nicolaus Copernicus, leading in medicine, biotechnology, law, and philosophy.",
        website: "https://en.uj.edu.pl/",
        faculties: ["الكلية الطبية بجامعة ياغيلونيان (UJ Medical College - Medicine & Dentistry in English)", "كلية الكيمياء الحيوية والفيزياء الحيوية والتكنولوجيا الحيوية", "كلية الفلسفة والعلوم الإنسانية والتاريخية", "كلية الحقوق والإدارة والقانون الأوروبي", "كلية الفيزياء وعلم الفلك والمعلوماتية التطبيقية"],
        facultiesEn: ["UJ Medical College (English MD & Dentistry)", "Biochemistry, Biophysics & Biotechnology", "Faculty of Philosophy & Humanities", "Faculty of Law & European Administration", "Physics, Astronomy & Applied Computer Science"]
      },
      {
        name: "جامعة وارسو للتكنولوجيا (Warsaw University of Technology - WUT)",
        nameEn: "Warsaw University of Technology (PW)",
        city: "وارسو",
        cityEn: "Warsaw",
        ranking: "Top 550 QS (#1 Technical & Engineering in Poland / Est. 1826)",
        type: "حكومية تقنية وهندسية رائدة",
        typeEn: "Premier Public Polytechnic University",
        highlights: "الصرح الهندسي والتكنولوجي الأول في بولندا، رائدة الذكاء الاصطناعي، الأمن السيبراني، هندسة السيارات الكهربائية وهندسة الفضاء والطاقة المتجددة في وسط وشرق أوروبا.",
        highlightsEn: "Poland's leading engineering powerhouse, top-ranked for AI, Cybersecurity, Aerospace, Mechatronics, and Renewable Power Engineering.",
        website: "https://www.pw.edu.pl/engpw",
        faculties: ["كلية الإلكترونيات وتكنولوجيا المعلومات والذكاء الاصطناعي (WEiTI)", "كلية هندسة الطاقة والفضاء والطيران (MEiL)", "كلية الهندسة الميكانيكية والسيارات والميكاترونكس (SiMR)", "كلية الهندسة المعمارية والتصميم الإنشائي", "كلية الهندسة المدنية والبيئية"],
        facultiesEn: ["Electronics, Information Tech & AI (WEiTI)", "Power & Aeronautical Engineering (MEiL)", "Automotive & Construction Machinery Eng. (SiMR)", "Faculty of Architecture", "Civil & Environmental Engineering"]
      },
      {
        name: "جامعة وارسو الطبية (Medical University of Warsaw - MUW)",
        nameEn: "Medical University of Warsaw (WUM)",
        city: "وارسو",
        cityEn: "Warsaw",
        ranking: "Top Medical University in Poland (Est. 1809 / USMLE/GMC Recognized)",
        type: "حكومية طبية متخصصة",
        typeEn: "Public Specialized Medical University",
        highlights: "أكبر وأرقى جامعة طبية في بولندا (تأسست 1809)، تقدم برامج الطب البشري وطب الأسنان والصيدلة باللغة الإنجليزية المعتمدة من المجالس الطبية الأمريكية (USMLE) والبريطانية (GMC) والأوروبية.",
        highlightsEn: "Poland's largest and most prestigious medical school, offering internationally recognized English MD, Dental, and Pharmacy degrees.",
        website: "https://www.wum.edu.pl/en",
        faculties: ["كلية الطب البشري الإكلينيكي (6-Year English MD Program)", "كلية طب وجراحة الفم والأسنان (English Dental Program - DMD)", "كلية الصيدلة والعلوم الصيدلانية والصيدلة السريرية", "كلية العلوم الصحية والتمريض والتوليد", "المستشفيات التعليمية الجامعية المتطورة ومراكز جراحة الأعصاب"],
        facultiesEn: ["Faculty of Medicine (6-Year English MD)", "Faculty of Dental Medicine (DMD)", "Faculty of Pharmacy", "Faculty of Health Sciences & Nursing", "University Teaching Hospitals & Neurosurgical Centers"]
      },
      {
        name: "جامعة فروتسواف للعلوم والتكنولوجيا وجامعة فروتسواف (WUST & UWr)",
        nameEn: "Wrocław University of Science and Technology (PWr) & University of Wrocław (UWr)",
        city: "فروتسواف",
        cityEn: "Wrocław",
        ranking: "Top 600 QS (Silicon Valley of Poland / Lower Silesia)",
        type: "حكومية تقنية وبحثية شاملة",
        typeEn: "Public Polytechnic & Historic Research Alliance",
        highlights: "تقع في عاصمة وادي السيليكون البولندي ومقر كبرى شركات التكنولوجيا العالمية (Google, Nokia, IBM, Amazon)، رائدة البرمجيات، النظم المدمجة، التكنولوجيا الحيوية، والكيمياء المتقدمة.",
        highlightsEn: "Academic anchor of Poland's Silicon Valley in Lower Silesia (host to Google, Nokia, Amazon hubs), famous for Software, Telecom, and Biotech.",
        website: "https://pwr.edu.pl/en/",
        faculties: ["كلية علوم الحاسوب والاتصالات وهندسة البرمجيات (W11)", "كلية الهندسة الميكانيكية والميكاترونكس والروبوتات (W10)", "كلية الكيمياء وتكنولوجيا المواد النانوية", "كلية التكنولوجيا الحيوية والبيولوجيا الجزيئية (UWr)", "كلية الفيزياء التطبيقية وتكنولوجيا الكم"],
        facultiesEn: ["Faculty of Computer Science & Telecom (W11)", "Mechanical Engineering & Robotics (W10)", "Faculty of Chemistry & Advanced Materials", "Biotechnology & Molecular Biology (UWr)", "Applied Physics & Quantum Engineering"]
      },
      {
        name: "جامعة غدانسك للطب وجامعة بوليتكنيك غدانسك (GUMed & Gdańsk Tech)",
        nameEn: "Medical University of Gdańsk (GUMed) & Gdańsk University of Technology (PG)",
        city: "غدانسك / ساحل البلطيق",
        cityEn: "Gdańsk / Baltic Sea",
        ranking: "Top Excellence Universities in Poland (Baltic Research Hub)",
        type: "حكومية طبية وتقنية مرموقة",
        typeEn: "Elite Public Medical & Polytechnic Alliance",
        highlights: "القطب الطبي والهندسي الأكبر على ساحل بحر البلطيق؛ تضم جامعة غدانسك الطبية (GUMed) المصنفة رقم 1 في الأبحاث السريرية والصيدلة، وبوليتكنيك غدانسك الرائدة في الهندسة البحرية والذكاء الاصطناعي.",
        highlightsEn: "Premier Baltic medical and technical alliance; GUMed ranks among Poland's top clinical medical schools alongside Gdańsk Tech in naval & software engineering.",
        website: "https://gumed.edu.pl/en",
        faculties: ["كلية الطب البشري (6-Year English MD Program - GUMed)", "كلية الصيدلة والطب المخبري الإكلينيكي", "كلية الهندسة المعمارية والهندسة البحرية وبناء السفن (PG)", "كلية الإلكترونيات والاتصالات والمعلوماتية (ETI - PG)", "كلية الهندسة المدنية والبيئية وإدارة المياه"],
        facultiesEn: ["Faculty of Medicine (English MD - GUMed)", "Faculty of Pharmacy & Clinical Diagnostics", "Ocean Engineering & Ship Technology (PG)", "Electronics, Telecom & Informatics (ETI - PG)", "Civil & Environmental Engineering"]
      },
      {
        name: "جامعة AGH للعلوم والتكنولوجيا (AGH University of Krakow)",
        nameEn: "AGH University of Krakow (AGH)",
        city: "كراكوف",
        cityEn: "Krakow",
        ranking: "Top Tech University in Central Europe (Est. 1919)",
        type: "حكومية تقنية وهندسية متقدمة",
        typeEn: "Premier Technical & Applied Science University",
        highlights: "من أعرق الجامعات التقنية في وسط أوروبا (تأسست 1919)، تضم مركز الحوسبة الأكاديمية (Cyfronet) والحاسوب الخارق Prometheus، ورائدة في هندسة التعدين، الطاقة المتجددة، تكنولوجيا الفضاء، وتطوير الألعاب.",
        highlightsEn: "Founded in 1919, home to Cyfronet Academic Computer Center (Prometheus Supercomputer), leader in Mining, Renewable Energy, Space Tech, and Game Dev.",
        website: "https://www.agh.edu.pl/en/",
        faculties: ["كلية علوم الحاسوب والاتصالات والذكاء الاصطناعي", "كلية هندسة الطاقة والوقود والنوويات", "كلية الهندسة الميكانيكية والروبوتات والميكاترونكس", "كلية الجيولوجيا والتعدين والعلوم البيئية", "مركز تكنولوجيا الفضاء وهندسة الأقمار الصناعية"],
        facultiesEn: ["Computer Science, Telecom & AI", "Energy & Nuclear Fuel Engineering", "Mechanical Engineering & Robotics", "Geology, Geophysics & Mining", "Space Technology & Satellite Systems Center"]
      },
      {
        name: "جامعة بوزنان الطبية وجامعة آدم ميتسكيفيتش (PUMS & AMU Poznań)",
        nameEn: "Poznan University of Medical Sciences (PUMS) & Adam Mickiewicz University (AMU)",
        city: "بوزنان",
        cityEn: "Poznań",
        ranking: "Top Research & Medical Hub in Western Poland",
        type: "حكومية طبية وبحثية كبرى",
        typeEn: "Public Medical & Research University Center",
        highlights: "جامعة بوزنان الطبية هي الرائدة في برامج الطب وطب الأسنان باللغة الإنجليزية في غرب بولندا مع أكثر من 30 عاماً من الخبرة الدولية، إلى جانب جامعة AMU الرائدة في العلوم واللغات.",
        highlightsEn: "PUMS is a pioneer in English-taught medical education with over 30 years of training international physicians, coupled with AMU's comprehensive research excellence.",
        website: "https://pums.edu.pl/",
        faculties: ["الكلية الطبية الدولية للطب البشري (4-Year & 6-Year English MD Programs)", "كلية طب الأسنان باللغة الإنجليزية (5-Year English DDS)", "كلية الصيدلة الإكلينيكية وتطوير العقاقير (PharmD)", "كلية الرياضيات وعلوم الحاسوب والذكاء الاصطناعي (AMU)", "كلية البيولوجيا والعلوم الطبيعية (AMU)"],
        facultiesEn: ["Medical Faculty (4-Year & 6-Year English MD - PUMS)", "Faculty of Dental Medicine (DDS - PUMS)", "Faculty of Pharmacy (PharmD - PUMS)", "Mathematics & Computer Science (AMU)", "Faculty of Biology & Environmental Sciences (AMU)"]
      }
    ]
  },

  // ==========================================
  // 3. الدول الإنجليزية الكبرى والآيفي ليغ (Premier Anglophone & Ivy League)
  // ==========================================
  {
    country: "المملكة المتحدة",
    countryEn: "United Kingdom",
    flag: "🇬🇧",
    region: "أوروبا الغربية",
    regionEn: "Western Europe",
    tier: "guaranteed",
    category: "anglophone",
    scholarshipName: "منحة تشيفنينغ البريطانية الحكومية (Chevening)، منح الكومنولث (Commonwealth)، ومنح غيتس كامبريدج وكلارندون أكسفورد",
    scholarshipNameEn: "UK Chevening Scholarships, Commonwealth Scholarships, Gates Cambridge & Oxford Clarendon Grants",
    applicationWindow: "أغسطس – نوفمبر (تشيفنينغ سنوياً) / سبتمبر – يناير (منح أكسبريدج والجامعات البريطانية)",
    applicationWindowEn: "Aug – Nov (Chevening Annually) / Sep – Jan (Oxbridge & University Grants)",
    fundingType: "ممولة بالكامل 100% (أعلى مستوى تمويل دولي معفى من الضرائب)",
    fundingTypeEn: "Prestigious Fully Funded 100% (Full Tuition + Generous Living Allowance + Travel)",
    coverage: [
      "تغطية كاملة 100% للرسوم الدراسية الجامعية لكافة التخصصات حتى في أرقى جامعات العالم (أكسفورد، كامبريدج، إمبريال، UCL، LSE)",
      "راتب شهري معيشي مرتفع ومعفى من الضرائب يتراوح بين 1,350 إلى 1,750 جنيهاً إسترلينياً شهرياً (مع علاوة خاصة لمدينة لندن)",
      "تذاكر طيران دولية كاملة ذهاباً وإياباً على الدرجة الاقتصادية من بلد الإقامة إلى بريطانيا",
      "بدل وصول واستقرار عند بدء الدراسة وبدل نفقات مغادرة وبدل تغطية رسوم تأشيرة الطالب الدراسية (Student Visa)",
      "حضور مؤتمرات وفعاليات القيادة البريطانية والانضمام لشبكة نخبة خريجي تشيفنينغ العالمية (أكثر من 55,000 قائد حول العالم)"
    ],
    coverageEn: [
      "100% Full Tuition Coverage for any Master's degree, including Oxford, Cambridge, Imperial, UCL, and LSE",
      "Generous tax-free monthly living stipend (£1,350 - £1,750/month with London premium rate)",
      "Economy class round-trip international airfare between home country and the UK",
      "Arrival and departure allowances, travel grants to Chevening events, and UK Student Visa fee reimbursement",
      "Exclusive access to UK leadership summits, parliamentary networking, and the 55,000+ alumni global network"
    ],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["درجة الماجستير لمدة عام واحد (1-Year Master's Taught / Research)", "درجة الدكتوراه وأبحاث DPhil (3 - 4 سنوات)", "زمالات ما بعد الدكتوراه والأبحاث السريرية المتقدمة"],
    officialPortals: [
      { name: "البوابة الرسمية لمنحة تشيفنينغ الحكومية البريطانية (Chevening)", nameEn: "Official UK Chevening Scholarship Portal", url: "https://www.chevening.org/" },
      { name: "لجنة منح الكومنولث في المملكة المتحدة (CSC UK)", nameEn: "Commonwealth Scholarship Commission in the UK", url: "https://cscuk.fcdo.gov.uk/" },
      { name: "المجلس الثقافي البريطاني (Study UK - British Council)", nameEn: "British Council - Study UK Portal", url: "https://study-uk.britishcouncil.org/" }
    ],
    overview: "المملكة المتحدة هي المعقل الأكاديمي الأعرق في العالم وتستقطب سنوياً قادة الفكر وصناع التغيير؛ تقدم وزارة الخارجية والتنمية البريطانية (FCDO) منحة تشيفنينغ المرموقة لتمويل دراسة الماجستير لمدة عام كامل في أي جامعة بريطانية، إلى جانب منح 'غيتس كامبريدج' و'كلارندون أكسفورد' الممولة بالكامل.",
    overviewEn: "The United Kingdom hosts the world's most historic universities, offering the prestigious state-funded Chevening Scholarships alongside Oxbridge endowments to train global leaders across innovative 1-year Master's programs.",
    topUniversities: [
      {
        name: "جامعة أكسفورد (University of Oxford)",
        nameEn: "University of Oxford",
        city: "أكسفورد",
        cityEn: "Oxford",
        ranking: "Top 3 QS World (#1 in the World - THE Rankings / Est. 1096)",
        type: "حكومية كوليدجية عريقة (أقدم جامعة ناطقة بالإنجليزية)",
        typeEn: "Collegiate Research University (Founded 1096)",
        highlights: "أقدم جامعة في العالم الناطق بالإنجليزية، تخرج منها 30 رئيساً لوزراء بريطانيا، و55 حائزاً على نوبل، و120 فائزاً بميداليات أولمبية، وتضم منحة كلارندون (Clarendon) ومنحة رودس (Rhodes Scholarship).",
        highlightsEn: "Oldest university in the English-speaking world, alma mater of 30 UK Prime Ministers and 55 Nobel Laureates, home to the Rhodes and Clarendon Scholarships.",
        website: "https://www.ox.ac.uk/",
        faculties: ["قسم العلوم الطبية والسريرية وأبحاث اللقاحات (معهد جينر Jenner)", "قسم العلوم الرياضية والفيزيائية وهندسة الروبوتات والذكاء الاصطناعي", "كلية سعيد لإدارة الأعمال (Saïd Business School)", "مدرسة بلافاتنيك للإدارة الحكومية والسياسات العامة (Blavatnik)", "كلية الحقوق والقانون الدولي وأكسفورد يونيون"],
        facultiesEn: ["Medical Sciences Division (Jenner Vaccine Institute)", "Mathematical, Physical & Life Sciences (Robotics & AI)", "Saïd Business School (MBA & Finance)", "Blavatnik School of Government (MPP)", "Faculty of Law & International Jurisprudence"]
      },
      {
        name: "جامعة كامبريدج (University of Cambridge)",
        nameEn: "University of Cambridge",
        city: "كامبريدج",
        cityEn: "Cambridge",
        ranking: "Top 2 QS World (121 Nobel Laureates / Est. 1209)",
        type: "حكومية كوليدجية بحثية نخبوية",
        typeEn: "Collegiate Elite Research University (Founded 1209)",
        highlights: "الصرح العلمي الأول تخرج منه إسحاق نيوتن وستيفن هوكينغ وتشارلز داروين و121 حائزاً على نوبل، ومقر مختبر كافنديش (Cavendish Lab) الرائد عالمياً في الفيزياء، وتضم منحة غيتس كامبريدج (Gates Cambridge).",
        highlightsEn: "Global pinnacle of science and discovery (est. 1209), educating Isaac Newton, Stephen Hawking, Darwin, and 121 Nobelists, home to Gates Cambridge Scholarships.",
        website: "https://www.cam.ac.uk/",
        faculties: ["مدرسة العلوم الفيزيائية ومختبر كافنديش الشهير (Cavendish Laboratory)", "مدرسة التكنولوجيا وعلوم الحاسوب والذكاء الاصطناعي (Computer Lab)", "مدرسة الطب السريري ومستشفى أدينبروك (Addenbrooke's Hospital)", "كلية جج لإدارة الأعمال (Cambridge Judge Business School)", "مدرسة العلوم البيولوجية والهندسة الوراثية"],
        facultiesEn: ["School of the Physical Sciences (Cavendish Laboratory)", "School of Technology & Computer Science", "School of Clinical Medicine (Addenbrooke's Hospital)", "Cambridge Judge Business School", "School of Biological Sciences & Genetics"]
      },
      {
        name: "إمبريال كوليدج لندن (Imperial College London)",
        nameEn: "Imperial College London",
        city: "لندن",
        cityEn: "London",
        ranking: "Top 2 QS World (#1 in London for STEM & Medicine)",
        type: "جامعة علمية وتكنولوجية وطبية متخصصة",
        typeEn: "World-Leading Science, Tech & Medicine Specialist",
        highlights: "المصنفة رقم 2 عالمياً والمؤسسة البريطانية الوحيدة المكرسة حصرياً لعلوم الهندسة، التكنولوجيا، الطب، وإدارة الأعمال، ورائدة أبحاث الذكاء الاصطناعي، الأمن السيبراني، والطاقة النظيفة.",
        highlightsEn: "Ranked #2 globally (QS), UK's only institution focused exclusively on STEM, Medicine, and Business, world-renowned for AI and Deep Tech innovation.",
        website: "https://www.imperial.ac.uk/",
        faculties: ["كلية الهندسة (الميكانيكية، الطيران، الحوسبة، والذكاء الاصطناعي)", "كلية الطب البشري والعلوم السريرية والوبائيات", "كلية العلوم الطبيعية والفيزياء الكمومية والكيمياء الجزيئية", "كلية إمبريال كوليدج للأعمال (Imperial College Business School)", "معهد أبحاث تحول الطاقة وتكنولوجيا الفضاء"],
        facultiesEn: ["Faculty of Engineering (Aeronautics, Computing & AI)", "Faculty of Medicine & Global Health", "Faculty of Natural Sciences & Quantum Physics", "Imperial College Business School (Fintech & Management)", "Energy Futures & Space Tech Institutes"]
      },
      {
        name: "كلية لندن الجامعية (University College London - UCL)",
        nameEn: "University College London (UCL)",
        city: "لندن",
        cityEn: "London",
        ranking: "Top 9 QS World (London's Global University / Est. 1826)",
        type: "حكومية بحثية كبرى متعددة التخصصات",
        typeEn: "Flagship Comprehensive Global Research University",
        highlights: "أول جامعة في لندن تقبل الطلاب بغض النظر عن ديانتهم أو جنسهم، تحتل المرتبة الأولى في بريطانيا في القوة البحثية (REF)، وتتصدر العالم في التعليم (IOE)، علوم الأعصاب، والعمارة (Bartlett).",
        highlightsEn: "London's leading multidisciplinary powerhouse (#9 QS), #1 in the UK for research power, world leader in Neuroscience, Education (IOE), and Architecture (Bartlett).",
        website: "https://www.ucl.ac.uk/",
        faculties: ["معهد بارتليت للعمارة والتخطيط الحضري (The Bartlett - #1 in the World)", "كلية علوم الدماغ والأعصاب والطب النفسي (UCL Brain Sciences)", "كلية العلوم الهندسية وعلوم الحاسوب والبيانات", "معهد التعليم الرائد عالمياً (UCL Institute of Education - IOE)", "كلية العلوم الطبية والصحية (UCL Medical School)"],
        facultiesEn: ["The Bartlett Faculty of the Built Environment (#1 in the World)", "Faculty of Brain Sciences & Neuroscience", "Faculty of Engineering Sciences & CS", "IOE - UCL's Faculty of Education and Society", "UCL Medical School & Biomedical Sciences"]
      },
      {
        name: "كلية لندن للاقتصاد والعلوم السياسية (LSE)",
        nameEn: "London School of Economics and Political Science (LSE)",
        city: "لندن",
        cityEn: "London",
        ranking: "Top 5 Worldwide for Social Sciences & Economics",
        type: "متخصصة عالمية نخبوية في الاقتصاد والعلوم السياسية",
        typeEn: "World-Leading Social Science & Economics Powerhouse",
        highlights: "المؤسسة العالمية الرائدة في العلوم الاجتماعية، تخرج منها 18 حائزاً على نوبل و55 رئيس دولة وحكومة، وتحدد سياسات الاقتصاد والمالية العالمية والحوكمة الدولية.",
        highlightsEn: "World's foremost specialist in social sciences and economics, alma mater of 18 Nobel Laureates and 55 world leaders, shaping global fiscal and foreign policies.",
        website: "https://www.lse.ac.uk/",
        faculties: ["قسم الاقتصاد والمالية والأسواق العالمية", "قسم العلاقات الدولية والدبلوماسية والدراسات الأمنية", "قسم القانون والحوكمة وحقوق الإنسان (LSE Law School)", "قسم الإدارة والريادة الاستراتيجية", "معهد الشؤون الدولية وسياسات التنمية"],
        facultiesEn: ["Department of Economics & Global Finance", "Department of International Relations & Diplomacy", "LSE Law School (Corporate & International Law)", "Department of Management & Data Strategy", "International Development & Public Policy"]
      },
      {
        name: "جامعة إدنبرة (The University of Edinburgh)",
        nameEn: "The University of Edinburgh",
        city: "إدنبرة / اسكتلندا",
        cityEn: "Edinburgh / Scotland",
        ranking: "Top 25 QS World (Scottish Enlightenment Anchor / Est. 1583)",
        type: "حكومية تاريخية كبرى",
        typeEn: "Historic Ancient Scottish Research University",
        highlights: "عاصمة التنوير الإسكتلندي وتأسست عام 1583، أنجبت 20 حائزاً على نوبل، مهد استنساخ النعجة دوللي وبوزون هيغز، وتتصدر علوم الحاسوب، الذكاء الاصطناعي، اللغويات، والطب البيطري والحيوي.",
        highlightsEn: "Founded in 1583, historic crown of Scotland, home to the discovery of Higgs Boson and Dolly the Sheep, global leader in AI, Informatics, Medicine, and Law.",
        website: "https://www.ed.ac.uk/",
        faculties: ["مدرسة المعلوماتية وعلوم الحاسوب والذكاء الاصطناعي (أكبر مركز حوسبة في أوروبا)", "كلية الطب البشري والطب البيطري (مدرسة ديك البيطرية الرائدة عالمياً)", "كلية العلوم والهندسة والجيولوجيا الفضائية", "كلية الحقوق والقانون الدولي والأوروبي", "مدرسة إدنبرة لإدارة الأعمال (Edinburgh Business School)"],
        facultiesEn: ["School of Informatics & Artificial Intelligence", "College of Medicine & Veterinary Medicine (Royal Dick)", "College of Science & Engineering", "Edinburgh Law School", "University of Edinburgh Business School"]
      },
      {
        name: "جامعة مانشستر وجامعة ليدز (Manchester & Leeds - Russell Group)",
        nameEn: "University of Manchester & University of Leeds",
        city: "مانشستر / ليدز",
        cityEn: "Manchester / Leeds",
        ranking: "Top 35 QS World (Birthplace of Modern Computing & Graphene)",
        type: "حكومية كبرى من مجموعة راسل النخبوية",
        typeEn: "Premier Russell Group Northern Research Powerhouses",
        highlights: "جامعة مانشستر مهد الحوسبة الحديثة واكتشاف مادة الغرافين الخارقة (25 حائزاً على نوبل)، إلى جانب جامعة ليدز الرائدة في هندسة النقل، الأعمال الدولية، والتكنولوجيا الطبية.",
        highlightsEn: "Manchester is the birthplace of modern computing and Graphene (25 Nobel Laureates), partnered with Leeds as Northern UK engines for Engineering, Business, and Tech.",
        website: "https://www.manchester.ac.uk/",
        faculties: ["المعهد الوطني للغرافين والمواد المتقدمة (NGI)", "كلية الهندسة والعلوم الفيزيائية والذكاء الاصطناعي", "كلية أليانس مانشستر للأعمال (Alliance Manchester Business School)", "كلية الأحياء والطب والصحة والعلوم السريرية", "مدرسة ليدز لعلوم النقل والبيئة الحضرية (ITS Leeds)"],
        facultiesEn: ["National Graphene Institute (NGI)", "Faculty of Science & Engineering", "Alliance Manchester Business School (AMBS)", "Faculty of Biology, Medicine and Health", "Institute for Transport Studies & Business (Leeds)"]
      }
    ]
  },
  {
    country: "الولايات المتحدة الأمريكية",
    countryEn: "USA",
    flag: "🇺🇸",
    region: "أمريكا الشمالية",
    regionEn: "North America",
    tier: "guaranteed",
    category: "anglophone",
    scholarshipName: "برنامج فولبرايت الحكومي الأمريكي (Fulbright Foreign Student)، منح المساعدات التدريسية والبحثية (RA / TA)، ومنح جامعات الآيفي ليغ",
    scholarshipNameEn: "Fulbright Foreign Student Program, Graduate Assistantships (RA/TA) & Ivy League Endowments",
    applicationWindow: "فبراير – يونيو (فولبرايت عبر السفارات/Amideast) / سبتمبر – ديسمبر (القبول المباشر ومساعدات RA/TA)",
    applicationWindowEn: "Feb – Jun (Fulbright via Amideast) / Sep – Dec (Direct PhD / MS Funding & RA/TA)",
    fundingType: "ممولة بالكامل 100% (تغطية كاملة + راتب شهري 2,000$ - 3,500$ + تأمين)",
    fundingTypeEn: "Prestigious Fully Funded 100% (Full Tuition + $2,000-$3,500/mo Living Stipend + Health Plan)",
    coverage: [
      "تغطية كاملة 100% لكافة الرسوم الدراسية ورسوم المعامل والمكتبات في أفضل الجامعات الأمريكية (MIT، هارفارد، ستانفورد، بيركلي، كولومبيا)",
      "راتب شهري معيشي سخي يتراوح بين 2,000$ و 3,500$ شهرياً يغطي تكاليف السكن والطعام والمصروفات الشخصية",
      "تذاكر طيران دولية ذهاباً وإياباً من وإلى الولايات المتحدة مع بدلات السفر الداخلي",
      "خطة رعاية وتأمين صحي شاملة للطلاب الدوليين والباحثين طوال مدة البرنامج الدراسي (ASPE / University Health Plan)",
      "بدل سنوي للكتب والمراجع العلمية، وتكاليف حضور المؤتمرات الأكاديمية ورعاية تأشيرة الطالب (J-1 أو F-1) وتصريح التدريب المهني (OPT/STEM OPT حتى 3 سنوات)"
    ],
    coverageEn: [
      "100% Full Tuition Waiver and lab fees at world-ranked US universities (MIT, Harvard, Stanford, Berkeley, Columbia)",
      "Generous monthly living stipend ($2,000 - $3,500/month) covering rent, food, and living expenses",
      "Round-trip international flights between home country and the United States",
      "Comprehensive accident & sickness medical insurance coverage (ASPE / Major Medical)",
      "Book and technology allowances, academic conference travel grants, and J-1/F-1 Visa with STEM OPT (up to 3 years post-grad work)"
    ],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["درجة الماجستير (Master of Science / Master of Arts / MBA)", "درجة الدكتوراه (Ph.D. ممولة بالكامل 100% مع وظيفة مساعد باحث/تدريس)", "أبحاث ما بعد الدكتوراه والزمالات السريرية"],
    officialPortals: [
      { name: "البوابة الرسمية لبرنامج فولبرايت الأمريكي للطلاب الأجانب", nameEn: "Fulbright Foreign Student Program Portal", url: "https://foreign.fulbrightonline.org/" },
      { name: "شبكة أميديست في الشرق الأوسط وشمال أفريقيا (Amideast)", nameEn: "Amideast Fulbright MENA Portal", url: "https://www.amideast.org/" },
      { name: "بوابة وزارة التعليم والتعليم في أمريكا (EducationUSA)", nameEn: "EducationUSA - Official US State Department Portal", url: "https://educationusa.state.gov/" }
    ],
    overview: "الولايات المتحدة هي القوة العظمى الأولى عالمياً في البحث العلمي والابتكار وريادة الأعمال؛ يقدم برنامج فولبرايت الحكومي التابع لوزارة الخارجية الأمريكية تمويلاً كاملاً للدراسات العليا، إلى جانب أن جميع برامج الدكتوراه (Ph.D.) في الجامعات الأمريكية الكبرى ممولة بالكامل برواتب شهرية وإعفاء دراسي كامل عبر مساعدات التدريس والبحث (RA/TA).",
    overviewEn: "The United States is the global leader in breakthrough research, tech venture creation, and higher education. The US State Department's Fulbright Program and major university assistantships (RA/TA) offer 100% full funding and monthly stipends across elite institutions.",
    topUniversities: [
      {
        name: "معهد ماساتشوستس للتكنولوجيا (MIT)",
        nameEn: "Massachusetts Institute of Technology (MIT)",
        city: "كامبريدج / بوسطن",
        cityEn: "Cambridge / Boston, MA",
        ranking: "Top 1 QS World (#1 in the World for 13 Consecutive Years)",
        type: "خاصة بحثية نخبوية عالمية",
        typeEn: "World #1 Elite Science & Tech Research University",
        highlights: "الجامعة المصنفة رقم 1 في العالم بلا منازع، مهد ابتكارات الذكاء الاصطناعي، الروبوتات، فيزياء الكم، والحوسبة، خرج منها 101 حائز على نوبل وشركات أسسها خريجوها تمثل عاشر أكبر اقتصاد في العالم.",
        highlightsEn: "Ranked #1 university worldwide for 13 consecutive years (QS), birthplace of modern computing, AI, and robotics, home to 101 Nobel Laureates.",
        website: "https://www.mit.edu/",
        faculties: ["مختبر علوم الحاسوب والذكاء الاصطناعي (CSAIL - الأكبر عالمياً)", "مدرسة الهندسة (الميكانيكية، الكهربائية، الطيران، والحيوية)", "كلية سلون لإدارة الأعمال (MIT Sloan School of Management)", "مختبر معهد الإعلام المتقدم (MIT Media Lab)", "مدرسة العلوم وفيزياء الجسيمات والمواد النانوية"],
        facultiesEn: ["Computer Science & Artificial Intelligence Lab (CSAIL)", "School of Engineering (MechE, EECS, AeroAstro, BioE)", "MIT Sloan School of Management", "MIT Media Lab (Radical Innovation)", "School of Science & Quantum Materials"]
      },
      {
        name: "جامعة هارفارد (Harvard University)",
        nameEn: "Harvard University",
        city: "كامبريدج / بوسطن",
        cityEn: "Cambridge / Boston, MA",
        ranking: "Ivy League Apex (#1 Shanghai ARWU / Est. 1636)",
        type: "خاصة كوليدجية نخبوية (أقدم جامعة في أمريكا)",
        typeEn: "Historic Ivy League Powerhouse (Founded 1636)",
        highlights: "أعرق وأشهر جامعة في الولايات المتحدة (تأسست عام 1636)، تمتلك أكبر وقف أكاديمي في العالم (أكثر من 50 مليار دولار)، أنجبت 8 رؤساء للولايات المتحدة، و161 حائزاً على جائزة نوبل.",
        highlightsEn: "America's oldest institution (est. 1636), world's largest academic endowment ($50B+), educating 8 US Presidents, 161 Nobel Laureates, and global titans.",
        website: "https://www.harvard.edu/",
        faculties: ["كلية هارفارد للحقوق والقانون الدولي (Harvard Law School)", "كلية هارفارد للطب البشري والمستشفيات التعليمية (HMS / Mass General)", "كلية هارفارد للأعمال (Harvard Business School - HBS)", "مدرسة جون إف كينيدي للإدارة الحكومية (Harvard Kennedy School)", "مدرسة جون بولسون للهندسة والعلوم التطبيقية (SEAS)"],
        facultiesEn: ["Harvard Law School (HLS)", "Harvard Medical School (HMS / Mass General Hospital)", "Harvard Business School (HBS - MBA)", "Harvard Kennedy School of Government (HKS)", "John A. Paulson School of Engineering & Applied Sciences (SEAS)"]
      },
      {
        name: "جامعة ستانفورد (Stanford University)",
        nameEn: "Stanford University",
        city: "كاليفورنيا / وادي السيليكون",
        cityEn: "Stanford / Silicon Valley, CA",
        ranking: "Top 3 QS World (The Engine of Silicon Valley)",
        type: "خاصة بحثية نخبوية وريادية",
        typeEn: "Elite Global Research & Entrepreneurial Titan",
        highlights: "المحرك والقلب النابض لوادي السيليكون، أسس خريجوها شركات جوجل، ياهو، إنفيديا، إتش بي، نيتفليكس، وتضم برنامج منحة نايت هينيسي (Knight-Hennessy Scholars) الممولة بالكامل للدراسات العليا.",
        highlightsEn: "Heart of Silicon Valley (founders of Google, NVIDIA, HP, Netflix), ranked top 3 globally, home to the Knight-Hennessy Scholars full-funding program.",
        website: "https://www.stanford.edu/",
        faculties: ["مدرسة الهندسة وعلوم الحاسوب والذكاء الاصطناعي (Stanford CS & AI)", "كلية ستانفورد للدراسات العليا في الأعمال (Stanford GSB)", "كلية الطب البشري والعلوم الطبية الحيوية ومستشفى ستانفورد", "كلية الحقوق والقانون والتكنولوجيا والملكية الفكرية", "مدرسة دور للاستدامة وعلوم الطاقة والمناخ (Doerr School)"],
        facultiesEn: ["School of Engineering (Computer Science, AI & Bio-X)", "Stanford Graduate School of Business (GSB)", "Stanford University School of Medicine", "Stanford Law School (Tech & IP Law)", "Stanford Doerr School of Sustainability & Climate"]
      },
      {
        name: "جامعة كاليفورنيا في بيركلي (UC Berkeley)",
        nameEn: "University of California, Berkeley (UC Berkeley)",
        city: "بيركلي / خليج سان فرانسيسكو",
        cityEn: "Berkeley / San Francisco Bay Area, CA",
        ranking: "Top 10 QS World (#1 Public University in the USA)",
        type: "حكومية بحثية كبرى ونخبوية",
        typeEn: "World's Premier Flagship Public Research University",
        highlights: "الجامعة الحكومية رقم 1 في الولايات المتحدة والعالم، ارتبطت باكتشاف 16 عنصراً كيميائياً في الجدول الدوري و114 حائزاً على نوبل، ومقر أبحاث أشباه الموصلات، الذكاء الاصطناعي، والفيزياء النووية.",
        highlightsEn: "World's #1 public university, associated with 114 Nobel Laureates and discovery of 16 periodic table elements, leading in AI, Physics, and Tech Entrepreneurship.",
        website: "https://www.berkeley.edu/",
        faculties: ["كلية الهندسة وعلوم الحوسبة والبيانات (EECS / Berkeley AI Research - BAIR)", "مدرسة هاس لإدارة الأعمال (Haas School of Business)", "كلية الكيمياء والمواد المتقدمة (College of Chemistry - Lawrence Berkeley Lab)", "كلية الحقوق (Berkeley Law)", "كلية الصحة العامة والعلوم الطبية الحيوية"],
        facultiesEn: ["College of Engineering (EECS & BAIR Lab)", "Haas School of Business (MBA)", "College of Chemistry (Lawrence Berkeley National Lab)", "Berkeley School of Law", "School of Public Health & Integrative Biology"]
      },
      {
        name: "جامعة كولومبيا في نيويورك (Columbia University)",
        nameEn: "Columbia University in the City of New York",
        city: "نيويورك",
        cityEn: "New York City, NY",
        ranking: "Ivy League Anchor (103 Nobel Laureates / Est. 1754)",
        type: "خاصة نخبوية من رابطة الآيفي ليغ",
        typeEn: "Elite Ivy League Global Research University",
        highlights: "صرح الآيفي ليغ في قلب مانهاتن بنيويورك، تخرج منها 103 حائزين على نوبل ورؤساء دول ومؤسسو وول ستريت، ومقر جائزة بوليتزر الصحفية وأعرق كليات الصحافة والحقوق والأعمال والطب.",
        highlightsEn: "Historic Ivy League institution in Manhattan, NYC, home to the Pulitzer Prize, 103 Nobel Laureates, and world-renowned Columbia Business and Law Schools.",
        website: "https://www.columbia.edu/",
        faculties: ["كلية كولومبيا للأعمال والمالية والأسواق العالمية (CBS)", "كلية الحقوق والقانون التجاري الدولي (Columbia Law School)", "كلية فو فاونديشن للهندسة والعلوم التطبيقية (SEAS)", "كلية فاغيلوس للأطباء والجراحين (VP&S Medical School)", "كلية الشؤون الدولية والعامة (SIPA - Foreign Policy)"],
        facultiesEn: ["Columbia Business School (CBS)", "Columbia Law School", "Fu Foundation School of Engineering and Applied Science", "Vagelos College of Physicians and Surgeons", "School of International and Public Affairs (SIPA)"]
      },
      {
        name: "جامعة برنستون (Princeton University)",
        nameEn: "Princeton University",
        city: "برنستون / نيوجيرسي",
        cityEn: "Princeton, NJ",
        ranking: "#1 National University in the US (US News / Ivy League)",
        type: "خاصة بحثية ونخبوية من رابطة الآيفي ليغ",
        typeEn: "Elite Ivy League Research & Academic Pinnacle",
        highlights: "المصنفة رقم 1 في الجامعات الأمريكية الوطنية، مقر معهد الدراسات المتقدمة (IAS) الذي ضم ألبرت أينشتاين وجون ناش، وتتميز بأقوى برامج تمويل كامل معفى من القروض (No-Loan Financial Aid).",
        highlightsEn: "Ranked #1 US National University (US News), former academic home of Albert Einstein and John Nash (IAS), offering unmatched full financial aid endowments.",
        website: "https://www.princeton.edu/",
        faculties: ["مدرسة الهندسة والعلوم التطبيقية والمعلوماتية (SEAS Princeton)", "مدرسة برنستون للشؤون العامة والدولية (SPIA)", "قسم الرياضيات والفيزياء النظرية وعلم الفلك الفضائي", "قسم الاقتصاد والمالية الكمية (Bendheim Center)", "قسم البيولوجيا الجزيئية وعلم الوراثة"],
        facultiesEn: ["School of Engineering and Applied Science (SEAS)", "Princeton School of Public and International Affairs (SPIA)", "Department of Mathematics & Theoretical Physics", "Department of Economics & Bendheim Center for Finance", "Department of Molecular Biology"]
      },
      {
        name: "معهد كاليفورنيا للتكنولوجيا (Caltech)",
        nameEn: "California Institute of Technology (Caltech)",
        city: "باسادينا / لوس أنجلوس",
        cityEn: "Pasadena / Los Angeles, CA",
        ranking: "Top 10 QS World (Manages NASA Jet Propulsion Lab - JPL)",
        type: "خاصة تكنولوجية وبحثية نخبوية وفضائية",
        typeEn: "Elite Science, Astrophysics & Aerospace Powerhouse",
        highlights: "الصرح العلمي الأكثر كثافة في الإنتاج البحثي وحصداً لجوائز نوبل بالنسبة لعدد الطلاب (46 نوبل)، ويدير مختبر الدفع النفاث التابع لوكالة ناسا (NASA JPL) المسؤول عن مسابير المريخ واستكشاف الفضاء العميق.",
        highlightsEn: "Global powerhouse in physics and space science, managing NASA's Jet Propulsion Laboratory (JPL) with 46 Nobel Laureates and pioneering Mars explorations.",
        website: "https://www.caltech.edu/",
        faculties: ["قسم الفيزياء والرياضيات وعلم الفلك (مراصد كيك وبالومار)", "قسم الهندسة والعلوم التطبيقية وهندسة الفضاء والطيران (GALCIT)", "مختبر الدفع النفاث لعلوم الفضاء التابع لناسا (NASA JPL)", "قسم الكيمياء والهندسة الكيميائية", "قسم العلوم الجيولوجية والكوكبية وتتبع الزلازل"],
        facultiesEn: ["Division of Physics, Mathematics and Astronomy", "Division of Engineering and Applied Science (GALCIT)", "NASA Jet Propulsion Laboratory (NASA JPL)", "Division of Chemistry and Chemical Engineering", "Geological and Planetary Sciences (Seismological Lab)"]
      }
    ]
  },
  {
    country: "كندا",
    countryEn: "Canada",
    flag: "🇨🇦",
    region: "أمريكا الشمالية",
    regionEn: "North America",
    tier: "guaranteed",
    category: "anglophone",
    scholarshipName: "منحة فانير الكندية للدكتوراه (Vanier CGS)، منحة McCall MacBain، ومنح ليستر بيرسون (Lester B. Pearson)",
    scholarshipNameEn: "Vanier Canada Graduate Scholarships (Vanier CGS), McCall MacBain & Lester B. Pearson Grants",
    applicationWindow: "يوليو – نوفمبر (منحة فانير سنوياً) / سبتمبر – يناير (منح McCall MacBain وليستر بيرسون)",
    applicationWindowEn: "Jul – Nov (Vanier CGS) / Sep – Jan (McCall MacBain & Lester B. Pearson)",
    fundingType: "ممولة بالكامل 100% (50,000$ سنوياً للدكتوراه / تغطية شاملة للماجستير والبكالوريوس)",
    fundingTypeEn: "Fully Funded 100% ($50,000 CAD/yr for PhD / Full Tuition + Stipend for Masters & Undergrad)",
    coverage: [
      "راتب سنوي نقدي معفى من الضرائب قدره 50,000 دولار كندي سنوياً لمدة 3 سنوات كاملة لطلبة الدكتوراه (منحة Vanier CGS)",
      "تغطية كاملة 100% للرسوم الدراسية ورسوم المعامل لطلبة الماجستير والبكالوريوس المتميزين (منح McCall MacBain وLester B. Pearson)",
      "راتب شهري معيشي منتظم وبدل سكن جامعي كامل وبدل انتقال وسفر",
      "تغطية التأمين الصحي الشامل للطلاب الدوليين (UHIP / Provincial Health Plan)",
      "تصريح عمل طلابي أثناء الدراسة (20 ساعة أسبوعياً) مع تصريح عمل مفتوح بعد التخرج (PGWP حتى 3 سنوات) ومسار مباشر للهجرة والإقامة الدائمة (PR)"
    ],
    coverageEn: [
      "$50,000 CAD per year tax-free stipend for 3 consecutive years for PhD researchers (Vanier CGS)",
      "100% Full Tuition & Lab Fee Waivers for top Master's and Bachelor's scholars (McCall MacBain / Lester B. Pearson)",
      "Generous monthly living allowance, guaranteed university housing subsidy, and travel relocation grants",
      "Comprehensive University Health Insurance Plan (UHIP / RAMQ / MSP) for the entire study duration",
      "Student work authorization, up to 3-year Post-Graduation Work Permit (PGWP), and fast-track pathways to Canadian Permanent Residency (PR)"
    ],
    studyLanguages: ["الإنجليزية 100%", "الفرنسية (في مقاطعة كيبيك والجامعات الفرانكوفونية)"],
    degreeLevels: ["درجة البكالوريوس (منحة Lester B. Pearson الكاملة)", "درجة الماجستير (منح McCall MacBain وTri-Agency)", "درجة الدكتوراه وأبحاث Postdoc (منحة Vanier CGS والتمويل المؤسسي)"],
    officialPortals: [
      { name: "البوابة الرسمية لمنحة فانير الكندية للدكتوراه (Vanier CGS)", nameEn: "Vanier Canada Graduate Scholarships Official Portal", url: "https://vanier.gc.ca/en/home-accueil.html" },
      { name: "بوابة منح McCall MacBain للدراسات العليا بجامعة ماكغيل", nameEn: "McCall MacBain Scholarships Portal", url: "https://mccallmacbainscholars.org/" },
      { name: "بوابة التعليم في كندا الرسمية لحكومة كندا (EduCanada)", nameEn: "EduCanada - Official Government of Canada Portal", url: "https://www.educanada.ca/" }
    ],
    overview: "تتصدر كندا دول العالم في جودة الحياة ومستوى التعليم والترحيب بالكفاءات الأكاديمية والطلاب الدوليين؛ تقدم الحكومة الكندية منحة فانير للدكتوراه (50,000$ سنوياً)، وتوفر أفضل الجامعات الكندية (تورنتو، ماكغيل، وUBC) تمويلاً كاملاً ومساراً مضموناً للحصول على تصريح العمل بعد التخرج (PGWP) والإقامة الدائمة الكندية.",
    overviewEn: "Canada is a top global destination for research, high living standards, and welcoming immigration policies. Major awards like the Vanier CGS ($50k/yr), McCall MacBain, and Lester B. Pearson cover 100% of study costs with straightforward pathways to Canadian Permanent Residency.",
    topUniversities: [
      {
        name: "جامعة تورنتو (University of Toronto - U of T)",
        nameEn: "University of Toronto (U of T)",
        city: "تورنتو / أونتاريو",
        cityEn: "Toronto / Ontario",
        ranking: "Top 21 QS World (#1 in Canada / Discovery of Insulin & Deep Learning)",
        type: "حكومية كبرى وأيقونة البحث العلمي الكندي",
        typeEn: "Canada's Premier Flagship Research Mega-University",
        highlights: "الجامعة رقم 1 في كندا والتوب 21 عالمياً، مهد اكتشاف هرمون الإنسولين والخلايا الجذعية والذكاء الاصطناعي الحديث بقيادة جيفري هينتون (الأب الروحي للذكاء الاصطناعي)، وتضم منحة ليستر بيرسون (Lester B. Pearson) الممولة بالكامل.",
        highlightsEn: "Ranked #1 in Canada and top 21 globally, birthplace of insulin, stem cell science, and deep learning AI (Geoffrey Hinton), offering the full Lester B. Pearson Scholarship.",
        website: "https://www.utoronto.ca/",
        faculties: ["معهد فكتور للذكاء الاصطناعي وعلوم الحوسبة (Vector Institute & CS)", "كلية الطب تيميرتي والمستشفيات الجامعية (Temerty Medicine / UHN)", "كلية الهندسة والعلوم التطبيقية (Faculty of Applied Science & Eng.)", "مدرسة روتمان لإدارة الأعمال (Rotman School of Management)", "كلية الحقوق والسياسات العامة (Faculty of Law & Munk School)"],
        facultiesEn: ["Vector Institute for AI & Department of Computer Science", "Temerty Faculty of Medicine & University Health Network (UHN)", "Faculty of Applied Science and Engineering", "Rotman School of Management (MBA & Finance)", "Faculty of Law & Munk School of Global Affairs"]
      },
      {
        name: "جامعة ماكغيل (McGill University)",
        nameEn: "McGill University",
        city: "مونتريال / كيبيك",
        cityEn: "Montreal / Quebec",
        ranking: "Top 30 QS World (Harvard of Canada / 12 Nobel Laureates)",
        type: "حكومية كبرى عريقة وثنائية اللغة",
        typeEn: "Historic Elite Research Institution (Founded 1821)",
        highlights: "تُعرف بـ 'هارفارد كندا' وتأسست عام 1821 في مونتريال عاصمة الذكاء الاصطناعي الفرانكوفونية، أنجبت 12 حائزاً على نوبل و145 باحث رودس، وتضم منحة McCall MacBain السخية بالكامل.",
        highlightsEn: "Known as the 'Harvard of Canada' in bilingual Montreal, educated 12 Nobel Laureates and 145 Rhodes Scholars, home to the fully-funded McCall MacBain Scholarships.",
        website: "https://www.mcgill.ca/",
        faculties: ["كلية الطب والعلوم الصحية ومعهد مونتريال للأعصاب (The Neuro)", "كلية الهندسة وعلوم الحاسوب والروبوتات والذكاء الاصطناعي (MILA Hub)", "كلية ديزوتيلز للإدارة والأعمال الدولية (Desautels Faculty of Management)", "كلية الحقوق والقانون المدني المشترك (McGill Faculty of Law)", "كلية العلوم والفيزياء الفلكية والكيمياء الحيوية"],
        facultiesEn: ["Faculty of Medicine & Health Sciences (The Neuro)", "Faculty of Engineering & CS (Affiliated with MILA AI)", "Desautels Faculty of Management", "Faculty of Law (Bilingual Civil & Common Law)", "Faculty of Science & Astrophysics"]
      },
      {
        name: "جامعة كولومبيا البريطانية (University of British Columbia - UBC)",
        nameEn: "University of British Columbia (UBC)",
        city: "فانكوفر / كولومبيا البريطانية",
        cityEn: "Vancouver / British Columbia",
        ranking: "Top 35 QS World (Pacific Rim Innovation Powerhouse)",
        type: "حكومية بحثية ساحلية كبرى",
        typeEn: "Top Public Research & Innovation University",
        highlights: "القطب الأكاديمي والبحثي الأول على ساحل المحيط الهادئ في فانكوفر، رائدة علوم الاستدامة، التكنولوجيا النظيفة، علوم الغابات، الحوسبة الكمومية، والعلوم الطبية الحيوية وموطن 8 حائزين على نوبل.",
        highlightsEn: "Pacific coast powerhouse in Vancouver, globally ranked in Sustainability, Quantum Computing (Stewart Blusson Quantum Institute), Medicine, and Clean Tech.",
        website: "https://www.ubc.ca/",
        faculties: ["كلية العلوم وعلوم الحاسوب ومعهد الحوسبة الكمومية (Quantum Matter)", "كلية الطب البشري والعلوم السريرية ومستشفيات فانكوفر", "كلية الهندسة والعلوم التطبيقية (Faculty of Applied Science)", "مدرسة ساوودر لإدارة الأعمال (Sauder School of Business)", "كلية الغابات والعلوم البيئية (المصنفة الأولى عالمياً)"],
        facultiesEn: ["Faculty of Science & Stewart Blusson Quantum Matter Institute", "Faculty of Medicine & Vancouver Coastal Health", "Faculty of Applied Science (Civil, Mining, Electrical)", "UBC Sauder School of Business", "Faculty of Forestry (Global #1 for Forest & Climate Sciences)"]
      },
      {
        name: "جامعة واترلو (University of Waterloo)",
        nameEn: "University of Waterloo",
        city: "واترلو / أونتاريو",
        cityEn: "Waterloo / Ontario",
        ranking: "#1 in Canada for Computer Science & Tech Innovation",
        type: "حكومية متخصصة في التكنولوجيا والذكاء الاصطناعي",
        typeEn: "Canada's Tech & Co-op Global Capital",
        highlights: "وادي السيليكون الكندي وتمتلك أكبر برنامج تدريب تعاوني مدفوع الأجر في العالم (Co-op)، الجامعة الأولى التي توظف كبرى شركات التكنولوجيا (Google, Apple, Microsoft) خريجيها مباشرة في أمريكا وكندا.",
        highlightsEn: "Canada's Tech Capital and home to the world's largest paid post-secondary Co-op program, premier talent pipeline for Google, Microsoft, and Silicon Valley.",
        website: "https://uwaterloo.ca/",
        faculties: ["كلية ديفيد تشيريتون لعلوم الحاسوب والبرمجيات (Cheriton School of CS)", "كلية الهندسة (الميكاترونكس، البرمجيات، النانو، والنظم)", "معهد الحوسبة الكمومية والتشفير المتقدم (IQC)", "كلية الرياضيات والرياضيات الاكتوارية (أكبر كلية رياضيات بالعالم)", "كلية العلوم والفيزياء الفلكية والبصريات (Donna Strickland / Nobel)"],
        facultiesEn: ["David R. Cheriton School of Computer Science", "Faculty of Engineering (Mechatronics, Software & Nano)", "Institute for Quantum Computing (IQC)", "Faculty of Mathematics (World's Largest Math Faculty)", "Faculty of Science (Donna Strickland Nobel Optics Lab)"]
      },
      {
        name: "جامعة مونتريال ومعهد البوليتكنيك (Université de Montréal & Polytechnique)",
        nameEn: "Université de Montréal & Polytechnique Montréal",
        city: "مونتريال / كيبيك",
        cityEn: "Montreal / Quebec",
        ranking: "Top 120 QS World (#1 French Research University in Canada)",
        type: "حكومية كبرى وعاصمة الذكاء الاصطناعي (MILA)",
        typeEn: "Major Francophone Research Hub & Global AI Epicenter",
        highlights: "أكبر جامعة ناطقة بالفرنسية في أمريكا الشمالية ومقر معهد مونتريال لخوارزميات التعلم الآلي (MILA) بقيادة يوشوا بنجيو (نوبل الحوسبة - جائزة تورينغ)، وبوليتكنيك مونتريال الهندسية العريقة.",
        highlightsEn: "North America's largest French research university, epicenter of the world-leading MILA AI Institute (Yoshua Bengio / Turing Award), and Polytechnique Montréal.",
        website: "https://www.umontreal.ca/en/",
        faculties: ["معهد مونتريال لخوارزميات التعلم والذكاء الاصطناعي (MILA AI Hub)", "مدرسة البوليتكنيك في مونتريال (Polytechnique Montréal - كليات الهندسة)", "كلية الطب البشري والصحة العامة (Centre Hospitalier de l'UdeM - CHUM)", "مدرسة الدراسات التجارية العليا (HEC Montréal - إدارة الأعمال والمالية)", "كلية الصيدلة والتكنولوجيا الكيميائية الحيوية"],
        facultiesEn: ["MILA - Quebec Artificial Intelligence Institute", "Polytechnique Montréal (Premier Engineering Grande École)", "Faculty of Medicine (CHUM University Hospital)", "HEC Montréal (Triple Crown AACSB/AMBA/EQUIS Business School)", "Faculty of Pharmacy & Biomedical Biotechnology"]
      },
      {
        name: "جامعة ألبرتا وجامعة ماكماستر (Alberta & McMaster)",
        nameEn: "University of Alberta & McMaster University",
        city: "إدمونتون / هاملتون",
        cityEn: "Edmonton / Hamilton, Ontario",
        ranking: "Top 100 QS World (Global Leaders in AI, Energy & Evidence-Based Medicine)",
        type: "حكومية بحثية طبية وتكنولوجية متقدمة",
        typeEn: "Premier Canadian Research & Medical Universities",
        highlights: "جامعة ألبرتا رائدة أبحاث الذكاء الاصطناعي والتعلم المعزز (Amii) وهندسة البترول والطاقة، بينما جامعة ماكماستر هي مهد 'الطب القائم على الدلائل' ومفاعل الأبحاث النووية الرائد في كندا.",
        highlightsEn: "Alberta is a global force in AI/Reinforcement Learning (Amii) and Energy, while McMaster is the historic birthplace of Evidence-Based Medicine and nuclear research.",
        website: "https://www.ualberta.ca/",
        faculties: ["معهد ألبرتا للذكاء الاصطناعي (Alberta Machine Intelligence Institute - Amii)", "كلية الطب والعلوم الصحية ومعهد ماكماستر لأبحاث السرطان والخلايا الجذعية", "كلية الهندسة وهندسة الطاقة والبيئة والتعدين (Alberta)", "مدرسة ماكماستر للطب البشري (Michael G. DeGroote School of Medicine)", "كلية العلوم والكيمياء الحيوية والمواد النووية"],
        facultiesEn: ["Alberta Machine Intelligence Institute (Amii - Reinforcement Learning)", "Faculty of Medicine & McMaster Stem Cell and Cancer Research", "Faculty of Engineering & Energy Systems (Alberta)", "Michael G. DeGroote School of Medicine (McMaster)", "Faculty of Science & McMaster Nuclear Reactor Labs"]
      }
    ]
  },
  {
    country: "أستراليا",
    countryEn: "Australia",
    flag: "🇦🇺",
    region: "أوقيانوسيا",
    regionEn: "Oceania",
    tier: "guaranteed",
    category: "anglophone",
    scholarshipName: "منح أستراليا الجوائز الحكومية (Australia Awards)، منح برامج التدريب البحثي الأسترالية (RTP)، ومنح جامعات مجموعة الثماني (Go8)",
    scholarshipNameEn: "Australia Awards Scholarships, Australian Government RTP Grants & Group of Eight (Go8) Endowments",
    applicationWindow: "فبراير – أبريل (Australia Awards سنوياً) / على مدار العام للماجستير البحثي والدكتوراه (RTP)",
    applicationWindowEn: "Feb – Apr (Australia Awards) / Year-Round for Research Degrees & RTP Grants",
    fundingType: "ممولة بالكامل 100% (تغطية الرسوم الدراسية كاملة + راتب شهري 2,600$ - 3,400$ AUD + تذاكر وتأمين OSHC)",
    fundingTypeEn: "Prestigious Fully Funded 100% (Full Tuition + $2,600-$3,400 AUD/mo Stipend + Travel & OSHC)",
    coverage: [
      "تغطية كاملة 100% للرسوم الدراسية الجامعية في جامعات أستراليا الكبرى الأعضاء في تحالف النخبة (Group of Eight - Go8)",
      "راتب شهري معيشي سخي معفى من الضرائب يتراوح بين 2,600 إلى 3,400 دولار أسترالي شهرياً (31,000$ - 40,000$ AUD سنوياً)",
      "تذاكر طيران دولية كاملة ذهاباً وإياباً على الدرجة الاقتصادية مع بدل استقرار مالي عند الوصول (CLE) وبدل تغطية تكاليف الأطروحة",
      "تغطية التأمين الصحي الشامل للطلاب الدوليين (OSHC - Overseas Student Health Cover) طوال فترة الدراسة",
      "تصريح عمل طلابي قانوني (48 ساعة كل أسبوعين) مع تصريح عمل مفتوح بعد التخرج (Post-Study Work Visa 485 من سنتين إلى 5 سنوات) ومسارات الهجرة الماهرة (PR)"
    ],
    coverageEn: [
      "100% Full Tuition Fee Coverage at Australia's prestigious Group of Eight (Go8) research powerhouses",
      "Generous tax-free monthly living stipend ($2,600 - $3,400 AUD/month / $31,000 - $40,000 AUD per year)",
      "Economy class round-trip international airfares, establishment allowance (CLE), and thesis publication allowance",
      "Comprehensive Overseas Student Health Cover (OSHC) for the full duration of the academic award",
      "Bi-weekly student work rights (48 hrs/fortnight), extended Post-Study Work Visa (Subclass 485 for 2-5 years), and skilled PR pathways"
    ],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["درجة البكالوريوس (منح التميز الأكاديمي الدولية)", "درجة الماجستير (Coursework & Research)", "درجة الدكتوراه وأبحاث Ph.D. ممولة بالكامل (منح RTP)"],
    officialPortals: [
      { name: "البوابة الرسمية لمنح أستراليا الجوائز (Australia Awards - DFAT)", nameEn: "Australia Awards Official DFAT Portal", url: "https://www.dfat.gov.au/people-to-people/australia-awards" },
      { name: "بوابة وزارة التعليم الأسترالية لبرنامج التدريب البحثي (RTP)", nameEn: "Australian Government Research Training Program (RTP)", url: "https://www.education.gov.au/research-block-grants/research-training-program" },
      { name: "بوابة الدراسة في أستراليا الرسمية (Study Australia)", nameEn: "Study Australia Official Government Portal", url: "https://www.studyaustralia.gov.au/" }
    ],
    overview: "تتصدر أستراليا الوجهات الأكاديمية الرائدة عالمياً بفضل جودة التعليم ونمط الحياة المتميز ومرونة مسارات العمل بعد التخرج؛ تقدم وزارة الخارجية والتجارة الأسترالية (DFAT) منحة Australia Awards، وتوفر الجامعات الأسترالية الأعضاء في تحالف النخبة 'مجموعة الثماني' (Group of Eight - Go8) تمويلاً كاملاً وبرامج RTP لدراسة الماجستير والدكتوراه.",
    overviewEn: "Australia is a premier global education destination known for world-class research, high living standards, and generous post-study work rights. Flagship schemes include Australia Awards (DFAT), Australian Government RTP Grants, and prestigious Group of Eight (Go8) university fellowships.",
    topUniversities: [
      {
        name: "جامعة ملبورن (The University of Melbourne)",
        nameEn: "The University of Melbourne",
        city: "ملبورن / فيكتوريا",
        cityEn: "Melbourne / Victoria",
        ranking: "Top 13 QS World (#1 in Australia / Group of Eight / Est. 1853)",
        type: "حكومية كبرى وعاصمة الأبحاث الأسترالية",
        typeEn: "Australia's #1 Flagship Research Powerhouse (Group of Eight)",
        highlights: "الجامعة المصنفة رقم 1 في أستراليا والتوب 13 عالمياً، أنجبت 4 رؤساء وزراء لأستراليا و7 حائزين على نوبل، ومقر معهد بيتر دوهرتي للعدوى والمناعة (Doherty Institute) الرائد عالمياً.",
        highlightsEn: "Ranked #1 in Australia and #13 globally (QS), alma mater of 4 Australian Prime Ministers and 7 Nobel Laureates, home to the Peter Doherty Institute for Infection and Immunity.",
        website: "https://www.unimelb.edu.au/",
        faculties: ["كلية ملبورن للطب والعلوم الصحية وطب الأسنان ومعهد دوهرتي", "كلية ملبورن للهندسة وعلوم الحاسوب والذكاء الاصطناعي", "كلية ملبورن لإدارة الأعمال والاقتصاد (Melbourne Business School)", "كلية الحقوق والقانون الدولي (Melbourne Law School)", "كلية العلوم والفيزياء الفلكية والكيمياء الحيوية"],
        facultiesEn: ["Melbourne Medical School & Doherty Institute for Infection & Immunity", "Melbourne School of Engineering & Computing", "Melbourne Business School (MBS)", "Melbourne Law School (MLS)", "Faculty of Science & BioSciences"]
      },
      {
        name: "الجامعة الوطنية الأسترالية (Australian National University - ANU)",
        nameEn: "Australian National University (ANU)",
        city: "كانبرا / العاصمة الفيدرالية",
        cityEn: "Canberra / ACT",
        ranking: "Top 30 QS World (Australia's National Research University / 6 Nobel Laureates)",
        type: "جامعة وطنية فيدرالية كبرى للأبحاث وصنع السياسات",
        typeEn: "Australia's Premier National Research Flagship (Est. by Parliament)",
        highlights: "الجامعة الفيدرالية الوحيدة التي أُنشئت بقانون من البرلمان الأسترالي في العاصمة كانبرا لقيادة الأبحاث الوطنية وصنع القرار الدبلوماسي والسياسي، خرج منها 6 حائزين على نوبل و49 باحث رودس.",
        highlightsEn: "Australia's national university created by the Federal Parliament in Canberra, educated 6 Nobel Laureates and 49 Rhodes Scholars, leading national policy, physics, and diplomacy.",
        website: "https://www.anu.edu.au/",
        faculties: ["مدرسة كروفورد للسياسات العامة والشؤون الدولية (Crawford School)", "مدرسة أبحاث الفيزياء والعلوم الرياضية (مرصد ستروملو الفضائي)", "كلية الهندسة وعلوم الحوسبة والسيبراني (ANU Computing & Cybernetics)", "مدرسة جون كورتين للأبحاث الطبية (John Curtin School - JCSMR)", "كلية الحقوق والقانون الفيدرالي والدولي (ANU College of Law)"],
        facultiesEn: ["Crawford School of Public Policy & National Security College", "Research School of Physics & Mount Stromlo Observatory", "School of Computing, Engineering & Cybernetics", "John Curtin School of Medical Research (JCSMR)", "ANU College of Law"]
      },
      {
        name: "جامعة سيدني (The University of Sydney)",
        nameEn: "The University of Sydney",
        city: "سيدني / نيو ساوث ويلز",
        cityEn: "Sydney / NSW",
        ranking: "Top 18 QS World (Australia's First University / Est. 1850)",
        type: "حكومية كبرى عريقة من مجموعة الثماني (Go8)",
        typeEn: "Australia's Oldest Sandstone University (Founded 1850)",
        highlights: "أول وأعرق جامعة في أستراليا (تأسست عام 1850)، أنجبت 7 رؤساء وزراء لأستراليا و5 حائزين على نوبل، وتتصدر العالم في قابلية توظيف الخريجين (Graduate Employability) وعلوم الطب والنانو تكنولوجي.",
        highlightsEn: "Australia's first university (est. 1850), educated 7 Prime Ministers and 5 Nobel Laureates, global leader in graduate employability, medicine, and nanotechnology.",
        website: "https://www.sydney.edu.au/",
        faculties: ["كلية الطب والصحة ومعهد العلوم الطبية الحيوية ومستشفى الأمير ألفريد", "كلية الهندسة وعلوم الحاسوب والروبوتات والملاحة الفضائية", "مدرسة جامعة سيدني للأعمال (University of Sydney Business School)", "معهد سيدني للنانو تكنولوجي والفيزياء المتقدمة (Sydney Nano)", "مدرسة سيدني للحقوق والقانون الدولي"],
        facultiesEn: ["Faculty of Medicine and Health & Royal Prince Alfred Hospital", "Faculty of Engineering (Aeronautical, Mechanical & CS)", "University of Sydney Business School", "Sydney Nano Institute & Advanced Physics", "Sydney Law School"]
      },
      {
        name: "جامعة نيو ساوث ويلز (UNSW Sydney)",
        nameEn: "UNSW Sydney (University of New South Wales)",
        city: "سيدني / نيو ساوث ويلز",
        cityEn: "Sydney / NSW",
        ranking: "Top 19 QS World (Global Leader in Solar Energy & Quantum Computing)",
        type: "حكومية تكنولوجية وهندسية وبحثية كبرى",
        typeEn: "World Leader in Solar Tech, Quantum Computing & Engineering",
        highlights: "الرائدة العالمية في هندسة الخلايا الكهروضوئية والطاقة الشمسية، ومقر مركز الحوسبة الكمومية والاتصالات (CQC2T) برئاسة البروفيسورة ميشيل سيمونز، والجامعة الأولى في تخريج رواد الأعمال والمليونيرات في أستراليا.",
        highlightsEn: "World leader in Silicon Quantum Computing (CQC2T) and Solar Photovoltaic Tech (PERC cells), top educator of startup founders and Fortune 500 CEOs in Australia.",
        website: "https://www.unsw.edu.au/",
        faculties: ["كلية الهندسة (أكبر وأقوى كلية هندسة في أستراليا)", "مدرسة الطاقة الكهروضوئية وهندسة الطاقة المتجددة (SPREE)", "مدرسة AGSM الأسترالية العليا للإدارة والأعمال (AGSM MBA)", "كلية الطب والصحة والعلوم السريرية ومستشفيات سيدني", "كلية العلوم وعلوم المواد وتكنولوجيا النانو"],
        facultiesEn: ["UNSW Faculty of Engineering (Largest in Australia)", "School of Photovoltaic and Renewable Energy Engineering (SPREE)", "Australian Graduate School of Management (AGSM)", "UNSW Medicine & Health", "Faculty of Science & Quantum Materials"]
      },
      {
        name: "جامعة كوينزلاند (The University of Queensland - UQ)",
        nameEn: "The University of Queensland (UQ)",
        city: "بريزبن / كوينزلاند",
        cityEn: "Brisbane / Queensland",
        ranking: "Top 40 QS World (Birthplace of Gardasil HPV Vaccine / Group of Eight)",
        type: "حكومية بحثية وبيولوجية متقدمة",
        typeEn: "Global Powerhouse in Bioengineering, Medicine & Ecology",
        highlights: "الصرح البحثي الأكبر في شمال شرق أستراليا، مهد ابتكار لقاح جارداسيل (Gardasil) للوقاية من سرطان عنق الرحم، وتتصدر العالم في العلوم البيولوجية والبيئية وهندسة التعدين والمواد.",
        highlightsEn: "Queensland's leading university, birthplace of the lifesaving Gardasil HPV vaccine, globally renowned in Biotechnology (AIBN), Mining, and Environmental Sciences.",
        website: "https://www.uq.edu.au/",
        faculties: ["المعهد الأسترالي للهندسة الحيوية وتكنولوجيا النانو (AIBN)", "كلية الطب البشري والعلوم الطبية الحيوية ومعهد ترانسليشنال ريسيرش", "كلية الهندسة والعمارة وتكنولوجيا المعلومات والبرمجيات", "كلية العلوم وعلوم البيئة والمحيطات والحاجز المرجاني العظيم", "كلية الأعمال والاقتصاد والقانون (UQ Business School)"],
        facultiesEn: ["Australian Institute for Bioengineering & Nanotechnology (AIBN)", "Faculty of Medicine & Translational Research Institute (TRI)", "Faculty of Engineering, Architecture and IT", "Faculty of Science & Coral Reef / Marine Ecology", "Faculty of Business, Economics and Law"]
      },
      {
        name: "جامعة موناش (Monash University)",
        nameEn: "Monash University",
        city: "ملبورن / فيكتوريا",
        cityEn: "Melbourne / Victoria",
        ranking: "Top 37 QS World (#2 in the World for Pharmacy & Pharmacology)",
        type: "حكومية كبرى متعددة الفروع دولياً",
        typeEn: "Australia's Largest Comprehensive Research Mega-University",
        highlights: "أكبر جامعة في أستراليا والمصنفة رقم 2 عالمياً في الصيدلة وعلم الأدوية (بعد هارفارد مباشرة)، ومقر أكبر محطة إنتاج لقاحات mRNA في النصف الجنوبي للكرة الأرضية (Moderna Hub).",
        highlightsEn: "Australia's largest university, ranked #2 in the world for Pharmacy & Pharmacology (QS), home to the Southern Hemisphere's Moderna mRNA Vaccine Manufacturing Center.",
        website: "https://www.monash.edu/",
        faculties: ["كلية الصيدلة والعلوم الصيدلانية (المصنفة #2 عالمياً)", "كلية الطب والتمريض والعلوم الصحية ومعهد فيكتوريا للقلب", "كلية الهندسة وعلوم المواد المتقدمة والطباعة الحيوية 3D", "كلية تكنولوجيا المعلومات والذكاء الاصطناعي والأمن السيبراني", "مدرسة موناش للأعمال (Monash Business School - Triple Crown)"],
        facultiesEn: ["Faculty of Pharmacy and Pharmaceutical Sciences (Global #2)", "Faculty of Medicine, Nursing and Health Sciences", "Faculty of Engineering & 3D Additive Manufacturing", "Faculty of Information Technology & AI", "Monash Business School (AACSB, EQUIS, AMBA)"]
      }
    ]
  },

  // ==========================================
  // 4. أوراسيا وشرق آسيا وجنوب أوروبا (Eurasia, East Asia & Southern Europe)
  // ==========================================
  {
    country: "كوريا الجنوبية",
    countryEn: "South Korea",
    flag: "🇰🇷",
    region: "شرق آسيا",
    regionEn: "East Asia",
    tier: "guaranteed",
    category: "eurasia_eastasia",
    scholarshipName: "منحة الحكومة الكورية العالمية (GKS - Global Korea Scholarship / KGSP) ومنح جامعات النخبة (SKY & KAIST)",
    scholarshipNameEn: "Global Korea Scholarship (GKS/KGSP) & Korean Elite University Endowments (SKY & KAIST)",
    applicationWindow: "سبتمبر – أكتوبر (البكالوريوس سنوياً) / فبراير – مارس (الدراسات العليا: الماجستير والدكتوراه)",
    applicationWindowEn: "Sep – Oct (Undergraduate Track) / Feb – Mar (Graduate Track: MS & PhD)",
    fundingType: "ممولة بالكامل 100% (إعفاء دراسي 100% + راتب شهري 1,000,000 - 1,500,000 وون + سنة لغة مجانية وتذاكر وتأمين)",
    fundingTypeEn: "Fully Funded 100% (Full Tuition + 1,000,000-1,500,000 KRW/mo Stipend + 1-Yr Free Korean + Flights)",
    coverage: [
      "إعفاء كامل 100% من جميع الرسوم الدراسية ورسوم التسجيل والمعامل في كافة الجامعات الكورية الوطنية والخاصة",
      "راتب شهري معيشي منتظم يتراوح بين 1,000,000 إلى 1,500,000 وون كوري شهرياً (مع مكافأة إضافية 100,000 وون شهرياً لحاملي TOPIK 5 أو 6)",
      "سنة كاملة مجانية لتعلم اللغة الكورية في معاهد اللغات الجامعية المعتمدة وتغطية كاملة لتكاليف اختبار كفاءة اللغة الكورية (TOPIK)",
      "تذاكر طيران دولية كاملة ذهاباً وإياباً، وبدل استقرار نقدي عند الوصول (200,000 وون)، وبدل دعم بحثي وطباعة الأطروحة (210,000 - 240,000 وون)، ومنحة تخرج (100,000 وون)",
      "تغطية التأمين الصحي الوطني الكوري الشامل (NHIS) مع تصريح عمل طلابي وإمكانية التوظيف في كبرى التكتلات الكورية (Samsung, LG, Hyundai, SK Hynix)"
    ],
    coverageEn: [
      "100% Full Tuition Waiver and admission fees covered at all accredited South Korean universities",
      "Monthly living stipend of 1,000,000 to 1,500,000 KRW (plus 100,000 KRW/month TOPIK 5/6 proficiency bonus)",
      "1-Year Fully-Funded Intensive Korean Language Training at designated university language institutes and TOPIK exam fee grant",
      "Economy class round-trip international flights, arrival settlement allowance (200,000 KRW), research printing grant, and completion grant (100,000 KRW)",
      "Comprehensive National Health Insurance (NHIS), part-time student work permit, and direct hiring pathways with Samsung, LG, Hyundai, and SK Hynix"
    ],
    studyLanguages: ["الإنجليزية (مئات البرامج بالإنجليزية 100%)", "الكورية (مع سنة تحضيرية مجانية)"],
    degreeLevels: ["درجة البكالوريوس (Undergraduate - 4 سنوات + سنة لغة)", "درجة الماجستير (Master's - سنتان + سنة لغة)", "درجة الدكتوراه وأبحاث Postdoc (Ph.D. - 3 سنوات + سنة لغة)"],
    officialPortals: [
      { name: "البوابة الرسمية للدراسة في كوريا ومنحة GKS الحكومية (Study in Korea - NIIED)", nameEn: "Study in Korea - Official NIIED GKS Portal", url: "https://www.studyinkorea.go.kr/" },
      { name: "المعهد الوطني لتطوير التعليم الدولي الكوري (NIIED)", nameEn: "National Institute for International Education (NIIED)", url: "https://www.niied.go.kr/" },
      { name: "بوابة وزارة التعليم الكورية الرسمية (Ministry of Education)", nameEn: "Ministry of Education - Republic of Korea", url: "https://www.moe.go.kr/en/main.do" }
    ],
    overview: "كوريا الجنوبية هي المعقل التكنولوجي العالمي الأول في أشباه الموصلات، الذكاء الاصطناعي، الروبوتات، والبطاريات المتطورة؛ تقدم وزارة التعليم الكورية عبر المعهد الوطني لتطوير التعليم الدولي (NIIED) منحة GKS العالمية المرموقة، وتوفر أرقى الجامعات الكورية في تحالف SKY وKAIST تعليماً عالمياً باللغة الإنجليزية مدعوماً برواتب وتمويل كامل.",
    overviewEn: "South Korea is an economic and technological titan dominating semiconductors, AI, robotics, and advanced batteries. The Korean Ministry of Education (NIIED) funds thousands of global scholars via the prestigious Global Korea Scholarship (GKS/KGSP) across elite SKY and KAIST institutions.",
    topUniversities: [
      {
        name: "جامعة سيول الوطنية (Seoul National University - SNU)",
        nameEn: "Seoul National University (SNU)",
        city: "سيول",
        cityEn: "Seoul",
        ranking: "Top 31 QS World (#1 National University in Korea / SKY Apex)",
        type: "حكومية وطنية أولى ورمز النخبة الأكاديمية",
        typeEn: "Korea's Undisputed #1 Flagship National University",
        highlights: "الجامعة الوطنية الأولى في كوريا الجنوبية ورأس هرم تحالف SKY النخبوي، تخرج منها قادة كوريا السياسيون ورؤساء التكتلات الصناعية ورؤساء الوزراء والأمين العام السابق للأمم المتحدة بان كي مون.",
        highlightsEn: "Korea's premier flagship national university, apex of the prestigious SKY alliance, educating UN Secretary-General Ban Ki-moon and the nation's top judges and CEOs.",
        website: "https://www.snu.ac.kr/eng",
        faculties: ["كلية الهندسة وعلوم الحاسوب وهندسة المواد وأشباه الموصلات", "كلية الطب البشري ومستشفى جامعة سيول الوطنية (SNUH)", "كلية إدارة الأعمال والمالية الدولية (SNU Business School)", "كلية الدراسات العليا للشؤون الدولية والتنمية (GSIS)", "كلية العلوم الطبيعية والفيزياء والكيمياء النانوية"],
        facultiesEn: ["College of Engineering (CS, ECE & Semiconductor Science)", "College of Medicine & SNU University Hospital (SNUH)", "SNU Business School (AACSB Accredited)", "Graduate School of International Studies (GSIS)", "College of Natural Sciences & Quantum Nano"]
      },
      {
        name: "المعهد الكوري المتقدم للعلوم والتكنولوجيا (KAIST)",
        nameEn: "KAIST (Korea Advanced Institute of Science and Technology)",
        city: "دايجون / وادي دايدك",
        cityEn: "Daejeon / Daedeok Innopolis",
        ranking: "Top 53 QS World (Korea's MIT / 100% English STEM Powerhouse)",
        type: "حكومية بحثية تكنولوجية نخبوية",
        typeEn: "National Research Science & Tech Institute (Taught 100% in English)",
        highlights: "يُعرف بـ 'MIT كوريا الجنوبية'، يدرس باللغة الإنجليزية بنسبة 100% ويقع في وادي دايدك التكنولوجي (عاصمة الأبحاث الكورية)، المحرك الأساسي لابتكارات أشباه الموصلات، الذكاء الاصطناعي، وروبوتات HUBO.",
        highlightsEn: "Korea's MIT, taught 100% in English in Daedeok Innopolis, primary engine for semiconductor research, humanoid robotics (HUBO), and AI breakthroughs.",
        website: "https://www.kaist.ac.kr/en/",
        faculties: ["مدرسة كيم جاي تشول للذكاء الاصطناعي (KAIST Graduate School of AI)", "مدرسة الهندسة الكهربائية وعلوم الحاسوب وأشباه الموصلات", "كلية الهندسة الميكانيكية وهندسة الطيران والفضاء والروبوتات", "كلية العلوم الحيوية والهندسة الطبية الحيوية", "كلية الأعمال والتكنولوجيا والابتكار الإداري"],
        facultiesEn: ["Kim Jaechul Graduate School of AI", "School of Electrical Engineering & Semiconductor Hub", "Department of Mechanical & Aerospace Engineering", "College of Life Science & Bioengineering", "KAIST College of Business & Innovation"]
      },
      {
        name: "جامعة كوريا وجامعة يونسي (Korea University & Yonsei - SKY)",
        nameEn: "Korea University & Yonsei University",
        city: "سيول",
        cityEn: "Seoul",
        ranking: "Top 67 & 56 QS World (Historic Private Titans of the SKY Alliance)",
        type: "خاصة كبرى ونخبوية من تحالف SKY",
        typeEn: "Historic Elite Private Universities (SKY Alliance Titans)",
        highlights: "يشكلان مع SNU مثلث قمة التعليم في كوريا (تحالف SKY)، وتتميز جامعة كوريا بقيادة علوم القانون والطب والأمن السيبراني، بينما تتصدر جامعة يونسي في الطب الدولي (مستشفى سيفيرانس Severance) وكلية أندروود الدولية (UIC).",
        highlightsEn: "Forms Korea's legendary SKY alliance; Korea University leads in Cybersecurity and Law, while Yonsei hosts Underwood International College (UIC) and Severance Hospital.",
        website: "https://www.korea.edu/",
        faculties: ["كلية أندروود الدولية للدراسات باللغة الإنجليزية (Underwood UIC Yonsei)", "كلية الأمن السيبراني وهندسة البرمجيات (Korea University)", "كلية الطب البشري ومستشفى سيفيرانس الطبي الرائد (Yonsei Severance)", "كلية إدارة الأعمال والتجارة الدولية (KUBS / Yonsei SOM)", "كلية العلوم والذكاء الاصطناعي وهندسة الذكاء الحسابي"],
        facultiesEn: ["Underwood International College (100% English Liberal Arts)", "School of Cybersecurity & Informatics (Korea University)", "Yonsei College of Medicine & Severance Hospital", "Korea University Business School (KUBS) & Yonsei SOM", "Faculty of AI, Data Science & Advanced Materials"]
      },
      {
        name: "جامعة بوهانغ للعلوم والتكنولوجيا (POSTECH)",
        nameEn: "Pohang University of Science and Technology (POSTECH)",
        city: "بوهانغ",
        cityEn: "Pohang",
        ranking: "Top 100 QS World (World-Class Semiconductor & Materials Hub / Backed by POSCO)",
        type: "خاصة تكنولوجية بحثية مركزة",
        typeEn: "Elite Science, Materials & Semiconductor Research Institute",
        highlights: "أنشأتها شركة بوسكو (POSCO) العالمية للصلب لتكون معهد أبحاث نخبوي بنسبة طلاب إلى أساتذة منخفضة جداً (5:1)، ومقر معمل بوهانغ للمسرعات الضوئية (Pohang Light Source) وأحدث أبحاث المواد النانوية والبطاريات.",
        highlightsEn: "Founded by steel giant POSCO with ultra-low student-faculty ratio (5:1), home to the Pohang Accelerator Laboratory (Synchrotron) and advanced battery innovation.",
        website: "https://www.postech.ac.kr/eng/",
        faculties: ["مدرسة أشباه الموصلات والمواد المتقدمة (POSTECH Semiconductor Hub)", "قسم علوم وهندسة المواد وتكنولوجيا النانو", "قسم علوم الحاسوب والذكاء الاصطناعي والحوسبة الفائقة", "قسم الهندسة الكيميائية وتكنولوجيا خلايا الطاقة والبطاريات", "معهد العلوم الطبية والبيوتكنولوجية التجريبية"],
        facultiesEn: ["Graduate School of Semiconductor Science", "Department of Materials Science & Engineering", "Department of Computer Science and Engineering", "Department of Chemical Engineering & Energy Materials", "Pohang Accelerator Laboratory & Biotechnology"]
      },
      {
        name: "جامعة سونغ كيون كوان (Sungkyunkwan University - SKKU)",
        nameEn: "Sungkyunkwan University (SKKU)",
        city: "سوون / سيول",
        cityEn: "Suwon / Seoul",
        ranking: "Top 120 QS World (Oldest University in East Asia - Est. 1398 / Samsung Partnership)",
        type: "خاصة كبرى بالشراكة الاستراتيجية مع مجموعة سامسونج",
        typeEn: "Historic Imperial Academy (Est. 1398) & Global Samsung Partner",
        highlights: "أقدم صرح أكاديمي في شرق آسيا (تأسس عام 1398 في عهد سلالة جوسون)، وتدار بالشراكة الاستراتيجية والدعم المالي والبحثي المباشر من مجموعة سامسونج (Samsung Group)، ورائدة أبحاث النانو والطب والبرمجيات.",
        highlightsEn: "Founded in 1398 as Joseon Dynasty's royal academy, co-managed and funded by Samsung Group, leading in Nanotechnology (CINAP), Medicine, and Software.",
        website: "https://www.skku.edu/eng/",
        faculties: ["مركز فيزياء الهياكل النانوية المدمجة مع سامسونج (CINAP Lab)", "مدرسة الطب البشري ومركز سامسونج الطبي العالمي (Samsung Medical Center)", "كلية هندسة البرمجيات وأشباه الموصلات والذكاء الاصطناعي", "كلية SKK لإدارة الأعمال العالمية (SKK GSB بالتعاون مع MIT Sloan)", "كلية الصيدلة والتكنولوجيا الحيوية للأدوية"],
        facultiesEn: ["Center for Integrated Nanostructure Physics (CINAP / Samsung)", "School of Medicine & Samsung Medical Center (SMC)", "College of Software & Semiconductor Systems Engineering", "SKK Graduate School of Business (GSB / Dual with MIT Sloan)", "School of Pharmacy & Bio-Therapeutics"]
      },
      {
        name: "معهد أولسان الوطني للعلوم والتكنولوجيا (UNIST)",
        nameEn: "Ulsan National Institute of Science and Technology (UNIST)",
        city: "أولسان",
        cityEn: "Ulsan",
        ranking: "Top 150 QS World (Global Pioneer in Battery Technology & Renewable Energy)",
        type: "حكومية وطنية متخصصة في الطاقة والبطاريات والذكاء الاصطناعي",
        typeEn: "National Research Powerhouse for Secondary Batteries & Clean Tech",
        highlights: "القطب العلمي الأول عالمياً في أبحاث بطاريات الليثيوم والبطاريات الثانوية وتكنولوجيا الطاقة المتجددة، يقع في عاصمة الصناعة الكورية أولسان (مقر هيونداي وبتروكيماويات SK)، وتدريس باللغة الإنجليزية بنسبة 100%.",
        highlightsEn: "World leader in secondary battery tech and solar cells, located in Korea's industrial capital (Hyundai hub), 100% English-medium research university.",
        website: "https://www.unist.ac.kr/",
        faculties: ["مدرسة هندسة الطاقة والكيمياء وأبحاث البطاريات الثانوية (Battery Tech)", "مدرسة علوم الحاسوب والذكاء الاصطناعي (Graduate School of AI)", "مدرسة الهندسة الميكانيكية والسيارات ذاتية القيادة (Hyundai Hub)", "مدرسة العلوم والتكنولوجيا الطبية الحيوية", "مدرسة علوم المواد المتقدمة وهندسة النانو"],
        facultiesEn: ["School of Energy & Chemical Engineering (Next-Gen Batteries)", "School of Computer Science & Graduate School of AI", "School of Mechanical & Autonomous Mobility Engineering", "School of Biomedical Engineering", "School of Materials Science & Engineering"]
      }
    ]
  },
  {
    country: "اليابان",
    countryEn: "Japan",
    flag: "🇯🇵",
    region: "شرق آسيا",
    regionEn: "East Asia",
    tier: "guaranteed",
    category: "eurasia_eastasia",
    scholarshipName: "منحة الحكومة اليابانية الرسمية (MEXT - Monbukagakusho Scholarships) ومنح الجامعات الإمبراطورية ومؤسسة JASSO",
    scholarshipNameEn: "Japanese Government (MEXT) Scholarships, Imperial University Grants & JASSO Honors",
    applicationWindow: "أبريل – يونيو (مسار السفارات اليابانية سنوياً) / سبتمبر – ديسمبر (مسار القبول الجامعي المباشر)",
    applicationWindowEn: "Apr – Jun (Embassy Recommendation Track) / Sep – Dec (University Recommendation Track)",
    fundingType: "ممولة بالكامل 100% (إعفاء دراسي كامل 100% + راتب شهري 120,000 - 150,000 ين + تذاكر وتأمين وسنة لغة)",
    fundingTypeEn: "Fully Funded 100% (100% Tuition Waiver + 120,000-150,000 JPY/mo Stipend + Airfare + Health Care)",
    coverage: [
      "إعفاء دراسي كامل 100% من رسوم التقديم والتسجيل وكافة الرسوم الدراسية الجامعية في جامعات اليابان الوطنية والإمبراطورية",
      "راتب شهري معيشي معفى من الضرائب يتراوح بين 117,000 إلى 145,000 ين ياباني شهرياً (مع علاوة خاصة 2,000 - 3,000 ين للمناطق الباردة والمدن الكبرى)",
      "تذاكر طيران دولية كاملة ذهاباً وإياباً على الدرجة الاقتصادية بين بلد الإقامة واليابان عند بدء المنحة ونهايتها",
      "سنة تحضيرية مكثفة ومجانية لتعلم اللغة والثقافة اليابانية (للبرامج التي تتطلب اللغة) مع إتاحة مئات البرامج للدراسة باللغة الإنجليزية 100%",
      "تغطية التأمين الصحي الوطني الياباني (NHI) وتصريح عمل رسمي للطلاب (28 ساعة أسبوعياً) مع فرص التوظيف في كبرى الشركات اليابانية (Toyota, Sony, SoftBank, Rakuten)"
    ],
    coverageEn: [
      "100% Full Tuition, admission, and entrance examination fee waivers at all national and imperial Japanese universities",
      "Tax-free monthly living allowance of 117,000 to 145,000 JPY (plus regional climate/cost-of-living supplemental bonuses)",
      "Round-trip economy class international airfare between home country and Japan at the start and completion of the scholarship",
      "6-month to 1-year Intensive Japanese Language & Cultural Training (or direct entry to hundreds of 100% English-taught degree tracks)",
      "National Health Insurance (NHI) coverage, 28 hrs/week student work rights, and direct recruiting pathways with Toyota, Sony, SoftBank, and Rakuten"
    ],
    studyLanguages: ["الإنجليزية (مئات البرامج بالإنجليزية 100%)", "اليابانية (مع سنة لغة يابانية تحضيرية مكثفة)"],
    degreeLevels: ["درجة البكالوريوس (Undergraduate - 4 سنوات + سنة لغة)", "كليات التكنولوجيا المتقدمة والمعاهد الفنية (KOSEN)", "درجة الماجستير والدكتوراه والأبحاث العليا (Research Students, Master's & Ph.D.)"],
    officialPortals: [
      { name: "بوابة الدراسة في اليابان الرسمية ومنح MEXT الحكومية (Study in Japan - JASSO)", nameEn: "Study in Japan - Official JASSO MEXT Portal", url: "https://www.studyinjapan.go.jp/en/" },
      { name: "بوابة وزارة التعليم والثقافة والرياضة والعلوم والتقنية اليابانية (MEXT)", nameEn: "Ministry of Education, Culture, Sports, Science and Technology (MEXT)", url: "https://www.mext.go.jp/en/" },
      { name: "المنظمة اليابانية لخدمات الطلاب (JASSO Japan)", nameEn: "Japan Student Services Organization (JASSO)", url: "https://www.jasso.go.jp/en/" }
    ],
    overview: "اليابان هي القوة التكنولوجية والصناعية الرائدة في الدقة الهندسية، صناعة الروبوتات، فيزياء الكم، التقنيات الحيوية، والسيارات؛ تقدم وزارة التعليم والثقافة والعلوم والتكنولوجيا اليابانية (MEXT) منحة Monbukagakusho المرموقة لتمويل الطلاب الدوليين بالكامل للدراسة في أعرق الجامعات الإمبراطورية التي خرجت أكثر من 29 حائزاً على نوبل.",
    overviewEn: "Japan is a global titan in precision engineering, robotics, quantum materials, space exploration, and life sciences. The Japanese Government's MEXT Scholarship covers 100% of study and living expenses, granting international scholars access to world-leading Imperial Universities and cutting-edge research laboratories.",
    topUniversities: [
      {
        name: "جامعة طوكيو (The University of Tokyo - Todai)",
        nameEn: "The University of Tokyo (Todai)",
        city: "طوكيو",
        cityEn: "Tokyo",
        ranking: "Top 28 QS World (#1 Imperial University in Japan / 16 Nobel Laureates)",
        type: "حكومية إمبراطورية أولى ورمز الريادة العلمية في آسيا",
        typeEn: "Japan's Premier Imperial University & Asian Academic Apex",
        highlights: "الجامعة الإمبراطورية الأولى في اليابان والمصنفة رقم 1 في البلاد، أنجبت 16 حائزاً على جائزة نوبل، و15 رئيساً لوزراء اليابان، ومقر معهد أبحاث الزلازل ومعهد طوكيو لأبحاث الذكاء الاصطناعي والفيزياء الكونية.",
        highlightsEn: "Japan's undisputed #1 university (est. 1877), educated 16 Nobel Laureates and 15 Japanese Prime Ministers, global leader in Quantum Physics, Robotics, and Seismic Engineering.",
        website: "https://www.u-tokyo.ac.jp/en/",
        faculties: ["كلية الهندسة وعلوم الحوسبة وهندسة الملاحة الفضائية والروبوتات", "كلية الطب ومستشفى جامعة طوكيو ومعهد العلوم الطبية (IMSUT)", "مدرسة الدراسات العليا في الاقتصاد والأعمال (UTokyo Econ)", "مدرسة الدراسات العليا في العلوم والفيزياء الفلكية والكيمياء النانوية", "مدرسة الدراسات العليا للسياسات العامة والقانون الدولي (GraSPP)"],
        facultiesEn: ["Faculty of Engineering (AeroAstro, Precision Mech, CS & AI)", "Faculty of Medicine & Institute of Medical Science (IMSUT)", "Graduate School of Economics", "Graduate School of Science (IPMU Astrophysics & Nano)", "Graduate School of Public Policy (GraSPP)"]
      },
      {
        name: "جامعة كيوتو (Kyoto University - Kyodai)",
        nameEn: "Kyoto University (Kyodai)",
        city: "كيوتو",
        cityEn: "Kyoto",
        ranking: "Top 46 QS World (The Nobel Laureates Engine / 19 Nobel Laureates / Est. 1897)",
        type: "حكومية إمبراطورية عريقة ورائدة العلوم الأساسية",
        typeEn: "Japan's Legendary Nobel Prize Engine & Research Powerhouse",
        highlights: "ثاني أعرق جامعة إمبراطورية في اليابان والمعروفة بـ 'مصنع جوائز نوبل' (19 حائزاً على نوبل وميداليتي فيلدز)، ومسقط رأس ابتكار الخلايا الجذعية المستحثة (iPS Cells) بقيادة شينيا ياماناكا ومعهد أبحاث الفيروسات.",
        highlightsEn: "Second oldest imperial university, celebrated home of 19 Nobel Laureates, birthplace of induced Pluripotent Stem (iPS) Cells (Shinya Yamanaka), and theoretical physics.",
        website: "https://www.kyoto-u.ac.jp/en/",
        faculties: ["مركز أبحاث وتطبيقات الخلايا الجذعية المستحثة (CiRA)", "مدرسة الهندسة والعلوم التطبيقية وهندسة الطاقة والبوليمرات", "كلية الطب البشري والعلوم السريرية ومستشفى جامعة كيوتو", "معهد يوكاوا للفيزياء النظرية (Yukawa Institute)", "كلية الإدارة والاقتصاد وإدارة التكنولوجيا (GSM Kyoto)"],
        facultiesEn: ["Center for iPS Cell Research and Application (CiRA)", "Faculty of Engineering & Synthetic Chemistry", "Faculty of Medicine & Kyoto University Hospital", "Yukawa Institute for Theoretical Physics (YITP)", "Graduate School of Management (GSM)"]
      },
      {
        name: "معهد طوكيو للعلوم والتكنولوجيا (Institute of Science Tokyo)",
        nameEn: "Institute of Science Tokyo (Merged Tokyo Tech & TMDU)",
        city: "طوكيو",
        cityEn: "Tokyo",
        ranking: "Top 80 QS World (New Titan Merging Top Tech & Medical University)",
        type: "حكومية وطنية تكنولوجية وطبية متقدمة",
        typeEn: "World-Leading Science, Tech, Medicine & Dentistry Powerhouse",
        highlights: "الصرح العملاق الجديد الناتج عن اندماج معهد طوكيو للتكنولوجيا (Tokyo Tech) وجامعة طوكيو للطب وطب الأسنان (TMDU)، ومقر الحاسوب الخارق TSUBAME، ومصنف التوب 3 عالمياً في طب الأسنان والتكنولوجيا الحيوية.",
        highlightsEn: "New mega-institution created from the historic merger of Tokyo Tech and Tokyo Medical and Dental University (TMDU), home to the TSUBAME Supercomputer and world #3 Dentistry.",
        website: "https://www.isct.ac.jp/en",
        faculties: ["مدرسة الحوسبة وهندسة الذكاء الاصطناعي والحاسوب الخارق (TSUBAME Hub)", "مدرسة طب الأسنان والعلوم الفموية التخصصية (المصنفة #3 عالمياً)", "مدرسة الطب البشري والعلوم الطبية الحيوية المتقدمة", "مدرسة الهندسة الميكانيكية والكهربائية والمواد والنانو", "مدرسة علوم الحياة وتكنولوجيا الهندسة البيولوجية"],
        facultiesEn: ["School of Computing (TSUBAME Supercomputer & AI)", "Faculty of Dentistry & Oral Health Sciences (Global #3)", "Faculty of Medicine & Biomedical Advanced Sciences", "School of Engineering & Materials Science", "School of Life Science and Technology"]
      },
      {
        name: "جامعة أوساكا (Osaka University - Handai)",
        nameEn: "Osaka University (Handai)",
        city: "أوساكا",
        cityEn: "Osaka",
        ranking: "Top 80 QS World (Global Pioneer in Immunology, Robotics & Laser Science)",
        type: "حكومية إمبراطورية كبرى",
        typeEn: "Major Imperial Research Powerhouse in Kansai",
        highlights: "الجامعة الإمبراطورية الرائدة في إقليم كانساي، تتصدر العالم في أبحاث المناعة البشرية (IFReC)، هندسة الليزر والطاقة الاندماجية (ILE)، وصناعة الروبوتات الشبيهة بالبشر (مختبر هيروشي إيشيغورو).",
        highlightsEn: "Premier Kansai imperial university, world pioneer in Immunology (WPI Immunology Frontier Research Center - IFReC), Humanoid Robotics (Hiroshi Ishiguro), and High-Power Laser Energy.",
        website: "https://www.osaka-u.ac.jp/en",
        faculties: ["مركز أبحاث حدود المناعة العالمي (WPI IFReC Immunology)", "معهد هندسة الليزر والطاقة الاندماجية المتقدمة (ILE)", "كلية الهندسة والعلوم الهندسية والروبوتات والذكاء الاصطناعي", "كلية الطب البشري ومستشفى جامعة أوساكا الجامعي", "مدرسة الدراسات الدولية واللغات والدبلوماسية"],
        facultiesEn: ["Immunology Frontier Research Center (WPI IFReC)", "Institute of Laser Engineering (ILE)", "School of Engineering Science & Humanoid Robotics Lab", "Faculty of Medicine & Osaka University Hospital", "School of Foreign Studies & Global Affairs"]
      },
      {
        name: "جامعة توهوكو (Tohoku University)",
        nameEn: "Tohoku University",
        city: "سنداي / مياغي",
        cityEn: "Sendai / Miyagi",
        ranking: "#1 in Japan by Times Higher Education (Materials Science & Spintronics Capital)",
        type: "حكومية إمبراطورية رائدة الأبحاث العالمية",
        typeEn: "Japan's #1 Ranked University by THE (Materials Science Leader)",
        highlights: "صُنفت كأفضل جامعة في اليابان لعدة سنوات متتالية في تصنيف THE، أول جامعة يابانية تقبل الإناث والطلاب الأجانب، وتتصدر العالم في علوم المواد والإلكترونيات الدورانية (Spintronics) وفيزياء المعادن.",
        highlightsEn: "Ranked #1 in Japan for multiple years (THE), first Japanese university to admit women and international scholars, world capital for Materials Science and Spintronics.",
        website: "https://www.tohoku.ac.jp/en/",
        faculties: ["معهد أبحاث المواد المتقدمة والفيزياء الصلبة (IMR)", "مركز أبحاث الإلكترونيات الدورانية والحوسبة المتقدمة (CSIS)", "كلية الهندسة وعلوم الحاسوب والاتصالات الفضائية", "كلية الطب البشري والبنك الحيوي الطبي المتقدم (ToMMo)", "كلية العلوم والجيولوجيا وعلم البراكين والمحيطات"],
        facultiesEn: ["Institute for Materials Research (IMR)", "Center for Spintronics Integrated Systems (CSIS)", "School of Engineering & Aerospace Telecommunications", "School of Medicine & Tohoku Medical Megabank (ToMMo)", "Faculty of Science & Earth Planetary Sciences"]
      },
      {
        name: "جامعة ناغويا وجامعة كيوشو (Nagoya & Kyushu Universities)",
        nameEn: "Nagoya University & Kyushu University",
        city: "ناغويا / فوكوكا",
        cityEn: "Nagoya / Fukuoka",
        ranking: "Top 130 QS World (Heart of Japanese Nobel Physics & Aerospace Capital)",
        type: "حكومية إمبراطورية كبرى ومراكز صناعية عالمية",
        typeEn: "Imperial Research Powerhouses & Automotive/Aerospace Capitals",
        highlights: "جامعة ناغويا مهد 6 جوائز نوبل في الفيزياء والكيمياء واختراع مصابيح LED الزرقاء، وتقع في قلب عاصمة صناعة السيارات (تويوتا) وهندسة الطيران، وجامعة كيوشو رائدة طاقة الهيدروجين والذكاء الاصطناعي في فوكوكا.",
        highlightsEn: "Nagoya University is the home of 6 Nobel Laureates and the invention of Blue LEDs in the heart of Toyota's aerospace/automotive hub, partnered with Kyushu's Hydrogen Energy center.",
        website: "https://en.nagoya-u.ac.jp/",
        faculties: ["معهد علوم المواد التحويلية الحائز على نوبل (ITbM Nagoya)", "كلية الهندسة وهندسة السيارات وهندسة الطيران والفضاء (Toyota Hub)", "المعهد الدولي لأبحاث الطاقة الخالية من الكربون وطاقة الهيدروجين (I2CNER Kyushu)", "كلية الطب البشري والعلوم السريرية ومستشفيات ناغويا وكيوشو", "كلية العلوم الحسابية والذكاء الاصطناعي والأمن السيبراني"],
        facultiesEn: ["Institute of Transformative Bio-Molecules (ITbM / Nobel Hub)", "School of Engineering (Automotive & Aerospace Engineering)", "International Institute for Carbon-Neutral Energy Research (I2CNER)", "Graduate School of Medicine (Nagoya & Kyushu)", "School of Informatics, Data Science & Cybersecurity"]
      }
    ]
  },
  {
    country: "أذربيجان",
    countryEn: "Azerbaijan",
    flag: "🇦🇿",
    region: "القوقاز / أوراسيا",
    regionEn: "Caucasus / Eurasia",
    tier: "guaranteed",
    category: "eurasia_eastasia",
    scholarshipName: "منحة برنامج حيدر علييف لدول عدم الانحياز والتعاون الإسلامي",
    scholarshipNameEn: "Heydar Aliyev International Education Grant Program",
    applicationWindow: "يناير – مارس (سنوياً)",
    applicationWindowEn: "Jan – Mar (Annually)",
    fundingType: "ممولة بالكامل 100%",
    fundingTypeEn: "Fully Funded 100%",
    coverage: ["إعفاء كامل من الرسوم الدراسية 100%", "سكن جامعي مجاني أو بدل سكن", "راتب شهري (800 مانات)", "تأمين صحي وتذاكر طيران سنوية"],
    coverageEn: ["100% Tuition Waiver", "Free Accommodation or Housing Subsidy", "Monthly Allowance (800 AZN)", "Health Insurance & Annual Flight Tickets"],
    studyLanguages: ["الإنجليزية", "الأذرية"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "الطب العام"],
    officialPortals: [
      { name: "بوابة منحة أذربيجان الدولية (SIEP)", nameEn: "Study in Azerbaijan (SIEP Grants)", url: "https://studyinazerbaijan.edu.az/" }
    ],
    overview: "منحة حكومية سنوية تغطي كافة التخصصات الهندسية والطبية وإدارة الطاقة باللغة الإنجليزية في العاصمة باكو.",
    overviewEn: "Official government grant for international students studying engineering, medicine, and energy in Baku.",
    topUniversities: [
      {
        name: "جامعة أذربيجان الحكومية للنفط والصناعة",
        nameEn: "Azerbaijan State Oil and Industry University (ASOIU)",
        city: "باكو",
        cityEn: "Baku",
        highlights: "أقدم جامعة نفط وهندسة في العالم وتدريس بالإنجليزية.",
        highlightsEn: "World's historic oil & energy engineering university with English programs.",
        website: "http://asoiu.edu.az/"
      },
      {
        name: "جامعة ADA",
        nameEn: "ADA University",
        city: "باكو",
        cityEn: "Baku",
        highlights: "أحدث وأرقى صرح أكاديمي دولي في الدبلوماسية وتقنية المعلومات والأعمال.",
        highlightsEn: "State-of-the-art international university for diplomacy, computing, and business.",
        website: "https://www.ada.edu.az/"
      }
    ]
  },
];

// Enrich top flagship universities with direct scholarships, student presence, and notable alumni
export const GLOBAL_COUNTRIES: GlobalCountryStat[] = RAW_GLOBAL_COUNTRIES.map((country) => {
  const enrichedUnis = country.topUniversities.map((uni) => {
    const enrichment = GLOBAL_FLAGSHIP_ENRICHMENTS[uni.name];
    if (!enrichment) return uni;
    return {
      ...uni,
      activeScholarship: enrichment.activeScholarship || uni.activeScholarship,
      studentPresence: enrichment.studentPresence || uni.studentPresence,
      notableAlumni: enrichment.notableAlumni || uni.notableAlumni,
    };
  });

  // Sort universities so that flagship universities with active scholarships and student presence appear first!
  enrichedUnis.sort((a, b) => {
    const aScore = (a.activeScholarship ? 2 : 0) + (a.notableAlumni?.length ? 1 : 0);
    const bScore = (b.activeScholarship ? 2 : 0) + (b.notableAlumni?.length ? 1 : 0);
    return bScore - aScore;
  });

  return {
    ...country,
    topUniversities: enrichedUnis,
  };
});

export const GLOBAL_LANG_TRANSLATIONS: Record<string, string> = {
  "التركية": "Turkish",
  "الإنجليزية": "English",
  "الإنجليزية 100%": "100% English",
  "الروسية": "Russian",
  "الصينية (ماندرين)": "Chinese (Mandarin)",
  "المجرية (مع سنة لغة)": "Hungarian (with prep year)",
  "الألمانية": "German",
  "الكورية": "Korean",
  "اليابانية": "Japanese",
  "الفرنسية": "French",
  "الإيطالية": "Italian",
  "الرومانية (مع سنة لغة مجانية)": "Romanian (with free prep year)",
  "السويدية": "Swedish",
  "الهولندية": "Dutch",
  "البولندية": "Polish",
  "التشيكية": "Czech",
  "الإسبانية": "Spanish",
  "الأذرية": "Azerbaijani",
  "اللغات الأوروبية المشتركة": "Pan-European Languages",
};

export const GLOBAL_DEGREE_TRANSLATIONS: Record<string, string> = {
  "بكالوريوس": "Bachelor's",
  "ماجستير": "Master's",
  "دكتوراه": "PhD",
  "بحوث": "Research",
  "أبحاث ما بعد الدكتوراه": "Postdoctoral Research",
  "زمالات بحثية": "Research Fellowships",
  "كليات التكنولوجيا": "Technology Colleges",
  "الطب البشري وطب الأسنان والصيدلة (برامج متكاملة)": "Medicine, Dentistry & Pharmacy (Integrated)",
  "إقامة طبية (Residency)": "Medical Residency",
  "ماجستير لمدة عام واحد": "1-Year Master's",
  "ماجستير مشترك": "Joint Master's",
};

export const GLOBAL_CITY_TRANSLATIONS: Record<string, string> = {
  "أنقرة": "Ankara",
  "إسطنبول": "Istanbul",
  "إزمير": "Izmir",
  "موسكو": "Moscow",
  "سانت بطرسبرغ": "Saint Petersburg",
  "كازان": "Kazan",
  "تومسك": "Tomsk",
  "نوفوسيبيرسك": "Novosibirsk",
  "يكاترينبورغ": "Yekaterinburg",
  "دولغوبرودني": "Dolgoprudny",
  "كالينينغراد": "Kaliningrad",
  "بكين": "Beijing",
  "هانغتشو": "Hangzhou",
  "دبرتسن": "Debrecen",
  "بودابست": "Budapest",
  "ميونخ": "Munich",
  "هايدلبرغ": "Heidelberg",
  "أكسفورد": "Oxford",
  "كامبريدج": "Cambridge",
  "كامبريدج / بوسطن": "Cambridge / Boston",
  "لندن": "London",
  "إدنبرة / اسكتلندا": "Edinburgh / Scotland",
  "مانشستر / ليدز": "Manchester / Leeds",
  "كاليفورنيا": "California",
  "كاليفورنيا / وادي السيليكون": "Stanford / Silicon Valley",
  "بيركلي / خليج سان فرانسيسكو": "Berkeley / SF Bay Area",
  "نيويورك": "New York City",
  "برنستون / نيوجيرسي": "Princeton / NJ",
  "باسادينا / لوس أنجلوس": "Pasadena / Los Angeles",
  "تورنتو / أونتاريو": "Toronto / Ontario",
  "مونتريال / كيبيك": "Montreal / Quebec",
  "فانكوفر / كولومبيا البريطانية": "Vancouver / BC",
  "واترلو / أونتاريو": "Waterloo / Ontario",
  "إدمونتون / هاملتون": "Edmonton / Hamilton",
  "ملبورن / فيكتوريا": "Melbourne / Victoria",
  "كانبرا / العاصمة الفيدرالية": "Canberra / ACT",
  "سيدني / نيو ساوث ويلز": "Sydney / NSW",
  "بريزبن / كوينزلاند": "Brisbane / Queensland",
  "سيول": "Seoul",
  "دايجون": "Daejeon",
  "دايجون / وادي دايدك": "Daejeon / Daedeok",
  "بوهانغ": "Pohang",
  "سوون / سيول": "Suwon / Seoul",
  "أولسان": "Ulsan",
  "طوكيو": "Tokyo",
  "كيوتو": "Kyoto",
  "أوساكا": "Osaka",
  "سنداي / مياغي": "Sendai / Miyagi",
  "ناغويا / فوكوكا": "Nagoya / Fukuoka",
  "عواصم أوروبية متعددة": "Multiple EU Capitals",
  "بولونيا": "Bologna",
  "ميلانو": "Milan",
  "روما": "Rome",
  "بوخارست": "Bucharest",
  "باريس": "Paris",
  "باريس / ساكلاي": "Paris / Saclay",
  "باليزو / باريس": "Palaiseau / Paris",
  "مرسيليا / ليون": "Marseille / Lyon",
  "ستوكهولم": "Stockholm",
  "لوند / سكانيا": "Lund / Scania",
  "أوبسالا": "Uppsala",
  "غوتنبرغ": "Gothenburg",
  "زيورخ": "Zurich",
  "لوزان": "Lausanne",
  "جنيف": "Geneva",
  "بازل": "Basel",
  "برن / لوزان": "Bern / Lausanne",
  "مونتريال": "Montreal",
  "تورونتو": "Toronto",
  "سيدني": "Sydney",
  "ملبورن": "Melbourne",
  "كانبرا": "Canberra",
  "أمستردام": "Amsterdam",
  "دلفت": "Delft",
  "فاخينينجن": "Wageningen",
  "لايدن / لاهاي": "Leiden / The Hague",
  "أوتريخت": "Utrecht",
  "إيندهوفن": "Eindhoven",
  "وارسو": "Warsaw",
  "كراكوف": "Krakow",
  "براغ": "Prague",
  "برنو": "Brno",
  "بروكسل": "Brussels",
  "لوفان": "Leuven",
  "غنت": "Ghent",
  "لوفان لا نوف / بروكسل": "Louvain-la-Neuve / Brussels",
  "أنتويرب": "Antwerp",
  "مدريد": "Madrid",
  "برشلونة": "Barcelona",
  "برشلونة / كتالونيا": "Barcelona / Catalonia",
  "برشلونة / مدريد": "Barcelona / Madrid",
  "مدريد / بنبلونة": "Madrid / Pamplona",
  "فيينا": "Vienna",
  "إنسبروك": "Innsbruck",
  "باكو": "Baku",
  "كوالالمبور": "Kuala Lumpur",
  "بيراك": "Perak",
};

export const getStudyLanguageLabels = (languages: string[], lang: "ar" | "en" = "ar"): string[] => {
  if (lang === "ar") return languages;
  return languages.map((l) => GLOBAL_LANG_TRANSLATIONS[l] || l);
};

export const getDegreeLevelLabel = (degree: string, lang: "ar" | "en" = "ar"): string => {
  if (lang === "ar") return degree;
  return GLOBAL_DEGREE_TRANSLATIONS[degree] || degree;
};

export const getGlobalCityLabel = (city: string, lang: "ar" | "en" = "ar"): string => {
  if (lang === "ar") return city;
  return GLOBAL_CITY_TRANSLATIONS[city] || city;
};
