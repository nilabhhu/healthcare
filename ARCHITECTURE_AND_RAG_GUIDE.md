# HealYaar: System Architecture & Dual-Layer Healthcare RAG Guide

This document is the architectural blueprint, security specification, and developer reference for **HealYaar**—an accessible, private, AI-augmented healthcare and wellness web application.

---

## 1. High-Level Architecture Overview

HealYaar operates as a privacy-first, client-orchestrated healthcare application backed by Supabase for authentication and database persistence, coupled with a client-isolated **Dual-Layer Retrieval-Augmented Generation (RAG)** engine.

```
                              ┌──────────────────────────────────────────────┐
                              │           BROWSER CLIENT (React + Vite)       │
                              └──────────────────────┬───────────────────────┘
                                                     │
                                   ┌─────────────────┴─────────────────┐
                                   ▼                                   ▼
                       [AUTHENTICATION GATEWAY]             [UNAUTHENTICATED VIEW]
                     • Supabase Session Verification       • Email / Password Login
                     • Zero Guest Mode / No Bypass         • 8+ Character Password
                     • Auto-redirect & Token Refresh       • Account Registration
                                   │
                                   ▼ (Session Valid: user.id)
       ┌───────────────────────────┴──────────────────────────────────────────┐
       │                                                                      │
       ▼                                                                      ▼
┌───────────────────────────────────────┐            ┌────────────────────────────────────────┐
│     PROTECTED APPLICATION VIEWS       │            │       DUAL-LAYER HEALTHCARE RAG        │
│ • Home & Health Summary Dashboard     │            │                                        │
│ • AI Health Assistant (Grounded Chat) │◄───────────┤ LAYER A: Personal Health Vault         │
│ • Medical Reports & Biomarkers        │            │ • User-Scoped IndexedDB (HealYaar_RAG) │
│ • Prescriptions & Pill Reminders      │            │ • 200-400 token chunks + overlap       │
│ • Food & Nutrition (Photo & Recipe)   │            │ • Lab reports, Rx, cycle, meal logs    │
│ • Period Tracker (4-Phase Physiology) │            │                                        │
│ • Doctor Finder (Real Geolocation)    │            │ LAYER B: Curated Clinical Guidelines   │
│ • Mental Wellbeing & Breathing        │            │ • 12 Verified Evidence Modules         │
│ • Fitness & Supplements               │            │ • Biomarkers, ICMR Thali, Menstrual    │
└───────────────────────────────────────┘            │ • Medication safety & interactions     │
                                                     │                                        │
                                                     │ HYBRID RETRIEVAL ENGINE                │
                                                     │ • Dense Cosine Similarity (64/128-dim) │
                                                     │ • BM25 Term Frequency + Domain Weights │
                                                     │ • RAGSourcesBadge Transparency UI      │
                                                     └────────────────────────────────────────┘
```

---

## 2. Directory Structure Map

