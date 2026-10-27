import React, { useState, useEffect } from 'react';
import { MailCheck, RefreshCw, AlertTriangle, ArrowLeft, CheckCircle2, ShieldAlert, Info, Terminal } from 'lucide-react';
import { authService, isValidEmail } from '../services/authService';

interface AuthCallbackRecoveryProps {
  errorCode: string;
  errorDescription: string;
  initialEmail?: string;
  onClearError: () => void;
  onResendSuccess?: (email: string) => void;
}

export const AuthCallbackRecovery: React.FC<AuthCallbackRecoveryProps> = ({
  errorCode,
  errorDescription,
  initialEmail = '',
  onClearError,
  onResendSuccess
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const isExpired = errorCode === 'otp_expired' || errorDescription.toLowerCase().includes('expired');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldownSeconds > 0) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ text: 'Please enter your email address.', type: 'error' });
      return;
    }
    if (!isValidEmail(trimmed)) {
      setFeedback({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await authService.resendVerificationEmail(trimmed);
      if (res.success) {
        setFeedback({
          text: `Fresh verification email sent to ${trimmed}! Please check your inbox and click the new link while keeping this app running.`,
          type: 'success'
        });
        setCooldownSeconds(30);
        if (onResendSuccess) onResendSuccess(trimmed);
      } else {
        setFeedback({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setFeedback({
        text: err.message || 'Unable to resend verification email. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/40 shadow-xl space-y-6">
        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200/80 dark:border-amber-800/60">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Supabase Auth: {errorCode}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isExpired ? 'Verification Link Expired or Already Used' : 'Authentication Link Error'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {errorDescription || 'The link you clicked is invalid or has expired. For your security, email verification links are single-use and time-limited.'}
          </p>
        </div>

        {/* Local App & ERR_CONNECTION_REFUSED Setup Guidance */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-xs space-y-2 text-slate-700 dark:text-slate-300">
          <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>Did you see &quot;ERR_CONNECTION_REFUSED&quot;?</span>
          </div>
          <p className="leading-relaxed">
            When you click verification links in your email, your browser tries to connect to this app at{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px] text-teal-700 dark:text-teal-300">
              {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}
            </code>.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Terminal className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>Make sure the dev server is active: <code className="font-mono">npm run dev</code> on port 5173.</span>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.text}</span>
          </div>
        )}

        {/* Resend Form */}
        <form onSubmit={handleResend} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="recovery-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Enter Your Account Email
            </label>
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              disabled={isSubmitting || cooldownSeconds > 0}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cooldownSeconds > 0 || !email.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending fresh link...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <>
                <MailCheck className="w-4 h-4" />
                <span>Resend available in {cooldownSeconds}s</span>
              </>
            ) : (
              <>
                <MailCheck className="w-4 h-4" />
                <span>Send Fresh Verification Link</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Sign In button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClearError}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
