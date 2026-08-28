import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Globe2, MapPin, RefreshCw, FileText, ExternalLink } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { useNewsFeed, FeedItem, formatNewsTime } from "@/hooks/useNewsFeed";
import { findCountryByCode } from "@/lib/countries";
import { InAppBrowser } from "@/components/foras/InAppBrowser";
import { useLanguage } from "@/contexts/LanguageContext";

const catsDef = [
  { id: "all"    as const, key: "catAll",    icon: Newspaper },
  { id: "local"  as const, key: "catLocal",  icon: MapPin },
  { id: "arab"   as const, key: "catArab",   icon: Newspaper },
  { id: "global" as const, key: "catGlobal", icon: Globe2 },
];

export const NewsTab = () => {
  const [cat, setCat] = useState<typeof catsDef[number]["id"]>("all");
  const { textOnly, toggleTextOnly, countryCode } = useSettings();
  const { items, loading, error, updatedAt } = useNewsFeed();
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [browserTitle, setBrowserTitle] = useState<string | undefined>();
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";

  const country = findCountryByCode(countryCode);

  const filtered = useMemo(() => {
    if (cat === "all") return items;
    if (cat === "local") {
      // "Local" = items mentioning user's country in title/summary
      const needles = [country?.nameAr, country?.nameEn].filter(Boolean) as string[];
      if (needles.length === 0) return items.filter(i => i.category === "arab");
      return items.filter(i =>
        needles.some(n => i.title.includes(n) || i.summary.includes(n))
      );
    }
    return items.filter(i => i.category === cat);
  }, [items, cat, country]);

  const open = (item: FeedItem) => {
    setBrowserUrl(item.link);
    setBrowserTitle(item.source);
  };

  return (
    <div className="space-y-4 w-full" dir={dir}>
      <div className="flex items-center justify-between glass rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{t("dataSaver")}</span>
        </div>
        <Switch checked={textOnly} onCheckedChange={toggleTextOnly} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {catsDef.map(c => {
          const Icon = c.icon;
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                active ? "bg-gold-gradient text-primary-foreground shadow-gold" : "bg-card border border-border text-muted-foreground hover:border-primary/40"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {t(c.key)}
              {c.id === "local" && country && (
                <span className="text-xs opacity-90">{country.flag}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
        <span className="flex items-center gap-1">
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />}
          {updatedAt ? `${t("lastUpdated")} ${updatedAt.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US")}` : t("loadingShort")}
        </span>
        <span>{filtered.length} {t("newsCount")}</span>
      </div>

      {error && filtered.length === 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-center text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.slice(0, 60).map((item, i) => (
          <NewsCard
            key={item.id}
            item={item}
            index={i}
            textOnly={textOnly}
            onOpen={() => open(item)}
            isRtl={isRtl}
            openLabel={t("openSource")}
            lang={lang}
          />
        ))}
      </div>

      <InAppBrowser url={browserUrl} title={browserTitle} onClose={() => setBrowserUrl(null)} />
    </div>
  );
};

const NewsCard = ({
  item, index, textOnly, onOpen, isRtl, openLabel, lang,
}: { item: FeedItem; index: number; textOnly: boolean; onOpen: () => void; isRtl: boolean; openLabel: string; lang: string }) => {
  const displayTime = item.publishedAt ? formatNewsTime(item.publishedAt, lang) : item.time;

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.6) }}
      onClick={onOpen}
      className="group bg-card-gradient border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all flex flex-col cursor-pointer text-start"
    >
      {!textOnly && item.image && (
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img src={item.image} alt={item.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <span className="absolute top-2 start-2 bg-background/90 backdrop-blur-sm text-xs text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/30 shadow-sm">
            {item.source}
          </span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1 text-start">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {(textOnly || !item.image) && <span className="text-primary font-bold">{item.source}</span>}
          <span>{displayTime}</span>
        </div>
        <h3 className="font-display text-base font-bold text-foreground mb-2 leading-snug line-clamp-3 text-start">{item.title}</h3>
        {!textOnly && item.summary && (
          <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 text-start font-normal">{item.summary}</p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-primary font-bold">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{openLabel}</span>
        </div>
      </div>
    </motion.article>
  );
};
