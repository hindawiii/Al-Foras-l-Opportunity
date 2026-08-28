import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Globe2, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./Logo";

const slides = [
  {
    icon: GraduationCap,
    title: "بطاقات المنح الذكية",
    desc: "اسحب لليمين لحفظ المنحة، ولليسار لتجاهلها. واجهة سريعة وجذابة تجعل اكتشاف الفرص متعة.",
  },
  {
    icon: Globe2,
    title: "أخبار العالم والمركز الاقتصادي",
    desc: "ابقَ على اطلاع بأحدث الأخبار العالمية والمحلية، الرياضة، الاقتصاد، والطقس في مكان واحد.",
  },
  {
    icon: Sparkles,
    title: "ذكاء اصطناعي يربط الفرص",
    desc: "نحلل الأخبار العالمية ونربطها بفرص منح حقيقية تناسب تخصصك ومهاراتك تلقائياً.",
  },
];

export const Onboarding = ({ onDone }: { onDone: () => void }) => {
  const [i, setI] = useState(0);
  const slide = slides[i];
  const Icon = slide.icon;
  const last = i === slides.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.4), transparent 70%)" }} />
      <div className="p-6 flex justify-between items-center relative z-10">
        <BrandMark />
        <button onClick={onDone} className="text-sm text-muted-foreground hover:text-primary transition-colors">
          تخطي
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center max-w-md"
          >
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-gold-gradient rounded-full blur-3xl opacity-40 scale-150" />
              <div className="relative w-32 h-32 rounded-3xl bg-card-gradient border-gold border-2 flex items-center justify-center shadow-gold">
                <Icon className="w-16 h-16 text-primary" strokeWidth={1.3} />
              </div>
            </div>
            <h2 className="font-display text-4xl text-gold-gradient mb-5 leading-tight">{slide.title}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{slide.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 space-y-6 relative z-10">
        <div className="flex justify-center gap-2">
          {slides.map((_, idx) => (
            <motion.div
              key={idx}
              className="h-1.5 rounded-full bg-gold-gradient"
              animate={{ width: idx === i ? 32 : 8, opacity: idx === i ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <Button
          onClick={() => last ? onDone() : setI(i + 1)}
          variant="luxe"
          size="lg"
          className="w-full"
        >
          {last ? "ابدأ الآن" : "التالي"}
          <ChevronLeft className="mr-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
