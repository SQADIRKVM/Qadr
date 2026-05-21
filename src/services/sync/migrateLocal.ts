import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../../lib/supabase';
import { PERSIST_KEYS } from '../../utils/dataBackup';
import type { PersistKey } from './domains';
import { pushDomainFromLocal } from './push';

function extractPayload(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    if (parsed?.state && typeof parsed.state === 'object') return parsed.state;
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return {};
}

export async function migrateLocalToCloud(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const rows: {
    user_id: string;
    domain: PersistKey;
    payload: Record<string, unknown>;
    updated_at: string;
  }[] = [];

  const now = new Date().toISOString();

  for (const key of PERSIST_KEYS) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;
    rows.push({
      user_id: userId,
      domain: key,
      payload: extractPayload(raw),
      updated_at: now,
    });
  }

  if (rows.length === 0) return 0;

  const { error } = await supabase.from('sync_domains').upsert(rows, {
    onConflict: 'user_id,domain',
  });
  if (error) throw error;

  await supabase
    .from('profiles')
    .update({ cloud_migrated_at: now })
    .eq('id', userId);

  return rows.length;
}

export async function pushAllDomainsFromLocal(userId: string): Promise<void> {
  for (const key of PERSIST_KEYS) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      await pushDomainFromLocal(key, userId);
    }
  }
}
