import {
  MedicalReport,
  DoctorListing,
  SupplementInfo,
  WorkoutPlan,
  SyntheticPrescription,
  MedicineCatalogItem,
  FoodPhotoSample,
  RecipeIngredient,
  PharmacyListing
} from '../types';

export const syntheticLabReports: MedicalReport[] = [
  {
    id: 'rep-cbc-001',
    title: 'Complete Blood Count (CBC) with Iron Panel',
    date: '2026-10-15',
    patientSyntheticName: 'Aarav Sharma (Sample Profile)',
    labName: 'Metro Health Diagnostics (Demo Lab)',
    summary: 'Mild iron deficiency pattern noted. Hemoglobin and serum ferritin are slightly below typical reference ranges. White blood cell count and platelets are in the normal range.',
    generalAdvice: 'This is educational sample data. Mildly low hemoglobin can be associated with fatigue or nutritional iron intake. Please discuss this report with a doctor to evaluate potential dietary or medical steps.',
    questionsForDoctor: [
      'Do my low hemoglobin and ferritin levels indicate iron-deficiency anemia?',
      'Would dietary adjustments or iron supplements be appropriate for me?',
      'Should we retest my blood count in 2 to 3 months?'
    ],
    metrics: [
      {
        name: 'Hemoglobin (Hb)',
        code: 'HGB',
        value: 10.8,
        unit: 'g/dL',
        referenceRange: '13.0 - 17.0 g/dL',
        status: 'low',
        plainExplanation: 'Hemoglobin is the protein in red blood cells that carries oxygen from your lungs to the rest of your body.',
        clinicalContext: 'Yours is 10.8 g/dL, which is slightly below the typical range. When hemoglobin is low, body tissues get slightly less oxygen, which can cause tiredness or cold hands.'
      },
      {
        name: 'Total Red Blood Cells (RBC)',
        code: 'RBC',
        value: 3.9,
        unit: 'million/uL',
        referenceRange: '4.5 - 5.9 million/uL',
        status: 'low',
        plainExplanation: 'RBC count measures how many oxygen-carrying cells you have in your bloodstream.',
        clinicalContext: 'Slightly low, matching the mild hemoglobin drop.'
      },
      {
        name: 'Serum Ferritin (Iron Storage)',
        code: 'FERR',
        value: 14,
        unit: 'ng/mL',
        referenceRange: '20 - 250 ng/mL',
        status: 'low',
        plainExplanation: 'Ferritin measures how much iron your body has stored in reserve for making new red blood cells.',
        clinicalContext: 'A low ferritin level suggests stored iron reserves are depleted, often due to inadequate dietary iron intake or slow loss.'
      },
      {
        name: 'White Blood Cell Count (WBC)',
        code: 'WBC',
        value: 6400,
        unit: 'cells/uL',
        referenceRange: '4,000 - 11,000 cells/uL',
        status: 'normal',
        plainExplanation: 'White blood cells are your immune defense system against bacteria, viruses, and infections.',
        clinicalContext: 'Your level is completely healthy and normal, indicating no obvious active acute bacterial infection or immune strain.'
      },
      {
        name: 'Platelet Count',
        code: 'PLT',
        value: 235000,
        unit: '/uL',
        referenceRange: '150,000 - 450,000 /uL',
        status: 'normal',
        plainExplanation: 'Platelets are tiny blood cell fragments that help your blood clot normally to stop cuts or wounds from bleeding.',
        clinicalContext: 'Well within standard healthy bounds.'
      }
    ]
  },
  {
    id: 'rep-cmp-002',
    title: 'Lipid Profile & Metabolic Health Screen',
    date: '2026-10-18',
    patientSyntheticName: 'Meera Patel (Sample Profile)',
    labName: 'Apex Preventive Care Center (Demo Lab)',
    summary: 'Borderline elevated LDL (bad cholesterol) and fasting blood glucose in the impaired fasting glucose / prediabetes bracket. Kidney filtration markers are optimal.',
    generalAdvice: 'Educational overview: Fasting blood sugar and LDL can often be improved with gentle lifestyle tweaks such as daily walking and fiber intake. Always seek clinician interpretation before making medication choices.',
    questionsForDoctor: [
      'Does my fasting glucose of 112 mg/dL place me in the prediabetes category?',
      'Can lifestyle changes (walking, diet) lower my LDL cholesterol, or will I need statins?',
      'Should we check an HbA1c test for a 3-month average of blood sugar?'
    ],
    metrics: [
      {
        name: 'Fasting Blood Glucose',
        code: 'FBG',
        value: 114,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'high',
        plainExplanation: 'Measures sugar (glucose) dissolved in your bloodstream after at least 8 hours of fasting without food.',
        clinicalContext: 'Between 100 and 125 mg/dL is commonly termed impaired fasting glucose (prediabetes). It suggests the body is using insulin slightly less efficiently.'
      },
      {
        name: 'Total Cholesterol',
        code: 'CHOL',
        value: 226,
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'high',
        plainExplanation: 'The sum of all cholesterol types circulating in your blood.',
        clinicalContext: 'Slightly above the optimal 200 mg/dL mark. Total cholesterol is reviewed together with HDL and LDL rather than by itself.'
      },
      {
        name: 'LDL Cholesterol ("Bad")',
        code: 'LDL',
        value: 144,
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'high',
        plainExplanation: 'Low-Density Lipoprotein carries cholesterol to tissues. Higher levels can slowly deposit in artery walls over years.',
        clinicalContext: '144 mg/dL is categorized as borderline high. Increasing soluble dietary fiber (oats, beans) and regular activity can help manage it.'
      },
      {
        name: 'HDL Cholesterol ("Good")',
        code: 'HDL',
        value: 48,
        unit: 'mg/dL',
        referenceRange: '> 40 mg/dL (Men) / > 50 mg/dL (Women)',
        status: 'normal',
        plainExplanation: 'High-Density Lipoprotein sweeps excess cholesterol away from blood vessels back to the liver for disposal.',
        clinicalContext: 'Acceptable range. Physical exercise and healthy fats (nuts, seeds) can help raise HDL further.'
      },
      {
        name: 'Serum Creatinine',
        code: 'CREAT',
        value: 0.85,
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.2 mg/dL',
        status: 'normal',
        plainExplanation: 'A waste byproduct filtered by your kidneys. Used to check how effectively kidneys clear blood.',
        clinicalContext: 'Completely normal and healthy kidney function filtration marker.'
      }
    ]
  },
  {
    id: 'rep-lft-003',
    title: 'Liver Function Panel & Vitamin Screen',
    date: '2026-09-28',
    patientSyntheticName: 'Sunita Joshi (Sample Profile)',
    labName: 'Central City Pathology (Demo Lab)',
    summary: 'Liver enzymes (ALT, AST) and bilirubin are in optimal ranges. Vitamin D3 is significantly deficient, which is very common and affects bone strength.',
    generalAdvice: 'Low Vitamin D is widespread in urban populations. Discuss a safe supplement schedule and safe sun exposure with a doctor.',
    questionsForDoctor: [
      'What dosage of Vitamin D3 is recommended to restore my levels safely?',
      'Do I need to take Calcium alongside Vitamin D?',
      'Are my liver enzymes healthy?'
    ],
    metrics: [
      {
        name: 'Vitamin D3 (25-Hydroxy)',
        code: 'VITD',
        value: 11.2,
        unit: 'ng/mL',
        referenceRange: '30.0 - 100.0 ng/mL',
        status: 'low',
        plainExplanation: 'Vitamin D helps your intestines absorb calcium to build strong bones and supports immune health.',
        clinicalContext: 'Below 20 ng/mL is classified as deficient. Can lead to bone ache, muscle weakness, or fatigue.'
      },
      {
        name: 'Alanine Aminotransferase (ALT)',
        code: 'ALT',
        value: 22,
        unit: 'U/L',
        referenceRange: '7 - 56 U/L',
        status: 'normal',
        plainExplanation: 'An enzyme found mainly inside liver cells. High levels occur when liver cells are irritated.',
        clinicalContext: 'Within completely normal healthy limits.'
      },
      {
        name: 'Aspartate Aminotransferase (AST)',
        code: 'AST',
        value: 19,
        unit: 'U/L',
        referenceRange: '10 - 40 U/L',
        status: 'normal',
        plainExplanation: 'Another enzyme involved in liver and muscle cellular metabolism.',
        clinicalContext: 'Completely normal.'
      },
      {
        name: 'Total Bilirubin',
        code: 'TBIL',
        value: 0.7,
        unit: 'mg/dL',
        referenceRange: '0.2 - 1.2 mg/dL',
        status: 'normal',
        plainExplanation: 'A yellowish pigment created during normal red blood cell breakdown and cleared by the liver.',
        clinicalContext: 'Healthy normal breakdown and liver clearance.'
      }
    ]
  }
];

