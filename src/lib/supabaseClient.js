import { createClient } from '@supabase/supabase-js';

// Sanitize URL: if env var points to the old paused project or is empty, use active ioyvfigbxyoexyqcaxsj
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const SUPABASE_URL = (rawUrl && !rawUrl.includes('hxspfwjoxxmluhwqbsva'))
  ? rawUrl
  : 'https://ioyvfigbxyoexyqcaxsj.supabase.co';

// Sanitize Anon Key: if env var is empty, whitespace, or placeholder, use valid publishable key
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const SUPABASE_ANON_KEY = (rawKey && !rawKey.includes('placeholder'))
  ? rawKey
  : 'sb_publishable_VXdQvGohOt5M85ThH8-92A_UPo8escf';

// Always instantiate valid Supabase client for all devices
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET_NAME = 'AWAHAAN';

/**
 * Helper to convert file to persistent Base64 Data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Supabase Storage or convert to persistent Base64 Data URL
 * Prevents HTTP 400 Bad Request errors when Supabase credentials are missing or invalid.
 */
export async function uploadImageToSupabase(file, folder = 'dignitaries') {
  if (!file) return '';

  // If Supabase client is valid, attempt cloud upload
  if (supabase) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() : 'png';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload bypassed:', err);
    }
  }

  // Instant & persistent Base64 Data URL fallback (Zero HTTP 400 errors!)
  return await readFileAsDataURL(file);
}

/**
 * Automatic Keep-Alive Ping & Inactivity Reset
 * Pings Supabase REST endpoint to keep the free tier database active
 * and prevent Supabase from auto-pausing after 7 days.
 */
export async function pingSupabaseKeepAlive() {
  if (!SUPABASE_URL) return;

  try {
    const lastPing = localStorage.getItem('aahwan_supabase_last_ping');
    const now = Date.now();
    // Throttle: Send ping at most once every 6 hours
    if (lastPing && now - Number(lastPing) < 6 * 60 * 60 * 1000) {
      return;
    }

    const headers = {};
    if (SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder')) {
      headers['apikey'] = SUPABASE_ANON_KEY;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
    });

    if (res.status === 503) {
      console.warn('⚠️ Supabase project is currently paused. Please unpause it in your Supabase dashboard.');
      localStorage.setItem('aahwan_supabase_paused', 'true');
    } else {
      localStorage.setItem('aahwan_supabase_last_ping', String(now));
      localStorage.removeItem('aahwan_supabase_paused');
    }
  } catch (err) {
    // Gracefully ignore network hiccups without breaking UI
  }
}

// Trigger initial keep-alive ping on script evaluation
if (typeof window !== 'undefined') {
  pingSupabaseKeepAlive();
}
