import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, X, Mail, CheckCircle2, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarMaskedInput } from "@/components/foras/StarMaskedInput";
import { adminAuthStore, UNIFIED_ADMIN_EMAIL } from "@/lib/adminAuthStore";
import { toast } from "sonner";

interface AdminRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  onSuccess: () => void;
}

export const AdminRecoveryModal: React.FC<AdminRecoveryModalProps> = ({
  isOpen,
  onClose,
  isRtl,
  dir,
  t,
  onSuccess,
}) => {
  const [recoveryStep, setRecoveryStep] = useState<"send_otp" | "verify_otp" | "new_password">("send_otp");
  const [isSendingRecoveryOtp, setIsSendingRecoveryOtp] = useState(false);
  const [recoveryOtpDigits, setRecoveryOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const recoveryOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [showRecoveryNewPass, setShowRecoveryNewPass] = useState(false);
  const [showRecoveryConfirmPass, setShowRecoveryConfirmPass] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4"
          dir={dir}
        >
          <div className="flex items-center justify-between border-b border-primary/20 pb-3">
            <div className="flex items-center gap-2 text-primary font-bold">
              <KeyRound className="w-5 h-5" />
              <span className="text-base text-white">{t("adminRecoveryTitle")}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step 1: Send OTP to Unified Email */}
          {recoveryStep === "send_otp" && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-gray-300 space-y-1.5">
                <p className="font-bold text-white text-xs">{t("adminRecoveryDesc")}</p>
                <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-xs pt-1" dir="ltr">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{UNIFIED_ADMIN_EMAIL}</span>
                </div>
              </div>

              <p className="text-2xs text-gray-400 leading-relaxed">
                {isRtl
                  ? "عند الضغط على إرسال، سيقوم النظام بتوليد رمز تحقق آمن مكون من 6 أرقام وإرساله للبريد الرسمي الموحد لضمان أمان اللوحة."
                  : "Clicking send will generate a secure 6-digit one-time passcode to the verified unified email address."}
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
                  {t("adminCancel")}
                </Button>
                <Button
                  variant="luxe"
                  size="sm"
                  disabled={isSendingRecoveryOtp}
                  onClick={() => {
                    setIsSendingRecoveryOtp(true);
                    setTimeout(() => {
                      const res = adminAuthStore.sendRecoveryOtp();
                      setIsSendingRecoveryOtp(false);
                      if (res.success) {
                        toast.success(res.message || t("adminOtpSentMsg"));
                        setRecoveryStep("verify_otp");
                      } else {
                        toast.error(res.message);
                      }
                    }, 500);
                  }}
                  className="font-bold shadow-gold cursor-pointer"
                >
                  <Mail className="w-4 h-4 mx-1.5" />
                  <span>{isSendingRecoveryOtp ? (isRtl ? "جاري الإرسال..." : "Sending...") : t("adminSendOtpBtn")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Enter & Verify 6-digit OTP */}
          {recoveryStep === "verify_otp" && (
            <div className="space-y-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-gray-200">
                <p>{t("adminOtpSentMsg")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-200 mb-2">
                  {t("adminEnterOtpLabel")}
                </label>

                <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 py-1" dir="ltr">
                  {recoveryOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (recoveryOtpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const val = e.target.value.replace(/[^\d]/g, "").slice(-1);
                        const updated = [...recoveryOtpDigits];
                        updated[idx] = val;
                        setRecoveryOtpDigits(updated);
                        if (val && idx < 5) recoveryOtpRefs.current[idx + 1]?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !digit && idx > 0) {
                          recoveryOtpRefs.current[idx - 1]?.focus();
                        }
                      }}
                      onPaste={e => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/[^\d]/g, "").slice(0, 6);
                        if (!pasted) return;
                        const digits = pasted.split("");
                        const updated = [...recoveryOtpDigits];
                        for (let i = 0; i < 6; i++) {
                          updated[i] = digits[i] || "";
                        }
                        setRecoveryOtpDigits(updated);
                        const next = Math.min(digits.length, 5);
                        recoveryOtpRefs.current[next]?.focus();
                      }}
                      className={`w-8 h-10 xs:w-9 xs:h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-bold rounded-lg sm:rounded-xl border-2 transition-all outline-none ${
                        digit
                          ? "border-primary bg-white text-gray-950 shadow-gold"
                          : "border-primary/40 bg-white/95 text-gray-900 focus:border-primary focus:bg-white"
                      }`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecoveryStep("send_otp")}
                  className="cursor-pointer"
                >
                  {isRtl ? "إعادة إرسال" : "Resend"}
                </Button>
                <Button
                  variant="luxe"
                  size="sm"
                  onClick={() => {
                    const code = recoveryOtpDigits.join("");
                    const verifyRes = adminAuthStore.verifyRecoveryOtp(code);
                    if (verifyRes.success) {
                      toast.success(verifyRes.message);
                      setRecoveryStep("new_password");
                    } else {
                      toast.error(verifyRes.message);
                    }
                  }}
                  className="font-bold shadow-gold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 mx-1.5" />
                  <span>{t("adminVerifyOtpBtn")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Set New Password & Unlock Account */}
          {recoveryStep === "new_password" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1">
                  {t("adminNewPasswordLabel")}
                </label>
                <div className="relative">
                  <StarMaskedInput
                    value={recoveryNewPassword}
                    onChange={setRecoveryNewPassword}
                    showPlain={showRecoveryNewPass}
                    placeholder="★★★★★★"
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-sm outline-none ps-4 pe-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryNewPass(p => !p)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-600 hover:text-gray-900 cursor-pointer p-1"
                  >
                    {showRecoveryNewPass ? <EyeOff className="w-4 h-4 text-gray-700" /> : <Eye className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1">
                  {t("adminConfirmNewPasswordLabel")}
                </label>
                <div className="relative">
                  <StarMaskedInput
                    value={recoveryConfirmPassword}
                    onChange={setRecoveryConfirmPassword}
                    showPlain={showRecoveryConfirmPass}
                    placeholder="★ ★ ★ ★ ★ ★"
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-sm outline-none ps-4 pe-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryConfirmPass(p => !p)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-600 hover:text-gray-900 cursor-pointer p-1"
                  >
                    {showRecoveryConfirmPass ? <EyeOff className="w-4 h-4 text-gray-700" /> : <Eye className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
                  {t("adminCancel")}
                </Button>
                <Button
                  variant="luxe"
                  size="sm"
                  onClick={() => {
                    if (!recoveryNewPassword.trim() || recoveryNewPassword.length < 4) {
                      toast.error(isRtl ? "يجب أن تكون كلمة المرور 4 خانات على الأقل" : "Password must be at least 4 chars");
                      return;
                    }
                    if (recoveryNewPassword !== recoveryConfirmPassword) {
                      toast.error(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
                      return;
                    }

                    const code = recoveryOtpDigits.join("");
                    const resetRes = adminAuthStore.resetAdminPasswordWithOtp(code, recoveryNewPassword);
                    if (resetRes.success) {
                      toast.success(resetRes.message || (isRtl ? "تم تغيير كلمة المرور وفك الحظر بنجاح!" : "Password updated & lockout reset!"));
                      onSuccess();
                      onClose();
                    } else {
                      toast.error(resetRes.message);
                    }
                  }}
                  className="font-bold shadow-gold cursor-pointer"
                >
                  <LockKeyhole className="w-4 h-4 mx-1.5" />
                  <span>{t("adminSaveNewPasswordBtn")}</span>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
