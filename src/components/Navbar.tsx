import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavTab, SupportedLanguage } from '../types';
import { regionalOptions } from '../i18n/translations';
import { VOICE_LONG_PRESS_MS } from '../context/VoiceAssistantContext';
import {
  Heart,
  Home,
  MessageSquareHeart,
  Activity,
  FileSpreadsheet,
  UtensilsCrossed,
  Stethoscope,
  Dumbbell,
  Pill,
  Brain,
  CalendarHeart,
  BellRing,
  Mic,
  MicOff,
  Sun,
  Moon,
  AlertOctagon,
  Languages,
  ShieldCheck,
  Menu,
  X,
  Type,
  ChevronRight,
  Radio,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    tab,
    setTab,
    language,
    setLanguage,
    t,
    textSize,
    setTextSize,
    highContrast,
    toggleHighContrast,
    theme,
    toggleTheme,
    currentUser,
    isAuthenticated,
    logout,
    openEmergencyModal,
    isListening,
    startVoiceListening,
    stopVoiceListening
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: t.nav.home, icon: <Home className="w-4 h-4 flex-shrink-0" /> },
    { id: 'assistant', label: t.nav.assistant, icon: <MessageSquareHeart className="w-4 h-4 flex-shrink-0" /> },
    { id: 'symptoms', label: t.nav.symptoms, icon: <Activity className="w-4 h-4 flex-shrink-0" /> },
    { id: 'reports', label: t.nav.reports, icon: <FileSpreadsheet className="w-4 h-4 flex-shrink-0" /> },
    { id: 'nutrition', label: t.nav.nutrition, icon: <UtensilsCrossed className="w-4 h-4 flex-shrink-0" /> },
    { id: 'doctors', label: t.nav.doctors, icon: <Stethoscope className="w-4 h-4 flex-shrink-0" /> },
    { id: 'fitness', label: t.nav.fitness, icon: <Dumbbell className="w-4 h-4 flex-shrink-0" /> },
    { id: 'medicines', label: t.nav.medicines, icon: <Pill className="w-4 h-4 flex-shrink-0" /> },
    { id: 'mental', label: t.nav.mental, icon: <Brain className="w-4 h-4 flex-shrink-0" /> },
    { id: 'period', label: t.nav.period, icon: <CalendarHeart className="w-4 h-4 flex-shrink-0" />, badge: '🌸' },
    { id: 'reminders', label: t.nav.reminders, icon: <BellRing className="w-4 h-4 flex-shrink-0" /> },
  ];

  const handleTabClick = (newTab: NavTab) => {
    setTab(newTab);
    setMobileMenuOpen(false);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  };

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('normal');
  };

  const currentActiveItem = navItems.find((item) => item.id === tab) || navItems[0];

  return (
    <>
      {/* =============================================================
          1. FIXED VERTICAL SIDEBAR (Desktop & Tablet)
          Minimal, calm, modern SaaS aesthetic (Linear × Apple Health)
      ============================================================= */}
      <aside
        aria-label="Main application navigation sidebar"
        className="hidden md:flex fixed top-0 left-0 bottom-0 h-screen z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex-col shadow-xs transition-all duration-200 md:w-20 lg:w-64 xl:w-72 select-none"
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer group w-full"
            title="HealYaar Home"
          >
            {/* Heart Logo Icon */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
              <Heart className="w-5 h-5 fill-white/20" />
            </div>

            {/* Desktop Brand Text */}
            <div className="hidden lg:block min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Heal<span className="text-teal-600 dark:text-teal-400">Yaar</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 flex-shrink-0">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium">
                Health Companion
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Navigation Links */}
        <nav
          aria-label="Application sections"
          className="flex-1 overflow-y-auto px-2 lg:px-3 py-3 space-y-1 scrollbar-thin"
        >
          {navItems.map((item) => {
            const isActive = tab === item.id;
            return (
              <React.Fragment key={item.id}>
                {/* Desktop Version (Icon + Label + Indicator) */}
                <button
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`hidden lg:flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group text-left relative ${
                    isActive
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/80 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span className="w-1 h-3.5 rounded-full bg-teal-600 dark:bg-teal-400 flex-shrink-0 -ml-1" />
                    )}
                    <div
                      className={`transition-transform duration-200 flex-shrink-0 group-hover:scale-105 ${
                        isActive
                          ? 'text-teal-700 dark:text-teal-300'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.badge && (
                      <span className="text-[11px] opacity-80">{item.badge}</span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive
                          ? 'text-teal-600 dark:text-teal-400 translate-x-0.5'
                          : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1'
                      }`}
                    />
                  </div>
                </button>

                {/* Tablet Version (Compact Icon + Subtext) */}
                <button
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={`lg:hidden w-14 h-12 mx-auto flex flex-col items-center justify-center rounded-xl transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-bold truncate max-w-full text-center leading-tight mt-0.5 px-0.5">
                    {item.label.split(' ')[0]}
                  </span>

                  {/* Tablet Floating Tooltip */}
                  <div className="hidden group-hover:block absolute left-16 z-50 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                    {item.label} {item.badge}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
          {/* Desktop Voice Status Pill */}
          <div className="hidden lg:flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                {isListening ? 'Voice Active' : `Spacebar (${(VOICE_LONG_PRESS_MS / 1000).toFixed(1)}s)`}
              </span>
            </div>
            <button
              onClick={handleMicToggle}
              className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
              title="Toggle Hands-Free Voice Assistant"
            >
              {isListening ? 'Stop' : 'Voice'}
            </button>
          </div>

          {/* Logged-In User Profile Card & Sign Out in Sidebar Footer */}
          {isAuthenticated && currentUser && (
            <div className="hidden lg:block p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Sign out of your HealYaar account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Desktop On-Device Privacy Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[11px] truncate">100% On-Device Privacy</span>
          </div>

          {/* Emergency SOS Button */}
          <button
            onClick={openEmergencyModal}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-95"
            title="Emergency SOS Medical Assistance"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden lg:inline">Emergency SOS (112)</span>
          </button>
        </div>
      </aside>

      {/* =============================================================
          2. STICKY TOP HEADER
          Aligned beside sidebar (md:pl-20 lg:pl-64 xl:pl-72)
      ============================================================= */}
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 md:pl-20 lg:pl-64 xl:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Active Section Breadcrumb Title & Mobile Hamburger */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Brand Title */}
            <div
              onClick={() => handleTabClick('home')}
              className="md:hidden flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-black flex-shrink-0">
                <Heart className="w-4 h-4 fill-white/20" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                Heal<span className="text-teal-600 dark:text-teal-400">Yaar</span>
              </span>
            </div>

            {/* Desktop / Tablet Section Breadcrumb */}
            <div className="hidden md:flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 flex-shrink-0">
                {currentActiveItem.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {currentActiveItem.label}
                  </h2>
                  {currentActiveItem.badge && (
                    <span className="text-xs">{currentActiveItem.badge}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Voice Toggle, Theme, Text Size, Language */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Obvious Microphone Button */}
            <button
              onClick={handleMicToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs transition-all shadow-2xs active:scale-95 border ${
                isListening
                  ? 'bg-rose-600 border-rose-700 text-white animate-mic-active'
                  : 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
              }`}
              title={isListening ? t.stopListening : t.tapToSpeak}
              aria-label={isListening ? t.stopListening : t.tapToSpeak}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-white animate-pulse" />
                  <span className="font-extrabold">{t.stopListening}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="hidden sm:inline">{t.tapToSpeak}</span>
                  <span className="sm:hidden">Voice</span>
                </>
              )}
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-teal-600" />
              )}
            </button>

            {/* Text Size Switcher */}
            <button
              onClick={cycleTextSize}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-bold text-xs transition-colors"
              title={t.textSize}
              aria-label={`Change text size. Currently ${textSize}`}
            >
              <Type className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs shadow-2xs transition-colors"
                aria-haspopup="true"
                aria-expanded={langDropdownOpen}
                aria-label={t.languageSelect}
              >
                <Languages className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="uppercase font-extrabold">{language}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Primary Languages
                  </div>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                      language === 'en' ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>English (Default)</span>
                    {language === 'en' && <span className="text-teal-600 dark:text-teal-400">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                      language === 'hi' ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <span className="text-teal-600 dark:text-teal-400">✓</span>}
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Regional Indian Languages
                  </div>
                  {regionalOptions.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => {
                        setLanguage(r.code as SupportedLanguage);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                        language === r.code ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{r.name}</span>
                      {language === r.code && <span className="text-teal-600 dark:text-teal-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Sign In Controls */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="interactive-button flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold text-xs shadow-2xs transition-all"
                  aria-label="User profile menu"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-xs animate-fade-in space-y-2">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleTabClick('login');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Account Details</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleTabClick('login')}
                className={`interactive-button flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-2xs border ${
                  tab === 'login'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300'
                }`}
                title="Sign in to your HealYaar account"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =============================================================
          3. MOBILE NAVIGATION DRAWER
      ============================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50 p-4 overflow-y-auto border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Health Navigation
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile User Authentication Status Banner */}
          <div className="mb-3">
            {isAuthenticated && currentUser ? (
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleTabClick('login')}
                className="w-full p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Register</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-1.5 pb-12">
            {navItems.map((item) => {
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between w-full p-3 rounded-2xl text-sm font-bold text-left transition-all ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl ${isActive ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && <span className="text-xs">{item.badge}</span>}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
