import { createClient } from '@supabase/supabase-js';

export const ACTIVE_PROJECT_URL = 'https://ioyvfigbxyoexyqcaxsj.supabase.co';
export const ACTIVE_ANON_KEY = 'sb_publishable_VXdQvGohOt5M85ThH8-92A_UPo8escf';

function isValidKeyForActiveProject(key) {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (!trimmed || trimmed.includes('placeholder')) return false;
  // If it's the known valid publishable key:
  if (trimmed === ACTIVE_ANON_KEY || trimmed.startsWith('sb_publishable_')) return true;
  // If it's a JWT, check if it belongs to the old paused project hxspfwjoxxmluhwqbsva
  try {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      const payloadStr = typeof atob === 'function' 
        ? atob(parts[1]) 
        : (typeof Buffer !== 'undefined' ? Buffer.from(parts[1], 'base64').toString() : '');
      if (payloadStr) {
        const payload = JSON.parse(payloadStr);
        if (payload.ref && payload.ref !== 'ioyvfigbxyoexyqcaxsj') {
          return false; // Mismatched or old project ref
        }
      }
    }
  } catch (e) {
    return false;
  }
  return true;
}

// Sanitize URL: if env var points to the old paused project or is empty, use active ioyvfigbxyoexyqcaxsj
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const SUPABASE_URL = (rawUrl && !rawUrl.includes('hxspfwjoxxmluhwqbsva'))
  ? rawUrl
  : ACTIVE_PROJECT_URL;

// Sanitize Anon Key: if env var has old project key, whitespace, or placeholder, use active key
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const SUPABASE_ANON_KEY = isValidKeyForActiveProject(rawKey)
  ? rawKey
  : ACTIVE_ANON_KEY;

// Always instantiate valid Supabase client for all devices
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET_NAME = 'AWAHAAN';

/**
 * Helper to convert file to persistent Base64 Data URL
 */
export function readFileAsDataURL(file, maxWidth = 600, maxHeight = 600, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;
      if (typeof window === 'undefined' || !window.Image) {
        return resolve(rawDataUrl || '');
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxWidth && height <= maxHeight && file.size < 120 * 1024) {
          return resolve(rawDataUrl);
        }
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedUrl);
        } catch (canvasErr) {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl || '');
      img.src = rawDataUrl;
    };
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
