import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  RotateCcw,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { NavTab } from '../types';
import { SectionHero } from '../components/ui/SectionHero';
import { SymptomGuidanceIllustration } from '../components/ContextualIllustrations';
import {
  analyzeProblemDescription,
  SymptomAnalysisResult
} from '../services/symptomAnalysisService';

interface BodyRegion {
  id: string;
  name: string;
  iconText: string;
  symptoms: string[];
  matchedSpecialty: string;
}

export const SymptomGuidanceView: React.FC = () => {
  const { setTab, t, openEmergencyModal, startVoiceListening, stopVoiceListening, isListening } = useApp();

  const bodyRegions: BodyRegion[] = [
    {
      id: 'head',
      name: 'Head & Eyes',
      iconText: '🧠',
      symptoms: ['Throbbing Headache', 'Dizziness / Lightheadedness', 'Eye Strain / Redness', 'Mild Sinus Congestion'],
      matchedSpecialty: 'General Medicine'
    },
    {
      id: 'chest',
      name: 'Chest & Breathing',
      iconText: '🫁',
      symptoms: ['Mild Dry Cough', 'Chest Tightness', 'Shortness of Breath on Exertion', 'Throat Tickle'],
      matchedSpecialty: 'Cardiology'
    },
    {
      id: 'stomach',
      name: 'Stomach & Digestion',
      iconText: '🥣',
      symptoms: ['Acidity / Heartburn', 'Bloating & Gas', 'Mild Cramps / Loose Motions', 'Loss of Appetite'],
      matchedSpecialty: 'General Medicine'
    },
    {
      id: 'joints',
      name: 'Joints & Bones',
      iconText: '🦴',
      symptoms: ['Knee Pain / Stiffness', 'Lower Back Ache', 'Shoulder Soreness', 'Ankle Twisting / Sprain'],
      matchedSpecialty: 'Orthopedics'
    },
    {
      id: 'skin',
      name: 'Skin & Rash',
      iconText: '🩹',
      symptoms: ['Itchy Red Patches', 'Dry Peeling Skin', 'Acne / Pimples', 'Mild Sunburn'],
      matchedSpecialty: 'Dermatology'
    },
    {
      id: 'general',
      name: 'General & Fatigue',
      iconText: '🌡️',
      symptoms: ['Low-Grade Fever', 'Body Tiredness / Weakness', 'Poor Sleep / Restlessness', 'Dehydration'],
      matchedSpecialty: 'General Medicine'
    }
  ];

  // -------------------------------------------------------------
  // Natural Language Problem Description & Voice Input
  // -------------------------------------------------------------
  const [problemInput, setProblemInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisResult | null>(null);
  const [isSymptomVoiceActive, setIsSymptomVoiceActive] = useState<boolean>(false);

  // Manual Exploration State
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion>(bodyRegions[3]); // default joints
  const [selectedSymptom, setSelectedSymptom] = useState<string>('Knee Pain / Stiffness');
  const [duration, setDuration] = useState<'hours' | 'days' | 'weeks'>('days');
  const [severity, setSeverity] = useState<number>(4);
  const [hasRedFlags, setHasRedFlags] = useState<boolean>(false);
  const [showManualTriage, setShowManualTriage] = useState<boolean>(false);

  // Check if a problem was passed from the Home page
  useEffect(() => {
    const pending = sessionStorage.getItem('healyaar_pending_symptom_problem');
    if (pending) {
      sessionStorage.removeItem('healyaar_pending_symptom_problem');
      setProblemInput(pending);
      const res = analyzeProblemDescription(pending);
      setAnalysisResult(res);

      // Match body region if possible
      const matched = bodyRegions.find((r) => r.id === res.matchedRegionId);
      if (matched) {
        setSelectedRegion(matched);
        setSelectedSymptom(res.primarySymptom);
      }
    }
  }, []);

  const handleAnalyzeProblem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problemInput.trim()) return;

    const res = analyzeProblemDescription(problemInput);
    setAnalysisResult(res);

    // Sync region
    const matched = bodyRegions.find((r) => r.id === res.matchedRegionId);
    if (matched) {
      setSelectedRegion(matched);
      setSelectedSymptom(res.primarySymptom);
    }
  };

  const handleToggleSymptomVoice = () => {
    if (isSymptomVoiceActive) {
      stopVoiceListening();
      setIsSymptomVoiceActive(false);
    } else {
      setIsSymptomVoiceActive(true);
      startVoiceListening((spokenText) => {
        setIsSymptomVoiceActive(false);
        setProblemInput((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
        const res = analyzeProblemDescription(spokenText);
        setAnalysisResult(res);
      });
    }
  };

  const handleApplyExample = (exampleText: string) => {
    setProblemInput(exampleText);
    const res = analyzeProblemDescription(exampleText);
    setAnalysisResult(res);

    const matched = bodyRegions.find((r) => r.id === res.matchedRegionId);
    if (matched) {
      setSelectedRegion(matched);
      setSelectedSymptom(res.primarySymptom);
    }
  };

  // Compute manual triage urgency level
  const getUrgencyLevel = () => {
    if (hasRedFlags) {
      return {
        level: 'Emergency Medical Help Needed',
        color: 'bg-red-50 border-red-500 text-red-900',
        badgeColor: 'bg-red-600 text-white',
        advice: 'You checked one or more critical warning signs. Do not wait. Please seek emergency medical care or call 108 immediately.',
        action: 'emergency'
      };
    }
    if (severity >= 8 || (duration === 'weeks' && severity >= 6)) {
      return {
        level: 'Prompt Doctor Evaluation Recommended',
        color: 'bg-amber-50 border-amber-500 text-amber-900',
        badgeColor: 'bg-amber-600 text-white',
        advice: 'Because your pain level is significant or has persisted for several weeks, an in-person physical assessment is advised to rule out deeper inflammation or damage.',
        action: 'doctor'
      };
    }
    if (severity >= 5 || duration === 'weeks') {
      return {
        level: 'Routine Clinic Visit / Non-Urgent',
        color: 'bg-blue-50 border-blue-400 text-blue-900',
        badgeColor: 'bg-blue-600 text-white',
        advice: 'Moderate symptoms that do not require an emergency room. Book a routine appointment with a doctor while maintaining gentle rest at home.',
        action: 'doctor'
      };
    }
    return {
      level: 'Safe Home Care & Observation',
      color: 'bg-emerald-50 border-emerald-400 text-emerald-900',
      badgeColor: 'bg-emerald-600 text-white',
      advice: 'Your symptom appears mild and manageable with self-care, hydration, and gentle rest. Monitor over the next 48-72 hours.',
      action: 'self-care'
    };
  };

  const manualUrgency = getUrgencyLevel();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <SectionHero
        badge="Clinical Guidance"
        badgeIcon={<Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
        title="Symptom Guidance"
        description="Describe what you are experiencing to receive plain explanations, safety red flags, safe self-care steps, and doctor recommendations."
        illustration={<SymptomGuidanceIllustration size="lg" />}
      />

      {/* =============================================================
          1. DESCRIBE YOUR PROBLEM (TOP PROMINENT SECTION - Text & Voice)
      ============================================================= */}
      <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-teal-600" />
              <span>Describe your problem</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">
              Type or speak naturally. You do not need to fill out a long checklist first.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 w-fit">
            Text or Voice 🎙
          </span>
        </div>

        {/* Input Form with Microphone */}
        <form onSubmit={handleAnalyzeProblem} className="space-y-3">
          <div className="relative">
            <textarea
              id="symptom-problem-input"
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              placeholder="Tell us what you're experiencing... (e.g., 'I've had a headache since yesterday', 'My stomach hurts after eating', or 'I've been feeling tired and dizzy')"
              rows={3}
              className="w-full px-4 py-3.5 pr-28 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base font-medium focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 transition-all resize-none shadow-xs"
            />

            {/* In-field Action Buttons: Voice Mic + Clear */}
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {problemInput && (
                <button
                  type="button"
                  onClick={() => {
                    setProblemInput('');
                    setAnalysisResult(null);
                  }}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Clear
                </button>
              )}

              {/* Dedicated Symptom Microphone Button */}
              <button
                type="button"
                onClick={handleToggleSymptomVoice}
                className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                  isSymptomVoiceActive || isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800'
                }`}
                title="Speak your problem (Symptom Voice Input)"
                aria-label="Speak your problem"
              >
                {isSymptomVoiceActive || isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                )}
              </button>
            </div>
          </div>

          {/* Voice Status Indicator if listening */}
          {(isSymptomVoiceActive || isListening) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>Listening for symptoms... Speak clearly into your microphone.</span>
            </div>
          )}

          {/* Submit Button & Quick Example Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Try an example:</span>
              <button
                type="button"
                onClick={() => handleApplyExample("I've had a headache since yesterday.")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                "Headache since yesterday"
              </button>
              <button
                type="button"
                onClick={() => handleApplyExample("My stomach hurts after eating.")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                "Stomach hurts after eating"
              </button>
              <button
                type="button"
                onClick={() => handleApplyExample("I've been feeling tired and dizzy.")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                "Tired and dizzy"
              </button>
            </div>

            <button
              type="submit"
              disabled={!problemInput.trim()}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <span>Get Symptom Guidance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* =============================================================
          2. AI SYMPTOM GUIDANCE RESULTS (Clean Hierarchy)
      ============================================================= */}
      {analysisResult && (
        <section className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-6 animate-fade-in ${analysisResult.urgencyColor}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-teal-600 flex-shrink-0" />
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${analysisResult.urgencyBadgeColor}`}>
                  {analysisResult.urgencyLevel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  {analysisResult.problemTitle}
                </h3>
              </div>
            </div>

            {analysisResult.isRedFlag ? (
              <button
                onClick={openEmergencyModal}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow animate-pulse text-sm uppercase flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Open Emergency SOS</span>
              </button>
            ) : (
              <button
                onClick={() => setTab('doctors')}
                className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Find {analysisResult.recommendedSpecialty.split('/')[0]}</span>
              </button>
            )}
          </div>

          {/* Plain Language Summary */}
          <p className="text-base sm:text-lg leading-relaxed font-medium">
            {analysisResult.plainLanguageSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Possible Causes */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2 text-sm text-slate-800 dark:text-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-base">
                <Info className="w-5 h-5 text-blue-600" />
                <span>Possible Causes (Non-Diagnostic):</span>
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                {analysisResult.possibleCauses.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </div>

            {/* 2. Red Flags to Watch For */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2 text-sm text-slate-800 dark:text-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-base">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Red Flags to Watch For:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                {analysisResult.redFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Recommended Next Steps & Specialty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Next Steps */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2 text-sm text-slate-800 dark:text-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Recommended Next Steps:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                {analysisResult.recommendedNextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Relevant Doctor Specialty */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2 text-sm text-slate-800 dark:text-slate-200">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-base">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Relevant Doctor Specialty:</span>
              </h4>
              <p className="font-bold text-teal-800 dark:text-teal-300 text-base">
                {analysisResult.recommendedSpecialty}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {analysisResult.doctorSpecialtyReason}
              </p>
              <button
                onClick={() => setTab('doctors')}
                className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
              >
                <span>Find specialists in Doctor Finder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clinical Safety Disclaimer */}
          <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              <strong>Clinical Reminder:</strong> This guidance is an informational summary to help communicate with a doctor. It does not constitute a diagnosis.
            </span>
          </div>
        </section>
      )}

      {/* =============================================================
          3. OPTIONAL DETAILED BODY PART & SEVERITY EXPLORATION
      ============================================================= */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowManualTriage((prev) => !prev)}
          className="text-sm font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 flex items-center gap-1.5 transition-colors"
        >
          <span>{showManualTriage ? '▲ Hide detailed body selector & severity sliders' : '▼ Explore by specific body region & severity sliders'}</span>
        </button>
      </div>

      {showManualTriage && (
        <div className="space-y-6 animate-fade-in">
          {/* Step 1: Body Part Selector */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-black">
                1
              </span>
              Select Body Region:
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {bodyRegions.map((region) => {
                const isSelected = selectedRegion.id === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => {
                      setSelectedRegion(region);
                      setSelectedSymptom(region.symptoms[0]);
                    }}
                    className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-sm ring-2 ring-teal-400'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-3xl">{region.iconText}</span>
                    <span className="font-bold text-xs sm:text-sm">{region.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Specific Symptom Choice */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-black">
                2
              </span>
              Which symptom best matches what you feel?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedRegion.symptoms.map((symptom) => {
                const isChecked = selectedSymptom === symptom;
                return (
                  <button
                    key={symptom}
                    onClick={() => setSelectedSymptom(symptom)}
                    className={`p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center justify-between ${
                      isChecked
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 ring-2 ring-blue-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{symptom}</span>
                    {isChecked && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Duration & Severity Sliders */}
          <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-black">
                3
              </span>
              How long and how intense is it?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['hours', 'days', 'weeks'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-3 rounded-xl font-bold text-sm border-2 ${
                        duration === d
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {d === 'hours' ? 'Few Hours' : d === 'days' ? 'Few Days' : '2+ Weeks'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Slider (1 to 10) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span>Discomfort Level (1 to 10):</span>
                  <span className="text-base px-3 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                    {severity} / 10 ({severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>1 (Barely noticeable)</span>
                  <span>5 (Interferes with routine)</span>
                  <span>10 (Unbearable)</span>
                </div>
              </div>
            </div>

            {/* Red Flag Checkbox */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRedFlags}
                  onChange={(e) => setHasRedFlags(e.target.checked)}
                  className="w-5 h-5 accent-red-600 mt-1 rounded cursor-pointer"
                />
                <div className="text-sm">
                  <span className="font-bold">
                    Check here if you also notice any red-flag signs:
                  </span>
                  <p className="text-xs sm:text-sm mt-0.5 opacity-90">
                    Sudden loss of sensation, high fever with chills, unable to bear any weight on the leg, confusion, or difficulty breathing.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Manual Triage Output Card */}
          <section className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg space-y-6 ${manualUrgency.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-teal-600 flex-shrink-0" />
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${manualUrgency.badgeColor}`}>
                    Triage Level
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    {manualUrgency.level}
                  </h3>
                </div>
              </div>

              {manualUrgency.action === 'emergency' && (
                <button
                  onClick={openEmergencyModal}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow animate-pulse text-sm uppercase"
                >
                  Open Emergency SOS
                </button>
              )}

              {manualUrgency.action === 'doctor' && (
                <button
                  onClick={() => setTab('doctors')}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow text-sm flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Find {selectedRegion.matchedSpecialty}</span>
                </button>
              )}
            </div>

            <p className="text-base sm:text-lg leading-relaxed font-medium">
              {manualUrgency.advice}
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
