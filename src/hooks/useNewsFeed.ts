import { useEffect, useState } from "react";

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  category: "global" | "arab" | "local" | "economy" | "sports";
  image?: string;
  publishedAt?: string;
  time: string;
}

interface FeedSource {
  name: string;
  url: string; // RSS feed URL
  category: FeedItem["category"];
}

// Public RSS feeds (Arabic + global). We proxy them through rss2json (free, public).
const SOURCES: FeedSource[] = [
  { name: "الجزيرة",     url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84051c5e498/73d0e1b4-532f-45ef-b135-bfdff8b8cab9", category: "arab" },
  { name: "BBC عربي",    url: "https://feeds.bbci.co.uk/arabic/rss.xml", category: "arab" },
  { name: "Sky News عربية", url: "https://www.skynewsarabia.com/web/rss/4608.xml", category: "arab" },
  { name: "BBC World",   url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "global" },
  { name: "CNN",         url: "http://rss.cnn.com/rss/edition_world.rss", category: "global" },
  { name: "Reuters",     url: "https://feeds.reuters.com/reuters/worldNews", category: "global" },
];

const FALLBACK_NEWS: FeedItem[] = [
  {
    id: "fb-1",
    title: "إطلاق بوابات التقديم على المنح الدراسية لجامعات الخليج والشرق الأوسط للعام الأكاديمي الجديد",
    summary: "أعلنت عدة وزارات تعليم وجامعات كبرى فتح مسارات القبول الدولي للمنح الكاملة لطلاب البكالوريوس والدراسات العليا.",
    link: "https://studyinsaudi.moe.gov.sa",
    source: "بوابة الفرص الدولية",
    category: "arab",
    publishedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    time: "قبل 20 دقيقة",
  },
  {
    id: "fb-2",
    title: "تحديثات أسعار الذهب وأسواق الصرف الدولية في تداولات اليوم",
    summary: "استقرار نسبي في تعاملات أوقية الذهب عالمياً مع ترقب قرارات البنوك المركزية بشأن أسعار الفائدة.",
    link: "https://www.reuters.com",
    source: "الأسواق العالمية",
    category: "economy",
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    time: "قبل 45 دقيقة",
  },
  {
    id: "fb-3",
    title: "برامج تدريب وتأهيل مهني دولية ممولة لحديثي التخرج في التقنية والذكاء الاصطناعي",
    summary: "مبادرات شبابية جديدة تتيح فرص الحصول على شهادات مهنية معتمدة من كبرى المؤسسات الأكاديمية العالمية.",
    link: "https://www.coursera.org",
    source: "التعليم والتدريب",
    category: "global",
    publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    time: "قبل ساعة",
  },
];

const PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const CACHE_KEY = "foras_cached_news";

const stripHtml = (s: string) => s?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() ?? "";

export const formatNewsTime = (iso?: string, lang: string = "ar"): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return lang === "ar" ? "الآن" : "Just now";
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return lang === "ar" ? `قبل ${mins} دقيقة` : `${mins}m ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return lang === "ar" ? `قبل ${hours} ساعة` : `${hours}h ago`;
  }
  const days = Math.floor(diff / 86400);
  return lang === "ar" ? `قبل ${days} يوم` : `${days}d ago`;
};

export const useNewsFeed = (intervalMs = 5 * 60_000) => {
  const [items, setItems] = useState<FeedItem[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return FALLBACK_NEWS;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(new Date());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled(
          SOURCES.map(s =>
            fetch(`${PROXY}${encodeURIComponent(s.url)}`)
              .then(r => r.json())
              .then(d => ({ source: s, data: d }))
          )
        );
        if (cancelled) return;
        const aggregated: FeedItem[] = [];
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          const { source, data } = r.value;
          const arr = data?.items ?? [];
          for (const it of arr.slice(0, 8)) {
            const desc = stripHtml(it.description ?? "");
            const img =
              it.thumbnail ||
              it.enclosure?.link ||
              (it.description?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? undefined);
            aggregated.push({
              id: `${source.name}-${it.guid ?? it.link ?? it.title}`,
              title: stripHtml(it.title ?? ""),
              summary: desc.slice(0, 240),
              link: it.link ?? source.url,
              source: source.name,
              category: source.category,
              image: img,
              publishedAt: it.pubDate,
              time: timeAgo(it.pubDate),
            });
          }
        }
        
        if (aggregated.length > 0) {
          // Sort newest first
          aggregated.sort((a, b) => {
            const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return tb - ta;
          });
          setItems(aggregated);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(aggregated.slice(0, 30))); } catch {}
          setError(null);
        } else {
          setItems(prev => prev.length > 0 ? prev : FALLBACK_NEWS);
        }
        setUpdatedAt(new Date());
      } catch {
        if (!cancelled) {
          setItems(prev => prev.length > 0 ? prev : FALLBACK_NEWS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = window.setInterval(load, intervalMs);
    return () => { cancelled = true; window.clearInterval(t); };
  }, [intervalMs]);

  return { items, loading, error, updatedAt };
};
