import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, AuthUser } from './authService';

export interface AuthCallbackParams {
  errorCode: string | null;
  errorDescription: string | null;
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasAuthParams: boolean;
}

export interface AuthCallbackResult {
  status: 'success' | 'error' | 'none';
  session?: any;
  user?: AuthUser | null;
  errorCode?: string;
  errorDescription?: string;
  originalEmail?: string;
}

/**
 * Returns the current application base URL / redirect URL for Supabase Auth.
 * Automatically mirrors the exact protocol, host, and port where the app is actively running.
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Return window origin with trailing slash for consistent matching
    return `${window.location.origin}/`;
  }
  return 'http://localhost:5173/';
}

/**
 * Parse authentication tokens or error codes from both URL search query and hash fragment.
 */
export function parseAuthUrlParams(customUrl?: string): AuthCallbackParams {
  if (typeof window === 'undefined' && !customUrl) {
    return {
      errorCode: null,
      errorDescription: null,
      code: null,
      tokenHash: null,
      type: null,
      accessToken: null,
      refreshToken: null,
      hasAuthParams: false
    };
  }

  const search = customUrl ? new URL(customUrl).search : window.location.search;
  const rawHash = customUrl ? new URL(customUrl).hash : window.location.hash;
  const hash = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;

  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash);

  const getParam = (key: string): string | null => {
    return hashParams.get(key) || searchParams.get(key) || null;
  };

  const errorCode = getParam('error_code') || getParam('error') || null;
  const errorDescription = getParam('error_description') || getParam('message') || null;
  const code = getParam('code');
  const tokenHash = getParam('token_hash');
  const type = getParam('type');
  const accessToken = getParam('access_token');
  const refreshToken = getParam('refresh_token');

  const hasAuthParams = Boolean(
    errorCode ||
    errorDescription ||
    code ||
    tokenHash ||
    accessToken ||
    type === 'signup' ||
    type === 'recovery' ||
    type === 'email_change'
  );

  return {
    errorCode,
    errorDescription,
    code,
    tokenHash,
    type,
    accessToken,
    refreshToken,
    hasAuthParams
  };
}

/**
 * Clean handled authentication parameters from address bar without reloading or causing redirect loops.
 */
export function cleanAuthUrlParams(): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;

  try {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';

    // If the path was a dedicated callback path like /auth/callback, normalize to root
    const cleanPath = url.pathname.endsWith('/auth/callback') ? '/' : url.pathname;
    window.history.replaceState({}, document.title, cleanPath);
  } catch (err) {
    console.warn('Could not clean auth URL params:', err);
  }
}

const STORAGE_KEY_CALLBACK_ERROR = 'healyaar_auth_callback_error';

export function getStoredAuthCallbackError(): { code: string; description: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_CALLBACK_ERROR);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuthCallbackError(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_CALLBACK_ERROR);
  } catch {}
}

/**
 * Comprehensive handler for incoming authentication callbacks (PKCE code, token_hash, hash tokens, or error codes).
 */
export async function handleIncomingAuthCallback(): Promise<AuthCallbackResult> {
  const params = parseAuthUrlParams();

  // 1. Handle Explicit Supabase Auth Errors in URL (e.g. otp_expired, access_denied)
  if (params.errorCode || params.errorDescription) {
    const code = params.errorCode || 'unknown_error';
    let description = params.errorDescription || 'Email verification link is invalid or has expired.';

    // Decode URI component if needed
    try {
      description = decodeURIComponent(description.replace(/\+/g, ' '));
    } catch {}

    try {
      sessionStorage.setItem(STORAGE_KEY_CALLBACK_ERROR, JSON.stringify({ code, description }));
    } catch {}

    // Clean address bar so refreshing doesn't re-trigger
    cleanAuthUrlParams();

    return {
      status: 'error',
      errorCode: code,
      errorDescription: description
    };
  }

  // 2. Check if an error was captured earlier in session
  const storedError = getStoredAuthCallbackError();
  if (storedError && !params.hasAuthParams) {
    return {
      status: 'error',
      errorCode: storedError.code,
      errorDescription: storedError.description
    };
  }

  if (!params.hasAuthParams) {
    return { status: 'none' };
  }

  if (!isSupabaseConfigured()) {
    cleanAuthUrlParams();
    return {
      status: 'error',
      errorCode: 'unconfigured',
      errorDescription: 'Supabase authentication service is not configured in this environment.'
    };
  }

  // 2. Handle PKCE Flow: exchange code for session
  if (params.code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      cleanAuthUrlParams();

      if (error) {
        return {
          status: 'error',
          errorCode: (error as any).code || 'pkce_exchange_failed',
          errorDescription: error.message || 'Unable to exchange authentication code.'
        };
      }

      if (data.session) {
        const user = await authService.getCurrentUser();
        return {
          status: 'success',
          session: data.session,
          user
        };
      }
    } catch (e: any) {
      cleanAuthUrlParams();
      return {
        status: 'error',
        errorCode: 'pkce_exception',
        errorDescription: e.message || 'Error completing authentication code exchange.'
      };
    }
  }

  // 3. Handle Token Hash Verification (Email OTP / magiclink)
  if (params.tokenHash) {
    try {
      const type = (params.type as any) || 'signup';
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: params.tokenHash,
        type
      });
      cleanAuthUrlParams();

      if (error) {
        return {
          status: 'error',
          errorCode: (error as any).code || 'otp_expired',
          errorDescription: error.message || 'Email link is invalid or has expired.'
        };
      }

      if (data.session) {
        const user = await authService.getCurrentUser();
        return {
          status: 'success',
          session: data.session,
          user
        };
      }
    } catch (e: any) {
      cleanAuthUrlParams();
      return {
        status: 'error',
        errorCode: 'otp_exception',
        errorDescription: e.message || 'Error verifying email token.'
      };
    }
  }

  // 4. Handle Implicit Flow Hash Tokens (#access_token=...)
  if (params.accessToken) {
    try {
      // Supabase's detectSessionInUrl will process hash tokens; verify that a session is established
      const { data: { session }, error } = await supabase.auth.getSession();
      cleanAuthUrlParams();

      if (error) {
        return {
          status: 'error',
          errorCode: (error as any).code || 'token_error',
          errorDescription: error.message
        };
      }

      if (session) {
        const user = await authService.getCurrentUser();
        return {
          status: 'success',
          session,
          user
        };
      }
    } catch (e: any) {
      cleanAuthUrlParams();
      return {
        status: 'error',
        errorCode: 'session_exception',
        errorDescription: e.message
      };
    }
  }

  cleanAuthUrlParams();
  return { status: 'none' };
}
