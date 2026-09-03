import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Laptop, Monitor, SlidersHorizontal, BarChart3, Copy, Link2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scholarship } from "@/lib/mockData";
import { dynamicStore, CustomJobItem, ArchivedItem } from "@/lib/dynamicStore";
import { adminAuthStore, AdminUser, AuditLog, PendingItem, AdminRole, LockoutState, UNIFIED_ADMIN_EMAIL } from "@/lib/adminAuthStore";
import { ARAB_UNIVERSITIES, ARAB_COUNTRY_STATS } from "@/lib/arabUniversities";
import { GLOBAL_COUNTRIES } from "@/lib/globalUniversities";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SecurityPasswordManager } from "@/components/foras/SecurityPasswordManager";
import { StarMaskedInput } from "@/components/foras/StarMaskedInput";
import { checkScholarshipDuplicate } from "@/lib/duplicateChecker";
import { ScholarshipDuplicateBanner, QuickExistenceCheckerModal } from "@/components/foras/ScholarshipDuplicateGuard";

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

  // Auto-Submit when all PIN digits are filled!
  useEffect(() => {
    if (usePinMode && !currentUser && !lockoutState.isLocked) {
      const isComplete = pinDigits.every(d => d !== "");
      if (isComplete) {
        const fullPin = pinDigits.join("");
        performLogin(identifierInput, fullPin);
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
  const [isQuickCheckerOpen, setIsQuickCheckerOpen] = useState(false);
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

  const content = (
    <div
      dir={dir}
      className="fixed inset-0 z-[999999] w-screen h-screen max-w-none max-h-none flex items-center justify-center p-0 bg-black/95 backdrop-blur-xl overflow-hidden"
      style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop Click Dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Slide-Sidebar Dashboard Window - 100% Fullscreen on all devices */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative w-full h-full max-w-none max-h-none bg-card/98 border-0 rounded-none shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl overflow-hidden z-10 flex flex-col"
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
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-primary/15 border border-primary/30 hover:bg-primary/25 text-gray-200 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
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
                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-3" : "right-3"} text-gray-600 text-xs`}>
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
                        className={`w-full py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                          isRtl ? "pl-10 pr-3.5" : "pr-10 pl-3.5"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-3" : "right-3"} text-gray-600 hover:text-gray-900 cursor-pointer p-1`}
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
                  <Lock className="w-4 h-4 mr-1.5 ml-1.5" />
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
                    <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-2.5" : "left-2.5"} text-gray-400`} />
                    <input
                      type="text"
                      value={sidebarSearch}
                      onChange={e => setSidebarSearch(e.target.value)}
                      placeholder={t("adminSearchMenu")}
                      className={`w-full py-1.5 ${isRtl ? "pr-8 pl-2.5" : "pl-8 pr-2.5"} rounded-xl bg-background/80 border border-primary/30 text-xs text-white focus:border-primary outline-none`}
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
                                  setActiveTab(item.id);
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

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {activeTab === "scholarships" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsQuickCheckerOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                      title={isRtl ? "التحقق من وجود أو تكرار منحة قبل إضافتها" : "Check for duplicates"}
                    >
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>{isRtl ? "فاحص التكرار" : "Duplicate Inspector"}</span>
                    </Button>
                  )}

                  {activeTab === "scholarships" && adminAuthStore.canUserPerform(currentUser, "create") && (
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

                  {activeTab === "jobs" && adminAuthStore.canUserPerform(currentUser, "create") && (
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
              <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-background/20">
                {/* 1. Scholarships Management - Multi-Pane Responsive Adaptive Grid (Video 2) */}
                {activeTab === "scholarships" && (
                  <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
                    {/* Pane 2: List Pane (Width: 4/12 on lg, 5/12 on xl, 12/12 on mobile list view) */}
                    <div
                      className={`h-full flex flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                        deviceSimulator === "phone" && mobileViewPane === "detail"
                          ? "hidden"
                          : "lg:col-span-4 xl:col-span-4 flex"
                      }`}
                    >
                      {/* List Header */}
                      <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-white">
                            {t("adminActiveScholarshipsCount").replace("{count}", String(filteredScholarships.length))}
                          </span>
                        </div>
                        {adminAuthStore.canUserPerform(currentUser, "create") && (
                          <button
                            onClick={() => {
                              const newSch = {
                                id: `sch_${Date.now()}`,
                                title_ar: "منحة دراسية جديدة ممولة بالكامل",
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
                                description_ar: "وصف المنحة وتفاصيل الدعم المالي والرسوم والتذاكر والسكن.",
                                description_en: "Scholarship description and full financial coverage details.",
                                benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني"],
                                benefits_en: ["Full tuition waiver", "Monthly stipend"],
                              };
                              setEditingScholarship(newSch as any);
                              setMobileViewPane("detail");
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-gold hover:opacity-90 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isRtl ? "إضافة منحة" : "New"}</span>
                          </button>
                        )}
                      </div>

                      {/* Scrollable List Items */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-primary/20">
                        {filteredScholarships.length === 0 ? (
                          <div className="text-center py-12 p-4 rounded-xl bg-card/40 border border-primary/20">
                            <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-gray-300 font-bold">{t("adminNoScholarships")}</p>
                          </div>
                        ) : (
                          filteredScholarships.map((s, idx) => {
                            const isSelected = selectedIds.includes(s.id);
                            const isActiveEdit = editingScholarship?.id === s.id;
                            const scoreData = calculateScholarshipScore(s);

                            return (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setEditingScholarship(s);
                                  setMobileViewPane("detail");
                                }}
                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                                  isActiveEdit
                                    ? "bg-primary/20 border-primary shadow-gold"
                                    : isSelected
                                    ? "bg-primary/10 border-primary/50"
                                    : "bg-card/70 border-primary/15 hover:border-primary/40 hover:bg-card"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleSelectItem(s.id, idx, e);
                                      }}
                                      className="pt-0.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                    >
                                      {isSelected ? (
                                        <CheckSquare className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Square className="w-4 h-4 text-gray-400" />
                                      )}
                                    </button>

                                    <div className="min-w-0">
                                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                                        {isRtl ? s.title || (s as any).title_ar : (s as any).title_en || s.title}
                                      </h4>
                                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                        {s.university || s.org} • {s.country}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${
                                      scoreData.score >= 85
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    }`}
                                  >
                                    {scoreData.score}%
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-primary/10 text-gray-400">
                                  <span className="text-amber-300 font-medium">
                                    {s.coverage === "full" ? (isRtl ? "ممولة بالكامل" : "Fully Funded") : s.coverage}
                                  </span>
                                  <span className="text-gray-400 text-[10px]">
                                    {s.deadline ? s.deadline : isRtl ? "مفتوح دائماً" : "Open"}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Pane 3: Detail Workspace Pane (Width: 8/12 on lg, 5/12 on xl when Inspector is open, 12/12 on mobile detail view) */}
                    <div
                      className={`h-full flex flex-col bg-card/75 border border-primary/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                        deviceSimulator === "phone" && mobileViewPane === "list"
                          ? "hidden"
                          : isInspectorOpen
                          ? "lg:col-span-8 xl:col-span-5 flex"
                          : "lg:col-span-8 xl:col-span-8 flex"
                      }`}
                    >
                      {editingScholarship ? (
                        <div className="h-full flex flex-col overflow-hidden">
                          {/* Workspace Header with Tabs & Actions */}
                          <div className="p-3 border-b border-primary/20 bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              {deviceSimulator === "phone" && (
                                <button
                                  onClick={() => setMobileViewPane("list")}
                                  className="p-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                                  <span>{isRtl ? "القائمة" : "List"}</span>
                                </button>
                              )}
                              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                                <Edit3 className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                                  {isRtl ? editingScholarship.title || (editingScholarship as any).title_ar : (editingScholarship as any).title_en || editingScholarship.title}
                                </h3>
                                <p className="text-[10px] text-gray-400">
                                  {editingScholarship.id}
                                </p>
                              </div>
                            </div>

                            {/* Actions & Tab Switchers */}
                            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingScholarship(null)}
                                className="h-8 px-2.5 rounded-xl text-xs cursor-pointer text-gray-300 hover:text-white"
                              >
                                {isRtl ? "إغلاق" : "Close"}
                              </Button>
                              <Button
                                variant="luxe"
                                size="sm"
                                onClick={() => {
                                  if (scholarshipDuplicateResult.isDuplicate && duplicateOverriddenId !== editingScholarship.id) {
                                    toast.error(
                                      isRtl
                                        ? `⚠️ تنبيه النزاهة: تم رصد منحة مطابقة مسبقاً (${scholarshipDuplicateResult.matchedItem?.title})! اضغط "تجاوز" في صندوق التنبيه لتأكيد الحفظ كمنحة منفصلة.`
                                        : `⚠️ Duplicate detected! Click "Ignore" on the alert to save as separate.`
                                    );
                                    return;
                                  }
                                  dynamicStore.saveScholarship(editingScholarship);
                                  toast.success(isRtl ? "تم الحفظ والنشر الفوري بنجاح" : "Saved & Published successfully");
                                }}
                                className="h-8 px-3 rounded-xl text-xs font-bold shadow-gold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 me-1" />
                                {t("adminSavePublish")}
                              </Button>
                            </div>
                          </div>

                          {/* Editor Tabs Navigation (Pane 3 Tabs) */}
                          <div className="flex items-center gap-1 p-2 bg-background/50 border-b border-primary/15 overflow-x-auto flex-shrink-0">
                            {[
                              { id: "info", labelAr: "البيانات الأساسية", labelEn: "Basic Info" },
                              { id: "financials", labelAr: "التمويل والمزايا", labelEn: "Financials & Benefits" },
                              { id: "eligibility", labelAr: "الشروط والمواعيد", labelEn: "Eligibility & Dates" },
                              { id: "custom_fields", labelAr: "حقول مخصصة", labelEn: "Custom Fields" },
                              { id: "urls", labelAr: "روابط التقديم", labelEn: "Application Links" },
                            ].map((tb) => (
                              <button
                                key={tb.id}
                                onClick={() => setActiveEditorTab(tb.id as any)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                  activeEditorTab === tb.id
                                    ? "bg-primary text-primary-foreground shadow-gold"
                                    : "text-gray-400 hover:text-white hover:bg-primary/10"
                                }`}
                              >
                                {isRtl ? tb.labelAr : tb.labelEn}
                              </button>
                            ))}
                          </div>

                          {/* Editor Tab Content */}
                          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20" dir={dir}>
                            {/* Live Integrity & Duplicate Guard Banner */}
                            <ScholarshipDuplicateBanner
                              checkResult={scholarshipDuplicateResult}
                              isRtl={isRtl}
                              onSelectExisting={(matched) => {
                                setEditingScholarship(matched);
                                setDuplicateOverriddenId(null);
                                toast.info(isRtl ? `تم الانتقال للمنحة المسجلة: "${matched.title}"` : `Switched to registered scholarship: "${matched.title}"`);
                              }}
                              onDismissOverride={() => {
                                setDuplicateOverriddenId(editingScholarship.id);
                                toast.warning(isRtl ? "تم تفعيل خيار التجاوز: يمكنك الحفظ كمنحة منفصلة الآن" : "Duplicate override enabled: You can save as separate listing");
                              }}
                              isOverridden={duplicateOverriddenId === editingScholarship.id}
                            />

                            {activeEditorTab === "info" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminSchTitleAr")} <span className="text-destructive">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={(editingScholarship as any).title_ar || editingScholarship.title || ""}
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        title: e.target.value,
                                        title_ar: e.target.value,
                                      } as any)
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                    dir="rtl"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminSchTitleEn")}
                                  </label>
                                  <input
                                    type="text"
                                    value={(editingScholarship as any).title_en || (editingScholarship as any).titleEn || ""}
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        title_en: e.target.value,
                                        titleEn: e.target.value,
                                      } as any)
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                    dir="ltr"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1">
                                      {t("adminUniversity")}
                                    </label>
                                    <input
                                      type="text"
                                      value={editingScholarship.university || editingScholarship.org || ""}
                                      onChange={(e) =>
                                        setEditingScholarship({
                                          ...editingScholarship,
                                          university: e.target.value,
                                          org: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                      dir={dir}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1">
                                      {t("adminCountry")}
                                    </label>
                                    <input
                                      type="text"
                                      value={editingScholarship.country || ""}
                                      onChange={(e) =>
                                        setEditingScholarship({
                                          ...editingScholarship,
                                          country: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                      dir={dir}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1">
                                      {t("adminDegree")}
                                    </label>
                                    <select
                                      value={editingScholarship.degree || "bachelor_master"}
                                      onChange={(e) =>
                                        setEditingScholarship({
                                          ...editingScholarship,
                                          degree: e.target.value as any,
                                        })
                                      }
                                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                    >
                                      <option value="bachelor">{isRtl ? "بكالوريوس" : "Bachelor"}</option>
                                      <option value="master">{isRtl ? "ماجستير" : "Master"}</option>
                                      <option value="phd">{isRtl ? "دكتوراه" : "PhD"}</option>
                                      <option value="bachelor_master">{isRtl ? "بكالوريوس + ماجستير" : "Bachelor + Master"}</option>
                                      <option value="all">{isRtl ? "جميع المراحل الأكاديمية" : "All Degrees"}</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1">
                                      {t("adminCoverage")}
                                    </label>
                                    <select
                                      value={editingScholarship.coverage || "full"}
                                      onChange={(e) =>
                                        setEditingScholarship({
                                          ...editingScholarship,
                                          coverage: e.target.value as any,
                                        })
                                      }
                                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                    >
                                      <option value="full">{isRtl ? "ممولة بالكامل (شاملة السكن والتذاكر)" : "Fully Funded"}</option>
                                      <option value="partial">{isRtl ? "تمويل جزئي (رسوم دراسية فقط)" : "Partial"}</option>
                                      <option value="tuition_only">{isRtl ? "إعفاء من الرسوم" : "Tuition Only"}</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeEditorTab === "financials" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {isRtl ? "تفاصيل التمويل والمزايا المالية (بالعربية)" : "Benefits in Arabic (one per line)"}
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={
                                      Array.isArray((editingScholarship as any).benefits_ar)
                                        ? (editingScholarship as any).benefits_ar.join("\n")
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        benefits_ar: e.target.value.split("\n").filter((b) => b.trim()),
                                      } as any)
                                    }
                                    placeholder={isRtl ? "إعفاء كامل من المصروفات الدراسية\nراتب شهري بقيمة 1200 يورو\nتذاكر طيران ذهاب وإياب\nسكن جامعي وتأمين صحي شامل" : "Full tuition waiver\nMonthly stipend\nRoundtrip airfare"}
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                                    dir="rtl"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {isRtl ? "الوصف التفصيلي للمنحة" : "Detailed Description"}
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={(editingScholarship as any).description_ar || editingScholarship.description || ""}
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        description_ar: e.target.value,
                                        description: e.target.value,
                                      } as any)
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                                    dir={dir}
                                  />
                                </div>
                              </div>
                            )}

                            {activeEditorTab === "eligibility" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminDeadline")}
                                  </label>
                                  <input
                                    type="date"
                                    value={editingScholarship.deadline || ""}
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        deadline: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {isRtl ? "التخصصات المتاحة (مفصولة بفواصل)" : "Majors (comma separated)"}
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      Array.isArray(editingScholarship.majors)
                                        ? editingScholarship.majors.join(", ")
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        majors: e.target.value.split(",").map((m) => m.trim()),
                                      })
                                    }
                                    placeholder={isRtl ? "الهندسة, الطب, علوم الحاسوب, إدارة الأعمال" : "Engineering, Medicine, Computer Science"}
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                                    dir={dir}
                                  />
                                </div>
                              </div>
                            )}

                            {activeEditorTab === "custom_fields" && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-300">
                                    {isRtl ? "الحقول الإضافية المخصصة" : "Dynamic Custom Fields"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const existing = (editingScholarship as any).custom_fields || [];
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        custom_fields: [...existing, { label: "", value: "" }],
                                      } as any);
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>{isRtl ? "+ إضافة حقل" : "+ Add Field"}</span>
                                  </button>
                                </div>

                                {(((editingScholarship as any).custom_fields) || []).map((f: any, fIdx: number) => (
                                  <div key={fIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder={isRtl ? "اسم الحقل (مثل: شرط اللغة)" : "Field Label"}
                                      value={f.label}
                                      onChange={(e) => {
                                        const updated = [...((editingScholarship as any).custom_fields || [])];
                                        updated[fIdx].label = e.target.value;
                                        setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                                      }}
                                      className="w-1/3 px-2.5 py-1.5 rounded-lg bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                                    />
                                    <input
                                      type="text"
                                      placeholder={isRtl ? "القيمة أو الملاحظة" : "Value"}
                                      value={f.value}
                                      onChange={(e) => {
                                        const updated = [...((editingScholarship as any).custom_fields || [])];
                                        updated[fIdx].value = e.target.value;
                                        setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                                      }}
                                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-primary/30 text-white text-xs outline-none focus:border-primary"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = ((editingScholarship as any).custom_fields || []).filter((_: any, i: number) => i !== fIdx);
                                        setEditingScholarship({ ...editingScholarship, custom_fields: updated } as any);
                                      }}
                                      className="p-1 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeEditorTab === "urls" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminApplyUrl")} <span className="text-destructive">*</span>
                                  </label>
                                  <input
                                    type="url"
                                    value={editingScholarship.apply_url || ""}
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        apply_url: e.target.value,
                                      })
                                    }
                                    placeholder="https://apply.university.edu/admission"
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                                    dir="ltr"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminOfficialWebsite")}
                                  </label>
                                  <input
                                    type="url"
                                    value={editingScholarship.official_website || ""}
                                    onChange={(e) =>
                                      setEditingScholarship({
                                        ...editingScholarship,
                                        official_website: e.target.value,
                                      })
                                    }
                                    placeholder="https://university.edu"
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                                    dir="ltr"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Empty State in Workspace: Overview & Analytics */
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-3">
                            <GraduationCap className="w-8 h-8" />
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">
                            {isRtl ? "مساحة تحرير وتنسيق المنح الدراسية" : "Scholarship Detail Workspace"}
                          </h4>
                          <p className="text-xs text-gray-400 max-w-sm mb-4">
                            {isRtl
                              ? "اختر منحة من القائمة الجانبية لتعديلها فوريًا أو اضغط على الزر لإنشاء منحة جديدة."
                              : "Select a scholarship from the list to edit live, or create a new one."}
                          </p>
                          {adminAuthStore.canUserPerform(currentUser, "create") && (
                            <Button
                              variant="luxe"
                              size="sm"
                              onClick={() => {
                                const newSch = {
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
                                  description_ar: "وصف المنحة وتفاصيل الدعم المالي والرسوم والتذاكر والسكن.",
                                  description_en: "Scholarship description and full financial coverage details.",
                                  benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني"],
                                  benefits_en: ["Full tuition waiver", "Monthly stipend"],
                                };
                                setEditingScholarship(newSch as any);
                                setMobileViewPane("detail");
                              }}
                              className="font-bold shadow-gold cursor-pointer"
                            >
                              <Plus className="w-4 h-4 me-1" />
                              <span>{t("adminAddScholarship")}</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pane 4: Context / AI Inspector Pane (Width: 3/12 on xl, toggleable) */}
                    {isInspectorOpen && (
                      <div className="hidden xl:flex xl:col-span-3 h-full flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-white">
                              {isRtl ? "مستشار وفاحص المنحة" : "Context & Quality Inspector"}
                            </span>
                          </div>
                          <button
                            onClick={() => setIsInspectorOpen(false)}
                            className="text-gray-400 hover:text-white p-1 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20 text-xs">
                          {/* AI Quality Completeness Gauge */}
                          {(() => {
                            const scoreData = calculateScholarshipScore(editingScholarship);
                            return (
                              <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-300">
                                    {isRtl ? "جودة واكتمال البيانات" : "Data Quality Score"}
                                  </span>
                                  <span className="font-extrabold text-primary text-sm">
                                    {scoreData.score}% ({scoreData.grade})
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-card overflow-hidden border border-primary/20">
                                  <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                      scoreData.score >= 85
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                        : scoreData.score >= 60
                                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${scoreData.score}%` }}
                                  />
                                </div>
                                {scoreData.missing.length > 0 && (
                                  <div className="pt-1">
                                    <span className="text-[10px] text-gray-400 block mb-1">
                                      {isRtl ? "حقول يُوصى باستكمالها:" : "Recommended to fill:"}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {scoreData.missing.map((m, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Live Student Mobile Card Preview */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-gray-300 block text-[11px]">
                              {isRtl ? "معاينة بطاقة الطالب الحية:" : "Live Student Card Preview:"}
                            </span>
                            <div className="p-3 rounded-xl bg-background border border-primary/30 shadow-inner space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-gray-400">
                                <span>{editingScholarship?.country || (isRtl ? "الدولة" : "Country")}</span>
                                <span className="text-amber-300 font-bold">
                                  {editingScholarship?.coverage === "full" ? (isRtl ? "ممولة بالكامل" : "Full") : "Partial"}
                                </span>
                              </div>
                              <h5 className="font-bold text-white text-xs line-clamp-2">
                                {isRtl
                                  ? (editingScholarship as any)?.title_ar || editingScholarship?.title || "عنوان المنحة"
                                  : (editingScholarship as any)?.title_en || editingScholarship?.title || "Scholarship Title"}
                              </h5>
                              <p className="text-[10px] text-gray-400 line-clamp-1">
                                {editingScholarship?.university || (isRtl ? "الجامعة الرسمية" : "Official University")}
                              </p>
                              <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  {editingScholarship?.deadline || (isRtl ? "الموعد النهائي" : "Deadline")}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold text-[9px]">
                                  {isRtl ? "تفاصيل المنحة" : "View"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick URL Validator & Actions */}
                          <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
                            <span className="font-bold text-gray-300 block text-[11px]">
                              {isRtl ? "إجراءات سريعة وفحص الروابط" : "Quick Actions"}
                            </span>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => {
                                  if (editingScholarship?.apply_url) {
                                    window.open(editingScholarship.apply_url, "_blank");
                                  } else {
                                    toast.error(isRtl ? "لا يوجد رابط تقديم" : "No apply URL");
                                  }
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{isRtl ? "فحص رابط التقديم" : "Test Apply URL"}</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (editingScholarship) {
                                    navigator.clipboard.writeText(JSON.stringify(editingScholarship, null, 2));
                                    toast.success(isRtl ? "تم نسخ بيانات المنحة كـ JSON" : "Copied JSON");
                                  }
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-card border border-primary/25 hover:bg-primary/10 text-gray-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isRtl ? "نسخ البيانات (JSON)" : "Copy JSON"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Jobs Management - Multi-Pane Responsive Adaptive Grid */}
                {activeTab === "jobs" && (
                  <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
                    {/* Pane 2: List Pane */}
                    <div
                      className={`h-full flex flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                        deviceSimulator === "phone" && mobileViewPane === "detail"
                          ? "hidden"
                          : "lg:col-span-4 xl:col-span-4 flex"
                      }`}
                    >
                      {/* List Header */}
                      <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-bold text-white">
                            {t("adminActiveJobsCount").replace("{count}", String(filteredJobs.length))}
                          </span>
                        </div>
                        {adminAuthStore.canUserPerform(currentUser, "create") && (
                          <button
                            onClick={() => {
                              const newJob = {
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
                              };
                              setEditingJob(newJob as any);
                              setMobileViewPane("detail");
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-gold hover:opacity-90 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isRtl ? "إضافة وظيفة" : "New"}</span>
                          </button>
                        )}
                      </div>

                      {/* Scrollable List Items */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-primary/20">
                        {filteredJobs.length === 0 ? (
                          <div className="text-center py-12 p-4 rounded-xl bg-card/40 border border-primary/20">
                            <Briefcase className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-gray-300 font-bold">{t("adminNoJobs")}</p>
                          </div>
                        ) : (
                          filteredJobs.map((j, idx) => {
                            const isSelected = selectedIds.includes(j.id);
                            const isActiveEdit = editingJob?.id === j.id;
                            const scoreData = calculateJobScore(j);

                            return (
                              <div
                                key={j.id}
                                onClick={() => {
                                  setEditingJob(j);
                                  setMobileViewPane("detail");
                                }}
                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                                  isActiveEdit
                                    ? "bg-primary/20 border-primary shadow-gold"
                                    : isSelected
                                    ? "bg-primary/10 border-primary/50"
                                    : "bg-card/70 border-primary/15 hover:border-primary/40 hover:bg-card"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleSelectItem(j.id, idx, e);
                                      }}
                                      className="pt-0.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                    >
                                      {isSelected ? (
                                        <CheckSquare className="w-4 h-4 text-primary" />
                                      ) : (
                                        <Square className="w-4 h-4 text-gray-400" />
                                      )}
                                    </button>

                                    <div className="min-w-0">
                                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                                        {isRtl ? j.title_ar : j.title_en || j.title_ar}
                                      </h4>
                                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                        {j.company} • <span className="text-emerald-400 font-bold">{j.salary || "$ USD"}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${
                                      scoreData.score >= 85
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    }`}
                                  >
                                    {scoreData.score}%
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-primary/10 text-gray-400">
                                  <span className="text-primary font-medium">{j.category}</span>
                                  <span className="text-gray-400 text-[10px]">
                                    {j.type === "remote_freelance" ? (isRtl ? "عن بُعد / حر" : "Remote Freelance") : j.type}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Pane 3: Detail Workspace Pane */}
                    <div
                      className={`h-full flex flex-col bg-card/75 border border-primary/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                        deviceSimulator === "phone" && mobileViewPane === "list"
                          ? "hidden"
                          : isInspectorOpen
                          ? "lg:col-span-8 xl:col-span-5 flex"
                          : "lg:col-span-8 xl:col-span-8 flex"
                      }`}
                    >
                      {editingJob ? (
                        <div className="h-full flex flex-col overflow-hidden">
                          {/* Workspace Header with Tabs & Actions */}
                          <div className="p-3 border-b border-primary/20 bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              {deviceSimulator === "phone" && (
                                <button
                                  onClick={() => setMobileViewPane("list")}
                                  className="p-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                                  <span>{isRtl ? "القائمة" : "List"}</span>
                                </button>
                              )}
                              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
                                <Briefcase className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                                  {isRtl ? editingJob.title_ar : editingJob.title_en || editingJob.title_ar}
                                </h3>
                                <p className="text-[10px] text-gray-400">{editingJob.id}</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingJob(null)}
                                className="h-8 px-2.5 rounded-xl text-xs cursor-pointer text-gray-300 hover:text-white"
                              >
                                {isRtl ? "إغلاق" : "Close"}
                              </Button>
                              <Button
                                variant="luxe"
                                size="sm"
                                onClick={() => {
                                  dynamicStore.saveJob(editingJob);
                                  toast.success(isRtl ? "تم حفظ وتحديث بيانات الوظيفة بنجاح" : "Job saved successfully");
                                }}
                                className="h-8 px-3 rounded-xl text-xs font-bold shadow-gold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 me-1" />
                                {t("adminSavePublish")}
                              </Button>
                            </div>
                          </div>

                          {/* Editor Tabs */}
                          <div className="flex items-center gap-1 p-2 bg-background/50 border-b border-primary/15 overflow-x-auto flex-shrink-0">
                            {[
                              { id: "info", labelAr: "بيانات الوظيفة", labelEn: "Job Info" },
                              { id: "financials", labelAr: "الراتب والمزايا", labelEn: "Salary & Benefits" },
                              { id: "eligibility", labelAr: "المهام والمهارات", labelEn: "Skills & Tasks" },
                              { id: "urls", labelAr: "روابط التقديم", labelEn: "Apply URLs" },
                            ].map((tb) => (
                              <button
                                key={tb.id}
                                onClick={() => setActiveEditorTab(tb.id as any)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                  activeEditorTab === tb.id
                                    ? "bg-primary text-primary-foreground shadow-gold"
                                    : "text-gray-400 hover:text-white hover:bg-primary/10"
                                }`}
                              >
                                {isRtl ? tb.labelAr : tb.labelEn}
                              </button>
                            ))}
                          </div>

                          {/* Editor Form Content */}
                          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20" dir={dir}>
                            {activeEditorTab === "info" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminJobTitleAr")} <span className="text-destructive">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editingJob.title_ar}
                                    onChange={(e) => setEditingJob({ ...editingJob, title_ar: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                    dir="rtl"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminJobTitleEn")}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingJob.title_en || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, title_en: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                    dir="ltr"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1">
                                      {t("adminCompany")}
                                    </label>
                                    <input
                                      type="text"
                                      value={editingJob.company}
                                      onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary"
                                      dir={dir}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1">
                                      {t("adminSalaryUsd")}
                                    </label>
                                    <input
                                      type="text"
                                      value={editingJob.salary || ""}
                                      onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                                      placeholder="$2,500 - $4,500 / month"
                                      className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs sm:text-sm text-white outline-none focus:border-primary font-mono"
                                      dir="ltr"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeEditorTab === "financials" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {isRtl ? "مزايا العمل والدخل بالدولار" : "Benefits (one per line)"}
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={
                                      Array.isArray((editingJob as any).benefits_ar)
                                        ? (editingJob as any).benefits_ar.join("\n")
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setEditingJob({
                                        ...editingJob,
                                        benefits_ar: e.target.value.split("\n").filter((b) => b.trim()),
                                      } as any)
                                    }
                                    placeholder={isRtl ? "راتب شهري محول مباشرة بالدولار\nساعات عمل مرنة بالكامل\nمكافآت إنجاز ومشاريع مستمرة" : "USD Monthly payout\nFlexible hours"}
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                                    dir="rtl"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {isRtl ? "وصف الوصف والمهام" : "Job Description"}
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={editingJob.description_ar || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, description_ar: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary"
                                    dir={dir}
                                  />
                                </div>
                              </div>
                            )}

                            {activeEditorTab === "eligibility" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {isRtl ? "المهارات المطلوبة (مفصولة بفواصل)" : "Required Skills"}
                                  </label>
                                  <input
                                    type="text"
                                    value={Array.isArray(editingJob.skills) ? editingJob.skills.join(", ") : ""}
                                    onChange={(e) =>
                                      setEditingJob({
                                        ...editingJob,
                                        skills: e.target.value.split(",").map((s) => s.trim()),
                                      })
                                    }
                                    placeholder="React, TypeScript, Figma, English B2"
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                                    dir="ltr"
                                  />
                                </div>
                              </div>
                            )}

                            {activeEditorTab === "urls" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-300 mb-1">
                                    {t("adminApplyUrl")} <span className="text-destructive">*</span>
                                  </label>
                                  <input
                                    type="url"
                                    value={editingJob.apply_url || ""}
                                    onChange={(e) => setEditingJob({ ...editingJob, apply_url: e.target.value })}
                                    placeholder="https://upwork.com/jobs/..."
                                    className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-xs text-white outline-none focus:border-primary font-mono"
                                    dir="ltr"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
                            <Briefcase className="w-8 h-8" />
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">
                            {isRtl ? "مساحة تحرير وظائف العمل الحر بالدولار" : "USD Jobs Detail Workspace"}
                          </h4>
                          <p className="text-xs text-gray-400 max-w-sm mb-4">
                            {isRtl
                              ? "اختر وظيفة من القائمة لتعديلها فوريًا أو اضغط على الزر لإنشاء فرصة عمل جديدة."
                              : "Select a job from the list to edit live, or create a new one."}
                          </p>
                          {adminAuthStore.canUserPerform(currentUser, "create") && (
                            <Button
                              variant="luxe"
                              size="sm"
                              onClick={() => {
                                const newJob = {
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
                                };
                                setEditingJob(newJob as any);
                                setMobileViewPane("detail");
                              }}
                              className="font-bold shadow-gold cursor-pointer"
                            >
                              <Plus className="w-4 h-4 me-1" />
                              <span>{t("adminAddJob")}</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pane 4: Context / AI Inspector Pane */}
                    {isInspectorOpen && (
                      <div className="hidden xl:flex xl:col-span-3 h-full flex-col bg-card/60 border border-primary/25 rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-3 border-b border-primary/20 bg-card/80 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-sky-400" />
                            <span className="text-xs font-bold text-white">
                              {isRtl ? "مستشار وفاحص الوظيفة" : "Job Quality Inspector"}
                            </span>
                          </div>
                          <button
                            onClick={() => setIsInspectorOpen(false)}
                            className="text-gray-400 hover:text-white p-1 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-thin scrollbar-thumb-primary/20 text-xs">
                          {/* AI Quality Gauge */}
                          {(() => {
                            const scoreData = calculateJobScore(editingJob);
                            return (
                              <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-300">
                                    {isRtl ? "جودة واكتمال البيانات" : "Data Quality Score"}
                                  </span>
                                  <span className="font-extrabold text-sky-400 text-sm">
                                    {scoreData.score}% ({scoreData.grade})
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-card overflow-hidden border border-primary/20">
                                  <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                      scoreData.score >= 85
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                        : scoreData.score >= 60
                                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${scoreData.score}%` }}
                                  />
                                </div>
                                {scoreData.missing.length > 0 && (
                                  <div className="pt-1">
                                    <span className="text-[10px] text-gray-400 block mb-1">
                                      {isRtl ? "حقول يُوصى باستكمالها:" : "Recommended to fill:"}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {scoreData.missing.map((m, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] font-bold"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Live Student Job Card Preview */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-gray-300 block text-[11px]">
                              {isRtl ? "معاينة بطاقة الوظيفة الحية:" : "Live Job Card Preview:"}
                            </span>
                            <div className="p-3 rounded-xl bg-background border border-primary/30 shadow-inner space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-gray-400">
                                <span>{editingJob?.company || "Company"}</span>
                                <span className="text-emerald-400 font-bold">
                                  {editingJob?.salary || "$ USD"}
                                </span>
                              </div>
                              <h5 className="font-bold text-white text-xs line-clamp-2">
                                {isRtl ? editingJob?.title_ar || "المسمى الوظيفي" : editingJob?.title_en || editingJob?.title_ar || "Job Title"}
                              </h5>
                              <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  {editingJob?.category || "Tech"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold text-[9px]">
                                  {isRtl ? "تقديم سريع" : "Apply"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick URL Validator */}
                          <div className="p-3 rounded-xl bg-background/60 border border-primary/20 space-y-2">
                            <span className="font-bold text-gray-300 block text-[11px]">
                              {isRtl ? "إجراءات سريعة وفحص الروابط" : "Quick Actions"}
                            </span>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => {
                                  if (editingJob?.apply_url) {
                                    window.open(editingJob.apply_url, "_blank");
                                  } else {
                                    toast.error(isRtl ? "لا يوجد رابط تقديم" : "No apply URL");
                                  }
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-sky-500/10 border border-sky-500/25 hover:bg-sky-500/20 text-sky-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{isRtl ? "فحص رابط التقديم" : "Test Apply URL"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
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

                {/* 5. Team & Moderators Management & RBAC Permissions */}
                {activeTab === "team" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white">{t("adminTeamTitle")}</h4>
                        <p className="text-xs text-gray-400">{t("adminTeamDesc")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamMembers.map(m => {
                        const isSuperAdmin = m.role === "super_admin";
                        const canManage = currentUser?.role === "super_admin" && !isSuperAdmin;
                        const perms = m.permissions || {
                          canEdit: false,
                          canDelete: false,
                          canCreate: true,
                          canAutoPublish: false,
                          canManageTeam: false,
                          canEmptyVault: false,
                        };

                        return (
                          <div key={m.id} className="p-4 rounded-2xl bg-card border-2 border-primary/30 flex flex-col justify-between gap-3 shadow-md">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                                  {m.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white leading-tight">{m.name}</h4>
                                  <span className="text-xs text-gray-300 block">{m.email}</span>
                                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary mt-1">
                                    {isSuperAdmin
                                      ? (isRtl ? "المدير العام 👑" : "Super Admin 👑")
                                      : m.role === "editor"
                                      ? (isRtl ? "محرر محتوى" : "Editor")
                                      : (isRtl ? "مشرف محتوى 🛡️" : "Moderator 🛡️")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Granular Permission Toggles (Super Admin Only) */}
                            {!isSuperAdmin && (
                              <div className="mt-2 pt-3 border-t border-primary/20 space-y-2">
                                <div className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                                  {isRtl ? "صلاحيات المشرف الممنوحة:" : "Granted Permissions:"}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {/* canEdit */}
                                  <button
                                    type="button"
                                    disabled={!canManage}
                                    onClick={() => {
                                      const updated = { ...perms, canEdit: !perms.canEdit };
                                      adminAuthStore.updateMemberPermissions(m.id, updated, currentUser);
                                      setTeamMembers(adminAuthStore.getUsers());
                                      toast.success(t("adminPermissionsUpdatedToast"));
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all text-2xs font-semibold cursor-pointer ${
                                      perms.canEdit
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                        : "bg-background/60 border-primary/20 text-gray-400 opacity-70"
                                    } ${!canManage ? "cursor-not-allowed" : "hover:border-primary"}`}
                                  >
                                    <span>{t("adminCanEditLabel")}</span>
                                    <span>{perms.canEdit ? "✓" : "✕"}</span>
                                  </button>

                                  {/* canDelete */}
                                  <button
                                    type="button"
                                    disabled={!canManage}
                                    onClick={() => {
                                      const updated = { ...perms, canDelete: !perms.canDelete };
                                      adminAuthStore.updateMemberPermissions(m.id, updated, currentUser);
                                      setTeamMembers(adminAuthStore.getUsers());
                                      toast.success(t("adminPermissionsUpdatedToast"));
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all text-2xs font-semibold cursor-pointer ${
                                      perms.canDelete
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                        : "bg-background/60 border-primary/20 text-gray-400 opacity-70"
                                    } ${!canManage ? "cursor-not-allowed" : "hover:border-primary"}`}
                                  >
                                    <span>{t("adminCanDeleteLabel")}</span>
                                    <span>{perms.canDelete ? "✓" : "✕"}</span>
                                  </button>

                                  {/* canCreate */}
                                  <button
                                    type="button"
                                    disabled={!canManage}
                                    onClick={() => {
                                      const updated = { ...perms, canCreate: !perms.canCreate };
                                      adminAuthStore.updateMemberPermissions(m.id, updated, currentUser);
                                      setTeamMembers(adminAuthStore.getUsers());
                                      toast.success(t("adminPermissionsUpdatedToast"));
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all text-2xs font-semibold cursor-pointer ${
                                      perms.canCreate
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                        : "bg-background/60 border-primary/20 text-gray-400 opacity-70"
                                    } ${!canManage ? "cursor-not-allowed" : "hover:border-primary"}`}
                                  >
                                    <span>{t("adminCanCreateLabel")}</span>
                                    <span>{perms.canCreate ? "✓" : "✕"}</span>
                                  </button>

                                  {/* canAutoPublish */}
                                  <button
                                    type="button"
                                    disabled={!canManage}
                                    onClick={() => {
                                      const updated = { ...perms, canAutoPublish: !perms.canAutoPublish };
                                      adminAuthStore.updateMemberPermissions(m.id, updated, currentUser);
                                      setTeamMembers(adminAuthStore.getUsers());
                                      toast.success(t("adminPermissionsUpdatedToast"));
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all text-2xs font-semibold cursor-pointer ${
                                      perms.canAutoPublish
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                        : "bg-background/60 border-primary/20 text-gray-400 opacity-70"
                                    } ${!canManage ? "cursor-not-allowed" : "hover:border-primary"}`}
                                  >
                                    <span>{t("adminCanAutoPublishLabel")}</span>
                                    <span>{perms.canAutoPublish ? "✓" : "✕"}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {isSuperAdmin && (
                              <div className="mt-2 pt-2 border-t border-primary/20 text-2xs text-amber-400 font-semibold flex items-center gap-1.5">
                                <span>👑</span>
                                <span>{isRtl ? "صلاحيات كاملة وغير مقيدة لإدارة المنصة" : "Full unrestricted platform access"}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. Security Audit Logs */}
                {activeTab === "audit_logs" && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div className="text-xs text-gray-300">
                        {t("adminAuditLogTitle").replace("{count}", String(auditLogs.length))}
                      </div>

                      {lockoutState.isLocked && currentUser?.role === "super_admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            adminAuthStore.unlockAccount(currentUser);
                            setLockoutState(adminAuthStore.getLockoutState());
                            toast.success(isRtl ? "تم إلغاء الحظر الأمني بنجاح وفك القفل" : "Security lockout cleared");
                          }}
                          className="font-bold text-xs shadow-md cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1.5 ml-1.5" />
                          <span>{isRtl ? "إلغاء حظر تسجيل الدخول الأمني الآن" : "Clear Security Lockout"}</span>
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-3.5 rounded-xl bg-card/70 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.action.includes("LOCKOUT") || log.action.includes("FAILED") ? "bg-destructive animate-pulse" : "bg-primary"}`} />
                            <span className="font-bold text-white">{log.actionAr || log.action}</span>
                            <span className="text-gray-400">({log.userName})</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-[11px] font-mono bg-background/50 px-2 py-0.5 rounded border border-primary/20">{log.details}</span>
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

      {/* Admin Password Recovery Modal (OTP to alforas.one@gmail.com) */}
      <AnimatePresence>
        {isRecoveryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border-2 border-primary/40 shadow-2xl space-y-4"
              dir={dir}
            >
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <KeyRound className="w-5 h-5" />
                  <span className="text-base text-white">{t("adminRecoveryTitle")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Send OTP to Unified Email */}
              {recoveryStep === "send_otp" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-gray-300 space-y-1.5">
                    <p className="font-bold text-white text-xs">{t("adminRecoveryDesc")}</p>
                    <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-xs pt-1" dir="ltr">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{UNIFIED_ADMIN_EMAIL}</span>
                    </div>
                  </div>

                  <p className="text-2xs text-gray-400 leading-relaxed">
                    {isRtl
                      ? "عند الضغط على إرسال، سيقوم النظام بتوليد رمز تحقق آمن مكون من 6 أرقام وإرساله للبريد الرسمي الموحد لضمان أمان اللوحة."
                      : "Clicking send will generate a secure 6-digit one-time passcode to the verified unified email address."}
                  </p>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRecoveryOpen(false)}
                      className="cursor-pointer"
                    >
                      {t("adminCancel")}
                    </Button>
                    <Button
                      variant="luxe"
                      size="sm"
                      disabled={isSendingRecoveryOtp}
                      onClick={() => {
                        setIsSendingRecoveryOtp(true);
                        setTimeout(() => {
                          const res = adminAuthStore.sendRecoveryOtp();
                          setIsSendingRecoveryOtp(false);
                          if (res.success) {
                            toast.success(res.message || t("adminOtpSentMsg"));
                            setRecoveryStep("verify_otp");
                          } else {
                            toast.error(res.message);
                          }
                        }, 500);
                      }}
                      className="font-bold shadow-gold cursor-pointer"
                    >
                      <Mail className="w-4 h-4 mr-1.5 ml-1.5" />
                      <span>{isSendingRecoveryOtp ? (isRtl ? "جاري الإرسال..." : "Sending...") : t("adminSendOtpBtn")}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Enter & Verify 6-digit OTP */}
              {recoveryStep === "verify_otp" && (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-gray-200">
                    <p>{t("adminOtpSentMsg")}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-2">
                      {t("adminEnterOtpLabel")}
                    </label>

                    <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 py-1" dir="ltr">
                      {recoveryOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => (recoveryOtpRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={e => {
                            const val = e.target.value.replace(/[^\d]/g, "").slice(-1);
                            const updated = [...recoveryOtpDigits];
                            updated[idx] = val;
                            setRecoveryOtpDigits(updated);
                            if (val && idx < 5) recoveryOtpRefs.current[idx + 1]?.focus();
                          }}
                          onKeyDown={e => {
                            if (e.key === "Backspace" && !digit && idx > 0) {
                              recoveryOtpRefs.current[idx - 1]?.focus();
                            }
                          }}
                          onPaste={e => {
                            e.preventDefault();
                            const pasted = e.clipboardData.getData("text").replace(/[^\d]/g, "").slice(0, 6);
                            if (!pasted) return;
                            const digits = pasted.split("");
                            const updated = [...recoveryOtpDigits];
                            for (let i = 0; i < 6; i++) {
                              updated[i] = digits[i] || "";
                            }
                            setRecoveryOtpDigits(updated);
                            const next = Math.min(digits.length, 5);
                            recoveryOtpRefs.current[next]?.focus();
                          }}
                          className={`w-8 h-10 xs:w-9 xs:h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-bold rounded-lg sm:rounded-xl border-2 transition-all outline-none ${
                            digit
                              ? "border-primary bg-white text-gray-950 shadow-gold"
                              : "border-primary/40 bg-white/95 text-gray-900 focus:border-primary focus:bg-white"
                          }`}
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecoveryStep("send_otp")}
                      className="cursor-pointer"
                    >
                      {isRtl ? "إعادة إرسال" : "Resend"}
                    </Button>
                    <Button
                      variant="luxe"
                      size="sm"
                      onClick={() => {
                        const code = recoveryOtpDigits.join("");
                        const verifyRes = adminAuthStore.verifyRecoveryOtp(code);
                        if (verifyRes.success) {
                          toast.success(verifyRes.message);
                          setRecoveryStep("new_password");
                        } else {
                          toast.error(verifyRes.message);
                        }
                      }}
                      className="font-bold shadow-gold cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5 ml-1.5" />
                      <span>{t("adminVerifyOtpBtn")}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Set New Password & Unlock Account */}
              {recoveryStep === "new_password" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      {t("adminNewPasswordLabel")}
                    </label>
                    <div className="relative">
                      <StarMaskedInput
                        value={recoveryNewPassword}
                        onChange={setRecoveryNewPassword}
                        showPlain={showRecoveryNewPass}
                        placeholder="★★★★★★"
                        className={`w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-sm outline-none ${
                          isRtl ? "pl-11 pr-4" : "pr-11 pl-4"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRecoveryNewPass(p => !p)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-3" : "right-3"} text-gray-600 hover:text-gray-900 cursor-pointer p-1`}
                      >
                        {showRecoveryNewPass ? <EyeOff className="w-4 h-4 text-gray-700" /> : <Eye className="w-4 h-4 text-primary" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      {t("adminConfirmNewPasswordLabel")}
                    </label>
                    <div className="relative">
                      <StarMaskedInput
                        value={recoveryConfirmPassword}
                        onChange={setRecoveryConfirmPassword}
                        showPlain={showRecoveryConfirmPass}
                        placeholder="★ ★ ★ ★ ★ ★"
                        className={`w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 text-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/40 shadow-sm outline-none ${
                          isRtl ? "pl-11 pr-4" : "pr-11 pl-4"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRecoveryConfirmPass(p => !p)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-3" : "right-3"} text-gray-600 hover:text-gray-900 cursor-pointer p-1`}
                      >
                        {showRecoveryConfirmPass ? <EyeOff className="w-4 h-4 text-gray-700" /> : <Eye className="w-4 h-4 text-primary" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRecoveryOpen(false)}
                      className="cursor-pointer"
                    >
                      {t("adminCancel")}
                    </Button>
                    <Button
                      variant="luxe"
                      size="sm"
                      onClick={() => {
                        if (!recoveryNewPassword.trim() || recoveryNewPassword.length < 4) {
                          toast.error(isRtl ? "يجب أن تكون كلمة المرور 4 خانات على الأقل" : "Password must be at least 4 chars");
                          return;
                        }
                        if (recoveryNewPassword !== recoveryConfirmPassword) {
                          toast.error(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
                          return;
                        }

                        const code = recoveryOtpDigits.join("");
                        const resetRes = adminAuthStore.resetAdminPasswordWithOtp(code, recoveryNewPassword);
                        if (resetRes.success) {
                          setLockoutState(adminAuthStore.getLockoutState());
                          setIsRecoveryOpen(false);
                          setPasswordInput("");
                          setPinDigits(["", "", "", ""]);
                          toast.success(resetRes.message || (isRtl ? "تم تغيير كلمة المرور وفك الحظر بنجاح!" : "Password updated & lockout reset!"));
                        } else {
                          toast.error(resetRes.message);
                        }
                      }}
                      className="font-bold shadow-gold cursor-pointer"
                    >
                      <LockKeyhole className="w-4 h-4 mr-1.5 ml-1.5" />
                      <span>{t("adminSaveNewPasswordBtn")}</span>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Existence & Duplicate Inspector Modal */}
      <QuickExistenceCheckerModal
        isOpen={isQuickCheckerOpen}
        onClose={() => setIsQuickCheckerOpen(false)}
        scholarships={scholarships}
        isRtl={isRtl}
        onSelectScholarship={(s) => {
          setEditingScholarship(s);
          setMobileViewPane("detail");
          setActiveTab("scholarships");
        }}
        onCreateNewWithQuery={(q) => {
          const isUrl = q.startsWith("http://") || q.startsWith("https://") || q.includes(".com") || q.includes(".org") || q.includes(".edu");
          const newSch: any = {
            id: `sch_${Date.now()}`,
            title_ar: isUrl ? "منحة دراسية جديدة" : q,
            title: isUrl ? "منحة دراسية جديدة" : q,
            title_en: isUrl ? "New Scholarship" : q,
            university: isRtl ? "جامعة دولية معتمدة" : "Accredited International University",
            country: isRtl ? "عالمي" : "International",
            flag: "🌍",
            degree: "bachelor_master",
            coverage: "full",
            deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
            majors: ["الهندسة والتقنية", "الطب والعلوم"],
            apply_url: isUrl ? q : "https://example.com",
            official_website: isUrl ? q : "https://example.com",
            description_ar: "تفاصيل وشروط التقديم والتمويل للمنحة.",
            description_en: "Scholarship description and details.",
            benefits_ar: ["إعفاء كامل من المصروفات", "راتب شهري", "سكن مجاني"],
            benefits_en: ["Full tuition waiver", "Monthly stipend"],
          };
          setEditingScholarship(newSch);
          setMobileViewPane("detail");
          setActiveTab("scholarships");
        }}
      />
    </div>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
};
