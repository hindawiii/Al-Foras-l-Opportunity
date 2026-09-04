import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ExternalLink, BadgeCheck, Search, Award, MapPin, Clock, Link2, Share2,
  Sparkles, Globe, Star, GraduationCap, Briefcase, ArrowLeft, ArrowRight,
  Layers, List, Heart, X, Mic, FileText, Bot
} from "lucide-react";
import { ScholarshipCard } from "@/components/foras/ScholarshipCard";
import { SCHOLARSHIPS, Scholarship, computeMatchScore } from "@/lib/mockData";
import { dynamicStore, isArabCountry } from "@/lib/dynamicStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { nativeShare } from "@/lib/share";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsStore } from "@/lib/applicationsStorage";
import { OpportunityAICopilot } from "@/components/foras/OpportunityAICopilot";

export const ScholarshipsTab = () => {
  const { info: geo } = useGeolocation(true);
  const { t, lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [filter, setFilter] = useState<"all" | "arab" | "global">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [liveScholarships, setLiveScholarships] = useState<Scholarship[]>(() => {
    const init = dynamicStore.getScholarships();
    return Array.isArray(init) ? init : [];
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updated = dynamicStore.getScholarships();
      setLiveScholarships(Array.isArray(updated) ? updated : []);

      // If a specific scholarship was just added/updated, ensure the filter reveals it
      const item = e?.detail?.item;
      if (item && e?.detail?.type === "scholarship") {
        if (item.category === "arab" || item.category === "global") {
          setFilter(item.category);
        } else {
          setFilter("all");
        }
      }
    };
    window.addEventListener("foras:data-updated", handleUpdate);
    return () => window.removeEventListener("foras:data-updated", handleUpdate);
  }, []);

  // Filter by category, search query, selected tag, then prioritise newly published and matching country
  const orderedDeck = useMemo(() => {
    const safeList = Array.isArray(liveScholarships) ? liveScholarships : [];
    let filtered = safeList.filter(s => {
      if (!s) return false;
      if (filter === "all") return true;
      const cat: "arab" | "global" =
        s.category === "arab" || s.category === "global"
          ? s.category
          : isArabCountry(s.country, s.title || (s as any).title_ar)
          ? "arab"
          : "global";
      return cat === filter;
    });

    if (selectedTag) {
      filtered = filtered.filter(s => (s?.tags || []).includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        (s?.title || "").toLowerCase().includes(q) ||
        ((s as any)?.title_ar || "").toLowerCase().includes(q) ||
        (s?.titleEn && s.titleEn.toLowerCase().includes(q)) ||
        ((s as any)?.title_en && (s as any).title_en.toLowerCase().includes(q)) ||
        (s?.org || "").toLowerCase().includes(q) ||
        ((s as any)?.university || "").toLowerCase().includes(q) ||
        (s?.country || "").toLowerCase().includes(q) ||
        (s?.tags || []).some(tag => tag && tag.toLowerCase().includes(q))
      );
    }

    // Keep custom published items (starting with sch_ or custom IDs) or country matches prioritized at the front
    const country = (geo?.country || "").toLowerCase();
    const customOrPinned = filtered.filter(s => s && ((typeof s.id === "string" && s.id.startsWith("sch_")) || (s as any).isCustom));
    const notPinned = filtered.filter(s => !customOrPinned.includes(s));

    if (!country) {
      return [...customOrPinned, ...notPinned];
    }

    const matches = notPinned.filter(s =>
      (s?.country || "").toLowerCase().includes(country) ||
      (s?.countryEn && s.countryEn.toLowerCase().includes(country)) ||
      country.includes((s?.country || "").toLowerCase())
    );
    const rest = notPinned.filter(s => !matches.includes(s));
    return [...customOrPinned, ...matches, ...rest];
  }, [geo?.country, filter, searchQuery, selectedTag, liveScholarships]);

  const [deck, setDeck] = useState<Scholarship[]>(orderedDeck);

  // Synchronize deck state whenever orderedDeck updates (new opportunity added, filter switched, search applied)
  useEffect(() => {
    setDeck(orderedDeck);
  }, [orderedDeck]);
  const [detail, setDetail] = useState<Scholarship | null>(null);
  const [aiNotice, setAiNotice] = useState(false);
  const [profile, setProfile] = useState<{ location?: string; skills?: string[]; interests?: string[] }>({});
  const { user } = useAuth();

  useEffect(() => {
    // Show once per session; auto-dismiss after 5s
    const dismissedKey = "aiNoticeDismissed";
    if (sessionStorage.getItem(dismissedKey)) return;
    const showT = setTimeout(() => setAiNotice(true), 1200);
    const hideT = setTimeout(() => {
      setAiNotice(false);
      sessionStorage.setItem(dismissedKey, "1");
    }, 1200 + 5000);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  }, []);

  // Re-sort the deck when search or filter changes
  useEffect(() => {
    setDeck(orderedDeck);
  }, [orderedDeck]);

  // Deep-link: open detail when ?scholarship=ID is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("scholarship");
    if (!id) return;
    const target = SCHOLARSHIPS.find(s => s.id === id);
    if (target) {
      setDetail(target);
      const url = new URL(window.location.href);
      url.searchParams.delete("scholarship");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("location, skills, interests").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data as any); });
  }, [user]);

  const handleSwipe = async (dir: "left" | "right", s: Scholarship) => {
    const titleText = ar ? s.title : (s.titleEn || s.title);
    if (dir === "right") {
      applicationsStore.upsertFromScholarship(s, "saved");
      toast.success(t("saved"));
    } else if (dir === "left") {
      toast(t("dismissed"), { description: titleText });
    }
    setDeck(prev => prev.slice(1));
  };

  const shareDetail = async () => {
    if (!detail) return;
    const origin = window.location.origin;
    const titleText = ar ? detail.title : (detail.titleEn || detail.title);
    const orgText = ar ? detail.org : (detail.orgEn || detail.org);
    const countryText = ar ? detail.country : (detail.countryEn || detail.country);

    await nativeShare({
      title: `${ar ? "الفرص" : "Al-Foras"} — ${titleText}`,
      text: `${titleText} — ${orgText} (${countryText})`,
      url: `${origin}/?scholarship=${encodeURIComponent(detail.id)}`,
    });
  };

  const detailTitle = detail ? (ar ? detail.title : (detail.titleEn || detail.title)) : "";
  const detailOrg = detail ? (ar ? detail.org : (detail.orgEn || detail.org)) : "";
  const detailCountry = detail ? (ar ? detail.country : (detail.countryEn || detail.country)) : "";
  const detailAmount = detail ? (ar ? detail.amount : (detail.amountEn || detail.amount)) : "";
  const detailLevel = detail ? (ar ? detail.level : (detail.levelEn || detail.level)) : "";
  const detailDesc = detail ? (ar ? detail.description : (detail.descriptionEn || detail.description)) : "";

  return (
    <div className="relative flex flex-col w-full">
      {/* Premium Luminous Gold Search Bar */}
      <div className="mb-3.5 px-1">
        <div className="relative group">
          {/* Radiant gold ambient backlight */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(43_74%_49%)] via-[hsl(43_90%_65%)] to-[hsl(43_74%_45%)] rounded-2xl blur-md opacity-40 group-hover:opacity-75 group-focus-within:opacity-100 transition-all duration-500 animate-pulse" />

          <div className="relative flex items-center w-full bg-card/90 backdrop-blur-xl border-2 border-[hsl(43_74%_50%)] rounded-2xl shadow-[0_0_25px_-5px_hsl(43_74%_49%/0.45)] focus-within:shadow-[0_0_35px_0px_hsl(43_85%_55%/0.65)] focus-within:border-[hsl(43_90%_58%)] transition-all duration-300">
            {/* Illuminated Gold Search Icon */}
            <div className={`flex items-center justify-center w-11 h-11 ${isRtl ? "pr-1" : "pl-1"} text-primary flex-shrink-0`}>
              <div className="w-8 h-8 rounded-xl bg-gold-gradient/20 border border-primary/40 flex items-center justify-center shadow-gold">
                <Search className="w-4 h-4 text-primary" strokeWidth={2.5} />
              </div>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ar ? "ابحث عن منحة، جامعة، تخصص، دولة..." : "Search scholarship, university, major, country..."}
              className={`w-full h-12 py-2.5 ${
                isRtl ? "pr-2 pl-10" : "pl-2 pr-10"
              } text-xs sm:text-sm bg-transparent font-medium text-foreground placeholder:text-muted-foreground/80 focus:outline-none`}
            />

            {/* Quick Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute ${isRtl ? "left-3" : "right-3"} w-6 h-6 rounded-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center text-xs font-bold transition-transform active:scale-90`}
                title={ar ? "مسح البحث" : "Clear search"}
              >
                ✕
              </button>
            )}

            {/* Match Badge counter inside search */}
            <div className={`hidden sm:flex items-center gap-1 text-[11px] font-bold text-primary px-3 ${isRtl ? "border-r" : "border-l"} border-primary/20 flex-shrink-0`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{deck.length} {t("opportunityResults")}</span>
            </div>
          </div>
        </div>

        {/* Popular quick filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-0.5 scrollbar-hide text-[11px]">
          <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0">
            {ar ? "رائج:" : "Popular:"}
          </span>
          {[
            { ar: "ممولة بالكامل", en: "Fully Funded" },
            { ar: "طب", en: "Medicine" },
            { ar: "هندسة", en: "Engineering" },
            { ar: "ماجستير", en: "Master's" },
            { ar: "دكتوراه", en: "PhD" },
            { ar: "بريطانيا", en: "UK" },
            { ar: "ألمانيا", en: "Germany" },
          ].map((tag) => {
            const isTagActive = selectedTag === tag.ar;
            return (
              <button
                key={tag.ar}
                onClick={() => {
                  if (selectedTag === tag.ar) setSelectedTag(null);
                  else setSelectedTag(tag.ar);
                }}
                className={`px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-all font-medium ${
                  isTagActive
                    ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold"
                    : "bg-card/60 border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/50"
                }`}
              >
                {ar ? tag.ar : tag.en}
              </button>
            );
          })}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[10px] text-destructive hover:underline flex-shrink-0"
            >
              {ar ? "إلغاء الفلتر" : "Reset"}
            </button>
          )}
        </div>
      </div>

      {/* Segmented filter — All vs Arab vs Global */}
      <div className="mb-3 px-1">
        <div className="relative inline-flex w-full p-1 rounded-2xl bg-card/60 backdrop-blur-md border border-border overflow-hidden">
          {(["all", "arab", "global"] as const).map((key) => {
            const active = filter === key;
            const isAll = key === "all";
            const isArab = key === "arab";
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`relative flex-1 z-10 px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300
                  ${active
                    ? isAll
                      ? "bg-primary/20 text-primary border border-primary/50 shadow-sm"
                      : isArab
                      ? "bg-gold-gradient text-primary-foreground shadow-gold"
                      : "bg-gradient-to-r from-[hsl(210_70%_50%)] to-[hsl(220_60%_45%)] text-white shadow-[0_8px_24px_-8px_hsl(210_70%_50%/0.6)]"
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                {isAll ? <Sparkles className="w-3.5 h-3.5" /> : isArab ? <Star className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {isAll ? t("filterAllScholarships") : isArab ? t("filterArabScholarships") : t("filterGlobalScholarships")}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI matching notice */}
      <AnimatePresence>
        {aiNotice && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="mx-1 mb-3 glass border-gold rounded-2xl p-3 flex items-start gap-3 shadow-gold"
          >
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-primary font-bold mb-0.5">{t("aiMatchBadge")}</p>
              <p className="text-sm text-foreground leading-snug">{t("aiMatchBody")}</p>
            </div>
            <button
              onClick={() => { setAiNotice(false); sessionStorage.setItem("aiNoticeDismissed", "1"); }}
              className="text-muted-foreground text-xs hover:text-foreground"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick access cards: Arab Universities Guide + Jobs */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 mx-1">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "arabUnis" } }))}
          className={`group relative overflow-hidden rounded-2xl p-3.5 bg-card/60 backdrop-blur-md border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-start gap-2 ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <GraduationCap className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm font-bold text-gold-gradient leading-tight">{t("quickUnisGuideTitle")}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-1">
            {t("discover")} {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
          </span>
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("foras:navigate", { detail: { tab: "jobs" } }))}
          className={`group relative overflow-hidden rounded-2xl p-3.5 bg-card/60 backdrop-blur-md border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-start gap-2 ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210_70%_50%)] to-[hsl(220_60%_45%)] flex items-center justify-center shadow-[0_8px_24px_-8px_hsl(210_70%_50%/0.6)]">
            <Briefcase className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm font-bold bg-gradient-to-r from-[hsl(210_70%_60%)] to-[hsl(220_60%_55%)] bg-clip-text text-transparent leading-tight">
              {t("jobOpportunitiesTitle")}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              {t("jobOpportunitiesSub")}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(210_70%_60%)] mt-1">
            {t("discover")} {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
          </span>
        </button>
      </div>

      <div className="mb-3 px-1 text-[11px] text-muted-foreground flex items-center gap-1.5 leading-relaxed">
        <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span>{t("scholarshipsHint")}</span>
      </div>

      {/* View mode toggle: swipe deck vs vertical scrollable list */}
      <div className="mb-3 px-1 flex items-center gap-2">
        {([
          { key: "deck" as const, icon: Layers, label: t("scholarshipsSwipe") },
          { key: "list" as const, icon: List, label: t("scholarshipsList") },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all
              ${viewMode === key
                ? "bg-primary/15 border-primary/50 text-primary"
                : "bg-card/50 border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
        <span className={`text-[11px] text-muted-foreground ${isRtl ? "mr-auto" : "ml-auto"}`}>
          {deck.length} {t("opportunityResults")}
        </span>
      </div>

      {viewMode === "list" ? (
        <div className="flex flex-col gap-2.5 px-1">
          {deck.length === 0 ? (
            <EmptyState t={t} onReload={() => { setSearchQuery(""); setSelectedTag(null); setDeck(orderedDeck); }} />
          ) : (
            deck.map((s) => {
              const itemTitle = ar ? s.title : (s.titleEn || s.title);
              const itemOrg = ar ? s.org : (s.orgEn || s.org);
              const itemCountry = ar ? s.country : (s.countryEn || s.country);
              const itemAmount = ar ? s.amount : (s.amountEn || s.amount);

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setDetail(s)}
                  className={`cursor-pointer rounded-2xl p-3.5 bg-card/50 backdrop-blur-md border transition-all hover:bg-primary/5
                    ${s.category === "arab" ? "border-primary/30 hover:border-primary/60" : "border-[hsl(210_70%_60%/0.35)] hover:border-[hsl(210_70%_60%/0.7)]"} ${alignClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-background/70 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                      <span>{s.flag}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-xs font-extrabold truncate">{itemOrg}</p>
                      <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{itemTitle}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {itemCountry}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Award className="w-3 h-3 text-primary" />
                          {itemAmount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          {new Date(s.deadline).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 border border-primary/40 text-primary">
                        <Sparkles className="w-3 h-3" />{computeMatchScore(s, profile)}%
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSwipe("left", s); }}
                          className="w-8 h-8 rounded-full border border-destructive/40 hover:bg-destructive/10 flex items-center justify-center"
                          aria-label="dismiss"
                        >
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSwipe("right", s); }}
                          className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold"
                          aria-label="save"
                        >
                          <Heart className="w-3.5 h-3.5 text-primary-foreground fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        <div className="relative flex-1 min-h-[560px]">
          {deck.length === 0 ? (
            <EmptyState t={t} onReload={() => { setSearchQuery(""); setSelectedTag(null); setDeck(orderedDeck); }} />
          ) : (
            deck.slice(0, 3).map((s, i) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                index={i}
                active={i === 0}
                matchScore={computeMatchScore(s, profile)}
                onSwipe={(d) => handleSwipe(d, s)}
                onTap={() => i === 0 && setDetail(s)}
              />
            ))
          )}
        </div>
      )}

      {viewMode === "deck" && (
        <p className="text-center text-muted-foreground pt-3 my-[10px] text-xs">
          {t("swipeHint")}
        </p>
      )}

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent side="bottom" className="bg-card border-gold/30 rounded-t-3xl max-h-[92vh] overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    {detail.verified && (
                      <span className="inline-flex items-center gap-1 bg-verified/15 border border-verified/40 text-verified px-2 py-1 rounded-full text-xs font-medium">
                        <BadgeCheck className="w-3.5 h-3.5" /> {t("verified")}
                      </span>
                    )}
                    {detail.manualReview && (
                      <span className="inline-flex items-center gap-1 bg-review/15 border border-review/40 text-review px-2 py-1 rounded-full text-xs">
                        <Search className="w-3.5 h-3.5" /> {t("manualReview")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={shareDetail}
                    className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 flex items-center justify-center"
                    aria-label="مشاركة"
                  >
                    <Share2 className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <SheetTitle className={`${alignClass} font-display text-2xl text-gold-gradient`}>
                  {detailTitle}
                </SheetTitle>
                <p className={`text-primary text-sm ${alignClass}`}>{detailOrg}</p>
              </SheetHeader>
              <div className="space-y-4 mt-6 pb-6">
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">{t("matchPercent")}</span>
                  <span className={`font-bold text-primary text-lg ${isRtl ? "mr-auto" : "ml-auto"}`}>
                    {computeMatchScore(detail, profile)}%
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{detailDesc}</p>
                <div className="grid grid-cols-2 gap-3">
                  {detailCountry && <Detail icon={MapPin} label={t("country")} value={detailCountry} />}
                  {detailAmount && <Detail icon={Award} label={t("amount")} value={detailAmount} />}
                  {detail.deadline && (
                    <Detail
                      icon={Clock}
                      label={t("deadline")}
                      value={new Date(detail.deadline).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                    />
                  )}
                  {detailLevel && <Detail icon={BadgeCheck} label={t("level")} value={detailLevel} />}
                  {(detail as any).language_req && (
                    <Detail icon={Languages} label={ar ? "شرط اللغة" : "Language Requirement"} value={(detail as any).language_req} />
                  )}
                  {/* Dynamic Custom Fields added by Admin if present */}
                  {((detail as any).custom_fields || []).filter((f: any) => f && f.label && f.value && f.label.trim() && f.value.trim()).map((f: any, idx: number) => (
                    <div key={idx} className="bg-primary/5 border border-primary/20 rounded-xl p-3 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-primary text-xs mb-1 font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>{f.label}</span>
                      </div>
                      <p className="text-foreground text-xs sm:text-sm font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* AI Advisor Copilot Module: Inquire, Match & Mock Interview */}
                <OpportunityAICopilot
                  type="scholarship"
                  item={detail}
                  onOpenAdvisor={() => setDetail(null)}
                />

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button asChild variant="luxe" size="lg" className="w-full">
                    <a
                      href={detail.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer external"
                      onClick={() => setDetail(null)}
                    >
                      <ExternalLink className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                      {t("applyOfficial")}
                    </a>
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {t("applyOfficialNote")}
                  </p>
                </div>

                <div className="border-t border-border pt-3 mt-2">
                  <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3 text-primary" /> {t("sourceLink")}
                  </p>
                  <a
                    href={detail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="text-xs text-primary hover:underline break-all block text-left"
                  >
                    {detail.sourceUrl}
                  </a>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Detail = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="bg-background/40 border border-border rounded-xl p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
      <Icon className="w-3 h-3" />{label}
    </div>
    <p className="text-foreground font-medium">{value}</p>
  </div>
);

const EmptyState = ({ t, onReload }: { t: (k: string) => string; onReload: () => void }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="w-24 h-24 rounded-3xl bg-card-gradient border-gold flex items-center justify-center mb-6">
      <Award className="w-12 h-12 text-primary" strokeWidth={1.2} />
    </div>
    <h3 className="font-display text-2xl text-gold-gradient mb-2">{t("noScholarshipsCategory")}</h3>
    <p className="text-muted-foreground mb-6">{t("noMoreScholarshipsDesc")}</p>
    <Button variant="luxe" onClick={onReload}>{t("reload")}</Button>
  </div>
);
