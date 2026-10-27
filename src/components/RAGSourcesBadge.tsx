import React, { useState } from 'react';
import { Database, ShieldCheck, ChevronDown, ChevronUp, FileText, Pill, Calendar, Apple, BookOpen } from 'lucide-react';
import { RAGRetrievedSource } from '../types/rag';

interface RAGSourcesBadgeProps {
  sources: RAGRetrievedSource[];
  className?: string;
}

export const RAGSourcesBadge: React.FC<RAGSourcesBadgeProps> = ({ sources, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  if (!sources || sources.length === 0) return null;

  const personalSources = sources.filter(s => s.layer === 'personal');
  const clinicalSources = sources.filter(s => s.layer === 'clinical');

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'medical_report':
        return <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
      case 'prescription':
        return <Pill className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
      case 'period_symptom_log':
        return <Calendar className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />;
      case 'nutrition_log':
        return <Apple className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />;
    }
  };

  return (
    <div className={`mt-2 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 text-xs overflow-hidden transition-all ${className}`}>
      {/* Header Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>RAG Verified Grounding</span>
          </div>

          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {sources.length} {sources.length === 1 ? 'source' : 'sources'} retrieved
          </span>

          {personalSources.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {personalSources.length} Vault
            </span>
          )}

          {clinicalSources.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              {clinicalSources.length} Clinical
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <span className="text-[11px] hidden sm:inline">{isOpen ? 'Hide context' : 'View sources'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Sources Panel */}
      {isOpen && (
        <div className="p-3 pt-1 border-t border-emerald-100 dark:border-emerald-800/40 space-y-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            This answer is grounded in your private encrypted health vault and verified clinical reference guidelines.
          </p>

          {/* Layer A: Personal Sources */}
          {personalSources.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-blue-500" />
                Personal Health Vault Records
              </div>
              <div className="space-y-1.5">
                {personalSources.map(src => {
                  const isItemExpanded = expandedChunkId === src.chunk.id;
                  const matchPct = Math.round(src.relevanceScore * 100);

                  return (
                    <div
                      key={src.chunk.id}
                      className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer gap-2"
                        onClick={() => setExpandedChunkId(isItemExpanded ? null : src.chunk.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getSourceIcon(src.chunk.sourceType)}
                          <span className="font-medium truncate text-xs">{src.chunk.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {matchPct}% match
                          </span>
                          {isItemExpanded ? (
                            <ChevronUp className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Keywords pills */}
                      {src.matchedKeywords && src.matchedKeywords.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-400">Matched:</span>
                          {src.matchedKeywords.slice(0, 4).map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Expanded chunk content */}
                      {isItemExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 dark:bg-slate-950 p-2 rounded">
                          {src.chunk.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Layer B: Clinical Sources */}
          {clinicalSources.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                Curated Clinical Guidelines
              </div>
              <div className="space-y-1.5">
                {clinicalSources.map(src => {
                  const isItemExpanded = expandedChunkId === src.chunk.id;
                  const matchPct = Math.round(src.relevanceScore * 100);

                  return (
                    <div
                      key={src.chunk.id}
                      className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer gap-2"
                        onClick={() => setExpandedChunkId(isItemExpanded ? null : src.chunk.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getSourceIcon(src.chunk.sourceType)}
                          <span className="font-medium truncate text-xs">{src.chunk.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {matchPct}% match
                          </span>
                          {isItemExpanded ? (
                            <ChevronUp className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {src.matchedKeywords && src.matchedKeywords.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-400">Matched:</span>
                          {src.matchedKeywords.slice(0, 4).map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      {isItemExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950 p-2 rounded">
                          {src.chunk.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
