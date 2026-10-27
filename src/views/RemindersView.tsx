import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHero } from '../components/ui/SectionHero';
import { RemindersIllustration } from '../components/ContextualIllustrations';
import { ReminderItem } from '../types';
import {
  BellRing,
  Plus,
  Trash2,
  AlertTriangle,
  Volume2,
  BellOff
} from 'lucide-react';

export const RemindersView: React.FC = () => {
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    requestPermission,
    permissions,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'medicine' | 'appointment' | 'water'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ReminderItem['type']>('medicine');
  const [newTime, setNewTime] = useState('08:00');
  const [newInstructions, setNewInstructions] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  const allWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addReminder({
      title: newTitle.trim(),
      type: newType,
      time: newTime,
      repeatDays: selectedDays.length > 0 ? selectedDays : ['Daily'],
      instructions: newInstructions.trim() || 'Take with water as prescribed.',
      active: true
    });

    setNewTitle('');
    setNewInstructions('');
    showToast('Reminder saved successfully!');
  };

  const handleTestNotification = () => {
    const notify = () => {
      // Simulate an audible alarm tone with Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {
        // ignore
      }
      showToast('🔔 Chime! "HealYaar Reminder: Morning BP Medicine (Telmisartan 40mg)"');
    };

    if (!permissions.notifications) {
      requestPermission(
        'notifications',
        'Notification & Reminder Alert Permission',
        'HealYaar requests permission to sound reminders at scheduled times for your daily medicines and clinic visits.',
        notify
      );
    } else {
      notify();
    }
  };

  const filteredReminders = reminders.filter(r => {
    if (activeFilter === 'all') return true;
    return r.type === activeFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <SectionHero
        title="Medicine & Appointment Reminders"
        description="Keep track of daily medications and clinic dates with gentle on-screen and audible alerts."
        badge={{
          icon: BellRing,
          text: 'Smart Alerts',
          variant: 'amber'
        }}
        illustration={<RemindersIllustration size="md" />}
        actions={
          <button
            onClick={handleTestNotification}
            className="interactive-button inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 border border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300 font-semibold text-xs sm:text-sm transition-all shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Test Reminder Alarm</span>
          </button>
        }
      />

      {/* Main Reminder Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create New Reminder Form */}
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Set New Reminder
          </h2>

          <form onSubmit={handleCreateReminder} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Reminder Title:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Blood Pressure Pill (Amlodipine)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Type:
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="medicine">💊 Medicine / Pill</option>
                <option value="appointment">🩺 Doctor Appointment</option>
                <option value="water">💧 Hydration / Water</option>
                <option value="vitals">📊 Health Checkup / BP Log</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Alarm Time:
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Repeat Days:
              </label>
              <div className="flex flex-wrap gap-1">
                {allWeekDays.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Instructions / Notes:
              </label>
              <textarea
                rows={2}
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                placeholder="e.g. 1 tablet after breakfast with warm water"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="interactive-button w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow transition-transform active:scale-95 text-sm"
            >
              Save Reminder
            </button>
          </form>
        </section>

        {/* Right Column: Active Reminders List */}
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Scheduled Reminders ({filteredReminders.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage alarms stored safely on this device.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('medicine')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'medicine'
                    ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Medicines
              </button>
              <button
                onClick={() => setActiveFilter('appointment')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'appointment'
                    ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Appointments
              </button>
            </div>
          </div>

          {filteredReminders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-semibold">No reminders found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`interactive-card p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rem.active
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold">
                        {rem.type === 'medicine' ? '💊 Medicine' : rem.type === 'appointment' ? '🩺 Appointment' : '💧 Water'}
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {rem.time}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {rem.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {rem.instructions}
                    </p>

                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      Days: <span className="font-bold text-slate-700 dark:text-slate-300">{rem.repeatDays.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Active Switch */}
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`interactive-button px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        rem.active
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {rem.active ? 'Active' : 'Paused'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="interactive-button p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete reminder"
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Relocated Instructions & Reminder Rules Section (Moved to the very bottom, visually secondary) */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600/70 dark:text-amber-500/70 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-slate-700 dark:text-slate-300">Exact Instructions Rule:</strong> HealYaar repeats the exact reminder title and instructions you type. It does NOT generate or change clinical dosage instructions. Always refer to your printed prescription box or consult your pharmacist.
        </div>
      </section>
    </div>
  );
};
