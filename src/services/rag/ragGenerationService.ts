import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../../types';
import { retrieveContext } from './retrievalService';

// Red-flag emergency keyword detector
export function detectEmergency(query: string): boolean {
  const q = query.toLowerCase();
  const emergencyTriggers = [
    'chest pain', 'chest tightness', 'heart attack', 'crushing chest',
    'breathless', 'gasping', 'cannot breathe', "can't breathe", 'shortness of breath',
    'stroke', 'face drooping', 'slurred speech', 'arm numbness', 'one side weakness',
    'suicide', 'kill myself', 'end my life', 'harm myself',
    'coughing blood', 'vomiting blood', 'unconscious', 'fainted', 'passed out',
    'thunderclap headache', 'blue lips', 'seizure'
  ];
  return emergencyTriggers.some(trigger => q.includes(trigger));
}

/**
 * Dual-Layer Healthcare RAG Generation Pipeline
 * Augments user queries with personal health records (Layer A) and clinical reference guidelines (Layer B)
 */
export async function generateRAGAssistantResponse(
  userId: string,
  userQuery: string
): Promise<ChatMessage> {
  const q = userQuery.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. EMERGENCY FAST-PATH (Non-negotiable patient safety)
  if (detectEmergency(q)) {
    return {
      id: `bot-emergency-${Date.now()}`,
      sender: 'assistant',
      text: "🚨 IMMEDIATE EMERGENCY ALERT: The symptoms you described (such as severe chest pain, extreme breathlessness, sudden numbness, or acute distress) can be life-threatening and require immediate professional emergency intervention.",
      timestamp,
      isEmergency: true,
      emergencyActionText: "Please call 108 (Ambulance), 112 (Emergency Response), or go to the closest hospital immediately. Do not drive yourself. Stay calm, sit down, and keep your door unlocked.",
      suggestedFollowUps: [
        "Call Ambulance (108)",
        "Call National Emergency (112)",
        "Call Mental Health Helpline (14416)"
      ],
      nextSteps: {
        category: 'emergency',
        summary: "Do not wait for an online questionnaire or second opinion. Seek immediate in-person emergency care right now."
      },
      sources: [
        { organization: 'World Health Organization (WHO)', year: 2023, topic: 'Emergency Cardiovascular Care' },
        { organization: 'Indian Council of Medical Research (ICMR)', year: 2022, topic: 'Acute Cardiac Protocols' }
      ]
    };
  }

  // 2. RETRIEVE DUAL-LAYER CONTEXT
  const ragResult = await retrieveContext(userId, userQuery, {
    maxPersonal: 4,
    maxClinical: 3,
    minScore: 0.12
  });

  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;

  // 3. ATTEMPT GEMINI LLM GENERATION IF API KEY CONFIGURED
  if (apiKey && apiKey !== 'undefined' && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are HealYaar, an empathetic, accessible healthcare companion for patients.
Explain medical terms, lab results, prescriptions, and symptoms in simple, clear, everyday language.
Do NOT give medical diagnoses or prescribe medications.

${ragResult.contextPromptBlock}

Patient Query: "${userQuery}"

Provide a structured, compassionate, and helpful response:
1. Explain what is happening in everyday language.
2. If personal records were found in the context above, cite them specifically (e.g. "From your report dated...").
3. Reference the clinical guidelines to explain normal benchmarks or safety precautions.
4. Give practical, non-diagnostic next steps or questions to ask their doctor.
5. Keep paragraphs short and friendly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });

      const responseText = response.text?.trim();
      if (responseText && responseText.length > 20) {
        return {
          id: `bot-rag-${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp,
          ragSources: ragResult.allSources,
          uncertaintyNote: "HealYaar provides educational guidance grounded in your records. Always verify medical decisions with your doctor.",
          suggestedFollowUps: generateFollowUps(userQuery, ragResult),
          nextSteps: determineNextSteps(userQuery, ragResult)
        };
      }
    } catch {
      // Fall through to deterministic clinical RAG reasoning engine
    }
  }

  // 4. HIGH-FIDELITY GROUNDED CLINICAL RAG REASONING ENGINE (OFFLINE / FALLBACK)
  return buildGroundedRuleResponse(userQuery, ragResult, timestamp);
}

/**
 * Deterministic clinical grounding synthesizer when Gemini API is unavailable
 */
function buildGroundedRuleResponse(
  query: string,
  ragResult: any,
  timestamp: string
): ChatMessage {
  const q = query.toLowerCase();
  const personalSources = ragResult.personalSources || [];
  const clinicalSources = ragResult.clinicalSources || [];
  const hasPersonal = personalSources.length > 0;
  const hasClinical = clinicalSources.length > 0;

  // Case A: Grounded with Personal Records + Clinical Guidelines
  if (hasPersonal) {
    const topPersonal = personalSources[0].chunk;
    const topClinical = hasClinical ? clinicalSources[0].chunk : null;

    let text = `Based on your private health records, I found your saved **${topPersonal.title}**:\n\n`;
    text += `📋 **Relevant Record Summary:**\n${topPersonal.content.split('\n').slice(0, 4).join('\n')}\n\n`;

    if (topClinical) {
      text += `💡 **Clinical Reference Context (${topClinical.title}):**\n${topClinical.content.split('\n').slice(0, 3).join('\n')}\n\n`;
    }

    text += `🩺 **Plain-Language Takeaway:**\nYour personal values should be discussed with your physician to see if any lifestyle adjustments, follow-up tests, or medication modifications are appropriate for your individual history.`;

    return {
      id: `bot-rag-personal-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      ragSources: ragResult.allSources,
      uncertaintyNote: "Ground truth from your personal health vault. Only a licensed physician can interpret lab trends in full clinical context.",
      suggestedFollowUps: generateFollowUps(query, ragResult),
      nextSteps: determineNextSteps(query, ragResult)
    };
  }

  // Case B: Grounded with Clinical Guidelines
  if (hasClinical) {
    const topClinical = clinicalSources[0].chunk;
    let text = `Here is what verified clinical guidance outlines regarding **${topClinical.title}**:\n\n`;
    text += `${topClinical.content}\n\n`;
    text += `💡 **Key Takeaway in Plain Words:**\nKeeping track of your numbers or medication timing helps you stay proactive about your wellbeing. If you have an existing prescription or recent test report, you can upload it to HealYaar so I can personalize this guidance for your exact results.`;

    return {
      id: `bot-rag-clinical-${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp,
      ragSources: ragResult.allSources,
      uncertaintyNote: "Educational guideline from clinical reference modules. Always consult your doctor before making treatment changes.",
      suggestedFollowUps: generateFollowUps(query, ragResult),
      nextSteps: determineNextSteps(query, ragResult)
    };
  }

  // Case C: Standard Compassionate Health Literacy Guidance
  if (q.includes('knee') || q.includes('joint') || q.includes('stiff') || q.includes('arthritis')) {
    return {
      id: `bot-std-${Date.now()}`,
      sender: 'assistant',
      text: "Knee aching and morning stiffness are common concerns, particularly as joint cartilage naturally experiences wear over time or following mild strain.\n\nHere is what is typically helpful to know:\n• Gentle low-impact walking and seated leg extensions help circulate synovial joint fluid.\n• Warm compresses can relieve morning tightness; cold packs are best for sudden swelling.\n• If stiffness persists past 30 minutes or causes limping, an orthopedic evaluation is advised.",
      timestamp,
      plainLanguageGlossary: [
        { term: "Cartilage", explanation: "The smooth, rubbery padding between bones that prevents friction when you bend your knees." },
        { term: "Osteoarthritis", explanation: "Natural wear-and-tear of joint cushioning over years." }
      ],
      nextSteps: {
        category: 'routine-clinic',
        summary: "Schedule a routine checkup with a bone and joint specialist if walking causes persistent pain.",
        actionLabel: "Find Nearby Orthopedic Doctors",
        actionTab: 'doctors'
      },
      uncertaintyNote: "General health education only. In-person physical examination or imaging is required to assess joint health.",
      sources: [
        { organization: 'American Academy of Orthopaedic Surgeons (AAOS)', year: 2023, topic: 'Knee Osteoarthritis Patient Guidance' }
      ],
      suggestedFollowUps: [
        "What exercises are safe for painful knees?",
        "Does warm water or ice help more?",
        "Find nearby bone and joint doctors"
      ]
    };
  }

  if (q.includes('fever') || q.includes('cold') || q.includes('cough')) {
    return {
      id: `bot-std-${Date.now()}`,
      sender: 'assistant',
      text: "A mild fever (under 101°F / 38.3°C) with a runny nose or scratchy throat is usually your body's immune system fighting off a common viral infection.\n\nHelpful simple steps include:\n• Rest in a well-ventilated room.\n• Sip warm fluids (ginger water, clear soups, herbal tea) to keep your throat moist.\n• Gargle with warm salt water 2–3 times daily.\n• Monitor your temperature twice a day.",
      timestamp,
      nextSteps: {
        category: 'routine-clinic',
        summary: "Most viral colds resolve within 5 to 7 days. If your fever stays above 102°F or lasts longer than 3 days, see a general physician.",
        actionLabel: "Find General Physicians Nearby",
        actionTab: 'doctors'
      },
      uncertaintyNote: "Antibiotics do not work against viral colds and should never be taken without a prescription.",
      suggestedFollowUps: [
        "What is the safe adult dose for paracetamol?",
        "When does a cough need an X-ray?",
        "Find nearby general doctors"
      ]
    };
  }

  // Default Exploratory Response
  return {
    id: `bot-std-default-${Date.now()}`,
    sender: 'assistant',
    text: `Thank you for asking about "${query}". I am here to help explain what may be happening in clear, simple language.\n\nCould you share a little more context?\n1. How many days or weeks have you noticed this?\n2. Is it mild, moderate, or interfering with your routine?\n3. Do you have any saved lab reports or prescriptions we can reference?`,
    timestamp,
    uncertaintyNote: "Educational guidance only. If you are ever unsure or in distress, please consult a healthcare professional.",
    suggestedFollowUps: [
      "Open Lab Report Simplifier",
      "Check Prescription Safety",
      "Find a doctor near me",
      "Open Symptom Checker"
    ],
    nextSteps: {
      category: 'routine-clinic',
      summary: "For persistent symptoms, consulting a trusted clinician is always the safest course.",
      actionLabel: "Explore Symptom Checker",
      actionTab: 'symptoms'
    }
  };
}

function generateFollowUps(query: string, ragResult: any): string[] {
  const followUps: string[] = [];
  const q = query.toLowerCase();

  if (q.includes('hemoglobin') || q.includes('anemia') || q.includes('iron')) {
    followUps.push("What foods boost iron absorption?");
    followUps.push("Why does tea block iron absorption?");
    followUps.push("When should I re-test my CBC?");
  } else if (q.includes('sugar') || q.includes('glucose') || q.includes('hba1c') || q.includes('diabetes')) {
    followUps.push("What is the difference between fasting and HbA1c?");
    followUps.push("What are low blood sugar (hypoglycemia) symptoms?");
    followUps.push("Suggest an Indian balanced thali for sugar control");
  } else if (q.includes('cholesterol') || q.includes('lipid') || q.includes('ldl')) {
    followUps.push("How much fiber do I need daily to lower LDL?");
    followUps.push("What cooking oils are safest for heart health?");
  } else if (q.includes('period') || q.includes('cycle') || q.includes('cramps')) {
    followUps.push("How does luteal phase affect mood and energy?");
    followUps.push("What are gynecological red flags?");
    followUps.push("Safe home relief for period cramps");
  } else if (q.includes('medicine') || q.includes('dose') || q.includes('antibiotic') || q.includes('paracetamol')) {
    followUps.push("Why must I finish the full antibiotic course?");
    followUps.push("What is the max safe dose of paracetamol?");
    followUps.push("What does 'PC' and 'AC' mean on prescriptions?");
  } else {
    followUps.push("Open Lab Report Simplifier");
    followUps.push("View my Health Knowledge Vault");
    followUps.push("Find nearby specialists");
  }

  return followUps.slice(0, 3);
}

function determineNextSteps(query: string, ragResult: any): any {
  const q = query.toLowerCase();
  if (q.includes('report') || q.includes('cbc') || q.includes('test') || q.includes('blood') || q.includes('hba1c')) {
    return {
      category: 'self-care',
      summary: "You can upload your original lab report PDF or photo to track your biomarker trends over time.",
      actionLabel: "Open Lab Report Simplifier",
      actionTab: 'reports'
    };
  }
  if (q.includes('prescription') || q.includes('medicine') || q.includes('pill') || q.includes('dose')) {
    return {
      category: 'self-care',
      summary: "Upload your doctor's prescription to review dosages, timings, and avoid food-drug interactions.",
      actionLabel: "Open Prescription Reader",
      actionTab: 'prescriptions'
    };
  }
  if (q.includes('period') || q.includes('cycle') || q.includes('cramp') || q.includes('ovulation')) {
    return {
      category: 'self-care',
      summary: "Track cycle phases, symptoms, and fertile windows with privacy in the Period Tracker.",
      actionLabel: "Open Period Tracker",
      actionTab: 'period'
    };
  }
  return {
    category: 'routine-clinic',
    summary: "For persistent symptoms, consulting a trusted clinician is always the safest course.",
    actionLabel: "Find Nearby Doctors",
    actionTab: 'doctors'
  };
}
