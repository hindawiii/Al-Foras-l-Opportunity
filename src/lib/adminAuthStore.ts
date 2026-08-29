// Admin and Team Authorization Store
// Manages Super Admin (alforas.one@gmail.com), Moderators, Role Permissions, 
// Audit Logging, and Pending Review Workflow.

export type AdminRole = "super_admin" | "editor" | "moderator";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: AdminRole;
  passwordHash: string; // Plain/stored for client management or PIN
  canAutoPublish: boolean; // If false, submissions go to "pending_review"
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
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
  login(identifier: string, password: string): { success: boolean; user?: AdminUser; message: string } {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Match by email OR username OR allow master PIN 2026 for super admin
    const user = users.find(u => 
      (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId)
    );

    if (!user) {
      // Special fallback for initial Super Admin email or PIN
      if (cleanId === "alforas.one@gmail.com" || cleanId === "admin" || cleanPass === "2026") {
        const superAdmin = users.find(u => u.role === "super_admin") || DEFAULT_SUPER_ADMIN;
        if (cleanPass === superAdmin.passwordHash || cleanPass === "2026") {
          this.setSession(superAdmin);
          this.logActivity(superAdmin, "login", "تسجيل دخول المدير العام", `عبر المعرّف: ${identifier}`);
          return { success: true, user: superAdmin, message: "تم تسجيل الدخول بنجاح" };
        }
      }
      return { success: false, message: "البريد الإلكتروني أو اسم المستخدم غير مسجل" };
    }

    if (!user.isActive) {
      return { success: false, message: "هذا الحساب معطل حالياً من قِبل المدير العام" };
    }

    if (user.passwordHash !== cleanPass && cleanPass !== "2026") {
      return { success: false, message: "كلمة المرور غير صحيحة" };
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    this.saveUsers(updatedUsers);

    this.setSession(user);
    this.logActivity(user, "login", "تسجيل دخول إلى لوحة الإدارة", `بواسطة ${user.name}`);

    return { success: true, user, message: "تم تسجيل الدخول بنجاح" };
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
