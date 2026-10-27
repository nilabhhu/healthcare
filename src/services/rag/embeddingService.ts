import { GoogleGenAI } from '@google/genai';

const VECTOR_DIMENSION = 128;

// High-priority medical and clinical domain tokens to weight heavily during dense feature hashing
const MEDICAL_WEIGHT_DICTIONARY: Record<string, number> = {
  hemoglobin: 3.5,
  hb: 3.5,
  anemia: 3.0,
  wbc: 3.0,
  platelets: 3.0,
  leukocyte: 2.8,
  rbc: 2.5,
  hba1c: 4.0,
  glucose: 3.5,
  sugar: 3.0,
  diabetes: 3.5,
  fasting: 2.5,
  postprandial: 2.8,
  cholesterol: 3.5,
  ldl: 3.5,
  hdl: 3.0,
  triglycerides: 3.5,
  lipid: 3.0,
  tsh: 4.0,
  thyroid: 3.5,
  hypothyroidism: 3.5,
  hyperthyroidism: 3.5,
  creatinine: 3.8,
  egfr: 3.8,
  kidney: 3.0,
  renal: 3.0,
  sgpt: 3.5,
  alt: 3.5,
  sgot: 3.5,
  ast: 3.5,
  bilirubin: 3.5,
  liver: 3.0,
  vitamin: 3.0,
  vitamind: 3.8,
  b12: 3.8,
  ferritin: 3.5,
  iron: 3.5,
  calcium: 3.0,
  period: 3.2,
  menstrual: 3.5,
  cycle: 3.0,
  follicular: 3.2,
  ovulation: 3.5,
  luteal: 3.2,
  cramps: 3.0,
  dysmenorrhea: 3.8,
  pcos: 4.0,
  bleeding: 3.5,
  estrogen: 3.2,
  progesterone: 3.2,
  redflags: 4.0,
  diet: 2.5,
  nutrition: 2.8,
  protein: 3.0,
  calories: 2.5,
  thali: 2.5,
  sodium: 3.0,
  salt: 2.8,
  fiber: 2.8,
  prescription: 3.0,
  dosage: 3.0,
  medicine: 2.8,
  medication: 2.8,
  paracetamol: 3.5,
  antibiotic: 3.8,
  amoxicillin: 3.5,
  ciprofloxacin: 3.8,
  levothyroxine: 3.8,
  statin: 3.5,
  atorvastatin: 3.8,
  ibuprofen: 3.5,
  nsaid: 3.5,
  od: 2.5,
  bd: 2.5,
  tds: 2.5,
  sos: 2.5,
  ac: 2.5,
  pc: 2.5,
  hs: 2.5,
  interaction: 3.0,
  toxicity: 3.5,
  allergy: 3.5
};

// High-priority clinical concept clusters for semantic dense embedding space
const CLINICAL_CONCEPT_CLUSTERS: Record<number, string[]> = {
  0: ['hemoglobin', 'hb', 'anemia', 'rbc', 'ferritin', 'iron', 'fatigue', 'pallor', 'pale', 'blood', 'count', 'cbc'],
  1: ['wbc', 'tlc', 'leukocyte', 'platelets', 'infection', 'fever', 'neutrophils', 'eosinophils', 'inflammation'],
  2: ['glucose', 'sugar', 'diabetes', 'hba1c', 'fasting', 'postprandial', 'glycemic', 'insulin'],
  3: ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid', 'heart', 'cardiovascular', 'atherosclerosis'],
  4: ['tsh', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 't3', 't4', 'goiter'],
  5: ['creatinine', 'egfr', 'kidney', 'renal', 'bun', 'urine', 'proteinuria'],
  6: ['liver', 'sgpt', 'alt', 'sgot', 'ast', 'bilirubin', 'jaundice', 'hepatic', 'alp'],
  7: ['vitamin', 'vitamind', 'b12', 'cobalamin', 'calcium', 'deficiency', 'bone', 'neuropathy'],
  8: ['period', 'cycle', 'menstrual', 'ovulation', 'follicular', 'luteal', 'cramps', 'dysmenorrhea', 'pcos', 'bleeding', 'estrogen', 'progesterone'],
  9: ['diet', 'nutrition', 'protein', 'thali', 'calories', 'fiber', 'sodium', 'salt', 'absorption', 'meal', 'carbs', 'fats'],
  10: ['prescription', 'medicine', 'medication', 'dosage', 'paracetamol', 'antibiotic', 'amoxicillin', 'ciprofloxacin', 'statin', 'nsaid', 'ibuprofen', 'od', 'bd', 'tds', 'sos', 'ac', 'pc', 'timing', 'interaction']
};

/**
 * Deterministic string hash into a bounded bucket
 */
