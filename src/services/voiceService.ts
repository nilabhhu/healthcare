import { NavTab, SupportedLanguage } from '../types';

const isDev = Boolean(
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env &&
  (import.meta as any).env.DEV
);

// Speech Recognition Type Definitions for TS
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export type VoiceState = 'idle' | 'starting' | 'listening' | 'processing' | 'error';

export interface VoiceCommandMatch {
  action: 'navigate' | 'sos' | 'textSize' | 'contrast' | 'language' | 'query';
  targetTab?: NavTab;
  language?: SupportedLanguage;
  textSize?: 'normal' | 'large' | 'xlarge';
  queryText?: string;
  matchedPhrase?: string;
}

interface StoredCallbacks {
  onResult: (text: string, isFinal: boolean, interimText?: string) => void;
  onError: (err: string, isRecoverable?: boolean) => void;
  onEnd: () => void;
}

export class VoiceService {
  private static recognition: any = null;
  private static currentState: VoiceState = 'idle';
  private static retryCount: number = 0;
  private static readonly MAX_RETRIES: number = 1;
  private static activeLanguage: SupportedLanguage = 'en';
  private static hasReceivedSpeech: boolean = false;
  private static callbacks: StoredCallbacks | null = null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Browser Compatibility Check
   */
  public static isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Secure Context Check (HTTPS or Localhost)
   */
  public static isSecureEnvironment(): boolean {
    if (typeof window === 'undefined') return true;
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
    return window.isSecureContext || isLocalhost;
  }

  public static getCurrentState(): VoiceState {
    return this.currentState;
  }

  public static getIsListening(): boolean {
    return this.currentState === 'listening' || this.currentState === 'starting';
  }

  public static simulateSpeech(transcript: string, isFinal: boolean = true): void {
    if (this.callbacks && this.callbacks.onResult) {
      this.callbacks.onResult(transcript, isFinal, isFinal ? '' : transcript);
    }
  }

  /**
   * Starts a single, stable SpeechRecognition session with a clean state machine.
   * - Prevents duplicate start calls
   * - Avoids calling start() during teardown or immediately in onend
   * - Accurately differentiates speech service errors from connectivity
   */
  public static startListening(
    lang: SupportedLanguage,
    onResult: (text: string, isFinal: boolean, interimText?: string) => void,
    onError: (err: string, isRecoverable?: boolean) => void,
    onEnd: () => void,
    isRetry: boolean = false
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onError(
        "Voice input isn't supported in this browser. Please use typing or try a supported browser.",
        false
      );
      return false;
    }

    if (!this.isSecureEnvironment()) {
      onError(
        'Voice recognition requires a secure connection (HTTPS or localhost). Please type instead.',
        false
      );
      return false;
    }

    // Prevent rapid multiple starts or restarting when already listening
    if (this.currentState === 'listening' || this.currentState === 'starting') {
      if (isDev) {
        console.warn('[VoiceService] Recognition is already active or starting. Ignoring duplicate start request.');
      }
      return true;
    }

    if (!isRetry) {
      this.retryCount = 0;
    }

    this.activeLanguage = lang;
    this.hasReceivedSpeech = false;
    this.callbacks = { onResult, onError, onEnd };
    this.currentState = 'starting';

    // Log non-sensitive lifecycle info for development debugging
    if (isDev) {
      console.log('[VoiceService] Speech recognition supported: true');
      console.log('[VoiceService] Recognition starting...');
    }

    // Clean up any lingering previous instance before creating a fresh one
    this.cleanupRecognition();

    try {
      const win = window as unknown as IWindow;
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      const rec = new SpeechRec();
      this.recognition = rec;

      rec.continuous = true;
      rec.interimResults = true;

      const langMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
      };
      rec.lang = langMap[lang] || 'en-IN';

      rec.onstart = () => {
        this.currentState = 'listening';
        if (isDev) {
          console.log('[VoiceService] Recognition started and listening.');
        }
      };

