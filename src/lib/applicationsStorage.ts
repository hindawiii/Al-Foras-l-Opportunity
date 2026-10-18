import { guestStorage } from "./guestStorage";
import type { Scholarship } from "./mockData";
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export type AppStatus = "saved" | "applied" | "accepted" | "rejected";

export interface AppRecord {
  id: string;                // scholarship id
  title: string;
  org?: string;
  country?: string;
  deadline?: string;
  url?: string;
  status: AppStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  data?: Partial<Scholarship>;
}

const KEY = "applications";
let realtimeAppsUnsub: Unsubscribe | null = null;
let currentAuthUid: string | null = null;

// Initialize automatic cloud sync when user signs in or out
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentAuthUid = user.uid;
      // 1. Upload/migrate local guest items to user's Firestore account if needed
      const localList = applicationsStore.all();
      if (localList.length > 0) {
        localList.forEach((app) => {
          setDoc(doc(db, "users", user.uid, "applications", app.id), app, { merge: true }).catch(() => {});
        });
      }

      // 2. Setup real-time listener for user's applications
      if (realtimeAppsUnsub) {
        realtimeAppsUnsub();
        realtimeAppsUnsub = null;
      }

      try {
        realtimeAppsUnsub = onSnapshot(
          collection(db, "users", user.uid, "applications"),
          (snap) => {
            const appsMap = new Map<string, AppRecord>();
            const cached = guestStorage.get<AppRecord[]>(KEY, []) ?? [];
            cached.forEach((c) => { if (c && c.id) appsMap.set(c.id, c); });

            snap.docChanges().forEach((change) => {
              if (change.type === "removed") {
                appsMap.delete(change.doc.id);
              }
            });

            snap.forEach((d) => {
              const data = d.data() as AppRecord;
              if (data && data.id) {
                appsMap.set(data.id, data);
              }
            });

            const merged = Array.from(appsMap.values()).sort(
              (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );

            guestStorage.set(KEY, merged);
            window.dispatchEvent(new CustomEvent("foras:applications-updated"));
          },
          (err) => console.info("Firestore user applications listener note:", err)
        );
      } catch (subErr) {
        console.info("Firestore user applications subscription note:", subErr);
      }
    } else {
      currentAuthUid = null;
      if (realtimeAppsUnsub) {
        realtimeAppsUnsub();
        realtimeAppsUnsub = null;
      }
    }
  });
}

