import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const nav = useNavigate();
  useEffect(() => {
    nav("/", { replace: true });
  }, [nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">جاري توجيهك إلى منصة الفرص...</p>
      </div>
    </div>
  );
}
