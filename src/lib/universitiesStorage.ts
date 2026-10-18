import { guestStorage } from "./guestStorage";
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export interface SavedUniRecord {
  id: string;
  name: string;
  nameEn?: string;
  country: string;
  countryEn?: string;
  flag: string;
  website?: string;
  type?: string;
  savedAt: string;
}

const SAVED_UNIS_KEY = "savedUniversities";
const UNIS_METADATA_KEY = "savedUniversitiesMeta";

let realtimeUnisUnsub: Unsubscribe | null = null;
let currentAuthUid: string | null = null;

// Initialize automatic cloud sync when user signs in or out
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentAuthUid = user.uid;

      // 1. Upload local guest saved universities to user's Firestore account
      const localIds = universitiesStore.savedIds();
      const localMeta = universitiesStore.getMetadataMap();

      if (localIds.length > 0) {
        localIds.forEach((id) => {
          const meta = localMeta[id] || {};
          setDoc(
            doc(db, "users", user.uid, "saved_universities", id),
            {
              id,
              ...meta,
              savedAt: meta.savedAt || new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.info("Firestore university sync notice:", e));
        });
      }

      // 2. Setup real-time listener for user's saved universities across devices
      if (realtimeUnisUnsub) {
        realtimeUnisUnsub();
        realtimeUnisUnsub = null;
      }

      try {
        realtimeUnisUnsub = onSnapshot(
          collection(db, "users", user.uid, "saved_universities"),
          (snap) => {
            const remoteIds: string[] = [];
            const remoteMeta: Record<string, SavedUniRecord> = {};

            snap.forEach((d) => {
              const data = d.data() as SavedUniRecord;
              const uniId = d.id || data.id;
              if (uniId) {
                remoteIds.push(uniId);
                remoteMeta[uniId] = {
                  id: uniId,
                  name: data.name || uniId,
                  nameEn: data.nameEn,
                  country: data.country || "",
                  countryEn: data.countryEn,
                  flag: data.flag || "🏛️",
                  website: data.website || "",
                  type: data.type,
                  savedAt: data.savedAt || new Date().toISOString(),
                };
              }
            });

            // Update cache and dispatch event for reactive UI update
            guestStorage.set(SAVED_UNIS_KEY, remoteIds);
            guestStorage.set(UNIS_METADATA_KEY, remoteMeta);
            window.dispatchEvent(new CustomEvent("foras:universities-saved-updated"));
          },
          (err) => console.info("Firestore saved_universities listener note:", err)
        );
      } catch (subErr) {
        console.info("Firestore saved_universities subscription note:", subErr);
      }
    } else {
      currentAuthUid = null;
      if (realtimeUnisUnsub) {
        realtimeUnisUnsub();
        realtimeUnisUnsub = null;
      }
    }
  });
}

export const universitiesStore = {
  savedIds(): string[] {
    return guestStorage.get<string[]>(SAVED_UNIS_KEY, []) ?? [];
  },

  getMetadataMap(): Record<string, SavedUniRecord> {
    return guestStorage.get<Record<string, SavedUniRecord>>(UNIS_METADATA_KEY, {}) ?? {};
  },

  isSaved(id: string): boolean {
    return universitiesStore.savedIds().includes(id);
  },

  toggle(
    id: string,
    metadata?: Partial<Omit<SavedUniRecord, "id" | "savedAt">>
  ): boolean {
    const list = universitiesStore.savedIds();
    const metaMap = universitiesStore.getMetadataMap();
    const idx = list.indexOf(id);
    const willBeSaved = idx < 0;

    if (idx >= 0) {
      list.splice(idx, 1);
      delete metaMap[id];
    } else {
      list.unshift(id);
      metaMap[id] = {
        id,
        name: metadata?.name || id,
        nameEn: metadata?.nameEn,
        country: metadata?.country || "",
        countryEn: metadata?.countryEn,
        flag: metadata?.flag || "🏛️",
        website: metadata?.website || "",
        type: metadata?.type || "government",
        savedAt: new Date().toISOString(),
      };
    }

    guestStorage.set(SAVED_UNIS_KEY, list);
    guestStorage.set(UNIS_METADATA_KEY, metaMap);
    window.dispatchEvent(new CustomEvent("foras:universities-saved-updated"));

    // Real-time Cloud Firestore synchronization
    const uid = auth.currentUser?.uid || currentAuthUid;
    if (uid) {
      if (willBeSaved) {
        const record = metaMap[id];
        setDoc(
          doc(db, "users", uid, "saved_universities", id),
          record,
          { merge: true }
        ).catch((err) => console.warn("Failed to sync saved university to Firestore:", err));
      } else {
        deleteDoc(doc(db, "users", uid, "saved_universities", id)).catch((err) =>
          console.warn("Failed to delete saved university from Firestore:", err)
        );
      }
    }

    return willBeSaved;
  },
};
