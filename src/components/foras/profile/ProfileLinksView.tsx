import React from "react";
import { Globe, Edit3, Copy, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import type { PersonalLink } from "@/lib/profileExtras";
import { getLinkDisplayHandle } from "@/lib/profileExtras";
import { LINK_META } from "./profileTypes";

interface ProfileLinksViewProps {
  links: PersonalLink[];
  ar: boolean;
  onEdit: () => void;
  title?: string;
  emptyNotice?: string;
  addBtnText?: string;
}

export const ProfileLinksView: React.FC<ProfileLinksViewProps> = ({
  links,
  ar,
  onEdit,
  title,
  emptyNotice,
  addBtnText,
}) => {
  const defaultTitle = ar ? "الروابط المهنية ومعرض الأعمال" : "Professional & Portfolio Links";
  const defaultEmpty = ar ? "لم يتم ربط أي موقع أو معرض أعمال حتى الآن." : "No portfolio or professional links connected yet.";
  const defaultAdd = ar ? "إضافة وتعديل الروابط المهنية" : "Add & Edit Professional Links";

  return (
    <div className="bg-card-gradient border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-3 shadow-luxe">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-gold-gradient flex items-center gap-2">
          <Globe className="w-4 h-4 text-gold flex-shrink-0" />
          <span>{title || defaultTitle}</span>
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/30 transition-all shadow-sm cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{links.length > 0 ? (ar ? "إدارة الروابط" : "Manage Links") : (ar ? "إضافة رابط" : "Add Link")}</span>
        </button>
      </div>

      {links.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {links.map((link) => {
            const meta = LINK_META[link.type] || LINK_META.other;
            const displayHandle = getLinkDisplayHandle(link.type, link.url);
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-background/60 border border-border/80 hover:border-primary/50 text-xs transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg flex-shrink-0 w-8 h-8 rounded-xl bg-card border border-border/70 flex items-center justify-center">
                    {meta.emoji}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-foreground truncate text-xs">
                      {ar ? meta.labelAr.split(" ")[0] : meta.labelEn.split(" ")[0]}
                    </span>
                    {displayHandle && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]" dir="ltr">
                        {displayHandle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(link.url);
                      toast.success(ar ? "تم نسخ الرابط" : "Link copied");
                    }}
                    className="h-8 w-8 rounded-xl border border-border/80 bg-card hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    title={ar ? "نسخ الرابط" : "Copy link"}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-bold text-[11px] transition-colors"
                    title={ar ? "فتح الرابط" : "Open link"}
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ar ? "فتح" : "Open"}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-background/30 rounded-xl border border-dashed border-border text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            {emptyNotice || defaultEmpty}
          </p>
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1 text-[11px] bg-card border border-primary/30 hover:bg-primary/15 text-primary px-3 py-1 rounded-full font-medium transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{addBtnText || defaultAdd}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
