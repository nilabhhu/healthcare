import { RAGChunk, RAGVaultStats } from '../../types/rag';
import { computeDenseLocalEmbedding } from './embeddingService';

const DB_PREFIX = 'HealYaar_RAG_';
const STORE_NAME = 'chunks';

/**
 * Open or create a user-scoped IndexedDB instance
 */
function openUserDB(userId: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const dbName = `${DB_PREFIX}${userId}`;
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('sourceType', 'sourceType', { unique: false });
        store.createIndex('sourceId', 'sourceId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Fallback to localStorage if IndexedDB is disabled/blocked
 */
function getLocalStorageKey(userId: string): string {
  return `healyaar_user_${userId}_rag_chunks`;
}

function getLocalFallbackChunks(userId: string): RAGChunk[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) return [];
    const parsed: RAGChunk[] = JSON.parse(raw);
    return parsed.filter(c => c.userId === userId);
  } catch {
    return [];
  }
}

function saveLocalFallbackChunks(userId: string, chunks: RAGChunk[]): void {
  try {
    const userOnly = chunks.filter(c => c.userId === userId);
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(userOnly));
  } catch (e) {
    console.warn('[RAG Vault] LocalStorage fallback write failed:', e);
  }
}

/**
 * Save or update a single chunk in the user's isolated vault
 */
export async function saveChunk(chunk: RAGChunk): Promise<void> {
  if (!chunk.userId || chunk.userId === 'clinical_knowledge_base') {
    throw new Error('Personal chunks must have a valid user ID');
  }

  // Ensure embedding is present
  if (!chunk.embedding || chunk.embedding.length === 0) {
    chunk.embedding = computeDenseLocalEmbedding(`${chunk.title} ${chunk.content}`);
  }

  try {
    const db = await openUserDB(chunk.userId);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(chunk);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage
    const current = getLocalFallbackChunks(chunk.userId);
    const existingIndex = current.findIndex(c => c.id === chunk.id);
    if (existingIndex >= 0) {
      current[existingIndex] = chunk;
    } else {
      current.push(chunk);
    }
    saveLocalFallbackChunks(chunk.userId, current);
  }
}

/**
 * Retrieve all chunks belonging strictly to the specified user
 */
export async function getUserChunks(userId: string): Promise<RAGChunk[]> {
  if (!userId) return [];

  try {
    const db = await openUserDB(userId);
    const chunks = await new Promise<RAGChunk[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result as RAGChunk[]) || [];
        // Strict runtime safety filter to guarantee zero cross-user leakage
        resolve(results.filter(c => c.userId === userId));
      };
      req.onerror = () => reject(req.error);
    });

    if (chunks.length > 0) return chunks;
    return getLocalFallbackChunks(userId);
  } catch {
    return getLocalFallbackChunks(userId);
  }
}

/**
 * Delete a specific chunk by ID
 */
