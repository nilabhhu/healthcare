import React from 'react';

/**
 * High-fidelity, polished semi-realistic 3D healthcare & wellness SVG illustrations.
 * Styled with soft gradients, frosted specular highlights, inner shadows, and rim glows.
 * Optimized for GPU rendering, lightweight, scalable, and responsive to both Light & Dark modes.
 */

export interface FloatingObjectProps {
  className?: string;
  isDark?: boolean;
}

// ---------------------------------------------------------------------------
// 1. DIETARY SUPPLEMENTS & FITNESS
// ---------------------------------------------------------------------------

/** Large Two-Tone Vitamin Capsule with Translucent Glass Sheen & Pellets */
export const CapsuleTwoTone: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="capTealGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#14b8a6" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="capGoldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="capGlossHighlight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
      </linearGradient>
      <filter id="capShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0d9488" floodOpacity="0.2" />
      </filter>
    </defs>

    <g filter="url(#capShadow)">
      {/* Upper Half: Teal Capsule Dome */}
      <path
        d="M30 130V80C30 52.3858 52.3858 30 80 30C107.614 30 130 52.3858 130 80V130H30Z"
        fill="url(#capTealGrad)"
      />
      {/* Lower Half: Warm Golden Translucent Dome */}
      <path
        d="M30 130V180C30 207.614 52.3858 230 80 230C107.614 230 130 207.614 130 180V130H30Z"
        fill="url(#capGoldGrad)"
      />
      {/* Center Band Ring */}
      <rect x="28" y="127" width="104" height="6" rx="3" fill="#ffffff" fillOpacity="0.4" />

      {/* Tiny Internal Micronutrient Pellets (Floating inside lower half) */}
      <circle cx="65" cy="165" r="5" fill="#fef3c7" fillOpacity="0.7" />
      <circle cx="95" cy="175" r="4" fill="#fde68a" fillOpacity="0.6" />
      <circle cx="75" cy="195" r="4.5" fill="#fef3c7" fillOpacity="0.65" />
      <circle cx="85" cy="155" r="3.5" fill="#fff" fillOpacity="0.75" />

      {/* Long Specular 3D Reflection Streak */}
      <path
        d="M44 65C44 50 56 42 70 42C74 42 74 46 70 46C58 46 48 54 48 68V190C48 194 44 194 44 190V65Z"
        fill="url(#capGlossHighlight)"
      />
      {/* Secondary Soft Rim Reflection */}
      <path
        d="M116 85V175"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
    </g>
  </svg>
);

/** Translucent Amber Omega-3 Softgel with Refractive Glow */
export const SoftgelAmber: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="softgelGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.75" />
        <stop offset="85%" stopColor="#d97706" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
      </linearGradient>
      <radialGradient id="softgelCore" cx="45%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.6" />
        <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
      </radialGradient>
      <filter id="softgelGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#f59e0b" floodOpacity="0.25" />
      </filter>
    </defs>

    <g filter="url(#softgelGlow)">
      {/* Pill Body Oval */}
      <ellipse cx="100" cy="65" rx="75" ry="42" fill="url(#softgelGrad)" />
      {/* Inner Liquid Core Glow */}
      <ellipse cx="96" cy="62" rx="60" ry="32" fill="url(#softgelCore)" />
      {/* Top Gloss Arc Highlight */}
      <path
        d="M48 52C58 38 85 30 125 32C142 33 148 37 138 38C105 37 68 44 54 56C48 61 44 57 48 52Z"
        fill="#ffffff"
        fillOpacity="0.65"
      />
      {/* Bottom Rim Reflection */}
      <path
        d="M65 88C85 96 118 97 145 88"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
    </g>
  </svg>
);

/** Embossed Round Supplement Tablet with Center Score Line */
export const TabletRound: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="tabGrad" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#e2e8f0" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="tabBevel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.4" />
      </linearGradient>
      <filter id="tabShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0f172a" floodOpacity="0.12" />
      </filter>
    </defs>

    <g filter="url(#tabShadow)">
      {/* Outer Cylinder Edge / Bevel */}
      <circle cx="70" cy="70" r="50" fill="url(#tabBevel)" />
      {/* Inner Flat Tablet Face */}
      <circle cx="70" cy="68" r="46" fill="url(#tabGrad)" />
      {/* Embossed Center Score Line */}
      <rect x="36" y="66" width="68" height="4" rx="2" fill="#94a3b8" fillOpacity="0.45" />
      <rect x="36" y="68" width="68" height="2" rx="1" fill="#ffffff" fillOpacity="0.7" />
      {/* Soft Light Crescent Ring */}
      <path
        d="M32 60C38 38 60 26 84 28"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
    </g>
  </svg>
);

