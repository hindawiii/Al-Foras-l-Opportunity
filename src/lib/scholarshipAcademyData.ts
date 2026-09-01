export interface AcademyModuleTrack {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  iconName: "FileText" | "Mail" | "Users" | "BookOpen" | "Sparkles" | "CheckCircle2";
  estimatedReadTime: string;
  estimatedReadTimeEn: string;
  colorClass: string;
  bgGradient: string;
  summary: string;
  summaryEn: string;
  sections: {
    heading: string;
    headingEn: string;
    content: string;
    contentEn: string;
    bulletPoints?: string[];
    bulletPointsEn?: string[];
    proTip?: string;
    proTipEn?: string;
    copyableTemplate?: {
      templateTitle: string;
      templateTitleEn: string;
      templateBody: string;
      templateBodyEn: string;
      note?: string;
      noteEn?: string;
    };
  }[];
}

export const SCHOLARSHIP_ACADEMY_TRACKS: AcademyModuleTrack[] = [
  {
    id: "sop_mastery",
    title: "صياغة خطاب النوايا الأكاديمي والدافع (SOP / Motivation Letter)",
    titleEn: "Statement of Purpose & Motivation Letter Mastery",
    subtitle: "الهندسة المعمارية لخطاب القبول النخبوي الذي يرفع فرصة القبول إلى +85%",
    subtitleEn: "The structural blueprint for elite scholarship acceptance letters",
    iconName: "FileText",
    estimatedReadTime: "8 دقائق",
    estimatedReadTimeEn: "8 min read",
    colorClass: "text-amber-500",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    summary: "دليل عملي ونماذج تطبيقية معتمدة عالمياً لكتابة خطاب دافع مقنع يبين استحقاقك للمنحة وتمايز مسارك الأكاديمي والمهني.",
    summaryEn: "A practical guide and certified templates for crafting a compelling Motivation Letter that proves your merit and vision.",
    sections: [
      {
        heading: "1. المعادلة الذهبية لهيكل خطاب الدافع (The 4-Pillars Framework)",
        headingEn: "1. The 4-Pillars Framework for Motivation Letters",
        content: "لجان التحكيم الدولية في برامج مثل Chevening و DAAD و Erasmus تقرأ آلاف الخطابات سنوياً، والخطابات الفائزة هي التي تلتزم بالهيكل المتوازن الخالي من الحشو:",
        contentEn: "International scholarship committees review thousands of essays. Winning letters adhere to a balanced, fluff-free 4-pillar structure:",
        bulletPoints: [
          "المقدمة الجاذبة (The Hook): ربط الدافع الأكاديمي بمشكلة حقيقية واجهتها أو شغف تطبيقي محدد دون استخدام عبارات كليشيه.",
          "المسار الأكاديمي والبحثي (Academic Trajectory): إبراز المشاريع والمهارات السابقة وكيف مهدت لك الطريق لهذا التخصص.",
          "لماذا هذه الجامعة تحديداً؟ (Why This University?): ذكر أسماء معامل بحثية، أساتذة، ومقررات دراسية محددة ترغب بدراستها.",
          "الرؤية المستقبلية والأثر التنموي (Future Vision & Impact): كيف ستوظف ما تعلمته لحل مشكلات مجتمعك ودولتك الأم بعد التخرج.",
        ],
        bulletPointsEn: [
          "The Hook: Connecting academic drive to a real-world challenge or specific practical passion, avoiding clichés.",
          "Academic Trajectory: Highlighting previous projects, relevant skills, and intellectual milestones.",
          "Why This Program specifically: Citing specific labs, professors, and specialized modules aligned with your goals.",
          "Long-term Impact: Clear trajectory of how you will deploy this knowledge to advance your home region upon graduation.",
        ],
        proTip: "قاعدة ذهبية: لا تعد كتابة سيرتك الذاتية في الخطاب. السيرة تخبرهم 'ماذا فعلت'، بينما خطاب الدافع يخبرهم 'لماذا فعلت ذلك وكيف تفكر'.",
        proTipEn: "Golden Rule: Never repeat your CV. The CV tells them 'what you achieved', whereas the SOP tells them 'why you chose this and how you think'.",
        copyableTemplate: {
          templateTitle: "قالب خطاب النوايا الأكاديمي المعتمد (جاهز للتخصيص)",
          templateTitleEn: "Certified SOP / Motivation Letter Template",
          templateBody: `السادة أعضاء لجنة اختيار وقبول المنحة المحترمين،

أكتب إليكم للتعبير عن التزامي العميق ورغبتي الأكاديمية الصادقة للالتحاق ببرنامج [الماجستير/الدكتوراه] في تخصص [اسم التخصص/البرنامج] في [اسم الجامعة]، والممول من خلال برنامج [اسم المنحة]. بعد حصولي على درجة البكالوريوس في [مجال دراستك] من [جامعتك السابقة] مع مشروع تخرج ركز على [موضوع المشروع]، يتمثل هدفي المهني والبحثي في قيادة حلول مبتكرة وتنموية في قطاع [المجال المحدد] في منطقة الشرق الأوسط وشمال أفريقيا.

خلال دراستي الجامعية، صببت تركيزي على [المجال التقني/الأكاديمي الأساسي]. وأثناء قيادتي لمشروع [اسم المشروع البحثي أو التطبيقي]، لمست بصورة مباشرة حجم التحديات في [التحدي المحدد، مثل: تكامل شبكات الطاقة المتجددة / معالجة البيانات السريرية]. وقد ألهمتني هذه التجربة لتطوير [النتيجة الملموسة التي حققتها]، مما عزز شغفي للتعمق في الأبحاث المتقدمة تحت إشراف نخبة من كبار العلماء والمتخصصين.

يوفر برنامج [اسم البرنامج] في [اسم الجامعة] البيئة الفكرية والبحثية المثالية لتحقيق تطلعاتي الأكاديمية؛ حيث يجذبني بشكل خاص المقررات المتقدمة في [المقرر 1] و [المقرر 2]، فضلاً عن الأبحاث الرائدة التي تُجرى في [اسم المعمل البحثي أو مجموعة الأستاذ المشرف] حول [موضوع البحث]. إن التركيز العملي للمنهج يتطابق تماماً مع منهجيتي البحثية.

عقب تخرجي، أخطط لتوظيف المنهجيات والخبرات المكتسبة من [اسم الجامعة] لتأسيس والمساهمة في [الهدف المهني/المجتمعي في وطنك الأم، مثل: مبادرات بنية تحتية مستدامة / معمل إقليمي للذكاء الاصطناعي]. كلي ثقة بأن خلفيتي الأكاديمية وإصراري ورؤيتي تؤهلني لأكون مرشحاً جديراً بهذه المنحة المرموقة.

شاكراً لكم حسن اهتمامكم ووقتكم.

وتفضلوا بقبول فائق الاحترام والتقدير،
[اسمك الكامل]
[معلومات الاتصال الخاصة بك]`,
          templateBodyEn: `Dear Members of the Selection Committee,

I am writing to express my strong commitment to pursue the [Master’s/PhD] program in [Program Name] at [University Name], supported by the [Scholarship Name] award. Having completed my Bachelor's degree in [Your Field] at [Your Previous University] with a graduation project focused on [Project Topic], my career objective is to pioneer impactful solutions in [Specific Sector/Field] in the MENA region.

During my undergraduate studies, I focused intensely on [Core Technical Area]. When leading [Specific Research/Industry Project], I observed first-hand the challenges of [Specific Challenge, e.g., renewable grid integration / clinical data processing]. This inspired me to develop [Brief Concrete Outcome], reinforcing my desire to delve deeper into advanced research under the supervision of leading experts.

The [Program Name] at [University Name] provides the ideal intellectual ecosystem for my research trajectory. I am particularly drawn to the specialized modules in [Course 1] and [Course 2], as well as the pioneering work conducted at [Specific Lab or Professor Name's Group] regarding [Research Topic]. The curriculum's strong emphasis on practical innovation aligns perfectly with my research methodology.

Upon graduation, I plan to leverage the advanced methodologies gained from [University Name] to establish [Concrete Career/Social Goal in Home Country, e.g., a regional AI laboratory / sustainable infrastructure initiatives]. I am confident that my academic background, resilience, and vision make me a strong candidate for this prestigious scholarship.

Thank you for your consideration.

Sincerely,
[Your Full Name]
[Your Contact Information]`,
          note: "يمكنك التبديل بين النسخة الإنجليزية المعتمدة والنسخة العربية المعربة للشرح والتخصيص.",
          noteEn: "Customize the bracketed placeholders [ ] with your actual qualifications and goals.",
        },
      },
    ],
  },
  {
    id: "cold_emailing",
    title: "دليل مراسلة المشرفين والأساتذة (Cold Emailing Supervisors)",
    titleEn: "Cold Emailing Supervisors & Securing Academic Sponsorship",
    subtitle: "إتيكيت المراسلة الأكاديمية ونماذج بريد تضمن معدل رد يتجاوز 65%",
    subtitleEn: "Academic etiquette and email blueprints yielding >65% response rates",
    iconName: "Mail",
    estimatedReadTime: "6 دقائق",
    estimatedReadTimeEn: "6 min read",
    colorClass: "text-emerald-500",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    summary: "كيف تختار المشرف المناسب، وكيف تكتب رسالة بريد إلكتروني مختصرة، جذابة، وخالية من الأخطاء التي تجعل البروفيسور يفتح سيرتك الذاتية ويوافق على الإشراف.",
    summaryEn: "How to identify suitable principal investigators and write concise, highly tailored outreach emails that secure academic mentorship.",
    sections: [
      {
        heading: "1. قواعد النجاح في مراسلة المشرفين الأكاديميين",
        headingEn: "1. Core Rules for Professor Outreach",
        content: "يتلقى الأساتذة في الجامعات العالمية (كاوست، إمبريال كوليدج، ميونخ التقنية، إلخ) عشرات الرسائل يومياً. الرسائل التي تُهمل فوراً هي الرسائل العامة المنسوخة (Generic Templates). لتضمن الرد:",
        contentEn: "Global faculty receive dozens of inquiry emails daily. Generic mass templates are deleted instantly. To secure a response:",
        bulletPoints: [
          "عنوان البريد الذكي والواضح: ضع اسمك، اهتمامك البحثي، ومرحلتك في العنوان (مثال: Prospective MSc Student - Machine Learning for Energy - [Your Name]).",
          "قراءة ورقة بحثية حديثة للمشرف: استشهد في السطر الثاني بورقة علمية نشرها البروفيسور في آخر 18 شهراً.",
          "توضيح مصدر التمويل: إذا كنت مؤهلاً لمنحة حكومية أو جامعية اذكر ذلك مباشرة (e.g., Applying with full CSC / DAAD / University fellowship).",
          "الإيجاز الصارم: يجب ألا يتجاوز البريد 200 إلى 250 كلمة مقسمة إلى 3 فقرات قصيرة.",
        ],
        bulletPointsEn: [
          "Crisp Subject Line: State your prospective level, research topic, and funding status clearly.",
          "Cite Recent Literature: Mention a paper published by the professor in the last 18 months in your second sentence.",
          "State Funding Clarity: State clearly if you are applying through a recognized fellowship or fully funded grant.",
          "Strict Brevity: Keep the total email between 200 and 250 words across 3 tight paragraphs.",
        ],
        proTip: "أفضل موعد لإرسال الإيميل بتوقيت دولة المشرف هو يوم الثلاثاء أو الأربعاء بين الساعة 8:30 إلى 9:30 صباحاً.",
        proTipEn: "Best sending window: Tuesday or Wednesday between 8:30 AM and 9:30 AM in the professor's local timezone.",
        copyableTemplate: {
          templateTitle: "نموذج بريد مراسلة المشرف الأكاديمي عالي التحويل (High-Response Email)",
          templateTitleEn: "High-Response Professor Cold Email Template",
          templateBody: `الموضوع: استفسار طالب [ماجستير/دكتوراه] مرتقب: بحث في [موضوع البحث] - [اسمك الكامل]

سعادة الأستاذ الدكتور / [الاسم الأخير للبروفيسور] المحترم،

أتمنى أن تجدكم هذه الرسالة بأتم الصحة والعافية.

لقد تابعت باهتمام وإعجاب كبيرين أبحاثكم المتميزة في [اسم المعمل أو القسم الأكاديمي]، وبخاصة ورقتكم العلمية المنشورة حديثاً بعنوان "[عنوان الورقة العلمية الحديثة]" في [اسم المجلة العلمية أو المؤتمر]. لقد لاقت منهجيتكم المبتكرة في [التقنية أو النتيجة المحددة المذكورة في الورقة] صدى عميقاً مع أبحاثي وتجاربي السابقة في [المجال أو المشروع ذي الصلة].

تخرجت مؤخراً حاصلاً على درجة البكالوريوس في [تخصصك] من [اسم جامعتك] بمعدل تراكمي [معدلك / مرتبة الشرف]، حيث أنجزت [ملخص في جملة واحدة لمشروع تخرجك أو ورقتك العلمية الأولى]. وأنا بصدد التقديم لـ [اسم المنحة أو دورة القبول، مثل: منحة DAAD / قبول خريف 2026]، وسيكون لي عظيم الشرف بإجراء أبحاث [الماجستير/الدكتوراه] تحت إشرافكم الأكاديمي المباشر.

يهدف مقترحي البحثي إلى دراسة واستكشاف [وصف في جملة واحدة لفكرتك البحثية المتوافقة مع أهداف معمل الأستاذ].

أرفقت لسعادتكم سيرتي الذاتية الأكاديمية وسجل الدرجات للاطلاع. هل يُتاح لسعادتكم وقت لمكالمة تعريفية موجزة لمدة 10 دقائق خلال الأسابيع القادمة لمناقشة فرص الانضمام لمجموعتكم البحثية؟

شاكراً لسعادتكم كريم وقتكم وتوجيهكم.

وتفضلوا بقبول فائق التقدير والاحترام،
[اسمك الكامل]
[رابط LinkedIn أو Google Scholar]
[رقم الهاتف]`,
          templateBodyEn: `Subject: Prospective [MSc/PhD] Student: Inquiry on [Research Topic] - [Your Full Name]

Dear Professor [Professor's Last Name],

I hope this email finds you well.

I have been closely following your research at [Lab/Department Name], particularly your recent paper titled "[Recent Paper Title]" published in [Journal/Conference Name]. Your innovative approach to [Specific Technique/Finding in the paper] strongly resonated with my previous research in [Your Related Project/Field].

I recently graduated with a Bachelor's degree in [Your Major] from [Your University] (GPA: [Your GPA/Honors]), where I worked on [1-sentence summary of your key project/publication]. I am preparing to apply for the [Name of Scholarship / Program Intake, e.g., DAAD / Fall 2026 Admissions] and would be honored to conduct my [Master’s/PhD] research under your supervision.

My proposed research aims to investigate [1-sentence description of your research proposal aligned with the professor's lab]. 

I have attached my academic CV and transcript for your review. Would you be available for a brief 10-minute introductory call in the coming weeks to discuss potential alignment with your lab?

Thank you very much for your time and guidance.

Sincerely,
[Your Full Name]
[LinkedIn / Google Scholar link]
[Phone Number]`,
          note: "أرفق ملف السيرة الذاتية بصيغة PDF مسمى باسمك (e.g., CV_YourName_2026.pdf) بحجم أقل من 2 ميغابايت.",
          noteEn: "Always attach your single-page CV in PDF format titled professionally (e.g., CV_YourName_2026.pdf).",
        },
      },
    ],
  },
  {
    id: "interview_prep",
    title: "محاكي المقابلة الشخصية للمنح الدولية (Scholarship Interview Simulator)",
    titleEn: "International Scholarship Interview Simulator & Strategy",
    subtitle: "أهم 10 أسئلة تطرحها لجان التحكيم وكيفية الإجابة باحترافية وفق نموذج STAR",
    subtitleEn: "Top 10 panel questions and behavioral mastery using the STAR methodology",
    iconName: "Users",
    estimatedReadTime: "10 دقائق",
    estimatedReadTimeEn: "10 min read",
    colorClass: "text-blue-500",
    bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    summary: "دليل شامل لتجاوز المقابلات الشفوية للجان المنح الدولية (Chevening, Fulbright, KAUST, Stipendium Hungaricum, MEXT) بثقة وهدوء.",
    summaryEn: "Comprehensive preparation guide for oral scholarship panels with structured responses and STAR framework mastery.",
    sections: [
      {
        heading: "1. منهجية STAR الذهبية للإجابة على الأسئلة السلوكية",
        headingEn: "1. The STAR Method for Behavioral Questions",
        content: "عندما تسألك لجنة التحكيم عن موقف قيادي، تحدٍ صعب، أو فشل سابق، لا تتحدث بشكل عام. استخدم فوراً نموذج STAR:",
        contentEn: "When asked about leadership, adversity, or resilience, structure your answer using STAR:",
        bulletPoints: [
          "S - Situation (الموقف): حدد السياق والمشكلة باختصار في 20 ثانية.",
          "T - Task (المهمة): ما الذي كان مطلوباً منك إنجازه تحديداً؟",
          "A - Action (الإجراء): الخطوات الدقيقة التي اتخذتها أنت شخصياً لحل المشكلة.",
          "R - Result (النتيجة): الأرقام والنتائج الإيجابية الملموسة وما تعلمته للمستقبل.",
        ],
        bulletPointsEn: [
          "S - Situation: Set the scene and context in 20 seconds.",
          "T - Task: Define your specific responsibility in that scenario.",
          "A - Action: Detail the tangible, strategic actions you led or executed.",
          "R - Result: Share quantifiable outcomes, metrics, and lessons learned.",
        ],
        proTip: "في نهاية المقابلة، عندما يسألونك: 'هل لديك أي سؤال لنا؟'، لا تقل 'لا'. اسأل سؤالاً ذكياً عن مجتمع الطلاب الدوليين أو أثر أبحاث البرنامج في منطقتك.",
        proTipEn: "When asked 'Do you have any questions for us?', never say no. Ask about the alumni network impact or collaborative lab initiatives.",
      },
      {
        heading: "2. الأسئلة الأكثر تكراراً وإجاباتها النموذجية",
        headingEn: "2. Most Frequent Scholarship Panel Questions",
        content: "تدرب على هذه الأسئلة الثلاثة الأساسية التي تحسم 70% من درجات المقابلة:",
        contentEn: "Practice these three core questions that determine 70% of panel scoring:",
        bulletPoints: [
          "س1: 'لماذا يجب أن نختارك أنت تحديداً من بين مئات المتقدمين؟' ⬅️ ركز على نقطة التقاطع بين تميزك الأكاديمي، وخبرتك العملية، والتزامك برد الجميل لمجتمعك.",
          "س2: 'ما هي خطتك إذا واجهت صعوبات أكاديمية أو صدمة ثقافية في بلد الابتعاث؟' ⬅️ وضح استراتيجيات التأقلم، طلب المساعدة من المشرفين، والانخراط في الأنشطة الطلابية.",
          "س3: 'أين ترى نفسك بعد 5 سنوات من التخرج؟' ⬅️ حدد منصباً مهنياً أو بحثياً واقعياً، ومشروعاً ملموساً تخطط لإطلاقه أو قيادته.",
        ],
        bulletPointsEn: [
          "Q1: 'Why should we select you over other candidates?' ⬅️ Emphasize the intersection of academic excellence, resilience, and actionable community impact.",
          "Q2: 'How will you cope with cultural transition or academic pressure?' ⬅️ Outline proactive mentorship seeking and university support engagement.",
          "Q3: 'Where do you see yourself in 5 years?' ⬅️ Present a concrete professional milestone and a tangible developmental project in your home country.",
        ],
      },
    ],
  },
  {
    id: "research_proposal",
    title: "مخطط مقترح البحث العلمي (Research Proposal Blueprint)",
    titleEn: "Research Proposal Architecture & Academic Writing",
    subtitle: "كيفية صياغة مشكلة بحثية أصيلة ومنهجية عمل مقنعة لبرامج الماجستير والدكتوراه",
    subtitleEn: "Formulating novel research questions and rigorous methodology for graduate degrees",
    iconName: "BookOpen",
    estimatedReadTime: "12 دقيقة",
    estimatedReadTimeEn: "12 min read",
    colorClass: "text-purple-500",
    bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    summary: "الدليل المنهجي لبناء مقترح بحثي أكاديمي محكم (من 2 إلى 5 صفحات) يلبي أعلى المعايير الدولية للجامعات الأوروبية والأمريكية والعربية المرموقة.",
    summaryEn: "A step-by-step methodology to structure an airtight research proposal (2-5 pages) adhering to rigorous international standards.",
    sections: [
      {
        heading: "1. المكونات السبعة للمقترح البحثي الفائز",
        headingEn: "1. The 7 Components of a Winning Research Proposal",
        content: "المقترح البحثي هو وثيقتك لإثبات قدرتك على التفكير النقدي والبحث المستقل. يتكون المقترح من:",
        contentEn: "Your research proposal demonstrates critical thinking and research independence. It consists of:",
        bulletPoints: [
          "عنوان البحث (Title): محدد، يعكس المتغيرات، ولا يتجاوز 15 كلمة.",
          "المقدمة والمشكلة البحثية (Background & Problem Statement): تحديد الفجوة المعرفية (Knowledge Gap) التي سيعالجها بحثك.",
          "أسئلة وأهداف البحث (Research Questions & Objectives): 1-2 سؤال رئيسي و 3 أهداف فرعية قابلة للقياس (SMART).",
          "مراجعة الأدبيات السابقة (Literature Review): استعراض نقدي لأحدث الأوراق العلمية وكيف يبني بحثك عليها.",
          "المنهجية العلمية (Methodology): الأدوات، جمع البيانات، التحليل الإحصائي أو التجارب المخبرية.",
          "الأهمية والتطبيق العملي (Significance & Impact): القيمة المضافة للأوساط الأكاديمية والصناعية والمجتمعية.",
          "الجدول الزمني والمراجع (Timeline & References): مخطط غانت (Gantt Chart) مقسم على فصول الماجستير أو سنوات الدكتوراه.",
        ],
        bulletPointsEn: [
          "Title: Concise, focused, reflecting variables under 15 words.",
          "Problem Statement: Identifying the specific knowledge gap your research bridges.",
          "Research Questions & Objectives: 1 primary question and 3 measurable SMART objectives.",
          "Literature Review: Critical synthesis of recent state-of-the-art literature.",
          "Methodology: Experimental design, datasets, analytical tools, and statistical validation.",
          "Significance & Impact: Concrete contributions to science, industry, and societal advancement.",
          "Timeline & References: A feasible Gantt chart spanning the degree duration.",
        ],
        proTip: "استخدم برامج إدارة المراجع مثل Zotero أو Mendeley لتوثيق المصادر بدقة بنمط APA أو IEEE وتجنب أخطاء التوثيق القاتلة.",
        proTipEn: "Always use reference managers like Zotero or Mendeley for flawless citation adhering strictly to APA or IEEE formats.",
      },
    ],
  },
];
