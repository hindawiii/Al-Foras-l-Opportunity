export type PaymentCategory = "all" | "virtual_bank" | "local_wallet" | "crypto_cards" | "merchant_gateway";

export interface PaymentMethodItem {
  id: string;
  name: string;
  nameEn: string;
  category: PaymentCategory;
  badge: string;
  badgeEn: string;
  logoEmoji: string;
  logoBg: string; // Tailwind background style or gradient
  rating: number;
  reviewCount: number;
  shortDesc: string;
  shortDescEn: string;
  overview: string;
  overviewEn: string;
  supportedCurrencies: string[];
  sudanAvailability: {
    supported: boolean;
    statusBadgeAr: string;
    statusBadgeEn: string;
    notesAr: string;
    notesEn: string;
  };
  arabCountriesAvailability: string;
  arabCountriesAvailabilityEn: string;
  transferSpeed: string;
  transferSpeedEn: string;
  typicalFees: string;
  typicalFeesEn: string;
  minimumWithdrawal: string;
  minimumWithdrawalEn: string;
  verificationRequirements: {
    ar: string[];
    en: string[];
  };
  keyFeatures: {
    ar: string[];
    en: string[];
  };
  howToLinkWithPlatforms: {
    platformName: string;
    stepsAr: string[];
    stepsEn: string[];
  }[];
  proTip: string;
  proTipEn: string;
  links: {
    websiteUrl: string;
    androidAppUrl?: string;
    iosAppUrl?: string;
    pricingUrl?: string;
  };
}

