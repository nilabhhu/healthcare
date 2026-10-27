export interface CyclePreferences {
  typicalCycleLength: number; // e.g. 28
  periodDuration: number; // e.g. 5
  lastPeriodStart: string; // YYYY-MM-DD
}

export type CyclePhaseType = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';

export interface CyclePhaseInfo {
  type: CyclePhaseType;
  title: string;
  badge: string;
  dayRangeStr: string;
  startDay: number;
  endDay: number;
  description: string;
  selfCareTip: string;
  hormoneSummary: string;
  energyLevel: string;
}

export interface CycleCalculationResult {
  currentCycleDay: number;
  totalCycleLength: number;
  periodDuration: number;
  lastPeriodStartDate: Date;
  nextPeriodStartDate: Date;
  nextPeriodEndDate: Date;
  nextPeriodWindowStr: string;
  daysUntilNextPeriod: number;
  ovulationStartDate: Date;
  ovulationEndDate: Date;
  ovulationWindowStr: string;
  daysUntilOvulation: number;
  isCurrentlyOnPeriod: boolean;
  currentPhase: CyclePhaseInfo;
  allPhases: CyclePhaseInfo[];
  cycleProgressPercent: number;
}

const STORAGE_KEY = 'healyaar_cycle_preferences';

export const DEFAULT_CYCLE_PREFERENCES: CyclePreferences = {
  typicalCycleLength: 28,
  periodDuration: 5,
  lastPeriodStart: '2026-10-02'
};

export const MOTIVATIONAL_QUOTES = [
  "Your body has its own rhythm. You don't have to rush the beat.",
  "Main character energy, every phase.",
  "Hormones doing their thing. You? Still doing yours.",
  "Rest is productive. Especially when your body asks for it.",
  "Different phase, same powerhouse.",
  "Syncing with your cycle is the ultimate life hack.",
  "Soft days, strong days, high-focus days — all valid, all you.",
  "Listen to your body today. It's the smartest compass you own.",
  "Cramps don't define you. Cozy tea, deep breaths, and gentle pacing win.",
  "Honor your slowdown. It's where your next surge of energy is born."
];

export function getStoredCyclePreferences(userId?: string): CyclePreferences {
  const key = userId ? `healyaar_user_${userId}_cycle_preferences` : STORAGE_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        typicalCycleLength: Number(parsed.typicalCycleLength) || 28,
        periodDuration: Number(parsed.periodDuration) || 5,
        lastPeriodStart: parsed.lastPeriodStart || '2026-10-02'
      };
    }
  } catch (e) {
    // fallback
  }

  // Check if periodLogs exist in user-scoped period logs to seed lastPeriodStart
  try {
    const logsKey = userId ? `healyaar_user_${userId}_period_logs` : 'healyaar_period_logs';
    const logsRaw = localStorage.getItem(logsKey);
    if (logsRaw) {
      const logs = JSON.parse(logsRaw);
      if (Array.isArray(logs) && logs.length > 0 && logs[0].startDate) {
        return {
          typicalCycleLength: Number(logs[0].cycleLengthDays) || 28,
          periodDuration: Number(logs[0].periodDurationDays) || 5,
          lastPeriodStart: logs[0].startDate
        };
      }
    }
  } catch (e) {
    // fallback
  }

  return { ...DEFAULT_CYCLE_PREFERENCES };
}

export function saveCyclePreferences(prefs: Partial<CyclePreferences>, userId?: string): CyclePreferences {
  const current = getStoredCyclePreferences(userId);
  const updated: CyclePreferences = {
    typicalCycleLength: Math.max(21, Math.min(45, prefs.typicalCycleLength ?? current.typicalCycleLength)),
    periodDuration: Math.max(2, Math.min(10, prefs.periodDuration ?? current.periodDuration)),
    lastPeriodStart: prefs.lastPeriodStart || current.lastPeriodStart
  };

  const key = userId ? `healyaar_user_${userId}_cycle_preferences` : STORAGE_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  return updated;
}

/**
 * Calculates current cycle day, 4 phases, next period window, and ovulation window.
 */
