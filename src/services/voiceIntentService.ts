import { NavTab, SupportedLanguage, TextSize } from '../types';
import { findSectionForQuery, findComparisonTabs, HEALYAAR_SECTIONS } from './voiceNavigationRegistry';

export type VoiceIntentType =
  | 'NAVIGATE'
  | 'WEBSITE_OVERVIEW_REQUEST'
  | 'SECTION_EXPLANATION_REQUEST'
  | 'WHERE_CAN_I_QUERY'
  | 'COMPARE_SECTIONS_QUERY'
  | 'GO_BACK'
  | 'EMERGENCY_SOS'
  | 'TOGGLE_CONTRAST'
  | 'TOGGLE_DARK_MODE'
  | 'CHECK_NEXT_PERIOD'
  | 'CHECK_CYCLE_PHASE'
  | 'CHECK_OVULATION'
  | 'CHANGE_TEXT_SIZE'
  | 'CHANGE_LANGUAGE'
  | 'DEACTIVATE_VOICE'
  | 'DELETE_PERIOD_LOGS'
  | 'ADD_PRESCRIPTION_REMINDERS'
  | 'FIND_NEARBY_PHARMACY'
  | 'READ_PRESCRIPTION'
  | 'SHOW_DOCTORS_MAP'
  | 'SEARCH_DOCTORS_SPECIALTY'
  | 'ANALYZE_FOOD'
  | 'CALCULATE_INGREDIENTS'
  | 'QUERY_SUPPLEMENTS'
  | 'HEALTH_QUERY'
  | 'CONFIRM_ACTION'
  | 'CANCEL_ACTION'
  | 'UNKNOWN';

export interface VoiceIntent {
  type: VoiceIntentType;
  targetTab?: NavTab;
  tabLabel?: string;
  comparedTabs?: [NavTab, NavTab];
  textSize?: TextSize;
  language?: SupportedLanguage;
  queryText?: string;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
  matchedPhrase?: string;
}

export const TAB_LABELS: Record<NavTab, string> = {
  home: 'Home page',
  assistant: 'AI Assistant',
  symptoms: 'Symptom Guidance',
  reports: 'Medical Reports',
  nutrition: 'Food & Nutrition',
  doctors: 'Doctor Finder',
  fitness: 'Fitness & Supplements',
  medicines: 'Prescriptions & Medicines',
  mental: 'Mental Wellbeing',
  period: 'Period Tracker',
  reminders: 'Reminders',
  login: 'Login & Authentication'
};

/**
 * Natural language intent parser for HealYaar hands-free voice assistant.
 * Maps spoken phrases to structured, verifiable actions.
 */
