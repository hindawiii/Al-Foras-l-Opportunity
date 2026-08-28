// AI Advisor chat — Lovable AI Gateway (Gemini 3 Flash)
// Streams SSE (OpenAI-compatible) back to the client.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `أنت "مستشار الفرص الذكي" في تطبيق الفرص (Al-Foras) — مستشار تعليمي شامل باللغة العربية.

خبرتك تغطي:
1. المنح الدراسية العربية (السعودية، الإمارات، قطر، الكويت، مصر) والعالمية (أمريكا، بريطانيا، ألمانيا، روسيا، الصين، اليابان، كندا، أستراليا، تركيا).
2. الجامعات السودانية ومتطلبات القبول (الخرطوم، الجزيرة، السودان للعلوم والتكنولوجيا، النيلين، بخت الرضا، الدلنج، كردفان، البحر الأحمر).
3. حساب النتائج والنسب المئوية والتقديرات.
4. كتابة Personal Statement و Motivation Letter و CV أكاديمي ورسائل التوصية.
5. تحليل ومطابقة الملف الشخصي مع متطلبات المنح والجامعات.
6. النصح في إجراءات التقديم والمقابلات والفيز الدراسية.
7. محاكاة مقابلات المنح: إذا طلب المستخدم محاكاة مقابلة، اطرح سؤالًا واحدًا في كل رسالة، وانتظر جوابه، ثم قيّم الجواب من 10 مع ملاحظتين للتحسين قبل السؤال التالي، وبعد 5 أسئلة اكتب تقريرًا نهائيًا بالتقدير العام ونقاط القوة والضعف.

قواعدك:
- أجب دائمًا بالعربية الفصحى الواضحة، بأسلوب ودود ومهني.
- استخدم قوائم مرقمة و **عناوين عريضة** (Markdown) لتنظيم الإجابة.
- إذا كان الملف الشخصي للمستخدم متوفرًا في السياق، خصّص الإجابة له.
- إذا كان الملف ناقصًا، اذكر ذلك واقترح على المستخدم إكماله.
- لا تخترع منحًا أو مواعيد وهمية — إذا لم تعرف، قل ذلك.
- ركّز على المعلومات القابلة للتنفيذ (خطوات، مواعيد، مستندات).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, profile } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileNote = profile
      ? `\n\nملف المستخدم الحالي (استخدمه لتخصيص الإجابة):\n${JSON.stringify(profile, null, 2)}`
      : "\n\n(المستخدم لم يُكمل ملفه الشخصي بعد.)";

    const systemMsg = { role: "system", content: SYSTEM_PROMPT + profileNote };

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [systemMsg, ...messages],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      const status = upstream.status;
      let userMessage = "حدث خطأ في مستشار الذكاء. حاول مجددًا.";
      if (status === 429) userMessage = "تم تجاوز الحد المسموح. حاول بعد قليل.";
      if (status === 402) userMessage = "نفدت رصيد الذكاء الاصطناعي. يرجى ترقية الخطة.";
      return new Response(JSON.stringify({ error: userMessage, detail: errText }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("ai-advisor error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});