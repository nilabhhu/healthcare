import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { NavTab } from '../types';
import { VoiceService } from '../services/voiceService';
import { parseVoiceIntent, VoiceIntent, TAB_LABELS } from '../services/voiceIntentService';
import { getCycleVoiceResponse } from '../services/cycleService';
import {
  HEALYAAR_SECTIONS,
  getWebsiteOverviewSpeech,
  getShortOverviewSpeech,
  getSectionExplanationSpeech,
  getComparisonSpeech
} from '../services/voiceNavigationRegistry';

export const VOICE_LONG_PRESS_MS = 800; // Authoritative hold threshold: 800ms (0.8s)

export type AssistantState =
  | 'OFF'
  | 'ACTIVATING'
  | 'DEACTIVATING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'EXECUTING'
  | 'RESPONDING'
  | 'AWAITING_CONFIRMATION'
  | 'ERROR';

interface PendingVerification {
  expectedTab: NavTab;
  successMessage: string;
  timestamp: number;
}

export interface ConversationContext {
  awaitingWebsiteOverviewAnswer: boolean;
  awaitingSectionChoice: boolean;
  awaitingNavigationConfirmation: boolean;
  lastMentionedSection: NavTab | null;
}

interface VoiceAssistantContextType {
  assistantState: AssistantState;
  isAssistantActive: boolean;
  holdProgress: number; // 0 to 100%
  liveTranscript: string;
  lastSpokenResponse: string;
  assistantError: string | null;
  pendingActionName: string | null;
  conversationContext: ConversationContext;
  activateAssistant: () => void;
  deactivateAssistant: () => void;
  executeSpokenCommand: (transcript: string) => void;
  retryListening: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | null>(null);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    tab,
    setTab,
    currentUser,
    language,
    showToast,
    openEmergencyModal,
    toggleHighContrast,
    theme,
    toggleTheme,
    setTextSize,
    setLanguage,
    deletePeriodLogs,
    permissions,
    requestPermission
  } = useApp();

  // Assistant State Machine
  const [assistantState, setAssistantState] = useState<AssistantState>('OFF');
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastSpokenResponse, setLastSpokenResponse] = useState<string>('');
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [pendingActionName, setPendingActionName] = useState<string | null>(null);

  // Short-Term Multi-Turn Conversational Context for Website Guide & Navigation
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    awaitingWebsiteOverviewAnswer: false,
    awaitingSectionChoice: false,
    awaitingNavigationConfirmation: false,
    lastMentionedSection: null
  });

  const conversationContextRef = useRef<ConversationContext>(conversationContext);
  conversationContextRef.current = conversationContext;

  const updateConversationContext = useCallback((updates: Partial<ConversationContext>) => {
    setConversationContext(prev => {
      const next = { ...prev, ...updates };
      conversationContextRef.current = next;
      return next;
    });
  }, []);

  // History tracking for "Go back"
  const previousTabRef = useRef<NavTab | null>(null);
  const currentTabRef = useRef<NavTab>(tab);

  useEffect(() => {
    if (currentTabRef.current !== tab) {
      previousTabRef.current = currentTabRef.current;
      currentTabRef.current = tab;
    }
  }, [tab]);

  // References to keep event callbacks stable and prevent stale closures
  const assistantStateRef = useRef<AssistantState>(assistantState);
  assistantStateRef.current = assistantState;

  const pendingVerificationRef = useRef<PendingVerification | null>(null);
  const pendingConfirmedActionRef = useRef<(() => void) | null>(null);

  // Spacebar Tracking Refs (Hold 0.8s OR Double-Spacebar tap)
  const spacePressTimerRef = useRef<any>(null);
  const spaceProgressIntervalRef = useRef<any>(null);
  const isHoldingSpaceRef = useRef<boolean>(false);
  const hasTriggeredLongPressRef = useRef<boolean>(false);
  const spaceStartTimeRef = useRef<number>(0);
  const lastSpaceReleaseTimeRef = useRef<number>(0);

  const HOLD_DURATION_MS = VOICE_LONG_PRESS_MS; // Authoritative hold duration (800ms)

  /**
   * Speak a verbal response via TTS and notify when speech ends
   */
  const speakResponse = useCallback((message: string, onComplete?: () => void) => {
    setLastSpokenResponse(message);
    setAssistantState('RESPONDING');

    VoiceService.speakText(
      message,
      language,
      () => {},
      () => {
        onComplete?.();
      }
    );
  }, [language]);

  /**
   * Continuous Speech Recognition Loop
   */
  const startListeningLoop = useCallback(() => {
    if (!VoiceService.isSpeechRecognitionSupported()) {
      setAssistantState('ERROR');
      setAssistantError("Voice input isn't supported in this browser. Please use typing or try a supported browser.");
      return;
    }

    if (!VoiceService.isSecureEnvironment()) {
      setAssistantState('ERROR');
      setAssistantError('Voice recognition requires a secure connection (HTTPS or localhost). Please type instead.');
      return;
    }

    setAssistantError(null);
    setAssistantState('LISTENING');

    VoiceService.startListening(
      language,
      (cumulativeText, isLatestFinal, liveInterim) => {
        // Show live interim words in the HUD
        setLiveTranscript(liveInterim || cumulativeText);

        if (isLatestFinal && cumulativeText) {
          // Process final phrase
          executeSpokenCommand(cumulativeText);
        }
      },
      (err) => {
        setAssistantState('ERROR');
        setAssistantError(err);
      },
      () => {
        // Recognition cycle completed cleanly
        if (assistantStateRef.current === 'LISTENING') {
          // If still in continuous mode, resume listening smoothly
          startListeningLoop();
        }
      }
    );
  }, [language]);

  /**
   * Turn Assistant ON
   */
  const activateAssistant = useCallback(() => {
    const beginActivation = () => {
      setAssistantState('LISTENING');
      setHoldProgress(0);
      setAssistantError(null);
      setLiveTranscript('');
      showToast(`Voice Assistant Activated (Hold Spacebar ${(VOICE_LONG_PRESS_MS / 1000).toFixed(1)}s to turn off)`);

      updateConversationContext({
        awaitingWebsiteOverviewAnswer: true,
        awaitingSectionChoice: false,
        awaitingNavigationConfirmation: false,
        lastMentionedSection: null
      });

      const welcome = "Voice Assistant is on. Would you like me to tell you what you can do in HealYaar and what each section is for?";
      speakResponse(welcome, () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
    };

    if (!permissions.mic) {
      requestPermission(
        'mic',
        'Microphone Permission for Voice Assistant',
        'HealYaar needs microphone access to listen to your hands-free voice commands. Your speech is processed securely in your browser.',
        beginActivation,
        () => {
          setAssistantState('ERROR');
          setAssistantError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        }
      );
    } else {
      beginActivation();
    }
  }, [permissions.mic, requestPermission, showToast, speakResponse, startListeningLoop, updateConversationContext]);

  /**
   * Turn Assistant OFF
   */
  const deactivateAssistant = useCallback(() => {
    VoiceService.stopListening();
    VoiceService.stopSpeaking();
    setAssistantState('OFF');
    setHoldProgress(0);
    setLiveTranscript('');
    setPendingActionName(null);
    pendingVerificationRef.current = null;
    pendingConfirmedActionRef.current = null;
    updateConversationContext({
      awaitingWebsiteOverviewAnswer: false,
      awaitingSectionChoice: false,
      awaitingNavigationConfirmation: false,
      lastMentionedSection: null
    });
    showToast('Voice Assistant Off');
    VoiceService.speakText('Voice Assistant Off.', language);
  }, [language, showToast, updateConversationContext]);

  /**
   * Verified Navigation:
   * 1. Announce "Taking you to [Section]."
   * 2. Trigger the navigation and set post-navigation verification.
   * 3. Route change effect confirms arrival ("We're now on [Section].") only after destination is active.
   */
  const executeNavigationTo = useCallback((target: NavTab) => {
    const targetName = HEALYAAR_SECTIONS[target]?.spokenName || TAB_LABELS[target] || target;

    updateConversationContext({
      awaitingWebsiteOverviewAnswer: false,
      awaitingSectionChoice: false,
      awaitingNavigationConfirmation: false,
      lastMentionedSection: null
    });

    if (tab === target) {
      speakResponse(`We're already on ${targetName}.`, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    setAssistantState('EXECUTING');
    let hasTriggeredNav = false;
    const triggerNav = () => {
      if (hasTriggeredNav) return;
      hasTriggeredNav = true;
      pendingVerificationRef.current = {
        expectedTab: target,
        successMessage: `We're now on ${targetName}.`,
        timestamp: Date.now()
      };
      setTab(target);
    };

    const safetyTimer = setTimeout(triggerNav, 2500);

    speakResponse(`Taking you to ${targetName}.`, () => {
      clearTimeout(safetyTimer);
      triggerNav();
    });
  }, [tab, setTab, speakResponse, startListeningLoop, updateConversationContext]);

  /**
   * Execute Spoken Natural Language Command
   */
  const executeSpokenCommand = useCallback((transcript: string) => {
    if (!transcript.trim()) return;

    setAssistantState('PROCESSING');
    const intent: VoiceIntent = parseVoiceIntent(transcript);
    const convCtx = conversationContextRef.current;

    // 1. Emergency SOS triggers (Priority 1)
    if (intent.type === 'EMERGENCY_SOS') {
      openEmergencyModal();
      updateConversationContext({
        awaitingWebsiteOverviewAnswer: false,
        awaitingSectionChoice: false,
        awaitingNavigationConfirmation: false,
        lastMentionedSection: null
      });
      speakResponse('Opening Emergency SOS assistance immediately.', () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 2. Explicit Deactivation triggers
    if (intent.type === 'DEACTIVATE_VOICE') {
      deactivateAssistant();
      return;
    }

    // 3. If currently awaiting confirmation for a sensitive action
    if (assistantStateRef.current === 'AWAITING_CONFIRMATION') {
      if (intent.type === 'CONFIRM_ACTION') {
        const action = pendingConfirmedActionRef.current;
        pendingConfirmedActionRef.current = null;
        setPendingActionName(null);

        if (action) {
          action();
          speakResponse('Confirmed. The action has been completed.', () => {
            if (assistantStateRef.current !== 'OFF') {
              setAssistantState('LISTENING');
              startListeningLoop();
            }
          });
        }
        return;
      }

      if (intent.type === 'CANCEL_ACTION') {
        pendingConfirmedActionRef.current = null;
        setPendingActionName(null);
        speakResponse('Action cancelled.', () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
        return;
      }
    }

    // 4. User Confirmation or Cancellation of conversational prompts
    if (intent.type === 'CONFIRM_ACTION') {
      // 4a. User answered YES to website overview offer
      if (convCtx.awaitingWebsiteOverviewAnswer) {
        updateConversationContext({
          awaitingWebsiteOverviewAnswer: false,
          awaitingSectionChoice: true,
          awaitingNavigationConfirmation: false,
          lastMentionedSection: null
        });
        speakResponse(getWebsiteOverviewSpeech(), () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
        return;
      }

      // 4b. User confirmed navigation after section explanation or query
      if (convCtx.awaitingNavigationConfirmation && convCtx.lastMentionedSection) {
        const target = convCtx.lastMentionedSection;
        updateConversationContext({
          awaitingNavigationConfirmation: false,
          lastMentionedSection: null
        });
        executeNavigationTo(target);
        return;
      }
    }

    if (intent.type === 'CANCEL_ACTION') {
      // 4c. User declined website overview offer
      if (convCtx.awaitingWebsiteOverviewAnswer) {
        updateConversationContext({
          awaitingWebsiteOverviewAnswer: false,
          awaitingSectionChoice: false,
          awaitingNavigationConfirmation: false,
          lastMentionedSection: null
        });
        speakResponse('No problem. Just say a command or where you would like to go.', () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
        return;
      }

      // 4d. User declined navigation after section explanation
      if (convCtx.awaitingNavigationConfirmation) {
        updateConversationContext({
          awaitingNavigationConfirmation: false,
          lastMentionedSection: null
        });
        speakResponse("Alright, we'll stay here. What would you like to do next?", () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
        return;
      }

      // 4e. User declined after overview or comparison
      if (convCtx.awaitingSectionChoice) {
        updateConversationContext({
          awaitingSectionChoice: false
        });
        speakResponse('No problem. Let me know whenever you would like to explore any section.', () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
        return;
      }
    }

    // 5. Go Back / Previous Page
    if (intent.type === 'GO_BACK') {
      updateConversationContext({
        awaitingWebsiteOverviewAnswer: false,
        awaitingSectionChoice: false,
        awaitingNavigationConfirmation: false,
        lastMentionedSection: null
      });
      if (previousTabRef.current && previousTabRef.current !== tab) {
        executeNavigationTo(previousTabRef.current);
      } else {
        const currentName = HEALYAAR_SECTIONS[tab]?.spokenName || TAB_LABELS[tab] || tab;
        speakResponse(`There's no previous page. We're currently on ${currentName}.`, () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
      }
      return;
    }

    // 6. Website Overview Request (e.g. "What can I do here?", "Show me the available pages", "What sections are there?")
    if (intent.type === 'WEBSITE_OVERVIEW_REQUEST') {
      updateConversationContext({
        awaitingWebsiteOverviewAnswer: false,
        awaitingSectionChoice: true,
        awaitingNavigationConfirmation: false,
        lastMentionedSection: null
      });
      speakResponse(getWebsiteOverviewSpeech(), () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 7. Comparative Section Query (e.g. "Difference between Medical Reports and Prescriptions")
    if (intent.type === 'COMPARE_SECTIONS_QUERY' && intent.comparedTabs) {
      const [tabA, tabB] = intent.comparedTabs;
      const reply = getComparisonSpeech(tabA, tabB);
      updateConversationContext({
        awaitingWebsiteOverviewAnswer: false,
        awaitingSectionChoice: true,
        awaitingNavigationConfirmation: false,
        lastMentionedSection: null
      });
      speakResponse(reply, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 8. Section Explanation Request (e.g. "What is Food and Nutrition?", "Explain Medical Reports", "What can I do in Period Tracker?")
    if (intent.type === 'SECTION_EXPLANATION_REQUEST' && intent.targetTab) {
      const target = intent.targetTab;
      const reply = getSectionExplanationSpeech(target);
      updateConversationContext({
        awaitingWebsiteOverviewAnswer: false,
        awaitingSectionChoice: false,
        awaitingNavigationConfirmation: true,
        lastMentionedSection: target
      });
      speakResponse(reply, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 9. "Where can I..." / Functional Queries (e.g. "Where can I track my period?", "Where do I upload a blood test?")
    if (intent.type === 'WHERE_CAN_I_QUERY' && intent.targetTab) {
      const target = intent.targetTab;
      const reply = getSectionExplanationSpeech(target);
      updateConversationContext({
        awaitingWebsiteOverviewAnswer: false,
        awaitingSectionChoice: false,
        awaitingNavigationConfirmation: true,
        lastMentionedSection: target
      });
      speakResponse(reply, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 10. Explicit Navigation intent ("Take me to Food and Nutrition", "Go to Period Tracker", etc.)
    if (intent.type === 'NAVIGATE' && intent.targetTab) {
      executeNavigationTo(intent.targetTab);
      return;
    }

    // 11. Sensitive Action requiring confirmation (e.g. Delete Period Logs)
    if (intent.requiresConfirmation) {
      if (intent.type === 'DELETE_PERIOD_LOGS') {
        setAssistantState('AWAITING_CONFIRMATION');
        setPendingActionName('Delete Period Tracker Logs');
        pendingConfirmedActionRef.current = () => deletePeriodLogs();

        speakResponse(intent.confirmationPrompt || 'Are you sure? Say yes confirm or cancel.', () => {
          if (assistantStateRef.current !== 'OFF') {
            startListeningLoop();
          }
        });
        return;
      }
    }

    // 2b. Voice Trigger for Prescription Reminders
    if (intent.type === 'ADD_PRESCRIPTION_REMINDERS') {
      if (tab !== 'medicines') {
        setTab('medicines');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_trigger_rx_reminders'));
      }, 350);
      speakResponse('Reviewing prescription medicines. Would you like to add them to your reminders?', () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2c. Voice Trigger for Nearby Medical Stores / Pharmacy
    if (intent.type === 'FIND_NEARBY_PHARMACY') {
      if (tab !== 'medicines') {
        setTab('medicines');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_trigger_pharmacy_search'));
      }, 350);
      speakResponse('Finding verified nearby medical stores for your prescription.', () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2c-2. Read Prescription via Voice
    if (intent.type === 'READ_PRESCRIPTION') {
      if (tab !== 'medicines') {
        setTab('medicines');
      }

      let spokenText = 'No prescription has been uploaded yet. Please upload or capture your doctor prescription on the Prescriptions page first.';
      try {
        const stored = sessionStorage.getItem('healyaar_active_prescription');
        if (stored) {
          const rxData = JSON.parse(stored);
          const meds = rxData.medicines || [];

          if (meds.length === 0) {
            spokenText = 'Your active prescription does not have any extracted medicines yet.';
          } else if (intent.queryText === 'timing') {
            const timingSummary = meds
              .map((m: any, idx: number) => `Medicine ${idx + 1}, ${m.name}: ${m.timing || 'as directed'}, ${m.frequency || ''}`)
              .join('. ');
            spokenText = `Here are the timings for your medicines: ${timingSummary}.`;
          } else if (intent.queryText && !isNaN(Number(intent.queryText))) {
            const medIndex = Number(intent.queryText) - 1;
            if (meds[medIndex]) {
              const m = meds[medIndex];
              spokenText = `Medicine ${intent.queryText} is ${m.name}, dosage ${m.dosage}, take ${m.timing} with frequency ${m.frequency} for ${m.durationDays} days.`;
            } else {
              spokenText = `I could not find medicine number ${intent.queryText}. You have ${meds.length} medicines in total.`;
            }
          } else {
            const listSummary = meds
              .map((m: any, idx: number) => `Medicine ${idx + 1}: ${m.name} ${m.dosage}, ${m.frequency}, ${m.timing}`)
              .join('. ');
            spokenText = `You have ${meds.length} medicines in your analyzed prescription: ${listSummary}.`;
          }
        }
      } catch (e) {
        // Fallback
      }

      speakResponse(spokenText, () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2d. Show Doctors on Map
    if (intent.type === 'SHOW_DOCTORS_MAP') {
      if (tab !== 'doctors') {
        setTab('doctors');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_switch_map_view'));
      }, 350);
      speakResponse('Showing doctors and clinics on the interactive map.', () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2e. Search Doctors by Specialty
    if (intent.type === 'SEARCH_DOCTORS_SPECIALTY') {
      if (tab !== 'doctors') {
        setTab('doctors');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_filter_specialty', {
          detail: { specialty: intent.queryText, query: intent.queryText }
        }));
      }, 350);
      speakResponse(`Searching for ${intent.queryText || 'specialists'} near you.`, () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2f. Food Photo Analysis
    if (intent.type === 'ANALYZE_FOOD') {
      if (tab !== 'nutrition') {
        setTab('nutrition');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_analyze_food'));
      }, 350);
      speakResponse('Opening food photo analyzer. Please upload or capture a photo of your dish.', () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2g. Calculate Calories in Ingredients
    if (intent.type === 'CALCULATE_INGREDIENTS') {
      if (tab !== 'nutrition') {
        setTab('nutrition');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_calculate_ingredients', {
          detail: { ingredients: intent.queryText }
        }));
      }, 350);
      speakResponse('Opening ingredient nutrition calculator. You can enter your ingredients to calculate calories and macros.', () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 2h. Educational Supplement Guidance
    if (intent.type === 'QUERY_SUPPLEMENTS') {
      if (tab !== 'fitness') {
        setTab('fitness');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('healyaar_voice_supplement_query', {
          detail: { query: intent.queryText }
        }));
      }, 350);
      speakResponse('Reviewing evidence-based supplement and nutrition considerations for your question.', () => {
        if (assistantStateRef.current !== 'OFF') {
          startListeningLoop();
        }
      });
      return;
    }

    // 5. Accessibility controls
    if (intent.type === 'TOGGLE_CONTRAST') {
      toggleHighContrast();
      speakResponse('High contrast mode has been toggled.', () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    if (intent.type === 'TOGGLE_DARK_MODE') {
      toggleTheme();
      const targetModeName = theme === 'dark' ? 'Light mode' : 'Dark mode';
      speakResponse(`Switched to ${targetModeName}.`, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 5b. Menstrual Cycle Intelligence Spoken Answers
    if (intent.type === 'CHECK_NEXT_PERIOD') {
      if (tab !== 'period') {
        setTab('period');
      }
      const answer = getCycleVoiceResponse('NEXT_PERIOD');
      speakResponse(answer, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    if (intent.type === 'CHECK_CYCLE_PHASE') {
      if (tab !== 'period') {
        setTab('period');
      }
      const answer = getCycleVoiceResponse('PHASE');
      speakResponse(answer, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    if (intent.type === 'CHECK_OVULATION') {
      if (tab !== 'period') {
        setTab('period');
      }
      const answer = getCycleVoiceResponse('OVULATION');
      speakResponse(answer, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    if (intent.type === 'CHANGE_TEXT_SIZE' && intent.textSize) {
      setTextSize(intent.textSize);
      speakResponse(`Text size adjusted to ${intent.textSize}.`, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    if (intent.type === 'CHANGE_LANGUAGE' && intent.language) {
      setLanguage(intent.language);
      speakResponse(`Language switched to ${intent.language}.`, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
      return;
    }

    // 7. General Health Query
    if (intent.type === 'HEALTH_QUERY') {
      sessionStorage.setItem('healyaar_pending_voice_query', intent.queryText || transcript);
      if (tab !== 'assistant') {
        setAssistantState('EXECUTING');
        pendingVerificationRef.current = {
          expectedTab: 'assistant',
          successMessage: "I've opened the AI Assistant for your health question.",
          timestamp: Date.now()
        };
        setTab('assistant');
      } else {
        speakResponse("I'm here to help discuss your question.", () => {
          if (assistantStateRef.current !== 'OFF') {
            setAssistantState('LISTENING');
            startListeningLoop();
          }
        });
      }
      return;
    }

    // 8. Fallback / Unrecognized Command
    speakResponse("I didn't quite catch that. You can say: Go to home, open reports, period tracker, or find a doctor.", () => {
      if (assistantStateRef.current !== 'OFF') {
        setAssistantState('LISTENING');
        startListeningLoop();
      }
    });
  }, [
    tab,
    setTab,
    openEmergencyModal,
    toggleHighContrast,
    theme,
    toggleTheme,
    setTextSize,
    setLanguage,
    deletePeriodLogs,
    deactivateAssistant,
    executeNavigationTo,
    updateConversationContext,
    speakResponse,
    startListeningLoop
  ]);

  /**
   * VERIFY NAVIGATION COMPLETED BEFORE CONFIRMING VERBALLY
   * This effect triggers when `tab` updates in the application layout.
   */
  useEffect(() => {
    if (
      pendingVerificationRef.current &&
      pendingVerificationRef.current.expectedTab === tab
    ) {
      const { successMessage } = pendingVerificationRef.current;
      pendingVerificationRef.current = null;

      // The destination component has rendered; now confirm verbally
      setAssistantState('RESPONDING');
      speakResponse(successMessage, () => {
        if (assistantStateRef.current !== 'OFF') {
          setAssistantState('LISTENING');
          startListeningLoop();
        }
      });
    }
  }, [tab, speakResponse, startListeningLoop]);

  /**
   * Safety Timeout for Navigation Verification
   */
  useEffect(() => {
    if (assistantState === 'EXECUTING' && pendingVerificationRef.current) {
      const timer = setTimeout(() => {
        if (pendingVerificationRef.current) {
          const failedTab = pendingVerificationRef.current.expectedTab;
          pendingVerificationRef.current = null;
          speakResponse(`I couldn't open the ${TAB_LABELS[failedTab]}. Please try again.`, () => {
            if (assistantStateRef.current !== 'OFF') {
              setAssistantState('LISTENING');
              startListeningLoop();
            }
          });
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [assistantState, speakResponse, startListeningLoop]);

  /**
   * SPACEBAR LONG-PRESS LISTENER (0.8 SECONDS / 800ms)
   * Off -> Hold 0.8s -> On
   * On -> Hold 0.8s -> Off
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 0. Disable Voice Assistant shortcut when logged out or on login page
      if (!currentUser || tab === 'login') {
        return;
      }

      // 1. Must be Space key
      if (e.code !== 'Space' && e.key !== ' ' && e.keyCode !== 32) return;

      // 2. Ignore text editing elements
      const target = e.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute('contenteditable') === 'true' ||
          Boolean(target.closest('input, textarea, select, [contenteditable="true"]')));

      if (isEditable) {
        return; // Allow normal typing with Spacebar
      }

      // 3. Handle key auto-repeat: ignore repeated keydown events during hold
      if (e.repeat) {
        if (isHoldingSpaceRef.current) {
          e.preventDefault(); // Prevent page scrolling during intentional hold
        }
        return;
      }

      // Avoid double-initialization if already holding Space
      if (isHoldingSpaceRef.current) {
        e.preventDefault();
        return;
      }

      const isCurrentlyActive = assistantStateRef.current !== 'OFF';

      // 4. Double-Spacebar Quick Activation Check (tap space twice within 350ms)
      const now = Date.now();
      if (now - lastSpaceReleaseTimeRef.current < 350) {
        e.preventDefault();
        lastSpaceReleaseTimeRef.current = 0;
        if (spacePressTimerRef.current) {
          clearTimeout(spacePressTimerRef.current);
          spacePressTimerRef.current = null;
        }
        if (spaceProgressIntervalRef.current) {
          clearInterval(spaceProgressIntervalRef.current);
          spaceProgressIntervalRef.current = null;
        }
        setHoldProgress(100);
        if (isCurrentlyActive) {
          deactivateAssistant();
        } else {
          activateAssistant();
        }
        return;
      }

      // 5. Initial Keydown: start 800ms tracking
      isHoldingSpaceRef.current = true;
      hasTriggeredLongPressRef.current = false;
      spaceStartTimeRef.current = Date.now();
      e.preventDefault(); // Prevent page jump

      setAssistantState(isCurrentlyActive ? 'DEACTIVATING' : 'ACTIVATING');
      setHoldProgress(0);

      // Progress interval updates every 20ms for ultra-smooth visual UI
      if (spaceProgressIntervalRef.current) clearInterval(spaceProgressIntervalRef.current);
      spaceProgressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - spaceStartTimeRef.current;
        const pct = Math.min(100, Math.round((elapsed / VOICE_LONG_PRESS_MS) * 100));
        setHoldProgress(pct);
      }, 20);

      // Long-press completion timer (800ms)
      if (spacePressTimerRef.current) clearTimeout(spacePressTimerRef.current);
      spacePressTimerRef.current = setTimeout(() => {
        hasTriggeredLongPressRef.current = true;
        if (spaceProgressIntervalRef.current) {
          clearInterval(spaceProgressIntervalRef.current);
          spaceProgressIntervalRef.current = null;
        }
        spacePressTimerRef.current = null;
        setHoldProgress(100);

        if (isCurrentlyActive) {
          deactivateAssistant();
        } else {
          activateAssistant();
        }
      }, VOICE_LONG_PRESS_MS);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ' && e.keyCode !== 32) return;

      const target = e.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute('contenteditable') === 'true' ||
          Boolean(target.closest('input, textarea, select, [contenteditable="true"]')));

      if (isEditable) {
        return;
      }

      // Clean up timers
      if (spacePressTimerRef.current) {
        clearTimeout(spacePressTimerRef.current);
        spacePressTimerRef.current = null;
      }
      if (spaceProgressIntervalRef.current) {
        clearInterval(spaceProgressIntervalRef.current);
        spaceProgressIntervalRef.current = null;
      }

      // If released before 800ms, cancel activation/deactivation
      if (!hasTriggeredLongPressRef.current) {
        setHoldProgress(0);
        if (assistantStateRef.current === 'ACTIVATING') {
          setAssistantState('OFF');
        } else if (assistantStateRef.current === 'DEACTIVATING') {
          setAssistantState('LISTENING');
        }
      }

      // Key release after activation must NOT trigger another toggle
      isHoldingSpaceRef.current = false;
      hasTriggeredLongPressRef.current = false;
      lastSpaceReleaseTimeRef.current = Date.now();
    };

    const handleBlur = () => {
      // Window lost focus while holding Spacebar: cancel pending activation
      if (spacePressTimerRef.current) {
        clearTimeout(spacePressTimerRef.current);
        spacePressTimerRef.current = null;
      }
      if (spaceProgressIntervalRef.current) {
        clearInterval(spaceProgressIntervalRef.current);
        spaceProgressIntervalRef.current = null;
      }
      setHoldProgress(0);
      if (!hasTriggeredLongPressRef.current) {
        if (assistantStateRef.current === 'ACTIVATING') {
          setAssistantState('OFF');
        } else if (assistantStateRef.current === 'DEACTIVATING') {
          setAssistantState('LISTENING');
        }
      }
      isHoldingSpaceRef.current = false;
      hasTriggeredLongPressRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      if (spacePressTimerRef.current) {
        clearTimeout(spacePressTimerRef.current);
        spacePressTimerRef.current = null;
      }
      if (spaceProgressIntervalRef.current) {
        clearInterval(spaceProgressIntervalRef.current);
        spaceProgressIntervalRef.current = null;
      }
      isHoldingSpaceRef.current = false;
      hasTriggeredLongPressRef.current = false;
    };
  }, [activateAssistant, deactivateAssistant]);

  const retryListening = () => {
    setAssistantError(null);
    VoiceService.retryListening();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__healyaar_voice = {
        executeSpokenCommand,
        activateAssistant,
        deactivateAssistant,
        assistantState,
        conversationContext,
        lastSpokenResponse
      };
    }
  }, [executeSpokenCommand, activateAssistant, deactivateAssistant, assistantState, conversationContext, lastSpokenResponse]);

  return (
    <VoiceAssistantContext.Provider
      value={{
        assistantState,
        isAssistantActive: assistantState !== 'OFF',
        holdProgress,
        liveTranscript,
        lastSpokenResponse,
        assistantError,
        pendingActionName,
        conversationContext,
        activateAssistant,
        deactivateAssistant,
        executeSpokenCommand,
        retryListening
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = (): VoiceAssistantContextType => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
