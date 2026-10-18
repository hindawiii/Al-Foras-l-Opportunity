import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, testFirebaseConnection } from "@/integrations/firebase/client";

export interface AppUser {
  id: string;
  email?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  isGuest: boolean;
  role?: "user" | "admin";
  bio?: string;
  education?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  interests?: string[];
  updatedAt?: string;
}

interface AuthCtx {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isGuest: boolean;
  isCloudSynced: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<AppUser> & Record<string, any>) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  firebaseUser: null,
  loading: true,
  isGuest: true,
  isCloudSynced: false,
  signInWithGoogle: async () => ({ success: false }),
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  updateUserProfile: async () => false,
  signOut: async () => {},
});

const getOrCreateGuestId = (): string => {
  let id = localStorage.getItem("guest_id");
  if (!id) {
    id = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("guest_id", id);
    localStorage.setItem("guest_created", new Date().toISOString());
  }
  return id;
};

const buildGuestAppUser = (): AppUser => {
  const id = getOrCreateGuestId();
  return {
    id,
    email: null,
    fullName: "ضيف",
    isGuest: true,
    role: "user",
  };
};

/**
 * Migrates local guest data into user's authenticated Cloud Firestore account
 */
async function migrateGuestDataToCloud(uid: string): Promise<void> {
  if (typeof window === "undefined" || !uid) return;
  try {
    const { guestStorage } = await import("@/lib/guestStorage");
    const { applicationsStore } = await import("@/lib/applicationsStorage");
    const { jobsStore } = await import("@/lib/jobsStorage");
    const { universitiesStore } = await import("@/lib/universitiesStorage");

    // 1. Migrate applications
    const apps = applicationsStore.all();
    if (apps.length > 0) {
      await Promise.all(
        apps.map((app) =>
          setDoc(doc(db, "users", uid, "applications", app.id), app, { merge: true }).catch(() => {})
        )
      );
    }

    // 2. Migrate saved jobs
    const jobs = jobsStore.savedIds();
    if (jobs.length > 0) {
      await Promise.all(
        jobs.map((jobId) =>
          setDoc(
            doc(db, "users", uid, "saved_jobs", jobId),
            { id: jobId, savedAt: new Date().toISOString() },
            { merge: true }
          ).catch(() => {})
        )
      );
    }

    // 3. Migrate saved universities
    const unis = universitiesStore.savedIds();
    const metaMap = universitiesStore.getMetadataMap();
    if (unis.length > 0) {
      await Promise.all(
        unis.map((uniId) => {
          const meta = metaMap[uniId] || {};
          return setDoc(
            doc(db, "users", uid, "saved_universities", uniId),
            { id: uniId, ...meta, savedAt: meta.savedAt || new Date().toISOString() },
            { merge: true }
          ).catch(() => {});
        })
      );
    }

    // 4. Migrate local guest profile & extras if present
    const localProfile = guestStorage.get<any>("profile", null);
    const localExtras = guestStorage.get<any>("foras_profile_extras_v1", null);
    if (localProfile || localExtras) {
      await setDoc(
        doc(db, "users", uid),
        {
          ...(localProfile || {}),
          profile_extras: localExtras || {},
          migrated_from_guest: true,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }
  } catch (err) {
    console.warn("Guest data migration notice:", err);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  useEffect(() => {
    // Test initial connection silently on boot
    testFirebaseConnection().catch(() => {});

    let profileDocUnsub: (() => void) | null = null;

    // Listen to Firebase auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);

      // Clean up previous profile doc listener
      if (profileDocUnsub) {
        profileDocUnsub();
        profileDocUnsub = null;
      }

      if (fUser) {
        // Authenticated user: Setup real-time listener for their profile doc
        const { onSnapshot } = await import("firebase/firestore");

        profileDocUnsub = onSnapshot(
          doc(db, "users", fUser.uid),
          (snap) => {
            const userDocData = snap.data();
            const isAdminEmail =
              fUser.email === "alforas.one@gmail.com" || fUser.email === "mohsentiben@gmail.com";

            const appUser: AppUser = {
              id: fUser.uid,
              email: fUser.email,
              fullName: userDocData?.full_name || userDocData?.fullName || fUser.displayName || fUser.email?.split("@")[0] || "مستخدم",
              avatarUrl: userDocData?.avatar_url || userDocData?.avatarUrl || fUser.photoURL || null,
              isGuest: false,
              role: isAdminEmail ? "admin" : (userDocData?.role || "user"),
              bio: userDocData?.bio || "",
              education: userDocData?.education || "",
              location: userDocData?.location || "",
              phone: userDocData?.phone || "",
              skills: userDocData?.skills || [],
              interests: userDocData?.interests || [],
              updatedAt: userDocData?.updated_at || userDocData?.updatedAt,
            };

            setUser(appUser);
            setIsCloudSynced(true);
            setLoading(false);

            if (userDocData?.profile_extras) {
              import("@/lib/profileExtras").then(({ profileExtras }) => {
                profileExtras.save(userDocData.profile_extras).catch(() => {});
              });
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("foras:profile-updated", { detail: { userDocData } }));
            }
          },
          (err) => {
            console.info("Firestore profile listener note:", err);
            // Fallback user state if listener errors
            setUser({
              id: fUser.uid,
              email: fUser.email,
              fullName: fUser.displayName || fUser.email?.split("@")[0] || "مستخدم",
              avatarUrl: fUser.photoURL || null,
              isGuest: false,
              role:
                (fUser.email === "alforas.one@gmail.com" || fUser.email === "mohsentiben@gmail.com")
                  ? "admin"
                  : "user",
            });
            setIsCloudSynced(false);
            setLoading(false);
          }
        );

        // Perform guest migration asynchronously
        migrateGuestDataToCloud(fUser.uid);
      } else {
        // Guest mode fallback
        const guest = buildGuestAppUser();
        setUser(guest);
        setIsCloudSynced(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (profileDocUnsub) profileDocUnsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        // Sync profile to firestore
        try {
          await setDoc(
            doc(db, "users", res.user.uid),
            {
              id: res.user.uid,
              email: res.user.email,
              full_name: res.user.displayName || "مستخدم",
              avatar_url: res.user.photoURL || "",
              updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {}
      }
      return { success: true };
    } catch (e: any) {
      console.error("[Firebase Auth] Google error:", e);
      return { success: false, error: e?.message || "Google sign-in failed" };
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (e: any) {
      console.error("[Firebase Auth] Email sign-in error:", e);
      return { success: false, error: e?.message || "Invalid credentials" };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        try {
          await setDoc(
            doc(db, "users", res.user.uid),
            {
              id: res.user.uid,
              email: res.user.email,
              full_name: name,
              created_at: new Date().toISOString(),
              role: "user",
            },
            { merge: true }
          );
        } catch {}
      }
      return { success: true };
    } catch (e: any) {
      console.error("[Firebase Auth] Sign-up error:", e);
      return { success: false, error: e?.message || "Sign-up failed" };
    }
  };

  const updateUserProfile = async (data: Partial<AppUser> & Record<string, any>): Promise<boolean> => {
    if (!firebaseUser) return false;
    try {
      const payload = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", firebaseUser.uid), payload, { merge: true });
      return true;
    } catch (err) {
      console.warn("Failed to update user profile in Firestore:", err);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    // Reset guest identifiers
    localStorage.removeItem("guest_id");
    localStorage.removeItem("guest_created");
    localStorage.removeItem("user");
    setUser(buildGuestAppUser());
  };

  return (
    <Ctx.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isGuest: !firebaseUser,
        isCloudSynced,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        updateUserProfile,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
