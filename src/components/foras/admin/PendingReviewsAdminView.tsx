import { FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingItem, AdminUser } from "@/lib/adminAuthStore";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
  pendingItems: PendingItem[];
  currentUser: AdminUser | null;
  onApprovePending: (item: PendingItem) => void;
}

export const PendingReviewsAdminView = ({
  isRtl,
  t,
  pendingItems,
  currentUser,
  onApprovePending,
}: Props) => {
  return (
    <div className="flex-1 h-full overflow-y-auto space-y-3 pb-32 px-1 scrollbar-thin scrollbar-thumb-primary/20 overscroll-contain touch-pan-y">
      <div className="text-xs text-gray-300 mb-2">
        {t("adminPendingTitle").replace("{count}", String(pendingItems.length))}
      </div>

      {pendingItems.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-card/60 border border-primary/20">
          <FileCheck2 className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-white mb-1">{t("adminNoPending")}</h4>
        </div>
      ) : (
        pendingItems.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-between gap-3"
          >
            <div>
              <h4 className="text-sm font-bold text-white">
                {p.itemData?.title_ar || p.itemData?.title}
              </h4>
              <span className="text-xs text-gray-300">
                {isRtl ? `مقدم بواسطة: ${p.submittedBy.name}` : `By: ${p.submittedBy.name}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="luxe"
                size="sm"
                onClick={() => onApprovePending(p)}
                className="font-bold text-xs cursor-pointer"
              >
                {t("adminApprovePublish")}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
