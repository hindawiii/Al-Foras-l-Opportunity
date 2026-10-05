import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowLeft, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/foras/Logo";

const emailSchema = z.string().trim().email({ message: "البريد الإلكتروني غير صحيح" }).max(255);
const passwordSchema = z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }).max(72);
const nameSchema = z.string().trim().min(2, { message: "الاسم قصير جداً" }).max(80);

type Mode = "login" | "signup" | "forgot";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

export default function AuthPage() {
  const nav = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        toast.error(res.error ? `تعذر تسجيل الدخول: ${res.error}` : "تعذر تسجيل الدخول عبر جوجل");
        return;
      }
      toast.success("تم تسجيل الدخول بنجاح عبر جوجل");
      nav("/");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      if (mode !== "forgot") passwordSchema.parse(password);
      if (mode === "signup") nameSchema.parse(name);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          toast.error("البريد أو كلمة المرور غير صحيحة");
          return;
        }
        toast.success("مرحباً بعودتك");
        nav("/");
      } else if (mode === "signup") {
        const res = await signUpWithEmail(email, password, name);
        if (!res.success) {
          toast.error(res.error || "فشل إنشاء الحساب");
          return;
        }
        toast.success("تم إنشاء حسابك بنجاح");
        nav("/");
      } else {
        await sendPasswordResetEmail(auth, email);
        toast.success("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(`حدث خطأ: ${err?.message || "يرجى المحاولة مجدداً"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-6 flex items-center justify-between relative z-10 max-w-md mx-auto w-full">
        <button
          onClick={() => nav("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>تخطي والعودة للتطبيق</span>
        </button>
        <BrandMark size={70} />
      </div>

      {/* Card Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12 relative z-10">
        <div className="w-full max-w-md glass p-6 sm:p-8 rounded-3xl shadow-luxe border border-border" dir="rtl">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {mode === "login" && "تسجيل الدخول إلى الفرص"}
              {mode === "signup" && "إنشاء حساب جديد"}
              {mode === "forgot" && "استعادة كلمة المرور"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {mode === "login" && "ادخل لحسابك لحفظ ومزامنة المنح وفرص العمل عبر أجهزتك"}
              {mode === "signup" && "سجل مجاناً للوصول لكافة الفرص ومتابعة طلباتك"}
              {mode === "forgot" && "أدخل بريدك وسنرسل لك رابطاً لإعادة تعيين كلمة المرور"}
            </p>
          </div>

          {/* Social Sign-In (Google One-Click) */}
          {mode !== "forgot" && (
            <div className="space-y-4 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full h-12 rounded-xl border-border bg-card/80 hover:bg-card text-foreground font-semibold flex items-center justify-center gap-3 shadow-sm hover:scale-[1.01] transition-all"
              >
                <GoogleIcon />
                <span>المتابعة باستخدام Google</span>
              </Button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-border/80 w-full" />
                <span className="bg-card px-3 text-[11px] text-muted-foreground absolute uppercase tracking-wider font-semibold">
                  أو بالبريد الإلكتروني
                </span>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-primary" />
                    <span>الاسم الكامل</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: محمد أحمد"
                    className="h-11 rounded-xl bg-background/60 border-border text-foreground text-sm focus:border-primary"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>البريد الإلكتروني</span>
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="h-11 rounded-xl bg-background/60 border-border text-foreground text-sm text-left focus:border-primary"
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span>كلمة المرور</span>
                  </Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="h-11 ps-3 pe-10 rounded-xl bg-background/60 border-border text-foreground text-sm text-left focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-brand hover:brightness-110 transition-all text-sm mt-2"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" && "تسجيل الدخول"}
                  {mode === "signup" && "إنشاء الحساب"}
                  {mode === "forgot" && "إرسال رابط الاستعادة"}
                </>
              )}
            </Button>
          </form>

          {/* Switch Mode Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <p>
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary font-bold hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary font-bold hover:underline"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