/** Frosted Glass Supplement Bottle with Cap */
export const SupplementBottle: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="botGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
        <stop offset="50%" stopColor="#0d9488" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#115e59" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="botCap" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="50%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
    </defs>

    {/* Bottle Neck & Cap */}
    <rect x="52" y="24" width="56" height="26" rx="6" fill="url(#botCap)" />
    <path d="M56 24H104" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
    <rect x="58" y="50" width="44" height="12" fill="#0f766e" fillOpacity="0.4" />

    {/* Main Bottle Body with Rounded Shoulders */}
    <path
      d="M36 86C36 68 50 62 64 62H96C110 62 124 68 124 86V196C124 208 114 218 102 218H58C46 218 36 208 36 196V86Z"
      fill="url(#botGlass)"
      stroke="#2dd4bf"
      strokeWidth="2.5"
      strokeOpacity="0.4"
    />

    {/* Translucent Frosted Label Area */}
    <rect x="42" y="104" width="76" height="76" rx="12" fill="#ffffff" fillOpacity="0.3" />
    <rect x="54" y="122" width="52" height="6" rx="3" fill="#0d9488" fillOpacity="0.5" />
    <rect x="54" y="136" width="38" height="4" rx="2" fill="#0d9488" fillOpacity="0.3" />
    <rect x="54" y="148" width="44" height="4" rx="2" fill="#0d9488" fillOpacity="0.3" />

    {/* Vertical Specular Glass Highlight */}
    <path
      d="M48 88V198"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />
  </svg>
);

/** Floating Micronutrient Molecule Sparkle */
export const NutrientMolecule: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(-30 60 60)" stroke="#14b8a6" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 3" />
    <ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(30 60 60)" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 3" />
    {/* Central Core */}
    <circle cx="60" cy="60" r="14" fill="#0d9488" fillOpacity="0.75" />
    <circle cx="56" cy="56" r="4" fill="#ffffff" fillOpacity="0.8" />
    {/* Orbiting Satellite Atoms */}
    <circle cx="28" cy="42" r="6" fill="#38bdf8" fillOpacity="0.8" />
    <circle cx="92" cy="78" r="5" fill="#f59e0b" fillOpacity="0.8" />
  </svg>
);

// ---------------------------------------------------------------------------
// 2. FOOD / NUTRITION CALCULATOR
// ---------------------------------------------------------------------------

/** Halved Fresh Avocado with 3D Seed */
export const AvocadoHalf: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 180 230" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="avoSkin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#14532d" />
        <stop offset="100%" stopColor="#052e16" />
      </linearGradient>
      <linearGradient id="avoFlesh" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#d9f99d" />
        <stop offset="50%" stopColor="#bef264" />
        <stop offset="100%" stopColor="#65a30d" />
      </linearGradient>
      <radialGradient id="avoSeed" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#a16207" />
        <stop offset="60%" stopColor="#713f12" />
        <stop offset="100%" stopColor="#451a03" />
      </radialGradient>
      <filter id="avoShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#14532d" floodOpacity="0.2" />
      </filter>
    </defs>

    <g filter="url(#avoShadow)">
      {/* Outer Dark Green Skin */}
      <path
        d="M90 20C65 20 40 46 40 85C40 120 25 145 25 170C25 202 52 220 90 220C128 220 155 202 155 170C155 145 140 120 140 85C140 46 115 20 90 20Z"
        fill="url(#avoSkin)"
      />
      {/* Creamy Lime Flesh */}
      <path
        d="M90 28C70 28 48 50 48 85C48 120 34 145 34 168C34 195 58 212 90 212C122 212 146 195 146 168C146 145 132 120 132 85C132 50 110 28 90 28Z"
        fill="url(#avoFlesh)"
      />
      {/* Glossy 3D Brown Seed */}
      <circle cx="90" cy="155" r="32" fill="url(#avoSeed)" />
      {/* Seed Specular Shine */}
      <ellipse cx="80" cy="144" rx="8" ry="5" transform="rotate(-30 80 144)" fill="#ffffff" fillOpacity="0.65" />
      {/* Rim Light */}
      <path
        d="M56 80C56 58 72 38 90 38"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
    </g>
  </svg>
);

