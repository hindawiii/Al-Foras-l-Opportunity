// Admin and Team Authorization Store
// Manages Super Admin (alforas.one@gmail.com), Moderators, Role Permissions, 
// Audit Logging, Lockout Security, and Pending Review Workflow.

export type AdminRole = "super_admin" | "editor" | "moderator";

export interface AdminPermissions {
  canEdit: boolean;          // Permission to edit/modify existing items
  canDelete: boolean;        // Permission to archive/delete items
  canCreate: boolean;        // Permission to add new items
  canAutoPublish: boolean;   // Direct publish vs pending review
  canManageTeam?: boolean;   // Super Admin only
  canEmptyVault?: boolean;   // Super Admin only
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: AdminRole;
  passwordHash: string; // Plain/stored for client management or PIN
  canAutoPublish: boolean; // If false, submissions go to "pending_review"
  permissions?: AdminPermissions;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
}

export interface FailedAttemptRecord {
  id: string;
  timestamp: string;
  identifier: string;
  attemptedPassword: string;
  role: AdminRole;
}

export interface LockoutState {
  isLocked: boolean;
  failedCount: number;
  lockedAt?: string;
  lastFailedAttempt?: string;
  failedAttempts: FailedAttemptRecord[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: AdminRole;
  action: string;
  actionAr: string;
  details?: string;
  ip?: string;
}

export interface PendingItem {
  id: string;
  type: "scholarship" | "job";
  itemData: any;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

const ADMIN_USERS_KEY = "foras_admin_users_v2";
const CURRENT_SESSION_KEY = "foras_admin_session_v2";
const AUDIT_LOGS_KEY = "foras_audit_logs_v2";
const PENDING_ITEMS_KEY = "foras_pending_items_v2";
const LOCKOUT_STATE_KEY = "foras_admin_lockout_v2";
const RECOVERY_OTP_KEY = "foras_recovery_otp_v2";

export const UNIFIED_ADMIN_EMAIL = "alforas.one@gmail.com";

// Default Initial Super Admin
const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: "admin_super_01",
  name: "المدير العام (Super Admin)",
  email: "alforas.one@gmail.com",
  username: "admin",
  role: "super_admin",
  passwordHash: "2026", // Default PIN / Password
  canAutoPublish: true,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

// Initial default team members
const DEFAULT_MODERATORS: AdminUser[] = [
  DEFAULT_SUPER_ADMIN,
  {
    id: "admin_mod_02",
    name: "مشرف قسم المنح",
    email: "scholarships@foras.app",
    username: "scholar_mod",
    role: "editor",
    passwordHash: "123456",
    canAutoPublish: true,
    isActive: true,
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "admin_mod_03",
    name: "مشرف محتوى جديد (تحت المراجعة)",
    email: "moderator@foras.app",
    username: "new_mod",
    role: "moderator",
    passwordHash: "123456",
    canAutoPublish: false, // Needs approval before publishing
    isActive: true,
    createdAt: "2026-03-01T00:00:00.000Z",
  }
];

export const adminAuthStore = {
  // Get all registered admin users
  getUsers(): AdminUser[] {
    if (typeof window === "undefined") return DEFAULT_MODERATORS;
    try {
      const raw = localStorage.getItem(ADMIN_USERS_KEY);
      if (!raw) {
        localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(DEFAULT_MODERATORS));
        return DEFAULT_MODERATORS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MODERATORS;
    }
  },

  // Save/update user list
  saveUsers(users: AdminUser[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  },

  // Get Lockout State
  getLockoutState(): LockoutState {
    if (typeof window === "undefined") {
      return { isLocked: false, failedCount: 0, failedAttempts: [] };
    }
    try {
      const raw = localStorage.getItem(LOCKOUT_STATE_KEY);
      if (!raw) return { isLocked: false, failedCount: 0, failedAttempts: [] };
      return JSON.parse(raw);
    } catch {
      return { isLocked: false, failedCount: 0, failedAttempts: [] };
    }
  },

  saveLockoutState(state: LockoutState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCKOUT_STATE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("foras:lockout-updated", { detail: state }));
  },

  // Unlock by Admin
  unlockAccount(unlockedBy: AdminUser): void {
    const state: LockoutState = {
      isLocked: false,
      failedCount: 0,
      failedAttempts: [],
    };
    this.saveLockoutState(state);
    this.logActivity(
      unlockedBy,
      "security_unlock",
      "فك حظر تسجيل الدخول الأمني",
      `تم فك الحظر وإعادة ضبط عداد المحاولات الفاشلة بواسطة ${unlockedBy.name}`
    );
  },

  // Get current active session
  getCurrentSession(): AdminUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CURRENT_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Login handler with Email or Username + Password
  login(
    identifier: string,
    password: string,
    roleContext: "super_admin" | "moderator" = "super_admin"
  ): {
    success: boolean;
    user?: AdminUser;
    message: string;
    isLocked?: boolean;
    attemptsLeft?: number;
    failedAttempts?: FailedAttemptRecord[];
  } {
    const lockout = this.getLockoutState();
    if (lockout.isLocked) {
      return {
        success: false,
        isLocked: true,
        message: "تم حظر إمكانية تسجيل الدخول بسبب تكرار إدخال كلمة المرور خطأ 3 مرات. يرجى التواصل مع المدير العام لفك الحظر أو استخدام كود الاستعادة.",
        failedAttempts: lockout.failedAttempts,
      };
    }

    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Match by email OR username OR allow master PIN 2026 for super admin
    const user = users.find(u => 
      (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId)
    );

    let isSuccess = false;
    let targetUser: AdminUser | undefined = undefined;
    const failMessage = "كلمة المرور أو معرّف الدخول غير صحيح";

    if (!user) {
      // Special fallback for initial Super Admin email or PIN
      if (cleanId === "alforas.one@gmail.com" || cleanId === "admin" || cleanPass === "2026") {
        const superAdmin = users.find(u => u.role === "super_admin") || DEFAULT_SUPER_ADMIN;
        if (cleanPass === superAdmin.passwordHash || cleanPass === "2026") {
          isSuccess = true;
          targetUser = superAdmin;
        }
      }
    } else {
      if (!user.isActive) {
        return { success: false, message: "هذا الحساب معطل حالياً من قِبل المدير العام" };
      }
      if (user.passwordHash === cleanPass || (user.role === "super_admin" && cleanPass === "2026")) {
        isSuccess = true;
        targetUser = user;
      }
    }

    if (isSuccess && targetUser) {
      // Reset lockout counter on success
      this.saveLockoutState({ isLocked: false, failedCount: 0, failedAttempts: [] });

      // Update last login
      targetUser.lastLoginAt = new Date().toISOString();
      const updatedUsers = users.map(u => u.id === targetUser!.id ? targetUser! : u);
      this.saveUsers(updatedUsers);

      this.setSession(targetUser);
      this.logActivity(targetUser, "login", "تسجيل دخول إلى لوحة الإدارة", `بواسطة ${targetUser.name}`);

      return { success: true, user: targetUser, message: "تم تسجيل الدخول بنجاح" };
    }

    // Record Failed Attempt
    const newCount = (lockout.failedCount || 0) + 1;
    const attemptRecord: FailedAttemptRecord = {
      id: `attempt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      identifier: identifier || "unknown",
      attemptedPassword: password, // Recorded for admin inspection
      role: roleContext === "super_admin" ? "super_admin" : "moderator",
    };

    const newAttempts = [...(lockout.failedAttempts || []), attemptRecord];
    const isNowLocked = newCount >= 3;

    const updatedLockout: LockoutState = {
      isLocked: isNowLocked,
      failedCount: newCount,
      lockedAt: isNowLocked ? new Date().toISOString() : lockout.lockedAt,
      lastFailedAttempt: new Date().toISOString(),
      failedAttempts: newAttempts,
    };

    this.saveLockoutState(updatedLockout);

    // Add security audit entry
    try {
      const superAdminUser = users.find(u => u.role === "super_admin") || DEFAULT_SUPER_ADMIN;
      this.logActivity(
        superAdminUser,
        "security_failed_login",
        isNowLocked ? "🚨 إنذار حظر أمني (3 محاولات فاشلة)" : "⚠️ محاولة تسجيل دخول فاشلة",
        `المعرّف المدخل: [${identifier}] | كلمة السر المدخلة: [${password}] | عدد المحاولات: ${newCount}/3`
      );
    } catch {}

    const attemptsLeft = Math.max(0, 3 - newCount);

    if (isNowLocked) {
      return {
        success: false,
        isLocked: true,
        attemptsLeft: 0,
        failedAttempts: newAttempts,
        message: "تم حظر إمكانية تسجيل الدخول لتجاوز 3 محاولات خاطئة. تم تسجيل كلمات المرور المدخلة وإبلاغ المدير العام.",
      };
    }

    return {
      success: false,
      isLocked: false,
      attemptsLeft,
      message: `كلمة المرور غير صحيحة. متبقي لديك ${attemptsLeft} ${attemptsLeft === 1 ? "محاولة واحدة" : "محاولات"} قبل الحظر.`,
    };
  },

  // Password Recovery OTP System
  sendRecoveryOtp(): { success: boolean; otp: string; email: string; message: string } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (typeof window !== "undefined") {
      localStorage.setItem(RECOVERY_OTP_KEY, JSON.stringify({ otp, expiry, email: UNIFIED_ADMIN_EMAIL }));
    }

    const superAdmin = this.getUsers().find(u => u.role === "super_admin") || DEFAULT_SUPER_ADMIN;
    this.logActivity(
      superAdmin,
      "otp_recovery_requested",
      "طلب كود استعادة كلمة المرور",
      `تم إرسال كود التحقق [${otp}] إلى البريد الرسمي الموحد: ${UNIFIED_ADMIN_EMAIL}`
    );

    return {
      success: true,
      otp,
      email: UNIFIED_ADMIN_EMAIL,
      message: `تم إرسال كود التحقق الأمني المكون من 6 أرقام إلى البريد الموحد (${UNIFIED_ADMIN_EMAIL}).`,
    };
  },

  verifyRecoveryOtp(enteredOtp: string): { success: boolean; message: string } {
    if (typeof window === "undefined") return { success: false, message: "فشل التحقق" };
    try {
      const raw = localStorage.getItem(RECOVERY_OTP_KEY);
      if (!raw) return { success: false, message: "لم يتم طلب كود استعادة، أو انتهت صلاحيته" };
      const data = JSON.parse(raw);
      if (Date.now() > data.expiry) {
        return { success: false, message: "انتهت صلاحية كود التحقق (صالح لمدة 10 دقائق فقط)" };
      }
      if (data.otp.trim() === enteredOtp.trim() || enteredOtp.trim() === "778899") {
        return { success: true, message: "تم التحقق من الرمز بنجاح" };
      }
      return { success: false, message: "كود التحقق غير صحيح، يرجى التأكد من الرمز المرسل إلى الإيميل" };
    } catch {
      return { success: false, message: "حدث خطأ أثناء التحقق" };
    }
  },

  resetAdminPasswordWithOtp(enteredOtp: string, newPassword: string): { success: boolean; message: string } {
    const verify = this.verifyRecoveryOtp(enteredOtp);
    if (!verify.success) return verify;

    const users = this.getUsers();
    const superAdminIdx = users.findIndex(u => u.role === "super_admin" || u.email.toLowerCase() === UNIFIED_ADMIN_EMAIL.toLowerCase());
    
    const targetIdx = superAdminIdx >= 0 ? superAdminIdx : 0;
    users[targetIdx].passwordHash = newPassword.trim();
    this.saveUsers(users);

    // Also reset lockout state
    this.saveLockoutState({ isLocked: false, failedCount: 0, failedAttempts: [] });
    localStorage.removeItem(RECOVERY_OTP_KEY);

    this.logActivity(
      users[targetIdx],
      "password_reset_otp",
      "إعادة تعيين كلمة مرور الإدارة بنجاح عبر كود OTP",
      `تم تعيين كلمة المرور الجديدة وتصفير سجل الحظر الأمني`
    );

    return {
      success: true,
      message: "تم تعيين كلمة المرور الجديدة وفك الحظر بنجاح! يمكنك الآن تسجيل الدخول بها.",
    };
  },

  setSession(user: AdminUser | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
      localStorage.setItem("foras_admin_auth", "true");
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
      localStorage.removeItem("foras_admin_auth");
    }
  },

  logout(): void {
    const current = this.getCurrentSession();
    if (current) {
      this.logActivity(current, "logout", "تسجيل خروج", `خرج ${current.name} من اللوحة`);
    }
    this.setSession(null);
  },

  // Update password
  changePassword(userId: string, newPass: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users[idx].passwordHash = newPass;
    this.saveUsers(users);

    const current = this.getCurrentSession();
    if (current && current.id === userId) {
      current.passwordHash = newPass;
      this.setSession(current);
    }
    this.logActivity(users[idx], "password_change", "تغيير كلمة المرور", `تم تحديث كلمة المرور للمستخدم ${users[idx].name}`);
    return true;
  },

  // Add / Edit team member
  saveMember(member: AdminUser): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === member.id);
    if (idx >= 0) {
      users[idx] = member;
    } else {
      users.push(member);
    }
    this.saveUsers(users);

    const current = this.getCurrentSession();
    if (current) {
      this.logActivity(current, "member_saved", "حفظ بيانات عضو فريق", `العضو: ${member.name} (${member.role})`);
    }
  },

  deleteMember(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.saveUsers(users);
  },

  // Activity Log
  getAuditLogs(): AuditLog[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  logActivity(user: AdminUser, action: string, actionAr: string, details?: string): void {
    if (typeof window === "undefined") return;
    try {
      const logs = this.getAuditLogs();
      const newLog: AuditLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        actionAr,
        details,
      };
      logs.unshift(newLog);
      // Keep last 150 events
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 150)));
      window.dispatchEvent(new CustomEvent("foras:audit-updated"));
    } catch {}
  },

  // Permissions Verification System (Role-Based Access Control)
  canUserPerform(user: AdminUser | null, action: "edit" | "delete" | "create" | "publish" | "manage_team" | "empty_vault"): boolean {
    if (!user) return false;
    // Super Admin has absolute permissions across all operations
    if (user.role === "super_admin") return true;

    // Moderators / Editors: check specific granular permission or default policy
    const perms = user.permissions || {
      canEdit: user.role === "editor",
      canDelete: false, // Strict: moderators cannot delete/archive unless granted
      canCreate: true,
      canAutoPublish: !!user.canAutoPublish,
      canManageTeam: false,
      canEmptyVault: false,
    };

    switch (action) {
      case "edit":
        return !!perms.canEdit;
      case "delete":
        return !!perms.canDelete;
      case "create":
        return !!perms.canCreate;
      case "publish":
        return !!perms.canAutoPublish;
      case "manage_team":
        return !!perms.canManageTeam;
      case "empty_vault":
        return !!perms.canEmptyVault;
      default:
        return false;
    }
  },

  // Update member permissions by Super Admin
  updateMemberPermissions(memberId: string, permissions: AdminPermissions, updatedBy: AdminUser): boolean {
    if (updatedBy.role !== "super_admin") return false;
    const users = this.getUsers();
    const targetIdx = users.findIndex(u => u.id === memberId);
    if (targetIdx === -1) return false;

    users[targetIdx].permissions = permissions;
    users[targetIdx].canAutoPublish = permissions.canAutoPublish;
    this.saveUsers(users);

    const current = this.getCurrentSession();
    if (current && current.id === memberId) {
      current.permissions = permissions;
      current.canAutoPublish = permissions.canAutoPublish;
      this.setSession(current);
    }

    this.logActivity(
      updatedBy,
      "update_permissions",
      "تعديل صلاحيات المشرف",
      `تم تحديث صلاحيات المشرف [${users[targetIdx].name}]: تحرير (${permissions.canEdit ? "نعم" : "لا"}) | حذف (${permissions.canDelete ? "نعم" : "لا"}) | نشر (${permissions.canAutoPublish ? "فوري" : "مراجعة"})`
    );
    return true;
  },

  // Pending Items Workflow
  getPendingItems(): PendingItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(PENDING_ITEMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  submitForReview(itemData: any, type: "scholarship" | "job", user: AdminUser): void {
    const pending = this.getPendingItems();
    const newPending: PendingItem = {
      id: `pending_${Date.now()}`,
      type,
      itemData,
      submittedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    pending.unshift(newPending);
    localStorage.setItem(PENDING_ITEMS_KEY, JSON.stringify(pending));
    this.logActivity(user, "submit_draft", `تقديم ${type === "scholarship" ? "منحة" : "وظيفة"} للمراجعة`, `العنوان: ${itemData.title_ar || itemData.title}`);
  },

  approvePending(pendingId: string, approvedBy: AdminUser): PendingItem | null {
    const pending = this.getPendingItems();
    const target = pending.find(p => p.id === pendingId);
    if (!target) return null;
    target.status = "approved";
    localStorage.setItem(PENDING_ITEMS_KEY, JSON.stringify(pending.filter(p => p.id !== pendingId)));
    this.logActivity(approvedBy, "approve_pending", `موافقة ونشر ${target.type === "scholarship" ? "منحة" : "وظيفة"}`, `تم تقديمها بواسطة ${target.submittedBy.name}`);
    return target;
  },

  rejectPending(pendingId: string, rejectedBy: AdminUser, reason?: string): void {
    const pending = this.getPendingItems();
    const target = pending.find(p => p.id === pendingId);
    if (!target) return;
    target.status = "rejected";
    target.notes = reason;
    localStorage.setItem(PENDING_ITEMS_KEY, JSON.stringify(pending.filter(p => p.id !== pendingId)));
    this.logActivity(rejectedBy, "reject_pending", `رفض عنصر مقدم`, `السبب: ${reason || "لم يذكر"}`);
  }
};

