// Feature Flags & Central Governance Store
// Manages global admin kill switches (e.g., Global Offline Mode)
// Synchronized via Firebase Firestore + LocalStorage fallback for zero-latency boot.

import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { adminAuthStore } from "./adminAuthStore";

export interface AppFeatureFlags {
  offlineModeGlobalEnabled: boolean;
  updatedAt?: string;
  updatedBy?: {
    id: string;
    name: string;
    email?: string;
  };
  notes?: string;
}

const GLOBAL_FLAG_KEY = "foras_global_offline_enabled";
const USER_FLAG_KEY = "foras_user_offline_enabled";
const SETTINGS_DOC_ID = "features";

let flagsUnsub: Unsubscribe | null = null;
let currentGlobalFlag: boolean = true;

// Initialize initial state from local cache
if (typeof window !== "undefined") {
  const cached = localStorage.getItem(GLOBAL_FLAG_KEY);
  if (cached !== null) {
    currentGlobalFlag = cached === "true";
  }
}

export const featureFlagsStore = {
  // Returns true if the admin has enabled offline mode globally
  isGlobalOfflineEnabled(): boolean {
    if (typeof window === "undefined") return true;
    const cached = localStorage.getItem(GLOBAL_FLAG_KEY);
    return cached !== null ? cached === "true" : currentGlobalFlag;
  },

  // Returns true if the current user has enabled offline mode for their own device
  isUserOfflineEnabled(): boolean {
    if (typeof window === "undefined") return true;
    const cached = localStorage.getItem(USER_FLAG_KEY);
    return cached !== null ? cached === "true" : true;
  },

  // Effective state: Enabled ONLY if BOTH admin allows it globally AND user hasn't turned it off
  isOfflineModeEffective(): boolean {
    return this.isGlobalOfflineEnabled() && this.isUserOfflineEnabled();
  },

  // User sets their personal preference
  setUserOfflineEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_FLAG_KEY, String(enabled));
    window.dispatchEvent(
      new CustomEvent("foras:feature-flags-updated", {
        detail: {
          global: this.isGlobalOfflineEnabled(),
          user: enabled,
          effective: this.isGlobalOfflineEnabled() && enabled,
        },
      })
    );
  },

  // Super Admin / Moderator flips the Master Kill Switch
  async setGlobalOfflineEnabled(
    enabled: boolean,
    admin?: { id: string; name: string; email?: string }
  ): Promise<void> {
    currentGlobalFlag = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem(GLOBAL_FLAG_KEY, String(enabled));
    }

    // Save to Firestore for global distribution to all connected users
    try {
      const docRef = doc(db, "app_settings", SETTINGS_DOC_ID);
      const payload: AppFeatureFlags = {
        offlineModeGlobalEnabled: enabled,
        updatedAt: new Date().toISOString(),
        updatedBy: admin || { id: "admin", name: "System Admin" },
        notes: enabled
          ? "Offline PWA browsing enabled platform-wide"
          : "Offline PWA browsing suspended platform-wide by admin",
      };
      await setDoc(docRef, payload, { merge: true });

      // Record in Admin Audit Log
      adminAuthStore.logAction(
        enabled ? "ENABLE_GLOBAL_OFFLINE" : "DISABLE_GLOBAL_OFFLINE",
        enabled ? "تفعيل نظام العمل دون اتصال لجميع المستخدمين" : "تعطيل نظام العمل دون اتصال لجميع المستخدمين",
        `تم تغيير حالة الميزة المركزية إلى: ${enabled ? "مفعّلة عالمياً" : "معطلة عالمياً"}`
      );
    } catch (err) {
      console.info("[FeatureFlags] Firestore sync note:", err);
    }

    // Broadcast change locally
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("foras:feature-flags-updated", {
          detail: {
            global: enabled,
            user: this.isUserOfflineEnabled(),
            effective: enabled && this.isUserOfflineEnabled(),
          },
        })
      );
    }
  },

  // Real-time listener for remote admin changes
  initSync(): void {
    if (typeof window === "undefined" || flagsUnsub) return;

    try {
      const docRef = doc(db, "app_settings", SETTINGS_DOC_ID);
      flagsUnsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as AppFeatureFlags;
            if (typeof data.offlineModeGlobalEnabled === "boolean") {
              const prev = currentGlobalFlag;
              currentGlobalFlag = data.offlineModeGlobalEnabled;
              localStorage.setItem(GLOBAL_FLAG_KEY, String(data.offlineModeGlobalEnabled));

              if (prev !== currentGlobalFlag) {
                window.dispatchEvent(
                  new CustomEvent("foras:feature-flags-updated", {
                    detail: {
                      global: currentGlobalFlag,
                      user: this.isUserOfflineEnabled(),
                      effective: currentGlobalFlag && this.isUserOfflineEnabled(),
                    },
                  })
                );
              }
            }
          } else {
            // First time bootstrap: create default doc with enabled = true
            setDoc(
              docRef,
              {
                offlineModeGlobalEnabled: true,
                updatedAt: new Date().toISOString(),
                notes: "Default bootstrap configuration",
              },
              { merge: true }
            ).catch(() => {});
          }
        },
        (err) => {
          console.info("[FeatureFlags] Realtime listener note:", err);
        }
      );
    } catch (e) {
      console.info("[FeatureFlags] Init error note:", e);
    }
  },
};
