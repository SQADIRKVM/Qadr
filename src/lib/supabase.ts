import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  '';

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl.length > 0 && supabaseAnonKey.length > 0);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      accessToken: async () => {
        if (!isFirebaseConfigured()) return null;
        const user = getFirebaseAuth().currentUser;
        if (!user) return null;
        return user.getIdToken();
      },
    });
  }
  return client;
}
