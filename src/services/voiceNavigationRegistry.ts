import { NavTab } from '../types';

export interface SectionRegistryItem {
  tab: NavTab;
  name: string;
  spokenName: string;
  shortOverview: string;
  detailedDescription: string;
  actionQuestion: string;
  keywords: string[];
  whereCanIKeywords: string[];
}

/**
 * Authoritative HealYaar Feature & Navigation Registry.
 * Derived strictly from actual application views, routes, and verified capabilities.
 */
export const HEALYAAR_SECTIONS: Record<NavTab, SectionRegistryItem> = {
  home: {
    tab: 'home',
    name: 'Home',
    spokenName: 'Home',
    shortOverview: 'Home gives you an overview and quick access to health tools.',
    detailedDescription: 'Home gives you an overview of your health status, quick symptom guidance, the featured AI Health Companion, and direct access to all health tools.',
    actionQuestion: 'Would you like me to take you to the Home page?',
    keywords: ['home', 'home page', 'overview', 'dashboard', 'main page', 'start', 'front page'],
    whereCanIKeywords: ['start', 'start over', 'go back to the beginning', 'see everything']
  },
  assistant: {
    tab: 'assistant',
    name: 'AI Assistant',
    spokenName: 'AI Assistant',
    shortOverview: 'AI Assistant lets you interact with HealYaar using voice or text.',
    detailedDescription: 'AI Assistant lets you discuss symptoms, ask medical questions, and get clear plain-language health explanations using hands-free voice or typing.',
    actionQuestion: 'Would you like to open the AI Assistant?',
    keywords: ['ai assistant', 'assistant', 'chat', 'companion', 'bot', 'talk to ai', 'ask questions'],
    whereCanIKeywords: ['ask a question', 'chat with someone', 'talk about my health', 'ask health questions']
  },
  symptoms: {
    tab: 'symptoms',
    name: 'Symptom Guidance',
    spokenName: 'Symptom Guidance',
    shortOverview: 'Symptom Guidance helps you assess what hurts and triage urgency.',
    detailedDescription: 'Symptom Guidance lets you describe what hurts or choose discomfort locations on a body map to evaluate urgency, red flags, and recommended next steps.',
    actionQuestion: 'Would you like me to take you to Symptom Guidance?',
    keywords: ['symptom guidance', 'symptoms', 'symptom checker', 'triage', 'pain', 'headache', 'body map', 'check symptoms'],
    whereCanIKeywords: ['check my symptoms', 'find out why i have pain', 'triage', 'check if my symptom is serious']
  },
  nutrition: {
    tab: 'nutrition',
    name: 'Food & Nutrition',
    spokenName: 'Food and Nutrition',
    shortOverview: 'Food and Nutrition helps analyze meals and ingredients.',
    detailedDescription: 'Food and Nutrition lets you upload or capture a food image, or enter ingredients manually, and get estimated nutrition information such as calories, protein, carbohydrates, fat and fiber.',
    actionQuestion: 'Would you like me to take you to Food and Nutrition?',
    keywords: ['food and nutrition', 'nutrition', 'food', 'diet', 'meal', 'calories', 'ingredients', 'recipe', 'macros'],
    whereCanIKeywords: ['analyze food', 'analyze my food', 'check calories', 'scan my meal', 'calculate ingredients', 'track calories']
  },
  reports: {
    tab: 'reports',
    name: 'Medical Reports',
    spokenName: 'Medical Reports',
    shortOverview: 'Medical Reports helps you upload and understand reports.',
    detailedDescription: 'Medical Reports lets you upload a medical report or test results to view an easy plain-language explanation with normal ranges and saved report history.',
    actionQuestion: 'Would you like me to open Medical Reports?',
    keywords: ['medical reports', 'reports', 'report', 'lab test', 'blood test', 'lab results', 'cbc', 'test values'],
    whereCanIKeywords: ['upload a report', 'check my blood test', 'understand my lab test', 'upload medical report', 'read my test results']
  },
  medicines: {
    tab: 'medicines',
    name: 'Prescriptions & Medicines',
    spokenName: 'Prescriptions and Medicines',
    shortOverview: 'Prescriptions helps you understand medicines and set reminders.',
    detailedDescription: 'Prescriptions lets you upload or capture a doctor prescription and turn it into a simpler readable format, including medicines, dosage, timing and instructions. You can also add medicines to reminders.',
    actionQuestion: 'Would you like to open Prescriptions and Medicines?',
    keywords: ['prescriptions', 'prescription', 'medicines', 'medicine', 'pills', 'pharmacy', 'dosage', 'drugs'],
    whereCanIKeywords: ['upload a prescription', 'read my prescription', 'check my medicines', 'see medicine timings', 'check generic medicines']
  },
  doctors: {
    tab: 'doctors',
    name: 'Doctors Nearby',
    spokenName: 'Doctors Nearby',
    shortOverview: 'Doctors Nearby helps you find healthcare providers.',
    detailedDescription: 'Doctors Nearby helps you match symptoms with relevant medical specialties, find local healthcare providers and clinics, and view them on an interactive map.',
    actionQuestion: 'Would you like me to take you to Doctors Nearby?',
    keywords: ['doctors nearby', 'doctor finder', 'doctors', 'doctor', 'clinics', 'clinic', 'specialist', 'hospital', 'map'],
    whereCanIKeywords: ['find a doctor', 'find doctors', 'find a clinic', 'see doctors on a map', 'find a specialist', 'find nearby clinics']
  },
  fitness: {
    tab: 'fitness',
    name: 'Fitness & Supplements',
    spokenName: 'Fitness and Supplements',
    shortOverview: 'Fitness and Supplements provides general wellness guidance.',
    detailedDescription: 'Fitness and Supplements provides beginner and senior workout routines plus scientific evidence ratings for dietary supplements and vitamins.',
    actionQuestion: 'Would you like me to take you to Fitness and Supplements?',
    keywords: ['fitness and supplements', 'fitness', 'supplements', 'exercise', 'workout', 'vitamins', 'supplement ratings'],
    whereCanIKeywords: ['find workouts', 'check supplements', 'exercise for seniors', 'see vitamin evidence', 'workout routines']
  },
  mental: {
    tab: 'mental',
    name: 'Mental Wellbeing',
    spokenName: 'Mental Wellbeing',
    shortOverview: 'Mental Wellbeing offers calm breathing guides and crisis support.',
    detailedDescription: 'Mental Wellbeing provides evidence-based relaxation techniques, calm box breathing pacers, sensory grounding exercises, and 24/7 crisis support helplines.',
    actionQuestion: 'Would you like me to open Mental Wellbeing?',
    keywords: ['mental wellbeing', 'mental health', 'calm', 'breathing', 'stress', 'anxiety', 'grounding', 'crisis helplines', 'panic'],
    whereCanIKeywords: ['calm down', 'do breathing exercises', 'reduce stress', 'find mental health support', 'call a crisis helpline']
  },
  period: {
    tab: 'period',
    name: 'Period Tracker',
    spokenName: 'Period Tracker',
    shortOverview: 'Period Tracker helps track cycles and estimate phases.',
    detailedDescription: 'Period Tracker provides 100% private, on-device menstrual cycle prediction, symptom logging, and hormonal cycle phase explanations without tracking you.',
    actionQuestion: 'Would you like to open Period Tracker?',
    keywords: ['period tracker', 'period', 'periods', 'menstrual', 'cycle', 'ovulation', 'fertile window', 'menstruation'],
    whereCanIKeywords: ['track my period', 'log my cycle', 'check ovulation', 'predict my next period', 'track menstrual cycle']
  },
  reminders: {
    tab: 'reminders',
    name: 'Reminders',
    spokenName: 'Reminders',
    shortOverview: 'Reminders lets you set alarms for medicines, water, and clinic visits.',
    detailedDescription: 'Reminders lets you set daily pill alarms, water intake goals, and clinic appointment alerts that speak your instructions aloud accurately.',
    actionQuestion: 'Would you like to open Reminders?',
    keywords: ['reminders', 'reminder', 'alarms', 'alarm', 'pill alarm', 'water reminder', 'medicine alert'],
    whereCanIKeywords: ['set a reminder', 'find my reminders', 'set a pill alarm', 'view my alarms', 'remind me to drink water']
  },
  login: {
    tab: 'login',
    name: 'Login & Account',
    spokenName: 'Login and Account',
    shortOverview: 'Login lets you manage your secure account and preferences.',
    detailedDescription: 'Login lets you authenticate securely with email, manage profile details, and sync your health records.',
    actionQuestion: 'Would you like to open the Login page?',
    keywords: ['login', 'account', 'sign in', 'register', 'sign up', 'profile'],
    whereCanIKeywords: ['log in', 'sign in', 'create an account', 'access my profile']
  }
};

