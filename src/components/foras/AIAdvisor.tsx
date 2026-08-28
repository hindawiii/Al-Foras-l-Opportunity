import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  Sparkles, X, Send, Loader2, Trash2, Bot, GraduationCap, Calculator,
  University, FileText, Mic, MicOff, Volume2, VolumeX, Upload, Download,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Star, Search, ShieldCheck,
  Maximize2, Minimize2
} from "lucide-react";
import { chatStorage, type ChatMessage } from "@/lib/aiChatStorage";
import { guestStorage } from "@/lib/guestStorage";
import { generateLocalAIResponse } from "@/lib/aiLocalEngine";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { exportCvToPdf, type CvExportData } from "@/lib/cvPdfGenerator";
import {
  extractTextFromFile, analyzeCvText, analyzeEssayDraft,
  type AtsAnalysisResult, type EssayAnalysisResult
} from "@/lib/aiCvReviewer";
import { SCHOLARSHIPS, type Scholarship } from "@/lib/mockData";
import { applicationsStore } from "@/lib/applicationsStorage";

const uid = () => Math.random().toString(36).slice(2, 10);

type AdvisorMode = "chat" | "voice" | "cv" | "essay";

const QUICK_ACTIONS = [
  {
    icon: GraduationCap,
    labelAr: "ما هي المنح المناسبة لي؟",
    labelEn: "What scholarships fit me?",
    promptAr: "بناءً على ملفي الشخصي، ما هي أفضل 3 منح دراسية مناسبة لي حاليًا؟ اذكر الاسم، الدولة، والمتطلبات الأساسية.",
    promptEn: "Based on my profile, what are the best 3 scholarships for me right now? List name, country, and key requirements."
  },
  {
    icon: Calculator,
    labelAr: "احسب نتيجتي المتوقعة",
    labelEn: "Calculate expected GPA/Score",
    promptAr: "أريد أن أحسب نتيجتي وأعرف تقديري. اسألني عن درجاتي في المواد الأساسية ثم احسب النسبة والتقدير.",
    promptEn: "I want to calculate my score and know my grade. Ask me for my marks in core subjects then calculate the percentage and grade."
  },
  {
    icon: University,
    labelAr: "ما الجامعات المناسبة لي؟",
    labelEn: "What universities fit me?",
    promptAr: "ما هي الجامعات السودانية والعربية المناسبة لملفي؟ صنّفها إلى: مضمونة القبول، تنافسية، وطموحة.",
    promptEn: "Which Sudanese and Arab universities match my profile? Categorize them into: safe, target, and reach."
  },
  {
    icon: FileText,
    labelAr: "كيف أُحسّن ملفي؟",
    labelEn: "How to improve my profile?",
    promptAr: "قيّم ملفي الشخصي واذكر نقاط القوة والضعف واقتراحات محددة للتحسين.",
    promptEn: "Evaluate my personal profile, list strengths, weaknesses, and specific tips for improvement."
  },
];

const FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`
  : "";
const ANON = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const AIAdvisor = () => {
  const { user, isGuest } = useAuth();
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mode, setMode] = useState<AdvisorMode>("chat");
  const [showTip, setShowTip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(true);

  // Global event listener for opening AI advisor directly into specific mode
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: AdvisorMode }>;
      setOpen(true);
      if (custom.detail?.mode) {
        setMode(custom.detail.mode);
      }
    };
    window.addEventListener("open-ai-advisor", handler as EventListener);
    return () => window.removeEventListener("open-ai-advisor", handler as EventListener);
  }, []);

  // Voice Interview Mode States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const speechRecognitionRef = useRef<any>(null);

  // CV Review & ATS States
  const [cvText, setCvText] = useState("");
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [isEvaluatingCv, setIsEvaluatingCv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Essay / SOP Checker States
  const [essayText, setEssayText] = useState("");
  const [essayResult, setEssayResult] = useState<EssayAnalysisResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lastScroll = useRef(0);
  const sendRef = useRef<(text?: string) => void>(() => {});

  // Load chat messages & initial tips
  useEffect(() => {
    (async () => {
      const m = await chatStorage.loadMessages();
      setMessages(m);
      const pos = await chatStorage.loadFabPosition();
      if (pos) { x.set(pos.x); y.set(pos.y); }
    })();
    const tipTimer = window.setTimeout(() => setShowTip(true), 1500);
    const hideTip = window.setTimeout(() => setShowTip(false), 6000);
    return () => { window.clearTimeout(tipTimer); window.clearTimeout(hideTip); };
  }, [x, y]);

  // FAB Auto hide on scroll
  useEffect(() => {
    const onScroll = () => {
      const yVal = window.scrollY;
      if (Math.abs(yVal - lastScroll.current) < 8) return;
      setVisible(yVal < lastScroll.current || yVal < 40);
      lastScroll.current = yVal;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    chatStorage.saveMessages(messages);
  }, [messages]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === "ar" ? "ar-SA" : "en-US";

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setSpeechTranscript(transcript);
        if (event.results[0].isFinal) {
          setIsListening(false);
          sendRef.current(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      toast.error(isRtl ? "التعرف الصوتي غير مدعوم في متصفحك الحالي" : "Speech recognition is not supported in this browser");
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechTranscript("");
      speechRecognitionRef.current.lang = lang === "ar" ? "ar-SA" : "en-US";
      speechRecognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (voiceMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, "").slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const getProfile = () => {
    if (isGuest) return guestStorage.get("profile") ?? null;
    return null;
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content, createdAt: Date.now() };
    const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: "", createdAt: Date.now() };
    const nextMsgs = [...messages, userMsg, assistantMsg];
    setMessages(nextMsgs);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!FUNCTION_URL || !ANON) {
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile());
        let currentText = "";
        const words = reply.split(" ");
        for (let i = 0; i < words.length; i++) {
          if (controller.signal.aborted) break;
          currentText += (i === 0 ? "" : " ") + words[i];
          setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: currentText } : m));
          await new Promise(r => setTimeout(r, 18));
        }
        if (mode === "voice") speakText(reply);
        setBusy(false);
        return;
      }

      const payload = {
        messages: nextMsgs
          .filter(m => m.id !== assistantMsg.id && m.content.trim())
          .map(m => ({ role: m.role, content: m.content })),
        profile: getProfile(),
      };

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON}`,
          "apikey": ANON,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile());
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m));
        if (mode === "voice") speakText(reply);
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length) {
              acc += delta;
              setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: acc } : m));
            }
          } catch { /* partial chunk ignore */ }
        }
      }

      if (!acc.trim()) {
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile());
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m));
        if (mode === "voice") speakText(reply);
      } else if (mode === "voice") {
        speakText(acc);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile());
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m));
        if (mode === "voice") speakText(reply);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  useEffect(() => {
    sendRef.current = send;
  });

  const clearChat = async () => {
    await chatStorage.clearMessages();
    setMessages([]);
  };

  // CV File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEvaluatingCv(true);
    toast.info(isRtl ? "جاري قراءة وتحليل ملف السيرة الذاتية..." : "Reading and analyzing CV file...");

    try {
      const extracted = await extractTextFromFile(file);
      setCvText(extracted);
      const result = analyzeCvText(extracted, lang);
      setAtsResult(result);
      setIsEvaluatingCv(false);
      toast.success(isRtl ? `تم التحليل! نقاط ATS: ${result.score}/100` : `Analyzed! ATS Score: ${result.score}/100`);
    } catch (err) {
      console.error("CV file read error:", err);
      setIsEvaluatingCv(false);
      toast.error(isRtl ? "تعذر قراءة محتوى الملف" : "Failed to read file content");
    }
  };

  const handleManualCvAnalyze = () => {
    if (!cvText.trim()) return;
    setIsEvaluatingCv(true);
    const result = analyzeCvText(cvText, lang);
    setAtsResult(result);
    setIsEvaluatingCv(false);
    toast.success(isRtl ? `تم حساب نقاط ATS: ${result.score}/100` : `ATS Score: ${result.score}/100`);
  };

  // PDF Export of Enhanced CV
  const handleDownloadPdf = () => {
    const profile = getProfile() || {};
    const exportData: CvExportData = {
      fullName: profile.full_name || (user?.email?.split("@")[0]) || "Candidate Name",
      email: user?.email || "applicant@foras.app",
      phone: profile.phone || "+249 912345678",
      location: profile.location || "Sudan",
      bio: profile.bio || "Ambitious applicant eager to excel in international academic and professional opportunities.",
      education: profile.education || "Bachelor Degree",
      skills: profile.skills || ["Leadership", "Communication", "Research", "Problem Solving"],
      atsScore: atsResult?.score || 88,
      aiSummary: isRtl
        ? "سيرة ذاتية محسنة ومعتمدة للمنح الدولية وسوق العمل عن بعد مع مطابقة دقيقة لمعايير فلاتر ATS العالمية."
        : "Enhanced ATS-compliant CV structured for competitive international scholarships and remote opportunities.",
    };

    const success = exportCvToPdf(exportData, lang);
    if (success) {
      toast.success(isRtl ? "تم تحميل السيرة الذاتية المحسنة بصيغة PDF بنجاح!" : "Enhanced CV PDF downloaded successfully!");
    } else {
      toast.error(isRtl ? "تعذر إنشاء ملف PDF" : "Failed to generate PDF");
    }
  };

  // Essay / SOP Checker Handler
  const handleEssayAnalyze = () => {
    if (!essayText.trim()) return;
    const result = analyzeEssayDraft(essayText, lang);
    setEssayResult(result);
  };

  const saveOpportunity = (s: Scholarship) => {
    applicationsStore.upsert({
      id: s.id,
      title: s.title,
      type: "scholarship",
      status: "saved",
      deadline: s.deadline,
      url: s.officialUrl || (s as any).sourceUrl,
      notes: "Saved via AI Advisor opportunity match",
    });
    toast.success(isRtl ? "تم حفظ الفرصة في قائمة طلباتي!" : "Opportunity saved to your applications!");
  };

  const dragConstraints = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return { left: -window.innerWidth + 80, right: 10, top: -window.innerHeight + 140, bottom: 10 };
  }, []);

  return (
    <>
      {/* Sleek, Professional Resized Floating Action Button with Pulsing Glow & Hover Note */}
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={dragConstraints}
        style={{ x, y }}
        onDragEnd={() => chatStorage.saveFabPosition({ x: x.get(), y: y.get() })}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6, pointerEvents: visible ? "auto" : "none" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="fixed bottom-24 right-4 z-40 cursor-grab active:cursor-grabbing select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
      >
        <div className="relative flex items-center justify-center">
          {/* Hover / Hint Tooltip Note */}
          <AnimatePresence>
            {(showTip || isHovered) && !open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
                className="absolute bottom-full right-0 mb-3.5 whitespace-nowrap px-3.5 py-2 rounded-2xl bg-gradient-to-br from-[#0c2411] via-[#103017] to-[#1c4824] border border-primary/55 text-foreground text-xs shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.35)] backdrop-blur-xl z-50 pointer-events-none"
                dir={dir}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold p-0.5 flex-shrink-0">
                    <img src="/al-foras-icon.png" alt="logo" className="w-full h-full object-contain drop-shadow" />
                  </div>
                  <div>
                    <p className="font-bold text-gold-gradient text-xs leading-tight">
                      {isRtl ? "مستشار الفُرص والذكاء الاصطناعي ✨" : "AI Opportunities Advisor ✨"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight font-medium">
                      {isRtl ? "فحص السيرة الذاتية • خطابات التقديم • محاكاة المقابلات" : "ATS Resume • SOP Letter • Interview Simulation"}
                    </p>
                  </div>
                </div>
                {/* Pointer Caret */}
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#103017] border-r border-b border-primary/50 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continuous Pulsing Aura & Breathing Rings */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary via-amber-400 to-primary-glow opacity-40 animate-ping pointer-events-none" />
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-primary/80 via-primary-glow/60 to-amber-400/80 blur-md opacity-75 animate-pulse pointer-events-none" />

          {/* Floating Action Button */}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={isRtl ? "مستشار الفرص الذكي" : "AI Advisor"}
            style={{ borderRadius: 18 }}
            className="relative w-14 h-14 bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#B8860B] border-2 border-primary/70 flex items-center justify-center shadow-[0_8px_25px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-6 h-6 text-white drop-shadow" strokeWidth={2.6} />
                </motion.div>
              ) : (
                <motion.div
                  key="s"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: [1, 1.04, 1], opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="w-11 h-11 flex items-center justify-center p-0.5"
                >
                  <img
                    src="/al-foras-icon.png"
                    alt="Al-Foras"
                    className="w-full h-full object-contain drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)] group-hover:scale-110 transition-transform"
                    draggable={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Main AI Advisor Sheet Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            dir={dir}
            className={`fixed z-50 flex flex-col overflow-hidden shadow-2xl bg-card border border-primary/40 transition-all duration-300 ${
              isFullscreen
                ? "inset-0 w-full h-full rounded-none"
                : "inset-0 sm:inset-4 md:inset-8 lg:inset-x-auto lg:right-8 lg:bottom-12 lg:top-auto lg:w-[580px] lg:h-[720px] lg:max-h-[88vh] rounded-none sm:rounded-3xl"
            }`}
            style={{
              background: "linear-gradient(165deg, rgba(14,35,18,0.98) 0%, rgba(8,18,10,0.99) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Header with Unified Al-Foras Icon */}
            <div className="px-4 py-3 border-b border-primary/30 bg-black/40 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#164319] via-[#1B5E20] to-[#B8860B] border border-primary/60 flex items-center justify-center shadow-gold p-1">
                    <img src="/al-foras-icon.png" alt="Advisor" className="w-full h-full object-contain drop-shadow" />
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-bold leading-tight">
                    {isRtl ? "مستشار الفرص والذكاء الاصطناعي" : "AI Career & Scholarship Advisor"}
                  </p>
                  <p className="text-2xs text-primary/90 leading-tight flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-primary inline" />
                    {isRtl ? "فحص ATS • صوت • مقالات • منح" : "ATS • Voice • SOP • Scholarships"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {mode === "chat" && messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    aria-label={isRtl ? "مسح المحادثة" : "Clear chat"}
                    className="w-7 h-7 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  aria-label={isFullscreen ? (isRtl ? "تصغير النافذة" : "Minimize") : (isRtl ? "ملء الشاشة" : "Maximize")}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                  title={isFullscreen ? (isRtl ? "تصغير النافذة" : "Minimize") : (isRtl ? "ملء الشاشة" : "Maximize")}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={isRtl ? "إغلاق" : "Close"}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature Tabs Navigation — 4 Modes Bar */}
            <div className="border-b border-primary/30 bg-black/40 px-2.5 py-2">
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-card/80 border border-primary/25 backdrop-blur-md">
                {[
                  { id: "chat", icon: Sparkles, labelAr: "Chat", labelEn: "Chat", subAr: "استشارة", subEn: "Advisor" },
                  { id: "voice", icon: Mic, labelAr: "Voice Mock", labelEn: "Voice Mock", subAr: "صوت", subEn: "Interview" },
                  { id: "cv", icon: FileText, labelAr: "CV & ATS", labelEn: "CV & ATS", subAr: "سيرة", subEn: "Resume" },
                  { id: "essay", icon: GraduationCap, labelAr: "SOP Checker", labelEn: "SOP Checker", subAr: "خطاب", subEn: "Essay" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMode(tab.id as AdvisorMode)}
                      className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all duration-200 ${
                        active
                          ? "bg-gold-gradient text-primary-foreground shadow-gold font-bold scale-[1.02]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 font-medium"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-0.5" />
                      <span className="text-[11px] leading-tight truncate max-w-full font-bold">
                        {isRtl ? tab.labelAr : tab.labelEn}
                      </span>
                      <span className="text-[9px] opacity-80 leading-none truncate max-w-full hidden sm:inline">
                        {isRtl ? tab.subAr : tab.subEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT: 1. CHAT MODE */}
            {mode === "chat" && (
              <>
                <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center px-4 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold-gradient mx-auto flex items-center justify-center mb-2.5 shadow-gold">
                        <Sparkles className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <p className="text-foreground text-sm font-bold mb-1">
                        {isRtl ? "مستشارك الأكاديمي والمهني 👋" : "Your Academic & Career Advisor 👋"}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                        {isRtl
                          ? "اختر استفسارًا سريعًا أو اطرح أي سؤال عن المنح، الجامعات، والفرص."
                          : "Choose a quick prompt or ask any question about admissions & scholarships."}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {QUICK_ACTIONS.map(q => {
                          const Icon = q.icon;
                          const label = isRtl ? q.labelAr : q.labelEn;
                          const prompt = isRtl ? q.promptAr : q.promptEn;
                          return (
                            <button
                              key={label}
                              onClick={() => send(prompt)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-primary/15 border border-primary/25 text-foreground text-xs transition-colors ${
                                isRtl ? "text-right" : "text-left"
                              }`}
                            >
                              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="flex-1 font-medium">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {messages.map(m => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.role === "user"
                          ? isRtl ? "justify-start" : "justify-end"
                          : isRtl ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-gold-gradient text-primary-foreground shadow-md font-medium"
                            : "bg-card/90 text-foreground border border-primary/30"
                        }`}
                      >
                        {m.content || (busy && <Loader2 className="w-4 h-4 animate-spin text-primary" />)}
                      </div>
                    </div>
                  ))}

                  {busy && messages[messages.length - 1]?.content === "" && (
                    <div className={`flex ${isRtl ? "justify-end" : "justify-start"}`}>
                      <div className="bg-card/90 border border-primary/30 rounded-2xl px-3 py-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "120ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "240ms" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Composer */}
                <form
                  onSubmit={e => { e.preventDefault(); send(input); }}
                  className="p-3 border-t border-primary/30 bg-black/30 flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isRtl ? "اسأل عن المنح أو صياغة الطلبات..." : "Ask about scholarships, applications..."}
                    disabled={busy}
                    dir={dir}
                    className="flex-1 h-10 px-3.5 rounded-xl bg-input border border-primary/30 text-foreground placeholder:text-muted-foreground text-xs outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    aria-label={isRtl ? "إرسال" : "Send"}
                    className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                  >
                    {busy
                      ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                      : <Send className={`w-4 h-4 text-primary-foreground ${!isRtl ? "rotate-180" : ""}`} />}
                  </button>
                </form>
              </>
            )}

            {/* TAB CONTENT: 2. VOICE INTERVIEW MODE */}
            {mode === "voice" && (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                    <Mic className="w-3.5 h-3.5" />
                    {isRtl ? "محاكاة المقابلة بالصوت الحي" : "Live Voice Interview Simulation"}
                  </div>
                  <h3 className="text-foreground text-base font-bold">
                    {isRtl ? "تحدث مع المستشار الذكي مباشرة" : "Speak directly with your AI Interviewer"}
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-xs mx-auto">
                    {isRtl
                      ? "اضغط على المايك وتحدث لإجراء محاكاة مقابلة حقيقية لمنح الدراسة والوظائف عن بعد."
                      : "Tap the mic and practice real interview questions for scholarships and remote jobs."}
                  </p>
                </div>

                {/* Animated Voice Waveform Sphere */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {(isListening || isSpeaking) && (
                      <motion.div
                        animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="absolute w-32 h-32 rounded-full bg-primary/20"
                      />
                    )}
                    <button
                      onClick={toggleListening}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all ${
                        isListening
                          ? "bg-destructive border-destructive text-white scale-105 animate-pulse"
                          : "bg-gold-gradient border-primary text-primary-foreground hover:scale-105"
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-9 h-9 animate-bounce" />
                      ) : (
                        <Mic className="w-9 h-9" />
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-primary">
                    {isListening
                      ? isRtl ? "🎙️ جاري الاستماع إلى إجابتك..." : "🎙️ Listening to your response..."
                      : isSpeaking
                      ? isRtl ? "🔊 المستشار يتحدث الآن..." : "🔊 Advisor is speaking..."
                      : isRtl ? "اضغط للبدء في التحدث" : "Tap to start speaking"}
                  </p>

                  {speechTranscript && (
                    <div className="mt-3 px-3 py-2 rounded-xl bg-card border border-primary/30 text-xs text-foreground max-w-xs text-center">
                      "{speechTranscript}"
                    </div>
                  )}
                </div>

                {/* Voice Controls Bar */}
                <div className="pt-2 border-t border-primary/20 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const prompt = isRtl
                        ? "ابدأ الآن محاكاة مقابلة منحة دراسية رسمية. اطرح سؤالًا واحدًا وانتظر إجابتي."
                        : "Start a mock scholarship interview now. Ask one question and wait for my answer.";
                      send(prompt);
                    }}
                    className="px-3 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary font-semibold hover:bg-primary/25 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {isRtl ? "بدء مقابلة جديدة" : "Start New Mock Interview"}
                  </button>

                  <button
                    onClick={() => {
                      setVoiceMuted(v => !v);
                      if (!voiceMuted && typeof window !== "undefined") window.speechSynthesis.cancel();
                    }}
                    className="p-2 rounded-xl bg-card border border-primary/20 text-muted-foreground hover:text-foreground"
                    title={isRtl ? "كتم/تشغيل الصوت" : "Mute/Unmute Voice"}
                  >
                    {voiceMuted ? <VolumeX className="w-4 h-4 text-destructive" /> : <Volume2 className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. CV REVIEW & ATS SCANNER */}
            {mode === "cv" && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-bold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      {isRtl ? "فاحص السيرة الذاتية ونقاط ATS" : "CV & ATS Compatibility Scanner"}
                    </h3>
                    <p className="text-muted-foreground text-2xs">
                      {isRtl ? "ارفع سيرتك الذاتية (PDF, Word, TXT) واحصل على تقرير فوري" : "Upload your CV and get instant ATS readiness report"}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isEvaluatingCv}
                    className="px-3 py-1.5 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold flex items-center gap-1 shadow-gold active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isRtl ? "رفع ملف CV" : "Upload File"}
                  </button>
                </div>

                {/* Direct Text Input / Paste Box */}
                <div>
                  <textarea
                    value={cvText}
                    onChange={e => setCvText(e.target.value)}
                    placeholder={isRtl ? "أو الصق نص السيرة الذاتية هنا للتحليل المباشر..." : "Or paste your CV text here for instant analysis..."}
                    className="w-full h-24 p-2.5 rounded-2xl bg-input border border-primary/20 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-2xs text-muted-foreground">
                      {cvText ? `${cvText.trim().split(/\s+/).filter(Boolean).length} ${isRtl ? "كلمة" : "words"}` : ""}
                    </span>
                    <button
                      onClick={handleManualCvAnalyze}
                      disabled={!cvText.trim() || isEvaluatingCv}
                      className="px-3 py-1 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors disabled:opacity-40"
                    >
                      {isRtl ? "فحص النص الآن" : "Scan Text Now"}
                    </button>
                  </div>
                </div>

                {/* ATS Analysis Scorecard */}
                {atsResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-2"
                  >
                    {/* Score Card */}
                    <div className="p-3.5 rounded-2xl bg-card border border-primary/30 flex items-center justify-between shadow-luxe">
                      <div>
                        <p className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">
                          {isRtl ? "درجة توافق الـ ATS" : "ATS Compatibility"}
                        </p>
                        <p className="text-2xl font-black text-gold-gradient mt-0.5">
                          {atsResult.score}<span className="text-xs text-muted-foreground font-normal">/100</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary font-black text-sm">
                          {atsResult.grade}
                        </span>
                        <p className="text-2xs text-muted-foreground mt-1">
                          {atsResult.score >= 80 ? (isRtl ? "جاهز للتقديم ✨" : "Ready to Apply ✨") : (isRtl ? "يحتاج تحسين ⚠️" : "Needs Optimization ⚠️")}
                        </p>
                      </div>
                    </div>

                    {/* Action button: Export Enhanced PDF */}
                    <button
                      onClick={handleDownloadPdf}
                      className="w-full py-2.5 rounded-2xl bg-gold-gradient text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-gold hover:opacity-95 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                      {isRtl ? "تصدير السيرة الذاتية المحسنة بصيغة PDF" : "Export Enhanced CV as PDF"}
                    </button>

                    {/* Action Plan & Strengths */}
                    <div className="p-3 rounded-2xl bg-card/80 border border-border space-y-2">
                      <p className="text-xs font-bold text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isRtl ? "نقاط القوة المرصودة:" : "Detected Strengths:"}
                      </p>
                      <ul className="text-2xs text-foreground space-y-1">
                        {atsResult.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-primary">•</span> {s}
                          </li>
                        ))}
                      </ul>

                      {atsResult.actionPlan.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-destructive/90 flex items-center gap-1 pt-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {isRtl ? "خطة التحسين الموصى بها:" : "Recommended Action Plan:"}
                          </p>
                          <ul className="text-2xs text-muted-foreground space-y-1">
                            {atsResult.actionPlan.map((a, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-destructive/80">•</span> {a}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    {/* Smart Opportunity Matcher based on CV */}
                    {atsResult.matchedScholarships.length > 0 && (
                      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 space-y-2">
                        <p className="text-xs font-bold text-primary flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          {isRtl ? "تنبيهات ذكية: منح تطابق مهارات سيرتك الذاتية" : "Smart Alerts: Scholarships Matching Your CV"}
                        </p>
                        <div className="space-y-1.5">
                          {atsResult.matchedScholarships.map(s => (
                            <div key={s.id} className="p-2 rounded-xl bg-card border border-primary/20 flex items-center justify-between text-2xs">
                              <div className="truncate flex-1">
                                <p className="font-semibold text-foreground truncate">{s.title}</p>
                                <p className="text-muted-foreground">{s.country} • {s.level}</p>
                              </div>
                              <button
                                onClick={() => saveOpportunity(s)}
                                className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 font-medium ml-2"
                              >
                                {isRtl ? "حفظ الطلب" : "Save"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. ESSAY & SOP CHECKER */}
            {mode === "essay" && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div>
                  <h3 className="text-foreground text-sm font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    {isRtl ? "فاحص المقالات وخطابات التوصية في الوقت الفعلي" : "Real-time Essay & SOP Analyzer"}
                  </h3>
                  <p className="text-muted-foreground text-2xs">
                    {isRtl ? "حلل خطاب النية أو المقال الأكاديمي واكتشف الرصانة والمفردات الأكاديمية" : "Evaluate Statement of Purpose and academic tone"}
                  </p>
                </div>

                <textarea
                  value={essayText}
                  onChange={e => {
                    setEssayText(e.target.value);
                    if (e.target.value.length > 50) {
                      setEssayResult(analyzeEssayDraft(e.target.value, lang));
                    }
                  }}
                  placeholder={isRtl ? "الصق خطاب النية (Statement of Purpose) أو المقال هنا..." : "Paste your SOP, motivation letter, or recommendation letter here..."}
                  className="w-full h-32 p-3 rounded-2xl bg-input border border-primary/20 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-2xs text-muted-foreground">
                    {essayText ? `${essayText.trim().split(/\s+/).filter(Boolean).length} ${isRtl ? "كلمة" : "words"}` : ""}
                  </span>
                  <button
                    onClick={handleEssayAnalyze}
                    disabled={!essayText.trim()}
                    className="px-3.5 py-1 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold shadow-gold disabled:opacity-40"
                  >
                    {isRtl ? "فحص الرصانة الأكاديمية" : "Analyze Tone"}
                  </button>
                </div>

                {essayResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-1"
                  >
                    {/* Tone meters */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-2xl bg-card border border-primary/30 text-center">
                        <p className="text-2xs text-muted-foreground font-semibold">{isRtl ? "الرصانة الأكاديمية" : "Academic Tone"}</p>
                        <p className="text-xl font-bold text-gold-gradient">{essayResult.academicToneScore}%</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-card border border-primary/30 text-center">
                        <p className="text-2xs text-muted-foreground font-semibold">{isRtl ? "مؤشر سهولة القراءة" : "Readability"}</p>
                        <p className="text-xl font-bold text-primary">{essayResult.readabilityScore}%</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-card/80 border border-border space-y-2">
                      <p className="text-2xs font-semibold text-muted-foreground leading-relaxed">
                        {essayResult.overallSummary}
                      </p>

                      {essayResult.suggestedPhrases.length > 0 && (
                        <div className="pt-2 border-t border-border space-y-1.5">
                          <p className="text-xs font-bold text-destructive/90">
                            {isRtl ? "بدائل أكاديمية مقترحة للعبارات الضعيفة:" : "Suggested Academic Replacements:"}
                          </p>
                          {essayResult.suggestedPhrases.map((s, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-background/50 border border-primary/20 text-2xs space-y-0.5">
                              <p className="text-destructive/80 line-through">❌ "{s.original}"</p>
                              <p className="text-primary font-bold">✨ "{s.better}"</p>
                              <p className="text-muted-foreground text-[10px]">{s.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAdvisor;
