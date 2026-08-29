// دليل الجامعات العربية — بيانات إرشادية عامة مجموعة من المواقع الرسمية للجامعات
// ووزارات التعليم العالي. النسب المئوية تقديرية للحد الأدنى للقبول.

export type ArabUniType = "government" | "private" | "technical";

export interface ArabUniversity {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  countryEn: string;
  flag: string;
  city: string;
  cityEn?: string;
  type: ArabUniType;
  website: string;
  faculties: string[];
  minPercentage: number;
  language: "ar" | "en" | "mixed";
  scholarships: boolean;
  highlights: string;
  highlightsEn: string;
}

export const ARAB_UNIVERSITIES: ArabUniversity[] = [
  // --- مصر (Egypt) ---
  { id: "eg-cairo", name: "جامعة القاهرة", nameEn: "Cairo University", country: "مصر", countryEn: "Egypt", flag: "🇪🇬", city: "القاهرة", cityEn: "Cairo", type: "government", website: "https://cu.edu.eg/", faculties: ["الطب", "الهندسة", "الحقوق", "الاقتصاد والعلوم السياسية", "الصيدلة", "الحاسبات"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "أكبر الجامعات المصرية وأعرقها، تستقبل آلاف الطلاب الوافدين سنوياً.", highlightsEn: "Egypt's largest and oldest university, hosting thousands of international students." },
  { id: "eg-ain-shams", name: "جامعة عين شمس", nameEn: "Ain Shams University", country: "مصر", countryEn: "Egypt", flag: "🇪🇬", city: "القاهرة", cityEn: "Cairo", type: "government", website: "https://www.asu.edu.eg/", faculties: ["الطب", "الهندسة", "الألسن", "التجارة", "التربية"], minPercentage: 82, language: "mixed", scholarships: true, highlights: "متميزة في كلية الألسن والطب، ورسوم الوافدين معقولة.", highlightsEn: "Renowned for languages and medicine with reasonable international fees." },
  { id: "eg-azhar", name: "جامعة الأزهر", nameEn: "Al-Azhar University", country: "مصر", countryEn: "Egypt", flag: "🇪🇬", city: "القاهرة", cityEn: "Cairo", type: "government", website: "https://www.azhar.edu.eg/", faculties: ["الشريعة", "أصول الدين", "الطب", "الهندسة", "اللغة العربية"], minPercentage: 70, language: "ar", scholarships: true, highlights: "منح كاملة للطلاب المسلمين من كل العالم عبر البعوث الإسلامية.", highlightsEn: "Full scholarships for Muslim students worldwide via Islamic missions." },

  // --- السعودية (Saudi Arabia) ---
  { id: "sa-kau", name: "جامعة الملك عبدالعزيز", nameEn: "King Abdulaziz University", country: "السعودية", countryEn: "Saudi Arabia", flag: "🇸🇦", city: "جدة", cityEn: "Jeddah", type: "government", website: "https://www.kau.edu.sa/", faculties: ["الطب", "الهندسة", "علوم الحاسب", "علوم البحار", "إدارة الأعمال"], minPercentage: 88, language: "mixed", scholarships: true, highlights: "منح دراسية كاملة مع مكافأة شهرية وتذاكر سفر.", highlightsEn: "Full scholarships with monthly stipend and travel tickets." },
  { id: "sa-kfupm", name: "جامعة الملك فهد للبترول والمعادن", nameEn: "KFUPM", country: "السعودية", countryEn: "Saudi Arabia", flag: "🇸🇦", city: "الظهران", cityEn: "Dhahran", type: "government", website: "https://www.kfupm.edu.sa/", faculties: ["الهندسة", "علوم الحاسب", "علوم الأرض", "إدارة الأعمال"], minPercentage: 92, language: "en", scholarships: true, highlights: "الأولى عربياً في الهندسة والبترول، الدراسة بالإنجليزية بالكامل.", highlightsEn: "Top Arab school for engineering and petroleum, fully taught in English." },
  { id: "sa-ksu", name: "جامعة الملك سعود", nameEn: "King Saud University", country: "السعودية", countryEn: "Saudi Arabia", flag: "🇸🇦", city: "الرياض", cityEn: "Riyadh", type: "government", website: "https://ksu.edu.sa/", faculties: ["الطب", "الهندسة", "الحاسب", "العلوم", "إدارة الأعمال"], minPercentage: 90, language: "mixed", scholarships: true, highlights: "أعرق جامعات المملكة مع مرافق بحثية ضخمة.", highlightsEn: "The Kingdom's oldest university with vast research facilities." },

  // --- الإمارات (UAE) ---
  { id: "ae-uaeu", name: "جامعة الإمارات العربية المتحدة", nameEn: "United Arab Emirates University", country: "الإمارات", countryEn: "UAE", flag: "🇦🇪", city: "العين", cityEn: "Al Ain", type: "government", website: "https://www.uaeu.ac.ae/", faculties: ["الطب", "الهندسة", "تقنية المعلومات", "الأعمال", "العلوم"], minPercentage: 85, language: "en", scholarships: true, highlights: "أعلى تصنيفاً في الخليج، منح للطلاب المتفوقين.", highlightsEn: "Highest-ranked in the Gulf, scholarships for high achievers." },
  { id: "ae-ku", name: "جامعة خليفة", nameEn: "Khalifa University", country: "الإمارات", countryEn: "UAE", flag: "🇦🇪", city: "أبوظبي", cityEn: "Abu Dhabi", type: "government", website: "https://www.ku.ac.ae/", faculties: ["الهندسة", "الذكاء الاصطناعي", "الطب", "العلوم"], minPercentage: 90, language: "en", scholarships: true, highlights: "منح كاملة تشمل السكن والراتب لطلاب الهندسة والذكاء الاصطناعي.", highlightsEn: "Full scholarships with housing and stipend for engineering and AI." },

  // --- قطر (Qatar) ---
  { id: "qa-qu", name: "جامعة قطر", nameEn: "Qatar University", country: "قطر", countryEn: "Qatar", flag: "🇶🇦", city: "الدوحة", cityEn: "Doha", type: "government", website: "https://www.qu.edu.qa/", faculties: ["الطب", "الهندسة", "الشريعة", "الإدارة", "التربية"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "منح للطلاب الدوليين مع إعفاء من الرسوم الدراسية.", highlightsEn: "International scholarships with tuition waivers." },

  // --- الكويت (Kuwait) ---
  { id: "kw-ku", name: "جامعة الكويت", nameEn: "Kuwait University", country: "الكويت", countryEn: "Kuwait", flag: "🇰🇼", city: "مدينة الكويت", cityEn: "Kuwait City", type: "government", website: "https://www.ku.edu.kw/", faculties: ["الطب", "الهندسة", "الحقوق", "العلوم الإدارية"], minPercentage: 86, language: "mixed", scholarships: true, highlights: "عدد محدود من المنح المخصصة للطلاب العرب.", highlightsEn: "Limited scholarship seats allocated to Arab students." },

  // --- عُمان (Oman) ---
  { id: "om-squ", name: "جامعة السلطان قابوس", nameEn: "Sultan Qaboos University", country: "عُمان", countryEn: "Oman", flag: "🇴🇲", city: "مسقط", cityEn: "Muscat", type: "government", website: "https://www.squ.edu.om/", faculties: ["الطب", "الهندسة", "الزراعة", "العلوم", "الاقتصاد"], minPercentage: 84, language: "en", scholarships: true, highlights: "منح سنوية للطلاب العرب مع سكن جامعي مجاني.", highlightsEn: "Annual Arab-student scholarships with free housing." },

  // --- البحرين (Bahrain) ---
  { id: "bh-uob", name: "جامعة البحرين", nameEn: "University of Bahrain", country: "البحرين", countryEn: "Bahrain", flag: "🇧🇭", city: "المنامة", cityEn: "Manama", type: "government", website: "https://www.uob.edu.bh/", faculties: ["الهندسة", "تقنية المعلومات", "الأعمال", "الآداب"], minPercentage: 78, language: "mixed", scholarships: false, highlights: "رسوم تنافسية وبرامج هندسية معتمدة دولياً.", highlightsEn: "Competitive fees and internationally accredited engineering programs." },

  // --- الأردن (Jordan) ---
  { id: "jo-ju", name: "الجامعة الأردنية", nameEn: "University of Jordan", country: "الأردن", countryEn: "Jordan", flag: "🇯🇴", city: "عمّان", cityEn: "Amman", type: "government", website: "https://ju.edu.jo/", faculties: ["الطب", "الهندسة", "الصيدلة", "تقنية المعلومات", "الحقوق"], minPercentage: 85, language: "mixed", scholarships: true, highlights: "الأكثر استقطاباً للطلاب العرب في المشرق.", highlightsEn: "The most popular destination for Arab students in the Levant." },
  { id: "jo-just", name: "جامعة العلوم والتكنولوجيا الأردنية", nameEn: "Jordan University of Science & Technology", country: "الأردن", countryEn: "Jordan", flag: "🇯🇴", city: "إربد", cityEn: "Irbid", type: "government", website: "https://www.just.edu.jo/", faculties: ["الطب", "طب الأسنان", "الهندسة", "الصيدلة", "التمريض"], minPercentage: 87, language: "en", scholarships: true, highlights: "من الأقوى عربياً في الطب والهندسة.", highlightsEn: "Among the strongest Arab schools in medicine and engineering." },

  // --- لبنان (Lebanon) ---
  { id: "lb-aub", name: "الجامعة الأميركية في بيروت", nameEn: "American University of Beirut", country: "لبنان", countryEn: "Lebanon", flag: "🇱🇧", city: "بيروت", cityEn: "Beirut", type: "private", website: "https://www.aub.edu.lb/", faculties: ["الطب", "الهندسة", "إدارة الأعمال", "العلوم الصحية", "الآداب"], minPercentage: 85, language: "en", scholarships: true, highlights: "منح مالية سخية قائمة على الحاجة والتفوق.", highlightsEn: "Generous need- and merit-based financial aid." },
  { id: "lb-ul", name: "الجامعة اللبنانية", nameEn: "Lebanese University", country: "لبنان", countryEn: "Lebanon", flag: "🇱🇧", city: "بيروت", cityEn: "Beirut", type: "government", website: "https://www.ul.edu.lb/", faculties: ["الطب", "الهندسة", "العلوم", "الحقوق", "الإعلام"], minPercentage: 70, language: "mixed", scholarships: false, highlights: "الجامعة الحكومية الوحيدة في لبنان، رسوم رمزية.", highlightsEn: "Lebanon's only public university, symbolic tuition." },

  // --- سوريا (Syria) ---
  { id: "sy-damascus", name: "جامعة دمشق", nameEn: "Damascus University", country: "سوريا", countryEn: "Syria", flag: "🇸🇾", city: "دمشق", cityEn: "Damascus", type: "government", website: "https://damascusuniversity.edu.sy/", faculties: ["الطب", "الهندسة", "الصيدلة", "الحقوق", "الآداب"], minPercentage: 75, language: "ar", scholarships: false, highlights: "من أقدم الجامعات العربية ورسومها منخفضة جداً.", highlightsEn: "One of the oldest Arab universities with very low fees." },

  // --- العراق (Iraq) ---
  { id: "iq-baghdad", name: "جامعة بغداد", nameEn: "University of Baghdad", country: "العراق", countryEn: "Iraq", flag: "🇮🇶", city: "بغداد", cityEn: "Baghdad", type: "government", website: "https://uobaghdad.edu.iq/", faculties: ["الطب", "الهندسة", "العلوم", "الإدارة والاقتصاد", "التربية"], minPercentage: 80, language: "ar", scholarships: false, highlights: "أكبر جامعات العراق وأوسعها تخصصاً.", highlightsEn: "Iraq's largest and most diverse university." },
  { id: "iq-auis", name: "الجامعة الأميركية في العراق - السليمانية", nameEn: "AUIS", country: "العراق", countryEn: "Iraq", flag: "🇮🇶", city: "السليمانية", cityEn: "Sulaymaniyah", type: "private", website: "https://auis.edu.krd/", faculties: ["تقنية المعلومات", "الهندسة", "إدارة الأعمال", "العلوم السياسية"], minPercentage: 75, language: "en", scholarships: true, highlights: "منح جزئية وكاملة ودراسة بالإنجليزية بنظام أميركي.", highlightsEn: "Partial and full scholarships, US-style English instruction." },

  // --- فلسطين (Palestine) ---
  { id: "ps-birzeit", name: "جامعة بيرزيت", nameEn: "Birzeit University", country: "فلسطين", countryEn: "Palestine", flag: "🇵🇸", city: "بيرزيت", cityEn: "Birzeit", type: "private", website: "https://www.birzeit.edu/", faculties: ["الهندسة", "تقنية المعلومات", "الحقوق", "الأعمال", "العلوم"], minPercentage: 75, language: "mixed", scholarships: true, highlights: "الأعلى تصنيفاً في فلسطين مع صندوق منح للطلاب.", highlightsEn: "Palestine's top-ranked university with a student aid fund." },

  // --- الجزائر (Algeria) ---
  { id: "dz-usthb", name: "جامعة هواري بومدين للعلوم والتكنولوجيا", nameEn: "USTHB", country: "الجزائر", countryEn: "Algeria", flag: "🇩🇿", city: "الجزائر العاصمة", cityEn: "Algiers", type: "government", website: "https://www.usthb.dz/", faculties: ["الهندسة", "الإعلام الآلي", "الفيزياء", "الكيمياء", "الرياضيات"], minPercentage: 78, language: "mixed", scholarships: true, highlights: "أهم قطب علمي وتقني في الجزائر، التعليم مجاني.", highlightsEn: "Algeria's leading science and tech hub, tuition-free." },

  // --- المغرب (Morocco) ---
  { id: "ma-um5", name: "جامعة محمد الخامس", nameEn: "Mohammed V University", country: "المغرب", countryEn: "Morocco", flag: "🇲🇦", city: "الرباط", cityEn: "Rabat", type: "government", website: "https://www.um5.ac.ma/", faculties: ["الطب", "الهندسة", "الحقوق", "العلوم", "الآداب"], minPercentage: 80, language: "mixed", scholarships: true, highlights: "منح الوكالة المغربية للتعاون الدولي للطلاب الأفارقة والعرب.", highlightsEn: "AMCI scholarships for African and Arab students." },
  { id: "ma-al-akhawayn", name: "جامعة الأخوين", nameEn: "Al Akhawayn University", country: "المغرب", countryEn: "Morocco", flag: "🇲🇦", city: "إفران", cityEn: "Ifrane", type: "private", website: "https://www.aui.ma/", faculties: ["إدارة الأعمال", "الهندسة", "العلوم الإنسانية"], minPercentage: 80, language: "en", scholarships: true, highlights: "نظام أميركي بالإنجليزية مع منح على أساس الحاجة.", highlightsEn: "US-style English curriculum with need-based aid." },

  // --- تونس (Tunisia) ---
  { id: "tn-tunis-manar", name: "جامعة تونس المنار", nameEn: "University of Tunis El Manar", country: "تونس", countryEn: "Tunisia", flag: "🇹🇳", city: "تونس", cityEn: "Tunis", type: "government", website: "http://www.utm.rnu.tn/", faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد"], minPercentage: 78, language: "mixed", scholarships: true, highlights: "قوية في الطب والهندسة مع رسوم منخفضة جداً.", highlightsEn: "Strong in medicine and engineering with very low fees." },

  // --- ليبيا (Libya) ---
  { id: "ly-tripoli", name: "جامعة طرابلس", nameEn: "University of Tripoli", country: "ليبيا", countryEn: "Libya", flag: "🇱🇾", city: "طرابلس", cityEn: "Tripoli", type: "government", website: "https://uot.edu.ly/", faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد", "التربية"], minPercentage: 70, language: "ar", scholarships: false, highlights: "أكبر جامعات ليبيا والتعليم فيها شبه مجاني.", highlightsEn: "Libya's largest university with nearly free education." },

  // ==========================================
  // --- السودان (Sudan) — الدليل الشامل الكامل ---
  // ==========================================
  {
    id: "sd-khartoum",
    name: "جامعة الخرطوم",
    nameEn: "University of Khartoum",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الخرطوم",
    cityEn: "Khartoum",
    type: "government",
    website: "https://www.uofk.edu/",
    faculties: ["الطب", "الهندسة", "العلوم", "الاقتصاد", "القانون", "الآداب", "الصيدلة", "طب الأسنان"],
    minPercentage: 85,
    language: "mixed",
    scholarships: true,
    highlights: "أعرق الجامعات السودانية (تأسست 1902)، وأعلى الجامعات تنافساً في القبول بالدولة.",
    highlightsEn: "Sudan's oldest and most prestigious university (est. 1902), top competitive admission standard."
  },
  {
    id: "sd-sust",
    name: "جامعة السودان للعلوم والتكنولوجيا",
    nameEn: "Sudan University of Science & Technology",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الخرطوم",
    cityEn: "Khartoum",
    type: "government",
    website: "https://sustech.edu/",
    faculties: ["الهندسة", "الحاسوب", "الطب", "علوم الاتصالات", "التربية", "الإعلام", "الموسيقى والدراما"],
    minPercentage: 78,
    language: "mixed",
    scholarships: true,
    highlights: "أكبر جامعة تقنية وتطبيقية في السودان بأكثر من 20 كلية ومعامل حديثة.",
    highlightsEn: "Sudan's leading technical and applied university with over 20 specialized faculties."
  },
  {
    id: "sd-gezira",
    name: "جامعة الجزيرة",
    nameEn: "University of Gezira",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "ود مدني",
    cityEn: "Wad Madani",
    type: "government",
    website: "https://uofg.edu.sd/",
    faculties: ["الطب", "الزراعة", "الاقتصاد الريفي", "الهندسة", "العلوم", "التربية", "الطب البيطري"],
    minPercentage: 80,
    language: "mixed",
    scholarships: true,
    highlights: "رائدة دولياً في الطب المجتمعي والزراعة والتنمية الريفية، مشروع الجزيرة.",
    highlightsEn: "Globally recognized leader in community medicine, agriculture, and rural development."
  },
  {
    id: "sd-neelain",
    name: "جامعة النيلين",
    nameEn: "Al-Neelain University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الخرطوم",
    cityEn: "Khartoum",
    type: "government",
    website: "https://neelain.edu.sd/",
    faculties: ["الطب", "القانون", "الاقتصاد", "العلوم السياسية", "الهندسة", "الحاسوب", "الآداب"],
    minPercentage: 75,
    language: "mixed",
    scholarships: true,
    highlights: "امتداد فرع جامعة القاهرة بالخرطوم (1955)، رائدة في كليتي القانون والطب.",
    highlightsEn: "Rooted in Cairo University's Khartoum branch (1955), distinguished in law and medicine."
  },
  {
    id: "sd-omdurman",
    name: "جامعة أم درمان الإسلامية",
    nameEn: "Omdurman Islamic University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "أم درمان",
    cityEn: "Omdurman",
    type: "government",
    website: "https://oiu.edu.sd/",
    faculties: ["الشريعة والقانون", "أصول الدين", "الدعوة", "الطب", "الصيدلة", "الهندسة"],
    minPercentage: 72,
    language: "ar",
    scholarships: true,
    highlights: "أعرق معقل للعلوم الإسلامية والشريعة إلى جانب الكليات الطبية والهندسية.",
    highlightsEn: "Historic hub for Islamic jurisprudence, Sharia, medicine, and engineering (est. 1912)."
  },
  {
    id: "sd-bakht-alruda",
    name: "جامعة بخت الرضا",
    nameEn: "Bakht Al-Ruda University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الدويم",
    cityEn: "Ad-Duwaym",
    type: "government",
    website: "https://bakhtalruda.edu.sd/",
    faculties: ["التربية", "الآداب", "الاقتصاد", "الزراعة", "علوم الحاسوب"],
    minPercentage: 65,
    language: "mixed",
    scholarships: false,
    highlights: "امتداد لمعهد بخت الرضا التربوي التاريخي الرائد في إعداد المعلمين والمناهج.",
    highlightsEn: "Heritage institution renowned for teacher training and educational development."
  },
  {
    id: "sd-dilling",
    name: "جامعة الدلنج",
    nameEn: "Dilling University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الدلنج",
    cityEn: "Dilling",
    type: "government",
    website: "https://dilling.edu.sd/",
    faculties: ["التربية", "الطب", "العلوم الطبية التطبيقية", "الاقتصاد", "الغابات والمراعي"],
    minPercentage: 62,
    language: "mixed",
    scholarships: false,
    highlights: "تخدم إقليم كردفان بتخصصات طبية وزراعية وبيئية متميزة.",
    highlightsEn: "Serving the Kordofan region with specialized medical, agricultural, and forestry programs."
  },
  {
    id: "sd-kordofan",
    name: "جامعة كردفان",
    nameEn: "University of Kordofan",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الأبيض",
    cityEn: "El Obeid",
    type: "government",
    website: "https://kord.edu.sd/",
    faculties: ["الطب", "الطب البيطري", "الزراعة", "علوم الأغذية", "التربية", "الهندسة"],
    minPercentage: 70,
    language: "mixed",
    scholarships: true,
    highlights: "أكبر صرح تعليمي بغرب السودان، متميزة في الطب البشري والبيطري والصمغ العربي.",
    highlightsEn: "Largest higher-ed institution in Western Sudan, strong in medicine and veterinary sciences."
  },
  {
    id: "sd-red-sea",
    name: "جامعة البحر الأحمر",
    nameEn: "Red Sea University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "بورتسودان",
    cityEn: "Port Sudan",
    type: "government",
    website: "https://rsu.edu.sd/",
    faculties: ["علوم البحار", "الهندسة البحرية", "التعدين", "الطب", "الاقتصاد"],
    minPercentage: 68,
    language: "mixed",
    scholarships: true,
    highlights: "الجامعة الوحيدة بالسودان المتخصصة في علوم البحار، الملاحة، والهندسة البحرية والتعدين.",
    highlightsEn: "Sudan's premier maritime university specializing in marine science, naval engineering, and mining."
  },
  {
    id: "sd-nile-valley",
    name: "جامعة وادي النيل",
    nameEn: "Nile Valley University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "عطبرة",
    cityEn: "Atbara",
    type: "government",
    website: "https://nilevalley.edu.sd/",
    faculties: ["الطب", "الصيدلة", "الهندسة", "التعدين", "الآداب", "التربية"],
    minPercentage: 74,
    language: "mixed",
    scholarships: true,
    highlights: "متميزة في هندسة التعدين وهندسة السكك الحديدية والكليات الطبية في نهر النيل.",
    highlightsEn: "Renowned for mining engineering, railway systems, and medical faculties in River Nile state."
  },
  {
    id: "sd-shendi",
    name: "جامعة شندي",
    nameEn: "Shendi University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "شندي",
    cityEn: "Shendi",
    type: "government",
    website: "https://ush.sd/",
    faculties: ["الطب", "طب الأسنان", "الصيدلة", "التمريض", "العلوم الطبية التطبيقية"],
    minPercentage: 76,
    language: "mixed",
    scholarships: true,
    highlights: "معروفة بمجمع كلياتها الطبية المتكاملة ومستشفياتها التعليمية الحديثة.",
    highlightsEn: "Prominent center for medical education, dentistry, pharmacy, and healthcare training."
  },
  {
    id: "sd-sennar",
    name: "جامعة سنار",
    nameEn: "Sennar University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "سنار",
    cityEn: "Sennar",
    type: "government",
    website: "https://sinnaru.edu.sd/",
    faculties: ["الطب", "الزراعة", "علوم الحاسوب", "التربية", "الاقتصاد"],
    minPercentage: 68,
    language: "mixed",
    scholarships: false,
    highlights: "قوية في علوم الزراعة والري المروي والإنتاج الحيواني.",
    highlightsEn: "Specialized in agricultural sciences, irrigation engineering, and veterinary production."
  },
  {
    id: "sd-ahfad",
    name: "جامعة الأحفاد للبنات",
    nameEn: "Ahfad University for Women",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "أم درمان",
    cityEn: "Omdurman",
    type: "private",
    website: "https://www.ahfad.edu.sd/",
    faculties: ["الطب", "الصيدلة", "علم النفس", "التنمية الريفية", "إدارة الأعمال", "العلوم الصحية"],
    minPercentage: 70,
    language: "en",
    scholarships: true,
    highlights: "الجامعة الرائدة الأولى في تمكين وتعليم المرأة على مستوى القارة الأفريقية والعالم العربي.",
    highlightsEn: "Pioneering private women's university across Africa and the Arab world, taught in English."
  },
  {
    id: "sd-mashreq",
    name: "جامعة المشرق",
    nameEn: "Al-Mashreq University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الخرطوم",
    cityEn: "Khartoum",
    type: "private",
    website: "https://almashreq.edu.sd/",
    faculties: ["الحاسوب", "الهندسة", "علوم الاتصالات", "إدارة الأعمال", "الصيدلة"],
    minPercentage: 60,
    language: "en",
    scholarships: false,
    highlights: "جامعة خاصة رائدة في هندسة الاتصالات وتقنية المعلومات والذكاء الاصطناعي.",
    highlightsEn: "Leading private university in telecom engineering, computer science, and modern technology."
  },
  {
    id: "sd-future",
    name: "جامعة المستقبل",
    nameEn: "Future University",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الخرطوم",
    cityEn: "Khartoum",
    type: "private",
    website: "https://fu.edu.sd/",
    faculties: ["الهندسة", "الحاسوب", "الاتصالات", "الطاقة", "إدارة الأعمال"],
    minPercentage: 60,
    language: "en",
    scholarships: false,
    highlights: "من أوائل الجامعات الخاصة في السودان، قوية في هندسة الطاقة المتجددة وعلوم الفضاء.",
    highlightsEn: "Prominent private tech university focused on renewable energy, ICT, and space tech."
  },
  {
    id: "sd-mut",
    name: "الجامعة الحديثة للعلوم والتكنولوجيا",
    nameEn: "Modern University for Sciences & Technology",
    country: "السودان",
    countryEn: "Sudan",
    flag: "🇸🇩",
    city: "الخرطوم",
    cityEn: "Khartoum",
    type: "private",
    website: "https://must.edu.sd/",
    faculties: ["الطب", "طب الأسنان", "الصيدلة", "الهندسة", "علوم الحاسوب"],
    minPercentage: 68,
    language: "mixed",
    scholarships: false,
    highlights: "جامعة خاصة حديثة تركز على العلوم الطبية وطب الأسنان والصيدلة السريرية.",
    highlightsEn: "Modern private institution emphasizing medical sciences, dentistry, and clinical pharmacy."
  },

  // --- اليمن (Yemen) ---
  { id: "ye-sanaa", name: "جامعة صنعاء", nameEn: "Sana'a University", country: "اليمن", countryEn: "Yemen", flag: "🇾🇪", city: "صنعاء", cityEn: "Sanaa", type: "government", website: "https://su.edu.ye/", faculties: ["الطب", "الهندسة", "التربية", "الآداب", "التجارة"], minPercentage: 70, language: "ar", scholarships: false, highlights: "أكبر جامعات اليمن مع رسوم رمزية.", highlightsEn: "Yemen's largest university with symbolic fees." },

  // --- موريتانيا (Mauritania) ---
  { id: "mr-nouakchott", name: "جامعة نواكشوط العصرية", nameEn: "University of Nouakchott", country: "موريتانيا", countryEn: "Mauritania", flag: "🇲🇷", city: "نواكشوط", cityEn: "Nouakchott", type: "government", website: "https://una.mr/", faculties: ["العلوم", "الطب", "الحقوق", "الآداب"], minPercentage: 65, language: "mixed", scholarships: false, highlights: "الجامعة الوطنية الرئيسية، تدريس بالعربية والفرنسية.", highlightsEn: "The main national university, teaching in Arabic and French." },

  // --- الصومال (Somalia) ---
  { id: "so-snu", name: "الجامعة الوطنية الصومالية", nameEn: "Somali National University", country: "الصومال", countryEn: "Somalia", flag: "🇸🇴", city: "مقديشو", cityEn: "Mogadishu", type: "government", website: "https://snu.edu.so/", faculties: ["الطب", "الهندسة", "الاقتصاد", "التربية", "الشريعة"], minPercentage: 60, language: "mixed", scholarships: false, highlights: "الجامعة الحكومية الأم بعد إعادة تأسيسها.", highlightsEn: "The re-established flagship public university." },

  // --- جيبوتي (Djibouti) ---
  { id: "dj-ud", name: "جامعة جيبوتي", nameEn: "University of Djibouti", country: "جيبوتي", countryEn: "Djibouti", flag: "🇩🇯", city: "جيبوتي", cityEn: "Djibouti", type: "government", website: "https://www.univ.edu.dj/", faculties: ["الهندسة", "الحقوق", "الآداب", "العلوم"], minPercentage: 60, language: "mixed", scholarships: false, highlights: "التدريس بالفرنسية أساساً مع برامج بالعربية.", highlightsEn: "Mainly French instruction with some Arabic programs." },

  // --- جزر القمر (Comoros) ---
  { id: "km-comoros", name: "جامعة القمر", nameEn: "University of Comoros", country: "جزر القمر", countryEn: "Comoros", flag: "🇰🇲", city: "موروني", cityEn: "Moroni", type: "government", website: "https://www.univ-comores.km/", faculties: ["العلوم", "الحقوق", "الآداب", "التربية"], minPercentage: 60, language: "mixed", scholarships: false, highlights: "الجامعة الوطنية الوحيدة في الأرخبيل.", highlightsEn: "The archipelago's only national university." },
];

export const ARAB_COUNTRIES = Array.from(
  new Map(
    ARAB_UNIVERSITIES.map((u) => [u.country, { country: u.country, countryEn: u.countryEn, flag: u.flag }])
  ).values()
).sort((a, b) => {
  if (a.country === "السودان" || a.countryEn === "Sudan") return -1;
  if (b.country === "السودان" || b.countryEn === "Sudan") return 1;
  return 0;
});

export const ARAB_FACULTIES = Array.from(
  new Set(ARAB_UNIVERSITIES.flatMap((u) => u.faculties))
).sort();

/* ------------------------------------------------------------------ */
/* قاموس ترجمة الكليات والتخصصات للعربية والإنجليزية                  */
/* ------------------------------------------------------------------ */
export const FACULTY_TRANSLATIONS: Record<string, string> = {
  "الطب": "Medicine",
  "الهندسة": "Engineering",
  "الحقوق": "Law",
  "الاقتصاد والعلوم السياسية": "Economics & Political Science",
  "الصيدلة": "Pharmacy",
  "الحاسبات": "Computer Science",
  "الحاسوب": "Computer Science",
  "علوم الحاسب": "Computer Science",
  "علوم الحاسوب": "Computer Science",
  "تقنية المعلومات": "Information Technology",
  "الألسن": "Languages & Translation",
  "التجارة": "Commerce & Business",
  "التربية": "Education",
  "الشريعة": "Islamic Law (Sharia)",
  "الشريعة والقانون": "Sharia & Law",
  "أصول الدين": "Theology (Usul Al-Din)",
  "الدعوة": "Islamic Mission (Dawah)",
  "اللغة العربية": "Arabic Language",
  "علوم البحار": "Marine Science",
  "الهندسة البحرية": "Marine Engineering",
  "التعدين": "Mining Engineering",
  "إدارة الأعمال": "Business Administration",
  "الأعمال": "Business",
  "العلوم": "Natural Sciences",
  "علوم الأرض": "Earth Sciences",
  "الذكاء الاصطناعي": "Artificial Intelligence",
  "الزراعة": "Agriculture",
  "الاقتصاد": "Economics",
  "الاقتصاد الريفي": "Rural Economics",
  "طب الأسنان": "Dentistry",
  "التمريض": "Nursing",
  "العلوم الصحية": "Health Sciences",
  "العلوم الطبية التطبيقية": "Applied Medical Sciences",
  "الآداب": "Arts & Humanities",
  "العلوم الإنسانية": "Humanities",
  "الإعلام": "Media & Mass Communication",
  "علوم الاتصالات": "Telecommunications",
  "الاتصالات": "Telecom Engineering",
  "الطاقة": "Energy Engineering",
  "الموسيقى والدراما": "Music & Drama",
  "الطب البيطري": "Veterinary Medicine",
  "الغابات والمراعي": "Forestry & Range Sciences",
  "علوم الأغذية": "Food Sciences",
  "علم النفس": "Psychology",
  "التنمية الريفية": "Rural Development",
  "العلوم السياسية": "Political Science",
  "الإعلام الآلي": "Informatics & Computing",
  "الفيزياء": "Physics",
  "الكيمياء": "Chemistry",
  "الرياضيات": "Mathematics",
};

export const getFacultyLabel = (faculty: string, lang: "ar" | "en" = "ar"): string => {
  if (lang === "ar") return faculty;
  return FACULTY_TRANSLATIONS[faculty] || faculty;
};

export const CITY_TRANSLATIONS: Record<string, string> = {
  "القاهرة": "Cairo",
  "جدة": "Jeddah",
  "الظهران": "Dhahran",
  "الرياض": "Riyadh",
  "العين": "Al Ain",
  "أبوظبي": "Abu Dhabi",
  "الدوحة": "Doha",
  "مدينة الكويت": "Kuwait City",
  "مسقط": "Muscat",
  "المنامة": "Manama",
  "عمّان": "Amman",
  "إربد": "Irbid",
  "بيروت": "Beirut",
  "دمشق": "Damascus",
  "بغداد": "Baghdad",
  "السليمانية": "Sulaymaniyah",
  "بيرزيت": "Birzeit",
  "الجزائر العاصمة": "Algiers",
  "الرباط": "Rabat",
  "إفران": "Ifrane",
  "تونس": "Tunis",
  "طرابلس": "Tripoli",
  "الخرطوم": "Khartoum",
  "ود مدني": "Wad Madani",
  "أم درمان": "Omdurman",
  "الدويم": "Ad-Duwaym",
  "الدلنج": "Dilling",
  "الأبيض": "El Obeid",
  "بورتسودان": "Port Sudan",
  "عطبرة": "Atbara",
  "شندي": "Shendi",
  "سنار": "Sennar",
  "صنعاء": "Sanaa",
  "نواكشوط": "Nouakchott",
  "مقديشو": "Mogadishu",
  "جيبوتي": "Djibouti",
  "موروني": "Moroni",
};

export const getCityLabel = (city: string, lang: "ar" | "en" = "ar"): string => {
  if (lang === "ar") return city;
  return CITY_TRANSLATIONS[city] || city;
};

/* ------------------------------------------------------------------ */
/* تفاصيل موسّعة: تُشتقّ من الدولة ونوع الجامعة (بيانات إرشادية)        */
/* ------------------------------------------------------------------ */

export interface ArabUniDetails {
  tuition: string;
  tuitionEn: string;
  living: string;
  livingEn: string;
  seasons: string;
  seasonsEn: string;
  docs: string[];
  docsEn: string[];
  steps: string[];
  stepsEn: string[];
  alumni?: string[];
  alumniEn?: string[];
}

/** تحويل علم الدولة (Regional Indicators) إلى رمز ISO مثل EG / SA */
export const flagToCode = (flag: string): string =>
  Array.from(flag)
    .map((ch) => ch.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 65))
    .join("");

const GULF = ["السعودية", "الإمارات", "قطر", "الكويت", "عُمان", "البحرين"];
const LEVANT = ["الأردن", "لبنان", "سوريا", "فلسطين", "العراق"];

export const getUniDetails = (u: ArabUniversity): ArabUniDetails => {
  // تفاصيل خاصة لجامعات السودان
  if (u.country === "السودان" || u.countryEn === "Sudan") {
    const gov = u.type === "government";
    return {
      tuition: gov
        ? "رسوم حكومية مدعومة (150,000 – 600,000 جنيه سوداني سنوياً / تقريباً $250 - $700)"
        : "رسوم خاصة (1.5 – 6 مليون جنيه سوداني سنوياً / تقريباً $1,200 - $4,500)",
      tuitionEn: gov
        ? "Subsidized public tuition (150,000 – 600,000 SDG / ~ $250 - $700 per year)"
        : "Private university fees (1.5 – 6 Million SDG / ~ $1,200 - $4,500 per year)",
      living: u.city === "الخرطوم" || u.city === "أم درمان"
        ? "تقديرياً $120 – $220 شهرياً (سكن + مواصلات + إعاشة)"
        : "تقديرياً $70 – $140 شهرياً (تكلفة أقل خارج العاصمة)",
      livingEn: u.city === "الخرطوم" || u.city === "أم درمان"
        ? "Est. $120 – $220 / month (housing + meals + transit in capital)"
        : "Est. $70 – $140 / month (lower living costs in regional states)",
      seasons: "القبول العام عبر بوابة التعليم العالي السودانية: أغسطس – نوفمبر مع دور تكميلي.",
      seasonsEn: "National admission portal (Ministry of Higher Education): August – November with spring rounds.",
      docs: [
        "شهادة الثانوية السودانية أو ما يعادلها مصدّقة + كشف الدرجات",
        "الرقم الوطني أو جواز السفر ساري المفعول",
        "صور شخصية حديثة مقاس 4×6 خلفية بيضاء",
        "إيصال سداد رسوم استمارة القبول الإلكتروني",
        gov ? "استمارة القبول العام الإلكترونية (بوابة التعليم العالي)" : "استمارة التقديم المباشر للجامعة",
      ],
      docsEn: [
        "Certified Sudanese Secondary Certificate or approved foreign equivalent + transcripts",
        "National ID number or valid international passport",
        "Recent color passport photos (white background)",
        "Application fee payment receipt voucher",
        gov ? "Electronic National Admission Form (MoHE Portal)" : "Direct university admission application form",
      ],
      steps: gov
        ? [
            "الحصول على رقم الجلوس وشهادة الثانوية المعتمدة",
            "شراء رقم استمارة القبول العام والتسجيل ببوابة التعليم العالي",
            "ترتيب الرغبات الجامعية حسب الأولوية والتنافس",
            "تأكيد الاستمارة ومتابعة نتيجة الترشيح الإلكتروني",
            "إكمال إجراءات الكشف الطبي والتسجيل النهائي وسداد الرسوم",
          ]
        : [
            "التواصل المباشر مع إدارة القبول والتسجيل بالجامعة أو بوابتها",
            "تقديم الشهادة وكشف الدرجات ودفع رسوم المعاينة",
            "اجتياز المقابلة الشخصية أو الفحص الطبي إن وُجد",
            "سداد القسط الأول لتثبيت المقعد واستلام البطاقة الجامعية",
          ],
      stepsEn: gov
        ? [
            "Obtain national exam seat number & verified high school certificate",
            "Purchase electronic application token & register on the MoHE portal",
            "Prioritize faculty preferences from competitive to safe backup choices",
            "Confirm application and await computerized placement results",
            "Complete medical examination, final course registration & fee payment",
          ]
        : [
            "Apply directly through the university admission office or portal",
            "Submit verified secondary school certificate & transcripts",
            "Pass the faculty interview or entrance assessment if required",
            "Pay initial tuition installment to secure placement & receive student ID",
          ],
    };
  }

  // تفاصيل باقي الدول العربية
  const gulf = GULF.includes(u.country);
  const levant = LEVANT.includes(u.country);
  const [t1, t2] = u.type === "private"
    ? gulf ? [8000, 22000] : levant ? [4000, 12000] : [2500, 9000]
    : gulf ? [0, 6000] : levant ? [1500, 6000] : [800, 4000];
  const [l1, l2] = gulf ? [500, 900] : levant ? [300, 550] : [180, 400];
  const fmt = (a: number, b: number) => `${a.toLocaleString()} – ${b.toLocaleString()}`;

  return {
    tuition: `${fmt(t1, t2)} دولار / سنة`,
    tuitionEn: `$${fmt(t1, t2)} / year`,
    living: `${fmt(l1, l2)} دولار / شهر`,
    livingEn: `$${fmt(l1, l2)} / month`,
    seasons: "التقديم الرئيسي: يونيو – سبتمبر · تقديم تكميلي محدود في يناير",
    seasonsEn: "Main intake: June – September · limited spring intake in January",
    docs: [
      "شهادة الثانوية مصدّقة + كشف الدرجات",
      "جواز سفر ساري لمدة سنة على الأقل",
      "شهادة ميلاد مترجمة ومصدّقة",
      "صور شخصية بخلفية بيضاء",
      u.language === "en" ? "إثبات لغة إنجليزية (IELTS/TOEFL) إن طُلب" : "إثبات لغة عند الدراسة بالإنجليزية",
      "تقرير طبي / فحص لياقة صحية",
    ],
    docsEn: [
      "Attested high-school certificate + transcript",
      "Passport valid for at least one year",
      "Translated and attested birth certificate",
      "Passport-size photos, white background",
      u.language === "en" ? "English proof (IELTS/TOEFL) if required" : "Language proof for English-taught tracks",
      "Medical report / health fitness check",
    ],
    steps: [
      "تحقّق من شروط القبول للطلاب الوافدين على الموقع الرسمي",
      "جهّز المستندات وصدّقها من وزارة الخارجية والسفارة",
      "أنشئ حساباً في بوابة القبول الإلكترونية وارفع الملفات",
      "سدّد رسوم التقديم واحفظ إيصال الدفع",
      "تابع البريد الإلكتروني لخطاب القبول المبدئي",
      "بعد القبول: استخرج تأشيرة الدراسة وسجّل المقررات",
    ],
    stepsEn: [
      "Check international-student requirements on the official site",
      "Prepare and attest documents (MoFA + embassy)",
      "Create an account on the admission portal and upload files",
      "Pay the application fee and keep the receipt",
      "Watch your email for the conditional offer letter",
      "After acceptance: obtain the study visa and register courses",
    ],
  };
};

export const ARAB_COUNTRY_STATS = ARAB_COUNTRIES.map((c) => {
  const unis = ARAB_UNIVERSITIES.filter((u) => u.country === c.country);
  return {
    ...c,
    code: flagToCode(c.flag),
    count: unis.length,
    minPercentage: Math.min(...unis.map((u) => u.minPercentage)),
    scholarships: unis.some((u) => u.scholarships),
  };
});
