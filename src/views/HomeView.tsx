import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
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
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  BookOpen,
  HeartPulse,
  PhoneCall,
  Send,
  HelpCircle,
  Bot
} from 'lucide-react';
import { NavTab } from '../types';
import { HealthOverviewIllustration } from '../components/ContextualIllustrations';
import {
  CapsuleTwoTone,
  StethoscopeCurved,
  NutrientMolecule,
  AppleFresh,
  MedicalCross3D,
  NeuralSynapse,
  AIOrbGlowing,
  SereneCloud,
  ReportClipboard,
  SecurityShieldCross
} from '../components/floating/FloatingThematicObjects';

export const HomeView: React.FC = () => {
  const { setTab, t, startVoiceListening, stopVoiceListening, isListening, openEmergencyModal } = useApp();
  const [quickProblemInput, setQuickProblemInput] = useState('');
  const [isSymptomVoiceActive, setIsSymptomVoiceActive] = useState(false);

  // Home AI Assistant Section Interactive States
  const [homeAssistantQuery, setHomeAssistantQuery] = useState('');
  const [isAssistantVoiceActive, setIsAssistantVoiceActive] = useState(false);
  const [homeAssistantAnswer, setHomeAssistantAnswer] = useState<{
    query: string;
    answer: string;
    suggestion: string;
  } | null>(null);

  const toolCards: {
    id: NavTab;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
  }[] = [
    {
      id: 'assistant',
      title: t.nav.assistant,
      description: 'Ask symptoms or health questions in simple English, Hindi, or Marathi.',
      icon: <MessageSquareHeart className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
      color: 'border-teal-200/60 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/30 hover:border-teal-400',
      badge: 'Voice Enabled'
    },
    {
      id: 'symptoms',
      title: t.nav.symptoms,
      description: 'Describe what hurts or select where you feel discomfort to assess urgency and self-care.',
      icon: <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: 'border-blue-200/60 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/30 hover:border-blue-400'
    },
    {
      id: 'reports',
      title: t.nav.reports,
      description: 'Upload your medical reports to simplify test values with normal ranges and plain words.',
      icon: <FileSpreadsheet className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      color: 'border-purple-200/60 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/30 hover:border-purple-400',
      badge: 'Upload & Demo'
    },
    {
      id: 'nutrition',
      title: t.nav.nutrition,
      description: 'Upload a food photo or list ingredients for instant calorie & nutrient estimates.',
      icon: <UtensilsCrossed className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      color: 'border-amber-200/60 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/30 hover:border-amber-400',
      badge: 'Photo & Recipe'
    },
    {
      id: 'doctors',
      title: t.nav.doctors,
      description: 'Match symptoms with relevant medical specialties and explore fictional demo clinics.',
      icon: <Stethoscope className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      color: 'border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 hover:border-emerald-400',
      badge: 'Distance & Accessibility'
    },
    {
      id: 'fitness',
      title: t.nav.fitness,
      description: 'Senior & beginner workout routines plus scientific evidence ratings for supplements.',
      icon: <Dumbbell className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      color: 'border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/30 hover:border-indigo-400',
      badge: 'Evidence-Based'
    },
    {
      id: 'medicines',
      title: t.nav.medicines,
      description: 'Review prescription details in plain language, check generics, and explore demo cart.',
      icon: <Pill className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
      color: 'border-rose-200/60 dark:border-rose-800/60 bg-rose-50/40 dark:bg-rose-950/30 hover:border-rose-400',
      badge: 'Generic Alternatives'
    },
    {
      id: 'mental',
      title: t.nav.mental,
      description: 'Calm breathing guides, sensory grounding, stress relief, and 24/7 crisis numbers.',
      icon: <Brain className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
      color: 'border-cyan-200/60 dark:border-cyan-800/60 bg-cyan-50/40 dark:bg-cyan-950/30 hover:border-cyan-400',
      badge: 'Breathe Pacer'
    },
    {
      id: 'period',
      title: t.nav.period,
      description: 'Opt-in, 100% private menstrual cycle prediction and hormonal phase explainer.',
      icon: <CalendarHeart className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
      color: 'border-pink-200/60 dark:border-pink-800/60 bg-pink-50/40 dark:bg-pink-950/30 hover:border-pink-400',
      badge: 'Private & Local'
    },
    {
      id: 'reminders',
      title: t.nav.reminders,
      description: 'Set daily pill, water, and clinic reminders that repeat your instructions accurately.',
      icon: <BellRing className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
      color: 'border-orange-200/60 dark:border-orange-800/60 bg-orange-50/40 dark:bg-orange-950/30 hover:border-orange-400',
      badge: 'Audio Alarm'
    }
  ];

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProblemInput.trim()) return;
    sessionStorage.setItem('healyaar_pending_symptom_problem', quickProblemInput);
    setTab('symptoms');
  };

  const handleToggleSymptomVoice = () => {
    if (isSymptomVoiceActive) {
      stopVoiceListening();
      setIsSymptomVoiceActive(false);
    } else {
      setIsSymptomVoiceActive(true);
      startVoiceListening((spokenText) => {
        setIsSymptomVoiceActive(false);
        setQuickProblemInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
        sessionStorage.setItem('healyaar_pending_symptom_problem', spokenText);
        setTab('symptoms');
      });
    }
  };

  // Home AI Assistant Quick Answer Generator
  const handleHomeAssistantAsk = (query: string) => {
    const q = query.trim();
    if (!q) return;

    const lower = q.toLowerCase();
    let ans = "I am here to help you understand this in simple, everyday language.";
    let sugg = "You can ask for natural home care, dietary adjustments, or clinic guidance.";

    if (lower.includes('hba1c') || lower.includes('sugar') || lower.includes('glucose') || lower.includes('diabetes')) {
      ans = "HbA1c measures your average blood sugar over the last 2 to 3 months. A value of 6.2% is in the 'prediabetes' range (5.7% to 6.4%). It means your cells are becoming slightly resistant to insulin, but early lifestyle steps like 30 minutes of daily walking and reducing refined sugar can often reverse it.";
      sugg = "Explore the Medical Lab Report Simplifier or check healthy Indian meal suggestions.";
    } else if (lower.includes('knee') || lower.includes('stiff') || lower.includes('joint') || lower.includes('walk')) {
      ans = "Morning knee stiffness that eases after light movement is common in early osteoarthritis or cartilage wear. Warm compresses, gentle seated knee extensions, and avoiding sudden deep squats can significantly reduce morning aches.";
      sugg = "Check our Senior Knee Exercise Guide or find nearby Orthopedic specialists.";
    } else if (lower.includes('cold') || lower.includes('headache') || lower.includes('fever') || lower.includes('throat')) {
      ans = "Mild tension headaches and scratchy throats often improve with hydration, resting away from screen glare, and gentle neck relaxation. If fever stays above 101°F or lasts more than 3 days, see a general physician.";
      sugg = "Explore safe home remedies or check emergency red flags.";
    } else {
      ans = `Regarding "${q}": Most mild symptoms can be assessed by tracking duration, intensity, and any warning signs. Keeping well-hydrated and resting helps your body recover while observing if medical evaluation is required.`;
      sugg = "Open the full conversation to ask specific follow-ups or check related medicines.";
    }

    setHomeAssistantAnswer({ query: q, answer: ans, suggestion: sugg });
  };

  const handleToggleAssistantVoice = () => {
    if (isAssistantVoiceActive) {
      stopVoiceListening();
      setIsAssistantVoiceActive(false);
    } else {
      setIsAssistantVoiceActive(true);
      startVoiceListening((spokenText) => {
        setIsAssistantVoiceActive(false);
        setHomeAssistantQuery(spokenText);
        handleHomeAssistantAsk(spokenText);
      });
    }
  };

  const handleOpenFullAssistant = (prefill?: string) => {
    const query = prefill || homeAssistantQuery || (homeAssistantAnswer ? homeAssistantAnswer.query : '');
    if (query) {
      sessionStorage.setItem('healyaar_pending_voice_query', query);
    }
    setTab('assistant');
  };

  const sampleJourneys = [
    {
      title: 'Senior Knee Pain & Stiffness',
      summary: 'Explore plain explanations, home warmth/mobility steps, and find local Orthopedic specialists.',
      actionTab: 'symptoms' as NavTab,
      prefill: 'My left knee feels stiff every morning and aches after walking downstairs for 2 weeks.',
      tag: 'Common Concern'
    },
    {
      title: 'Understanding High Blood Sugar Report',
      summary: 'See how fasting blood sugar of 114 mg/dL is explained simply without medical jargon.',
      actionTab: 'reports' as NavTab,
      tag: 'Lab Test Simplifier'
    },
    {
      title: 'Dal Roti vs High Protein Lunch',
      summary: 'Compare nutrition, calories, and protein balance for an everyday Indian home meal.',
      actionTab: 'nutrition' as NavTab,
      tag: 'Nutrition Calculator'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-16 overflow-x-clip relative">
      {/* =============================================================
          1. COMPACT WELCOME & TRUST BANNER (TRANSLUCENT HERO)
      ============================================================= */}
      <section className="relative z-10 rounded-2xl glass-card-hero bg-gradient-to-r from-teal-900/75 via-teal-950/80 to-slate-900/80 text-white p-4 sm:p-5 shadow-sm border border-teal-500/30 dark:border-teal-400/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/30 border border-teal-400/40 text-teal-200 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Clear, Calm & Caring Health Guidance</span>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-[10px] font-semibold border border-teal-400/30">
                On-Device Privacy
              </span>
            </h1>
            <p className="text-teal-100/90 text-xs mt-0.5">
              Welcome to <strong>HealYaar</strong> — friendly, plain-language health support for you and your family.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-teal-200/90 bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-700/50 self-start md:self-auto flex-shrink-0 backdrop-blur-xs">
          <Info className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
          <span>Informational only • Not medical diagnosis</span>
        </div>
      </section>

      {/* =============================================================
          CROSS-SECTION ARTWORK BRIDGE 1:
          Hero/Top Content -> "Describe your problem"
          Expanded 3D Capsule and Micronutrients overlapping boundary
      ============================================================= */}
      <div className="relative -my-6 h-0 pointer-events-none select-none z-1 overflow-visible">
        {/* Large Floating Two-Tone Capsule spanning into Symptom Card */}
        <div
          className="absolute -top-16 sm:-top-20 right-2 sm:right-10 float-drift-1"
          style={{ width: 'clamp(200px, 26vw, 300px)', opacity: 0.52 }}
          aria-hidden="true"
        >
          <CapsuleTwoTone className="w-full h-auto drop-shadow-md -rotate-24" />
        </div>
        {/* Left Nutrient Molecule Accent */}
        <div
          className="absolute -top-10 left-4 sm:left-12 float-drift-3 hidden sm:block"
          style={{ width: 'clamp(140px, 18vw, 200px)', opacity: 0.45 }}
          aria-hidden="true"
        >
          <NutrientMolecule className="w-full h-auto drop-shadow-sm rotate-20" />
        </div>
      </div>

      {/* =============================================================
          2. MAIN HEALTH / SYMPTOM GUIDANCE: "DESCRIBE YOUR PROBLEM"
          Translucent frosted glass card revealing artwork underneath
      ============================================================= */}
      <section className="interactive-card glass-card rounded-3xl p-6 sm:p-8 border border-white/70 dark:border-slate-700/60 shadow-glass space-y-6 relative z-2 overflow-visible group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-3">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200/60 dark:border-teal-800/60 mb-1 backdrop-blur-xs">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Symptom Triage (Text & Voice 🎙)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Describe your problem
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Tell us what you're experiencing using text or voice. We'll identify possible causes, safety red flags, and recommended next steps.
            </p>
          </div>

          <div className="hidden sm:flex flex-shrink-0 p-2.5 rounded-2xl glass-card-subtle border border-white/60 dark:border-slate-700/50 transition-transform duration-300 group-hover:scale-105">
            <HealthOverviewIllustration size="lg" />
          </div>
        </div>

        {/* Input area with glass styling */}
        <form onSubmit={handleSymptomSubmit} className="space-y-3 relative z-3">
          <div className="relative">
            <input
              type="text"
              value={quickProblemInput}
              onChange={(e) => setQuickProblemInput(e.target.value)}
              placeholder="Describe your symptoms, concerns, or how you're feeling... (e.g. 'I've had a headache since yesterday')"
              className="glass-input w-full px-5 py-4 pr-24 rounded-2xl border-2 border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-base font-medium placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-xs transition-all"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-4">
              {quickProblemInput && (
                <button
                  type="button"
                  onClick={() => setQuickProblemInput('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                >
                  Clear
                </button>
              )}

              {/* Symptom Dictation Microphone */}
              <button
                type="button"
                onClick={handleToggleSymptomVoice}
                className={`interactive-button p-2.5 rounded-xl transition-all shadow-sm ${
                  isSymptomVoiceActive || isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-teal-50/80 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 backdrop-blur-xs'
                }`}
                title="Speak your symptoms"
                aria-label="Speak your symptoms"
              >
                {isSymptomVoiceActive || isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Example Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Quick examples:</span>
              <button
                type="button"
                onClick={() => {
                  setQuickProblemInput("I've had a headache since yesterday.");
                  sessionStorage.setItem('healyaar_pending_symptom_problem', "I've had a headache since yesterday.");
                  setTab('symptoms');
                }}
                className="interactive-button px-2.5 py-1 rounded-lg glass-card-subtle hover:bg-teal-50/80 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/50 dark:border-slate-700/50"
              >
                "Headache since yesterday"
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickProblemInput('My stomach hurts after eating.');
                  sessionStorage.setItem('healyaar_pending_symptom_problem', 'My stomach hurts after eating.');
                  setTab('symptoms');
                }}
                className="interactive-button px-2.5 py-1 rounded-lg glass-card-subtle hover:bg-teal-50/80 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/50 dark:border-slate-700/50"
              >
                "Stomach hurts after eating"
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickProblemInput("I've been feeling tired and dizzy.");
                  sessionStorage.setItem('healyaar_pending_symptom_problem', "I've been feeling tired and dizzy.");
                  setTab('symptoms');
                }}
                className="interactive-button px-2.5 py-1 rounded-lg glass-card-subtle hover:bg-teal-50/80 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/50 dark:border-slate-700/50"
              >
                "Tired and dizzy"
              </button>
            </div>

            <button
              type="submit"
              disabled={!quickProblemInput.trim()}
              className="interactive-button px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm whitespace-nowrap z-4"
            >
              <span>Get Symptom Guidance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* =============================================================
          CROSS-SECTION ARTWORK BRIDGE 2:
          Symptom Guidance -> Self-Care Tools
          Large Stethoscope Curved and Apple crossing boundary
      ============================================================= */}
      <div className="relative -my-6 h-0 pointer-events-none select-none z-1 overflow-visible">
        {/* Large Curved Stethoscope crossing between sections */}
        <div
          className="absolute -top-16 sm:-top-24 -left-6 sm:left-4 float-drift-2"
          style={{ width: 'clamp(240px, 32vw, 360px)', opacity: 0.48 }}
          aria-hidden="true"
        >
          <StethoscopeCurved className="w-full h-auto drop-shadow-md rotate-12" />
        </div>
        {/* Right Fresh Apple Accent */}
        <div
          className="absolute -top-12 right-4 sm:right-16 float-drift-4"
          style={{ width: 'clamp(170px, 22vw, 250px)', opacity: 0.48 }}
          aria-hidden="true"
        >
          <AppleFresh className="w-full h-auto drop-shadow-sm -rotate-14" />
        </div>
      </div>

      {/* =============================================================
          3. SELF-CARE TOOLS (MAIN CONTENT GRID)
          Translucent cards revealing the flowing artwork underneath
      ============================================================= */}
      <section className="space-y-4 relative z-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Health Information & Self-Care Tools
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Everything you need in one accessible place. Designed with large touch targets, high contrast, and screen-reader support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setTab(card.id)}
              className="interactive-card glass-card-content p-6 rounded-3xl border border-white/70 dark:border-slate-700/50 hover:border-teal-400/80 dark:hover:border-teal-500/60 text-left shadow-glass flex flex-col justify-between group cursor-pointer relative z-2"
            >
              <div className="relative z-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 glass-card-subtle rounded-2xl group-hover:scale-105 transition-transform duration-200 border border-white/60 dark:border-slate-700/60">
                    {card.icon}
                  </div>
                  {card.badge && (
                    <span className="px-2.5 py-0.5 rounded-full glass-card-subtle text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">
                      {card.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors duration-200">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors relative z-3">
                <span>Open {card.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =============================================================
          CROSS-SECTION ARTWORK BRIDGE 3:
          Self-Care Tools -> Plain-Language Medical Terms
          Medical Cross 3D and Report Clipboard crossing boundary
      ============================================================= */}
      <div className="relative -my-6 h-0 pointer-events-none select-none z-1 overflow-visible">
        {/* Floating 3D Medical Cross on Left */}
        <div
          className="absolute -top-14 left-4 sm:left-10 float-drift-1"
          style={{ width: 'clamp(160px, 20vw, 240px)', opacity: 0.44 }}
          aria-hidden="true"
        >
          <MedicalCross3D className="w-full h-auto drop-shadow-md rotate-18" />
        </div>
        {/* Floating Report Clipboard on Right */}
        <div
          className="absolute -top-16 right-4 sm:right-12 float-drift-3"
          style={{ width: 'clamp(180px, 22vw, 250px)', opacity: 0.46 }}
          aria-hidden="true"
        >
          <ReportClipboard className="w-full h-auto drop-shadow-sm -rotate-10" />
        </div>
      </div>

      {/* =============================================================
          4. TODAY'S PLAIN-LANGUAGE HEALTH TERMS & PRIVACY (INTERMEDIATE)
          Translucent informational cards with crisp solid typography
      ============================================================= */}
      <section className="interactive-card glass-card rounded-3xl border border-white/70 dark:border-slate-700/50 p-6 sm:p-8 shadow-glass relative z-2 overflow-visible">
        <div className="flex items-center gap-3 mb-5 relative z-3">
          <div className="p-2.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50 backdrop-blur-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Today’s Plain-Language Health Terms
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear everyday translations for common clinical terminology.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm relative z-3">
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/60 dark:border-slate-700/60 shadow-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Hypertension</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              "High blood pressure". It means the blood is pushing too hard against the walls of your arteries as your heart pumps it.
            </p>
          </div>
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/60 dark:border-slate-700/60 shadow-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Fasting Blood Sugar</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              The amount of sugar in your blood after going without food for 8+ hours. Helps check how well your body handles glucose.
            </p>
          </div>
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/60 dark:border-slate-700/60 shadow-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Hemoglobin</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              The oxygen truck in your blood. It carries oxygen from your lungs to your muscles and brain so you feel energized.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Educational Assurance */}
      <section className="glass-card-subtle backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-800/60 p-5 text-center text-xs text-slate-600 dark:text-slate-400 space-y-1.5 relative z-2">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>HealYaar Privacy & Medical Ethics Commitment</span>
        </div>
        <p className="max-w-2xl mx-auto leading-relaxed">
          We never sell health information or track you across sites. All entries are saved strictly in your local browser session. All doctor listings, lab reports, and medicine catalogues are synthetic models intended for patient empowerment and education.
        </p>
      </section>

      {/* =============================================================
          CROSS-SECTION ARTWORK BRIDGE 4:
          Intermediate Sections -> Home AI Assistant Section
          Neural Synapse leading directly toward and behind AI Assistant
      ============================================================= */}
      <div className="relative -my-6 h-0 pointer-events-none select-none z-1 overflow-visible">
        {/* Neural Synapse extending from above into AI Assistant */}
        <div
          className="absolute -top-14 sm:-top-20 left-2 sm:left-8 float-drift-3"
          style={{ width: 'clamp(220px, 30vw, 340px)', opacity: 0.52 }}
          aria-hidden="true"
        >
          <NeuralSynapse className="w-full h-auto drop-shadow-md -rotate-12" />
        </div>
      </div>

      {/* =============================================================
          5. THE HOME AI ASSISTANT SECTION (VISUAL CULMINATION OF PAGE)
          Large radiant AI Orb glowing behind frosted transparent sanctuary card,
          with live conversational Q&A, voice input, and gradient readability zone.
      ============================================================= */}
      <section
        id="home-ai-assistant"
        className="relative z-2 rounded-3xl glass-card-hero border border-teal-500/35 dark:border-teal-400/25 p-6 sm:p-10 shadow-elevated overflow-visible group"
      >
        {/* EXPANDED FLOATING AI ARTWORK LAYER: Radiant AI Orb glowing behind card */}
        <div
          className="absolute -top-16 sm:-top-24 -right-10 sm:-right-4 float-drift-4 pointer-events-none select-none z-1"
          style={{ width: 'clamp(280px, 36vw, 420px)', opacity: 0.58 }}
          aria-hidden="true"
        >
          <AIOrbGlowing className="w-full h-auto drop-shadow-2xl" />
        </div>

        {/* Local Gradient Readability Scrim (Ensures text is 100% crisp over artwork) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/65 via-teal-50/25 to-white/55 dark:from-slate-900/70 dark:via-teal-950/25 dark:to-slate-900/70 pointer-events-none z-1" />

        <div className="relative z-3 space-y-6">
          {/* Header & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50/80 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-300/60 dark:border-teal-700/60 shadow-xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
                <span>HealYaar AI Health Companion</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Always Ready</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Ask anything about your health
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Describe symptoms, paste lab test values, or ask about daily wellness in simple, caring words. Powered by verified medical references with zero jargon.
              </p>
            </div>

            <div className="flex-shrink-0 self-start md:self-auto">
              <button
                onClick={() => handleOpenFullAssistant()}
                className="interactive-button px-5 py-2.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300/60 dark:border-teal-700/60 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors backdrop-blur-xs z-4"
              >
                <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Open Full Assistant View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Question Input */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={homeAssistantQuery}
                onChange={(e) => setHomeAssistantQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleHomeAssistantAsk(homeAssistantQuery);
                  }
                }}
                placeholder="Ask a health question... (e.g. 'What does fasting blood sugar 114 mg/dL mean?')"
                className="glass-input w-full px-5 py-4 pr-32 rounded-2xl border-2 border-teal-200/80 dark:border-teal-800/80 text-slate-900 dark:text-slate-100 text-base font-medium placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-sm transition-all"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-4">
                {/* Voice Dictation Microphone */}
                <button
                  type="button"
                  onClick={handleToggleAssistantVoice}
                  className={`interactive-button p-2.5 rounded-xl transition-all shadow-sm ${
                    isAssistantVoiceActive || isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-teal-50/80 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  }`}
                  title={isAssistantVoiceActive ? 'Stop Voice Listening' : 'Speak your question'}
                  aria-label="Speak health question"
                >
                  {isAssistantVoiceActive || isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Submit / Ask Button */}
                <button
                  type="button"
                  onClick={() => handleHomeAssistantAsk(homeAssistantQuery)}
                  disabled={!homeAssistantQuery.trim()}
                  className="interactive-button px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-extrabold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  <span>Ask</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Suggested topics:</span>
              </span>
              {[
                "What does 'HbA1c 6.2%' mean?",
                "Why do knees feel stiff in the morning?",
                "Home care for mild cold & sore throat",
                "When to see a doctor for headache"
              ].map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    setHomeAssistantQuery(prompt);
                    handleHomeAssistantAsk(prompt);
                  }}
                  className="interactive-button px-3 py-1.5 rounded-xl glass-card-subtle hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-200 border border-teal-200/50 dark:border-teal-800/50 font-medium transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Instant Plain-Language Answer Display (If asked) */}
          {homeAssistantAnswer && (
            <div className="p-5 sm:p-6 rounded-2xl glass-card-hero border border-teal-400/50 dark:border-teal-600/40 space-y-4 shadow-glass animate-fade-in relative z-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Plain-Language Explanation:</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Just now • HealYaar AI
                </span>
              </div>

              <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
                {homeAssistantAnswer.answer}
              </p>

              <div className="pt-3 border-t border-teal-100/60 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400 italic">
                  💡 {homeAssistantAnswer.suggestion}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenFullAssistant(homeAssistantAnswer.query)}
                  className="interactive-button px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
                >
                  <span>Chat More in Full Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =============================================================
          CROSS-SECTION ARTWORK BRIDGE 5:
          Home AI Assistant -> Common Sample Journeys
          Serene Cloud & Security Shield crossing boundary
      ============================================================= */}
      <div className="relative -my-6 h-0 pointer-events-none select-none z-1 overflow-visible">
        {/* Serene Cloud drifting below AI Assistant */}
        <div
          className="absolute -top-14 left-4 sm:left-12 float-drift-1"
          style={{ width: 'clamp(200px, 26vw, 300px)', opacity: 0.45 }}
          aria-hidden="true"
        >
          <SereneCloud className="w-full h-auto drop-shadow-sm rotate-4" />
        </div>
        {/* Right Security Shield Cross Accent */}
        <div
          className="absolute -top-12 right-6 sm:right-16 float-drift-3"
          style={{ width: 'clamp(160px, 20vw, 240px)', opacity: 0.44 }}
          aria-hidden="true"
        >
          <SecurityShieldCross className="w-full h-auto drop-shadow-sm -rotate-8" />
        </div>
      </div>

      {/* =============================================================
          6. COMMON SAMPLE JOURNEY (PRESERVED CONTENT)
          Translucent journey cards
      ============================================================= */}
      <section className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 relative z-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Common Sample Journey
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Click any realistic scenario below to see how HealYaar breaks down concerns without medical jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleJourneys.map((j, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (j.prefill) {
                  sessionStorage.setItem('healyaar_pending_symptom_problem', j.prefill);
                }
                setTab(j.actionTab);
              }}
              className="interactive-card glass-card-content group cursor-pointer p-6 rounded-3xl border border-white/70 dark:border-slate-700/50 hover:border-teal-400/80 dark:hover:border-teal-500/60 shadow-glass transition-all flex flex-col justify-between relative z-2"
            >
              <div className="relative z-3">
                <div className="inline-block px-2.5 py-0.5 bg-teal-50/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 rounded-md text-[11px] font-bold mb-3 backdrop-blur-xs">
                  {j.tag}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                  {j.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {j.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-teal-700 dark:text-teal-400 font-bold text-xs relative z-3">
                <span>Start Journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================================
          7. EMERGENCY ALERT / CALL SOS SECTION
          Preserved at the very bottom of the page with soft glass styling
      ============================================================= */}
      <section
        aria-label="Emergency Medical Assistance"
        className="glass-card-subtle mt-8 p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 backdrop-blur-md border border-rose-200/80 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs relative z-2"
      >
        <div className="flex items-center gap-3 min-w-0 relative z-3">
          <div className="p-2.5 bg-rose-100/90 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-rose-950 dark:text-rose-100">
              Experiencing severe chest pain, breathing trouble, or sudden collapse?
            </h2>
            <p className="text-xs sm:text-sm text-rose-800/90 dark:text-rose-300/90 mt-0.5">
              Do not wait for online advice. Call emergency responders (108 / 112) or go to the nearest emergency room immediately.
            </p>
          </div>
        </div>

        <button
          onClick={openEmergencyModal}
          className="interactive-button w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-transform active:scale-95 flex-shrink-0 flex items-center justify-center gap-2 whitespace-nowrap z-4"
          title="Open Emergency SOS Helplines"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call SOS (108 / 112)</span>
        </button>
      </section>
    </div>
  );
};
