import { SCHOLARSHIPS, type Scholarship } from "./mockData";

export interface AtsAnalysisResult {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  actionPlan: string[];
  wordCount: number;
  sectionsFound: string[];
  matchedScholarships: Scholarship[];
}

export interface EssayAnalysisResult {
  academicToneScore: number;
  readabilityScore: number;
  wordCount: number;
  paragraphCount: number;
  strengths: string[];
  improvements: string[];
  passivePhrasesFound: string[];
  suggestedPhrases: { original: string; better: string; reason: string }[];
  overallSummary: string;
}

/**
 * Parses raw text from a text/markdown/simple file
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  
  if (extension === "txt" || extension === "md" || extension === "csv") {
    return await file.text();
  }
  
  // For binary files (.pdf, .docx), extract readable text streams or read as string
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result;
      if (typeof buffer === "string") {
        resolve(buffer);
      } else if (buffer instanceof ArrayBuffer) {
        // Simple byte-level text decoder extracting ASCII/UTF-8 words from binary docs
        const uint = new Uint8Array(buffer);
        let str = "";
        for (let i = 0; i < uint.length; i++) {
          const charCode = uint[i];
          if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode > 127) {
            str += String.fromCharCode(charCode);
          } else if (str.length > 0 && str[str.length - 1] !== " ") {
            str += " ";
          }
        }
        resolve(str.slice(0, 15000));
      }
    };
    reader.onerror = () => resolve(file.name);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Evaluates a CV text and calculates realistic ATS Score, Missing Keywords & Action Plan
 */
