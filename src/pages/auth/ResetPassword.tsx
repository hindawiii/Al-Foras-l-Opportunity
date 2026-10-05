import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/foras/Logo";

const passwordSchema = z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }).max(72);

export default function ResetPassword() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    if (password !== confirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setBusy(true);
    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
        toast.success("تم تحديث كلمة المرور بنجاح");
        nav("/auth", { replace: true });
      } else {
        toast.success("تم تحديث كلمة المرور بنجاح");
        nav("/", { replace: true });
      }
    } catch (err: any) {
      toast.error(`تعذر تحديث كلمة المرور: ${err?.message || "رابط غير صالح"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="p-6 flex justify-center relative z-10">
        <BrandMark size={72} />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 pb-10 relative z-10">
        <div className="w-full max-w-md glass p-8 shadow-luxe rounded-3xl" dir="rtl">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
            <p className="text-xs text-muted-foreground mt-1">اختر كلمة مرور قوية لحماية حسابك</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>كلمة المرور الجديدة</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  dir="ltr"
                  className="h-11 ps-3 pe-10 rounded-xl bg-background/50 border-border text-foreground text-left"
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

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>تأكيد كلمة المرور</span>
              </Label>
              <Input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="أعد كتابة كلمة المرور"
                dir="ltr"
                className="h-11 rounded-xl bg-background/50 border-border text-foreground text-left"
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-brand text-sm"
            >
              {busy ? "جاري التحديث..." : "حفظ كلمة المرور"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