/**
 * Concise grouped website overview spoken by the voice assistant
 */
export function getWebsiteOverviewSpeech(): string {
  return "HealYaar is your complete personal health companion. For consultation, you can chat with the AI Health Assistant or find local clinics with Doctors Nearby. For daily health, Food and Nutrition analyzes meals and calories, while Fitness and Supplements provides workout routines and vitamin evidence. For medical management, you can understand lab tests in Medical Reports, decode dosages in Prescriptions, and schedule alarms in Reminders. And for specialized tracking, there is private menstrual cycle logging in Period Tracker, and calming exercises in Mental Wellbeing. Which section would you like to explore or should I explain any of them in more detail?";
}

/**
 * Short summary overview of HealYaar capabilities
 */
export function getShortOverviewSpeech(): string {
  return "HealYaar helps you understand and manage different parts of your everyday wellness. You can explore symptoms, nutrition, periods, medical reports, prescriptions, nearby doctors, supplements, and more. I can guide you through any section. Which one would you like to explore?";
}

/**
 * Get detailed section explanation and prompt for user confirmation
 */
export function getSectionExplanationSpeech(tab: NavTab): string {
  const item = HEALYAAR_SECTIONS[tab];
  if (!item) {
    return "I can take you to this section. Would you like me to open it?";
  }
  return `${item.detailedDescription} ${item.actionQuestion}`;
}

