import { describe, it, expect } from "vitest";
import { hashAdminPassword } from "@/lib/adminAuthStore";
import {
  sanitizeText,
  sanitizeUrl,
  sanitizeScholarship,
  sanitizeJob,
  sanitizeUniversity,
  sanitizeStringArray,
} from "@/lib/sanitizer";

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

  it("sanitizes dangerous URL schemes and prevents XSS", () => {
    expect(sanitizeUrl("https://scholarships.harvard.edu")).toBe("https://scholarships.harvard.edu/");
    expect(sanitizeUrl("http://ksu.edu.sa")).toBe("http://ksu.edu.sa/");
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeUrl("java\tscript:alert(1)")).toBe("#");
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("#");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("#");
  });

  it("escapes malicious HTML injection in string sanitizers", () => {
    const malicious = "<script>alert('pwned')</script>";
    const cleaned = sanitizeText(malicious);
    expect(cleaned).not.toContain("<script>");

    const imgPayload = "<img src=x onerror=alert(1)>";
    const cleanedImg = sanitizeText(imgPayload);
    expect(cleanedImg).not.toContain("onerror=");
  });

  it("sanitizes deep scholarship objects thoroughly", () => {
    const dangerousSch = {
      id: "sch-1",
      title: "منحة جامعة هارفارد <script>alert(1)</script>",
      url: "javascript:evil()",
      tags: ["منح", "<script>hack</script>طب"],
      description: "وصف المنحة <iframe src='http://evil.com'></iframe>",
    };

    const cleaned = sanitizeScholarship(dangerousSch);
    expect(cleaned.title).not.toContain("<script>");
    expect(cleaned.url).toBe("#");
    expect(cleaned.tags).not.toContain("<script>");
    expect(cleaned.description).not.toContain("<iframe");
  });

  it("sanitizes deep job and university objects", () => {
    const dangerousJob = {
      id: "job-1",
      title_ar: "مهندس برمجيات <script>",
      apply_url: "javascript:void(0)",
      skills: ["React", "<b onmouseover=alert(1)>CSS</b>"],
    };
    const cleanedJob = sanitizeJob(dangerousJob);
    expect(cleanedJob.title_ar).not.toContain("<script>");
    expect(cleanedJob.apply_url).toBe("#");
    expect(cleanedJob.skills[1]).not.toContain("onmouseover=");

    const dangerousUni = {
      id: "uni-1",
      name: "جامعة الملك سعود <script>",
      website: "data:text/html,hack",
      minPercentage: 120, // Invalid percentage
    };
    const cleanedUni = sanitizeUniversity(dangerousUni);
    expect(cleanedUni.name).not.toContain("<script>");
    expect(cleanedUni.website).toBe("#");
    expect(cleanedUni.minPercentage).toBe(100); // Clamped to valid 100
  });
});
