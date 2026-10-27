import { RAGChunk, RAGRetrievedSource, RAGRetrievalResult } from '../../types/rag';
import { MEDICAL_KNOWLEDGE_BASE } from '../../data/medicalKnowledgeBase';
import { getUserChunks } from './ragVaultService';
import { computeDenseLocalEmbedding, cosineSimilarity, computeBM25Score } from './embeddingService';

export interface RetrievalOptions {
  maxPersonal?: number;
  maxClinical?: number;
  minScore?: number;
}

/**
 * Score a candidate chunk against the query using Hybrid Retrieval
 * (Dense Cosine Similarity + BM25 Keyword Match)
 */
function scoreChunk(
  query: string,
  queryVec: number[],
  chunk: RAGChunk,
  layer: 'personal' | 'clinical'
): RAGRetrievedSource {
  // Ensure document has embedding
  const docVec = chunk.embedding && chunk.embedding.length > 0
    ? chunk.embedding
    : computeDenseLocalEmbedding(`${chunk.title} ${chunk.content}`);

  // Dense semantic similarity (0 to 1)
  const denseSim = cosineSimilarity(queryVec, docVec);

  // BM25 keyword matching with metadata extraction
  const metadataWords = [
    ...(chunk.metadata?.biomarkers || []),
    ...(chunk.metadata?.medications || []),
    ...(chunk.metadata?.symptoms || []),
    chunk.metadata?.relevanceAnchor || '',
    chunk.metadata?.category || '',
    chunk.metadata?.clinicalDomain || ''
  ].filter(Boolean);

  const { score: bm25Score, matchedKeywords } = computeBM25Score(
    query,
    `${chunk.title} ${chunk.content}`,
    metadataWords
  );

  // Hybrid weighted combination: 55% dense semantic similarity + 45% exact BM25 keyword match
  const hybridScore = 0.55 * denseSim + 0.45 * bm25Score;

  return {
    chunk,
    layer,
    relevanceScore: Math.round(hybridScore * 100) / 100,
    matchedKeywords
  };
}

/**
 * Perform Dual-Layer Hybrid RAG Retrieval
 * Strictly isolates Layer A to the specified userId.
 */
export async function retrieveContext(
  userId: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RAGRetrievalResult> {
  const maxPersonal = options.maxPersonal ?? 4;
  const maxClinical = options.maxClinical ?? 3;
  const minScore = options.minScore ?? 0.12;

  if (!query || query.trim().length === 0) {
    return {
      query: '',
      personalSources: [],
      clinicalSources: [],
      allSources: [],
      contextPromptBlock: ''
    };
  }

  // Generate dense query embedding
  const queryVec = computeDenseLocalEmbedding(query);

  // 1. LAYER A: Personal Health Vault (strictly scoped to this user)
  let personalSources: RAGRetrievedSource[] = [];
  if (userId) {
    const userChunks = await getUserChunks(userId);
    // Double-check isolation: discard anything not belonging to this user
    const strictUserChunks = userChunks.filter(c => c.userId === userId);

    personalSources = strictUserChunks
      .map(chunk => scoreChunk(query, queryVec, chunk, 'personal'))
      .filter(source => source.relevanceScore >= minScore)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxPersonal);
  }

  // 2. LAYER B: Curated Clinical & Wellness Knowledge Base
  const clinicalSources = MEDICAL_KNOWLEDGE_BASE
    .map(chunk => scoreChunk(query, queryVec, chunk, 'clinical'))
    .filter(source => source.relevanceScore >= minScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxClinical);

  const allSources = [...personalSources, ...clinicalSources].sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  // 3. Assemble Augmented Context Prompt Block
  const promptLines: string[] = [];

  if (personalSources.length > 0) {
    promptLines.push('### [PATIENT PERSONAL HEALTH VAULT - GROUND TRUTH RECORDS]');
    personalSources.forEach((src, idx) => {
      promptLines.push(
        `[Personal Record #${idx + 1}] (${src.chunk.title} | Type: ${src.chunk.sourceType} | Date: ${src.chunk.timestamp})`
      );
      promptLines.push(src.chunk.content);
      promptLines.push('---');
    });
  }

  if (clinicalSources.length > 0) {
    promptLines.push('### [CURATED CLINICAL & WELLNESS REFERENCE GUIDELINES]');
    clinicalSources.forEach((src, idx) => {
      promptLines.push(
        `[Clinical Guideline #${idx + 1}] (${src.chunk.title} | Domain: ${src.chunk.metadata?.clinicalDomain || 'Clinical Guidance'})`
      );
      promptLines.push(src.chunk.content);
      promptLines.push('---');
    });
  }

  let contextPromptBlock = '';
  if (promptLines.length > 0) {
    contextPromptBlock = [
      '=================================================================',
      'RELEVANT HEALTHCARE CONTEXT (RAG RETRIEVAL ACTIVE)',
      '=================================================================',
      ...promptLines,
      'GROUNDING DIRECTIVE:',
      '- Ground your responses firmly in the patient records and clinical guidelines provided above.',
      '- Cite specific reports, dates, lab values, or medications when referring to patient history.',
      '- Cross-reference patient values against the reference guidelines provided.',
      '- If a question cannot be answered from the provided records, clarify what information is missing instead of guessing.',
      '================================================================='
    ].join('\n\n');
  }

  return {
    query,
    personalSources,
    clinicalSources,
    allSources,
    contextPromptBlock
  };
}
