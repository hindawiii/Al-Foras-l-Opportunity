import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LinkType,
  PersonalLink,
  PlatformConfig,
  PLATFORMS_LIST,
  formatPlatformUrl,
  getLinkDisplayHandle,
} from "@/lib/profileExtras";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Clipboard, Check, Globe, Link as LinkIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LinkEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLink?: PersonalLink | null;
  defaultType?: LinkType;
  onSave: (link: PersonalLink) => void;
  onDelete?: (id: string) => void;
}

export const LinkEditorModal: React.FC<LinkEditorModalProps> = ({
  open,
  onOpenChange,
  initialLink,
  defaultType = "linkedin",
  onSave,
  onDelete,
}) => {
  const { lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";

  const [selectedType, setSelectedType] = useState<LinkType>(defaultType);
  const [inputVal, setInputVal] = useState("");
  const [computedUrl, setComputedUrl] = useState("");

  // Sync state on open / initialLink change
  useEffect(() => {
    if (open) {
      if (initialLink) {
        setSelectedType(initialLink.type);
        setInputVal(initialLink.url);
      } else {
        setSelectedType(defaultType);
        setInputVal("");
      }
    }
  }, [open, initialLink, defaultType]);

  // Compute live URL whenever inputs change
  useEffect(() => {
    const formatted = formatPlatformUrl(selectedType, inputVal);
    setComputedUrl(formatted);
  }, [selectedType, inputVal]);

  const currentPlatform = PLATFORMS_LIST.find((p) => p.type === selectedType) || PLATFORMS_LIST[0];

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputVal(text.trim());
          toast.success(ar ? "تم لصق الرابط من الحافظة!" : "Link pasted from clipboard!");
          return;
        }
      }
      toast.info(ar ? "الرجاء استخدام اختصار اللصق (Ctrl+V أو مطولاً)" : "Please paste directly into input");
    } catch {
      toast.info(ar ? "الرجاء لصق الرابط يدوياً في الحقل" : "Please paste the link directly");
    }
  };

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      toast.error(ar ? "الرجاء إدخال الرابط أو اسم المستخدم" : "Please enter a valid URL or username");
      return;
    }

    const finalUrl = formatPlatformUrl(selectedType, trimmed);
    const resultLink: PersonalLink = {
      id: initialLink?.id || crypto.randomUUID(),
      type: selectedType,
      url: finalUrl,
    };

    onSave(resultLink);
    onOpenChange(false);
    toast.success(
      ar
        ? `✅ تم حفظ رابط ${currentPlatform.labelAr} بنجاح!`
        : `✅ Saved ${currentPlatform.labelEn} link!`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border border-primary/40 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
        <DialogHeader className={isRtl ? "text-right" : "text-left"}>
          <DialogTitle className="text-base sm:text-lg font-black text-gold-gradient flex items-center gap-2">
            <span>{currentPlatform.emoji}</span>
            <span>{initialLink ? (ar ? "تعديل الرابط المهني" : "Edit Professional Link") : (ar ? "إضافة رابط مهني أو معرض أعمال" : "Add Professional Link & Portfolio")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {ar
              ? "اربط حساباتك المهنية وسيرتك الذاتية لتقوية ملفك أمام لجان المنح والجامعات والشركات."
              : "Connect your professional platforms and portfolio to boost your profile."}
          </DialogDescription>
        </DialogHeader>

        {/* 1. Platform Selector Chips */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary">
            {ar ? "1. اختر المنصة أو نوع الرابط:" : "1. Select Platform or Link Type:"}
          </Label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-background/50 rounded-2xl border border-border/80 custom-scrollbar">
            {PLATFORMS_LIST.map((p) => {
              const isSelected = selectedType === p.type;
              return (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => setSelectedType(p.type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gold-gradient text-primary-foreground shadow-gold font-bold scale-[1.02]"
                      : "bg-card/70 hover:bg-primary/10 text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{ar ? p.labelAr.split(" ")[0] : p.labelEn.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. URL / Username Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="link-url-input" className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              <span>{ar ? "2. أدخل الرابط أو اسم الحساب:" : "2. Enter URL or Username:"}</span>
            </Label>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Clipboard className="w-3 h-3" />
              <span>{ar ? "لصق من الحافظة" : "Paste"}</span>
            </button>
          </div>

          <div className="relative">
            <Input
              id="link-url-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={ar ? currentPlatform.placeholderAr : currentPlatform.placeholderEn}
              className="bg-input/90 border-gold/40 text-xs sm:text-sm font-mono py-2.5 ps-3 pe-9"
              dir="ltr"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal("")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            💡 {ar ? currentPlatform.hintAr : currentPlatform.hintEn}
          </p>
        </div>

        {/* 3. Live Formatted Preview & Test */}
        {computedUrl && (
          <div className="bg-primary/5 border border-primary/25 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-primary flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {ar ? "الرابط النهائي المحفوظ:" : "Final Resolved URL:"}
              </span>
              <a
                href={computedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span>{ar ? "تجربة وفتح الرابط" : "Test Link"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs font-mono text-foreground/90 truncate bg-background/80 px-2.5 py-1.5 rounded-lg border border-border/70 select-all" dir="ltr">
              {computedUrl}
            </p>
          </div>
        )}

        {/* 4. Action Buttons */}
        <div className="flex items-center justify-between pt-2 gap-2 border-t border-border/60">
          {initialLink && onDelete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onDelete(initialLink.id);
                onOpenChange(false);
                toast.success(ar ? "تم حذف الرابط بنجاح" : "Link removed");
              }}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>{ar ? "حذف" : "Delete"}</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={handleSave}
              className="text-xs font-bold shadow-gold px-4"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>{initialLink ? (ar ? "حفظ التعديل" : "Update") : (ar ? "إضافة الرابط" : "Add Link")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