export async function deleteChunk(userId: string, chunkId: string): Promise<void> {
  if (!userId || !chunkId) return;

  try {
    const db = await openUserDB(userId);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(chunkId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const current = getLocalFallbackChunks(userId);
    saveLocalFallbackChunks(userId, current.filter(c => c.id !== chunkId));
  }
}

/**
 * Delete all chunks associated with a specific source (e.g. deleted report or prescription)
 */
export async function deleteChunksBySource(userId: string, sourceId: string): Promise<void> {
  if (!userId || !sourceId) return;

  try {
    const db = await openUserDB(userId);
    const all = await getUserChunks(userId);
    const toDelete = all.filter(c => c.sourceId === sourceId);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of toDelete) {
        store.delete(item.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const current = getLocalFallbackChunks(userId);
    saveLocalFallbackChunks(userId, current.filter(c => c.sourceId !== sourceId));
  }
}

/**
 * Completely wipe a user's health knowledge vault
 */
export async function clearUserVault(userId: string): Promise<void> {
  if (!userId) return;

  try {
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase(`${DB_PREFIX}${userId}`);
    }
  } catch (e) {
    console.warn('[RAG Vault] Error clearing IndexedDB:', e);
  }

  try {
    localStorage.removeItem(getLocalStorageKey(userId));
  } catch {}
}

/**
 * Compute vault statistics for status badges and management UI
 */
export async function getVaultStats(userId: string): Promise<RAGVaultStats> {
  const chunks = await getUserChunks(userId);
  const stats: RAGVaultStats = {
    totalChunks: chunks.length,
    reportChunks: 0,
    prescriptionChunks: 0,
    cycleChunks: 0,
    nutritionChunks: 0,
    symptomChunks: 0,
    lastIndexedAt: undefined
  };

  let maxTime = 0;
  for (const c of chunks) {
    if (c.sourceType === 'medical_report') stats.reportChunks++;
    else if (c.sourceType === 'prescription') stats.prescriptionChunks++;
    else if (c.sourceType === 'period_symptom_log') stats.cycleChunks++;
    else if (c.sourceType === 'nutrition_log') stats.nutritionChunks++;
    else if (c.sourceType === 'symptom_log') stats.symptomChunks++;

    const t = new Date(c.timestamp).getTime();
    if (!isNaN(t) && t > maxTime) {
      maxTime = t;
    }
  }

  if (maxTime > 0) {
    stats.lastIndexedAt = new Date(maxTime).toISOString();
  }

  return stats;
}

// ==========================================
// DOCUMENT CHUNKING & INGESTION PIPELINES
// (200-400 token chunks with metadata enrichment)
// ==========================================

function splitTextIntoSemanticChunks(
  fullText: string,
  targetCharCount = 900,
  overlapChars = 150
): string[] {
  if (!fullText || fullText.trim().length === 0) return [];
  const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  let currentBuffer = '';

  for (const paragraph of paragraphs) {
    if ((currentBuffer.length + paragraph.length) > targetCharCount && currentBuffer.length > 0) {
      chunks.push(currentBuffer.trim());
      // Keep overlap from end of previous buffer
      const words = currentBuffer.split(' ');
      const overlapWords = words.slice(-Math.min(words.length, Math.round(overlapChars / 6))).join(' ');
      currentBuffer = `${overlapWords}\n\n${paragraph}`;
    } else {
      currentBuffer = currentBuffer ? `${currentBuffer}\n\n${paragraph}` : paragraph;
    }
  }

  if (currentBuffer.trim().length > 0) {
    chunks.push(currentBuffer.trim());
  }

  return chunks;
}

/**
 * Ingest and index a Medical Report into the user's Health Vault
 */
export async function indexMedicalReport(
  userId: string,
  report: {
    id: string;
    title: string;
    date: string;
    category?: string;
    summary?: string;
    keyFindings?: string[];
    biomarkers?: Array<{ name: string; value: string | number; unit?: string; status?: string; normalRange?: string }>;
    rawText?: string;
  }
): Promise<void> {
  if (!userId || !report.id) return;

  // Build structured clinical summary
  const lines: string[] = [];
  lines.push(`Medical Report: ${report.title || 'Diagnostic Report'}`);
  lines.push(`Report Date: ${report.date || new Date().toLocaleDateString()}`);
  if (report.category) lines.push(`Category: ${report.category}`);
  if (report.summary) lines.push(`Summary: ${report.summary}`);

  if (report.keyFindings && report.keyFindings.length > 0) {
    lines.push(`Key Findings:\n- ${report.keyFindings.join('\n- ')}`);
  }

  const biomarkerNames: string[] = [];
  if (report.biomarkers && report.biomarkers.length > 0) {
    lines.push('Biomarkers & Lab Values:');
    for (const b of report.biomarkers) {
      biomarkerNames.push(b.name);
      lines.push(
        `- ${b.name}: ${b.value} ${b.unit || ''} (Status: ${b.status || 'Normal'}, Reference: ${b.normalRange || 'N/A'})`
      );
    }
  }

  if (report.rawText) {
    lines.push(`Extracted Clinical Notes:\n${report.rawText}`);
  }

  const fullText = lines.join('\n\n');
  const chunks = splitTextIntoSemanticChunks(fullText);

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunkText = chunks[idx];
    const chunk: RAGChunk = {
      id: `chunk_${report.id}_${idx}`,
      userId,
      sourceType: 'medical_report',
      sourceId: report.id,
      title: `${report.title || 'Medical Report'} (Part ${idx + 1}/${chunks.length})`,
      content: chunkText,
      timestamp: report.date || new Date().toISOString(),
      metadata: {
        category: report.category || 'Diagnostics',
        biomarkers: biomarkerNames,
        relevanceAnchor: `${report.title} ${biomarkerNames.join(' ')}`
      },
      embedding: computeDenseLocalEmbedding(`${report.title} ${chunkText}`)
    };
    await saveChunk(chunk);
  }
}

