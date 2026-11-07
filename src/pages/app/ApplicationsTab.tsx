import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, CheckCircle2, Trash2, FileText, ExternalLink, Trophy, XCircle,
  ClipboardList, StickyNote, Filter, Calendar, Sparkles, Undo2, CheckSquare,
  Square, ShieldAlert, AlertCircle, ArrowLeft, ArrowRight, Briefcase, Award,
  DollarSign, Building2, GraduationCap, CloudCheck, CloudOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsStore, type AppRecord, type AppStatus } from "@/lib/applicationsStorage";
import { jobsStore } from "@/lib/jobsStorage";
import { universitiesStore } from "@/lib/universitiesStorage";
import { JOBS } from "@/lib/jobsData";
import { dynamicStore } from "@/lib/dynamicStore";
import { SCHOLARSHIPS } from "@/lib/mockData";

const STATUS_META: Record<AppStatus, { label: { ar: string; en: string }; classes: string; icon: any }> = {
  saved:    { label: { ar: "محفوظة",   en: "Saved"    }, classes: "bg-primary/10 text-primary border-primary/30",              icon: Bookmark      },
  applied:  { label: { ar: "مُقدَّم",    en: "Applied"  }, classes: "bg-sky-500/15 text-sky-400 border-sky-500/30",              icon: CheckCircle2  },
  accepted: { label: { ar: "مقبول",    en: "Accepted" }, classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",  icon: Trophy        },
  rejected: { label: { ar: "مرفوض",    en: "Rejected" }, classes: "bg-rose-500/15 text-rose-400 border-rose-500/30",           icon: XCircle       },
};

const STATUS_ORDER: AppStatus[] = ["saved", "applied", "accepted", "rejected"];

export const ApplicationsTab = () => {
  const { t, lang, dir } = useLanguage();
  const { user, isGuest, isCloudSynced } = useAuth();
  const nav = useNavigate();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AppRecord[]>([]);
  const [filter, setFilter] = useState<AppStatus | "all">("all");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTabSection, setActiveTabSection] = useState<"scholarships" | "jobs" | "universities">("scholarships");
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => jobsStore.savedIds());
  const [savedUniIds, setSavedUniIds] = useState<string[]>(() => universitiesStore.savedIds());

  const load = () => {
    const raw = applicationsStore.all();
    const uniqueMap = new Map<string, AppRecord>();
    for (const item of raw) {
      if (item && item.id && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    setItems(Array.from(uniqueMap.values()));
  };
  useEffect(() => {
    load();
    const handleUpdate = () => load();
    const handleJobsUpdated = () => {
      setSavedJobIds(jobsStore.savedIds());
    };
    const handleUnisUpdated = () => {
      setSavedUniIds(universitiesStore.savedIds());
    };
    window.addEventListener("foras:applications-updated", handleUpdate);
    window.addEventListener("foras:jobs-saved-updated", handleJobsUpdated);
    window.addEventListener("foras:universities-saved-updated", handleUnisUpdated);
    return () => {
      window.removeEventListener("foras:applications-updated", handleUpdate);
      window.removeEventListener("foras:jobs-saved-updated", handleJobsUpdated);
      window.removeEventListener("foras:universities-saved-updated", handleUnisUpdated);
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<AppStatus | "all", number> = { all: items.length, saved: 0, applied: 0, accepted: 0, rejected: 0 };
    items.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  const savedJobsList = useMemo(() => {
    const customJobs = dynamicStore.getJobs();
    return savedJobIds
      .map((id) => {
        const foundCustom = customJobs.find((j) => j.id === id);
        if (foundCustom) {
          return {
            id: foundCustom.id,
            title: ar ? foundCustom.title_ar : (foundCustom.title_en || foundCustom.title_ar),
            company: foundCustom.company,
            salary: foundCustom.salary || "$1,500/mo",
            url: foundCustom.apply_url,
            emoji: "💼",
            type: ar ? "عمل حر عن بعد" : "Remote Freelance",
          };
        }
        const foundStatic = JOBS.find((j) => j.id === id);
        if (foundStatic) {
          return {
            id: foundStatic.id,
            title: ar ? foundStatic.title : (foundStatic.titleEn || foundStatic.title),
            company: foundStatic.company,
            salary: `${foundStatic.salary.min} - ${foundStatic.salary.max} ${foundStatic.salary.currency}`,
            url: foundStatic.contact?.website || "#",
            emoji: foundStatic.emoji || "💼",
            type: ar ? foundStatic.type : (foundStatic.typeEn || foundStatic.type),
          };
        }
        return null;
      })
      .filter(Boolean) as {
        id: string;
        title: string;
        company: string;
        salary: string;
        url: string;
        emoji: string;
        type: string;
      }[];
  }, [savedJobIds, ar]);

  const savedUnisList = useMemo(() => {
    const metaMap = universitiesStore.getMetadataMap();
    return savedUniIds.map((id) => {
      const meta = metaMap[id];
      return {
        id,
        name: meta?.name || id,
        nameEn: meta?.nameEn,
        country: meta?.country || "",
        countryEn: meta?.countryEn,
        flag: meta?.flag || "🏛️",
        website: meta?.website || "#",
        type: meta?.type || "government",
      };
    });
  }, [savedUniIds]);

  // Helper to resolve localized title, org and country
  const getLocalizedData = (r: AppRecord) => {
    const origScholarship = SCHOLARSHIPS.find((s) => s.id === r.id);
    const data = r.data || origScholarship;

    const title = ar
      ? (r.title || data?.title || "")
      : (data?.titleEn || r.title || "");

    const org = ar
      ? (r.org || data?.org || "")
      : (data?.orgEn || r.org || "");

    const country = ar
      ? (r.country || data?.country || "")
      : (data?.countryEn || r.country || "");

    return { title, org, country };
  };

  const setStatus = (id: string, status: AppStatus) => {
    applicationsStore.setStatus(id, status);
    load();
    toast.success(ar ? "تم تحديث حالة المنحة" : "Application status updated");
  };

  // Delete single item with Undo notification
  const remove = (id: string) => {
    const itemToDelete = items.find((x) => x.id === id);
    if (!itemToDelete) return;

    applicationsStore.remove(id);
    load();

    const { title } = getLocalizedData(itemToDelete);

    toast(
      ar
        ? `تم حذف "${title.slice(0, 32)}..." من طلباتك`
        : `Removed "${title.slice(0, 32)}..." from applications`,
      {
        action: {
          label: ar ? "تراجع / إلغاء" : "Undo",
          onClick: () => {
            applicationsStore.restore(itemToDelete);
            load();
            toast.success(ar ? "تم استعادة المنحة بنجاح" : "Application restored successfully");
          },
        },
        duration: 6000,
      }
    );
  };

  // Batch delete with Undo
  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    const itemsToDelete = items.filter((x) => selectedIds.has(x.id));
    const ids = Array.from(selectedIds);

    applicationsStore.removeBatch(ids);
    setSelectedIds(new Set());
    setSelectionMode(false);
    load();

    toast(
      ar
        ? `تم حذف ${itemsToDelete.length} منحة من طلباتك`
        : `Removed ${itemsToDelete.length} applications`,
      {
        action: {
          label: ar ? "تراجع واستعادة الكل" : "Undo All",
          onClick: () => {
            applicationsStore.restoreBatch(itemsToDelete);
            load();
            toast.success(ar ? "تم استعادة جميع المنح بنجاح" : "All applications restored");
          },
        },
        duration: 7000,
      }
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((x) => x.id)));
    }
  };

  const openNote = (r: AppRecord) => {
    setEditingNote(r.id);
    setNoteDraft(r.notes ?? "");
  };

  const saveNote = (id: string) => {
    applicationsStore.setNotes(id, noteDraft.trim());
    setEditingNote(null);
    load();
    toast.success(ar ? "تم حفظ الملاحظات" : "Notes saved");
  };

  const daysLeft = (deadline?: string): number | null => {
    if (!deadline) return null;
    const d = new Date(deadline).getTime();
    if (Number.isNaN(d)) return null;
    return Math.ceil((d - Date.now()) / 86400000);
  };

  return (
    <div className="space-y-4 w-full pb-10">
      {/*  LUXE SEGMENTED TRACKER SWITCHER  */}
      <div className="p-1.5 bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-luxe flex items-center justify-between gap-1.5">
        <button
          onClick={() => setActiveTabSection("scholarships")}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTabSection === "scholarships"
              ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{ar ? `المنح (${items.length})` : `Scholarships (${items.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTabSection("jobs")}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTabSection === "jobs"
              ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{ar ? `العمل الحر (${savedJobIds.length})` : `Freelance (${savedJobIds.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTabSection("universities")}
          className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTabSection === "universities"
              ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{ar ? `الجامعات (${savedUniIds.length})` : `Unis (${savedUniIds.length})`}</span>
        </button>
      </div>

      {activeTabSection === "scholarships" ? (
        <div className="space-y-3">
          {/* Streamlined Applications Header & Action Control */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className={`flex items-center gap-2.5 ${alignClass}`}>
              <div className="w-8 h-8 rounded-xl bg-gold-gradient/20 border border-primary/40 flex items-center justify-center shadow-gold">
                <ClipboardList className="w-4 h-4 text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="font-display text-sm sm:text-base font-bold text-foreground">
                  {ar ? "متابعة الطلبات والمنح" : "Applications Tracker"}
                </h2>
                <p className="text-[10.5px] text-muted-foreground">
                  {ar ? `إجمالي الفرص المسجلة: ${items.length}` : `Total tracked items: ${items.length}`}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedIds(new Set());
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-semibold flex items-center gap-1.5 ${
                  selectionMode
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card/70 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{selectionMode ? (ar ? "إلغاء التحديد" : "Done") : (ar ? "تحديد متعدد" : "Select")}</span>
              </button>
            )}
          </div>

          {/* Compact Cloud Sync / Guest Status Alert */}
          {isGuest ? (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px]">
              <div className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{ar ? "وضع الحفظ المحلي (ضيف) — سجّل الدخول لحفظ ومزامنة طلباتك" : "Guest Mode — Sign in to sync across all devices"}</span>
              </div>
              <button
                type="button"
                onClick={() => nav("/auth")}
                className="font-bold underline text-amber-300 hover:text-amber-100 shrink-0 cursor-pointer"
              >
                {ar ? "تسجيل الدخول ↗" : "Sign In ↗"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>{ar ? "متزامن سحابياً مع حسابك في Cloud Firestore" : "Live Synced with your Cloud Account"}</span>
              </div>
              <span className="opacity-80 font-mono hidden sm:inline">{user?.email}</span>
            </div>
          )}

          {/*  Unified Interactive Filter Bar (Eliminates Duplicate KPI Boxes & Saves 140px)  */}
          <div
            dir={isRtl ? "rtl" : "ltr"}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
          >
            {(["all", ...STATUS_ORDER] as const).map((k) => {
              const active = filter === k;
              const label =
                k === "all"
                  ? (ar ? "الكل" : "All")
                  : (ar ? STATUS_META[k].label.ar : STATUS_META[k].label.en);
              const meta = k !== "all" ? STATUS_META[k] : null;
              const Icon = meta?.icon;

              return (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm select-none ${
                    active
                      ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold scale-[1.02]"
                      : "bg-card/70 border-border text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span>{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? "bg-black/25 text-white" : "bg-muted text-muted-foreground font-semibold"
                  }`}>
                    {counts[k] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Batch Selection Action Bar */}
          {selectionMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-card border border-primary/40 shadow-gold"
            >
              <button
                onClick={selectAll}
                className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                {selectedIds.size === filtered.length ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4 text-muted-foreground" />
                )}
                <span>{selectedIds.size === filtered.length ? (ar ? "إلغاء تحديد الكل" : "Deselect All") : (ar ? "تحديد الكل" : "Select All")}</span>
                <span className="text-muted-foreground">({selectedIds.size})</span>
              </button>

              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelected}
                  className="h-8 text-xs font-bold gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{ar ? `حذف المحدد (${selectedIds.size})` : `Delete Selected (${selectedIds.size})`}</span>
                </Button>
              )}
            </motion.div>
          )}

      {/* Applications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-6 bg-card/40 rounded-3xl border border-dashed border-border p-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-card-gradient border-gold flex items-center justify-center shadow-gold">
            <Bookmark className="w-10 h-10 text-primary" strokeWidth={1.3} />
          </div>
          <h3 className="font-display text-xl text-gold-gradient mb-2 font-bold">
            {ar ? "لا توجد طلبات في هذا القسم" : "No applications here yet"}
          </h3>
          <p className="text-muted-foreground text-xs max-w-md mx-auto leading-relaxed">
            {ar
              ? "اسحب أي منحة دراسية في تبويب (المنح والفرص) أو اضغط على أيقونة الحفظ لتظهر هنا وتتابع مراحل تقديمك خطوة بخطوة."
              : "Save or swipe scholarships in the Scholarships tab to track deadlines, application documents, and status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => {
              const meta = STATUS_META[r.status];
              const Icon = meta.icon;
              const dl = daysLeft(r.deadline);
              const isEditing = editingNote === r.id;
              const { title, org, country } = getLocalizedData(r);
              const isSelected = selectedIds.has(r.id);

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
                  transition={{ delay: i * 0.02 }}
                  className={`bg-card-gradient border rounded-2xl p-4 backdrop-blur-md transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-gold"
                      : "border-border hover:border-primary/40"
                  } ${alignClass}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox for batch select */}
                    {selectionMode ? (
                      <button
                        onClick={() => toggleSelect(r.id)}
                        className="mt-1 p-1 rounded-lg hover:bg-white/10 text-primary flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${meta.classes}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-base text-foreground line-clamp-2 leading-snug">
                        {title}
                      </h4>
                      {org && (
                        <p className="text-xs text-primary/90 font-semibold mt-0.5 truncate">
                          {org} {country ? `• ${country}` : ""}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.classes}`}>
                          {ar ? meta.label.ar : meta.label.en}
                        </span>

                        {dl !== null && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 font-semibold ${
                            dl < 0 ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : dl <= 14 ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-muted/40 text-muted-foreground border-border"
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {dl < 0
                              ? (ar ? "انتهى الموعد" : "Deadline Closed")
                              : (ar ? `متبقٍ ${dl} يوم` : `${dl} days left`)}
                          </span>
                        )}

                        <span className="text-[10px] text-muted-foreground">
                          {new Date(r.updatedAt).toLocaleDateString(ar ? "ar-EG" : "en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Status Selector Row */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-border/50 text-xs">
                    <span className="text-[10.5px] font-semibold text-muted-foreground">
                      {ar ? "الحالة:" : "Status:"}
                    </span>
                    <div className="inline-flex p-0.5 rounded-lg bg-background/70 border border-border/80 gap-0.5">
                      {STATUS_ORDER.map((s) => {
                        const on = r.status === s;
                        const m = STATUS_META[s];
                        return (
                          <button
                            key={s}
                            onClick={() => setStatus(r.id, s)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                              on
                                ? `${m.classes} shadow-sm font-black`
                                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                            }`}
                          >
                            {ar ? m.label.ar : m.label.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes Editor Section */}
                  {isEditing ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder={ar ? "المستندات المطلوبة، تاريخ المقابلة، ملاحظات خاصة..." : "Required documents, interview date, notes..."}
                        className={`min-h-24 bg-background/60 border-border text-xs ${alignClass}`}
                        dir={isRtl ? "rtl" : "ltr"}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="luxe" className="flex-1 text-xs" onClick={() => saveNote(r.id)}>
                          <Sparkles className="w-3.5 h-3.5 me-1" />
                          {ar ? "حفظ الملاحظات" : "Save Notes"}
                        </Button>
                        <Button size="sm" variant="ghostGold" className="text-xs" onClick={() => setEditingNote(null)}>
                          {ar ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  ) : r.notes ? (
                    <button
                      onClick={() => openNote(r)}
                      className={`mt-3 w-full text-xs text-muted-foreground bg-background/50 border border-border/80 rounded-xl p-2.5 hover:border-primary/40 transition-colors ${alignClass}`}
                    >
                      <span className="inline-flex items-center gap-1 text-primary font-bold mb-1">
                        <StickyNote className="w-3 h-3" />
                        {ar ? "ملاحظاتي الخاصة" : "My Private Notes"}
                      </span>
                      <p className="line-clamp-2 whitespace-pre-wrap text-foreground/90">{r.notes}</p>
                    </button>
                  ) : null}

                  {/* Card Bottom Actions */}
                  <div className="flex gap-2 mt-3 items-center">
                    {r.url && (
                      <Button
                        size="sm"
                        variant="luxe"
                        className="flex-1 text-xs h-9"
                        onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="w-3.5 h-3.5 me-1.5" />
                        {ar ? "الانتقال لرابط التقديم" : "Official Link"}
                      </Button>
                    )}
                    {!isEditing && (
                      <Button
                        size="sm"
                        variant="ghostGold"
                        className="h-9 px-3"
                        onClick={() => openNote(r)}
                        title={ar ? "إضافة أو تعديل ملاحظة" : "Edit Notes"}
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghostGold"
                      className="h-9 px-3 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(r.id)}
                      title={ar ? "حذف من طلباتي" : "Remove from Applications"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
        </div>
      ) : (
        /* ======================================================================= */
        /* 💼 SAVED JOBS & FREELANCE PLATFORMS SECTION (متزامنة مع Firestore)     */
        /* ======================================================================= */
        <div className="space-y-4">
          {savedJobsList.length === 0 ? (
            <div className="text-center py-16 px-6 bg-card/40 rounded-3xl border border-dashed border-border p-6 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-gold">
                <Briefcase className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {ar ? "لا توجد فرص عمل حر محفوظة بعد" : "No saved freelance platforms yet"}
              </h3>
              <p className="text-muted-foreground text-xs max-w-md mx-auto leading-relaxed">
                {ar
                  ? "تصفح قسم العمل الحر واحفظ المنصات وفرص العمل التي تهمك بالنقر على أيقونة الإشارة المرجعية (حفظ)، وستتزامن هنا سحابياً وتلقائياً عبر جميع أجهزتك."
                  : "Explore the Freelance section and bookmark platforms to sync them across all your devices."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {savedJobsList.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 bg-card/75 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between ${alignClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                          {job.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{job.company}</h3>
                          <p className="text-xs text-primary font-semibold">{job.type}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          jobsStore.toggle(job.id);
                          setSavedJobIds(jobsStore.savedIds());
                          toast.success(ar ? "تمت إزالة المنصة من المحفوظات" : "Platform removed from saved");
                        }}
                        className="p-1.5 rounded-lg border border-border bg-card/50 text-muted-foreground hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                        title={ar ? "إزالة من المحفوظات" : "Remove from saved"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-foreground/90 leading-snug line-clamp-1 mb-1.5">
                      {job.title}
                    </h4>
                  </div>

                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs mt-3">
                    <div className="flex items-center gap-1 font-bold text-gold-gradient">
                      <DollarSign className="w-3.5 h-3.5 text-primary" />
                      <span>{job.salary}</span>
                    </div>

                    {job.url && job.url !== "#" && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
                      >
                        <span>{ar ? "زيارة المنصة" : "Visit Platform"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🏛️ SAVED UNIVERSITIES TAB SECTION 🏛️ */}
      {activeTabSection === "universities" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
              </div>
              <div className={alignClass}>
                <h2 className="font-display text-lg text-gold-gradient leading-tight">
                  {ar ? "الجامعات المستهدفة ومتابعة القبول" : "Target Universities & Admissions"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {ar
                    ? "الجامعات العربية والعالمية المحفوظة والمتزامنة سحابياً مع حسابك في Firebase"
                    : "Saved Arab & Global universities synced in real-time with Firebase"}
                </p>
              </div>
            </div>
          </div>

          {savedUnisList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 sm:p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mx-auto text-2xl">
                🏛️
              </div>
              <h3 className="font-bold text-base text-foreground">
                {ar ? "لم تحفظ أي جامعات مستهدفة بعد" : "No Target Universities Saved Yet"}
              </h3>
              <p className="text-muted-foreground text-xs max-w-md mx-auto leading-relaxed">
                {ar
                  ? "تصفح دليل الجامعات واحفظ الجامعات التي تود استهدافها بالنقر على أيقونة الإشارة المرجعية (حفظ)، وستتزامن هنا سحابياً وتلقائياً عبر جميع أجهزتك."
                  : "Explore the Universities Directory and bookmark target institutions to track them here across all devices."}
              </p>
              <Button
                variant="luxe"
                size="sm"
                onClick={() => setSearchParams({ tab: "arabUnis" })}
                className="mt-2 text-xs font-bold"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{ar ? "استكشاف دليل الجامعات" : "Explore Universities Directory"}</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {savedUnisList.map((uni) => (
                <motion.div
                  key={uni.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 bg-card/75 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between ${alignClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                          {uni.flag}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {ar ? uni.name : (uni.nameEn || uni.name)}
                          </h3>
                          <p className="text-xs text-primary font-semibold">
                            {ar ? uni.country : (uni.countryEn || uni.country)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          universitiesStore.toggle(uni.id);
                          setSavedUniIds(universitiesStore.savedIds());
                          toast.success(ar ? "تمت إزالة الجامعة من المستهدفة" : "University removed from targets");
                        }}
                        className="p-1.5 rounded-lg border border-border bg-card/50 text-muted-foreground hover:text-rose-400 hover:border-rose-500/40 transition-colors shrink-0"
                        title={ar ? "إزالة من المستهدفة" : "Remove from targets"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs mt-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                      🏛️ {uni.type}
                    </span>

                    <div className="flex items-center gap-2">
                      {uni.website && uni.website !== "#" && (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
                        >
                          <span>{ar ? "البوابة الرسمية" : "Official Portal"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
