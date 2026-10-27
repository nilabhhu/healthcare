import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PeriodTrackerIllustration } from '../components/ContextualIllustrations';
import {
  MOTIVATIONAL_QUOTES,
  getStoredCyclePreferences,
  saveCyclePreferences,
  calculateCycleDetails,
  CycleCalculationResult,
  CyclePhaseInfo
} from '../services/cycleService';
import {
  CalendarHeart,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Plus,
  Sparkles,
  Flower2,
  RefreshCw,
  Compass
} from 'lucide-react';

export const PeriodTrackerView: React.FC = () => {
  const {
    currentUser,
    periodLogs,
    savePeriodLog,
    deletePeriodLogs,
    showToast
  } = useApp();

  // -------------------------------------------------------------
  // 1. CYCLE TRACKING & PREDICTION STATE
  // -------------------------------------------------------------
  const initialPrefs = useMemo(() => getStoredCyclePreferences(currentUser?.id), [currentUser?.id]);

  const [inputStartDate, setInputStartDate] = useState<string>(
    periodLogs[0]?.startDate || initialPrefs.lastPeriodStart || '2026-10-02'
  );
  const [cycleLengthDays, setCycleLengthDays] = useState<number>(
    periodLogs[0]?.cycleLengthDays || initialPrefs.typicalCycleLength || 28
  );
  const [periodDurationDays, setPeriodDurationDays] = useState<number>(
    periodLogs[0]?.periodDurationDays || initialPrefs.periodDuration || 5
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Mild Cramps']);
  const [flowIntensity, setFlowIntensity] = useState<'Light' | 'Medium' | 'Heavy'>('Medium');

  // Motivational quote state
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  // Dynamic Menstrual Cycle Calculation (Days, 4 Phases, Timeline, Next Period Window, Ovulation)
  const cycleData: CycleCalculationResult = useMemo(() => {
    return calculateCycleDetails(inputStartDate, cycleLengthDays, periodDurationDays);
  }, [inputStartDate, cycleLengthDays, periodDurationDays]);

  // Selected phase in the interactive timeline for detailed preview (defaults to active phase)
  const [selectedPhaseType, setSelectedPhaseType] = useState<string | null>(null);
  const focusedPhase: CyclePhaseInfo = useMemo(() => {
    if (selectedPhaseType) {
      const found = cycleData.allPhases.find((p) => p.type === selectedPhaseType);
      if (found) return found;
    }
    return cycleData.currentPhase;
  }, [selectedPhaseType, cycleData]);

  // Synchronize preferences to localStorage when adjusted
  useEffect(() => {
    saveCyclePreferences({
      lastPeriodStart: inputStartDate,
      typicalCycleLength: cycleLengthDays,
      periodDuration: periodDurationDays
    }, currentUser?.id);
  }, [inputStartDate, cycleLengthDays, periodDurationDays, currentUser?.id]);

  const commonCycleSymptoms = [
    'Mild Cramps',
    'Lower Back Ache',
    'Headache',
    'Bloating',
    'Tender Breasts',
    'Fatigue / Low Energy',
    'Acne Breakout',
    'Food Cravings',
    'Mood Shifts',
    'Digestive Sensitivity'
  ];

  const handleToggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStartDate) return;

    savePeriodLog({
      startDate: inputStartDate,
      cycleLengthDays,
      periodDurationDays,
      symptoms: selectedSymptoms,
      flowIntensity
    });

    saveCyclePreferences({
      lastPeriodStart: inputStartDate,
      typicalCycleLength: cycleLengthDays,
      periodDuration: periodDurationDays
    });

    showToast('🌸 Cycle entry saved privately on your device!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* SOFT PASTEL BLUSH SANCTUARY CONTAINER */}
      <div className="sanctuary-canvas bg-gradient-to-b from-rose-50/90 via-pink-50/40 to-purple-50/30 dark:from-slate-900/90 dark:via-rose-950/20 dark:to-slate-900/80 rounded-3xl p-4 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-sm space-y-8">

        {/* -------------------------------------------------------------
            HEADER: Soft, Cute & Calming Wellness Aesthetic
        ------------------------------------------------------------- */}
        <div className="sanctuary-card bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-2xl shadow-inner flex items-center justify-center">
              <Flower2 className="w-7 h-7 animate-pulse text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100">
                  Cycle & Wellness Sanctuary
                </h1>
                <span className="text-xl">🌸</span>
              </div>
              <p className="text-rose-900/80 dark:text-rose-300/80 text-sm sm:text-base mt-1">
                A gentle, 100% private space to understand your cycle, track rhythms, and care for your body.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="hidden sm:block">
              <PeriodTrackerIllustration size="sm" />
            </div>
            {periodLogs.length > 0 && (
              <button
                onClick={deletePeriodLogs}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete Cycle Records</span>
              </button>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------
            MOTIVATIONAL QUOTES BANNER (Modern, Funky & Empowering)
        ------------------------------------------------------------- */}
        <div className="sanctuary-card bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-rose-100 dark:border-rose-900/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  Cycle Affirmation & Energy
                </span>
                <span className="text-xs">✨</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-rose-950 dark:text-rose-100 italic">
                "{MOTIVATIONAL_QUOTES[quoteIndex]}"
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuote}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-95 whitespace-nowrap self-end sm:self-center"
            title="Inspire me with another quote"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
            <span>New Quote</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            DISCLAIMER: Non-Contraceptive Notice
        ------------------------------------------------------------- */}
        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Gentle Clinical Reminder:</strong> Predictions and phase calculations are statistical estimates for wellness and self-care. Cycle timing naturally shifts with stress, sleep, travel, and illness. This tool is <strong>not a contraceptive method</strong> and does not replace medical advice from a gynecologist.
          </div>
        </div>

        {/* -------------------------------------------------------------
            CYCLE PREDICTION HERO BANNER (Soft Dreamy Rose Gradient)
        ------------------------------------------------------------- */}
        <section className="bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-pink-200/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  <CalendarHeart className="w-3.5 h-3.5" />
                  <span>Predicted Period Window</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white">
                  <span>Cycle Day {cycleData.currentCycleDay} of {cycleData.totalCycleLength}</span>
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-sm">
                {cycleData.nextPeriodWindowStr}
              </h2>

              <div className="text-pink-50 text-sm font-medium flex flex-wrap items-center gap-3">
                <span>
                  {cycleData.isCurrentlyOnPeriod
                    ? `🌸 Day ${cycleData.currentCycleDay} of your period. Be gentle with your body today.`
                    : `Predicted in ~${cycleData.daysUntilNextPeriod} days (based on your ${cycleData.totalCycleLength}-day typical cycle).`}
                </span>
                <span className="hidden sm:inline opacity-60">•</span>
                <span>Ovulation window: <strong>{cycleData.ovulationWindowStr}</strong></span>
              </div>
              <p className="text-[11px] text-pink-100/80 italic">
                * Cycle predictions are estimates for wellness and self-care. Cycle timing shifts naturally.
              </p>
            </div>

            {/* Current Phase Micro-Card */}
            <div className="p-4 sm:p-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-xs sm:text-sm text-pink-50 max-w-sm space-y-1.5 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-white uppercase tracking-wider text-[11px]">
                  Current Phase
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-white font-bold text-[10px]">
                  {cycleData.currentPhase.badge}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                {cycleData.currentPhase.title}
              </h4>
              <p className="text-white/90 text-xs">
                {cycleData.currentPhase.description}
              </p>
              <div className="pt-1 border-t border-white/20 text-[11px] text-pink-100">
                <strong>Vibe:</strong> {cycleData.currentPhase.energyLevel}
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            4 PHASES INTERACTIVE CYCLE TIMELINE ("YOU ARE HERE")
        ------------------------------------------------------------- */}
        <section className="sanctuary-card bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-xl font-bold text-rose-950 dark:text-rose-100">
                  Menstrual Cycle Rhythm & 4 Phases
                </h3>
              </div>
              <p className="text-rose-900/70 dark:text-rose-300/70 text-xs sm:text-sm mt-0.5">
                Automatically calculated from your last period start ({inputStartDate}). Click any phase to inspect hormonal shifts and self-care.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800 rounded-xl text-rose-900 dark:text-rose-200 font-bold text-xs">
              <span>Day {cycleData.currentCycleDay} of {cycleData.totalCycleLength}</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
          </div>

          {/* Overall Cycle Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-rose-800 dark:text-rose-300 font-semibold">
              <span>Cycle Start (Day 1)</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">Progress: {cycleData.cycleProgressPercent}%</span>
              <span>Cycle End (Day {cycleData.totalCycleLength})</span>
            </div>
            <div className="w-full bg-rose-100/70 dark:bg-rose-950/60 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 rounded-full transition-all duration-500 shadow-inner"
                style={{ width: `${cycleData.cycleProgressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Phase Segment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {cycleData.allPhases.map((phase) => {
              const isCurrent = cycleData.currentPhase.type === phase.type;
              const isSelected = focusedPhase.type === phase.type;

              return (
                <button
                  key={phase.type}
                  type="button"
                  onClick={() => setSelectedPhaseType(phase.type)}
                  className={`p-4 rounded-2xl text-left transition-all relative flex flex-col justify-between border-2 ${
                    isSelected
                      ? 'border-rose-400 bg-rose-50/90 dark:bg-rose-950/60 shadow-xs'
                      : 'border-rose-100 dark:border-rose-900/40 bg-white/80 dark:bg-slate-850 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
                  }`}
                >
                  {/* "You Are Here" Badge on Active Phase */}
                  {isCurrent && (
                    <div className="absolute -top-3 right-3 px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-full shadow-xs flex items-center gap-1 animate-pulse">
                      <span>📍 You are here</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wide">
                        {phase.dayRangeStr}
                      </span>
                      <span className="text-xs">{phase.badge}</span>
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-rose-950 dark:text-rose-100">
                      {phase.title}
                    </h4>
                    <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-1 line-clamp-2">
                      {phase.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-rose-100 dark:border-rose-900/40 text-[10px] text-rose-700 dark:text-rose-400 font-medium">
                    <strong>Vibe:</strong> {phase.energyLevel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Focused Phase Interactive Deep-Dive Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-purple-50/50 dark:from-slate-900/90 dark:via-rose-950/40 dark:to-slate-900/80 border border-rose-200/80 dark:border-rose-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌸</span>
                <h4 className="font-black text-base text-rose-950 dark:text-rose-100">
                  Phase Focus: {focusedPhase.title} ({focusedPhase.dayRangeStr})
                </h4>
                {cycleData.currentPhase.type === focusedPhase.type && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold text-[10px]">
                    Current Active Phase
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{focusedPhase.badge}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-100 dark:border-rose-900/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase">Hormones at Play</span>
                <p className="font-semibold text-rose-950 dark:text-rose-200">{focusedPhase.hormoneSummary}</p>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-100 dark:border-rose-900/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase">Energy & Mood</span>
                <p className="font-semibold text-rose-950 dark:text-rose-200">{focusedPhase.energyLevel}</p>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-100 dark:border-rose-900/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase">Soothing Recommendation</span>
                <p className="font-medium text-rose-900 dark:text-rose-200">{focusedPhase.selfCareTip}</p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            SECTION: LOG NEW CYCLE & PERSONALIZED PREFERENCES
        ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form: Add or Edit Cycle Entry */}
          <section className="sanctuary-card bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-rose-950 dark:text-rose-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Log Period Start & Rhythm Preferences:</span>
            </h3>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase block mb-1">
                  Last Period Start Date:
                </label>
                <input
                  type="date"
                  value={inputStartDate}
                  onChange={(e) => setInputStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-rose-50/40 dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-sm font-bold text-rose-950 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase block mb-1">
                    Typical Cycle (Days):
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="45"
                    value={cycleLengthDays}
                    onChange={(e) => setCycleLengthDays(parseInt(e.target.value) || 28)}
                    className="w-full px-4 py-3 bg-rose-50/40 dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-sm font-bold text-rose-950 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <span className="text-[10px] text-rose-700/70 dark:text-rose-400/70">Typical: 28 days (21-45)</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase block mb-1">
                    Bleeding Duration:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={periodDurationDays}
                    onChange={(e) => setPeriodDurationDays(parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-3 bg-rose-50/40 dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-sm font-bold text-rose-950 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <span className="text-[10px] text-rose-700/70 dark:text-rose-400/70">Typical: 3-7 days</span>
                </div>
              </div>

              {/* Flow Intensity */}
              <div>
                <label className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase block mb-1">
                  Flow Intensity:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Light', 'Medium', 'Heavy'] as const).map((flow) => (
                    <button
                      key={flow}
                      type="button"
                      onClick={() => setFlowIntensity(flow)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        flowIntensity === flow
                          ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white border-transparent shadow-xs'
                          : 'bg-rose-50/40 dark:bg-slate-800 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100/60'
                      }`}
                    >
                      {flow}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Tag Selector */}
              <div>
                <label className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase block mb-1.5">
                  Logged Symptoms / Body Signs:
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonCycleSymptoms.map((sym) => {
                    const isChecked = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleToggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50/60 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-black rounded-2xl shadow-sm transition-all active:scale-95 text-sm"
              >
                Save Cycle Entry Privately
              </button>
            </form>
          </section>

          {/* Personalized Cycle Insights & Rhythm Summary */}
          <section className="sanctuary-card bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-rose-950 dark:text-rose-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Personal Cycle Rhythm Summary:</span>
            </h3>

            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-slate-800/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Typical Cycle Length</div>
                  <div className="text-xl font-black text-rose-950 dark:text-rose-100 mt-0.5">
                    {cycleLengthDays} Days
                  </div>
                </div>
                <span className="text-2xl">🗓️</span>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-slate-800/60 border border-pink-200 dark:border-pink-900/50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase">Estimated Ovulation Window</div>
                  <div className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100 mt-0.5">
                    {cycleData.ovulationWindowStr}
                  </div>
                </div>
                <span className="text-2xl">🌱</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800/60 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Current Cycle Day</div>
                  <div className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100 mt-0.5">
                    Day {cycleData.currentCycleDay} • {cycleData.currentPhase.title}
                  </div>
                </div>
                <span className="text-2xl">✨</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>On-Device Privacy & Estimation Notice</span>
                </div>
                <p className="text-amber-900/80 dark:text-amber-300/80">
                  Predictions update dynamically as each day passes. Cycle rhythm is individual and naturally influenced by stress, diet, travel, and sleep.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* -------------------------------------------------------------
            SECTION: PAST CYCLE LOGS HISTORY (Preserved Functionality)
        ------------------------------------------------------------- */}
        <section className="sanctuary-card bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-rose-950 dark:text-rose-100">
            Saved Cycle Log History ({periodLogs.length})
          </h3>

          {periodLogs.length === 0 ? (
            <p className="text-sm text-rose-700/70 dark:text-rose-400/70 italic">No cycle entries saved yet.</p>
          ) : (
            <div className="space-y-3">
              {periodLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-slate-800/70 border border-rose-100 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="font-bold text-rose-950 dark:text-rose-100 text-base">
                      Started on: {entry.startDate}
                    </div>
                    <div className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                      Duration: {entry.periodDurationDays} days • Typical Cycle: {entry.cycleLengthDays} days • Flow: {entry.flowIntensity}
                    </div>
                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.symptoms.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded-md text-xs font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 w-fit">
                    Saved Privately
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
