import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28'
};

/**
 * Minimalist, Modern Healthcare Vector Illustrations (Apple Health × Linear style)
 * Clean geometry, subtle duotone palettes, dark/light responsive.
 */

// 1. Home / General Health Overview
export const HealthOverviewIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-teal-500/10 dark:fill-teal-400/10 stroke-teal-500/30 dark:stroke-teal-400/20" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="32" className="fill-white dark:fill-slate-900 stroke-teal-500/20 dark:stroke-teal-400/20" strokeWidth="1.5" />
    {/* Concentric subtle rhythm circles */}
    <circle cx="50" cy="50" r="22" className="stroke-emerald-500/30 dark:stroke-emerald-400/30" strokeWidth="1" strokeDasharray="3 3" />
    {/* ECG / Vitals wave */}
    <path
      d="M26 50H38L43 36L49 64L54 44L58 53L62 50H74"
      className="stroke-teal-600 dark:stroke-teal-400"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="62" cy="50" r="3" className="fill-emerald-500 dark:fill-emerald-400" />
    {/* Soft floating status nodes */}
    <circle cx="32" cy="28" r="4" className="fill-teal-400/60" />
    <circle cx="68" cy="72" r="3" className="fill-emerald-400/60" />
  </svg>
);

// 2. Symptom Guidance (Stethoscope & Heart Pulse)
export const SymptomGuidanceIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-sky-500/10 dark:fill-sky-400/10 stroke-sky-500/30 dark:stroke-sky-400/20" strokeWidth="1.5" />
    {/* Stethoscope loop */}
    <path
      d="M32 26V40C32 50 40 58 50 58C60 58 68 50 68 40V26"
      className="stroke-sky-600 dark:stroke-sky-400"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M50 58V72C50 75 53 78 56 78H62"
      className="stroke-sky-600 dark:stroke-sky-400"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Chest piece bell */}
    <circle cx="68" cy="78" r="7" className="fill-white dark:fill-slate-900 stroke-sky-600 dark:stroke-sky-400" strokeWidth="2" />
    <circle cx="68" cy="78" r="3" className="fill-teal-500 dark:fill-teal-400" />
    {/* Earpieces */}
    <circle cx="32" cy="24" r="3" className="fill-sky-600 dark:fill-sky-400" />
    <circle cx="68" cy="24" r="3" className="fill-sky-600 dark:fill-sky-400" />
    {/* Gentle pulse heart in center */}
    <path
      d="M50 35C47 31 41 31 39 35C36 40 43 46 50 50C57 46 64 40 61 35C59 31 53 31 50 35Z"
      className="fill-rose-500/20 stroke-rose-500 dark:stroke-rose-400"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// 3. Food & Nutrition (Minimal Bowl & Wholesome Plate)
export const NutritionIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-amber-500/10 dark:fill-amber-400/10 stroke-amber-500/30 dark:stroke-amber-400/20" strokeWidth="1.5" />
    {/* Clean minimalist ceramic bowl */}
    <path
      d="M24 50C24 64 36 74 50 74C64 74 76 64 76 50H24Z"
      className="fill-white dark:fill-slate-900 stroke-amber-600 dark:stroke-amber-400"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="50" cy="50" rx="26" ry="6" className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-600 dark:stroke-amber-400" strokeWidth="2" />
    {/* Fresh botanical garnish / leaf */}
    <path
      d="M50 48C46 40 42 36 36 36C36 43 41 47 50 48Z"
      className="fill-emerald-500/40 stroke-emerald-600 dark:stroke-emerald-400"
      strokeWidth="1.5"
    />
    <path
      d="M50 48C54 38 60 34 66 35C66 42 60 47 50 48Z"
      className="fill-teal-500/40 stroke-teal-600 dark:stroke-teal-400"
      strokeWidth="1.5"
    />
    {/* Avocado / nutrient dot */}
    <circle cx="50" cy="38" r="3.5" className="fill-amber-500 dark:fill-amber-400" />
  </svg>
);

// 4. Medical Reports (Clinical Document & Lab Metrics)
export const MedicalReportsIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-purple-500/10 dark:fill-purple-400/10 stroke-purple-500/30 dark:stroke-purple-400/20" strokeWidth="1.5" />
    {/* Document sheet */}
    <rect x="28" y="22" width="44" height="56" rx="6" className="fill-white dark:fill-slate-900 stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" />
    {/* Document lines */}
    <line x1="36" y1="34" x2="52" y2="34" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="42" x2="64" y2="42" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="50" x2="60" y2="50" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="58" x2="48" y2="58" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" strokeLinecap="round" />
    {/* Medical verification badge */}
    <circle cx="62" cy="62" r="10" className="fill-teal-500 dark:fill-teal-400" />
    <path d="M58 62L61 65L67 59" className="stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 5. Prescriptions (Medicine Vial & Dosage Slip)