```
c:\healthcare2\
├── .env.local                                # Supabase & Gemini environment configuration
├── ARCHITECTURE_AND_RAG_GUIDE.md             # This comprehensive architecture document
├── package.json                              # Dependencies: React 19, Lucide, @google/genai, Vite
├── tsconfig.json                             # Strict TypeScript compiler configuration
├── vite.config.ts                            # Vite build and dev-server configuration
├── public/                                   # Static assets, icons, manifest
└── src/
    ├── App.tsx                               # Root application orchestrator & auth gate check
    ├── main.tsx                              # React DOM root entry point
    ├── index.css                             # Tailwind CSS v4 styling & theme tokens
    ├── components/
    │   ├── ContextualIllustrations.tsx       # Domain-specific SVG illustrations
    │   ├── ErrorBoundary.tsx                 # Runtime crash barrier
    │   ├── Navbar.tsx                        # Responsive desktop left sidebar & mobile navigation
    │   ├── PermissionModal.tsx               # Explicit permission dialogs (mic, camera, location)
    │   ├── RAGSourcesBadge.tsx               # Collapsible RAG citation badge with relevance %
    │   ├── RAGVaultModal.tsx                 # Health Knowledge Vault status & chunk manager
    │   ├── VoiceAssistantBanner.tsx          # Spoken voice assistant banner & audio controls
    │   └── ui/
    │       ├── SectionHero.tsx               # Standardized accessible page headers
    │       └── Toast.tsx                     # Global notification toasts
    ├── context/
    │   ├── AppContext.tsx                    # Core state, auth user session, active tab, toasts
    │   └── VoiceAssistantContext.tsx         # Double-Space activation & voice listening controller
    ├── data/
    │   ├── medicalKnowledgeBase.ts           # Layer B: Curated evidence-based clinical chunks
    │   └── syntheticData.ts                  # Safe clinical examples & doctor profiles
    ├── i18n/
    │   └── translations.ts                   # Multi-language translation dictionaries
    ├── lib/
    │   └── supabase.ts                       # Supabase client singleton & configuration check
    ├── services/
    │   ├── authService.ts                    # Supabase Auth, 8-char validation, session cleanup
    │   ├── cycleService.ts                   # Menstrual cycle calculations & preferences
    │   ├── locationService.ts                # Real GPS geolocation & Haversine distance calculator
    │   ├── medicalReportService.ts           # User-isolated lab report storage & Supabase sync
    │   ├── periodService.ts                  # User-isolated menstrual cycle logs
    │   ├── prescriptionService.ts            # User-isolated prescription history
    │   ├── profileService.ts                 # Profile display helpers
    │   ├── reminderService.ts                # User-isolated medication reminder schedules
    │   ├── symptomAnalysisService.ts         # Clinical symptom triage & red-flag detection
    │   ├── userPreferencesService.ts         # User-isolated UI preferences
    │   ├── voiceIntentService.ts             # Natural language voice command matcher
    │   ├── voiceNavigationRegistry.ts        # Voice navigation map and spoken walkthrough
    │   ├── voiceService.ts                   # Web Speech API speech-to-text & text-to-speech
    │   └── rag/
    │       ├── embeddingService.ts           # Hybrid dense embeddings + BM25 scoring
    │       ├── ragGenerationService.ts       # Grounded clinical response generation
    │       ├── ragVaultService.ts            # User-scoped IndexedDB chunk store & chunkers
    │       └── retrievalService.ts           # Dual-layer hybrid search & context assembler
    ├── types/
    │   ├── index.ts                          # Core data contracts & view interfaces
    │   └── rag.ts                            # RAG chunk, source, retrieval result, and vault types
    └── views/
        ├── AssistantView.tsx                 # RAG-augmented AI Health Assistant with Vault UI
        ├── DoctorsView.tsx                   # Geolocation Doctor Finder (10 km -> 100 km)
        ├── FitnessSupplementsView.tsx        # Activity tracker & supplement education
        ├── FoodNutritionView.tsx             # Food photo analysis & ICMR recipe explorer
        ├── HomeView.tsx                      # Dashboard health summary & action cards
        ├── LoginView.tsx                     # Mandatory email/password authentication gate
        ├── MentalWellbeingView.tsx           # Breathing exercises & burgundy wellness sanctuary
        ├── PeriodTrackerView.tsx             # 4-phase biology tracker & cycle calendar
        ├── PrescriptionsMedicinesView.tsx    # Prescription OCR reader & medicine catalog
        ├── ReportsView.tsx                   # Lab report biomarker simplifier & history
        └── SymptomGuidanceView.tsx           # Interactive body map & triage checker
```

---

## 3. Mandatory Authentication Gate & Session Lifecycle

### 3.1 Zero Guest Mode & Bypass Eradication
- **Guest Mode Eliminated**: All legacy guest flags (`isGuest`, `enterGuestMode`, `'guest'` AuthGateState) have been completely removed from `AppContext.tsx`, `App.tsx`, `LoginView.tsx`, and `Navbar.tsx`.
- **Absolute Gate**: In `App.tsx`, if `currentUser` is null and auth state is not loading, the application unconditionally renders `<LoginView />`. Navigation tabs, sidebar links, header actions, and protected views are completely unmounted and inaccessible.
- **Shortcut Disabling**: The Double-Space voice assistant keyboard shortcut and spacebar hold listeners in `VoiceAssistantContext.tsx` are disabled whenever `!currentUser || tab === 'login'`.
- **Direct Route Protection**: Attempting to switch tabs while unauthenticated via `setTab` forces a redirection back to `'login'`.

### 3.2 Registration & Password Validation Rules
- **Email Validation**: Enforced via RFC-compliant email regex:
  ```typescript
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  ```
- **Password Length Enforcement**: Minimum 8 characters enforced both in `authService.validatePassword()` and in `LoginView.tsx` form submission. Inline feedback displays: *"Password must be at least 8 characters long"*.
- **Authentication Source of Truth**: All authentication is handled strictly through Supabase Auth (`supabase.auth.signInWithPassword` and `supabase.auth.signUp`).

### 3.3 Session Expiration & Clean Logout
- When a user signs out via `authService.logout(userId)` or when the Supabase session expires (`SIGNED_OUT` auth change event):
  1. Active media tracks (camera and microphone streams) are terminated immediately.
  2. Local blob/object URLs created for reports, food photos, or prescription slips are revoked via `URL.revokeObjectURL`.
  3. User-isolated in-memory states are reset to blank initial states.
  4. Active tab reverts to `'login'`.
  5. A user-friendly toast notifies the user of session termination.

