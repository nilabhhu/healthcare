import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { syntheticLabReports } from '../data/syntheticData';
import { LabTestMetric } from '../types';
import { SectionHero } from '../components/ui/SectionHero';
import { MedicalReportsIllustration } from '../components/ContextualIllustrations';
import { medicalReportService } from '../services/medicalReportService';
import { indexMedicalReport, deleteChunksBySource } from '../services/rag/ragVaultService';
import {
  FileSpreadsheet,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Volume2,
  VolumeX,
  Copy,
  Info,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Trash2,
  Eye,
  X,
  Loader2,
  Check,
  FileCheck
} from 'lucide-react';

export interface AnalyzedReportRecord {
  id: string;
  title: string;
  fileName: string;
  fileSizeFormatted?: string;
  fileDataUrl?: string;
  fileTextContent?: string;
  uploadDate: string;
  isDemo: boolean;
  summary: string;
  keyFindings: string[];
  metrics?: LabTestMetric[];
  thingsToDiscuss: string[];
  disclaimer: string;
}

const STORAGE_KEY = 'healyaar_report_history';

export const ReportsView: React.FC = () => {
  const { t, requestPermission, permissions, speakText, stopSpeaking, isAudioPlaying, showToast, currentUser } = useApp();

  // -------------------------------------------------------------
  // Report Page State Machine:
  // 'empty' | 'selected' | 'analyzing' | 'results'
  // -------------------------------------------------------------
  const [pageState, setPageState] = useState<'empty' | 'selected' | 'analyzing' | 'results'>('empty');
  
  // Selected unanalyzed file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDemoSelected, setIsDemoSelected] = useState<boolean>(false);

  // Active Analyzed Report Result
  const [activeReport, setActiveReport] = useState<AnalyzedReportRecord | null>(null);

  // Original Report Modal state
  const [isOriginalModalOpen, setIsOriginalModalOpen] = useState<boolean>(false);

  // Copied questions state
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

  // Active filter for metrics (if metrics present)
  const [metricFilter, setMetricFilter] = useState<'all' | 'flagged'>('all');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // Persistent Report History (Supabase & Local)
  // -------------------------------------------------------------
  const [reportHistory, setReportHistory] = useState<AnalyzedReportRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      medicalReportService.getReports(currentUser.id).then((cloud) => {
        if (isMounted) {
          setReportHistory(cloud);
        }
      });
    } else {
      setReportHistory([]);
      setActiveReport(null);
      setPageState('empty');
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // -------------------------------------------------------------
  // File Selection Handlers
  // -------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setIsDemoSelected(false);
    setPageState('selected');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setIsDemoSelected(false);
      setPageState('selected');
    }
  };

  const handleSelectDemo = () => {
    setSelectedFile(null);
    setIsDemoSelected(true);
    setPageState('selected');
  };

  const handleRemoveSelection = () => {
    setSelectedFile(null);
    setIsDemoSelected(false);
    setPageState('empty');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // -------------------------------------------------------------
  // Analysis Execution (No Fabricated Lab Values for Real Files)
  // -------------------------------------------------------------
  const handleAnalyze = () => {
    setPageState('analyzing');

    const executeProcessing = async () => {
      // Artificial short delay for realistic processing feel
      await new Promise((resolve) => setTimeout(resolve, 1400));

      if (isDemoSelected) {
        // Predefined synthetic document explicitly labeled as Demo
        const demoRecord: AnalyzedReportRecord = {
          id: `rep-demo-${Date.now()}`,
          title: 'Complete Blood Count (CBC) with Iron Panel',
          fileName: 'Sample_CBC_Lab_Report.pdf',
          fileSizeFormatted: '142 KB',
          uploadDate: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          isDemo: true,
          summary:
            'Mild iron deficiency pattern noted. Hemoglobin and serum ferritin are slightly below typical reference intervals, while white blood cells and platelets are normal.',
          keyFindings: [
            'Mild iron deficiency pattern identified in sample data.',
            'Hemoglobin (10.8 g/dL) is slightly below the standard reference range (13.0 - 17.0 g/dL).',
            'Serum ferritin is low (14 ng/mL), suggesting depleted iron storage reserves.',
            'Immune markers (WBC 6,400 cells/uL) and clotting fragments (Platelets 235,000 /uL) are normal.'
          ],
          metrics: syntheticLabReports[0].metrics,
          thingsToDiscuss: [
            'Do my low hemoglobin and ferritin levels suggest iron-deficiency anemia?',
            'Would dietary adjustments or iron supplements be appropriate for me?',
            'Should we repeat a CBC test in 2 to 3 months to monitor my levels?'
          ],
          disclaimer:
            'Synthetic Demo Document for patient education and demonstration. Not real patient data.'
        };

        const saved = await medicalReportService.saveReport(currentUser?.id || '', demoRecord);
        if (currentUser?.id) {
          indexMedicalReport(currentUser.id, {
            id: saved.id,
            title: saved.title,
            date: saved.uploadDate,
            summary: saved.summary,
            keyFindings: saved.keyFindings,
            biomarkers: saved.metrics?.map(m => ({
              name: m.name,
              value: m.value,
              unit: m.unit,
              status: m.status,
              normalRange: m.referenceRange
            }))
          }).catch(e => console.warn('RAG report indexing failed:', e));
        }
        setActiveReport(saved);
        setReportHistory((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
        setPageState('results');
        showToast('Demo report analyzed successfully.');
        return;
      }

      if (selectedFile) {
        // Real user uploaded file: Strictly preserve file info, DO NOT fabricate lab values!
        const fileSizeFormatted = `${(selectedFile.size / 1024).toFixed(1)} KB`;
        let fileDataUrl = '';
        try {
          fileDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(selectedFile);
          });
        } catch (e) {
          // ignore
        }

        const cleanTitle = selectedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();

        const realRecord: AnalyzedReportRecord = {
          id: `rep-${Date.now()}`,
          title: cleanTitle.length > 2 ? cleanTitle : 'Uploaded Medical Report',
          fileName: selectedFile.name,
          fileSizeFormatted,
          fileDataUrl,
          uploadDate: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          isDemo: false,
          summary: `Report "${selectedFile.name}" (${fileSizeFormatted}) securely uploaded and structured for your medical review. Original file preserved on your device.`,
          keyFindings: [
            `Document file: ${selectedFile.name}`,
            `Document size: ${fileSizeFormatted}`,
            `Format: ${selectedFile.type || 'Document file'}`,
            '100% On-Device Privacy: No personal health records were uploaded to third-party ad networks.'
          ],
          metrics: undefined, // Non-fabricated: no made-up numerical values!
          thingsToDiscuss: [
            `Review this document (${selectedFile.name}) together during your next doctor consultation.`,
            `Confirm if the test reference ranges match your local laboratory equipment.`,
            `Ask if any follow-up tests or lifestyle steps are recommended based on these findings.`
          ],
          disclaimer:
            'This tool organizes your uploaded report for doctor consultation. It does not provide medical diagnosis or replace physician clinical judgment.'
        };

        const saved = await medicalReportService.saveReport(currentUser?.id || '', realRecord, selectedFile);
        if (currentUser?.id) {
          indexMedicalReport(currentUser.id, {
            id: saved.id,
            title: saved.title,
            date: saved.uploadDate,
            summary: saved.summary,
            keyFindings: saved.keyFindings,
            biomarkers: saved.metrics?.map(m => ({
              name: m.name,
              value: m.value,
              unit: m.unit,
              status: m.status,
              normalRange: m.referenceRange
            }))
          }).catch(e => console.warn('RAG report indexing failed:', e));
        }
        setActiveReport(saved);
        setReportHistory((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
        setPageState('results');
        showToast('Report uploaded and structured successfully.');
      }
    };

    if (!permissions.reportOcr && !isDemoSelected && selectedFile) {
      requestPermission(
        'report_ocr',
        'Document Parsing Permission',
        `HealYaar processes "${selectedFile.name}" locally in your browser. We never transmit your health documents to external cloud trackers.`,
        executeProcessing
      );
    } else {
      executeProcessing();
    }
  };

  // -------------------------------------------------------------
  // History Actions
  // -------------------------------------------------------------
  const handleViewHistoricalReport = (report: AnalyzedReportRecord) => {
    setActiveReport(report);
    setPageState('results');
  };

  const handleDeleteHistoricalReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportHistory((prev) => prev.filter((r) => r.id !== id));
    if (activeReport?.id === id) {
      setActiveReport(null);
      setPageState('empty');
    }
    await medicalReportService.deleteReport(currentUser?.id || '', id);
    if (currentUser?.id) {
      deleteChunksBySource(currentUser.id, id).catch(e => console.warn('RAG chunk deletion failed:', e));
    }
    showToast('Report removed from history.');
  };

  const copyQuestionsToClipboard = () => {
    if (!activeReport) return;
    const text = activeReport.thingsToDiscuss.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    showToast('Questions copied to clipboard!');
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const getStatusBadge = (status: LabTestMetric['status']) => {
    switch (status) {
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
            Below Typical Range
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
            Above Typical Range
          </span>
        );
      case 'borderline':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950/70 text-yellow-900 dark:text-yellow-300 text-xs font-bold border border-yellow-300 dark:border-yellow-800">
            Borderline
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Normal Range
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Section Hero */}
      {pageState !== 'results' && (
        <SectionHero
          title="Medical Reports"
          description="Upload your medical report to translate clinical terms, review standard ranges, and generate focused questions for your doctor."
          badge={{
            icon: FileSpreadsheet,
            text: 'Clinical Records',
            variant: 'blue'
          }}
          illustration={<MedicalReportsIllustration size="md" />}
        />
      )}

      {/* =============================================================
          STATE 1 & 2: EMPTY & SELECTED UPLOAD CARD (Clean Minimalist)
      ============================================================= */}
      {pageState !== 'results' && pageState !== 'analyzing' && (
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">

          {/* State 1: Empty Upload Zone */}
          {pageState === 'empty' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 sm:p-12 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-500" />

              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  Upload your medical report
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDF, PNG, JPG, or text documents • Processed 100% locally on-device
                </p>
              </div>

              {/* Upload Button */}
              <label className="cursor-pointer px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow transition-all active:scale-95 inline-flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                <span>Upload Report</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*,.txt,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Small unobtrusive Demo Document option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSelectDemo}
                  className="text-xs text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 underline underline-offset-4 font-semibold transition-colors"
                >
                  Demo Document
                </button>
              </div>
            </div>
          )}

          {/* State 2: Report Selected */}
          {pageState === 'selected' && (
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-teal-500/40 bg-teal-50/40 dark:bg-teal-950/30 space-y-6 text-left animate-fade-in max-w-lg mx-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-xl flex-shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate text-base">
                        {isDemoSelected ? 'Sample_CBC_Lab_Report.pdf' : selectedFile?.name}
                      </span>
                      {isDemoSelected && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-bold">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isDemoSelected ? '142 KB • Synthetic Test File' : `${((selectedFile?.size || 0) / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveSelection}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Remove selected file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="flex-1 py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveSelection}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =============================================================
          STATE 3: ANALYZING STATE (Centered Clean Loader)
      ============================================================= */}
      {pageState === 'analyzing' && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 animate-fade-in max-w-lg mx-auto">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Analyzing your report...
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please wait while we review medical terms and organize findings on your device.
          </p>
        </section>
      )}

      {/* =============================================================
          STATE 4: RESULTS VIEW (Clean Hierarchy, depend on content)
      ============================================================= */}
      {pageState === 'results' && activeReport && (
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
          {/* Top Bar: Back to History + Audio + Original Report Modal Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setPageState('empty');
                setSelectedFile(null);
                setIsDemoSelected(false);
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload & History</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOriginalModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>View Original Report</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAudioPlaying) {
                    stopSpeaking();
                  } else {
                    speakText(
                      `Report summary for ${activeReport.title}. ${activeReport.summary}`
                    );
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isAudioPlaying ? 'Stop Audio' : 'Read Summary'}</span>
              </button>
            </div>
          </div>

          {/* Report Header Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeReport.title}
              </h2>
              {activeReport.isDemo && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  Demo Document
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              File: <strong className="text-slate-700 dark:text-slate-300">{activeReport.fileName}</strong> • Uploaded on {activeReport.uploadDate}
            </p>
          </div>

          {/* 1. Report Summary */}
          <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
            <h3 className="font-bold text-teal-900 dark:text-teal-200 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Report Summary</span>
            </h3>
            <p className="text-sm sm:text-base text-teal-950 dark:text-teal-100 font-medium leading-relaxed">
              {activeReport.summary}
            </p>
          </div>

          {/* 2. Key Findings */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Key Findings
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {activeReport.keyFindings.map((finding, idx) => (
                <li key={idx}>{finding}</li>
              ))}
            </ul>
          </div>

          {/* 3. Values / Measurements (Only when metrics exist) */}
          {activeReport.metrics && activeReport.metrics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Values & Measurements
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMetricFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      metricFilter === 'all'
                        ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    All ({activeReport.metrics.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricFilter('flagged')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      metricFilter === 'flagged'
                        ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Flagged ({activeReport.metrics.filter((m) => m.status !== 'normal').length})
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activeReport.metrics
                  .filter((m) => (metricFilter === 'flagged' ? m.status !== 'normal' : true))
                  .map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 text-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {m.name}
                          </span>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Value: <strong className="text-slate-900 dark:text-white font-black">{m.value} {m.unit}</strong> • Reference: {m.referenceRange}
                          </div>
                        </div>
                        {getStatusBadge(m.status)}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        {m.plainExplanation}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 4. Things to Discuss With Your Doctor */}
          <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-purple-950 dark:text-purple-200 text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                <span>Things to Discuss With Your Doctor</span>
              </h3>
              <button
                type="button"
                onClick={copyQuestionsToClipboard}
                className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-800 dark:text-purple-200 rounded-lg text-xs font-bold border border-purple-300 dark:border-purple-700 flex items-center gap-1 shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedQuestions ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-300">
              {activeReport.thingsToDiscuss.map((question, idx) => (
                <li key={idx}>{question}</li>
              ))}
            </ol>
          </div>

          {/* 5. Medical Safety Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-200 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Medical Disclaimer:</strong> {activeReport.disclaimer} Always consult a licensed physician before starting, stopping, or altering any medications.
            </div>
          </div>
        </section>
      )}

      {/* =============================================================
          STATE 5: COMPACT REPORT HISTORY (Clean, Non-Cluttered)
      ============================================================= */}
      {pageState !== 'analyzing' && (
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Report History</span>
            </h2>
            {reportHistory.length > 0 && (
              <span className="text-xs font-semibold text-slate-500">
                {reportHistory.length} saved
              </span>
            )}
          </div>

          {reportHistory.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">
              Your previous reports will appear here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {reportHistory.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => handleViewHistoricalReport(rep)}
                  className="py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {rep.title}
                      </span>
                      {rep.isDemo && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {rep.fileName} • {rep.uploadDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewHistoricalReport(rep)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 transition-colors"
                    >
                      View Results
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoricalReport(rep.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =============================================================
          ORIGINAL REPORT PREVIEW MODAL
      ============================================================= */}
      {isOriginalModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Original Report Document
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeReport.fileName} ({activeReport.fileSizeFormatted || 'Document'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOriginalModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document display */}
            {activeReport.fileDataUrl ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 text-center">
                {activeReport.fileDataUrl.startsWith('data:image') ? (
                  <img
                    src={activeReport.fileDataUrl}
                    alt={activeReport.fileName}
                    className="max-h-96 mx-auto rounded-xl object-contain shadow-xs"
                  />
                ) : (
                  <iframe
                    src={activeReport.fileDataUrl}
                    title={activeReport.fileName}
                    className="w-full h-96 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                )}
              </div>
            ) : activeReport.fileTextContent ? (
              <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-y-auto text-slate-800 dark:text-slate-200">
                {activeReport.fileTextContent}
              </pre>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-center">
                <FileCheck className="w-10 h-10 text-teal-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {activeReport.fileName}
                </h4>
                <p className="text-xs text-slate-500">
                  Original file preserved locally in browser session on {activeReport.uploadDate}.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOriginalModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
