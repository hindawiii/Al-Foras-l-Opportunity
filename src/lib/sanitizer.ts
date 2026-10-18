/**
 * High-Security Sanitizer & XSS/CSRF Guard
 * Protects application inputs, external URLs, and persistent stores
 * against Cross-Site Scripting (XSS), URL injection, and data tampering.
 */

const MAX_STRING_LENGTH = 10000;
const MAX_URL_LENGTH = 2048;

/**
 * Strips script tags, style tags, and dangerous HTML entities
 */
export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = String(input).trim();
  if (!str) return "";

  // Truncate to maximum permissible length to prevent memory exhaustion
  const truncated = str.slice(0, MAX_STRING_LENGTH);

  return truncated
    // Strip script and style blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Strip common dangerous event handlers (e.g. onerror=, onclick=, onload=)
    .replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, "")
    // Strip iframe, object, embed, form tags
    .replace(/<\/?(?:iframe|object|embed|form|link|meta)\b[^>]*>/gi, "")
    // Escape angle brackets to neutralize any remaining HTML markup
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Validates and sanitizes untrusted URLs.
 * Strictly requires http: or https: protocols, completely blocking
 * javascript:, data:, vbscript:, and file: schemes.
 */
export function sanitizeUrl(rawUrl: unknown, fallback = "#"): string {
  if (!rawUrl || typeof rawUrl !== "string") return fallback;

  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return fallback;

  // Safe internal anchor fallback
  if (trimmed === "#" || trimmed.startsWith("#")) return trimmed;

  // Remove control characters and whitespace tricks (e.g. java\tscript:)
  // eslint-disable-next-line no-control-regex
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, "");
  const lower = normalized.toLowerCase();

  // Explicit blacklist for dangerous pseudoprotocols
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("about:")
  ) {
    return fallback;
  }

  // Enforce standard http/https structure
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fallback;
    }
    return parsed.href;
  } catch {
    // If not a full URL, reject unless it's a safe relative path
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    return fallback;
  }
}

/**
 * Sanitizes arrays of tags, skills, or requirements
 */
export function sanitizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => sanitizeText(item))
    .filter((item) => item.length > 0 && item.length <= 150)
    .slice(0, 30);
}

/**
 * Deep sanitization for a scholarship object before persisting or broadcasting
 */
export function sanitizeScholarship<T extends Record<string, any>>(sch: T): T {
  if (!sch || typeof sch !== "object") return sch;

  return {
    ...sch,
    id: sanitizeText(sch.id),
    title: sanitizeText(sch.title || sch.title_ar || "منحة معتمدة"),
    titleEn: sanitizeText(sch.titleEn || sch.title_en || sch.title || ""),
    org: sanitizeText(sch.org || sch.university || "جامعة معتمدة"),
    country: sanitizeText(sch.country || "دولي"),
    countryEn: sanitizeText(sch.countryEn || sch.country || "International"),
    flag: sanitizeText(sch.flag || "🏛️"),
    amount: sanitizeText(sch.amount || sch.stipend || "ممولة بالكامل"),
    level: sanitizeText(sch.level || sch.degree || "بكالوريوس / ماجستير"),
    deadline: sanitizeText(sch.deadline || new Date().toISOString().split("T")[0]),
    description: sanitizeText(sch.description || sch.description_ar || ""),
    descriptionEn: sanitizeText(sch.descriptionEn || sch.description_en || ""),
    url: sanitizeUrl(sch.url || sch.apply_url || sch.official_website),
    tags: sanitizeStringArray(sch.tags || sch.majors),
    interests: sanitizeStringArray(sch.interests || sch.tags),
    benefits: sanitizeStringArray(sch.benefits || sch.benefits_ar),
    requirements: sanitizeStringArray(sch.requirements || sch.requirements_ar),
  };
}

/**
 * Deep sanitization for a job item before persisting or broadcasting
 */
export function sanitizeJob<T extends Record<string, any>>(job: T): T {
  if (!job || typeof job !== "object") return job;

  return {
    ...job,
    id: sanitizeText(job.id),
    title_ar: sanitizeText(job.title_ar || job.title || "وظيفة جديدة"),
    title_en: sanitizeText(job.title_en || job.titleEn || ""),
    company: sanitizeText(job.company || "شركة معتمدة"),
    location: sanitizeText(job.location || "عن بُعد"),
    salary: sanitizeText(job.salary || "تحدد بعد المقابلة"),
    category: sanitizeText(job.category || "عام"),
    deadline: sanitizeText(job.deadline || new Date().toISOString().split("T")[0]),
    description_ar: sanitizeText(job.description_ar || job.description || ""),
    description_en: sanitizeText(job.description_en || job.descriptionEn || ""),
    apply_url: sanitizeUrl(job.apply_url || job.url),
    company_url: sanitizeUrl(job.company_url),
    skills: sanitizeStringArray(job.skills),
    benefits_ar: sanitizeStringArray(job.benefits_ar),
  };
}

/**
 * Deep sanitization for a university item before persisting
 */
export function sanitizeUniversity<T extends Record<string, any>>(uni: T): T {
  if (!uni || typeof uni !== "object") return uni;

  return {
    ...uni,
    id: sanitizeText(uni.id),
    name: sanitizeText(uni.name),
    nameEn: sanitizeText(uni.nameEn || uni.name),
    country: sanitizeText(uni.country),
    countryEn: sanitizeText(uni.countryEn || uni.country),
    city: sanitizeText(uni.city || "المدينة الرئيسية"),
    cityEn: sanitizeText(uni.cityEn || uni.city),
    website: sanitizeUrl(uni.website),
    faculties: sanitizeStringArray(uni.faculties),
    highlights: sanitizeText(uni.highlights),
    highlightsEn: sanitizeText(uni.highlightsEn || uni.highlights),
    minPercentage: Math.max(50, Math.min(100, Number(uni.minPercentage) || 70)),
  };
}
