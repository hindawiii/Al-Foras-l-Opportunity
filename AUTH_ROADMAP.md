# خارطة إعادة تفعيل تسجيل الدخول

## الوضع الحالي
تم إلغاء تسجيل الدخول مؤقتًا واستبداله بـ **دخول ضيف تلقائي**
بسبب توقف مشروع Supabase التلقائي كل 7 أيام في الخطة المجانية.

## متى نُعيد التفعيل؟
- عند ترقية Supabase إلى Pro، أو استخدام Cron Ping لإبقاء المشروع نشطًا.

## كيف؟
1. في `src/contexts/AuthContext.tsx`: استبدل `AuthProvider` الحالي بالكود المحفوظ ضمن `/* ORIGINAL_AUTH */`.
2. في `src/pages/Index.tsx`: ألغِ التعليق عن `useEffect` الذي يحوّل لـ `/auth`.
3. في `src/pages/Landing.tsx`: ألغِ التعليق عن زر `landingCtaSecondary` وعن `goAuth`.
4. تأكد أن المسارات التالية تعمل: `/auth`, `/auth/callback`, `/reset-password`.
5. اختبر على الحاسوب والهاتف قبل النشر.

## ملاحظات
- بيانات الضيف محفوظة في `localStorage` تحت مفاتيح `guest_<id>_*`.
- ملفات الـ Auth (AuthPage, AuthCallback, ResetPassword) لم تُحذف.
- Supabase client + جداول profiles لم تُمَس.
