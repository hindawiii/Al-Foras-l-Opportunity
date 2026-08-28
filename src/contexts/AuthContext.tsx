import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// TODO: إعادة تفعيل تسجيل الدخول الحقيقي
// راجع AUTH_ROADMAP.md — حاليًا نستخدم "دخول ضيف تلقائي" بسبب توقف Supabase التلقائي كل 7 أيام.
// الكود الأصلي محفوظ بالكامل في الأسفل (محاط بـ /* ORIGINAL_AUTH */).

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, isGuest: true, signOut: async () => {} });

const getOrCreateGuestId = (): string => {
  let id = localStorage.getItem("guest_id");
  if (!id) {
    // UUID-like id يبقى ثابتاً للجلسات اللاحقة
    id = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("guest_id", id);
    localStorage.setItem("guest_created", new Date().toISOString());
  }
  return id;
};

const buildGuestUser = (): User => {
  const id = getOrCreateGuestId();
  return {
    id,
    email: undefined,
    app_metadata: { provider: "guest" },
    user_metadata: { full_name: "ضيف", isGuest: true },
    aud: "authenticated",
    created_at: localStorage.getItem("guest_created") || new Date().toISOString(),
  } as unknown as User;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guest = buildGuestUser();
    localStorage.setItem(
      "user",
      JSON.stringify({ id: guest.id, name: "ضيف", email: null, isGuest: true, loginAt: new Date().toISOString() })
    );
    console.log("✅ Guest auto-login:", guest.id);
    setUser(guest);
    setLoading(false);
  }, []);

  const signOut = async () => {
    // مسح بيانات الضيف المحلية فقط (لا اتصال بالخادم)
    const gid = localStorage.getItem("guest_id");
    Object.keys(localStorage).forEach((k) => {
      if (gid && k.startsWith(`guest_${gid}`)) localStorage.removeItem(k);
    });
    localStorage.removeItem("guest_id");
    localStorage.removeItem("guest_created");
    localStorage.removeItem("user");
    setUser(buildGuestUser());
  };

  return (
    <Ctx.Provider value={{ user, session: null, loading, isGuest: true, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);

/* ORIGINAL_AUTH — محفوظ للاستعادة لاحقًا، لا تحذف
export const AuthProviderReal = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, loading, isGuest: false, signOut }}>{children}</Ctx.Provider>;
};
*/
