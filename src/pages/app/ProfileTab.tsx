import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, X, GraduationCap, MapPin, Mail, Phone, User as UserIcon,
  Edit3, Sparkles, Check, Camera, Loader2, Link as LinkIcon, Trash2,
  Star, Briefcase, ChevronDown, Maximize2, Compass, HelpCircle, CheckCircle2,
  ExternalLink, Award, Globe, BookOpen, Clock, Building
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  type LinkType, type SkillEntry,
} from "@/lib/profileExtras";
import { PHONE_COUNTRIES, findPhoneCountry, validatePhone } from "@/lib/phoneCountries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

export const ProfileTab = () => {
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
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [geoHelpOpen, setGeoHelpOpen] = useState(false);

  // Load extras from storage
  useEffect(() => {
    profileExtras.load().then((v) => {
      setExtras(v);
      setExtrasDraft(v);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (isGuest) {
      const p = guestStorage.get<ProfileState>("profile");
      if (p) { setProfile(p); setDraft(p); }
      setLoading(false);
      return;
    }
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p: ProfileState = {
            full_name: data.full_name ?? "", bio: data.bio ?? "",
            education: data.education ?? "", location: data.location ?? "",
            avatar_url: data.avatar_url ?? "",
            phone: (data as any).phone ?? "",
            skills: data.skills ?? [], interests: (data as any).interests ?? [],
          };
          setProfile(p); setDraft(p);
        }
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
    if (!file.type.startsWith("image/")) { toast.error(isRtl ? "الرجاء اختيار صورة" : "Please select an image"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error(isRtl ? "الصورة أكبر من 4 ميجابايت" : "Image size exceeds 4MB"); return; }
    setUploading(true);
    if (isGuest) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const next = { ...draft, avatar_url: dataUrl };
        setDraft(next);
        setProfile(next);
        guestStorage.set("profile", next);
        setUploading(false);
        toast.success(isRtl ? "تم تحديث الصورة بنجاح" : "Avatar updated");
      };
      reader.readAsDataURL(file);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const next = { ...draft, avatar_url: dataUrl };
        setDraft(next);
        setProfile(next);
        await supabase.from("profiles").update({ avatar_url: dataUrl }).eq("id", user.id);
        setUploading(false);
        toast.success(isRtl ? "تم حفظ الصورة" : "Avatar saved");
      };
      reader.readAsDataURL(file);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const nextDraft = { ...draft, avatar_url: pub.publicUrl };
    setDraft(nextDraft);
    setProfile(nextDraft);
    await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    setUploading(false);
    toast.success(isRtl ? "تم تحديث الصورة" : "Avatar updated");
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
    if (isGuest) {
      guestStorage.set("profile", nextDraft);
      setSaving(false);
      setProfile(nextDraft);
      setEditing(false);
      toast.success(t("saved2"));
      return;
    }
    const { error } = await supabase.from("profiles").update(nextDraft).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(t("saveFailed")); return; }
    setProfile(nextDraft);
    setEditing(false);
    toast.success(t("saved2"));
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

  const addLink = (type: LinkType) => {
    setExtrasDraft(d => ({
      ...d,
      links: [...d.links, { id: crypto.randomUUID(), type, url: "" }],
    }));
  };

  const updateLink = (id: string, url: string) => {
    setExtrasDraft(d => ({ ...d, links: d.links.map(l => l.id === id ? { ...l, url } : l) }));
  };

  const removeLink = (id: string) => {
    setExtrasDraft(d => ({ ...d, links: d.links.filter(l => l.id !== id) }));
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
        {/* === Panoramic Gold Dashboard Hero with Integrated Squircle Avatar & Completion Bar === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-luxe"
        >
          {/* Panoramic gold backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.25),transparent_60%),linear-gradient(180deg,hsl(var(--primary)/0.08),hsl(var(--card)))]" />
          <div className="absolute -top-20 -right-16 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gold-gradient opacity-70" />

          {/* Edit Button */}
          <button
            onClick={startEdit}
            className="absolute top-4 start-4 z-10 flex items-center gap-1.5 text-xs bg-background/70 backdrop-blur-md border border-primary/35 hover:bg-primary/20 text-primary px-3.5 py-1.5 rounded-full font-bold shadow-gold transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t("edit")}</span>
          </button>

          <div className="relative px-6 pt-10 pb-6 flex flex-col items-center text-center">
            {/* Integrated Squircle Avatar & Integrated Completion Bar */}
            <div className="relative group flex flex-col items-center">
              {/* Outer Golden Aura Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-[hsl(var(--primary))] via-[hsl(var(--primary-glow))] to-[hsl(var(--primary-deep))] rounded-[30px] blur-md opacity-60 group-hover:opacity-90 transition-opacity" />

              {/* Squircle Image Container */}
              <div
                onClick={() => setPreviewOpen(true)}
                className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[26px] bg-card overflow-hidden border-2 border-primary/60 shadow-[0_10px_30px_-5px_hsl(var(--primary)/0.4)] cursor-pointer flex items-center justify-center transition-all duration-300 group-hover:scale-[1.02]"
                title={ar ? "اضغط للمعاينة بالحجم الكامل" : "Click to preview full size"}
              >
                {profile.avatar_url && !hideProfile ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gold-gradient flex flex-col items-center justify-center font-display text-4xl text-primary-foreground font-bold">
                    {hideProfile ? "•" : initial}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                </div>

                {/* Integrated Progress Pill AT BOTTOM OF AVATAR SQUARE */}
                <div className="absolute inset-x-2 bottom-2 z-10 bg-black/75 backdrop-blur-md rounded-xl p-1 px-2 border border-primary/40 flex items-center gap-1.5 shadow-sm">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full bg-gold-gradient rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-primary font-mono leading-none">
                    {completion}%
                  </span>
                </div>
              </div>

              {/* Smaller, refined camera button on the squircle corner */}
              <label
                className="absolute -bottom-1 -end-1 w-8 h-8 rounded-xl bg-gold-gradient border-2 border-background flex items-center justify-center shadow-gold cursor-pointer hover:scale-110 active:scale-95 transition-transform z-20"
                title={ar ? "تغيير الصورة الشخصية" : "Change photo"}
              >
                {uploading
                  ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-primary-foreground" />}
                <input type="file" accept="image/*" className="hidden"
                  onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>

            {/* Profile Name & Primary Identity */}
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gold-gradient mt-4 truncate max-w-full">
              {hideProfile ? "•••••" : (profile.full_name || t("yourFullName"))}
            </h2>

            {extras.major && !hideProfile && (
              <p className="text-xs sm:text-sm font-bold text-primary mt-1">
                {extras.major}
              </p>
            )}

            <p className="text-xs sm:text-sm font-medium text-foreground/80 truncate max-w-full flex items-center gap-1.5 mt-1.5 justify-center" dir="ltr">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>
                {hideProfile ? "•••••@•••••" : (user?.email || t("guestUserLabel"))}
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2.5 text-xs text-muted-foreground">
              {profile.location && !hideProfile && (
                <span className="inline-flex items-center gap-1 bg-background/50 border border-border/80 px-2.5 py-1 rounded-full text-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.location}
                </span>
              )}
              {profile.phone && !hideProfile && (
                <span className="inline-flex items-center gap-1 bg-background/50 border border-border/80 px-2.5 py-1 rounded-full text-foreground font-medium" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {profile.phone}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Modal: Full Image Preview */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-md bg-card/95 border border-primary/40 backdrop-blur-2xl p-4 rounded-3xl text-center">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <h3 className="font-display text-base text-gold-gradient font-bold">
                {ar ? "معاينة الصورة الشخصية" : "Profile Picture Preview"}
              </h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-muted-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 flex justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-primary/60 shadow-2xl bg-black/40 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar-preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gold-gradient flex items-center justify-center font-display text-7xl text-primary-foreground font-bold">
                    {initial}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold cursor-pointer hover:opacity-90 shadow-gold">
                <Camera className="w-3.5 h-3.5" />
                {ar ? "تغيير الصورة" : "Change Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              <Button variant="ghostGold" size="sm" onClick={() => setPreviewOpen(false)}>
                {ar ? "إغلاق" : "Close"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* === SECTION 1: BIO & SUMMARY === */}
        {profile.bio && !hideProfile && (
          <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-1.5">
            <p className="text-xs text-primary font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> {t("bio")}
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* === SECTION 2: ACADEMIC QUALIFICATIONS & EDUCATION === */}
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

        {/* === SECTION 3: WORK & EXPERIENCE === */}
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

        {/* === SECTION 4: PROFESSIONAL & PORTFOLIO LINKS === */}
        {(extras.links.length > 0 && !hideProfile) && (
          <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              {ar ? "الروابط المهنية ومعرض الأعمال" : "Professional & Portfolio Links"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {extras.links.map((link) => {
                const meta = LINK_META[link.type] || LINK_META.other;
                return (
                  <a
                    key={link.id}
                    href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/80 hover:border-primary/50 text-xs transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{meta.emoji}</span>
                      <span className="font-bold text-foreground truncate">
                        {ar ? meta.labelAr : meta.labelEn}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* === SECTION 5: DETAILED SKILLS WITH PROFICIENCY === */}
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
                    <div className="flex items-center gap-2">
                      <span>{cat?.emoji || "⚡"}</span>
                      <div>
                        <p className="font-bold text-xs text-foreground">{sk.name}</p>
                        <p className="text-[10px] text-muted-foreground">{ar ? cat?.labelAr : cat?.labelEn}</p>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= sk.level ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

        {/* === SECTION 7: INTERESTS & FIELDS === */}
        {(profile.interests.length > 0 && !hideProfile) && (
          <div className="bg-card-gradient border border-border rounded-2xl p-4 space-y-2">
            <p className="text-xs text-primary font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {t("interests")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map(i => (
                <span key={i} className="text-xs bg-gold-gradient text-primary-foreground font-medium px-2.5 py-1 rounded-full shadow-gold">
                  {getInterestLabel(i, lang)}
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
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 ml-1" />}
            {t("save")}
          </Button>
        </div>
      </div>

      {/* 1. PERSONAL INFORMATION */}
      <Section title={ar ? "المعلومات الشخصية وبيانات التواصل" : "Personal Information & Contact"} alignClass={alignClass}>
        <Field icon={UserIcon} label={t("fullName")}>
          <Input
            value={draft.full_name}
            onChange={e => setDraft({ ...draft, full_name: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass}`}
            placeholder={t("yourNameHolder")}
          />
        </Field>

        {/* Location with One-Tap GPS */}
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
                <HelpCircle className="w-3 h-3" />
                <span>{ar ? "موقعي غير دقيق؟" : "Wrong location?"}</span>
              </button>
            </div>
          </div>
        </Field>

        {/* Phone with Country Code Selector */}
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
          </div>
          {phoneLocal && !validatePhone(extrasDraft.phoneCountryIso, phoneLocal) && (
            <p className="text-[10px] text-destructive mt-1">⚠️ {ar ? "رقم غير صالح لهذه الدولة" : "Invalid phone number for this country"}</p>
          )}
        </Field>

        {/* Bio */}
        <Field icon={BookOpen} label={t("bio")}>
          <Textarea
            value={draft.bio}
            onChange={e => setDraft({ ...draft, bio: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass} min-h-24`}
            placeholder={t("bioHolder")}
          />
        </Field>
      </Section>

      {/* 2. ACADEMIC QUALIFICATIONS & DEGREES */}
      <Section title={ar ? "المؤهلات الأكاديمية والتعليم" : "Academic Background & Degrees"} alignClass={alignClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <Field icon={Building} label={ar ? "الجامعة / الكلية" : "University / College"}>
            <Input
              value={extrasDraft.university}
              onChange={e => setExtrasDraft(d => ({ ...d, university: e.target.value }))}
              placeholder={ar ? "اسم الجامعة أو المعهد" : "University name"}
              className="bg-input border-gold/30"
            />
          </Field>

          <Field icon={BookOpen} label={ar ? "التخصص أو الشعبة" : "Field of Study / Major"}>
            <Input
              value={extrasDraft.major}
              onChange={e => setExtrasDraft(d => ({ ...d, major: e.target.value }))}
              placeholder={ar ? "مثل: هندسة برمجيات، طب، إدارة أعمال" : "e.g. Computer Science, Medicine"}
              className="bg-input border-gold/30"
            />
          </Field>

          <Field icon={Award} label={ar ? "المعدل التراكمي أو النسبة المئوية" : "GPA / Grade Percentage"}>
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

        <Field icon={GraduationCap} label={t("eduLabel")}>
          <Textarea
            value={draft.education}
            onChange={e => setDraft({ ...draft, education: e.target.value })}
            className={`bg-input border-gold/30 ${alignClass} min-h-20`}
            placeholder={t("eduHolder")}
          />
        </Field>
      </Section>

      {/* 3. WORK EXPERIENCE */}
      <Section title={ar ? "الخبرات العملية والمهنية" : "Work Experience"} alignClass={alignClass}>
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

      {/* 4. PROFESSIONAL & PORTFOLIO LINKS */}
      <Section title={ar ? "الروابط المهنية ومعرض الأعمال (Portfolio / Links)" : "Professional Links & Portfolio"} alignClass={alignClass}>
        <p className="text-xs text-muted-foreground">
          {ar ? "أضف روابط حساباتك وسيرتك الذاتية وموقعك الشخصي لتقوية ملفك أمام لجان المنح والشركات:" : "Add your portfolio, LinkedIn, GitHub, or Resume link to boost your profile:"}
        </p>

        <div className="space-y-2.5">
          {extrasDraft.links.map((link) => {
            const meta = LINK_META[link.type] || LINK_META.other;
            return (
              <div key={link.id} className="flex gap-2 items-center bg-background/50 p-2.5 rounded-2xl border border-border/80">
                <span className="text-lg px-1">{meta.emoji}</span>
                <span className="text-xs font-bold text-primary w-24 sm:w-32 truncate flex-shrink-0">
                  {ar ? meta.labelAr : meta.labelEn}
                </span>
                <Input
                  value={link.url}
                  onChange={e => updateLink(link.id, e.target.value)}
                  placeholder={meta.placeholder}
                  className="bg-input border-gold/30 flex-1 text-xs"
                  dir="ltr"
                />
                <Button
                  variant="ghostGold"
                  size="sm"
                  onClick={() => removeLink(link.id)}
                  className="text-destructive h-9 px-2.5 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add Link Dropdown */}
        <div className="pt-2">
          <Select onValueChange={(val: LinkType) => addLink(val)}>
            <SelectTrigger className="w-full sm:w-56 bg-card border-primary/40 text-primary font-bold text-xs shadow-gold">
              <Plus className="w-4 h-4 mr-1" />
              <span>{ar ? "+ إضافة رابط جديد..." : "+ Add new link..."}</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LINK_META).map(([key, m]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span>{m.emoji}</span>
                    <span>{ar ? m.labelAr : m.labelEn}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* 5. DETAILED SKILLS WITH RATINGS */}
      <Section title={ar ? "المهارات المتقدمة ومستوى الإتقان (1 - 5 نجوم)" : "Detailed Skills & Proficiency"} alignClass={alignClass}>
        <div className="space-y-2.5">
          {extrasDraft.detailedSkills.map((sk, idx) => (
            <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-background/50 p-2.5 rounded-2xl border border-border/80">
              <Input
                value={sk.name}
                onChange={e => updateDetailedSkill(idx, { name: e.target.value })}
                placeholder={ar ? "اسم المهارة (مثل: Python, Figma, الإنجليزية...)" : "Skill name (e.g. Python, Figma, English...)"}
                className="bg-input border-gold/30 flex-1 text-xs"
              />
              <Select
                value={sk.category}
                onValueChange={(val: any) => updateDetailedSkill(idx, { category: val })}
              >
                <SelectTrigger className="w-[140px] bg-input border-gold/30 text-xs">
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

              {/* Star rating selector */}
              <div className="flex gap-1 items-center px-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateDetailedSkill(idx, { level: star })}
                    className="p-0.5 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${star <= sk.level ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  </button>
                ))}
              </div>

              <Button
                variant="ghostGold"
                size="sm"
                onClick={() => removeDetailedSkill(idx)}
                className="text-destructive h-9 px-2 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{meta.emoji} {ar ? `إضافة مهارة (${meta.labelAr.slice(0, 12)})` : `Add (${meta.labelEn.slice(0, 12)})`}</span>
            </Button>
          ))}
        </div>
      </Section>

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
              <Plus className="w-4 h-4 ml-1" /> {t("add")}
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
          {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
          {t("saveChanges")}
        </Button>
      </div>

      {/* Accuracy Guide Dialog */}
      <Dialog open={geoHelpOpen} onOpenChange={setGeoHelpOpen}>
        <DialogContent className="max-w-md bg-card/95 border border-primary/40 backdrop-blur-2xl p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-gold-gradient font-bold text-base pb-2 border-b border-primary/20">
            <Compass className="w-5 h-5 text-primary" />
            <h3>{ar ? "كيف تضمن دقة تحديد موقعك؟" : "How to ensure accurate location?"}</h3>
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
