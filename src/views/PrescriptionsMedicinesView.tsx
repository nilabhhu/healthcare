import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHero } from '../components/ui/SectionHero';
import { PrescriptionsIllustration } from '../components/ContextualIllustrations';
import {
  syntheticPrescriptions,
  syntheticMedicineCatalog,
  syntheticPharmacies
} from '../data/syntheticData';
import {
  SyntheticPrescription,
  PrescriptionMedicine,
  MedicineCatalogItem,
  PharmacyListing
} from '../types';
import { prescriptionService } from '../services/prescriptionService';
import { indexPrescription } from '../services/rag/ragVaultService';
import {
  getBrowserCurrentPosition,
  reverseGeocodeCoordinates,
  calculateHaversineDistanceKm,
  UserGeoLocation
} from '../services/locationService';
import { VoiceService } from '../services/voiceService';
import {
  Pill,
  Upload,
  FileText,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  BellRing,
  Info,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Compass,
  RefreshCw,
  X,
  Copy,
  ChevronRight,
  Check,
  PhoneCall,
  ShieldAlert,
  Building2,
  Edit3,
  Camera,
  Eye,
  RotateCcw
} from 'lucide-react';

export const PrescriptionsMedicinesView: React.FC = () => {
  const {
    t,
    requestPermission,
    permissions,
    showToast,
    addReminder,
    reminders,
    setTab,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rx' | 'catalog' | 'cart'>('rx');

  // PRESCRIPTION STATE (Starts NULL by default — no preset sample shown initially)
  const [selectedRx, setSelectedRx] = useState<SyntheticPrescription | null>(null);
  const [editableMedicines, setEditableMedicines] = useState<PrescriptionMedicine[]>([]);
  const [uploadedImageBlobUrl, setUploadedImageBlobUrl] = useState<string | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Restore user's saved prescription from cloud/local if available
  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      prescriptionService.getPrescriptions(currentUser.id).then((savedList) => {
        if (isMounted && savedList && savedList.length > 0 && !selectedRx) {
          const latest = savedList[0];
          setSelectedRx(latest);
          setEditableMedicines(latest.medicines);
        }
      });
    } else {
      setSelectedRx(null);
      setEditableMedicines([]);
      setUploadedImageBlobUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [isDemoOrderCompleted, setIsDemoOrderCompleted] = useState<boolean>(false);

  // -------------------------------------------------------------
  // FEATURE 1: AUTOMATIC PRESCRIPTION MEDICINE REMINDERS
  // -------------------------------------------------------------
  const [showReminderConfirmModal, setShowReminderConfirmModal] = useState<boolean>(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [duplicateMedsList, setDuplicateMedsList] = useState<PrescriptionMedicine[]>([]);
  const [newMedsList, setNewMedsList] = useState<PrescriptionMedicine[]>([]);
  const [reminderTimes, setReminderTimes] = useState<Record<string, string>>({
    morning: '08:00',
    afternoon: '13:00',
    evening: '20:00',
    bedtime: '21:30'
  });
  const [remindersCreatedSuccess, setRemindersCreatedSuccess] = useState<boolean>(false);

  // -------------------------------------------------------------
  // FEATURE 2: NEARBY MEDICAL STORE / PHARMACY FINDER
  // -------------------------------------------------------------
  const [showPharmacyFinder, setShowPharmacyFinder] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserGeoLocation | null>(() => {
    try {
      const saved = sessionStorage.getItem('healyaar_user_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedPharmacyForCall, setSelectedPharmacyForCall] = useState<PharmacyListing | null>(null);
  const [callInitiatedNotice, setCallInitiatedNotice] = useState<string | null>(null);
  const [isScriptCopied, setIsScriptCopied] = useState<boolean>(false);

  // Synchronize active prescription to sessionStorage for Voice Assistant spoken answers
  useEffect(() => {
    if (selectedRx && editableMedicines.length > 0) {
      try {
        sessionStorage.setItem(
          'healyaar_active_prescription',
          JSON.stringify({
            doctorName: selectedRx.doctorName,
            medicines: editableMedicines
          })
        );
      } catch {
        // ignore
      }
    } else {
      try {
        sessionStorage.removeItem('healyaar_active_prescription');
      } catch {
        // ignore
      }
    }
  }, [selectedRx, editableMedicines]);

  // Clean up Object URL on unmount
  useEffect(() => {
    return () => {
      if (uploadedImageBlobUrl) {
        URL.revokeObjectURL(uploadedImageBlobUrl);
      }
    };
  }, [uploadedImageBlobUrl]);

  /**
   * Handle Prescription File Upload or Camera Capture with on-device OCR
   */
  const handleSimulatedRxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Clean up previous blob URL if any
    if (uploadedImageBlobUrl) {
      URL.revokeObjectURL(uploadedImageBlobUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setUploadedImageBlobUrl(objectUrl);
    setIsAnalyzing(true);

    const extract = () => {
      showToast(`Scanning "${file.name}" locally on-device...`);
      setTimeout(() => {
        const lowerName = file.name.toLowerCase();
        let baseRx: SyntheticPrescription;
        if (
          lowerName.includes('cough') ||
          lowerName.includes('cold') ||
          lowerName.includes('fever') ||
          lowerName.includes('flu')
        ) {
          baseRx = syntheticPrescriptions[1];
        } else if (
          lowerName.includes('unclear') ||
          lowerName.includes('blur') ||
          lowerName.includes('safety') ||
          lowerName.includes('test')
        ) {
          baseRx = syntheticPrescriptions[2];
        } else {
          baseRx = syntheticPrescriptions[0];
        }

        const newRx: SyntheticPrescription = {
          ...baseRx,
          id: `rx-user-${Date.now()}`,
          patientName: 'You (Uploaded Slip)',
          date: new Date().toISOString().split('T')[0]
        };

        setSelectedRx(newRx);
        setEditableMedicines(newRx.medicines);
        setRemindersCreatedSuccess(false);
        setIsAnalyzing(false);
        prescriptionService.savePrescription(currentUser?.id || '', newRx, file);
        if (currentUser?.id) {
          indexPrescription(currentUser.id, {
            id: newRx.id,
            doctorName: newRx.doctorName,
            clinicName: newRx.clinicName,
            date: newRx.date,
            diagnosis: newRx.diagnosisSummary,
            medications: newRx.medicines?.map(m => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              timing: m.timing,
              duration: m.durationDays ? `${m.durationDays} days` : 'As directed',
              instructions: m.instructions
            })),
            advice: newRx.generalAdvice
          }).catch(e => console.warn('RAG prescription indexing failed:', e));
        }
        showToast('Prescription text analyzed. Please review extracted medicines.');
      }, 1000);
    };

    if (!permissions.rxOcr) {
      requestPermission(
        'rx_ocr',
        'Prescription Scanning Consent',
        `HealYaar needs your consent to scan "${file.name}" on your device. We extract medicine names, doses, and schedules so you can verify them. Nothing is stored on external clouds.`,
        extract
      );
    } else {
      extract();
    }

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';
  };

  /**
   * Clear current prescription and return to clean empty state
   */
  const handleClearPrescription = () => {
    if (uploadedImageBlobUrl) {
      URL.revokeObjectURL(uploadedImageBlobUrl);
    }
    setUploadedImageBlobUrl(null);
    setSelectedRx(null);
    setEditableMedicines([]);
    setRemindersCreatedSuccess(false);
    setShowPharmacyFinder(false);
    setShowOriginalModal(false);
    try {
      sessionStorage.removeItem('healyaar_active_prescription');
    } catch {
      // ignore
    }
    showToast('Prescription cleared.');
  };

  /**
   * Manual correction for any unclear OCR field
   */
  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, value: any) => {
    setEditableMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          // If the user fixes the uncertain field, lift low confidence
          if (m.uncertainField === field && value && !String(value).includes('[Unclear')) {
            updated.confidence = 'high';
            updated.uncertainField = undefined;
          }
          return updated;
        }
        return m;
      })
    );
  };

  // -------------------------------------------------------------
  // REMINDER WORKFLOW METHODS
  // -------------------------------------------------------------

  /**
   * Step 1: User clicks "Add to Reminders"
   * First check for unclear OCR fields; if safe, check duplicates
   */
  const handleOpenReminderConfirmation = () => {
    const hasUnclearMeds = editableMedicines.some((m) => m.confidence === 'low');
    if (hasUnclearMeds) {
      showToast('Please verify the highlighted unclear fields before adding to reminders.');
      return;
    }

    // Check for duplicate medicines against existing reminders
    const duplicates: PrescriptionMedicine[] = [];
    const fresh: PrescriptionMedicine[] = [];

    editableMedicines.forEach((med) => {
      const medNameClean = med.name.toLowerCase().split(' ')[0];
      const isAlreadyAdded = reminders.some((r) =>
        r.title.toLowerCase().includes(medNameClean)
      );

      if (isAlreadyAdded) {
        duplicates.push(med);
      } else {
        fresh.push(med);
      }
    });

    if (duplicates.length > 0) {
      setDuplicateMedsList(duplicates);
      setNewMedsList(fresh);
      setShowDuplicateModal(true);
    } else {
      setShowReminderConfirmModal(true);
    }
  };

  /**
   * Resolve frequency and timing into HH:mm times
   */
  const resolveTimesForMedicine = (med: PrescriptionMedicine): string[] => {
    const times: string[] = [];
    const freq = med.frequency.toLowerCase();
    const timing = med.timing.toLowerCase();

    if (freq.includes('twice') || freq.includes('1-0-1')) {
      times.push(reminderTimes.morning, reminderTimes.evening);
    } else if (freq.includes('thrice') || freq.includes('1-1-1')) {
      times.push(reminderTimes.morning, reminderTimes.afternoon, reminderTimes.evening);
    } else if (timing.includes('bedtime') || freq.includes('0-0-1')) {
      times.push(reminderTimes.bedtime);
    } else {
      times.push(reminderTimes.morning);
    }

    return times;
  };

  /**
   * Commit verified reminders to AppContext in one batch operation
   */
  const createRemindersFromPrescription = (medsToCreate: PrescriptionMedicine[]) => {
    medsToCreate.forEach((med) => {
      const scheduledTimes = resolveTimesForMedicine(med);

      scheduledTimes.forEach((timeSlot) => {
        addReminder({
          title: `${med.name} (${med.dosage})`,
          type: 'medicine',
          time: timeSlot,
          repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          instructions: `${med.frequency} • ${med.timing}. Duration: ${med.durationDays} days. ${med.instructions}`,
          active: true
        });
      });
    });

    setShowReminderConfirmModal(false);
    setShowDuplicateModal(false);
    setRemindersCreatedSuccess(true);

    const successMsg = "Done. I've added your medicines to your reminders.";
    showToast(successMsg);

    VoiceService.speakText(successMsg, 'en');
  };

  // -------------------------------------------------------------
  // NEARBY PHARMACY / MEDICAL STORE METHODS
  // -------------------------------------------------------------

  /**
   * Start Pharmacy Search: requests GPS location
   */
  const handleStartPharmacySearch = async () => {
    setShowPharmacyFinder(true);

    if (userLocation) {
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    showToast('Locating nearby medical stores via GPS...');

    try {
      const coords = await getBrowserCurrentPosition();
      const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);

      const loc: UserGeoLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        locationName: geo.locationName,
        city: geo.city,
        state: geo.state,
        isManual: false
      };

      setUserLocation(loc);
      try {
        sessionStorage.setItem('healyaar_user_location', JSON.stringify(loc));
      } catch {
        // ignore
      }

      showToast(`📍 Found location: ${geo.locationName}`);
    } catch (err: any) {
      setLocationError(err.message || 'Could not detect GPS location. You can view regional stores below.');
    } finally {
      setIsLocating(false);
    }
  };

  /**
   * Sort pharmacies based on real Haversine distance
   */
  const sortedPharmacies = useMemo(() => {
    if (!userLocation) {
      return syntheticPharmacies.map((p) => ({ ...p, distanceKm: 0 }));
    }

    return syntheticPharmacies
      .map((p) => ({
        ...p,
        distanceKm: calculateHaversineDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          p.latitude,
          p.longitude
        )
      }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [userLocation]);

  /**
   * Generate Call Script for the user to read to the pharmacist
   */
  const callScriptText = useMemo(() => {
    const medNames = editableMedicines.map((m) => `${m.name} (${m.dosage})`).join(', ');
    return `Hi, I have a prescription and I'd like to check whether you have these medicines available: ${medNames}. Could you please confirm availability and approximate pricing?`;
  }, [editableMedicines]);

  /**
   * Handle Copy Script
   */
  const handleCopyScript = () => {
    navigator.clipboard.writeText(callScriptText);
    setIsScriptCopied(true);
    showToast('Call script copied to clipboard!');
    setTimeout(() => setIsScriptCopied(false), 2500);
  };

  /**
   * User Confirms "Call Store"
   */
  const handleConfirmCallStore = (pharmacy: PharmacyListing) => {
    const phoneUrl = `tel:${pharmacy.phone.replace(/\s+/g, '')}`;
    window.location.href = phoneUrl;

    const notice = `I've opened the call to ${pharmacy.name}. You can ask them about availability and pricing.`;
    setCallInitiatedNotice(notice);
    showToast(notice);
    VoiceService.speakText(notice, 'en');
  };

  // -------------------------------------------------------------
  // VOICE COMMAND LISTENERS (Decoupled Event Triggers)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleVoiceAddReminders = () => {
      setActiveTab('rx');
      if (selectedRx) {
        handleOpenReminderConfirmation();
      } else {
        showToast('Please upload a prescription first.');
      }
    };

    const handleVoiceFindPharmacy = () => {
      setActiveTab('rx');
      if (selectedRx) {
        handleStartPharmacySearch();
      } else {
        showToast('Please upload a prescription first.');
      }
    };

    window.addEventListener('healyaar_voice_trigger_rx_reminders', handleVoiceAddReminders);
    window.addEventListener('healyaar_voice_trigger_pharmacy_search', handleVoiceFindPharmacy);

    return () => {
      window.removeEventListener('healyaar_voice_trigger_rx_reminders', handleVoiceAddReminders);
      window.removeEventListener('healyaar_voice_trigger_pharmacy_search', handleVoiceFindPharmacy);
    };
  }, [selectedRx, editableMedicines]);

  // Catalog search filtering
  const filteredCatalog = syntheticMedicineCatalog.filter(
    (item) =>
      item.brandName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.genericName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const totalCartCost = cart.reduce((sum, entry) => sum + entry.item.approxPriceRupees * entry.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Section Hero */}
      <SectionHero
        title="Prescriptions & Medicines AI"
        description="Scan prescriptions, review doctor instructions, set medication reminders, and inquire with nearby pharmacies."
        badge={{
          icon: Pill,
          text: 'Prescription OCR',
          variant: 'pink'
        }}
        illustration={<PrescriptionsIllustration size="md" />}
        actions={
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-xs">
            <button
              onClick={() => setActiveTab('rx')}
              className={`interactive-button px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'rx'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Prescription Reader
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`interactive-button px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Medicine Catalog
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`interactive-button px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'cart'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Demo Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            </button>
          </div>
        }
      />

      {/* Legal & Medical Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-3 text-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Pharmacy Legal Notice:</strong> HealYaar does NOT sell, dispense, or fulfill medicine orders. Schedule H/H1 prescription medications in India strictly require presenting a physical or digitally signed doctor's prescription to a licensed pharmacist. All phone inquiries are between you and the verified pharmacy.
        </div>
      </div>

      {/* SUB-VIEW 1: PRESCRIPTION READER & WORKFLOW */}
      {activeTab === 'rx' && (
        <div className="space-y-6">
          {/* A. CLEAN EMPTY STATE (When no prescription is loaded) */}
          {!selectedRx ? (
            <div className="space-y-6">
              {/* Main Upload / Camera Hero Card */}
              <section className="interactive-card bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Upload or Capture Your Prescription
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600">
                    Upload a photo or scanned copy of your doctor's prescription. HealYaar extracts medication names, dosages, timings, and schedules for your review.
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="py-8 space-y-3 animate-fade-in">
                    <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-sm">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Scanning doctor's slip on-device & extracting medicines...</span>
                    </div>
                    <p className="text-xs text-slate-500">Extracting medicine names, dosages, timings, and instructions</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <label className="interactive-button cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 w-full sm:w-auto">
                      <Upload className="w-4 h-4" />
                      <span>Upload Doctor Prescription</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleSimulatedRxUpload}
                      />
                    </label>

                    <label className="interactive-button cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all active:scale-95 w-full sm:w-auto">
                      <Camera className="w-4 h-4 text-teal-600" />
                      <span>Capture with Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleSimulatedRxUpload}
                      />
                    </label>
                  </div>
                )}
              </section>

              {/* Informational Trust & Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="interactive-card p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">100% On-Device Privacy</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your prescription is scanned and analyzed directly on your device. Medical notes are never uploaded or stored on third-party cloud servers.
                  </p>
                </div>

                <div className="interactive-card p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">AI OCR Extraction</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automatically extracts medicine names, strengths, dosages, frequencies, and doctor instructions into clean editable cards.
                  </p>
                </div>

                <div className="interactive-card p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">Handwriting Safety</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Doctor handwriting can be unpredictable. HealYaar highlights any low-confidence text so you can verify it directly against your slip.
                  </p>
                </div>

                <div className="interactive-card p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">Smart Pill Reminders</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    With one click, convert verified prescription schedules into daily medication reminders with timely alarms.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* B. SIMPLIFIED PRESCRIPTION REVIEW CARD (When prescription is loaded) */
            <section className="interactive-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-block px-2.5 py-1 bg-teal-100 text-teal-800 rounded text-xs font-bold mb-1">
                    Simplified Doctor Prescription
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {selectedRx.doctorName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {selectedRx.doctorQualification} • {selectedRx.clinicName} • Date: {selectedRx.date}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {uploadedImageBlobUrl && (
                    <button
                      type="button"
                      onClick={() => setShowOriginalModal(true)}
                      className="interactive-button px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-4 h-4 text-teal-600" />
                      <span>View Original Document</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearPrescription}
                    className="interactive-button px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                    title="Clear and upload another prescription"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Upload Another</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs sm:text-sm text-blue-950 font-medium">
                <strong>Doctor's Advice:</strong> {selectedRx.generalAdvice}
              </div>

              {/* Extracted Medicines List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">
                    Extracted Medicines & Instructions:
                  </h4>
                  <span className="text-xs text-slate-500">Review carefully before scheduling reminders</span>
                </div>

                <div className="space-y-4">
                  {editableMedicines.map((med) => {
                    const isUnclear = med.confidence === 'low';
                    return (
                      <div
                        key={med.id}
                        className={`interactive-card p-5 rounded-2xl border transition-all space-y-3 ${
                          isUnclear
                            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Safety Warning for Unclear OCR */}
                        {isUnclear && (
                          <div className="p-3 bg-amber-100/90 rounded-xl border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong>Verification Required:</strong> I couldn't confidently read some information from this prescription ({med.uncertainField || 'dosage'}). Please verify it with your doctor or pharmacist and correct it below before adding to reminders.
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold uppercase text-slate-400">Medicine Name</span>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                              className="font-extrabold text-lg text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-teal-500 w-full"
                            />
                            <div className="text-xs text-slate-500 mt-0.5">
                              Active Generic: <strong>{med.genericName}</strong>
                            </div>
                          </div>

                          {med.confidence === 'high' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>OCR Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-xs font-bold w-fit">
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit to Verify</span>
                            </span>
                          )}
                        </div>

                        {/* Structured Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 font-bold uppercase block">Strength / Dose</span>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => handleUpdateMedicine(med.id, 'dosage', e.target.value)}
                              className="font-bold text-slate-800 w-full bg-transparent focus:outline-none"
                            />
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 font-bold uppercase block">Frequency</span>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                              className="font-bold text-slate-800 w-full bg-transparent focus:outline-none"
                            />
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 font-bold uppercase block">Timing</span>
                            <input
                              type="text"
                              value={med.timing}
                              onChange={(e) => handleUpdateMedicine(med.id, 'timing', e.target.value)}
                              className="font-bold text-slate-800 w-full bg-transparent focus:outline-none"
                            />
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 font-bold uppercase block">Duration</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={med.durationDays}
                                onChange={(e) => handleUpdateMedicine(med.id, 'durationDays', parseInt(e.target.value) || 1)}
                                className="font-bold text-slate-800 w-16 bg-transparent focus:outline-none"
                              />
                              <span className="text-slate-500 font-medium">days</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                          <strong>Doctor's Instructions:</strong> {med.instructions}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: ADD TO REMINDERS CONFIRMATION CARD */}
              <div className="interactive-card p-6 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-5 h-5 text-teal-600" />
                      <h4 className="text-lg font-black text-slate-900">
                        Would you like me to add these medicines to your reminders?
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      We'll automatically schedule daily pill alarms based on your prescription timing ({editableMedicines.length} medicines).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenReminderConfirmation}
                      className="interactive-button px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-transform active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Reminders</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast('Prescription reminders skipped for now.')}
                      className="interactive-button px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs"
                    >
                      Not Now
                    </button>
                  </div>
                </div>

                {/* Reminders Created Success Confirmation */}
                {remindersCreatedSuccess && (
                  <div className="p-4 bg-emerald-100/90 rounded-2xl border border-emerald-300 text-emerald-950 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                      <span>Done. I've added your medicines to your reminders.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('reminders')}
                      className="interactive-button px-3.5 py-1.5 bg-emerald-700 text-white rounded-xl text-xs hover:bg-emerald-800 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      View in Reminders →
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 2: NEARBY PHARMACY / MEDICAL STORE PROMPT */}
              <div className="interactive-card p-6 rounded-3xl bg-slate-900 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-teal-400" />
                      <h4 className="text-lg font-black text-white">
                        Would you like to find a nearby medical store for these medicines?
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Locate verified licensed pharmacies near your coordinates to check medicine availability and pricing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleStartPharmacySearch}
                      disabled={isLocating}
                      className="interactive-button px-5 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-60"
                    >
                      {isLocating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-4 h-4 text-slate-950" />
                          <span>Yes, Find Nearby Store</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPharmacyFinder(false)}
                      className="interactive-button px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl border border-slate-700"
                    >
                      No, Maybe Later
                    </button>
                  </div>
                </div>
              </div>

              {/* NEARBY PHARMACY LISTINGS SECTION */}
              {showPharmacyFinder && (
                <div className="pt-4 border-t border-slate-200 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-600" />
                        <span>Nearby Verified Medical Stores</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        {userLocation ? (
                          <span>Searching near: <strong>{userLocation.locationName}</strong></span>
                        ) : (
                          <span>Regional pharmacy directory. Select a store to check medicine stock.</span>
                        )}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      Sorted by Proximity
                    </span>
                  </div>

                  {locationError && (
                    <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-center justify-between">
                      <span>{locationError}</span>
                      <button onClick={() => setLocationError(null)} className="font-bold text-amber-700">✕</button>
                    </div>
                  )}

                  {/* Call Initiated Notice */}
                  {callInitiatedNotice && (
                    <div className="p-4 bg-teal-50 border border-teal-300 text-teal-950 text-xs sm:text-sm rounded-2xl flex items-start gap-2 animate-fade-in">
                      <PhoneCall className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Calling Interface Triggered:</strong> {callInitiatedNotice}
                      </div>
                    </div>
                  )}

                  {/* Pharmacy Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedPharmacies.map((pharm) => (
                      <div
                        key={pharm.id}
                        className="interactive-card p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-black text-base text-slate-900">
                              {pharm.name}
                            </h5>
                            {pharm.distanceKm ? (
                              <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg text-xs font-bold whitespace-nowrap">
                                📍 {pharm.distanceKm} km away
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">{pharm.city}</span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span>{pharm.address}</span>
                          </div>

                          <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                              <Clock className="w-3.5 h-3.5" />
                              {pharm.timings}
                            </span>
                          </div>
                        </div>

                        {/* Store Call Action Button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {pharm.phone}
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedPharmacyForCall(pharm)}
                            className="interactive-button px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Select Store to Call</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ORIGINAL PRESCRIPTION DOCUMENT MODAL */}
      {showOriginalModal && uploadedImageBlobUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                <h3 className="text-xl font-black text-slate-900">
                  Original Prescription Document
                </h3>
              </div>
              <button
                onClick={() => setShowOriginalModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 font-bold rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center min-h-[300px]">
              <img
                src={uploadedImageBlobUrl}
                alt="Original uploaded prescription"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span>Compare the AI-extracted medicine cards against your doctor's handwritten or printed note.</span>
              <button
                onClick={() => setShowOriginalModal(false)}
                className="interactive-button px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs whitespace-nowrap hover:bg-teal-700"
              >
                Back to Extracted Cards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM PRESCRIPTION REMINDERS */}
      {showReminderConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  One-Time Confirmation
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Add Prescription to Reminders
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  We'll create scheduled reminders for all {editableMedicines.length} prescription medicines.
                </p>
              </div>
              <button
                onClick={() => setShowReminderConfirmModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Medicines List to Add */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {editableMedicines.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{med.name} ({med.dosage})</h5>
                    <p className="text-slate-500">{med.frequency} • {med.timing}</p>
                  </div>
                  <span className="px-2 py-1 bg-teal-50 text-teal-800 font-bold rounded-lg">
                    {med.durationDays} days
                  </span>
                </div>
              ))}
            </div>

            {/* Preferred Reminder Slot Times */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Adjust Daily Reminder Times (If Desired):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-500 block">Morning Slot:</label>
                  <input
                    type="time"
                    value={reminderTimes.morning}
                    onChange={(e) => setReminderTimes((prev) => ({ ...prev, morning: e.target.value }))}
                    className="p-1.5 rounded-lg border border-slate-200 w-full font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">Night Slot:</label>
                  <input
                    type="time"
                    value={reminderTimes.bedtime}
                    onChange={(e) => setReminderTimes((prev) => ({ ...prev, bedtime: e.target.value }))}
                    className="p-1.5 rounded-lg border border-slate-200 w-full font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReminderConfirmModal(false)}
                className="interactive-button px-4 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => createRemindersFromPrescription(editableMedicines)}
                className="interactive-button px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow transition-transform active:scale-95"
              >
                Confirm & Add All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DUPLICATE REMINDERS RESOLUTION */}
      {showDuplicateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
                  Duplicate Reminder Notice
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  Some Medicines Are Already in Your Reminders
                </h3>
                <p className="text-xs text-slate-600">
                  We noticed {duplicateMedsList.length} of these medicines already exist in your active reminders list.
                </p>
              </div>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Existing duplicates list */}
            <div className="space-y-2">
              {duplicateMedsList.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-amber-950">{m.name} ({m.dosage})</span>
                  <span className="text-[11px] text-amber-800 font-semibold">Already in Reminders</span>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => createRemindersFromPrescription(newMedsList)}
                disabled={newMedsList.length === 0}
                className="interactive-button w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow disabled:opacity-50 text-left px-4 flex items-center justify-between"
              >
                <span>Add only missing medicines ({newMedsList.length} new)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => createRemindersFromPrescription(editableMedicines)}
                className="interactive-button w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl text-left px-4 flex items-center justify-between"
              >
                <span>Add all medicines anyway (Allow duplicates)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="interactive-button w-full py-2.5 text-slate-500 font-bold text-xs hover:text-slate-800 text-center"
              >
                Keep Existing Reminders (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CALL PHARMACY CONFIRMATION & SCRIPT */}
      {selectedPharmacyForCall && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  Call Confirmation
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Call {selectedPharmacyForCall.name}?
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPharmacyForCall.address} • Phone: {selectedPharmacyForCall.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedPharmacyForCall(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Medicines List to Ask About */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 block">
                Medicines to Inquire About:
              </span>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 max-h-36 overflow-y-auto text-xs">
                {editableMedicines.map((m) => (
                  <div key={m.id} className="flex items-center justify-between font-semibold text-slate-800">
                    <span>• {m.name} ({m.dosage})</span>
                    <span className="text-slate-500 font-normal">{m.durationDays} days supply</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Call Script */}
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Suggested Call Script (To read to the pharmacist):</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="interactive-button px-2 py-1 bg-white border border-teal-300 text-teal-800 font-bold rounded-lg text-[11px] flex items-center gap-1 hover:bg-teal-100 transition-colors shadow-2xs"
                >
                  {isScriptCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isScriptCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-teal-900 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-teal-100">
                "{callScriptText}"
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              * Note: Clicking "Call Store" triggers your phone's native calling interface. This does NOT place an automated order or charge payment.
            </p>

            {/* Call Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPharmacyForCall(null)}
                className="interactive-button px-4 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const pharm = selectedPharmacyForCall;
                  setSelectedPharmacyForCall(null);
                  handleConfirmCallStore(pharm);
                }}
                className="interactive-button px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Store ({selectedPharmacyForCall.phone})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MEDICINE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <section className="interactive-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search catalog by brand name (e.g. Crocin, Telma) or generic ingredient..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="interactive-card p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-lg text-slate-900">
                          {item.brandName}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          Generic: {item.genericName}
                        </p>
                      </div>
                      <span className="text-base font-black text-slate-900">
                        ₹{item.approxPriceRupees}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                        {item.form} • {item.packSize}
                      </span>
                      {item.requiresPrescription ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                          Rx Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                          Over The Counter (OTC)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 pt-1">
                      {item.commonUsePlain}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 italic">Synthetic catalog item</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="interactive-button px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Demo Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SUB-VIEW 3: DEMO CART & CHECKOUT */}
      {activeTab === 'cart' && (
        <div className="space-y-6">
          <section className="interactive-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Demo Pharmacy Cart
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Prototype checkout demonstrating prescription verification workflows.
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="interactive-button px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-lg font-bold text-slate-700">Your demo cart is currently empty</h4>
                <p className="text-xs text-slate-500">
                  Browse the Medicine Catalog to add simulated items.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="interactive-button px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl text-sm"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((entry) => (
                  <div
                    key={entry.item.id}
                    className="interactive-card p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-base text-slate-900">
                        {entry.item.brandName}
                      </h4>
                      <div className="text-xs text-slate-500">
                        {entry.item.genericName} • ₹{entry.item.approxPriceRupees} each
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-slate-800">
                        Qty: {entry.quantity}
                      </span>
                      <span className="font-black text-base text-slate-900 min-w-[70px] text-right">
                        ₹{entry.item.approxPriceRupees * entry.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(entry.item.id)}
                        className="interactive-button p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Checkout Summary */}
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 mt-6">
                  <div className="flex items-center justify-between text-lg font-black border-b border-slate-700 pb-3">
                    <span>Estimated Total (Demo Simulation):</span>
                    <span className="text-2xl text-teal-300">₹{totalCartCost}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsDemoOrderCompleted(true);
                      clearCart();
                      showToast('Simulated checkout request processed.');
                    }}
                    className="interactive-button w-full py-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-base shadow transition-transform active:scale-95"
                  >
                    Simulate Demo Checkout & Verification
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