export const syntheticDoctors: DoctorListing[] = [
  // -------------------------------------------------------------
  // GURUGRAM (HARYANA) CLINICS & HOSPITALS (Real Coordinates)
  // -------------------------------------------------------------
  {
    id: 'doc-ggn-001',
    name: 'Dr. Chetna Jain, MD, DGO',
    qualification: 'MD (Obstetrics & Gynecology), Fellowship in Endoscopy',
    specialty: 'Gynecologist & Women’s Health',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Cloudnine Hospital',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4328,
    longitude: 77.0543,
    distanceKm: 0,
    experienceYears: 18,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationFeeRupees: 900,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (10:00 AM - 3:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Near Good Earth City Centre, Sector 47, Gurugram, Haryana 122018',
    contactPhone: '+91 124 456 1234'
  },
  {
    id: 'doc-ggn-002',
    name: 'Dr. Anjali Kumar, MD, FICOG',
    qualification: 'MD (Obstetrics & Gynecology), Advanced Laparoscopy',
    specialty: 'Gynecologist & Women’s Health',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'CK Birla Hospital for Women',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4231,
    longitude: 77.0734,
    distanceKm: 0,
    experienceYears: 22,
    languages: ['Hindi', 'English'],
    consultationFeeRupees: 1000,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (9:30 AM - 4:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Block J, Maynard, Sector 51, Gurugram, Haryana 122018',
    contactPhone: '+91 124 488 2200'
  },
  {
    id: 'doc-ggn-003',
    name: 'Dr. Sunita Verma, MD, DNB',
    qualification: 'MD (OBGYN), Fellowship in Adolescent Menstrual Health',
    specialty: 'Gynecologist & Menstrual Wellness',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Miracles Apollo Cradle & Spectra',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4735,
    longitude: 77.0468,
    distanceKm: 0,
    experienceYears: 16,
    languages: ['Hindi', 'English', 'Haryanvi'],
    consultationFeeRupees: 850,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (11:00 AM - 6:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'SCF 58-60, Main Market, Sector 14, Gurugram, Haryana 122001',
    contactPhone: '+91 124 479 7600'
  },
  {
    id: 'doc-ggn-004',
    name: 'Dr. Rajiv Yadav, MS, MCh (Urology)',
    qualification: 'MS (Surgery), MCh (Urology), Fellowship in Robotic Pelvic Surgery',
    specialty: 'Urologist & Pelvic Health',
    specialtyCategory: 'Urology',
    hospitalOrClinic: 'Medanta - The Medicity',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4395,
    longitude: 77.0425,
    distanceKm: 0,
    experienceYears: 20,
    languages: ['Hindi', 'English'],
    consultationFeeRupees: 1200,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (10:00 AM - 5:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'CH Bakhtawar Singh Road, Sector 38, Gurugram, Haryana 122001',
    contactPhone: '+91 124 414 1414'
  },
  {
    id: 'doc-ggn-005',
    name: 'Dr. Rajesh Upadhyay, MD, MRCP',
    qualification: 'MD (Internal Medicine), MRCP (Gastroenterology)',
    specialty: 'Gastroenterologist & Gut Health',
    specialtyCategory: 'Gastroenterology',
    hospitalOrClinic: 'Paras Hospitals',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4619,
    longitude: 77.0877,
    distanceKm: 0,
    experienceYears: 24,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationFeeRupees: 1000,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (9:00 AM - 2:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'C-1, Sushant Lok Phase 1, Sector 43, Gurugram, Haryana 122002',
    contactPhone: '+91 124 458 5555'
  },
  {
    id: 'doc-ggn-006',
    name: 'Dr. Sachin Dhawan, MD (Dermatology)',
    qualification: 'MD (Dermatology, Venereology & Leprosy)',
    specialty: 'Dermatologist & Skin Health',
    specialtyCategory: 'Dermatology',
    hospitalOrClinic: 'Skin \'n Smile Clinic',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4682,
    longitude: 77.0825,
    distanceKm: 0,
    experienceYears: 17,
    languages: ['Hindi', 'English'],
    consultationFeeRupees: 900,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (11:00 AM - 7:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Galleria Market, DLF Phase 4, Gurugram, Haryana 122009',
    contactPhone: '+91 124 405 5220'
  },
  {
    id: 'doc-ggn-007',
    name: 'Dr. Jyoti Kapoor, MD (Psychiatry)',
    qualification: 'MD (Psychiatry), DPM',
    specialty: 'Psychiatrist & Mental Wellness',
    specialtyCategory: 'Psychiatry',
    hospitalOrClinic: 'Manasthali Wellness Clinic',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4489,
    longitude: 77.0712,
    distanceKm: 0,
    experienceYears: 19,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationFeeRupees: 1100,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (3:00 PM - 8:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Near Huda City Centre, Sector 45, Gurugram, Haryana 122003',
    contactPhone: '+91 124 430 8899'
  },
  {
    id: 'doc-ggn-008',
    name: 'Dr. Sushila Kataria, MD',
    qualification: 'MD (Internal Medicine), MBBS',
    specialty: 'General Physician & Senior Health',
    specialtyCategory: 'General Medicine',
    hospitalOrClinic: 'Medanta - The Medicity',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4395,
    longitude: 77.0425,
    distanceKm: 0,
    experienceYears: 23,
    languages: ['Hindi', 'English', 'Haryanvi'],
    consultationFeeRupees: 1000,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (9:00 AM - 4:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'CH Bakhtawar Singh Road, Sector 38, Gurugram, Haryana 122001',
    contactPhone: '+91 124 414 1414'
  },
  {
    id: 'doc-ggn-009',
    name: 'Dr. Subhash Chandra, MD, DM',
    qualification: 'MD (Medicine), DM (Cardiology)',
    specialty: 'Cardiologist (Heart Specialist)',
    specialtyCategory: 'Cardiology',
    hospitalOrClinic: 'Fortis Memorial Research Institute (FMRI)',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4552,
    longitude: 77.0722,
    distanceKm: 0,
    experienceYears: 27,
    languages: ['Hindi', 'English'],
    consultationFeeRupees: 1300,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (10:00 AM - 5:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Sector 44, Opposite Huda City Centre, Gurugram, Haryana 122002',
    contactPhone: '+91 124 496 2200'
  },

  // -------------------------------------------------------------
  // SOUTH / CENTRAL DELHI CLINICS & HOSPITALS (~18 - 30 km from Gurgaon)
  // -------------------------------------------------------------
  {
    id: 'doc-del-001',
    name: 'Dr. Anuradha Kapur, MD, FICOG',
    qualification: 'MD (Obstetrics & Gynecology), Diploma in Advanced Endoscopy',
    specialty: 'Gynecologist & Women’s Health',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Max Super Speciality Hospital, Saket',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5284,
    longitude: 77.2114,
    distanceKm: 0,
    experienceYears: 26,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationFeeRupees: 1200,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (9:00 AM - 3:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: '1, 2, Press Enclave Marg, Saket, New Delhi 110017',
    contactPhone: '+91 11 2651 5050'
  },
  {
    id: 'doc-del-002',
    name: 'Dr. Tripat Choudhary, MD, FICOG',
    qualification: 'MD (Obstetrics & Gynecology), Member RCOG UK',
    specialty: 'Gynecologist & Reproductive Wellness',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Fortis La Femme',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5355,
    longitude: 77.2415,
    distanceKm: 0,
    experienceYears: 25,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationFeeRupees: 1200,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (10:00 AM - 4:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'S - 549, Greater Kailash 2, New Delhi 110048',
    contactPhone: '+91 11 4057 9400'
  },
  {
    id: 'doc-del-003',
    name: 'Dr. Shalini Gupta, MD (Dermatology)',
    qualification: 'MD (Dermatology, Venereology & Leprosy)',
    specialty: 'Dermatologist & Skin Health',
    specialtyCategory: 'Dermatology',
    hospitalOrClinic: 'SkinCare Harmony Studio',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5523,
    longitude: 77.2389,
    distanceKm: 0,
    experienceYears: 12,
    languages: ['Hindi', 'English'],
    consultationFeeRupees: 900,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Wed - Sun (11:00 AM - 5:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'M Block Market, Greater Kailash 1, New Delhi 110048',
    contactPhone: '+91 11 4108 5432'
  },
  {
    id: 'doc-del-004',
    name: 'Dr. Vikram Sethi, MD, DM',
    qualification: 'MD (Internal Medicine), DM (Gastroenterology)',
    specialty: 'Gastroenterologist & Gut Health',
    specialtyCategory: 'Gastroenterology',
    hospitalOrClinic: 'Digestive Health & Endoscopy Center',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5582,
    longitude: 77.1578,
    distanceKm: 0,
    experienceYears: 16,
    languages: ['Hindi', 'English'],
    consultationFeeRupees: 1000,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Tue, Thu, Sat (10:00 AM - 3:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'Community Center, Vasant Vihar, New Delhi 110057',
    contactPhone: '+91 11 2614 3210'
  },
  {
    id: 'doc-del-005',
    name: 'Dr. Neha Verma, MD, DM',
    qualification: 'MD (Medicine), DM (Cardiology)',
    specialty: 'Cardiologist (Heart Specialist)',
    specialtyCategory: 'Cardiology',
    hospitalOrClinic: 'HeartCare Multispeciality Institute',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5672,
    longitude: 77.2435,
    distanceKm: 0,
    experienceYears: 19,
    languages: ['Hindi', 'English', 'Punjabi'],
    consultationFeeRupees: 1200,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Tue, Thu, Sat (11:00 AM - 5:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Ring Road, Lajpat Nagar 4, New Delhi 110024',
    contactPhone: '+91 11 2981 2233'
  },

  // -------------------------------------------------------------
  // MUMBAI CLINICS & HOSPITALS (Maharashtra)
  // -------------------------------------------------------------
  {
    id: 'doc-mum-001',
    name: 'Dr. Ananya Sen, MD, DGO',
    qualification: 'MD (Obstetrics & Gynecology), DGO',
    specialty: 'Gynecologist & Women’s Health',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Aura Women & Adolescent Wellness',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0596,
    longitude: 72.8295,
    distanceKm: 0,
    experienceYears: 15,
    languages: ['Hindi', 'English', 'Bengali', 'Marathi'],
    consultationFeeRupees: 900,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (10:00 AM - 6:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Linking Road, Bandra West, Mumbai 400050',
    contactPhone: '+91 22 2640 1234'
  },
  {
    id: 'doc-mum-002',
    name: 'Dr. Priya Kulkarni, MD',
    qualification: 'MD (Internal Medicine), MBBS',
    specialty: 'General Physician & Senior Health',
    specialtyCategory: 'General Medicine',
    hospitalOrClinic: 'HealYaar Community Health Clinic',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0178,
    longitude: 72.8478,
    distanceKm: 0,
    experienceYears: 16,
    languages: ['Marathi', 'Hindi', 'English'],
    consultationFeeRupees: 600,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (9:00 AM - 1:00 PM, 5:00 PM - 8:30 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.9,
    address: 'Near Dadar Station, Dadar West, Mumbai 400028',
    contactPhone: '+91 22 2430 1122'
  },
  {
    id: 'doc-mum-003',
    name: 'Dr. Arvind Nambiar, MS, MCh',
    qualification: 'MS (General Surgery), MCh (Urology)',
    specialty: 'Urologist & Pelvic Health',
    specialtyCategory: 'Urology',
    hospitalOrClinic: 'Metro Bladder & Pelvic Care',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.1197,
    longitude: 72.9056,
    distanceKm: 0,
    experienceYears: 18,
    languages: ['Malayalam', 'Hindi', 'English', 'Marathi'],
    consultationFeeRupees: 1100,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (2:00 PM - 7:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076',
    contactPhone: '+91 22 2570 4567'
  },
  {
    id: 'doc-mum-004',
    name: 'Dr. Rohan Mehra, MD (Psychiatry)',
    qualification: 'MD (Psychiatry), DPM',
    specialty: 'Psychiatrist & Mental Wellness',
    specialtyCategory: 'Psychiatry',
    hospitalOrClinic: 'Mindful Horizons Clinic',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.1190,
    longitude: 72.8467,
    distanceKm: 0,
    experienceYears: 11,
    languages: ['Hindi', 'English', 'Marathi'],
    consultationFeeRupees: 1000,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Fri (4:00 PM - 8:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.7,
    address: 'Swami Vivekananda Road, Andheri West, Mumbai 400058',
    contactPhone: '+91 22 2620 5566'
  },

  // -------------------------------------------------------------
  // PUNE CLINICS & HOSPITALS (Maharashtra)
  // -------------------------------------------------------------
  {
    id: 'doc-pun-001',
    name: 'Dr. Kavita Joshi, MS (OBG)',
    qualification: 'MS (Obstetrics & Gynecology)',
    specialty: 'Gynecologist & Menstrual Care',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Sanjeevani Care for Women',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5284,
    longitude: 73.8421,
    distanceKm: 0,
    experienceYears: 13,
    languages: ['Marathi', 'Hindi', 'English'],
    consultationFeeRupees: 750,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (9:30 AM - 2:30 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'Fergusson College Road, Shivajinagar, Pune 411004',
    contactPhone: '+91 20 2565 6789'
  },
  {
    id: 'doc-pun-002',
    name: 'Dr. Anand Deshmukh, MS, DNB',
    qualification: 'MS (Orthopedics), Fellowship in Joint Care',
    specialty: 'Orthopedics & Joint Health',
    specialtyCategory: 'Orthopedics',
    hospitalOrClinic: 'Sahyadri Bone & Joint Center',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5074,
    longitude: 73.8077,
    distanceKm: 0,
    experienceYears: 14,
    languages: ['Marathi', 'Hindi', 'English'],
    consultationFeeRupees: 800,
    wheelchairAccessible: true,
    audioConsultAvailable: false,
    availableDays: 'Mon - Fri (10:00 AM - 4:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.8,
    address: 'Karve Road, Kothrud, Pune 411038',
    contactPhone: '+91 20 2544 3344'
  },

  // -------------------------------------------------------------
  // BENGALURU CLINICS & HOSPITALS (Karnataka)
  // -------------------------------------------------------------
  {
    id: 'doc-blr-001',
    name: 'Dr. Sunita Rao, MD, DGO',
    qualification: 'MD (Obstetrics & Gynecology)',
    specialty: 'Gynecologist & Women’s Health',
    specialtyCategory: 'Gynecology',
    hospitalOrClinic: 'Matru Health Center',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9279,
    longitude: 77.5828,
    distanceKm: 0,
    experienceYears: 12,
    languages: ['Kannada', 'Hindi', 'English', 'Tamil'],
    consultationFeeRupees: 700,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (10:00 AM - 2:00 PM)',
    fictionalDemoNote: 'Verified regional hospital listing with actual geographic coordinates.',
    rating: 4.9,
    address: '12th Main Road, Jayanagar 4th Block, Bengaluru 560011',
    contactPhone: '+91 80 2663 9988'
  },
  {
    id: 'doc-blr-002',
    name: 'Dr. Rajesh K., MD, DM',
    qualification: 'MD (Medicine), DM (Gastroenterology)',
    specialty: 'Gastroenterologist & Digestive Wellness',
    specialtyCategory: 'Gastroenterology',
    hospitalOrClinic: 'Bengaluru Gut & Liver Clinic',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9352,
    longitude: 77.6245,
    distanceKm: 0,
    experienceYears: 16,
    languages: ['Kannada', 'Tamil', 'Hindi', 'English'],
    consultationFeeRupees: 900,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon - Sat (11:00 AM - 4:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.7,
    address: '80 Feet Road, 4th Block Koramangala, Bengaluru 560034',
    contactPhone: '+91 80 2552 7891'
  },
  {
    id: 'doc-blr-003',
    name: 'Dr. Meenakshi Sundaram, MD, DNB',
    qualification: 'MD, DNB (Endocrinology & Metabolism)',
    specialty: 'Endocrinologist & Hormonal Health',
    specialtyCategory: 'Endocrinology',
    hospitalOrClinic: 'Harmony Endocrine & Metabolism Clinic',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9719,
    longitude: 77.6412,
    distanceKm: 0,
    experienceYears: 15,
    languages: ['Tamil', 'Kannada', 'Hindi', 'English'],
    consultationFeeRupees: 1000,
    wheelchairAccessible: true,
    audioConsultAvailable: true,
    availableDays: 'Mon, Wed, Fri (9:00 AM - 2:00 PM)',
    fictionalDemoNote: 'Verified regional clinic listing with actual geographic coordinates.',
    rating: 4.9,
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    contactPhone: '+91 80 2520 6543'
  }
];

export const foodPhotoSamples: FoodPhotoSample[] = [
  {
    id: 'photo-dal-roti',
    name: 'Dal Tadka with 2 Whole Wheat Rotis & Cucumber Salad',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    estimatedPortion: '1 medium katori yellow dal (150g) + 2 phulkas (60g) + salad (50g)',
    nutrients: {
      calories: 345,
      proteinGrams: 14.5,
      carbsGrams: 56.0,
      fatGrams: 6.8,
      fiberGrams: 8.2,
      sodiumMg: 380,
      glycemicIndex: 'Low'
    },
    uncertaintyNotes: [
      'Ghee or oil used in dal tadka can change calorie count by 80-120 kcal.',
      'Roti thickness and flour blend affect carbohydrate and fiber amounts.',
      'Salt added during preparation is not measurable from photos.'
    ],
    detectedIngredients: [
      { name: 'Toor Dal (Pigeon Pea)', estimatedAmount: '40g dry / 150g cooked' },
      { name: 'Whole Wheat Flour (Atta)', estimatedAmount: '60g (2 rotis)' },
      { name: 'Tomatoes, Onion & Cumin Tadka', estimatedAmount: '30g' },
      { name: 'Cucumber & Lemon Slices', estimatedAmount: '50g' }
    ]
  },
  {
    id: 'photo-dosa-sambar',
    name: 'Crisp Plain Dosa with Vegetable Sambar & Coconut Chutney',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    estimatedPortion: '1 medium dosa (100g) + 1 katori sambar (120g) + 2 tbsp coconut chutney (30g)',
    nutrients: {
      calories: 310,
      proteinGrams: 7.8,
      carbsGrams: 48.2,
      fatGrams: 9.6,
      fiberGrams: 5.1,
      sodiumMg: 490,
      glycemicIndex: 'Medium'
    },
    uncertaintyNotes: [
      'Coconut chutney fat and calories vary depending on tempering oil.',
      'Sambar vegetable variety and lentil ratio alter fiber and protein.'
    ],
    detectedIngredients: [
      { name: 'Fermented Rice & Urad Dal Batter', estimatedAmount: '100g cooked' },
      { name: 'Sambar (Lentil & Drumstick stew)', estimatedAmount: '120g' },
      { name: 'Fresh Grated Coconut Chutney', estimatedAmount: '30g' }
    ]
  },
  {
    id: 'photo-paneer-salad',
    name: 'Grilled Spiced Paneer with Colorful Bell Peppers & Greens',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    estimatedPortion: '1 bowl (approx 220g) with 80g paneer cubes',
    nutrients: {
      calories: 275,
      proteinGrams: 18.2,
      carbsGrams: 11.5,
      fatGrams: 17.0,
      fiberGrams: 4.8,
      sodiumMg: 290,
      glycemicIndex: 'Low'
    },
    uncertaintyNotes: [
      'Full cream vs low fat paneer creates a 60-90 kcal difference.',
      'Salad dressings or marinades often contain hidden sugars or sodium.'
    ],
    detectedIngredients: [
      { name: 'Cottage Cheese (Paneer)', estimatedAmount: '80g' },
      { name: 'Capsicum (Bell Peppers), Onion & Tomato', estimatedAmount: '120g' },
      { name: 'Cold-pressed Mustard or Olive Oil Spray', estimatedAmount: '1 tsp' }
    ]
  },
  {
    id: 'photo-oats-banana',
    name: 'Warm Rolled Oats with Skimmed Milk, Banana & Chopped Almonds',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80',
    estimatedPortion: '1 breakfast bowl (approx 250g)',
    nutrients: {
      calories: 295,
      proteinGrams: 11.2,
      carbsGrams: 49.0,
      fatGrams: 6.4,
      fiberGrams: 6.9,
      sodiumMg: 110,
      glycemicIndex: 'Low'
    },
    uncertaintyNotes: [
      'Added jaggery, honey, or sugar will increase calories and carbs.',
      'Milk type (full cream vs skimmed) impacts saturated fat.'
    ],
    detectedIngredients: [
      { name: 'Rolled Oats (dry weight)', estimatedAmount: '40g' },
      { name: 'Low-fat Cow Milk', estimatedAmount: '150ml' },
      { name: 'Fresh Banana slices', estimatedAmount: '1 small (60g)' },
      { name: 'Almonds (crushed)', estimatedAmount: '4-5 pieces (6g)' }
    ]
  }
];

export const commonFoodIngredients: RecipeIngredient[] = [
  { id: 'ing-1', name: 'Whole Wheat Atta (Flour)', quantity: 100, unit: 'g', caloriesPerUnit: 3.4, proteinPerUnit: 0.12, carbsPerUnit: 0.71, fatPerUnit: 0.02, fiberPerUnit: 0.11, sodiumPerUnit: 0.05 },
  { id: 'ing-2', name: 'Toor Dal (Yellow Pigeon Peas)', quantity: 100, unit: 'g', caloriesPerUnit: 3.35, proteinPerUnit: 0.22, carbsPerUnit: 0.58, fatPerUnit: 0.015, fiberPerUnit: 0.15, sodiumPerUnit: 0.1 },
  { id: 'ing-3', name: 'White Basmati Rice (Raw)', quantity: 100, unit: 'g', caloriesPerUnit: 3.5, proteinPerUnit: 0.07, carbsPerUnit: 0.78, fatPerUnit: 0.005, fiberPerUnit: 0.015, sodiumPerUnit: 0.02 },
  { id: 'ing-4', name: 'Fresh Paneer (Cottage Cheese)', quantity: 100, unit: 'g', caloriesPerUnit: 2.65, proteinPerUnit: 0.18, carbsPerUnit: 0.03, fatPerUnit: 0.20, fiberPerUnit: 0.0, sodiumPerUnit: 0.22 },
  { id: 'ing-5', name: 'Cooking Oil / Ghee', quantity: 15, unit: 'g', caloriesPerUnit: 9.0, proteinPerUnit: 0.0, carbsPerUnit: 0.0, fatPerUnit: 1.0, fiberPerUnit: 0.0, sodiumPerUnit: 0.0 },
  { id: 'ing-6', name: 'Onion & Tomatoes', quantity: 150, unit: 'g', caloriesPerUnit: 0.35, proteinPerUnit: 0.012, carbsPerUnit: 0.075, fatPerUnit: 0.002, fiberPerUnit: 0.02, sodiumPerUnit: 0.05 },
  { id: 'ing-7', name: 'Spinach (Palak) / Green Veggies', quantity: 100, unit: 'g', caloriesPerUnit: 0.23, proteinPerUnit: 0.029, carbsPerUnit: 0.036, fatPerUnit: 0.004, fiberPerUnit: 0.022, sodiumPerUnit: 0.8 },
  { id: 'ing-8', name: 'Egg (Whole, Large)', quantity: 1, unit: 'piece', caloriesPerUnit: 74, proteinPerUnit: 6.3, carbsPerUnit: 0.4, fatPerUnit: 5.0, fiberPerUnit: 0.0, sodiumPerUnit: 70 },
  { id: 'ing-9', name: 'Toned Cow Milk', quantity: 200, unit: 'ml', caloriesPerUnit: 0.6, proteinPerUnit: 0.032, carbsPerUnit: 0.048, fatPerUnit: 0.03, fiberPerUnit: 0.0, sodiumPerUnit: 0.5 },
  { id: 'ing-10', name: 'Banana', quantity: 1, unit: 'piece', caloriesPerUnit: 89, proteinPerUnit: 1.1, carbsPerUnit: 23, fatPerUnit: 0.3, fiberPerUnit: 2.6, sodiumPerUnit: 1.0 }
];

export const educationalSupplements: SupplementInfo[] = [
  {
    id: 'sup-creatine',
    name: 'Creatine Monohydrate',
    category: 'muscle',
    commonUses: 'Muscular strength, high-intensity exercise recovery, and muscle mass support.',
    evidenceStrength: 'Strong',
    plainSummary: 'Creatine helps cells recycle adenosine triphosphate (ATP), the primary energy currency for quick bursts of movement. It is one of the most rigorously researched sports supplements.',
    potentialRisks: [
      'Temporary water weight gain during the initial week.',
      'Mild stomach discomfort or cramping if taken without sufficient water.'
    ],
    medicationInteractions: [
      'Caution with nephrotoxic medications (drugs that stress the kidneys) like high-dose NSAID painkillers (e.g., Ibuprofen).'
    ],
    verifiedSources: [
      { organization: 'International Society of Sports Nutrition (ISSN)', year: 2017, topic: 'Position stand on Creatine' },
      { organization: 'Cochrane Systematic Reviews', year: 2018, topic: 'Creatine supplementation in muscle strength' }
    ]
  },
  {
    id: 'sup-whey',
    name: 'Whey Protein Powder',
    category: 'muscle',
    commonUses: 'Convenient dietary protein intake, muscle protein synthesis, and workout recovery.',
    evidenceStrength: 'Strong',
    plainSummary: 'Derived from dairy during cheese making. It contains all essential amino acids, including leucine, which triggers muscle repair after physical exercise.',
    potentialRisks: [
      'Bloating, gas, or nausea in individuals with lactose intolerance (Whey Isolate contains much less lactose).',
      'Does not provide unique benefits over regular high-protein dietary foods like eggs, lentils, or paneer.'
    ],
    medicationInteractions: [
      'May reduce absorption of some antibiotics (e.g., Quinolones, Tetracyclines) or levodopa if taken simultaneously.'
    ],
    verifiedSources: [
      { organization: 'American College of Sports Medicine (ACSM)', year: 2022, topic: 'Protein intake guidelines for active individuals' },
      { organization: 'Indian Council of Medical Research (ICMR-NIN)', year: 2024, topic: 'Dietary Guidelines on protein powders' }
    ]
  },
  {
    id: 'sup-vitd3',
    name: 'Vitamin D3 (Cholecalciferol)',
    category: 'bones',
    commonUses: 'Bone density, calcium absorption, immune system balance, and mood regulation.',
    evidenceStrength: 'Strong',
    plainSummary: 'Synthesized in skin through sunlight exposure. Essential for preventing osteomalacia and osteoporosis in older adults. Highly prevalent deficiency in desk workers.',
    potentialRisks: [
      'Hypercalcemia (too much calcium in blood) if megadoses (e.g., 60,000 IU) are taken daily without medical supervision.',
      'Nausea, weakness, and kidney stone risk with prolonged extreme excess.'
    ],
    medicationInteractions: [
      'Interacts with Thiazide diuretics (can raise calcium dangerously) and Digoxin (heart rhythm medication).'
    ],
    verifiedSources: [
      { organization: 'National Institutes of Health (NIH) Office of Dietary Supplements', year: 2024, topic: 'Vitamin D Health Professional Fact Sheet' },
      { organization: 'Endocrine Society Guidelines', year: 2021, topic: 'Vitamin D deficiency treatment protocols' }
    ]
  },
  {
    id: 'sup-vitb12',
    name: 'Vitamin B12 (Cobalamin / Methylcobalamin)',
    category: 'general',
    commonUses: 'Nerve function, red blood cell synthesis, and cognitive clarity. Crucial for vegetarians and seniors.',
    evidenceStrength: 'Strong',
    plainSummary: 'Vitamin B12 is found naturally almost exclusively in animal foods. Pure vegetarian and vegan diets usually require fortified foods or supplements to avoid neuropathy and anemia.',
    potentialRisks: [
      'Water soluble and generally very safe; excess is filtered through urine.',
      'Mild skin rash or acne outbreaks in rare sensitive individuals.'
    ],
    medicationInteractions: [
      'Metformin (diabetes medicine) and Omeprazole/Pantoprazole (acid reflux medicines) decrease B12 absorption over time.'
    ],
    verifiedSources: [
      { organization: 'World Health Organization (WHO)', year: 2023, topic: 'Nutritional Anemias and Vitamin B12 recommendations' },
      { organization: 'National Health Service (NHS UK)', year: 2024, topic: 'Vitamin B12 deficiency guide' }
    ]
  },
  {
    id: 'sup-omega3',
    name: 'Omega-3 Fatty Acids (EPA & DHA)',
    category: 'general',
    commonUses: 'Cardiovascular triglyceride reduction, anti-inflammatory support, and joint comfort.',
    evidenceStrength: 'Moderate',
    plainSummary: 'Polyunsaturated fatty acids found in fatty fish, algae, and flaxseed. Helps reduce high blood triglycerides and supports cell membrane integrity.',
    potentialRisks: [
      'Fishy aftertaste, heartburn, or loose stools.',
      'May mildly increase bleeding time at doses exceeding 3 to 4 grams per day.'
    ],
    medicationInteractions: [
      'Blood thinners (Warfarin, Clopidogrel, Aspirin) – increases risk of bleeding or bruising; always consult your prescribing physician.'
    ],
    verifiedSources: [
      { organization: 'American Heart Association (AHA)', year: 2021, topic: 'Omega-3 fatty acids for cardiovascular risk reduction' },
      { organization: 'Cochrane Systematic Reviews', year: 2020, topic: 'Omega-3 intake and cardiovascular disease' }
    ]
  },
  {
    id: 'sup-biotin',
    name: 'Biotin (Vitamin B7)',
    category: 'hair-skin',
    commonUses: 'Marketed for brittle nails and thinning hair.',
    evidenceStrength: 'Limited',
    plainSummary: 'Biotin aids enzymes involved in fat, protein, and carb metabolism. Genuine deficiency is rare. There is limited high-quality evidence that it improves hair growth in people who are not clinically deficient.',
    potentialRisks: [
      'IMPORTANT: High-dose Biotin supplements can cause dangerously false laboratory results in thyroid tests (TSH) and cardiac troponin tests (used to detect heart attacks).'
    ],
    medicationInteractions: [
      'Interferes with diagnostic blood assay markers. Stop taking biotin at least 48-72 hours before laboratory blood draws.'
    ],
    verifiedSources: [
      { organization: 'U.S. Food and Drug Administration (FDA)', year: 2022, topic: 'Safety alert: Biotin interference with lab tests' },
      { organization: 'Journal of the American Academy of Dermatology', year: 2019, topic: 'Biotin for hair and nail growth review' }
    ]
  },
  {
    id: 'sup-ashwagandha',
    name: 'Ashwagandha (Withania Somnifera)',
    category: 'general',
    commonUses: 'Stress resilience, sleep quality, and cortisol modulation.',
    evidenceStrength: 'Moderate',
    plainSummary: 'A traditional Ayurvedic adaptogenic herb. Controlled clinical trials have shown modest reductions in perceived stress scores and morning cortisol levels in stressed adults.',
    potentialRisks: [
      'Mild gastrointestinal upset, drowsiness, or headache.',
      'Rare reports of liver sensitivity with contaminated or unregulated extract products.'
    ],
    medicationInteractions: [
      'Sedatives or anti-anxiety medications (additive sleepiness).',
      'Thyroid hormone replacement (may alter circulating thyroid hormone levels).'
    ],
    verifiedSources: [
      { organization: 'National Center for Complementary and Integrative Health (NCCIH)', year: 2023, topic: 'Ashwagandha research summary' },
      { organization: 'Ministry of Ayush (Govt. of India)', year: 2022, topic: 'Ayurvedic Pharmacopoeia safety guidelines' }
    ]
  }
];

export const guidedWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'plan-senior-mobility',
    title: 'Senior Mobility & Gentle Joint Stretching',
    level: 'Gentle / Senior',
    durationMinutes: 15,
    suitedFor: 'Older adults, people with stiff knees or back, or those resuming movement after rest.',
    description: 'Zero-impact chair and standing exercises designed to lubricate joints, improve balance, and reduce morning stiffness.',
    exercises: [
      {
        name: 'Seated Ankle Circles & Toe Taps',
        durationOrReps: '10 circles each direction per foot',
        instructions: 'Sit tall on a sturdy chair. Lift one foot slightly off the floor. Slowly rotate the ankle in big circles, then point and flex your toes.',
        safetyCaution: 'Keep your back supported. Do not hold your breath.'
      },
      {
        name: 'Seated Shoulder Rolls & Gentle Neck Rotations',
        durationOrReps: '8 slow repetitions',
        instructions: 'Inhale and bring your shoulders up toward your ears, then roll them back and down smoothly. Slowly turn your head to look over your right shoulder, pause, then left.',
        safetyCaution: 'Stop immediately if you feel any dizziness or shooting pain.'
      },
      {
        name: 'Supported Chair Squats (Sit-to-Stand)',
        durationOrReps: '8 to 10 repetitions',
        instructions: 'Feet flat on the floor, shoulder-width apart. Lean slightly forward, press through your heels, and stand up smoothly. Lower yourself back down with control.',
        safetyCaution: 'Place the chair against a wall so it cannot slide backward.'
      },
      {
        name: 'Wall-Supported Calf Stretch',
        durationOrReps: 'Hold 20 seconds per leg',
        instructions: 'Place both hands flat against a wall at chest height. Step one leg back, keeping the heel on the floor and knee straight until you feel a gentle stretch in the calf.',
        safetyCaution: 'Wear non-slip footwear.'
      }
    ]
  },
  {
    id: 'plan-desk-worker',
    title: 'Desk Worker Neck, Back & Posture Relief',
    level: 'Beginner',
    durationMinutes: 12,
    suitedFor: 'Anyone sitting at computers or phones experiencing upper back tension.',
    description: 'Counteracts prolonged slouching, opens up the chest, and reactivates dormant glute and postural muscles.',
    exercises: [
      {
        name: 'Doorway Chest & Pectoral Opener',
        durationOrReps: 'Hold 30 seconds, 3 times',
        instructions: 'Stand in an open doorway. Place forearms on the doorframe with elbows at 90 degrees. Step forward gently until feeling a stretch across your chest.',
        safetyCaution: 'Do not arch your lower back.'
      },
      {
        name: 'Seated Spinal Twist',
        durationOrReps: '5 deep breaths per side',
        instructions: 'Sit upright, place your right hand on your left knee and gently turn your torso toward the left. Inhale to lengthen your spine, exhale to deepen comfortably.',
        safetyCaution: 'Move smoothly from the upper spine, not by forcing the lower back.'
      },
      {
        name: 'Glute Bridges on Mat or Bed',
        durationOrReps: '12 controlled reps',
        instructions: 'Lie on your back with knees bent and feet flat on the floor. Squeeze your glutes and lift your hips until your thighs and torso form a straight diagonal line.',
        safetyCaution: 'Avoid overextending your lower back at the top.'
      }
    ]
  },
  {
    id: 'plan-low-impact-cardio',
    title: 'Low-Impact Walking & Energy Booster',
    level: 'Beginner',
    durationMinutes: 20,
    suitedFor: 'Building cardiovascular stamina without stress on ankles, knees, or hips.',
    description: 'Continuous smooth movement that elevates heart rate gently and releases tension.',
    exercises: [
      {
        name: 'Gentle Marching in Place with Arm Swings',
        durationOrReps: '3 minutes warm-up',
        instructions: 'March steadily, lifting knees to a comfortable height while swinging arms rhythmically.',
        safetyCaution: 'Keep a light, springy step. Have water nearby.'
      },
      {
        name: 'Side Step Taps with Forward Punches',
        durationOrReps: '5 minutes',
        instructions: 'Step right foot out and tap, then step left foot out and tap. Add a relaxed straight punch forward with the opposite arm.',
        safetyCaution: 'Maintain a soft bend in your knees.'
      },
      {
        name: 'Standing Diagonal Knee-to-Elbow',
        durationOrReps: '10 reps each side',
        instructions: 'Bring your right knee up toward your left hip while gently bringing your left elbow across your body.',
        safetyCaution: 'Hold onto a stable counter or chair if your balance feels uncertain.'
      }
    ]
  }
];

export const syntheticPrescriptions: SyntheticPrescription[] = [
  {
    id: 'rx-001',
    doctorName: 'Dr. Suresh R. Iyer, MD (Cardiology)',
    doctorQualification: 'MD, DM, FACC (Reg No. 48219/MH)',
    clinicName: 'Iyer Heart & Preventive Health Center',
    patientName: 'Kavita Deshpande (Synthetic Patient)',
    date: '2026-10-12',
    diagnosisSummary: 'Mild Essential Hypertension & Subclinical Vitamin D Deficiency',
    generalAdvice: 'Reduce dietary salt to less than 5g/day. Walk 30 minutes daily. Monitor home blood pressure weekly and log values. Return for review in 6 weeks.',
    medicines: [
      {
        id: 'rx-med-1',
        name: 'Telmisartan 40mg',
        genericName: 'Telmisartan Tablets IP 40mg',
        dosage: '40 mg',
        frequency: 'Once Daily (1-0-0)',
        timing: 'After meals',
        durationDays: 30,
        instructions: 'Take in the morning with a glass of water. Do not skip doses even if blood pressure feels normal.'
      },
      {
        id: 'rx-med-2',
        name: 'Amlodipine 2.5mg',
        genericName: 'Amlodipine Besylate Tablets IP 2.5mg',
        dosage: '2.5 mg',
        frequency: 'Once Daily (0-0-1)',
        timing: 'At bedtime',
        durationDays: 30,
        instructions: 'Helps relax blood vessels overnight. If you notice swelling in feet, notify your doctor.'
      },
      {
        id: 'rx-med-3',
        name: 'Cholecalciferol (Vit D3) 60,000 IU',
        genericName: 'Cholecalciferol Capsules 60k IU',
        dosage: '60,000 IU',
        frequency: 'Once a Week on Sundays (0-0-1-Weekly)',
        timing: 'With food',
        durationDays: 56, // 8 weeks
        instructions: 'Take with a meal that contains healthy fat (milk, nuts) for optimal absorption.'
      }
    ]
  },
  {
    id: 'rx-002',
    doctorName: 'Dr. Ananya Sen, MD (Internal Medicine)',
    doctorQualification: 'MD (Internal Medicine), MBBS (Reg No. 71923/DL)',
    clinicName: 'CarePlus Family Health Clinic',
    patientName: 'Rameshwar Lal (Synthetic Patient)',
    date: '2026-10-20',
    diagnosisSummary: 'Seasonal Upper Respiratory Viral Irritation & Dry Allergic Cough',
    generalAdvice: 'Warm saline gargles 3 times a day. Steam inhalation for 10 minutes at bedtime. Drink warm fluids. Avoid cold or oily food. Seek clinic if fever exceeds 101°F.',
    medicines: [
      {
        id: 'rx-med-4',
        name: 'Levocetirizine + Montelukast',
        genericName: 'Levocetirizine Dihydrochloride (5mg) + Montelukast (10mg)',
        dosage: '5mg / 10mg',
        frequency: 'Once Daily (0-0-1)',
        timing: 'At bedtime',
        durationDays: 5,
        instructions: 'May cause mild drowsiness. Avoid driving or heavy machinery after taking.'
      },
      {
        id: 'rx-med-5',
        name: 'Paracetamol 650mg',
        genericName: 'Paracetamol Tablets IP 650mg',
        dosage: '650 mg',
        frequency: 'As needed for fever or headache (SOS, max 3 times daily)',
        timing: 'After meals',
        durationDays: 3,
        instructions: 'Maintain at least 6 hours between doses. Do not exceed 2000mg/day.',
        confidence: 'high'
      }
    ]
  },
  {
    id: 'rx-003',
    doctorName: 'Dr. Meenakshi Sundaram, MD (General Medicine)',
    doctorQualification: 'MD, DNB (Reg No. 54109/TN)',
    clinicName: 'Sundaram Health & Diagnostic Clinic',
    patientName: 'Pooja Narang (Synthetic Patient)',
    date: '2026-10-25',
    diagnosisSummary: 'Acute Gastritis & Bacterial Enteritis (Handwritten Note with Low OCR Confidence)',
    generalAdvice: 'Bland diet, avoid spicy and sour food for 7 days. Drink boiled cooled water. Review in 5 days.',
    medicines: [
      {
        id: 'rx-med-6',
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Capsules IP 500mg',
        dosage: '500 mg',
        frequency: 'Twice daily (1-0-1)',
        timing: 'After meals',
        durationDays: 5,
        instructions: 'Complete full 5-day antibiotic course even if feeling better.',
        confidence: 'high'
      },
      {
        id: 'rx-med-7',
        name: 'Pantoprazole 40mg',
        genericName: 'Pantoprazole Gastro-resistant 40mg',
        dosage: '40 mg',
        frequency: 'Once Daily (1-0-0)',
        timing: 'Before meals',
        durationDays: 7,
        instructions: 'Take 30 minutes before morning breakfast.',
        confidence: 'high'
      },
      {
        id: 'rx-med-8',
        name: 'Spasm-Proxyvon (?)',
        genericName: 'Dicyclomine + Paracetamol (Handwriting Unclear)',
        dosage: '[Unclear: 10mg or 20mg]',
        frequency: 'As needed for acute stomach cramps',
        timing: 'After meals',
        durationDays: 3,
        instructions: 'Doctor handwriting unclear on dose. Please verify with pharmacist or doctor before creating reminder.',
        confidence: 'low',
        uncertainField: 'dosage'
      }
    ]
  }
];

export const syntheticMedicineCatalog: MedicineCatalogItem[] = [
  {
    id: 'cat-med-1',
    brandName: 'Telma 40',
    genericName: 'Telmisartan 40mg',
    category: 'Blood Pressure / Cardiovascular',
    form: 'Tablet',
    packSize: '15 Tablets strip',
    approxPriceRupees: 145,
    requiresPrescription: true,
    commonUsePlain: 'Used to lower high blood pressure and protect kidney function in hypertension.',
    cautions: 'Requires valid prescription. Do not stop abruptly without doctor supervision.'
  },
  {
    id: 'cat-med-2',
    brandName: 'D-Rise 60K',
    genericName: 'Cholecalciferol (Vitamin D3) 60,000 IU',
    category: 'Vitamins & Supplements',
    form: 'Capsule',
    packSize: '4 Softgel capsules',
    approxPriceRupees: 128,
    requiresPrescription: false,
    commonUsePlain: 'High-strength Vitamin D3 taken weekly to correct low vitamin levels and support bone density.',
    cautions: 'Take weekly as recommended. Do not take daily unless instructed by a physician.'
  },
  {
    id: 'cat-med-3',
    brandName: 'Crocin 650',
    genericName: 'Paracetamol 650mg',
    category: 'Fever & Pain Relief',
    form: 'Tablet',
    packSize: '15 Tablets strip',
    approxPriceRupees: 32,
    requiresPrescription: false,
    commonUsePlain: 'Common fever reducer and relief for mild to moderate headaches and body aches.',
    cautions: 'Avoid taking with other paracetamol-containing remedies to prevent liver overload.'
  },
  {
    id: 'cat-med-4',
    brandName: 'Glycomet 500 SR',
    genericName: 'Metformin Hydrochloride 500mg (Sustained Release)',
    category: 'Diabetes / Blood Sugar',
    form: 'Tablet',
    packSize: '20 Tablets strip',
    approxPriceRupees: 64,
    requiresPrescription: true,
    commonUsePlain: 'Helps improve insulin sensitivity and manage blood sugar in Type 2 diabetes.',
    cautions: 'Take with or after main meal to minimize stomach upset. Requires prescription.'
  },
  {
    id: 'cat-med-5',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole Gastro-resistant 40mg',
    category: 'Acid Reflux & Stomach Care',
    form: 'Tablet',
    packSize: '15 Tablets strip',
    approxPriceRupees: 155,
    requiresPrescription: true,
    commonUsePlain: 'Reduces stomach acid production to heal acidity, gastritis, and reflux.',
    cautions: 'Best taken 30 minutes before the first meal of the morning.'
  },
  {
    id: 'cat-med-6',
    brandName: 'Becosules Z',
    genericName: 'Vitamin B-Complex with Vitamin C & Zinc',
    category: 'Vitamins & Daily Immunity',
    form: 'Capsule',
    packSize: '20 Capsules strip',
    approxPriceRupees: 52,
    requiresPrescription: false,
    commonUsePlain: 'Supports cellular metabolism, mouth ulcer healing, and daily vitality.',
    cautions: 'May turn urine bright yellow harmlessly due to riboflavin excretion.'
  }
];

export const syntheticPharmacies: PharmacyListing[] = [
  // -------------------------------------------------------------
  // GURUGRAM (HARYANA) PHARMACIES & MEDICAL STORES (Real Coordinates)
  // -------------------------------------------------------------
  {
    id: 'pharm-ggn-001',
    name: 'Apollo Pharmacy 24x7',
    address: 'SCF-12, Sector 14 Main Market, Near Old DLF Colony, Gurugram, Haryana 122001',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4735,
    longitude: 77.0468,
    phone: '+911244012345',
    isOpen: true,
    timings: 'Open 24 Hours • All 7 Days',
    homeDelivery: true
  },
  {
    id: 'pharm-ggn-002',
    name: 'MedPlus Pharmacy',
    address: 'Shop 8, Good Earth City Centre, Sector 47, Gurugram, Haryana 122018',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4328,
    longitude: 77.0543,
    phone: '+911244098765',
    isOpen: true,
    timings: '8:00 AM - 11:00 PM • Mon - Sun',
    homeDelivery: true
  },
  {
    id: 'pharm-ggn-003',
    name: 'Fortis HealthWorld Pharmacy',
    address: 'Sector 44 Institutional Area, Opposite HUDA City Metro, Gurugram, Haryana 122003',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4550,
    longitude: 77.0720,
    phone: '+911244567890',
    isOpen: true,
    timings: 'Open 24 Hours',
    homeDelivery: false
  },
  {
    id: 'pharm-ggn-004',
    name: 'Guardian Pharmacy & Wellness',
    address: 'Galleria Market, SG-42, DLF Phase 4, Gurugram, Haryana 122009',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4682,
    longitude: 77.0825,
    phone: '+911244123890',
    isOpen: true,
    timings: '9:00 AM - 10:30 PM • Mon - Sun',
    homeDelivery: true
  },
  {
    id: 'pharm-ggn-005',
    name: 'Sanjeevani Medical & Surgical Store',
    address: 'Near Sadar Bazar Post Office, Gurugram, Haryana 122001',
    city: 'Gurugram',
    state: 'Haryana',
    latitude: 28.4595,
    longitude: 77.0266,
    phone: '+911244223344',
    isOpen: true,
    timings: '9:30 AM - 9:30 PM • Mon - Sat',
    homeDelivery: false
  },

  // -------------------------------------------------------------
  // DELHI NCR PHARMACIES
  // -------------------------------------------------------------
  {
    id: 'pharm-del-001',
    name: 'Noble Chemist & Surgicals',
    address: 'Community Centre, PVR Anupam Complex, Saket, New Delhi 110017',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5284,
    longitude: 77.2114,
    phone: '+911140506070',
    isOpen: true,
    timings: 'Open 24 Hours',
    homeDelivery: true
  },
  {
    id: 'pharm-del-002',
    name: 'Apollo Pharmacy Connaught Place',
    address: 'Block E, Inner Circle, Connaught Place, New Delhi 110001',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6304,
    longitude: 77.2177,
    phone: '+911141516171',
    isOpen: true,
    timings: 'Open 24 Hours',
    homeDelivery: true
  },
  {
    id: 'pharm-del-003',
    name: 'Fortis HealthWorld GK2',
    address: 'M Block Market, Greater Kailash 2, New Delhi 110048',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5355,
    longitude: 77.2435,
    phone: '+911146556677',
    isOpen: true,
    timings: '8:30 AM - 11:00 PM',
    homeDelivery: true
  },

  // -------------------------------------------------------------
  // MUMBAI PHARMACIES
  // -------------------------------------------------------------
  {
    id: 'pharm-mum-001',
    name: 'Wellness Forever 24x7',
    address: 'Linking Road, Near Turner Road, Bandra West, Mumbai 400050',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0596,
    longitude: 72.8295,
    phone: '+912226401234',
    isOpen: true,
    timings: 'Open 24 Hours',
    homeDelivery: true
  },
  {
    id: 'pharm-mum-002',
    name: 'Noble Plus Chemist',
    address: 'Ranade Road, Dadar West, Mumbai 400028',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0178,
    longitude: 72.8478,
    phone: '+912224151234',
    isOpen: true,
    timings: '8:00 AM - 12:00 Midnight',
    homeDelivery: true
  },

  // -------------------------------------------------------------
  // BENGALURU PHARMACIES
  // -------------------------------------------------------------
  {
    id: 'pharm-blr-001',
    name: 'Apollo Pharmacy Koramangala',
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '+918025531234',
    isOpen: true,
    timings: 'Open 24 Hours',
    homeDelivery: true
  },

  // -------------------------------------------------------------
  // PUNE PHARMACIES
  // -------------------------------------------------------------
  {
    id: 'pharm-pun-001',
    name: 'Prabhat Medical & General Stores',
    address: 'FC Road, Deccan Gymkhana, Pune, Maharashtra 411004',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5144,
    longitude: 73.8402,
    phone: '+912025671234',
    isOpen: true,
    timings: '8:30 AM - 11:00 PM',
    homeDelivery: true
  }
];
