import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/foras/Logo";

const passwordSchema = z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }).max(72);

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { passwordSchema.parse(password); } catch (err) {
      if (err instanceof z.ZodError) { toast.error(err.errors[0].message); return; }
    }
    if (password !== confirm) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("[reset-password] update error:", error);
        const m = error.message || "";
        if (m.toLowerCase().includes("pwned") || m.toLowerCase().includes("leaked"))
          toast.error("كلمة المرور هذه مسربة، اختر كلمة أقوى");
        else toast.error(`تعذر تحديث كلمة المرور: ${m}`);
        return;
      }
      toast.success("تم تحديث كلمة المرور بنجاح");
      nav("/app", { replace: true });
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-deep/20 rounded-full blur-3xl" />
      <div className="p-6 flex justify-center relative z-10"><BrandMark size={72} /></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-10 relative z-10">
        <div className="w-full max-w-md glass p-8 shadow-luxe rounded-3xl" dir="rtl">
          <h1 className="font-display text-3xl text-gold-gradient mb-2 text-center">كلمة مرور جديدة</h1>
          <p className="text-muted-foreground text-sm mb-8 text-center">
            {ready ? "أدخل كلمة المرور الجديدة" : "جاري التحقق من رابط الاستعادة..."}
          </p>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground block text-right">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-input border-gold/30 focus:border-primary text-left" dir="ltr" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground block text-right">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input type={showPw ? "text" : "password"} value={confirm}
                  onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                  className="pl-10 pr-3 h-12 bg-input border-gold/30 focus:border-primary text-left" dir="ltr" />
              </div>
            </div>
            <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={busy || !ready}>
              {busy ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}