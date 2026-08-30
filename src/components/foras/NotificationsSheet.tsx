import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { notificationsStore, relativeTime, type NotifKind } from "@/lib/notificationsStorage";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const META: Record<NotifKind, { icon: typeof Bell; color: string; ring: string }> = {
  deadline: { icon: CalendarClock, color: "text-destructive", ring: "border-destructive/30 bg-destructive/10" },
  match: { icon: Sparkles, color: "text-primary", ring: "border-primary/25 bg-primary/10" },
  status: { icon: CheckCheck, color: "text-verified", ring: "border-verified/30 bg-verified/10" },
  news: { icon: Newspaper, color: "text-review", ring: "border-review/30 bg-review/10" },
};

export const NotificationsSheet = ({ open, onOpenChange }: Props) => {
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [items, setItems] = useState(() => notificationsStore.list(lang));

  useEffect(() => {
    if (open) setItems(notificationsStore.list(lang));
  }, [open, lang]);

  const unread = items.filter((n) => !n.read).length;

  const goTab = (n: (typeof items)[number]) => {
    notificationsStore.markRead(n.id);
    setItems(notificationsStore.list(lang));
    if (n.actionTab) {
      window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: n.actionTab } }));
      onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        className="bg-card border-gold/30 w-[92%] sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle
            className={`text-gold-gradient font-display text-2xl ${alignClass} flex items-center gap-2 ${
              isRtl ? "justify-end" : "justify-start"
            }`}
          >
            <Bell className="w-5 h-5 text-primary" />
            {t("notifications")}
            {unread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/40 text-destructive">
                {unread}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={() => {
                    notificationsStore.markAllRead(lang);
                    setItems(notificationsStore.list(lang));
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-transparent border border-primary/30 text-primary text-xs hover:bg-primary/10 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t("markAllRead")}
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-transparent border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t("clearAllNotifs")}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/80 text-center flex items-center justify-center gap-1">
              <span>{t("notifSwipeHint")}</span>
            </p>
          </div>
        )}

        <div className="space-y-3 mt-4 pb-6">
          {items.length === 0 && (
            <div className="text-center py-16">
              <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">{t("noNotificationsYet")}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("notificationsEmptyHint")}
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {items.map((n) => {
              const meta = META[n.kind];
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
                    className={`w-full bg-card-gradient border rounded-2xl p-4 flex gap-3 transition-all cursor-pointer hover:border-primary/40 active:scale-[0.99] select-none ${
                      n.read ? "border-border opacity-70" : "border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.ring}`}
                    >
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div className={`flex-1 min-w-0 ${alignClass}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground text-sm mb-0.5 flex items-center gap-1.5 truncate">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block shrink-0" />}
                          <span className="truncate">{n.title}</span>
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(n.id);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                          title={isRtl ? "إزالة" : "Dismiss"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.body}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-primary font-medium">{relativeTime(n.ts, lang)}</span>
                        {n.url && (
                          <span
                            role="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(n.url!, "_blank", "noopener,noreferrer");
                            }}
                            className="text-xs text-primary/80 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" /> {t("source")}
                          </span>
                        )}
                        {n.actionTab && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
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