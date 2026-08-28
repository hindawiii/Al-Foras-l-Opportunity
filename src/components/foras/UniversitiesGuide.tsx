import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, MapPin, ExternalLink, Search, Building2, Filter, Sparkles, Target,
  Info, Wallet, Home, CalendarDays, FileText, ListChecks, Users, Quote, Map as MapIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SUDAN_UNIVERSITIES,
  CITY_LIST,
  FACULTY_LIST,
  getSudanUniDetails,
  type SudanUniversity,
  type UniType,
} from "@/lib/sudanUniversities";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** User's exam percentage — used to highlight universities they qualify for. */
  userPercentage?: number;
}

const typeLabel: Record<UniType, { ar: string; en: string }> = {
  government: { ar: "حكومية", en: "Public" },
  private:    { ar: "خاصة",  en: "Private" },
  technical:  { ar: "تقنية", en: "Technical" },
};

const typeBadgeClass: Record<UniType, string> = {
  government: "bg-primary/15 text-primary border-primary/40",
  private: "bg-amber-500/15 text-amber-500 border-amber-500/40",
  technical: "bg-blue-500/15 text-blue-400 border-blue-500/40",
};

const PCT_KEY = "foras:userPercentage";

export const UniversitiesGuide = ({ open, onOpenChange, userPercentage }: Props) => {
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [type, setType] = useState<UniType | "">("");
  const [pctInput, setPctInput] = useState<string>("");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Load saved percentage once (or fallback to prop)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PCT_KEY) : null;
    if (saved) setPctInput(saved);
    else if (userPercentage) setPctInput(String(userPercentage));
  }, [userPercentage]);

  const effectivePct = useMemo(() => {
    const n = parseFloat(pctInput);
    if (Number.isFinite(n) && n > 0 && n <= 100) return n;
    return userPercentage;
  }, [pctInput, userPercentage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const n = parseFloat(pctInput);
    if (Number.isFinite(n) && n > 0 && n <= 100) localStorage.setItem(PCT_KEY, String(n));
  }, [pctInput]);

  const filtered = useMemo<SudanUniversity[]>(() => {
    const term = q.trim();
    return SUDAN_UNIVERSITIES.filter((u) => {
      if (city && u.city !== city) return false;
      if (type && u.type !== type) return false;
      if (faculty && !u.faculties.includes(faculty)) return false;
      if (onlyEligible && effectivePct !== undefined && effectivePct < u.minPercentage) return false;
      if (!term) return true;
      const hay = `${u.name} ${u.nameEn} ${u.city} ${u.faculties.join(" ")}`.toLowerCase();
      return hay.includes(term.toLowerCase());
    }).sort((a, b) => {
      // If user has a percentage, put qualifying schools first.
      if (effectivePct !== undefined) {
        const aOk = effectivePct >= a.minPercentage ? 0 : 1;
        const bOk = effectivePct >= b.minPercentage ? 0 : 1;
        if (aOk !== bOk) return aOk - bOk;
      }
      return b.minPercentage - a.minPercentage;
    });
  }, [q, city, faculty, type, effectivePct, onlyEligible]);

  const eligibleCount = useMemo(() => {
    if (effectivePct === undefined) return 0;
    return SUDAN_UNIVERSITIES.filter((u) => effectivePct >= u.minPercentage).length;
  }, [effectivePct]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir={dir}
        className="bg-card border-gold/30 rounded-t-3xl max-h-[92vh] overflow-y-auto"
      >
        <SheetHeader>
          <div className={`flex items-center gap-3 mb-2 ${isRtl ? "" : "flex-row-reverse text-left"}`}>
            <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            </div>
            <div className={`flex-1 ${alignClass}`}>
              <SheetTitle className={`${alignClass} font-display text-xl text-gold-gradient`}>
                {isRtl ? "دليل الجامعات السودانية" : "Sudanese Universities Guide"}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? `${SUDAN_UNIVERSITIES.length} جامعة — مرتبة حسب متطلبات القبول`
                  : `${SUDAN_UNIVERSITIES.length} universities — sorted by admission requirements`}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="space-y-2.5 mt-3 pb-2">
          {/* Smart matching by percentage */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3">
            <div className={`flex items-center gap-2 mb-2 ${isRtl ? "" : "flex-row-reverse"}`}>
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                <Target className="w-4 h-4 text-primary-foreground" strokeWidth={2.2} />
              </div>
              <div className={`flex-1 ${alignClass}`}>
                <p className="text-xs font-bold text-gold-gradient leading-tight">
                  {isRtl ? "مطابقة ذكية بالنسبة" : "Smart Percentage Match"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isRtl ? "اكتب نسبتك لنعرض الجامعات المؤهلة لك" : "Enter your percentage to view qualified universities"}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRtl ? "" : "flex-row-reverse"}`}>
              <div className="relative flex-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={0.1}
                  value={pctInput}
                  onChange={(e) => setPctInput(e.target.value)}
                  placeholder={isRtl ? "مثال: 82.5" : "e.g. 82.5"}
                  className={`bg-background/60 border-border ${alignClass}`}
                  dir={dir}
                />
              </div>
              <span className="text-primary font-bold text-lg">%</span>
              {effectivePct !== undefined && (
                <button
                  onClick={() => setOnlyEligible((v) => !v)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    onlyEligible
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-background/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isRtl ? "المؤهلة فقط" : "Eligible only"}
                </button>
              )}
            </div>
            {effectivePct !== undefined && (
              <p className={`text-[11px] text-emerald-400 mt-2 flex items-center gap-1 ${isRtl ? "" : "flex-row-reverse"}`}>
                <Sparkles className="w-3 h-3" />
                {isRtl
                  ? `بنسبة ${effectivePct}% أنت مؤهل لـ ${eligibleCount} من ${SUDAN_UNIVERSITIES.length} جامعة`
                  : `With ${effectivePct}%, you qualify for ${eligibleCount} of ${SUDAN_UNIVERSITIES.length} universities`}
              </p>
            )}
          </div>

          <div className="relative">
            <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isRtl ? "ابحث باسم الجامعة، مدينة، أو تخصص…" : "Search by university name, city, or major..."}
              className={`${isRtl ? "pr-10" : "pl-10"} ${alignClass} bg-background/40 border-border`}
              dir={dir}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`flex-1 min-w-[110px] h-9 rounded-lg bg-background/40 border border-border text-xs px-2 ${alignClass}`}
              dir={dir}
            >
              <option value="">{isRtl ? "كل المدن" : "All cities"}</option>
              {CITY_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className={`flex-1 min-w-[110px] h-9 rounded-lg bg-background/40 border border-border text-xs px-2 ${alignClass}`}
              dir={dir}
            >
              <option value="">{isRtl ? "كل التخصصات" : "All majors"}</option>
              {FACULTY_LIST.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as UniType | "")}
              className={`flex-1 min-w-[100px] h-9 rounded-lg bg-background/40 border border-border text-xs px-2 ${alignClass}`}
              dir={dir}
            >
              <option value="">{isRtl ? "كل الأنواع" : "All types"}</option>
              <option value="government">{isRtl ? "حكومية" : "Public"}</option>
              <option value="private">{isRtl ? "خاصة" : "Private"}</option>
              <option value="technical">{isRtl ? "تقنية" : "Technical"}</option>
            </select>
          </div>

          {(q || city || faculty || type) && (
            <button
              onClick={() => { setQ(""); setCity(""); setFaculty(""); setType(""); }}
              className="text-[11px] text-primary flex items-center gap-1 hover:underline"
            >
              <Filter className="w-3 h-3" />
              {isRtl ? "مسح كل الفلاتر" : "Clear all filters"}
            </button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-3 mt-2 pb-8">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {isRtl ? "لا توجد جامعات تطابق البحث" : "No universities match your search"}
            </div>
          )}

          {filtered.map((u, i) => {
            const qualifies = userPercentage ? userPercentage >= u.minPercentage : null;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="bg-background/40 border border-border hover:border-primary/40 rounded-2xl p-4 transition-colors"
              >
                <div className={`flex items-start justify-between gap-3 mb-2 ${isRtl ? "" : "flex-row-reverse"}`}>
                  <div className={`flex-1 ${alignClass}`}>
                    <h4 className="font-display text-base text-gold-gradient leading-tight">
                      {isRtl ? u.name : (u.nameEn || u.name)}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5" dir="ltr">
                      {u.nameEn} · {u.founded}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${typeBadgeClass[u.type]}`}
                  >
                    {isRtl ? typeLabel[u.type].ar : typeLabel[u.type].en}
                  </span>
                </div>

                <div className={`flex items-center gap-3 text-xs text-muted-foreground mb-2.5 ${isRtl ? "" : "flex-row-reverse"}`}>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {u.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-primary" /> {u.faculties.length} {isRtl ? "كلية" : "faculties"}
                  </span>
                </div>

                <p className={`text-xs text-foreground/85 leading-relaxed mb-2.5 ${alignClass}`}>
                  {u.highlights}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {u.faculties.slice(0, 6).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 border border-primary/25 text-foreground/80"
                    >
                      {f}
                    </span>
                  ))}
                  {u.faculties.length > 6 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground">
                      +{u.faculties.length - 6}
                    </span>
                  )}
                </div>

                <div className={`flex items-center justify-between gap-2 pt-2 border-t border-border/60 ${isRtl ? "" : "flex-row-reverse"}`}>
                  <div className={alignClass}>
                    <p className="text-[10px] text-muted-foreground">
                      {isRtl ? "أقل نسبة قبول تقريبية" : "Approx. min. percentage"}
                    </p>
                    <p className={`text-sm font-bold ${
                      qualifies === true ? "text-emerald-400"
                      : qualifies === false ? "text-muted-foreground"
                      : "text-primary"
                    }`}>
                      {u.minPercentage}%
                      {qualifies === true && (
                        <span className={`${isRtl ? "mr-1" : "ml-1"} inline-flex items-center gap-0.5 text-[10px] text-emerald-400`}>
                          <Sparkles className="w-3 h-3" /> {isRtl ? "مؤهل" : "Eligible"}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="luxe">
                    <a href={u.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className={`w-3.5 h-3.5 ${isRtl ? "ml-1.5" : "mr-1.5"}`} />
                      {isRtl ? "الموقع الرسمي" : "Official Website"}
                    </a>
                  </Button>
                </div>

                <button
                  onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                  className="mt-2.5 w-full h-9 rounded-xl border border-primary/25 bg-primary/5 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  {expanded === u.id
                    ? (isRtl ? "إخفاء التفاصيل" : "Hide Details")
                    : (isRtl ? "تفاصيل كاملة: الرسوم والتقديم والخريجون" : "Full Details: Tuition, Admission & Alumni")}
                </button>

                {expanded === u.id && (() => {
                  const d = getSudanUniDetails(u);
                  return (
                    <div className={`mt-3 space-y-3 ${alignClass} border-t border-border/60 pt-3`}>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                          <p className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isRtl ? "justify-end" : "justify-start"}`}>
                            {isRtl && "الرسوم الدراسية"} <Wallet className="w-3 h-3 text-primary" /> {!isRtl && "Tuition Fees"}
                          </p>
                          <p className="text-[11px] text-foreground/90 mt-1 leading-relaxed">{d.tuition}</p>
                        </div>
                        <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                          <p className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isRtl ? "justify-end" : "justify-start"}`}>
                            {isRtl && "تكلفة المعيشة"} <Home className="w-3 h-3 text-primary" /> {!isRtl && "Living Cost"}
                          </p>
                          <p className="text-[11px] text-foreground/90 mt-1 leading-relaxed">{d.living}</p>
                        </div>
                        <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                          <p className={`text-[10px] text-muted-foreground flex items-center gap-1 ${isRtl ? "justify-end" : "justify-start"}`}>
                            {isRtl && "مواعيد القبول"} <CalendarDays className="w-3 h-3 text-primary" /> {!isRtl && "Admission Dates"}
                          </p>
                          <p className="text-[11px] text-foreground/90 mt-1 leading-relaxed">{d.seasons}</p>
                        </div>
                      </div>

                      <div>
                        <p className={`text-[11px] font-bold text-foreground flex items-center gap-1.5 mb-1.5 ${isRtl ? "justify-end" : "justify-start"}`}>
                          {isRtl && "المستندات المطلوبة"} <FileText className="w-3.5 h-3.5 text-primary" /> {!isRtl && "Required Documents"}
                        </p>
                        <ul className="space-y-1">
                          {d.docs.map((doc) => (
                            <li key={doc} className="text-[11px] text-muted-foreground">• {doc}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className={`text-[11px] font-bold text-foreground flex items-center gap-1.5 mb-1.5 ${isRtl ? "justify-end" : "justify-start"}`}>
                          {isRtl && "خطوات التقديم"} <ListChecks className="w-3.5 h-3.5 text-primary" /> {!isRtl && "Application Steps"}
                        </p>
                        <ol className="space-y-1">
                          {d.steps.map((s, idx) => (
                            <li key={s} className="text-[11px] text-muted-foreground">
                              <span className="text-primary font-bold">{idx + 1}.</span> {s}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className={`text-[11px] font-bold text-foreground flex items-center gap-1.5 mb-1.5 ${isRtl ? "justify-end" : "justify-start"}`}>
                          {isRtl && "أبرز الخريجين"} <Users className="w-3.5 h-3.5 text-primary" /> {!isRtl && "Prominent Alumni"}
                        </p>
                        <ul className="space-y-1">
                          {d.alumni.map((a) => (
                            <li key={a} className="text-[11px] text-muted-foreground">• {a}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <p className={`text-[11px] font-bold text-primary flex items-center gap-1.5 mb-1 ${isRtl ? "justify-end" : "justify-start"}`}>
                          {isRtl && "تجربة الطلاب"} <Quote className="w-3.5 h-3.5" /> {!isRtl && "Student Experience"}
                        </p>
                        <p className="text-[11px] text-foreground/90 leading-relaxed">{d.experience}</p>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(`${u.nameEn} ${u.city} Sudan`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="h-10 rounded-xl border border-primary/30 bg-background/60 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5"
                      >
                        <MapIcon className="w-3.5 h-3.5" /> {isRtl ? "الموقع على الخريطة" : "View on Map"}
                      </a>
                    </div>
                  );
                })()}
              </motion.div>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed pb-4">
          {isRtl
            ? "البيانات إرشادية — راجع الموقع الرسمي لكل جامعة للحصول على أحدث متطلبات القبول والرسوم."
            : "Data is for guidance only — visit each university's official website for the latest admission and fee criteria."}
        </p>
      </SheetContent>
    </Sheet>
  );
};
