import React from "react";
import { motion } from "framer-motion";
import { Edit3, MapPin, Phone, Check, Copy, Camera, Loader2, Mail } from "lucide-react";
import { LuxeAvatar } from "@/components/foras/LuxeAvatar";
import type { ProfileState } from "./profileTypes";
import type { ProfileExtras } from "@/lib/profileExtras";

interface ProfileHeroHeaderProps {
  profile: ProfileState;
  extras: ProfileExtras;
  completion: number;
  user: any;
  isGuest: boolean;
  hideProfile: boolean;
  alignClass: string;
  dir: "rtl" | "ltr";
  ar: boolean;
  uploading: boolean;
  copiedPhone: boolean;
  startEdit: () => void;
  onAvatarClick: () => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCopyPhone: (phone?: string) => void;
  t: (key: string) => string;
}

export const ProfileHeroHeader: React.FC<ProfileHeroHeaderProps> = ({
  profile,
  extras,
  completion,
  user,
  isGuest,
  hideProfile,
  alignClass,
  dir,
  ar,
  uploading,
  copiedPhone,
  startEdit,
  onAvatarClick,
  handleAvatarUpload,
  handleCopyPhone,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden border border-primary/35 bg-card/90 backdrop-blur-xl shadow-luxe min-h-[195px] sm:min-h-[215px] flex flex-col sm:flex-row items-stretch"
      dir={dir}
    >
      {/* Subtle Ambient Backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%),linear-gradient(180deg,hsl(var(--primary)/0.05),hsl(var(--card)))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gold-gradient opacity-80" />

      {/* Top-End Floating Executive Action Button */}
      <div className="absolute top-3.5 end-3.5 sm:top-4 sm:end-4 z-20">
        <button
          onClick={startEdit}
          className="w-10 h-10 rounded-full bg-background/85 hover:bg-primary/20 text-primary border border-primary/35 flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-90"
          title={t("edit")}
          aria-label={t("edit")}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Edge-Anchored Hero Photo Column (Flush to Card Start Edge) */}
      <div className="relative flex-shrink-0 flex items-center justify-center p-6 sm:p-7 sm:w-44 md:w-52 bg-gradient-to-b sm:bg-gradient-to-e from-primary/25 via-gold/10 to-transparent border-b sm:border-b-0 sm:border-e border-primary/25 overflow-hidden group">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.25),transparent_70%)]" />

        <div className="relative">
          <div
            onClick={onAvatarClick}
            className="relative cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            title={ar ? "انقر للمعاينة بملء الشاشة" : "Click for full screen preview"}
          >
            <LuxeAvatar
              src={profile.avatar_url && !hideProfile ? profile.avatar_url : null}
              name={hideProfile ? "•" : (profile.full_name || user?.email || "User")}
              size="hero"
              shape="squircle"
              showRing={true}
              ringProgress={completion}
              ringStatus="gold"
            />

            {/* Smart Embedded Camera Badge */}
            <label
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-1 end-1 w-9 h-9 rounded-full bg-gold-gradient border-2 border-card flex items-center justify-center shadow-gold cursor-pointer hover:scale-110 active:scale-90 transition-transform z-20"
              title={ar ? "تغيير الصورة الشخصية" : "Change photo"}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-primary-foreground" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Profile Identity Details - Linear Aligned Stack */}
      <div className={`flex-1 min-w-0 p-5 sm:p-7 flex flex-col justify-center space-y-3 ${alignClass} pe-14 sm:pe-16`}>
        {/* Line 1: Full Name */}
        <h2 className="font-display text-fluid-title sm:text-2xl md:text-3xl font-bold text-gold-gradient truncate leading-tight tracking-tight">
          {hideProfile ? "•••••" : (profile.full_name || t("yourFullName"))}
        </h2>

        {/* Line 2: Sub-identity (Major/Role or Email/Guest) */}
        <div className="text-fluid-body font-semibold text-primary/95 truncate">
          {(extras.major || extras.university) && !hideProfile ? (
            <p className="truncate">
              {extras.major || extras.university}
              {extras.university && extras.major ? ` • ${extras.university}` : ""}
            </p>
          ) : !isGuest && user?.email ? (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{hideProfile ? "•••••@•••••" : user.email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span>{ar ? "حساب زائر محلي" : "Guest Account"}</span>
              </span>
            </div>
          )}
        </div>

        {/* Line 3: Linear Aligned Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 text-xs">
          {profile.location && !hideProfile && (
            <span className="inline-flex items-center gap-1.5 bg-background/85 border border-border/90 px-3.5 py-1.5 rounded-xl text-foreground font-medium truncate max-w-[200px] shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{profile.location}</span>
            </span>
          )}
          {profile.phone && !hideProfile && (
            <button
              type="button"
              onClick={() => handleCopyPhone(profile.phone)}
              title={ar ? "انقر لنسخ رقم الهاتف" : "Click to copy"}
              className="inline-flex items-center gap-1.5 bg-background/85 hover:bg-primary/15 border border-border/90 px-3.5 py-1.5 rounded-xl text-foreground font-medium transition-colors cursor-pointer shadow-2xs"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{profile.phone}</span>
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
            </button>
          )}
          {!isGuest && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{ar ? "حساب موثق ومزامن" : "Verified Account"}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