function hashString(str: string, seed = 0): number {
  let h = seed ^ 0x12345678;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Tokenize and normalize text into meaningful terms
 */
export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Generate a dense, deterministic semantic embedding vector using clinical ontology clustering,
 * feature hashing, and subword n-grams.
 */
export function computeDenseLocalEmbedding(text: string, dim = VECTOR_DIMENSION): number[] {
  const vec = new Float64Array(dim);
  const tokens = tokenizeText(text);

  if (tokens.length === 0) {
    return Array.from(vec);
  }

  const CLUSTER_OFFSET = 16;
  const HASH_DIM = dim - CLUSTER_OFFSET;

  // 1. Semantic Concept Cluster Activations (dims 0 to 15)
  for (const token of tokens) {
    for (const [clusterIdxStr, kwList] of Object.entries(CLINICAL_CONCEPT_CLUSTERS)) {
      const clusterIdx = parseInt(clusterIdxStr, 10);
      if (kwList.some(k => token.includes(k) || k.includes(token))) {
        vec[clusterIdx] += 2.5;
      }
    }
  }

  // 2. Unigram feature hashing with medical vocabulary weighting (dims 16 to dim-1)
  for (const token of tokens) {
    const weight = MEDICAL_WEIGHT_DICTIONARY[token] || 1.0;
    const bucket = CLUSTER_OFFSET + (hashString(token) % HASH_DIM);
    const sign = (hashString(token, 1) % 2 === 0) ? 1 : -1;
    vec[bucket] += sign * weight;

    // Subword 3-grams for morphological resilience
    if (token.length >= 4) {
      for (let i = 0; i <= token.length - 3; i++) {
        const trigram = token.substring(i, i + 3);
        const triBucket = CLUSTER_OFFSET + (hashString(trigram) % HASH_DIM);
        const triSign = (hashString(trigram, 2) % 2 === 0) ? 0.35 : -0.35;
        vec[triBucket] += triSign * (weight * 0.3);
      }
    }
  }

  // 3. Bigrams for phrases
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]}_${tokens[i + 1]}`;
    const biBucket = CLUSTER_OFFSET + (hashString(bigram) % HASH_DIM);
    const biSign = (hashString(bigram, 3) % 2 === 0) ? 0.75 : -0.75;
    vec[biBucket] += biSign * 1.2;
  }

  // 4. L2 Normalization to unit length
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] /= norm;
    }
  }

  return Array.from(vec);
}

/**
 * Compute semantic embedding using Gemini API if key is available,
 * falling back gracefully to the deterministic dense vector embedding.
 */
export async function computeEmbedding(text: string): Promise<number[]> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'undefined' && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text
      });

      const resp = response as any;
      if (resp?.embedding?.values) {
        return resp.embedding.values;
      }
      if (resp?.embeddings?.[0]?.values) {
        return resp.embeddings[0].values;
      }
    } catch {
      // Graceful fallback to deterministic local embedding
    }
  }

  return computeDenseLocalEmbedding(text);
}

/**
 * Cosine similarity between two dense embedding vectors.
 * Returns a value between 0.0 and 1.0.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  // Handle vectors of differing lengths if API vs local embeddings mix
  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Account for remaining elements if any
  for (let i = minLen; i < vecA.length; i++) normA += vecA[i] * vecA[i];
  for (let i = minLen; i < vecB.length; i++) normB += vecB[i] * vecB[i];

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (normA * normB);
  return Math.max(0, Math.min(1, similarity));
}

/**
 * BM25 term frequency / keyword match scoring for Hybrid Search.
 */
export function computeBM25Score(
  query: string,
  documentText: string,
  metadataKeywords: string[] = []
): { score: number; matchedKeywords: string[] } {
  const queryTokens = Array.from(new Set(tokenizeText(query)));
  const docTokens = tokenizeText(documentText);
  const metaTokens = metadataKeywords.map(k => k.toLowerCase());

  if (queryTokens.length === 0 || docTokens.length === 0) {
    return { score: 0, matchedKeywords: [] };
  }

  // Count term frequencies in doc
  const docFreq: Record<string, number> = {};
  for (const t of docTokens) {
    docFreq[t] = (docFreq[t] || 0) + 1;
  }

  const k1 = 1.5;
  const b = 0.75;
  const avgDocLen = 80;
  const docLen = docTokens.length;

  let totalScore = 0;
  const matchedKeywords: string[] = [];

  for (const qToken of queryTokens) {
    const tf = docFreq[qToken] || 0;
    const isMetaMatch = metaTokens.some(m => m.includes(qToken) || qToken.includes(m));

    if (tf > 0 || isMetaMatch) {
      matchedKeywords.push(qToken);
      // BM25 term saturation formula
      const idfWeight = MEDICAL_WEIGHT_DICTIONARY[qToken] ? MEDICAL_WEIGHT_DICTIONARY[qToken] * 1.5 : 1.2;
      const bm25Tf = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen)));
      totalScore += idfWeight * bm25Tf;

      if (isMetaMatch) {
        totalScore += 2.0; // Bonus for explicit metadata / biomarker / medication matches
      }
    }
  }

  // Normalize score roughly to 0-1
  const maxPossible = queryTokens.length * 4.0;
  const normalizedScore = Math.min(1, totalScore / maxPossible);

  return {
    score: normalizedScore,
    matchedKeywords
  };
}
