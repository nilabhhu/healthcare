import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  CapsuleTwoTone,
  SoftgelAmber,
  TabletRound,
  SupplementBottle,
  NutrientMolecule,
  AvocadoHalf,
  BroccoliFloret,
  AppleFresh,
  RamenSaladBowl,
  StethoscopeCurved,
  MedicalCross3D,
  LungsTranslucent,
  AIOrbGlowing,
  NeuralSynapse,
  ReportClipboard,
  MagnifyingGlass3D,
  LocationBeaconPin,
  RxPadDocument,
  SereneCloud,
  CrescentMoonStars,
  LotusFlower,
  CalendarLunarRing,
  AlarmBellChime,
  SecurityShieldCross,
  FloatingObjectProps
} from './floating/FloatingThematicObjects';

export type FloatingTheme =
  | 'supplements'
  | 'fitness'
  | 'nutrition'
  | 'symptoms'
  | 'assistant'
  | 'reports'
  | 'doctors'
  | 'medicines'
  | 'mental-wellbeing'
  | 'period'
  | 'home'
  | 'reminders'
  | 'login';

interface ThematicItemConfig {
  id: string;
  Component: React.FC<FloatingObjectProps>;
  // Placement percentage on viewport canvas
  x: number; // 0 to 100 (%)
  y: number; // 0 to 100 (%)
  size: number; // in pixels (desktop scale)
  rotation: number; // in degrees
  opacity: number; // 0.15 to 0.40
  depth: number; // 0.2 (distant/slow) to 1.0 (close/crisp)
  blur: number; // in pixels (0 for sharp, 1.5 - 3 for depth-of-field)
  animType: 1 | 2 | 3 | 4;
  animDuration: number; // seconds
  animDelay: number; // seconds
  hiddenOnMobile?: boolean;
}

interface FloatingBackgroundProps {
  theme?: FloatingTheme;
  className?: string;
  ambientGlowColor?: string;
}

// ---------------------------------------------------------------------------
// THEME CONFIGURATIONS
// Carefully composed around corners & margins so content/text remains hero
// ---------------------------------------------------------------------------