export const analyzeCvText = (cvText: string, lang: "ar" | "en" = "ar"): AtsAnalysisResult => {
  const isEn = lang === "en";
  const lower = cvText.toLowerCase();
  const words = cvText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let score = 40;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingKeywords: string[] = [];
  const actionPlan: string[] = [];
  const sectionsFound: string[] = [];

  // 1. Length & substance check
  if (wordCount >= 150 && wordCount <= 900) {
    score += 15;
    strengths.push(isEn ? "Ideal CV length (concise and easy for recruiters to scan)." : "طول مثالي للسيرة الذاتية (مركز ومباشر وسهل القراءة لمسؤولي التوظيف واللجان).");
  } else if (wordCount < 150) {
    weaknesses.push(isEn ? "CV is too brief; needs more detail on academic/work achievements." : "السيرة الذاتية قصيرة جدًا وتحتاج لتفاصيل إضافية عن الإنجازات الأكاديمية والعملية.");
    actionPlan.push(isEn ? "Expand upon your key academic milestones, projects, and certifications." : "أضف تفاصيل أكثر عن مشاريعك الأكاديمية، شهاداتك، وإنجازاتك العملية.");
  } else {
    score += 8;
    weaknesses.push(isEn ? "CV exceeds 2 pages equivalent; try condensing into key bullet points." : "السيرة الذاتية طويلة نوعًا ما، يُفضّل تلخيص النقاط في نقاط محددة وسريعة القراءة.");
  }

  // 2. Essential Sections Check
  const sectionKeywords = [
    { name: isEn ? "Contact Information" : "معلومات الاتصال", keys: ["email", "phone", "linkedin", "بريد", "هاتف", "@"] },
    { name: isEn ? "Education" : "التعليم والمؤهلات", keys: ["education", "university", "bachelor", "master", "gpa", "جامعة", "بكالوريوس", "ماجستير", "تعليم"] },
    { name: isEn ? "Skills" : "المهارات والقدرات", keys: ["skills", "technologies", "languages", "مهارات", "لغات", "برمجة", "تقنية"] },
    { name: isEn ? "Experience & Projects" : "الخبرة والمشاريع", keys: ["experience", "projects", "work", "research", "خبرة", "مشاريع", "أبحاث", "عمل"] },
  ];

  sectionKeywords.forEach(sec => {
    const found = sec.keys.some(k => lower.includes(k));
    if (found) {
      score += 10;
      sectionsFound.push(sec.name);
    } else {
      missingKeywords.push(sec.name);
      actionPlan.push(isEn ? `Add a dedicated section for '${sec.name}' to pass ATS filters.` : `أضف قسماً واضحاً بعنوان '${sec.name}' لتجاوز فلاتر الـ ATS الأوتوماتيكية.`);
    }
  });

  // 3. Action Verbs & High Impact Keywords
  const impactWords = ["managed", "led", "developed", "created", "researched", "achieved", "improved", "published", "designed", "قاد", "طور", "أشرف", "حقق", "نشر", "صمم", "نظم", "حلل"];
  const foundImpact = impactWords.filter(w => lower.includes(w));
  if (foundImpact.length >= 4) {
    score += 15;
    strengths.push(isEn ? "Strong use of action verbs highlighting tangible results." : "استخدام ممتاز لأفعال الإنجاز والنتائج القابلة للقياس.");
  } else {
    weaknesses.push(isEn ? "Lacks strong active verbs; phrases sound too passive." : "قلة استخدام أفعال الإنجاز القوية التي تعكس المبادرة والتأثير المباشر.");
    actionPlan.push(isEn ? "Begin bullet points with dynamic verbs: 'Spearheaded', 'Optimized', 'Published', 'Engineered'." : "ابدأ كل نقطة بفعل إنجاز حركي: 'طوّر'، 'أشرف على'، 'حقّق نسبة'، 'قاد مبادرة'.");
  }

  // 4. Quantifiable metrics (numbers, %, metrics)
  const numbersFound = (cvText.match(/\d+(%|\+|\s*(years|users|projects|students|awards|سنة|مشروع|طالب|جائزة))?/g) || []).length;
  if (numbersFound >= 3) {
    score += 10;
    strengths.push(isEn ? "Contains quantifiable achievements and numbers." : "تحتوي السيرة الذاتية على أرقام ونسب مئوية تثبت الأثر العملي.");
  } else {
    actionPlan.push(isEn ? "Quantify your achievements with metrics (e.g. 'Increased efficiency by 25%', 'Mentored 15 students')." : "حوّل مهامك إلى أرقام ونتائج (مثال: 'إدارة فريق من 5 باحثين'، 'تحقيق معدل 3.8/4.0').");
  }

  const finalScore = Math.min(98, Math.max(35, score));
  let grade: AtsAnalysisResult["grade"] = "C";
  if (finalScore >= 90) grade = "A+";
  else if (finalScore >= 80) grade = "A";
  else if (finalScore >= 70) grade = "B";
  else if (finalScore >= 55) grade = "C";
  else grade = "D";

  // Match scholarships
  const matchedScholarships = SCHOLARSHIPS.filter(s => {
    return s.tags.some(t => lower.includes(t.toLowerCase())) ||
      s.interests.some(i => lower.includes(i.toLowerCase()));
  }).slice(0, 4);

  return {
    score: finalScore,
    grade,
    strengths,
    weaknesses,
    missingKeywords,
    actionPlan,
    wordCount,
    sectionsFound,
    matchedScholarships: matchedScholarships.length > 0 ? matchedScholarships : SCHOLARSHIPS.slice(0, 3),
  };
};

/**
 * Analyzes Statement of Purpose / Motivation Letters / Recommendation Letters in real time
 */
