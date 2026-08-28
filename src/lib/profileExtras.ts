import localforage from "localforage";

localforage.config({
  name: "al-foras",
  storeName: "profile_extras",
  description: "Local IndexedDB store for extended profile data",
});

export type LinkType =
  | "portfolio" | "linkedin" | "twitter" | "telegram"
  | "instagram" | "youtube" | "github" | "behance"
  | "medium" | "cv" | "other";

export interface PersonalLink {
  id: string;
  type: LinkType;
  url: string;
}

export interface SkillEntry {
  name: string;
  level: number; // 1..5
  category: "tech" | "creative" | "language" | "other";
}

export interface ProfileExtras {
  phoneCountryCode: string;       // e.g. "+249"
  phoneCountryIso: string;        // e.g. "SD"
  links: PersonalLink[];
  highSchool: string;
  university: string;
  major: string;
  gpa: string;
  gpaScale: "4" | "5" | "100";
  degree: "" | "secondary" | "diploma" | "bachelor" | "master" | "phd";
  detailedSkills: SkillEntry[];
  experienceYears: "" | "none" | "0-1" | "1-3" | "3-5" | "5-10" | "10+";
  updatedAt: string;
}

const KEY = "profile_extras_v1";

export const defaultExtras: ProfileExtras = {
  phoneCountryCode: "+249",
  phoneCountryIso: "SD",
  links: [],
  highSchool: "",
  university: "",
  major: "",
  gpa: "",
  gpaScale: "4",
  degree: "",
  detailedSkills: [],
  experienceYears: "",
  updatedAt: new Date().toISOString(),
};

export const profileExtras = {
  async load(): Promise<ProfileExtras> {
    try {
      const v = await localforage.getItem<ProfileExtras>(KEY);
      if (v) return { ...defaultExtras, ...v };
    } catch (e) { console.error("profileExtras.load", e); }
    // Fallback to localStorage (older data)
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...defaultExtras, ...JSON.parse(raw) };
    } catch {}
    return { ...defaultExtras };
  },
  async save(v: ProfileExtras): Promise<void> {
    const withTs = { ...v, updatedAt: new Date().toISOString() };
    try { await localforage.setItem(KEY, withTs); } catch (e) { console.error("profileExtras.save", e); }
    // Also mirror to localStorage as backup
    try { localStorage.setItem(KEY, JSON.stringify(withTs)); } catch {}
  },
  async clear(): Promise<void> {
    try { await localforage.removeItem(KEY); } catch {}
    try { localStorage.removeItem(KEY); } catch {}
  },
};
