/**
 * Server Security Utilities & SSRF (Server-Side Request Forgery) Defense
 * Protects scrapers and fetchers from intranet scanning, metadata extraction,
 * and loopback injection attacks.
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // 127.0.0.0/8 (Loopback)
  /^10\./,                           // 10.0.0.0/8 (Private network)
  /^192\.168\./,                     // 192.168.0.0/16 (Private network)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12 (Private network)
  /^169\.254\./,                     // 169.254.0.0/16 (Link-local / Cloud Metadata)
  /^0\./,                            // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // 100.64.0.0/10 (CGNAT)
];

const FORBIDDEN_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "169.254.169.254",
]);

const FORBIDDEN_SUFFIXES = [
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".corp",
  ".arpa",
  ".onion",
];

export interface UrlSafetyResult {
  isSafe: boolean;
  reason?: string;
  normalizedUrl?: string;
}

/**
 * Validates that an untrusted user-supplied URL targets a public, safe web server.
 * Rejects private IPs, loopbacks, cloud metadata endpoints, and non-HTTP protocols.
 */
export function isSafePublicUrl(rawUrl: string): UrlSafetyResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isSafe: false, reason: "الرابط المطلوب غير متوفر" };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { isSafe: false, reason: "طول الرابط يتجاوز الحد المسموح به أمنياً" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isSafe: false, reason: "صيغة الرابط غير صالحة" };
  }

  // 1. Strict protocol enforcement
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isSafe: false, reason: "البروتوكول غير مدعوم، يجب استخدام http أو https فقط" };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  // 2. Reject credentials embedded in URL (e.g. http://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return { isSafe: false, reason: "غير مسموح بتضمين بيانات الاعتماد في الرابط" };
  }

  // 3. Exact forbidden hostname check
  if (FORBIDDEN_HOSTNAMES.has(hostname)) {
    return { isSafe: false, reason: "الوصول إلى هذا النطاق محظور أمنياً (عنوان محلي أو سحابي خاص)" };
  }

  // 4. Forbidden private TLDs and internal suffixes
  for (const suffix of FORBIDDEN_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return { isSafe: false, reason: `الوصول إلى النطاقات الداخلية المنتهية بـ ${suffix} محظور` };
    }
  }

  // 5. Private IP range matching
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { isSafe: false, reason: "الوصول إلى عناوين الشبكة المحلية أو الخاصة (Private IP) محظور" };
    }
  }

  // 6. IPv6 check
  if (hostname.includes(":") || hostname === "0000:0000:0000:0000:0000:0000:0000:0001") {
    if (
      hostname === "::1" ||
      hostname.startsWith("fe80:") ||
      hostname.startsWith("fc00:") ||
      hostname.startsWith("fd00:")
    ) {
      return { isSafe: false, reason: "الوصول إلى عناوين IPv6 المحلية أو الخاصة محظور" };
    }
  }

  // 7. Port check: Only standard public web ports allowed
  if (parsed.port) {
    const portNum = parseInt(parsed.port, 10);
    const ALLOWED_PORTS = new Set([80, 443, 8080, 8443]);
    if (!ALLOWED_PORTS.has(portNum)) {
      return { isSafe: false, reason: `المنفذ ${parsed.port} غير مسموح به أمنياً` };
    }
  }

  return {
    isSafe: true,
    normalizedUrl: parsed.href,
  };
}
