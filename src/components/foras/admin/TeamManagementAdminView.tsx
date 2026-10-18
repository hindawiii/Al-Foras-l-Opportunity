import { AdminUser, adminAuthStore } from "@/lib/adminAuthStore";
import { toast } from "sonner";

interface Props {
  isRtl: boolean;
  t: (key: string) => string;
  teamMembers: AdminUser[];
  currentUser: AdminUser | null;
  onRefreshTeam: () => void;
}

export const TeamManagementAdminView = ({
  isRtl,
  t,
  teamMembers,
  currentUser,
  onRefreshTeam,
}: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white">{t("adminTeamTitle")}</h4>
          <p className="text-xs text-gray-400">{t("adminTeamDesc")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((m) => {
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
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-card border-2 border-primary/30 flex flex-col justify-between gap-3 shadow-md"
            >
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
                        ? isRtl
                          ? "المدير العام 👑"
                          : "Super Admin 👑"
                        : m.role === "editor"
                        ? isRtl
                          ? "محرر محتوى"
                          : "Editor"
                        : isRtl
                        ? "مشرف محتوى 🛡️"
                        : "Moderator 🛡️"}
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
                        onRefreshTeam();
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
                        onRefreshTeam();
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
                        onRefreshTeam();
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
                        onRefreshTeam();
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
                  <span>
                    {isRtl
                      ? "صلاحيات كاملة وغير مقيدة لإدارة المنصة"
                      : "Full unrestricted platform access"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
