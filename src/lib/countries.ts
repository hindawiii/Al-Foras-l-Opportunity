export interface Country {
  code: string;       // ISO 3166-1 alpha-2
  nameAr: string;
  nameEn: string;
  flag: string;
  currency: string;   // currency code
}

export const COUNTRIES: Country[] = [
  { code: "SA", nameAr: "السعودية",         nameEn: "Saudi Arabia",       flag: "🇸🇦", currency: "SAR" },
  { code: "AE", nameAr: "الإمارات",          nameEn: "United Arab Emirates", flag: "🇦🇪", currency: "AED" },
  { code: "QA", nameAr: "قطر",                nameEn: "Qatar",              flag: "🇶🇦", currency: "QTR" },
  { code: "KW", nameAr: "الكويت",             nameEn: "Kuwait",             flag: "🇰🇼", currency: "USD" },
  { code: "BH", nameAr: "البحرين",            nameEn: "Bahrain",            flag: "🇧🇭", currency: "USD" },
  { code: "OM", nameAr: "عُمان",              nameEn: "Oman",               flag: "🇴🇲", currency: "USD" },
  { code: "EG", nameAr: "مصر",                nameEn: "Egypt",              flag: "🇪🇬", currency: "EGP" },
  { code: "SD", nameAr: "السودان",            nameEn: "Sudan",              flag: "🇸🇩", currency: "SDG" },
  { code: "MA", nameAr: "المغرب",             nameEn: "Morocco",            flag: "🇲🇦", currency: "MAD" },
  { code: "DZ", nameAr: "الجزائر",            nameEn: "Algeria",            flag: "🇩🇿", currency: "DZD" },
  { code: "TN", nameAr: "تونس",               nameEn: "Tunisia",            flag: "🇹🇳", currency: "USD" },
  { code: "LY", nameAr: "ليبيا",              nameEn: "Libya",              flag: "🇱🇾", currency: "USD" },
  { code: "JO", nameAr: "الأردن",             nameEn: "Jordan",             flag: "🇯🇴", currency: "USD" },
  { code: "LB", nameAr: "لبنان",              nameEn: "Lebanon",            flag: "🇱🇧", currency: "USD" },
  { code: "SY", nameAr: "سوريا",              nameEn: "Syria",              flag: "🇸🇾", currency: "USD" },
  { code: "IQ", nameAr: "العراق",             nameEn: "Iraq",               flag: "🇮🇶", currency: "USD" },
  { code: "YE", nameAr: "اليمن",              nameEn: "Yemen",              flag: "🇾🇪", currency: "USD" },
  { code: "PS", nameAr: "فلسطين",             nameEn: "Palestine",          flag: "🇵🇸", currency: "USD" },
  { code: "US", nameAr: "الولايات المتحدة",   nameEn: "United States",      flag: "🇺🇸", currency: "USD" },
  { code: "GB", nameAr: "المملكة المتحدة",   nameEn: "United Kingdom",     flag: "🇬🇧", currency: "USD" },
  { code: "DE", nameAr: "ألمانيا",            nameEn: "Germany",            flag: "🇩🇪", currency: "EUR" },
  { code: "FR", nameAr: "فرنسا",              nameEn: "France",             flag: "🇫🇷", currency: "EUR" },
  { code: "IT", nameAr: "إيطاليا",            nameEn: "Italy",              flag: "🇮🇹", currency: "EUR" },
  { code: "ES", nameAr: "إسبانيا",            nameEn: "Spain",              flag: "🇪🇸", currency: "EUR" },
  { code: "NL", nameAr: "هولندا",             nameEn: "Netherlands",        flag: "🇳🇱", currency: "EUR" },
  { code: "CH", nameAr: "سويسرا",             nameEn: "Switzerland",        flag: "🇨🇭", currency: "EUR" },
  { code: "TR", nameAr: "تركيا",              nameEn: "Turkey",             flag: "🇹🇷", currency: "USD" },
  { code: "JP", nameAr: "اليابان",            nameEn: "Japan",              flag: "🇯🇵", currency: "USD" },
  { code: "CN", nameAr: "الصين",              nameEn: "China",              flag: "🇨🇳", currency: "USD" },
  { code: "IN", nameAr: "الهند",              nameEn: "India",              flag: "🇮🇳", currency: "USD" },
  { code: "CA", nameAr: "كندا",               nameEn: "Canada",             flag: "🇨🇦", currency: "USD" },
  { code: "AU", nameAr: "أستراليا",           nameEn: "Australia",          flag: "🇦🇺", currency: "USD" },
];

export const findCountryByCode = (code?: string | null): Country | undefined => {
  if (!code) return undefined;
  const c = code.toUpperCase();
  return COUNTRIES.find(x => x.code === c);
};

export const findCountryByName = (name?: string | null): Country | undefined => {
  if (!name) return undefined;
  const n = name.trim();
  return COUNTRIES.find(x => x.nameAr === n || x.nameEn.toLowerCase() === n.toLowerCase());
};