/**
 * Ingest and index a Prescription into the user's Health Vault
 */
export async function indexPrescription(
  userId: string,
  rx: {
    id: string;
    doctorName?: string;
    clinicName?: string;
    date: string;
    diagnosis?: string;
    medications?: Array<{
      name: string;
      dosage?: string;
      frequency?: string;
      timing?: string;
      duration?: string | number;
      instructions?: string;
    }>;
    advice?: string;
    rawText?: string;
  }
): Promise<void> {
  if (!userId || !rx.id) return;

  const lines: string[] = [];
  lines.push(`Prescription Record from Dr. ${rx.doctorName || 'Prescribing Physician'}`);
  lines.push(`Date: ${rx.date || new Date().toLocaleDateString()}`);
  if (rx.clinicName) lines.push(`Clinic / Hospital: ${rx.clinicName}`);
  if (rx.diagnosis) lines.push(`Clinical Diagnosis: ${rx.diagnosis}`);

  const medNames: string[] = [];
  if (rx.medications && rx.medications.length > 0) {
    lines.push('Prescribed Medications & Regimen:');
    for (const m of rx.medications) {
      medNames.push(m.name);
      lines.push(
        `- ${m.name} | Dose: ${m.dosage || 'Standard'} | Frequency: ${m.frequency || 'As directed'} | Timing: ${
          m.timing || 'PC'
        } | Duration: ${m.duration || 'Full course'} | Instructions: ${m.instructions || 'Follow doctor directions'}`
      );
    }
  }

  if (rx.advice) lines.push(`Doctor Advice / Lifestyle Notes: ${rx.advice}`);
  if (rx.rawText) lines.push(`Raw Prescription OCR Content:\n${rx.rawText}`);

  const fullText = lines.join('\n\n');
  const chunks = splitTextIntoSemanticChunks(fullText);

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunkText = chunks[idx];
    const chunk: RAGChunk = {
      id: `chunk_${rx.id}_${idx}`,
      userId,
      sourceType: 'prescription',
      sourceId: rx.id,
      title: `Prescription - ${rx.diagnosis || rx.doctorName || 'Rx Record'} (Part ${idx + 1}/${chunks.length})`,
      content: chunkText,
      timestamp: rx.date || new Date().toISOString(),
      metadata: {
        medications: medNames,
        doctor: rx.doctorName,
        relevanceAnchor: `Prescription ${rx.diagnosis || ''} ${medNames.join(' ')}`
      },
      embedding: computeDenseLocalEmbedding(`Prescription ${rx.diagnosis || ''} ${medNames.join(' ')} ${chunkText}`)
    };
    await saveChunk(chunk);
  }
}

/**
 * Ingest and index a Period & Cycle Log into the user's Health Vault
 */
