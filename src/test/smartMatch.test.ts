import { describe, it, expect } from "vitest";
import { computeScholarshipMatch, computeMatchScore, SCHOLARSHIPS } from "@/lib/mockData";

describe("Multi-Factor Smart Match Engine Tests", () => {
  it("calculates match score within safe bounds (50% - 99%)", () => {
    const s = SCHOLARSHIPS[0];
    const score = computeMatchScore(s);
    expect(score).toBeGreaterThanOrEqual(52);
    expect(score).toBeLessThanOrEqual(99);
  });

  it("boosts score and flags factors when user major and degree match", () => {
    const s = SCHOLARSHIPS.find((x) => x.field?.includes("هندسة") || x.fieldEn?.includes("Engineering")) || SCHOLARSHIPS[0];
    const studentProfile = {
      major: "هندسة برمجيات",
      degreeLevel: s.level?.includes("ماجستير") ? "ماجستير" : "بكالوريوس",
      gpa: "3.85 / 4.0",
      location: s.country,
    };

    const result = computeScholarshipMatch(s, studentProfile);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasonAr).toBeDefined();
    expect(result.reasonEn).toBeDefined();
    expect(result.factors.gpaMatch).toBe(true);
  });

  it("provides tailored bilingual reasoning guidance", () => {
    const s = SCHOLARSHIPS[0];
    const match = computeScholarshipMatch(s, { gpa: "95%" });

    expect(typeof match.reasonAr).toBe("string");
    expect(match.reasonAr.length).toBeGreaterThan(10);
    expect(typeof match.reasonEn).toBe("string");
    expect(match.reasonEn.length).toBeGreaterThan(10);
  });
});
