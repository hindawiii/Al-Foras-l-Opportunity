import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboardModal } from "@/components/foras/AdminDashboardModal";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Dedicated Fullscreen Admin Portal Page (/admin)
 * - Independent URL accessible directly via browser or bookmarks
 * - Supports full browser refresh without losing session or state
 * - Zero background scroll-bleed (isolated route)
 */
const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();

  useEffect(() => {
    document.title =
      lang === "ar"
        ? "بوابة الإدارة والتحديثات الشاملة | الفرص"
        : "Admin & Opportunities Control Portal | Al-Foras";
  }, [lang]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative flex flex-col" dir={dir}>
      <AdminDashboardModal
        isOpen={true}
        onClose={() => navigate("/app")}
        isStandalonePage={true}
      />
    </div>
  );
};

export default AdminPage;
