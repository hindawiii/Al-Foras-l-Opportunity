import { useEffect, useState } from "react";
import { ExternalLink, X, RefreshCw, ShieldAlert, Globe } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Props {
  url: string | null;
  title?: string;
  onClose: () => void;
}

/**
 * In-app browser: tries to embed the official URL via <iframe>.
 * Many sites disable framing (X-Frame-Options/CSP), so we provide a
 * "Open externally" fallback button that opens in the system browser.
 */
export const InAppBrowser = ({ url, title, onClose }: Props) => {
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [blockedHint, setBlockedHint] = useState(false);

  useEffect(() => {
    if (url) {
      setLoading(true);
      setBlockedHint(false);
      setReloadKey(k => k + 1);
      // If iframe doesn't finish cleanly or might be blocked by CSP within 4s, show guidance
      const timer = setTimeout(() => {
        setBlockedHint(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [url]);

  if (!url) return null;

  return (
    <Sheet open={!!url} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        hideCloseButton
        className="bg-card border-primary/30 h-[100dvh] max-h-[100dvh] md:h-[95vh] md:max-h-[95vh] md:max-w-5xl md:rounded-3xl rounded-none p-0 overflow-hidden flex flex-col mx-auto shadow-2xl"
      >
        {/* Toolbar with Safe Spacing & Standard 44px Touch Targets */}
        <div className="flex items-center gap-2.5 p-3 sm:p-3.5 border-b border-border bg-card/95 backdrop-blur-md shrink-0" dir="rtl">
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-card border border-primary/30 hover:border-primary/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm text-foreground shrink-0"
            aria-label="إغلاق المتصفح"
            title="إغلاق المتصفح"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate text-right">{title ?? "الموقع الرسمي"}</p>
            <p className="text-[10px] sm:text-xs text-primary truncate" dir="ltr">{url}</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setBlockedHint(false);
              setReloadKey(k => k + 1);
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
            aria-label="تحديث"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 h-10 sm:h-11 rounded-xl bg-gold-gradient flex items-center justify-center gap-1.5 shadow-gold text-primary-foreground text-xs font-bold active:scale-95 transition-transform shrink-0"
            aria-label="فتح في المتصفح الخارجي"
            title="فتح في المتصفح الخارجي"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">فتح بالمتصفح</span>
          </a>
        </div>

        {/* Iframe Container */}
        <div className="relative flex-1 bg-background">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 z-10 gap-3">
              <RefreshCw className="w-7 h-7 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">جاري فتح الصفحة الرسمية...</p>
            </div>
          )}

          {blockedHint && (
            <div className="absolute top-3 inset-x-3 z-20 bg-background/95 border border-primary/40 rounded-xl p-3 shadow-lg flex items-center justify-between gap-2" dir="rtl">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  إذا لم تظهر الصفحة، فذلك بسبب سياسة أمان الموقع التي تفضل الفتح الخارجي.
                </p>
              </div>
              <Button asChild variant="luxe" size="sm" className="h-7 px-2.5 text-[11px] shrink-0">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  فتح الآن
                </a>
              </Button>
            </div>
          )}

          <iframe
            key={reloadKey}
            src={url}
            title={title ?? "official-site"}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setLoading(false)}
            referrerPolicy="no-referrer"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* Hint footer */}
        <div className="flex items-center gap-2 px-3 py-2 bg-background/80 border-t border-border text-[11px] text-muted-foreground" dir="rtl">
          <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="flex-1 leading-snug">
            تطبيق الفرص يضمن لك الوصول إلى المصادر والبوابات الرسمية المعتمدة دائماً.
          </span>
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10">
            <a href={url} target="_blank" rel="noopener noreferrer">نافذة جديدة</a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
