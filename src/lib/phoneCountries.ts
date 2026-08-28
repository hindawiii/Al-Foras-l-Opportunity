export interface PhoneCountry {
  iso: string;
  name: string;
  nameEn: string;
  code: string;   // "+249"
  flag: string;   // "🇸🇩"
  pattern?: RegExp; // basic length check on local part
}

// Arabic-speaking / MENA-focused list.
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "SD", name: "السودان", nameEn: "Sudan", code: "+249", flag: "🇸🇩", pattern: /^\d{9}$/ },
  { iso: "EG", name: "مصر", nameEn: "Egypt", code: "+20", flag: "🇪🇬", pattern: /^\d{10}$/ },
  { iso: "SA", name: "السعودية", nameEn: "Saudi Arabia", code: "+966", flag: "🇸🇦", pattern: /^\d{9}$/ },
  { iso: "AE", name: "الإمارات", nameEn: "United Arab Emirates", code: "+971", flag: "🇦🇪", pattern: /^\d{8,9}$/ },
  { iso: "QA", name: "قطر", nameEn: "Qatar", code: "+974", flag: "🇶🇦", pattern: /^\d{8}$/ },
  { iso: "KW", name: "الكويت", nameEn: "Kuwait", code: "+965", flag: "🇰🇼", pattern: /^\d{8}$/ },
  { iso: "BH", name: "البحرين", nameEn: "Bahrain", code: "+973", flag: "🇧🇭", pattern: /^\d{8}$/ },
  { iso: "OM", name: "عُمان", nameEn: "Oman", code: "+968", flag: "🇴🇲", pattern: /^\d{8}$/ },
  { iso: "JO", name: "الأردن", nameEn: "Jordan", code: "+962", flag: "🇯🇴", pattern: /^\d{9}$/ },
  { iso: "LB", name: "لبنان", nameEn: "Lebanon", code: "+961", flag: "🇱🇧", pattern: /^\d{7,8}$/ },
  { iso: "IQ", name: "العراق", nameEn: "Iraq", code: "+964", flag: "🇮🇶", pattern: /^\d{10}$/ },
  { iso: "PS", name: "فلسطين", nameEn: "Palestine", code: "+970", flag: "🇵🇸", pattern: /^\d{8,9}$/ },
  { iso: "YE", name: "اليمن", nameEn: "Yemen", code: "+967", flag: "🇾🇪", pattern: /^\d{8,9}$/ },
  { iso: "LY", name: "ليبيا", nameEn: "Libya", code: "+218", flag: "🇱🇾", pattern: /^\d{9}$/ },
  { iso: "TN", name: "تونس", nameEn: "Tunisia", code: "+216", flag: "🇹🇳", pattern: /^\d{8}$/ },
  { iso: "DZ", name: "الجزائر", nameEn: "Algeria", code: "+213", flag: "🇩🇿", pattern: /^\d{9}$/ },
  { iso: "MA", name: "المغرب", nameEn: "Morocco", code: "+212", flag: "🇲🇦", pattern: /^\d{9}$/ },
  { iso: "MR", name: "موريتانيا", nameEn: "Mauritania", code: "+222", flag: "🇲🇷", pattern: /^\d{8}$/ },
  { iso: "SO", name: "الصومال", nameEn: "Somalia", code: "+252", flag: "🇸🇴", pattern: /^\d{7,9}$/ },
  { iso: "DJ", name: "جيبوتي", nameEn: "Djibouti", code: "+253", flag: "🇩🇯", pattern: /^\d{7,8}$/ },
  { iso: "KM", name: "جزر القمر", nameEn: "Comoros", code: "+269", flag: "🇰🇲", pattern: /^\d{7}$/ },
];

export const findPhoneCountry = (iso: string) =>
  PHONE_COUNTRIES.find(c => c.iso === iso) ?? PHONE_COUNTRIES[0];

export const validatePhone = (iso: string, local: string) => {
  const c = findPhoneCountry(iso);
  if (!local.trim()) return true; // empty is allowed
  if (!c.pattern) return true;
  return c.pattern.test(local.replace(/\D/g, ""));
};
