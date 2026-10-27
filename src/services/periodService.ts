import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PeriodCycleEntry } from '../types';

export const periodService = {
  /**
   * Fetches user's saved period cycles from Supabase
   */
  async getCycles(userId: string): Promise<PeriodCycleEntry[]> {
    if (!userId) {
      return [];
    }

    if (!isSupabaseConfigured()) {
      return this.getLocalCycles(userId);
    }

    try {
      const { data, error } = await supabase
        .from('period_cycles')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) {
        console.warn('Error fetching period cycles from Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        startDate: row.start_date,
        endDate: row.end_date || undefined,
        cycleLengthDays: row.cycle_length_days,
        periodDurationDays: row.period_duration_days,
        symptoms: row.symptoms || [],
        flowIntensity: row.flow_intensity || undefined,
        notes: row.notes || undefined
      }));
    } catch (err) {
      console.warn('periodService.getCycles exception:', err);
      return this.getLocalCycles(userId);
    }
  },

  /**
   * Saves a new period cycle entry
   */
  async saveCycle(userId: string, entry: Omit<PeriodCycleEntry, 'id'>): Promise<PeriodCycleEntry | null> {
    const localEntry: PeriodCycleEntry = {
      id: 'log-' + Date.now(),
      ...entry
    };

    if (!isSupabaseConfigured() || !userId) {
      if (userId) this.saveLocalCycle(userId, localEntry);
      return localEntry;
    }

    try {
      const { data, error } = await supabase
        .from('period_cycles')
        .insert({
          user_id: userId,
          start_date: entry.startDate,
          end_date: entry.endDate || null,
          cycle_length_days: entry.cycleLengthDays,
          period_duration_days: entry.periodDurationDays,
          symptoms: entry.symptoms || [],
          flow_intensity: entry.flowIntensity || null,
          notes: entry.notes || null
        })
        .select()
        .single();

      if (error) {
        console.warn('Error saving period cycle to Supabase:', error);
        if (userId) this.saveLocalCycle(userId, localEntry);
        return localEntry;
      }

      return {
        id: data.id,
        startDate: data.start_date,
        endDate: data.end_date || undefined,
        cycleLengthDays: data.cycle_length_days,
        periodDurationDays: data.period_duration_days,
        symptoms: data.symptoms || [],
        flowIntensity: data.flow_intensity || undefined,
        notes: data.notes || undefined
      };
    } catch (err) {
      console.warn('periodService.saveCycle exception:', err);
      if (userId) this.saveLocalCycle(userId, localEntry);
      return localEntry;
    }
  },

  /**
   * Deletes all period cycle logs for a user
   */
  async deleteCycles(userId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      localStorage.removeItem(`healyaar_user_${userId}_period_logs`);
    } catch {}

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('period_cycles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.warn('Error deleting period cycles from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('periodService.deleteCycles exception:', err);
      return false;
    }
  },

  getLocalCycles(userId: string): PeriodCycleEntry[] {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`healyaar_user_${userId}_period_logs`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  },

  saveLocalCycle(userId: string, entry: PeriodCycleEntry): void {
    if (!userId) return;
    try {
      const existing = this.getLocalCycles(userId);
      const updated = [entry, ...existing.filter((e) => e.id !== entry.id)];
      localStorage.setItem(`healyaar_user_${userId}_period_logs`, JSON.stringify(updated));
    } catch {}
  }
};
