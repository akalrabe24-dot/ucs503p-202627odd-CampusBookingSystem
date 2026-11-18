import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const demoMode = import.meta.env.VITE_CAMPUS_DEMO === 'true' && !url && !key;
export const supabase = url && key ? createClient(url, key) : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Configure the Supabase URL and publishable key to connect the portal.');
  return supabase;
}

export function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23P01') {
    return 'This space is no longer available for that time. Refresh availability and choose another slot.';
  }
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The request failed. Please try again.';
}
