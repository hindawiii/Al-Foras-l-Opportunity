import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import AuthPage from "./pages/auth/AuthPage";
import AuthCallback from "./pages/auth/AuthCallback";
import ResetPassword from "./pages/auth/ResetPassword";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import { AIAdvisor } from "@/components/foras/AIAdvisor";
import { ErrorBoundary } from "@/components/foras/ErrorBoundary";
import { dynamicStore } from "@/lib/dynamicStore";
import { selfHealingEngine } from "@/lib/selfHealingEngine";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    selfHealingEngine.init();
    dynamicStore.syncWithCloud();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <LanguageProvider>
          <SettingsProvider>
            <AuthProvider>
              <TooltipProvider>
                <Sonner position="top-center" richColors closeButton />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/app" element={<Index />} />
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/login" element={<AdminPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
