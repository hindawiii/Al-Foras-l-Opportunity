import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Sparkles,
  CalendarClock,
  Newspaper,
  CheckCheck,
  BellOff,
  ExternalLink,
  ArrowRight,
  Trash2,
  X,
  Radio,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { notificationsStore, relativeTime, type NotifKind } from "@/lib/notificationsStorage";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const META: Record<NotifKind, { icon: typeof Bell; color: string; ring: string; labelAr: string; labelEn: string }> = {
  deadline: {
    icon: CalendarClock,
    color: "text-destructive",
    ring: "border-destructive/30 bg-destructive/10",
    labelAr: "المواعيد",
    labelEn: "Deadlines",
  },
  match: {
    icon: Sparkles,
    color: "text-primary",
    ring: "border-primary/25 bg-primary/10",
    labelAr: "منح مميزة",
    labelEn: "Grants",
  },
  status: {
    icon: CheckCheck,
    color: "text-emerald-400",
    ring: "border-emerald-400/30 bg-emerald-400/10",
    labelAr: "متابعة الطلبات",
    labelEn: "Status",
  },
  news: {
    icon: Newspaper,
    color: "text-blue-400",
    ring: "border-blue-400/30 bg-blue-400/10",
    labelAr: "وظائف وصروح",
    labelEn: "Jobs & Hubs",
  },
  broadcast: {
    icon: Radio,
    color: "text-amber-400",
    ring: "border-amber-400/30 bg-amber-400/10",
    labelAr: "تنبيهات عامة",
    labelEn: "Broadcasts",
  },
};

export const NotificationsSheet = ({ open, onOpenChange }: Props) => {
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [items, setItems] = useState(() => notificationsStore.list(lang));
  const [activeFilter, setActiveFilter] = useState<"all" | NotifKind>("all");

  useEffect(() => {
    if (open) {
      setItems(notificationsStore.list(lang));
    }
  }, [open, lang]);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(notificationsStore.list(lang));
    };
    window.addEventListener("foras:notifications-updated", handleUpdate);
    return () => window.removeEventListener("foras:notifications-updated", handleUpdate);
  }, [lang]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((n) => n.kind === activeFilter);
  }, [items, activeFilter]);

  const unread = items.filter((n) => !n.read).length;

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      // Exiting the notifications drawer: mark all read so the counter disappears
      notificationsStore.markAllRead(lang);
    }
    onOpenChange(v);
  };

  const goTab = (n: (typeof items)[number]) => {
    notificationsStore.markRead(n.id);
    setItems(notificationsStore.list(lang));
    if (n.actionTab) {
      window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: n.actionTab } }));
      handleOpenChange(false);
    }
  };

  const handleDismiss = (id: string) => {
    notificationsStore.dismiss(id);
    setItems(notificationsStore.list(lang));
  };

  const handleClearAll = () => {
    notificationsStore.clearAll(lang);
    setItems([]);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        className="bg-card border-gold/30 w-[92%] sm:max-w-md overflow-y-auto flex flex-col"
      >
        <SheetHeader className="pe-12 sm:pe-14 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle
              className={`text-gold-gradient font-display text-xl sm:text-2xl ${alignClass} flex items-center gap-2`}
            >
              <Bell className="w-5 h-5 text-primary shrink-0" />
              <span>{t("notifications")}</span>
              {unread > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/40 text-destructive">
                  {unread}
                </span>
              )}
            </SheetTitle>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">
              {isRtl ? "متزامن لحظياً مع Cloud Firestore" : "Live Firestore Sync"}
            </span>
          </div>
        </SheetHeader>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer h-9 ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow-gold"
                : "bg-card/70 border border-primary/20 text-slate-300 hover:text-white"
            }`}
          >
            {isRtl ? "الكل" : "All"} ({items.length})
          </button>

          {(Object.keys(META) as NotifKind[]).map((kind) => {
            const m = META[kind];
            const count = items.filter((n) => n.kind === kind).length;
            if (count === 0 && activeFilter !== kind) return null;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveFilter(kind)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer h-9 flex items-center gap-1 ${
                  activeFilter === kind
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "bg-card/70 border border-primary/20 text-slate-300 hover:text-white"
                }`}
              >
                <span>{isRtl ? m.labelAr : m.labelEn}</span>
                <span className="opacity-75 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    notificationsStore.markAllRead(lang);
                    setItems(notificationsStore.list(lang));
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors h-10"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t("markAllRead")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors h-10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("clearAllNotifs")}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              <span>{t("notifSwipeHint")}</span>
            </p>
          </div>
        )}

        <div className="space-y-3 mt-3 pb-6 flex-1 overflow-y-auto scrollbar-thin">
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <BellOff className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-60" />
              <p className="text-sm text-foreground font-bold">{t("noNotificationsYet")}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t("notificationsEmptyHint")}
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredItems.map((n) => {
              const meta = META[n.kind] || META.broadcast;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, x: isRtl ? -200 : 200, transition: { duration: 0.2 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 400) {
                      handleDismiss(n.id);
                    }
                  }}
                  className="relative group touch-pan-y"
                >
                  <div
                    onClick={() => goTab(n)}
                    className={`w-full bg-card/80 border rounded-2xl p-4 flex gap-3 transition-all cursor-pointer hover:border-primary/50 active:scale-[0.99] select-none ${
                      n.read ? "border-border/60 opacity-75" : "border-primary/40 shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.ring}`}
                    >
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div className={`flex-1 min-w-0 ${alignClass} space-y-1`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-foreground text-sm leading-tight flex items-center gap-1.5 truncate">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-destructive inline-block shrink-0 animate-pulse" />}
                          <span className="truncate">{n.title}</span>
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(n.id);
                          }}
                          className="text-slate-400 hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                          title={isRtl ? "إزالة" : "Dismiss"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{n.body}</p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap pt-1">
                        <span className="text-[11px] text-primary font-semibold">{relativeTime(n.ts, lang)}</span>

                        {n.source === "cloud" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                            {isRtl ? "سحابي" : "Cloud"}
                          </span>
                        )}

                        {n.url && (
                          <span
                            role="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(n.url!, "_blank", "noopener,noreferrer");
                            }}
                            className="text-[11px] text-primary/90 flex items-center gap-1 hover:underline cursor-pointer font-bold"
                          >
                            <ExternalLink className="w-3 h-3" /> {t("source")}
                          </span>
                        )}

                        {n.actionTab && (
                          <span className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                            {t("open")} <ArrowRight className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};