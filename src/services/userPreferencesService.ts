import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SupportedLanguage, TextSize } from '../types';

export interface UserPreferencesData {
  theme: 'light' | 'dark';
  textSize: TextSize;
  language: SupportedLanguage;
  highContrast: boolean;
  typicalCycleLength?: number;
  typicalPeriodDuration?: number;
  lastPeriodStart?: string | null;
}

const STORAGE_KEY_PREFS = 'healyaar_user_preferences';

export const userPreferencesService = {
  /**
   * Fetch preferences for the user
   */
  async getPreferences(userId?: string): Promise<UserPreferencesData | null> {
    const storageKey = userId ? `healyaar_user_${userId}_preferences` : STORAGE_KEY_PREFS;

    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching preferences from Supabase:', error.message);
        } else if (data) {
          const prefs: UserPreferencesData = {
            theme: data.theme === 'dark' ? 'dark' : 'light',
            textSize: (['normal', 'large', 'xlarge'].includes(data.text_size) ? data.text_size : 'normal') as TextSize,
            language: data.language || 'en',
            highContrast: Boolean(data.high_contrast),
            typicalCycleLength: data.typical_cycle_length || 28,
            typicalPeriodDuration: data.typical_period_duration || 5,
            lastPeriodStart: data.last_period_start || null
          };

          // Cache in localStorage scoped by userId
          try {
            localStorage.setItem(storageKey, JSON.stringify(prefs));
          } catch {
            // ignore
          }

          return prefs;
        }
      } catch (err) {
        console.warn('Network error fetching preferences:', err);
      }
    }

    // LocalStorage fallback scoped by userId
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    return null;
  },

  /**
   * Save or update preferences
   */
  async savePreferences(userId: string | undefined, prefs: Partial<UserPreferencesData>): Promise<void> {
    const storageKey = userId ? `healyaar_user_${userId}_preferences` : STORAGE_KEY_PREFS;

    // 1. Update localStorage scoped by userId
    try {
      const existing = localStorage.getItem(storageKey);
      const current = existing ? JSON.parse(existing) : {};
      const updated = { ...current, ...prefs };
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // 2. If logged in and Supabase is configured, upsert into DB
    if (isSupabaseConfigured() && userId) {
      try {
        const payload: Record<string, any> = {
          user_id: userId,
          updated_at: new Date().toISOString()
        };

        if (prefs.theme !== undefined) payload.theme = prefs.theme;
        if (prefs.textSize !== undefined) payload.text_size = prefs.textSize;
        if (prefs.language !== undefined) payload.language = prefs.language;
        if (prefs.highContrast !== undefined) payload.high_contrast = prefs.highContrast;
        if (prefs.typicalCycleLength !== undefined) payload.typical_cycle_length = prefs.typicalCycleLength;
        if (prefs.typicalPeriodDuration !== undefined) payload.typical_period_duration = prefs.typicalPeriodDuration;
        if (prefs.lastPeriodStart !== undefined) payload.last_period_start = prefs.lastPeriodStart;

        const { error } = await supabase.from('user_preferences').upsert(payload);
        if (error) {
          console.warn('Error saving preferences to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Network error saving preferences:', err);
      }
    }
  },

  /**
   * Synchronize local preferences to Supabase upon first authenticated sign in
   */
  async syncLocalPreferencesToSupabase(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;

    try {
      let localTheme: 'light' | 'dark' = 'light';
      try {
        const savedTheme = localStorage.getItem('healyaar_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') localTheme = savedTheme;
      } catch {}

      const { error } = await supabase.from('user_preferences').upsert({
        user_id: userId,
        theme: localTheme,
        text_size: 'normal',
        language: 'en',
        high_contrast: false,
        typical_cycle_length: 28,
        typical_period_duration: 5
      }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Failed to sync initial preferences to Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Sync preferences error:', err);
    }
  }
};
