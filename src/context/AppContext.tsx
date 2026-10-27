import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavTab,
  SupportedLanguage,
  TextSize,
  ReminderItem,
  PeriodCycleEntry,
  MedicineCatalogItem,
  AuthGateState
} from '../types';
import {
  authService,
  AuthUser,
  LoginCredentials,
  SignUpCredentials,
  AuthResult
} from '../services/authService';
import { reminderService } from '../services/reminderService';
import { periodService } from '../services/periodService';
import { medicalReportService } from '../services/medicalReportService';
import { userPreferencesService } from '../services/userPreferencesService';
import { indexPeriodLog } from '../services/rag/ragVaultService';
import {
  handleIncomingAuthCallback,
  getStoredAuthCallbackError,
  clearStoredAuthCallbackError
} from '../services/authCallbackService';
import { translations, Translations } from '../i18n/translations';
import { VoiceService, VoiceCommandMatch } from '../services/voiceService';

export interface PermissionModalState {
  isOpen: boolean;
  type: 'mic' | 'location' | 'notifications' | 'report_ocr' | 'rx_ocr';
  title: string;
  description: string;
  onGranted: () => void;
  onDenied: () => void;
}

const PROTECTED_TABS: NavTab[] = ['reports', 'medicines', 'period', 'reminders'];

interface AppContextType {
  tab: NavTab;
  setTab: (tab: NavTab) => void;
  intendedTab: NavTab | null;
  setIntendedTab: (tab: NavTab | null) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Emergency
  isEmergencyModalOpen: boolean;
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;

  // Voice Interaction
  isListening: boolean;
  liveTranscript: string;
  voiceStatus: string;
  startVoiceListening: (customCallback?: (transcript: string) => void) => void;
  stopVoiceListening: () => void;
  isAudioPlaying: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;

  // Permissions Dialog
  permissionModal: PermissionModalState;
  requestPermission: (
    type: 'mic' | 'location' | 'notifications' | 'report_ocr' | 'rx_ocr',
    title: string,
    description: string,
    onGranted: () => void,
    onDenied?: () => void
  ) => void;
  closePermissionModal: () => void;

  // Permission Granted States
  permissions: {
    mic: boolean;
    location: boolean;
    notifications: boolean;
    reportOcr: boolean;
    rxOcr: boolean;
  };

