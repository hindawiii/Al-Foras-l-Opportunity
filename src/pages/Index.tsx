import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Onboarding } from "@/components/foras/Onboarding";
import { AppShell } from "@/pages/app/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("foras-onboarded") === "true");

  // TODO: إعادة تفعيل عند رجوع تسجيل الدخول — راجع AUTH_ROADMAP.md
  // useEffect(() => { if (!loading && !user) nav("/auth", { replace: true }); }, [loading, user, nav]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!onboarded) {
    return <Onboarding onDone={() => { localStorage.setItem("foras-onboarded", "true"); setOnboarded(true); }} />;
  }

  return <AppShell />;
};

export default Index;
