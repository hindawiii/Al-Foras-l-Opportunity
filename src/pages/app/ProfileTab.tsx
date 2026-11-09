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

interface ProfileState {
  full_name: string; bio: string; education: string; location: string; avatar_url: string; phone: string;
  skills: string[]; interests: string[];
}

const empty: ProfileState = { full_name: "", bio: "", education: "", location: "", avatar_url: "", phone: "", skills: [], interests: [] };

const LINK_META: Record<LinkType, { labelAr: string; labelEn: string; emoji: string; placeholder: string }> = {
  portfolio: { labelAr: "موقع شخصي / معرض أعمال", labelEn: "Portfolio / Website", emoji: "💼", placeholder: "https://myportfolio.com" },
  linkedin:  { labelAr: "لينكد إن (LinkedIn)", labelEn: "LinkedIn", emoji: "💼", placeholder: "https://linkedin.com/in/..." },
  github:    { labelAr: "جيت هاب (GitHub)", labelEn: "GitHub", emoji: "💻", placeholder: "https://github.com/..." },
  twitter:   { labelAr: "تويتر / إكس (Twitter / X)", labelEn: "Twitter / X", emoji: "🐦", placeholder: "https://x.com/..." },
  telegram:  { labelAr: "تيليجرام (Telegram)", labelEn: "Telegram", emoji: "📱", placeholder: "https://t.me/..." },
  instagram: { labelAr: "إنستغرام (Instagram)", labelEn: "Instagram", emoji: "📸", placeholder: "https://instagram.com/..." },
  youtube:   { labelAr: "يوتيوب (YouTube)", labelEn: "YouTube", emoji: "🎥", placeholder: "https://youtube.com/..." },
  behance:   { labelAr: "بيهانس (Behance)", labelEn: "Behance", emoji: "🎨", placeholder: "https://behance.net/..." },
  medium:    { labelAr: "ميديوم (Medium)", labelEn: "Medium", emoji: "📝", placeholder: "https://medium.com/@..." },
  cv:        { labelAr: "رابط السيرة الذاتية (CV / Drive)", labelEn: "Resume / CV (Drive)", emoji: "📄", placeholder: "https://drive.google.com/..." },
  other:     { labelAr: "رابط مخصص آخر", labelEn: "Other Custom Link", emoji: "🔗", placeholder: "https://..." },
};

const DEGREE_OPTIONS: { value: NonNullable<ProfileExtras["degree"]>; labelAr: string; labelEn: string }[] = [
  { value: "secondary", labelAr: "شهادة ثانوية", labelEn: "High School Certificate" },
  { value: "diploma",   labelAr: "دبلوم تقني / مهني", labelEn: "Diploma / Vocational" },
  { value: "bachelor",  labelAr: "بكالوريوس (جامعي)", labelEn: "Bachelor's Degree" },
  { value: "master",    labelAr: "ماجستير", labelEn: "Master's Degree" },
  { value: "phd",       labelAr: "دكتوراه", labelEn: "PhD / Doctorate" },
];

const EXPERIENCE_OPTIONS: { value: NonNullable<ProfileExtras["experienceYears"]>; labelAr: string; labelEn: string }[] = [
  { value: "none",  labelAr: "طالب / بدون خبرة رسمية", labelEn: "Student / No formal experience" },
  { value: "0-1",   labelAr: "أقل من سنة (0 - 1 سنة)", labelEn: "Less than a year (0 - 1 yr)" },
  { value: "1-3",   labelAr: "1 - 3 سنوات", labelEn: "1 - 3 years" },
  { value: "3-5",   labelAr: "3 - 5 سنوات", labelEn: "3 - 5 years" },
  { value: "5-10",  labelAr: "5 - 10 سنوات", labelEn: "5 - 10 years" },
  { value: "10+",   labelAr: "أكثر من 10 سنوات (خبير)", labelEn: "10+ years (Expert)" },
];