  // Reminders Management
  reminders: ReminderItem[];
  addReminder: (reminder: Omit<ReminderItem, 'id' | 'createdDate'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Period Tracker Cloud & Local Storage Management
  periodLogs: PeriodCycleEntry[];
  savePeriodLog: (entry: Omit<PeriodCycleEntry, 'id'>) => void;
  deletePeriodLogs: () => void;

  // Cart Management for Demo Pharmacy
  cart: { item: MedicineCatalogItem; quantity: number }[];
  addToCart: (item: MedicineCatalogItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Feedback Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Authentication Management (Supabase Auth)
  authGateState: AuthGateState;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authCallbackError: { code: string; description: string } | null;
  clearAuthCallbackError: () => void;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  signup: (credentials: SignUpCredentials) => Promise<AuthResult>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authCallbackError, setAuthCallbackError] = useState<{ code: string; description: string } | null>(() => {
    return getStoredAuthCallbackError();
  });

  const clearAuthCallbackError = () => {
    clearStoredAuthCallbackError();
    setAuthCallbackError(null);
  };

  const authGateState: AuthGateState = isAuthLoading
    ? 'loading'
    : currentUser
    ? 'authenticated'
    : 'unauthenticated';

  const [tab, setTabState] = useState<NavTab>('home');
  const [intendedTab, setIntendedTab] = useState<NavTab | null>(null);

  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('healyaar_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  // Voice state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Permissions state
  const [permissions, setPermissions] = useState({
    mic: false,
    location: false,
    notifications: false,
    reportOcr: false,
    rxOcr: false,
  });

  const [permissionModal, setPermissionModal] = useState<PermissionModalState>({
    isOpen: false,
    type: 'mic',
    title: '',
    description: '',
    onGranted: () => {},
    onDenied: () => {},
  });

  // Reminders State
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // Period Tracker State
  const [periodLogs, setPeriodLogs] = useState<PeriodCycleEntry[]>([]);

  // Demo Pharmacy Cart
  const [cart, setCart] = useState<{ item: MedicineCatalogItem; quantity: number }[]>([]);

  // Central route guard: unauthenticated users cannot access any application tab
  const setTab = (targetTab: NavTab) => {
    if (targetTab !== 'login' && !currentUser) {
      setIntendedTab(targetTab);
      setTabState('login');
      showToast('Please sign in to access HealYaar.');
      return;
    }
    setTabState(targetTab);
  };

  // Sync Supabase Auth session & onAuthStateChange subscription
  useEffect(() => {
    let isMounted = true;

    const processAuthCallback = async (): Promise<boolean> => {
      try {
        const callbackResult = await handleIncomingAuthCallback();
        if (!isMounted) return false;

        if (callbackResult.status === 'error') {
          setAuthCallbackError({
            code: callbackResult.errorCode || 'auth_error',
            description: callbackResult.errorDescription || 'Authentication failed.'
          });
          setCurrentUser(null);
          setTabState('login');
          setIsAuthLoading(false);
          return true;
        }

        if (callbackResult.status === 'success' && callbackResult.user) {
          clearStoredAuthCallbackError();
          setAuthCallbackError(null);
          setCurrentUser(callbackResult.user);
          showToast('Email verified successfully! Welcome to HealYaar.');
          setTabState('home');
          setIsAuthLoading(false);
          return true;
        }
      } catch (cbErr) {
        console.warn('Auth callback handling notice:', cbErr);
      }
      return false;
    };

    window.addEventListener('hashchange', processAuthCallback);
    window.addEventListener('popstate', processAuthCallback);

    (async () => {
      const handled = await processAuthCallback();
      if (handled) return;

      try {
        const user = await authService.getCurrentUser();
        if (!isMounted) return;
        if (user) {
          setCurrentUser(user);
          // Preload cloud data in background
          const [cloudReminders, cloudCycles, cloudPrefs] = await Promise.all([
            reminderService.getReminders(user.id),
            periodService.getCycles(user.id),
            userPreferencesService.getPreferences(user.id)
          ]);
          if (isMounted) {
            setReminders(cloudReminders);
            setPeriodLogs(cloudCycles);
            if (cloudPrefs) {
              if (cloudPrefs.theme) setTheme(cloudPrefs.theme);
              if (cloudPrefs.textSize) setTextSize(cloudPrefs.textSize);
              if (cloudPrefs.language) setLanguage(cloudPrefs.language);
              if (cloudPrefs.highContrast !== undefined) setHighContrast(cloudPrefs.highContrast);
            }
          }
        } else {
          setCurrentUser(null);
          setReminders([]);
          setPeriodLogs([]);
        }
      } catch (err) {
        console.warn('Initial session check notice:', err);
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    })();

    // Subscribe to auth state updates
    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        clearStoredAuthCallbackError();
        setAuthCallbackError(null);
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);

          // Fetch synchronized cloud data for this authenticated user
          try {
            const [cloudReminders, cloudCycles, cloudPrefs] = await Promise.all([
              reminderService.getReminders(user.id),
              periodService.getCycles(user.id),
              userPreferencesService.getPreferences(user.id)
            ]);

            if (isMounted) {
              setReminders(cloudReminders);
              setPeriodLogs(cloudCycles);
              if (cloudPrefs) {
                if (cloudPrefs.theme) setTheme(cloudPrefs.theme);
                if (cloudPrefs.textSize) setTextSize(cloudPrefs.textSize);
                if (cloudPrefs.language) setLanguage(cloudPrefs.language);
                if (cloudPrefs.highContrast !== undefined) setHighContrast(cloudPrefs.highContrast);
              }
            }
          } catch (syncErr) {
            console.warn('Auth state fetch notice:', syncErr);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setReminders([]);
        setPeriodLogs([]);
        setCart([]);
        setIntendedTab(null);
        setTabState('login');
        showToast('Your session has expired. Please sign in again.');
      } else if (event === 'PASSWORD_RECOVERY') {
        // Direct user to reset password flow
        setTabState('login');
        sessionStorage.setItem('healyaar_auth_recovery_mode', 'true');
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('hashchange', processAuthCallback);
      window.removeEventListener('popstate', processAuthCallback);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sync user preferences whenever user alters theme, text scale, language, or contrast
  useEffect(() => {
    if (currentUser?.id) {
      userPreferencesService.savePreferences(currentUser.id, {
        theme,
        textSize,
        language,
        highContrast
      });
    }
  }, [theme, textSize, language, highContrast, currentUser?.id]);

  // DOM scale effect for text size
  useEffect(() => {
    const scale = textSize === 'xlarge' ? 1.35 : textSize === 'large' ? 1.18 : 1.0;
    document.documentElement.style.setProperty('--app-font-scale', scale.toString());
  }, [textSize]);

  // High contrast effect
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Dark Theme sync effect
  useEffect(() => {
    try {
      localStorage.setItem('healyaar_theme', theme);
    } catch {
      // ignore
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const openEmergencyModal = () => setIsEmergencyModalOpen(true);
  const closeEmergencyModal = () => setIsEmergencyModalOpen(false);

  // Translation lookup helper (fall back to 'en' if regional language has no full translation dictionary)
  const currentTranslation: Translations = translations[language as 'en' | 'hi' | 'mr'] || translations.en;

  const requestPermission = (
    type: 'mic' | 'location' | 'notifications' | 'report_ocr' | 'rx_ocr',
    title: string,
    description: string,
    onGranted: () => void,
    onDenied?: () => void
  ) => {
    setPermissionModal({
      isOpen: true,
      type,
      title,
      description,
      onGranted: () => {
        setPermissions(prev => ({ ...prev, [type]: true }));
        setPermissionModal(p => ({ ...p, isOpen: false }));
        onGranted();
      },
      onDenied: () => {
        setPermissions(prev => ({ ...prev, [type]: false }));
        setPermissionModal(p => ({ ...p, isOpen: false }));
        if (onDenied) onDenied();
      }
    });
  };

  const closePermissionModal = () => {
    setPermissionModal(p => ({ ...p, isOpen: false }));
  };

  // Voice Listening
  const startVoiceListening = (customCallback?: (transcript: string) => void) => {
    if (!VoiceService.isSpeechRecognitionSupported()) {
      showToast("Voice input isn't supported in this browser. Please use typing or try a supported browser.");
      return;
    }

    if (!VoiceService.isSecureEnvironment()) {
      showToast('Voice recognition requires a secure connection (HTTPS or localhost). Please type instead.');
      return;
    }

    const beginRecognition = () => {
      setIsListening(true);
      setLiveTranscript('');
      setVoiceStatus(currentTranslation.listening);

      VoiceService.startListening(
        language,
        (text, isFinal) => {
          setLiveTranscript(text);
          if (isFinal) {
            setVoiceStatus(`Heard: "${text}"`);
            if (customCallback) {
              customCallback(text);
            } else {
              handleVoiceCommand(text);
            }
          }
        },
        (err) => {
          setIsListening(false);
          setVoiceStatus(err);
          showToast(err);
        },
        () => {
          setIsListening(false);
        }
      );
    };

    if (!permissions.mic) {
      requestPermission(
        'mic',
        currentTranslation.micPermissionTitle,
        currentTranslation.micPermissionDesc,
        beginRecognition
      );
    } else {
      beginRecognition();
    }
  };

  const stopVoiceListening = () => {
    VoiceService.stopListening();
    setIsListening(false);
    setVoiceStatus('Listening stopped.');
  };

  const handleVoiceCommand = (transcript: string) => {
    const match: VoiceCommandMatch = VoiceService.parseVoiceCommand(transcript);

    if (match.action === 'sos') {
      openEmergencyModal();
      showToast('Opening Emergency SOS');
    } else if (match.action === 'navigate' && match.targetTab) {
      setTab(match.targetTab);
      showToast(`Navigated to ${match.matchedPhrase}`);
    } else if (match.action === 'textSize' && match.textSize) {
      setTextSize(match.textSize);
      showToast(`Text size changed to ${match.textSize}`);
    } else if (match.action === 'contrast') {
      toggleHighContrast();
      showToast('Toggled High Contrast');
    } else if (match.action === 'language' && match.language) {
      setLanguage(match.language);
      showToast(`Language switched to ${match.language.toUpperCase()}`);
    } else if (match.action === 'query') {
      setTab('assistant');
      sessionStorage.setItem('healyaar_pending_voice_query', transcript);
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!VoiceService.isSpeechSynthesisSupported()) {
      showToast('Voice readout not supported on this device.');
      return;
    }
    setIsAudioPlaying(true);
    VoiceService.speakText(
      text,
      language,
      () => setIsAudioPlaying(true),
      () => setIsAudioPlaying(false)
    );
  };

  const stopSpeaking = () => {
    VoiceService.stopSpeaking();
    setIsAudioPlaying(false);
  };

  // Reminder actions connected to Supabase and Local Fallback
  const addReminder = async (rem: Omit<ReminderItem, 'id' | 'createdDate'>) => {
    const saved = await reminderService.addReminder(currentUser?.id || '', rem);
    setReminders(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    showToast('Reminder saved successfully!');
  };

  const toggleReminder = async (id: string) => {
    const target = reminders.find(r => r.id === id);
    if (!target) return;
    const nextActive = !target.active;
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, active: nextActive } : r)));
    await reminderService.toggleReminder(currentUser?.id || '', id, target.active);
  };

  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    await reminderService.deleteReminder(currentUser?.id || '', id);
    showToast('Reminder deleted.');
  };

  // Period logs actions connected to Supabase and Local Fallback
  const savePeriodLog = async (entry: Omit<PeriodCycleEntry, 'id'>) => {
    const saved = await periodService.saveCycle(currentUser?.id || '', entry);
    if (saved) {
      setPeriodLogs(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
      if (currentUser?.id) {
        indexPeriodLog(currentUser.id, {
          id: saved.id,
          date: saved.startDate,
          flow: saved.flowIntensity,
          symptoms: saved.symptoms,
          notes: saved.notes
        }).catch(e => console.warn('RAG period indexing failed:', e));
      }
      showToast(currentUser ? 'Cycle entry saved securely to your account.' : 'Cycle entry saved privately on this device.');
    }
  };

  const deletePeriodLogs = async () => {
    setPeriodLogs([]);
    await periodService.deleteCycles(currentUser?.id || '');
    showToast('All menstrual cycle logs deleted permanently.');
  };

  // Cart actions
  const addToCart = (item: MedicineCatalogItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    showToast(`Added ${item.brandName} to demo cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const clearCart = () => setCart([]);

  // Authentication Actions
  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    const result = await authService.login(credentials);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      showToast(`Welcome back to HealYaar, ${result.user.name}!`);

      try {
        const [cloudReminders, cloudCycles] = await Promise.all([
          reminderService.getReminders(result.user.id),
          periodService.getCycles(result.user.id)
        ]);
        setReminders(cloudReminders);
        setPeriodLogs(cloudCycles);
      } catch (err) {
        console.warn('Post-login sync notice:', err);
      }
    }
    return result;
  };

  const signup = async (credentials: SignUpCredentials): Promise<AuthResult> => {
    const result = await authService.signup(credentials);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      if (result.user.emailConfirmed) {
        showToast(`Account created! Welcome to HealYaar, ${result.user.name}.`);
      } else {
        showToast(`Account created! Please check your email to verify your account.`);
      }
    }
    return result;
  };

  const logout = async () => {
    try {
      VoiceService.stopSpeaking();
      VoiceService.stopListening();
    } catch {}
    const uid = currentUser?.id;
    await authService.logout(uid);
    setCurrentUser(null);
    setReminders([]);
    setPeriodLogs([]);
    setCart([]);
    setIntendedTab(null);
    setTabState('login');
    showToast('Signed out of HealYaar.');
  };

  const requestPasswordReset = async (email: string) => {
    return await authService.requestPasswordReset(email);
  };

  const updatePassword = async (password: string) => {
    return await authService.updatePassword(password);
  };

  return (
    <AppContext.Provider
      value={{
        tab,
        setTab,
        intendedTab,
        setIntendedTab,
        language,
        setLanguage,
        t: currentTranslation,
        textSize,
        setTextSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        theme,
        setTheme,
        toggleTheme,
        authGateState,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAuthLoading,
        authCallbackError,
        clearAuthCallbackError,
        login,
        signup,
        logout,
        requestPasswordReset,
        updatePassword,
        isEmergencyModalOpen,
        openEmergencyModal,
        closeEmergencyModal,
        isListening,
        liveTranscript,
        voiceStatus,
        startVoiceListening,
        stopVoiceListening,
        isAudioPlaying,
        speakText,
        stopSpeaking,
        permissionModal,
        requestPermission,
        closePermissionModal,
        permissions,
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        periodLogs,
        savePeriodLog,
        deletePeriodLogs,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