const THEME_PRESETS: Record<FloatingTheme, { items: ThematicItemConfig[]; glowColor: string }> = {
  // 1. Dietary Supplements & Fitness
  supplements: {
    glowColor: 'rgba(13, 148, 136, 0.12)',
    items: [
      {
        id: 'sup-capsule-lg',
        Component: CapsuleTwoTone,
        x: 8,
        y: 12,
        size: 185,
        rotation: -26,
        opacity: 0.58,
        depth: 0.9,
        blur: 0,
        animType: 1,
        animDuration: 18,
        animDelay: 0
      },
      {
        id: 'sup-capsule-sm',
        Component: CapsuleTwoTone,
        x: 76,
        y: 14,
        size: 130,
        rotation: 32,
        opacity: 0.52,
        depth: 0.6,
        blur: 0.5,
        animType: 2,
        animDuration: 15,
        animDelay: -4
      },
      {
        id: 'sup-softgel',
        Component: SoftgelAmber,
        x: 80,
        y: 40,
        size: 135,
        rotation: 18,
        opacity: 0.54,
        depth: 0.8,
        blur: 0,
        animType: 3,
        animDuration: 16,
        animDelay: -7
      },
      {
        id: 'sup-bottle',
        Component: SupplementBottle,
        x: 74,
        y: 68,
        size: 195,
        rotation: 10,
        opacity: 0.50,
        depth: 0.5,
        blur: 1,
        animType: 4,
        animDuration: 20,
        animDelay: -2
      },
      {
        id: 'sup-tablet',
        Component: TabletRound,
        x: 12,
        y: 62,
        size: 115,
        rotation: 14,
        opacity: 0.52,
        depth: 0.7,
        blur: 0,
        animType: 2,
        animDuration: 14,
        animDelay: -5
      },
      {
        id: 'sup-molecule',
        Component: NutrientMolecule,
        x: 20,
        y: 38,
        size: 85,
        rotation: 20,
        opacity: 0.46,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 22,
        animDelay: -10,
        hiddenOnMobile: true
      }
    ]
  },

  fitness: {
    // Alias to supplements
    glowColor: 'rgba(13, 148, 136, 0.12)',
    get items() {
      return THEME_PRESETS.supplements.items;
    }
  },

  // 2. Food & Nutrition
  nutrition: {
    glowColor: 'rgba(34, 197, 94, 0.12)',
    items: [
      {
        id: 'nut-avocado',
        Component: AvocadoHalf,
        x: 8,
        y: 12,
        size: 175,
        rotation: -18,
        opacity: 0.56,
        depth: 0.9,
        blur: 0,
        animType: 1,
        animDuration: 18,
        animDelay: 0
      },
      {
        id: 'nut-apple',
        Component: AppleFresh,
        x: 78,
        y: 14,
        size: 140,
        rotation: 16,
        opacity: 0.52,
        depth: 0.8,
        blur: 0,
        animType: 2,
        animDuration: 15,
        animDelay: -5
      },
      {
        id: 'nut-broccoli',
        Component: BroccoliFloret,
        x: 10,
        y: 60,
        size: 160,
        rotation: 22,
        opacity: 0.50,
        depth: 0.6,
        blur: 1,
        animType: 3,
        animDuration: 20,
        animDelay: -8
      },
      {
        id: 'nut-ramen',
        Component: RamenSaladBowl,
        x: 76,
        y: 68,
        size: 200,
        rotation: -8,
        opacity: 0.48,
        depth: 0.5,
        blur: 1,
        animType: 4,
        animDuration: 22,
        animDelay: -3
      },
      {
        id: 'nut-molecule',
        Component: NutrientMolecule,
        x: 22,
        y: 38,
        size: 80,
        rotation: 30,
        opacity: 0.45,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 24,
        animDelay: -11,
        hiddenOnMobile: true
      }
    ]
  },

  // 3. Symptom Guidance
  symptoms: {
    glowColor: 'rgba(20, 184, 166, 0.12)',
    items: [
      {
        id: 'sym-steth',
        Component: StethoscopeCurved,
        x: 6,
        y: 8,
        size: 215,
        rotation: -14,
        opacity: 0.54,
        depth: 0.8,
        blur: 0,
        animType: 1,
        animDuration: 20,
        animDelay: 0
      },
      {
        id: 'sym-cross',
        Component: MedicalCross3D,
        x: 80,
        y: 14,
        size: 130,
        rotation: 16,
        opacity: 0.56,
        depth: 0.9,
        blur: 0,
        animType: 2,
        animDuration: 16,
        animDelay: -6
      },
      {
        id: 'sym-lungs',
        Component: LungsTranslucent,
        x: 78,
        y: 64,
        size: 185,
        rotation: 8,
        opacity: 0.48,
        depth: 0.5,
        blur: 1,
        animType: 3,
        animDuration: 22,
        animDelay: -3
      },
      {
        id: 'sym-capsule',
        Component: CapsuleTwoTone,
        x: 10,
        y: 64,
        size: 120,
        rotation: 28,
        opacity: 0.52,
        depth: 0.7,
        blur: 0.5,
        animType: 4,
        animDuration: 17,
        animDelay: -9
      },
      {
        id: 'sym-tab',
        Component: TabletRound,
        x: 20,
        y: 42,
        size: 85,
        rotation: -10,
        opacity: 0.45,
        depth: 0.4,
        blur: 1.5,
        animType: 2,
        animDuration: 19,
        animDelay: -12,
        hiddenOnMobile: true
      }
    ]
  },

  // 4. AI Assistant
  assistant: {
    glowColor: 'rgba(99, 102, 241, 0.15)',
    items: [
      {
        id: 'ai-orb',
        Component: AIOrbGlowing,
        x: 74,
        y: 6,
        size: 360,
        rotation: 0,
        opacity: 0.58,
        depth: 0.9,
        blur: 0,
        animType: 4,
        animDuration: 16,
        animDelay: 0
      },
      {
        id: 'ai-synapse',
        Component: NeuralSynapse,
        x: 6,
        y: 12,
        size: 280,
        rotation: -12,
        opacity: 0.54,
        depth: 0.7,
        blur: 0,
        animType: 1,
        animDuration: 19,
        animDelay: -5
      },
      {
        id: 'ai-cross',
        Component: MedicalCross3D,
        x: 8,
        y: 60,
        size: 220,
        rotation: 18,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 2,
        animDuration: 18,
        animDelay: -8
      },
      {
        id: 'ai-steth',
        Component: StethoscopeCurved,
        x: 74,
        y: 62,
        size: 320,
        rotation: -16,
        opacity: 0.48,
        depth: 0.5,
        blur: 0.8,
        animType: 3,
        animDuration: 22,
        animDelay: -2
      },
      {
        id: 'ai-sparkle',
        Component: NutrientMolecule,
        x: 22,
        y: 40,
        size: 190,
        rotation: 40,
        opacity: 0.46,
        depth: 0.3,
        blur: 1,
        animType: 1,
        animDuration: 23,
        animDelay: -11,
        hiddenOnMobile: true
      }
    ]
  },

  // 5. Medical Reports
  reports: {
    glowColor: 'rgba(2, 132, 199, 0.12)',
    items: [
      {
        id: 'rep-clip',
        Component: ReportClipboard,
        x: 8,
        y: 12,
        size: 180,
        rotation: -14,
        opacity: 0.55,
        depth: 0.8,
        blur: 0,
        animType: 1,
        animDuration: 19,
        animDelay: 0
      },
      {
        id: 'rep-glass',
        Component: MagnifyingGlass3D,
        x: 80,
        y: 16,
        size: 155,
        rotation: 30,
        opacity: 0.54,
        depth: 0.9,
        blur: 0,
        animType: 2,
        animDuration: 15,
        animDelay: -4
      },
      {
        id: 'rep-cross',
        Component: MedicalCross3D,
        x: 78,
        y: 66,
        size: 130,
        rotation: -12,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 3,
        animDuration: 21,
        animDelay: -8
      },
      {
        id: 'rep-capsule',
        Component: CapsuleTwoTone,
        x: 10,
        y: 64,
        size: 115,
        rotation: 22,
        opacity: 0.52,
        depth: 0.7,
        blur: 0.5,
        animType: 4,
        animDuration: 18,
        animDelay: -2
      },
      {
        id: 'rep-tab',
        Component: TabletRound,
        x: 20,
        y: 42,
        size: 85,
        rotation: 12,
        opacity: 0.45,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 24,
        animDelay: -10,
        hiddenOnMobile: true
      }
    ]
  },

  // 6. Doctors Nearby
  doctors: {
    glowColor: 'rgba(13, 148, 136, 0.12)',
    items: [
      {
        id: 'doc-pin',
        Component: LocationBeaconPin,
        x: 80,
        y: 14,
        size: 175,
        rotation: 12,
        opacity: 0.56,
        depth: 0.9,
        blur: 0,
        animType: 2,
        animDuration: 16,
        animDelay: 0
      },
      {
        id: 'doc-steth',
        Component: StethoscopeCurved,
        x: 8,
        y: 10,
        size: 215,
        rotation: -16,
        opacity: 0.52,
        depth: 0.7,
        blur: 0.5,
        animType: 1,
        animDuration: 20,
        animDelay: -5
      },
      {
        id: 'doc-shield',
        Component: SecurityShieldCross,
        x: 78,
        y: 66,
        size: 145,
        rotation: -8,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 3,
        animDuration: 22,
        animDelay: -7
      },
      {
        id: 'doc-cross',
        Component: MedicalCross3D,
        x: 10,
        y: 64,
        size: 125,
        rotation: 18,
        opacity: 0.52,
        depth: 0.7,
        blur: 0,
        animType: 4,
        animDuration: 18,
        animDelay: -3
      },
      {
        id: 'doc-molecule',
        Component: NutrientMolecule,
        x: 22,
        y: 40,
        size: 85,
        rotation: 25,
        opacity: 0.46,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 25,
        animDelay: -12,
        hiddenOnMobile: true
      }
    ]
  },

  // 7. Prescriptions & Medicines
  medicines: {
    glowColor: 'rgba(15, 118, 110, 0.12)',
    items: [
      {
        id: 'med-rx',
        Component: RxPadDocument,
        x: 8,
        y: 12,
        size: 175,
        rotation: -14,
        opacity: 0.55,
        depth: 0.8,
        blur: 0,
        animType: 1,
        animDuration: 18,
        animDelay: 0
      },
      {
        id: 'med-bottle',
        Component: SupplementBottle,
        x: 78,
        y: 14,
        size: 175,
        rotation: 16,
        opacity: 0.52,
        depth: 0.8,
        blur: 0.5,
        animType: 2,
        animDuration: 16,
        animDelay: -4
      },
      {
        id: 'med-capsule',
        Component: CapsuleTwoTone,
        x: 76,
        y: 66,
        size: 135,
        rotation: -24,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 3,
        animDuration: 20,
        animDelay: -8
      },
      {
        id: 'med-tablet',
        Component: TabletRound,
        x: 10,
        y: 62,
        size: 115,
        rotation: 18,
        opacity: 0.52,
        depth: 0.7,
        blur: 0,
        animType: 4,
        animDuration: 17,
        animDelay: -2
      },
      {
        id: 'med-softgel',
        Component: SoftgelAmber,
        x: 22,
        y: 42,
        size: 90,
        rotation: 15,
        opacity: 0.46,
        depth: 0.4,
        blur: 1,
        animType: 2,
        animDuration: 22,
        animDelay: -9,
        hiddenOnMobile: true
      }
    ]
  },

  // 8. Mental Wellbeing (calmer, slower drift, softer depth)
  'mental-wellbeing': {
    glowColor: 'rgba(168, 85, 247, 0.12)',
    items: [
      {
        id: 'men-cloud',
        Component: SereneCloud,
        x: 8,
        y: 12,
        size: 210,
        rotation: -6,
        opacity: 0.52,
        depth: 0.6,
        blur: 1,
        animType: 1,
        animDuration: 24,
        animDelay: 0
      },
      {
        id: 'men-moon',
        Component: CrescentMoonStars,
        x: 80,
        y: 14,
        size: 145,
        rotation: 16,
        opacity: 0.52,
        depth: 0.8,
        blur: 0,
        animType: 2,
        animDuration: 20,
        animDelay: -6
      },
      {
        id: 'men-lotus',
        Component: LotusFlower,
        x: 78,
        y: 66,
        size: 165,
        rotation: -8,
        opacity: 0.55,
        depth: 0.7,
        blur: 0.5,
        animType: 3,
        animDuration: 22,
        animDelay: -4
      },
      {
        id: 'men-orb',
        Component: AIOrbGlowing,
        x: 10,
        y: 62,
        size: 140,
        rotation: 0,
        opacity: 0.50,
        depth: 0.5,
        blur: 1,
        animType: 4,
        animDuration: 26,
        animDelay: -10
      },
      {
        id: 'men-tab',
        Component: TabletRound,
        x: 22,
        y: 40,
        size: 80,
        rotation: 20,
        opacity: 0.44,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 28,
        animDelay: -14,
        hiddenOnMobile: true
      }
    ]
  },

  // 9. Period Tracker
  period: {
    glowColor: 'rgba(244, 63, 94, 0.12)',
    items: [
      {
        id: 'per-ring',
        Component: CalendarLunarRing,
        x: 80,
        y: 14,
        size: 165,
        rotation: 14,
        opacity: 0.56,
        depth: 0.8,
        blur: 0,
        animType: 2,
        animDuration: 18,
        animDelay: 0
      },
      {
        id: 'per-lotus',
        Component: LotusFlower,
        x: 8,
        y: 12,
        size: 175,
        rotation: -16,
        opacity: 0.54,
        depth: 0.8,
        blur: 0,
        animType: 1,
        animDuration: 19,
        animDelay: -5
      },
      {
        id: 'per-moon',
        Component: CrescentMoonStars,
        x: 78,
        y: 68,
        size: 145,
        rotation: -10,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 3,
        animDuration: 22,
        animDelay: -8
      },
      {
        id: 'per-cloud',
        Component: SereneCloud,
        x: 10,
        y: 64,
        size: 170,
        rotation: 6,
        opacity: 0.50,
        depth: 0.5,
        blur: 1,
        animType: 4,
        animDuration: 25,
        animDelay: -3
      },
      {
        id: 'per-molecule',
        Component: NutrientMolecule,
        x: 22,
        y: 42,
        size: 85,
        rotation: 25,
        opacity: 0.45,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 24,
        animDelay: -11,
        hiddenOnMobile: true
      }
    ]
  },

  // 10. Home Dashboard (Harmonious combination of core healthcare visual language)
  home: {
    glowColor: 'rgba(13, 148, 136, 0.15)',
    items: [
      {
        id: 'home-capsule-top',
        Component: CapsuleTwoTone,
        x: 6,
        y: 4,
        size: 300,
        rotation: -24,
        opacity: 0.54,
        depth: 0.8,
        blur: 0,
        animType: 1,
        animDuration: 18,
        animDelay: 0
      },
      {
        id: 'home-steth-top',
        Component: StethoscopeCurved,
        x: 74,
        y: 8,
        size: 340,
        rotation: 16,
        opacity: 0.50,
        depth: 0.7,
        blur: 0.5,
        animType: 2,
        animDuration: 22,
        animDelay: -5
      },
      {
        id: 'home-molecule-mid',
        Component: NutrientMolecule,
        x: 18,
        y: 28,
        size: 220,
        rotation: 26,
        opacity: 0.46,
        depth: 0.4,
        blur: 1,
        animType: 3,
        animDuration: 20,
        animDelay: -8,
        hiddenOnMobile: true
      },
      {
        id: 'home-apple-mid',
        Component: AppleFresh,
        x: 78,
        y: 35,
        size: 250,
        rotation: -12,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 4,
        animDuration: 19,
        animDelay: -2
      },
      {
        id: 'home-cross-tools',
        Component: MedicalCross3D,
        x: 5,
        y: 48,
        size: 230,
        rotation: 18,
        opacity: 0.48,
        depth: 0.5,
        blur: 0.5,
        animType: 1,
        animDuration: 23,
        animDelay: -10
      },
      {
        id: 'home-synapse-ai',
        Component: NeuralSynapse,
        x: 6,
        y: 66,
        size: 280,
        rotation: -15,
        opacity: 0.52,
        depth: 0.7,
        blur: 0,
        animType: 2,
        animDuration: 18,
        animDelay: -4
      },
      {
        id: 'home-ai-orb',
        Component: AIOrbGlowing,
        x: 72,
        y: 68,
        size: 370,
        rotation: 0,
        opacity: 0.58,
        depth: 0.9,
        blur: 0,
        animType: 4,
        animDuration: 16,
        animDelay: -2
      },
      {
        id: 'home-cloud-bottom',
        Component: SereneCloud,
        x: 12,
        y: 86,
        size: 280,
        rotation: 4,
        opacity: 0.44,
        depth: 0.4,
        blur: 1,
        animType: 1,
        animDuration: 25,
        animDelay: -12,
        hiddenOnMobile: true
      },
      {
        id: 'home-shield-sos',
        Component: SecurityShieldCross,
        x: 76,
        y: 90,
        size: 240,
        rotation: -10,
        opacity: 0.46,
        depth: 0.5,
        blur: 0.5,
        animType: 3,
        animDuration: 21,
        animDelay: -6
      }
    ]
  },

  // 11. Reminders
  reminders: {
    glowColor: 'rgba(245, 158, 11, 0.12)',
    items: [
      {
        id: 'rem-bell',
        Component: AlarmBellChime,
        x: 8,
        y: 12,
        size: 170,
        rotation: -14,
        opacity: 0.56,
        depth: 0.9,
        blur: 0,
        animType: 1,
        animDuration: 16,
        animDelay: 0
      },
      {
        id: 'rem-capsule',
        Component: CapsuleTwoTone,
        x: 80,
        y: 14,
        size: 135,
        rotation: 26,
        opacity: 0.52,
        depth: 0.8,
        blur: 0,
        animType: 2,
        animDuration: 17,
        animDelay: -4
      },
      {
        id: 'rem-bottle',
        Component: SupplementBottle,
        x: 78,
        y: 66,
        size: 170,
        rotation: -10,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 3,
        animDuration: 21,
        animDelay: -8
      },
      {
        id: 'rem-tablet',
        Component: TabletRound,
        x: 10,
        y: 62,
        size: 115,
        rotation: 14,
        opacity: 0.52,
        depth: 0.7,
        blur: 0,
        animType: 4,
        animDuration: 18,
        animDelay: -2
      },
      {
        id: 'rem-molecule',
        Component: NutrientMolecule,
        x: 22,
        y: 42,
        size: 90,
        rotation: 20,
        opacity: 0.46,
        depth: 0.3,
        blur: 1.5,
        animType: 1,
        animDuration: 25,
        animDelay: -11,
        hiddenOnMobile: true
      }
    ]
  },

  // 12. Login / Auth
  login: {
    glowColor: 'rgba(13, 148, 136, 0.12)',
    items: [
      {
        id: 'log-shield',
        Component: SecurityShieldCross,
        x: 8,
        y: 14,
        size: 170,
        rotation: -12,
        opacity: 0.56,
        depth: 0.8,
        blur: 0,
        animType: 1,
        animDuration: 19,
        animDelay: 0
      },
      {
        id: 'log-orb',
        Component: AIOrbGlowing,
        x: 80,
        y: 16,
        size: 155,
        rotation: 0,
        opacity: 0.54,
        depth: 0.8,
        blur: 0.5,
        animType: 2,
        animDuration: 17,
        animDelay: -5
      },
      {
        id: 'log-cross',
        Component: MedicalCross3D,
        x: 78,
        y: 66,
        size: 130,
        rotation: 14,
        opacity: 0.50,
        depth: 0.6,
        blur: 0.5,
        animType: 3,
        animDuration: 22,
        animDelay: -7
      },
      {
        id: 'log-capsule',
        Component: CapsuleTwoTone,
        x: 10,
        y: 62,
        size: 115,
        rotation: 22,
        opacity: 0.52,
        depth: 0.7,
        blur: 0,
        animType: 4,
        animDuration: 18,
        animDelay: -2
      }
    ]
  }
};

