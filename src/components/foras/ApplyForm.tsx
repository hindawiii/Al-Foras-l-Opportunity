import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Scholarship } from "@/lib/mockData";
import { applicationsStore } from "@/lib/applicationsStorage";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  scholarship: Scholarship | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const ApplyForm = ({ scholarship, open, onOpenChange }: Props) => {
  const { t, lang, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [motivation, setMotivation] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!scholarship) return;
    if (!name.trim() || !email.trim() || !motivation.trim()) {
      toast.error(isRtl ? "الرجاء تعبئة جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }
    setBusy(true);
    try {
      applicationsStore.upsertFromScholarship(scholarship, "applied", {
        notes: `${name} · ${email}${phone ? " · " + phone : ""}\n\n${motivation}`,
      });
    } catch (e) {
      setBusy(false);
      toast.error(isRtl ? "تعذر حفظ الطلب" : "Could not save application");
      return;
    }
    setBusy(false);
    toast.success(isRtl ? "تم إرسال طلبك بنجاح" : "Application submitted successfully");
    onOpenChange(false);
    setName(""); setPhone(""); setMotivation("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir={dir}
        className="h-[100dvh] max-h-[100dvh] md:h-[90vh] md:max-h-[90vh] md:max-w-xl md:rounded-3xl rounded-none w-full p-0 flex flex-col overflow-hidden mx-auto bg-card border-primary/30 shadow-2xl"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="shrink-0 p-4 sm:p-5 border-b border-border/80 bg-card/95 backdrop-blur-md relative pe-16">
            <SheetHeader>
              <SheetTitle className={`${alignClass} font-display text-xl sm:text-2xl text-gold-gradient`}>
                {isRtl ? "التقديم داخل التطبيق" : "In-App Application"}
              </SheetTitle>
              <p className={`text-xs sm:text-sm text-muted-foreground ${alignClass} mt-1 truncate`}>{scholarship?.title}</p>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-8">
            <div className="space-y-1.5">
              <Label className="text-foreground">{isRtl ? "الاسم الكامل *" : "Full Name *"}</Label>
              <Input value={name} onChange={e => setName(e.target.value)}
                className={`bg-input border-gold/30 ${alignClass}`} placeholder={isRtl ? "اكتب اسمك الكامل" : "Enter your full name"} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">{isRtl ? "البريد الإلكتروني *" : "Email Address *"}</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                dir="ltr" className="bg-input border-gold/30 text-left" placeholder="example@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">{isRtl ? "رقم الهاتف" : "Phone Number"}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)}
                dir="ltr" className="bg-input border-gold/30 text-left" placeholder="+966..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">{isRtl ? "رسالة الدوافع *" : "Motivation Letter *"}</Label>
              <Textarea value={motivation} onChange={e => setMotivation(e.target.value)}
                className={`bg-input border-gold/30 ${alignClass} min-h-32`}
                placeholder={isRtl ? "لماذا تتقدم لهذه المنحة؟ ما هي أهدافك؟" : "Why are you applying for this scholarship? What are your goals?"} />
            </div>
            <Button variant="luxe" size="lg" className="w-full" onClick={submit} disabled={busy}>
              <Send className={`w-4 h-4 ${isRtl ? "ml-2" : "mr-2"}`} />
              {busy ? (isRtl ? "جاري الإرسال..." : "Submitting...") : (isRtl ? "إرسال الطلب" : "Submit Application")}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              {isRtl
                ? 'يُحفظ طلبك في "طلباتي" ويُرسل إلى الجهة المعنية عبر مصدرها الرسمي.'
                : 'Your application is saved in "Applications" and submitted to the official authority.'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