---

## 4. Strict User Data Isolation Architecture

To ensure compliance with clinical privacy principles, no health record, prescription, cycle log, reminder, chat message, or RAG chunk is ever shared across user boundaries.

### 4.1 Storage Namespacing Contract
Every persistent client-side key strictly incorporates the authenticated user's unique identifier (`currentUser.id`):

| Resource | Storage Medium | Namespaced Key Format |
|---|---|---|
| **Medical Reports** | LocalStorage / Supabase | `healyaar_user_${userId}_reports` |
| **Prescriptions** | LocalStorage / Supabase | `healyaar_user_${userId}_prescriptions` |
| **Menstrual Cycle Logs** | LocalStorage / Supabase | `healyaar_user_${userId}_period_logs` |
| **Cycle Preferences** | LocalStorage | `healyaar_user_${userId}_cycle_preferences` |
| **Medication Reminders**| LocalStorage / Supabase | `healyaar_user_${userId}_reminders` |
| **Chat History** | LocalStorage | `healyaar_user_${userId}_chat_history` |
| **User Preferences** | LocalStorage | `healyaar_user_${userId}_preferences` |
| **RAG Personal Vault** | IndexedDB (isolated DB) | `HealYaar_RAG_${userId}` |
| **RAG Fallback Chunks** | LocalStorage (fallback)| `healyaar_user_${userId}_rag_chunks` |

### 4.2 Multi-Tenant Boundary Guarantees
- When User A logs out and User B logs in, User B's interface initializes against `HealYaar_RAG_${userB.id}` and `healyaar_user_${userB.id}_*`.
- At no point can User B query, view, or retrieve any embeddings, chunks, lab values, or medications belonging to User A.

---

## 5. Dual-Layer Healthcare RAG System

The HealYaar RAG system addresses the critical problem of generic AI hallucinations in health advice by grounding every response in two distinct, high-fidelity knowledge layers.

### 5.1 Layer A: Personal Health Vault
The patient's private, encrypted health history:
- **Medical Reports**: Ingests blood work, lipid panels, metabolic tests, and diagnostic documents. Structured into part-based chunks with biomarker metadata (name, value, unit, status, reference range).
- **Prescriptions**: Ingests doctor prescriptions with medication metadata (drug name, dose, frequency, timing instructions, advice).
- **Menstrual & Symptom Logs**: Ingests cycle days, cycle phase, flow intensity, and tracked symptoms.
- **Nutrition Meals**: Ingests meal breakdowns, macronutrient splits (calories, protein, carbs, fats), and dietary advice.

### 5.2 Layer B: Curated Clinical & Wellness Knowledge Base
Located in `src/data/medicalKnowledgeBase.ts`, containing 12 verified, evidence-based clinical guidance modules across 4 primary domains:
1. **Lab Biomarkers & Reference Ranges**: Complete Blood Count (Hb, RBC, WBC, Platelets), Glycemic Panel (HbA1c, FPG, PPBG), Lipid Profile (Total Cholesterol, LDL, HDL, Triglycerides), Thyroid Function (TSH, Free T3/T4), Micronutrients (Vitamin D 25-OH, Vitamin B12), and Renal/Hepatic Panels (Creatinine, eGFR, SGPT/ALT, Bilirubin).
2. **Menstrual Cycle & Reproductive Health**: 4-phase biology (Menstrual, Follicular, Ovulatory, Luteal), Prostaglandin-driven dysmenorrhea, PMS vs PMDD, PCOS Rotterdam criteria, and Gynecological Red Flags (menorrhagia soaking >1 pad/hr, acute unilateral pain, postmenopausal bleeding).
3. **Nutrition Guidelines & Dietetics**: ICMR-NIN & WHO Balanced Thali model (50% vegetables/salad, 25% protein lentils/paneer/fish/egg, 25% whole grains), Iron bioavailability (Vitamin C synergy vs Tea/Coffee tannin inhibition), Calcium competition, and Sodium (<2000mg/day) / Free Sugar (<25g/day) limits.
4. **Medication Safety & Prescription Literacy**: Prescription Latin timing terms (OD, BD, TDS, QID, SOS, AC, PC, HS, Stat), Food-Drug interactions (Ciprofloxacin/Tetracycline with dairy, Levothyroxine on empty stomach, Statins with grapefruit, NSAIDs with food/PPI), Antibiotic stewardship (mandatory course completion), and Paracetamol safe limits (max 4000mg/day).

