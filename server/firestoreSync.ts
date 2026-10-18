import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  writeBatch,
  getDoc,
  Firestore,
} from "firebase/firestore";
import fs from "fs";
import path from "path";

// Load configuration safely
let dbInstance: Firestore | null = null;

function getFirestoreInstance(): Firestore | null {
  if (dbInstance) return dbInstance;
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("[FirestoreSync] firebase-applet-config.json not found.");
      return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    dbInstance = config.firestoreDatabaseId
      ? getFirestore(app, config.firestoreDatabaseId)
      : getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.error("[FirestoreSync] Initialization error:", err);
    return null;
  }
}

/**
 * Clean temporary test documents if present
 */
export async function cleanTestDoc(): Promise<void> {
  const db = getFirestoreInstance();
  if (!db) return;
  try {
    await deleteDoc(doc(db, "scholarships", "_sync_test"));
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Check if Cloud Firestore is connected and reachable
 */
export async function isFirestoreConnected(): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db) return false;
  try {
    const testDoc = await getDoc(doc(db, "scholarships", "turkiye-burslari-2026"));
    return true;
  } catch (err: any) {
    if (err?.message?.includes("client is offline")) {
      return false;
    }
    // Any other response means Firestore server responded
    return true;
  }
}

/**
 * Synchronize a single scholarship directly to Firestore
 */
export async function syncScholarshipToFirestore(scholarship: any): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !scholarship || !scholarship.id) return false;

  try {
    const ref = doc(db, "scholarships", scholarship.id);
    const payload = {
      ...scholarship,
      id: scholarship.id,
      title: scholarship.title || scholarship.title_ar || "منحة معتمدة",
      titleEn: scholarship.titleEn || scholarship.title_en || scholarship.title || "",
      org: scholarship.org || scholarship.university || "جامعة معتمدة",
      country: scholarship.country || "دولي",
      flag: scholarship.flag || "🌍",
      coverage: scholarship.coverage || (scholarship.amount?.includes("كامل") ? "full" : "partial"),
      category: scholarship.category || "global",
      deadline: scholarship.deadline || "2026-12-31",
      description: scholarship.description || scholarship.description_ar || "",
      descriptionEn: scholarship.descriptionEn || scholarship.description_en || "",
      url: scholarship.url || scholarship.apply_url || scholarship.official_website || "#",
      is_featured: !!scholarship.is_featured,
      updated_at: new Date().toISOString(),
      syncedWithCloud: true,
    };

    await setDoc(ref, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to sync scholarship ${scholarship.id}:`, err);
    return false;
  }
}

/**
 * Synchronize a single job directly to Firestore
 */
export async function syncJobToFirestore(job: any): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !job || !job.id) return false;

  try {
    const ref = doc(db, "jobs", job.id);
    const payload = {
      ...job,
      id: job.id,
      title_ar: job.title_ar || job.title || "وظيفة جديدة",
      title_en: job.title_en || job.titleEn || "",
      company: job.company || "شركة معتمدة",
      location: job.location || "عن بُعد",
      salary: job.salary || "تحدد بعد المقابلة",
      description_ar: job.description_ar || job.description || "",
      description_en: job.description_en || job.descriptionEn || "",
      apply_url: job.apply_url || job.url || "#",
      deadline: job.deadline || "2026-12-31",
      category: job.category || "عام",
      verified: job.verified !== false,
      updated_at: new Date().toISOString(),
      syncedWithCloud: true,
    };

    await setDoc(ref, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to sync job ${job.id}:`, err);
    return false;
  }
}

/**
 * Delete / Remove scholarship from Firestore
 */
export async function removeScholarshipFromFirestore(id: string): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !id) return false;
  try {
    await deleteDoc(doc(db, "scholarships", id));
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to remove scholarship ${id}:`, err);
    return false;
  }
}

/**
 * Delete / Remove job from Firestore
 */
export async function removeJobFromFirestore(id: string): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !id) return false;
  try {
    await deleteDoc(doc(db, "jobs", id));
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to remove job ${id}:`, err);
    return false;
  }
}

