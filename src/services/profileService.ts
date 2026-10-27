import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from './authService';

export const profileService = {
  /**
   * Fetches user profile by user UUID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile:', error);
        return null;
      }
      if (!data) return null;

      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        avatarUrl: data.avatar_url,
        phone: data.phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn('profileService.getProfile exception:', err);
      return null;
    }
  },

  /**
   * Updates user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured() || !userId) return false;

    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) {
        console.warn('Error updating profile:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('profileService.updateProfile exception:', err);
      return false;
    }
  }
};
