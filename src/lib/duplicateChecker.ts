/**
 * Duplicate Checker & Data Integrity Guard
 * 
 * Provides robust real-time detection of duplicate scholarships and listings
 * based on normalized URLs, Arabic/English titles, and fuzzy matching.
 */

import { Scholarship } from "./mockData";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType: "exact_url" | "exact_title" | "similar_title" | "none";
  matchedItem: Scholarship | null;
  confidence: number; // 0 to 100
  reasonAr: string;
  reasonEn: string;
}

/**
 * Normalizes text for comparison, with comprehensive Arabic diacritic stripping,
 * letter unification (alef, yaa, taa marbouta), and whitespace collapsing.
 */
export function normalizeText(raw: string | undefined | null): string {
  if (!raw) return "";
  let s = raw.toLowerCase().trim();

  // 1. Remove Arabic Tashkeel / Diacritics (\u064B - \u065F, \u0670)
  s = s.replace(/[\u064B-\u065F\u0670]/g, "");

  // 2. Unify Alef forms: [أ إ آ ٱ] -> ا
  s = s.replace(/[أإآٱ]/g, "ا");

  // 3. Unify Yaa / Alef Maksura: ى -> ي
  s = s.replace(/ى/g, "ي");

  // 4. Unify Taa Marbouta: ة -> ه
  s = s.replace(/ة/g, "ه");

  // 5. Remove non-alphanumeric characters (keep Arabic unicode letters \u0600-\u06FF, numbers, english letters)
  s = s.replace(/[^\w\s\u0600-\u06FF]/g, " ");

  // 6. Collapse multiple spaces
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Normalizes URLs for accurate comparison (strips protocol, www, trailing slashes, fragments).
 */
export function normalizeUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim().toLowerCase();

  // Strip protocol
  url = url.replace(/^https?:\/\//, "");

  // Strip www.
  url = url.replace(/^www\./, "");

  // Strip trailing slashes
  url = url.replace(/\/+$/, "");

  // Strip fragment
  const hashIdx = url.indexOf("#");
  if (hashIdx !== -1) {
    url = url.substring(0, hashIdx);
  }

  // Strip standard tracking parameters
  try {
    const qIdx = url.indexOf("?");
    if (qIdx !== -1) {
      const base = url.substring(0, qIdx);
      const search = url.substring(qIdx + 1);
      const params = new URLSearchParams(search);
      // Remove analytics / tracking params
      params.delete("utm_source");
      params.delete("utm_medium");
      params.delete("utm_campaign");
      params.delete("utm_term");
      params.delete("utm_content");
      params.delete("ref");
      params.delete("fbclid");
      params.delete("gclid");
      const remaining = params.toString();
      url = remaining ? `${base}?${remaining}` : base;
    }
  } catch {
    // If parsing query fails, keep as is
  }

  return url;
}

/**
 * Helper to compute token overlap / Jaccard similarity
 */
function computeWordOverlap(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const words1 = new Set(s1.split(" ").filter((w) => w.length > 2));
  const words2 = new Set(s2.split(" ").filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  for (const w of words1) {
    if (words2.has(w)) common++;
  }

  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : common / union;
}

/**
 * Checks whether a scholarship is a duplicate of any existing scholarship.
 */
export function checkScholarshipDuplicate(
  candidate: Partial<Scholarship> & Record<string, any>,
  existingScholarships: Scholarship[],
  currentId?: string
): DuplicateCheckResult {
  if (!candidate || !existingScholarships || existingScholarships.length === 0) {
    return {
      isDuplicate: false,
      matchType: "none",
      matchedItem: null,
      confidence: 0,
      reasonAr: "منحة جديدة وغير مسجلة في النظام",
      reasonEn: "New unique scholarship not registered in the system",
    };
  }

  const targetId = currentId || candidate.id;
  const list = existingScholarships.filter((s) => s.id !== targetId);

  // 1. Gather candidate URLs & Titles
  const candApplyUrl = normalizeUrl(candidate.apply_url || candidate.official_website || candidate.officialUrl || candidate.sourceUrl);
  const candOfficialUrl = normalizeUrl(candidate.official_website || candidate.officialUrl);

  const candTitleAr = normalizeText(candidate.title_ar || candidate.title);
  const candTitleEn = normalizeText(candidate.title_en || candidate.titleEn);

  // 2. Check each existing scholarship
  for (const s of list) {
    const sApplyUrl = normalizeUrl((s as any).apply_url || s.officialUrl || s.sourceUrl);
    const sOfficialUrl = normalizeUrl((s as any).official_website || s.officialUrl);

    // Exact URL check (if URL has meaningful length)
    if (candApplyUrl && candApplyUrl.length > 10) {
      if (candApplyUrl === sApplyUrl || (sOfficialUrl && candApplyUrl === sOfficialUrl)) {
        return {
          isDuplicate: true,
          matchType: "exact_url",
          matchedItem: s,
          confidence: 100,
          reasonAr: `تطابق تام في رابط التقديم الرسمي مع المنحة المسجلة: "${s.title}"`,
          reasonEn: `Exact match in official application URL with: "${s.titleEn || s.title}"`,
        };
      }
    }

    if (candOfficialUrl && candOfficialUrl.length > 10) {
      if (candOfficialUrl === sOfficialUrl || candOfficialUrl === sApplyUrl) {
        return {
          isDuplicate: true,
          matchType: "exact_url",
          matchedItem: s,
          confidence: 100,
          reasonAr: `تطابق تام في موقع المنحة الرسمي مع: "${s.title}"`,
          reasonEn: `Exact match in official website URL with: "${s.titleEn || s.title}"`,
        };
      }
    }

    // Exact Title match (Arabic)
    const sTitleAr = normalizeText((s as any).title_ar || s.title);
    if (candTitleAr && sTitleAr && candTitleAr.length > 5 && candTitleAr === sTitleAr) {
      return {
        isDuplicate: true,
        matchType: "exact_title",
        matchedItem: s,
        confidence: 98,
        reasonAr: `تطابق تام في عنوان المنحة بالعربية مع: "${s.title}"`,
        reasonEn: `Exact title match with: "${s.titleEn || s.title}"`,
      };
    }

    // Exact Title match (English)
    const sTitleEn = normalizeText((s as any).title_en || s.titleEn);
    if (candTitleEn && sTitleEn && candTitleEn.length > 5 && candTitleEn === sTitleEn) {
      return {
        isDuplicate: true,
        matchType: "exact_title",
        matchedItem: s,
        confidence: 98,
        reasonAr: `تطابق تام في عنوان المنحة بالإنجليزية مع: "${s.titleEn || s.title}"`,
        reasonEn: `Exact English title match with: "${s.titleEn || s.title}"`,
      };
    }

    // Similar title match (high word overlap >= 70%)
    if (candTitleAr && sTitleAr && candTitleAr.length > 8 && sTitleAr.length > 8) {
      const overlapAr = computeWordOverlap(candTitleAr, sTitleAr);
      if (overlapAr >= 0.7) {
        return {
          isDuplicate: true,
          matchType: "similar_title",
          matchedItem: s,
          confidence: Math.round(overlapAr * 100),
          reasonAr: `تشابه كبير جداً بنسبة ${Math.round(overlapAr * 100)}% في عنوان المنحة مع: "${s.title}"`,
          reasonEn: `High title similarity (${Math.round(overlapAr * 100)}%) with: "${s.titleEn || s.title}"`,
        };
      }
    }

    if (candTitleEn && sTitleEn && candTitleEn.length > 8 && sTitleEn.length > 8) {
      const overlapEn = computeWordOverlap(candTitleEn, sTitleEn);
      if (overlapEn >= 0.7) {
        return {
          isDuplicate: true,
          matchType: "similar_title",
          matchedItem: s,
          confidence: Math.round(overlapEn * 100),
          reasonAr: `تشابه بالإنجليزية بنسبة ${Math.round(overlapEn * 100)}% مع: "${s.titleEn || s.title}"`,
          reasonEn: `High English title similarity (${Math.round(overlapEn * 100)}%) with: "${s.titleEn || s.title}"`,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    matchType: "none",
    matchedItem: null,
    confidence: 0,
    reasonAr: "منحة فريدة - لا يوجد أي تكرار مسجل",
    reasonEn: "Unique scholarship - No duplicate recorded",
  };
}

/**
 * Dedicated existence lookup helper. Searches existing scholarships by a single query (URL or title text).
 */
export function findExistingScholarshipByQuery(
  query: string,
  existingScholarships: Scholarship[]
): {
  found: boolean;
  scholarship: Scholarship | null;
  matchType: "exact_url" | "exact_title" | "similar_title" | "none";
  confidence: number;
  reasonAr: string;
  reasonEn: string;
} {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) {
    return {
      found: false,
      scholarship: null,
      matchType: "none",
      confidence: 0,
      reasonAr: "يرجى كتابة اسم المنحة أو لصق رابطها للتحقق",
      reasonEn: "Please enter the scholarship title or paste its URL to verify",
    };
  }

  // If query looks like a URL
  const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes(".com") || trimmed.includes(".edu") || trimmed.includes(".org");

  if (isUrl) {
    const check = checkScholarshipDuplicate(
      { apply_url: trimmed, official_website: trimmed, title: "" } as any,
      existingScholarships
    );
    return {
      found: check.isDuplicate,
      scholarship: check.matchedItem,
      matchType: check.matchType,
      confidence: check.confidence,
      reasonAr: check.reasonAr,
      reasonEn: check.reasonEn,
    };
  }

  // If query is text/title
  const check = checkScholarshipDuplicate(
    { title: trimmed, title_ar: trimmed, title_en: trimmed } as any,
    existingScholarships
  );
  return {
    found: check.isDuplicate,
    scholarship: check.matchedItem,
    matchType: check.matchType,
    confidence: check.confidence,
    reasonAr: check.reasonAr,
    reasonEn: check.reasonEn,
  };
}
