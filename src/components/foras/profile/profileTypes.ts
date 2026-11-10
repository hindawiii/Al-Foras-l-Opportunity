import type { ProfileExtras, LinkType, SkillEntry } from "@/lib/profileExtras";

export interface ProfileState {
  full_name: string;
  bio: string;
  education: string;
  location: string;
  avatar_url: string;
  phone: string;
  skills: string[];
  interests: string[];
}

export const emptyProfileState: ProfileState = {
  full_name: "",
  bio: "",
  education: "",
  location: "",
  avatar_url: "",
  phone: "",
  skills: [],
  interests: [],
};

export const LINK_META: Record<LinkType, { labelAr: string; labelEn: string; emoji: string; placeholder: string }> = {
  portfolio: { labelAr: "موقع شخصي / معرض أعمال", labelEn: "Portfolio / Website", emoji: "💼", placeholder: "https://myportfolio.com" },
  linkedin:  { labelAr: "لينكد إن (LinkedIn)", labelEn: "LinkedIn", emoji: "💼", placeholder: "https://linkedin.com/in/..." },
  github:    { labelAr: "جيت هاب (GitHub)", labelEn: "GitHub", emoji: "💻", placeholder: "https://github.com/..." },
  twitter:   { labelAr: "تويتر / إكس (Twitter / X)", labelEn: "Twitter / X", emoji: "🐦", placeholder: "https://x.com/..." },
  telegram:  { labelAr: "تيليجرام (Telegram)", labelEn: "Telegram", emoji: "📱", placeholder: "https://t.me/..." },
  instagram: { labelAr: "إنستغرام (Instagram)", labelEn: "Instagram", emoji: "📸", placeholder: "https://instagram.com/..." },
  youtube:   { labelAr: "يوتيوب (YouTube)", labelEn: "YouTube", emoji: "🎥", placeholder: "https://youtube.com/..." },
  behance:   { labelAr: "بيهانس (Behance)", labelEn: "Behance", emoji: "🎨", placeholder: "https://behance.net/..." },
  medium:    { labelAr: "ميديوم (Medium)", labelEn: "Medium", emoji: "📝", placeholder: "https://medium.com/@..." },
  cv:        { labelAr: "رابط السيرة الذاتية (CV / Drive)", labelEn: "Resume / CV (Drive)", emoji: "📄", placeholder: "https://drive.google.com/..." },
  other:     { labelAr: "رابط مخصص آخر", labelEn: "Other Custom Link", emoji: "🔗", placeholder: "https://..." },
};

export const DEGREE_OPTIONS: { value: NonNullable<ProfileExtras["degree"]>; labelAr: string; labelEn: string }[] = [
  { value: "secondary", labelAr: "شهادة ثانوية", labelEn: "High School Certificate" },
  { value: "diploma",   labelAr: "دبلوم تقني / مهني", labelEn: "Diploma / Vocational" },
  { value: "bachelor",  labelAr: "بكالوريوس (جامعي)", labelEn: "Bachelor's Degree" },
  { value: "master",    labelAr: "ماجستير", labelEn: "Master's Degree" },
  { value: "phd",       labelAr: "دكتوراه", labelEn: "PhD / Doctorate" },
];

export const EXPERIENCE_OPTIONS: { value: NonNullable<ProfileExtras["experienceYears"]>; labelAr: string; labelEn: string }[] = [
  { value: "none",  labelAr: "طالب / بدون خبرة رسمية", labelEn: "Student / No formal experience" },
  { value: "0-1",   labelAr: "أقل من سنة (0 - 1 سنة)", labelEn: "Less than a year (0 - 1 yr)" },
  { value: "1-3",   labelAr: "1 - 3 سنوات", labelEn: "1 - 3 years" },
  { value: "3-5",   labelAr: "3 - 5 سنوات", labelEn: "3 - 5 years" },
  { value: "5-10",  labelAr: "5 - 10 سنوات", labelEn: "5 - 10 years" },
  { value: "10+",   labelAr: "أكثر من 10 سنوات (خبير)", labelEn: "10+ years (Expert)" },
];

export const SKILL_CATEGORY_META: Record<SkillEntry["category"], { labelAr: string; labelEn: string; emoji: string }> = {
  tech:     { labelAr: "المهارات التقنية والبرمجية", labelEn: "Technical & Coding Skills", emoji: "💻" },
  creative: { labelAr: "المهارات الإبداعية والتصميم", labelEn: "Creative & Design Skills", emoji: "🎨" },
  language: { labelAr: "اللغات والتواصل", labelEn: "Languages & Communication", emoji: "📝" },
  other:    { labelAr: "مهارات عملية وقيادية", labelEn: "Practical & Leadership Skills", emoji: "🛠️" },
};

export const SKILL_LEVEL_META: Record<number, { labelAr: string; labelEn: string; color: string; badgeAr: string }> = {
  1: { labelAr: "مبتدئ (1 / 5)", labelEn: "Beginner (1/5)", color: "text-amber-400", badgeAr: "مبتدئ" },
  2: { labelAr: "أساسي (2 / 5)", labelEn: "Elementary (2/5)", color: "text-amber-300", badgeAr: "أساسي" },
  3: { labelAr: "متوسط (3 / 5)", labelEn: "Intermediate (3/5)", color: "text-primary", badgeAr: "متوسط" },
  4: { labelAr: "متقدم (4 / 5)", labelEn: "Advanced (4/5)", color: "text-emerald-400", badgeAr: "متقدم" },
  5: { labelAr: "خبير / طليق (5 / 5)", labelEn: "Expert / Fluent (5/5)", color: "text-emerald-300 font-extrabold", badgeAr: "خبير / طليق" },
};
