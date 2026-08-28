import { useEffect, useState } from "react";
import { Bell, Sparkles, CalendarClock, Newspaper, CheckCheck, BellOff, ExternalLink, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { notificationsStore, relativeTime, type NotifKind } from "@/lib/notificationsStorage";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

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

  useEffect(() => { if (open) setItems(notificationsStore.list(lang)); }, [open, lang]);

  const unread = items.filter(n => !n.read).length;

  const goTab = (n: (typeof items)[number]) => {
    notificationsStore.markRead(n.id);
    setItems(notificationsStore.list(lang));
    if (n.actionTab) {
      window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: n.actionTab } }));
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isRtl ? "left" : "right"} className="bg-card border-gold/30 w-[88%] sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className={`text-gold-gradient font-display text-2xl ${alignClass} flex items-center gap-2 ${isRtl ? "justify-end" : "justify-start"}`}>
            <Bell className="w-5 h-5 text-primary" />
            {t("notifications")}
            {unread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/20 border border-destructive/40 text-destructive">
                {unread}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {unread > 0 && (
          <button
            onClick={() => { notificationsStore.markAllRead(lang); setItems(notificationsStore.list(lang)); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-transparent border border-primary/30 text-primary text-xs hover:bg-primary/10 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {t("markAllRead")}
          </button>
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

          {items.map(n => {
            const meta = META[n.kind];
            const Icon = meta.icon;
            return (
              <button
                key={n.id}
                onClick={() => goTab(n)}
                className={`w-full bg-card-gradient border rounded-2xl p-4 flex gap-3 transition-colors hover:border-primary/40 ${n.read ? "border-border opacity-70" : "border-primary/30"}`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.ring}`}>
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className={`flex-1 ${alignClass}`}>
                  <p className="font-medium text-foreground text-sm mb-0.5 flex items-center gap-1.5">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />}
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-primary">{relativeTime(n.ts, lang)}</span>
                    {n.url && (
                      <span
                        role="link"
                        onClick={(e) => { e.stopPropagation(); window.open(n.url!, "_blank", "noopener,noreferrer"); }}
                        className="text-xs text-primary/80 flex items-center gap-1 hover:underline"
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
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};