export const PAYMENT_CATEGORIES_LIST: { id: PaymentCategory; labelAr: string; labelEn: string; icon: string }[] = [
  { id: "all", labelAr: "الكل", labelEn: "All Methods", icon: "💎" },
  { id: "virtual_bank", labelAr: "بنوك وحسابات دولارية (USD)", labelEn: "USD Virtual Banks", icon: "🏦" },
  { id: "local_wallet", labelAr: "محافظ محلية وسحب سريع", labelEn: "Local Cash Wallets", icon: "📱" },
  { id: "crypto_cards", labelAr: "P2P وبطاقات فيزا رقمية", labelEn: "P2P & Virtual Cards", icon: "⚡" },
  { id: "merchant_gateway", labelAr: "بوابات فواتير ودفع مباشر", labelEn: "Invoicing & Gateways", icon: "🌐" }
];

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: "payoneer",
    name: "بايونير (Payoneer)",
    nameEn: "Payoneer Global USD Accounts",
    category: "virtual_bank",
    badge: "الشريك المالي الأول لمنصات العمل الحر",
    badgeEn: "Premier Freelance Payout Partner",
    logoEmoji: "🅿️",
    logoBg: "bg-orange-500",
    rating: 4.9,
    reviewCount: 14200,
    shortDesc: "الحساب البنكي الأمريكي والبريطاني الأوسع قبولاً في Upwork وFiverr ومستقل وخمسات لاستلام الدولار واليورو مباشرة.",
    shortDescEn: "The most widely accepted USD/EUR virtual bank account on Upwork, Fiverr, Mostaql, and Khamsat.",
    overview: "تعتبر بايونير البوابة المصرفية الرقمية الأهم لأي مستقل عربي. تمنحك أرقام حسابات بنكية أمريكية وأوروبية وبريطانية (Routing Number و Account Number) تمكنك من استقبال أرباحك بالدولار من منصات العمل العالمية وكأنك تمتلك حساباً محلياً داخل الولايات المتحدة.",
    overviewEn: "Payoneer is the gold standard for global freelancers, providing real receiving accounts in USD, EUR, and GBP with local routing numbers to receive earnings seamlessly.",
    supportedCurrencies: ["USD ($)", "EUR (€)", "GBP (£)", "CAD", "AUD", "JPY"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "مدعوم بجواز سفر سارٍ 🇸🇩",
      statusBadgeEn: "Supported with valid passport 🇸🇩",
      notesAr: "يمكن فتح الحساب وتوثيقه بجواز سفر ساري المفعول أو للمقيمين والمغتربين خارج السودان، ويمكن ربطه بسهولة مع حسابات بنكية بالخارج أو سحب الرصيد عبر بطاقة بايونير ماستركارد.",
      notesEn: "Can be opened using a valid passport or through residency abroad; linked to a Payoneer Mastercard for global ATM & POS access."
    },
    arabCountriesAvailability: "متاح بالكامل في مصر، السعودية، الإمارات، المغرب، الأردن، وكافة الدول العربية.",
    arabCountriesAvailabilityEn: "Fully operational across Egypt, KSA, UAE, Morocco, Jordan, and all Arab nations.",
    transferSpeed: "فوري إلى 24 ساعة (Instant to 24 Hours)",
    transferSpeedEn: "Instant to 24 Hours",
    typicalFees: "سحب من Upwork/Fiverr مجاناً أو $1 إلى $2، عمولة تحويل بنكي محلي حوالي 1.5% - 2%",
    typicalFeesEn: "Upwork/Fiverr transfer $0 - $2, local bank wire transfer fee 1.5% - 2%",
    minimumWithdrawal: "$50 للسحب البنكي (أو بدون حد أدنى عبر بطاقة بايونير)",
    minimumWithdrawalEn: "$50 for wire withdrawal, or no minimum using Mastercard",
    verificationRequirements: {
      ar: [
        "جواز سفر ساري المفعول أو بطاقة هوية وطنية معتمدة.",
        "إثبات سكن أو كشف حساب بنكي يوضح العنوان باللغة الإنجليزية.",
        "رقم هاتف مفعل لاستلام رموز الأمان (2FA)."
      ],
      en: [
        "Valid government passport or national photo ID.",
        "Utility bill or bank statement confirming residential address in English.",
        "Active mobile phone for two-factor SMS authentication."
      ]
    },
    keyFeatures: {
      ar: [
        "إصدار بطاقة ماستركارد بلاستيكية وافتراضية للمشتريات والسحب من أجهزة الصراف الآلي.",
        "ربط مباشر بزر واحد في Upwork وFiverr ومستقل وخمسات.",
        "إمكانية طلب دفعات (Request a Payment) وإرسال فواتير رسمية لعملائك بالخارج.",
        "حسابات استقبال متعددة العملات (USD, EUR, GBP)."
      ],
      en: [
        "Issue physical & virtual Mastercard for online shopping and ATM withdrawals.",
        "One-click native payout integration on Upwork, Fiverr, Mostaql, and Khamsat.",
        "Invoicing and direct client payment collection feature (Request a Payment).",
        "Multi-currency receiving routing accounts (USD, EUR, GBP)."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "Upwork & Freelancer",
        stepsAr: [
          "ادخل إلى إعدادات الحساب (Settings) ثم (Get Paid).",
          "اختر إضافة طريقة دفع (Add Method) ثم اضغط على (Payoneer).",
          "سجل الدخول بحسابك في بايونير وسيتم الربط الفوري والمجاني."
        ],
        stepsEn: [
          "Navigate to Settings -> Get Paid.",
          "Click Add Method and select Payoneer.",
          "Sign in to your Payoneer credentials for immediate verified linkage."
        ]
      },
      {
        platformName: "مستقل وخمسات (حسوب)",
        stepsAr: [
          "توجه إلى خيار (الرصيد) في حساب حسوب الموحد.",
          "اختر (سحب الأرباح) واختر Payoneer كوسيلة سحب.",
          "أدخل البريد الإلكتروني المسجل في بايونير وتأكيده عبر كود التحقق."
        ],
        stepsEn: [
          "Go to Balance in your unified Hsoub account.",
          "Choose Withdraw Profits and select Payoneer.",
          "Enter your registered Payoneer email and confirm verification code."
        ]
      }
    ],
    proTip: "لا تقم بسحب المبالغ الصغيرة أولاً بأول؛ اجمع أرباحك لتتجاوز $200 قبل التحويل لتقليل نسبة الرسوم الثابتة على الحوالات البنكية.",
    proTipEn: "Accumulate your payouts to exceed $200 per withdrawal to minimize the impact of fixed wire fees.",
    links: {
      websiteUrl: "https://www.payoneer.com/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.payoneer.android",
      iosAppUrl: "https://apps.apple.com/app/payoneer/id680112467",
      pricingUrl: "https://www.payoneer.com/about/fees/"
    }
  },
  {
    id: "elevate-pay",
    name: "إليفيت باي (Elevate Pay)",
    nameEn: "Elevate Pay US Bank Account",
    category: "virtual_bank",
    badge: "حساب بنكي أمريكي حقيقي ومؤمن (FDIC)",
    badgeEn: "FDIC-Insured US Bank Account",
    logoEmoji: "🚀",
    logoBg: "bg-indigo-600",
    rating: 4.8,
    reviewCount: 3800,
    shortDesc: "حساب مصرفي أمريكي حقيقي بالشراكة مع Bangor Savings Bank وبطاقة ماستركارد مجانية للمستقلين في مصر والشرق الأوسط.",
    shortDescEn: "Real FDIC-insured US bank account via Bangor Savings Bank with a zero-fee virtual card for MENA freelancers.",
    overview: "إليفيت باي هو الحل العصري الأكثر مرونة للمستقلين العرب. يوفر حساباً بنكياً أمريكياً حقيقياً باسمك الشخصي مؤمناً حتى $250,000 من قبل مؤسسة التأمين الفيدرالية الأمريكية (FDIC)، مع رسوم تحويل وسحب تنافسية للغاية وبطاقة ماستركارد افتراضية للشراء الدولي دون قيود.",
    overviewEn: "Elevate Pay delivers a legitimate US bank account in your legal name partnered with Bangor Savings Bank (FDIC-insured up to $250k), offering ultra-low international wire fees and virtual Mastercard.",
    supportedCurrencies: ["USD ($)"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "متاح للمغتربين والمقيمين 🇸🇩",
      statusBadgeEn: "Available for Sudanese expats & residents abroad 🇸🇩",
      notesAr: "يقبل جواز السفر السوداني إذا كان المتقدم يمتلك إقامة أو عنواناً في مصر أو السعودية أو الإمارات أو أي دولة مدعومة ضمن نطاق المنصة.",
      notesEn: "Accepts Sudanese passport holders with verified residency or address documents in Egypt, GCC, or supported countries."
    },
    arabCountriesAvailability: "مدعوم بشكل رئيسي في مصر 🇪🇬، والفلبين، وباكستان، وباقي الدول النامية والخليج.",
    arabCountriesAvailabilityEn: "Fully active in Egypt, GCC, and major emerging remote-work markets.",
    transferSpeed: "تحويلات ACH خلال 1-2 يوم عمل (ACH 1-2 Days)",
    transferSpeedEn: "ACH transfers in 1-2 business days",
    typicalFees: "إيداع ACH مجاني 100%، وسحب بنكي خارجي بمبلغ رمزي مسطح ($1.50 فقط)",
    typicalFeesEn: "100% Free ACH deposits, flat $1.50 fee for outbound wire transfers",
    minimumWithdrawal: "$1 فقط (مرونة مطلقة)",
    minimumWithdrawalEn: "$1 minimum (exceptional flexibility)",
    verificationRequirements: {
      ar: [
        "جواز سفر سارٍ أو بطاقة شخصية ذكية.",
        "صورة سيلفي حية للتحقق البيومتري.",
        "عقد عمل حر أو رابط ملفك الشخصي على منصة مثل Upwork أو Freelancer."
      ],
      en: [
        "Valid passport or national ID card.",
        "Live biometric selfie verification.",
        "Proof of freelance activity (Upwork/Fiverr profile link or contract)."
      ]
    },
    keyFeatures: {
      ar: [
        "حساب بنكي أمريكي مؤمن بحماية FDIC الأمريكية.",
        "استلام مجاني تماماً بالدولار عبر نظام ACH من جميع منصات العمل العالمية.",
        "بطاقة ماستركارد افتراضية مجانية للشراء أونلاين ودفع الإعلانات.",
        "تطبيق حديث وسهل الاستخدام بإشعارات فورية عند وصول أي دفعة."
      ],
      en: [
        "FDIC-insured US bank deposit account.",
        "0% fee on incoming ACH payouts from Upwork, Deel, Stripe, and Fiverr.",
        "Free virtual USD Mastercard for overseas digital subscriptions.",
        "Modern mobile app with instant payment push notifications."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "Upwork & Remote Platforms",
        stepsAr: [
          "في تطبيق Elevate Pay انسخ رقم الحساب (Account Number) ورقم التوجيه (Routing Number).",
          "في Upwork اختر (Direct to U.S. Bank - ACH).",
          "الصق الأرقام وسيتم إيداع الأرباح مجاناً دون خصم $2 المفروضة على الحوالات السلكية."
        ],
        stepsEn: [
          "Copy your Account Number & Routing Number from the Elevate app.",
          "On Upwork, choose Direct to U.S. Bank (ACH).",
          "Paste the numbers for free deposits, saving on wire transfer costs."
        ]
      }
    ],
    proTip: "اربط Elevate Pay كحساب بنكي أمريكي (ACH) في Upwork لتوفير رسوم السحب والحصول على إيداع مجاني 100% دون وسيط.",
    proTipEn: "Link Elevate Pay as a US Bank Account (ACH) on Upwork to achieve 100% zero-fee payouts.",
    links: {
      websiteUrl: "https://www.elevatepay.co/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=co.elevatepay.app",
      iosAppUrl: "https://apps.apple.com/app/elevate-pay/id6449573887"
    }
  },
  {
    id: "binance-p2p",
    name: "بينانس P2P (Binance P2P)",
    nameEn: "Binance P2P (USDT to Local Cash)",
    category: "crypto_cards",
    badge: "شريان السحب النقدي الفوري رقم #1 في السودان والعالم العربي",
    badgeEn: "Top #1 Instant P2P Cashout Rail in Sudan & MENA",
    logoEmoji: "🟡",
    logoBg: "bg-amber-500",
    rating: 4.95,
    reviewCount: 45000,
    shortDesc: "الحل الأقوى والأسرع لتحويل أرباح العمل الحر بالدولار (USDT) إلى كاش محلي في تطبيق بنكك (Bokak) أو فودافون كاش خلال 5 دقائق.",
    shortDescEn: "The undisputed lifeline to convert freelance USD (USDT) into instant local cash via Bank of Khartoum (Bokak) or Vodafone Cash.",
    overview: "تعتبر خدمة التداول من نظير إلى نظير (P2P) على منصة بينانس العالمية هي الخيار الأضمن والأكثر سيولة للمستقلين في السودان ومصر والشرق الأوسط. تضمن المنصة أموالك عبر نظام الضمان المشفر (Escrow)، حيث لا يتم تسليم الدولار للمشتري حتى تتأكد من استلام المبلغ بالجنيه السوداني أو المصري في حسابك البنكي المحلي أولاً.",
    overviewEn: "Binance P2P is the safest and most liquid peer-to-peer escrow marketplace. It enables remote workers to cash out stablecoins (USDT/USDC) directly into local bank apps like Bokak, Fawry, and Vodafone Cash in under 5 minutes.",
    supportedCurrencies: ["USDT", "USDC", "SDG (جنيه سوداني)", "EGP (جنيه مصري)", "SAR", "AED", "USD"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "الخيار الأول في السودان 🇸🇩 (شريان بنكك)",
      statusBadgeEn: "Top Choice in Sudan 🇸🇩 (Bokak Ready)",
      notesAr: "يعمل بكفاءة مطلقة مع تطبيق بنكك (Bank of Khartoum) وتطبيق أوكاش وفوري. يتطلب فقط توثيق الحساب (KYC) بجواز سفر ساري المفعول.",
      notesEn: "Fully functional with Bank of Khartoum (Bokak) and local transfer apps with passport KYC verification."
    },
    arabCountriesAvailability: "المنصة الأكثر سيولة في مصر، السعودية، الإمارات، المغرب، الجزائر، العراق، وعمان.",
    arabCountriesAvailabilityEn: "Highest liquidity marketplace across Egypt, GCC, Iraq, and North Africa.",
    transferSpeed: "فوري خلال 5 - 10 دقائق (5-10 Minutes)",
    transferSpeedEn: "Instant within 5-10 minutes",
    typicalFees: "0% عمولة على صفقات P2P (مجاني تماماً للبائع)",
    typicalFeesEn: "0% commission on P2P orders (Completely free for sellers)",
    minimumWithdrawal: "$10 (مرونة كاملة للمبالغ البسيطة)",
    minimumWithdrawalEn: "$10 minimum order",
    verificationRequirements: {
      ar: [
        "جواز سفر ساري المفعول لتفعيل حساب Binance وتأكيده.",
        "التحقق من الوجه بالكاميرا (Biometric Face Scan).",
        "حساب مصرفي أو محفظة إلكترونية باسمك لاستلام أموالك عليها."
      ],
      en: [
        "Valid international passport for Binance KYC.",
        "Live camera facial biometric recognition.",
        "Local bank account or digital wallet in your name."
      ]
    },
    keyFeatures: {
      ar: [
        "حماية كاملة بأموال مجمدة لدى بينانس (Escrow) تضمن عدم تعرضك للاحتيال.",
        "سحب الأرباح بسعر الصرف الحقيقي العادل بدون خصومات بنكية مجحفة.",
        "دعم مباشر لتطبيق بنك الخرطوم (Bokak) وفودافون كاش وإنستاباي وراجحي وSTC Pay.",
        "تطبيق آمن ومتوافق مع أعلى معايير التشفير العالمية."
      ],
      en: [
        "Guaranteed escrow safety mechanism preventing counterparty fraud.",
        "Real market fair value exchange rates with zero intermediary cuts.",
        "Direct integration with Bank of Khartoum (Bokak), Vodafone Cash, and GCC banks.",
        "Military-grade security and two-factor authentication."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "سحب أرباح Contra أو العملات الرقمية",
        stepsAr: [
          "في منصة كونترا (Contra) أو أي عميل مباشر، اطلب الدفع بعملة USDC أو USDT.",
          "انسخ عنوان إيداع USDT (شبكة TRC20 أو Polygon) من محفظة بينانس الخاصة بك.",
          "فور وصول الرصيد، ادخل قسم (P2P)، اختر بيع (Sell) وحدد وسيلة الدفع (بنكك / فودافون كاش).",
          "لا تضغط على (تأكيد الاستلام) إلا بعد فتح تطبيقك المصرفي والتأكد من وصول المبلغ فعلياً."
        ],
        stepsEn: [
          "Request client or platform payment in USDC/USDT on Polygon/TRC20 network.",
          "Deposit directly to your Binance funding wallet.",
          "Open P2P trading tab, click Sell, and select Bank of Khartoum or Vodafone Cash.",
          "Never click 'Payment Received' until you log in to your local banking app and verify the balance."
        ]
      }
    ],
    proTip: "تعامل دائماً مع التجار الذين يملكون علامة التوثيق الصفراء (Verified Merchant) ونسبة إنجاز تفوق 98% لضمان إتمام المعاملة في أقل من 3 دقائق.",
    proTipEn: "Always execute trades with Verified Merchants showing completion rates above 98% for speedy 3-minute settlements.",
    links: {
      websiteUrl: "https://p2p.binance.com/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.binance.dev",
      iosAppUrl: "https://apps.apple.com/app/binance-buy-bitcoin-crypto/id1436799971"
    }
  },
  {
    id: "redotpay",
    name: "ريدوت باي (RedotPay)",
    nameEn: "RedotPay Crypto Visa Card",
    category: "crypto_cards",
    badge: "بطاقة فيزا عالمية تُشحن بالدولار والعملات الرقمية",
    badgeEn: "Global Crypto-Backed USD Visa Card",
    logoEmoji: "💳",
    logoBg: "bg-red-600",
    rating: 4.85,
    reviewCount: 9200,
    shortDesc: "بطاقة فيزا افتراضية وبلاستيكية مرخصة ومقبولة عالمياً، تدعم الشراء وتفعيل PayPal والشحن عبر USDT بضغطة زر.",
    shortDescEn: "Globally accepted licensed virtual Visa card rechargeable via USDT, perfect for PayPal linking and digital spend.",
    overview: "تعتبر ريدوت باي (RedotPay) من أكثر الخدمات رواجاً بين المستقلين العرب الذين يواجهون صعوبات في استخراج بطاقات فيزا دولية من البنوك المحلية. تتيح لك المنصة إصدار بطاقة فيزا افتراضية فورية تدعم Apple Pay و Google Pay، وتُشحن برصيد USDT من محفظتك برسم رمزي بسيط.",
    overviewEn: "RedotPay solves international payment roadblocks for Arab developers and creatives by providing an instantly-issued virtual Visa card compatible with Apple Pay, Google Pay, and online checkouts.",
    supportedCurrencies: ["USD ($)", "USDT", "USDC", "BTC", "ETH"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "مدعوم بجواز سفر سارٍ 🇸🇩",
      statusBadgeEn: "Supported with valid passport 🇸🇩",
      notesAr: "يمكن تفعيل الحساب فوراً بجواز السفر، وتعمل البطاقة للشراء وسداد الإعلانات واشتراكات برامج التصميم والاستضافة بدون أي عوائق.",
      notesEn: "Instantly activated via passport verification. Ideal for international SaaS, cloud hosting, and software tool purchases."
    },
    arabCountriesAvailability: "تعمل في مصر والسعودية والإمارات والعراق والأردن وكافة الدول العربية.",
    arabCountriesAvailabilityEn: "Works seamlessly across the Middle East, North Africa, and global merchants.",
    transferSpeed: "شحن رصيد وإصدار بطاقة فوري (Instant Card Issuance)",
    transferSpeedEn: "Instant deposit and virtual card generation",
    typicalFees: "رسوم إصدار البطاقة الافتراضية حوالي $10 (مرة واحدة)، ورسوم شحن أو إنفاق من 1% إلى 1.2%",
    typicalFeesEn: "One-time $10 card issuance fee, 1% - 1.2% transaction fee",
    minimumWithdrawal: "لا يوجد حد أدنى للاستخدام",
    minimumWithdrawalEn: "No minimum usage limit",
    verificationRequirements: {
      ar: [
        "جواز سفر سارٍ للتحقق التلقائي السريع.",
        "صورة سيلفي حية عبر كاميرا الهاتف.",
        "رقم هاتف مفعل وبريد إلكتروني."
      ],
      en: [
        "Valid passport for automated OCR verification.",
        "Live smartphone selfie scan.",
        "Active mobile number and email."
      ]
    },
    keyFeatures: {
      ar: [
        "ربط فوري مع Apple Pay و Google Pay للدفع في المتاجر وعبر الإنترنت.",
        "إمكانية ربطها بحساب PayPal لتفعيله وتأكيد الحساب.",
        "شحن مباشر عبر Binance Pay بدون رسوم شبكة إضافية.",
        "حدود إنفاق مرنة وتأمين متقدم عبر رمز سري وتطبيقات الحماية."
      ],
      en: [
        "Native Apple Pay and Google Pay wallet integration.",
        "Enables PayPal account verification and funding.",
        "Direct zero-network-fee top up via Binance Pay.",
        "High transaction limits with real-time biometric authorization."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "تفعيل PayPal وشراء الأدوات الاحترافية",
        stepsAr: [
          "قم بشحن رصيد $15 في حساب RedotPay بواسطة Binance Pay.",
          "اطلب إصدار بطاقة فيزا افتراضية وانسخ بيانات البطاقة (رقم البطاقة، تاريخ الانتهاء، CVV).",
          "ادخل إلى حسابك في PayPal، أضف البطاقة وقم بتأكيد الكود الصغير الذي يظهر في كشف حساب تطبيق RedotPay فوراً."
        ],
        stepsEn: [
          "Deposit $15 into your RedotPay wallet using Binance Pay.",
          "Order a virtual Visa and copy the 16 digits, expiry, and CVV.",
          "Link the card inside your PayPal account and confirm the test charge code instantly displayed in the app feed."
        ]
      }
    ],
    proTip: "اشحن البطاقة عن طريق Binance Pay باختيار شبكة مجانية لتفادي دفع أي رسوم نقل بلوكتشين إضافية.",
    proTipEn: "Top up your card using Binance Pay to avoid on-chain gas fees.",
    links: {
      websiteUrl: "https://www.redotpay.com/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.redotpay.app",
      iosAppUrl: "https://apps.apple.com/app/redotpay/id6449179979"
    }
  },
  {
    id: "bokak-bank",
    name: "تطبيق بنكك - بنك الخرطوم (Bokak)",
    nameEn: "Bokak - Bank of Khartoum",
    category: "local_wallet",
    badge: "شريان المعاملات المالية والمصرفية الأول في السودان",
    badgeEn: "Sudan's Premier Retail Banking Lifeline",
    logoEmoji: "🇸🇩",
    logoBg: "bg-emerald-700",
    rating: 4.8,
    reviewCount: 65000,
    shortDesc: "التطبيق المصرفي والمحفظة الرقمية الأكثر استخداماً في السودان، لاستلام تحويلات العمل الحر بالجنيه السوداني من P2P وبوابات التحويل.",
    shortDescEn: "Sudan's most essential mobile banking app, receiving P2P cashouts and local client remittances.",
    overview: "يعد تطبيق 'بنكك' الصادر عن بنك الخرطوم العصب المالي والتجاري الرئيسي لكل مواطن ومستقل في السودان. من خلاله يستلم المستقل السوداني قيمة أرباحه بالعملة المحلية بعد تحويلها من الدولار أو USDT عبر منصات التداول الآمنة، مع إمكانية سداد الفواتير وتحويل الأموال لحظياً لجميع البنوك السودانية.",
    overviewEn: "Bokak is the backbone of day-to-day transactions in Sudan. It is where freelancers receive proceeds from global contracts converted through verified P2P escrow rails.",
    supportedCurrencies: ["SDG (جنيه سوداني)", "حسابات نقد أجنبي متخصصة"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "الخدمة الوطنية الأولى في السودان 🇸🇩",
      statusBadgeEn: "Sudan's Primary Banking Service 🇸🇩",
      notesAr: "متاح لجميع أصحاب الحسابات المصرفية في بنك الخرطوم في الداخل والخارج، مع إمكانية فتح حساب رقمي جديد للمغتربين والداخل عبر الرقم الوطني.",
      notesEn: "Available to all Bank of Khartoum account holders globally with online onboarding via national ID."
    },
    arabCountriesAvailability: "يستخدمه السودانيون في مصر، الخليج، والسودان لاستقبال وإرسال الأموال للأهل والمستقلين.",
    arabCountriesAvailabilityEn: "Widely used by the Sudanese diaspora in Egypt, the GCC, and nationwide.",
    transferSpeed: "تحويل فوري بين الحسابات خلال ثوانٍ معدودة (Instant Seconds)",
    transferSpeedEn: "Instant within seconds",
    typicalFees: "رسوم مصرفية رمزية على التحويلات المحلية",
    typicalFeesEn: "Nominal domestic clearance tariffs",
    minimumWithdrawal: "1,000 جنيه سوداني",
    minimumWithdrawalEn: "1,000 SDG",
    verificationRequirements: {
      ar: [
        "رقم الحساب المصرفي في بنك الخرطوم أو فتح حساب عبر الرقم الوطني.",
        "رقم هاتف مفعل مسجل لدى البنك لتلقي رسائل OTP.",
        "تأكيد الهوية عبر فروع البنك أو قنوات التوثيق الإلكتروني المعتمدة."
      ],
      en: [
        "Bank of Khartoum account number or digital onboarding with National ID.",
        "Registered mobile phone number for OTP verifications.",
        "Official identity validation."
      ]
    },
    keyFeatures: {
      ar: [
        "استلام المبالغ الناتجة عن صفقات P2P خلال دقائق معدودة.",
        "سداد فواتير الكهرباء والاتصالات والخدمات الحكومية.",
        "تحويل فوري إلى أي حساب في بنك الخرطوم أو البنوك السودانية الشريكة.",
        "خدمة إشعارات الرسائل القصيرة الفورية لجميع الحركات المالية."
      ],
      en: [
        "Instant receipt of P2P liquidation funds from Binance.",
        "Direct utility, telecom, and municipal bill settlements.",
        "Inter-bank instant settlement to all Sudanese banking institutions.",
        "Instant SMS alerts for all credits and debits."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "الربط مع منصات P2P لاستلام الأرباح",
        stepsAr: [
          "في تطبيق بينانس P2P، توجه إلى (طرق الدفع - Payment Methods) واختر (Bank of Khartoum).",
          "أدخل اسمك المطابق تماماً لحسابك في بنكك ورقم حسابك المكون من 7 أرقام.",
          "عند بيع أرباحك بالدولار، اختر بنك الخرطوم وستصلك رسالة إيداع فورية في تطبيق بنكك."
        ],
        stepsEn: [
          "On Binance P2P, navigate to Payment Methods and select Bank of Khartoum.",
          "Input your official matching account name and your 7-digit account number.",
          "When selling your crypto freelance earnings, the buyer will deposit directly into your Bokak account."
        ]
      }
    ],
    proTip: "لا تؤكد استلام أي دفعة P2P إلا بعد فتح تطبيق بنكك بنفسك ومطابقة رقم الإشعار واسم المرسل لضمان الأمان التام.",
    proTipEn: "Always launch the Bokak app to verify the transfer reference and sender name before releasing escrow funds.",
    links: {
      websiteUrl: "https://bankofkhartoum.com/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.bok.bokpay",
      iosAppUrl: "https://apps.apple.com/app/bank-of-khartoum-bokak/id1438258661"
    }
  },
  {
    id: "vodafone-instapay",
    name: "فودافون كاش وإنستاباي (InstaPay & Vodafone Cash)",
    nameEn: "InstaPay & Vodafone Cash (Egypt)",
    category: "local_wallet",
    badge: "منظومة السحب اللحظي الأكثر اعتماداً للمستقلين في مصر",
    badgeEn: "Egypt's Gold Standard Instant Payout Rails",
    logoEmoji: "🇪🇬",
    logoBg: "bg-red-700",
    rating: 4.9,
    reviewCount: 38000,
    shortDesc: "الشبكة المصرفية اللحظية للمستقلين في مصر؛ سحب أرباح خمسات، كفيل، ومستقل، وتحويلات P2P مباشرة إلى بطاقتك البنكية أو محفظتك في ثوانٍ.",
    shortDescEn: "Instant settlement network in Egypt: Cash out Mostaql, Khamsat, and Kafiil earnings directly to bank cards or mobile wallets in seconds.",
    overview: "تعتبر محفظة فودافون كاش وتطبيق إنستاباي (المرخص من البنك المركزي المصري) المنظومة الأسرع والأكثر فاعلية للمستقلين المقيمين في مصر. تمكنك من سحب أرباح المنصات العربية مباشرة، أو تسييل دولاراتك من بايونير وبينانس واستلامها في محفظتك أو حسابك البنكي بدون أي عوائق على مدار الساعة طوال أيام الأسبوع.",
    overviewEn: "Operated under the supervision of the Central Bank of Egypt, InstaPay and Vodafone Cash are the indispensable cashout lifeline for Egyptian freelancers, offering 24/7 instant settlements with zero friction.",
    supportedCurrencies: ["EGP (جنيه مصري)"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "متاح للسودانيين المقيمين في مصر 🇸🇩🇪🇬",
      statusBadgeEn: "Available to Sudanese residents in Egypt 🇸🇩🇪🇬",
      notesAr: "يمكن فتح محفظة كاش بأي خط هاتف محمول عبر جواز السفر والإقامة، أو فتح حساب بنكي في البنوك المصرية للاستفادة من تحويلات إنستاباي الفورية.",
      notesEn: "Can be registered via Egyptian mobile providers using a valid Sudanese passport and residency visa."
    },
    arabCountriesAvailability: "المنظومة القياسية في جمهورية مصر العربية 🇪🇬.",
    arabCountriesAvailabilityEn: "The premier local payment standard across Egypt.",
    transferSpeed: "لحظي وفوري (Instant 24/7)",
    transferSpeedEn: "Instantaneous 24/7/365",
    typicalFees: "إنستاباي مجاني تماماً، وسحب كاش عبر فودافون كاش 1% فقط من ماكينات ATM",
    typicalFeesEn: "InstaPay is 100% free, ATM mobile wallet cashout is 1% only",
    minimumWithdrawal: "20 جنيهاً مصرياً",
    minimumWithdrawalEn: "20 EGP",
    verificationRequirements: {
      ar: [
        "خط هاتف مسجل برقمك القومي أو جواز سفرك.",
        "بطاقة بنكية مفعلة (ميزة / فيزا / ماستركارد) لتطبيق إنستاباي.",
        "رمز سري لحماية المحفظة (IPN PIN)."
      ],
      en: [
        "SIM card registered with your national ID or passport.",
        "Active Egyptian debit/payroll bank card for InstaPay.",
        "Six-digit IPN security PIN."
      ]
    },
    keyFeatures: {
      ar: [
        "استلام فوري لأرباح منصة كفيل ومستقل بدون الحاجة لانتظار أيام العمل البنكية.",
        "سحب الكاش من أي ماكينة صراف آلي (ATM) لأي بنك بدون بطاقة بلاستيكية.",
        "تحويل لحظي بين جميع البنوك والمحافظ الرقمية في مصر.",
        "دعم كامل لدفع الفواتير واشتراكات الإنترنت والخدمات العامة."
      ],
      en: [
        "Direct instant payout destination on Kafiil and freelance platforms.",
        "Cardless ATM cash withdrawal at all major bank ATMs nationwide.",
        "Real-time zero-fee transfers between all Egyptian commercial banks.",
        "Comprehensive utility bill and subscription payment portal."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "سحب أرباح كفيل والمنصات العربية",
        stepsAr: [
          "في صفحة سحب الأرباح على كفيل أو مستقل، اختر (فودافون كاش / المحافظ المصرية).",
          "أدخل رقم هاتفك المسجل في المحفظة.",
          "تصلك أرباحك بالجنيه المصري فور اعتماد الطلب دون خصم عمولات مصرفية دولية."
        ],
        stepsEn: [
          "On Kafiil or Mostaql payout section, select Mobile Wallets (Vodafone Cash).",
          "Enter your 11-digit wallet mobile number.",
          "Receive funds in Egyptian Pounds as soon as payout is processed."
        ]
      }
    ],
    proTip: "استخدم إنستاباي للتحويل المباشر من الحساب البنكي لتوفير عمولات السحب والاستفادة من السحب المجاني بالكامل من ماكينات الـ ATM.",
    proTipEn: "Leverage InstaPay for inter-bank clearing to take advantage of zero-fee transfers and free ATM withdrawals.",
    links: {
      websiteUrl: "https://www.instapay.eg/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.emeint.android.mbe",
      iosAppUrl: "https://apps.apple.com/app/instapay-egypt/id1588697193"
    }
  },
  {
    id: "stc-pay",
    name: "إس تي سي باي (STC Pay / urpay)",
    nameEn: "STC Pay & urpay (Saudi Arabia)",
    category: "local_wallet",
    badge: "المحفظة الرقمية المرخصة الأولى في المملكة العربية السعودية",
    badgeEn: "SAMA-Licensed #1 Saudi Digital Wallet",
    logoEmoji: "🇸🇦",
    logoBg: "bg-purple-700",
    rating: 4.88,
    reviewCount: 52000,
    shortDesc: "المحفظة المالية الرائدة في السعودية؛ استلام أرباح منصات صبّار وبحر ومرن، مع إمكانية تحويل الأموال دولياً لـ 200 دولة عبر ويسترن يونيون.",
    shortDescEn: "Saudi Arabia's premier digital wallet: Receives Sabbar, Marn, and Bahr shifts with instant Western Union international wires.",
    overview: "تعتبر STC Pay (المصرف الرقمي التابع لمجموعة الاتصالات السعودية والمرخص من البنك المركزي السعودي SAMA) المحفظة الأساسية للمستقلين والعاملين بنظام العمل المرن في السعودية. توفر بطاقة فيزا مدى للشراء والسحب، وإمكانية إرسال حوالات دولية فورية للأهل والمستقلين في السودان ومصر وسائر الدول برسوم رمزية.",
    overviewEn: "Licensed by SAMA, STC Pay is the cornerstone of flexible freelance shifts in Saudi Arabia. It features seamless integration with platforms like Sabbar and Marn, paired with instant Western Union international remittance corridors.",
    supportedCurrencies: ["SAR (ريال سعودي)", "USD ($)", "تحويل لجميع العملات الدولية"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "مدعوم للسودانيين المقيمين في السعودية 🇸🇦🇸🇩",
      statusBadgeEn: "Available to Sudanese residents in KSA 🇸🇦🇸🇩",
      notesAr: "يتطلب وجود إقامة نظامية وحساب في منصة أبشر للتفعيل الفوري، ويوفر خدمة إرسال الحوالات المالية إلى السودان عبر ويسترن يونيون وبنك الخرطوم.",
      notesEn: "Requires valid Saudi Iqama and Absher integration; offers instant remittance rails to Sudan via Western Union."
    },
    arabCountriesAvailability: "المملكة العربية السعودية، مع شبكة تحويل لكافة الدول العربية والعالمية.",
    arabCountriesAvailabilityEn: "Operates in Saudi Arabia with worldwide international transfers.",
    transferSpeed: "فوري محلياً ودولياً خلال دقائق (Instant Remittance)",
    transferSpeedEn: "Instant local, minutes for global wires",
    typicalFees: "سحب محلي مجاني، حوالات دولية برسوم تبدأ من 15 ريالاً سعودياً",
    typicalFeesEn: "Free local transfers, international remittances start from 15 SAR",
    minimumWithdrawal: "10 ريالات سعودية",
    minimumWithdrawalEn: "10 SAR",
    verificationRequirements: {
      ar: [
        "رقم هوية وطنية أو إقامة سارية في السعودية.",
        "توثيق الحساب عبر منصة النفاذ الوطني الموحد (أبشر).",
        "رقم هاتف سعودي مسجل باسم صاحب الحساب."
      ],
      en: [
        "Valid Saudi National ID or Iqama.",
        "Absher / Nafath national single sign-on verification.",
        "Saudi mobile number registered to applicant."
      ]
    },
    keyFeatures: {
      ar: [
        "إيداع فوري لأجور ورديات صبّار ومرن وأسعى بالساعة.",
        "إصدار بطاقات فيزا مدى بلاستيكية ورقمية تعمل مع Apple Pay.",
        "إرسال الأموال مباشرة إلى الحسابات البنكية والمحافظ في السودان ومصر.",
        "استرداد نقدي (Cashback) على المشتريات والمدفوعات اليومية."
      ],
      en: [
        "Instant credit for hourly shift earnings on Sabbar, Marn, and AS3A.",
        "Physical and virtual Mada/Visa cards with Apple Pay integration.",
        "Direct remittance corridors to Sudanese & Egyptian bank accounts.",
        "Cashback reward programs on retail and online checkouts."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "استلام أرباح صبّار ومرن والعمل المرن",
        stepsAr: [
          "انسخ رقم الآيبان (IBAN) التابع لمحفظتك في STC Pay (يبدأ بـ SA).",
          "في ملفك الشخصي بتطبيق صبّار أو مَرن، ضعه كحساب مصرفي معتمد.",
          "ستودع مكافآت العمل المرن أسبوعياً في محفظتك مباشرة مع إشعار فوري."
        ],
        stepsEn: [
          "Copy your dedicated STC Pay Saudi IBAN (starting with SA).",
          "Paste it as your primary bank account inside Sabbar or Marn apps.",
          "Weekly shift payouts will land directly in your wallet balance."
        ]
      }
    ],
    proTip: "استفد من شراكة STC Pay مع ويسترن يونيون لتحويل أرباحك إلى عائلتك في السودان أو مصر بأسعار صرف تفضيلية وبدون انتظار في الفروع.",
    proTipEn: "Take advantage of the built-in Western Union feature to remit funds to Sudan/Egypt at competitive exchange rates.",
    links: {
      websiteUrl: "https://www.stcpay.com.sa/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=sa.com.stcpay",
      iosAppUrl: "https://apps.apple.com/app/stc-pay/id1438760081"
    }
  },
  {
    id: "wise",
    name: "وايز (Wise - TransferWise سابقاً)",
    nameEn: "Wise Multi-Currency Accounts",
    category: "virtual_bank",
    badge: "أقل عمولة تحويل بسعر الصرف الحقيقي في العالم",
    badgeEn: "World's Lowest Real Mid-Market Exchange Rate",
    logoEmoji: "🟢",
    logoBg: "bg-emerald-600",
    rating: 4.92,
    reviewCount: 32000,
    shortDesc: "حسابات بنكية حقيقية بأكثر من 40 عملة دولية (دولار، يورو، جنيه إسترليني) مع تحويل بنكي فوري للبنوك المحلية بأقل تكلفة مصرفية.",
    shortDescEn: "Real multi-currency accounts across 40+ currencies with transparent mid-market exchange rates and minimal fees.",
    overview: "تعتبر شركة وايز (Wise) المعيار الذهبي للشفافية في المعاملات المالية الدولية. توفر أرقام حسابات بنكية بريطانية وأوروبية وأمريكية تمكنك من استقبال أرباحك من الشركات الأجنبية ومنصات التوظيف عن بعد (مثل Toptal, Hubstaff, Upwork) ثم تحويلها إلى حسابك البنكي المحلي بسعر الصرف الرسمي الحقيقي (Mid-Market Rate) دون أي هوامش مخفية.",
    overviewEn: "Wise provides legitimate multi-currency receiving accounts in USD, EUR, GBP, and AUD. It allows freelancers working on Toptal, Hubstaff, and Contra to collect client invoices at genuine mid-market exchange rates without hidden markups.",
    supportedCurrencies: ["USD ($)", "EUR (€)", "GBP (£)", "AUD", "AED", "SAR", "40+ عملة"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "متاح للمغتربين والمقيمين بالخارج 🇸🇩",
      statusBadgeEn: "Accessible to Sudanese diaspora abroad 🇸🇩",
      notesAr: "يمكن فتحه وتوثيقه بجواز السفر السوداني للمقيمين في الإمارات، السعودية، أوروبا، مصر، أو الدول التي تدعمها الخدمة.",
      notesEn: "Available to Sudanese nationals possessing legal residency documents in the UAE, KSA, EU, or supported jurisdictions."
    },
    arabCountriesAvailability: "مدعوم للإرسال والاستقبال في الإمارات، السعودية، قطر، الكويت، البحرين، والمغرب.",
    arabCountriesAvailabilityEn: "Widely used across the UAE, KSA, Qatar, Kuwait, Bahrain, and Morocco.",
    transferSpeed: "من بضع دقائق إلى 24 ساعة (Minutes to 24 Hours)",
    transferSpeedEn: "Minutes to 24 hours",
    typicalFees: "عمولة شفافة ضئيلة جداً (0.4% إلى 0.6% فقط من قيمة المبلغ)",
    typicalFeesEn: "Ultra-low transparent fee (0.4% - 0.6% of transaction volume)",
    minimumWithdrawal: "$10",
    minimumWithdrawalEn: "$10",
    verificationRequirements: {
      ar: [
        "جواز سفر سارٍ للتحقق الأمني الرقمي.",
        "إثبات عنوان وإقامة في دولة مدعومة رسمياً.",
        "إيداع تأكيدي أولي رمزي (حوالي $20 يُضاف لرصيدك)."
      ],
      en: [
        "Valid international passport.",
        "Proof of address in a supported jurisdiction.",
        "Initial nominal deposit (approx $20 added to your usable balance)."
      ]
    },
    keyFeatures: {
      ar: [
        "أرقام حسابات بنكية حقيقية بأسمائك في أمريكا وبريطانيا وأوروبا.",
        "التحويل المباشر إلى الحسابات البنكية المحلية بأقل عمولة ممكنة.",
        "إصدار بطاقة خصم رقمية للاستخدام في المشتريات والإنترنت.",
        "إمكانية الاحتفاظ بأكثر من 40 عملة في محفظة واحدة والتحويل بينها بضغطة زر."
      ],
      en: [
        "Dedicated local bank account details in US, UK, Europe, and Australia.",
        "Direct local bank payouts bypassing expensive SWIFT intermediary fees.",
        "Multi-currency digital debit card for international checkout.",
        "Hold and convert between 40+ currencies at real-time rates."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "الربط مع Upwork وToptal وHubstaff",
        stepsAr: [
          "في وايز، اضغط على رصيد USD وانسخ رقم الحساب ونوع التوجيه (ACH Routing).",
          "في Upwork اختر طريقة الدفع (Direct to U.S. Bank).",
          "أدخل بيانات وايز واستلم تحويلاتك مجاناً وبأعلى سعر صرف عند التحويل لعملتك المحلية."
        ],
        stepsEn: [
          "In Wise, open your USD balance and copy your Account and ACH Routing numbers.",
          "On Upwork, select Direct to U.S. Bank.",
          "Paste Wise details for zero-fee incoming deposits and the industry's lowest conversion rates."
        ]
      }
    ],
    proTip: "استخدم وايز لتلقي مدفوعات العملاء المباشرين في بريطانيا وأوروبا لتوفير ما يصل إلى 80% من عمولات التحويل المصرفي المعتادة.",
    proTipEn: "Use Wise receiving accounts when billing European & UK clients directly to eliminate SWIFT intermediary deductions.",
    links: {
      websiteUrl: "https://wise.com/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.transferwise.android",
      iosAppUrl: "https://apps.apple.com/app/wise-ex-transferwise/id612261027"
    }
  },
  {
    id: "paypal",
    name: "باي بال (PayPal)",
    nameEn: "PayPal Global Payments",
    category: "merchant_gateway",
    badge: "المحفظة الإلكترونية الأشهر عالمياً للمعاملات والفواتير",
    badgeEn: "World's Most Recognized Invoicing & Payout Wallet",
    logoEmoji: "🌐",
    logoBg: "bg-blue-600",
    rating: 4.75,
    reviewCount: 95000,
    shortDesc: "وسيلة الدفع الأكثر طلباً من قبل العملاء الأجانب؛ استلام أرباح Freelancer وFiverr وإرسال فواتير إلكترونية عبر البريد الإلكتروني.",
    shortDescEn: "The universally recognized digital wallet for billing international clients and withdrawing from Freelancer and Fiverr.",
    overview: "يظل باي بال (PayPal) هو الاسم الأكثر ألفة وثقة لدى العملاء الأفراد والشركات في أمريكا وأوروبا. يتيح لك إرسال فواتير دفع احترافية بنقرة زر واستقبال الأموال من أي عميل يملك بطاقة ائتمانية دون أن يحتاج هو لامتلاك حساب، مع إمكانية ربطه ببطاقات Visa لسحب الأرباح شهرياً.",
    overviewEn: "PayPal remains the most familiar payment instrument for Western clients. It facilitates instant email invoicing and credit card checkouts, with automated monthly sweeps to linked Visa debit cards.",
    supportedCurrencies: ["USD ($)", "EUR (€)", "GBP (£)", "CAD", "25+ عملة"],
    sudanAvailability: {
      supported: false,
      statusBadgeAr: "غير مدعوم محلياً بالسودان ⚠️ (مدعوم للمغتربين)",
      statusBadgeEn: "Not supported locally in Sudan ⚠️ (Expats Only)",
      notesAr: "باي بال غير متاح داخل السودان بسبب العقوبات المالية القديمة، لكنه يعمل بكفاءة للسودانيين المقيمين في مصر، الإمارات، السعودية، أو أي دولة مدعومة.",
      notesEn: "Unavailable in Sudan due to legacy banking sanctions, but accessible to Sudanese expats residing in Egypt, GCC, or overseas."
    },
    arabCountriesAvailability: "مدعوم للاستقبال والسحب في الإمارات، السعودية، مصر (عبر بطاقات Visa)، الأردن، المغرب، وتونس.",
    arabCountriesAvailabilityEn: "Supported with withdrawal in UAE, KSA, Egypt (via Visa), Jordan, Morocco, and Tunisia.",
    transferSpeed: "فوري بين حسابات باي بال، و 2-4 أيام للسحب على البطاقة البنكية",
    transferSpeedEn: "Instant PayPal-to-PayPal, 2-4 business days for Visa sweep",
    typicalFees: "استلام الدفعات التجارية 3.4% إلى 4.4% + رسوم ثابتة، وسحب مجاني أول كل شهر إلى Visa",
    typicalFeesEn: "3.4% - 4.4% + fixed fee for merchant transfers, free auto-withdrawal on the 1st of each month",
    minimumWithdrawal: "$10",
    minimumWithdrawalEn: "$10",
    verificationRequirements: {
      ar: [
        "بريد إلكتروني نشط ورقم هاتف في دولة مدعومة.",
        "بطاقة ائتمان أو خصم من نوع Visa صادرة من بنك يدعم المعاملات الدولية.",
        "إثبات هوية سارٍ لتأكيد السقوف المالية المتقدمة."
      ],
      en: [
        "Verified email and phone in a supported country.",
        "Visa debit or credit card enabled for international authorization.",
        "National identity documents for account tier upgrading."
      ]
    },
    keyFeatures: {
      ar: [
        "إرسال فواتير دفع إلكترونية (Invoices) لعملائك يدفعونها ببطاقاتهم الائتمانية دون تسجيل.",
        "سحب تلقائي مجاني في أول كل شهر ميلادي لبطاقة Visa المرتبطة.",
        "حماية كاملة للمشتري والبائع عبر برامج تسوية النزاعات المعتمدة.",
        "قبول فوري في منصات العمل الحر مثل Freelancer.com."
      ],
      en: [
        "Create and send branded online invoices payable by credit cards without an account.",
        "Free automatic monthly sweep to linked Visa debit cards on the 1st of each month.",
        "Established Buyer and Seller Protection dispute protocols.",
        "Standard payout option across platforms like Freelancer.com."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "الربط مع Freelancer.com وFiverr",
        stepsAr: [
          "في إعدادات السحب بالمنصة، اختر PayPal.",
          "أدخل بريدك الإلكتروني المفعل في باي بال وتأكيده.",
          "تتحول الأرباح خلال 24-48 ساعة إلى رصيد باي بال الخاص بك."
        ],
        stepsEn: [
          "Under payout preferences on Freelancer or Fiverr, pick PayPal.",
          "Type your verified PayPal email and save.",
          "Funds transfer into your PayPal balance within 24-48 hours."
        ]
      }
    ],
    proTip: "في مصر، اربط حساب PayPal ببطاقة (Visa EasyPay من البريد المصري) أو (بطاقة يلا Yalla) لتفعيل السحب التلقائي بالجنيه المصري بسلاسة تامة.",
    proTipEn: "In Egypt, link PayPal with a Visa EasyPay from Egypt Post or Yalla Card to ensure frictionless automated withdrawals.",
    links: {
      websiteUrl: "https://www.paypal.com/",
      androidAppUrl: "https://play.google.com/store/apps/details?id=com.paypal.android.p2pmobile",
      iosAppUrl: "https://apps.apple.com/app/paypal-send-shop-manage/id283646035"
    }
  },
  {
    id: "tap-paymob",
    name: "تاب وبيموب (Tap Payments & Paymob)",
    nameEn: "Tap Payments & Paymob Gateways",
    category: "merchant_gateway",
    badge: "بوابات الدفع الإلكتروني الأولى للمستقلين وأصحاب المتاجر بالخليج ومصر",
    badgeEn: "Top Merchant Gateway in GCC & Egypt for Solopreneurs",
    logoEmoji: "🧾",
    logoBg: "bg-teal-600",
    rating: 4.82,
    reviewCount: 7800,
    shortDesc: "أنشئ روابط دفع فوري (Payment Links) وأرسلها لعملائك في الخليج ومصر ليدفعوا لك ببطاقات مدى، كي نت، وفيزا مباشرة لحسابك.",
    shortDescEn: "Generate instant payment links for GCC & Egyptian clients to pay via Mada, KNET, and Visa directly to your account.",
    overview: "إذا كنت تعمل كمستقل محترف أو تقدم استشارات وخدمات برمجة وتصميم لشركات ومؤسسات في السعودية، الكويت، الإمارات، أو مصر، فإن بوابات مثل Tap Payments و Paymob هي الحل المثالي. تتيح لك إرسال رابط دفع مباشر للعميل عبر واتساب أو البريد، فيسدد الفاتورة ببطاقة مدى المحلية أو فيزا أو أبل باي وتصلك الأموال مباشرة في حسابك.",
    overviewEn: "Tap Payments and Paymob are the regional leaders for independent contractors and creative agencies operating in the GCC and Egypt. They enable freelancers to generate instant payment links payable via Mada, KNET, Apple Pay, and Meeza.",
    supportedCurrencies: ["SAR", "AED", "KWD", "EGP", "QAR", "BHD", "USD ($)"],
    sudanAvailability: {
      supported: true,
      statusBadgeAr: "متاح للمستقلين وأصحاب الأعمال بالخارج 🇸🇩",
      statusBadgeEn: "Available to freelancers & expats abroad 🇸🇩",
      notesAr: "يمكن التسجيل كمستقل (Freelancer / Freelance License) في السعودية أو مصر أو الإمارات وربط حسابك المصرفي المحلي لاستلام أموال العملاء.",
      notesEn: "Available to registered freelancers or business owners with commercial or freelance permits in the GCC and Egypt."
    },
    arabCountriesAvailability: "تغطية كاملة في السعودية 🇸🇦، مصر 🇪🇬، الكويت 🇰🇼، الإمارات 🇦🇪، قطر، والبحرين.",
    arabCountriesAvailabilityEn: "Full coverage in Saudi Arabia, Egypt, Kuwait, UAE, Qatar, and Bahrain.",
    transferSpeed: "تحويل دوري للحساب البنكي خلال 2-3 أيام عمل (2-3 Business Days)",
    transferSpeedEn: "Settlement into your local bank in 2-3 business days",
    typicalFees: "عمولة بوابة دفع من 2% إلى 2.5% + رسم ثابت بسيط لكل عملية ناجحة",
    typicalFeesEn: "Standard 2% - 2.5% + nominal fixed transaction fee per successful charge",
    minimumWithdrawal: "تحويل تلقائي أسبوعي أو دوري دون حد أدنى كبير",
    minimumWithdrawalEn: "Automated weekly settlements directly to your IBAN",
    verificationRequirements: {
      ar: [
        "وثيقة عمل حر سارية (وثيقة العمل الحر السعودية أو ما يعادلها).",
        "حساب مصرفي تجاري أو شخصي مرتبط بالاسم القانوني.",
        "إثبات هوية وطنية أو إقامة سارية."
      ],
      en: [
        "Freelance certification / self-employment permit.",
        "Local bank account IBAN matching legal registered name.",
        "National ID or valid residency documents."
      ]
    },
    keyFeatures: {
      ar: [
        "إنشاء روابط دفع ذكية ومشاركتها عبر واتساب أو الإيميل مع العملاء.",
        "دعم وسائل الدفع المحلية المفضلة في الخليج (مدى Mada، كي نت KNET، أبل باي Apple Pay).",
        "لوحة تحكم إحصائية لمتابعة التدفقات المالية والفواتير المسددة.",
        "إمكانية فوترة العملاء الدوليين بالدولار أو بالعملات الخليجية."
      ],
      en: [
        "Create instant checkout links and share via WhatsApp, email, or social channels.",
        "Native support for hyper-local payment rails: Mada, KNET, Apple Pay, and Meeza.",
        "Real-time analytics dashboard monitoring paid vs pending invoices.",
        "Multi-currency billing in GCC currencies, EGP, and USD."
      ]
    },
    howToLinkWithPlatforms: [
      {
        platformName: "فوترة العملاء المباشرين خارج المنصات",
        stepsAr: [
          "قم بإنشاء حساب في Tap Payments أو Paymob وقدم وثيقة العمل الحر لتفعيله.",
          "ادخل لوحة التحكم، اضغط على (إنشاء رابط دفع - Create Link).",
          "حدد المبلغ والوصف وشاركه مع عميلك في الخليج؛ بمجرد دفعه يتم إيداع المبلغ في حسابك البنكي تلقائياً."
        ],
        stepsEn: [
          "Open an account on Tap Payments or Paymob and upload your freelance permit.",
          "Inside the dashboard, tap 'Create Payment Link'.",
          "Specify amount and milestone description, then share with your GCC client for instant credit."
        ]
      }
    ],
    proTip: "الحصول على وثيقة العمل الحر في السعودية مجاني تماماً ويمكنك من تفعيل بوابات الدفع الإلكتروني واستقبال أموال المشاريع الكبرى باحترافية كاملة.",
    proTipEn: "Acquiring a Saudi Freelance Certificate is 100% free and instantly unlocks enterprise payment gateway capabilities.",
    links: {
      websiteUrl: "https://www.tap.company/",
      pricingUrl: "https://www.tap.company/sa/en/pricing"
    }
  }
];
