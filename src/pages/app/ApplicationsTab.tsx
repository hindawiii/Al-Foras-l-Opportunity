import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, CheckCircle2, Trash2, FileText, ExternalLink, Trophy, XCircle,
  ClipboardList, StickyNote, Filter, Calendar, Sparkles, Undo2, CheckSquare,
  Square, ShieldAlert, AlertCircle, ArrowLeft, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsStore, type AppRecord, type AppStatus } from "@/lib/applicationsStorage";
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
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [items, setItems] = useState<AppRecord[]>([]);
  const [filter, setFilter] = useState<AppStatus | "all">("all");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const load = () => setItems(applicationsStore.all());
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<AppStatus | "all", number> = { all: items.length, saved: 0, applied: 0, accepted: 0, rejected: 0 };
    items.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

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
      {/* Header stats banner */}
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
            </div>
            <div className={alignClass}>
              <h2 className="font-display text-lg text-gold-gradient leading-tight">
                {ar ? "قائمة تحقق التقديم والطلبات" : "My Applications & Checklist"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {ar ? "تابع مسار كل منحة من الحفظ إلى القبول النهائي" : "Track every scholarship from saved to final acceptance"}
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
              <span>{selectionMode ? (ar ? "إنهاء التحديد" : "Cancel Select") : (ar ? "تحديد متعدد" : "Select")}</span>
            </button>
          )}
        </div>

        {/* Status Counts */}
        <div className="grid grid-cols-4 gap-2">
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            return (
              <div key={s} className={`rounded-xl border p-2 text-center transition-all ${meta.classes}`}>
                <div className="text-lg font-bold leading-none">{counts[s] ?? 0}</div>
                <div className="text-[10px] mt-1 opacity-90 font-medium">
                  {ar ? meta.label.ar : meta.label.en}
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Filters Bar */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        {(["all", ...STATUS_ORDER] as const).map((k) => {
          const active = filter === k;
          const label =
            k === "all"
              ? (ar ? "الكل" : "All")
              : (ar ? STATUS_META[k].label.ar : STATUS_META[k].label.en);
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                active
                  ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold scale-[1.02]"
                  : "bg-card/40 border-border text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              {label} · {counts[k] ?? 0}
            </button>
          );
        })}
      </div>

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

                  {/* Status switcher buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-border/70">
                    <span className="text-[10px] font-bold text-muted-foreground self-center me-1">
                      {ar ? "تغيير الحالة:" : "Change Status:"}
                    </span>
                    {STATUS_ORDER.map((s) => {
                      const on = r.status === s;
                      const m = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setStatus(r.id, s)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            on ? `${m.classes} scale-105 shadow-sm` : "bg-card/40 border-border text-muted-foreground hover:text-foreground hover:bg-card"
                          }`}
                        >
                          {ar ? m.label.ar : m.label.en}
                        </button>
                      );
                    })}
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
                          <Sparkles className={`w-3.5 h-3.5 ${isRtl ? "ml-1" : "mr-1"}`} />
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
                        <ExternalLink className={`w-3.5 h-3.5 ${isRtl ? "ml-1.5" : "mr-1.5"}`} />
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
  );
};
