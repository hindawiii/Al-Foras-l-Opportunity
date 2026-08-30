export interface GlobalCountryStat {
  country: string;
  countryEn: string;
  flag: string;
  region: string;
  regionEn: string;
  tier: "guaranteed" | "periodic";
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
  topUniversities: Array<{
    name: string;
    nameEn: string;
    city: string;
    cityEn: string;
    ranking?: string;
    highlights: string;
    highlightsEn: string;
    website: string;
  }>;
}

export const GLOBAL_COUNTRIES: GlobalCountryStat[] = [
  {
    country: "تركيا",
    countryEn: "Turkey",
    flag: "🇹🇷",
    region: "أوراسيا",
    regionEn: "Eurasia",
    tier: "guaranteed",
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
      { name: "جامعة الشرق الأوسط التقنية", nameEn: "Middle East Technical University (METU)", city: "أنقرة", cityEn: "Ankara", ranking: "Top 350 QS", highlights: "أقوى جامعة هندسية وتقنية، التدريس باللغة الإنجليزية بالكامل.", highlightsEn: "Leading engineering and technical powerhouse, taught 100% in English.", website: "https://www.metu.edu.tr/" },
      { name: "جامعة إسطنبول", nameEn: "Istanbul University", city: "إسطنبول", cityEn: "Istanbul", ranking: "Historic Top", highlights: "أعرق وأكبر جامعات تركيا، رائدة في الطب والقانون والآداب.", highlightsEn: "Oldest prestigious Turkish institution with historic medicine and law faculties.", website: "https://www.istanbul.edu.tr/" },
      { name: "جامعة بوغازيتشي", nameEn: "Boğaziçi University", city: "إسطنبول", cityEn: "Istanbul", ranking: "Top QS", highlights: "صرح نخبوي يطل على البوسفور وينافس عالمياً في إدارة الأعمال والعلوم.", highlightsEn: "Elite scenic institution on the Bosphorus, globally renowned in business & sciences.", website: "https://www.boun.edu.tr/" },
      { name: "جامعة كوتش", nameEn: "Koç University", city: "إسطنبول", cityEn: "Istanbul", ranking: "Top Private", highlights: "أقوى جامعة بحثية خاصة في تركيا ومستشفى جامعي عالمي.", highlightsEn: "Top private research university with world-class medical hospital.", website: "https://www.ku.edu.tr/" }
    ]
  },
  {
    country: "روسيا",
    countryEn: "Russia",
    flag: "🇷🇺",
    region: "أوروبا الشرقية وآسيا",
    regionEn: "Eastern Europe & North Asia",
    tier: "guaranteed",
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
      { name: "جامعة لومونوسوف موسكو الحكومية", nameEn: "Lomonosov Moscow State University (MSU)", city: "موسكو", cityEn: "Moscow", ranking: "Top 90 QS", highlights: "الجامعة الروسية الأولى عالمياً وموطن رواد الفضاء والعلماء.", highlightsEn: "Premier Russian university, world-renowned in mathematics, physics, and medicine.", website: "https://www.msu.ru/" },
      { name: "جامعة الصداقة بين الشعوب (RUDN)", nameEn: "Peoples' Friendship University of Russia (RUDN)", city: "موسكو", cityEn: "Moscow", ranking: "Top Medical", highlights: "أشهر جامعة دولية في روسيا تحتضن طلاباً من 160 دولة، رائدة بالطب.", highlightsEn: "Most diverse international university, prominent medical and engineering schools.", website: "https://www.rudn.ru/" },
      { name: "جامعة سانت بطرسبرغ الحكومية", nameEn: "Saint Petersburg State University (SPbU)", city: "سانت بطرسبرغ", cityEn: "Saint Petersburg", ranking: "Top 300 QS", highlights: "صرح إمبراطوري عريق تخرج منه رؤساء وعلماء نوبل.", highlightsEn: "Historic prestigious imperial university educating Nobel laureates and world leaders.", website: "https://spbu.ru/" }
    ]
  },
  {
    country: "الصين",
    countryEn: "China",
    flag: "🇨🇳",
    region: "شرق آسيا",
    regionEn: "East Asia",
    tier: "guaranteed",
    scholarshipName: "منحة الحكومة الصينية (CSC) ومنح المقاطعات والبلديات",
    scholarshipNameEn: "Chinese Government Scholarship (CSC) & Provincial Grants",
    applicationWindow: "ديسمبر – أبريل (سنوياً)",
    applicationWindowEn: "Dec – Apr (Annually)",
    fundingType: "ممولة بالكامل براتب شهري مرتفع",
    fundingTypeEn: "Fully Funded with Generous Monthly Stipend",
    coverage: ["إعفاء كامل من رسوم الدراسة 100%", "سكن جامعي مجاني حديث", "راتب شهري (2,500 إلى 3,500 يوان)", "تأمين طبي شامل"],
    coverageEn: ["100% Tuition Waiver", "Free Modern Dormitory", "Monthly Stipend (2,500 - 3,500 RMB)", "Comprehensive Medical Insurance"],
    studyLanguages: ["الإنجليزية", "الصينية (ماندرين)"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة مجلس المنح الصيني الرسمي (CSC)", nameEn: "China Scholarship Council (CSC)", url: "https://www.campuschina.org/" }
    ],
    overview: "قوة تكنولوجية واقتصادية عالمية؛ توفر الصين آلاف المنح للدراسات باللغة الإنجليزية في الذكاء الاصطناعي، الهندسة، الطب، والتجارة الدولية.",
    overviewEn: "Global innovation hub offering thousands of English-taught scholarships in AI, engineering, and medicine.",
    topUniversities: [
      { name: "جامعة تسينغهوا", nameEn: "Tsinghua University", city: "بكين", cityEn: "Beijing", ranking: "Top 15 QS World", highlights: "أقوى جامعة هندسية وتكنولوجية في آسيا ومن الأفضل عالمياً.", highlightsEn: "Top engineering and tech university in Asia, ranked #15 globally.", website: "https://www.tsinghua.edu.cn/" },
      { name: "جامعة بكين", nameEn: "Peking University", city: "بكين", cityEn: "Beijing", ranking: "Top 20 QS World", highlights: "صرح الأبحاث والطب والعلوم الإنسانية الرائد في الصين.", highlightsEn: "China's premier liberal arts, scientific research, and medical institution.", website: "https://www.pku.edu.cn/" },
      { name: "جامعة تشجيانغ", nameEn: "Zhejiang University", city: "هانغتشو", cityEn: "Hangzhou", ranking: "Top 50 QS", highlights: "معقل الابتكار والذكاء الاصطناعي وعلوم الحاسوب.", highlightsEn: "Major hub of tech innovation, computer science, and medicine.", website: "https://www.zju.edu.cn/" }
    ]
  },
  {
    country: "المجر (هنغاريا)",
    countryEn: "Hungary",
    flag: "🇭🇺",
    region: "الاتحاد الأوروبي",
    regionEn: "European Union",
    tier: "guaranteed",
    scholarshipName: "منحة الحكومة المجرية (Stipendium Hungaricum)",
    scholarshipNameEn: "Stipendium Hungaricum Scholarship",
    applicationWindow: "نوفمبر – 15 يناير (سنوياً)",
    applicationWindowEn: "Nov – Jan 15 (Annually)",
    fundingType: "ممولة بالكامل داخل الاتحاد الأوروبي",
    fundingTypeEn: "Fully Funded within the European Union",
    coverage: ["إعفاء من الرسوم الدراسية 100%", "راتب شهري للمعيشة", "سكن مجاني أو بدل سكن شهري", "تأمين صحي أوروبي شامل", "شهادة معتمدة في كل دول الاتحاد الأوروبي"],
    coverageEn: ["100% Tuition Exemption", "Monthly Living Allowance", "Free Dormitory or Housing Subsidy", "Full EU Health Insurance", "EU-Accredited Degree"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه", "الطب البشري وطب الأسنان والصيدلة (برامج متكاملة)"],
    officialPortals: [
      { name: "البوابة الرسمية لمنحة Stipendium Hungaricum", nameEn: "Stipendium Hungaricum Official Portal", url: "https://stipendiumhungaricum.hu/" },
      { name: "مؤسسة تمبوس العامة المجرية (TPF)", nameEn: "Tempus Public Foundation", url: "https://tka.hu/english" }
    ],
    overview: "البوابة الأسهل والأكثر موثوقية للدراسة باللغة الإنجليزية في الاتحاد الأوروبي، وتغطي دراسة الطب البشري وطب الأسنان والهندسة بالكامل.",
    overviewEn: "Premier gateway to English-medium EU education, fully covering general medicine, dentistry, and engineering.",
    topUniversities: [
      { name: "جامعة دبرتسن", nameEn: "University of Debrecen", city: "دبرتسن", cityEn: "Debrecen", ranking: "Top Medical EU", highlights: "أقوى وأشهر كليات الطب والصيدلة وتدريس بالإنجليزية.", highlightsEn: "Renowned international medical school and research faculties.", website: "https://unideb.hu/" },
      { name: "جامعة أوتفوش لوراند (ELTE)", nameEn: "Eötvös Loránd University (ELTE)", city: "بودابست", cityEn: "Budapest", ranking: "Top Budapest", highlights: "أعرق وأكبر جامعات العاصمة بودابست للعلوم الإنسانية والتقنية.", highlightsEn: "Hungary's leading comprehensive institution in Budapest.", website: "https://www.elte.hu/" },
      { name: "جامعة بودابست للتكنولوجيا والاقتصاد (BME)", nameEn: "Budapest University of Technology and Economics", city: "بودابست", cityEn: "Budapest", ranking: "Top Engineering", highlights: "أعرق جامعة هندسية في وسط أوروبا وتخرج منها 4 من حائزي نوبل.", highlightsEn: "Historic central European engineering hub educating 4 Nobel laureates.", website: "https://www.bme.hu/" }
    ]
  },
  {
    country: "ألمانيا",
    countryEn: "Germany",
    flag: "🇩🇪",
    region: "أوروبا الغربية",
    regionEn: "Western Europe",
    tier: "guaranteed",
    scholarshipName: "منح الهيئة الألمانية للتبادل الأكاديمي (DAAD)",
    scholarshipNameEn: "DAAD Scholarships (Deutscher Akademischer Austauschdienst)",
    applicationWindow: "أغسطس – نوفمبر (سنوياً)",
    applicationWindowEn: "Aug – Nov (Annually)",
    fundingType: "ممولة بالكامل + رواتب مجزية",
    fundingTypeEn: "Fully Funded + Generous Living Allowance",
    coverage: ["راتب شهري (934€ للماجستير و1300€ للدكتوراه)", "تذاكر طيران دولية", "تأمين صحي وبدل استقرار", "دورات لغة ألمانية مدفوعة"],
    coverageEn: ["Monthly Stipend (€934 Masters / €1300 PhD)", "International Airfare", "Health & Accident Insurance", "Funded German Language Courses"],
    studyLanguages: ["الإنجليزية", "الألمانية"],
    degreeLevels: ["ماجستير", "دكتوراه", "أبحاث ما بعد الدكتوراه"],
    officialPortals: [
      { name: "بوابة منح DAAD الرسمية", nameEn: "DAAD Scholarship Database", url: "https://www.daad.de/en/" },
      { name: "دليل الدراسة في ألمانيا (Study in Germany)", nameEn: "Study in Germany Portal", url: "https://www.study-in-germany.de/en/" }
    ],
    overview: "قاطرة الصناعة والتعليم في أوروبا؛ تتميز بأن الرسوم الجامعية مجانية للجميع في الجامعات الحكومية وتوفر DAAD منحاً معيشية سخية.",
    overviewEn: "Europe's engineering powerhouse where public university tuition is tuition-free and DAAD covers living expenses.",
    topUniversities: [
      { name: "جامعة ميونخ التقنية (TUM)", nameEn: "Technical University of Munich", city: "ميونخ", cityEn: "Munich", ranking: "Top 30 QS", highlights: "الجامعة الأولى في ألمانيا وأوروبا في الهندسة والابتكار والذكاء الاصطناعي.", highlightsEn: "Germany's top-ranked tech institution and Europe's innovation catalyst.", website: "https://www.tum.de/" },
      { name: "جامعة لودفيغ ماكسيميليان ميونخ (LMU)", nameEn: "LMU Munich", city: "ميونخ", cityEn: "Munich", ranking: "Top 50 QS", highlights: "صرح طبي وبحثي نخبوي تخرج منه 43 حائزاً على جائزة نوبل.", highlightsEn: "Premier medical and research center educating 43 Nobel laureates.", website: "https://www.lmu.de/" },
      { name: "جامعة هايدلبرغ", nameEn: "Heidelberg University", city: "هايدلبرغ", cityEn: "Heidelberg", ranking: "Top 80 QS", highlights: "أقدم جامعة في ألمانيا (تأسست 1386) ورائدة في الطب والعلوم الحيوية.", highlightsEn: "Germany's oldest university (1386), famous for medicine and life sciences.", website: "https://www.uni-heidelberg.de/" }
    ]
  },
  {
    country: "المملكة المتحدة",
    countryEn: "United Kingdom",
    flag: "🇬🇧",
    region: "أوروبا الغربية",
    regionEn: "Western Europe",
    tier: "guaranteed",
    scholarshipName: "منحة تشيفنينغ البريطانية (Chevening Scholarship)",
    scholarshipNameEn: "UK Government Chevening Scholarship",
    applicationWindow: "أغسطس – نوفمبر (سنوياً)",
    applicationWindowEn: "Aug – Nov (Annually)",
    fundingType: "ممولة بالكامل 100% (أعلى مستوى)",
    fundingTypeEn: "Prestigious Fully Funded 100%",
    coverage: ["رسوم دراسية كاملة حتى لأرقى الجامعات (أكسفورد، كامبريدج، LSE)", "راتب شهري مرتفع لتغطية كافة نفقات المعيشة", "تذاكر طيران درجة اقتصادية ذهاب وعودة", "بدلات وصول وسفر داخل بريطانيا"],
    coverageEn: ["Full Tuition Fees to Any UK University", "Monthly Living Stipend", "Return Flights", "Arrival & Departure Allowances"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير لمدة عام واحد"],
    officialPortals: [
      { name: "بوابة منحة تشيفنينغ الرسمية", nameEn: "Official Chevening Portal", url: "https://www.chevening.org/" }
    ],
    overview: "منحة القادة المرموقة لتمويل دراسة الماجستير في أي جامعة بريطانية، وتخريج وزراء وقادة ومفكرين حول العالم.",
    overviewEn: "Prestigious UK government global leadership scheme funding 1-year Masters at top British universities.",
    topUniversities: [
      { name: "جامعة أكسفورد", nameEn: "University of Oxford", city: "أكسفورد", cityEn: "Oxford", ranking: "Top 3 QS World", highlights: "أقدم جامعة في العالم الناطق بالإنجليزية ورمز التميز الأكاديمي.", highlightsEn: "Oldest English-speaking university and apex of academic excellence.", website: "https://www.ox.ac.uk/" },
      { name: "جامعة كامبريدج", nameEn: "University of Cambridge", city: "كامبريدج", cityEn: "Cambridge", ranking: "Top 2 QS World", highlights: "مركز أبحاث العلوم والهندسة الأول تخرج منه إسحاق نيوتن و121 نوبل.", highlightsEn: "Pinnacle of science & math research, educating Isaac Newton & 121 Nobelists.", website: "https://www.cam.ac.uk/" },
      { name: "إمبريال كوليدج لندن", nameEn: "Imperial College London", city: "لندن", cityEn: "London", ranking: "Top 5 QS World", highlights: "القطب البريطاني الأول في التكنولوجيا والهندسة والطب والأعمال.", highlightsEn: "Global top institution exclusively dedicated to science, tech, engineering & medicine.", website: "https://www.imperial.ac.uk/" }
    ]
  },
  {
    country: "الولايات المتحدة الأمريكية",
    countryEn: "USA",
    flag: "🇺🇸",
    region: "أمريكا الشمالية",
    regionEn: "North America",
    tier: "guaranteed",
    scholarshipName: "برنامج فولبرايت الأمريكي (Fulbright Foreign Student)",
    scholarshipNameEn: "Fulbright Foreign Student Program",
    applicationWindow: "فبراير – يونيو (سنوياً)",
    applicationWindowEn: "Feb – Jun (Annually)",
    fundingType: "ممولة بالكامل 100%",
    fundingTypeEn: "Prestigious Fully Funded",
    coverage: ["رسوم دراسية كاملة", "راتب شهري مجزي", "تذاكر طيران دولية", "تأمين صحي كامل", "بدل كتب واستقرار"],
    coverageEn: ["Full Tuition & Fees", "Living Stipend", "Round-Trip Airfare", "Health Benefit Plan", "Books & Settling-in Allowance"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير", "دكتوراه", "بحوث"],
    officialPortals: [
      { name: "بوابة برنامج فولبرايت للطلاب الأجانب", nameEn: "Fulbright Foreign Student Program", url: "https://foreign.fulbrightonline.org/" },
      { name: "بوابة شبكة Amideast في الوطن العربي", nameEn: "Amideast Fulbright MENA", url: "https://www.amideast.org/" }
    ],
    overview: "البرنامج الرائد للحكومة الأمريكية للتبادل التعليمي الدولي، ويغطي الدراسات العليا في أفضل الجامعات الأمريكية.",
    overviewEn: "Flagship US government international exchange program funding graduate study across leading US universities.",
    topUniversities: [
      { name: "معهد ماساتشوستس للتكنولوجيا (MIT)", nameEn: "Massachusetts Institute of Technology (MIT)", city: "كامبريدج", cityEn: "Cambridge, MA", ranking: "Top 1 QS World", highlights: "الجامعة رقم 1 في العالم في الهندسة والذكاء الاصطناعي والتكنولوجيا.", highlightsEn: "Ranked #1 university worldwide for engineering, computing, and technology.", website: "https://www.mit.edu/" },
      { name: "جامعة هارفارد", nameEn: "Harvard University", city: "كامبريدج", cityEn: "Cambridge, MA", ranking: "Ivy League Apex", highlights: "أعرق جامعات أمريكا وأكبر وقف أكاديمي عالمي في القانون والطب والأعمال.", highlightsEn: "America's oldest and most prestigious institution for medicine, law, and business.", website: "https://www.harvard.edu/" },
      { name: "جامعة ستانفورد", nameEn: "Stanford University", city: "كاليفورنيا", cityEn: "Stanford, CA", ranking: "Silicon Valley Heart", highlights: "قلب وادي السيليكون وموطن تأسيس كبرى شركات التكنولوجيا العالمية.", highlightsEn: "Heart of Silicon Valley and birth incubator for global tech giants.", website: "https://www.stanford.edu/" }
    ]
  },
  {
    country: "كوريا الجنوبية",
    countryEn: "South Korea",
    flag: "🇰🇷",
    region: "شرق آسيا",
    regionEn: "East Asia",
    tier: "guaranteed",
    scholarshipName: "منحة الحكومة الكورية العالمية (GKS - Global Korea Scholarship)",
    scholarshipNameEn: "Global Korea Scholarship (GKS / KGSP)",
    applicationWindow: "سبتمبر (بكالوريوس) / فبراير (عليا)",
    applicationWindowEn: "Sep (Undergrad) / Feb (Graduates)",
    fundingType: "ممولة بالكامل 100%",
    fundingTypeEn: "Fully Funded 100%",
    coverage: ["تذاكر طيران دولية", "إعفاء من الرسوم 100%", "سنة لغة كورية مجانية", "راتب شهري (1,000,000 وون)", "تأمين وبدل استقرار وبدل تخرج"],
    coverageEn: ["Round-Trip Flights", "100% Tuition Fees", "1-Year Free Korean Language Course", "Monthly Allowance (1,000,000 KRW)", "Settlement & Research Subsidies"],
    studyLanguages: ["الإنجليزية", "الكورية"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة الدراسة في كوريا الرسمية (Study in Korea)", nameEn: "Study in Korea GKS Portal", url: "https://www.studyinkorea.go.kr/" }
    ],
    overview: "منحة سنوية فائقة السخاء تنظمها وزارة التعليم الكورية (NIIED) للدراسة في جامعات كوريا التكنولوجية والطبية المرموقة.",
    overviewEn: "Highly prestigious Korean government award administered by NIIED for undergraduate and graduate studies.",
    topUniversities: [
      { name: "جامعة سيول الوطنية (SNU)", nameEn: "Seoul National University", city: "سيول", cityEn: "Seoul", ranking: "Top 40 QS", highlights: "الجامعة الوطنية الأولى في كوريا وقبلة النخب الأكاديمية والطبية.", highlightsEn: "Korea's undisputed top national university for medicine, tech, and governance.", website: "https://www.snu.ac.kr/" },
      { name: "المعهد الكوري المتقدم للعلوم والتكنولوجيا (KAIST)", nameEn: "KAIST", city: "دايجون", cityEn: "Daejeon", ranking: "Top 50 QS", highlights: "أقوى معهد تكنولوجي وبحثي في كوريا، وتدريس بالإنجليزية بالكامل.", highlightsEn: "Premier scientific institute, Korea's MIT with 100% English curriculum.", website: "https://www.kaist.ac.kr/" }
    ]
  },
  {
    country: "اليابان",
    countryEn: "Japan",
    flag: "🇯🇵",
    region: "شرق آسيا",
    regionEn: "East Asia",
    tier: "guaranteed",
    scholarshipName: "منحة الحكومة اليابانية (MEXT Scholarship)",
    scholarshipNameEn: "Japanese Government (MEXT) Scholarships",
    applicationWindow: "أبريل – يونيو (سنوياً)",
    applicationWindowEn: "Apr – Jun (Annually)",
    fundingType: "ممولة بالكامل 100%",
    fundingTypeEn: "Fully Funded 100%",
    coverage: ["رسوم دراسية كاملة", "راتب شهري (117,000 إلى 145,000 ين)", "تذاكر طيران ذهاب وإياب", "سنة تحضيرية لغة وثقافة يابانية"],
    coverageEn: ["100% Tuition & Exam Fees", "Monthly Stipend (117,000 - 145,000 JPY)", "Round-Trip Flights", "Preparatory Japanese Training"],
    studyLanguages: ["الإنجليزية", "اليابانية"],
    degreeLevels: ["بكالوريوس", "كليات التكنولوجيا", "ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة الدراسة في اليابان الرسمية (JASSO)", nameEn: "Study in Japan Portal (MEXT)", url: "https://www.studyinjapan.go.jp/en/" }
    ],
    overview: "منحة وزارة التعليم والثقافة والرياضة والعلوم والتكنولوجيا اليابانية المرموقة ذات السمعة الدولية الواسعة.",
    overviewEn: "Flagship Japanese ministerial grant for students pursuing top-tier undergraduate and postgraduate degrees.",
    topUniversities: [
      { name: "جامعة طوكيو", nameEn: "The University of Tokyo", city: "طوكيو", cityEn: "Tokyo", ranking: "Top 30 QS", highlights: "الجامعة الإمبراطورية الأولى في اليابان والرائدة في آسيا.", highlightsEn: "Japan's premier imperial university and leading Asian academic force.", website: "https://www.u-tokyo.ac.jp/en/" },
      { name: "جامعة كيوتو", nameEn: "Kyoto University", city: "كيوتو", cityEn: "Kyoto", ranking: "Top 50 QS", highlights: "ثاني أقدم جامعة يابانية وموطن 19 عالماً حائزاً على جائزة نوبل.", highlightsEn: "Celebrated research university educating 19 Nobel Prize laureates.", website: "https://www.kyoto-u.ac.jp/en/" }
    ]
  },
  {
    country: "الاتحاد الأوروبي (إيراسموس)",
    countryEn: "European Union (Erasmus+)",
    flag: "🇪🇺",
    region: "أوروبا المشتركة",
    regionEn: "Pan-European",
    tier: "guaranteed",
    scholarshipName: "إيراسموس موندوس للماجستير المشترك (Erasmus Mundus - EMJM)",
    scholarshipNameEn: "Erasmus Mundus Joint Masters Scholarships",
    applicationWindow: "أكتوبر – يناير (سنوياً)",
    applicationWindowEn: "Oct – Jan (Annually)",
    fundingType: "ممولة بالكامل براتب 1,400 يورو شهرياً",
    fundingTypeEn: "Fully Funded + €1,400/Month Stipend",
    coverage: ["تغطية رسوم الدراسة 100%", "راتب شهري 1,400 يورو للمعيشة", "تأمين وتذاكر طيران", "دراسة في 2 إلى 3 دول أوروبية مختلفة خلال نفس الماجستير"],
    coverageEn: ["100% Tuition Fees", "€1,400 Monthly Living Allowance", "Travel & Health Insurance", "Study across 2-3 EU countries with dual/joint degree"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير مشترك", "دكتوراه"],
    officialPortals: [
      { name: "دليل برامج إيراسموس موندوس الرسمي (EMJM Catalogue)", nameEn: "Erasmus Mundus Catalogue", url: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en" }
    ],
    overview: "أرقى وأقوى منحة ماجستير مشترك في العالم تتيح للباحث الدراسة في جامعات أوروبية متعددة والحصول على شهادة مزدوجة.",
    overviewEn: "Prestigious joint master degrees allowing students to study across multiple European universities with dual degrees.",
    topUniversities: [
      { name: "كونسورتيوم الجامعات الأوروبية المشتركة", nameEn: "Erasmus Joint Consortiums", city: "عواصم أوروبية متعددة", cityEn: "Multiple EU Capitals", highlights: "برامج ماجستير مشتركة معتمدة بين جامعات فرنسا وألمانيا وإيطاليا وإسبانيا وهولندا.", highlightsEn: "Accredited multi-country programs combining leading universities across the EU.", website: "https://erasmus-plus.ec.europa.eu/" }
    ]
  },
  {
    country: "إيطاليا",
    countryEn: "Italy",
    flag: "🇮🇹",
    region: "جنوب أوروبا",
    regionEn: "Southern Europe",
    tier: "guaranteed",
    scholarshipName: "منحة الحكومة الإيطالية (MAECI) ومنح الأقاليم للدخل العائلي (DSU)",
    scholarshipNameEn: "Italian Govt (MAECI) & Regional DSU Scholarships",
    applicationWindow: "يونيو – سبتمبر (DSU) / أبريل – يونيو (MAECI)",
    applicationWindowEn: "Jun – Sep (DSU) / Apr – Jun (MAECI)",
    fundingType: "إعفاء كامل + سكن وراتب معيشي (5000€-7000€ سنوياً)",
    fundingTypeEn: "Full Tuition Waiver + Housing & €5,000-€7,000/yr Grant",
    coverage: ["إعفاء من الرسوم الجامعية 100%", "راتب نقدي سنوي أو سكن ووجبات مجانية", "تأمين صحي", "دراسة باللغة الإنجليزية في أقدم جامعات أوروبا"],
    coverageEn: ["100% Tuition Exemption", "Annual Cash Grant or Free Student Housing & Canteen", "Health Insurance", "English-medium programs"],
    studyLanguages: ["الإنجليزية", "الإيطالية"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة الدراسة في إيطاليا (Universitaly)", nameEn: "Universitaly Portal", url: "https://www.universitaly.it/" },
      { name: "وزارة الشؤون الخارجية الإيطالية (MAECI)", nameEn: "Italian Ministry of Foreign Affairs (MAECI)", url: "https://studyinitaly.esteri.it/" }
    ],
    overview: "تتميز إيطاليا بمنح الأقاليم (DSU) التي تمنح لكل طالب مقبول وذو دخل عائلي متواضع تغطية كاملة وسكناً ومنحة معيشية.",
    overviewEn: "Famous for regional DSU grants providing tuition waivers, free meals, and living stipends based on family income.",
    topUniversities: [
      { name: "جامعة بولونيا", nameEn: "University of Bologna", city: "بولونيا", cityEn: "Bologna", ranking: "Oldest in the World (1088)", highlights: "أقدم جامعة في العالم وتاريخ أكاديمي يمتد لأكثر من 930 عاماً.", highlightsEn: "The world's oldest university in continuous operation (founded 1088).", website: "https://www.unibo.it/" },
      { name: "جامعة بوليتكنيك ميلانو", nameEn: "Politecnico di Milano", city: "ميلانو", cityEn: "Milan", ranking: "Top 10 Engineering Europe", highlights: "أقوى جامعة إيطالية في الهندسة والعمارة والتصميم الصناعي.", highlightsEn: "Premier Italian powerhouse in engineering, architecture, and design.", website: "https://www.polimi.it/" },
      { name: "جامعة روما سابينزا", nameEn: "Sapienza University of Rome", city: "روما", cityEn: "Rome", ranking: "Top Classics World", highlights: "أكبر جامعة في أوروبا ومتميزة في الطب والآثار والفيزياء.", highlightsEn: "One of Europe's largest universities, world #1 in ancient history & classics.", website: "https://www.uniroma1.it/" }
    ]
  },
  {
    country: "رومانيا",
    countryEn: "Romania",
    flag: "🇷🇴",
    region: "أوروبا الشرقية",
    regionEn: "Eastern Europe",
    tier: "guaranteed",
    scholarshipName: "منحة وزارة الخارجية الرومانية (MFA Romania Scholarship)",
    scholarshipNameEn: "Romanian Ministry of Foreign Affairs Scholarship",
    applicationWindow: "ديسمبر – مارس (سنوياً)",
    applicationWindowEn: "Dec – Mar (Annually)",
    fundingType: "ممولة بالكامل في الاتحاد الأوروبي",
    fundingTypeEn: "Fully Funded EU Scholarship",
    coverage: ["رسوم دراسية مجانية 100%", "سكن جامعي مجاني", "سنة تحضيرية لتعلم اللغة الرومانية", "راتب شهري"],
    coverageEn: ["100% Free Tuition", "Free University Accommodation", "1-Year Free Romanian Language Course", "Monthly Living Allowance"],
    studyLanguages: ["الرومانية (مع سنة لغة مجانية)"],
    degreeLevels: ["بكالوريوس", "ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة منحة الخارجية الرومانية الرسمية", nameEn: "Study in Romania (MFA Grants)", url: "https://scholarships.studyinromania.gov.ro/" }
    ],
    overview: "منحة حكومية سنوية معتمدة تتيح دراسة الهندسة والتكنولوجيا والاقتصاد في الاتحاد الأوروبي مع سنة تحضيرية للغة.",
    overviewEn: "Official annual EU government program offering full tuition, lodging, and language preparation.",
    topUniversities: [
      { name: "جامعة بوخارست", nameEn: "University of Bucharest", city: "بوخارست", cityEn: "Bucharest", highlights: "الصرح الأكاديمي الرائد برومانيا في العلوم والإنسانيات.", highlightsEn: "Premier Romanian institution for natural sciences and humanities.", website: "https://unibuc.ro/" },
      { name: "جامعة بوليتكنيك بوخارست", nameEn: "National University of Science and Technology POLITEHNICA Bucharest", city: "بوخارست", cityEn: "Bucharest", highlights: "أكبر وأعرق جامعة هندسية وتقنية في رومانيا.", highlightsEn: "Largest and oldest technical & engineering university in Romania.", website: "https://upb.ro/" }
    ]
  },
  {
    country: "فرنسا",
    countryEn: "France",
    flag: "🇫🇷",
    region: "أوروبا الغربية",
    regionEn: "Western Europe",
    tier: "periodic",
    scholarshipName: "منحة إيفل للتميز (Eiffel Excellence) ومنح السفارات الفرنسية",
    scholarshipNameEn: "Eiffel Excellence Scholarship & Campus France Grants",
    applicationWindow: "أكتوبر – يناير (سنوياً)",
    applicationWindowEn: "Oct – Jan (Annually)",
    fundingType: "ممولة للدراسات العليا والنخب",
    fundingTypeEn: "Funded for Elite Graduate Students",
    coverage: ["راتب شهري (1,181€ للماجستير و1,700€ للدكتوراه)", "تذاكر طيران وتأمين صحي", "أنشطة ثقافية وبدلات سكن"],
    coverageEn: ["Monthly Allowance (€1,181 Masters / €1,700 PhD)", "International Travel & Health Insurance", "Cultural activities & housing assistance"],
    studyLanguages: ["الفرنسية", "الإنجليزية"],
    degreeLevels: ["ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة كامبوس فرانس الرسمية (Campus France)", nameEn: "Campus France Official Portal", url: "https://www.campusfrance.org/en" }
    ],
    overview: "برنامج نخبة تديره وزارة الخارجية الفرنسية لجذب الطلاب المتفوقين في الماجستير والدكتوراه في الهندسة والقانون والعلوم السياسية.",
    overviewEn: "Elite program launched by the French Ministry for Europe and Foreign Affairs for top-tier master and PhD scholars.",
    topUniversities: [
      { name: "جامعة باريس ساكلاي", nameEn: "Paris-Saclay University", city: "باريس", cityEn: "Paris", ranking: "Top 15 World (ARWU)", highlights: "أقوى جامعة فرنسية في الرياضيات والفيزياء والتكنولوجيا المتقدمة.", highlightsEn: "Top French university, world #1 in mathematics and cutting-edge sciences.", website: "https://www.universite-paris-saclay.fr/" },
      { name: "جامعة السوربون", nameEn: "Sorbonne University", city: "باريس", cityEn: "Paris", ranking: "Top Historic", highlights: "أيقونة التعليم الفرنسي والعالمي في الطب والعلوم والآداب.", highlightsEn: "World icon of French academic heritage in medicine, sciences, and arts.", website: "https://www.sorbonne-universite.fr/" }
    ]
  },
  {
    country: "السويد",
    countryEn: "Sweden",
    flag: "🇸🇪",
    region: "شمال أوروبا (إسكندنافيا)",
    regionEn: "Scandinavia",
    tier: "periodic",
    scholarshipName: "منحة المعهد السويدي للمحترفين العالميين (SI Scholarship)",
    scholarshipNameEn: "Swedish Institute Scholarships for Global Professionals",
    applicationWindow: "أكتوبر – فبراير (سنوياً)",
    applicationWindowEn: "Oct – Feb (Annually)",
    fundingType: "ممولة بالكامل للماجستير",
    fundingTypeEn: "Fully Funded Master Scholarships",
    coverage: ["رسوم دراسية كاملة 100%", "راتب شهري للمعيشة (12,000 كرونة سويدية)", "تأمين صحي وبدل سفر"],
    coverageEn: ["100% Tuition Fees", "Monthly Living Stipend (12,000 SEK)", "Travel Grant & Health Insurance"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير"],
    officialPortals: [
      { name: "بوابة المعهد السويدي الرسمية (SI)", nameEn: "Swedish Institute Portal", url: "https://si.se/en/" },
      { name: "بوابة التقديم الموحد للجامعات السويدية (University Admissions)", nameEn: "University Admissions Sweden", url: "https://www.universityadmissions.se/" }
    ],
    overview: "منحة رائدة مخصصة لبناء القادة والمهنيين في التنمية المستدامة، الابتكار، والتحول الرقمي باللغة الإنجليزية.",
    overviewEn: "Prestigious leadership award funding English-taught masters in sustainability and innovation.",
    topUniversities: [
      { name: "معهد كارولينسكا الطبي", nameEn: "Karolinska Institute", city: "ستوكهولم", cityEn: "Stockholm", ranking: "Top 10 Medical World", highlights: "الصرح الطبي الأرقى في العالم ومقر لجنة اختيار جائزة نوبل في الطب.", highlightsEn: "Premier medical research university home to the Nobel Assembly in Medicine.", website: "https://ki.se/" },
      { name: "المعهد الملكي للتكنولوجيا (KTH)", nameEn: "KTH Royal Institute of Technology", city: "ستوكهولم", cityEn: "Stockholm", ranking: "Top Engineering", highlights: "أكبر وأعرق معهد تقني في السويد ومن رواد التكنولوجيا الأوروبية.", highlightsEn: "Sweden's leading technical university driving European tech advances.", website: "https://www.kth.se/" }
    ]
  },
  {
    country: "سويسرا",
    countryEn: "Switzerland",
    flag: "🇨🇭",
    region: "وسط أوروبا",
    regionEn: "Central Europe",
    tier: "periodic",
    scholarshipName: "منح التميز للحكومة السويسرية للباحثين (Swiss Government Excellence)",
    scholarshipNameEn: "Swiss Government Excellence Scholarships (FCS)",
    applicationWindow: "أغسطس – ديسمبر (سنوياً)",
    applicationWindowEn: "Aug – Dec (Annually)",
    fundingType: "ممولة بالكامل للباحثين والدكتوراه",
    fundingTypeEn: "Fully Funded for PhD & Postdocs",
    coverage: ["راتب شهري مجزي جداً (1,920 إلى 3,500 فرنك سويسري)", "إعفاء من الرسوم الدراسية", "تأمين صحي وبدلات سكن وتذاكر سفر"],
    coverageEn: ["Generous Monthly Stipend (CHF 1,920 - 3,500)", "Tuition Exemption", "Full Health Insurance & Travel Subsidies"],
    studyLanguages: ["الإنجليزية", "الألمانية", "الفرنسية"],
    degreeLevels: ["دكتوراه", "أبحاث ما بعد الدكتوراه", "زمالات بحثية"],
    officialPortals: [
      { name: "بوابة أمانة الدولة السويسرية للتعليم والبحث (SERI)", nameEn: "State Secretariat for Education (SERI)", url: "https://www.sbfi.admin.ch/scholarships_eng" }
    ],
    overview: "منح بحثية نخبوية ممولة من الاتحاد السويسري للباحثين وحاملي الماجستير لإجراء أبحاث الدكتوراه في أرقى المختبرات العالمية.",
    overviewEn: "Elite Swiss confederation research grants for doctoral and postdoctoral researchers in world-class labs.",
    topUniversities: [
      { name: "المعهد الفيدرالي السويسري للتكنولوجيا في زيورخ (ETH Zurich)", nameEn: "ETH Zurich", city: "زيورخ", cityEn: "Zurich", ranking: "Top 7 QS World", highlights: "الجامعة الأولى في أوروبا القارية تخرج منها ألبرت أينشتاين و22 نوبل.", highlightsEn: "Continental Europe's highest-ranked institution, educating Albert Einstein & 22 Nobelists.", website: "https://ethz.ch/" },
      { name: "مدرسة لوزان الاتحادية للعلوم التطبيقية (EPFL)", nameEn: "EPFL", city: "لوزان", cityEn: "Lausanne", ranking: "Top 35 QS World", highlights: "مركز الابتكار التكنولوجي والهندسي الأول في سويسرا الناطقة بالفرنسية.", highlightsEn: "World-leading institute in engineering, computer science, and data.", website: "https://www.epfl.ch/" }
    ]
  },
  {
    country: "كندا",
    countryEn: "Canada",
    flag: "🇨🇦",
    region: "أمريكا الشمالية",
    regionEn: "North America",
    tier: "periodic",
    scholarshipName: "منحة فانير للدكتوراه (Vanier CGS) ومنح القادة والجامعات الكندية",
    scholarshipNameEn: "Vanier Canada Graduate Scholarships & University Grants",
    applicationWindow: "يوليو – نوفمبر (سنوياً)",
    applicationWindowEn: "Jul – Nov (Annually)",
    fundingType: "ممولة بالكامل (50,000$ سنوياً للدكتوراه)",
    fundingTypeEn: "Fully Funded ($50,000/yr for PhD)",
    coverage: ["راتب سنوي قدره 50,000 دولار كندي لمدة 3 سنوات للدكتوراه", "منح جامعية للبكالوريوس والماجستير (مثل Lester B. Pearson وMcCall MacBain)"],
    coverageEn: ["$50,000 CAD per year for 3 years (Vanier PhD)", "Undergrad/Master flagship awards (Lester B. Pearson / McCall MacBain)"],
    studyLanguages: ["الإنجليزية", "الفرنسية"],
    degreeLevels: ["بكالوريوس (منح جامعية)", "ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة منحة فانير الكندية الرسمية", nameEn: "Vanier Canada Graduate Scholarships", url: "https://vanier.gc.ca/" },
      { name: "بوابة التعليم في كندا (EduCanada)", nameEn: "EduCanada Official Portal", url: "https://www.educanada.ca/" }
    ],
    overview: "توفر كندا بيئة تعليمية وبحثية استثنائية مع فرص عمل أثناء وبعد التخرج وبرامج تمويل سخية لطلبة الدراسات العليا المتميزين.",
    overviewEn: "Canada delivers world-renowned research with top post-graduation career pathways and generous PhD funding.",
    topUniversities: [
      { name: "جامعة تورنتو", nameEn: "University of Toronto", city: "تورنتو", cityEn: "Toronto", ranking: "Top 20 QS World", highlights: "الجامعة الكندية الأولى ومسقط رأس اكتشاف الإنسولين وأبحاث الذكاء الاصطناعي.", highlightsEn: "Canada's premier research university, birthplace of insulin and pioneer in AI.", website: "https://www.utoronto.ca/" },
      { name: "جامعة ماكجيل", nameEn: "McGill University", city: "مونتريال", cityEn: "Montreal", ranking: "Top 30 QS World", highlights: "صرح طبي وبحثي عريق تخرج منه 12 حائزاً على نوبل و145 باحث رودس.", highlightsEn: "World-renowned institution in Montreal educating 12 Nobel Prize laureates.", website: "https://www.mcgill.ca/" }
    ]
  },
  {
    country: "أستراليا",
    countryEn: "Australia",
    flag: "🇦🇺",
    region: "أوقيانوسيا",
    regionEn: "Oceania",
    tier: "periodic",
    scholarshipName: "منح أستراليا الجوائز (Australia Awards Scholarships)",
    scholarshipNameEn: "Australia Awards Scholarships & RTP Grants",
    applicationWindow: "فبراير – أبريل (سنوياً)",
    applicationWindowEn: "Feb – Apr (Annually)",
    fundingType: "ممولة بالكامل 100%",
    fundingTypeEn: "Fully Funded 100%",
    coverage: ["رسوم دراسية كاملة 100%", "تذاكر طيران ذهاب وإياب", "بدل استقرار وراتب معيشي نصف شهري", "تأمين صحي للطلاب الأجانب (OSHC)"],
    coverageEn: ["100% Full Tuition", "Return Airfare", "Establishment Allowance & Living Stipend", "Overseas Student Health Cover (OSHC)"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير", "دكتوراه", "أبحاث تطبيقية"],
    officialPortals: [
      { name: "بوابة منح أستراليا الرسمية (DFAT)", nameEn: "Australia Awards (DFAT)", url: "https://www.dfat.gov.au/people-to-people/australia-awards" }
    ],
    overview: "منحة حكومية مرموقة تقدمها وزارة الخارجية والتجارة الأسترالية (DFAT) للمساهمة في تنمية المهارات والقيادات.",
    overviewEn: "Prestigious Australian government development awards offered by DFAT for postgraduate studies.",
    topUniversities: [
      { name: "جامعة ملبورن", nameEn: "The University of Melbourne", city: "ملبورن", cityEn: "Melbourne", ranking: "Top 15 QS World", highlights: "الجامعة الأولى في أستراليا ورائدة في الطب والهندسة والقانون.", highlightsEn: "Australia's top-ranked global university for medicine, engineering, and law.", website: "https://www.unimelb.edu.au/" },
      { name: "الجامعة الوطنية الأسترالية (ANU)", nameEn: "Australian National University", city: "كانبرا", cityEn: "Canberra", ranking: "Top 30 QS World", highlights: "الصرح البحثي الفيدرالي في العاصمة كانبرا ورمز السياسات والعلوم.", highlightsEn: "Australia's national research university in Canberra.", website: "https://www.anu.edu.au/" }
    ]
  },
  {
    country: "أذربيجان",
    countryEn: "Azerbaijan",
    flag: "🇦🇿",
    region: "القوقاز / أوراسيا",
    regionEn: "Caucasus / Eurasia",
    tier: "guaranteed",
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
      { name: "جامعة أذربيجان الحكومية للنفط والصناعة", nameEn: "Azerbaijan State Oil and Industry University (ASOIU)", city: "باكو", cityEn: "Baku", highlights: "أقدم جامعة نفط وهندسة في العالم وتدريس بالإنجليزية.", highlightsEn: "World's historic oil & energy engineering university with English programs.", website: "http://asoiu.edu.az/" },
      { name: "جامعة ADA", nameEn: "ADA University", city: "باكو", cityEn: "Baku", highlights: "أحدث وأرقى صرح أكاديمي دولي في الدبلوماسية وتقنية المعلومات والأعمال.", highlightsEn: "State-of-the-art international university for diplomacy, computing, and business.", website: "https://www.ada.edu.az/" }
    ]
  },
  {
    country: "ماليزيا",
    countryEn: "Malaysia",
    flag: "🇲🇾",
    region: "جنوب شرق آسيا",
    regionEn: "Southeast Asia",
    tier: "periodic",
    scholarshipName: "المنحة الدولية الماليزية (MIS - Malaysia International Scholarship)",
    scholarshipNameEn: "Malaysia International Scholarship (MIS)",
    applicationWindow: "مايو – يونيو (سنوياً)",
    applicationWindowEn: "May – Jun (Annually)",
    fundingType: "ممولة للدراسات العليا",
    fundingTypeEn: "Funded Postgraduate Scholarship",
    coverage: ["إعفاء كامل من الرسوم الدراسية", "راتب شهري للمعيشة (1,500 رينغيت)", "تأمين صحي وبدل سفر ومراجع"],
    coverageEn: ["Full Tuition Fees Exemption", "Monthly Living Allowance (1,500 MYR)", "Travel Grant & Medical Insurance"],
    studyLanguages: ["الإنجليزية 100%"],
    degreeLevels: ["ماجستير", "دكتوراه"],
    officialPortals: [
      { name: "بوابة وزارة التعليم العالي الماليزية (MOHE)", nameEn: "MOHE Malaysia Scholarship Portal", url: "https://biasiswa.mohe.gov.my/MIS/" }
    ],
    overview: "وجهة تعليمية إسلامية ودولية رائدة تجمع بين جودة التعليم الغربي وتكلفة المعيشة المناسبة والتدريس بالإنجليزية.",
    overviewEn: "Top Southeast Asian education hub offering English-taught degrees at leading research universities.",
    topUniversities: [
      { name: "جامعة مالايا (UM)", nameEn: "Universiti Malaya", city: "كوالالمبور", cityEn: "Kuala Lumpur", ranking: "Top 60 QS World", highlights: "الجامعة الأولى في ماليزيا ومن الأفضل عالمياً في الهندسة والطب والعلوم.", highlightsEn: "Malaysia's premier university ranked in the global top 60.", website: "https://www.um.edu.my/" },
      { name: "جامعة بتروناس التكنولوجية (UTP)", nameEn: "Universiti Teknologi PETRONAS", city: "بيراك", cityEn: "Perak", ranking: "Top Energy Tech", highlights: "أقوى جامعة هندسة بترول وطاقة وعلوم حاسوب تابعة لشركة بتروناس.", highlightsEn: "Premier engineering and computer science university backed by PETRONAS.", website: "https://www.utp.edu.my/" }
    ]
  }
];
