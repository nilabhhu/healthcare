import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  onNavigateHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HealYaar ErrorBoundary caught an unexpected rendering error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleBackToHome = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 px-4 max-w-xl mx-auto animate-fade-in" role="alert">
          <div className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800/60">
                <span>Section Notice</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {this.props.fallbackTitle || "This section couldn't load"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                A temporary display issue occurred while loading this section. You can try refreshing it or return to the main dashboard safely.
              </p>
            </div>

            {/* Error detail (if available, subtle) */}
            {this.state.error?.message && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs font-mono text-slate-500 dark:text-slate-400 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="interactive-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={this.handleBackToHome}
                className="interactive-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
