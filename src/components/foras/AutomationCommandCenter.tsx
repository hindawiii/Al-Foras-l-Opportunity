import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Users,
  History,
  Send,
  Share2,
  ExternalLink,
  Sliders,
  Clock,
  UserPlus,
  Trash2,
  SlidersHorizontal,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface TeamMemberRecipient {
  id: string;
  name: string;
  email: string;
  whatsappPhone: string;
  role: string;
  notifyOn: "all" | "critical_only";
  active: boolean;
  addedAt?: string;
}

export interface PendingItemData {
  id: string;
  type: "scholarship" | "job";
  itemData: any;
  completenessScore: number;
  missingFields: string[];
  priority: "critical" | "medium" | "low";
  importanceReason: string;
  canDefer: boolean;
  status: "pending" | "approved" | "rejected";
  addedAt: string;
}

export interface AutomationCommandCenterProps {
  isRtl: boolean;
  currentUser: any;
  scholarshipsCount: number;
  jobsCount: number;
  onSyncClient: () => Promise<void>;
  initialSubTab?: "control" | "pending" | "team" | "logs";
}

export const AutomationCommandCenter: React.FC<AutomationCommandCenterProps> = ({
  isRtl,
  currentUser,
  scholarshipsCount,
  jobsCount,
  onSyncClient,
  initialSubTab = "control",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"control" | "pending" | "team" | "logs">(initialSubTab);

  // Status & Settings
  const [status, setStatus] = useState<{
    isRunning: boolean;
    lastRun: string | null;
    lastStatus: "idle" | "running" | "completed" | "failed";
    totalIngested: number;
    logs: Array<{ timestamp: string; level: "info" | "success" | "warn" | "error"; message: string }>;
  }>({
    isRunning: false,
    lastRun: null,
    lastStatus: "idle",
    totalIngested: 0,
    logs: [],
  });

  const [settings, setSettings] = useState<{
    publishMode: "smart_auto" | "strict_review" | "full_auto";
    qualityThreshold: number;
    emailNotificationsEnabled: boolean;
    whatsappNotificationsEnabled: boolean;
    whatsappApiKey?: string;
    teamRecipients: TeamMemberRecipient[];
    autoScheduleIntervalHours: number;
  }>({
    publishMode: "smart_auto",
    qualityThreshold: 90,
    emailNotificationsEnabled: true,
    whatsappNotificationsEnabled: true,
    whatsappApiKey: "",
    teamRecipients: [],
    autoScheduleIntervalHours: 24,
  });

  const [pendingItems, setPendingItems] = useState<PendingItemData[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // New Recipient Form State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("مشرف محتوى");
  const [newMemberNotifyOn, setNewMemberNotifyOn] = useState<"all" | "critical_only">("all");

  // Fetch Data Handlers
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/automation/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Background ping
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/automation/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // Silent error
    }
  }, []);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/automation/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingItems(data);
      }
    } catch {
      // Silent error
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/automation/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotificationHistory(data);
      }
    } catch {
      // Silent error
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchStatus(), fetchSettings(), fetchPending(), fetchNotifications()]);
  }, [fetchStatus, fetchSettings, fetchPending, fetchNotifications]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchStatus]);

  // Handle Publish Mode Selection
  const handleSelectMode = async (mode: "smart_auto" | "strict_review" | "full_auto") => {
    setIsSavingSettings(true);
    const updated = { ...settings, publishMode: mode };
    setSettings(updated);
    try {
      const res = await fetch("/api/automation/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishMode: mode }),
      });
      if (res.ok) {
        toast.success(
          isRtl
            ? `تم تفعيل وضع: ${
                mode === "smart_auto"
                  ? "النشر التلقائي الذكي (100% جودة)"
                  : mode === "strict_review"
                  ? "المراجعة الصارمة قبل النشر"
                  : "النشر التلقائي المباشر"
              }`
            : `Active mode changed to: ${mode}`
        );
      }
    } catch {
      toast.error(isRtl ? "تعذر حفظ التغييرات" : "Failed to save mode");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Run Automation
  const handleRunNow = async () => {
    setIsTriggering(true);
    toast.info(isRtl ? "بدء دورة الفحص الذكي والتدقيق التلقائي..." : "Starting AI engine run...");
    try {
      const res = await fetch("/api/automation/run", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || (isRtl ? "اكتملت الدورة بنجاح!" : "Engine cycle finished!"));
        await refreshAll();
        await onSyncClient();
      } else {
        toast.error(data.message || (isRtl ? "فشلت دورة الأوتوميشن" : "Automation failed"));
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ في الاتصال" : "Connection error"));
    } finally {
      setIsTriggering(false);
    }
  };

  // Sync Client
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncClient();
      await refreshAll();
      toast.success(isRtl ? "تمت المزامنة بنجاح!" : "Client synced!");
    } catch {
      toast.error(isRtl ? "فشلت المزامنة" : "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  // Approve Pending Review Item
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/pending/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isRtl ? "تم اعتماد الفرصة ونشرها فوراً في المنصة!" : "Approved and published!");
        await fetchPending();
        await onSyncClient();
      } else {
        toast.error(data.error || (isRtl ? "تعذر الاعتماد" : "Approval failed"));
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ غير متوقع" : "Unexpected error"));
    }
  };

  // Reject Pending Review Item
  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/pending/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "استبعاد من المشرف", user: currentUser }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.info(isRtl ? "تم استبعاد الفرصة ونقلها للأرشيف" : "Item rejected & archived");
        await fetchPending();
      } else {
        toast.error(isRtl ? "فشل الاستبعاد" : "Rejection failed");
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ غير متوقع" : "Unexpected error"));
    }
  };

  // Add Team Recipient
  const handleAddRecipient = async () => {
    if (!newMemberName.trim()) {
      toast.error(isRtl ? "يرجى كتابة اسم العضو" : "Please enter member name");
      return;
    }
    if (!newMemberEmail.trim() && !newMemberPhone.trim()) {
      toast.error(isRtl ? "يرجى تقديم بريد إلكتروني أو رقم واتساب" : "Email or WhatsApp is required");
      return;
    }

    const newMember: TeamMemberRecipient = {
      id: `member_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      whatsappPhone: newMemberPhone.trim(),
      role: newMemberRole,
      notifyOn: newMemberNotifyOn,
      active: true,
      addedAt: new Date().toISOString(),
    };

    const updatedTeam = [...(settings.teamRecipients || []), newMember];
    setSettings(prev => ({ ...prev, teamRecipients: updatedTeam }));
    setShowAddMemberModal(false);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");

    try {
      const res = await fetch("/api/automation/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamRecipients: updatedTeam }),
      });
      if (res.ok) {
        toast.success(isRtl ? `تمت إضافة "${newMember.name}" لفريق مستلمي البلاغات` : "Team member added");
      }
    } catch {
      toast.error(isRtl ? "تعذر حفظ العضو في السيرفر" : "Failed to save team member");
    }
  };

  // Remove Team Recipient
  const handleRemoveRecipient = async (id: string) => {
    const updatedTeam = settings.teamRecipients.filter(m => m.id !== id);
    setSettings(prev => ({ ...prev, teamRecipients: updatedTeam }));
    try {
      await fetch("/api/automation/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamRecipients: updatedTeam }),
      });
      toast.info(isRtl ? "تمت إزالة العضو من قائمة البلاغات" : "Member removed from alerts");
    } catch {
      toast.error(isRtl ? "فشل الحذف" : "Deletion failed");
    }
  };

  // Toggle Member Active Status
  const handleToggleMember = async (id: string) => {
    const updatedTeam = settings.teamRecipients.map(m => (m.id === id ? { ...m, active: !m.active } : m));
    setSettings(prev => ({ ...prev, teamRecipients: updatedTeam }));
    try {
      await fetch("/api/automation/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamRecipients: updatedTeam }),
      });
    } catch {
      // silent
    }
  };

  // Send Test Notification
  const handleSendTestNotification = async (recipientName: string, channel: "whatsapp" | "email") => {
    try {
      const res = await fetch("/api/automation/notify/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: recipientName, channel }),
      });
      if (res.ok) {
        toast.success(
          isRtl
            ? `تم إرسال بلاغ فحص تجريبي ناجح إلى ${recipientName}!`
            : `Test alert sent to ${recipientName}!`
        );
        await fetchNotifications();
      }
    } catch {
      toast.error(isRtl ? "فشل إرسال البلاغ التجريبي" : "Failed to send test alert");
    }
  };

  // Share via WhatsApp Web One-Click Generator
  const handleShareWhatsAppDigest = () => {
    const modeLabels: Record<string, string> = {
      smart_auto: "النشر التلقائي الذكي (للمكتمل 100% فقط)",
      strict_review: "المراجعة الصارمة قبل النشر (كل الفرص محتجزة)",
      full_auto: "النشر التلقائي المباشر",
    };

    const text =
      `📢 *تقرير إشعار محرك الأوتوميشن - منصة الفرص*\n` +
      `📅 *التاريخ:* ${new Date().toLocaleDateString("ar-SA")}\n` +
      `⚙️ *وضع الضبط النشط:* ${modeLabels[settings.publishMode] || settings.publishMode}\n` +
      `------------------------------------\n` +
      `🎓 *إجمالي المنح المنشورة:* ${scholarshipsCount}\n` +
      `💼 *إجمالي الوظائف المنشورة:* ${jobsCount}\n` +
      `⏳ *الفرص المحتجزة للمراجعة:* ${pendingItems.length}\n` +
      `⚡ *الفرص المكتشفة آلياً:* ${status.totalIngested || 0}\n\n` +
      `🔗 *رابط مراجعة واعتماد الفرص المعلقة:* https://alforas.com/admin?tab=automation\n` +
      `منصة الفرص | AlForas Engine`;

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
  };

  return (
    <div className="h-full overflow-y-auto p-1 sm:p-2 space-y-4 max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-primary/25 pb-24">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border-2 border-primary/30 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold shrink-0">
              <RefreshCw className={`w-6 h-6 text-primary-foreground ${isTriggering || status.isRunning ? "animate-spin" : ""}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isRtl ? "محرك الأوتوميشن ونظام الضبط الذكي" : "AI Ingestion & Smart Governance"}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isRtl ? "السيرفر المركزي متصل" : "Server Live"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5 leading-relaxed">
                {isRtl
                  ? "نظام ضبط متطور لجلب المنح المعتمدة ووظائف العمل الحر دولياً، وفحص اكتمال ومصداقية البيانات 100% قبل النشر مع نظام إبلاغ ذكي لفريق الإشراف."
                  : "Advanced automated pipeline ensuring 100% data quality, multi-mode publishing, and AI alerts dispatch to your team."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              variant="outline"
              className="flex-1 sm:flex-none border-primary/30 text-xs sm:text-sm h-10 px-3 cursor-pointer hover:border-primary"
            >
              <RefreshCw className={`w-4 h-4 me-1.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isRtl ? "مزامنة التطبيق" : "Sync Client"}
            </Button>
            <Button
              type="button"
              onClick={handleRunNow}
              disabled={isTriggering || status.isRunning}
              className="flex-1 sm:flex-none bg-gold-gradient text-primary-foreground font-bold shadow-gold text-xs sm:text-sm h-10 px-4 cursor-pointer hover:opacity-95"
            >
              <Sparkles className={`w-4 h-4 me-1.5 ${isTriggering ? "animate-spin" : ""}`} />
              {isTriggering || status.isRunning
                ? isRtl ? "جاري الفحص والجلب..." : "Running Ingestion..."
                : isRtl ? "تشغيل الأوتوميشن الآن" : "Run Ingestion Now"}
            </Button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-primary/20">
          <div className="p-3 rounded-xl bg-background/60 border border-primary/20">
            <span className="text-[11px] text-gray-400 block font-medium">
              {isRtl ? "منح السيرفر المعتمدة" : "Live Scholarships"}
            </span>
            <span className="text-lg sm:text-xl font-bold text-primary block mt-0.5">
              {scholarshipsCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-background/60 border border-primary/20">
            <span className="text-[11px] text-gray-400 block font-medium">
              {isRtl ? "وظائف السيرفر المعتمدة" : "Live Remote Jobs"}
            </span>
            <span className="text-lg sm:text-xl font-bold text-amber-400 block mt-0.5">
              {jobsCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-background/60 border border-primary/20 relative">
            <span className="text-[11px] text-gray-400 block font-medium">
              {isRtl ? "المراجعات المعلقة (محجوزة)" : "Pending Reviews"}
            </span>
            <span className={`text-lg sm:text-xl font-bold block mt-0.5 ${pendingItems.length > 0 ? "text-amber-400" : "text-gray-300"}`}>
              {pendingItems.length}
            </span>
            {pendingItems.length > 0 && (
              <span className="absolute top-2.5 end-2.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className="p-3 rounded-xl bg-background/60 border border-primary/20">
            <span className="text-[11px] text-gray-400 block font-medium">
              {isRtl ? "حالة المحرك" : "Engine State"}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white block mt-1">
              {status.isRunning
                ? isRtl ? "جاري الفحص الآن..." : "Running..."
                : isRtl ? "جاهز ومستعد" : "Idle (Ready)"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Navigator */}
      <div className="flex items-center gap-1.5 p-1 bg-card/80 border border-primary/20 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("control")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "control"
              ? "bg-primary text-primary-foreground shadow-gold"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isRtl ? "أوضاع النشر والضبط" : "Publishing Governance"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pending")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
            activeSubTab === "pending"
              ? "bg-primary text-primary-foreground shadow-gold"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>{isRtl ? "المراجعات المعلقة" : "Pending Reviews"}</span>
          {pendingItems.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === "pending" ? "bg-black/40 text-white" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {pendingItems.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("team")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "team"
              ? "bg-primary text-primary-foreground shadow-gold"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isRtl ? "فريق مستلمي البلاغات (واتساب/إيميل)" : "Alert Dispatch Team"}</span>
          <span className="text-[10px] opacity-75">({settings.teamRecipients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("logs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === "logs"
              ? "bg-primary text-primary-foreground shadow-gold"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{isRtl ? "سجل النشاط اللحظي" : "Execution Logs"}</span>
        </button>
      </div>

      {/* 3. Sub-Tab Content: [1] Control & Modes Selector */}
      {activeSubTab === "control" && (
        <div className="space-y-4">
          {/* Three-Mode Governance Cards */}
          <div className="p-5 rounded-2xl bg-card border-2 border-primary/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {isRtl ? "مفتاح التحكم ثلاثي الأوضاع (Automation Mode Selector)" : "Automation Mode Selector"}
                </h4>
                <p className="text-xs text-gray-300 mt-0.5">
                  {isRtl
                    ? "اختر سياسة النشر التي تناسبك بدقة لضمان مصداقية البيانات وجودة كل ما يُعرض للمستخدمين."
                    : "Select your publishing policy to control data quality and approval requirements."}
                </p>
              </div>
              {isSavingSettings && (
                <span className="text-xs text-primary flex items-center gap-1 font-semibold animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {isRtl ? "جاري الحفظ..." : "Saving..."}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              {/* Mode 1: Smart Auto (Recommended) */}
              <div
                onClick={() => handleSelectMode("smart_auto")}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  settings.publishMode === "smart_auto"
                    ? "bg-emerald-950/25 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                    : "bg-background/60 border-primary/20 hover:border-primary/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {isRtl ? "⭐ الوضع الموصى به" : "Recommended"}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      settings.publishMode === "smart_auto" ? "bg-emerald-500 border-emerald-500 text-black font-bold" : "border-gray-500"
                    }`}>
                      {settings.publishMode === "smart_auto" && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                  <h5 className="text-sm font-bold text-white">
                    {isRtl ? "النشر التلقائي الذكي" : "Smart Auto-Publish"}
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isRtl
                      ? "ينشر تلقائياً الفرص المكتملة بنسبة 100% فقط والتي اجتازت معايير الفحص السبعة الصارمة. أما الفرص ذات المعلومات الناقصة فتحتجز في 'المراجعة المعلقة'."
                      : "Publishes only 100% complete items passing all 7 criteria. Incomplete items are held in Pending Reviews."}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isRtl ? "توازن مثالي بين السرعة وجودة البيانات" : "Zero broken links guarantee"}
                </div>
              </div>

              {/* Mode 2: Strict Review First */}
              <div
                onClick={() => handleSelectMode("strict_review")}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  settings.publishMode === "strict_review"
                    ? "bg-amber-950/25 border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                    : "bg-background/60 border-primary/20 hover:border-primary/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {isRtl ? "🛡️ أقصى تحكم وحماية" : "Maximum Control"}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      settings.publishMode === "strict_review" ? "bg-amber-500 border-amber-500 text-black font-bold" : "border-gray-500"
                    }`}>
                      {settings.publishMode === "strict_review" && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                  <h5 className="text-sm font-bold text-white">
                    {isRtl ? "المراجعة الصارمة قبل النشر" : "Strict Review First"}
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isRtl
                      ? "يجلب المحرك كافة الفرص ويقوم بتنظيمها وتقييمها بالذكاء الاصطناعي، لكنه لا ينشر أي فرصة إطلاقاً حتى يراجعها المشرف ويضغط 'موافقة'."
                      : "Engine fetches & organizes everything, but publishes nothing until explicitly approved by an admin."}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {isRtl ? "سيطرة بشرية تامة بنسبة 100%" : "100% human supervised"}
                </div>
              </div>

              {/* Mode 3: Full Auto */}
              <div
                onClick={() => handleSelectMode("full_auto")}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  settings.publishMode === "full_auto"
                    ? "bg-sky-950/25 border-sky-500 ring-2 ring-sky-500/30 shadow-md"
                    : "bg-background/60 border-primary/20 hover:border-primary/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      {isRtl ? "⚡ نشر تلقائي كامل" : "Full Auto"}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      settings.publishMode === "full_auto" ? "bg-sky-500 border-sky-500 text-black font-bold" : "border-gray-500"
                    }`}>
                      {settings.publishMode === "full_auto" && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                  <h5 className="text-sm font-bold text-white">
                    {isRtl ? "نشر مباشر دون توقف" : "Direct Auto-Publish"}
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isRtl
                      ? "ينشر كافة الفرص والوظائف المستلمة فوراً ومباشرة دون أي تعقيب أو انتظار لمراجعة بشرية."
                      : "Publishes all incoming opportunities directly without manual moderation delay."}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRtl ? "سرعة قصوى وأتمتة كاملة" : "Maximum throughput"}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Standards Explanation Box */}
          <div className="p-5 rounded-2xl bg-card border-2 border-primary/30 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {isRtl ? "معايير التدقيق وفحص الاكتمال الآلي (Quality Validator)" : "Quality Validator Standards"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-1.5">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{isRtl ? "معايير المنح الدراسية (7 معايير)" : "Scholarships (7 Criteria)"}</span>
                </div>
                <ul className="space-y-1 text-gray-400 ps-4 list-disc">
                  <li>{isRtl ? "عنوان دقيق والجامعة/الجهة المانحة" : "Title & Accredited Org"}</li>
                  <li>{isRtl ? "الدولة وموقع الدراسة" : "Host Country"}</li>
                  <li>{isRtl ? "رابط التقديم الرسمي الصريح (Live URL)" : "Verified Apply URL"}</li>
                  <li>{isRtl ? "موعد انتهاء التقديم النهائي (Deadline)" : "Application Deadline"}</li>
                  <li>{isRtl ? "نوع التمويل (كامل 100% أو جزئي)" : "Coverage Type"}</li>
                  <li>{isRtl ? "المرحلة الدراسية والتخصصات" : "Degree Level & Majors"}</li>
                  <li>{isRtl ? "المتطلبات والشروط وتفاصيل المزايا" : "Requirements & Benefits"}</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{isRtl ? "معايير وظائف العمل الحر (6 معايير)" : "Remote Jobs (6 Criteria)"}</span>
                </div>
                <ul className="space-y-1 text-gray-400 ps-4 list-disc">
                  <li>{isRtl ? "المسمى الوظيفي باللغة العربية" : "Arabic Job Title"}</li>
                  <li>{isRtl ? "اسم الشركة المشغلة أو المنصة" : "Company / Platform"}</li>
                  <li>{isRtl ? "رابط التقدم المباشر الموثق" : "Direct Apply Link"}</li>
                  <li>{isRtl ? "نطاق الراتب والمقابل المالي" : "Salary / Compensation"}</li>
                  <li>{isRtl ? "التصنيف المهني الدقيق" : "Job Category"}</li>
                  <li>{isRtl ? "المهارات التقنية المطلوبة" : "Required Skills"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab Content: [2] Pending Reviews */}
      {activeSubTab === "pending" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                {isRtl ? "الفرص المحتجزة للمراجعة والتدقيق" : "Pending Opportunity Reviews"}
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                {isRtl
                  ? "فرص تم حجزها آلياً لنقص في بعض الحقول أو لتفعيل وضع 'المراجعة الصارمة'. مراجعتك تضمن مصداقية المنصة 100%."
                  : "Opportunities held by the validator for missing data or strict review policy."}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {pendingItems.length} {isRtl ? "فرصة معلقة" : "Pending items"}
            </span>
          </div>

          {pendingItems.length === 0 ? (
            <div className="p-10 rounded-2xl bg-card border-2 border-primary/20 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h5 className="text-base font-bold text-white">
                {isRtl ? "لا توجد أي فرص معلقة حالياً!" : "No pending items right now!"}
              </h5>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                {isRtl
                  ? "كافة الفرص والمنح في المنصة منشورة ومكتملة بالكامل وتطابق معايير الجودة. عند تشغيل المحرك واكتشاف أي فرصة ناقصة ستظهر هنا فوراً."
                  : "All live opportunities meet full quality standards. Any flagged or incomplete items will show up here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingItems.map((item) => {
                const data = item.itemData || {};
                const isScholarship = item.type === "scholarship";
                const title = isScholarship ? data.title || data.title_ar : data.title_ar || data.title_en;
                const entity = isScholarship ? data.org || data.university : data.company;
                const targetUrl = isScholarship ? data.url || data.apply_url : data.apply_url;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-card border-2 border-primary/30 shadow-md space-y-3 transition-all hover:border-primary/50"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                            isScholarship
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          {isScholarship ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                          {isScholarship ? (isRtl ? "منحة دراسية" : "Scholarship") : (isRtl ? "وظيفة عمل عن بعد" : "Remote Job")}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.priority === "critical"
                              ? "bg-destructive/20 text-red-300 border border-destructive/40 animate-pulse"
                              : item.priority === "medium"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/40"
                          }`}
                        >
                          {item.priority === "critical"
                            ? isRtl ? "🚨 أولوية قصوى / عاجل" : "🚨 Critical"
                            : item.priority === "medium"
                            ? isRtl ? "🟡 أولوية متوسطة" : "🟡 Medium"
                            : isRtl ? "⚪ يمكن تأجيلها" : "⚪ Low / Deferrable"}
                        </span>

                        {/* Completeness score badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10">
                          {isRtl ? `نسبة الاكتمال: ${item.completenessScore}%` : `Score: ${item.completenessScore}%`}
                        </span>
                      </div>

                      <span className="text-[11px] text-gray-400">
                        {new Date(item.addedAt).toLocaleString(isRtl ? "ar-SA" : "en-US")}
                      </span>
                    </div>

                    {/* Content Title & Details */}
                    <div>
                      <h5 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {title}
                      </h5>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                        <span><strong>{isRtl ? "الجهة:" : "Entity:"}</strong> {entity || "غير محدد"}</span>
                        {data.country && <span><strong>{isRtl ? "الدولة:" : "Country:"}</strong> {data.country}</span>}
                        {(data.amount || data.salary) && (
                          <span className="text-emerald-400 font-semibold">
                            {data.amount || data.salary}
                          </span>
                        )}
                        {data.deadline && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {data.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Dossier & Importance Reason Box */}
                    <div className="p-3 rounded-xl bg-background/80 border border-primary/20 text-xs space-y-1">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {isRtl ? "تقييم الذكاء الاصطناعي ومبرر الأهمية:" : "AI Triage Evaluation:"}
                      </span>
                      <p className="text-gray-200 leading-relaxed">
                        {item.importanceReason || (isRtl ? "فرصة مستخرجة بحاجة لمراجعة المشرف وتأكيد الروابط." : "Opportunity pending admin verification.")}
                      </p>
                    </div>

                    {/* Missing Fields Warning if any */}
                    {item.missingFields && item.missingFields.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-0.5">{isRtl ? "تنبيهات نقص البيانات المحتجزة بسببها:" : "Missing fields flagged:"}</strong>
                          <ul className="list-disc ps-4 space-y-0.5 text-amber-200/90 text-[11px]">
                            {item.missingFields.map((mf, i) => (
                              <li key={i}>{mf}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-primary/20">
                      {targetUrl ? (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isRtl ? "فحص الرابط الأصلي" : "Inspect Source Link"}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">{isRtl ? "لا يتوفر رابط أصلي" : "No link available"}</span>
                      )}

                      <div className="flex items-center gap-2 ms-auto">
                        <Button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          variant="outline"
                          className="h-9 px-3 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 me-1" />
                          {isRtl ? "استبعاد وحذف" : "Reject"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="h-9 px-4 text-xs font-bold bg-gold-gradient text-primary-foreground shadow-gold hover:opacity-90 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 me-1" />
                          {isRtl ? "موافقة ونشر الآن" : "Approve & Publish"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Sub-Tab Content: [3] Dispatch Alert Team */}
      {activeSubTab === "team" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border-2 border-primary/30">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {isRtl ? "فريق مستلمي البلاغات والتقارير الذكية" : "Multi-Recipient Dispatch Team"}
              </h4>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                {isRtl
                  ? "أضف أفراد فريق الإشراف ومسؤولي المنح لتلقي البلاغات الدورية والفرص الذهبية العاجلة عبر الإيميل والواتساب تلقائياً."
                  : "Configure multiple team members to receive automated briefings and urgent scholarship alerts."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleShareWhatsAppDigest}
                variant="outline"
                className="h-9 px-3 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 me-1.5" />
                {isRtl ? "مشاركة تقرير الواتساب الآن" : "Share via WhatsApp"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddMemberModal(true)}
                className="h-9 px-3 text-xs font-bold bg-gold-gradient text-primary-foreground shadow-gold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 me-1.5" />
                {isRtl ? "إضافة عضو مستلم" : "Add Recipient"}
              </Button>
            </div>
          </div>

          {/* Recipients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {settings.teamRecipients.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-card border border-primary/25 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-white">{member.name}</h5>
                      <span className="text-xs text-gray-400 block">{member.role}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleMember(member.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          member.active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                        }`}
                      >
                        {member.active ? (isRtl ? "مفعل" : "Active") : (isRtl ? "معطل" : "Disabled")}
                      </button>
                      {member.id !== "team_super_admin" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(member.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-destructive hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-300 space-y-1 pt-1">
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">📧 {isRtl ? "الإيميل:" : "Email:"}</span>
                        <span className="font-mono text-gray-200">{member.email}</span>
                      </div>
                    )}
                    {member.whatsappPhone && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">📱 {isRtl ? "واتساب:" : "WhatsApp:"}</span>
                        <span className="font-mono text-gray-200" dir="ltr">{member.whatsappPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-gray-400">{isRtl ? "نطاق التنبيهات:" : "Alerts:"}</span>
                      <span className="text-primary font-medium text-[11px]">
                        {member.notifyOn === "all"
                          ? (isRtl ? "كافة جولات الفحص" : "All check cycles")
                          : (isRtl ? "الفرص الحرجة والذهبية فقط" : "Critical opportunities only")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/15 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-500">
                    {member.addedAt ? new Date(member.addedAt).toLocaleDateString(isRtl ? "ar-SA" : "en-US") : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSendTestNotification(member.name, member.whatsappPhone ? "whatsapp" : "email")}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isRtl ? "إرسال فحص تجريبي" : "Send Test"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Dispatches Log Table */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border-2 border-primary/30 space-y-3">
            <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              {isRtl ? "سجل إرسال البلاغات الأخير (Notification History)" : "Recent Notification History"}
            </h5>
            {notificationHistory.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">
                {isRtl ? "لا توجد سجلات إرسال سابقة بعد." : "No notification logs recorded yet."}
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
                {notificationHistory.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2.5 rounded-xl bg-background/70 border border-primary/20 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{notif.recipient}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                            notif.channel === "whatsapp" ? "bg-emerald-500/20 text-emerald-300" : "bg-sky-500/20 text-sky-300"
                          }`}
                        >
                          {notif.channel}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{notif.summary}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Sub-Tab Content: [4] Live Terminal Logs */}
      {activeSubTab === "logs" && (
        <div className="p-5 rounded-2xl bg-card border-2 border-primary/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <h5 className="text-sm font-bold text-white">
                {isRtl ? "سجل نشاط محرك الأوتوميشن المباشر" : "Live Automation Execution Logs"}
              </h5>
            </div>
            {status.lastRun && (
              <span className="text-[11px] text-gray-400">
                {isRtl ? "آخر دورة:" : "Last run:"}{" "}
                {new Date(status.lastRun).toLocaleTimeString(isRtl ? "ar-SA" : "en-US")}
              </span>
            )}
          </div>

          <div className="rounded-xl bg-background/95 border border-primary/20 p-3.5 font-mono text-xs max-h-80 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-primary/20">
            {status.logs && status.logs.length > 0 ? (
              status.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 py-0.5 leading-relaxed">
                  <span className="text-[10px] text-gray-400 select-none shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                      log.level === "success"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : log.level === "error"
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : log.level === "warn"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-gray-200 break-words flex-1">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500 text-xs font-sans">
                {isRtl
                  ? "لا توجد سجلات بعد. اضغط على 'تشغيل الأوتوميشن الآن' لبدء جلب المنح والوظائف آلياً."
                  : "No logs yet. Click 'Run Ingestion Now' to start automated fetching."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Recipient Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border-2 border-primary/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  {isRtl ? "إضافة عضو جديد لفريق البلاغات" : "Add Alert Recipient"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {isRtl ? "اسم العضو / المشرف *" : "Member Name *"}
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={isRtl ? "مثال: م. أحمد أو د. سارة" : "e.g. John Doe"}
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-primary/30 text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {isRtl ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-primary/30 text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {isRtl ? "رقم الواتساب (مع مفتاح الدولة الدولي)" : "WhatsApp Phone (with Country Code)"}
                  </label>
                  <input
                    type="text"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="+966500000000 / +201000000000"
                    dir="ltr"
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-primary/30 text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {isRtl ? "الدور / الصفة" : "Role / Title"}
                  </label>
                  <input
                    type="text"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder={isRtl ? "مشرف محتوى / منسق منح" : "Scholarship Coordinator"}
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-primary/30 text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {isRtl ? "نوعية البلاغات المطلوبة" : "Alert Scope"}
                  </label>
                  <select
                    value={newMemberNotifyOn}
                    onChange={(e) => setNewMemberNotifyOn(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-primary/30 text-white outline-none focus:border-primary"
                  >
                    <option value="all">{isRtl ? "كافة البلاغات والفحوصات الدورية" : "All periodic check reports"}</option>
                    <option value="critical_only">{isRtl ? "الفرص الذهبية والحرجة فقط (Critical)" : "Critical / High priority only"}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-primary/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddMemberModal(false)}
                  className="h-9 px-4 text-xs"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  onClick={handleAddRecipient}
                  className="h-9 px-4 text-xs font-bold bg-gold-gradient text-primary-foreground shadow-gold"
                >
                  {isRtl ? "حفظ وإضافة" : "Save Member"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
