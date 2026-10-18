import { useState, useEffect, useCallback, useRef } from "react";
import { dynamicStore } from "@/lib/dynamicStore";
import { featureFlagsStore } from "@/lib/featureFlagsStore";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  isSyncing: boolean;
  lastChanged: Date | null;
  isGlobalOfflineEnabled: boolean;
  isUserOfflineEnabled: boolean;
  isOfflineModeEffective: boolean;
  recheck: () => Promise<boolean>;
  clearWasOffline: () => void;
  setUserOfflineEnabled: (enabled: boolean) => void;
  setGlobalOfflineEnabled: (enabled: boolean, admin?: { id: string; name: string }) => Promise<void>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastChanged, setLastChanged] = useState<Date | null>(null);
  const [isGlobalOfflineEnabled, setIsGlobalOfflineEnabled] = useState<boolean>(() =>
    featureFlagsStore.isGlobalOfflineEnabled()
  );
  const [isUserOfflineEnabled, setIsUserOfflineEnabled] = useState<boolean>(() =>
    featureFlagsStore.isUserOfflineEnabled()
  );

  const isOfflineModeEffective = isGlobalOfflineEnabled && isUserOfflineEnabled;
  const isOnlineRef = useRef<boolean>(isOnline);
  isOnlineRef.current = isOnline;

  const triggerCloudSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await dynamicStore.syncWithCloud();
    } catch (err) {
      console.info("[Network] Auto-sync background note:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const recheck = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    try {
      // Lightweight health probe with 3s timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch("/api/health", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);

      const reachable = res.ok;
      setIsOnline(reachable);
      setLastChanged(new Date());

      if (reachable && !isOnlineRef.current) {
        setWasOffline(true);
        triggerCloudSync();
      }
      return reachable;
    } catch {
      // If server unreachable but browser says online, handle accordingly
      const status = typeof navigator !== "undefined" ? navigator.onLine : false;
      setIsOnline(status);
      return status;
    }
  }, [triggerCloudSync]);

  const clearWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  const setUserOfflineEnabled = useCallback((enabled: boolean) => {
    featureFlagsStore.setUserOfflineEnabled(enabled);
    setIsUserOfflineEnabled(enabled);
  }, []);

  const setGlobalOfflineEnabled = useCallback(
    async (enabled: boolean, admin?: { id: string; name: string }) => {
      await featureFlagsStore.setGlobalOfflineEnabled(enabled, admin);
      setIsGlobalOfflineEnabled(enabled);
    },
    []
  );

  useEffect(() => {
    featureFlagsStore.initSync();

    const handleFlagsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setIsGlobalOfflineEnabled(Boolean(detail.global));
        setIsUserOfflineEnabled(Boolean(detail.user));
      } else {
        setIsGlobalOfflineEnabled(featureFlagsStore.isGlobalOfflineEnabled());
        setIsUserOfflineEnabled(featureFlagsStore.isUserOfflineEnabled());
      }
    };

    window.addEventListener("foras:feature-flags-updated", handleFlagsUpdate);
    return () => {
      window.removeEventListener("foras:feature-flags-updated", handleFlagsUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setLastChanged(new Date());
      triggerCloudSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChanged(new Date());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [triggerCloudSync]);

  return {
    isOnline,
    wasOffline,
    isSyncing,
    lastChanged,
    isGlobalOfflineEnabled,
    isUserOfflineEnabled,
    isOfflineModeEffective,
    recheck,
    clearWasOffline,
    setUserOfflineEnabled,
    setGlobalOfflineEnabled,
  };
}