export const PrescriptionsIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-rose-500/10 dark:fill-rose-400/10 stroke-rose-500/30 dark:stroke-rose-400/20" strokeWidth="1.5" />
    {/* Prescription slip */}
    <rect x="22" y="26" width="38" height="50" rx="5" className="fill-white dark:fill-slate-900 stroke-rose-600 dark:stroke-rose-400" strokeWidth="2" />
    <path d="M28 36H44M28 44H52M28 52H40M28 60H48" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinecap="round" />
    <text x="30" y="34" className="fill-rose-600 dark:fill-rose-400 text-[10px] font-black">Rx</text>
    {/* Medicine capsule bottle */}
    <rect x="52" y="40" width="26" height="36" rx="6" className="fill-rose-50 dark:fill-rose-950/60 stroke-rose-600 dark:stroke-rose-400" strokeWidth="2" />
    <rect x="56" y="34" width="18" height="6" rx="2" className="fill-rose-600 dark:fill-rose-400" />
    <path d="M58 58H72" className="stroke-rose-400 dark:stroke-rose-500" strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="65" cy="50" r="3" className="fill-teal-500" />
  </svg>
);

// 6. Doctor Finder (Location Pin & Healthcare Cross)
export const DoctorFinderIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-emerald-500/10 dark:fill-emerald-400/10 stroke-emerald-500/30 dark:stroke-emerald-400/20" strokeWidth="1.5" />
    {/* Modern radar ring */}
    <circle cx="50" cy="50" r="28" className="stroke-emerald-500/30" strokeWidth="1" strokeDasharray="4 4" />
    {/* Location pin */}
    <path
      d="M50 24C41 24 34 31 34 40C34 52 50 72 50 72C50 72 66 52 66 40C66 31 59 24 50 24Z"
      className="fill-white dark:fill-slate-900 stroke-emerald-600 dark:stroke-emerald-400"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Medical cross inside pin */}
    <path d="M50 34V46M44 40H56" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 7. Supplements & Nutrition (Botanical Leaf & Clean Capsule)
export const SupplementsIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-indigo-500/10 dark:fill-indigo-400/10 stroke-indigo-500/30 dark:stroke-indigo-400/20" strokeWidth="1.5" />
    {/* Botanical leaf */}
    <path
      d="M32 68C32 46 44 32 68 28C68 52 54 68 32 68Z"
      className="fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M32 68C42 54 52 44 68 28" className="stroke-emerald-600/70 dark:stroke-emerald-400/70" strokeWidth="1.5" strokeLinecap="round" />
    {/* Pharmaceutical capsule */}
    <g transform="rotate(45 58 58)">
      <rect x="46" y="44" width="24" height="12" rx="6" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-700" strokeWidth="1.5" />
      <rect x="58" y="44" width="12" height="12" rx="0" className="fill-white dark:fill-slate-200 stroke-indigo-700" strokeWidth="1.5" />
    </g>
  </svg>
);

// 8. Period Tracker & Menstrual Wellness (Blush Crescent & Wellness Blossom)
export const PeriodTrackerIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-pink-500/10 dark:fill-pink-400/10 stroke-pink-500/30 dark:stroke-pink-400/20" strokeWidth="1.5" />
    {/* Lunar cycle crescent */}
    <path
      d="M50 24C44 24 38 27 34 32C42 34 48 42 48 50C48 58 42 66 34 68C38 73 44 76 50 76C64 76 76 64 76 50C76 36 64 24 50 24Z"
      className="fill-pink-500/20 stroke-pink-500 dark:stroke-pink-400"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Delicate wellness blossom petal */}
    <circle cx="38" cy="50" r="5" className="fill-rose-400" />
    <circle cx="44" cy="44" r="3.5" className="fill-pink-300" />
    <circle cx="44" cy="56" r="3.5" className="fill-pink-300" />
    <circle cx="32" cy="44" r="3.5" className="fill-pink-300" />
    <circle cx="32" cy="56" r="3.5" className="fill-pink-300" />
    <circle cx="38" cy="50" r="2" className="fill-white" />
  </svg>
);

