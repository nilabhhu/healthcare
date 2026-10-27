import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ReminderItem } from '../types';

export const reminderService = {
  /**
   * Fetches user's reminders from Supabase
   */
  async getReminders(userId: string): Promise<ReminderItem[]> {
    if (!userId) {
      return [];
    }

    if (!isSupabaseConfigured()) {
      return this.getLocalReminders(userId);
    }

    try {
      const { data, error } = await supabase
        .from('medication_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching reminders from Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.type || 'medicine',
        time: row.time,
        repeatDays: row.repeat_days || [],
        instructions: row.instructions || '',
        active: row.active ?? true,
        createdDate: row.created_date || row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10)
      }));
    } catch (err) {
      console.warn('reminderService.getReminders exception:', err);
      return this.getLocalReminders(userId);
    }
  },

  /**
   * Adds a new reminder
   */
  async addReminder(userId: string, reminder: Omit<ReminderItem, 'id' | 'createdDate'>): Promise<ReminderItem> {
    const localReminder: ReminderItem = {
      id: 'rem-' + Date.now(),
      createdDate: new Date().toISOString().slice(0, 10),
      ...reminder
    };

    if (!isSupabaseConfigured() || !userId) {
      if (userId) this.saveLocalReminder(userId, localReminder);
      return localReminder;
    }

    try {
      const { data, error } = await supabase
        .from('medication_reminders')
        .insert({
          user_id: userId,
          title: reminder.title,
          type: reminder.type,
          time: reminder.time,
          repeat_days: reminder.repeatDays,
          instructions: reminder.instructions,
          active: reminder.active
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving reminder to Supabase:', error);
        if (userId) this.saveLocalReminder(userId, localReminder);
        return localReminder;
      }

      return {
        id: data.id,
        title: data.title,
        type: data.type,
        time: data.time,
        repeatDays: data.repeat_days,
        instructions: data.instructions,
        active: data.active,
        createdDate: data.created_date
      };
    } catch (err) {
      console.warn('reminderService.addReminder exception:', err);
      if (userId) this.saveLocalReminder(userId, localReminder);
      return localReminder;
    }
  },

  /**
   * Toggles active state of a reminder
   */
  async toggleReminder(userId: string, reminderId: string, currentActive: boolean): Promise<boolean> {
    if (!userId) return false;
    try {
      const list = this.getLocalReminders(userId);
      const updated = list.map((r) => (r.id === reminderId ? { ...r, active: !currentActive } : r));
      localStorage.setItem(`healyaar_user_${userId}_reminders`, JSON.stringify(updated));
    } catch {}

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('medication_reminders')
        .update({ active: !currentActive, updated_at: new Date().toISOString() })
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error updating reminder in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('reminderService.toggleReminder exception:', err);
      return false;
    }
  },

  /**
   * Deletes a reminder
   */
  async deleteReminder(userId: string, reminderId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const list = this.getLocalReminders(userId);
      const updated = list.filter((r) => r.id !== reminderId);
      localStorage.setItem(`healyaar_user_${userId}_reminders`, JSON.stringify(updated));
    } catch {}

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('medication_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error deleting reminder in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('reminderService.deleteReminder exception:', err);
      return false;
    }
  },

  getLocalReminders(userId: string): ReminderItem[] {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`healyaar_user_${userId}_reminders`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  },

  saveLocalReminder(userId: string, reminder: ReminderItem): void {
    if (!userId) return;
    try {
      const existing = this.getLocalReminders(userId);
      const updated = [reminder, ...existing.filter((r) => r.id !== reminder.id)];
      localStorage.setItem(`healyaar_user_${userId}_reminders`, JSON.stringify(updated));
    } catch {}
  }
};
