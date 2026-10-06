import { describe, it, expect } from "vitest";
import { isArabCountry } from "@/lib/dynamicStore";
import { checkScholarshipDuplicate } from "@/lib/duplicateChecker";
import { SCHOLARSHIPS, Scholarship } from "@/lib/mockData";

describe("Scholarships Domain & Logic Unit Tests", () => {
  it("correctly identifies Arab countries in Arabic and English", () => {
    expect(isArabCountry("السعودية")).toBe(true);
    expect(isArabCountry("قطر")).toBe(true);
    expect(isArabCountry("مصر")).toBe(true);
    expect(isArabCountry("السودان")).toBe(true);
    expect(isArabCountry("Algeria")).toBe(true);
    expect(isArabCountry("Oman")).toBe(true);
    expect(isArabCountry("Germany")).toBe(false);
    expect(isArabCountry("بريطانيا")).toBe(false);
    expect(isArabCountry("Japan")).toBe(false);
  });

  it("detects exact and fuzzy duplicates correctly", () => {
    const existing: Scholarship[] = [
      {
        id: "sch_test_1",
        title: "منحة جامعة الملك سعود المتميزة",
        titleEn: "King Saud University Scholarship",
        org: "جامعة الملك سعود",
        country: "السعودية",
        flag: "🇸🇦",
        coverage: "full",
        amount: "ممولة بالكامل",
        level: "بكالوريوس",
        category: "arab",
        deadline: "2026-12-31",
        url: "https://ksu.edu.sa/scholarship",
        tags: ["طب", "هندسة"],
        description: "منحة ممولة بالكامل",
      },
    ];

    // Same URL should trigger duplicate
    const check1 = checkScholarshipDuplicate(
      { url: "https://ksu.edu.sa/scholarship", title: "منحة أخرى" },
      existing
    );
    expect(check1.isDuplicate).toBe(true);
    expect(check1.matchType).toBe("exact_url");

    // Very similar title should trigger duplicate
    const check2 = checkScholarshipDuplicate(
      { url: "https://other.com/scholarship", title: "منحة جامعة الملك سعود المتميزة" },
      existing
    );
    expect(check2.isDuplicate).toBe(true);
    expect(check2.matchType).toBe("exact_title");

    // Completely new scholarship should pass
    const check3 = checkScholarshipDuplicate(
      { url: "https://oxford.ac.uk/new", title: "منحة أكسفورد الجديدة" },
      existing
    );
    expect(check3.isDuplicate).toBe(false);
  });

  it("ensures all built-in scholarships have valid required fields", () => {
    expect(SCHOLARSHIPS.length).toBeGreaterThan(0);
    for (const sch of SCHOLARSHIPS) {
      expect(sch.id).toBeDefined();
      expect(typeof sch.id).toBe("string");
      expect(sch.title).toBeDefined();
      expect(sch.country).toBeDefined();
      expect(sch.category).toMatch(/^(arab|global)$/);
    }
  });
});
