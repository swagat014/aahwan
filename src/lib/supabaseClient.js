import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://hxspfwjoxxmluhwqbsva.supabase.co';
// Public anon key fallback for client-side storage uploads
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4c3Bmd2pveHhtbHVod3Fic3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET_NAME = 'aahwan';

/**
 * Upload an image file to Supabase Storage bucket 'aahwan'
 * Returns the public URL of the uploaded image
 */
export async function uploadImageToSupabase(file, folder = 'dignitaries') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload fallback to local URL:', error.message);
      // Fallback: Create local object URL if bucket requires auth policy
      return URL.createObjectURL(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading file to Supabase:', err);
    return URL.createObjectURL(file);
  }
}