/** Stylized Fresh Broccoli Floret */
export const BroccoliFloret: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="brocStalk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#84cc16" />
        <stop offset="100%" stopColor="#4d7c0f" />
      </linearGradient>
      <linearGradient id="brocCrown" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="50%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>

    {/* Stalk */}
    <path
      d="M78 120L72 185C72 190 78 194 86 194H94C102 194 108 190 108 185L102 120"
      fill="url(#brocStalk)"
    />

    {/* Organic Floret Clusters */}
    <circle cx="90" cy="60" r="36" fill="url(#brocCrown)" />
    <circle cx="56" cy="85" r="30" fill="url(#brocCrown)" />
    <circle cx="124" cy="85" r="30" fill="url(#brocCrown)" />
    <circle cx="70" cy="115" r="26" fill="url(#brocCrown)" />
    <circle cx="110" cy="115" r="26" fill="url(#brocCrown)" />
    <circle cx="90" cy="95" r="30" fill="#15803d" fillOpacity="0.4" />

    {/* Highlight Specs */}
    <circle cx="82" cy="46" r="6" fill="#86efac" fillOpacity="0.6" />
    <circle cx="50" cy="74" r="5" fill="#86efac" fillOpacity="0.5" />
    <circle cx="128" cy="74" r="5" fill="#86efac" fillOpacity="0.5" />
  </svg>
);

/** Crisp Fresh Apple with Leaf */
export const AppleFresh: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="appleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="60%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#9f1239" />
      </linearGradient>
    </defs>

    {/* Stem */}
    <path d="M80 34C80 20 88 12 94 10" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
    {/* Leaf */}
    <path d="M84 24C98 16 114 20 118 30C110 38 94 36 84 24Z" fill="#22c55e" />

    {/* Apple Body */}
    <path
      d="M80 44C66 34 30 38 24 74C18 114 46 160 76 164C80 164.5 84 162 88 162C92 162 96 164.5 100 164C130 160 158 114 152 74C146 38 110 34 96 44C88 49 88 49 80 44Z"
      fill="url(#appleGrad)"
    />
    {/* Specular Crescent Highlight */}
    <path
      d="M40 70C36 85 40 115 54 130"
      stroke="#ffffff"
      strokeWidth="5"
      strokeLinecap="round"
      strokeOpacity="0.55"
    />
  </svg>
);

/** Nourish Healthy Ramen / Salad Bowl */
export const RamenSaladBowl: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="bowlCeramic" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>

    {/* Steam wisps */}
    <path d="M90 28C86 16 96 8 92 2" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
    <path d="M120 32C116 20 126 12 122 4" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />

    {/* Chopsticks resting on rim */}
    <path d="M40 38L180 58" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
    <path d="M40 46L180 64" stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" />

    {/* Bowl Interior / Ingredients */}
    <ellipse cx="110" cy="65" rx="85" ry="32" fill="#15803d" fillOpacity="0.8" />
    {/* Boiled Egg Half */}
    <ellipse cx="90" cy="62" rx="18" ry="12" fill="#ffffff" />
    <circle cx="90" cy="62" r="7" fill="#f59e0b" />
    {/* Sweetcorn / toppings */}
    <circle cx="125" cy="60" r="5" fill="#facc15" />
    <circle cx="138" cy="66" r="4.5" fill="#facc15" />
    <circle cx="118" cy="72" r="4" fill="#ef4444" />

    {/* Ceramic Bowl Body */}
    <path
      d="M25 65C25 110 65 145 110 145C155 145 195 110 195 65H25Z"
      fill="url(#bowlCeramic)"
      stroke="#94a3b8"
      strokeWidth="2"
    />
    {/* Bowl Pedestal Base */}
    <rect x="85" y="142" width="50" height="8" rx="4" fill="#94a3b8" />
  </svg>
);

