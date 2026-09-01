import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users,
  Sparkles,
  Award,
  GraduationCap,
  Calendar,
  Globe2,
  CheckCircle2,
  Building,
  UserCheck,
  Flame,
} from "lucide-react";
import type {
  NotableAlumniRecord,
  StudentPresenceData,
  ActiveScholarshipProgram,
} from "@/lib/globalUniversities";

interface LuxeAlumniPresenceCardProps {
  activeScholarship?: ActiveScholarshipProgram;
  studentPresence?: StudentPresenceData;
  notableAlumni?: NotableAlumniRecord[];
  universityName: string;
}

export const LuxeAlumniPresenceCard: React.FC<LuxeAlumniPresenceCardProps> = ({
  activeScholarship,
  studentPresence,
  notableAlumni,
  universityName,
}) => {
  const { lang, dir } = useLanguage();
  const ar = lang === "ar";
  const isRtl = dir === "rtl";

  const getDensityBadge = (density: StudentPresenceData["communityDensity"]) => {
    switch (density) {
      case "very_high":
        return {
          label: ar ? "كثافة طلابية عربية مرتفعة جداً" : "Very High Arab Student Presence",
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
        };
      case "high":
        return {
          label: ar ? "جالية طلابية نشطة" : "High Student Presence",
          color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          dot: "bg-blue-400",
        };
      case "medium":
        return {
          label: ar ? "تواجد طلابي متزايد" : "Moderate Student Presence",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          dot: "bg-amber-400",
        };
      default:
        return {
          label: ar ? "مجتمع طلابي واعد" : "Emerging Community",
          color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          dot: "bg-purple-400",
        };
    }
  };

  const getConnectionBadge = (type: NotableAlumniRecord["connectionType"]) => {
    switch (type) {
      case "classmate_same_major":
        return {
          label: ar ? "زمالة دراسية في نفس التخصص والفترة" : "Classmates in Same Major & Period",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: UserCheck,
        };
      case "contemporary_peer":
        return {
          label: ar ? "معاصرة أكاديمية في نفس الفترة" : "Contemporary Academic Peers",
          color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          icon: Sparkles,
        };
      default:
        return {
          label: ar ? "خريجو نفس الصرح الأكاديمي" : "Alumni of the Same Institution",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: Building,
        };
    }
  };

  const getFundingBadge = (level: ActiveScholarshipProgram["fundingLevel"]) => {
    switch (level) {
      case "full_100":
        return {
          label: ar ? "منحة كاملة 100% (إعفاء + راتب/سكن)" : "100% Full Scholarship",
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        };
      case "research_assistantship":
        return {
          label: ar ? "مساعدات بحثية وتدريسية (RA / TA)" : "Research/Teaching Assistantship",
          color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
        };
      case "partial_50_80":
        return {
          label: ar ? "منحة تفوق جزئية (50% - 80%)" : "Partial Merit Award (50%-80%)",
          color: "bg-amber-500/20 text-amber-400 border-amber-500/40",
        };
      default:
        return {
          label: ar ? "منح تميز واستحقاق دورية" : "Periodic Merit Grants",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
        };
    }
  };

  const hasAnyData = activeScholarship || studentPresence || (notableAlumni && notableAlumni.length > 0);
  if (!hasAnyData) return null;

  return (
    <div className="space-y-3 pt-2" dir={dir}>
      {/* 1. Direct University Active Scholarship Banner */}
      {activeScholarship && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  {ar ? "منحة الجامعة النشطة والمستمرة" : "Active Direct University Scholarship"}
                </p>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {ar ? activeScholarship.name : activeScholarship.nameEn}
                </p>
              </div>
            </div>

            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${getFundingBadge(activeScholarship.fundingLevel).color}`}>
              {getFundingBadge(activeScholarship.fundingLevel).label}
            </span>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed ps-10">
            {ar ? activeScholarship.coverageSummary : activeScholarship.coverageSummaryEn}
          </p>
        </div>
      )}

      {/* 2. Student & Community Presence */}
      {studentPresence && (
        <div className="rounded-2xl border border-primary/20 bg-background/60 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {ar ? "حالة التواجد الطلابي والجالية" : "Student Community & Arab Presence"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {studentPresence.studentUnionOrClub
                    ? (ar ? studentPresence.studentUnionOrClub : studentPresence.studentUnionOrClubEn)
                    : (ar ? "نوادي واتحادات طلابية مساندة" : "Active Student Unions & Support")}
                </p>
              </div>
            </div>

            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${getDensityBadge(studentPresence.communityDensity).color}`}>
              <span className={`w-2 h-2 rounded-full ${getDensityBadge(studentPresence.communityDensity).dot}`} />
              {getDensityBadge(studentPresence.communityDensity).label}
            </span>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed">
            {ar ? studentPresence.presenceNote : studentPresence.presenceNoteEn}
          </p>

          {studentPresence.topNationalities && studentPresence.topNationalities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 me-1">
                <Globe2 className="w-3 h-3 text-primary" />
                {ar ? "أبرز الجنسيات الطلابية:" : "Top Student Nationalities:"}
              </span>
              {studentPresence.topNationalities.map((nat, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium"
                >
                  {nat}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Notable Alumni & Global Peers Spotlight */}
      {notableAlumni && notableAlumni.length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/10 p-4 space-y-3.5 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>{ar ? "خريجون رواد وقرناء عالميون" : "Notable Alumni & Global Peers Spotlight"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                  {notableAlumni.length}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {ar
                  ? `شخصيات رائدة من العالم العربي تخرجت من ${universityName} إلى جانب قرناء عالميين`
                  : `Pioneers who graduated from ${universityName} alongside prominent global peers`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {notableAlumni.map((item, idx) => {
              const badgeInfo = getConnectionBadge(item.connectionType);
              const BadgeIcon = badgeInfo.icon;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 bg-card/80 p-3.5 space-y-3 hover:border-amber-500/40 transition-colors shadow-sm"
                >
                  {/* Connection Header Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${badgeInfo.color}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badgeInfo.label}</span>
                    </span>

                    {(item.entryYear || item.gradYear) && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span>
                          {item.entryYear ? `${item.entryYear} - ` : ""}
                          {item.gradYear ? `${item.gradYear}` : ""}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Dual Grid: Local Pioneer vs Global Peer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Pioneer From Region/Country */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {ar ? `رائد من ${item.pioneerCountry}` : `Pioneer from ${item.pioneerCountryEn}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.gradYear ? (ar ? `دفعة ${item.gradYear}` : `Class of ${item.gradYear}`) : ""}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-foreground">
                        {ar ? item.pioneerName : item.pioneerNameEn}
                      </p>
                      <p className="text-[11px] text-primary/90 font-medium">
                        {ar ? item.major : item.majorEn}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {ar ? item.roleOrAchievement : item.roleOrAchievementEn}
                      </p>
                    </div>

                    {/* Global Peer */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {ar ? "شخصية عالمية مقترنة" : "Prominent Global Peer"}
                        </span>
                        {item.globalPeerGradYear && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {ar ? `تخرج ${item.globalPeerGradYear}` : `Graduated ${item.globalPeerGradYear}`}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-foreground">
                        {ar ? item.globalPeerName : item.globalPeerNameEn}
                      </p>
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        {ar ? item.globalPeerRole : item.globalPeerRoleEn}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.connectionNote
                          ? (ar ? item.connectionNote : item.connectionNoteEn)
                          : (ar
                              ? "دراسة مشتركة وتأثير عالمي من ذات البيئة الأكاديمية"
                              : "Shared academic heritage and prominent global impact")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
