import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import { Navbar } from './components/Navbar';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { PermissionModal } from './components/PermissionModal';
import { VoiceAssistantBanner } from './components/VoiceAssistantBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingBackground, FloatingTheme } from './components/FloatingBackground';
import { NavTab } from './types';

// Views
import { HomeView } from './views/HomeView';
import { AssistantView } from './views/AssistantView';
import { SymptomGuidanceView } from './views/SymptomGuidanceView';
import { ReportsView } from './views/ReportsView';
import { FoodNutritionView } from './views/FoodNutritionView';
import { DoctorsNearbyView } from './views/DoctorsNearbyView';
import { FitnessSupplementsView } from './views/FitnessSupplementsView';
import { PrescriptionsMedicinesView } from './views/PrescriptionsMedicinesView';
import { MentalWellbeingView } from './views/MentalWellbeingView';
import { PeriodTrackerView } from './views/PeriodTrackerView';
import { RemindersView } from './views/RemindersView';
import { LoginView } from './views/LoginView';
import { EmailVerificationPrompt } from './components/EmailVerificationPrompt';
import { AuthCallbackRecovery } from './components/AuthCallbackRecovery';

import { ShieldCheck, Heart, AlertOctagon, PhoneCall, Sparkles, Loader2 } from 'lucide-react';

const PROTECTED_TABS: NavTab[] = ['reports', 'medicines', 'period', 'reminders'];

const TAB_THEME_MAP: Record<NavTab, FloatingTheme> = {
  home: 'home',
  assistant: 'assistant',
  symptoms: 'symptoms',
  reports: 'reports',
  nutrition: 'nutrition',
  doctors: 'doctors',
  fitness: 'supplements',
  medicines: 'medicines',
  mental: 'mental-wellbeing',
  period: 'period',
  reminders: 'reminders',
  login: 'login'
};

const MainLayout: React.FC = () => {
  const {
    tab,
    setTab,
    toastMessage,
    openEmergencyModal,
    t,
    currentUser,
    isAuthLoading,
    logout,
    authCallbackError,
    clearAuthCallbackError
  } = useApp();

  // 1. Session verification loading state: prevent content flash (FOUC)
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-black shadow-lg shadow-teal-500/20 animate-pulse">
            <Heart className="w-8 h-8 fill-white/20" />
          </div>
          <Loader2 className="w-7 h-7 text-teal-600 dark:text-teal-400 animate-spin" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Verifying HealYaar Session...
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connecting to secure health vault
          </p>
        </div>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate:
  // Unauthenticated users CANNOT access any feature or navigation in the application
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
        <FloatingBackground theme="login" />
        <main id="main-content" className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <ErrorBoundary onNavigateHome={() => setTab('login')}>
            {authCallbackError ? (
              <AuthCallbackRecovery
                errorCode={authCallbackError.code}
                errorDescription={authCallbackError.description}
                onClearError={clearAuthCallbackError}
              />
            ) : (
              <LoginView />
            )}
          </ErrorBoundary>
        </main>
        <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-6 px-4 text-center text-xs text-slate-400 dark:text-slate-500 relative z-10">
          <p>© {new Date().getFullYear()} HealYaar • Accessible AI Health Companion. Row-level encrypted & verified.</p>
        </footer>
      </div>
    );
  }

  const renderActiveView = () => {
    const isProtected = PROTECTED_TABS.includes(tab);

    // Email verification requirement before accessing private health data (vaults, reports, cycle, prescriptions)
    if (isProtected && currentUser && !currentUser.emailConfirmed) {
      return <EmailVerificationPrompt user={currentUser} onSignOut={logout} />;
    }

    switch (tab) {
      case 'home':
        return <HomeView />;
      case 'assistant':
        return <AssistantView />;
      case 'symptoms':
        return <SymptomGuidanceView />;
      case 'reports':
        return <ReportsView />;
      case 'nutrition':
        return <FoodNutritionView />;
      case 'doctors':
        return <DoctorsNearbyView />;
      case 'fitness':
        return <FitnessSupplementsView />;
      case 'medicines':
        return <PrescriptionsMedicinesView />;
      case 'mental':
        return <MentalWellbeingView />;
      case 'period':
        return <PeriodTrackerView />;
      case 'reminders':
        return <RemindersView />;
      case 'login':
        return <LoginView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Skip to Main Content Link for Screen Readers & Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-xl focus:shadow-xl font-bold"
      >
        Skip to main content
      </a>

      {/* Left Vertical Sidebar & Sticky Top Header */}
      <Navbar />

      {/* Main Content & Footer Area Offset Beside Sidebar */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-64 xl:pl-72 transition-all duration-200 min-w-0 relative">
        {/* Atmospheric Floating Thematic Background Layer (Changes per page) */}
        <FloatingBackground
          theme={TAB_THEME_MAP[tab] || 'home'}
          className="md:left-20 lg:left-64 xl:left-72"
        />

        {/* Main Content View Container */}
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 relative z-10">
          <ErrorBoundary key={tab} onNavigateHome={() => setTab('home')}>
            {renderActiveView()}
          </ErrorBoundary>
        </main>

        {/* Accessible Footer with Translucent Glass */}
        <footer className="mt-auto border-t border-white/60 dark:border-slate-800/60 glass-card-subtle backdrop-blur-xl py-8 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-400 text-xs sm:text-sm relative z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
                  <Heart className="w-5 h-5 fill-white/20" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Heal<span className="text-teal-600 dark:text-teal-400">Yaar</span>
                  </span>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Accessible AI Health Companion • Verified Plain-Language Guidance
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={openEmergencyModal}
                  className="interactive-button px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Emergency SOS (112 / 108)</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-1.5">
              <p>
                <strong>Important Medical Disclaimer:</strong> HealYaar is an educational and communication support platform designed to explain medical terms, test reports, and health concepts in simple, plain language. It does not provide medical diagnosis, write prescriptions, recommend stopping or changing treatments, or replace the care of a licensed healthcare professional. All doctor listings, lab reports, and medicine catalogues are synthetic examples for demonstration.
              </p>
              <p>
                <strong>Privacy Guarantee:</strong> Health records, menstrual cycle entries, and medicine reminders entered into HealYaar remain strictly on your local browser. No personal health records are sold or transferred to third parties.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white shadow-xl border border-slate-700/80 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fade-in max-w-md"
        >
          <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Voice Banner */}
      <EmergencySOSModal />
      <PermissionModal />
      <VoiceAssistantBanner />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <VoiceAssistantProvider>
        <MainLayout />
      </VoiceAssistantProvider>
    </AppProvider>
  );
}

export default App;
