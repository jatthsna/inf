import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials for production cloud sync
const DEFAULT_SUPABASE_URL = 'https://xolgtadrooyrbcgytneo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_mjAFMmLLlFwDBbmeQt35QA_J21dQDoi';

const ENV_SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const ENV_SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

const STORED_URL_KEY = 'kas_info_supabase_url';
const STORED_KEY_KEY = 'kas_info_supabase_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORED_URL_KEY) : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORED_KEY_KEY) : '';

  const url = localUrl || ENV_SUPABASE_URL;
  const key = localKey || ENV_SUPABASE_ANON_KEY;

  return { url: url.trim(), key: key.trim() };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORED_URL_KEY, url.trim());
    localStorage.setItem(STORED_KEY_KEY, key.trim());
    // reload client
    initSupabaseClient();
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORED_URL_KEY);
    localStorage.removeItem(STORED_KEY_KEY);
    initSupabaseClient();
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
}

export const supabase = initSupabaseClient();

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  const client = initSupabaseClient();
  if (!client) {
    return { ok: false, message: 'URL atau Anon Key Supabase belum dikonfigurasi.' };
  }
  try {
    const { error } = await client.from('app_cloud_store').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
        return { 
          ok: true, 
          message: 'Terhubung ke server Supabase! Silakan jalankan script SQL di Supabase SQL Editor agar tabel dibuat.' 
        };
      }
      return { ok: false, message: `Koneksi gagal: ${error.message}` };
    }
    return { ok: true, message: 'Berhasil terhubung ke database Supabase Cloud! Sinkronisasi aktif.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Gagal menghubungi server Supabase.' };
  }
}
