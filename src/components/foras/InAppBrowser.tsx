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
        className="bg-card border-gold/30 rounded-t-3xl p-0 h-[92vh] max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0" dir="rtl">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0 px-2">
            <p className="text-[12px] font-medium text-foreground truncate text-right">{title ?? "الموقع الرسمي"}</p>
            <p className="text-[10px] text-primary truncate" dir="ltr">{url}</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setBlockedHint(false);
              setReloadKey(k => k + 1);
            }}
            className="w-9 h-9 rounded-full bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
            aria-label="تحديث"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 h-9 rounded-full bg-gold-gradient flex items-center justify-center gap-1.5 shadow-gold text-primary-foreground text-xs font-bold active:scale-95 transition-transform"
            aria-label="فتح في المتصفح"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح بالمتصفح</span>
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