const SKILL_CATEGORY_META: Record<SkillEntry["category"], { labelAr: string; labelEn: string; emoji: string }> = {
  tech:     { labelAr: "المهارات التقنية والبرمجية", labelEn: "Technical & Coding Skills", emoji: "💻" },
  creative: { labelAr: "المهارات الإبداعية والتصميم", labelEn: "Creative & Design Skills", emoji: "🎨" },
  language: { labelAr: "اللغات والتواصل", labelEn: "Languages & Communication", emoji: "📝" },
  other:    { labelAr: "مهارات عملية وقيادية", labelEn: "Practical & Leadership Skills", emoji: "🛠️" },
};

const SKILL_LEVEL_META: Record<number, { labelAr: string; labelEn: string; color: string; badgeAr: string }> = {
  1: { labelAr: "مبتدئ (1 / 5)", labelEn: "Beginner (1/5)", color: "text-amber-400", badgeAr: "مبتدئ" },
  2: { labelAr: "أساسي (2 / 5)", labelEn: "Elementary (2/5)", color: "text-amber-300", badgeAr: "أساسي" },
  3: { labelAr: "متوسط (3 / 5)", labelEn: "Intermediate (3/5)", color: "text-primary", badgeAr: "متوسط" },
  4: { labelAr: "متقدم (4 / 5)", labelEn: "Advanced (4/5)", color: "text-emerald-400", badgeAr: "متقدم" },
  5: { labelAr: "خبير / طليق (5 / 5)", labelEn: "Expert / Fluent (5/5)", color: "text-emerald-300 font-extrabold", badgeAr: "خبير / طليق" },
};

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
    const degreeLabel = DEGREE_OPTIONS.find(d => d.value === extras.degree);
    const expLabel = EXPERIENCE_OPTIONS.find(e => e.value === extras.experienceYears);

    return (
      <div className="space-y-4 w-full pb-10">
        {/* === Executive Profile Card: Unified Cohesive Layout with Smart Embedded Avatar === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-primary/30 bg-card/90 backdrop-blur-xl shadow-luxe p-4 sm:p-5"
          dir={dir}
        >
          {/* Subtle Ambient Backdrop */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%),linear-gradient(180deg,hsl(var(--primary)/0.05),hsl(var(--card)))]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gold-gradient opacity-70" />

          {/* Top-End Floating Executive Action Button (Circular Glass Edit Button) */}
          <div className="absolute top-3.5 end-3.5 z-10">
            <button
              onClick={startEdit}
              className="w-9 h-9 rounded-full bg-background/70 hover:bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-90"
              title={t("edit")}
              aria-label={t("edit")}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Unified Identity Row: 98px Pro Avatar with Carved Camera Button + Tightly Aligned Info Stack with Safe Spacing */}
          <div className="relative flex items-center gap-4 sm:gap-6 pe-12">
            {/* 98px Pro Avatar with Gold Progress Ring + Carved Camera Action */}
            <div className="relative flex-shrink-0">
              <div
                onClick={() => {
                  setPendingAvatarUrl(null);
                  setPreviewOpen(true);
                }}
                className="relative cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                title={ar ? "انقر للمعاينة بملء الشاشة" : "Click for full screen preview"}
              >
                <LuxeAvatar
                  src={profile.avatar_url && !hideProfile ? profile.avatar_url : null}
                  name={hideProfile ? "•" : (profile.full_name || user?.email || "User")}
                  size="pro"
                  shape="squircle"
                  showRing={true}
                  ringProgress={completion}
                  ringStatus="gold"
                />

                {/* Smart Embedded Camera Badge (Carved Anchor Cutout) */}
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-0 end-0 w-8 h-8 rounded-full bg-gold-gradient border-2 border-card flex items-center justify-center shadow-gold cursor-pointer hover:scale-110 active:scale-90 transition-transform z-20"
                  title={ar ? "تغيير الصورة الشخصية" : "Change photo"}
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-primary-foreground" />
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

            {/* Profile Identity Details (Full Name, Sub-info, Badges) - Safe Spacing: 8px & 12px */}
            <div className={`flex-1 min-w-0 flex flex-col justify-center ${alignClass}`}>
              {/* Line 1: Full Name */}
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gold-gradient truncate leading-tight">
                {hideProfile ? "•••••" : (profile.full_name || t("yourFullName"))}
              </h2>

              {/* Safe Spacing - Line 2: Sub-identity (Major/Role or Email/Guest) */}
              <div className="mt-1.5 text-xs sm:text-sm text-muted-foreground truncate">
                {(extras.major || extras.university) && !hideProfile ? (
                  <p className="font-semibold text-primary truncate">
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
                    <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                      <span>{ar ? "حساب زائر محلي" : "Guest Account"}</span>
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <button
                      type="button"
                      onClick={() => navigate("/auth")}
                      className="text-primary hover:underline font-bold text-xs cursor-pointer transition-colors"
                    >
                      {ar ? "تسجيل الدخول" : "Sign in"}
                    </button>
                  </div>
                )}
              </div>

              {/* Safe Spacing - Line 3: Metadata Badges (Location / Phone) */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                {profile.location && !hideProfile && (
                  <span className="inline-flex items-center gap-1.5 bg-background/80 border border-border/80 px-2.5 py-1 rounded-lg text-foreground font-medium truncate max-w-[170px]">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{profile.location}</span>
                  </span>
                )}
                {profile.phone && !hideProfile && (
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(profile.phone)}
                    title={ar ? "انقر لنسخ رقم الهاتف" : "Click to copy"}
                    className="inline-flex items-center gap-1.5 bg-background/80 hover:bg-primary/15 border border-border/80 px-2.5 py-1 rounded-lg text-foreground font-medium transition-colors cursor-pointer"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{profile.phone}</span>
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </button>
                )}
                {!isGuest && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{ar ? "حساب موثق ومزامن" : "Verified Account"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* === Full-Screen Immersive Cinema Lightbox (Telegram / iOS Photos Style) === */}
        <AnimatePresence>
          {previewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
              onClick={() => {
                setPendingAvatarUrl(null);
                setPreviewOpen(false);
              }}
            >
              {/* Top Floating Controls: Pure Close Button */}
              <div className="w-full flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                {pendingAvatarUrl ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{ar ? "معاينة الصورة الجديدة قبل الحفظ" : "Previewing new photo before saving"}</span>
                  </div>
                ) : <div />}

                <button
                  type="button"
                  onClick={() => {
                    setPendingAvatarUrl(null);
                    setPreviewOpen(false);
                  }}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title={ar ? "إغلاق" : "Close"}
                  aria-label={ar ? "إغلاق" : "Close"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Center: Full-Dimension Cinema Media Display */}
              <div
                className="flex-1 w-full flex flex-col items-center justify-center p-2"
                onClick={(e) => e.stopPropagation()}
              >
                {pendingAvatarUrl ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <img
                      src={pendingAvatarUrl}
                      alt="avatar-pending-preview"
                      className="max-w-[88vw] max-h-[62vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.35)] border-2 border-primary"
                    />
                    <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
                      {ar ? "انقر 'حفظ الصورة' لاعتمادها كصورتك الشخصية، أو 'إلغاء' للتراجع" : "Click 'Save Photo' to confirm or 'Cancel' to discard"}
                    </p>
                  </div>
                ) : profile.avatar_url && !hideProfile ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar-full"
                    className="max-w-[92vw] max-h-[72vh] object-contain rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-primary/40"
                  />
                ) : (
                  <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-[32px] bg-gradient-to-br from-[#3D2C04] via-[#5C4308] to-[#1E2530] border-2 border-primary/60 flex items-center justify-center shadow-2xl">
                    <span className="font-display text-8xl text-amber-200 font-bold">
                      {initial}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar: Staged Confirmation or Single-Word Action */}
              <div
                className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 pb-4"
                onClick={(e) => e.stopPropagation()}
              >
                {pendingAvatarUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelPendingAvatar}
                      disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>{ar ? "إلغاء" : "Cancel"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={confirmSavePendingAvatar}
                      disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gold-gradient text-primary-foreground font-bold text-xs sm:text-sm shadow-gold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{ar ? "حفظ الصورة" : "Save Photo"}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <label className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gold-gradient text-primary-foreground font-bold text-sm cursor-pointer shadow-gold hover:brightness-110 active:scale-95 transition-all">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>{ar ? "تغيير" : "Change"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>

                    {profile.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/15 text-sm font-bold transition-all cursor-pointer active:scale-95"
                        title={ar ? "إزالة الصورة" : "Remove photo"}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{ar ? "حذف" : "Delete"}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === AI MATCHING PRECISION & READINESS CARD (PRO AI ADVISOR) === */}
        {!hideProfile && (
          <AIMatchingReadinessCard
            readiness={aiReadiness}
            onQuickActionClick={handleQuickAction}
          />
        )}

        {/* === SECTION: BIO & SUMMARY === */}
        {profile.bio && !hideProfile && (
          <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-1.5">
            <p className="text-xs text-primary font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> {t("bio")}
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* === PERSONA-DRIVEN PROGRESSIVE SECTIONS === */}
        {extras.persona === "professional" ? (
          <>
            {/* 1. PROFESSIONAL PERSONA: WORK & EXPERIENCE FIRST */}
            {(expLabel && !hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    {ar ? "سنوات الخبرة العملية" : "Work Experience"}
                  </h3>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-semibold border border-primary/20">
                    {ar ? "موثق" : "Verified"}
                  </span>
                </div>
                <div className="bg-background/50 border border-border/70 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {ar ? expLabel.labelAr : expLabel.labelEn}
                  </span>
                  <Briefcase className="w-4 h-4 text-primary/70" />
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL PERSONA: DETAILED SKILLS WITH RATINGS */}
            {(extras.detailedSkills.length > 0 && !hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  {ar ? "المهارات المتقدمة ومستوى الإتقان" : "Detailed Skills & Proficiency"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extras.detailedSkills.map((sk, idx) => {
                    const cat = SKILL_CATEGORY_META[sk.category];
                    return (
                      <div key={idx} className="bg-background/50 border border-border/70 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">{cat?.emoji || "⚡"}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground truncate">{sk.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{ar ? cat?.labelAr : cat?.labelEn}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center flex-shrink-0" title={`Level: ${sk.level} / 5`}>
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1.5 w-3 rounded-full transition-colors ${lvl <= sk.level ? "bg-primary" : "bg-muted/70"}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. PROFESSIONAL PERSONA: PORTFOLIO & PROFESSIONAL LINKS */}
            {(!hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-primary" />
                    {ar ? "الروابط المهنية ومعرض الأعمال" : "Professional & Portfolio Links"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{extras.links.length > 0 ? (ar ? "إدارة الروابط" : "Manage Links") : (ar ? "إضافة رابط" : "Add Link")}</span>
                  </button>
                </div>

                {extras.links.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {extras.links.map((link) => {
                      const meta = LINK_META[link.type] || LINK_META.other;
                      const displayHandle = getLinkDisplayHandle(link.type, link.url);
                      return (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-background/60 border border-border/80 hover:border-primary/50 text-xs transition-all group shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg flex-shrink-0 w-8 h-8 rounded-xl bg-card border border-border/70 flex items-center justify-center">{meta.emoji}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground truncate text-xs">
                                {ar ? meta.labelAr.split(" ")[0] : meta.labelEn.split(" ")[0]}
                              </span>
                              {displayHandle && (
                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]" dir="ltr">
                                  {displayHandle}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(link.url);
                                toast.success(ar ? "تم نسخ الرابط" : "Link copied");
                              }}
                              className="h-8 w-8 rounded-xl border border-border/80 bg-card hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                              title={ar ? "نسخ الرابط" : "Copy link"}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-bold text-[11px] transition-colors"
                              title={ar ? "فتح الرابط" : "Open link"}
                            >
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{ar ? "فتح" : "Open"}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-background/30 rounded-xl border border-dashed border-border text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {ar ? "لم يتم ربط أي موقع أو معرض أعمال حتى الآن." : "No portfolio or professional links connected yet."}
                    </p>
                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-[11px] bg-card border border-primary/30 hover:bg-primary/15 text-primary px-3 py-1 rounded-full font-medium transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{ar ? "إضافة وتعديل الروابط المهنية" : "Add & Edit Professional Links"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. PROFESSIONAL PERSONA: ACADEMIC QUALIFICATIONS AS SECONDARY */}
            {((degreeLabel || extras.university || extras.highSchool || extras.gpa || profile.education) && !hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    {ar ? "المؤهلات الأكاديمية والتعليم" : "Academic Background & Education"}
                  </h3>
                  {degreeLabel && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {ar ? degreeLabel.labelAr : degreeLabel.labelEn}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {extras.university && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "الجامعة / الكلية" : "University / College"}</p>
                      <p className="font-bold text-foreground mt-0.5">{extras.university}</p>
                    </div>
                  )}
                  {extras.major && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "التخصص الأكاديمي" : "Field / Major"}</p>
                      <p className="font-bold text-foreground mt-0.5">{extras.major}</p>
                    </div>
                  )}
                  {extras.gpa && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "المعدل التراكمي" : "GPA"}</p>
                      <p className="font-bold text-gold-gradient mt-0.5 font-mono">
                        {extras.gpa} {extras.gpaScale === "100" ? "%" : `/ ${extras.gpaScale}`}
                      </p>
                    </div>
                  )}
                  {extras.highSchool && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "المدرسة الثانوية" : "High School"}</p>
                      <p className="font-bold text-foreground mt-0.5">{extras.highSchool}</p>
                    </div>
                  )}
                </div>

                {profile.education && (
                  <p className="text-xs text-foreground/90 leading-relaxed pt-1 border-t border-border/60">
                    {profile.education}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* 1. STUDENT PERSONA: ACADEMIC QUALIFICATIONS FIRST */}
            {((degreeLabel || extras.university || extras.highSchool || extras.gpa || profile.education) && !hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    {ar ? "المؤهلات الأكاديمية والتعليم" : "Academic Background & Education"}
                  </h3>
                  {degreeLabel && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {ar ? degreeLabel.labelAr : degreeLabel.labelEn}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {extras.university && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "الجامعة / الكلية" : "University / College"}</p>
                      <p className="font-bold text-foreground mt-0.5">{extras.university}</p>
                    </div>
                  )}
                  {extras.highSchool && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "المدرسة الثانوية" : "High School"}</p>
                      <p className="font-bold text-foreground mt-0.5">{extras.highSchool}</p>
                    </div>
                  )}
                  {extras.major && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "التخصص الأكاديمي" : "Field / Major"}</p>
                      <p className="font-bold text-foreground mt-0.5">{extras.major}</p>
                    </div>
                  )}
                  {extras.gpa && (
                    <div className="bg-background/50 border border-border/70 rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground">{ar ? "المعدل التراكمي / النسبة" : "GPA / Grade"}</p>
                      <p className="font-bold text-gold-gradient mt-0.5 font-mono">
                        {extras.gpa} {extras.gpaScale === "100" ? "%" : `/ ${extras.gpaScale}`}
                      </p>
                    </div>
                  )}
                </div>

                {profile.education && (
                  <p className="text-xs text-foreground/90 leading-relaxed pt-1 border-t border-border/60">
                    {profile.education}
                  </p>
                )}
              </div>
            )}

            {/* 2. STUDENT PERSONA: LINKS & PORTFOLIO */}
            {(!hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-primary" />
                    {ar ? "الروابط وملف السيرة الذاتية" : "Links & Resume (CV / Portfolio)"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{extras.links.length > 0 ? (ar ? "إدارة الروابط" : "Manage Links") : (ar ? "إضافة رابط" : "Add Link")}</span>
                  </button>
                </div>

                {extras.links.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {extras.links.map((link) => {
                      const meta = LINK_META[link.type] || LINK_META.other;
                      const displayHandle = getLinkDisplayHandle(link.type, link.url);
                      return (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-background/60 border border-border/80 hover:border-primary/50 text-xs transition-all group shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg flex-shrink-0 w-8 h-8 rounded-xl bg-card border border-border/70 flex items-center justify-center">{meta.emoji}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground truncate text-xs">
                                {ar ? meta.labelAr.split(" ")[0] : meta.labelEn.split(" ")[0]}
                              </span>
                              {displayHandle && (
                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]" dir="ltr">
                                  {displayHandle}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(link.url);
                                toast.success(ar ? "تم نسخ الرابط" : "Link copied");
                              }}
                              className="h-8 w-8 rounded-xl border border-border/80 bg-card hover:bg-background text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                              title={ar ? "نسخ الرابط" : "Copy link"}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-bold text-[11px] transition-colors"
                              title={ar ? "فتح الرابط" : "Open link"}
                            >
                              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{ar ? "فتح" : "Open"}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-background/30 rounded-xl border border-dashed border-border text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {ar ? "لم تقم بإضافة رابط سيرتك الذاتية أو حساباتك الأكاديمية بعد." : "No CV or academic links connected yet."}
                    </p>
                    <div className="flex justify-center pt-1">
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-[11px] bg-card border border-primary/30 hover:bg-primary/15 text-primary px-3 py-1 rounded-full font-medium transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{ar ? "إضافة وتعديل روابط السيرة والشهادات" : "Add & Edit CV / Academic Links"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. STUDENT PERSONA: DETAILED SKILLS */}
            {(extras.detailedSkills.length > 0 && !hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  {ar ? "المهارات المتقدمة ومستوى الإتقان" : "Detailed Skills & Proficiency"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extras.detailedSkills.map((sk, idx) => {
                    const cat = SKILL_CATEGORY_META[sk.category];
                    return (
                      <div key={idx} className="bg-background/50 border border-border/70 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">{cat?.emoji || "⚡"}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground truncate">{sk.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{ar ? cat?.labelAr : cat?.labelEn}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center flex-shrink-0" title={`Level: ${sk.level} / 5`}>
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1.5 w-3 rounded-full transition-colors ${lvl <= sk.level ? "bg-primary" : "bg-muted/70"}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. STUDENT PERSONA: WORK & EXPERIENCE AS SECONDARY */}
            {(expLabel && !hideProfile) && (
              <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {ar ? "سنوات الخبرة العملية" : "Work Experience"}
                </h3>
                <div className="bg-background/50 border border-border/70 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {ar ? expLabel.labelAr : expLabel.labelEn}
                  </span>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-semibold">
                    {ar ? "تم التحقق" : "Verified"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* === SECTION 6: GENERAL SKILLS TAGS === */}
        {(profile.skills.length > 0 && !hideProfile) && (
          <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2">
            <p className="text-xs text-primary font-bold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> {t("skills")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map(s => (
                <span key={s} className="text-xs bg-card border border-primary/30 text-foreground font-medium px-2.5 py-1 rounded-full">
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

const Section = ({ title, children, alignClass }: { title: string; children: React.ReactNode; alignClass: string }) => (
  <div className="bg-card-gradient border border-border rounded-3xl p-5 space-y-4 shadow-sm">
    <h3 className={`font-display text-base text-primary font-bold ${alignClass}`}>{title}</h3>
    {children}
  </div>
);

const Field = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 font-semibold">
      <Icon className="w-3.5 h-3.5 text-primary" /> {label}
    </Label>
    {children}
  </div>
);
