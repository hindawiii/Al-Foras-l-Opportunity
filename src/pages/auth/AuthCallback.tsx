import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[auth/callback] getSession error:", error);
          toast.error("تعذر إكمال تسجيل الدخول");
          nav("/auth", { replace: true });
          return;
        }
        if (data.session) {
          toast.success("تم تسجيل الدخول بنجاح");
          nav("/app", { replace: true });
        } else {
          nav("/auth", { replace: true });
        }
      } catch (e) {
        console.error("[auth/callback] exception:", e);
        nav("/auth", { replace: true });
      }
    })();
  }, [nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">جاري إكمال تسجيل الدخول...</p>
      </div>
    </div>
  );
}