import React, { useState } from "react";
import { Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationsStore } from "@/lib/notificationsStorage";
import { toast } from "sonner";

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({
  isOpen,
  onClose,
  isRtl,
  t,
}) => {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastTitleEn, setBroadcastTitleEn] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTab, setBroadcastTab] = useState<"scholarships" | "jobs" | "arab_unis" | "news">("scholarships");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      toast.error(isRtl ? "يرجى تعبئة العنوان والنص الخاص بالإشعار" : "Title and message are required");
      return;
    }

    setIsBroadcasting(true);
    try {
      notificationsStore.addNotification({
        type: "urgent",
        category: "general",
        title: broadcastTitle.trim(),
        titleEn: broadcastTitleEn.trim() || broadcastTitle.trim(),
        message: broadcastBody.trim(),
        messageEn: broadcastBody.trim(),
        linkTab: broadcastTab,
        actionUrl: `/app?tab=${broadcastTab}`,
      });

      toast.success(
        isRtl
          ? "🚀 تم بث الإشعار بنجاح! سيظهر لجميع المستخدمين والزوار فوراً."
          : "🚀 Broadcast notification sent successfully to all users!"
      );
      setBroadcastTitle("");
      setBroadcastTitleEn("");
      setBroadcastBody("");
      onClose();
    } catch {
      toast.error(isRtl ? "حدث خطأ أثناء بث الإشعار" : "Failed to broadcast notification");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-amber-500/30 flex items-center justify-between bg-card/60">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-white text-base">
              {isRtl ? "بث إشعار عام لحظي لجميع المستخدمين" : "Broadcast Notification to All Users"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSendBroadcast} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isRtl ? "عنوان التنبيه (بالعربية) *" : "Notification Title (Arabic) *"}
            </label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder={isRtl ? "مثال: فتح باب التقديم لمنحة الحكومة التركية 2026" : "e.g. Turkiye Burslari 2026 Now Open"}
              className="w-full h-11 px-3 rounded-xl bg-card border border-primary/30 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isRtl ? "عنوان التنبيه (بالإنجليزية)" : "Notification Title (English)"}
            </label>
            <input
              type="text"
              value={broadcastTitleEn}
              onChange={(e) => setBroadcastTitleEn(e.target.value)}
              placeholder="e.g. Turkiye Burslari 2026 Open for Applications"
              className="w-full h-11 px-3 rounded-xl bg-card border border-primary/30 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary text-start"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isRtl ? "القسم المرتبط عند النقر" : "Target Section"}
            </label>
            <select
              value={broadcastTab}
              onChange={(e) => setBroadcastTab(e.target.value as any)}
              className="w-full h-11 px-3 rounded-xl bg-card border border-primary/30 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="scholarships">{isRtl ? "قسم المنح الدراسية" : "Scholarships"}</option>
              <option value="jobs">{isRtl ? "قسم وظائف العمل الحر" : "Jobs"}</option>
              <option value="arab_unis">{isRtl ? "دليل الجامعات العربية" : "Arab Universities"}</option>
              <option value="news">{isRtl ? "مركز الأخبار والاقتصاد" : "News & Economy"}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {isRtl ? "نص الإشعار والتفاصيل *" : "Notification Message *"}
            </label>
            <textarea
              rows={3}
              required
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder={isRtl ? "اكتب تفاصيل التنبيه المباشر الذي سيصل لجميع الطلاب..." : "Write message..."}
              className="w-full p-3 rounded-xl bg-card border border-primary/30 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-primary/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 text-xs font-bold cursor-pointer"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="luxe"
              disabled={isBroadcasting}
              className="h-10 px-6 text-xs font-bold shadow-gold flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white cursor-pointer"
            >
              <Radio className={`w-4 h-4 ${isBroadcasting ? "animate-spin" : ""}`} />
              <span>{isRtl ? "إرسال وبث فوري لجميع المستخدمين" : "Broadcast Now"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
