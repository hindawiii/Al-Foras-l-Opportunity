import { describe, it, expect } from "vitest";
import { JOBS, Job } from "@/lib/jobsData";
import { checkJobDuplicate } from "@/lib/duplicateChecker";

describe("Jobs Domain & Opportunities Unit Tests", () => {
  it("validates that all curated jobs in catalog have robust integrity", () => {
    expect(JOBS.length).toBeGreaterThanOrEqual(20);

    for (const job of JOBS) {
      expect(job.id).toBeDefined();
      expect(typeof job.id).toBe("string");
      expect(job.title).toBeDefined();
      expect(job.company).toBeDefined();
      expect(job.category).toBeDefined();
      expect(job.availability).toBeDefined();
      expect(job.salary).toBeDefined();
      expect(job.description).toBeDefined();
    }
  });

  it("detects job duplicates by URL or company title match", () => {
    const existing: Job[] = [
      {
        id: "job_upwork_1",
        title: "العمل الحر وتطوير الويب",
        titleEn: "Freelance Web Development",
        company: "Upwork",
        emoji: "💻",
        type: "remote",
        category: "programming",
        availability: { global: true, countries: [], restrictedCountries: [] },
        salary: { min: 20, max: 80, currency: "USD", period: "hour" },
        withdrawal: { minAmount: 10, currency: "USD", methods: [] },
        rating: { score: 4.8, totalReviews: 500, trustLevel: "high" },
        description: "منصة عمل حر",
        requirements: ["حاسوب"],
        skills: ["برمجة"],
        registrationGuide: { steps: [] },
        contact: { website: "https://www.upwork.com/freelance-jobs" },
        successStories: [],
        pros: ["دخل بالدولار"],
        cons: ["منافسة"],
      },
    ];

    const duplicateCheck = checkJobDuplicate(
      { contact: { website: "https://www.upwork.com/freelance-jobs" }, title: "وظيفة مطور" } as any,
      existing
    );
    expect(duplicateCheck.isDuplicate).toBe(true);

    const uniqueCheck = checkJobDuplicate(
      { contact: { website: "https://remoteok.com" }, title: "مهندس سحابي", company: "RemoteOK" } as any,
      existing
    );
    expect(uniqueCheck.isDuplicate).toBe(false);
  });
});
