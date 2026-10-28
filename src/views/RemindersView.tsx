import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHero } from '../components/ui/SectionHero';
import { RemindersIllustration } from '../components/ContextualIllustrations';
import { Tooltip } from '../components/ui/Tooltip';
import { ReminderItem } from '../types';
import {
  BellRing,
  Plus,
  Trash2,
  AlertTriangle,
  Volume2,
  BellOff,
  Calendar,
  CheckCircle2,
  Clock
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
  const [newDate, setNewDate] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  const allWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addReminder({
      title: newTitle.trim(),
      type: newType,
      time: newTime,
      date: newType === 'appointment' && newDate ? newDate : undefined,
      repeatDays: newType === 'appointment' ? ['Once'] : selectedDays.length > 0 ? selectedDays : ['Daily'],
      instructions: newInstructions.trim() || (newType === 'appointment' ? 'Carry medical records.' : 'Take with water as directed.'),
      active: true,
      isPersonalReminder: true
    });

    setNewTitle('');
    setNewDate('');
    setNewInstructions('');
    showToast('Reminder saved successfully!');
  };

  const handleTestNotification = () => {
    const notify = () => {
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
      } catch {
        // ignore
      }
      showToast('🔔 Chime! "HealYaar Reminder: Scheduled Health Dose"');
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

  const filteredReminders = reminders.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.type === activeFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <SectionHero
        title="Medication & Appointment Reminders"
        description="Daily schedules and clinic reminders with gentle on-screen and audible alerts."
        badge={{
          icon: BellRing,
          text: 'Smart Alerts',
          variant: 'amber'
        }}
        illustration={<RemindersIllustration size="md" />}
        actions={
          <Tooltip content="Play audible test tone" position="bottom">
            <button
              onClick={handleTestNotification}
              className="interactive-button inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 border border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300 font-semibold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Test Alarm Tone</span>
            </button>
          </Tooltip>
        }
      />

      {/* Main Reminder Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create New Reminder Form */}
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Set New Reminder</span>
          </h2>

          <form onSubmit={handleCreateReminder} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Title:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Blood Pressure Pill (Amlodipine)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Type:
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="medicine">💊 Medicine / Pill</option>
                <option value="appointment">🩺 Doctor Appointment</option>
                <option value="water">💧 Hydration / Water</option>
                <option value="vitals">📊 Health Checkup / BP Log</option>
              </select>
            </div>

            {newType === 'appointment' && (
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                  Appointment Date:
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Alarm Time:
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {newType !== 'appointment' && (
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
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
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Instructions:
              </label>
              <textarea
                rows={2}
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                placeholder="e.g. 1 tablet after breakfast with warm water"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="interactive-button w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs transition-transform active:scale-95 text-xs sm:text-sm"
            >
              Save Reminder
            </button>
          </form>
        </section>

        {/* Right Column: Scheduled Reminders List */}
        <section className="interactive-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Scheduled Reminders ({filteredReminders.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Managed on this device with sound and notification triggers.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('medicine')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'medicine'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Medicines
              </button>
              <button
                onClick={() => setActiveFilter('appointment')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'appointment'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Appointments
              </button>
            </div>
          </div>

          {filteredReminders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold">No reminders for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`interactive-card p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    rem.active
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-bold">
                        {rem.type === 'medicine'
                          ? '💊 Medicine'
                          : rem.type === 'appointment'
                          ? '🩺 Appointment'
                          : '💧 Water'}
                      </span>
                      {rem.date && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{rem.date}</span>
                        </span>
                      )}
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {rem.time}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {rem.title}
                    </h4>

                    {rem.clinicName && (
                      <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
                        Location: {rem.clinicName}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {rem.instructions}
                    </p>

                    <div className="text-[11px] text-slate-400 pt-0.5">
                      Days: <span className="font-semibold text-slate-600 dark:text-slate-300">{rem.repeatDays.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Tooltip content={rem.active ? 'Pause alerts' : 'Activate alerts'} position="top">
                      <button
                        onClick={() => toggleReminder(rem.id)}
                        className={`interactive-button px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          rem.active
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rem.active ? 'Active' : 'Paused'}
                      </button>
                    </Tooltip>

                    <Tooltip content="Delete reminder" position="top">
                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="interactive-button p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                        aria-label="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Safety Notice */}
      <section className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-slate-700 dark:text-slate-300">Reminder Accuracy:</strong> HealYaar announces the exact titles and instructions you confirm. It does not alter physician dosages. Consult your printed medication slip or doctor for clinical changes.
        </div>
      </section>
    </div>
  );
};
