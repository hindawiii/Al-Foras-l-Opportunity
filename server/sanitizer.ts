/**
 * Server-side Input Sanitizer & Security Validator
 */

const MAX_STRING_LENGTH = 10000;
const MAX_URL_LENGTH = 2048;

export function sanitizeServerText(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = String(input).trim();
  if (!str) return "";

  const truncated = str.slice(0, MAX_STRING_LENGTH);

  return truncated
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/<\/?(?:iframe|object|embed|form|link|meta)\b[^>]*>/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function sanitizeServerUrl(rawUrl: unknown, fallback = "#"): string {
  if (!rawUrl || typeof rawUrl !== "string") return fallback;

  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return fallback;

  if (trimmed === "#" || trimmed.startsWith("#")) return trimmed;

  // eslint-disable-next-line no-control-regex
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, "");
  const lower = normalized.toLowerCase();

  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("about:")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fallback;
    }
    return parsed.href;
  } catch {
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    return fallback;
  }
}

export function sanitizeServerStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => sanitizeServerText(item))
    .filter((item) => item.length > 0 && item.length <= 150)
    .slice(0, 30);
}
