export interface SymptomAnalysisResult {
  problemTitle: string;
  matchedRegionName: string;
  matchedRegionId: string;
  primarySymptom: string;
  plainLanguageSummary: string;
  possibleCauses: string[];
  redFlags: string[];
  isRedFlag: boolean;
  urgencyLevel: 'Emergency' | 'Prompt Doctor Visit' | 'Routine Clinic Visit' | 'Safe Home Care';
  urgencyColor: string;
  urgencyBadgeColor: string;
  recommendedNextSteps: string[];
  recommendedSpecialty: string;
  doctorSpecialtyReason: string;
}

export function analyzeProblemDescription(rawText: string): SymptomAnalysisResult {
  const text = rawText.toLowerCase().trim();

  // 1. Acute Emergency Red Flags (Priority 1)
  const isEmergency =
    text.includes('chest pain') ||
    text.includes('heart attack') ||
    text.includes('cannot breathe') ||
    text.includes("can't breathe") ||
    text.includes('severe shortness of breath') ||
    text.includes('passed out') ||
    text.includes('fainted') ||
    text.includes('loss of consciousness') ||
    text.includes('coughing blood') ||
    text.includes('vomiting blood') ||
    text.includes('slurred speech') ||
    text.includes('face drooping') ||
    text.includes('one side weakness') ||
    text.includes('thunderclap') ||
    text.includes('worst headache of my life') ||
    text.includes('blue lips') ||
    text.includes('seizure');

  if (isEmergency) {
    return {
      problemTitle: 'Potential Acute Emergency Warning Signs Detected',
      matchedRegionName: 'Urgent Care / Emergency',
      matchedRegionId: 'chest',
      primarySymptom: 'High-Risk Critical Symptom Alert',
      plainLanguageSummary:
        'Your description includes signals (such as severe chest distress, breathing difficulty, sudden neurological changes, or fainting) that require immediate professional medical evaluation rather than self-care or delayed appointments.',
      possibleCauses: [
        'Acute cardiovascular or respiratory strain',
        'Acute neurological event requiring immediate clinical assessment',
        'Severe systemic or internal bleeding complication'
      ],
      redFlags: [
        'Severe chest heaviness, radiating pain to left arm, neck, or jaw',
        'Sudden severe shortness of breath at rest',
        'Confusion, sudden facial asymmetry, or difficulty speaking',
        'Fainting, cold clammy sweats, or persistent dizziness'
      ],
      isRedFlag: true,
      urgencyLevel: 'Emergency',
      urgencyColor: 'bg-red-50 border-red-500 text-red-950',
      urgencyBadgeColor: 'bg-red-600 text-white',
      recommendedNextSteps: [
        'Call emergency responders (108 / 112) or go to the nearest emergency room immediately.',
        'Have someone stay with you and avoid driving yourself.',
        'Sit or lie comfortably while awaiting medical help.'
      ],
      recommendedSpecialty: 'Emergency Medicine / Cardiology',
      doctorSpecialtyReason:
        'Immediate hospital-based emergency clinicians are equipped with rapid ECG, oxygen, and acute diagnostic tools.'
    };
  }

  // 2. Stomach / Digestive Symptoms
  if (
    text.includes('stomach') ||
    text.includes('belly') ||
    text.includes('tummy') ||
    text.includes('eat') ||
    text.includes('acidity') ||
    text.includes('acid') ||
    text.includes('heartburn') ||
    text.includes('gas') ||
    text.includes('bloat') ||
    text.includes('nausea') ||
    text.includes('vomit') ||
    text.includes('diarrhea') ||
    text.includes('loose motion') ||
    text.includes('cramp') ||
    text.includes('food') ||
    text.includes('indigestion')
  ) {
    const isModerate =
      text.includes('vomit') ||
      text.includes('several days') ||
      text.includes('sharp pain') ||
      text.includes('severe');

    return {
      problemTitle: 'Digestive & Gastric Discomfort',
      matchedRegionName: 'Stomach & Digestion',
      matchedRegionId: 'stomach',
      primarySymptom: text.includes('acidity') || text.includes('heartburn')
        ? 'Acidity & Reflux'
        : text.includes('bloat') || text.includes('gas')
        ? 'Bloating & Gas'
        : 'Stomach Ache / Digestive Upset',
      plainLanguageSummary:
        'Your symptoms suggest upper or lower gastrointestinal irritation, acid sensitivity, or delayed gastric emptying, often linked to food timing, spices, or mild viral upset.',
      possibleCauses: [
        'Gastric acid reflux or dyspepsia (indigestion) exacerbated by meals',
        'Food sensitivity, high-fat or overly spiced meal reaction',
        'Intestinal gas buildup or transient gastrointestinal motility shift',
        'Mild gastroenteritis or dehydration'
      ],
      redFlags: [
        'Black tarry stools or blood in vomit',
        'Unbearable localized pain in the lower right abdomen (appendix warning)',
        'Inability to keep liquids down for more than 24 hours',
        'High fever accompanied by persistent abdominal rigidity'
      ],
      isRedFlag: false,
      urgencyLevel: isModerate ? 'Prompt Doctor Visit' : 'Safe Home Care',
      urgencyColor: isModerate
        ? 'bg-amber-50 border-amber-400 text-amber-950'
        : 'bg-emerald-50 border-emerald-400 text-emerald-950',
      urgencyBadgeColor: isModerate ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white',
      recommendedNextSteps: [
        'Eat small, bland meals (khichdi, curd, bananas, clear broths) and avoid heavy spices or fried foods.',
        'Sip warm water or ginger tea slowly throughout the day.',
        'Stay upright for at least 45 minutes after eating to reduce acid backflow.',
        'Consult a general physician or gastroenterologist if pain persists beyond 48 hours.'
      ],
      recommendedSpecialty: 'Gastroenterology / General Medicine',
      doctorSpecialtyReason:
        'A gastroenterologist or general physician can evaluate stomach acid balance, H. pylori, or dietary food intolerances.'
    };
  }

  // 3. Head & Eyes / Neurological
  if (
    text.includes('headache') ||
    text.includes('head') ||
    text.includes('migraine') ||
    text.includes('dizzy') ||
    text.includes('dizziness') ||
    text.includes('lightheaded') ||
    text.includes('eye') ||
    text.includes('sinus') ||
    text.includes('forehead')
  ) {
    const isModerate = text.includes('dizzy') || text.includes('days') || text.includes('throbbing');

    return {
      problemTitle: 'Headache & Cranial Tension',
      matchedRegionName: 'Head & Eyes',
      matchedRegionId: 'head',
      primarySymptom: text.includes('dizzy') ? 'Dizziness & Lightheadedness' : 'Throbbing Headache',
      plainLanguageSummary:
        'Your description describes head pain or lightheadedness, which most commonly stems from muscle contraction around the neck/scalp, screen fatigue, mild dehydration, or sleep deficits.',
      possibleCauses: [
        'Tension headache from neck muscle stiffness or stress',
        'Prolonged screen eye strain or uncorrected optical focal fatigue',
        'Mild dehydration or skipped meals leading to low blood glucose',
        'Sinus pressure from seasonal weather shifts'
      ],
      redFlags: [
        'Sudden, explosive headache that peaks within seconds ("thunderclap")',
        'Headache with high fever, stiff neck, and sensitivity to light',
        'New weakness, tingling, or numbness in your arms or legs',
        'Headache following a recent head bump or fall'
      ],
      isRedFlag: false,
      urgencyLevel: isModerate ? 'Routine Clinic Visit' : 'Safe Home Care',
      urgencyColor: isModerate
        ? 'bg-blue-50 border-blue-400 text-blue-950'
        : 'bg-emerald-50 border-emerald-400 text-emerald-950',
      urgencyBadgeColor: isModerate ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white',
      recommendedNextSteps: [
        'Drink a large glass of room-temperature water or electolytes.',
        'Rest in a quiet, dimly lit room with your eyes closed for 20-30 minutes.',
        'Apply a cool compress across your forehead or a warm cloth to the back of your neck.',
        'Take regular breaks from digital screens every 20 minutes.'
      ],
      recommendedSpecialty: 'General Medicine / Neurology',
      doctorSpecialtyReason:
        'A physician can check your blood pressure, sinus passages, and neurological reflexes to pinpoint the cause.'
    };
  }

  // 4. Joints / Bones / Musculoskeletal
  if (
    text.includes('knee') ||
    text.includes('back') ||
    text.includes('joint') ||
    text.includes('bone') ||
    text.includes('stiff') ||
    text.includes('shoulder') ||
    text.includes('ankle') ||
    text.includes('sprain') ||
    text.includes('twist') ||
    text.includes('leg') ||
    text.includes('hip') ||
    text.includes('neck') ||
    text.includes('spine') ||
    text.includes('muscle')
  ) {
    const isModerate = text.includes('swelling') || text.includes('weeks') || text.includes('severe');

    return {
      problemTitle: 'Joint & Musculoskeletal Stiffness',
      matchedRegionName: 'Joints & Bones',
      matchedRegionId: 'joints',
      primarySymptom: text.includes('knee')
        ? 'Knee Pain / Stiffness'
        : text.includes('back')
        ? 'Lower Back Ache'
        : 'Joint / Muscle Soreness',
      plainLanguageSummary:
        'Your symptoms describe joint stiffness or musculoskeletal strain, which frequently corresponds to cartilage wear, postural tension, or mild soft-tissue inflammation.',
      possibleCauses: [
        'Postural strain or prolonged sitting compressing back and hip joints',
        'Mild osteoarthritis or age-related joint cushioning depletion',
        'Ligament or tendon over-exertion from walking or lifting',
        'Morning joint stiffness from reduced synovial fluid circulation'
      ],
      redFlags: [
        'Joint is visibly deformed, intensely hot, and red',
        'Complete inability to bear weight on the leg or walk',
        'Loss of bladder or bowel control accompanying severe back pain',
        'Sudden numbness spreading down both legs'
      ],
      isRedFlag: false,
      urgencyLevel: isModerate ? 'Prompt Doctor Visit' : 'Routine Clinic Visit',
      urgencyColor: isModerate
        ? 'bg-amber-50 border-amber-400 text-amber-950'
        : 'bg-blue-50 border-blue-400 text-blue-950',
      urgencyBadgeColor: isModerate ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white',
      recommendedNextSteps: [
        'Apply a warm towel or heating pad for 15 minutes to loosen stiff muscles.',
        'Avoid high-impact jumps; choose gentle walking on flat surfaces.',
        'Use supportive footwear with adequate arch cushioning.',
        'Schedule an evaluation with an orthopedic doctor or physiotherapist if pain lasts over 10 days.'
      ],
      recommendedSpecialty: 'Orthopedics / Physiotherapy',
      doctorSpecialtyReason:
        'An orthopedic specialist or physiotherapist can conduct range-of-motion tests and advise on targeted strengthening exercises.'
    };
  }

  // 5. Chest & Respiratory (Non-emergency)
  if (
    text.includes('cough') ||
    text.includes('chest') ||
    text.includes('throat') ||
    text.includes('breathing') ||
    text.includes('breath') ||
    text.includes('lungs') ||
    text.includes('wheez') ||
    text.includes('phlegm')
  ) {
    return {
      problemTitle: 'Respiratory & Throat Irritation',
      matchedRegionName: 'Chest & Breathing',
      matchedRegionId: 'chest',
      primarySymptom: text.includes('cough') ? 'Cough & Throat Irritation' : 'Chest Congestion',
      plainLanguageSummary:
        'Your symptoms point toward respiratory passage irritation, bronchial congestion, or seasonal allergic inflammation.',
      possibleCauses: [
        'Upper respiratory viral congestion (common cold / flu)',
        'Post-nasal drip from allergic rhinitis triggering a dry cough',
        'Mild bronchial reactivity to dust, smoke, or cold air',
        'Vocal strain or dry air exposure'
      ],
      redFlags: [
        'Difficulty speaking in full sentences due to breathlessness',
        'High fever (>102°F) with rust-colored or bloody sputum',
        'Persistent sharp chest pain when inhaling deeply',
        'Stridor or whistling sound when breathing in'
      ],
      isRedFlag: false,
      urgencyLevel: 'Routine Clinic Visit',
      urgencyColor: 'bg-blue-50 border-blue-400 text-blue-950',
      urgencyBadgeColor: 'bg-blue-600 text-white',
      recommendedNextSteps: [
        'Inhale steam with warm water twice daily to loosen congestion.',
        'Drink warm water with honey and tulsi or ginger.',
        'Avoid cold drinks, cigarette smoke, and dusty environments.',
        'Consult a pulmonologist or general physician if cough persists over 2 weeks.'
      ],
      recommendedSpecialty: 'Pulmonology / General Medicine',
      doctorSpecialtyReason:
        'A pulmonologist or physician can listen to lung sounds with a stethoscope to ensure airways are clear.'
    };
  }

  // 6. Skin & Rash
  if (
    text.includes('skin') ||
    text.includes('rash') ||
    text.includes('itch') ||
    text.includes('pimple') ||
    text.includes('acne') ||
    text.includes('red patch') ||
    text.includes('allergy')
  ) {
    return {
      problemTitle: 'Dermatological Irritation & Rash',
      matchedRegionName: 'Skin & Rash',
      matchedRegionId: 'skin',
      primarySymptom: 'Itchy Red Patches / Rash',
      plainLanguageSummary:
        'Your description suggests dermal surface inflammation, contact sensitivity, or histamine release in response to an irritant or weather change.',
      possibleCauses: [
        'Contact dermatitis from a soap, detergent, or skincare product',
        'Dry weather skin barrier disruption',
        'Mild heat rash or allergic urticaria',
        'Sebaceous gland pore clogging'
      ],
      redFlags: [
        'Rapidly spreading rash accompanied by lip, tongue, or facial swelling',
        'Blisters covering a wide area or skin peeling',
        'High fever accompanying an acute rash eruption',
        'Signs of secondary infection such as golden crusting or pus'
      ],
      isRedFlag: false,
      urgencyLevel: 'Routine Clinic Visit',
      urgencyColor: 'bg-blue-50 border-blue-400 text-blue-950',
      urgencyBadgeColor: 'bg-blue-600 text-white',
      recommendedNextSteps: [
        'Cleanse with cool water and avoid harsh scented soaps.',
        'Apply a gentle, fragrance-free moisturizer or calamine lotion.',
        'Avoid scratching to prevent secondary skin bacterial entry.',
        'Consult a dermatologist for targeted topical guidance.'
      ],
      recommendedSpecialty: 'Dermatology',
      doctorSpecialtyReason:
        'A dermatologist can inspect the pattern, dermoscopic structure, and prescribe soothing treatments.'
    };
  }

  // 7. General / Fatigue / Fever / Default Fallback
  return {
    problemTitle: 'General Wellbeing & Fatigue Concerns',
    matchedRegionName: 'General & Fatigue',
    matchedRegionId: 'general',
    primarySymptom: text.includes('fever')
      ? 'Low-Grade Fever'
      : text.includes('tired') || text.includes('fatigue')
      ? 'Body Tiredness / Weakness'
      : 'General Physical Discomfort',
    plainLanguageSummary:
      'Your entered concerns suggest overall body fatigue, low vitality, or mild systemic strain that can stem from lifestyle pacing, sleep changes, or metabolic hydration needs.',
    possibleCauses: [
      'Inadequate restful sleep or mental exhaustion',
      'Mild dehydration or nutritional gaps (iron, B12, or Vitamin D)',
      'Low-grade viral immune response clearing in the background',
      'Stress or irregular meal schedules altering energy levels'
    ],
    redFlags: [
      'High persistent fever exceeding 101°F for more than 3 consecutive days',
      'Sudden extreme weakness or inability to stand upright safely',
      'Unexplained unintentional weight loss or night sweats',
      'Severe pain in any single organ or limb'
    ],
    isRedFlag: false,
    urgencyLevel: 'Routine Clinic Visit',
    urgencyColor: 'bg-blue-50 border-blue-400 text-blue-950',
    urgencyBadgeColor: 'bg-blue-600 text-white',
    recommendedNextSteps: [
      'Prioritize 7-8 hours of continuous, restful sleep.',
      'Maintain steady hydration with fresh water and balanced meals.',
      'Take short resting pauses during the day without prolonged immobility.',
      'Consult a general physician to consider routine blood work if exhaustion persists.'
    ],
    recommendedSpecialty: 'General Medicine / Internal Medicine',
    doctorSpecialtyReason:
      'A general physician can review vital signs, order comprehensive blood counts, and guide overall health restoration.'
  };
}
