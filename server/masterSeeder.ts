import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { SCHOLARSHIPS } from "../src/lib/mockData";
import { JOBS } from "../src/lib/jobsData";

/**
 * Master Cloud Seeder:
 * Ensures Firebase Firestore ('scholarships' & 'jobs' collections) and
 * 'data/opportunities_db.json' are synchronized with the complete, unified catalog.
 * Guarantees that every user device, phone, or browser receives the exact same items.
 */
export async function runMasterCloudSeeding(): Promise<{
  success: boolean;
  scholarshipsSeeded: number;
  jobsSeeded: number;
  message?: string;
}> {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);

    // 1. Load opportunities from data/opportunities_db.json
    const dbPath = path.join(process.cwd(), "data", "opportunities_db.json");
    let serverDb: any = { scholarships: [], jobs: [] };
    if (fs.existsSync(dbPath)) {
      try {
        serverDb = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      } catch (e) {
        console.warn("Could not read opportunities_db.json:", e);
      }
    }

    // 2. Prepare unified scholarships map
    const scholarshipMap = new Map<string, any>();
    // From mockData.ts
    (SCHOLARSHIPS || []).forEach((s) => {
      if (s && s.id) {
        scholarshipMap.set(s.id, {
          id: s.id,
          title: s.title || "منحة دراسية معتمدة",
          titleEn: s.titleEn || s.title || "Scholarship Opportunity",
          org: s.org || "جامعة معتمدة",
          country: s.country || "دولي",
          countryEn: s.countryEn || s.country || "International",
          flag: s.flag || "🌍",
          coverage: s.coverage || "full",
          amount: s.amount || (s.coverage === "full" ? "ممولة بالكامل" : "تمويل جزئي"),
          level: s.level || "بكالوريوس / ماجستير",
          category: s.category || "global",
          deadline: s.deadline || new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
          url: s.url || "#",
          tags: s.tags || ["منح"],
          interests: s.interests || [],
          description: s.description || "",
          descriptionEn: s.descriptionEn || "",
          is_featured: Boolean(s.is_featured),
          views_count: s.views_count || 120,
        });
      }
    });

    // From server opportunities_db.json
    (serverDb.scholarships || []).forEach((s: any) => {
      if (s && s.id) {
        scholarshipMap.set(s.id, {
          ...(scholarshipMap.get(s.id) || {}),
          ...s,
        });
      }
    });

    // 3. Prepare unified jobs map
    const jobsMap = new Map<string, any>();
    // From jobsData.ts
    (JOBS || []).forEach((j: any) => {
      if (j && j.id) {
        jobsMap.set(j.id, {
          id: j.id,
          title_ar: j.title || "فرصة عمل معتمدة",
          title_en: j.titleEn || j.title || "Verified Career Opportunity",
          company: j.company || "الجهة الموظفة",
          location: j.availability?.global ? "عن بُعد (عالمي)" : (j.region || "عالمي"),
          salary: j.salary?.average || `${j.salary?.min || 500} - ${j.salary?.max || 2500} ${j.salary?.currency || "$"}`,
          category: j.category || "programming",
          apply_url: j.contact?.website || "https://example.com",
          deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
          skills: j.skills || ["العمل الحر", "التواصل"],
          benefits_ar: j.pros || ["مرونة العمل من أي مكان", "دخل بالدولار الأمريكي"],
          description_ar: j.description || "",
          description_en: j.descriptionEn || "",
          verified: true,
          eligibility: {
            type: "global_remote",
            badgeAr: "🌐 متاح للعمل عن بُعد",
            badgeEn: "🌐 Remote Eligible Worldwide",
            reasonAr: "فرصة عمل عن بُعد متاحة للتقديم الرقمي للمؤهلين بدون قيود جغرافية.",
            reasonEn: "Remote position open for qualified applicants worldwide.",
            proofSourceUrl: j.contact?.website || "https://example.com",
            proofSourceNameAr: "بوابة التقديم الرسمية",
            proofSourceNameEn: "Official Opportunity Portal",
            targetCountries: ["GLOBAL"],
          },
        });
      }
    });

    // From server opportunities_db.json
    (serverDb.jobs || []).forEach((j: any) => {
      if (j && j.id) {
        jobsMap.set(j.id, {
          ...(jobsMap.get(j.id) || {}),
          ...j,
        });
      }
    });

    const unifiedScholarships = Array.from(scholarshipMap.values());
    const unifiedJobs = Array.from(jobsMap.values());

    console.log(
      `[Master Cloud Seeder] Uploading ${unifiedScholarships.length} scholarships and ${unifiedJobs.length} jobs to Firestore...`
    );

    // 4. Batch push to Firestore
    for (const sch of unifiedScholarships) {
      await setDoc(doc(db, "scholarships", sch.id), sch, { merge: true });
    }

    for (const job of unifiedJobs) {
      await setDoc(doc(db, "jobs", job.id), job, { merge: true });
    }

    // 5. Update opportunities_db.json on the server so /api/opportunities has full data
    serverDb.scholarships = unifiedScholarships;
    serverDb.jobs = unifiedJobs;
    serverDb.lastSeededAt = new Date().toISOString();
    fs.writeFileSync(dbPath, JSON.stringify(serverDb, null, 2), "utf-8");

    console.log(
      `[Master Cloud Seeder] SUCCESS! Firestore & server seeded: ${unifiedScholarships.length} scholarships, ${unifiedJobs.length} jobs.`
    );

    return {
      success: true,
      scholarshipsSeeded: unifiedScholarships.length,
      jobsSeeded: unifiedJobs.length,
      message: `تم مزامنة ${unifiedScholarships.length} منحة دراسية و ${unifiedJobs.length} فرصة عمل بنجاح على فايربيس وسيرفر المنصة.`,
    };
  } catch (error: any) {
    console.error("[Master Cloud Seeder] Error during seeding:", error);
    return {
      success: false,
      scholarshipsSeeded: 0,
      jobsSeeded: 0,
      message: error?.message || "Cloud seeding failed",
    };
  }
}