export function parseVoiceIntent(rawTranscript: string): VoiceIntent {
  const text = rawTranscript.toLowerCase().trim();

  // 1. Emergency triggers (Priority 1)
  if (
    text.includes('emergency') ||
    text.includes('sos') ||
    text.includes('ambulance') ||
    text.includes('call 108') ||
    text.includes('call 112') ||
    text.includes('आपातकालीन') ||
    text.includes('मदत') ||
    text.includes('मदद')
  ) {
    return {
      type: 'EMERGENCY_SOS',
      matchedPhrase: rawTranscript
    };
  }

  // 2. Explicit Deactivation triggers
  if (
    text === 'turn off' ||
    text === 'stop listening' ||
    text.includes('turn off voice assistant') ||
    text.includes('stop voice assistant') ||
    text.includes('deactivate voice') ||
    text.includes('goodbye assistant') ||
    text === 'goodbye' ||
    text.includes('बंद करो') ||
    text.includes('बंद करा')
  ) {
    return {
      type: 'DEACTIVATE_VOICE',
      matchedPhrase: rawTranscript
    };
  }

  // 2b. Go Back / Previous Page
  if (
    text === 'go back' ||
    text === 'take me back' ||
    text === 'back' ||
    text === 'previous page' ||
    text === 'previous' ||
    text.includes('go back') ||
    text.includes('take me back')
  ) {
    return {
      type: 'GO_BACK',
      matchedPhrase: rawTranscript
    };
  }

  // 2c. Comparative Section Questions (e.g. difference between reports and prescriptions)
  const comparedTabs = findComparisonTabs(text);
  if (comparedTabs) {
    return {
      type: 'COMPARE_SECTIONS_QUERY',
      comparedTabs,
      matchedPhrase: rawTranscript
    };
  }

  // 2d. Section-by-Section Explanation Requests (e.g. "What is Food and Nutrition?", "Explain Period Tracker")
  const isExplanationQuery =
    text.startsWith('what is ') ||
    text.startsWith('what are ') ||
    text.startsWith('explain ') ||
    text.startsWith('tell me about ') ||
    text.includes('what can i do in ') ||
    text.includes('what can i do on ') ||
    text.includes("what's in ") ||
    text.includes('what is in ') ||
    text.includes('what does ') ||
    text.includes('how does ');

  if (isExplanationQuery) {
    const identifiedTab = findSectionForQuery(text);
    if (identifiedTab) {
      return {
        type: 'SECTION_EXPLANATION_REQUEST',
        targetTab: identifiedTab,
        tabLabel: TAB_LABELS[identifiedTab],
        matchedPhrase: rawTranscript
      };
    }
  }

  // 2e. "Where can I..." / Functional Queries (e.g. "Where can I track my period?", "Where do I upload a prescription?")
  const isWhereCanI =
    text.includes('where can i') ||
    text.includes('where do i') ||
    text.includes('where are my') ||
    text.includes('where to ') ||
    text.includes('can i find a doctor') ||
    text.includes('can i find doctors') ||
    text.includes('which section should i use');

  if (isWhereCanI) {
    const identifiedTab = findSectionForQuery(text);
    if (identifiedTab) {
      return {
        type: 'WHERE_CAN_I_QUERY',
        targetTab: identifiedTab,
        tabLabel: TAB_LABELS[identifiedTab],
        matchedPhrase: rawTranscript
      };
    }
  }

  // 2f. Website Overview Request (e.g. "Show me the available pages", "What sections are there?")
  if (
    text === 'what can i do' ||
    text === 'what can i do here' ||
    text === 'what can healyaar do' ||
    text === 'what can i do in healyaar' ||
    text === 'tell me' ||
    text.includes('available pages') ||
    text.includes('show me the available pages') ||
    text.includes('what sections are there') ||
    text.includes('what pages are there') ||
    text.includes('tell me about this website') ||
    text.includes('tell me what i can do') ||
    text.includes('tell me what each section is for') ||
    text.includes('what each section is for') ||
    text.includes('tell me what sections are there') ||
    text.includes('show sections') ||
    text.includes('list sections') ||
    text.includes('website overview') ||
    text === 'overview'
  ) {
    return {
      type: 'WEBSITE_OVERVIEW_REQUEST',
      matchedPhrase: rawTranscript
    };
  }

  // 3. User Confirmation responses for sensitive actions & navigation decisions
  if (
    text === 'yes' ||
    text === 'yes confirm' ||
    text === 'confirm' ||
    text === 'sure' ||
    text === 'tell me' ||
    text === 'take me there' ||
    text === 'open it' ||
    text === 'yes please' ||
    text === 'yeah' ||
    text === 'yep' ||
    text === 'okay' ||
    text === 'ok' ||
    text === 'go ahead' ||
    text.includes('yes take me') ||
    text.includes('sure take me') ||
    text.includes('confirm delete') ||
    text === 'हो' ||
    text === 'हाँ'
  ) {
    return {
      type: 'CONFIRM_ACTION',
      matchedPhrase: rawTranscript
    };
  }
  if (
    text === 'no' ||
    text === 'cancel' ||
    text === 'nope' ||
    text === 'not now' ||
    text === 'no thanks' ||
    text === 'stay here' ||
    text === 'stay' ||
    text === 'stay on this page' ||
    text.includes('don\'t delete') ||
    text === 'stop' ||
    text === 'नाही' ||
    text === 'नहीं'
  ) {
    return {
      type: 'CANCEL_ACTION',
      matchedPhrase: rawTranscript
    };
  }

  // 4. Sensitive action triggers (Requires explicit confirmation)
  if (
    text.includes('delete period logs') ||
    text.includes('clear cycle logs') ||
    text.includes('delete cycle history') ||
    text.includes('delete menstrual logs')
  ) {
    return {
      type: 'DELETE_PERIOD_LOGS',
      requiresConfirmation: true,
      confirmationPrompt: 'Are you sure you want to delete all period tracker logs? Say "yes confirm" or "cancel".',
      matchedPhrase: rawTranscript
    };
  }

  // 4b. Prescription Reminders triggers
  if (
    text.includes('add my prescription to reminders') ||
    text.includes('add prescription to reminders') ||
    text.includes('remind me to take these medicines') ||
    text.includes('remind me to take my medicines') ||
    text.includes('add these medicines to my reminders') ||
    text.includes('add medicines to my reminders') ||
    text.includes('set reminders for my prescription') ||
    text.includes('set prescription reminders')
  ) {
    return {
      type: 'ADD_PRESCRIPTION_REMINDERS',
      targetTab: 'medicines',
      tabLabel: TAB_LABELS.medicines,
      requiresConfirmation: true,
      confirmationPrompt: 'Would you like me to add these prescription medicines to your reminders? Say "yes confirm" or "cancel".',
      matchedPhrase: rawTranscript
    };
  }

  // 4c. Pharmacy / Medical Store triggers
  if (
    text.includes('find a nearby medical store') ||
    text.includes('find nearby medical store') ||
    text.includes('find a pharmacy near me') ||
    text.includes('find pharmacy near me') ||
    text.includes('call a nearby pharmacy') ||
    text.includes('call nearby pharmacy') ||
    text.includes('order these medicines from a nearby store') ||
    text.includes('order these medicines from a medical store') ||
    text.includes('order these medicines')
  ) {
    return {
      type: 'FIND_NEARBY_PHARMACY',
      targetTab: 'medicines',
      tabLabel: TAB_LABELS.medicines,
      matchedPhrase: rawTranscript
    };
  }

  // 4c-2. Prescription Reading Commands
  if (
    text.includes('read my prescription') ||
    text.includes('read prescription') ||
    text.includes('what medicines do i have') ||
    text.includes('what medicine do i have') ||
    text.includes('what are my medicines') ||
    text.includes('when should i take my medicines') ||
    text.includes('when do i take my medicines') ||
    text.includes('read medicine one') ||
    text.includes('read medicine two') ||
    text.includes('read medicine three') ||
    text.includes('read medicine 1') ||
    text.includes('read medicine 2') ||
    text.includes('read medicine 3')
  ) {
    let query = 'all';
    if (text.includes('when') || text.includes('timing')) query = 'timing';
    else if (text.includes('one') || text.includes(' 1')) query = '1';
    else if (text.includes('two') || text.includes(' 2')) query = '2';
    else if (text.includes('three') || text.includes(' 3')) query = '3';

    return {
      type: 'READ_PRESCRIPTION',
      targetTab: 'medicines',
      tabLabel: TAB_LABELS.medicines,
      queryText: query,
      matchedPhrase: rawTranscript
    };
  }

  // 4d. Menstrual Cycle & Period Assistant Queries (High Priority before generic 'period' navigation)
  if (
    text.includes('when is my next period') ||
    text.includes('when is my period') ||
    text.includes('next period date') ||
    text.includes('when will my period start') ||
    text.includes('next period') ||
    text.includes('period due') ||
    text.includes('when am i due') ||
    text.includes('पुढची पाळी कधी') ||
    text.includes('अगला पीरियड कब')
  ) {
    return {
      type: 'CHECK_NEXT_PERIOD',
      targetTab: 'period',
      tabLabel: TAB_LABELS.period,
      matchedPhrase: rawTranscript
    };
  }

  if (
    text.includes('what phase am i in') ||
    text.includes('current phase') ||
    text.includes('which phase') ||
    text.includes('cycle phase') ||
    text.includes('what phase of my cycle') ||
    text.includes('what cycle day') ||
    text.includes('cycle day')
  ) {
    return {
      type: 'CHECK_CYCLE_PHASE',
      targetTab: 'period',
      tabLabel: TAB_LABELS.period,
      matchedPhrase: rawTranscript
    };
  }

  if (
    text.includes('when am i ovulating') ||
    text.includes('when is my ovulation') ||
    text.includes('ovulation date') ||
    text.includes('ovulation window') ||
    text.includes('fertile window') ||
    text.includes('when is ovulation') ||
    text.includes('ओव्यूलेशन')
  ) {
    return {
      type: 'CHECK_OVULATION',
      targetTab: 'period',
      tabLabel: TAB_LABELS.period,
      matchedPhrase: rawTranscript
    };
  }

  // 4e. Dark Mode / Theme Toggle
  if (
    text.includes('dark mode') ||
    text.includes('light mode') ||
    text.includes('switch to dark') ||
    text.includes('switch to light') ||
    text.includes('toggle dark mode') ||
    text.includes('toggle theme') ||
    text.includes('night mode')
  ) {
    return {
      type: 'TOGGLE_DARK_MODE',
      matchedPhrase: rawTranscript
    };
  }

  // 4f. Show Doctors on Map
  if (
    text.includes('show doctors on the map') ||
    text.includes('show doctors on map') ||
    text.includes('show clinics on the map') ||
    text.includes('show clinics on map') ||
    text.includes('show on the map') ||
    text.includes('show on map') ||
    text.includes('doctors map') ||
    text.includes('view map')
  ) {
    return {
      type: 'SHOW_DOCTORS_MAP',
      targetTab: 'doctors',
      tabLabel: TAB_LABELS.doctors,
      matchedPhrase: rawTranscript
    };
  }

  // 4g. Search Doctors by Specialty
  if (
    text.includes('search for cardiologists') ||
    text.includes('search for cardiologist') ||
    text.includes('find a cardiologist') ||
    text.includes('cardiologist') ||
    text.includes('cardiologists')
  ) {
    return {
      type: 'SEARCH_DOCTORS_SPECIALTY',
      targetTab: 'doctors',
      tabLabel: TAB_LABELS.doctors,
      queryText: 'Cardiology',
      matchedPhrase: rawTranscript
    };
  }

  if (
    text.includes('search for gynecologists') ||
    text.includes('search for gynecologist') ||
    text.includes('find a gynecologist') ||
    text.includes('gynecologist') ||
    text.includes('gynecologists')
  ) {
    return {
      type: 'SEARCH_DOCTORS_SPECIALTY',
      targetTab: 'doctors',
      tabLabel: TAB_LABELS.doctors,
      queryText: 'Gynecology',
      matchedPhrase: rawTranscript
    };
  }

  if (
    text.includes('search for dermatologists') ||
    text.includes('search for dermatologist') ||
    text.includes('find a dermatologist') ||
    text.includes('dermatologist') ||
    text.includes('dermatologists')
  ) {
    return {
      type: 'SEARCH_DOCTORS_SPECIALTY',
      targetTab: 'doctors',
      tabLabel: TAB_LABELS.doctors,
      queryText: 'Dermatology',
      matchedPhrase: rawTranscript
    };
  }

  // 4h. Food Photo Analysis
  if (
    text.includes('analyze this food') ||
    text.includes('analyze food photo') ||
    text.includes('analyze food picture') ||
    text.includes('analyze my food') ||
    text.includes('analyze dish') ||
    text.includes('scan food') ||
    text.includes('photo estimator')
  ) {
    return {
      type: 'ANALYZE_FOOD',
      targetTab: 'nutrition',
      tabLabel: TAB_LABELS.nutrition,
      matchedPhrase: rawTranscript
    };
  }

  // 4i. Calculate Calories in Ingredients
  if (
    text.includes('calculate the calories in these ingredients') ||
    text.includes('calculate calories in these ingredients') ||
    text.includes('calculate calories in ingredients') ||
    text.includes('calculate the calories') ||
    text.includes('calculate ingredients') ||
    text.includes('ingredient calculator')
  ) {
    return {
      type: 'CALCULATE_INGREDIENTS',
      targetTab: 'nutrition',
      tabLabel: TAB_LABELS.nutrition,
      matchedPhrase: rawTranscript
    };
  }

  // 4j. Supplement Guidance Queries
  if (
    text.includes('tell me what supplements might help with my problem') ||
    text.includes('what supplements might help with my problem') ||
    text.includes('what supplements might help') ||
    text.includes('what supplements might be relevant for better workout recovery') ||
    text.includes('what supplements for workout recovery') ||
    text.includes('supplements for workout recovery') ||
    text.includes('supplements for recovery') ||
    text.includes('supplements for my problem') ||
    text.includes('supplement guidance')
  ) {
    let q = 'better workout recovery';
    if (text.includes('problem')) {
      q = 'tiredness and general vitality';
    }
    return {
      type: 'QUERY_SUPPLEMENTS',
      targetTab: 'fitness',
      tabLabel: TAB_LABELS.fitness,
      queryText: q,
      matchedPhrase: rawTranscript
    };
  }

  // 5. Navigation intents
  // Home
  if (
    text.includes('home') ||
    text.includes('go home') ||
    text.includes('main page') ||
    text.includes('dashboard') ||
    text.includes('होम') ||
    text.includes('मुख्य पान')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'home',
      tabLabel: TAB_LABELS.home,
      matchedPhrase: rawTranscript
    };
  }

  // Period Tracker
  if (
    text.includes('period tracker') ||
    text.includes('periods') ||
    text.includes('period') ||
    text.includes('menstrual') ||
    text.includes('cycle tracker') ||
    text.includes('track cycle') ||
    text.includes('मासिक धर्म') ||
    text.includes('पाळी')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'period',
      tabLabel: TAB_LABELS.period,
      matchedPhrase: rawTranscript
    };
  }

  // Food & Nutrition
  if (
    text.includes('food and nutrition') ||
    text.includes('nutrition') ||
    text.includes('food') ||
    text.includes('diet') ||
    text.includes('meal') ||
    text.includes('calories') ||
    text.includes('पोषण') ||
    text.includes('आहार')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'nutrition',
      tabLabel: TAB_LABELS.nutrition,
      matchedPhrase: rawTranscript
    };
  }

  // Medical Reports
  if (
    text.includes('medical reports') ||
    text.includes('reports') ||
    text.includes('report') ||
    text.includes('blood test') ||
    text.includes('lab') ||
    text.includes('test results') ||
    text.includes('रिपोर्ट') ||
    text.includes('तपासणी')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'reports',
      tabLabel: TAB_LABELS.reports,
      matchedPhrase: rawTranscript
    };
  }

  // Prescriptions & Medicines
  if (
    text.includes('prescription') ||
    text.includes('prescriptions') ||
    text.includes('medicine') ||
    text.includes('medicines') ||
    text.includes('pharmacy') ||
    text.includes('pills') ||
    text.includes('दवा') ||
    text.includes('औषध') ||
    text.includes('पर्ची')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'medicines',
      tabLabel: TAB_LABELS.medicines,
      matchedPhrase: rawTranscript
    };
  }

  // Doctor Finder / Nearby Clinics
  if (
    text.includes('find a doctor') ||
    text.includes('doctor finder') ||
    text.includes('doctors nearby') ||
    text.includes('doctor') ||
    text.includes('doctors') ||
    text.includes('clinic') ||
    text.includes('hospital') ||
    text.includes('specialist') ||
    text.includes('gynecologist') ||
    text.includes('डॉक्टर') ||
    text.includes('दवाखाना')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'doctors',
      tabLabel: TAB_LABELS.doctors,
      matchedPhrase: rawTranscript
    };
  }

  // Fitness & Supplements
  if (
    text.includes('fitness') ||
    text.includes('supplements') ||
    text.includes('exercise') ||
    text.includes('workout') ||
    text.includes('supplement') ||
    text.includes('व्यायाम') ||
    text.includes('कसरत')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'fitness',
      tabLabel: TAB_LABELS.fitness,
      matchedPhrase: rawTranscript
    };
  }

  // Mental Wellbeing
  if (
    text.includes('mental wellbeing') ||
    text.includes('mental health') ||
    text.includes('wellbeing') ||
    text.includes('meditation') ||
    text.includes('calm') ||
    text.includes('stress') ||
    text.includes('anxiety') ||
    text.includes('तनाव') ||
    text.includes('मानसिक')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'mental',
      tabLabel: TAB_LABELS.mental,
      matchedPhrase: rawTranscript
    };
  }

  // Reminders
  if (
    text.includes('reminder') ||
    text.includes('reminders') ||
    text.includes('alarm') ||
    text.includes('alarms') ||
    text.includes('pill alarm') ||
    text.includes('याद') ||
    text.includes('आठवण')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'reminders',
      tabLabel: TAB_LABELS.reminders,
      matchedPhrase: rawTranscript
    };
  }

  // Symptom Guidance
  if (
    text.includes('symptom guidance') ||
    text.includes('check symptoms') ||
    text.includes('symptoms') ||
    text.includes('symptom') ||
    text.includes('triage') ||
    text.includes('pain') ||
    text.includes('headache') ||
    text.includes('fever') ||
    text.includes('लक्षण') ||
    text.includes('दर्द')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'symptoms',
      tabLabel: TAB_LABELS.symptoms,
      matchedPhrase: rawTranscript
    };
  }

  // AI Assistant Chat
  if (
    text.includes('ai assistant') ||
    text.includes('assistant') ||
    text.includes('chat') ||
    text.includes('companion') ||
    text.includes('talk to companion') ||
    text.includes('एआई साथी') ||
    text.includes('सहाय्यक')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'assistant',
      tabLabel: TAB_LABELS.assistant,
      matchedPhrase: rawTranscript
    };
  }

  // Login / Authentication
  if (
    text.includes('login') ||
    text.includes('log in') ||
    text.includes('sign in') ||
    text.includes('sign up') ||
    text.includes('register') ||
    text.includes('account') ||
    text.includes('लॉगिन')
  ) {
    return {
      type: 'NAVIGATE',
      targetTab: 'login',
      tabLabel: TAB_LABELS.login,
      matchedPhrase: rawTranscript
    };
  }

  // 6. Accessibility & Settings Commands
  if (text.includes('contrast') || text.includes('कंट्रास्ट')) {
    return {
      type: 'TOGGLE_CONTRAST',
      matchedPhrase: rawTranscript
    };
  }

  if (
    text.includes('larger text') ||
    text.includes('bigger text') ||
    text.includes('large text') ||
    text.includes('big font') ||
    text.includes('बड़ा फॉन्ट')
  ) {
    return {
      type: 'CHANGE_TEXT_SIZE',
      textSize: 'large',
      matchedPhrase: rawTranscript
    };
  }

  if (
    text.includes('normal text') ||
    text.includes('regular text') ||
    text.includes('reset font') ||
    text.includes('सामान्य फॉन्ट')
  ) {
    return {
      type: 'CHANGE_TEXT_SIZE',
      textSize: 'normal',
      matchedPhrase: rawTranscript
    };
  }

  // Languages
  if (text.includes('hindi') || text.includes('हिंदी')) {
    return {
      type: 'CHANGE_LANGUAGE',
      language: 'hi',
      matchedPhrase: rawTranscript
    };
  }
  if (text.includes('english') || text.includes('अंग्रेजी')) {
    return {
      type: 'CHANGE_LANGUAGE',
      language: 'en',
      matchedPhrase: rawTranscript
    };
  }
  if (text.includes('marathi') || text.includes('मराठी')) {
    return {
      type: 'CHANGE_LANGUAGE',
      language: 'mr',
      matchedPhrase: rawTranscript
    };
  }

  // 7. General Health Questions (Route to Assistant)
  if (
    text.includes('why') ||
    text.includes('what') ||
    text.includes('how') ||
    text.includes('can i') ||
    text.includes('should i') ||
    text.includes('explain') ||
    text.includes('tell me') ||
    text.includes('क्यो') ||
    text.includes('का')
  ) {
    return {
      type: 'HEALTH_QUERY',
      queryText: rawTranscript,
      targetTab: 'assistant',
      tabLabel: TAB_LABELS.assistant,
      matchedPhrase: rawTranscript
    };
  }

  // Default / Unknown Command
  return {
    type: 'UNKNOWN',
    queryText: rawTranscript,
    matchedPhrase: rawTranscript
  };
}
