export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu';

export type TextSize = 'normal' | 'large' | 'xlarge';

export type NavTab = 
  | 'home'
  | 'assistant'
  | 'symptoms'
  | 'reports'
  | 'nutrition'
  | 'doctors'
  | 'fitness'
  | 'medicines'
  | 'mental'
  | 'period'
  | 'reminders'
  | 'login';

export type { AuthUser, LoginCredentials, SignUpCredentials, AuthResult } from '../services/authService';
export * from './rag';

export type AuthGateState = 'loading' | 'unauthenticated' | 'authenticated';

export interface VerifiedSource {
  organization: string;
  year?: number | string;
  topic?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  emergencyActionText?: string;
  sources?: VerifiedSource[];
  ragSources?: import('./rag').RAGRetrievedSource[];
  suggestedFollowUps?: string[];
  nextSteps?: {
    category: 'self-care' | 'routine-clinic' | 'urgent-care' | 'emergency';
    summary: string;
    actionLabel?: string;
    actionTab?: NavTab;
  };
  uncertaintyNote?: string;
  plainLanguageGlossary?: { term: string; explanation: string }[];
}

export interface LabTestMetric {
  name: string;
  code?: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'borderline';
  plainExplanation: string;
  clinicalContext: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  date: string;
  patientSyntheticName: string;
  labName: string;
  summary: string;
  generalAdvice: string;
  questionsForDoctor: string[];
  metrics: LabTestMetric[];
}

export interface FoodNutrientInfo {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sodiumMg: number;
  glycemicIndex?: 'Low' | 'Medium' | 'High';
}

export interface FoodPhotoSample {
  id: string;
  name: string;
  imageUrl: string;
  estimatedPortion: string;
  nutrients: FoodNutrientInfo;
  uncertaintyNotes: string[];
  detectedIngredients: { name: string; estimatedAmount: string }[];
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'katori';
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
  fiberPerUnit: number;
  sodiumPerUnit: number;
}

export interface DoctorListing {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  specialtyCategory: string;
  hospitalOrClinic: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  experienceYears: number;
  languages: string[];
  consultationFeeRupees: number;
  wheelchairAccessible: boolean;
  audioConsultAvailable: boolean;
  availableDays: string;
  fictionalDemoNote: string;
  rating?: number;
  address?: string;
  contactPhone?: string;
}

export interface SupplementInfo {
  id: string;
  name: string;
  commonUses: string;
  category: 'muscle' | 'hair-skin' | 'bones' | 'general';
  evidenceStrength: 'Strong' | 'Moderate' | 'Limited' | 'Mixed';
  plainSummary: string;
  potentialRisks: string[];
  medicationInteractions: string[];
  verifiedSources: VerifiedSource[];
}

export interface WorkoutExercise {
  name: string;
  durationOrReps: string;
  instructions: string;
  safetyCaution: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  level: 'Gentle / Senior' | 'Beginner' | 'Moderate';
  durationMinutes: number;
  suitedFor: string;
  description: string;
  exercises: WorkoutExercise[];
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timing: 'Before meals' | 'After meals' | 'With food' | 'At bedtime' | string;
  durationDays: number;
  instructions: string;
  confidence?: 'high' | 'medium' | 'low';
  customTime?: string;
  uncertainField?: string;
}

export interface PharmacyListing {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  latitude: number;
  longitude: number;
  phone: string;
  isOpen: boolean;
  timings: string;
  distanceKm?: number;
  homeDelivery?: boolean;
}

export interface SyntheticPrescription {
  id: string;
  doctorName: string;
  doctorQualification: string;
  clinicName: string;
  patientName: string;
  date: string;
  diagnosisSummary: string;
  medicines: PrescriptionMedicine[];
  generalAdvice: string;
}

export interface MedicineCatalogItem {
  id: string;
  brandName: string;
  genericName: string;
  category: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Ointment' | 'Inhaler';
  packSize: string;
  approxPriceRupees: number;
  requiresPrescription: boolean;
  commonUsePlain: string;
  cautions: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  type: 'medicine' | 'appointment' | 'water' | 'vitals';
  time: string; // HH:mm
  repeatDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  instructions: string;
  active: boolean;
  createdDate: string;
}

export interface PeriodCycleEntry {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  cycleLengthDays: number;
  periodDurationDays: number;
  symptoms: string[];
  flowIntensity?: 'Light' | 'Medium' | 'Heavy';
  notes?: string;
}
