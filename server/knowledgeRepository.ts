import { SCHOLARSHIPS, Scholarship } from "../src/lib/mockData";
import { JOBS, Job } from "../src/lib/jobsData";
import { ARAB_FLAGSHIP_ENRICHMENTS } from "../src/lib/arabFlagshipEnrichments";
import { GLOBAL_FLAGSHIP_ENRICHMENTS } from "../src/lib/globalFlagshipEnrichments";
import { opportunitiesDb } from "./opportunitiesDb";

export interface UnifiedOpportunity {
  id: string;
  type: "scholarship" | "job";
  title: string;
  titleEn?: string;
  org: string;
  country: string;
  category?: string;
  fundingOrSalary: string;
  levelOrType: string;
  deadline?: string;
  url: string;
  tags: string[];
  description?: string;
  benefits?: string[];
  requirements?: string[];
}

/**
 * Builds a unified, deduplicated catalog of all scholarships and jobs
 * combining static mock data, Arab & Global flagships, and live server database opportunities.
 */
export function getAllUnifiedOpportunities(): {
  scholarships: UnifiedOpportunity[];
  jobs: UnifiedOpportunity[];
} {
  const scholarshipsMap = new Map<string, UnifiedOpportunity>();
  const jobsMap = new Map<string, UnifiedOpportunity>();

  // 1. Static mockData scholarships
  for (const s of SCHOLARSHIPS) {
    if (!s || !s.title) continue;
    scholarshipsMap.set(s.id, {
      id: s.id,
      type: "scholarship",
      title: s.title,
      titleEn: s.titleEn,
      org: s.org || "جامعة معتمدة",
      country: s.country || "دولي",
      category: s.category || "global",
      fundingOrSalary: s.amount || (s.coverage === "full" ? "ممولة بالكامل 100%" : "تمويل جزئي"),
      levelOrType: s.level || "بكالوريوس / ماجستير / دكتوراه",
      deadline: s.deadline || "مستمر",
      url: s.url || "#",
      tags: s.tags || [],
      description: s.description,
    });
  }

  // 2. Arab Flagship enrichments
  for (const [key, val] of Object.entries(ARAB_FLAGSHIP_ENRICHMENTS)) {
    const sch = val.activeScholarship;
    if (!sch) continue;
    const id = `flagship-arab-${key}`;
    if (!scholarshipsMap.has(id)) {
      scholarshipsMap.set(id, {
        id,
        type: "scholarship",
        title: sch.name,
        titleEn: sch.nameEn,
        org: key.toUpperCase(),
        country: "العالم العربي",
        category: "arab",
        fundingOrSalary: sch.coverageSummary,
        levelOrType: "دراسات عليا / بكالوريوس",
        deadline: "سنوي ومستمر",
        url: "https://al-foras.org/scholarships",
        tags: ["منحة كبرى", "تمويل شامل", "جامعات عربية مرموقة"],
        description: sch.coverageSummary,
      });
    }
  }

  // 3. Global Flagship enrichments
  for (const [key, val] of Object.entries(GLOBAL_FLAGSHIP_ENRICHMENTS)) {
    const sch = val.activeScholarship;
    if (!sch) continue;
    const id = `flagship-global-${key}`;
    if (!scholarshipsMap.has(id)) {
      scholarshipsMap.set(id, {
        id,
        type: "scholarship",
        title: sch.name,
        titleEn: sch.nameEn,
        org: key,
        country: "دولي",
        category: "global",
        fundingOrSalary: sch.coverageSummary,
        levelOrType: "ماجستير ودكتوراه وبكالوريوس",
        deadline: "سنوي",
        url: "https://al-foras.org/scholarships",
        tags: ["منح حكومية عالمية", "تمويل كامل"],
        description: sch.coverageSummary,
      });
    }
  }

  // 4. Jobs dataset from jobsData.ts
  for (const j of JOBS) {
    if (!j || !j.title_ar) continue;
    jobsMap.set(j.id, {
      id: j.id,
      type: "job",
      title: j.title_ar,
      titleEn: j.title_en,
      org: j.company,
      country: j.location || "عن بعد (Remote)",
      category: j.category,
      fundingOrSalary: j.salary || "تنافسي",
      levelOrType: j.type || "دوام كامل / مرن",
      deadline: j.deadline || "مفتوح للتقديم",
      url: j.apply_url || "#",
      tags: j.skills || [],
      description: j.description_ar,
    });
  }

  // 5. Live Server DB opportunities (dynamically added / synced by admin)
  try {
    const dbData = opportunitiesDb.get();
    for (const s of dbData.scholarships || []) {
      if (!s || !s.title) continue;
      const id = s.id || `live-${Math.random()}`;
      scholarshipsMap.set(id, {
        id,
        type: "scholarship",
        title: s.title,
        titleEn: s.titleEn,
        org: s.org || (s as any).university || "جهة مانحة رسمية",
        country: s.country || "دولي",
        category: s.category || "global",
        fundingOrSalary: s.amount || (s as any).stipend || (s.coverage === "full" ? "ممولة بالكامل 100%" : "تمويل جزئي"),
        levelOrType: s.level || (s as any).degree || "كافة الدرجات",
        deadline: s.deadline || "مستمر",
        url: s.url || (s as any).apply_url || (s as any).official_website || "#",
        tags: s.tags || (s as any).majors || [],
        description: s.description || (s as any).description_ar,
        benefits: s.benefits || (s as any).benefits_ar,
        requirements: s.requirements || (s as any).requirements_ar,
      });
    }

    for (const j of dbData.jobs || []) {
      if (!j || !j.title_ar) continue;
      const id = j.id || `live-job-${Math.random()}`;
      jobsMap.set(id, {
        id,
        type: "job",
        title: j.title_ar,
        titleEn: j.title_en,
        org: j.company,
        country: j.location || "عن بعد",
        category: j.category,
        fundingOrSalary: j.salary || "تنافسي",
        levelOrType: j.type || "عمل عن بعد / حر",
        deadline: j.deadline || "مستمر",
        url: j.apply_url || "#",
        tags: j.skills || [],
        description: j.description_ar,
        benefits: j.benefits_ar,
      });
    }
  } catch (err) {
    console.warn("Could not merge dynamic server opportunities:", err);
  }

  return {
    scholarships: Array.from(scholarshipsMap.values()),
    jobs: Array.from(jobsMap.values()),
  };
}