export const analyzeEssayDraft = (essayText: string, lang: "ar" | "en" = "ar"): EssayAnalysisResult => {
  const isEn = lang === "en";
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const paragraphs = essayText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  let toneScore = 50;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const passivePhrasesFound: string[] = [];
  const suggestedPhrases: { original: string; better: string; reason: string }[] = [];

  // Word count evaluation for admission essays (usually 400-900 words)
  if (wordCount >= 350 && wordCount <= 900) {
    toneScore += 20;
    strengths.push(isEn ? "Word count is well-aligned with standard scholarship essays (350-900 words)." : "حجم المقال متوازن ومناسب جدًا لمعايير خطابات المنح الدولية (350 - 900 كلمة).");
  } else if (wordCount < 200) {
    improvements.push(isEn ? "Essay is too brief. Deepen your personal motivation and future vision." : "المقال مقتضب جداً. توسّع في شرح دوافعك الشخصية وكيف ستفيد مجتمعك بعد التخرج.");
  } else if (wordCount > 1000) {
    improvements.push(isEn ? "Essay is lengthy. Academic committees prefer concise 2-page essays." : "المقال طويل نسبياً، يُفضّل اختصار الجمل الاستطرادية والتركيز على النقاط المحورية.");
  }

  // Structural paragraphs check
  if (paragraphCount >= 3 && paragraphCount <= 6) {
    toneScore += 15;
    strengths.push(isEn ? "Clear paragraph segmentation (Hook, Body evidence, Future impact, Conclusion)." : "هيكلية ممتازة وتقسيم متناسق للفقرات (المقدمة، البرهان، الأثر المستقبلي، والخاتمة).");
  } else {
    improvements.push(isEn ? "Structure your text into 4 distinct paragraphs: Introduction, Academic/Work Background, Why this scholarship, Long-term impact." : "قسّم النص إلى 4 فقرات واضحة: الدافع الأولي، الإنجازات السابقة، أسباب اختيار هذه المنحة بالذات، وخطة رد الجميل للمجتمع.");
  }

  // Academic tone & cliché detection
  const lower = essayText.toLowerCase();
  const cliches = [
    { bad: "i think", better: "I am convinced that / Evidence demonstrates", reason: "More assertive and academic" },
    { bad: "since i was a child", better: "My academic trajectory has consistently centered on", reason: "Avoid childhood clichés in scholarship letters" },
    { bad: "very passionate", better: "Committed to advancing / Intensely engaged in", reason: "Replaces vague passion with tangible commitment" },
    { bad: "أنا أعتقد", better: "تثبت الشواهد / إن مسيرتي الأكاديمية تؤكد", reason: "أسلوب رصين وجازم للمنح الأكاديمية" },
    { bad: "منذ طفولتي", better: "شكّلت دراستي وتجاربي المبكرة منطلقاً لـ", reason: "الابتعاد عن الكليشيهات العاطفية المكررة" },
    { bad: "أحب هذا المجال كثيرا", better: "ينصب شغفي العلمي والتطبيقي على تعميق أبحاث", reason: "استبدال العاطفة بالمصطلحات الأكاديمية الاحترافية" },
  ];

  cliches.forEach(c => {
    if (lower.includes(c.bad.toLowerCase())) {
      passivePhrasesFound.push(c.bad);
      suggestedPhrases.push({ original: c.bad, better: c.better, reason: c.reason });
    }
  });

  if (suggestedPhrases.length === 0 && wordCount > 80) {
    toneScore += 15;
    strengths.push(isEn ? "Sophisticated academic vocabulary without generic clichés." : "لغة أكاديمية رصينة خالية من التراكيب الاستهلاكية العاطفية.");
  } else if (suggestedPhrases.length > 0) {
    improvements.push(isEn ? "Found phrases that can be elevated to stronger academic phrasing." : "تم رصد عبارات عامية أو عاطفية يمكن رفع رصانتها الأكاديمية.");
  }

  const finalTone = Math.min(99, Math.max(40, toneScore));
  const readability = Math.min(95, Math.max(50, 75 + Math.round((wordCount / (paragraphCount || 1)) > 30 ? 10 : -10)));

  return {
    academicToneScore: finalTone,
    readabilityScore: readability,
    wordCount,
    paragraphCount,
    strengths,
    improvements,
    passivePhrasesFound,
    suggestedPhrases,
    overallSummary: isEn
      ? `Academic Readiness: ${finalTone}%. Your essay has solid foundations. Implementing targeted vocabulary refinements will place your application in top competition.`
      : `جاهزية الطرح الأكاديمي: ${finalTone}%. نصك يحتوي على نقاط قوة جيدة، وسيرتفع تصنيفه مباشرة بتطبيق التحسينات المقترحة للهيكل والمفردات.`,
  };
};
