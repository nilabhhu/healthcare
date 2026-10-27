import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getAuthRedirectUrl } from './authCallbackService';
import { User, Session } from '@supabase/supabase-js';

/**
 * HealYaar Production Authentication Service (Supabase Auth)
 *
 * Implements Supabase Auth with session persistence, profile sync,
 * password recovery, password reset, and graceful local fallback when unconfigured.
 */

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailOrPhone: string;
  rememberMe: boolean;
  loginDate: string;
  avatarUrl?: string | null;
  emailConfirmed: boolean;
}

export interface LoginCredentials {
  email: string;
  emailOrPhone?: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  emailOrPhone?: string;
  password: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  field?: 'email' | 'emailOrPhone' | 'password' | 'name' | 'confirmPassword' | 'general';
  message?: string;
}

const STORAGE_KEY_AUTH = 'healyaar_auth_user';
const STORAGE_KEY_REMEMBERED_ID = 'healyaar_remembered_identifier';

/**
 * Validates whether string is a valid email format
 */
export function isValidEmail(input: string): boolean {
  const trimmed = input.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates identifier as email strictly
 */
export function validateIdentifier(input: string): { isValid: boolean; type: 'email' | 'invalid' } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, type: 'invalid' };
  }
  if (isValidEmail(trimmed)) {
    return { isValid: true, type: 'email' };
  }
  return { isValid: false, type: 'invalid' };
}

/**
 * Maps Supabase error codes & messages to patient-friendly explanations
 */
export function mapSupabaseAuthError(error: any): { message: string; field: 'email' | 'emailOrPhone' | 'password' | 'name' | 'general' } {
  if (!error) return { message: 'An unexpected authentication error occurred.', field: 'general' };

  const msg = (error.message || '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return {
      message: 'Incorrect email or password. Please double check and try again, or use "Forgot password".',
      field: 'password'
    };
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('email_exists')) {
    return {
      message: 'An account with this email already exists. Please sign in or use password recovery.',
      field: 'email'
    };
  }
  if (msg.includes('password') && (msg.includes('least') || msg.includes('too short') || msg.includes('weak'))) {
    return {
      message: 'Password must be at least 8 characters long.',
      field: 'password'
    };
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return {
      message: 'Too many attempts. For your security, please wait a minute before trying again.',
      field: 'general'
    };
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return {
      message: 'Network connection issue. Please check your internet connection.',
      field: 'general'
    };
  }
  if (msg.includes('email not confirmed')) {
    return {
      message: 'Please check your email inbox to confirm your account before logging in.',
      field: 'email'
    };
  }

  return {
    message: error.message || 'Authentication error. Please try again.',
    field: 'general'
  };
}

/**
 * Converts a Supabase User object into an application-friendly AuthUser
 */
export function mapSupabaseUserToAuthUser(sbUser: User, rememberMe = true): AuthUser {
  const name =
    sbUser.user_metadata?.full_name ||
    sbUser.user_metadata?.name ||
    (sbUser.email ? sbUser.email.split('@')[0] : 'HealYaar Member');

  const isConfirmed = Boolean(
    sbUser.email_confirmed_at ||
    (sbUser as any).confirmed_at
  );

  const email = sbUser.email || '';

  return {
    id: sbUser.id,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email,
    emailOrPhone: email,
    rememberMe,
    loginDate: new Date().toISOString(),
    avatarUrl: sbUser.user_metadata?.avatar_url || null,
    emailConfirmed: isConfirmed
  };
}

