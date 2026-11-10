import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, X, GraduationCap, MapPin, Mail, Phone, User as UserIcon,
  Edit3, Sparkles, Check, Camera, Loader2, Link as LinkIcon, Trash2,
  Briefcase, ChevronDown, Maximize2, Compass, HelpCircle, CheckCircle2,
  ExternalLink, Award, Globe, BookOpen, Clock, Building, Copy, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { INTEREST_OPTIONS, INTEREST_ITEMS, getInterestLabel } from "@/lib/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { guestStorage } from "@/lib/guestStorage";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  profileExtras, defaultExtras, type ProfileExtras, type PersonalLink,
  type LinkType, type SkillEntry, getLinkDisplayHandle, formatPlatformUrl,
  PLATFORMS_LIST, calculateAIMatchingReadiness, type AIMatchingSignal
} from "@/lib/profileExtras";
import { InlineLinksManager } from "@/components/foras/InlineLinksManager";
import { AIMatchingReadinessCard } from "@/components/foras/AIMatchingReadinessCard";
import { PHONE_COUNTRIES, findPhoneCountry, validatePhone } from "@/lib/phoneCountries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LuxeAvatar } from "@/components/foras/LuxeAvatar";

import {
  type ProfileState,
  emptyProfileState as empty,
  LINK_META,
  DEGREE_OPTIONS,
  EXPERIENCE_OPTIONS,
  SKILL_CATEGORY_META,
  SKILL_LEVEL_META,
} from "@/components/foras/profile/profileTypes";
import { Section, Field } from "@/components/foras/profile/ProfileSection";
import { ProfileHeroHeader } from "@/components/foras/profile/ProfileHeroHeader";
import { ProfileAvatarCinemaModal } from "@/components/foras/profile/ProfileAvatarCinemaModal";
import { ProfileAcademicView } from "@/components/foras/profile/ProfileAcademicView";
import { ProfileExperienceView } from "@/components/foras/profile/ProfileExperienceView";
import { ProfileDetailedSkillsView } from "@/components/foras/profile/ProfileDetailedSkillsView";
import { ProfileLinksView } from "@/components/foras/profile/ProfileLinksView";

