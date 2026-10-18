import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dynamicStore } from "@/lib/dynamicStore";
import { adminAuthStore } from "@/lib/adminAuthStore";
import { toast } from "sonner";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
}

export const DataBackupAdminView = ({ isRtl, t }: Props) => {
  const handleExportBackup = () => {
    const data = {
      scholarships: dynamicStore.getScholarships(),
      jobs: dynamicStore.getJobs(),
      archive: dynamicStore.getArchivedItems(),
      auditLogs: adminAuthStore.getAuditLogs(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alforas_backup_${Date.now()}.json`;
    a.click();
    toast.success(
      isRtl ? "تم تصدير ملف النسخة الاحتياطية بنجاح" : "Backup exported"
    );
  };

  return (
    <div className="flex-1 h-full overflow-y-auto pb-32 px-1 scrollbar-thin scrollbar-thumb-primary/20 overscroll-contain touch-pan-y">
      <div className="p-6 rounded-2xl bg-card border-2 border-primary/30 max-w-xl mx-auto space-y-4">
        <h4 className="text-base font-bold text-white">{t("adminBackupTitle")}</h4>
        <p className="text-xs text-gray-300">{t("adminBackupDesc")}</p>
        <Button
          variant="luxe"
          onClick={handleExportBackup}
          className="w-full font-bold shadow-gold cursor-pointer"
        >
          <Download className="w-4 h-4 mx-2" />
          <span>{t("adminDownloadBackupBtn")}</span>
        </Button>
      </div>
    </div>
  );
};
