import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6"
          style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
        >
          <div className="max-w-md w-full glass rounded-3xl p-6 sm:p-8 border border-primary/30 text-center shadow-luxe">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              حدث خطأ غير متوقع أثناء تحميل المحتوى
            </h2>

            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              تم حماية الجلسة والبيانات بنجاح. يمكنك إعادة المحاولة لتحديث الواجهة فوراً.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="luxe"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 shadow-gold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحديث الصفحة</span>
              </Button>

              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="border-primary/30 hover:bg-primary/10 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>الصفحة الرئيسية</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