export const applicationsStore = {
  all(): AppRecord[] {
    return guestStorage.get<AppRecord[]>(KEY, []) ?? [];
  },

  save(rec: Omit<AppRecord, "createdAt" | "updatedAt"> & Partial<Pick<AppRecord, "createdAt" | "updatedAt">>) {
    const list = applicationsStore.all();
    const now = new Date().toISOString();
    const existing = list.find((x) => x.id === rec.id);
    let fullRecord: AppRecord;

    if (existing) {
      Object.assign(existing, rec, { updatedAt: now });
      fullRecord = existing;
    } else {
      fullRecord = { ...rec, createdAt: now, updatedAt: now };
      list.unshift(fullRecord);
    }

    guestStorage.set(KEY, list);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:applications-updated"));
    }

    // Persist to Cloud Firestore if user is authenticated
    const uid = auth.currentUser?.uid || currentAuthUid;
    if (uid) {
      try {
        setDoc(doc(db, "users", uid, "applications", fullRecord.id), fullRecord, { merge: true })
          .catch((err) => console.warn("Firestore save app note:", err));
      } catch (err) {
        console.warn("Firestore save app write note:", err);
      }
    }

    return list;
  },

  upsert(rec: Omit<AppRecord, "createdAt" | "updatedAt"> & Partial<Pick<AppRecord, "createdAt" | "updatedAt">> & Record<string, any>) {
    return applicationsStore.save(rec as any);
  },

  isSaved(id: string): boolean {
    return applicationsStore.all().some((x) => x.id === id);
  },

  get(id: string): AppRecord | undefined {
    return applicationsStore.all().find((x) => x.id === id);
  },

  upsertFromScholarship(s: Scholarship, status: AppStatus = "saved", extra?: Partial<AppRecord>) {
    return applicationsStore.save({
      id: s.id,
      title: s.title,
      org: (s as any).org,
      country: (s as any).country,
      deadline: (s as any).deadline,
      url: (s as any).url ?? (s as any).sourceUrl,
      status,
      data: s,
      ...extra,
    });
  },

  setStatus(id: string, status: AppStatus) {
    const list = applicationsStore.all();
    const r = list.find((x) => x.id === id);
    if (r) {
      const now = new Date().toISOString();
      r.status = status;
      r.updatedAt = now;
      guestStorage.set(KEY, list);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("foras:applications-updated"));
      }

      const uid = auth.currentUser?.uid || currentAuthUid;
      if (uid) {
        try {
          setDoc(doc(db, "users", uid, "applications", id), { status, updatedAt: now }, { merge: true })
            .catch(() => {});
        } catch {}
      }
    }
    return list;
  },

  setNotes(id: string, notes: string) {
    const list = applicationsStore.all();
    const r = list.find((x) => x.id === id);
    if (r) {
      const now = new Date().toISOString();
      r.notes = notes;
      r.updatedAt = now;
      guestStorage.set(KEY, list);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("foras:applications-updated"));
      }

      const uid = auth.currentUser?.uid || currentAuthUid;
      if (uid) {
        try {
          setDoc(doc(db, "users", uid, "applications", id), { notes, updatedAt: now }, { merge: true })
            .catch(() => {});
        } catch {}
      }
    }
    return list;
  },

  remove(id: string) {
    const list = applicationsStore.all().filter((x) => x.id !== id);
    guestStorage.set(KEY, list);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:applications-updated"));
    }

    const uid = auth.currentUser?.uid || currentAuthUid;
    if (uid) {
      try {
        deleteDoc(doc(db, "users", uid, "applications", id)).catch(() => {});
      } catch {}
    }
    return list;
  },

  removeBatch(ids: string[]) {
    const set = new Set(ids);
    const list = applicationsStore.all().filter((x) => !set.has(x.id));
    guestStorage.set(KEY, list);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:applications-updated"));
    }

    const uid = auth.currentUser?.uid || currentAuthUid;
    if (uid) {
      try {
        ids.forEach((id) => {
          deleteDoc(doc(db, "users", uid, "applications", id)).catch(() => {});
        });
      } catch {}
    }
    return list;
  },

  restore(rec: AppRecord) {
    const list = applicationsStore.all();
    if (!list.some((x) => x.id === rec.id)) {
      list.unshift(rec);
      guestStorage.set(KEY, list);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("foras:applications-updated"));
      }

      const uid = auth.currentUser?.uid || currentAuthUid;
      if (uid) {
        try {
          setDoc(doc(db, "users", uid, "applications", rec.id), rec, { merge: true }).catch(() => {});
        } catch {}
      }
    }
    return list;
  },

  restoreBatch(recs: AppRecord[]) {
    const list = applicationsStore.all();
    const existingIds = new Set(list.map((x) => x.id));
    const toAdd = recs.filter((r) => !existingIds.has(r.id));
    if (toAdd.length > 0) {
      const merged = [...toAdd, ...list];
      guestStorage.set(KEY, merged);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("foras:applications-updated"));
      }

      const uid = auth.currentUser?.uid || currentAuthUid;
      if (uid) {
        try {
          toAdd.forEach((rec) => {
            setDoc(doc(db, "users", uid, "applications", rec.id), rec, { merge: true }).catch(() => {});
          });
        } catch {}
      }
      return merged;
    }
    return list;
  },

  clear() {
    guestStorage.set(KEY, []);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("foras:applications-updated"));
    }
  },
};