/**
 * Intelligent context builder that selects the most relevant opportunities
 * based on user messages and user profile, plus provides a broad grounding catalog.
 */
export function buildAdvisorGroundingContext(
  messages: { role: string; content: string }[],
  userProfile?: any
): {
  scholarshipsText: string;
  jobsText: string;
  totalScholarships: number;
  totalJobs: number;
} {
  const { scholarships, jobs } = getAllUnifiedOpportunities();

  // Combine recent user queries for semantic weighting
  const userText = messages
    .filter(m => m.role === "user")
    .map(m => m.content)
    .join(" ")
    .toLowerCase();

  const profileText = userProfile
    ? `${userProfile.major || ""} ${userProfile.target_country || ""} ${(userProfile.skills || []).join(" ")}`.toLowerCase()
    : "";

  const fullQuery = `${userText} ${profileText}`;

  // Score each scholarship based on relevance to query
  const scoredSch = scholarships.map(s => {
    let score = 0;
    const combined = `${s.title} ${s.titleEn || ""} ${s.org} ${s.country} ${s.tags.join(" ")} ${s.description || ""}`.toLowerCase();
    
    // Country keywords match
    const words = fullQuery.split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      if (combined.includes(w)) score += 3;
    }
    // High priority flagships
    if (s.id.includes("chevening") || s.id.includes("fulbright") || s.id.includes("daad") || s.id.includes("turkiye")) {
      score += 2;
    }
    return { item: s, score };
  });

  scoredSch.sort((a, b) => b.score - a.score);

  // Score each job based on relevance
  const scoredJobs = jobs.map(j => {
    let score = 0;
    const combined = `${j.title} ${j.titleEn || ""} ${j.org} ${j.country} ${j.tags.join(" ")} ${j.description || ""}`.toLowerCase();
    const words = fullQuery.split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      if (combined.includes(w)) score += 3;
    }
    return { item: j, score };
  });

  scoredJobs.sort((a, b) => b.score - a.score);

  // Take top 40 most relevant scholarships and top 35 most relevant jobs for prompt injection
  const topSch = scoredSch.slice(0, 45).map(x => x.item);
  const topJobs = scoredJobs.slice(0, 35).map(x => x.item);

  const scholarshipsText = topSch.map(s => (
    `• [${s.title}] (${s.titleEn || ""}) | الجهة: ${s.org} | الدولة: ${s.country} | التمويل: ${s.fundingOrSalary} | الدرجة: ${s.levelOrType} | الموعد: ${s.deadline || "مستمر"} | الرابط الرسمي: ${s.url} | التخصصات: ${s.tags.join(", ")}`
  )).join("\n");

  const jobsText = topJobs.map(j => (
    `• [${j.title}] (${j.titleEn || ""}) | الشركة: ${j.org} | النطاق: ${j.country} | المقابل: ${j.fundingOrSalary} | المهارات: ${j.tags.join(", ")} | رابط التقديم: ${j.url}`
  )).join("\n");

  return {
    scholarshipsText,
    jobsText,
    totalScholarships: scholarships.length,
    totalJobs: jobs.length,
  };
}
