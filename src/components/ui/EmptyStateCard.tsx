import React from 'react';

interface EmptyStateCardProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  illustration,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`interactive-card glass-card p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-sm ${className}`}
    >
      {illustration ? (
        <div className="flex justify-center mb-2">{illustration}</div>
      ) : icon ? (
        <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
          {icon}
        </div>
      ) : null}

      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="interactive-button px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-sm"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export const SkeletonCard: React.FC<{ count?: number; lines?: number }> = ({ count = 1, lines = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-16" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, lineIdx) => (
              <div
                key={lineIdx}
                className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                style={{ width: `${85 - lineIdx * 15}%` }}
              />
            ))}
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-28" />
          </div>
        </div>
      ))}
    </>
  );
};