### 5.3 Semantic Chunking Strategy
Raw records are split into semantic chunks conforming to:
- **Chunk Size**: 200–400 tokens (~800–1600 characters).
- **Overlap**: 20–40 tokens (~100–180 characters) to ensure continuity across paragraph boundaries.
- **Metadata Enrichment**: Each chunk retains:
  ```typescript
  interface RAGChunk {
    id: string;
    userId: string;
    sourceType: RAGSourceType;
    sourceId: string;
    title: string;
    content: string;
    timestamp: string;
    metadata?: {
      biomarkers?: string[];
      medications?: string[];
      symptoms?: string[];
      category?: string;
      clinicalDomain?: 'lab_biomarkers' | 'menstrual_health' | 'nutrition' | 'medication_safety';
      relevanceAnchor?: string;
    };
    embedding?: number[];
  }
  ```

### 5.4 Hybrid Retrieval Engine (Cosine + BM25)
Retrieval utilizes a combined dense-sparse scoring algorithm:
1. **Dense Vector Similarity**:
   - Computes query embedding using Gemini `text-embedding-004` (if `VITE_GEMINI_API_KEY` present) or the deterministic 128-dimensional dense feature hashing model with medical domain vocabulary weighting.
   - Calculates normalized cosine similarity:
     $$S_{\text{dense}} = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$
2. **BM25 Sparse Keyword Match**:
   - Calculates term-frequency saturation ($k_1=1.5, b=0.75$) with inverse-document-frequency weights boosted for key clinical entities (biomarkers, drugs, symptoms).
   - Grants bonus score for exact metadata keyword overlaps.
3. **Combined Hybrid Score**:
   $$S_{\text{hybrid}} = 0.55 \times S_{\text{dense}} + 0.45 \times S_{\text{bm25}}$$
4. **Filtering & Ranking**:
   - Candidate chunks scored and sorted descending.
   - Selects top 3–5 personal chunks from Layer A ($S \ge 0.12$).
   - Selects top 2–3 clinical guidelines from Layer B ($S \ge 0.12$).

### 5.5 Grounded Generation & UI Transparency
- **Context Assembly**: Compiles an augmented context block clearly separating patient personal records from clinical guidelines, with a strict grounding directive for the generation engine.
- **RAGSourcesBadge Component**: Displayed under assistant answers, providing full transparency:
  - Total sources retrieved.
  - Layer breakdown pills (*X Vault*, *Y Clinical*).
  - Relevance match percentage (e.g. *94% match*).
  - Matched clinical terms.
  - Click-to-expand preview of the exact text chunk used.
- **RAGVaultModal Component**: Allows the patient to inspect all indexed personal chunks, trigger a full re-index sync of existing records, delete individual chunks, or clear the vault.

---

## 6. Preserved Core Features Reference

1. **Left Sidebar & Navigation**:
   - Desktop responsive sidebar with accessible icons, active indicators, and user account status.
   - Mobile hamburger drawer with overlay backdrop.
2. **Voice Assistant**:
   - **Double-Space Quick Toggle**: Pressing the spacebar twice in rapid succession (< 350ms) toggles voice listening on/off.
   - **Spacebar Hold**: Holding spacebar for > 800ms activates listening; releasing deactivates.
   - **Spoken Welcome & Walkthrough**: Proactively offers spoken navigation and responds to natural voice intents (*"What can I do?"*, *"Go to prescriptions"*).
3. **Reusable Camera & File Upload Pipeline**:
   - Preserves original image files/data URLs in state.
   - Does not alter, distort, or fabricate OCR contents.
4. **Period Tracker**:
   - 4-phase biology: Menstrual, Follicular, Ovulatory, Luteal.
   - Symptom checklist, flow intensity, and cycle prediction calendar.
5. **Doctor Finder**:
   - Browser GPS coordinates via HTML5 Geolocation.
   - Haversine formula calculation for true distance.
   - Smooth fallback expansion from 10 km to 100 km if no specialist is within immediate radius.

---

## 7. Security, Privacy & Medical Compliance Guidelines

1. **Non-Diagnostic Educational Stance**:
   - The application does NOT diagnose conditions or prescribe medications.
   - Persistent banners and disclaimers remind users to consult licensed medical professionals.
2. **Emergency Detection**:
   - Fast-path regex detects acute emergencies (chest pain, stroke signs, extreme breathlessness, acute self-harm).
   - Instantly triggers emergency callouts with one-tap dialing for **108 (Ambulance)** and **112 (National Emergency)**.
3. **No External Data Leakage**:
   - Uploaded health records and prescription images are processed client-side.
   - Vector embeddings and personal health chunks are stored strictly in browser IndexedDB scoped by `userId`.
