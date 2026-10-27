import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, PhoneCall, ShieldAlert, Heart, X, CheckCircle2 } from 'lucide-react';

export const EmergencySOSModal: React.FC = () => {
  const { isEmergencyModalOpen, closeEmergencyModal, t, highContrast } = useApp();

  if (!isEmergencyModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] ${
          highContrast
            ? 'bg-black border-4 border-yellow-400 text-yellow-300'
            : 'bg-white dark:bg-slate-900 border-2 border-red-500 text-slate-900 dark:text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-200 dark:border-red-900/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-2xl text-red-600 dark:text-red-400">
              <ShieldAlert className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
                {t.emergencyModalTitle}
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
                {t.emergencyModalDesc}
              </p>
            </div>
          </div>
          <button
            onClick={closeEmergencyModal}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={t.close}
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Warning Symptoms Checklist */}
        <div className="mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200">
          <p className="font-bold text-base sm:text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            Immediate Red-Flag Warning Signs:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm sm:text-base font-semibold">
            <li>Crushing chest pain, pressure, or tightness spreading to arm, jaw, or back</li>
            <li>Sudden difficulty breathing, gasping for air, or bluish lips/fingertips</li>
            <li>Sudden numbness or drooping on one side of the face or body</li>
            <li>Loss of consciousness, acute confusion, or sudden slurred speech</li>
            <li>Thoughts of self-harm, severe distress, or overwhelming panic crisis</li>
          </ul>
        </div>

        {/* Action Hotlines */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Direct One-Touch Emergency Call Numbers:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:108"
              className="flex items-center justify-between p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <PhoneCall className="w-6 h-6 animate-pulse" />
                <span>{t.callAmbulance}</span>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">Tap to Call</span>
            </a>

            <a
              href="tel:112"
              className="flex items-center justify-between p-4 bg-rose-700 hover:bg-rose-800 text-white rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <PhoneCall className="w-6 h-6" />
                <span>{t.callNationalEmergency}</span>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">Tap to Call</span>
            </a>

            <a
              href="tel:14416"
              className="flex items-center justify-between p-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95 sm:col-span-2"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <div>
                  <div>{t.callMentalHealth}</div>
                  <div className="text-xs font-normal text-teal-100">Govt. of India 24/7 Free Mental Health Helpline</div>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">Tap to Call</span>
            </a>
          </div>
        </div>

        {/* Immediate First Steps */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">What to do while waiting:</h4>
          <div className="space-y-2 text-sm sm:text-base text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t.emergencyStep1}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t.emergencyStep2}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t.emergencyStep3}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeEmergencyModal}
            className="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-base transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
