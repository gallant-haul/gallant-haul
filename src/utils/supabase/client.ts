/**
 * Supabase Client for Gallant Line Haul Corp
 * Strict production integration for client and driver authentication & database
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase defaults configured for Gallant Line Haul Corp
const PRODUCTION_SUPABASE_URL = 'https://xwrrvvsvylbkantcjhvu.supabase.co';
const PRODUCTION_SUPABASE_KEY = 'sb_publishable_lIrRvqOu-NsYjPwhCno-iw_kSMxMRyP';

// Resolve Supabase URL and Anon / Publishable Key
function getSupabaseConfig(): { url: string; anonKey: string } {
  // 1. Vite environment variables
  const viteUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const viteKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY;

  // 2. Next.js style / fallback environment variables if injected
  const nextUrl = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined;
  const nextKey =
    typeof process !== 'undefined'
      ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : undefined;

  // 3. Browser-persisted config override if set
  let localUrl = '';
  let localKey = '';
  if (typeof window !== 'undefined') {
    localUrl = window.localStorage.getItem('GALLANT_SUPABASE_URL') || '';
    localKey = window.localStorage.getItem('GALLANT_SUPABASE_KEY') || '';
  }

  const url = viteUrl || nextUrl || localUrl || PRODUCTION_SUPABASE_URL;
  const anonKey = viteKey || nextKey || localKey || PRODUCTION_SUPABASE_KEY;

  return { url: url.trim(), anonKey: anonKey.trim() };
}

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && !url.includes('placeholder'));
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('GALLANT_SUPABASE_URL', url.trim());
    window.localStorage.setItem('GALLANT_SUPABASE_KEY', anonKey.trim());
    supabaseInstance = null;
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('GALLANT_SUPABASE_URL');
    window.localStorage.removeItem('GALLANT_SUPABASE_KEY');
    supabaseInstance = null;
  }
}

export function getSupabase(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
}

export const supabase = getSupabase();
