import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mic, MapPin, Bell, FileText, X } from 'lucide-react';

export const PermissionModal: React.FC = () => {
  const { permissionModal, closePermissionModal, t, highContrast } = useApp();

  if (!permissionModal.isOpen) return null;

  const getIcon = () => {
    switch (permissionModal.type) {
      case 'mic':
        return <Mic className="w-8 h-8 text-teal-600" />;
      case 'location':
        return <MapPin className="w-8 h-8 text-blue-600" />;
      case 'notifications':
        return <Bell className="w-8 h-8 text-amber-600" />;
      case 'report_ocr':
      case 'rx_ocr':
        return <FileText className="w-8 h-8 text-purple-600" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-teal-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 ${
          highContrast
            ? 'bg-black border-4 border-yellow-400 text-yellow-300'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-2xl">{getIcon()}</div>
          <button
            onClick={closePermissionModal}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label={t.close}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-4">
          <h3 id="permission-modal-title" className="text-xl sm:text-2xl font-bold">
            {permissionModal.title}
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            {permissionModal.description}
          </p>
        </div>

        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span>
            <strong>Privacy Guarantee:</strong> Stored locally on this device. We never listen in the background, sell, or share your data.
          </span>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            onClick={() => {
              permissionModal.onDenied();
              closePermissionModal();
            }}
            className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.deny}
          </button>
          <button
            onClick={() => {
              permissionModal.onGranted();
              closePermissionModal();
            }}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-md transition-colors"
          >
            {t.allow}
          </button>
        </div>
      </div>
    </div>
  );
};
