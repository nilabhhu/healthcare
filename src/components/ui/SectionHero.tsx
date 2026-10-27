import React from 'react';

export interface SectionHeroBadgeConfig {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  text: string;
  variant?: 'teal' | 'emerald' | 'amber' | 'blue' | 'purple' | 'pink' | 'rose' | 'slate' | string;
}

export interface SectionHeroProps {
  title: string;
  description: string;
  badge?: string | SectionHeroBadgeConfig;
  badgeIcon?: React.ReactNode;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHero: React.FC<SectionHeroProps> = ({
  title,
  description,
  badge,
  badgeIcon,
  illustration,
  action,
  actions,
  className = ''
}) => {
  const finalAction = actions || action;

  // Determine badge styling based on variant if badge is an object
  const renderBadge = () => {
    if (!badge) return null;

    if (typeof badge === 'string') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200/60 dark:border-teal-800/60 mb-1">
          {badgeIcon}
          <span>{badge}</span>
        </div>
      );
    }

    const { icon: BadgeIcon, text, variant = 'teal' } = badge;

    const variantStyles: Record<string, string> = {
      teal: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60',
      emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
      amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
      blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
      purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
      pink: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
      rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
      slate: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    };

    const colorClass = variantStyles[variant] || variantStyles.teal;

    const renderBadgeIcon = () => {
      if (React.isValidElement(BadgeIcon)) {
        return BadgeIcon;
      }
      if (BadgeIcon) {
        const IconComponent = BadgeIcon as React.ComponentType<{ className?: string }>;
        return <IconComponent className="w-3.5 h-3.5" />;
      }
      if (badgeIcon) {
        return badgeIcon;
      }
      return null;
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1 ${colorClass}`}>
        {renderBadgeIcon()}
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div
      className={`interactive-card glass-card-hero rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group ${className}`}
    >
      {/* Left Content */}
      <div className="space-y-2 max-w-2xl min-w-0">
        {renderBadge()}

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {description}
        </p>

        {finalAction && <div className="pt-2">{finalAction}</div>}
      </div>

      {/* Right Contextual Illustration */}
      {illustration && (
        <div className="flex-shrink-0 flex items-center justify-center p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 self-start sm:self-auto transition-transform duration-300 group-hover:scale-105">
          {illustration}
        </div>
      )}
    </div>
  );
};
