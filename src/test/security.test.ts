import { describe, it, expect } from "vitest";
import { hashAdminPassword } from "@/lib/adminAuthStore";

describe("Security & Defense Testing", () => {
  it("verifies cryptographic password hashing integrity", () => {
    const hash1 = hashAdminPassword("2026");
    const hash2 = hashAdminPassword("2026");
    const hash3 = hashAdminPassword("different_password");

    // Hashes must be deterministic for identical inputs
    expect(hash1).toBe(hash2);
    // Different inputs must produce completely different hashes
    expect(hash1).not.toBe(hash3);
    // Length must meet security standards
    expect(hash1.length).toBeGreaterThan(6);
  });

  it("sanitizes and detects dangerous URL schemes", () => {
    const isSafeUrl = (url: string): boolean => {
      if (!url || typeof url !== "string") return false;
      const lower = url.trim().toLowerCase();
      // Block javascript: pseudoprotocol, vbscript, data URLs
      if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
        return false;
      }
      return lower.startsWith("https://") || lower.startsWith("http://");
    };

    expect(isSafeUrl("https://scholarships.harvard.edu")).toBe(true);
    expect(isSafeUrl("http://ksu.edu.sa")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("escapes malicious HTML injection in string sanitizers", () => {
    const sanitizeText = (input: string): string => {
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const malicious = "<script>alert('pwned')</script>";
    const cleaned = sanitizeText(malicious);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).toContain("&lt;script&gt;");
  });
});
