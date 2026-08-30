import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Sparkles, Plus, Trash2, Edit3, ExternalLink, Check, X,
  RefreshCw, Globe, Search, ArrowRight, ArrowLeft, Download, AlertCircle,
  Briefcase, GraduationCap, Lock, Eye, EyeOff, Users, FileCheck2, History,
  KeyRound, Mail, UserCheck, ShieldAlert, CheckCircle2, XCircle,
  Archive, RotateCcw, Menu, ChevronRight, ChevronLeft, AlertTriangle,
  Upload, Layers, CheckSquare, Square, MinusSquare, Building2, Globe2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scholarship } from "@/lib/mockData";
import { dynamicStore, CustomJobItem, ArchivedItem } from "@/lib/dynamicStore";
import { adminAuthStore, AdminUser, AuditLog, PendingItem, AdminRole } from "@/lib/adminAuthStore";
import { ARAB_UNIVERSITIES, ARAB_COUNTRY_STATS } from "@/lib/arabUniversities";
import { GLOBAL_COUNTRIES } from "@/lib/globalUniversities";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SecurityPasswordManager } from "@/components/foras/SecurityPasswordManager";

export const AdminDashboardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { lang, dir, t } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  // Active Task Section in Slide Sidebar
  type AdminTab =
    | "scholarships"
    | "jobs"
    | "arab_unis"
    | "global_unis"
    | "archive"
    | "url_parser"
    | "pending_reviews"
    | "team"
    | "audit_logs"
    | "backup"
    | "security";

  const [activeTab, setActiveTab] = useState<AdminTab>("scholarships");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Current session & Users
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => adminAuthStore.getCurrentSession());
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);

  // Login form state
  const [identifierInput, setIdentifierInput] = useState("alforas.one@gmail.com");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password change state
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  // Data lists
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [jobs, setJobs] = useState<CustomJobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-Selection State (Selection System from Video 1)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Editing state
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [editingJob, setEditingJob] = useState<CustomJobItem | null>(null);
  const [editingMember, setEditingMember] = useState<AdminUser | null>(null);

  // URL Parser State
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"scholarship" | "job">("scholarship");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  // Danger Zone confirmation state
  const [emptyArchiveConfirmText, setEmptyArchiveConfirmText] = useState("");
  const [isDeletingConfirmOpen, setIsDeletingConfirmOpen] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{
    id: string;
    type: "scholarship" | "job";
    title: string;
  } | null>(null);

  const loadData = () => {
    setScholarships(dynamicStore.getScholarships());
    setJobs(dynamicStore.getJobs());
    setArchivedItems(dynamicStore.getArchivedItems());
    setTeamMembers(adminAuthStore.getUsers());
    setAuditLogs(adminAuthStore.getAuditLogs());
    setPendingItems(adminAuthStore.getPendingItems());
    setCurrentUser(adminAuthStore.getCurrentSession());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedIds([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdates = () => loadData();
    window.addEventListener("foras:data-updated", handleUpdates);
    window.addEventListener("foras:archive-updated", handleUpdates);
    window.addEventListener("foras:audit-updated", handleUpdates);
    return () => {
      window.removeEventListener("foras:data-updated", handleUpdates);
      window.removeEventListener("foras:archive-updated", handleUpdates);
      window.removeEventListener("foras:audit-updated", handleUpdates);
    };
  }, []);

  // Clear selection when changing tabs
  useEffect(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
    setSearchQuery("");
  }, [activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim() || !passwordInput.trim()) {
      toast.error(isRtl ? "يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور" : "Please enter credentials");
      return;
    }

    const res = adminAuthStore.login(identifierInput, passwordInput);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      loadData();
      toast.success(
        isRtl
          ? `مرحباً بك يا ${res.user.name} (${res.user.role === "super_admin" ? "المدير العام" : "مشرف"})`
          : `Welcome, ${res.user.name}`
      );
    } else {
      toast.error(res.message || (isRtl ? "بيانات الدخول غير صحيحة" : "Invalid login credentials"));
    }
  };

  const handleLogout = () => {
    adminAuthStore.logout();
    setCurrentUser(null);
    setSelectedIds([]);
    toast.info(isRtl ? "تم تسجيل الخروج وقفل اللوحة" : "Logged out and dashboard locked");
  };

  // Filtered lists
  const filteredScholarships = useMemo(() => {
    if (!searchQuery.trim()) return scholarships;
    const q = searchQuery.toLowerCase().trim();
    return scholarships.filter(
      s =>
        (s.title || "").toLowerCase().includes(q) ||
        ((s as any).title_ar || "").toLowerCase().includes(q) ||
        (s.country || "").toLowerCase().includes(q) ||
        (s.org || "").toLowerCase().includes(q)
    );
  }, [scholarships, searchQuery]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase().trim();
    return jobs.filter(
      j =>
        (j.title_ar || "").toLowerCase().includes(q) ||
        (j.company || "").toLowerCase().includes(q) ||
        (j.category || "").toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const filteredArchive = useMemo(() => {
    if (!searchQuery.trim()) return archivedItems;
    const q = searchQuery.toLowerCase().trim();
    return archivedItems.filter(a => {
      const title = a.itemData?.title_ar || a.itemData?.title || a.itemData?.titleEn || a.id;
      return title.toLowerCase().includes(q) || (a.deletedBy?.name || "").toLowerCase().includes(q);
    });
  }, [archivedItems, searchQuery]);

  const filteredArabUnis = useMemo(() => {
    if (!searchQuery.trim()) return ARAB_UNIVERSITIES;
    const q = searchQuery.toLowerCase().trim();
    return ARAB_UNIVERSITIES.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        (u.nameEn && u.nameEn.toLowerCase().includes(q)) ||
        u.country.toLowerCase().includes(q) ||
        u.countryEn.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredGlobalCountries = useMemo(() => {
    if (!searchQuery.trim()) return GLOBAL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return GLOBAL_COUNTRIES.filter(
      c =>
        c.country.toLowerCase().includes(q) ||
        c.countryEn.toLowerCase().includes(q) ||
        c.scholarshipName.toLowerCase().includes(q) ||
        (c.scholarshipNameEn && c.scholarshipNameEn.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Current active list based on tab
  const currentVisibleList = activeTab === "scholarships" ? filteredScholarships : activeTab === "jobs" ? filteredJobs : filteredArchive;

  // Tri-State Selection Calculation (Video 1)
  const isAllSelected = currentVisibleList.length > 0 && currentVisibleList.every(item => selectedIds.includes(item.id));
  const isPartiallySelected = selectedIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected || isPartiallySelected) {
      // Clear
      setSelectedIds([]);
    } else {
      // Select All
      setSelectedIds(currentVisibleList.map(item => item.id));
    }
  };

  const handleToggleSelectItem = (id: string, index: number, event: React.MouseEvent) => {
    // Support Shift + Click Range Selection (Video 1)
    if (event.shiftKey && lastSelectedIndex !== null && lastSelectedIndex !== index) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = currentVisibleList.slice(start, end + 1).map(item => item.id);
      
      const newSelected = new Set(selectedIds);
      rangeIds.forEach(rId => newSelected.add(rId));
      setSelectedIds(Array.from(newSelected));
    } else {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
    setLastSelectedIndex(index);
  };

  // Perform single delete/archive with security check
  const requestDelete = (id: string, type: "scholarship" | "job", title: string) => {
    if (currentUser?.role === "super_admin") {
      // Direct Soft-Delete & Archive
      dynamicStore.archiveItem(id, type, currentUser);
      window.dispatchEvent(
        new CustomEvent("foras:show-undo", {
          detail: { itemIds: [id], count: 1, itemType: type, title },
        })
      );
      toast.success(isRtl ? `تمت أرشفة "${title}" بنجاح` : `Archived "${title}" successfully`);
    } else {
      // Supervisor security confirmation
      setPendingDeleteAction({ id, type, title });
      setIsDeletingConfirmOpen(true);
    }
  };

  const confirmSupervisorDelete = () => {
    if (!pendingDeleteAction) return;
    const { id, type, title } = pendingDeleteAction;
    dynamicStore.archiveItem(id, type, currentUser, "أرشفة من قبل المشرف مع إشعار الإدارة");
    window.dispatchEvent(
      new CustomEvent("foras:show-undo", {
        detail: { itemIds: [id], count: 1, itemType: type, title },
      })
    );
    toast.success(
      isRtl
        ? `تمت الأرشفة وإرسال إشعار فوري للمدير العام`
        : `Item archived and Admin notified successfully`
    );
    setIsDeletingConfirmOpen(false);
    setPendingDeleteAction(null);
  };

  // Bulk Archive Action (Video 1 & 2)
  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const type = activeTab === "scholarships" ? "scholarship" : "job";
    
    const items = selectedIds.map(id => ({ id, type }));
    dynamicStore.archiveMultiple(items, currentUser);

    window.dispatchEvent(
      new CustomEvent("foras:show-undo", {
        detail: { itemIds: selectedIds, count, itemType: type },
      })
    );

    setSelectedIds([]);
    toast.success(
      isRtl
        ? `تمت أرشفة ${count} ${count === 1 ? "عنصر" : "عناصر"} ونقلها إلى سلة المحذوفات`
        : `Archived ${count} item(s) to vault`
    );
  };

  // Bulk Restore from Archive
  const handleBulkRestore = () => {
    if (selectedIds.length === 0) return;
    const count = dynamicStore.restoreMultiple(selectedIds);
    setSelectedIds([]);
    toast.success(isRtl ? `تمت استعادة ${count} عنصر بنجاح` : `Restored ${count} item(s)`);
  };

  // Empty Archive Danger Zone
  const handleEmptyArchive = () => {
    if (!currentUser || currentUser.role !== "super_admin") {
      toast.error(isRtl ? "تفريغ الأرشيف مقتصر على المدير العام فقط" : "Admin only action");
      return;
    }
    const cleanConfirm = emptyArchiveConfirmText.trim().toUpperCase();
    if (cleanConfirm !== "DELETE" && cleanConfirm !== "تأكيد" && cleanConfirm !== "مسح") {
      toast.error(isRtl ? "يرجى كتابة كلمة DELETE أو تأكيد لإتمام المسح النهائي" : "Please type DELETE to confirm");
      return;
    }

    const count = dynamicStore.emptyArchive(currentUser);
    setEmptyArchiveConfirmText("");
    toast.success(isRtl ? `تم تفريغ الأرشيف ومسح ${count} عنصر نهائياً` : `Vault emptied (${count} items)`);
  };

  // Sidebar Menu Items grouped by Task (Video 5)
  const menuGroups = [
    {
      groupTitleAr: "إدارة المحتوى والفرص",
      groupTitleEn: "Content & Opportunities",
      items: [
        { id: "scholarships" as const, labelAr: "المنح الدراسية", labelEn: "Scholarships", icon: GraduationCap, badge: scholarships.length },
        { id: "jobs" as const, labelAr: "وظائف العمل الحر $", labelEn: "Remote Freelance Jobs", icon: Briefcase, badge: jobs.length },
        { id: "arab_unis" as const, labelAr: "دليل الجامعات العربية", labelEn: "Arab Universities", icon: Building2, badge: ARAB_UNIVERSITIES.length },
        { id: "global_unis" as const, labelAr: "دليل الجامعات العالمية", labelEn: "Global Universities", icon: Globe2, badge: GLOBAL_COUNTRIES.length },
        { id: "url_parser" as const, labelAr: "محرر الروابط الذكي AI", labelEn: "AI URL Parser", icon: Sparkles },
      ],
    },
    {
      groupTitleAr: "الأرشيف وسلة المحذوفات",
      groupTitleEn: "Vault & Soft Deletions",
      items: [
        { id: "archive" as const, labelAr: "سلة المحذوفات والأرشيف", labelEn: "Archive Vault", icon: Archive, badge: archivedItems.length, badgeColor: "bg-destructive/20 text-destructive border-destructive/40" },
      ],
    },
    {
      groupTitleAr: "فريق الإشراف وسجل الأمان",
      groupTitleEn: "Team & Security Audit",
      items: [
        { id: "pending_reviews" as const, labelAr: "طلبات المراجعة", labelEn: "Pending Submissions", icon: FileCheck2, badge: pendingItems.length },
        { id: "team" as const, labelAr: "إدارة المشرفين", labelEn: "Moderators & Team", icon: Users, badge: teamMembers.length },
        { id: "audit_logs" as const, labelAr: "سجل التدقيق والنشاطات", labelEn: "Security Audit Logs", icon: History, badge: auditLogs.length },
      ],
    },
    {
      groupTitleAr: "الإعدادات والنسخ الاحتياطي",
      groupTitleEn: "Settings & Backups",
      items: [
        { id: "backup" as const, labelAr: "تصدير / استيراد البيانات", labelEn: "Data Backup & Restore", icon: Download },
        { id: "security" as const, labelAr: "تغيير كلمة المرور", labelEn: "Admin Password", icon: KeyRound },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
    >
      {/* Backdrop Click Dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Slide-Sidebar Dashboard Window */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative w-full max-w-6xl h-[92vh] max-h-[900px] bg-card/95 border-2 border-primary/40 rounded-3xl shadow-[0_0_60px_-10px_hsl(43_74%_49%/0.35)] backdrop-blur-2xl overflow-hidden z-10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="relative flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-primary/20 bg-background/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all cursor-pointer flex-shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>

            <div className="min-w-0">
              <h2
                className="font-bold text-sm sm:text-lg md:text-xl text-gold-gradient leading-tight truncate"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {t("adminTitle")}
              </h2>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-200 block truncate">
                {currentUser
                  ? t("adminActiveSession")
                      .replace("{name}", currentUser.name)
                      .replace("{role}", currentUser.role === "super_admin" ? (isRtl ? "المدير العام" : "Super Admin") : (isRtl ? "مشرف محتوى" : "Moderator"))
                  : t("adminLoginPrompt")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/25 transition-all cursor-pointer whitespace-nowrap"
              >
                {t("adminLockLogout")}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/15 border border-primary/30 hover:bg-primary/25 text-gray-200 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Content Area: Login Screen OR Slide Sidebar Layout */}
        {!currentUser ? (
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-card border-2 border-primary/40 shadow-gold">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-3 shadow-gold">
                  <Lock className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {t("adminLoginTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200">
                  {t("adminLoginDesc")}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    {t("adminEmailOrUsername")}
                  </label>
                  <input
                    type="text"
                    value={identifierInput}
                    onChange={e => setIdentifierInput(e.target.value)}
                    placeholder="alforas.one@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-background border-2 border-primary/30 text-white text-sm focus:border-primary outline-none"
                    dir={dir}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    {t("adminPasswordOrPin")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-background border-2 border-primary/30 text-white text-sm focus:border-primary outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-3" : "right-3"} text-gray-400 hover:text-white cursor-pointer`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-primary" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="luxe"
                  size="lg"
                  className="w-full py-3.5 rounded-xl shadow-gold font-bold text-base cursor-pointer"
                >
                  {t("adminUnlockBtn")}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            {/* Slide-in Sidebar (Video 5) */}
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: isRtl ? 280 : 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="h-full bg-card/90 border-l border-primary/20 flex-shrink-0 flex flex-col overflow-hidden border-r sm:border-r-0"
                >
                  {/* Sidebar Search */}
                  <div className="p-3 border-b border-primary/20">
                    <div className="relative">
                      <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"} text-gray-400`} />
                      <input
                        type="text"
                        value={sidebarSearch}
                        onChange={e => setSidebarSearch(e.target.value)}
                        placeholder={t("adminSearchMenu")}
                        className={`w-full py-2 ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} rounded-xl bg-background border border-primary/30 text-xs text-white focus:border-primary outline-none`}
                        dir={dir}
                      />
                    </div>
                  </div>

                  {/* Sidebar Task Groups */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
                    {menuGroups.map((grp, gIdx) => {
                      const filteredItems = grp.items.filter(
                        it =>
                          !sidebarSearch.trim() ||
                          it.labelAr.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                          it.labelEn.toLowerCase().includes(sidebarSearch.toLowerCase())
                      );

                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={gIdx} className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-400 px-3 uppercase tracking-wider block mb-1">
                            {isRtl ? grp.groupTitleAr : grp.groupTitleEn}
                          </span>

                          {filteredItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveTab(item.id);
                                  if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-gold font-bold"
                                    : "text-gray-300 hover:text-white hover:bg-primary/10 border border-transparent hover:border-primary/25"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                                  <span>{isRtl ? item.labelAr : item.labelEn}</span>
                                </div>

                                {item.badge !== undefined && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      item.badgeColor || (isActive ? "bg-black/30 text-white" : "bg-primary/20 text-primary")
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Main Active Tab Content View */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background/30">
              {/* Active Tab Sub-Header & Search Filter Bar */}
              <div className="p-4 border-b border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/40 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Tri-state Header Checkbox for Lists (Video 1) */}
                  {(activeTab === "scholarships" || activeTab === "jobs" || activeTab === "archive") && (
                    <button
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-2 p-2 rounded-xl bg-card border border-primary/30 hover:border-primary text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer"
                      title={isAllSelected ? t("adminDeselectAll") : t("adminSelectAll")}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : isPartiallySelected ? (
                        <MinusSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="hidden sm:inline">
                        {t("adminSelectAll")}
                      </span>
                    </button>
                  )}

                  <div className="relative flex-1 sm:w-80">
                    <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"} text-gray-400`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={
                        isRtl
                          ? `بحث في ${
                              activeTab === "scholarships"
                                ? "المنح..."
                                : activeTab === "jobs"
                                ? "الوظائف..."
                                : activeTab === "archive"
                                ? "الأرشيف..."
                                : "السجلات..."
                            }`
                          : "Search listings..."
                      }
                      className={`w-full py-2 ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white focus:border-primary outline-none`}
                      dir={dir}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === "scholarships" && (
                    <Button
                      variant="luxe"
                      size="sm"
                      onClick={() =>
                        setEditingScholarship({
                          id: `sch_${Date.now()}`,
                          title_ar: "منحة جديدة ممولة بالكامل",
                          title_en: "New Fully Funded Scholarship",
                          university: isRtl ? "جامعة دولية معتمدة" : "Accredited International University",
                          country: isRtl ? "عالمي" : "International",
                          flag: "🌍",
                          degree: "bachelor_master",
                          coverage: "full" as any,
                          deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
                          majors: ["الهندسة والتقنية", "الطب والعلوم"],
                          apply_url: "https://example.com",
                          official_website: "https://example.com",
                          description_ar: "وصف المنحة وتفاصيل الدعم المالي والرسوم والتذاكر.",
                          description_en: "Scholarship description and financial coverage.",
                          benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني"],
                          benefits_en: ["Full tuition waiver", "Monthly stipend"],
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-gold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("adminAddScholarship")}</span>
                    </Button>
                  )}

                  {activeTab === "jobs" && (
                    <Button
                      variant="luxe"
                      size="sm"
                      onClick={() =>
                        setEditingJob({
                          id: `job_${Date.now()}`,
                          title_ar: "وظيفة عمل حر جديدة بالدولار",
                          title_en: "New Remote USD Job",
                          company: "Global Tech Inc.",
                          category: "tech",
                          type: "remote_freelance",
                          salary: "$2,000 - $3,500",
                          apply_url: "https://example.com",
                          description_ar: "تفاصيل العمل والمهام المطلوبة والراتب بالدولار.",
                          description_en: "Job details and qualifications.",
                          skills: ["React", "TypeScript", "UI/UX"],
                          benefits_ar: ["دخل بالدولار", "ساعات عمل مرنة"],
                        } as any)
                      }
                      className="flex items-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-gold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("adminAddJob")}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tab Views */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-primary/20">
                {/* 1. Scholarships Management */}
                {activeTab === "scholarships" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                      <span>{t("adminActiveScholarshipsCount").replace("{count}", String(filteredScholarships.length))}</span>
                      <span className="text-primary font-semibold">
                        {t("adminRangeHint")}
                      </span>
                    </div>

                    {filteredScholarships.length === 0 ? (
                      <div className="text-center py-16 p-6 rounded-2xl bg-card/60 border border-primary/20">
                        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                        <h4 className="text-base font-bold text-white mb-1">
                          {t("adminNoScholarships")}
                        </h4>
                        <p className="text-xs text-gray-300">
                          {t("adminNoScholarshipsDesc")}
                        </p>
                      </div>
                    ) : (
                      filteredScholarships.map((s, idx) => {
                        const isSelected = selectedIds.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={e => handleToggleSelectItem(s.id, idx, e)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                              isSelected
                                ? "bg-primary/15 border-primary shadow-gold"
                                : "bg-card/70 border-primary/20 hover:border-primary/50 hover:bg-card"
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="pt-1 sm:pt-0">
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>

                              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                                <GraduationCap className="w-5 h-5" />
                              </div>

                              <div>
                                <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                                  {isRtl ? s.title || (s as any).title_ar : (s as any).title_en || s.title}
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300 mt-1">
                                  <span>{s.university || s.org}</span>
                                  <span>•</span>
                                  <span>{s.country}</span>
                                  <span>•</span>
                                  <span className="text-amber-300">{s.coverage === "full" ? (isRtl ? "ممولة بالكامل" : "Full") : s.coverage}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => setEditingScholarship(s)}
                                className="p-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all cursor-pointer"
                                title={t("adminEdit")}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => requestDelete(s.id, "scholarship", s.title || (s as any).title_ar)}
                                className="p-2 rounded-xl bg-destructive/15 border border-destructive/30 hover:bg-destructive/25 text-destructive transition-all cursor-pointer"
                                title={t("adminArchive")}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 2. Jobs Management */}
                {activeTab === "jobs" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                      <span>{t("adminActiveJobsCount").replace("{count}", String(filteredJobs.length))}</span>
                    </div>

                    {filteredJobs.length === 0 ? (
                      <div className="text-center py-16 p-6 rounded-2xl bg-card/60 border border-primary/20">
                        <Briefcase className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                        <h4 className="text-base font-bold text-white mb-1">
                          {t("adminNoJobs")}
                        </h4>
                      </div>
                    ) : (
                      filteredJobs.map((j, idx) => {
                        const isSelected = selectedIds.includes(j.id);
                        return (
                          <div
                            key={j.id}
                            onClick={e => handleToggleSelectItem(j.id, idx, e)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                              isSelected
                                ? "bg-primary/15 border-primary shadow-gold"
                                : "bg-card/70 border-primary/20 hover:border-primary/50 hover:bg-card"
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="pt-1 sm:pt-0">
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>

                              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
                                <Briefcase className="w-5 h-5" />
                              </div>

                              <div>
                                <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                                  {isRtl ? j.title_ar : j.title_en || j.title_ar}
                                </h4>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300 mt-1">
                                  <span>{j.company}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-semibold">{j.salary || (isRtl ? "بالدولار $" : "In USD $")}</span>
                                  <span>•</span>
                                  <span className="text-primary">{j.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => setEditingJob(j)}
                                className="p-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all cursor-pointer"
                                title={t("adminEdit")}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => requestDelete(j.id, "job", j.title_ar)}
                                className="p-2 rounded-xl bg-destructive/15 border border-destructive/30 hover:bg-destructive/25 text-destructive transition-all cursor-pointer"
                                title={t("adminArchive")}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Arab Universities Management / Directory */}
                {activeTab === "arab_unis" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-300 mb-1 flex-wrap gap-2">
                      <span className="font-bold text-white">
                        {isRtl ? `دليل الجامعات العربية (${filteredArabUnis.length} جامعة)` : `Arab Universities Directory (${filteredArabUnis.length} unis)`}
                      </span>
                      <span className="text-primary font-medium text-2xs">
                        {isRtl ? "يمكنك تحويل أي جامعة إلى منحة معتمدة بنقرة زر واحدة" : "Click 'Add to Scholarships' to create a grant from any uni"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {filteredArabUnis.map((uni) => (
                        <div
                          key={uni.id}
                          className="p-4 rounded-2xl border-2 border-primary/20 bg-card/70 hover:border-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                              {uni.flag}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                                {isRtl ? uni.name : (uni.nameEn || uni.name)}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300 mt-1">
                                <span>{isRtl ? uni.city : uni.cityEn || uni.city}</span>
                                <span>•</span>
                                <span>{isRtl ? uni.country : uni.countryEn}</span>
                                <span>•</span>
                                <span className="text-amber-300 font-medium">
                                  {isRtl ? `أقل نسبة: ${uni.minPercentage}%` : `Min: ${uni.minPercentage}%`}
                                </span>
                                {uni.scholarships && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                    {isRtl ? "منح متوفرة ✨" : "Scholarships Available ✨"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                            <a
                              href={uni.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all flex items-center gap-1 text-xs font-bold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isRtl ? "الموقع" : "Website"}</span>
                            </a>

                            <Button
                              variant="luxe"
                              size="sm"
                              onClick={() => {
                                setEditingScholarship({
                                  id: `sch_arab_${uni.id}_${Date.now()}`,
                                  title_ar: `منحة ${uni.name} للطلاب الدوليين`,
                                  title_en: `${uni.nameEn || uni.name} Scholarship for International Students`,
                                  university: uni.name,
                                  country: uni.country,
                                  flag: uni.flag,
                                  degree: "bachelor_master",
                                  coverage: "full" as any,
                                  deadline: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
                                  majors: uni.faculties,
                                  apply_url: uni.website,
                                  official_website: uni.website,
                                  description_ar: uni.highlights,
                                  description_en: uni.highlightsEn || uni.highlights,
                                  benefits_ar: ["إعفاء من الرسوم الدراسية", "سكن جامعي", "تأمين صحي"],
                                  benefits_en: ["Tuition fee waiver", "Campus housing", "Health insurance"],
                                });
                                toast.info(isRtl ? "تم تجهيز بطاقة المنحة بنجاح! راجع التفاصيل واضغط حفظ ونشر" : "Scholarship pre-filled! Review and click Save");
                              }}
                              className="text-xs font-bold shadow-gold flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isRtl ? "إضافة للمنح" : "Add to Scholarships"}</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Global Universities Management / Directory */}
                {activeTab === "global_unis" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-300 mb-1 flex-wrap gap-2">
                      <span className="font-bold text-white">
                        {isRtl ? `دليل الوجهات والجامعات العالمية (${filteredGlobalCountries.length} دولة ووجهة)` : `Global Universities & Hubs (${filteredGlobalCountries.length} destinations)`}
                      </span>
                      <span className="text-primary font-medium text-2xs">
                        {isRtl ? "منح حكومية ورسمية ممولة بالكامل" : "Fully funded government scholarships"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {filteredGlobalCountries.map((gc) => (
                        <div
                          key={gc.country}
                          className="p-4 rounded-2xl border-2 border-primary/20 bg-card/70 hover:border-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
                              {gc.flag}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                                {isRtl ? gc.scholarshipName : (gc.scholarshipNameEn || gc.scholarshipName)}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300 mt-1">
                                <span className="font-bold text-primary">{isRtl ? gc.country : gc.countryEn}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-semibold">{gc.stipend}</span>
                                <span>•</span>
                                <span className="text-amber-300 font-medium">
                                  {isRtl ? `الموعد: ${gc.deadline}` : `Deadline: ${gc.deadline}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                            <a
                              href={gc.officialPortal}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all flex items-center gap-1 text-xs font-bold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isRtl ? "البوابة الرسمية" : "Official Portal"}</span>
                            </a>

                            <Button
                              variant="luxe"
                              size="sm"
                              onClick={() => {
                                setEditingScholarship({
                                  id: `sch_global_${gc.country}_${Date.now()}`,
                                  title_ar: gc.scholarshipName,
                                  title_en: gc.scholarshipNameEn || gc.scholarshipName,
                                  university: isRtl ? `الجامعات الحكومية في ${gc.country}` : `Government Universities in ${gc.countryEn}`,
                                  country: isRtl ? gc.country : gc.countryEn,
                                  flag: gc.flag,
                                  degree: "all",
                                  coverage: "full" as any,
                                  deadline: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
                                  majors: ["كافة التخصصات والمجالات الدراسية"],
                                  apply_url: gc.officialPortal,
                                  official_website: gc.officialPortal,
                                  description_ar: `${gc.scholarshipName} - التمويل: ${gc.stipend}. لغة الدراسة: ${gc.studyLanguage}.`,
                                  description_en: `${gc.scholarshipNameEn || gc.scholarshipName} - Funding: ${gc.stipend}. Study language: ${gc.studyLanguage}.`,
                                  benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني", "تذاكر سفر"],
                                  benefits_en: ["Full tuition waiver", "Monthly stipend", "Free accommodation", "Flight tickets"],
                                });
                                toast.info(isRtl ? "تم تجهيز بطاقة المنحة بنجاح! راجع التفاصيل واضغط حفظ ونشر" : "Scholarship pre-filled! Review and click Save");
                              }}
                              className="text-xs font-bold shadow-gold flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isRtl ? "إضافة للمنح" : "Add to Scholarships"}</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Archive Vault (Soft Delete View & Danger Zone) */}
                {activeTab === "archive" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-destructive">
                        <Archive className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold">
                          {t("adminVaultTitle").replace("{count}", String(archivedItems.length))}
                        </span>
                      </div>
                      <span className="text-gray-300">
                        {t("adminVaultHint")}
                      </span>
                    </div>

                    {filteredArchive.length === 0 ? (
                      <div className="text-center py-16 p-6 rounded-2xl bg-card/60 border border-primary/20">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                        <h4 className="text-base font-bold text-white mb-1">
                          {t("adminVaultEmpty")}
                        </h4>
                        <p className="text-xs text-gray-300">
                          {t("adminVaultEmptyDesc")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredArchive.map((a, idx) => {
                          const isSelected = selectedIds.includes(a.id);
                          const title = a.itemData?.title_ar || a.itemData?.title || a.itemData?.titleEn || a.id;
                          return (
                            <div
                              key={a.id}
                              onClick={e => handleToggleSelectItem(a.id, idx, e)}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-primary/15 border-primary shadow-gold"
                                  : "bg-card/70 border-primary/20 hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="pt-1 sm:pt-0">
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                                  ) : (
                                    <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  )}
                                </div>

                                <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive flex-shrink-0">
                                  <Archive className="w-5 h-5" />
                                </div>

                                <div>
                                  <h4 className="text-sm sm:text-base font-bold text-white line-through opacity-80 leading-tight">
                                    {title}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 mt-1">
                                    <span className="text-primary font-semibold">{a.type === "scholarship" ? (isRtl ? "منحة" : "Scholarship") : (isRtl ? "وظيفة" : "Job")}</span>
                                    <span>•</span>
                                    <span>{isRtl ? `أرشف بواسطة: ${a.deletedBy?.name}` : `Deleted by: ${a.deletedBy?.name}`}</span>
                                    <span>•</span>
                                    <span>{new Date(a.deletedAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    dynamicStore.restoreArchivedItem(a.id);
                                    toast.success(isRtl ? `تمت استعادة "${title}" بنجاح` : `Restored successfully`);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>{t("adminRestore")}</span>
                                </button>

                                {currentUser?.role === "super_admin" && (
                                  <button
                                    onClick={() => {
                                      dynamicStore.permanentlyDeleteArchivedItem(a.id, currentUser);
                                      toast.success(isRtl ? "تم الحذف النهائي" : "Permanently deleted");
                                    }}
                                    className="p-1.5 rounded-xl bg-destructive/15 border border-destructive/30 hover:bg-destructive/25 text-destructive transition-all cursor-pointer"
                                    title={t("adminDeletePermanently")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* DANGER ZONE (Video 4) */}
                    {currentUser?.role === "super_admin" && archivedItems.length > 0 && (
                      <div className="mt-8 p-5 rounded-3xl bg-destructive/5 border-2 border-destructive/40 shadow-inner">
                        <div className="flex items-center gap-2 text-destructive font-bold text-sm sm:text-base mb-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span>{t("adminDangerZone")}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 mb-4">
                          {t("adminDangerZoneDesc")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="text"
                            value={emptyArchiveConfirmText}
                            onChange={e => setEmptyArchiveConfirmText(e.target.value)}
                            placeholder={t("adminTypeDeleteConfirm")}
                            className="px-4 py-2.5 rounded-xl bg-background border-2 border-destructive/40 text-white text-xs sm:text-sm focus:border-destructive outline-none"
                            dir={dir}
                          />
                          <Button
                            variant="destructive"
                            size="default"
                            onClick={handleEmptyArchive}
                            disabled={
                              emptyArchiveConfirmText.trim().toUpperCase() !== "DELETE" &&
                              emptyArchiveConfirmText.trim() !== "تأكيد" &&
                              emptyArchiveConfirmText.trim() !== "مسح"
                            }
                            className="font-bold text-xs sm:text-sm cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5 ml-1.5" />
                            <span>{t("adminEmptyVaultBtn")}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. AI URL Smart Parser */}
                {activeTab === "url_parser" && (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    <div className="p-5 rounded-2xl bg-card border-2 border-primary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                          <Sparkles className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">{t("adminAiUrlExtractor")}</h4>
                          <p className="text-xs text-gray-300">{t("adminAiUrlExtractorDesc")}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setUrlType("scholarship")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              urlType === "scholarship" ? "bg-primary text-primary-foreground shadow-gold" : "bg-card border border-primary/20 text-gray-300"
                            }`}
                          >
                            {isRtl ? "منحة دراسية" : "Scholarship"}
                          </button>
                          <button
                            onClick={() => setUrlType("job")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              urlType === "job" ? "bg-primary text-primary-foreground shadow-gold" : "bg-card border border-primary/20 text-gray-300"
                            }`}
                          >
                            {isRtl ? "فرصة عمل عن بعد" : "Remote Job"}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            placeholder="https://turkiyeburslari.gov.tr or https://daad.de..."
                            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-primary/30 text-white text-xs sm:text-sm focus:border-primary outline-none"
                            dir="ltr"
                          />
                          <Button
                            variant="luxe"
                            disabled={isParsing || !urlInput.trim()}
                            onClick={async () => {
                              setIsParsing(true);
                              try {
                                const parsed = await dynamicStore.parseFromUrl(urlInput, urlType);
                                setParsedPreview(parsed);
                                toast.success(isRtl ? "تم استخراج ومعالجة بيانات الرابط بنجاح" : "Parsed successfully");
                              } catch {
                                toast.error(isRtl ? "تعذر الاستخراج من الرابط" : "Failed to parse");
                              } finally {
                                setIsParsing(false);
                              }
                            }}
                            className="font-bold text-xs sm:text-sm shadow-gold cursor-pointer"
                          >
                            {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : t("adminExtractBtn")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {parsedPreview && (
                      <div className="p-5 rounded-2xl bg-card/80 border-2 border-emerald-500/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            {t("adminExtractedReady")}
                          </span>
                          <Button
                            variant="luxe"
                            size="sm"
                            onClick={() => {
                              if (urlType === "scholarship") {
                                dynamicStore.saveScholarship(parsedPreview);
                              } else {
                                dynamicStore.saveJob(parsedPreview);
                              }
                              toast.success(isRtl ? "تم النشر والتحديث في المنصة فوراً" : "Published successfully");
                              setParsedPreview(null);
                              setUrlInput("");
                              setActiveTab(urlType === "scholarship" ? "scholarships" : "jobs");
                            }}
                            className="font-bold text-xs shadow-gold cursor-pointer"
                          >
                            {t("adminApprovePublishNow")}
                          </Button>
                        </div>

                        <div className="space-y-2 text-xs sm:text-sm">
                          <h4 className="font-bold text-white text-base">{parsedPreview.title_ar || parsedPreview.title}</h4>
                          <p className="text-gray-300">{parsedPreview.description_ar}</p>
                          <div className="flex gap-2 flex-wrap text-primary">
                            <span>{parsedPreview.country}</span>
                            <span>•</span>
                            <span>{parsedPreview.stipend || parsedPreview.salary}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Team & Moderators Management */}
                {activeTab === "team" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-white">{t("adminTeamTitle")}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {teamMembers.map(m => (
                        <div key={m.id} className="p-4 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white leading-tight">{m.name}</h4>
                              <span className="text-xs text-gray-300 block">{m.email}</span>
                              <span className="text-[10px] font-bold text-amber-400 mt-0.5 block">
                                {m.role === "super_admin" ? (isRtl ? "المدير العام 👑" : "Super Admin 👑") : m.role === "editor" ? (isRtl ? "محرر محتوى" : "Editor") : (isRtl ? "مشرف" : "Moderator")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Security Audit Logs */}
                {activeTab === "audit_logs" && (
                  <div className="space-y-3">
                    <div className="text-xs text-gray-300 mb-2">
                      {t("adminAuditLogTitle").replace("{count}", String(auditLogs.length))}
                    </div>

                    <div className="space-y-2">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-3.5 rounded-xl bg-card/70 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="font-bold text-white">{log.actionAr || log.action}</span>
                            <span className="text-gray-400">({log.userName})</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-[11px]">{log.details}</span>
                            <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString(isRtl ? "ar-EG" : "en-US")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Pending Reviews */}
                {activeTab === "pending_reviews" && (
                  <div className="space-y-3">
                    <div className="text-xs text-gray-300 mb-2">
                      {t("adminPendingTitle").replace("{count}", String(pendingItems.length))}
                    </div>

                    {pendingItems.length === 0 ? (
                      <div className="text-center py-16 p-6 rounded-2xl bg-card/60 border border-primary/20">
                        <FileCheck2 className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                        <h4 className="text-base font-bold text-white mb-1">{t("adminNoPending")}</h4>
                      </div>
                    ) : (
                      pendingItems.map(p => (
                        <div key={p.id} className="p-4 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">{p.itemData?.title_ar || p.itemData?.title}</h4>
                            <span className="text-xs text-gray-300">{isRtl ? `مقدم بواسطة: ${p.submittedBy.name}` : `By: ${p.submittedBy.name}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="luxe"
                              size="sm"
                              onClick={() => {
                                adminAuthStore.approvePending(p.id, currentUser!);
                                if (p.type === "scholarship") dynamicStore.saveScholarship(p.itemData);
                                else dynamicStore.saveJob(p.itemData);
                                toast.success(isRtl ? "تمت الموافقة والنشر" : "Approved & Published");
                              }}
                              className="font-bold text-xs cursor-pointer"
                            >
                              {t("adminApprovePublish")}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 8. Backup & Restore */}
                {activeTab === "backup" && (
                  <div className="p-6 rounded-2xl bg-card border-2 border-primary/30 max-w-xl mx-auto space-y-4">
                    <h4 className="text-base font-bold text-white">{t("adminBackupTitle")}</h4>
                    <p className="text-xs text-gray-300">
                      {t("adminBackupDesc")}
                    </p>
                    <Button
                      variant="luxe"
                      onClick={() => {
                        const data = {
                          scholarships: dynamicStore.getScholarships(),
                          jobs: dynamicStore.getJobs(),
                          archive: dynamicStore.getArchivedItems(),
                          auditLogs: adminAuthStore.getAuditLogs(),
                          exportedAt: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `alforas_backup_${Date.now()}.json`;
                        a.click();
                        toast.success(isRtl ? "تم تصدير ملف النسخة الاحتياطية بنجاح" : "Backup exported");
                      }}
                      className="w-full font-bold shadow-gold cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2 ml-2" />
                      <span>{t("adminDownloadBackupBtn")}</span>
                    </Button>
                  </div>
                )}

                {/* 9. Password Change with 2FA Email OTP Verification */}
                {activeTab === "security" && (
                  <SecurityPasswordManager
                    currentUserId={currentUser.id}
                    userEmail={currentUser.email || "alforas.one@gmail.com"}
                    isRtl={isRtl}
                    onSuccess={() => {
                      toast.success(isRtl ? "تم تأكيد وتحديث بيانات الأمان" : "Security credentials refreshed");
                    }}
                  />
                )}
              </div>

              {/* FLOATING SELECTION ACTION BAR (Selection is a System - Video 1) */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="p-3 sm:p-4 bg-card/95 border-t-2 border-primary/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 z-30 flex-shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md">
                        {t("adminItemsSelected").replace("{count}", String(selectedIds.length))}
                      </span>

                      <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs font-semibold text-gray-300 hover:text-white underline cursor-pointer"
                      >
                        {t("adminClearSelection")}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeTab === "archive" ? (
                        <Button
                          variant="luxe"
                          size="sm"
                          onClick={handleBulkRestore}
                          className="font-bold text-xs sm:text-sm shadow-gold cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 mr-1.5 ml-1.5" />
                          <span>{t("adminRestoreSelected").replace("{count}", String(selectedIds.length))}</span>
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkArchive}
                          className="font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          <Archive className="w-4 h-4 mr-1.5 ml-1.5" />
                          <span>{t("adminArchiveSelected").replace("{count}", String(selectedIds.length))}</span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}
      </motion.div>

      {/* Supervisor Security Deletion Modal */}
      <AnimatePresence>
        {isDeletingConfirmOpen && pendingDeleteAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border-2 border-destructive/50 shadow-2xl space-y-4"
              dir={dir}
            >
              <div className="flex items-center gap-3 text-destructive">
                <ShieldAlert className="w-7 h-7" />
                <h4 className="text-base sm:text-lg font-bold text-white">{t("adminDeleteModalTitle")}</h4>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {t("adminDeleteModalDesc").replace("{title}", pendingDeleteAction.title)}
              </p>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeletingConfirmOpen(false)}
                  className="border-primary/40 text-gray-200 cursor-pointer"
                >
                  {t("adminCancel")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={confirmSupervisorDelete}
                  className="font-bold cursor-pointer"
                >
                  {t("adminConfirmArchive")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editing Scholarship Modal with Full Fields & Dynamic Custom Fields */}
      {editingScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4 my-auto overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30" dir={dir}>
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white">{t("adminEditScholarshipTitle")}</h4>
                  <p className="text-[11px] text-gray-400">{t("adminEditScholarshipDesc")}</p>
                </div>
              </div>
              <button onClick={() => setEditingScholarship(null)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminTitleAr")} <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={(editingScholarship as any).title_ar || editingScholarship.title}
                  onChange={e => setEditingScholarship({ ...editingScholarship, title: e.target.value, title_ar: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminTitleEn")}</label>
                <input
                  type="text"
                  value={(editingScholarship as any).title_en || (editingScholarship as any).titleEn || ""}
                  onChange={e => setEditingScholarship({ ...editingScholarship, title_en: e.target.value, titleEn: e.target.value } as any)}
                  placeholder="e.g. Fully Funded Oxford Scholarship"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminCountryUniversity")}</label>
                <input
                  type="text"
                  value={editingScholarship.country}
                  onChange={e => setEditingScholarship({ ...editingScholarship, country: e.target.value })}
                  placeholder={isRtl ? "بريطانيا - جامعة أكسفورد" : "UK - Oxford University"}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir={dir}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminDegreeLevel")}</label>
                <select
                  value={editingScholarship.degree || "all"}
                  onChange={e => setEditingScholarship({ ...editingScholarship, degree: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                >
                  <option value="bachelor">{isRtl ? "بكالوريوس" : "Bachelor's"}</option>
                  <option value="master">{isRtl ? "ماجستير" : "Master's"}</option>
                  <option value="phd">{isRtl ? "دكتوراه / أبحاث" : "PhD / Research"}</option>
                  <option value="bachelor_master">{isRtl ? "بكالوريوس + ماجستير" : "Bachelor + Master"}</option>
                  <option value="all">{isRtl ? "كافة المراحل (شامل)" : "All Levels"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminFundingCoverage")}</label>
                <select
                  value={editingScholarship.coverage || "full"}
                  onChange={e => setEditingScholarship({ ...editingScholarship, coverage: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                >
                  <option value="full">{isRtl ? "ممولة بالكامل (رسوم + راتب + سكن + طيران)" : "Fully Funded"}</option>
                  <option value="partial">{isRtl ? "تمويل جزئي (رسوم دراسية فقط)" : "Partial Funded"}</option>
                  <option value="tuition_only">{isRtl ? "إعفاء من الرسوم" : "Tuition Waiver Only"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminDeadline")}</label>
                <input
                  type="date"
                  value={editingScholarship.deadline}
                  onChange={e => setEditingScholarship({ ...editingScholarship, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminApplyUrl")}</label>
                <input
                  type="url"
                  value={editingScholarship.apply_url}
                  onChange={e => setEditingScholarship({ ...editingScholarship, apply_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminLanguageReq")}</label>
                <input
                  type="text"
                  value={(editingScholarship as any).language_req || ""}
                  onChange={e => setEditingScholarship({ ...editingScholarship, language_req: e.target.value } as any)}
                  placeholder={isRtl ? "مثال: IELTS 6.5 أو بدون شرط لغة" : "e.g. IELTS 6.5 or No Language Req"}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir={dir}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-200 mb-1">{t("adminDescriptionBenefits")}</label>
              <textarea
                rows={3}
                value={(editingScholarship as any).description_ar || editingScholarship.description}
                onChange={e => setEditingScholarship({ ...editingScholarship, description: e.target.value, description_ar: e.target.value } as any)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary text-xs sm:text-sm"
                dir={dir}
              />
            </div>

            {/* DYNAMIC CUSTOM FIELDS BUILDER */}
            <div className="p-4 rounded-2xl bg-card/60 border border-primary/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-bold text-white">{t("adminCustomFieldsTitle")}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFields = (editingScholarship as any).custom_fields || [];
                    setEditingScholarship({
                      ...editingScholarship,
                      custom_fields: [...currentFields, { label: "", value: "" }],
                    } as any);
                  }}
                  className="text-xs border-primary/40 text-primary cursor-pointer hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 ml-1" />
                  <span>{t("adminAddField")}</span>
                </Button>
              </div>

              {((editingScholarship as any).custom_fields || []).map((f: any, fIdx: number) => (
                <div key={fIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isRtl ? "اسم الحقل (مثال: شروط السن)" : "Field Label"}
                    value={f.label}
                    onChange={e => {
                      const updated = [...((editingScholarship as any).custom_fields || [])];
                      updated[fIdx].label = e.target.value;
                      setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                    }}
                    className="w-1/3 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                    dir={dir}
                  />
                  <input
                    type="text"
                    placeholder={isRtl ? "القيمة أو الملاحظة المطلوبة" : "Field Value"}
                    value={f.value}
                    onChange={e => {
                      const updated = [...((editingScholarship as any).custom_fields || [])];
                      updated[fIdx].value = e.target.value;
                      setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                    dir={dir}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = ((editingScholarship as any).custom_fields || []).filter((_: any, i: number) => i !== fIdx);
                      setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                    }}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-primary/20">
              <Button variant="outline" size="sm" onClick={() => setEditingScholarship(null)} className="cursor-pointer">
                {t("adminCancel")}
              </Button>
              <Button
                variant="luxe"
                size="sm"
                onClick={() => {
                  dynamicStore.saveScholarship(editingScholarship);
                  setEditingScholarship(null);
                  toast.success(isRtl ? "تم حفظ وتحديث بيانات المنحة بنجاح" : "Scholarship saved successfully");
                }}
                className="font-bold shadow-gold cursor-pointer"
              >
                {t("adminSavePublish")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Job Modal with Full Details & Dynamic Custom Fields */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4 my-auto overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30" dir={dir}>
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white">{t("adminEditJobTitle")}</h4>
                  <p className="text-[11px] text-gray-400">{t("adminEditJobDesc")}</p>
                </div>
              </div>
              <button onClick={() => setEditingJob(null)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminJobTitleAr")} <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={editingJob.title_ar}
                  onChange={e => setEditingJob({ ...editingJob, title_ar: e.target.value })}
                  placeholder="مطور واجهات ومواقع عن بُعد"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminJobTitleEn")}</label>
                <input
                  type="text"
                  value={editingJob.title_en || ""}
                  onChange={e => setEditingJob({ ...editingJob, title_en: e.target.value })}
                  placeholder="Remote Frontend Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminCompany")}</label>
                <input
                  type="text"
                  value={editingJob.company}
                  onChange={e => setEditingJob({ ...editingJob, company: e.target.value })}
                  placeholder="Upwork / Toptal / Global Remote"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir={dir}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminSalaryUsd")}</label>
                <input
                  type="text"
                  value={editingJob.salary || ""}
                  onChange={e => setEditingJob({ ...editingJob, salary: e.target.value })}
                  placeholder="$2,500 - $4,500 / month"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminJobType")}</label>
                <select
                  value={editingJob.type || "remote_freelance"}
                  onChange={e => setEditingJob({ ...editingJob, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                >
                  <option value="remote_freelance">{isRtl ? "عن بُعد بالكامل (Remote Freelance)" : "100% Remote Freelance"}</option>
                  <option value="full_time">{isRtl ? "دوام كامل عن بُعد (Full-Time Remote)" : "Full-Time Remote"}</option>
                  <option value="part_time">{isRtl ? "دوام جزئي مرن (Part-Time)" : "Part-Time Flexible"}</option>
                  <option value="contract">{isRtl ? "عقد مشروع محدد (Project Contract)" : "Project Contract"}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminPayoutMethod")}</label>
                <input
                  type="text"
                  value={(editingJob as any).payout_method || ""}
                  onChange={e => setEditingJob({ ...editingJob, payout_method: e.target.value } as any)}
                  placeholder={isRtl ? "بايبال، بايونير، تحويل بنكي دولي" : "PayPal, Payoneer, Wire Transfer"}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir={dir}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminApplyUrl")}</label>
                <input
                  type="url"
                  value={editingJob.apply_url}
                  onChange={e => setEditingJob({ ...editingJob, apply_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-200 mb-1">{t("adminSkillsReq")}</label>
                <input
                  type="text"
                  value={(editingJob.skills || []).join(", ")}
                  onChange={e => setEditingJob({ ...editingJob, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="React, English B2, Node.js"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-200 mb-1">{t("adminJobDescription")}</label>
              <textarea
                rows={3}
                value={editingJob.description_ar}
                onChange={e => setEditingJob({ ...editingJob, description_ar: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white outline-none focus:border-primary text-xs sm:text-sm"
                dir={dir}
              />
            </div>

            {/* DYNAMIC CUSTOM FIELDS BUILDER FOR JOBS */}
            <div className="p-4 rounded-2xl bg-card/60 border border-primary/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-bold text-white">{t("adminCustomFieldsTitle")}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFields = (editingJob as any).custom_fields || [];
                    setEditingJob({
                      ...editingJob,
                      custom_fields: [...currentFields, { label: "", value: "" }],
                    } as any);
                  }}
                  className="text-xs border-primary/40 text-primary cursor-pointer hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 ml-1" />
                  <span>{t("adminAddField")}</span>
                </Button>
              </div>

              {((editingJob as any).custom_fields || []).map((f: any, fIdx: number) => (
                <div key={fIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isRtl ? "اسم الحقل (مثال: عدد ساعات العمل)" : "Field Label"}
                    value={f.label}
                    onChange={e => {
                      const updated = [...((editingJob as any).custom_fields || [])];
                      updated[fIdx].label = e.target.value;
                      setEditingJob({ ...editingJob, custom_fields: updated } as any);
                    }}
                    className="w-1/3 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                    dir={dir}
                  />
                  <input
                    type="text"
                    placeholder={isRtl ? "القيمة أو الملاحظة المطلوبة" : "Field Value"}
                    value={f.value}
                    onChange={e => {
                      const updated = [...((editingJob as any).custom_fields || [])];
                      updated[fIdx].value = e.target.value;
                      setEditingJob({ ...editingJob, custom_fields: updated } as any);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                    dir={dir}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = ((editingJob as any).custom_fields || []).filter((_: any, i: number) => i !== fIdx);
                      setEditingJob({ ...editingJob, custom_fields: updated } as any);
                    }}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-primary/20">
              <Button variant="outline" size="sm" onClick={() => setEditingJob(null)} className="cursor-pointer">
                {t("adminCancel")}
              </Button>
              <Button
                variant="luxe"
                size="sm"
                onClick={() => {
                  dynamicStore.saveJob(editingJob);
                  setEditingJob(null);
                  toast.success(isRtl ? "تم حفظ ونشر فرصة العمل بنجاح" : "Job saved successfully");
                }}
                className="font-bold shadow-gold cursor-pointer"
              >
                {t("adminSavePublish")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