export const authService = {
  /**
   * Retrieves saved identifier if "Remember me" was previously checked
   */
  getRememberedIdentifier(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_REMEMBERED_ID) || '';
    } catch {
      return '';
    }
  },

  /**
   * Fetches current Supabase session
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;
      return data.session;
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
      return null;
    }
  },

  /**
   * Supabase Auth is the only source of truth for identity.
   * Client-side localStorage flags are NEVER trusted as proof of authentication.
   */
  getStoredUser(): AuthUser | null {
    return null;
  },

  /**
   * Retrieves currently authenticated user (async, validates session via Supabase Auth)
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }

      const authUser = mapSupabaseUserToAuthUser(user);

      // Attempt to enrich with profile record
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.full_name) {
          authUser.name = profile.full_name;
        }
        if (profile?.avatar_url) {
          authUser.avatarUrl = profile.avatar_url;
        }
      } catch (profileErr) {
        console.warn('Profile fetch notice:', profileErr);
      }

      return authUser;
    } catch (e) {
      console.warn('Supabase auth.getUser() error:', e);
      return null;
    }
  },

  /**
   * Sign In with email + password strictly via Supabase Auth
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const rawEmail = credentials.email || credentials.emailOrPhone || '';
    const email = rawEmail.trim();
    const { password, rememberMe = true } = credentials;

    if (!email) {
      return { success: false, error: 'Please enter your email.', field: 'email' };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.', field: 'email' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.', field: 'password' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.', field: 'password' };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Authentication service is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.',
        field: 'general'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { success: false, error: mapped.message, field: mapped.field };
      }

      if (!data.user) {
        return { success: false, error: 'Invalid login credentials.', field: 'general' };
      }

      const authUser = mapSupabaseUserToAuthUser(data.user, rememberMe);

      // Fetch or ensure profile row exists linked to data.user.id
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.full_name) {
          authUser.name = profile.full_name;
        } else {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: authUser.name,
            email,
            avatar_url: null
          });
        }
      } catch (profileErr) {
        console.warn('Profile sync notice:', profileErr);
      }

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_REMEMBERED_ID, email);
      } else {
        localStorage.removeItem(STORAGE_KEY_REMEMBERED_ID);
      }

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please try again.', field: 'general' };
    }
  },

  /**
   * Sign Up / Register new account with Supabase Auth
   */
  async signup(credentials: SignUpCredentials): Promise<AuthResult> {
    const rawEmail = credentials.email || credentials.emailOrPhone || '';
    const email = rawEmail.trim();
    const { name, password, confirmPassword, rememberMe = true } = credentials;
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.', field: 'name' };
    }
    if (!email) {
      return { success: false, error: 'Please enter your email.', field: 'email' };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.', field: 'email' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.', field: 'password' };
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.', field: 'confirmPassword' };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Authentication service is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.',
        field: 'general'
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            full_name: trimmedName,
            name: trimmedName
          }
        }
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { success: false, error: mapped.message, field: mapped.field };
      }

      // Check if duplicate user: Supabase returns identities: [] when user already exists
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in or use password recovery.',
          field: 'email'
        };
      }

      if (!data.user) {
        return { success: false, error: 'Registration could not be completed. Please try again.', field: 'general' };
      }

      const authUser = mapSupabaseUserToAuthUser(data.user, rememberMe);
      authUser.name = trimmedName;

      // Ensure profile row exists linked strictly to user.id
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: trimmedName,
          email,
          avatar_url: null
        });
      } catch (profileErr) {
        console.warn('Profile creation notice:', profileErr);
      }

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_REMEMBERED_ID, email);
      }

      return {
        success: true,
        user: authUser,
        message: data.user.email_confirmed_at
          ? 'Account created successfully!'
          : 'Account created! Please check your email to confirm your account before logging in.'
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed. Please try again.', field: 'general' };
    }
  },

  /**
   * Request password reset link / recovery email
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Authentication service is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: getAuthRedirectUrl()
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { success: false, message: mapped.message };
      }

      return {
        success: true,
        message: `If an account with ${trimmed} exists, a secure password reset link has been sent to your inbox.`
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Unable to send password reset link.' };
    }
  },

  /**
   * Update password (e.g. after clicking reset link)
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Authentication service is not configured.'
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { success: false, message: mapped.message };
      }
      return { success: true, message: 'Password updated successfully! You can now sign in with your new password.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update password.' };
    }
  },

  /**
   * Resends verification email to an unconfirmed user
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Authentication service is not configured.'
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmed,
        options: {
          emailRedirectTo: getAuthRedirectUrl()
        }
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { success: false, message: mapped.message };
      }

      return {
        success: true,
        message: `Verification link sent to ${trimmed}. Please check your inbox and spam folder.`
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Unable to resend verification email.' };
    }
  },

  /**
   * Clears all locally cached data scoped to a user or all legacy keys
   */
  clearUserLocalData(userId?: string): void {
    try {
      if (userId) {
        localStorage.removeItem(`healyaar_user_${userId}_reports`);
        localStorage.removeItem(`healyaar_user_${userId}_prescriptions`);
        localStorage.removeItem(`healyaar_user_${userId}_period_logs`);
        localStorage.removeItem(`healyaar_user_${userId}_reminders`);
        localStorage.removeItem(`healyaar_user_${userId}_preferences`);
        localStorage.removeItem(`healyaar_user_${userId}_chat_history`);
        localStorage.removeItem(`healyaar_user_${userId}_symptoms`);
        localStorage.removeItem(`healyaar_user_${userId}_nutrition`);
      }
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem('healyaar_reminders');
      localStorage.removeItem('healyaar_period_logs');
      localStorage.removeItem('healyaar_report_history');
      localStorage.removeItem('healyaar_prescriptions');
      localStorage.removeItem('healyaar_user_preferences');
      localStorage.removeItem('healyaar_cycle_preferences');
      localStorage.removeItem('healyaar_guest_mode');
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      sessionStorage.removeItem('healyaar_active_prescription');
      sessionStorage.removeItem('healyaar_pending_voice_query');
      sessionStorage.removeItem('healyaar_guest_mode');
    } catch {
      // ignore
    }
  },

  /**
   * Sign Out
   */
  async logout(userId?: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    this.clearUserLocalData(userId);
  },

  /**
   * Subscribes to Supabase Auth State changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
};
