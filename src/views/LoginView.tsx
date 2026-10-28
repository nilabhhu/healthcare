import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AuthIllustration } from '../components/ContextualIllustrations';
import { authService, isValidEmail } from '../services/authService';
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
  Loader2,
  KeyRound,
  ArrowLeft,
  Info
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
    requestPasswordReset,
    updatePassword,
    tab,
    setTab,
    intendedTab,
    setIntendedTab,
    showToast
  } = useApp();

  // Mode: 'login' | 'signup' | 'forgot_password' | 'reset_password'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password' | 'reset_password'>(() => {
    // Check if recovery mode triggered by auth listener or URL hash
    if (
      sessionStorage.getItem('healyaar_auth_recovery_mode') === 'true' ||
      window.location.hash.includes('type=recovery')
    ) {
      sessionStorage.removeItem('healyaar_auth_recovery_mode');
      return 'reset_password';
    }
    return 'login';
  });

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>(() => authService.getRememberedIdentifier());
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<'name' | 'email' | 'password' | 'confirmPassword' | 'general' | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Input refs for accessible auto-focus
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Clear errors when user edits fields
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorField === 'email' || errorField === 'general') {
      setErrorMessage(null);
      setErrorField(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorField === 'password' || errorField === 'general') {
      setErrorMessage(null);
      setErrorField(null);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errorField === 'confirmPassword' || errorField === 'general') {
      setErrorMessage(null);
      setErrorField(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errorField === 'name' || errorField === 'general') {
      setErrorMessage(null);
      setErrorField(null);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setErrorField(null);
    setInfoMessage(null);

    // 1. Reset Password Flow
    if (authMode === 'reset_password') {
      if (!password) {
        setErrorMessage('Please enter a new password.');
        setErrorField('password');
        passwordInputRef.current?.focus();
        return;
      }
      if (password.length < 8) {
        setErrorMessage('New password must be at least 8 characters long.');
        setErrorField('password');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        setErrorField('confirmPassword');
        return;
      }

      setIsSubmitting(true);
      const res = await updatePassword(password);
      setIsSubmitting(false);

      if (res.success) {
        setInfoMessage(res.message);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setAuthMode('login');
        }, 2000);
      } else {
        setErrorMessage(res.message);
      }
      return;
    }

    // 2. Sign-up field validations
    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        setErrorField('name');
        return;
      }
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email.');
      setErrorField('email');
      emailInputRef.current?.focus();
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      setErrorField('email');
      emailInputRef.current?.focus();
      return;
    }

    // 3. Forgot Password Flow
    if (authMode === 'forgot_password') {
      setIsSubmitting(true);
      const res = await requestPasswordReset(trimmedEmail);
      setIsSubmitting(false);
      if (res.success) {
        setInfoMessage(res.message);
      } else {
        setErrorMessage(res.message);
        setErrorField('email');
      }
      return;
    }

    // 4. Password validation for login & signup
    if (!password) {
      setErrorMessage('Please enter your password.');
      setErrorField('password');
      passwordInputRef.current?.focus();
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setErrorField('password');
      passwordInputRef.current?.focus();
      return;
    }

    // Confirm password check for signup
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        setErrorField('confirmPassword');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const result = await login({
          email: trimmedEmail,
          password,
          rememberMe
        });

        if (result.success) {
          const destination = intendedTab || 'home';
          setIntendedTab(null);
          setTab(destination);
        } else {
          setErrorMessage(result.error || 'Incorrect email or password.');
          setErrorField(result.field === 'email' || result.field === 'emailOrPhone' ? 'email' : (result.field || 'general'));
        }
      } else if (authMode === 'signup') {
        const result = await signup({
          name: name.trim(),
          email: trimmedEmail,
          password,
          rememberMe
        });

        if (result.success) {
          if (result.user && !result.user.emailConfirmed) {
            setInfoMessage(
              (result.message || 'Account created! Please check your email inbox to confirm your account before logging in.') +
                ' (Note: Keep HealYaar running on port 5173 when clicking the verification link).'
            );
            setAuthMode('login');
          } else {
            const destination = intendedTab || 'home';
            setIntendedTab(null);
            setTab(destination);
          }
        } else {
          setErrorMessage(result.error || 'Unable to create account. Please check your details.');
          setErrorField(result.field === 'email' || result.field === 'emailOrPhone' ? 'email' : (result.field || 'general'));
        }
      }
    } catch {
      setErrorMessage('A connection error occurred. Please try again.');
      setErrorField('general');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already authenticated and visits the login page
  if (isAuthenticated && currentUser) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in">
        <div className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Signed In</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
              You are currently authenticated as <strong className="text-slate-800 dark:text-slate-200">{currentUser.email}</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                const dest = intendedTab || 'home';
                setIntendedTab(null);
                setTab(dest);
              }}
              className="interactive-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2"
            >
              <span>{intendedTab ? `Continue to ${intendedTab}` : 'Go to Health Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="interactive-button w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getFriendlyIntendedTabName = (target: string | null) => {
    switch (target) {
      case 'period':
        return 'Period Tracker & Cycle Logs';
      case 'medicines':
        return 'Prescription Digital Cabinet';
      case 'reports':
        return 'Medical Reports & Test Explainer';
      case 'reminders':
        return 'Medication Reminders';
      default:
        return 'Private Health Records';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-2 sm:px-4 animate-fade-in">
      {/* Container Card with Two-Column Desktop Layout */}
      <div className="interactive-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* =============================================================
            LEFT SIDE (45% on Desktop, ~5 cols): Branding & Visual
        ============================================================= */}
        <section
          aria-label="HealYaar Branding & Trust"
          className="lg:col-span-5 bg-gradient-to-br from-teal-50/70 via-emerald-50/30 to-slate-50/50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-950 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 relative overflow-hidden"
        >
          {/* Subtle Ambient Background Orbs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-teal-400/10 dark:bg-teal-400/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-emerald-400/10 dark:bg-emerald-400/5 blur-2xl pointer-events-none" />

          {/* Top: Brand Mark */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
                <Heart className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Heal<span className="text-teal-600 dark:text-teal-400">Yaar</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider">
                  AI
                </span>
              </div>
            </div>

            {/* Welcoming Headline & Supporting Copy */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Welcome to HealYaar
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-normal">
                Private, accessible health companion
              </p>
            </div>
          </div>

          {/* Center: Elegant Healthcare Line-Art Illustration */}
          <div className="relative z-10 py-6 sm:py-8 flex items-center justify-center">
            <div className="p-4 rounded-3xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xs border border-teal-100/60 dark:border-teal-900/40 shadow-xs">
              <AuthIllustration size="lg" className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
          </div>

          {/* Bottom: On-Device Privacy Trust Guarantee */}
          <div className="relative z-10 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Row-Level Encrypted & Private</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Your health notes, cycle entries, and prescriptions are protected with user-isolated security. We never sell or share your data.
            </p>
          </div>
        </section>

        {/* =============================================================
            RIGHT SIDE (55% on Desktop, ~7 cols): Authentication Form
        ============================================================= */}
        <section
          aria-label="User Authentication Form"
          className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900"
        >
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Friendly Notification if redirected from a protected route */}
            {intendedTab && (
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
                <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Sign in required</p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Sign in to access your {getFriendlyIntendedTabName(intendedTab)}. You will be returned there automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Form Header */}
            <div className="space-y-1 text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {authMode === 'login' && 'Welcome to HealYaar'}
                {authMode === 'signup' && 'Create your account'}
                {authMode === 'forgot_password' && 'Reset your password'}
                {authMode === 'reset_password' && 'Set a new password'}
              </h2>
              {authMode === 'forgot_password' && (
                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                  Enter your email to receive a secure reset link.
                </p>
              )}
              {authMode === 'reset_password' && (
                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                  Enter your new password below.
                </p>
              )}
            </div>

            {/* Error Message Alert Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Informational Message Banner */}
            {infoMessage && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-teal-800 dark:text-teal-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{infoMessage}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Name Field (Sign-up mode only) */}
              {authMode === 'signup' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g. Dr. Priya Sharma"
                      aria-invalid={errorField === 'name'}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-slate-50/70 dark:bg-slate-800/60 border ${
                        errorField === 'name'
                          ? 'border-rose-500 ring-2 ring-rose-300/30'
                          : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 dark:focus:border-teal-400'
                      } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none`}
                    />
                  </div>
                </div>
              )}

              {/* Email Input Field (Hidden during Reset Password mode) */}
              {authMode !== 'reset_password' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      ref={emailInputRef}
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email"
                      aria-invalid={errorField === 'email'}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium bg-slate-50/70 dark:bg-slate-800/60 border ${
                        errorField === 'email'
                          ? 'border-rose-500 ring-2 ring-rose-300/30'
                          : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 dark:focus:border-teal-400'
                      } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none`}
                    />
                  </div>
                  {errorField === 'email' && errorMessage && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-1 animate-fade-in">
                      {errorMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field (Hidden in Forgot Password mode) */}
              {authMode !== 'forgot_password' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      {authMode === 'reset_password' ? 'New Password' : 'Password'}
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      ref={passwordInputRef}
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={handlePasswordChange}
                      minLength={8}
                      placeholder={authMode === 'reset_password' ? 'At least 8 characters' : 'Enter your password (min 8 chars)'}
                      aria-invalid={errorField === 'password'}
                      className={`w-full pl-10 pr-11 py-3 rounded-2xl text-sm font-medium bg-slate-50/70 dark:bg-slate-800/60 border ${
                        errorField === 'password'
                          ? 'border-rose-500 ring-2 ring-rose-300/30'
                          : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 dark:focus:border-teal-400'
                      } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors focus:outline-none focus:text-teal-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authMode === 'signup' && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                      Must be at least 8 characters long.
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Password Field (In Signup and Reset Password modes) */}
              {(authMode === 'signup' || authMode === 'reset_password') && (
                <div className="space-y-1.5 animate-fade-in">
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Re-enter your password"
                      aria-invalid={errorField === 'confirmPassword'}
                      className={`w-full pl-10 pr-11 py-3 rounded-2xl text-sm font-medium bg-slate-50/70 dark:bg-slate-800/60 border ${
                        errorField === 'confirmPassword'
                          ? 'border-rose-500 ring-2 ring-rose-300/30'
                          : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 dark:focus:border-teal-400'
                      } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors focus:outline-none focus:text-teal-600"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Row with Remember Me & Forgot Password (Only in Login Mode) */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-800 cursor-pointer"
                    />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setErrorMessage(null);
                      setInfoMessage(null);
                    }}
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors focus:outline-none focus:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="interactive-button w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>
                        {authMode === 'login'
                          ? 'Signing in...'
                          : authMode === 'signup'
                          ? 'Creating account...'
                          : authMode === 'reset_password'
                          ? 'Updating password...'
                          : 'Sending reset link...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === 'login'
                          ? 'Sign In'
                          : authMode === 'signup'
                          ? 'Create Account'
                          : authMode === 'reset_password'
                          ? 'Update Password'
                          : 'Request Password Reset'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Mode Switcher / Links at Bottom */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2">
              {authMode === 'login' && (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                      setInfoMessage(null);
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors"
                  >
                    Create Account
                  </button>
                </p>
              )}

              {authMode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                      setInfoMessage(null);
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {(authMode === 'forgot_password' || authMode === 'reset_password') && (
                <p>
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                      setInfoMessage(null);
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </p>
              )}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
