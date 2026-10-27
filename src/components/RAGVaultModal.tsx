import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  RefreshCw,
  Trash2,
  FileText,
  Pill,
  Calendar,
  Apple,
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { RAGChunk, RAGVaultStats } from '../types/rag';
import {
  getUserChunks,
  getVaultStats,
  deleteChunk,
  clearUserVault,
  indexMedicalReport,
  indexPrescription,
  indexPeriodLog
} from '../services/rag/ragVaultService';
import { medicalReportService } from '../services/medicalReportService';
import { prescriptionService } from '../services/prescriptionService';
import { periodService } from '../services/periodService';
import { MEDICAL_KNOWLEDGE_BASE } from '../data/medicalKnowledgeBase';

interface RAGVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const RAGVaultModal: React.FC<RAGVaultModalProps> = ({ isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'clinical'>('personal');
  const [stats, setStats] = useState<RAGVaultStats>({
    totalChunks: 0,
    reportChunks: 0,
    prescriptionChunks: 0,
    cycleChunks: 0,
    nutritionChunks: 0,
    symptomChunks: 0
  });
  const [chunks, setChunks] = useState<RAGChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<RAGChunk | null>(null);

  const loadVaultData = async () => {
    if (!userId) return;
    try {
      const [vaultStats, userChunks] = await Promise.all([
        getVaultStats(userId),
        getUserChunks(userId)
      ]);
      setStats(vaultStats);
      setChunks(userChunks);
    } catch (e) {
      console.warn('Failed to load vault data:', e);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadVaultData();
    }
  }, [isOpen, userId]);

  const handleSyncAll = async () => {
    if (!userId || isSyncing) return;
    setIsSyncing(true);
    setStatusMessage(null);

    try {
      // 1. Fetch user reports
      const reports = await medicalReportService.getReports(userId);
      for (const r of reports) {
        await indexMedicalReport(userId, {
          id: r.id,
          title: r.title,
          date: r.uploadDate,
          summary: r.summary,
          keyFindings: r.keyFindings,
          biomarkers: r.metrics?.map(m => ({
            name: m.name,
            value: m.value,
            unit: m.unit,
            status: m.status,
            normalRange: m.referenceRange
          }))
        });
      }

      // 2. Fetch user prescriptions
      const prescriptions = await prescriptionService.getPrescriptions(userId);
      for (const p of prescriptions) {
        await indexPrescription(userId, {
          id: p.id,
          doctorName: p.doctorName,
          clinicName: p.clinicName,
          date: p.date,
          diagnosis: p.diagnosisSummary,
          medications: p.medicines?.map(m => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            timing: m.timing,
            duration: m.durationDays ? `${m.durationDays} days` : 'As directed',
            instructions: m.instructions
          })),
          advice: p.generalAdvice
        });
      }

      // 3. Fetch user cycles
      const cycles = await periodService.getCycles(userId);
      for (const c of cycles) {
        await indexPeriodLog(userId, {
          id: c.id,
          date: c.startDate,
          flow: c.flowIntensity,
          symptoms: c.symptoms,
          notes: c.notes
        });
      }

      await loadVaultData();
      setStatusMessage({ text: 'All health records successfully indexed into your RAG Vault.', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: 'Sync failed: ' + (err.message || 'Unknown error'), type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteChunk = async (chunkId: string) => {
    if (!userId) return;
    await deleteChunk(userId, chunkId);
    if (selectedChunk?.id === chunkId) setSelectedChunk(null);
    await loadVaultData();
  };

  const handleClearVault = async () => {
    if (!userId) return;
    if (window.confirm('Are you sure you want to clear your local RAG Vault? Your raw reports and prescriptions remain safe, but RAG index will be reset.')) {
      await clearUserVault(userId);
      setSelectedChunk(null);
      await loadVaultData();
      setStatusMessage({ text: 'Vault index cleared.', type: 'success' });
    }
  };

  if (!isOpen) return null;

  const filteredPersonalChunks = chunks.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      (c.metadata?.biomarkers || []).some((b: string) => b.toLowerCase().includes(q)) ||
      (c.metadata?.medications || []).some((m: string) => m.toLowerCase().includes(q))
    );
  });

  const filteredClinicalChunks = MEDICAL_KNOWLEDGE_BASE.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      (c.metadata?.relevanceAnchor || '').toLowerCase().includes(q)
    );
  });

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'medical_report':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            <FileText className="w-3 h-3" /> Report
          </span>
        );
      case 'prescription':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
            <Pill className="w-3 h-3" /> Prescription
          </span>
        );
      case 'period_symptom_log':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
            <Calendar className="w-3 h-3" /> Cycle Log
          </span>
        );
      case 'nutrition_log':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            <Apple className="w-3 h-3" /> Nutrition
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
            <BookOpen className="w-3 h-3" /> Guideline
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Health Knowledge Vault (RAG)
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Dual-Layer
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grounding AI Assistant responses in your verified records & clinical guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-6 py-3 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Total Chunks</div>
            <div className="text-base font-bold text-slate-800 dark:text-white">{stats.totalChunks}</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Report Chunks</div>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400">{stats.reportChunks}</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Rx Chunks</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{stats.prescriptionChunks}</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Cycle Chunks</div>
            <div className="text-base font-bold text-rose-600 dark:text-rose-400">{stats.cycleChunks}</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Clinical Guide Chunks</div>
            <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{MEDICAL_KNOWLEDGE_BASE.length}</div>
          </div>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs font-medium border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Actions & Search */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'personal'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Layer A: Personal Vault ({chunks.length})
            </button>
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'clinical'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              Layer B: Clinical Guidelines ({MEDICAL_KNOWLEDGE_BASE.length})
            </button>
          </div>

          {/* Search + Sync + Clear */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search chunks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {activeTab === 'personal' && (
              <>
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  title="Scan user reports, prescriptions, and cycle records to index them into RAG"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Vault'}</span>
                </button>
                <button
                  onClick={handleClearVault}
                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Clear RAG Vault index"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'personal' ? (
            filteredPersonalChunks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Database className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-medium">No personal health chunks indexed yet.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Upload reports in Medical Reports, add prescriptions, or click &quot;Sync Vault&quot; above to automatically index your existing health records.
                </p>
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Sync & Index My Records Now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPersonalChunks.map(chunk => (
                  <div
                    key={chunk.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getSourceBadge(chunk.sourceType)}
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
                          {chunk.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-400">
                          {new Date(chunk.timestamp).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteChunk(chunk.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete chunk from vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-mono bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                      {chunk.content}
                    </p>

                    {chunk.metadata && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        {chunk.metadata.biomarkers?.map((b: string) => (
                          <span key={b} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                            {b}
                          </span>
                        ))}
                        {chunk.metadata.medications?.map((m: string) => (
                          <span key={m} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2">
              {filteredClinicalChunks.map(chunk => (
                <div
                  key={chunk.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getSourceBadge(chunk.sourceType)}
                      <h4 className="font-semibold text-xs text-slate-800 dark:text-white truncate">
                        {chunk.title}
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                      {chunk.metadata?.clinicalDomain?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>RAG Isolation Mode: User-Scoped IndexedDB (100% Client-Side Privacy)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
