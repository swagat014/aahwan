import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://hxspfwjoxxmluhwqbsva.supabase.co';
// Public anon key fallback for client-side storage uploads
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4c3Bmd2pveHhtbHVod3Fic3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET_NAME = 'AWAHAAN';

/**
 * Helper to convert file to persistent Base64 Data URL
 */
function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Supabase Storage bucket 'AWAHAAN'
 * Returns the public URL or persistent Data URL of the uploaded image
 */
export async function uploadImageToSupabase(file, folder = 'dignitaries') {
  if (!file) return '';

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

    // Fallback: Read as persistent Base64 Data URL so it persists permanently and displays on live UI
    return await readFileAsDataURL(file);
  } catch (err) {
    console.warn('Fallback to Base64 image encoding:', err);
    return await readFileAsDataURL(file);
  }
}
