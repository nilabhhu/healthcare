import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHero } from '../components/ui/SectionHero';
import { MentalWellbeingIllustration } from '../components/ContextualIllustrations';
import {
  Brain,
  Heart,
  ShieldAlert,
  Wind,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Info
} from 'lucide-react';

export const MentalWellbeingView: React.FC = () => {
  const { t, openEmergencyModal, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'breathe' | 'grounding' | 'education'>('breathe');

  // Breathing Pacer State: 4-7-8 Breathing (Inhale 4s, Hold 7s, Exhale 8s) or Box (4-4-4-4)
  const [breathingMode, setBreathingMode] = useState<'4-7-8' | 'box'>('4-7-8');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breatheSeconds, setBreatheSeconds] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // 5-4-3-2-1 Grounding current step
  const [groundingStep, setGroundingStep] = useState<number>(0);

  // Breathing Pacer Timer
  useEffect(() => {
    let timer: any;

    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreatheSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathingMode === '4-7-8') {
              if (breathePhase === 'Inhale') {
                setBreathePhase('Hold');
                return 7;
              } else if (breathePhase === 'Hold') {
                setBreathePhase('Exhale');
                return 8;
              } else {
                setBreathePhase('Inhale');
                setCyclesCompleted(c => c + 1);
                return 4;
              }
            } else {
              // Box Breathing (4-4-4-4)
              if (breathePhase === 'Inhale') {
                setBreathePhase('Hold');
                return 4;
              } else if (breathePhase === 'Hold') {
                setBreathePhase('Exhale');
                return 4;
              } else if (breathePhase === 'Exhale') {
                setBreathePhase('Rest');
                return 4;
              } else {
                setBreathePhase('Inhale');
                setCyclesCompleted(c => c + 1);
                return 4;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isBreathingActive, breathePhase, breathingMode]);

  const toggleBreathing = () => {
    if (!isBreathingActive) {
      setBreathePhase('Inhale');
      setBreatheSeconds(breathingMode === '4-7-8' ? 4 : 4);
    }
    setIsBreathingActive(!isBreathingActive);
  };

  const groundingStages = [
    { number: 5, sense: "Look Around (Vision)", prompt: "Acknowledge 5 things you can see around you right now (e.g. a window, your hands, a clock, a pen, light on the wall)." },
    { number: 4, sense: "Touch & Physical Contact", prompt: "Acknowledge 4 things you can feel touching your body (e.g. your feet flat on the floor, texture of your shirt, the back of your chair)." },
    { number: 3, sense: "Listen to Sounds", prompt: "Acknowledge 3 distinct sounds you hear in your space (e.g. a distant ceiling fan, birds outside, clock ticking)." },
    { number: 2, sense: "Notice Smells", prompt: "Acknowledge 2 things you can smell (or imagine your favorite soothing fragrance like fresh rain or lavender)." },
    { number: 1, sense: "Taste & Presence", prompt: "Acknowledge 1 thing you can taste (or take a gentle sip of cool fresh water)." }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Immediate Compassionate Crisis Support Banner (Always at top, not buried!) */}
      <section className="bg-gradient-to-r from-[#6B1F3A] via-[#5A1830] to-[#4A1226] dark:from-[#431224] dark:via-[#360D1C] dark:to-[#280814] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#7A2947]/40 dark:border-[#5A1830]/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/15 dark:bg-white/10 rounded-2xl border border-white/20 flex-shrink-0">
              <Heart className="w-8 h-8 fill-white/90 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                You Are Not Alone. Compassionate Help is Available 24/7.
              </h2>
              <p className="text-rose-100/90 dark:text-rose-200/90 text-sm sm:text-base mt-1 leading-relaxed">
                If you are feeling overwhelmed, having severe panic, or thoughts of hurting yourself, please reach out to trusted listeners right now. Your life and wellbeing matter deeply.
              </p>
            </div>
          </div>
          <button
            onClick={openEmergencyModal}
            style={{ backgroundColor: '#ffffff', color: '#5A1830' }}
            className="interactive-button px-6 py-3.5 hover:bg-rose-50 font-black rounded-2xl shadow-lg transition-transform active:scale-95 text-sm uppercase flex-shrink-0 border border-white/90"
          >
            Emergency Helplines
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <a
            href="tel:14416"
            className="group p-3.5 bg-[#4A1226]/90 hover:bg-[#4A1226] dark:bg-[#250813]/90 dark:hover:bg-[#250813] border border-[#7A2947]/50 dark:border-[#5A1830]/60 rounded-2xl flex items-center justify-between font-bold text-sm text-white transition-all hover:-translate-y-0.5 shadow-sm"
          >
            <div>
              <div className="text-xs text-rose-200/90 dark:text-rose-300/80">Govt. of India 24/7 Free Helpline</div>
              <div className="text-lg font-black text-white">Tele-MANAS (14416)</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-200 flex-shrink-0 group-hover:scale-105 transition-transform" />
          </a>

          <a
            href="tel:9999666555"
            className="group p-3.5 bg-[#4A1226]/90 hover:bg-[#4A1226] dark:bg-[#250813]/90 dark:hover:bg-[#250813] border border-[#7A2947]/50 dark:border-[#5A1830]/60 rounded-2xl flex items-center justify-between font-bold text-sm text-white transition-all hover:-translate-y-0.5 shadow-sm"
          >
            <div>
              <div className="text-xs text-rose-200/90 dark:text-rose-300/80">Vandrevala Mental Health</div>
              <div className="text-lg font-black text-white">+91 9999 666 555</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-200 flex-shrink-0 group-hover:scale-105 transition-transform" />
          </a>

          <a
            href="tel:18005990019"
            className="group p-3.5 bg-[#4A1226]/90 hover:bg-[#4A1226] dark:bg-[#250813]/90 dark:hover:bg-[#250813] border border-[#7A2947]/50 dark:border-[#5A1830]/60 rounded-2xl flex items-center justify-between font-bold text-sm text-white transition-all hover:-translate-y-0.5 shadow-sm"
          >
            <div>
              <div className="text-xs text-rose-200/90 dark:text-rose-300/80">KIRAN 24/7 Helpline</div>
              <div className="text-lg font-black text-white">1800-599-0019</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-200 flex-shrink-0 group-hover:scale-105 transition-transform" />
          </a>
        </div>
      </section>

      {/* Header & Sub-Navigation */}
      <SectionHero
        title="Mental Wellbeing & Calm Space"
        description="Evidence-based relaxation techniques, grounding exercises, and educational clarity."
        badge={{
          icon: Brain,
          text: 'Mind & Calmness',
          variant: 'purple'
        }}
        illustration={<MentalWellbeingIllustration size="md" />}
        actions={
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setActiveTab('breathe')}
              className={`interactive-button px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'breathe'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Breathing Pacer
            </button>
            <button
              onClick={() => setActiveTab('grounding')}
              className={`interactive-button px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'grounding'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              5-4-3-2-1 Grounding
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`interactive-button px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'education'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Understanding Anxiety
            </button>
          </div>
        }
      />

      {/* SUB-VIEW 1: BREATHING PACER */}
      {activeTab === 'breathe' && (
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  setBreathingMode('4-7-8');
                  setIsBreathingActive(false);
                  setBreatheSeconds(4);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  breathingMode === '4-7-8'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                4-7-8 Calming Breath
              </button>
              <button
                onClick={() => {
                  setBreathingMode('box');
                  setIsBreathingActive(false);
                  setBreatheSeconds(4);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  breathingMode === 'box'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Box Breathing (4-4-4-4)
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {breathingMode === '4-7-8'
                ? 'Inhale for 4s • Hold for 7s • Exhale slowly for 8s to soothe the nervous system.'
                : 'Equal 4-second counts for inhale, hold, exhale, and rest to restore calm focus.'}
            </p>
          </div>

          {/* Visual Breathing Orb */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div
              className={`w-60 h-60 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
                breathePhase === 'Inhale'
                  ? 'bg-gradient-to-tr from-teal-400 to-emerald-300 scale-110 text-teal-950'
                  : breathePhase === 'Hold'
                  ? 'bg-gradient-to-tr from-cyan-400 to-blue-400 scale-105 text-cyan-950'
                  : 'bg-gradient-to-tr from-indigo-300 to-purple-300 scale-90 text-indigo-950'
              }`}
            >
              <Wind className="w-8 h-8 opacity-70 mb-1" />
              <div className="text-2xl font-black uppercase tracking-wider">
                {breathePhase}
              </div>
              <div className="text-5xl font-black mt-1">
                {breatheSeconds}s
              </div>
            </div>

            <div className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              Cycles Completed: <span className="text-teal-600 dark:text-teal-400 font-extrabold">{cyclesCompleted}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={toggleBreathing}
              className={`interactive-button px-8 py-3.5 rounded-2xl font-extrabold text-base shadow-sm transition-all active:scale-95 flex items-center gap-2 ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isBreathingActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isBreathingActive ? 'Pause Exercise' : 'Start Calming Breath'}</span>
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathePhase('Inhale');
                setBreatheSeconds(4);
                setCyclesCompleted(0);
              }}
              className="interactive-button p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: 5-4-3-2-1 SENSORY GROUNDING */}
      {activeTab === 'grounding' && (
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              5-4-3-2-1 Sensory Grounding Technique
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              When racing thoughts or panic spike, this exercise engages your five physical senses to bring your attention safely back into the present room.
            </p>
          </div>

          <div className="space-y-4">
            {groundingStages.map((stage, idx) => {
              const isCurrent = groundingStep === idx;
              return (
                <div
                  key={stage.number}
                  onClick={() => setGroundingStep(idx)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-2 ring-cyan-300/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-cyan-700 dark:bg-cyan-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                      {stage.number}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {stage.sense}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {stage.prompt}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setGroundingStep(Math.max(0, groundingStep - 1))}
              disabled={groundingStep === 0}
              className="interactive-button px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
            >
              Previous Sense
            </button>
            <button
              onClick={() => {
                if (groundingStep < 4) {
                  setGroundingStep(groundingStep + 1);
                } else {
                  showToast('Grounding complete! Take one deep breath.');
                }
              }}
              className="interactive-button px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              {groundingStep < 4 ? 'Next Sense' : 'Finished Grounding'}
            </button>
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: EDUCATIONAL ARTICLES */}
      {activeTab === 'education' && (
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                What Happens in the Body During Panic or Severe Anxiety?
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                A panic surge is your body's natural "fight-or-flight" emergency system firing by mistake, releasing adrenaline. While it feels terrifying (rapid heartbeat, shallow breathing, chest sensations), it is an adrenaline surge and not a heart attack. It naturally peaks and subsides within 10 to 20 minutes as adrenaline breaks down.
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                Source: American Psychological Association (APA), 2023
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Stress vs. Chronic Anxiety
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Stress is typically a reaction to an external pressure (e.g. an exam, financial bill, or illness) that fades once the situation passes. Anxiety is an internal, persistent feeling of worry or apprehension that continues even when no immediate threat is present. Both respond very well to routine sleep, physical movement, and cognitive therapy.
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                Source: National Institute of Mental Health (NIMH), 2024
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Gentle Sleep Hygiene Habits
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                • Keep your bedroom quiet and cool.<br />
                • Avoid looking at backlit screens or smartphones 45 minutes before bedtime.<br />
                • Avoid caffeine (tea, coffee, cola) after 3:00 PM.<br />
                • Write tomorrow’s to-do list on a paper pad before bed to clear your mental desk.
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                Source: World Health Organization (WHO), 2022
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