// ---------------------------------------------------------------------------
// 3. SYMPTOM GUIDANCE
// ---------------------------------------------------------------------------

/** Elegant Stethoscope Headset with Acoustic Disc */
export const StethoscopeCurved: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="stethTube" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="50%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
      <linearGradient id="stethMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>

    {/* Binaural Ear Tubes */}
    <path d="M50 35V65C50 90 75 110 95 110H100V130" stroke="url(#stethMetal)" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M140 35V65C140 90 115 110 95 110" stroke="url(#stethMetal)" strokeWidth="6" strokeLinecap="round" fill="none" />
    {/* Ear Tips */}
    <circle cx="50" cy="35" r="6" fill="#0f172a" />
    <circle cx="140" cy="35" r="6" fill="#0f172a" />

    {/* Long Flowing Flexible Tube in S-Curve */}
    <path
      d="M100 130C100 165 60 175 60 205C60 225 90 230 130 215C170 200 190 170 190 140"
      stroke="url(#stethTube)"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />

    {/* Chestpiece Disc */}
    <circle cx="190" cy="135" r="28" fill="url(#stethMetal)" />
    <circle cx="190" cy="135" r="22" fill="#0f766e" fillOpacity="0.85" />
    <circle cx="190" cy="135" r="10" fill="url(#stethMetal)" />
    <circle cx="184" cy="128" r="4" fill="#ffffff" fillOpacity="0.75" />
  </svg>
);

/** 3D Pillowed Medical Cross with Beveled Glow */
export const MedicalCross3D: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="crossGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2dd4bf" />
        <stop offset="50%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
      <filter id="crossGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="16" floodColor="#0d9488" floodOpacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#crossGlow)">
      {/* 3D Pillowed Rounded Cross */}
      <path
        d="M60 24C60 19.5817 63.5817 16 68 16H92C96.4183 16 100 19.5817 100 24V60H136C140.418 60 144 63.5817 144 68V92C144 96.4183 140.418 100 136 100H100V136C100 140.418 96.4183 144 92 144H68C63.5817 144 60 140.418 60 136V100H24C19.5817 100 16 96.4183 16 92V68C16 63.5817 19.5817 60 24 60H60V24Z"
        fill="url(#crossGrad)"
      />
      {/* Inner Highlight Inset */}
      <path
        d="M68 28H92V64C92 66 94 68 96 68H132V88H96C94 88 92 90 92 92V128H68V92C68 90 66 88 64 88H28V68H64C66 68 68 66 68 64V28Z"
        fill="#ffffff"
        fillOpacity="0.25"
      />
      {/* Gloss Corner Flare */}
      <circle cx="70" cy="30" r="4" fill="#ffffff" fillOpacity="0.8" />
    </g>
  </svg>
);

/** Translucent Breathing Lungs */
export const LungsTranslucent: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="lungGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#0284c7" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
      </linearGradient>
    </defs>

    {/* Trachea Windpipe */}
    <path d="M100 24V80" stroke="#bae6fd" strokeWidth="7" strokeLinecap="round" />
    {/* Left & Right Bronchi */}
    <path d="M100 80L72 105" stroke="#bae6fd" strokeWidth="5" strokeLinecap="round" />
    <path d="M100 80L128 105" stroke="#bae6fd" strokeWidth="5" strokeLinecap="round" />

    {/* Left Lung Lobe */}
    <path
      d="M72 90C45 90 28 115 28 150C28 178 45 188 68 188C82 188 88 172 88 152V105C88 96 82 90 72 90Z"
      fill="url(#lungGrad)"
    />
    {/* Right Lung Lobe */}
    <path
      d="M128 90C155 90 172 115 172 150C172 178 155 188 132 188C118 188 112 172 112 152V105C112 96 118 90 128 90Z"
      fill="url(#lungGrad)"
    />

    {/* Soft Highlight Arc */}
    <path d="M42 120C40 140 46 165 58 175" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M158 120C160 140 154 165 142 175" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />
  </svg>
);

// ---------------------------------------------------------------------------
// 4. AI ASSISTANT
// ---------------------------------------------------------------------------