export async function indexPeriodLog(
  userId: string,
  log: {
    id: string;
    date: string;
    cycleDay?: number;
    phase?: string;
    flow?: string;
    symptoms?: string[];
    mood?: string;
    energyLevel?: string;
    notes?: string;
  }
): Promise<void> {
  if (!userId || !log.id) return;

  const content = `Menstrual Cycle & Symptom Entry:
- Date: ${log.date}
- Cycle Day: ${log.cycleDay ? `Day ${log.cycleDay}` : 'Not specified'}
- Phase: ${log.phase || 'General'}
- Flow Intensity: ${log.flow || 'None/Spotting'}
- Recorded Symptoms: ${log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None logged'}
- Mood & Energy: ${log.mood || 'Normal'} (Energy: ${log.energyLevel || 'Moderate'})
${log.notes ? `- Personal Notes: ${log.notes}` : ''}`.trim();

  const chunk: RAGChunk = {
    id: `chunk_period_${log.id}`,
    userId,
    sourceType: 'period_symptom_log',
    sourceId: log.id,
    title: `Cycle Log - ${log.phase || 'Cycle Day'} (${log.date})`,
    content,
    timestamp: log.date || new Date().toISOString(),
    metadata: {
      symptoms: log.symptoms || [],
      phase: log.phase,
      relevanceAnchor: `Period cycle ${log.phase || ''} ${log.symptoms?.join(' ') || ''}`
    },
    embedding: computeDenseLocalEmbedding(`Cycle ${log.phase || ''} ${log.symptoms?.join(' ') || ''} ${content}`)
  };

  await saveChunk(chunk);
}

/**
 * Ingest and index a Nutrition & Meal Log into the user's Health Vault
 */
export async function indexNutritionLog(
  userId: string,
  meal: {
    id: string;
    date: string;
    mealType: string;
    foodName: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    notes?: string;
    analysisFeedback?: string;
  }
): Promise<void> {
  if (!userId || !meal.id) return;

  const content = `Nutrition & Meal Record:
- Meal Type: ${meal.mealType}
- Food Item: ${meal.foodName}
- Date: ${meal.date}
- Estimated Calories: ${meal.calories ? `${meal.calories} kcal` : 'N/A'}
- Macros: Protein: ${meal.protein || 0}g, Carbs: ${meal.carbs || 0}g, Fats: ${meal.fats || 0}g
${meal.analysisFeedback ? `- Nutritional Analysis & Dietary Advice: ${meal.analysisFeedback}` : ''}
${meal.notes ? `- User Notes: ${meal.notes}` : ''}`.trim();

  const chunk: RAGChunk = {
    id: `chunk_nutr_${meal.id}`,
    userId,
    sourceType: 'nutrition_log',
    sourceId: meal.id,
    title: `Meal Log - ${meal.mealType}: ${meal.foodName}`,
    content,
    timestamp: meal.date || new Date().toISOString(),
    metadata: {
      mealType: meal.mealType,
      relevanceAnchor: `Nutrition meal ${meal.foodName} protein calories diet`
    },
    embedding: computeDenseLocalEmbedding(`Meal ${meal.foodName} nutrition ${content}`)
  };

  await saveChunk(chunk);
}

/**
 * Ingest and index a Symptom Check into the user's Health Vault
 */
export async function indexSymptomCheck(
  userId: string,
  check: {
    id: string;
    date: string;
    symptoms: string[];
    severity?: string;
    duration?: string;
    triageAdvice?: string;
    possibleCauses?: string[];
  }
): Promise<void> {
  if (!userId || !check.id) return;

  const content = `Symptom Assessment Entry:
- Date: ${check.date}
- Reported Symptoms: ${check.symptoms.join(', ')}
- Severity: ${check.severity || 'Mild to Moderate'}
- Duration: ${check.duration || 'Not specified'}
${check.possibleCauses && check.possibleCauses.length > 0 ? `- Clinically Relevant Considerations: ${check.possibleCauses.join(', ')}` : ''}
${check.triageAdvice ? `- Recommended Triage Advice: ${check.triageAdvice}` : ''}`.trim();

  const chunk: RAGChunk = {
    id: `chunk_symptom_${check.id}`,
    userId,
    sourceType: 'symptom_log',
    sourceId: check.id,
    title: `Symptom Check - ${check.symptoms.slice(0, 3).join(', ')} (${check.date})`,
    content,
    timestamp: check.date || new Date().toISOString(),
    metadata: {
      symptoms: check.symptoms,
      relevanceAnchor: `Symptoms ${check.symptoms.join(' ')} triage health check`
    },
    embedding: computeDenseLocalEmbedding(`Symptoms ${check.symptoms.join(' ')} ${content}`)
  };

  await saveChunk(chunk);
}