export const ProfileTab = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { t, lang, dir } = useLanguage();
  const { hideProfile } = useSettings();
  const { request: requestGeo, loading: geoLoading } = useGeolocation(false);
  const ar = lang === "ar";
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";

  const [profile, setProfile] = useState<ProfileState>(empty);
  const [draft, setDraft] = useState<ProfileState>(empty);
  const [extras, setExtras] = useState<ProfileExtras>(defaultExtras);
  const [extrasDraft, setExtrasDraft] = useState<ProfileExtras>(defaultExtras);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [geoHelpOpen, setGeoHelpOpen] = useState(false);

  const handleCopyPhone = (numberToCopy?: string) => {
    const raw = numberToCopy || profile.phone || (phoneLocal ? `${extrasDraft.phoneCountryCode} ${phoneLocal}` : "");
    if (!raw) return;
    navigator.clipboard.writeText(raw);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
    toast.success(ar ? "تم نسخ رقم الهاتف بنجاح!" : "Phone number copied to clipboard!");
  };

  // Load extras from storage + listen for real-time persona updates from Settings
  useEffect(() => {
    const loadData = () => {
      profileExtras.load().then((v) => {
        setExtras(v);
        setExtrasDraft(v);
      });
    };
    loadData();

    const handlePersonaChange = (e: any) => {
      const p = e.detail?.persona;
      if (p) {
        setExtras((prev) => ({ ...prev, persona: p }));
        setExtrasDraft((prev) => ({ ...prev, persona: p }));
      } else {
        loadData();
      }
    };

    const handleProfileUpdate = (e: any) => {
      loadData();
      if (e?.detail?.userDocData) {
        const data = e.detail.userDocData;
        if (data.profile_extras) {
          setExtras(data.profile_extras);
          setExtrasDraft(data.profile_extras);
        }
      }
    };

    window.addEventListener("foras:persona_change", handlePersonaChange);
    window.addEventListener("foras:profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("foras:persona_change", handlePersonaChange);
      window.removeEventListener("foras:profile-updated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (isGuest) {
      const p = guestStorage.get<ProfileState>("profile");
      if (p) { setProfile(p); setDraft(p); }
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users", user.id))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.profile_extras) {
            setExtras(data.profile_extras);
            setExtrasDraft(data.profile_extras);
            profileExtras.save(data.profile_extras);
          }
          const p: ProfileState = {
            full_name: data.full_name ?? user.fullName ?? "",
            bio: data.bio ?? "",
            education: data.education ?? "",
            location: data.location ?? "",
            avatar_url: data.avatar_url ?? user.avatarUrl ?? "",
            phone: data.phone ?? "",
            skills: data.skills ?? [],
            interests: data.interests ?? [],
          };
          setProfile(p);
          setDraft(p);
        } else {
          const p = guestStorage.get<ProfileState>("profile");
          if (p) { setProfile(p); setDraft(p); }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user, isGuest]);

  // Derive local phone digits
  useEffect(() => {
    const stored = draft.phone || "";
    const code = extrasDraft.phoneCountryCode || "+249";
    if (stored.startsWith(code)) {
      setPhoneLocal(stored.slice(code.length).replace(/^\s+/, ""));
    } else {
      setPhoneLocal(stored.replace(/^\+\d+\s*/, ""));
    }
  }, [draft.phone, extrasDraft.phoneCountryCode, editing]);

  const completion = useMemo(() => {
    const fields = [
      profile.full_name, profile.bio, profile.education, profile.location,
      profile.skills.length > 0 ? "x" : "", profile.interests.length > 0 ? "x" : "",
      extras.degree || extras.university || extras.highSchool ? "x" : "",
      extras.major ? "x" : "",
      extras.detailedSkills.length > 0 ? "x" : "",
      extras.links.length > 0 ? "x" : "",
      extras.experienceYears ? "x" : "",
    ];
    const filled = fields.filter(f => f && String(f).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile, extras]);

  // AI Matching Precision & Readiness Calculation
  const aiReadiness = useMemo(() => {
    return calculateAIMatchingReadiness(profile, extras);
  }, [profile, extras]);

  const handleQuickAction = (signal: AIMatchingSignal) => {
    setDraft(profile);
    setExtrasDraft(extras);
    setEditing(true);

    // Scroll to relevant field smoothly after mounting edit mode
    setTimeout(() => {
      let targetElementId = "";
      switch (signal.iconName) {
        case "gpa":
          targetElementId = "field-gpa";
          break;
        case "degree":
          targetElementId = "field-degree";
          break;
        case "major":
          targetElementId = "field-major";
          break;
        case "links":
          targetElementId = "field-links";
          break;
        case "skills":
          targetElementId = "field-skills";
          break;
        case "experience":
          targetElementId = "field-experience";
          break;
        case "location":
          targetElementId = "field-location";
          break;
        case "bio":
          targetElementId = "field-bio";
          break;
        default:
          targetElementId = "";
      }

      if (targetElementId) {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-primary", "animate-pulse");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-primary", "animate-pulse");
          }, 2500);
        }
      }
    }, 150);
  };

  const startEdit = () => { setDraft(profile); setExtrasDraft(extras); setEditing(true); };
  const cancelEdit = () => { setDraft(profile); setExtrasDraft(extras); setEditing(false); };

  // Handle GPS Auto-Fill
  const handleAutoFillLocation = async () => {
    try {
      const geoResult = await requestGeo(true);
      if (geoResult && (geoResult.country || geoResult.city)) {
        const countryStr = isRtl ? (geoResult.countryAr || geoResult.country || "") : (geoResult.countryEn || geoResult.country || "");
        const cityStr = isRtl ? (geoResult.cityAr || geoResult.city || "") : (geoResult.cityEn || geoResult.city || "");
        const formattedLoc = cityStr && countryStr ? `${countryStr} / ${cityStr}` : (countryStr || cityStr);

        setDraft(d => ({ ...d, location: formattedLoc }));

        if (geoResult.countryCode) {
          const matchC = findPhoneCountry(geoResult.countryCode);
          if (matchC) {
            setExtrasDraft(d => ({ ...d, phoneCountryIso: matchC.iso, phoneCountryCode: matchC.code }));
          }
        }

        toast.success(
          isRtl
            ? `📍 تم تحديد موقعك بنجاح: ${formattedLoc}`
            : `📍 Location detected: ${formattedLoc}`
        );
      } else {
        toast.error(isRtl ? "تعذر تحديد الموقع بدقة. تأكد من تفعيل إذن الموقع." : "Could not determine exact location. Check permissions.");
      }
    } catch {
      toast.error(isRtl ? "حدث خطأ أثناء جلب الموقع الجغرافي" : "Error obtaining location");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error(isRtl ? "الرجاء اختيار ملف صورة صالح (PNG, JPG, WEBP)" : "Please select a valid image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error(isRtl ? "حجم الصورة أكبر من 4 ميجابايت" : "Image size exceeds 4MB");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingAvatarUrl(dataUrl);
      setPreviewOpen(true);
      setUploading(false);
      toast.info(
        isRtl
          ? "📸 تمت قراءة الصورة بنجاح — يرجى معاينتها والضغط على 'حفظ الصورة' لتأكيد التغيير"
          : "📸 Photo loaded — please preview and click 'Save Photo' to confirm"
      );
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error(isRtl ? "تعذر قراءة ملف الصورة" : "Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const confirmSavePendingAvatar = async () => {
    if (!pendingAvatarUrl || !user) return;
    setUploading(true);
    try {
      const next = { ...draft, avatar_url: pendingAvatarUrl };
      setDraft(next);
      setProfile(next);
      if (!isGuest && user) {
        await setDoc(doc(db, "users", user.id), { avatar_url: pendingAvatarUrl }, { merge: true });
      } else {
        guestStorage.set("profile", next);
      }
      setPendingAvatarUrl(null);
      setPreviewOpen(false);
      toast.success(isRtl ? "✅ تم حفظ الصورة الشخصية الجديدة بنجاح" : "✅ Profile photo updated successfully");
    } catch (err) {
      console.error("Avatar save error:", err);
      toast.error(isRtl ? "حدث خطأ أثناء حفظ الصورة" : "Error saving photo");
    } finally {
      setUploading(false);
    }
  };

  const cancelPendingAvatar = () => {
    setPendingAvatarUrl(null);
    toast.info(isRtl ? "تم إلغاء التغيير والاحتفاظ بالصورة السابقة" : "Photo change canceled");
  };

  const handleRemoveAvatar = async () => {
    const next = { ...draft, avatar_url: "" };
    setDraft(next);
    setProfile(next);
    if (!isGuest && user) {
      try {
        await setDoc(doc(db, "users", user.id), { avatar_url: "" }, { merge: true });
      } catch {}
    } else {
      guestStorage.set("profile", next);
    }
    setPendingAvatarUrl(null);
    setPreviewOpen(false);
    toast.success(isRtl ? "تمت إزالة الصورة بنجاح" : "Profile photo removed");
  };

  const handleSave = async () => {
    if (phoneLocal && !validatePhone(extrasDraft.phoneCountryIso, phoneLocal)) {
      toast.error(t("invalidPhoneForCountry"));
      return;
    }
    const composedPhone = phoneLocal
      ? `${extrasDraft.phoneCountryCode} ${phoneLocal.replace(/\D/g, "")}`
      : "";
    const nextDraft: ProfileState = { ...draft, phone: composedPhone };
    setSaving(true);
    await profileExtras.save(extrasDraft);
    setExtras(extrasDraft);
    if (isGuest || !user) {
      guestStorage.set("profile", nextDraft);
      setSaving(false);
      setProfile(nextDraft);
      setEditing(false);
      toast.success(t("saved2"));
      return;
    }
    try {
      await setDoc(doc(db, "users", user.id), {
        ...nextDraft,
        profile_extras: extrasDraft,
        updated_at: new Date().toISOString(),
      }, { merge: true });
      setSaving(false);
      setProfile(nextDraft);
      setEditing(false);
      toast.success(t("saved2"));
    } catch {
      setSaving(false);
      toast.error(t("saveFailed"));
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !draft.skills.includes(s) && draft.skills.length < 25) {
      setDraft({ ...draft, skills: [...draft.skills, s] });
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setDraft({ ...draft, skills: draft.skills.filter(x => x !== s) });
  };

  const toggleInterest = (i: string) => {
    setDraft(d => ({
      ...d,
      interests: d.interests.includes(i) ? d.interests.filter(x => x !== i) : [...d.interests, i],
    }));
  };

  const handleUpdateLinksDirectly = (newLinks: PersonalLink[]) => {
    setExtrasDraft((d) => ({ ...d, links: newLinks }));
    if (!editing) {
      setExtras((prev) => {
        const next = { ...prev, links: newLinks };
        profileExtras.save(next);
        return next;
      });
    }
  };

  const addDetailedSkill = (category: SkillEntry["category"]) => {
    setExtrasDraft(d => ({
      ...d,
      detailedSkills: [...d.detailedSkills, { name: "", level: 3, category }],
    }));
  };

  const updateDetailedSkill = (idx: number, patch: Partial<SkillEntry>) => {
    setExtrasDraft(d => ({
      ...d,
      detailedSkills: d.detailedSkills.map((s, i) => i === idx ? { ...s, ...patch } : s),
    }));
  };

  const removeDetailedSkill = (idx: number) => {
    setExtrasDraft(d => ({ ...d, detailedSkills: d.detailedSkills.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="text-center text-muted-foreground py-20">{t("loading")}</div>;

  // ===== DASHBOARD (VIEW) MODE =====
  if (!editing) {
    const initial = (profile.full_name || user?.email || "ض")[0].toUpperCase();

    return (
      <div className="space-y-4 w-full pb-10">
        {/* === Executive Profile Card: Edge-Anchored Hero Frame + Linear Aligned Info Stack === */}
        <ProfileHeroHeader
          profile={profile}
          extras={extras}
          completion={completion}
          user={user}
          isGuest={isGuest}
          hideProfile={hideProfile}
          alignClass={alignClass}
          dir={dir}
          ar={ar}
          uploading={uploading}
          copiedPhone={copiedPhone}
          startEdit={startEdit}
          onAvatarClick={() => {
            setPendingAvatarUrl(null);
            setPreviewOpen(true);
          }}
          handleAvatarUpload={handleAvatarUpload}
          handleCopyPhone={handleCopyPhone}
          t={t}
        />

        {/* === Full-Screen Immersive Cinema Lightbox Modal === */}
        <ProfileAvatarCinemaModal
          previewOpen={previewOpen}
          pendingAvatarUrl={pendingAvatarUrl}
          profile={profile}
          hideProfile={hideProfile}
          initial={initial}
          uploading={uploading}
          ar={ar}
          onClose={() => {
            setPendingAvatarUrl(null);
            setPreviewOpen(false);
          }}
          confirmSavePendingAvatar={confirmSavePendingAvatar}
          cancelPendingAvatar={cancelPendingAvatar}
          handleAvatarUpload={handleAvatarUpload}
          handleRemoveAvatar={handleRemoveAvatar}
        />

        {/* === AI MATCHING PRECISION & READINESS CARD (PRO AI ADVISOR) === */}
        {!hideProfile && (
          <AIMatchingReadinessCard
            readiness={aiReadiness}
            onQuickActionClick={handleQuickAction}
          />
        )}

        {/* === SECTION: BIO & SUMMARY === */}
        {profile.bio && !hideProfile && (
          <div className="bg-card-gradient border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-2 shadow-luxe">
            <p className="text-xs sm:text-sm text-gold-gradient font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold flex-shrink-0" />
              <span>{t("bio")}</span>
            </p>
            <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* === PERSONA-DRIVEN PROGRESSIVE SECTIONS === */}
        {extras.persona === "professional" ? (
          <>
            {!hideProfile && <ProfileExperienceView extras={extras} ar={ar} />}
            {!hideProfile && <ProfileDetailedSkillsView skills={extras.detailedSkills} ar={ar} />}
            {!hideProfile && <ProfileLinksView links={extras.links} ar={ar} onEdit={() => setEditing(true)} />}
            {((extras.degree || extras.university || extras.highSchool || extras.gpa || profile.education) && !hideProfile) && (
              <ProfileAcademicView extras={extras} educationNotes={profile.education} ar={ar} />
            )}
          </>
        ) : (
          <>
            {((extras.degree || extras.university || extras.highSchool || extras.gpa || profile.education) && !hideProfile) && (
              <ProfileAcademicView extras={extras} educationNotes={profile.education} ar={ar} />
            )}
            {!hideProfile && (
              <ProfileLinksView
                links={extras.links}
                ar={ar}
                onEdit={() => setEditing(true)}
                title={ar ? "الروابط وملف السيرة الذاتية" : "Links & Resume (CV / Portfolio)"}
                emptyNotice={ar ? "لم تقم بإضافة رابط سيرتك الذاتية أو حساباتك الأكاديمية بعد." : "No CV or academic links connected yet."}
                addBtnText={ar ? "إضافة وتعديل روابط السيرة والشهادات" : "Add & Edit CV / Academic Links"}
              />
            )}
            {!hideProfile && <ProfileDetailedSkillsView skills={extras.detailedSkills} ar={ar} />}
            {!hideProfile && <ProfileExperienceView extras={extras} ar={ar} />}
          </>
        )}

        {/* === SECTION: GENERAL SKILLS TAGS === */}
        {(profile.skills.length > 0 && !hideProfile) && (
          <div className="bg-card-gradient border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-3 shadow-luxe">
            <p className="text-xs sm:text-sm text-gold-gradient font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gold flex-shrink-0" />
              <span>{t("skills")}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => (
                <span key={s} className="text-xs bg-background/80 border border-primary/30 text-foreground font-medium px-3 py-1.5 rounded-xl shadow-2xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== EDIT MODE (FULL EDITING SUITE) =====
  return (
    <div className="space-y-5 w-full pb-12">
      {/* Top Header Save/Cancel Bar */}
      <div className="bg-card-gradient border-gold rounded-3xl p-5 flex items-center justify-between shadow-gold">
        <div>
          <h2 className="font-display text-xl text-gold-gradient font-bold">{t("editProfile")}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t("editProfileDesc")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghostGold" size="sm" onClick={cancelEdit}>{t("cancel")}</Button>
          <Button variant="luxe" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 me-1" />}
            {t("save")}
          </Button>
        </div>
      </div>

      {/* 0. PERSONA SELECTOR (Student vs. Professional) */}
      <div className="bg-card-gradient border-gold rounded-3xl p-4 sm:p-5 shadow-gold space-y-3">
        <div className={alignClass}>
          <p className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {ar ? "نوع الحساب والمسار المستهدف" : "Profile Archetype & Target Path"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {ar
              ? "اختر مسارك لتخصيص الحقول المناسبة (طالب للدراسة والمنح، أو مهني للوظائف والعمل الحر)"
              : "Select your path to customize fields (Student for scholarships, or Professional for jobs)"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-background/60 p-1.5 rounded-2xl border border-primary/25">
          <button
            type="button"
            onClick={() => setExtrasDraft({ ...extrasDraft, persona: "student" })}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              extrasDraft.persona !== "professional"
                ? "bg-gold-gradient text-primary-foreground shadow-gold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{ar ? "طالب ومنح دراسية 🎓" : "Student & Scholar 🎓"}</span>
          </button>

          <button
            type="button"
            onClick={() => setExtrasDraft({ ...extrasDraft, persona: "professional" })}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              extrasDraft.persona === "professional"
                ? "bg-gold-gradient text-primary-foreground shadow-gold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{ar ? "مهني وفرص عمل 💼" : "Freelancer & Pro 💼"}</span>
          </button>
        </div>
      </div>

      {/* 1. PERSONAL INFORMATION */}
      <Section title={ar ? "المعلومات الشخصية وبيانات التواصل" : "Personal Information & Contact"} alignClass={alignClass}>
        {/* Avatar Photo Edit Widget */}
        <div className="flex items-center gap-4 sm:gap-5 p-3.5 rounded-2xl bg-background/50 border border-primary/25">
          <LuxeAvatar
            src={draft.avatar_url || null}
            name={draft.full_name || user?.email || "User"}
            size="pro"
            shape="squircle"
            showRing={true}
            ringStatus="gold"
          />
          <div className={`flex-1 ${alignClass}`}>
            <p className="text-sm font-bold text-foreground">
              {ar ? "الصورة الشخصية" : "Profile Picture"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ar ? "انقر لاختيار صورة ومعاينتها ثم تأكيد حفظها" : "Click to select and preview before saving"}
            </p>
            <label className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold shadow-sm cursor-pointer hover:brightness-105 active:scale-95 transition-all">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{uploading ? (ar ? "جاري الرفع..." : "Uploading...") : (ar ? "تغيير" : "Change")}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <Field icon={UserIcon} label={t("fullName")}>
          <Input
            value={draft.full_name}
            onChange={e => setDraft({ ...draft, full_name: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass}`}
            placeholder={t("yourNameHolder")}
          />
        </Field>

        {/* Location with One-Tap GPS */}
        <div id="field-location">
          <Field icon={MapPin} label={t("location")}>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={draft.location}
                  onChange={e => setDraft({ ...draft, location: e.target.value })}
                  className={`bg-input border-gold/30 flex-1 ${alignClass}`}
                  placeholder={ar ? "الدولة / المدينة — مثال: السودان / الخرطوم" : "Country / City — e.g. Sudan / Khartoum"}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoFillLocation}
                  disabled={geoLoading}
                  className="border-primary/40 text-primary hover:bg-primary/15 font-bold flex-shrink-0 text-xs gap-1.5 h-10 px-3 rounded-xl shadow-gold"
                >
                  {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                  <span>{ar ? "موقعي الحالي" : "My Location"}</span>
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <span>{ar ? "💡 سيتم ملء الدولة والمدينة ورمز الهاتف تلقائياً." : "💡 Automatically fills country, city & dial code."}</span>
                <button
                  type="button"
                  onClick={() => setGeoHelpOpen(true)}
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  <HelpCircle className="w-3 quasi-w-3" />
                  <span>{ar ? "موقعي غير دقيق؟" : "Wrong location?"}</span>
                </button>
              </div>
            </div>
          </Field>
        </div>

        {/* Phone with Country Code Selector */}
        <div id="field-phone">
          <Field icon={Phone} label={t("phone")}>
            <div className="flex gap-2" dir="ltr">
              <Select
                value={extrasDraft.phoneCountryIso}
                onValueChange={(iso) => {
                  const c = findPhoneCountry(iso);
                  setExtrasDraft(d => ({ ...d, phoneCountryIso: c.iso, phoneCountryCode: c.code }));
                }}
              >
                <SelectTrigger className="w-[130px] bg-input border-gold/30">
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      <span>{findPhoneCountry(extrasDraft.phoneCountryIso).flag}</span>
                      <span className="font-mono text-xs">{extrasDraft.phoneCountryCode}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {PHONE_COUNTRIES.map(c => (
                    <SelectItem key={c.iso} value={c.iso}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span className="font-mono text-xs">{c.code}</span>
                        <span className="text-xs text-muted-foreground">{ar ? c.name : c.nameEn}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={phoneLocal}
                onChange={e => setPhoneLocal(e.target.value.replace(/[^\d]/g, ""))}
                className="bg-input border-gold/30 flex-1 text-left"
                placeholder="912345678"
                inputMode="tel"
                type="tel"
              />
              {phoneLocal && (
                <button
                  type="button"
                  onClick={() => handleCopyPhone(`${extrasDraft.phoneCountryCode} ${phoneLocal}`)}
                  title={ar ? "نسخ رقم الهاتف" : "Copy phone number"}
                  className="h-10 px-3 rounded-md bg-input border border-gold/30 hover:bg-primary/20 hover:border-primary/50 text-foreground flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer"
                >
                  {copiedPhone ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
              )}
            </div>
            {phoneLocal && !validatePhone(extrasDraft.phoneCountryIso, phoneLocal) && (
              <p className="text-[10px] text-destructive mt-1">⚠️ {ar ? "رقم غير صالح لهذه الدولة" : "Invalid phone number for this country"}</p>
            )}
          </Field>
        </div>

        {/* Bio */}
        <div id="field-bio">
          <Field icon={BookOpen} label={t("bio")}>
            <Textarea
              value={draft.bio}
              onChange={e => setDraft({ ...draft, bio: e.target.value })}
              className={`bg-input border-gold/30 ${alignClass} min-h-24`}
              placeholder={t("bioHolder")}
            />
          </Field>
        </div>
      </Section>

      {/* PROGRESSIVE SECTIONS BASED ON SELECTED PERSONA IN EDIT MODE */}
      {extrasDraft.persona === "professional" ? (
        <>
          {/* PROFESSIONAL EDIT 1: WORK EXPERIENCE */}
          <div id="field-experience">
            <Section title={ar ? "الخبرات العملية والمسار المهني" : "Work Experience & Professional Path"} alignClass={alignClass}>
              <Field icon={Briefcase} label={ar ? "سنوات الخبرة الإجمالية" : "Years of Experience"}>
                <Select
                  value={extrasDraft.experienceYears || "none"}
                  onValueChange={(val: any) => setExtrasDraft(d => ({ ...d, experienceYears: val }))}
                >
                  <SelectTrigger className="bg-input border-gold/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map(e => (
                      <SelectItem key={e.value} value={e.value}>
                        {ar ? e.labelAr : e.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>
          </div>

          {/* PROFESSIONAL EDIT 2: DETAILED SKILLS WITH RATINGS */}
          <div id="field-skills">
            <Section title={ar ? "المهارات المتقدمة ومستوى الإتقان (1 - 5)" : "Detailed Skills & Proficiency (Level 1 - 5)"} alignClass={alignClass}>
              <div className="space-y-3">
                {extrasDraft.detailedSkills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-card/60 hover:bg-card border border-border/80 hover:border-primary/40 space-y-3 transition-all shadow-xs"
                  >
                    {/* Row 1: Skill Name Input (Generous width) + Category Select + Delete Button */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Input
                          value={sk.name}
                          onChange={e => updateDetailedSkill(idx, { name: e.target.value })}
                          placeholder={ar ? "اسم المهارة (مثل: Python, Figma, إدارة مشاريع...)" : "Skill name (e.g. Python, Figma, Project Management...)"}
                          className="h-11 bg-input border-gold/30 text-xs sm:text-sm font-medium w-full"
                        />
                      </div>

                      <div className="w-[130px] sm:w-[160px] flex-shrink-0">
                        <Select
                          value={sk.category}
                          onValueChange={(val: any) => updateDetailedSkill(idx, { category: val })}
                        >
                          <SelectTrigger className="h-11 bg-input border-gold/30 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SKILL_CATEGORY_META).map(([k, meta]) => (
                              <SelectItem key={k} value={k}>
                                <span>{meta.emoji} {ar ? meta.labelAr : meta.labelEn}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghostGold"
                        size="sm"
                        type="button"
                        onClick={() => removeDetailedSkill(idx)}
                        className="h-11 w-11 p-0 text-destructive hover:bg-destructive/10 rounded-xl flex-shrink-0"
                        title={ar ? "حذف المهارة" : "Delete skill"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Row 2: Proficiency Level with Clear Label & 44px Touch Targets */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>{ar ? "مستوى الإتقان:" : "Proficiency:"}</span>
                        <span className={`font-bold ${SKILL_LEVEL_META[sk.level]?.color || "text-primary"}`}>
                          {ar ? SKILL_LEVEL_META[sk.level]?.labelAr : SKILL_LEVEL_META[sk.level]?.labelEn}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const active = lvl <= sk.level;
                          const isCurrent = lvl === sk.level;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => updateDetailedSkill(idx, { level: lvl })}
                              className={`h-8 min-w-[32px] sm:min-w-[36px] px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                                isCurrent
                                  ? "bg-gold-gradient text-primary-foreground border-primary shadow-gold scale-105"
                                  : active
                                  ? "bg-primary/20 text-primary border-primary/40"
                                  : "bg-background/80 text-muted-foreground border-border/70 hover:border-primary/50"
                              }`}
                              title={`${lvl} / 5`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {Object.entries(SKILL_CATEGORY_META).map(([k, meta]) => (
                  <Button
                    key={k}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDetailedSkill(k as any)}
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10 rounded-xl py-2 px-3 h-auto"
                  >
                    <Plus className="w-3.5 h-3.5 me-1.5 text-primary" />
                    <span>{meta.emoji} {ar ? `+ ${meta.labelAr}` : `+ ${meta.labelEn}`}</span>
                  </Button>
                ))}
              </div>
            </Section>
          </div>

          {/* PROFESSIONAL EDIT 3: PROFESSIONAL & PORTFOLIO LINKS */}
          <div id="field-links">
            <Section title={ar ? "الروابط المهنية ومعرض الأعمال (LinkedIn / Portfolio)" : "Professional Links & Portfolio"} alignClass={alignClass}>
              <InlineLinksManager
                links={extrasDraft.links}
                onChange={handleUpdateLinksDirectly}
                persona="professional"
              />
            </Section>
          </div>

          {/* PROFESSIONAL EDIT 4: ACADEMIC BACKGROUND (SECONDARY) */}
          <Section title={ar ? "المؤهلات الأكاديمية والتعليم (اختياري)" : "Academic Background (Optional)"} alignClass={alignClass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div id="field-degree">
                <Field icon={GraduationCap} label={ar ? "الدرجة العلمية" : "Degree"}>
                  <Select
                    value={extrasDraft.degree || "bachelor"}
                    onValueChange={(val: any) => setExtrasDraft(d => ({ ...d, degree: val }))}
                  >
                    <SelectTrigger className="bg-input border-gold/30">
                      <SelectValue placeholder={ar ? "اختر الدرجة العلمية" : "Select Degree"} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>
                          {ar ? d.labelAr : d.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field icon={Building} label={ar ? "الجامعة / الكلية" : "University / College"}>
                <Input
                  value={extrasDraft.university}
                  onChange={e => setExtrasDraft(d => ({ ...d, university: e.target.value }))}
                  placeholder={ar ? "اسم الجامعة أو المعهد" : "University name"}
                  className="bg-input border-gold/30"
                />
              </Field>

              <div id="field-major">
                <Field icon={BookOpen} label={ar ? "التخصص أو المجال" : "Field / Major"}>
                  <Input
                    value={extrasDraft.major}
                    onChange={e => setExtrasDraft(d => ({ ...d, major: e.target.value }))}
                    placeholder={ar ? "مثل: هندسة برمجيات، تسويق، إدارة" : "e.g. Software Engineering, Marketing"}
                    className="bg-input border-gold/30"
                  />
                </Field>
              </div>

              <div id="field-gpa">
                <Field icon={Award} label={ar ? "المعدل التراكمي (إن وجد)" : "GPA (If applicable)"}>
                  <div className="flex gap-2">
                    <Input
                      value={extrasDraft.gpa}
                      onChange={e => setExtrasDraft(d => ({ ...d, gpa: e.target.value }))}
                      placeholder={ar ? "مثال: 3.85 أو 88" : "e.g. 3.85 or 88"}
                      className="bg-input border-gold/30 flex-1"
                    />
                    <Select
                      value={extrasDraft.gpaScale}
                      onValueChange={(val: any) => setExtrasDraft(d => ({ ...d, gpaScale: val }))}
                    >
                      <SelectTrigger className="w-[100px] bg-input border-gold/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">/ 4.0</SelectItem>
                        <SelectItem value="5">/ 5.0</SelectItem>
                        <SelectItem value="100">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
              </div>
            </div>

            <Field icon={GraduationCap} label={t("eduLabel")}>
              <Textarea
                value={draft.education}
                onChange={e => setDraft({ ...draft, education: e.target.value })}
                className={`bg-input border-gold/30 ${alignClass} min-h-20`}
                placeholder={t("eduHolder")}
              />
            </Field>
          </Section>
        </>
      ) : (
        <>
          {/* STUDENT EDIT 1: ACADEMIC QUALIFICATIONS & DEGREES */}
          <Section title={ar ? "المؤهلات الأكاديمية والتعليم (أساسي للفرص والمنح)" : "Academic Background & Education"} alignClass={alignClass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div id="field-degree">
                <Field icon={GraduationCap} label={ar ? "المستوى الأكاديمي الحالي" : "Academic Level"}>
                  <Select
                    value={extrasDraft.degree || "bachelor"}
                    onValueChange={(val: any) => setExtrasDraft(d => ({ ...d, degree: val }))}
                  >
                    <SelectTrigger className="bg-input border-gold/30">
                      <SelectValue placeholder={ar ? "اختر الدرجة العلمية" : "Select Degree"} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>
                          {ar ? d.labelAr : d.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field icon={Building} label={ar ? "الجامعة / الكلية" : "University / College"}>
                <Input
                  value={extrasDraft.university}
                  onChange={e => setExtrasDraft(d => ({ ...d, university: e.target.value }))}
                  placeholder={ar ? "اسم الجامعة أو المعهد" : "University name"}
                  className="bg-input border-gold/30"
                />
              </Field>

              <Field icon={Building} label={ar ? "المدرسة الثانوية" : "High School"}>
                <Input
                  value={extrasDraft.highSchool}
                  onChange={e => setExtrasDraft(d => ({ ...d, highSchool: e.target.value }))}
                  placeholder={ar ? "اسم المدرسة الثانوية (لطلاب البكالوريوس)" : "High school name"}
                  className="bg-input border-gold/30"
                />
              </Field>

              <div id="field-major">
                <Field icon={BookOpen} label={ar ? "التخصص أو الشعبة" : "Field of Study / Major"}>
                  <Input
                    value={extrasDraft.major}
                    onChange={e => setExtrasDraft(d => ({ ...d, major: e.target.value }))}
                    placeholder={ar ? "مثل: هندسة، طب، اقتصاد، لغات" : "e.g. Computer Science, Medicine"}
                    className="bg-input border-gold/30"
                  />
                </Field>
              </div>

              <div id="field-gpa">
                <Field icon={Award} label={ar ? "المعدل التراكمي أو النسبة المئوية" : "GPA / Grade Percentage"}>
                  <div className="flex gap-2">
                    <Input
                      value={extrasDraft.gpa}
                      onChange={e => setExtrasDraft(d => ({ ...d, gpa: e.target.value }))}
                      placeholder={ar ? "مثال: 3.85 أو 92" : "e.g. 3.85 or 92"}
                      className="bg-input border-gold/30 flex-1"
                    />
                    <Select
                      value={extrasDraft.gpaScale}
                      onValueChange={(val: any) => setExtrasDraft(d => ({ ...d, gpaScale: val }))}
                    >
                      <SelectTrigger className="w-[100px] bg-input border-gold/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">/ 4.0</SelectItem>
                        <SelectItem value="5">/ 5.0</SelectItem>
                        <SelectItem value="100">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
              </div>
            </div>

            <Field icon={GraduationCap} label={t("eduLabel")}>
              <Textarea
                value={draft.education}
                onChange={e => setDraft({ ...draft, education: e.target.value })}
                className={`bg-input border-gold/30 ${alignClass} min-h-20`}
                placeholder={t("eduHolder")}
              />
            </Field>
          </Section>

          {/* STUDENT EDIT 2: LINKS & RESUME */}
          <div id="field-links">
            <Section title={ar ? "الروابط وملف السيرة الذاتية (CV / Portfolio)" : "Links & Resume (CV / Portfolio)"} alignClass={alignClass}>
              <InlineLinksManager
                links={extrasDraft.links}
                onChange={handleUpdateLinksDirectly}
                persona="student"
              />
            </Section>
          </div>

          {/* STUDENT EDIT 3: DETAILED SKILLS */}
          <div id="field-skills">
            <Section title={ar ? "المهارات الأكاديمية واللغات ومستوى الإتقان" : "Academic Skills & Languages"} alignClass={alignClass}>
              <div className="space-y-3">
                {extrasDraft.detailedSkills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-card/60 hover:bg-card border border-border/80 hover:border-primary/40 space-y-3 transition-all shadow-xs"
                  >
                    {/* Row 1: Skill/Language Name Input (Generous width) + Category Select + Delete Button */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Input
                          value={sk.name}
                          onChange={e => updateDetailedSkill(idx, { name: e.target.value })}
                          placeholder={ar ? "اسم المهارة أو اللغة (مثل: الإنجليزية، البحث العلمي...)" : "Skill/Language (e.g. English, Academic Writing...)"}
                          className="h-11 bg-input border-gold/30 text-xs sm:text-sm font-medium w-full"
                        />
                      </div>

                      <div className="w-[130px] sm:w-[160px] flex-shrink-0">
                        <Select
                          value={sk.category}
                          onValueChange={(val: any) => updateDetailedSkill(idx, { category: val })}
                        >
                          <SelectTrigger className="h-11 bg-input border-gold/30 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SKILL_CATEGORY_META).map(([k, meta]) => (
                              <SelectItem key={k} value={k}>
                                <span>{meta.emoji} {ar ? meta.labelAr : meta.labelEn}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghostGold"
                        size="sm"
                        type="button"
                        onClick={() => removeDetailedSkill(idx)}
                        className="h-11 w-11 p-0 text-destructive hover:bg-destructive/10 rounded-xl flex-shrink-0"
                        title={ar ? "حذف المهارة" : "Delete skill"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Row 2: Proficiency Level with Clear Label & 44px Touch Targets */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>{ar ? "مستوى الإتقان:" : "Proficiency:"}</span>
                        <span className={`font-bold ${SKILL_LEVEL_META[sk.level]?.color || "text-primary"}`}>
                          {ar ? SKILL_LEVEL_META[sk.level]?.labelAr : SKILL_LEVEL_META[sk.level]?.labelEn}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const active = lvl <= sk.level;
                          const isCurrent = lvl === sk.level;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => updateDetailedSkill(idx, { level: lvl })}
                              className={`h-8 min-w-[32px] sm:min-w-[36px] px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                                isCurrent
                                  ? "bg-gold-gradient text-primary-foreground border-primary shadow-gold scale-105"
                                  : active
                                  ? "bg-primary/20 text-primary border-primary/40"
                                  : "bg-background/80 text-muted-foreground border-border/70 hover:border-primary/50"
                              }`}
                              title={`${lvl} / 5`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {Object.entries(SKILL_CATEGORY_META).map(([k, meta]) => (
                  <Button
                    key={k}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDetailedSkill(k as any)}
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10 rounded-xl py-2 px-3 h-auto"
                  >
                    <Plus className="w-3.5 h-3.5 me-1.5 text-primary" />
                    <span>{meta.emoji} {ar ? `+ ${meta.labelAr}` : `+ ${meta.labelEn}`}</span>
                  </Button>
                ))}
              </div>
            </Section>
          </div>

          {/* STUDENT EDIT 4: WORK EXPERIENCE (SECONDARY) */}
          <div id="field-experience">
            <Section title={ar ? "الخبرات والتدريب العملي (إن وجد)" : "Work & Internship Experience (Optional)"} alignClass={alignClass}>
              <Field icon={Briefcase} label={ar ? "سنوات الخبرة أو التدريب" : "Years of Experience / Internship"}>
                <Select
                  value={extrasDraft.experienceYears || "none"}
                  onValueChange={(val: any) => setExtrasDraft(d => ({ ...d, experienceYears: val }))}
                >
                  <SelectTrigger className="bg-input border-gold/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map(e => (
                      <SelectItem key={e.value} value={e.value}>
                        {ar ? e.labelAr : e.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>
          </div>
        </>
      )}

      {/* 6. GENERAL SKILLS & INTERESTS */}
      <Section title={ar ? "الكلمات المفتاحية والاهتمامات العامة" : "Tags & General Interests"} alignClass={alignClass}>
        <Field icon={Briefcase} label={t("skills")}>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder={ar ? "أضف مهارة سريعة واضغط إضافة..." : "Add quick skill tag..."}
              className="bg-input border-gold/30 flex-1 text-xs"
            />
            <Button type="button" variant="luxe" size="sm" onClick={addSkill}>
              <Plus className="w-4 h-4 me-1" /> {t("add")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {draft.skills.map(s => (
              <span key={s} className="text-xs bg-card border border-primary/30 text-foreground font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </Field>

        <Field icon={Sparkles} label={t("interests")}>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {INTEREST_ITEMS.map((item) => {
              const active = draft.interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    active
                      ? "bg-gold-gradient text-primary-foreground border-transparent shadow-gold font-bold scale-105"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ar ? item.labelAr : item.labelEn}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* Save & Cancel Footer Buttons */}
      <div className="pt-3 flex justify-end gap-2">
        <Button variant="ghostGold" onClick={cancelEdit}>{t("cancel")}</Button>
        <Button variant="luxe" onClick={handleSave} disabled={saving} className="px-8 shadow-gold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Save className="w-4 h-4 me-2" />}
          {t("saveChanges")}
        </Button>
      </div>

      {/* Accuracy Guide Dialog */}
      <Dialog open={geoHelpOpen} onOpenChange={setGeoHelpOpen}>
        <DialogContent className="max-w-md bg-card/95 border border-primary/40 backdrop-blur-2xl p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-gold-gradient font-bold text-base pb-2 border-b border-primary/20 pe-12">
            <Compass className="w-5 h-5 text-primary shrink-0" />
            <h3 className="truncate">{ar ? "كيف تضمن دقة تحديد موقعك؟" : "How to ensure accurate location?"}</h3>
          </div>
          <div className="space-y-3 py-2 text-xs text-foreground/90 leading-relaxed">
            <p className="font-semibold text-primary">
              {ar ? "إذا ظهر لك موقع مختلف أو مدينة أخرى، اتبع الخطوات التالية:" : "If a different city or country is detected, check these tips:"}
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
              <li>
                <strong className="text-foreground">{ar ? "تعطيل برامج الـ VPN أو البروكسي:" : "Disable VPN or Proxy:"}</strong>{" "}
                {ar ? "إذا كنت تستخدم VPN سيظهر موقع الخادم وليس موقعك الحقيقي." : "A VPN routes traffic via foreign servers."}
              </li>
              <li>
                <strong className="text-foreground">{ar ? "السماح بإذن الموقع الدقيق في المتصفح:" : "Allow High-Accuracy Location in browser:"}</strong>{" "}
                {ar ? "اضغط على أيقونة القفل بجانب رابط الموقع واختر (السماح للموقع - Allow)." : "Click lock icon in address bar and set Location to Allow."}
              </li>
              <li>
                <strong className="text-foreground">{ar ? "التعديل اليدوي المباشر:" : "Manual Edit:"}</strong>{" "}
                {ar ? "يمكنك كتابة اسم دولتك ومدينتك يدوياً في أي وقت وحفظها وسيتذكرها التطبيق فوراً." : "You can always type your country and city directly."}
              </li>
            </ol>
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="luxe" size="sm" onClick={() => setGeoHelpOpen(false)}>
              {ar ? "فهمت ذلك" : "Got it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
