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
 * Extracts normalized host / domain for broad university/portal matching.
 * e.g. "daad.de/en/study" -> "daad.de"
 */
export function extractDomainHost(rawUrl: string | undefined | null): string {
  const norm = normalizeUrl(rawUrl);
  if (!norm) return "";
  const slashIdx = norm.indexOf("/");
  const host = slashIdx === -1 ? norm : norm.substring(0, slashIdx);
  // Remove common subdomains like 'apply.', 'portal.', 'www.'
  return host.replace(/^(apply|portal|admissions|scholarships?|international|en|ar)\./, "");
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

  // 1. Gather candidate URLs & Domains
  const rawCandUrls = [
    candidate.apply_url,
    candidate.applyUrl,
    candidate.official_website,
    candidate.officialUrl,
    candidate.sourceUrl,
    candidate.url,
    candidate.website,
  ].filter(Boolean) as string[];

  const candNormUrls = rawCandUrls.map(normalizeUrl).filter((u) => u.length > 5);
  const candDomains = rawCandUrls.map(extractDomainHost).filter((d) => d.length > 4 && !d.includes("google.com") && !d.includes("bit.ly"));

  const candTitleAr = normalizeText(candidate.title_ar || candidate.title);
  const candTitleEn = normalizeText(candidate.title_en || candidate.titleEn);

  // 2. Check each existing scholarship
  for (const s of list) {
    const sRawUrls = [
      (s as any).apply_url,
      (s as any).applyUrl,
      (s as any).official_website,
      s.officialUrl,
      s.sourceUrl,
      (s as any).url,
      (s as any).website,
    ].filter(Boolean) as string[];

    const sNormUrls = sRawUrls.map(normalizeUrl).filter((u) => u.length > 5);
    const sDomains = sRawUrls.map(extractDomainHost).filter((d) => d.length > 4 && !d.includes("google.com") && !d.includes("bit.ly"));

    // Check 1: Exact URL match or prefix match (e.g., https://daad.de vs https://daad.de/en/...)
    for (const cUrl of candNormUrls) {
      for (const sUrl of sNormUrls) {
        if (cUrl === sUrl) {
          return {
            isDuplicate: true,
            matchType: "exact_url",
            matchedItem: s,
            confidence: 100,
            reasonAr: `تطابق تام في رابط التقديم الرسمي مع المنحة المسجلة: "${s.title}"`,
            reasonEn: `Exact match in official application URL with: "${s.titleEn || s.title}"`,
          };
        }
        // Subpath match (if one URL starts with the other and shares significant path > 12 chars)
        if (cUrl.length > 12 && sUrl.length > 12) {
          if (cUrl.startsWith(sUrl) || sUrl.startsWith(cUrl)) {
            return {
              isDuplicate: true,
              matchType: "exact_url",
              matchedItem: s,
              confidence: 95,
              reasonAr: `تطابق في مسار الرابط الرسمي للمنحة المسجلة: "${s.title}"`,
              reasonEn: `Matching URL path with registered scholarship: "${s.titleEn || s.title}"`,
            };
          }
        }
      }
    }

    // Check 2: Domain match (Same official portal / university domain)
    for (const cDom of candDomains) {
      for (const sDom of sDomains) {
        if (cDom === sDom && cDom.length > 5) {
          return {
            isDuplicate: true,
            matchType: "exact_url",
            matchedItem: s,
            confidence: 90,
            reasonAr: `الرابط ينتمي لنفس موقع المنحة/الجامعة المسجلة: "${s.title}" (${cDom})`,
            reasonEn: `URL belongs to the same domain as registered scholarship: "${s.titleEn || s.title}" (${cDom})`,
          };
        }
      }
    }

    // Check 3: Exact Title match (Arabic)
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

    // Check 4: Exact Title match (English)
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

    // Check 5: Similar title match (high word overlap >= 70%)
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
          confidence: Math.round(overlapAr * 100),
          reasonAr: `تشابه بالإنجليزية بنسبة ${Math.round(overlapAr * 100)}% مع: "${s.titleEn || s.title}"`,
          reasonEn: `High English title similarity (${Math.round(overlapAr * 100)}%) with: "${s.titleEn || s.title}"`,
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
export interface JobDuplicateCheckResult {
  isDuplicate: boolean;
  matchType: "exact_url" | "exact_title" | "similar_title" | "none";
  matchedItem: any | null;
  confidence: number;
  reasonAr: string;
  reasonEn: string;
}

/**
 * Checks whether a job candidate is a duplicate of any existing job.
 */
export function checkJobDuplicate(
  candidate: Record<string, any>,
  existingJobs: any[],
  currentId?: string
): JobDuplicateCheckResult {
  if (!candidate || !existingJobs || existingJobs.length === 0) {
    return {
      isDuplicate: false,
      matchType: "none",
      matchedItem: null,
      confidence: 0,
      reasonAr: "فرصة عمل فريدة - غير مسجلة في النظام",
      reasonEn: "Unique job listing - Not registered in system",
    };
  }

  const targetId = currentId || candidate.id;
  const list = existingJobs.filter((j) => j.id !== targetId);

  const candUrl = normalizeUrl(
    candidate.contact?.website ||
    candidate.applyUrl ||
    candidate.url ||
    candidate.apply_url ||
    candidate.website
  );
  const candTitleAr = normalizeText(candidate.title_ar || candidate.title);
  const candTitleEn = normalizeText(candidate.title_en || candidate.titleEn);
  const candCompany = normalizeText(candidate.company);

  for (const j of list) {
    const jUrl = normalizeUrl(j.contact?.website || j.applyUrl || j.url || j.apply_url || j.website);

    // Exact URL check
    if (candUrl && candUrl.length > 10 && jUrl) {
      if (candUrl === jUrl) {
        return {
          isDuplicate: true,
          matchType: "exact_url",
          matchedItem: j,
          confidence: 100,
          reasonAr: `تطابق تام في رابط التقديم/الموقع مع الوظيفة المسجلة: "${j.title}" (${j.company})`,
          reasonEn: `Exact match in job URL with: "${j.titleEn || j.title}" (${j.company})`,
        };
      }
    }

    // Exact Title + Company check
    const jTitleAr = normalizeText(j.title_ar || j.title);
    const jTitleEn = normalizeText(j.title_en || j.titleEn);
    const jCompany = normalizeText(j.company);

    if (
      (candTitleAr && jTitleAr && candTitleAr === jTitleAr) ||
      (candTitleEn && jTitleEn && candTitleEn === jTitleEn)
    ) {
      const companyMatches = (!candCompany && !jCompany) || (candCompany && jCompany && candCompany === jCompany);
      if (companyMatches) {
        return {
          isDuplicate: true,
          matchType: "exact_title",
          matchedItem: j,
          confidence: 95,
          reasonAr: `تطابق تام في مسمى الوظيفة والشركة مع: "${j.title}" (${j.company})`,
          reasonEn: `Exact title match with: "${j.titleEn || j.title}" (${j.company})`,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    matchType: "none",
    matchedItem: null,
    confidence: 0,
    reasonAr: "فرصة عمل جديدة وغير مكررة",
    reasonEn: "New unique job listing",
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
