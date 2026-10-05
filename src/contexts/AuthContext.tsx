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
}

interface AuthCtx {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  firebaseUser: null,
  loading: true,
  isGuest: true,
  signInWithGoogle: async () => ({ success: false }),
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test initial connection silently on boot
    testFirebaseConnection().catch(() => {});

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Authenticated user
        let userDocData: any = null;
        try {
          const snap = await getDoc(doc(db, "users", fUser.uid));
          if (snap.exists()) {
            userDocData = snap.data();
          }
        } catch {
          // offline fallback
        }

        const appUser: AppUser = {
          id: fUser.uid,
          email: fUser.email,
          fullName: userDocData?.full_name || fUser.displayName || fUser.email?.split("@")[0] || "مستخدم",
          avatarUrl: userDocData?.avatar_url || fUser.photoURL || null,
          isGuest: false,
          role:
            (fUser.email === "alforas.one@gmail.com" || fUser.email === "mohsentiben@gmail.com")
              ? "admin"
              : (userDocData?.role || "user"),
        };
        setUser(appUser);
      } else {
        // Guest mode fallback
        const guest = buildGuestAppUser();
        setUser(guest);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