/** Glowing Concentric AI Intelligence Orb */
export const AIOrbGlowing: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="aiCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#818cf8" stopOpacity="0.7" />
        <stop offset="80%" stopColor="#c084fc" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
      </radialGradient>
      <filter id="aiGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Outer Subtle Frosted Ring */}
    <circle cx="100" cy="100" r="82" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="6 6" />
    {/* Middle Ring */}
    <ellipse cx="100" cy="100" rx="72" ry="48" transform="rotate(-35 100 100)" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.45" />
    <ellipse cx="100" cy="100" rx="72" ry="48" transform="rotate(35 100 100)" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.45" />

    {/* Luminous Inner Core */}
    <circle cx="100" cy="100" r="44" fill="url(#aiCore)" filter="url(#aiGlow)" />
    <circle cx="100" cy="100" r="26" fill="#ffffff" fillOpacity="0.85" />
    {/* Sparkling 4-Point Core */}
    <path d="M100 78L103 97L122 100L103 103L100 122L97 103L78 100L97 97Z" fill="#38bdf8" />
  </svg>
);

/** Neural Network Synaptic Nodes */
export const NeuralSynapse: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Interconnecting Axon Filaments */}
    <line x1="40" y1="90" x2="100" y2="40" stroke="#818cf8" strokeWidth="2" strokeOpacity="0.5" />
    <line x1="40" y1="90" x2="100" y2="140" stroke="#818cf8" strokeWidth="2" strokeOpacity="0.5" />
    <line x1="100" y1="40" x2="160" y2="70" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.5" />
    <line x1="100" y1="140" x2="160" y2="110" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.5" />
    <line x1="100" y1="40" x2="100" y2="140" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.4" />

    {/* Synaptic Junction Spheres */}
    <circle cx="40" cy="90" r="14" fill="#6366f1" fillOpacity="0.8" />
    <circle cx="36" cy="86" r="4" fill="#ffffff" fillOpacity="0.9" />

    <circle cx="100" cy="40" r="16" fill="#38bdf8" fillOpacity="0.8" />
    <circle cx="96" cy="36" r="4" fill="#ffffff" fillOpacity="0.9" />

    <circle cx="100" cy="140" r="15" fill="#a855f7" fillOpacity="0.8" />
    <circle cx="96" cy="136" r="4" fill="#ffffff" fillOpacity="0.9" />

    <circle cx="160" cy="70" r="13" fill="#2dd4bf" fillOpacity="0.8" />
    <circle cx="160" cy="110" r="12" fill="#818cf8" fillOpacity="0.8" />
  </svg>
);

// ---------------------------------------------------------------------------
// 5. MEDICAL REPORTS
// ---------------------------------------------------------------------------

/** Frosted Medical Report Clipboard */
export const ReportClipboard: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 180 230" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="clipBoard" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
      </linearGradient>
    </defs>

    {/* Board Base */}
    <rect x="25" y="30" width="130" height="180" rx="16" fill="url(#clipBoard)" stroke="#cbd5e1" strokeWidth="2" />
    {/* Metal Clamp */}
    <rect x="65" y="18" width="50" height="24" rx="6" fill="#64748b" />
    <circle cx="90" cy="28" r="4" fill="#f8fafc" />

    {/* Report Content Lines */}
    <rect x="45" y="65" width="60" height="6" rx="3" fill="#0d9488" fillOpacity="0.7" />
    <rect x="45" y="82" width="90" height="4" rx="2" fill="#94a3b8" fillOpacity="0.5" />
    <rect x="45" y="94" width="75" height="4" rx="2" fill="#94a3b8" fillOpacity="0.4" />

    {/* ECG Trend Chart Line */}
    <path
      d="M45 140H65L72 122L80 152L86 132L92 142H135"
      stroke="#0d9488"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Verification Stamp Badge */}
    <circle cx="120" cy="175" r="16" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="2" />
    <path d="M113 175L118 180L128 170" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Translucent Magnifying Glass */
export const MagnifyingGlass3D: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    {/* Handle */}
    <rect x="115" y="115" width="18" height="56" rx="9" transform="rotate(-45 115 115)" fill="#0f766e" />
    <rect x="118" y="118" width="12" height="50" rx="6" transform="rotate(-45 118 118)" fill="#14b8a6" fillOpacity="0.6" />

    {/* Outer Rim */}
    <circle cx="75" cy="75" r="50" stroke="#0d9488" strokeWidth="9" fill="none" />
    <circle cx="75" cy="75" r="45" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.5" fill="none" />

    {/* Glass Lens with Light Flare */}
    <circle cx="75" cy="75" r="44" fill="#2dd4bf" fillOpacity="0.18" />
    <path d="M48 60C54 44 68 36 84 38" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.65" />
  </svg>
);

