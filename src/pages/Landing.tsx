import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Scholarship } from "@/lib/mockData";
import { JOBS, type Job } from "@/lib/jobsData";
import { dynamicStore } from "@/lib/dynamicStore";
import { AIAdvisor } from "@/components/foras/AIAdvisor";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingArabHubSection } from "@/components/landing/LandingArabHubSection";
import { LandingScholarshipsSection } from "@/components/landing/LandingScholarshipsSection";
import { LandingJobsSection } from "@/components/landing/LandingJobsSection";
import { LandingPillarsSection } from "@/components/landing/LandingPillarsSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => {
  const { t, dir, lang, toggleLang, setLang } = useLanguage();
  const isRtl = dir === "rtl";
  const nav = useNavigate();

  // Dynamic live scholarships synced with dynamicStore
  const [featuredScholarships, setFeaturedScholarships] = useState<Scholarship[]>([]);
  // Dynamic live jobs synced with dynamicStore and jobsData
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  const loadScholarships = () => {
    const all = dynamicStore.getScholarships();
    const sorted = [...all].sort((a, b) => {
      const isCustomA = (typeof a.id === "string" && a.id.startsWith("sch_")) || (a as any).isCustom;
      const isCustomB = (typeof b.id === "string" && b.id.startsWith("sch_")) || (b as any).isCustom;
      if (isCustomA && !isCustomB) return -1;
      if (!isCustomA && isCustomB) return 1;
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return (b.match_score || 0) - (a.match_score || 0);
    });
    setFeaturedScholarships(sorted.slice(0, 4));
  };

  const loadJobs = () => {
    const custom = dynamicStore.getJobs();
    const convertedCustom: Job[] = custom.map((c) => ({
      id: c.id,
      title: c.title_ar || "فرصة عمل عن بعد",
      titleEn: c.title_en || "Remote Freelance Opportunity",
      company: c.company || "Global Platform",
      emoji: "💼",
      type: "عمل عن بعد / مشروع حر",
      typeEn: "Remote / Freelance",
      category: "programming" as any,
      salary: { min: 500, max: 2500, currency: "USD", period: "project" as const, average: c.salary || "$1,500+" },
      rating: { score: 4.9, totalReviews: 95, trustLevel: "موثوق", trustLevelEn: "Verified" },
      description: c.description_ar || "فرصة عمل حر مميزة وموثوقة.",
      descriptionEn: c.description_en || "Verified freelance opportunity for remote professionals.",
      skills: c.skills || ["مهارات مهنية", "تواصل"],
      skillsEn: ["Professional Skills", "Communication"],
      availability: { global: true, countries: ["كل الدول"], restrictedCountries: [] },
      withdrawal: { minAmount: 50, currency: "USD", methods: [] },
      requirements: ["مهارات تقنية أو كتابية", "التزام بمواعيد التسليم"],
      registrationGuide: { steps: [] },
      contact: { website: c.apply_url },
    }));
    const customIds = new Set(convertedCustom.map((j) => j.id));
    const all = [...convertedCustom, ...JOBS.filter((j) => !customIds.has(j.id))];
    setFeaturedJobs(all.slice(0, 4) as Job[]);
  };

  useEffect(() => {
    loadScholarships();
    loadJobs();

    // Background sync with central server database to pull newly published opportunities
    dynamicStore.syncWithServer().then(() => {
      loadScholarships();
      loadJobs();
    }).catch(() => {});

    const handleDataUpdate = () => {
      loadScholarships();
      loadJobs();
    };
    window.addEventListener("foras:data-updated", handleDataUpdate);
    window.addEventListener("storage", handleDataUpdate);
    return () => {
      window.removeEventListener("foras:data-updated", handleDataUpdate);
      window.removeEventListener("storage", handleDataUpdate);
    };
  }, []);

  const goApp = (tab = "scholarships", params?: Record<string, string>) => {
    setLang(lang);
    const search = new URLSearchParams({ tab });
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) search.set(k, v);
      });
    }
    nav(`/app?${search.toString()}`);
  };

  const bodyFont = lang === "ar" ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', system-ui, sans-serif";

  return (
    <div dir={dir} className="relative min-h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: bodyFont }}>
      {/* Ambient gold glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[350px] h-[350px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      {/* Header */}
      <LandingHeader lang={lang} toggleLang={toggleLang} />

      {/* Hero Section */}
      <LandingHeroSection
        t={t}
        isRtl={isRtl}
        onPrimaryCta={() => goApp("scholarships")}
      />

      {/* Curiosity Section: ركن الجامعات والمنح المعتمدة */}
      <LandingArabHubSection
        t={t}
        isRtl={isRtl}
        lang={lang}
        onCheckGpa={() => goApp("arabUnis")}
      />

      {/* Synchronized Live Scholarships Preview */}
      <LandingScholarshipsSection
        featuredScholarships={featuredScholarships}
        t={t}
        isRtl={isRtl}
        lang={lang}
        onSelectScholarship={(id) => goApp("scholarships", { scholarship: id })}
        onViewMode={(view) => goApp("scholarships", { view })}
        onViewAll={() => goApp("scholarships")}
      />

      {/* Live Freelance & Remote Work Hub */}
      <LandingJobsSection
        featuredJobs={featuredJobs}
        t={t}
        isRtl={isRtl}
        lang={lang}
        onSelectJob={(id) => goApp("jobs", { job: id })}
        onViewAll={() => goApp("jobs")}
      />

      {/* The 3 Pillars of Excellence */}
      <LandingPillarsSection
        t={t}
        isRtl={isRtl}
        lang={lang}
        onSelectPillar={(tab) => goApp(tab)}
      />

      {/* Footer */}
      <LandingFooter t={t} />

      {/* Floating AI Advisor accessible from landing page */}
      <AIAdvisor />
    </div>
  );
};

export default Landing;
