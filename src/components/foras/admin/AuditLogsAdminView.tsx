import { Unlock, ShieldCheck, RefreshCw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLog, LockoutState, AdminUser } from "@/lib/adminAuthStore";
import { selfHealingEngine } from "@/lib/selfHealingEngine";
import { toast } from "sonner";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
  auditLogs: AuditLog[];
  lockoutState: LockoutState;
  currentUser: AdminUser | null;
  onUnlockAccount: () => void;
}

export const AuditLogsAdminView = ({
  isRtl,
  t,
  auditLogs,
  lockoutState,
  currentUser,
  onUnlockAccount,
}: Props) => {
  return (
    <div className="flex-1 h-full overflow-y-auto space-y-3 pb-32 px-1 scrollbar-thin scrollbar-thumb-primary/20 overscroll-contain touch-pan-y">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
        <div className="text-xs text-gray-300">
          {t("adminAuditLogTitle").replace("{count}", String(auditLogs.length))}
        </div>

        {lockoutState.isLocked && currentUser?.role === "super_admin" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onUnlockAccount}
            className="font-bold text-xs shadow-md cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5 mx-1.5" />
            <span>
              {isRtl ? "إلغاء حظر تسجيل الدخول الأمني الآن" : "Clear Security Lockout"}
            </span>
          </Button>
        )}
      </div>

      {/* Self-Healing & Runtime Telemetry Control Panel */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-background border-2 border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-sm mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span>
                {isRtl ? "درع الأمان والإصلاح الذاتي للمستخدمين" : "User Self-Healing & Resilience Shield"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isRtl ? "نشط ومفعّل" : "Active"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isRtl
                ? `الأعطال المرصودة في الذاكرة: ${selfHealingEngine.getErrors().length} | تدريع فوري لأخطاء React والشبكة`
                : `Recorded errors in telemetry: ${selfHealingEngine.getErrors().length} | Runtime crash prevention`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selfHealingEngine.healAllJsonStorage();
              toast.success(
                isRtl
                  ? "تم فحص وتنظيف ذاكرة التطبيق وإصلاح أي تلف تلقائياً"
                  : "Storage scrub and auto-heal completed"
              );
            }}
            className="text-xs border-primary/30 hover:bg-primary/10 h-9 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mx-1.5" />
            <span>{isRtl ? "فحص وتطهير الذاكرة" : "Scrub & Self-Heal"}</span>
          </Button>

          {selfHealingEngine.getErrors().length > 0 && (
            <Button
              variant="luxe"
              size="sm"
              onClick={() => {
                const latest = selfHealingEngine.getErrors()[0];
                if (latest) {
                  const prompt = selfHealingEngine.generateAIFixPrompt(latest);
                  navigator.clipboard.writeText(prompt);
                  toast.success(
                    isRtl ? "تم نسخ تقرير الإصلاح الذكي للمطور!" : "AI fix report copied!"
                  );
                }
              }}
              className="text-xs h-9 font-bold shadow-gold"
            >
              <Copy className="w-3.5 h-3.5 mx-1.5" />
              <span>{isRtl ? "نسخ تقرير الخطأ للمطور" : "Copy AI Bug Report"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="p-3.5 rounded-xl bg-card/70 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  log.action.includes("LOCKOUT") || log.action.includes("FAILED")
                    ? "bg-destructive animate-pulse"
                    : "bg-primary"
                }`}
              />
              <span className="font-bold text-white">{log.actionAr || log.action}</span>
              <span className="text-gray-400">({log.userName})</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-[11px] font-mono bg-background/50 px-2 py-0.5 rounded border border-primary/20">
                {log.details}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString(isRtl ? "ar-EG" : "en-US")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
