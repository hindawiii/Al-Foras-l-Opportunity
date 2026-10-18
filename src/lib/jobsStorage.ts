import { guestStorage } from "./guestStorage";
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

const SAVED_KEY = "savedJobs";
const FILTERS_KEY = "jobFilters";

let realtimeJobsUnsub: Unsubscribe | null = null;
let currentAuthUid: string | null = null;

// Initialize automatic cloud sync when user signs in or out
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentAuthUid = user.uid;

      // 1. Upload local guest saved jobs to user's Firestore account
      const localIds = jobsStore.savedIds();
      if (localIds.length > 0) {
        localIds.forEach((id) => {
          setDoc(
            doc(db, "users", user.uid, "saved_jobs", id),
            { id, savedAt: new Date().toISOString() },
            { merge: true }
          ).catch((e) => console.info("Firestore job sync notice:", e));
        });
      }

      // 2. Setup real-time listener for user's saved jobs across devices
      if (realtimeJobsUnsub) {
        realtimeJobsUnsub();
        realtimeJobsUnsub = null;
      }

      try {
        realtimeJobsUnsub = onSnapshot(
          collection(db, "users", user.uid, "saved_jobs"),
          (snap) => {
            const remoteIds: string[] = [];
            snap.forEach((d) => {
              if (d.id) remoteIds.push(d.id);
            });

            // Update cache and dispatch event for reactive UI update
            guestStorage.set(SAVED_KEY, remoteIds);
            window.dispatchEvent(new CustomEvent("foras:jobs-saved-updated"));
          },
          (err) => console.info("Firestore saved_jobs listener note:", err)
        );
      } catch (subErr) {
        console.info("Firestore saved_jobs subscription note:", subErr);
      }
    } else {
      currentAuthUid = null;
      if (realtimeJobsUnsub) {
        realtimeJobsUnsub();
        realtimeJobsUnsub = null;
      }
    }
  });
}

export const jobsStore = {
  savedIds(): string[] {
    return guestStorage.get<string[]>(SAVED_KEY, []) ?? [];
  },

  isSaved(id: string): boolean {
    return jobsStore.savedIds().includes(id);
  },

  toggle(id: string): boolean {
    const list = jobsStore.savedIds();
    const idx = list.indexOf(id);
    const willBeSaved = idx < 0;

    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift(id);
    }

    guestStorage.set(SAVED_KEY, list);
    window.dispatchEvent(new CustomEvent("foras:jobs-saved-updated"));

    // Real-time Cloud Firestore synchronization
    const uid = auth.currentUser?.uid || currentAuthUid;
    if (uid) {
      if (willBeSaved) {
        setDoc(
          doc(db, "users", uid, "saved_jobs", id),
          { id, savedAt: new Date().toISOString() },
          { merge: true }
        ).catch((err) => console.warn("Failed to sync saved job to Firestore:", err));
      } else {
        deleteDoc(doc(db, "users", uid, "saved_jobs", id)).catch((err) =>
          console.warn("Failed to delete saved job from Firestore:", err)
        );
      }
    }

    return willBeSaved;
  },

  getFilters(): { country: string | null; category: string | null; onlyMyCountry: boolean } {
    return guestStorage.get(FILTERS_KEY, { country: null, category: null, onlyMyCountry: false }) as any;
  },

  setFilters(f: { country?: string | null; category?: string | null; onlyMyCountry?: boolean }) {
    const cur = jobsStore.getFilters();
    guestStorage.set(FILTERS_KEY, { ...cur, ...f });
  },
};
