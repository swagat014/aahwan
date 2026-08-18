import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hxspfwjoxxmluhwqbsva.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create client only if valid key exists
export const supabase = (SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder'))
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

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
