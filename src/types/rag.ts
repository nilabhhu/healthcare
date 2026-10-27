/**
 * HealYaar Dual-Layer Healthcare RAG (Retrieval-Augmented Generation) Types
 */

export type RAGSourceType =
  | 'medical_report'
  | 'prescription'
  | 'period_symptom_log'
  | 'nutrition_log'
  | 'symptom_log'
  | 'clinical_guideline';

export interface RAGChunk {
  id: string;
  userId: string; // Strictly required for Layer A; "clinical_knowledge_base" for Layer B
  sourceType: RAGSourceType;
  sourceId: string;
  title: string;
  content: string;
  timestamp: string;
  metadata?: {
    biomarkers?: string[];
    medications?: string[];
    symptoms?: string[];
    category?: string;
    clinicalDomain?: 'lab_biomarkers' | 'menstrual_health' | 'nutrition' | 'medication_safety';
    relevanceAnchor?: string;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface RAGRetrievedSource {
  chunk: RAGChunk;
  layer: 'personal' | 'clinical';
  relevanceScore: number; // 0 to 1 (e.g. 0.94 for 94%)
  matchedKeywords?: string[];
}

export interface RAGRetrievalResult {
  query: string;
  personalSources: RAGRetrievedSource[];
  clinicalSources: RAGRetrievedSource[];
  allSources: RAGRetrievedSource[];
  contextPromptBlock: string;
}

export interface RAGVaultStats {
  totalChunks: number;
  reportChunks: number;
  prescriptionChunks: number;
  cycleChunks: number;
  nutritionChunks: number;
  symptomChunks: number;
  lastIndexedAt?: string;
}
