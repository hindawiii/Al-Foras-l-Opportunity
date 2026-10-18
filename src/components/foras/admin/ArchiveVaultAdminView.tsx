import { useState } from "react";
import {
  Archive, CheckCircle2, CheckSquare, Square, RotateCcw, Trash2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArchivedItem } from "@/lib/dynamicStore";
import { AdminUser } from "@/lib/adminAuthStore";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
  dir: string;
  archivedItems: ArchivedItem[];
  filteredArchive: ArchivedItem[];
  selectedIds: string[];
  currentUser: AdminUser | null;
  onToggleSelectItem: (id: string, idx: number, e: React.MouseEvent) => void;
  onRestoreItem: (id: string, title: string) => void;
  onPermanentlyDeleteItem: (id: string) => void;
  onEmptyArchive: () => void;
}

export const ArchiveVaultAdminView = ({
  isRtl,
  t,
  dir,
  archivedItems,
  filteredArchive,
  selectedIds,
  currentUser,
  onToggleSelectItem,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onEmptyArchive,
}: Props) => {
  const [emptyArchiveConfirmText, setEmptyArchiveConfirmText] = useState("");

  const handleEmptyVault = () => {
    onEmptyArchive();
    setEmptyArchiveConfirmText("");
  };

  return (
    <div className="flex-1 h-full overflow-y-auto space-y-6 pb-32 px-1 scrollbar-thin scrollbar-thumb-primary/20 overscroll-contain touch-pan-y">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-destructive">
          <Archive className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">
            {t("adminVaultTitle").replace("{count}", String(archivedItems.length))}
          </span>
        </div>
        <span className="text-gray-300">
          {t("adminVaultHint")}
        </span>
      </div>

      {filteredArchive.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-card/60 border border-primary/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h4 className="text-base font-bold text-white mb-1">
            {t("adminVaultEmpty")}
          </h4>
          <p className="text-xs text-gray-300">
            {t("adminVaultEmptyDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArchive.map((a, idx) => {
            const isSelected = selectedIds.includes(a.id);
            const title = a.itemData?.title_ar || a.itemData?.title || a.itemData?.titleEn || a.id;
            return (
              <div
                key={a.id}
                onClick={(e) => onToggleSelectItem(a.id, idx, e)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-primary/15 border-primary shadow-gold"
                    : "bg-card/70 border-primary/20 hover:border-primary/50"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="pt-1 sm:pt-0">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive flex-shrink-0">
                    <Archive className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white line-through opacity-80 leading-tight">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 mt-1">
                      <span className="text-primary font-semibold">
                        {a.type === "scholarship" ? (isRtl ? "منحة" : "Scholarship") : (isRtl ? "وظيفة" : "Job")}
                      </span>
                      <span>•</span>
                      <span>{isRtl ? `أرشف بواسطة: ${a.deletedBy?.name}` : `Deleted by: ${a.deletedBy?.name}`}</span>
                      <span>•</span>
                      <span>{new Date(a.deletedAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onRestoreItem(a.id, title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t("adminRestore")}</span>
                  </button>

                  {currentUser?.role === "super_admin" && (
                    <button
                      onClick={() => onPermanentlyDeleteItem(a.id)}
                      className="p-1.5 rounded-xl bg-destructive/15 border border-destructive/30 hover:bg-destructive/25 text-destructive transition-all cursor-pointer"
                      title={t("adminDeletePermanently")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DANGER ZONE (Super Admin Only) */}
      {currentUser?.role === "super_admin" && archivedItems.length > 0 && (
        <div className="mt-8 p-5 rounded-3xl bg-destructive/5 border-2 border-destructive/40 shadow-inner">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm sm:text-base mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{t("adminDangerZone")}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 mb-4">
            {t("adminDangerZoneDesc")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={emptyArchiveConfirmText}
              onChange={(e) => setEmptyArchiveConfirmText(e.target.value)}
              placeholder={t("adminTypeDeleteConfirm")}
              className="px-4 py-2.5 rounded-xl bg-background border-2 border-destructive/40 text-white text-xs sm:text-sm focus:border-destructive outline-none"
              dir={dir}
            />
            <Button
              variant="destructive"
              size="default"
              onClick={handleEmptyVault}
              disabled={
                emptyArchiveConfirmText.trim().toUpperCase() !== "DELETE" &&
                emptyArchiveConfirmText.trim() !== "تأكيد" &&
                emptyArchiveConfirmText.trim() !== "مسح"
              }
              className="font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mx-1.5" />
              <span>{t("adminEmptyVaultBtn")}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
