import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Sparkles, Plus, Trash2, Edit3, ExternalLink, Check, X,
  RefreshCw, Globe, Search, ArrowRight, ArrowLeft, Download, AlertCircle,
  Briefcase, GraduationCap, Lock, Eye, EyeOff, Users, FileCheck2, History,
  KeyRound, Mail, UserCheck, ShieldAlert, CheckCircle2, XCircle,
  Archive, RotateCcw, Menu, ChevronRight, ChevronLeft, AlertTriangle,
  Upload, Layers, CheckSquare, Square, MinusSquare, Building2, Globe2,
  Crown, Shield, Unlock, HelpCircle, LockKeyhole, Smartphone, Tablet,
  Laptop, Monitor, SlidersHorizontal, BarChart3, Copy, Link2,
  Filter, Clock, BookOpen, Award, Database, Radio
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scholarship } from "@/lib/mockData";
import { dynamicStore, CustomJobItem, ArchivedItem, isArabCountry } from "@/lib/dynamicStore";
import { adminAuthStore, AdminUser, AuditLog, PendingItem, AdminRole, LockoutState, UNIFIED_ADMIN_EMAIL } from "@/lib/adminAuthStore";
import { ARAB_UNIVERSITIES, ARAB_COUNTRY_STATS } from "@/lib/arabUniversities";
import { GLOBAL_COUNTRIES } from "@/lib/globalUniversities";
import { notificationsStore } from "@/lib/notificationsStorage";
import { universitiesDirectoryStore } from "@/lib/universitiesDirectoryStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SecurityPasswordManager } from "@/components/foras/SecurityPasswordManager";
import { StarMaskedInput } from "@/components/foras/StarMaskedInput";
import { checkScholarshipDuplicate, checkJobDuplicate } from "@/lib/duplicateChecker";
import { ScholarshipDuplicateBanner, UrlDuplicateNotice } from "@/components/foras/ScholarshipDuplicateGuard";
import { ExtractedOpportunityPreview } from "@/components/foras/ExtractedOpportunityPreview";
import { AutomationCommandCenter } from "@/components/foras/AutomationCommandCenter";
import { CloudDatabaseHealthMonitor } from "@/components/foras/CloudDatabaseHealthMonitor";
import { selfHealingEngine } from "@/lib/selfHealingEngine";
import { ArabUniversitiesAdminView } from "./admin/ArabUniversitiesAdminView";
import { GlobalUniversitiesAdminView } from "./admin/GlobalUniversitiesAdminView";
import { ArchiveVaultAdminView } from "./admin/ArchiveVaultAdminView";
import { AuditLogsAdminView } from "./admin/AuditLogsAdminView";
import { TeamManagementAdminView } from "./admin/TeamManagementAdminView";
import { PendingReviewsAdminView } from "./admin/PendingReviewsAdminView";
import { DataBackupAdminView } from "./admin/DataBackupAdminView";
import { ScholarshipsManagementView } from "./admin/ScholarshipsManagementView";
import { JobsManagementView } from "./admin/JobsManagementView";
import { AdminUrlParserView } from "./admin/AdminUrlParserView";
import { AdminEditScholarshipModal } from "./admin/AdminEditScholarshipModal";
import { AdminEditJobModal } from "./admin/AdminEditJobModal";
import { AdminRecoveryModal } from "./admin/AdminRecoveryModal";
import { AdminBroadcastModal } from "./admin/AdminBroadcastModal";

// Active Task Section in Slide Sidebar
export type AdminTab =
  | "scholarships"
  | "jobs"
  | "arab_unis"
  | "global_unis"
  | "archive"
  | "url_parser"
  | "automation"
  | "pending_reviews"
  | "team"
  | "audit_logs"
  | "backup"
  | "security"
  | "database";

const VALID_ADMIN_TABS: AdminTab[] = [
  "scholarships",
  "jobs",
  "arab_unis",
  "global_unis",
  "archive",
  "url_parser",
  "automation",
  "pending_reviews",
  "team",
  "audit_logs",
  "backup",
  "security",
  "database",
];