/**
 * Natural comparison explanation between two major sections
 */
export function getComparisonSpeech(tabA: NavTab, tabB: NavTab): string {
  if (
    (tabA === 'reports' && tabB === 'medicines') ||
    (tabA === 'medicines' && tabB === 'reports')
  ) {
    return "Medical Reports lets you upload lab tests like blood reports to understand test values and normal ranges. Prescriptions lets you upload doctor prescriptions to simplify dosages, timings, and set medicine reminders. Which one would you like to explore?";
  }

  if (
    (tabA === 'nutrition' && tabB === 'fitness') ||
    (tabA === 'fitness' && tabB === 'nutrition')
  ) {
    return "Food and Nutrition focuses on meal photos, ingredients, and calories. Fitness and Supplements focuses on daily workout routines and evidence ratings for vitamins and supplements. Would you like to open one of them?";
  }

  const nameA = HEALYAAR_SECTIONS[tabA]?.spokenName || tabA;
  const nameB = HEALYAAR_SECTIONS[tabB]?.spokenName || tabB;
  const descA = HEALYAAR_SECTIONS[tabA]?.shortOverview || '';
  const descB = HEALYAAR_SECTIONS[tabB]?.shortOverview || '';

  return `${nameA}: ${descA} While ${nameB}: ${descB} Which one would you like to open?`;
}

/**
 * Identifies if a query is asking for a comparison between two sections
 */
export function findComparisonTabs(query: string): [NavTab, NavTab] | null {
  const text = query.toLowerCase();
  const isComparison =
    text.includes('difference between') ||
    text.includes('compare') ||
    (text.includes(' vs ') || text.includes(' versus ')) ||
    (text.includes('which one') && text.includes(' or '));

  if (!isComparison) return null;

  const tabs: NavTab[] = [
    'reports', 'medicines', 'nutrition', 'fitness', 'symptoms',
    'assistant', 'doctors', 'mental', 'period', 'reminders', 'home'
  ];

  const matched: NavTab[] = [];
  for (const tab of tabs) {
    const item = HEALYAAR_SECTIONS[tab];
    if (item.keywords.some(k => text.includes(k))) {
      if (!matched.includes(tab)) matched.push(tab);
    }
  }

  if (matched.length >= 2) {
    return [matched[0], matched[1]];
  }

  return null;
}

/**
 * Intelligently identify which section the user is asking about
 */
export function findSectionForQuery(query: string): NavTab | null {
  const text = query.toLowerCase().trim();

  // 1. Check exact keywords and where-can-i patterns
  const allTabs: NavTab[] = [
    'nutrition',
    'period',
    'medicines',
    'reports',
    'doctors',
    'fitness',
    'mental',
    'symptoms',
    'reminders',
    'assistant',
    'home',
    'login'
  ];

  // Specific high-priority matches first
  if (text.includes('period') || text.includes('menstrual') || text.includes('cycle')) {
    return 'period';
  }
  if (text.includes('food') || text.includes('nutrition') || text.includes('meal') || text.includes('calorie') || text.includes('ingredient')) {
    return 'nutrition';
  }
  if (text.includes('prescription') || text.includes('medicine') || text.includes('pills') || text.includes('dosage')) {
    return 'medicines';
  }
  if (text.includes('report') || text.includes('blood test') || text.includes('lab')) {
    return 'reports';
  }
  if (text.includes('doctor') || text.includes('clinic') || text.includes('specialist') || text.includes('hospital')) {
    return 'doctors';
  }
  if (text.includes('fitness') || text.includes('supplement') || text.includes('workout') || text.includes('exercise')) {
    return 'fitness';
  }
  if (text.includes('mental') || text.includes('calm') || text.includes('breathing') || text.includes('stress') || text.includes('crisis')) {
    return 'mental';
  }
  if (text.includes('symptom') || text.includes('triage') || text.includes('what hurts')) {
    return 'symptoms';
  }
  if (text.includes('reminder') || text.includes('alarm')) {
    return 'reminders';
  }
  if (text.includes('assistant') || text.includes('chat') || text.includes('companion')) {
    return 'assistant';
  }
  if (text.includes('home') || text.includes('start page') || text.includes('front page')) {
    return 'home';
  }

  // Fallback scan through keywords & where-can-i
  for (const tab of allTabs) {
    const item = HEALYAAR_SECTIONS[tab];
    for (const kw of item.whereCanIKeywords) {
      if (text.includes(kw)) return tab;
    }
    for (const kw of item.keywords) {
      if (text.includes(kw)) return tab;
    }
  }

  return null;
}