/**
 * Reusable Atmospheric Floating Background Component
 * Renders thematic floating 3D objects with organic drifting, subtle mouse parallax,
 * and responsive degradation on mobile screens.
 */
export const FloatingBackground: React.FC<FloatingBackgroundProps> = ({
  theme = 'home',
  className = '',
  ambientGlowColor
}) => {
  // Mouse coordinates normalized from -1 to 1 for gentle parallax
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    // Mouse parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (motionQuery.matches) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        setMouseOffset({ x: normX, y: normY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const config = useMemo(() => {
    return THEME_PRESETS[theme] || THEME_PRESETS.home;
  }, [theme]);

  const activeGlowColor = ambientGlowColor || config.glowColor;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ${className}`}
    >
      {/* 1. Subtle Ambient Glow Spots */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-colors duration-1000 opacity-60"
        style={{ backgroundColor: activeGlowColor }}
      />
      <div
        className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl transition-colors duration-1000 opacity-40"
        style={{ backgroundColor: activeGlowColor }}
      />

      {/* 2. Floating Thematic Objects */}
      {config.items.map((item) => {
        const ItemComponent = item.Component;

        // Calculate parallax displacement based on object depth
        const parallaxX = prefersReducedMotion ? 0 : mouseOffset.x * item.depth * 24;
        const parallaxY = prefersReducedMotion ? 0 : mouseOffset.y * item.depth * 20;

        return (
          <div
            key={item.id}
            className={`absolute transition-transform duration-300 ease-out ${
              item.hiddenOnMobile ? 'hidden sm:block' : 'block'
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
              willChange: prefersReducedMotion ? 'auto' : 'transform'
            }}
          >
            {/* Inner Wrapper handles continuous organic drifting CSS animation */}
            <div
              className={prefersReducedMotion ? '' : `float-drift-${item.animType}`}
              style={{
                width: `${item.size}px`,
                maxWidth: 'clamp(180px, 42vw, 420px)',
                opacity: item.opacity,
                filter: item.blur > 0 ? `blur(${item.blur}px)` : undefined,
                animationDuration: prefersReducedMotion ? '0s' : `${item.animDuration}s`,
                animationDelay: `${item.animDelay}s`,
                transform: `rotate(${item.rotation}deg)`
              }}
            >
              <ItemComponent className="w-full h-auto drop-shadow-sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
