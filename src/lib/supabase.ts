import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys stored in localStorage for easy user customization in the UI
const STORAGE_KEY_URL = 'master_rummy_supabase_url';
const STORAGE_KEY_ANON = 'master_rummy_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : '') || '';
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : '') || '';

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('your-project') &&
    anonKey.length > 20 &&
    !anonKey.includes('your-anon')
  );

  return { url, anonKey, isConfigured };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    window.location.reload();
  }
};

const config = getSupabaseConfig();

// Create the singleton Supabase client
export const supabase: SupabaseClient = createClient(
  config.isConfigured ? config.url : 'https://placeholder-project.supabase.co',
  config.isConfigured ? config.anonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Diagnostic connection test helper
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> => {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are not configured yet.',
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, but connection succeeded:
      if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: `Connected to Supabase in ${latencyMs}ms, but database tables need to be migrated. (Run migration SQL in Supabase SQL Editor).`,
          latencyMs,
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message} (${error.code || 'unknown'})`,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase PostgreSQL & Realtime (${latencyMs}ms latency).`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || String(err)}`,
    };
  }
};

// ==========================================
// SUPABASE AUTH & PROFILES HELPERS
// ==========================================

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  username: string;
  avatar: string;
  practiceChips: number;
}

export const signUpWithEmail = async (
  email: string,
  pass: string,
  username: string,
  avatar?: string
): Promise<{ user?: SupabaseAuthUser; error?: string }> => {
  const cfg = getSupabaseConfig();
  const defaultAvatar =
    avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  if (!cfg.isConfigured) {
    // Local session simulation for instant offline testing
    const fallbackId = `user_${Date.now().toString(36)}`;
    const userObj: SupabaseAuthUser = {
      id: fallbackId,
      email,
      username: username || `Player_${fallbackId.slice(-4)}`,
      avatar: defaultAvatar,
      practiceChips: 10000,
    };
    localStorage.setItem('master_rummy_active_auth_user', JSON.stringify(userObj));
    return { user: userObj };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          username: username || email.split('@')[0],
          avatar: defaultAvatar,
          practice_chips: 10000,
        },
      },
    });

    if (error) return { error: error.message };

    const supaUser = data.user;
    if (!supaUser) return { error: 'Failed to create user' };

    // Also ensure profiles table entry exists
    try {
      await supabase.from('profiles').upsert({
        id: supaUser.id,
        username: username || supaUser.email?.split('@')[0] || 'Player',
        avatar: defaultAvatar,
        practice_chips: 10000,
      });
    } catch {}

    const authUser: SupabaseAuthUser = {
      id: supaUser.id,
      email: supaUser.email,
      username: username || supaUser.email?.split('@')[0] || 'Player',
      avatar: defaultAvatar,
      practiceChips: 10000,
    };
    localStorage.setItem('master_rummy_active_auth_user', JSON.stringify(authUser));
    return { user: authUser };
  } catch (err: any) {
    return { error: err.message || 'Signup failed' };
  }
};

export const signInWithEmail = async (
  email: string,
  pass: string
): Promise<{ user?: SupabaseAuthUser; error?: string }> => {
  const cfg = getSupabaseConfig();

  if (!cfg.isConfigured) {
    const fallbackId = `user_${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
    const userObj: SupabaseAuthUser = {
      id: fallbackId,
      email,
      username: email.split('@')[0] || 'Player',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      practiceChips: 10000,
    };
    localStorage.setItem('master_rummy_active_auth_user', JSON.stringify(userObj));
    return { user: userObj };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) return { error: error.message };
    const supaUser = data.user;
    if (!supaUser) return { error: 'No user returned from Supabase Auth' };

    // Fetch profile
    let username = supaUser.user_metadata?.username || supaUser.email?.split('@')[0] || 'Player';
    let avatar =
      supaUser.user_metadata?.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    let practiceChips = 10000;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supaUser.id)
      .single();

    if (profile) {
      username = profile.username || username;
      avatar = profile.avatar || avatar;
      practiceChips = Number(profile.practice_chips || 10000);
    }

    const authUser: SupabaseAuthUser = {
      id: supaUser.id,
      email: supaUser.email,
      username,
      avatar,
      practiceChips,
    };
    localStorage.setItem('master_rummy_active_auth_user', JSON.stringify(authUser));
    return { user: authUser };
  } catch (err: any) {
    return { error: err.message || 'Login failed' };
  }
};

// Quick Test User (Account 1 or Account 2) for zero-friction 2-device multiplayer verification
export const signInQuickTestUser = async (
  accountNum: 1 | 2
): Promise<{ user?: SupabaseAuthUser; error?: string }> => {
  const email = `testplayer${accountNum}@masterrummy.internal`;
  const pass = 'TestPlayer@MasterRummy2026!';
  const username = accountNum === 1 ? 'Player_Alpha_1' : 'Player_Beta_2';
  const avatar =
    accountNum === 1
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) {
    const userObj: SupabaseAuthUser = {
      id: `quick_test_user_${accountNum}`,
      email,
      username,
      avatar,
      practiceChips: 25000,
    };
    localStorage.setItem('master_rummy_active_auth_user', JSON.stringify(userObj));
    return { user: userObj };
  }

  // Attempt sign in first, or sign up if not existing
  const signInRes = await signInWithEmail(email, pass);
  if (signInRes.user) return signInRes;

  const signUpRes = await signUpWithEmail(email, pass, username, avatar);
  if (signUpRes.user) return signUpRes;

  // Fallback to local session if auth error (e.g. rate limit or signup confirmation required)
  const userObj: SupabaseAuthUser = {
    id: `quick_test_user_${accountNum}`,
    email,
    username,
    avatar,
    practiceChips: 25000,
  };
  localStorage.setItem('master_rummy_active_auth_user', JSON.stringify(userObj));
  return { user: userObj };
};

export const signOutUser = async (): Promise<void> => {
  try {
    const cfg = getSupabaseConfig();
    if (cfg.isConfigured) {
      await supabase.auth.signOut();
    }
  } catch {}
  if (typeof window !== 'undefined') {
    localStorage.removeItem('master_rummy_active_auth_user');
  }
};

export const getSavedAuthUser = (): SupabaseAuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('master_rummy_active_auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SupabaseAuthUser;
  } catch {
    return null;
  }
};