/**
 * Synchronize a university directly to Firestore
 */
export async function syncUniversityToFirestore(uni: any): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !uni || !uni.id) return false;

  try {
    const ref = doc(db, "universities", uni.id);
    const payload = {
      ...uni,
      id: uni.id,
      name: uni.name || "جامعة معتمدة",
      nameEn: uni.nameEn || uni.name || "",
      country: uni.country || "دولي",
      flag: uni.flag || "🏛️",
      city: uni.city || "المدينة الرئيسية",
      type: uni.type || "government",
      website: uni.website || "#",
      minPercentage: Number(uni.minPercentage) || 70,
      updated_at: new Date().toISOString(),
      syncedWithCloud: true,
    };

    await setDoc(ref, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to sync university ${uni.id}:`, err);
    return false;
  }
}

/**
 * Delete / Remove university from Firestore
 */
export async function removeUniversityFromFirestore(id: string): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !id) return false;
  try {
    await deleteDoc(doc(db, "universities", id));
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to remove university ${id}:`, err);
    return false;
  }
}

/**
 * Archive opportunity in Cloud Archive collection
 */
export async function archiveOpportunityInFirestore(archivedItem: any): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !archivedItem || !archivedItem.id) return false;
  try {
    await setDoc(doc(db, "archived_opportunities", archivedItem.id), {
      ...archivedItem,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to archive ${archivedItem.id}:`, err);
    return false;
  }
}

/**
 * Batch synchronize all scholarships and jobs into Firestore
 */
export async function syncAllOpportunitiesToFirestore(
  scholarships: any[],
  jobs: any[]
): Promise<{ scholarshipsCount: number; jobsCount: number; error?: string }> {
  const db = getFirestoreInstance();
  if (!db) {
    return { scholarshipsCount: 0, jobsCount: 0, error: "قاعدة بيانات Firestore غير متصلة بالسيرفر." };
  }

  let schCount = 0;
  let jobCount = 0;

  try {
    // Process scholarships in chunks of 20
    const chunkSize = 20;
    for (let i = 0; i < scholarships.length; i += chunkSize) {
      const chunk = scholarships.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (item) => {
          const ok = await syncScholarshipToFirestore(item);
          if (ok) schCount++;
        })
      );
    }

    // Process jobs in chunks of 20
    for (let i = 0; i < jobs.length; i += chunkSize) {
      const chunk = jobs.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (item) => {
          const ok = await syncJobToFirestore(item);
          if (ok) jobCount++;
        })
      );
    }

    console.log(`[FirestoreSync] Full sync completed: ${schCount} scholarships, ${jobCount} jobs pushed to Firestore.`);
    return { scholarshipsCount: schCount, jobsCount: jobCount };
  } catch (err: any) {
    console.error("[FirestoreSync] Error in batch sync:", err);
    return { scholarshipsCount: schCount, jobsCount: jobCount, error: err?.message };
  }
}

/**
 * Synchronize a broadcast notification directly to Firestore
 */
export async function syncNotificationToFirestore(notif: any): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !notif || !notif.id) return false;

  try {
    const ref = doc(db, "notifications", notif.id);
    const payload = {
      ...notif,
      ts: notif.ts || Date.now(),
      source: "cloud",
      isBroadcast: true,
      syncedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to sync notification ${notif.id}:`, err);
    return false;
  }
}

/**
 * Delete a notification from Firestore
 */
export async function removeNotificationFromFirestore(id: string): Promise<boolean> {
  const db = getFirestoreInstance();
  if (!db || !id) return false;
  try {
    await deleteDoc(doc(db, "notifications", id));
    return true;
  } catch (err) {
    console.error(`[FirestoreSync] Failed to remove notification ${id}:`, err);
    return false;
  }
}
