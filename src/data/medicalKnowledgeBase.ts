import { RAGChunk } from '../types/rag';

export const MEDICAL_KNOWLEDGE_BASE: RAGChunk[] = [
  // ==========================================
  // DOMAIN 1: LAB BIOMARKERS & REFERENCE RANGES
  // ==========================================
  {
    id: 'ckb_bio_cbc_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_cbc',
    title: 'Complete Blood Count (CBC) - Hemoglobin & RBC Reference Guide',
    content: `Complete Blood Count (CBC) assesses overall cellular health. Hemoglobin (Hb) normal reference range: Adult Males: 13.8–17.2 g/dL; Adult Non-Pregnant Females: 12.1–15.1 g/dL; Pregnant Females: ≥11.0 g/dL. Low hemoglobin (<12.0 g/dL in women, <13.5 g/dL in men) indicates anemia, frequently microcytic hypochromic (Iron Deficiency Anemia) or normocytic/macrocytic (B12/Folate deficiency or chronic disease). Red Blood Cells (RBC): 4.5–5.9 million/mcL (men), 4.1–5.1 million/mcL (women). Hematocrit (Hct): 40.7%–50.3% (men), 36.1%–44.3% (women). If Hb is below 8.0 g/dL, urgent clinical evaluation is required.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['Hemoglobin', 'Hb', 'RBC', 'Hematocrit', 'Hct', 'MCV', 'MCH'],
      symptoms: ['fatigue', 'pallor', 'shortness of breath', 'weakness', 'dizziness'],
      relevanceAnchor: 'Hemoglobin anemia CBC red blood cells'
    }
  },
  {
    id: 'ckb_bio_cbc_02',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_wbc_platelets',
    title: 'WBC (Leukocyte) & Platelet Counts - Infection and Coagulation Reference',
    content: `Total Leukocyte Count (TLC / White Blood Cells): Normal range 4,500–11,000 cells/mcL. Leukocytosis (>11,000/mcL) is commonly seen in acute bacterial infections, inflammation, severe stress, or steroid use. Leukopenia (<4,000/mcL) can occur with viral illnesses (e.g. dengue), autoimmune conditions, or bone marrow suppression. Differential count: Neutrophils 40–70%, Lymphocytes 20–40%, Monocytes 2–8%, Eosinophils 1–4%, Basophils 0.5–1%. Platelet Count: Normal range 150,000–450,000/mcL. Thrombocytopenia (<150,000/mcL) carries bleeding risks, especially critical if <50,000/mcL (spontaneous petechiae/bleeding).`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['WBC', 'TLC', 'Platelets', 'Neutrophils', 'Lymphocytes', 'Eosinophils'],
      symptoms: ['fever', 'bleeding', 'bruising', 'petechiae', 'infection'],
      relevanceAnchor: 'White blood cells platelets infections inflammation'
    }
  },
  {
    id: 'ckb_bio_glycemic_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_glycemic_panel',
    title: 'Glycemic Control - HbA1c & Blood Glucose Standard Thresholds',
    content: `Glycated Hemoglobin (HbA1c) reflects 3-month average plasma glucose. ADA Diagnostic Criteria: Normal: < 5.7%; Prediabetes (Impaired Glucose Tolerance): 5.7% to 6.4%; Diabetes Mellitus: ≥ 6.5% on two separate tests. Fasting Plasma Glucose (FPG, ≥8 hr fast): Normal: 70–99 mg/dL; Impaired Fasting Glucose: 100–125 mg/dL; Diabetes: ≥ 126 mg/dL. Postprandial Glucose (PPBG, 2-hr post meal): Normal: < 140 mg/dL; Prediabetes: 140–199 mg/dL; Diabetes: ≥ 200 mg/dL. Hypoglycemia is clinically defined as blood glucose < 70 mg/dL (symptoms include sweating, tremors, tachycardia, confusion).`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['HbA1c', 'Fasting Blood Sugar', 'FPG', 'Postprandial Glucose', 'PPBG', 'Blood Glucose'],
      symptoms: ['polyuria', 'polydipsia', 'tremors', 'sweating', 'blurred vision', 'fatigue'],
      relevanceAnchor: 'HbA1c diabetes blood sugar glucose fasting'
    }
  },
  {
    id: 'ckb_bio_lipids_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_lipid_panel',
    title: 'Lipid Profile - Cholesterol, LDL, HDL & Triglycerides Thresholds',
    content: `Lipid Panel assesses cardiovascular atherosclerotic risk. Desirable standard ranges: Total Cholesterol: < 200 mg/dL (Borderline high: 200–239 mg/dL; High: ≥ 240 mg/dL). Low-Density Lipoprotein (LDL "bad cholesterol"): Optimal: < 100 mg/dL (< 70 mg/dL for patients with established CVD or diabetes); Near optimal: 100–129 mg/dL; High: 160–189 mg/dL; Very high: ≥ 190 mg/dL. High-Density Lipoprotein (HDL "protective"): Men: > 40 mg/dL; Women: > 50 mg/dL. Triglycerides: Normal: < 150 mg/dL; Borderline: 150–199 mg/dL; High: 200–499 mg/dL; Very high: ≥ 500 mg/dL (elevated acute pancreatitis risk).`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'VLDL'],
      symptoms: ['chest pain', 'palpitations', 'cardiovascular risk', 'atherosclerosis'],
      relevanceAnchor: 'Lipid profile cholesterol LDL HDL triglycerides heart health'
    }
  },
  {
    id: 'ckb_bio_thyroid_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_thyroid_tsh',
    title: 'Thyroid Function Panel - TSH, Free T3, and Free T4 Diagnostics',
    content: `Thyroid Stimulating Hormone (TSH) is the most sensitive primary screen for thyroid disorders. Normal reference range: 0.45 to 4.50 mIU/L (first trimester pregnancy target is typically < 2.5 mIU/L). Elevated TSH (> 4.5 mIU/L) with normal Free T4 indicates Subclinical Hypothyroidism; elevated TSH with low Free T4 (< 0.8 ng/dL) indicates Primary Hypothyroidism (common symptoms: fatigue, cold intolerance, weight gain, constipation, dry skin, menorrhagia). Suppressed TSH (< 0.4 mIU/L) with elevated Free T3/T4 indicates Hyperthyroidism / Thyrotoxicosis (symptoms: palpitations, unintentional weight loss, heat intolerance, anxiety, tremors).`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['TSH', 'Free T3', 'Free T4', 'Total T4', 'Thyroid Antibodies'],
      symptoms: ['fatigue', 'weight gain', 'weight loss', 'cold intolerance', 'palpitations', 'hair loss'],
      relevanceAnchor: 'TSH thyroid hypothyroidism hyperthyroidism hormone'
    }
  },
  {
    id: 'ckb_bio_vitamins_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_vitamins_d_b12',
    title: 'Micronutrient Deficiencies - Vitamin D (25-OH) and Vitamin B12',
    content: `Vitamin D (25-Hydroxyvitamin D): Deficient: < 20 ng/mL (< 50 nmol/L); Insufficient: 20–29 ng/mL; Sufficient: 30–100 ng/mL. Deficiency causes reduced calcium absorption, secondary hyperparathyroidism, bone demineralization (osteomalacia/osteopenia), muscle aches, and generalized chronic fatigue. Vitamin B12 (Cobalamin): Normal range: 200–900 pg/mL. Deficient: < 200 pg/mL (Borderline: 200–300 pg/mL). High risk among strict vegetarians and elderly due to lack of animal sources or intrinsic factor deficiency. B12 deficiency leads to megaloblastic anemia, peripheral neuropathy (numbness, paresthesias in hands/feet), cognitive slowing, and glossitis.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['Vitamin D', '25-OH Vitamin D', 'Vitamin B12', 'Cobalamin', 'Folate'],
      symptoms: ['bone ache', 'fatigue', 'tingling', 'numbness', 'muscle weakness', 'brain fog'],
      relevanceAnchor: 'Vitamin D B12 deficiency neuropathy bone fatigue'
    }
  },
  {
    id: 'ckb_bio_kidney_liver_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_renal_hepatic',
    title: 'Kidney & Liver Function - Creatinine, eGFR, SGPT/ALT & Bilirubin',
    content: `Renal Function: Serum Creatinine: Adult Males: 0.7–1.3 mg/dL; Adult Females: 0.5–1.1 mg/dL. Estimated Glomerular Filtration Rate (eGFR): Normal: ≥ 90 mL/min/1.73m² without proteinuria. Chronic Kidney Disease (CKD) stages: Stage 3 (30–59), Stage 4 (15–29), Stage 5 (< 15 or dialysis). Blood Urea Nitrogen (BUN): 7–20 mg/dL. Hepatic Function: SGPT / Alanine Aminotransferase (ALT): Normal 7–56 U/L; SGOT / Aspartate Aminotransferase (AST): Normal 10–40 U/L. Significant elevation (> 3x upper limit) marks acute hepatocellular injury. Total Bilirubin: 0.2–1.2 mg/dL (> 2.5–3.0 mg/dL produces visible scleral icterus/jaundice). Alkaline Phosphatase (ALP): 44–147 U/L.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'lab_biomarkers',
      biomarkers: ['Creatinine', 'eGFR', 'BUN', 'SGPT', 'ALT', 'SGOT', 'AST', 'Bilirubin', 'ALP'],
      symptoms: ['edema', 'foamy urine', 'jaundice', 'yellow eyes', 'dark urine', 'nausea'],
      relevanceAnchor: 'Creatinine eGFR kidney liver SGPT ALT bilirubin'
    }
  },

  // ==========================================
  // DOMAIN 2: MENSTRUAL CYCLE & REPRODUCTIVE HEALTH
  // ==========================================
  {
    id: 'ckb_cycle_phases_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_menstrual_phases',
    title: 'The Four Menstrual Phases - Physiology, Hormones & Wellness Adaptations',
    content: `The menstrual cycle averages 21–35 days (median 28 days), governed by the hypothalamic-pituitary-ovarian axis:
1. Menstrual Phase (Days 1–5): Estrogen and progesterone drop to nadir, causing endometrial shedding. Energy is naturally lower; focus on hydration, iron-rich meals, and light restorative movement.
2. Follicular Phase (Days 1–13): Pituitary secretes FSH; follicles mature. Estrogen gradually increases, thickening uterine lining, boosting insulin sensitivity, physical energy, and cognitive focus.
3. Ovulatory Phase (Days 14–15): Estrogen peak triggers Luteinizing Hormone (LH) surge; dominant follicle releases ovum. Peak fertility spans the 5 days before ovulation plus ovulation day. Basal body temperature rises 0.5°F after ovulation.
4. Luteal Phase (Days 15–28): Corpus luteum produces progesterone. Metabolism rises by ~100–250 kcal/day, but insulin sensitivity drops. In the late luteal phase, PMS symptoms (breast tenderness, fluid retention, mood lability) may emerge.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'menstrual_health',
      biomarkers: ['Estrogen', 'Progesterone', 'LH', 'FSH', 'Basal Body Temperature'],
      symptoms: ['cramps', 'bloating', 'breast tenderness', 'mood swings', 'fatigue'],
      relevanceAnchor: 'Menstrual cycle phases follicular luteal ovulation period'
    }
  },
  {
    id: 'ckb_cycle_symptoms_02',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_menstrual_dysfunction',
    title: 'Menstrual Irregularities - Dysmenorrhea, PMS, PMDD, and PCOS',
    content: `Primary Dysmenorrhea (menstrual cramping without pelvic pathology) results from elevated endometrial prostaglandin F2α causing uterine myometrial contractions and ischemia; first-line relief includes targeted NSAIDs (mefenamic acid or ibuprofen) taken at onset with meals, warm compression, and magnesium supplementation. Premenstrual Dysphoric Disorder (PMDD) is a severe, disabling form of PMS characterized by intense dysphoria, anger, anxiety, and hopeless feelings during the luteal phase resolving promptly after menses. Polycystic Ovary Syndrome (PCOS) is diagnosed using Rotterdam criteria: requiring at least two of (1) oligo/anovulation (cycles > 35 days), (2) hyperandrogenism (hirsutism, cystic acne, androgenic alopecia), and (3) polycystic ovarian morphology on ultrasound.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'menstrual_health',
      symptoms: ['cramping', 'painful periods', 'irregular periods', 'hirsutism', 'mood swings', 'anxiety'],
      relevanceAnchor: 'Cramps dysmenorrhea PCOS PMS PMDD irregular periods'
    }
  },
  {
    id: 'ckb_cycle_redflags_03',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_gynecology_red_flags',
    title: 'Gynecological Red Flags Requiring Immediate Medical Attention',
    content: `Urgent gynecological red flags requiring immediate physician or emergency department consultation:
1. Menorrhagia / Severe Hemorrhage: Soaking through one or more menstrual pads or tampons every hour for two consecutive hours, or passing blood clots larger than a quarter (or coin diameter > 2.5 cm).
2. Acute Severe Pelvic Pain: Sudden, sharp, unilateral lower abdominal or pelvic pain (rules out ectopic pregnancy in women of childbearing potential, ovarian cyst rupture, or adnexal torsion).
3. Postmenopausal Bleeding: Any vaginal spotting or bleeding occurring 12 months after the cessation of menses requires mandatory endometrial evaluation to rule out endometrial hyperplasia or malignancy.
4. Infection Signs: High fever (> 38°C / 100.4°F) accompanied by foul-smelling vaginal discharge, pelvic pain, or systemic chills (suspect Pelvic Inflammatory Disease or Toxic Shock Syndrome).`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'menstrual_health',
      symptoms: ['heavy bleeding', 'severe pelvic pain', 'fever', 'foul discharge', 'postmenopausal bleeding'],
      relevanceAnchor: 'Gynecological red flags heavy bleeding severe pain emergency'
    }
  },

  // ==========================================
  // DOMAIN 3: NUTRITION GUIDELINES & DIETETICS
  // ==========================================
  {
    id: 'ckb_nutr_icmr_thali_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_icmr_thali',
    title: 'ICMR-NIN & WHO Dietary Guidelines - The Balanced Thali Model',
    content: `The Indian Council of Medical Research (ICMR-NIN) 2024 guidelines emphasize nutrient-dense dietary patterns to prevent both micronutrient deficiency and non-communicable diseases (diabetes, hypertension, CAD).
The "My Plate for the Day" (Balanced Thali Model):
- 50% Plate (Vegetables & Fruits): At least 400–500g of vegetables (leafy greens, roots, tubers, gourds) and seasonal fresh fruits providing dietary fiber, potassium, and antioxidants.
- 25% Plate (Protein Sources): 100–120g of legumes, lentils (dal, rajma, chana), paneer, tofu, eggs, fish, or poultry. For vegetarians, combining cereal + pulse (e.g. 3:1 ratio in khichdi or dal-chawal) ensures a complete essential amino acid profile.
- 25% Plate (Complex Carbohydrates): Whole grains (millets like ragi, jowar, bajra, brown rice, whole wheat) over refined flour (maida).
Fats & Oils: Sourced from cold-pressed mustard, sesame, groundnut, or olive oils (limit to 25–30g/day); avoid reheating cooking oil or consuming trans-fat vanaspati.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'nutrition',
      symptoms: ['weight management', 'high cholesterol', 'diabetes prevention', 'fatigue'],
      relevanceAnchor: 'ICMR nutrition balanced thali vegetables protein grains'
    }
  },
  {
    id: 'ckb_nutr_iron_calcium_02',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_bioavailability',
    title: 'Micronutrient Bioavailability - Iron, Vitamin C, Calcium and Phytate Interactions',
    content: `Optimizing micronutrient absorption is vital for vegetarian and mixed diets:
1. Iron Bioavailability: Plant-based iron (non-heme iron in spinach, lentils, beans) has ~2–10% baseline bioavailability. Consuming non-heme iron alongside Vitamin C-rich foods (lemon juice, amla/Indian gooseberry, bell peppers, tomatoes, guava) increases iron absorption by 200–300%.
2. Inhibitors of Iron: Phytates in unsoaked legumes/grains, polyphenols and tannins in black tea, green tea, and coffee inhibit iron absorption by up to 60–90%. Never drink tea or coffee with meals or iron supplements; wait at least 60–90 minutes post-meal.
3. Calcium and Iron Competition: Calcium supplements or heavy dairy (milk/paneer) compete with iron for intestinal DMT-1 transporters. Take calcium and iron supplements at separate times of day.
4. Vitamin D & Calcium: Calcium absorption in the gut is dependent on adequate 25-OH Vitamin D.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'nutrition',
      biomarkers: ['Iron', 'Ferritin', 'Calcium', 'Vitamin C'],
      symptoms: ['anemia', 'bone loss', 'fatigue', 'weakness'],
      relevanceAnchor: 'Iron absorption vitamin C bioavailability tea coffee tannins'
    }
  },
  {
    id: 'ckb_nutr_sodium_sugar_03',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_sodium_sugar_fiber',
    title: 'WHO & ICMR Standards - Sodium, Added Sugars, and Dietary Fiber Limits',
    content: `Cardiometabolic risk reduction dietary benchmarks:
1. Sodium Restriction: WHO recommends < 2,000 mg of sodium per day (equivalent to < 5 grams or 1 flat teaspoon of salt). High sodium is a principal driver of arterial hypertension, stroke, and left ventricular hypertrophy. Watch for hidden sodium in pickles (achaar), papads, bakery items, namkeen, processed soups, and soy sauce.
2. Free & Added Sugars: WHO strongly advises limiting free sugars to less than 10% of total daily caloric intake, with additional health benefits if kept under 5% (< 25 grams or ~6 teaspoons/day for an average adult). Excess fructose and simple sugars stimulate hepatic de novo lipogenesis, promoting non-alcoholic fatty liver disease (NAFLD) and visceral adiposity.
3. Dietary Fiber: Target ≥ 30 grams per day from whole legumes, oats, vegetables, berries, and millets to promote short-chain fatty acid (SCFA) gut microbiome synthesis, blunted glycemic spikes, and LDL cholesterol clearance.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'nutrition',
      biomarkers: ['Blood Pressure', 'Triglycerides', 'Fasting Blood Sugar', 'LDL'],
      symptoms: ['hypertension', 'water retention', 'bloating', 'sugar cravings'],
      relevanceAnchor: 'Sodium salt limits sugar fiber hypertension cardiovascular'
    }
  },

  // ==========================================
  // DOMAIN 4: MEDICATION SAFETY & PRESCRIPTION LITERACY
  // ==========================================
  {
    id: 'ckb_med_abbrev_01',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_rx_abbreviations',
    title: 'Prescription Abbreviations & Timing Terminology Guide',
    content: `Standard medical abbreviations on physician prescriptions:
- OD (Omni Die): Once daily (take every 24 hours).
- BD or BID (Bis in Die): Twice daily (typically every 12 hours, e.g., morning and night).
- TDS or TID (Ter in Die): Three times daily (every 8 hours, morning, afternoon, night).
- QID (Quater in Die): Four times daily (every 6 hours).
- SOS or PRN (Pro Re Nata): As needed for specific symptoms (e.g., paracetamol for fever > 100°F).
- AC (Ante Cibum): Before food / on an empty stomach (typically 30–60 minutes before meals).
- PC (Post Cibum): After food / with meals (within 15–30 minutes after eating to minimize gastric irritation).
- HS (Hora Somni): At bedtime.
- Stat: Immediately / single initial loading dose.
- PO (Per Os): By oral route.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'medication_safety',
      medications: ['Prescription standards'],
      symptoms: ['medication confusion', 'dosage timing'],
      relevanceAnchor: 'Prescription abbreviations OD BD TDS SOS AC PC timing'
    }
  },
  {
    id: 'ckb_med_interactions_02',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_food_drug_interactions',
    title: 'Critical Food-Drug Interactions and Administration Precautions',
    content: `Essential food-drug and drug-drug safety rules:
1. Antibiotics & Dairy: Fluoroquinolones (ciprofloxacin, levofloxacin) and tetracyclines (doxycycline) chelate with multivalent cations (calcium in milk/curd/cheese, magnesium, aluminum in antacids, iron supplements), forming insoluble complexes that reduce drug absorption by 50–90%. Space dairy and mineral supplements by at least 2 hours before or after taking the antibiotic.
2. Thyroid Hormone (Levothyroxine): Must be taken strictly on an empty stomach with plain water at least 30 to 60 minutes before breakfast, tea, or coffee. Calcium, iron, and soy drastically impede levothyroxine absorption.
3. Statins (Atorvastatin, Simvastatin): Grapefruit and grapefruit juice inhibit intestinal CYP3A4 enzyme, leading to dangerously high statin blood concentrations and increased risk of rhabdomyolysis / myopathy.
4. NSAIDs & Gastric Mucosa: Ibuprofen, naproxen, and diclofenac inhibit COX-1 prostaglandins protecting the stomach lining. Always take with meals or a prescribed proton-pump inhibitor (PPI like pantoprazole) to avoid ulcers and gastritis.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'medication_safety',
      medications: ['Levothyroxine', 'Ciprofloxacin', 'Doxycycline', 'Atorvastatin', 'Ibuprofen', 'Pantoprazole'],
      symptoms: ['stomach pain', 'gastric ulcer', 'muscle pain', 'nausea'],
      relevanceAnchor: 'Food drug interaction antibiotic dairy thyroid levothyroxine statin NSAID'
    }
  },
  {
    id: 'ckb_med_safety_amr_03',
    userId: 'clinical_knowledge_base',
    sourceType: 'clinical_guideline',
    sourceId: 'guideline_amr_paracetamol',
    title: 'Antimicrobial Stewardship & Analgesic Safety Limits',
    content: `Crucial patient medication safety standards:
1. Antibiotic Course Completion: Never stop taking antibiotics early even if symptoms (fever, sore throat, pain) resolve within 48–72 hours. Premature discontinuation leaves partially resistant bacterial populations alive, driving Antimicrobial Resistance (AMR) and secondary recrudescence. Never reuse leftover antibiotics or share them.
2. Paracetamol / Acetaminophen Maximum Dose: Absolute maximum safe daily dosage for adults with normal liver function is 4,000 mg (4 grams) in 24 hours (typically 500mg–650mg every 6 hours). Higher doses or combination with alcohol carry severe risk of acute toxic acetaminophen-induced hepatic necrosis. Be vigilant: multi-symptom cold/sinus preparations often contain hidden paracetamol; combining them with standalone paracetamol leads to accidental overdose.
3. NSAID Cautions: Avoid regular NSAID use in patients with chronic kidney disease, uncontrolled hypertension, history of peptic ulcer disease, or active heart failure.`,
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {
      clinicalDomain: 'medication_safety',
      medications: ['Paracetamol', 'Acetaminophen', 'Antibiotics', 'Amoxicillin', 'Azithromycin', 'NSAIDs'],
      symptoms: ['liver toxicity', 'fever', 'pain', 'overdose', 'antimicrobial resistance'],
      relevanceAnchor: 'Antibiotic completion AMR paracetamol max dose safety toxicity'
    }
  }
];