      rec.onresult = (event: any) => {
        this.hasReceivedSpeech = true;
        if (isDev) {
          console.log('[VoiceService] Speech result received');
        }

        let cumulativeFinal = '';
        let liveInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            cumulativeFinal += res[0].transcript + ' ';
          } else {
            liveInterim += res[0].transcript;
          }
        }

        cumulativeFinal = cumulativeFinal.trim();
        liveInterim = liveInterim.trim();

        if (cumulativeFinal || liveInterim) {
          const isLatestFinal = event.results[event.results.length - 1]?.isFinal ?? false;
          onResult(cumulativeFinal, isLatestFinal, liveInterim);
        }
      };

      rec.onerror = (event: any) => {
        const err = event.error;

        if (isDev) {
          console.log(`[VoiceService] Recognition error: ${err}`);
        }

        // 'aborted' is triggered during manual stop or reset; not a user-facing error
        if (err === 'aborted') {
          return;
        }

        // 'no-speech' happens when user pauses; do not abort active session
        if (err === 'no-speech') {
          if (!this.hasReceivedSpeech) {
            onError('No speech was detected. Please speak clearly into your microphone.', true);
          }
          return;
        }

        this.currentState = 'error';

        // Disambiguate errors accurately
        let userMessage = 'Voice recognition encountered an error. Please try again or use typing.';
        let isRecoverable = true;

        if (err === 'not-allowed') {
          userMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings and try again.';
          isRecoverable = false;
        } else if (err === 'audio-capture') {
          userMessage = 'No microphone was found or your microphone is currently in use by another application.';
          isRecoverable = false;
        } else if (err === 'network') {
          // IMPORTANT: Do NOT falsely blame user's normal internet connection
          userMessage =
            'Voice recognition is temporarily unavailable. Your internet connection may be fine. Please try again or use typing.';
          isRecoverable = true;
        } else if (err === 'service-not-allowed') {
          userMessage =
            'Voice recognition service is restricted by your browser. Please type your message instead.';
          isRecoverable = false;
        } else if (err === 'bad-grammar') {
          userMessage = 'Speech recognition grammar error occurred.';
          isRecoverable = true;
        }

        onError(userMessage, isRecoverable);
      };

      rec.onend = () => {
        if (isDev) {
          console.log('[VoiceService] Recognition ended.');
        }

        this.currentState = 'idle';
        this.cleanupRecognition();
        onEnd();
      };

      rec.start();
      return true;
    } catch (e: any) {
      if (isDev) {
        console.error('[VoiceService] Error starting recognition instance:', e);
      }
      this.currentState = 'error';
      onError('Unable to start speech recognition. Please try again or use typing.', true);
      return false;
    }
  }

  /**
   * Safe Controlled Retry Flow
   * Does NOT retry indefinitely; allows 1 clean retry before advising typing.
   */
  public static retryListening(): void {
    if (this.retryCount >= this.MAX_RETRIES) {
      if (this.callbacks) {
        this.callbacks.onError(
          'Voice recognition is currently unreachable. Please use typing instead.',
          false
        );
      }
      return;
    }

    this.retryCount++;
    this.stopListening();

    // 250ms debounce to allow browser audio hardware to cleanly detach
    setTimeout(() => {
      if (this.callbacks) {
        this.startListening(
          this.activeLanguage,
          this.callbacks.onResult,
          this.callbacks.onError,
          this.callbacks.onEnd,
          true
        );
      }
    }, 250);
  }

  /**
   * Cleanly stop and detach event listeners
   */
  public static stopListening(): void {
    this.currentState = 'idle';
    this.cleanupRecognition();
  }

  private static cleanupRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {
        // safe cleanup
      }
      this.recognition = null;
    }
  }

  public static parseVoiceCommand(transcript: string): VoiceCommandMatch {
    const text = transcript.toLowerCase().trim();

    // Emergency check
    if (text.includes('emergency') || text.includes('sos') || text.includes('ambulance') || text.includes('आपातकालीन') || text.includes('मदत') || text.includes('मदद')) {
      return { action: 'sos', matchedPhrase: transcript };
    }

    // Navigation triggers
    if (text.includes('home') || text.includes('होम') || text.includes('मुख्य पान')) {
      return { action: 'navigate', targetTab: 'home', matchedPhrase: 'Home' };
    }
    if (text.includes('assistant') || text.includes('chat') || text.includes('एआई साथी') || text.includes('सहाय्यक')) {
      return { action: 'navigate', targetTab: 'assistant', matchedPhrase: 'AI Assistant' };
    }
    if (text.includes('symptom') || text.includes('pain') || text.includes('fever') || text.includes('लक्षण') || text.includes('दर्द') || text.includes('दुखी')) {
      return { action: 'navigate', targetTab: 'symptoms', matchedPhrase: 'Symptom Guidance' };
    }
    if (text.includes('report') || text.includes('blood test') || text.includes('lab') || text.includes('रिपोर्ट') || text.includes('तपासणी')) {
      return { action: 'navigate', targetTab: 'reports', matchedPhrase: 'Reports' };
    }
    if (text.includes('food') || text.includes('nutrition') || text.includes('diet') || text.includes('calorie') || text.includes('आहार') || text.includes('पोषण')) {
      return { action: 'navigate', targetTab: 'nutrition', matchedPhrase: 'Food & Nutrition' };
    }
    if (text.includes('doctor') || text.includes('clinic') || text.includes('hospital') || text.includes('डॉक्टर') || text.includes('दवाखाना')) {
      return { action: 'navigate', targetTab: 'doctors', matchedPhrase: 'Doctors Nearby' };
    }
    if (text.includes('fitness') || text.includes('exercise') || text.includes('supplement') || text.includes('व्यायाम') || text.includes('कसरत')) {
      return { action: 'navigate', targetTab: 'fitness', matchedPhrase: 'Fitness & Supplements' };
    }
    if (text.includes('medicine') || text.includes('prescription') || text.includes('दवा') || text.includes('औषध') || text.includes('पर्ची')) {
      return { action: 'navigate', targetTab: 'medicines', matchedPhrase: 'Prescriptions & Medicines' };
    }
    if (text.includes('mental') || text.includes('stress') || text.includes('anxiety') || text.includes('तनाव') || text.includes('मानसिक') || text.includes('चिंता')) {
      return { action: 'navigate', targetTab: 'mental', matchedPhrase: 'Mental Wellbeing' };
    }
    if (text.includes('period') || text.includes('cycle') || text.includes('मासिक धर्म') || text.includes('पाळी')) {
      return { action: 'navigate', targetTab: 'period', matchedPhrase: 'Period Tracker' };
    }
    if (text.includes('reminder') || text.includes('alarm') || text.includes('याद') || text.includes('आठवण')) {
      return { action: 'navigate', targetTab: 'reminders', matchedPhrase: 'Reminders' };
    }

    // Text size commands
    if (text.includes('large text') || text.includes('big font') || text.includes('अक्षर मोठे') || text.includes('बड़ा फॉन्ट')) {
      return { action: 'textSize', textSize: 'xlarge', matchedPhrase: 'Text Size: Extra Large' };
    }
    if (text.includes('normal text') || text.includes('normal font') || text.includes('सामान्य फॉन्ट')) {
      return { action: 'textSize', textSize: 'normal', matchedPhrase: 'Text Size: Normal' };
    }

    // High contrast command
    if (text.includes('contrast') || text.includes('कंट्रास्ट')) {
      return { action: 'contrast', matchedPhrase: 'Toggle High Contrast' };
    }

    // Language command
    if (text.includes('hindi') || text.includes('हिंदी')) {
      return { action: 'language', language: 'hi', matchedPhrase: 'Switch to Hindi' };
    }
    if (text.includes('english') || text.includes('अंग्रेजी')) {
      return { action: 'language', language: 'en', matchedPhrase: 'Switch to English' };
    }
    if (text.includes('marathi') || text.includes('मराठी')) {
      return { action: 'language', language: 'mr', matchedPhrase: 'Switch to Marathi' };
    }

    // Default: treated as an assistant health query
    return { action: 'query', queryText: transcript, matchedPhrase: transcript };
  }

  public static speakText(
    text: string,
    lang: SupportedLanguage,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.isSpeechSynthesisSupported()) {
      if (onEnd) setTimeout(onEnd, 10);
      return;
    }

    this.stopSpeaking();

    // Clean markdown characters from text for smooth reading
    const cleanText = text
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) {
      if (onEnd) setTimeout(onEnd, 10);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    const langMap: Record<SupportedLanguage, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
    };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public static stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    if (!this.isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}
