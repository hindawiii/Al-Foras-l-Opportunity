import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Newspaper, Bookmark, User, Settings as SettingsIcon, Bell, Languages, Briefcase, GraduationCap } from "lucide-react";
import { BrandMark } from "@/components/foras/Logo";
import { SettingsSheet } from "@/components/foras/SettingsSheet";
import { NotificationsSheet } from "@/components/foras/NotificationsSheet";
import { AIAdvisor } from "@/components/foras/AIAdvisor";
import { UndoBanner } from "@/components/foras/UndoBanner";
import { AdminDashboardModal } from "@/components/foras/AdminDashboardModal";
import { ScholarshipsTab } from "./ScholarshipsTab";
import { EconomyNewsTab } from "./EconomyNewsTab";
import { ApplicationsTab } from "./ApplicationsTab";
import { ProfileTab } from "./ProfileTab";
import { JobsTab } from "./JobsTab";
import { ArabUniversitiesTab } from "./ArabUniversitiesTab";
import { useLiveNotifications } from "@/hooks/useLiveNotifications";
import { useGeoSync } from "@/hooks/useGeoSync";
import { useLanguage } from "@/contexts/LanguageContext";
import { notificationsStore } from "@/lib/notificationsStorage";
import { toast } from "sonner";

const tabs = [
  { id: "scholarships" as const, key: "tabScholarships", icon: Award, comp: ScholarshipsTab },
  { id: "jobs" as const, key: "tabJobs", icon: Briefcase, comp: JobsTab },
  { id: "news" as const, key: "tabNews", icon: Newspaper, comp: EconomyNewsTab },
  { id: "arabUnis" as const, key: "tabArabUnis", icon: GraduationCap, comp: ArabUniversitiesTab },
  { id: "applications" as const, key: "tabApplications", icon: Bookmark, comp: ApplicationsTab },
  { id: "profile" as const, key: "tabProfile", icon: User, comp: ProfileTab },
];

export const AppShell = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const getInitialTab = (): typeof tabs[number]["id"] => {
    const fromUrl = searchParams.get("tab");
    const normalizedUrl = (fromUrl === "arab_universities" || fromUrl === "universities") ? "arabUnis" : fromUrl;
    if (normalizedUrl && tabs.some(t => t.id === normalizedUrl)) {
      return normalizedUrl as typeof tabs[number]["id"];
    }
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("foras_last_active_tab");
      if (fromStorage && tabs.some(t => t.id === fromStorage)) {
        return fromStorage as typeof tabs[number]["id"];
      }
    }
    return "scholarships";
  };

  const [tab, setTab] = useState<typeof tabs[number]["id"]>(getInitialTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const Active = tabs.find(t => t.id === tab)!.comp;
  useLiveNotifications();
  useGeoSync();
  const { lang, toggleLang, t: tr } = useLanguage();

  const changeTab = (newTab: typeof tabs[number]["id"]) => {
    setTab(newTab);
    try {
      localStorage.setItem("foras_last_active_tab", newTab);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("tab", newTab);
        return next;
      }, { replace: true });
    } catch {}
  };

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested) {
      const normalized = (requested === "arab_universities" || requested === "universities") ? "arabUnis" : requested;
      if (tabs.some(t => t.id === normalized) && normalized !== tab) {
        setTab(normalized as typeof tabs[number]["id"]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent).detail as { tab?: string };
      if (!detail?.tab) return;
      const target = detail.tab === "arab_universities" || detail.tab === "universities" ? "arabUnis" : detail.tab;
      const match = tabs.find(t => t.id === target);
      if (match) changeTab(match.id);
    };
    window.addEventListener("foras:navigate", onNav as EventListener);
    return () => window.removeEventListener("foras:navigate", onNav as EventListener);
  }, []);

  useEffect(() => {
    const refresh = () => setUnread(notificationsStore.unreadCount(lang));
    refresh();
    const id = window.setInterval(refresh, 20_000);

    const onNotifsUpdated = () => refresh();
    window.addEventListener("foras:notifications-updated", onNotifsUpdated);
    window.addEventListener("foras:data-updated", onNotifsUpdated);

    const onAdminAlert = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.message) {
        toast.warning(
          lang === "ar" ? `🚨 تنبيه أمني وإشراف: ${detail.message}` : `🚨 Moderator Alert: ${detail.message}`,
          { duration: 6000 }
        );
      }
    };
    window.addEventListener("foras:admin-alert", onAdminAlert as EventListener);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("foras:notifications-updated", onNotifsUpdated);
      window.removeEventListener("foras:data-updated", onNotifsUpdated);
      window.removeEventListener("foras:admin-alert", onAdminAlert as EventListener);
    };
  }, [notifOpen, tab, lang]);

  useEffect(() => {
    const handleOpenAdmin = () => {
      setSettingsOpen(false);
      setAdminOpen(true);
    };
    window.addEventListener("foras:open-admin", handleOpenAdmin);
    return () => window.removeEventListener("foras:open-admin", handleOpenAdmin);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-primary/10">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-4 sm:px-5 py-2.5">
          <BrandMark size={90} />
          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className="h-11 px-3 rounded-xl bg-card border border-primary/20 hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
              aria-label="Toggle language">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">
                {lang === "ar" ? "EN" : "ع"}
              </span>
            </button>
            <button onClick={() => setNotifOpen(true)}
              className="relative w-11 h-11 rounded-xl bg-card border border-primary/20 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center"
              aria-label="الإشعارات">
              <Bell className="w-5 h-5 text-primary" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive ring-2 ring-card text-[10px] font-bold text-white flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <button onClick={() => setSettingsOpen(true)}
              className="w-11 h-11 rounded-xl bg-card border border-primary/20 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center"
              aria-label="الإعدادات">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-5 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full">
            <Active />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t border-primary/30"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      >
        <div className="max-w-2xl mx-auto grid grid-cols-6">
          {tabs.map(tabItem => {
            const Icon = tabItem.icon;
            const active = tab === tabItem.id;
            return (
              <button key={tabItem.id} onClick={() => changeTab(tabItem.id)}
                className="relative flex flex-col items-center gap-1 py-3 transition-colors">
                {active && (
                  <motion.div layoutId="activeTab"
                    className="absolute top-0 inset-x-4 h-0.5 bg-gold-gradient rounded-full" />
                )}
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {tr(tabItem.key)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onOpenAdmin={() => {
          setSettingsOpen(false);
          setAdminOpen(true);
        }}
      />
      <NotificationsSheet
        open={notifOpen}
        onOpenChange={(v) => {
          setNotifOpen(v);
          if (!v) {
            notificationsStore.markAllRead(lang);
            setUnread(0);
          }
        }}
      />
      <AIAdvisor />
      <UndoBanner />
      <AdminDashboardModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
};
