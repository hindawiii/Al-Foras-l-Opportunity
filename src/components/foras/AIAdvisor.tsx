import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  Sparkles, X, Send, Loader2, Trash2, Bot, GraduationCap, Calculator,
  University, FileText, Mic, MicOff, Volume2, VolumeX, Upload, Download,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Star, Search, ShieldCheck,
  Maximize2, Minimize2, Phone, PhoneOff, Briefcase, Languages, HelpCircle, Info,
  ChevronDown, ChevronUp
} from "lucide-react";
import { chatStorage, type ChatMessage } from "@/lib/aiChatStorage";
import { guestStorage } from "@/lib/guestStorage";
import { generateLocalAIResponse, getDailyQuotaStatus, incrementDailyQuota, type QuotaStatus } from "@/lib/aiLocalEngine";
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
    icon: Sparkles,
    labelAr: "🎙️ بدء محاكاة مقابلة حية (منح / عمل)",
    labelEn: "🎙️ Start Live Mock Interview (STAR)",
    promptAr: "أريد بدء محاكاة مقابلة رسمية تفاعلية لمنحة دراسية وفرصة عمل الآن. اسألني السؤال الأول وانتظر إجابتي لتقييمها.",
    promptEn: "I want to start an interactive mock interview for scholarships and career opportunities. Ask me the first question and evaluate my answer.",
  },
  {
    icon: GraduationCap,
    labelAr: "ما هي المنح المناسبة لملفي ومعدلي؟",
    labelEn: "What scholarships fit my GPA & field?",
    promptAr: "بناءً على ملفي الشخصي ومعدلي، ما هي أفضل المنح الدراسية المتاحة والممولة بالكامل المناسبة لي حاليًا؟ اذكر الشروط وطريقة القبول.",
    promptEn: "Based on my profile and GPA, what are the best fully funded scholarships available for me right now? List key requirements.",
  },
  {
    icon: Briefcase,
    labelAr: "تطوير مساري المهني والشهادات (PMP/AI)",
    labelEn: "Career shift & high-ROI certifications",
    promptAr: "أريد خطة عملية لتطوير مساري المهني، والشهادات الاحترافية الأكثر طلباً في سوق العمل المحلي والدولي، وكيفية الحصول على عمل عن بعد.",
    promptEn: "I want an actionable career development plan, in-demand professional certifications (PMP/AWS/AI), and how to land remote jobs.",
  },
  {
    icon: Languages,
    labelAr: "🇸🇩 🇪🇬 استشارة باللهجة السودانية أو المصرية",
    labelEn: "🇸🇩 🇪🇬 Dialect consultation (Sudanese/Egyptian)",
    promptAr: "داير أستفسر عن التقديم للمنح وشروط القبول وتوثيق الشهادات بطريقة مبسطة وواضحة جداً.",
    promptEn: "Explain scholarship requirements and document authentication in clear, practical steps.",
  },
  {
    icon: FileText,
    labelAr: "فحص خطاب الدافع والسيرة الذاتية (ATS)",
    labelEn: "Review Motivation Letter & ATS CV",
    promptAr: "كيف أصيغ خطاب دافع (Motivation Letter) قوي ومميز يقنع لجنة المنحة؟ واشرح لي كيفية اجتياز فحص أنظمة الـ ATS.",
    promptEn: "How to draft a compelling Statement of Purpose (SOP) and ensure my CV passes international ATS filters?",
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

  // Global event listener for opening AI advisor directly into specific mode and auto-sending custom prompt
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: AdvisorMode; prompt?: string }>;
      setOpen(true);
      if (custom.detail?.mode) {
        setMode(custom.detail.mode);
      }
      if (custom.detail?.prompt) {
        setTimeout(() => {
          sendRef.current(custom.detail.prompt);
        }, 150);
      }
    };
    window.addEventListener("open-ai-advisor", handler as EventListener);
    return () => window.removeEventListener("open-ai-advisor", handler as EventListener);
  }, []);

  // Voice Interview & Live Call Mode States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [selectedInterviewTrack, setSelectedInterviewTrack] = useState<"scholarship" | "job" | "english">("scholarship");
  const [showStarGuide, setShowStarGuide] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const isLiveCallActiveRef = useRef(false);
  isLiveCallActiveRef.current = isLiveCallActive;

  // Call Timer
  useEffect(() => {
    let interval: any = null;
    if (isLiveCallActive) {
      interval = setInterval(() => setCallSeconds(s => s + 1), 1000);
    } else {
      setCallSeconds(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLiveCallActive]);

  // CV Review & ATS States
  const [cvText, setCvText] = useState("");
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [isEvaluatingCv, setIsEvaluatingCv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Daily Fair-Share Quota State
  const [quota, setQuota] = useState<QuotaStatus>(getDailyQuotaStatus());

  useEffect(() => {
    setQuota(getDailyQuotaStatus());
  }, [open]);

  // Essay / SOP Checker States
  const [essayText, setEssayText] = useState("");
  const [essayResult, setEssayResult] = useState<EssayAnalysisResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lastScroll = useRef(0);
  const sendRef = useRef<(text?: string) => void>(() => {});

  // Load chat messages & validated safe FAB position
  useEffect(() => {
    (async () => {
      try {
        const m = await chatStorage.loadMessages();
        if (m && m.length > 0) {
          setMessages(m);
        }
        const pos = await chatStorage.loadFabPosition();
        if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
          // Strict bounds check against live window dimensions to prevent jumping offscreen
          const maxLeft = typeof window !== "undefined" ? -window.innerWidth + 80 : -500;
          const maxTop = typeof window !== "undefined" ? -window.innerHeight + 120 : -500;
          const safeX = Math.max(maxLeft, Math.min(20, pos.x));
          const safeY = Math.max(maxTop, Math.min(20, pos.y));
          x.set(safeX);
          y.set(safeY);
        }
      } catch {
        // Fallback to default (0, 0)
        x.set(0);
        y.set(0);
      }
    })();
  }, [x, y]);

  // Always keep FAB visible when advisor drawer is closed
  const isFabVisible = !open;

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
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Calm, deep, clear male voice synthesis with auto turn-taking
  const speakText = (text: string) => {
    if (voiceMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, "").slice(0, 450);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "ar" ? "ar-SA" : "en-US";

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (lang === "ar") {
        // Look for calm male voices (Maged, Tariq, Naif, Mehdi, Google Arabic Male)
        const arMale = voices.find(v => (v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic")) &&
          (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("maged") || v.name.toLowerCase().includes("tariq") || v.name.toLowerCase().includes("naif") || v.name.toLowerCase().includes("google")));
        const anyAr = voices.find(v => v.lang.startsWith("ar"));
        if (arMale) utterance.voice = arMale;
        else if (anyAr) utterance.voice = anyAr;
      } else {
        // Look for calm English male voices (Guy, George, David, Daniel, Google US English Male)
        const enMale = voices.find(v => (v.lang.startsWith("en") || v.name.toLowerCase().includes("english")) &&
          (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("george") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("male")));
        const anyEn = voices.find(v => v.lang.startsWith("en"));
        if (enMale) utterance.voice = enMale;
        else if (anyEn) utterance.voice = anyEn;
      }
    }

    // Set acoustic qualities: calm, resonant, articulate
    utterance.pitch = 0.88; // Deep calm male pitch
    utterance.rate = 0.93; // Composed, comfortable pacing

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-resume microphone in Continuous Live Call Mode
      if (isLiveCallActiveRef.current && speechRecognitionRef.current) {
        setTimeout(() => {
          if (isLiveCallActiveRef.current) {
            setSpeechTranscript("");
            speechRecognitionRef.current.lang = lang === "ar" ? "ar-SA" : "en-US";
            try {
              speechRecognitionRef.current.start();
              setIsListening(true);
            } catch { /* already running */ }
          }
        }, 500);
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isLiveCallActiveRef.current && speechRecognitionRef.current) {
        setTimeout(() => {
          if (isLiveCallActiveRef.current) {
            try {
              speechRecognitionRef.current.start();
              setIsListening(true);
            } catch { /* ignore */ }
          }
        }, 500);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const getProfile = () => {
    if (isGuest) return guestStorage.get("profile") ?? null;
    return null;
  };

  const startLiveCall = (track: "scholarship" | "job" | "english" = selectedInterviewTrack) => {
    setIsLiveCallActive(true);
    let prompt = "";
    if (track === "scholarship") {
      prompt = lang === "en"
        ? "Start a mock scholarship interview now. Ask one question and wait for my response."
        : "ابدأ الآن محاكاة مقابلة منحة دراسية رسمية. اطرح سؤالًا واحدًا وانتظر إجابتي.";
    } else if (track === "job") {
      prompt = lang === "en"
        ? "Start a remote job & career interview now. Ask one question about my technical skills and experience."
        : "ابدأ الآن محاكاة مقابلة عمل عن بعد ووظيفة تقنية. اطرح سؤالًا واحدًا عن خبراتي ومشاريعي.";
    } else {
      prompt = "Let's start an English fluency conversation and interview practice. Please greet me and ask your first question.";
    }
    send(prompt);
  };

  const endLiveCall = () => {
    setIsLiveCallActive(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
    toast.success(isRtl ? "تم إنهاء المكالمة بنجاح، يمكنك قراءة التقييم في المحادثة" : "Call ended. You can review your assessment in the chat.");
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;

    // Check quota
    const currentQuota = getDailyQuotaStatus();
    if (!currentQuota.isAllowed) {
      toast.error(
        isRtl
          ? "لقد استهلكت رصيدك المجاني اليومي (20 استفساراً). يتجدد الرصيد تلقائياً عند منتصف الليل 00:00."
          : "You have used your daily free quota (20 queries). Resets at midnight 00:00."
      );
      return;
    }

    // Increment and update state
    const updatedQuota = incrementDailyQuota();
    setQuota(updatedQuota);

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
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile(), lang);
        let currentText = "";
        const words = reply.split(" ");
        for (let i = 0; i < words.length; i++) {
          if (controller.signal.aborted) break;
          currentText += (i === 0 ? "" : " ") + words[i];
          setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: currentText } : m));
          await new Promise(r => setTimeout(r, 18));
        }
        if (mode === "voice" || isLiveCallActiveRef.current) speakText(reply);
        setBusy(false);
        return;
      }

      const payload = {
        messages: nextMsgs
          .filter(m => m.id !== assistantMsg.id && m.content.trim())
          .map(m => ({ role: m.role, content: m.content })),
        profile: getProfile(),
        lang,
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
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile(), lang);
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m));
        if (mode === "voice" || isLiveCallActiveRef.current) speakText(reply);
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
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile(), lang);
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m));
        if (mode === "voice" || isLiveCallActiveRef.current) speakText(reply);
      } else if (mode === "voice" || isLiveCallActiveRef.current) {
        speakText(acc);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        const reply = generateLocalAIResponse(content, nextMsgs, getProfile(), lang);
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: reply } : m));
        if (mode === "voice" || isLiveCallActiveRef.current) speakText(reply);
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

  const [tipSide, setTipSide] = useState<"right" | "left">("right");
  const fabContainerRef = useRef<HTMLDivElement | null>(null);

  // Update tooltip side dynamically based on position to avoid cutting off screen
  const updateTooltipPosition = () => {
    if (!fabContainerRef.current) return;
    const rect = fabContainerRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    // If the FAB is in the left 45% of the screen or close to left edge, show tooltip towards the right
    if (rect.left < screenWidth * 0.45) {
      setTipSide("left");
    } else {
      setTipSide("right");
    }
  };

  const hoverTimeoutRef = useRef<any>(null);

  const handleFabMouseEnter = () => {
    updateTooltipPosition();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 280);
  };

  const handleFabMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setShowTip(false);
  };

  // Universal cross-device dynamic drag constraints based on live window dimensions
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dragConstraints = useMemo(() => {
    const w = windowDimensions.width;
    const h = windowDimensions.height;
    // Allow dragging freely to all 4 corners across mobile, tablet, and desktop
    return {
      left: -w + 72,
      right: 16,
      top: -h + 120,
      bottom: 24,
    };
  }, [windowDimensions]);

  // Track whether dragging occurred to differentiate click vs drag
  const isDraggingRef = useRef(false);

  return (
    <>
      {/* Sleek, Professional Resized Floating Action Button with Universal Free Drag (All Devices) */}
      <motion.div
        ref={fabContainerRef}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={dragConstraints}
        style={{ x, y, touchAction: "none" }}
        onDragStart={() => {
          isDraggingRef.current = true;
          setIsHovered(false);
          setShowTip(false);
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 60);
          chatStorage.saveFabPosition({ x: x.get(), y: y.get() });
          updateTooltipPosition();
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isFabVisible ? 1 : 0, scale: isFabVisible ? 1 : 0.6, pointerEvents: isFabVisible ? "auto" : "none" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="ai-advisor-fab fixed bottom-24 right-4 z-[9999] cursor-grab active:cursor-grabbing select-none"
        onMouseEnter={handleFabMouseEnter}
        onMouseLeave={handleFabMouseLeave}
      >
        <div className="relative flex items-center justify-center">
          {/* Hover / Hint Tooltip Note with Viewport Edge Collision Detection & Smart Flipping */}
          <AnimatePresence>
            {(showTip || isHovered) && !open && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.94 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`absolute bottom-full mb-3.5 whitespace-nowrap px-3.5 py-2 rounded-2xl bg-gradient-to-br from-[#0c2411] via-[#103017] to-[#1c4824] border border-primary/55 text-foreground text-xs shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.35)] backdrop-blur-xl z-50 pointer-events-none max-w-[290px] sm:max-w-[320px] ${
                  tipSide === "left" ? "left-0" : "right-0"
                }`}
                dir={dir}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold p-0.5 flex-shrink-0">
                    <img src="/al-foras-icon.png" alt="logo" className="w-full h-full object-contain drop-shadow" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-gold-gradient text-xs leading-tight truncate">
                      {isRtl ? "مستشار الفُرص والذكاء الاصطناعي ✨" : "AI Opportunities Advisor ✨"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight font-medium truncate">
                      {isRtl ? "فحص السيرة الذاتية • خطابات التقديم • محاكاة المقابلات" : "ATS Resume • SOP Letter • Interview Simulation"}
                    </p>
                  </div>
                </div>
                {/* Pointer Caret with dynamic alignment */}
                <div
                  className={`absolute -bottom-1.5 w-3 h-3 bg-[#103017] border-r border-b border-primary/50 rotate-45 ${
                    tipSide === "left" ? "left-5" : "right-5"
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continuous Pulsing Aura & Breathing Rings */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary via-amber-400 to-primary-glow opacity-40 animate-ping pointer-events-none" />
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-primary/80 via-primary-glow/60 to-amber-400/80 blur-md opacity-75 animate-pulse pointer-events-none" />

          {/* Floating Action Button */}
          <button
            onClick={() => {
              if (isDraggingRef.current) return;
              setOpen(v => !v);
            }}
            aria-label={isRtl ? "مستشار الفرص الذكي" : "AI Advisor"}
            style={{ borderRadius: 18 }}
            className="relative w-14 h-14 bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#B8860B] border-2 border-primary/70 flex items-center justify-center shadow-[0_8px_25px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
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
            id="ai-advisor-sheet-container"
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

              {/* Fair-Share Quota & Dialect Indicator */}
              <div className="mt-2 px-1 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-primary/90">
                    {isRtl ? "مستشار ذكي فوري (فصحى • سوداني • مصري)" : "Multi-Dialect Advisor (Sudanese/Egyptian/EN)"}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30">
                  <span className="text-primary font-bold">⚡ {quota.remaining} / {quota.max}</span>
                  <span className="text-muted-foreground font-medium">
                    {isRtl ? "استفسار متبقٍ اليوم" : "queries left"}
                  </span>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: 1. CHAT MODE */}
            {mode === "chat" && (
              <>
                <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center px-4 py-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#B8860B] border border-primary/60 mx-auto flex items-center justify-center mb-2.5 shadow-gold p-2">
                        <img src="/al-foras-icon.png" alt="Advisor Logo" className="w-full h-full object-contain drop-shadow" />
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
                      className={`flex items-end gap-2 ${
                        m.role === "user"
                          ? isRtl ? "justify-start flex-row" : "justify-end flex-row"
                          : isRtl ? "justify-end flex-row-reverse" : "justify-start flex-row"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#B8860B] border border-primary/40 flex items-center justify-center p-0.5 flex-shrink-0 shadow-sm">
                          <img src="/al-foras-icon.png" alt="AI" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
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
                    <div className={`flex items-end gap-2 ${isRtl ? "justify-end flex-row-reverse" : "justify-start flex-row"}`}>
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#B8860B] border border-primary/40 flex items-center justify-center p-0.5 flex-shrink-0 shadow-sm">
                        <img src="/al-foras-icon.png" alt="AI" className="w-full h-full object-contain" />
                      </div>
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
              <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 overflow-y-auto space-y-4">
                {/* Header & Mode Intro */}
                <div className="text-center space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                    <Mic className="w-3.5 h-3.5" />
                    {isRtl ? "محاكي المقابلات الصوتية الذكي" : "AI Voice Mock Interviewer"}
                  </div>
                  <h3 className="text-foreground text-sm sm:text-base font-bold">
                    {isRtl ? "تدرب على المقابلات بصوت رجل هادئ ومتقن" : "Practice Interviews with a Calm, Clear Voice"}
                  </h3>
                  <p className="text-muted-foreground text-2xs sm:text-xs max-w-sm mx-auto">
                    {isRtl
                      ? "نظام تفاعلي متقدم يدعم اللهجة السودانية والمصرية والعربية البيضاء، مع ميزة المكالمة الحية المستمرة ونموذج STAR."
                      : "Interactive simulation supporting Arabic dialects & English, featuring continuous live calls and STAR framework guidance."}
                  </p>
                </div>

                {/* Track Selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-card/80 border border-primary/20">
                  {[
                    { id: "scholarship", icon: GraduationCap, labelAr: "منح دراسية", labelEn: "Scholarships" },
                    { id: "job", icon: Briefcase, labelAr: "وظائف وعمل", labelEn: "Job & Remote" },
                    { id: "english", icon: Languages, labelAr: "English Fluency", labelEn: "English" },
                  ].map((track) => {
                    const Icon = track.icon;
                    const active = selectedInterviewTrack === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => setSelectedInterviewTrack(track.id as any)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-2xs font-bold transition-all ${
                          active
                            ? "bg-primary/20 border border-primary/50 text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="truncate">{isRtl ? track.labelAr : track.labelEn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* LIVE CALL OR SINGLE TALK CARD */}
                {isLiveCallActive ? (
                  /* Active Live Call UI */
                  <div className="p-4 rounded-2xl bg-card/90 border-2 border-emerald-500/40 shadow-xl flex flex-col items-center justify-center relative overflow-hidden space-y-4">
                    {/* Live Call Pulsing Header */}
                    <div className="flex items-center justify-between w-full border-b border-primary/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold text-emerald-400">
                          {isRtl ? "مكالمة مقابلة حية مستمرة" : "Continuous Live Mock Call"}
                        </span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full bg-black/40 border border-primary/30 text-xs font-mono text-primary font-bold">
                        {String(Math.floor(callSeconds / 60)).padStart(2, "0")}:{String(callSeconds % 60).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Animated Avatar Sphere with Dynamic Rings */}
                    <div className="relative flex items-center justify-center py-2">
                      {(isListening || isSpeaking) && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.6 }}
                          className="absolute w-32 h-32 rounded-full bg-emerald-500/20"
                        />
                      )}
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#164319] via-[#1B5E20] to-[#B8860B] border-2 border-primary/60 flex items-center justify-center p-3 shadow-gold">
                        <img src="/al-foras-icon.png" alt="Interviewer" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-foreground">
                        {isSpeaking
                          ? (isRtl ? "🔊 المستشار يتحدث بصوت هادئ وموزون..." : "🔊 Advisor is speaking...")
                          : isListening
                          ? (isRtl ? "🎙️ يستمع لإجابتك الآن (تحدث بحرية)..." : "🎙️ Listening to your answer...")
                          : (isRtl ? "⏳ جاري التفكير وتحليل الإجابة..." : "⏳ Analyzing response...")}
                      </p>
                      {speechTranscript && (
                        <p className="text-2xs text-muted-foreground bg-black/30 px-3 py-1.5 rounded-xl max-w-xs mx-auto line-clamp-2">
                          "{speechTranscript}"
                        </p>
                      )}
                    </div>

                    {/* Live Call Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={toggleListening}
                        className={`p-3 rounded-full border transition-all ${
                          isListening
                            ? "bg-destructive text-white border-destructive animate-pulse"
                            : "bg-card border-primary/30 text-muted-foreground hover:text-foreground"
                        }`}
                        title={isListening ? (isRtl ? "كتم المايك" : "Mute Mic") : (isRtl ? "تشغيل المايك" : "Unmute Mic")}
                      >
                        {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={endLiveCall}
                        className="px-4 py-2.5 rounded-full bg-destructive text-white font-bold text-xs flex items-center gap-2 hover:bg-destructive/90 shadow-lg active:scale-95 transition-all"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>{isRtl ? "إنهاء المكالمة" : "End Call"}</span>
                      </button>

                      <button
                        onClick={() => {
                          const prompt = isRtl
                            ? "اطرح عليّ السؤال التالي في المقابلة مع تقييم إجابتي السابقة بنموذج STAR باختصار."
                            : "Ask the next interview question and briefly evaluate my previous answer using STAR.";
                          send(prompt);
                        }}
                        className="p-3 rounded-full bg-card border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                        title={isRtl ? "السؤال التالي" : "Next Question"}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Idle Screen: Start Call & Quick Qs */
                  <div className="space-y-3">
                    {/* Big Call Button */}
                    <div className="p-4 rounded-2xl bg-card/90 border border-primary/30 text-center space-y-3 shadow-md">
                      <div className="flex justify-center">
                        <button
                          onClick={() => startLiveCall(selectedInterviewTrack)}
                          className="w-16 h-16 rounded-full bg-gold-gradient border-2 border-primary text-primary-foreground flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Phone className="w-7 h-7 animate-pulse" />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-foreground text-xs font-bold">
                          {isRtl ? "بدء مكالمة مقابلة تفاعلية حية" : "Start Live Voice Interview Call"}
                        </h4>
                        <p className="text-muted-foreground text-2xs">
                          {isRtl ? "محادثة صوتية متصلة تسألك وتستمع لإجاباتك وتقيمك فوريًا" : "Continuous audio call that asks, listens, and evaluates in real-time"}
                        </p>
                      </div>
                      <button
                        onClick={() => startLiveCall(selectedInterviewTrack)}
                        className="w-full py-2 px-3 rounded-xl bg-gold-gradient text-primary-foreground text-xs font-bold shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {isRtl ? "اتصال بالمستشار الآن" : "Call Advisor Now"}
                      </button>
                    </div>

                    {/* STAR Framework Helper Accordion */}
                    <div className="rounded-xl border border-primary/20 bg-card/60 overflow-hidden text-2xs">
                      <button
                        onClick={() => setShowStarGuide(!showStarGuide)}
                        className="w-full px-3 py-2 flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-primary">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {isRtl ? "كيف تجيب باحترافية؟ دليل نموذج STAR" : "How to answer: STAR Framework Guide"}
                        </span>
                        {showStarGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {showStarGuide && (
                        <div className="px-3 pb-3 pt-1 border-t border-primary/15 grid grid-cols-2 gap-2 text-2xs">
                          <div className="p-2 rounded-lg bg-black/20 border border-primary/10">
                            <span className="font-bold text-amber-400">S (Situation)</span>: {isRtl ? "صف الموقف والتحدي باختصار." : "Describe the situation/challenge."}
                          </div>
                          <div className="p-2 rounded-lg bg-black/20 border border-primary/10">
                            <span className="font-bold text-emerald-400">T (Task)</span>: {isRtl ? "ما هو دورك ومسؤوليتك المحددة؟" : "What was your specific goal/task?"}
                          </div>
                          <div className="p-2 rounded-lg bg-black/20 border border-primary/10">
                            <span className="font-bold text-blue-400">A (Action)</span>: {isRtl ? "الخطوات العملية التي اتخذتها." : "The concrete steps you took."}
                          </div>
                          <div className="p-2 rounded-lg bg-black/20 border border-primary/10">
                            <span className="font-bold text-purple-400">R (Result)</span>: {isRtl ? "النتائج القابلة للقياس والأثر." : "The measurable outcome & impact."}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Common Practice Questions Grid */}
                    <div className="space-y-1.5">
                      <p className="text-2xs font-bold text-muted-foreground px-1 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-primary" />
                        {isRtl ? "أسئلة شائعة يمكنك التدرب عليها فورًا:" : "Common Questions for Quick Practice:"}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(selectedInterviewTrack === "scholarship"
                          ? [
                              {
                                qAr: "لماذا اخترت هذه المنحة وهذه الجامعة بالتحديد؟",
                                qEn: "Why did you choose this scholarship and university?",
                                promptAr: "سؤال مقابلة منحة: لماذا اخترت هذه المنحة بالتحديد؟ اسمع إجابتي ثم قيّمها بنموذج STAR.",
                                promptEn: "Scholarship Question: Why this scholarship specifically? Listen to my answer and evaluate with STAR."
                              },
                              {
                                qAr: "كيف ستساهم في تنمية مجتمعك وبلدك بعد التخرج؟",
                                qEn: "How will you contribute to your home country after graduation?",
                                promptAr: "سؤال مقابلة منحة: كيف تخطط لخدمة مجتمعك بعد التخرج؟ اسمع إجابتي ثم قيّمها بنموذج STAR.",
                                promptEn: "Scholarship Question: How will you give back to your community after graduation? Evaluate with STAR."
                              },
                              {
                                qAr: "حدثني عن أكبر تحدٍ أكاديمي واجهته وكيف تغلبت عليه؟",
                                qEn: "Tell me about a major academic challenge and how you overcame it?",
                                promptAr: "سؤال مقابلة: حدثني عن تحدٍ أكاديمي كبير وكيف تعاملت معه. اسمع إجابتي ثم قيّمها.",
                                promptEn: "Interview Question: Tell me about an academic challenge you solved. Evaluate with STAR."
                              },
                            ]
                          : selectedInterviewTrack === "job"
                          ? [
                              {
                                qAr: "حدثني عن نفسك وعن أبرز إنجاز حققته في مسارك المهني",
                                qEn: "Tell me about yourself and your proudest career achievement",
                                promptAr: "سؤال مقابلة عمل: حدثني عن نفسك وأبرز إنجازاتك المهنية. اسمع إجابتي ثم قيّمها.",
                                promptEn: "Job Question: Tell me about yourself and key achievements. Evaluate with STAR."
                              },
                              {
                                qAr: "كيف تنظم وقتك وتلتزم بالمواعيد في بيئة العمل عن بعد؟",
                                qEn: "How do you manage your time and deadlines in remote work?",
                                promptAr: "سؤال مقابلة عمل عن بعد: كيف تنظم وقتك وتسلم مهامك في الوقت المحدد؟ اسمع إجابتي.",
                                promptEn: "Remote Job Question: How do you manage your time and meet deadlines? Evaluate with STAR."
                              },
                              {
                                qAr: "ما هو موقف واجهت فيه ضغطاً أو خلافاً وكيف قمت بحله؟",
                                qEn: "Describe a high-pressure situation or team conflict and how you handled it",
                                promptAr: "سؤال سلوكي للمقابلة: كيف تتعامل مع ضغط العمل أو خلافات الفريق؟ اسمع إجابتي.",
                                promptEn: "Behavioral Question: How do you handle workplace conflict or tight deadlines? Evaluate with STAR."
                              },
                            ]
                          : [
                              {
                                qAr: "Introduce yourself and describe your primary career ambition.",
                                qEn: "Introduce yourself and describe your primary career ambition.",
                                promptAr: "English practice: Can you introduce yourself and describe your career ambition? Provide feedback on my grammar and confidence.",
                                promptEn: "English practice: Can you introduce yourself and describe your career ambition? Provide feedback on my grammar and confidence."
                              },
                              {
                                qAr: "What are your top strengths and how do you handle weaknesses?",
                                qEn: "What are your top strengths and how do you handle weaknesses?",
                                promptAr: "English interview: What are your greatest strengths and how do you work on your weaknesses? Evaluate my fluency.",
                                promptEn: "English interview: What are your greatest strengths and how do you work on your weaknesses? Evaluate my fluency."
                              },
                              {
                                qAr: "Describe a project where you demonstrated leadership.",
                                qEn: "Describe a project where you demonstrated leadership.",
                                promptAr: "English interview: Describe a project where you demonstrated leadership or initiative. Evaluate using STAR.",
                                promptEn: "English interview: Describe a project where you demonstrated leadership or initiative. Evaluate using STAR."
                              },
                            ]
                        ).map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const p = isRtl ? item.promptAr : item.promptEn;
                              send(p);
                              setIsLiveCallActive(true);
                            }}
                            className="p-2 rounded-xl bg-card/70 border border-primary/20 hover:border-primary/50 text-left rtl:text-right text-2xs text-foreground hover:bg-white/5 transition-all flex items-center justify-between group"
                          >
                            <span className="line-clamp-1">{isRtl ? item.qAr : item.qEn}</span>
                            <ArrowRight className={`w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Voice Controls Bar */}
                <div className="pt-2 border-t border-primary/20 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      const prompt = isRtl
                        ? "ابدأ الآن محاكاة مقابلة منحة دراسية رسمية. اطرح سؤالًا واحدًا وانتظر إجابتي."
                        : "Start a mock scholarship interview now. Ask one question and wait for my answer.";
                      send(prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-2xs font-semibold hover:bg-primary/25 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {isRtl ? "إعادة بدء المقابلة" : "Restart Interview"}
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