// ---------------------------------------------------------------------------
// 6. DOCTORS NEARBY
// ---------------------------------------------------------------------------

/** Sleek 3D Location Map Pin with Beacon Pulse */
export const LocationBeaconPin: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#0f766e" />
      </linearGradient>
    </defs>

    {/* Ground Pulse Rings */}
    <ellipse cx="80" cy="180" rx="42" ry="12" stroke="#14b8a6" strokeWidth="2" strokeOpacity="0.3" />
    <ellipse cx="80" cy="180" rx="24" ry="7" stroke="#14b8a6" strokeWidth="2.5" strokeOpacity="0.5" />

    {/* Pin Body */}
    <path
      d="M80 20C50 20 26 44 26 74C26 115 80 175 80 175C80 175 134 115 134 74C134 44 110 20 80 20Z"
      fill="url(#pinGrad)"
    />
    {/* Inner White Core with Medical Cross */}
    <circle cx="80" cy="74" r="24" fill="#ffffff" />
    <path d="M80 62V86M68 74H92" stroke="#0d9488" strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// 7. PRESCRIPTIONS & MEDICINES
// ---------------------------------------------------------------------------

/** Rx Prescription Document Pad */
export const RxPadDocument: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 170 210" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="20" y="20" width="130" height="170" rx="16" fill="#ffffff" fillOpacity="0.85" stroke="#cbd5e1" strokeWidth="2" />
    {/* Decorative Header Bar */}
    <path d="M20 36C20 27.1634 27.1634 20 36 20H134C142.837 20 150 27.1634 150 36V50H20V36Z" fill="#0d9488" fillOpacity="0.9" />

    {/* Rx Symbol */}
    <text x="36" y="95" fontFamily="serif" fontSize="34" fontWeight="bold" fill="#0d9488">℞</text>

    {/* Prescription Lines */}
    <rect x="75" y="78" width="55" height="5" rx="2.5" fill="#94a3b8" fillOpacity="0.5" />
    <rect x="75" y="90" width="40" height="4" rx="2" fill="#94a3b8" fillOpacity="0.35" />
    <rect x="36" y="120" width="94" height="4" rx="2" fill="#94a3b8" fillOpacity="0.4" />
    <rect x="36" y="132" width="70" height="4" rx="2" fill="#94a3b8" fillOpacity="0.3" />

    {/* Doctor Signature */}
    <path d="M90 165C100 155 110 170 125 160" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// 8. MENTAL WELLBEING
// ---------------------------------------------------------------------------

/** Serene Dreamy Cloud */
export const SereneCloud: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#e2e8f0" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.9" />
      </linearGradient>
    </defs>

    {/* Cloud Bulbs */}
    <path
      d="M50 110H170C190 110 205 95 205 76C205 58 190 44 172 45C168 28 152 16 134 16C120 16 108 24 102 36C95 32 86 30 78 30C58 30 42 46 42 66C26 68 15 82 15 98C15 116 30 110 50 110Z"
      fill="url(#cloudGrad)"
    />
    {/* Soft Glow Rim */}
    <path
      d="M80 36C90 24 115 22 135 24"
      stroke="#ffffff"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeOpacity="0.75"
    />
  </svg>
);

/** Crescent Moon & Gentle Twinkling Stars */
export const CrescentMoonStars: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* Moon Crescent */}
    <path
      d="M105 25C65 35 40 75 50 115C60 155 100 170 125 155C85 155 60 120 65 85C70 50 100 30 105 25Z"
      fill="url(#moonGrad)"
      fillOpacity="0.85"
    />

    {/* Twinkling Stars */}
    <path d="M128 45L130 54L139 56L130 58L128 67L126 58L117 56L126 54Z" fill="#fde047" />
    <path d="M142 95L143 100L148 101L143 102L142 107L141 102L136 101L141 100Z" fill="#fde047" fillOpacity="0.8" />
    <path d="M38 45L39 49L43 50L39 51L38 55L37 51L33 50L37 49Z" fill="#fde047" fillOpacity="0.6" />
  </svg>
);