// 9. Reminders (Clock & Notification Chime)
export const RemindersIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-orange-500/10 dark:fill-orange-400/10 stroke-orange-500/30 dark:stroke-orange-400/20" strokeWidth="1.5" />
    {/* Minimalist clock face */}
    <circle cx="46" cy="54" r="22" className="fill-white dark:fill-slate-900 stroke-orange-600 dark:stroke-orange-400" strokeWidth="2" />
    <path d="M46 42V54L54 58" className="stroke-orange-600 dark:stroke-orange-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Notification Bell overlay */}
    <path
      d="M62 26C62 23 60 21 57 21C54 21 52 23 52 26C48 28 46 32 46 38V44L43 47H71L68 44V38C68 32 66 28 62 26Z"
      className="fill-teal-500 dark:fill-teal-400 stroke-white dark:stroke-slate-900"
      strokeWidth="1.5"
    />
    <circle cx="57" cy="50" r="2" className="fill-white" />
  </svg>
);

// 10. Mental Wellbeing (Calm Zen Wave & Breathing Rings)
export const MentalWellbeingIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'md' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 group-hover:scale-105`}
    aria-hidden="true"
  >
    <rect x="8" y="8" width="84" height="84" rx="24" className="fill-cyan-500/10 dark:fill-cyan-400/10 stroke-cyan-500/30 dark:stroke-cyan-400/20" strokeWidth="1.5" />
    {/* Expanding calming breath wave */}
    <circle cx="50" cy="50" r="30" className="stroke-cyan-500/20" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="20" className="stroke-teal-500/40" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="10" className="fill-cyan-500/30 stroke-cyan-600 dark:stroke-cyan-400" strokeWidth="1.5" />
    {/* Harmonious flow curve */}
    <path
      d="M26 62C36 50 44 68 54 50C64 32 72 50 78 40"
      className="stroke-teal-600 dark:stroke-teal-400"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 11. Authentication & Trust (Minimalist Stethoscope, Heart, Healthcare Cross & Wellness Leaf)
export const AuthIllustration: React.FC<IllustrationProps> = ({ className = '', size = 'lg' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${sizeMap[size]} ${className} transition-transform duration-300 hover:scale-105`}
    aria-hidden="true"
  >
    {/* Subtle outer squircle container with ambient aura */}
    <rect
      x="6"
      y="6"
      width="108"
      height="108"
      rx="32"
      className="fill-teal-500/5 dark:fill-teal-400/10 stroke-teal-500/20 dark:stroke-teal-400/20"
      strokeWidth="1.5"
    />

    {/* Very subtle background orbital concentric guide ring */}
    <circle
      cx="60"
      cy="60"
      r="44"
      className="stroke-slate-300/40 dark:stroke-slate-700/40"
      strokeWidth="1"
      strokeDasharray="4 4"
    />

    {/* Center soft backdrop disc */}
    <circle
      cx="60"
      cy="60"
      r="32"
      className="fill-white/80 dark:fill-slate-900/80 stroke-teal-500/20 dark:stroke-teal-400/20"
      strokeWidth="1"
    />

    {/* Minimalist Line-Art Stethoscope looping gracefully into heart silhouette */}
    {/* Stethoscope Earpieces */}
    <path
      d="M48 26C48 24 50 22 52 22M68 26C68 24 66 22 64 22"
      className="stroke-teal-600 dark:stroke-teal-400"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M48 26V34C48 40 54 44 60 44C66 44 72 40 72 34V26"
      className="stroke-teal-600 dark:stroke-teal-400"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Central Heart Contour formed by stethoscope tube */}
    <path
      d="M60 44V50C60 50 42 46 36 60C30 74 52 86 60 92C68 86 90 74 84 60C78 46 60 50 60 50"
      className="stroke-teal-600 dark:stroke-teal-400 fill-teal-500/5 dark:fill-teal-400/10"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Stethoscope Chest Piece Sensor */}
    <circle
      cx="60"
      cy="92"
      r="4"
      className="fill-emerald-500 dark:fill-emerald-400 stroke-teal-700 dark:stroke-teal-300"
      strokeWidth="1.5"
    />

    {/* Minimalist Healthcare Cross inside heart */}
    <rect
      x="57"
      y="58"
      width="6"
      height="18"
      rx="2"
      className="fill-teal-600 dark:fill-teal-400"
    />
    <rect
      x="51"
      y="64"
      width="18"
      height="6"
      rx="2"
      className="fill-teal-600 dark:fill-teal-400"
    />

    {/* Small elegant wellness leaf accent */}
    <path
      d="M86 42C86 42 80 44 78 50C84 50 88 46 86 42Z"
      className="fill-emerald-500/80 dark:fill-emerald-400/80 stroke-emerald-600 dark:stroke-emerald-400"
      strokeWidth="1"
      strokeLinejoin="round"
    />

    {/* Subtle floating wellness sparkle particles */}
    <circle cx="34" cy="38" r="2" className="fill-teal-400/70 animate-pulse" />
    <circle cx="88" cy="74" r="1.5" className="fill-emerald-400/80" />
    <circle cx="30" cy="78" r="1.5" className="fill-teal-500/60" />
  </svg>
);
