import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowLeft, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/foras/Logo";

const emailSchema = z.string().trim().email({ message: "البريد الإلكتروني غير صحيح" }).max(255);
const passwordSchema = z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }).max(72);
const nameSchema = z.string().trim().min(2, { message: "الاسم قصير جداً" }).max(80);

type Mode = "login" | "signup" | "forgot";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
);

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r.error) { toast.error("تعذر تسجيل الدخول عبر جوجل"); return; }
      if (r.redirected) return;
      nav("/");
    } finally { setBusy(false); }
  };

  const handleMagicLink = async () => {
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) {
        console.error("[auth] magic link error:", error);
        const m = error.message || "";
        if (m.toLowerCase().includes("too many") || m.toLowerCase().includes("rate"))
          toast.error("محاولات كثيرة، انتظر دقيقة وحاول مجدداً");
        else toast.error(`تعذر إرسال الرابط: ${m}`);
        return;
      }
      toast.success("تم إرسال رابط الدخول إلى بريدك");
    } finally { setBusy(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      if (mode !== "forgot") passwordSchema.parse(password);
      if (mode === "signup") nameSchema.parse(name);
    } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("[auth] signIn error:", error);
          const m = error.message || "";
          if (m.includes("Invalid login credentials")) toast.error("البريد أو كلمة المرور غير صحيحة");
          else if (m.includes("Email not confirmed")) {
            toast.error("لم يتم تأكيد البريد. اضغط 'إعادة إرسال التأكيد' أدناه", { duration: 6000 });
            setShowResend(true);
          }
          else if (m.toLowerCase().includes("too many")) toast.error("محاولات كثيرة، انتظر دقيقة وحاول مجدداً");
          else if (m.toLowerCase().includes("network") || m.toLowerCase().includes("fetch")) toast.error("تعذر الاتصال بالخادم، تحقق من الإنترنت");
          else toast.error(`فشل تسجيل الدخول: ${m}`);
          return;
        }
        toast.success("مرحباً بعودتك");
        nav("/");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } }
        });
        if (error) {
          console.error("[auth] signUp error:", error);
          const m = error.message || "";
          if (m.includes("already registered") || m.includes("User already")) toast.error("هذا البريد مسجل مسبقاً");
          else if (m.toLowerCase().includes("pwned") || m.toLowerCase().includes("compromised") || m.toLowerCase().includes("leaked")) toast.error("كلمة المرور هذه مسربة في خرق بيانات معروف، اختر كلمة أقوى");
          else if (m.toLowerCase().includes("password")) toast.error(`كلمة المرور ضعيفة: ${m}`);
          else toast.error(`فشل إنشاء الحساب: ${m}`);
          return;
        }
        toast.success("تم إنشاء حسابك بنجاح");
        nav("/");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) { console.error("[auth] reset error:", error); toast.error(`تعذر إرسال رابط الاستعادة: ${error.message}`); return; }
        toast.success("تم إرسال رابط استعادة كلمة المرور إلى بريدك");
        setMode("login");
      }
    } finally { setBusy(false); }
  };

  const handleResendConfirmation = async () => {
    try { emailSchema.parse(email); } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup", email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) {
        console.error("[auth] resend error:", error);
        toast.error(`تعذر إعادة الإرسال: ${error.message}`);
        return;
      }
      toast.success("تم إعادة إرسال رابط التأكيد إلى بريدك");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-deep/20 rounded-full blur-3xl" />

      <div className="pt-8 pb-2 flex justify-center relative z-10">
        <BrandMark size={72} />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass p-8 shadow-luxe text-right rounded-3xl" dir="rtl">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-3xl text-gold-gradient mb-2 text-center">
                  {mode === "login" && "تسجيل الدخول"}
                  {mode === "signup" && "إنشاء حساب جديد"}
                  {mode === "forgot" && "استعادة كلمة المرور"}
                </h1>
                <p className="text-muted-foreground text-sm mb-8 text-center">
                  {mode === "login" && "أهلاً بك مجدداً في الفرص"}
                  {mode === "signup" && "ابدأ رحلتك نحو فرصتك القادمة"}
                  {mode === "forgot" && "أدخل بريدك وسنرسل لك رابط الاستعادة"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label className="text-foreground block text-right">الاسم الكامل</Label>
                      <div className="relative">
                        <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={name} onChange={e => setName(e.target.value)}
                          placeholder="أدخل اسمك"
                          className="pr-10 h-12 bg-input border-gold/30 focus:border-primary text-right" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-foreground block text-right">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="pl-10 pr-3 h-12 bg-input border-gold/30 focus:border-primary text-left" dir="ltr" />
                    </div>
                  </div>

                  {mode !== "forgot" && (
                    <div className="space-y-2">
                      <Label className="text-foreground block text-right">كلمة المرور</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input type={showPw ? "text" : "password"} value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-12 bg-input border-gold/30 focus:border-primary text-left" dir="ltr" />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="إظهار كلمة المرور">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {mode === "login" && (
                        <div className="flex justify-start pt-1">
                          <button type="button" onClick={() => setMode("forgot")}
                            className="text-xs text-primary hover:underline">
                            نسيت كلمة المرور؟
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === "login" && showResend && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={handleResendConfirmation} disabled={busy}
                      className="w-full text-primary hover:text-primary">
                      إعادة إرسال رابط التأكيد
                    </Button>
                  )}

                  <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={busy}>
                    {busy ? "جاري المعالجة..." :
                      mode === "login" ? "تسجيل الدخول" :
                      mode === "signup" ? "إنشاء الحساب" : "إرسال الرابط"}
                  </Button>
                </form>

                {mode !== "forgot" && (
                  <>
                    <div className="my-6 flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
                      <span className="text-xs text-muted-foreground">أو</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>
                    <Button type="button" variant="outline" size="lg"
                      onClick={handleGoogle} disabled={busy}
                      className="w-full bg-card border-gold/30 hover:bg-primary/10 hover:border-primary">
                      <GoogleIcon />
                      <span className="mr-2">المتابعة عبر جوجل</span>
                    </Button>
                    {mode === "login" && (
                      <Button type="button" variant="outline" size="lg"
                        onClick={handleMagicLink} disabled={busy || !email}
                        className="w-full mt-3 bg-card border-gold/30 hover:bg-primary/10 hover:border-primary">
                        <Sparkles className="w-5 h-5" />
                        <span className="mr-2">متابعة عبر البريد (رابط سحري)</span>
                      </Button>
                    )}
                  </>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === "login" && (
                    <>ليس لديك حساب؟ <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">أنشئ حساباً</button></>
                  )}
                  {mode === "signup" && (
                    <>لديك حساب؟ <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">سجّل دخولك</button></>
                  )}
                  {mode === "forgot" && (
                    <button onClick={() => setMode("login")} className="text-primary hover:underline inline-flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" />
                      العودة لتسجيل الدخول
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            بالمتابعة فإنك توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
