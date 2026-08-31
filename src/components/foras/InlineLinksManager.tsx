import React, { useState, useRef, useEffect } from "react";
import {
  LinkType,
  PersonalLink,
  PLATFORMS_LIST,
  formatPlatformUrl,
  getLinkDisplayHandle,
} from "@/lib/profileExtras";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Copy,
  Check,
  Globe,
  Trash2,
  Plus,
  Edit2,
  Sparkles,
  X,
  Save,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface InlineLinksManagerProps {
  links: PersonalLink[];
  onChange: (links: PersonalLink[]) => void;
  persona?: "student" | "professional";
  title?: string;
  subtitle?: string;
}

export const InlineLinksManager: React.FC<InlineLinksManagerProps> = ({
  links,
  onChange,
  persona = "student",
  title,
  subtitle,
}) => {
  const { lang, dir } = useLanguage();
  const ar = lang === "ar";

  // ID of the card currently being edited in-place
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  // Draft values during in-place editing
  const [editPlatformType, setEditPlatformType] = useState<LinkType>("linkedin");
  const [editInputVal, setEditInputVal] = useState<string>("");

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input automatically when editing begins
  useEffect(() => {
    if (editingCardId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCardId]);

  // Priority recommended platforms based on student vs professional personas
  const personaRecommended: LinkType[] =
    persona === "professional"
      ? ["linkedin", "github", "portfolio", "behance", "cv", "twitter"]
      : ["cv", "portfolio", "linkedin", "github", "telegram", "other"];

  // Start in-place editing for an existing link card
  const handleStartInPlaceEdit = (link: PersonalLink) => {
    setEditingCardId(link.id);
    setEditPlatformType(link.type);
    setEditInputVal(link.url);
    setConfirmDeleteId(null);
  };

  // Cancel in-place editing
  const handleCancelInPlaceEdit = () => {
    setEditingCardId(null);
    setEditInputVal("");
    setConfirmDeleteId(null);
  };

  // Save the in-place edited link card
  const handleSaveInPlace = (id: string) => {
    const trimmed = editInputVal.trim();
    if (!trimmed) {
      toast.error(ar ? "يرجى كتابة اسم المستخدم أو الرابط" : "Please enter a username or URL");
      return;
    }

    const formattedUrl = formatPlatformUrl(editPlatformType, trimmed);
    const updated = links.map((l) =>
      l.id === id ? { ...l, type: editPlatformType, url: formattedUrl } : l
    );

    onChange(updated);
    setEditingCardId(null);
    setEditInputVal("");
    toast.success(ar ? "تم حفظ وتحديث الرابط بنجاح ✓" : "Link saved successfully ✓");
  };

  // Add a new link immediately in-place
  const handleAddNewPlatform = (type: LinkType) => {
    // Check if the user already has this platform
    const existing = links.find((l) => l.type === type);
    if (existing) {
      handleStartInPlaceEdit(existing);
      toast.info(
        ar
          ? "المنصة مضافة مسبقاً، تم فتح الحقل للتعديل المباشر"
          : "Platform already exists, opened for editing"
      );
      return;
    }

    const newId = crypto.randomUUID();
    const newLink: PersonalLink = {
      id: newId,
      type,
      url: "",
    };

    // Append new link and immediately put it in editing mode
    onChange([...links, newLink]);
    setEditingCardId(newId);
    setEditPlatformType(type);
    setEditInputVal("");
    setConfirmDeleteId(null);
  };

  // Paste text directly from clipboard into the active in-place input
  const handlePasteToActive = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setEditInputVal(text.trim());
        toast.success(ar ? "تم اللصق من الحافظة" : "Pasted from clipboard");
      }
    } catch {
      toast.info(ar ? "يرجى اللصق يدوياً" : "Please paste manually");
    }
  };

  // Remove a link
  const handleDeleteLink = (id: string) => {
    const next = links.filter((l) => l.id !== id);
    onChange(next);
    if (editingCardId === id) {
      setEditingCardId(null);
    }
    setConfirmDeleteId(null);
    toast.success(ar ? "تم حذف الرابط بنجاح" : "Link removed successfully");
  };

  // Copy link URL with visual feedback
  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(ar ? "تم نسخ الرابط بنجاح" : "Link copied to clipboard");
  };

  // Active editing platform metadata
  const activeEditingPlatformMeta =
    PLATFORMS_LIST.find((p) => p.type === editPlatformType) || PLATFORMS_LIST[0];

  const liveFormattedUrl = editInputVal.trim()
    ? formatPlatformUrl(editPlatformType, editInputVal.trim())
    : "";

  return (
    <div className="space-y-4" dir={dir}>
      {/* Header Info */}
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              <span>{title}</span>
            </h4>
          )}
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Quick Add Platform Bar (Pills) */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-background/60 border border-border/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>{ar ? "إضافة رابط منصة جديدة:" : "Add a platform link:"}</span>
          </span>
          <span className="text-[10px] text-primary/80 font-medium hidden sm:inline">
            {persona === "professional"
              ? ar
                ? "💼 مسار الموظف والمهني"
                : "💼 Professional Persona"
              : ar
              ? "🎓 مسار الطالب والأكاديمي"
              : "🎓 Student Persona"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {PLATFORMS_LIST.map((p) => {
            const hasExisting = links.some((l) => l.type === p.type && l.url.trim().length > 0);
            const isRecommended = personaRecommended.includes(p.type);

            return (
              <button
                key={p.type}
                type="button"
                onClick={() => handleAddNewPlatform(p.type)}
                className={`group flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all active:scale-95 ${
                  hasExisting
                    ? "bg-primary/10 border-primary/40 text-primary font-bold hover:bg-primary/20 shadow-xs"
                    : isRecommended
                    ? "bg-card hover:bg-primary/15 border-border hover:border-primary/50 text-foreground shadow-xs"
                    : "bg-card/60 hover:bg-card border-border/60 text-muted-foreground hover:text-foreground"
                }`}
                title={ar ? `إضافة أو تعديل ${p.labelAr}` : `Add or edit ${p.labelEn}`}
              >
                <span className="text-sm transition-transform group-hover:scale-110">{p.emoji}</span>
                <span>{ar ? p.labelAr.split(" ")[0] : p.labelEn.split(" ")[0]}</span>
                {hasExisting ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                ) : (
                  <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Connected Links Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-foreground">
            {ar ? `قائمة الروابط (${links.length})` : `Links List (${links.length})`}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-primary/70" />
            <span>{ar ? "اضغط على زر التعديل للتعديل المباشر في نفس الحقل" : "Click edit to modify in-place"}</span>
          </span>
        </div>

        {links.length === 0 ? (
          <div className="p-6 rounded-2xl bg-card/40 border border-dashed border-border/90 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-foreground">
              {persona === "professional"
                ? ar
                  ? "لا توجد روابط مهنية أو معرض أعمال مضاف حالياً"
                  : "No professional or portfolio links added yet"
                : ar
                ? "لا توجد روابط سيرة ذاتية أو مواقع أكاديمية مضافة حالياً"
                : "No CV or academic links added yet"}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              {ar
                ? "اختر إحدى المنصات بالأعلى (LinkedIn، GitHub، السيرة الذاتية Drive، إلخ) لإضافتها لملفك الشخصي بنقرة واحدة."
                : "Choose any platform above (LinkedIn, GitHub, CV Drive, etc.) to add it to your profile."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const isEditingThis = editingCardId === link.id;
              const meta =
                PLATFORMS_LIST.find((p) => p.type === link.type) ||
                PLATFORMS_LIST[PLATFORMS_LIST.length - 1];
              const displayHandle = getLinkDisplayHandle(link.type, link.url);
              const isPendingConfirmDelete = confirmDeleteId === link.id;

              // IF CURRENT CARD IS IN EDITING MODE (IN-PLACE DIRECT EDITING)
              if (isEditingThis) {
                return (
                  <div
                    key={link.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-card to-background border-2 border-primary shadow-gold space-y-3 transition-all animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* In-Place Header with Platform Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border/70">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{activeEditingPlatformMeta.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary">
                            {ar
                              ? `تعديل رابط: ${activeEditingPlatformMeta.labelAr}`
                              : `Editing: ${activeEditingPlatformMeta.labelEn}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {ar ? activeEditingPlatformMeta.hintAr : activeEditingPlatformMeta.hintEn}
                          </span>
                        </div>
                      </div>

                      {/* Type switcher if user wants to change platform type for this card */}
                      <select
                        value={editPlatformType}
                        onChange={(e) => setEditPlatformType(e.target.value as LinkType)}
                        className="bg-card border border-border text-foreground text-xs rounded-xl px-2.5 py-1.5 focus:border-primary focus:outline-none"
                      >
                        {PLATFORMS_LIST.map((p) => (
                          <option key={p.type} value={p.type}>
                            {p.emoji} {ar ? p.labelAr : p.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* In-Place Input Form */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                        <div className="relative flex-1">
                          <Input
                            ref={inputRef}
                            value={editInputVal}
                            onChange={(e) => setEditInputVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveInPlace(link.id);
                              } else if (e.key === "Escape") {
                                handleCancelInPlaceEdit();
                              }
                            }}
                            placeholder={
                              ar
                                ? activeEditingPlatformMeta.placeholderAr
                                : activeEditingPlatformMeta.placeholderEn
                            }
                            className="bg-background border-primary/40 focus:border-primary text-xs sm:text-sm font-mono h-11 px-3 pr-8 shadow-inner"
                            dir="ltr"
                          />
                          {editInputVal && (
                            <button
                              type="button"
                              onClick={() => setEditInputVal("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
                              title={ar ? "مسح النص" : "Clear"}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Ergonomic In-Place Action Buttons (Ample Spacing, Clear Target) */}
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePasteToActive}
                            className="h-11 px-3.5 text-xs border-border/80 hover:border-primary text-foreground flex-shrink-0"
                            title={ar ? "لصق من الحافظة" : "Paste from clipboard"}
                          >
                            <Copy className="w-4 h-4 mr-1 text-primary" />
                            <span>{ar ? "لصق" : "Paste"}</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelInPlaceEdit}
                            className="h-11 px-3.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted/30 flex-shrink-0"
                          >
                            <X className="w-4 h-4 mr-1" />
                            <span>{ar ? "إلغاء" : "Cancel"}</span>
                          </Button>

                          <Button
                            type="button"
                            variant="gold"
                            size="sm"
                            onClick={() => handleSaveInPlace(link.id)}
                            className="h-11 px-5 text-xs font-bold shadow-gold flex-shrink-0"
                          >
                            <Save className="w-4 h-4 mr-1.5" />
                            <span>{ar ? "حفظ التعديل" : "Save Link"}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Live Link Verification & Preview while typing in-place */}
                      {liveFormattedUrl && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-background/80 border border-primary/20 text-[11px]">
                          <div className="flex items-center gap-1.5 text-primary font-mono truncate max-w-full sm:max-w-md">
                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              {ar ? "الرابط الناتج:" : "Formatted URL:"}
                            </span>
                            <span className="truncate text-foreground font-semibold" dir="ltr">
                              {liveFormattedUrl}
                            </span>
                          </div>
                          <a
                            href={liveFormattedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline font-bold px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/30"
                          >
                            <span>{ar ? "اختبار الرابط" : "Test Link"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // DISPLAY MODE (LUXE PRO CARD WITH ERGONOMIC TOOLBAR SPACING)
              return (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl bg-card/80 hover:bg-card border border-border/80 hover:border-primary/40 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Platform Icon, Name & Handle */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-background/90 border border-border/90 flex items-center justify-center text-xl flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {meta.emoji}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground truncate">
                          {ar ? meta.labelAr : meta.labelEn}
                        </span>
                        {link.url.trim().length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        )}
                      </div>

                      {link.url ? (
                        <p
                          className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors truncate max-w-xs sm:max-w-md"
                          dir="ltr"
                        >
                          {displayHandle || link.url.replace(/^https?:\/\//, "")}
                        </p>
                      ) : (
                        <span className="text-[10px] text-destructive/80 font-medium">
                          {ar ? "لم يتم إدخال الرابط بعد — اضغط تعديل" : "Empty URL — click edit to add"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Ergonomic Action Toolbar with Generous Spacing & Touch Targets */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/50 w-full sm:w-auto justify-end">
                    {/* Copy Button */}
                    {link.url && (
                      <button
                        type="button"
                        onClick={() => handleCopy(link.url, link.id)}
                        className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95 ${
                          copiedId === link.id
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-background/80 hover:bg-background border-border/80 text-muted-foreground hover:text-foreground"
                        }`}
                        title={ar ? "نسخ الرابط" : "Copy link"}
                      >
                        {copiedId === link.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] font-bold text-emerald-400">
                              {ar ? "تم النسخ" : "Copied"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[11px] hidden sm:inline">{ar ? "نسخ" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Open External Link Button */}
                    {link.url && (
                      <a
                        href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
                        title={ar ? "فتح الرابط في نافذة جديدة" : "Open link"}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">{ar ? "فتح" : "Open"}</span>
                      </a>
                    )}

                    {/* In-Place Edit Trigger Button */}
                    <button
                      type="button"
                      onClick={() => handleStartInPlaceEdit(link)}
                      className="h-9 px-3 rounded-xl border border-border/80 bg-card hover:bg-primary/15 hover:border-primary/40 text-foreground flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 shadow-xs"
                      title={ar ? "تعديل في نفس الحقل" : "Edit link in-place"}
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" />
                      <span>{ar ? "تعديل" : "Edit"}</span>
                    </button>

                    {/* Delete with Safe Confirmation to Prevent Misclicks */}
                    {isPendingConfirmDelete ? (
                      <div className="flex items-center gap-1.5 bg-destructive/10 p-1 rounded-xl border border-destructive/30 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          className="h-7 px-2 bg-destructive text-white rounded-lg text-[11px] font-bold hover:bg-destructive/90 transition-colors"
                        >
                          {ar ? "تأكيد الحذف" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 px-1.5 text-muted-foreground hover:text-foreground text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(link.id)}
                        className="h-9 w-9 rounded-xl border border-border/80 bg-card hover:bg-destructive/10 hover:border-destructive/40 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all active:scale-95"
                        title={ar ? "حذف الرابط" : "Delete link"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