export function calculateCycleDetails(
  lastPeriodStartStr?: string,
  cycleLength: number = 28,
  duration: number = 5
): CycleCalculationResult {
  const prefs = getStoredCyclePreferences();
  const startStr = lastPeriodStartStr || prefs.lastPeriodStart || '2026-10-02';
  const cycleDays = Math.max(21, Math.min(45, cycleLength || prefs.typicalCycleLength || 28));
  const periodDays = Math.max(2, Math.min(10, duration || prefs.periodDuration || 5));

  // Parse YYYY-MM-DD
  const [y, m, d] = startStr.split('-').map(Number);
  const startDate = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Difference in calendar days from last period start
  const diffTime = today.getTime() - startDate.getTime();
  const rawDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Cycle day is 1-indexed: Day 1 is the start date
  // Handle cycle roll-overs if more than cycleDays have passed
  let currentCycleDay = (rawDays >= 0 ? (rawDays % cycleDays) : 0) + 1;
  if (currentCycleDay > cycleDays) currentCycleDay = cycleDays;

  // Next Period Start: startDate + cycleDays * (number of completed cycles + 1)
  const completedCycles = Math.max(0, Math.floor(rawDays / cycleDays));
  const nextPeriodStart = new Date(startDate);
  nextPeriodStart.setDate(startDate.getDate() + (completedCycles + 1) * cycleDays);

  const nextPeriodEnd = new Date(nextPeriodStart);
  nextPeriodEnd.setDate(nextPeriodStart.getDate() + (periodDays - 1));

  const daysUntilNextPeriod = Math.max(
    0,
    Math.ceil((nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Ovulation typically occurs ~14 days before next period start
  // In a 28-day cycle, that is Day 14. Ovulation window is Day 13-16.
  const estimatedOvulationDay = Math.max(periodDays + 2, cycleDays - 14);
  const ovulationStart = new Date(startDate);
  ovulationStart.setDate(startDate.getDate() + completedCycles * cycleDays + (estimatedOvulationDay - 2));
  
  const ovulationEnd = new Date(ovulationStart);
  ovulationEnd.setDate(ovulationStart.getDate() + 3);

  const daysUntilOvulation = Math.ceil((ovulationStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isCurrentlyOnPeriod = currentCycleDay <= periodDays;

  // Phase Definitions based on individual cycle length and duration
  const menstrualEnd = periodDays;
  const follicularStart = menstrualEnd + 1;
  const follicularEnd = Math.max(follicularStart, estimatedOvulationDay - 3);
  const ovulationWindowStartDay = follicularEnd + 1;
  const ovulationWindowEndDay = Math.min(cycleDays - 2, estimatedOvulationDay + 2);
  const lutealStartDay = ovulationWindowEndDay + 1;
  const lutealEndDay = cycleDays;

  const allPhases: CyclePhaseInfo[] = [
    {
      type: 'Menstrual',
      title: 'Menstrual Phase',
      badge: '🌸 Inner Winter',
      dayRangeStr: `Days 1–${menstrualEnd}`,
      startDay: 1,
      endDay: menstrualEnd,
      description: 'Your uterine lining is shedding. Estrogen and progesterone are at baseline resting levels.',
      selfCareTip: 'Prioritize deep rest, cozy herbal teas (chamomile or ginger), hot water bottles, and gentle walks.',
      hormoneSummary: 'Low estrogen & progesterone',
      energyLevel: 'Reflective & Resting'
    },
    {
      type: 'Follicular',
      title: 'Follicular Phase',
      badge: '🌱 Inner Spring',
      dayRangeStr: `Days ${follicularStart}–${follicularEnd}`,
      startDay: follicularStart,
      endDay: follicularEnd,
      description: 'Follicle-stimulating hormone prompts ovaries to nurture an egg while estrogen steadily climbs.',
      selfCareTip: 'Energy and optimism climb! Excellent time for creative projects, social outings, and trying new workouts.',
      hormoneSummary: 'Estrogen rising, FSH active',
      energyLevel: 'Rising & Creative'
    },
    {
      type: 'Ovulation',
      title: 'Ovulation Window',
      badge: '☀️ Inner Summer',
      dayRangeStr: `Days ${ovulationWindowStartDay}–${ovulationWindowEndDay}`,
      startDay: ovulationWindowStartDay,
      endDay: ovulationWindowEndDay,
      description: 'A surge in luteinizing hormone triggers the release of an egg. Peak fertility window.',
      selfCareTip: 'Confidence, communication, and libido peak. Stay hydrated and track any mild mid-cycle twinges (mittelschmerz).',
      hormoneSummary: 'LH & Estrogen peak',
      energyLevel: 'Peak Stamina & Magnetic'
    },
    {
      type: 'Luteal',
      title: 'Luteal Phase',
      badge: '🍂 Inner Autumn',
      dayRangeStr: `Days ${lutealStartDay}–${lutealEndDay}`,
      startDay: lutealStartDay,
      endDay: lutealEndDay,
      description: 'Progesterone climbs to nurture the uterine lining, then drops if fertilization did not happen.',
      selfCareTip: 'Cravings and sensitivity can appear. Reach for magnesium-rich snacks (dark chocolate, almonds), yoga, and gentle boundaries.',
      hormoneSummary: 'Progesterone dominant, then drops',
      energyLevel: 'Winding Down & Nesting'
    }
  ];

  // Determine current phase
  let currentPhase = allPhases[3]; // default Luteal
  if (currentCycleDay <= menstrualEnd) {
    currentPhase = allPhases[0];
  } else if (currentCycleDay <= follicularEnd) {
    currentPhase = allPhases[1];
  } else if (currentCycleDay <= ovulationWindowEndDay) {
    currentPhase = allPhases[2];
  } else {
    currentPhase = allPhases[3];
  }

  // Format date strings
  const formatDateWindow = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  };

  const nextPeriodWindowStr = formatDateWindow(nextPeriodStart, nextPeriodEnd);
  const ovulationWindowStr = formatDateWindow(ovulationStart, ovulationEnd);
  const cycleProgressPercent = Math.min(100, Math.round((currentCycleDay / cycleDays) * 100));

  return {
    currentCycleDay,
    totalCycleLength: cycleDays,
    periodDuration: periodDays,
    lastPeriodStartDate: startDate,
    nextPeriodStartDate: nextPeriodStart,
    nextPeriodEndDate: nextPeriodEnd,
    nextPeriodWindowStr,
    daysUntilNextPeriod,
    ovulationStartDate: ovulationStart,
    ovulationEndDate: ovulationEnd,
    ovulationWindowStr,
    daysUntilOvulation,
    isCurrentlyOnPeriod,
    currentPhase,
    allPhases,
    cycleProgressPercent
  };
}

/**
 * Returns natural language responses for Voice Assistant cycle queries.
 */
export function getCycleVoiceResponse(type: 'NEXT_PERIOD' | 'PHASE' | 'OVULATION'): string {
  const details = calculateCycleDetails();

  if (type === 'NEXT_PERIOD') {
    if (details.isCurrentlyOnPeriod) {
      return `You are currently on Day ${details.currentCycleDay} of your period. Your next cycle is estimated to start around ${details.nextPeriodStartDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}, which is in approximately ${details.daysUntilNextPeriod} days. Remember, this is a statistical estimate.`;
    }
    return `Your next period is predicted between ${details.nextPeriodWindowStr}, in approximately ${details.daysUntilNextPeriod} days. Predictions are estimates for self-care and can naturally shift.`;
  }

  if (type === 'PHASE') {
    return `You are on Day ${details.currentCycleDay} of your ${details.totalCycleLength}-day cycle, in the ${details.currentPhase.title}. ${details.currentPhase.description} Tip: ${details.currentPhase.selfCareTip}`;
  }

  if (type === 'OVULATION') {
    return `Your estimated ovulation window is ${details.ovulationWindowStr}. Please note this is an estimate and not intended for contraception.`;
  }

  return 'Cycle calculations are available in the Period Tracker tab.';
}