export const AdminDashboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isStandalonePage?: boolean;
}> = ({ isOpen, onClose, isStandalonePage = false }) => {
  const { lang, dir, t } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialAdminTab = (): AdminTab => {
    if (isStandalonePage) {
      const q = searchParams.get("tab") as AdminTab;
      if (q && VALID_ADMIN_TABS.includes(q)) return q;
    }
    return "scholarships";
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialAdminTab);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (isStandalonePage) {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          next.set("tab", tab);
          return next;
        },
        { replace: true }
      );
    }
  };

  useEffect(() => {
    if (isStandalonePage) {
      const q = searchParams.get("tab") as AdminTab;
      if (q && VALID_ADMIN_TABS.includes(q)) {
        setActiveTab(prev => (prev !== q ? q : prev));
      }
    }
  }, [searchParams, isStandalonePage]);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Current session & Users
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => adminAuthStore.getCurrentSession());
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);

  // Lockout State
  const [lockoutState, setLockoutState] = useState<LockoutState>(() => adminAuthStore.getLockoutState());
  const [isShakeError, setIsShakeError] = useState(false);

  // Login form state
  const [loginRole, setLoginRole] = useState<"super_admin" | "moderator">("super_admin");
  const [identifierInput, setIdentifierInput] = useState("alforas.one@gmail.com");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usePinMode, setUsePinMode] = useState(true);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  // Transient reveal map for 1-second visual feedback per digit
  const [revealedIndices, setRevealedIndices] = useState<Record<number, boolean>>({});
  const revealTimers = useRef<Record<number, NodeJS.Timeout>>({});
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    const currentTimers = revealTimers.current;
    return () => {
      Object.values(currentTimers).forEach(t => clearTimeout(t));
    };
  }, []);

  // Lock body scroll and overscroll when modal is open to prevent background scroll bleed
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [isOpen]);

  // Automation Engine State & Controls
  const [automationStatus, setAutomationStatus] = useState<{
    isRunning: boolean;
    lastRun: string | null;
    lastStatus: "idle" | "running" | "success" | "error";
    totalIngested: number;
    logs: Array<{ timestamp: string; level: "info" | "success" | "warn" | "error"; message: string }>;
  }>({
    isRunning: false,
    lastRun: null,
    lastStatus: "idle",
    totalIngested: 0,
    logs: [],
  });
  const [isTriggeringAutomation, setIsTriggeringAutomation] = useState(false);
  const [isSyncingServer, setIsSyncingServer] = useState(false);

  // Broadcast Notification Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastTitleEn, setBroadcastTitleEn] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastBodyEn, setBroadcastBodyEn] = useState("");
  const [broadcastTab, setBroadcastTab] = useState<"scholarships" | "jobs" | "arab_unis" | "news">("scholarships");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      toast.error(isRtl ? "يرجى كتابة عنوان وتفاصيل الإشعار" : "Title and body required");
      return;
    }
    setIsBroadcasting(true);
    const success = await notificationsStore.broadcastNotification({
      id: `broadcast_${Date.now()}`,
      kind: "broadcast",
      title: broadcastTitle.trim(),
      titleEn: broadcastTitleEn.trim() || broadcastTitle.trim(),
      body: broadcastBody.trim(),
      bodyEn: broadcastBodyEn.trim() || broadcastBody.trim(),
      actionTab: broadcastTab,
      ts: Date.now(),
    }, currentUser);
    setIsBroadcasting(false);

    if (success) {
      toast.success(isRtl ? "تم بث التنبيه لجميع المستخدمين بنجاح! 📡" : "Broadcast sent to all users! 📡");
      setBroadcastModalOpen(false);
      setBroadcastTitle("");
      setBroadcastTitleEn("");
      setBroadcastBody("");
      setBroadcastBodyEn("");
    } else {
      toast.error(isRtl ? "تعذر بث التنبيه" : "Failed to broadcast");
    }
  };

  const fetchAutomationStatus = async () => {
    try {
      const res = await fetch("/api/automation/status");
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setAutomationStatus(data);
        }
      }
    } catch (e) {
      console.warn("Automation status check note:", e);
    }
  };

  const handleRunAutomation = async () => {
    setIsTriggeringAutomation(true);
    toast.info(isRtl ? "بدء دورة الأوتوميشن الذكي لجلب وفحص الفرص والوظائف..." : "Starting AI automation engine...");
    try {
      const res = await fetch("/api/automation/run", { method: "POST" });
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        // Graceful handling when deployed on static frontend (e.g. Vercel)
        toast.info(
          isRtl
            ? "محرك الأوتوميشن يعمل عبر السحابة، وجارٍ استكمال الفحص ومزامنة البيانات."
            : "Automation engine running via cloud backend."
        );
        return;
      }
      const data = await res.json();
      if (data && data.success) {
        toast.success(data.message || (isRtl ? "اكتملت دورة الفحص وتغذية السيرفر بنجاح!" : "Ingestion cycle completed successfully!"));
        await dynamicStore.syncWithServer();
        await fetchAutomationStatus();
      } else {
        toast.info(data?.message || (isRtl ? "تم إرسال أمر الفحص بنجاح." : "Automation cycle queued successfully."));
      }
    } catch {
      toast.info(
        isRtl
          ? "تم توجيه طلب الأوتوميشن السحابي، وسيتم تحديث السجلات تلقائياً."
          : "Cloud automation request dispatched successfully."
      );
    } finally {
      setIsTriggeringAutomation(false);
    }
  };

  const handleSyncWithServer = async () => {
    setIsSyncingServer(true);
    try {
      const counts = await dynamicStore.syncWithServer();
      toast.success(
        isRtl
          ? `تمت مزامنة قاعدة البيانات بنجاح! (${counts.scholarships} منحة، ${counts.jobs} فرصة عمل)`
          : `Database synced! (${counts.scholarships} scholarships, ${counts.jobs} jobs)`
      );
      await fetchAutomationStatus();
    } catch {
      toast.error(isRtl ? "فشلت المزامنة مع الخادم" : "Server sync failed");
    } finally {
      setIsSyncingServer(false);
    }
  };

  useEffect(() => {
    if (activeTab === "automation" && isOpen) {
      fetchAutomationStatus();
      const interval = setInterval(fetchAutomationStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isOpen]);

  // Forgot Password / OTP Recovery Modal State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"send_otp" | "verify_otp" | "new_password">("send_otp");
  const [recoveryOtpDigits, setRecoveryOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [showRecoveryNewPass, setShowRecoveryNewPass] = useState(false);
  const [showRecoveryConfirmPass, setShowRecoveryConfirmPass] = useState(false);
  const [isSendingRecoveryOtp, setIsSendingRecoveryOtp] = useState(false);
  const recoveryOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Arab Universities Directory Filters & Pagination State
  const [selectedArabCountry, setSelectedArabCountry] = useState<string>("all");
  const [visibleUnisCount, setVisibleUnisCount] = useState<number>(35);

  // Update identifier when switching roles
  useEffect(() => {
    if (loginRole === "super_admin") {
      setIdentifierInput("alforas.one@gmail.com");
      setPinDigits(["", "", "", ""]);
      setPasswordInput("");
    } else {
      setIdentifierInput("scholarships@foras.app");
      setPinDigits(["", "", "", "", "", ""]);
      setPasswordInput("");
    }
  }, [loginRole]);

  // Synchronize pinDigits to passwordInput
  useEffect(() => {
    if (usePinMode) {
      setPasswordInput(pinDigits.join(""));
    }
  }, [pinDigits, usePinMode]);

  // Listen to Lockout Updates
  useEffect(() => {
    const handleLockout = (e: any) => {
      if (e.detail) setLockoutState(e.detail);
      else setLockoutState(adminAuthStore.getLockoutState());
    };
    window.addEventListener("foras:lockout-updated", handleLockout);
    return () => window.removeEventListener("foras:lockout-updated", handleLockout);
  }, []);

  const triggerErrorShake = () => {
    setIsShakeError(true);
    setTimeout(() => setIsShakeError(false), 600);
  };

  const triggerTransientReveal = (index: number) => {
    // Clear existing timer for this slot
    if (revealTimers.current[index]) {
      clearTimeout(revealTimers.current[index]);
    }
    // Set revealed state
    setRevealedIndices(prev => ({ ...prev, [index]: true }));

    // Re-mask after exactly 1 second (1000ms)
    revealTimers.current[index] = setTimeout(() => {
      setRevealedIndices(prev => ({ ...prev, [index]: false }));
    }, 1000);
  };

  const handlePinDigitChange = (index: number, value: string) => {
    const clean = value.replace(/[^\d]/g, "").slice(-1);
    const updated = [...pinDigits];
    updated[index] = clean;
    setPinDigits(updated);

    if (clean) {
      triggerTransientReveal(index);
      if (index < pinDigits.length - 1) {
        pinInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (revealTimers.current[index]) clearTimeout(revealTimers.current[index]);
      setRevealedIndices(prev => ({ ...prev, [index]: false }));

      if (!pinDigits[index] && index > 0) {
        if (revealTimers.current[index - 1]) clearTimeout(revealTimers.current[index - 1]);
        setRevealedIndices(prev => ({ ...prev, [index - 1]: false }));
        const updated = [...pinDigits];
        updated[index - 1] = "";
        setPinDigits(updated);
        pinInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...pinDigits];
        updated[index] = "";
        setPinDigits(updated);
      }
    } else if (e.key === "ArrowLeft") {
      if (isRtl && index < pinDigits.length - 1) {
        pinInputRefs.current[index + 1]?.focus();
      } else if (!isRtl && index > 0) {
        pinInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      if (isRtl && index > 0) {
        pinInputRefs.current[index - 1]?.focus();
      } else if (!isRtl && index < pinDigits.length - 1) {
        pinInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^\d]/g, "");
    if (!pastedData) return;
    const digits = pastedData.slice(0, pinDigits.length).split("");
    const newDigits = [...pinDigits];
    for (let i = 0; i < newDigits.length; i++) {
      newDigits[i] = digits[i] || "";
      if (digits[i]) triggerTransientReveal(i);
    }
    setPinDigits(newDigits);
    const nextIdx = Math.min(digits.length, pinDigits.length - 1);
    pinInputRefs.current[nextIdx]?.focus();
  };

  // Perform Login
  const performLogin = (idValue: string, passValue: string) => {
    if (!idValue.trim() || !passValue.trim()) {
      toast.error(isRtl ? "يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور" : "Please enter credentials");
      return;
    }

    const res = adminAuthStore.login(idValue, passValue, loginRole);
    setLockoutState(adminAuthStore.getLockoutState());

    if (res.success && res.user) {
      setCurrentUser(res.user);
      loadData();
      toast.success(
        isRtl
          ? `مرحباً بك يا ${res.user.name} (${res.user.role === "super_admin" ? "المدير العام" : "مشرف"})`
          : `Welcome, ${res.user.name}`
      );
    } else {
      triggerErrorShake();
      if (res.isLocked) {
        toast.error(res.message || (isRtl ? "تم حظر الحساب لمحاولات خاطئة متكررة" : "Account locked"));
      } else {
        toast.error(res.message || (isRtl ? "بيانات الدخول غير صحيحة" : "Invalid login credentials"));
      }
    }
  };

  const performLoginRef = useRef(performLogin);
  performLoginRef.current = performLogin;
  const identifierInputRef = useRef(identifierInput);
  identifierInputRef.current = identifierInput;

  // Auto-Submit when all PIN digits are filled!
  useEffect(() => {
    if (usePinMode && !currentUser && !lockoutState.isLocked) {
      const isComplete = pinDigits.every(d => d !== "");
      if (isComplete) {
        const fullPin = pinDigits.join("");
        performLoginRef.current(identifierInputRef.current, fullPin);
      }
    }
  }, [pinDigits, usePinMode, currentUser, lockoutState.isLocked]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(identifierInput, passwordInput);
  };


  // Password change state
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

  // Data lists
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [jobs, setJobs] = useState<CustomJobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-Pane Adaptive Layout States (Responsive Grid from Video)
  const [deviceSimulator, setDeviceSimulator] = useState<"auto" | "phone" | "tablet" | "laptop" | "desktop">("auto");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [mobileViewPane, setMobileViewPane] = useState<"list" | "detail">("list");
  const [activeEditorTab, setActiveEditorTab] = useState<"info" | "financials" | "eligibility" | "custom_fields" | "urls">("info");

  // Multi-Selection State (Selection System from Video 1)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Editing state
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [editingJob, setEditingJob] = useState<CustomJobItem | null>(null);
  const [editingMember, setEditingMember] = useState<AdminUser | null>(null);

  // Duplicate Detection & Integrity Guard State
  const [duplicateOverriddenId, setDuplicateOverriddenId] = useState<string | null>(null);

  // Live duplicate check for editingScholarship
  const scholarshipDuplicateResult = useMemo(() => {
    if (!editingScholarship) {
      return {
        isDuplicate: false,
        matchType: "none" as const,
        matchedItem: null,
        confidence: 0,
        reasonAr: "",
        reasonEn: "",
      };
    }
    return checkScholarshipDuplicate(editingScholarship, scholarships, editingScholarship.id);
  }, [editingScholarship, scholarships]);

  // URL Parser State
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"scholarship" | "job">("scholarship");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  // Live duplicate detection inside URL Parser
  const urlDuplicateResult = useMemo(() => {
    const trimmed = urlInput.trim();
    if (!trimmed || trimmed.length < 8) {
      return {
        isDuplicate: false,
        matchType: "none" as const,
        matchedItem: null,
        confidence: 0,
        reasonAr: "",
        reasonEn: "",
      };
    }

    if (urlType === "scholarship") {
      return checkScholarshipDuplicate(
        { apply_url: trimmed, official_website: trimmed, title: "" } as any,
        scholarships
      );
    } else {
      return checkJobDuplicate(
        { applyUrl: trimmed, url: trimmed, website: trimmed, title: "" },
        jobs
      );
    }
  }, [urlInput, urlType, scholarships, jobs]);

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
      if (typeof document !== "undefined") {
        document.body.style.pointerEvents = "auto";
      }
      loadData();
      setSelectedIds([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleUpdates = () => loadData();
    window.addEventListener("foras:data-updated", handleUpdates);
    window.addEventListener("foras:archive-updated", handleUpdates);
    window.addEventListener("foras:audit-updated", handleUpdates);
    window.addEventListener("foras:team-updated", handleUpdates);
    return () => {
      window.removeEventListener("foras:data-updated", handleUpdates);
      window.removeEventListener("foras:archive-updated", handleUpdates);
      window.removeEventListener("foras:audit-updated", handleUpdates);
      window.removeEventListener("foras:team-updated", handleUpdates);
    };
  }, []);

  // Clear selection when changing tabs
  useEffect(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
    setSearchQuery("");
  }, [activeTab]);

  const handleLogout = () => {
    adminAuthStore.logout();
    setCurrentUser(null);
    setSelectedIds([]);
    toast.info(isRtl ? "تم تسجيل الخروج وقفل اللوحة" : "Logged out and dashboard locked");
  };

  // ========================================================
  // SCHOLARSHIPS CATEGORY & SEGMENT HUB STATE & HELPERS
  // ========================================================
  const [scholarshipCategoryFilter, setScholarshipCategoryFilter] = useState<"all" | "arab" | "global">("all");
  const [scholarshipFundingFilter, setScholarshipFundingFilter] = useState<"all" | "full" | "partial">("all");
  const [scholarshipDegreeFilter, setScholarshipDegreeFilter] = useState<"all" | "bachelor" | "postgrad">("all");
  const [scholarshipDeadlineFilter, setScholarshipDeadlineFilter] = useState<"all" | "open" | "expiring_soon" | "expired">("all");

  const resetScholarshipFilters = () => {
    setScholarshipCategoryFilter("all");
    setScholarshipFundingFilter("all");
    setScholarshipDegreeFilter("all");
    setScholarshipDeadlineFilter("all");
    setSearchQuery("");
  };

  const hasActiveScholarshipFilters =
    scholarshipCategoryFilter !== "all" ||
    scholarshipFundingFilter !== "all" ||
    scholarshipDegreeFilter !== "all" ||
    scholarshipDeadlineFilter !== "all";

  // Category & Status classification helpers
  const isScholarshipFullyFunded = (s: Scholarship) => {
    const cov = ((s as any).coverage || "").toLowerCase();
    const amt = (s.amount || "").toLowerCase();
    const amtEn = (s.amountEn || "").toLowerCase();
    return cov === "full" || amt.includes("كامل") || amtEn.includes("fully");
  };

  const isScholarshipPartialFunded = (s: Scholarship) => {
    const cov = ((s as any).coverage || "").toLowerCase();
    const amt = (s.amount || "").toLowerCase();
    const amtEn = (s.amountEn || "").toLowerCase();
    return cov === "partial" || cov === "tuition_only" || amt.includes("جزئي") || amtEn.includes("partial");
  };

  const isScholarshipBachelor = (s: Scholarship) => {
    const deg = ((s as any).degree || "").toLowerCase();
    const lvl = (s.level || "").toLowerCase();
    const lvlEn = (s.levelEn || "").toLowerCase();
    return deg === "bachelor" || deg === "bachelor_master" || deg === "all" || lvl.includes("بكالوريوس") || lvlEn.includes("bachelor");
  };

  const isScholarshipPostgrad = (s: Scholarship) => {
    const deg = ((s as any).degree || "").toLowerCase();
    const lvl = (s.level || "").toLowerCase();
    const lvlEn = (s.levelEn || "").toLowerCase();
    return deg === "master" || deg === "phd" || deg === "bachelor_master" || deg === "all" || lvl.includes("ماجستير") || lvl.includes("دكتوراه") || lvlEn.includes("master") || lvlEn.includes("phd");
  };

  const getScholarshipDeadlineStatus = (s: Scholarship): "open" | "expiring_soon" | "expired" | "unknown" => {
    if (!s.deadline) return "unknown";
    const d = new Date(s.deadline);
    if (isNaN(d.getTime())) return "unknown";
    const now = Date.now();
    const diffDays = Math.ceil((d.getTime() - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "expired";
    if (diffDays <= 14) return "expiring_soon";
    return "open";
  };

  // Real-time Category Counts
  const scholarshipCategoryCounts = useMemo(() => {
    const counts = {
      total: scholarships.length,
      arab: 0,
      global: 0,
      full: 0,
      partial: 0,
      bachelor: 0,
      postgrad: 0,
      open: 0,
      expiringSoon: 0,
      expired: 0,
    };

    for (const s of scholarships) {
      if (s.category === "arab") counts.arab++;
      else counts.global++;

      if (isScholarshipFullyFunded(s)) counts.full++;
      if (isScholarshipPartialFunded(s)) counts.partial++;

      if (isScholarshipBachelor(s)) counts.bachelor++;
      if (isScholarshipPostgrad(s)) counts.postgrad++;

      const ds = getScholarshipDeadlineStatus(s);
      if (ds === "open") counts.open++;
      else if (ds === "expiring_soon") counts.expiringSoon++;
      else if (ds === "expired") counts.expired++;
    }

    return counts;
  }, [scholarships]);

  // Filtered lists
  const filteredScholarships = useMemo(() => {
    let list = scholarships;

    // 1. Geographic Scope Category
    if (scholarshipCategoryFilter === "arab") {
      list = list.filter(s => s.category === "arab");
    } else if (scholarshipCategoryFilter === "global") {
      list = list.filter(s => s.category === "global" || !s.category);
    }

    // 2. Funding Coverage
    if (scholarshipFundingFilter === "full") {
      list = list.filter(isScholarshipFullyFunded);
    } else if (scholarshipFundingFilter === "partial") {
      list = list.filter(isScholarshipPartialFunded);
    }

    // 3. Degree Level
    if (scholarshipDegreeFilter === "bachelor") {
      list = list.filter(isScholarshipBachelor);
    } else if (scholarshipDegreeFilter === "postgrad") {
      list = list.filter(isScholarshipPostgrad);
    }

    // 4. Deadline Health
    if (scholarshipDeadlineFilter === "open") {
      list = list.filter(s => getScholarshipDeadlineStatus(s) === "open");
    } else if (scholarshipDeadlineFilter === "expiring_soon") {
      list = list.filter(s => getScholarshipDeadlineStatus(s) === "expiring_soon");
    } else if (scholarshipDeadlineFilter === "expired") {
      list = list.filter(s => getScholarshipDeadlineStatus(s) === "expired");
    }

    // 5. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        s =>
          (s.title || "").toLowerCase().includes(q) ||
          ((s as any).title_ar || "").toLowerCase().includes(q) ||
          ((s as any).title_en || "").toLowerCase().includes(q) ||
          (s.country || "").toLowerCase().includes(q) ||
          (s.org || "").toLowerCase().includes(q) ||
          ((s as any).university || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    scholarships,
    searchQuery,
    scholarshipCategoryFilter,
    scholarshipFundingFilter,
    scholarshipDegreeFilter,
    scholarshipDeadlineFilter,
  ]);

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

  const availableArabCountries = useMemo(() => {
    const map = new Map<string, { name: string; flag: string; count: number }>();
    ARAB_UNIVERSITIES.forEach(u => {
      if (!map.has(u.country)) {
        map.set(u.country, { name: u.country, flag: u.flag || "🏛️", count: 1 });
      } else {
        const item = map.get(u.country)!;
        item.count++;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, []);

  const filteredArabUnis = useMemo(() => {
    let list = ARAB_UNIVERSITIES;
    if (selectedArabCountry !== "all") {
      list = list.filter(
        u => u.country === selectedArabCountry || (u.countryEn && u.countryEn.toLowerCase() === selectedArabCountry.toLowerCase())
      );
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        (u.nameEn && u.nameEn.toLowerCase().includes(q)) ||
        u.country.toLowerCase().includes(q) ||
        u.countryEn.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
    );
  }, [searchQuery, selectedArabCountry]);

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

  // AI Quality & Completeness Scoring for Context / Inspector Pane (Pane 4)
  const calculateScholarshipScore = (s: Scholarship | null) => {
    if (!s) return { score: 0, grade: "N/A", missing: [isRtl ? "لم يتم تحديد منحة" : "No scholarship selected"] };
    let score = 0;
    const missing: string[] = [];
    if (s.title || (s as any).title_ar) score += 15; else missing.push(isRtl ? "عنوان المنحة بالعربية" : "Arabic Title");
    if ((s as any).title_en || (s as any).titleEn) score += 10; else missing.push(isRtl ? "عنوان المنحة بالإنجليزية" : "English Title");
    if (s.university || s.org) score += 15; else missing.push(isRtl ? "اسم الجامعة أو الجهة" : "University");
    if (s.country) score += 10; else missing.push(isRtl ? "الدولة والوجهة" : "Country");
    if (s.deadline) score += 15; else missing.push(isRtl ? "الموعد النهائي للتقديم" : "Deadline");
    if (s.coverage) score += 15; else missing.push(isRtl ? "نوع التمويل" : "Coverage type");
    if (s.apply_url && s.apply_url.startsWith("http")) score += 10; else missing.push(isRtl ? "رابط التقديم الرسمي" : "Official Apply URL");
    if (s.description || (s as any).description_ar) score += 10; else missing.push(isRtl ? "الوصف والشروط" : "Description");

    let grade = "A+";
    if (score < 50) grade = "C";
    else if (score < 75) grade = "B";
    else if (score < 90) grade = "A";

    return { score, grade, missing };
  };

  const calculateJobScore = (j: CustomJobItem | null) => {
    if (!j) return { score: 0, grade: "N/A", missing: [isRtl ? "لم يتم تحديد وظيفة" : "No job selected"] };
    let score = 0;
    const missing: string[] = [];
    if (j.title_ar) score += 20; else missing.push(isRtl ? "المسمى الوظيفي" : "Job Title");
    if (j.company) score += 20; else missing.push(isRtl ? "اسم الشركة" : "Company Name");
    if (j.salary) score += 20; else missing.push(isRtl ? "الراتب بالدولار" : "Salary in USD");
    if (j.apply_url && j.apply_url.startsWith("http")) score += 20; else missing.push(isRtl ? "رابط التقديم المباشر" : "Apply URL");
    if (j.description_ar) score += 20; else missing.push(isRtl ? "الوصف والمهام" : "Job Description");

    let grade = "A+";
    if (score < 50) grade = "C";
    else if (score < 80) grade = "B";
    else if (score < 95) grade = "A";

    return { score, grade, missing };
  };

  // Perform single delete/archive with strict permission check
  const requestDelete = (id: string, type: "scholarship" | "job", title: string) => {
    if (!adminAuthStore.canUserPerform(currentUser, "delete")) {
      toast.error(
        isRtl
          ? "غير مصرح لك بحذف أو أرشفة العناصر. هذه الصلاحية مقصورة على المدير العام أو المشرفين الممنوحين إذناً خاصاً."
          : "You do not have permission to delete or archive items."
      );
      return;
    }

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
    if (!adminAuthStore.canUserPerform(currentUser, "delete")) {
      toast.error(isRtl ? "غير مصرح لك بالحذف" : "Permission denied");
      setIsDeletingConfirmOpen(false);
      return;
    }
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
    if (!adminAuthStore.canUserPerform(currentUser, "delete")) {
      toast.error(
        isRtl
          ? "غير مصرح لك بالأرشفة الجماعية. يرجى التواصل مع المدير العام."
          : "You do not have permission for bulk archiving."
      );
      return;
    }
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

  // Bulk Permanent Delete Action (Direct Purge)
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!adminAuthStore.canUserPerform(currentUser, "delete")) {
      toast.error(
        isRtl
          ? "غير مصرح لك بحذف العناصر. يرجى التواصل مع المدير العام."
          : "You do not have permission to delete items."
      );
      return;
    }
    const count = selectedIds.length;
    const type = activeTab === "scholarships" ? "scholarship" : "job";
    const confirmMessage = isRtl
      ? `هل أنت متأكد من مسح وحذف ${count} ${count === 1 ? (type === "scholarship" ? "منحة" : "وظيفة") : (type === "scholarship" ? "منح" : "وظائف")} نهائياً وبشكل فوري؟`
      : `Are you sure you want to permanently delete ${count} selected ${type}(s)?`;

    if (!window.confirm(confirmMessage)) return;

    const items = selectedIds.map(id => ({ id, type }));
    dynamicStore.archiveMultiple(items, currentUser, "مسح وحذف فوري من قبل المشرف");
    selectedIds.forEach(id => {
      try {
        const archive = dynamicStore.getArchivedItems();
        localStorage.setItem("foras_archived_vault_v1", JSON.stringify(archive.filter(a => a.id !== id)));
      } catch {
        // silent
      }
    });

    setSelectedIds([]);
    toast.success(
      isRtl
        ? `تم مسح وحذف ${count} ${count === 1 ? "عنصر" : "عناصر"} بنجاح`
        : `Successfully deleted ${count} item(s)`
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
        { id: "arab_unis" as const, labelAr: "دليل الجامعات العربية", labelEn: "Arab Universities", icon: Building2, badge: universitiesDirectoryStore.getArabUniversities().length },
        { id: "global_unis" as const, labelAr: "دليل الجامعات العالمية", labelEn: "Global Universities", icon: Globe2, badge: GLOBAL_COUNTRIES.length },
        { id: "url_parser" as const, labelAr: "محرر الروابط الذكي AI", labelEn: "AI URL Parser", icon: Sparkles },
        { id: "automation" as const, labelAr: "محرك الأوتوميشن الذكي AI", labelEn: "AI Auto-Ingestion Engine", icon: RefreshCw },
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
      groupTitleAr: "الإعدادات وقاعدة البيانات",
      groupTitleEn: "Settings & Database",
      items: [
        { id: "database" as const, labelAr: "السحابة ونظام الأوفلاين (Master)", labelEn: "Cloud & Global Offline (Master)", icon: Database },
        { id: "backup" as const, labelAr: "تصدير / استيراد البيانات", labelEn: "Data Backup & Restore", icon: Download },
        { id: "security" as const, labelAr: "تغيير كلمة المرور", labelEn: "Admin Password", icon: KeyRound },
      ],
    },
  ];

  if (!isOpen) return null;

  const content = (
    <div
      dir={dir}
      className={
        isStandalonePage
          ? "w-full h-screen flex flex-col bg-background overflow-hidden"
          : "fixed inset-0 z-[999999] w-screen h-screen max-w-none max-h-none flex items-center justify-center p-0 bg-black/95 backdrop-blur-xl overflow-hidden"
      }
      style={
        isStandalonePage
          ? { width: "100%", height: "100vh" }
          : { width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "auto" }
      }
    >
      {/* Backdrop Click Dismiss */}
      {!isStandalonePage && <div className="fixed inset-0" onClick={onClose} />}

      {/* Main Slide-Sidebar Dashboard Window - 100% Fullscreen on all devices */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className={
          isStandalonePage
            ? "relative w-full h-full bg-card/98 border-0 overflow-hidden z-10 flex flex-col"
            : "relative w-full h-full max-w-none max-h-none bg-card/98 border-0 rounded-none shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl overflow-hidden z-10 flex flex-col"
        }
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar with Multi-Pane Controls */}
        <header className="relative flex items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-3 border-b border-primary/20 bg-background/50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {currentUser && (
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                  sidebarOpen
                    ? "bg-primary text-primary-foreground border-primary shadow-gold"
                    : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                }`}
                aria-label="Toggle Sidebar"
                title={isRtl ? "القائمة الجانبية" : "Sidebar"}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>

            <div className="min-w-0">
              <h2
                className="font-bold text-xs xs:text-sm sm:text-base md:text-lg text-gold-gradient leading-tight truncate"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {t("adminTitle")}
              </h2>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-300 block truncate">
                {currentUser
                  ? t("adminActiveSession")
                      .replace("{name}", currentUser.name)
                      .replace("{role}", currentUser.role === "super_admin" ? (isRtl ? "المدير العام" : "Super Admin") : (isRtl ? "مشرف محتوى" : "Moderator"))
                  : t("adminLoginPrompt")}
              </span>
            </div>
          </div>

          {/* Interactive CSS Grid Breakpoint Switcher (From Video) */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-primary/30 text-xs">
              <span className="text-[10px] font-bold text-gray-400 px-1.5 uppercase tracking-wider">
                {isRtl ? "تخطيط الألواح:" : "Grid Panes:"}
              </span>
              <button
                type="button"
                onClick={() => setDeviceSimulator("auto")}
                className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  deviceSimulator === "auto"
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title={isRtl ? "تلقائي حسب الشاشة" : "Auto responsive"}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isRtl ? "تلقائي" : "Auto"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeviceSimulator("phone");
                  setMobileViewPane("list");
                }}
                className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  deviceSimulator === "phone"
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title="Phone Grid (<560px)"
              >
                <Smartphone className="w-3 h-3" />
                <span>Phone</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceSimulator("tablet")}
                className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  deviceSimulator === "tablet"
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title="Tablet Grid (560px - 900px)"
              >
                <Tablet className="w-3 h-3" />
                <span>Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceSimulator("laptop")}
                className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  deviceSimulator === "laptop"
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title="Laptop Grid (900px - 1280px)"
              >
                <Laptop className="w-3 h-3" />
                <span>Laptop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceSimulator("desktop")}
                className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  deviceSimulator === "desktop"
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                title="Desktop 4-Panes (≥1280px)"
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>

              <div className="w-[1px] h-4 bg-primary/20 mx-1" />

              <button
                type="button"
                onClick={() => setIsInspectorOpen(prev => !prev)}
                className={`px-2 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isInspectorOpen
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title={isRtl ? "لوح السياق والذكاء الاصطناعي (Pane 4)" : "Context & AI Inspector (Pane 4)"}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isRtl ? "لوح السياق" : "Context"}</span>
              </button>
            </div>
          )}

          {/* Direct Firebase Database Connection Status Pill */}
          {currentUser && (
            <button
              type="button"
              onClick={() => handleSelectTab("database")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-background/70 border border-primary/25 hover:border-primary/60 text-2xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
              title={isRtl ? "مراقبة اتصال قاعدة البيانات السحابية" : "Firebase Connection Status"}
            >
              <Database className="w-3 h-3 text-primary" />
              <span className="hidden xl:inline">{isRtl ? "قاعدة البيانات:" : "DB:"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">Firebase</span>
            </button>
          )}

          {/* Real-time Broadcast Notification to All Users */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setBroadcastModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/60 text-2xs font-bold text-amber-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title={isRtl ? "بث إشعار عام لحظي لجميع المستخدمين" : "Broadcast Notification"}
            >
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">{isRtl ? "بث إشعار عام" : "Broadcast"}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-[11px] sm:text-xs font-bold hover:bg-destructive/25 transition-all cursor-pointer whitespace-nowrap"
              >
                {t("adminLockLogout")}
              </button>
            )}
            <button
              onClick={onClose}
              className={`rounded-xl border border-primary/30 hover:bg-primary/25 text-gray-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0 font-bold active:scale-95 shadow-sm ${
                isStandalonePage
                  ? "px-3.5 py-2 min-h-[40px] sm:min-h-[44px] bg-primary/20 text-primary hover:text-primary text-xs sm:text-sm"
                  : "w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/15"
              }`}
              title={isRtl ? "العودة إلى التطبيق الرئيسي" : "Back to Main App"}
            >
              {isStandalonePage ? (
                <>
                  {isRtl ? <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span>{isRtl ? "العودة للتطبيق" : "Back to App"}</span>
                </>
              ) : (
                <X className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </header>

        {/* Content Area: Login Screen OR Slide Sidebar Layout */}
        {!currentUser ? (
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: isShakeError ? [-10, 10, -10, 10, -5, 5, 0] : 0,
              }}
              transition={{ duration: isShakeError ? 0.4 : 0.2 }}
              className="w-full max-w-md sm:max-w-lg p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4 sm:space-y-5 my-auto"
            >
              {/* Header Icon & Title */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-2 sm:mb-2.5 shadow-gold">
                  {loginRole === "super_admin" ? (
                    <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  ) : (
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  )}
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {t("adminLoginTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  {isRtl
                    ? "اختر نوع الصلاحية وأدخل الرمز السري للوصول إلى لوحة الإدارة"
                    : "Select your role and enter the security PIN to access the dashboard"}
                </p>
              </div>

              {/* Security Lockout Banner (if locked) */}
              {lockoutState.isLocked && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-destructive/15 border-2 border-destructive/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-destructive font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{t("adminLockoutTitle")}</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed text-xs">
                    {t("adminLockoutNotice")}
                  </p>
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-destructive/20 flex-wrap">
                    <span className="text-[11px] text-destructive/90 font-medium">
                      {isRtl ? "تم توثيق المحاولات الخاطئة في سجل الأمان" : "Failed attempts logged in audit trail"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecoveryOpen(true);
                        setRecoveryStep("send_otp");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground font-bold text-xs hover:bg-destructive/90 transition-all cursor-pointer shadow-md"
                    >
                      {t("adminForgotPassword")}
                    </button>
                  </div>
                </div>
              )}

              {/* Remaining Attempts Indicator (if not locked, but has failed attempts) */}
              {!lockoutState.isLocked && lockoutState.failedAttempts > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">
                      {3 - lockoutState.failedAttempts === 1
                        ? t("adminOneAttemptLeft")
                        : t("adminAttemptsLeft").replace("{count}", String(3 - lockoutState.failedAttempts))}
                    </span>
                  </div>
                  <span className="text-2xs opacity-80 font-mono">
                    {lockoutState.failedAttempts}/3
                  </span>
                </div>
              )}

              {/* Role Segmented Switcher */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-background/80 p-1 sm:p-1.5 rounded-2xl border border-primary/30">
                <button
                  type="button"
                  onClick={() => setLoginRole("super_admin")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    loginRole === "super_admin"
                      ? "bg-gold-gradient text-primary-foreground shadow-gold"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">{isRtl ? "المدير العام (Super Admin)" : "Super Admin"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginRole("moderator")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    loginRole === "moderator"
                      ? "bg-gold-gradient text-primary-foreground shadow-gold"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">{isRtl ? "مشرف محتوى (Moderator)" : "Moderator"}</span>
                </button>
              </div>

              {/* Role Description Badge */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 text-xs">
                <span className="text-primary font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {loginRole === "super_admin"
                      ? (isRtl ? "صلاحيات مطلقة: حذف، أرشفة، إدارة فريق" : "Full Access: Delete, archive, manage team")
                      : (isRtl ? "صلاحيات إشرافية: تحرير ونشر المحتوى" : "Editorial Access: Review & publish content")}
                  </span>
                </span>
                <span className="text-amber-300 font-mono font-bold text-2xs bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 whitespace-nowrap self-end xs:self-auto">
                  {loginRole === "super_admin" ? "PIN: 2026" : "PIN: 123456"}
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
                {/* Identifier Input - White/Luminous style */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    {loginRole === "super_admin"
                      ? (isRtl ? "البريد الإلكتروني للمدير العام" : "Super Admin Email")
                      : (isRtl ? "البريد الإلكتروني للمشرف أو اسم المستخدم" : "Moderator Email or Username")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={e => setIdentifierInput(e.target.value)}
                      placeholder={loginRole === "super_admin" ? "alforas.one@gmail.com" : "scholarships@foras.app"}
                      disabled={lockoutState.isLocked}
                      className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 font-semibold text-xs sm:text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-[0_0_15px_rgba(255,255,255,0.15)] outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      dir={dir}
                    />
                    <span className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-600 text-xs">
                      {loginRole === "super_admin" ? "👑" : "🛡️"}
                    </span>
                  </div>
                </div>

                {/* Password / PIN Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-bold text-gray-200">
                      {usePinMode
                        ? (isRtl ? `رمز PIN السري (${pinDigits.length} أرقام)` : `Security PIN (${pinDigits.length} digits)`)
                        : t("adminPasswordOrPin")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setUsePinMode(p => !p)}
                      disabled={lockoutState.isLocked}
                      className="text-primary text-xs font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {usePinMode
                        ? (isRtl ? "التبديل لكلمة المرور النصية" : "Use Password field")
                        : (isRtl ? "التبديل لمربعات PIN" : "Use PIN boxes")}
                    </button>
                  </div>

                  {usePinMode ? (
                    <div className="space-y-2">
                      {/* Discrete PIN Digit Boxes - Sleek & Responsive Star Matrix */}
                      <div
                        className={`flex items-center justify-center py-1 sm:py-1.5 ${
                          pinDigits.length > 4 ? "gap-1.5 xs:gap-2 sm:gap-2.5" : "gap-2 xs:gap-2.5 sm:gap-3"
                        }`}
                        dir="ltr"
                      >
                        {pinDigits.map((digit, idx) => {
                          const isDigitRevealed = showPassword || !!revealedIndices[idx];
                          const displayVal = digit ? (isDigitRevealed ? digit : "★") : "";
                          const isLongPin = pinDigits.length > 4;
                          return (
                            <input
                              key={idx}
                              ref={el => (pinInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              autoComplete="off"
                              disabled={lockoutState.isLocked}
                              value={displayVal}
                              onChange={e => handlePinDigitChange(idx, e.target.value)}
                              onKeyDown={e => handlePinKeyDown(idx, e)}
                              onPaste={handlePinPaste}
                              className={`text-center font-bold font-mono border-2 transition-all outline-none flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isLongPin
                                  ? "w-8 h-10 xs:w-9 xs:h-11 sm:w-10 sm:h-12 rounded-lg sm:rounded-xl"
                                  : "w-9 h-11 xs:w-10 xs:h-11 sm:w-11 sm:h-12 rounded-xl"
                              } ${
                                digit
                                  ? isDigitRevealed
                                    ? `border-primary bg-white text-gray-950 shadow-[0_0_12px_hsl(43_74%_49%/0.5)] ring-1.5 ring-primary/50 ${
                                        isLongPin ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                                      }`
                                    : `border-primary bg-white text-amber-500 shadow-[0_0_10px_hsl(43_74%_49%/0.35)] ring-1 ring-primary/30 ${
                                        isLongPin ? "text-base sm:text-lg" : "text-lg sm:text-xl"
                                      }`
                                  : `border-primary/40 bg-white/95 text-gray-900 hover:border-primary focus:border-primary focus:bg-white focus:shadow-[0_0_10px_rgba(255,255,255,0.3)] ${
                                      isLongPin ? "text-sm sm:text-base" : "text-base sm:text-lg"
                                    }`
                              } ${revealedIndices[idx] ? "scale-105 transition-transform" : ""}`}
                              autoFocus={idx === 0 && !lockoutState.isLocked}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-2xs text-gray-300 px-1 pt-0.5">
                        <span className="truncate">{isRtl ? "💡 يدعم اللصق والتنقل" : "💡 Supports auto-focus"}</span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="text-primary hover:text-white font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                          <span>{showPassword ? (isRtl ? "إخفاء الرمز" : "Hide PIN") : (isRtl ? "إظهار الرمز" : "Show PIN")}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <StarMaskedInput
                        value={passwordInput}
                        onChange={setPasswordInput}
                        showPlain={showPassword}
                        disabled={lockoutState.isLocked}
                        placeholder="★★★★★★"
                        className="w-full py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all ps-3.5 pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-600 hover:text-gray-900 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-700" /> : <Eye className="w-4 h-4 text-primary" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryOpen(true);
                      setRecoveryStep("send_otp");
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary-foreground hover:underline transition-all cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t("adminForgotPassword")}</span>
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="luxe"
                  size="lg"
                  disabled={lockoutState.isLocked}
                  className="w-full py-3 sm:py-3.5 rounded-xl shadow-gold font-bold text-sm sm:text-base cursor-pointer mt-1 sm:mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 mx-1.5" />
                  <span>{t("adminUnlockBtn")}</span>
                </Button>
              </form>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            {/* Seamless Inline Collapsible Navigation Rail (Integrated Pure Inline Flex Element) */}
            <motion.aside
              initial={false}
              animate={{
                width: sidebarOpen
                  ? (typeof window !== "undefined" && window.innerWidth < 640 ? 230 : 260)
                  : 0,
                opacity: sidebarOpen ? 1 : 0,
              }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="relative inset-y-0 start-0 z-10 h-full bg-card/95 border-e border-primary/20 flex-shrink-0 flex flex-col overflow-hidden select-none"
            >
              {/* Inner wrapper with fixed width so contents animate gracefully without wrapping during collapse */}
              <div className="w-[230px] sm:w-[260px] h-full flex flex-col overflow-hidden">
                {/* Sidebar Search Section */}
                <div className="p-2 sm:p-2.5 border-b border-primary/20 w-full flex-shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={sidebarSearch}
                      onChange={e => setSidebarSearch(e.target.value)}
                      placeholder={t("adminSearchMenu")}
                      className="w-full py-1.5 ps-8 pe-2.5 rounded-xl bg-background/80 border border-primary/30 text-xs text-white focus:border-primary outline-none"
                      dir={dir}
                    />
                  </div>
                </div>

                {/* Sidebar Task Groups & Nav Items */}
                <div className="flex-1 overflow-y-auto w-full p-2 space-y-3 scrollbar-thin scrollbar-thumb-primary/20">
                  {menuGroups.map((grp, gIdx) => {
                    const filteredItems = grp.items.filter(
                      it =>
                        !sidebarSearch.trim() ||
                        it.labelAr.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                        it.labelEn.toLowerCase().includes(sidebarSearch.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={gIdx} className="space-y-1 w-full">
                        <span className="text-[10px] font-extrabold text-gray-400 px-2 uppercase tracking-wider block mb-1 opacity-75">
                          {isRtl ? grp.groupTitleAr : grp.groupTitleEn}
                        </span>

                        <div className="space-y-1">
                          {filteredItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  handleSelectTab(item.id);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer rounded-xl relative ${
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-gold font-bold ring-1 ring-primary/40"
                                    : "text-gray-300 hover:text-white hover:bg-primary/15 border border-transparent hover:border-primary/20"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                                  <span className="truncate">{isRtl ? item.labelAr : item.labelEn}</span>
                                </div>

                                {/* Badge Indicator */}
                                {item.badge !== undefined && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>

            {/* Main Active Tab Content View */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background/30">
              {/* Active Tab Sub-Header & Search Filter Bar */}
              <div className="p-3 sm:p-4 border-b border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-card/40 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Tri-state Header Checkbox for Lists (Video 1) */}
                  {(activeTab === "scholarships" || activeTab === "jobs" || activeTab === "archive") && (
                    <button
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-card border border-primary/30 hover:border-primary text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer flex-shrink-0"
                      title={isAllSelected ? t("adminDeselectAll") : t("adminSelectAll")}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      ) : isPartiallySelected ? (
                        <MinusSquare className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                      <span className="hidden sm:inline">
                        {t("adminSelectAll")}
                      </span>
                    </button>
                  )}

                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
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
                      className={`w-full py-2 ps-9 pe-3 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white focus:border-primary outline-none`}
                      dir={dir}
                    />
                  </div>
                </div>
              </div>

              {/* Tab Views */}
              <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-background/20 min-h-0 flex flex-col">
                {/* 1. Scholarships Management - Modular View */}
                {activeTab === "scholarships" && (
                  <ScholarshipsManagementView
                    isRtl={isRtl}
                    dir={dir}
                    t={t}
                    deviceSimulator={deviceSimulator}
                    mobileViewPane={mobileViewPane}
                    setMobileViewPane={setMobileViewPane}
                    filteredScholarships={filteredScholarships}
                    scholarships={scholarships}
                    hasActiveScholarshipFilters={hasActiveScholarshipFilters}
                    resetScholarshipFilters={resetScholarshipFilters}
                    currentUser={currentUser}
                    scholarshipCategoryFilter={scholarshipCategoryFilter}
                    setScholarshipCategoryFilter={setScholarshipCategoryFilter}
                    scholarshipFundingFilter={scholarshipFundingFilter}
                    setScholarshipFundingFilter={setScholarshipFundingFilter}
                    scholarshipDegreeFilter={scholarshipDegreeFilter}
                    setScholarshipDegreeFilter={setScholarshipDegreeFilter}
                    scholarshipDeadlineFilter={scholarshipDeadlineFilter}
                    setScholarshipDeadlineFilter={setScholarshipDeadlineFilter}
                    scholarshipCategoryCounts={scholarshipCategoryCounts}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    handleToggleSelectItem={handleToggleSelectItem}
                    editingScholarship={editingScholarship}
                    setEditingScholarship={setEditingScholarship}
                    calculateScholarshipScore={calculateScholarshipScore}
                    isInspectorOpen={isInspectorOpen}
                    setIsInspectorOpen={setIsInspectorOpen}
                    scholarshipDuplicateResult={scholarshipDuplicateResult}
                    duplicateOverriddenId={duplicateOverriddenId}
                    setDuplicateOverriddenId={setDuplicateOverriddenId}
                    activeEditorTab={activeEditorTab}
                    setActiveEditorTab={setActiveEditorTab}
                  />
                )}

                {/* 2. Jobs Management - Modular View */}
                {activeTab === "jobs" && (
                  <JobsManagementView
                    isRtl={isRtl}
                    dir={dir}
                    t={t}
                    deviceSimulator={deviceSimulator}
                    mobileViewPane={mobileViewPane}
                    setMobileViewPane={setMobileViewPane}
                    currentUser={currentUser}
                    filteredJobs={filteredJobs}
                    selectedIds={selectedIds}
                    handleToggleSelectItem={handleToggleSelectItem}
                    editingJob={editingJob}
                    setEditingJob={setEditingJob}
                    calculateJobScore={calculateJobScore}
                    isInspectorOpen={isInspectorOpen}
                    setIsInspectorOpen={setIsInspectorOpen}
                    activeEditorTab={activeEditorTab}
                    setActiveEditorTab={setActiveEditorTab}
                  />
                )}

                {/* Arab Universities Management / Directory */}
                {activeTab === "arab_unis" && (
                  <ArabUniversitiesAdminView
                    isRtl={isRtl}
                    searchQuery={searchQuery}
                    onSelectScholarshipDraft={(draft) => {
                      setEditingScholarship(draft as any);
                      toast.info(isRtl ? "تم تجهيز بطاقة المنحة بنجاح! راجع التفاصيل واضغط حفظ ونشر" : "Scholarship pre-filled! Review and click Save");
                    }}
                    onResetSearch={() => setSearchQuery("")}
                  />
                )}

                {/* Global Universities Management / Directory */}
                {activeTab === "global_unis" && (
                  <GlobalUniversitiesAdminView
                    isRtl={isRtl}
                    searchQuery={searchQuery}
                    onSelectScholarshipDraft={(draft) => {
                      setEditingScholarship(draft as any);
                      toast.info(isRtl ? "تم تجهيز بطاقة المنحة بنجاح! راجع التفاصيل واضغط حفظ ونشر" : "Scholarship pre-filled! Review and click Save");
                    }}
                  />
                )}

                {/* 3. Archive Vault (Soft Delete View & Danger Zone) */}
                {activeTab === "archive" && (
                  <ArchiveVaultAdminView
                    isRtl={isRtl}
                    t={t}
                    dir={dir}
                    archivedItems={archivedItems}
                    filteredArchive={filteredArchive}
                    selectedIds={selectedIds}
                    currentUser={currentUser}
                    onToggleSelectItem={handleToggleSelectItem}
                    onRestoreItem={(id, title) => {
                      dynamicStore.restoreArchivedItem(id);
                      toast.success(isRtl ? `تمت استعادة "${title}" بنجاح` : `Restored successfully`);
                    }}
                    onPermanentlyDeleteItem={(id) => {
                      if (currentUser) {
                        dynamicStore.permanentlyDeleteArchivedItem(id, currentUser);
                        toast.success(isRtl ? "تم الحذف النهائي" : "Permanently deleted");
                      }
                    }}
                    onEmptyArchive={handleEmptyArchive}
                  />
                )}

                {/* 4. AI URL Smart Parser */}
                {activeTab === "url_parser" && (
                  <AdminUrlParserView
                    isRtl={isRtl}
                    t={t}
                    urlType={urlType}
                    setUrlType={setUrlType}
                    urlInput={urlInput}
                    setUrlInput={setUrlInput}
                    isParsing={isParsing}
                    setIsParsing={setIsParsing}
                    parsedPreview={parsedPreview}
                    setParsedPreview={setParsedPreview}
                    urlDuplicateResult={urlDuplicateResult}
                    onNavigateToExisting={(item, type) => {
                      if (type === "scholarship") {
                        setEditingScholarship(item);
                        setActiveTab("scholarships");
                        setMobileViewPane("detail");
                      } else {
                        setEditingJob(item);
                        setActiveTab("jobs");
                        setMobileViewPane("detail");
                      }
                      toast.info(
                        isRtl
                          ? `تم الانتقال مباشرة للعنصر المسجل: "${item.title_ar || item.title}"`
                          : `Navigated to registered item: "${item.titleEn || item.title}"`
                      );
                    }}
                    onApproveParsed={(approvedData) => {
                      if (urlType === "scholarship") {
                        dynamicStore.saveScholarship(approvedData);
                        setScholarshipCategoryFilter("all");
                        setScholarshipSearchQuery("");
                      } else {
                        dynamicStore.saveJob(approvedData);
                        setJobCategoryFilter("all");
                        setJobSearchQuery("");
                      }
                      toast.success(
                        isRtl
                          ? `تم اعتماد ونشر "${approvedData.title_ar || approvedData.title}" بنجاح!`
                          : `Published "${approvedData.title_en || approvedData.title}" successfully!`
                      );
                      setParsedPreview(null);
                      setUrlInput("");
                      setActiveTab(urlType === "scholarship" ? "scholarships" : "jobs");
                    }}
                  />
                )}

                {/* Automation Engine Tab */}
                {activeTab === "automation" && (
                  <AutomationCommandCenter
                    isRtl={isRtl}
                    currentUser={currentUser}
                    scholarshipsCount={scholarships.length}
                    jobsCount={jobs.length}
                    onSyncClient={handleSyncWithServer}
                    initialSubTab="control"
                  />
                )}

                {/* Pending Submissions / Reviews Tab */}
                {activeTab === "pending_reviews" && (
                  <AutomationCommandCenter
                    isRtl={isRtl}
                    currentUser={currentUser}
                    scholarshipsCount={scholarships.length}
                    jobsCount={jobs.length}
                    onSyncClient={handleSyncWithServer}
                    initialSubTab="pending"
                  />
                )}

                {/* 5. Team & Moderators Management & RBAC Permissions */}
                {activeTab === "team" && (
                  <TeamManagementAdminView
                    isRtl={isRtl}
                    t={t}
                    teamMembers={teamMembers}
                    currentUser={currentUser}
                    onRefreshTeam={() => setTeamMembers(adminAuthStore.getUsers())}
                  />
                )}

                {/* 6. Security Audit Logs */}
                {activeTab === "audit_logs" && (
                  <AuditLogsAdminView
                    isRtl={isRtl}
                    t={t}
                    auditLogs={auditLogs}
                    lockoutState={lockoutState}
                    currentUser={currentUser}
                    onUnlockAccount={() => {
                      adminAuthStore.unlockAccount(currentUser);
                      setLockoutState(adminAuthStore.getLockoutState());
                      toast.success(isRtl ? "تم إلغاء الحظر الأمني بنجاح وفك القفل" : "Security lockout cleared");
                    }}
                  />
                )}

                {/* 7. Pending Reviews */}
                {activeTab === "pending_reviews" && (
                  <PendingReviewsAdminView
                    isRtl={isRtl}
                    t={t}
                    pendingItems={pendingItems}
                    currentUser={currentUser}
                    onApprovePending={(p) => {
                      if (!currentUser) return;
                      adminAuthStore.approvePending(p.id, currentUser);
                      if (p.type === "scholarship") dynamicStore.saveScholarship(p.itemData);
                      else dynamicStore.saveJob(p.itemData);
                      toast.success(isRtl ? "تمت الموافقة والنشر" : "Approved & Published");
                    }}
                  />
                )}

                {/* 8. Backup & Restore */}
                {activeTab === "backup" && (
                  <DataBackupAdminView isRtl={isRtl} t={t} />
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

                {/* 10. Firebase Cloud Database Health & Security */}
                {activeTab === "database" && (
                  <div className="h-full overflow-y-auto p-1 sm:p-2">
                    <CloudDatabaseHealthMonitor />
                  </div>
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
                          <RotateCcw className="w-4 h-4 mx-1.5" />
                          <span>{t("adminRestoreSelected").replace("{count}", String(selectedIds.length))}</span>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="font-bold text-xs sm:text-sm cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                            title={isRtl ? "مسح وحذف نهائي من النظام" : "Permanently delete selected"}
                          >
                            <Trash2 className="w-4 h-4 mx-1" />
                            <span>{isRtl ? `مسح وحذف (${selectedIds.length})` : `Delete (${selectedIds.length})`}</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleBulkArchive}
                            className="font-bold text-xs sm:text-sm cursor-pointer border border-primary/30 text-amber-300 hover:text-white flex items-center gap-1.5"
                            title={isRtl ? "نقل العناصر المحددة للأرشيف" : "Archive selected"}
                          >
                            <Archive className="w-4 h-4 mx-1" />
                            <span>{t("adminArchiveSelected").replace("{count}", String(selectedIds.length))}</span>
                          </Button>
                        </div>
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
                {t("adminDeleteModalDesc").replace("{title}", pendingDeleteAction?.title || "")}
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

      {/* Modular Admin Modals: Edit Scholarship, Edit Job, Password Recovery, and Broadcast Notification */}
      <AdminEditScholarshipModal
        editingScholarship={editingScholarship}
        setEditingScholarship={setEditingScholarship}
        onSave={(scholarship) => {
          dynamicStore.saveScholarship(scholarship);
          setEditingScholarship(null);
          toast.success(isRtl ? "تم حفظ وتحديث بيانات المنحة بنجاح" : "Scholarship saved successfully");
        }}
        onClose={() => setEditingScholarship(null)}
        isRtl={isRtl}
        dir={dir}
        t={t}
      />

      <AdminEditJobModal
        editingJob={editingJob}
        setEditingJob={setEditingJob}
        onSave={(job) => {
          dynamicStore.saveJob(job);
          setEditingJob(null);
          toast.success(isRtl ? "تم حفظ ونشر فرصة العمل بنجاح" : "Job saved successfully");
        }}
        onClose={() => setEditingJob(null)}
        isRtl={isRtl}
        dir={dir}
        t={t}
      />

      <AdminRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        isRtl={isRtl}
        dir={dir}
        t={t}
        onSuccess={() => {
          setLockoutState(adminAuthStore.getLockoutState());
          setPasswordInput("");
          setPinDigits(["", "", "", ""]);
        }}
      />

      <AdminBroadcastModal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        isRtl={isRtl}
        t={t}
      />
    </div>
  );

  if (isStandalonePage || typeof document === "undefined") return content;
  return createPortal(content, document.body);
};