/** Blooming Lotus Flower */
export const LotusFlower: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="lotusPink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
    </defs>

    {/* Outer Petals */}
    <path d="M90 110C50 110 20 85 30 65C45 65 70 85 90 110Z" fill="url(#lotusPink)" fillOpacity="0.5" />
    <path d="M90 110C130 110 160 85 150 65C135 65 110 85 90 110Z" fill="url(#lotusPink)" fillOpacity="0.5" />

    {/* Mid Petals */}
    <path d="M90 110C65 105 45 70 60 45C75 50 85 80 90 110Z" fill="url(#lotusPink)" fillOpacity="0.75" />
    <path d="M90 110C115 105 135 70 120 45C105 50 95 80 90 110Z" fill="url(#lotusPink)" fillOpacity="0.75" />

    {/* Center Upright Petal */}
    <path d="M90 110C78 80 78 40 90 20C102 40 102 80 90 110Z" fill="url(#lotusPink)" fillOpacity="0.9" />
  </svg>
);

// ---------------------------------------------------------------------------
// 9. PERIOD TRACKER
// ---------------------------------------------------------------------------

/** Lunar Wellness Calendar Ring */
export const CalendarLunarRing: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="90" cy="90" r="70" stroke="#f472b6" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="6 4" />
    <circle cx="90" cy="90" r="54" stroke="#fb7185" strokeWidth="1.5" strokeOpacity="0.3" />

    {/* Glowing Phase Nodes */}
    <circle cx="90" cy="20" r="8" fill="#f43f5e" fillOpacity="0.85" />
    <circle cx="160" cy="90" r="6.5" fill="#fb7185" fillOpacity="0.7" />
    <circle cx="90" cy="160" r="6.5" fill="#f472b6" fillOpacity="0.7" />
    <circle cx="20" cy="90" r="6.5" fill="#fb7185" fillOpacity="0.7" />

    {/* Center Heart Flare */}
    <path
      d="M90 75C84 68 74 68 68 74C62 80 62 90 72 100L90 115L108 100C118 90 118 80 112 74C106 68 96 68 90 75Z"
      fill="#f43f5e"
      fillOpacity="0.75"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// 10. REMINDERS
// ---------------------------------------------------------------------------

/** Gentle Floating Alarm Bell with Chime Rings */
export const AlarmBellChime: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="bellGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>

    {/* Sound Waves */}
    <path d="M30 65C24 75 24 85 30 95" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />
    <path d="M130 65C136 75 136 85 130 95" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />

    {/* Bell Crown Loop */}
    <circle cx="80" cy="30" r="10" stroke="url(#bellGrad)" strokeWidth="3.5" fill="none" />

    {/* Bell Body */}
    <path
      d="M45 110C45 65 60 45 80 45C100 45 115 65 115 110H45Z"
      fill="url(#bellGrad)"
    />
    <rect x="36" y="108" width="88" height="10" rx="5" fill="#b45309" />
    <circle cx="80" cy="124" r="8" fill="#b45309" />
  </svg>
);

// ---------------------------------------------------------------------------
// 11. LOGIN & AUTH
// ---------------------------------------------------------------------------

/** Healthcare Security Shield with Cross */
export const SecurityShieldCross: React.FC<FloatingObjectProps> = ({ className = '' }) => (
  <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#115e59" />
      </linearGradient>
    </defs>

    {/* Shield Outer Silhouette */}
    <path
      d="M80 18C110 32 135 34 135 70C135 125 95 160 80 172C65 160 25 125 25 70C25 34 50 32 80 18Z"
      fill="url(#shieldGrad)"
    />
    {/* Inner Inset Rim */}
    <path
      d="M80 28C104 40 124 42 124 72C124 116 90 148 80 158C70 148 36 116 36 72C36 42 56 40 80 28Z"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeOpacity="0.4"
      fill="none"
    />
    {/* Medical Cross Crest */}
    <rect x="74" y="58" width="12" height="40" rx="3" fill="#ffffff" fillOpacity="0.9" />
    <rect x="60" y="72" width="40" height="12" rx="3" fill="#ffffff" fillOpacity="0.9" />
  </svg>
);
