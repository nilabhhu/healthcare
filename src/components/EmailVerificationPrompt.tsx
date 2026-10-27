import React, { useState } from 'react';
import { AuthUser, authService } from '../services/authService';
import { MailCheck, RefreshCw, LogOut, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface EmailVerificationPromptProps {
  user: AuthUser;
  onSignOut: () => void;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({ user, onSignOut }) => {
  const { showToast } = useApp();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      const result = await authService.resendVerificationEmail(user.email);
      if (result.success) {
        setResendStatus('Verification email sent! Please check your inbox and spam folder.');
        showToast('Verification email sent');
      } else {
        setResendStatus(result.message);
      }
    } catch {
      setResendStatus('Failed to send verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const refreshed = await authService.getCurrentUser();
      if (refreshed?.emailConfirmed) {
        showToast('Email verified! Accessing your health dashboard...');
        window.location.reload();
      } else {
        showToast('Email not yet verified. Please click the link in your inbox.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in">
      <div className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-amber-200/80 dark:border-amber-900/40 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800/60">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Verification Required</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Please Verify Your Email
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            To ensure the privacy and security of your personal health data, prescriptions, and cycle records, HealYaar requires email verification before accessing private health vaults.
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
              {user.email}
            </span>
          </div>
        </div>

        {/* Local App & ERR_CONNECTION_REFUSED tip */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1 text-left">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Connection & Link Advice</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Keep HealYaar running (<code className="font-mono text-teal-600 dark:text-teal-300">npm run dev</code> on port 5173) before clicking the verification link in your email to avoid <code className="font-mono text-rose-500">ERR_CONNECTION_REFUSED</code>.
          </p>
        </div>

        {resendStatus && (
          <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 text-xs text-teal-800 dark:text-teal-200 font-medium">
            {resendStatus}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="interactive-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isResending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Resend Verification Email</span>
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="interactive-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>I've Verified My Email</span>
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out and use a different account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
