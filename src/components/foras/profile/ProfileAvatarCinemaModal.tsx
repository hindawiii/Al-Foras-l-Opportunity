import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Camera, Trash2, Loader2 } from "lucide-react";
import type { ProfileState } from "./profileTypes";

interface ProfileAvatarCinemaModalProps {
  previewOpen: boolean;
  pendingAvatarUrl: string | null;
  profile: ProfileState;
  hideProfile: boolean;
  initial: string;
  uploading: boolean;
  ar: boolean;
  onClose: () => void;
  confirmSavePendingAvatar: () => void;
  cancelPendingAvatar: () => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAvatar: () => void;
}

export const ProfileAvatarCinemaModal: React.FC<ProfileAvatarCinemaModalProps> = ({
  previewOpen,
  pendingAvatarUrl,
  profile,
  hideProfile,
  initial,
  uploading,
  ar,
  onClose,
  confirmSavePendingAvatar,
  cancelPendingAvatar,
  handleAvatarUpload,
  handleRemoveAvatar,
}) => {
  return (
    <AnimatePresence>
      {previewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Top Floating Controls */}
          <div className="w-full flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            {pendingAvatarUrl ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{ar ? "معاينة الصورة الجديدة قبل الحفظ" : "Previewing new photo before saving"}</span>
              </div>
            ) : <div />}

            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title={ar ? "إغلاق" : "Close"}
              aria-label={ar ? "إغلاق" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Cinema Media Display */}
          <div
            className="flex-1 w-full flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingAvatarUrl ? (
              <div className="flex flex-col items-center text-center space-y-3">
                <img
                  src={pendingAvatarUrl}
                  alt="avatar-pending-preview"
                  className="max-w-[88vw] max-h-[62vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.35)] border-2 border-primary"
                />
                <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
                  {ar ? "انقر 'حفظ الصورة' لاعتمادها كصورتك الشخصية، أو 'إلغاء' للتراجع" : "Click 'Save Photo' to confirm or 'Cancel' to discard"}
                </p>
              </div>
            ) : profile.avatar_url && !hideProfile ? (
              <img
                src={profile.avatar_url}
                alt="avatar-full"
                className="max-w-[92vw] max-h-[72vh] object-contain rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-primary/40"
              />
            ) : (
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-[32px] bg-gradient-to-br from-[#3D2C04] via-[#5C4308] to-[#1E2530] border-2 border-primary/60 flex items-center justify-center shadow-2xl">
                <span className="font-display text-8xl text-amber-200 font-bold">
                  {initial}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingAvatarUrl ? (
              <>
                <button
                  type="button"
                  onClick={cancelPendingAvatar}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{ar ? "إلغاء" : "Cancel"}</span>
                </button>

                <button
                  type="button"
                  onClick={confirmSavePendingAvatar}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gold-gradient text-primary-foreground font-bold text-xs sm:text-sm shadow-gold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{ar ? "حفظ الصورة" : "Save Photo"}</span>
                </button>
              </>
            ) : (
              <>
                <label className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gold-gradient text-primary-foreground font-bold text-sm cursor-pointer shadow-gold hover:brightness-110 active:scale-95 transition-all">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span>{ar ? "تغيير" : "Change"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>

                {profile.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/15 text-sm font-bold transition-all cursor-pointer active:scale-95"
                    title={ar ? "إزالة الصورة" : "Remove photo"}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{ar ? "حذف" : "Delete"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
