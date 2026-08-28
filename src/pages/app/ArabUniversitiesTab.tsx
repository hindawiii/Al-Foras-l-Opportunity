import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Search, ExternalLink, MapPin, Languages as LangIcon,
  Award, CheckCircle2, SlidersHorizontal, Building2, ChevronRight,
  Wallet, Home, CalendarDays, FileText, ListChecks, Map, Scale, X,
} from "lucide-react";
import {
  ARAB_UNIVERSITIES, ARAB_COUNTRY_STATS, ARAB_FACULTIES,
  getUniDetails, getFacultyLabel, getCityLabel, type ArabUniversity,
} from "@/lib/arabUniversities";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const PCT_KEY = "foras-student-percentage";

export const ArabUniversitiesTab = () => {
  const { lang, t } = useLanguage();
  const { countryCode } = useSettings();
  const ar = lang === "ar";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<string | null>(null);
  const [pct, setPct] = useState(() => localStorage.getItem(PCT_KEY) ?? "");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [selected, setSelected] = useState<ArabUniversity | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const percentage = Number(pct);
  const hasPct = pct !== "" && !Number.isNaN(percentage);
  const searching = query.trim().length > 0;
  const showCountries = !country && !searching;

  const countries = useMemo(() => {
    const mine = countryCode?.toUpperCase();
    return [...ARAB_COUNTRY_STATS].sort((a, b) => {
      const am = a.code === mine ? 0 : 1;
      const bm = b.code === mine ? 0 : 1;
      return am - bm || b.count - a.count;
    });
  }, [countryCode]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = ARAB_UNIVERSITIES.filter((u) => {
      if (country && u.country !== country) return false;
      if (faculty && !u.faculties.includes(faculty)) return false;
      if (
        q &&
        !`${u.name} ${u.nameEn} ${u.city} ${u.cityEn ?? ""} ${u.country} ${u.countryEn} ${u.faculties.join(" ")}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      if (eligibleOnly && hasPct && percentage < u.minPercentage) return false;
      return true;
    });
    if (hasPct) {
      items = [...items].sort((a, b) => {
        const ea = percentage >= a.minPercentage ? 0 : 1;
        const eb = percentage >= b.minPercentage ? 0 : 1;
        return ea - eb || b.minPercentage - a.minPercentage;
      });
    }
    return items;
  }, [query, country, faculty, eligibleOnly, hasPct, percentage]);

  const eligibleCount = hasPct
    ? ARAB_UNIVERSITIES.filter((u) => percentage >= u.minPercentage).length
    : 0;

  const langLabel = (l: ArabUniversity["language"]) =>
    l === "ar" ? (ar ? "عربي" : "Arabic") : l === "en" ? (ar ? "إنجليزي" : "English") : (ar ? "عربي/إنجليزي" : "Arabic/English");

  const typeLabel = (tp: ArabUniversity["type"]) => {
    if (tp === "government") return t("arabUniGov");
    if (tp === "technical") return ar ? "تقنية" : "Technical";
    return t("arabUniPrivate");
  };

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );

  const compareUnis = ARAB_UNIVERSITIES.filter((u) => compare.includes(u.id));
  const mapUrl = (u: ArabUniversity) =>
    `https://www.google.com/maps/search/${encodeURIComponent(`${u.nameEn || u.name} ${u.cityEn || u.city}`)}`;

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-4">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">{t("arabUniTitle")}</h1>
        </div>
        <p className="text-xs text-muted-foreground">{t("arabUniSubtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("arabUniSearch")}
          className="w-full h-11 ps-9 pe-3 rounded-xl bg-card border border-primary/20 focus:border-primary outline-none text-sm text-foreground"
        />
      </div>

      {/* Smart matching */}
      <div className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{t("arabUniMatchTitle")}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            inputMode="decimal"
            value={pct}
            onChange={(e) => {
              setPct(e.target.value);
              localStorage.setItem(PCT_KEY, e.target.value);
            }}
            placeholder={t("arabUniPctPlaceholder")}
            className="w-28 h-10 px-3 rounded-xl bg-background border border-primary/20 focus:border-primary outline-none text-sm text-foreground"
          />
          <button
            onClick={() => setEligibleOnly((v) => !v)}
            disabled={!hasPct}
            className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
              eligibleOnly ? "bg-primary/20 border-primary text-primary" : "bg-background border-primary/20 text-muted-foreground"
            }`}
          >
            {t("arabUniEligibleOnly")}
          </button>
        </div>
        {hasPct && (
          <p className="text-xs text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("arabUniEligibleCount").replace("{n}", String(eligibleCount))}
          </p>
        )}
      </div>

      {/* Countries grid */}
      {showCountries ? (
        <>
          <p className="text-sm font-bold text-foreground">{t("arabUniCountriesTitle")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {countries.map((c, i) => {
              const mine = c.code === countryCode?.toUpperCase();
              return (
                <motion.button
                  key={c.country}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setCountry(c.country)}
                  className={`relative text-start rounded-2xl border p-3 bg-card/60 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary/60 ${
                    mine ? "border-primary shadow-[0_0_18px_-6px_hsl(var(--primary))]" : "border-primary/20"
                  }`}
                >
                  {mine && (
                    <span className="absolute top-2 end-2 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary text-primary">
                      {t("arabUniYourCountry")}
                    </span>
                  )}
                  <div className="text-2xl">{c.flag}</div>
                  <p className="mt-1.5 text-sm font-bold text-primary truncate">{ar ? c.country : c.countryEn}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("arabUniUnisCount").replace("{n}", String(c.count))}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 border border-primary/10 text-muted-foreground">
                      {t("arabUniMin")} {c.minPercentage}%
                    </span>
                    {c.scholarships && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
                        {t("arabUniHasScholarships")}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Header row for the selected country / search */}
          <div className="flex items-center justify-between gap-2">
            {country ? (
              <button
                onClick={() => {
                  setCountry(null);
                  setFaculty(null);
                }}
                className="h-9 px-3 rounded-full text-xs font-bold border border-primary/30 bg-card text-primary flex items-center gap-1.5"
              >
                <ChevronRight className={`w-3.5 h-3.5 ${ar ? "" : "rotate-180"}`} />
                {t("arabUniBack")}
              </button>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground">
              {t("arabUniResults").replace("{n}", String(list.length))}
            </p>
          </div>

          {/* Faculty chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setFaculty(null)}
              className={`shrink-0 h-8 px-3 rounded-full text-[11px] border ${
                faculty === null
                  ? "bg-primary/15 border-primary/60 text-primary"
                  : "bg-card border-primary/15 text-muted-foreground"
              }`}
            >
              {t("arabUniAllFaculties")}
            </button>
            {ARAB_FACULTIES.slice(0, 24).map((f) => (
              <button
                key={f}
                onClick={() => setFaculty(faculty === f ? null : f)}
                className={`shrink-0 h-8 px-3 rounded-full text-[11px] border ${
                  faculty === f
                    ? "bg-primary/15 border-primary/60 text-primary"
                    : "bg-card border-primary/15 text-muted-foreground"
                }`}
              >
                {getFacultyLabel(f, lang)}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-primary" />
            {t("arabUniCompareHint")}
          </p>

          {/* Cards */}
          <div className="space-y-3">
            {list.map((u, i) => {
              const eligible = hasPct && percentage >= u.minPercentage;
              const picked = compare.includes(u.id);
              const cityText = ar ? u.city : (u.cityEn || getCityLabel(u.city, lang));
              const countryText = ar ? u.country : u.countryEn;

              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`rounded-2xl border bg-card/60 backdrop-blur-md p-4 transition-all hover:-translate-y-0.5 ${
                    picked ? "border-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)]" : "border-primary/20 hover:border-primary/60"
                  }`}
                >
                  <button onClick={() => setSelected(u)} className="w-full text-start">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xl">
                        {u.flag}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-primary truncate">
                          {ar ? u.name : (u.nameEn || u.name)}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {cityText} · {countryText}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                            {typeLabel(u.type)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-primary/10 text-muted-foreground flex items-center gap-1">
                            <LangIcon className="w-3 h-3" />
                            {langLabel(u.language)}
                          </span>
                          {u.scholarships && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {t("arabUniHasScholarships")}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              eligible
                                ? "bg-primary/20 border-primary text-primary font-semibold"
                                : "bg-muted/30 border-primary/10 text-muted-foreground"
                            }`}
                          >
                            {t("arabUniMin")} {u.minPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => toggleCompare(u.id)}
                    className={`mt-3 h-8 px-3 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                      picked ? "bg-primary/20 border-primary text-primary" : "bg-background border-primary/20 text-muted-foreground"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    {t("arabUniCompare")}
                  </button>
                </motion.div>
              );
            })}
            {list.length === 0 && (
              <div className="rounded-2xl border border-primary/15 bg-card/40 p-8 text-center text-sm text-muted-foreground">
                {t("arabUniEmpty")}
              </div>
            )}
          </div>
        </>
      )}

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-40 px-4">
          <div className="mx-auto max-w-md rounded-2xl border border-primary/40 bg-card/90 backdrop-blur-xl p-2.5 flex items-center gap-2 shadow-2xl">
            <button
              onClick={() => setCompareOpen(true)}
              className="flex-1 h-10 rounded-xl bg-gold-gradient text-background text-xs font-bold shadow-md hover:brightness-105"
            >
              {t("arabUniCompareOpen").replace("{n}", String(compare.length))}
            </button>
            <button
              onClick={() => setCompare([])}
              aria-label={t("arabUniClear")}
              className="w-10 h-10 rounded-xl border border-primary/30 text-muted-foreground flex items-center justify-center hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison sheet */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20">
          <SheetHeader>
            <SheetTitle className="text-primary text-start flex items-center gap-2">
              <Scale className="w-5 h-5" />
              {t("arabUniCompare")}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr>
                  <th className="text-start p-2 text-muted-foreground font-normal"> </th>
                  {compareUnis.map((u) => (
                    <th key={u.id} className="p-2 text-start text-primary font-bold min-w-[120px]">
                      {u.flag} {ar ? u.name : (u.nameEn || u.name)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  [t("arabUniCity"), (u: ArabUniversity) => (ar ? u.city : (u.cityEn || getCityLabel(u.city, lang)))],
                  [t("arabUniType"), (u: ArabUniversity) => typeLabel(u.type)],
                  [t("arabUniMin"), (u: ArabUniversity) => `${u.minPercentage}%`],
                  [t("arabUniLanguage"), (u: ArabUniversity) => langLabel(u.language)],
                  [t("arabUniHasScholarships"), (u: ArabUniversity) => (u.scholarships ? "✓" : "—")],
                  [t("arabUniTuition"), (u: ArabUniversity) => (ar ? getUniDetails(u).tuition : getUniDetails(u).tuitionEn)],
                  [t("arabUniLiving"), (u: ArabUniversity) => (ar ? getUniDetails(u).living : getUniDetails(u).livingEn)],
                ].map(([label, fn], idx) => (
                  <tr key={idx} className="border-t border-primary/10">
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{label as string}</td>
                    {compareUnis.map((u) => (
                      <td key={u.id} className="p-2">
                        {(fn as (x: ArabUniversity) => string)(u)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Details sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/20">
          {selected && (() => {
            const d = getUniDetails(selected);
            const cityText = ar ? selected.city : (selected.cityEn || getCityLabel(selected.city, lang));
            const countryText = ar ? selected.country : selected.countryEn;

            return (
              <>
                <SheetHeader>
                  <SheetTitle className="text-primary text-start flex items-center gap-2">
                    <span className="text-2xl">{selected.flag}</span>
                    {ar ? selected.name : (selected.nameEn || selected.name)}
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4 text-start">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ar ? selected.highlights : (selected.highlightsEn || selected.highlights)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniCity")}</p>
                      <p className="text-foreground font-bold mt-1">{cityText}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniMin")}</p>
                      <p className="text-foreground font-bold mt-1">{selected.minPercentage}%</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniType")}</p>
                      <p className="text-foreground font-bold mt-1">{typeLabel(selected.type)}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground">{t("arabUniLanguage")}</p>
                      <p className="text-foreground font-bold mt-1">{langLabel(selected.language)}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-primary" />
                        {t("arabUniTuition")}
                      </p>
                      <p className="text-foreground font-bold mt-1">{ar ? d.tuition : d.tuitionEn}</p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Home className="w-3 h-3 text-primary" />
                        {t("arabUniLiving")}
                      </p>
                      <p className="text-foreground font-bold mt-1">{ar ? d.living : d.livingEn}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      {t("arabUniSeasons")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ar ? d.seasons : d.seasonsEn}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {t("arabUniFaculties")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.faculties.map((f) => (
                        <span key={f} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                          {getFacultyLabel(f, lang)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("arabUniDocs")}
                    </p>
                    <ul className="space-y-1.5">
                      {(ar ? d.docs : d.docsEn).map((doc) => (
                        <li key={doc} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      {t("arabUniSteps")}
                    </p>
                    <ol className="space-y-1.5">
                      {(ar ? d.steps : d.stepsEn).map((s, i) => (
                        <li key={s} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-4 h-4 shrink-0 rounded-full bg-primary/15 border border-primary/30 text-primary text-[9px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={mapUrl(selected)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 rounded-xl border border-primary/30 bg-background/60 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10"
                    >
                      <Map className="w-4 h-4" />
                      {t("arabUniMap")}
                    </a>
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 rounded-xl bg-gold-gradient text-background text-xs font-bold flex items-center justify-center gap-2 hover:brightness-105"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t("arabUniVisit")}
                    </a>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ArabUniversitiesTab;
