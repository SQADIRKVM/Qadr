import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../../lib/supabase';
import { PERSIST_KEYS } from '../../utils/dataBackup';
import { rehydrateAllDomains, type PersistKey } from './domains';
import { useSyncMetaStore } from '../../stores/useSyncMetaStore';

function wrapForPersist(payload: Record<string, unknown>): string {
  return JSON.stringify({ state: payload, version: 0 });
}

export async function pullAllDomains(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('sync_domains')
    .select('domain, payload, updated_at')
    .eq('user_id', userId);

  if (error) throw error;

  for (const row of data ?? []) {
    const domain = row.domain as PersistKey;
    if (!PERSIST_KEYS.includes(domain)) continue;
    const payload =
      row.payload && typeof row.payload === 'object'
        ? (row.payload as Record<string, unknown>)
        : {};
    await AsyncStorage.setItem(domain, wrapForPersist(payload));
  }

  await rehydrateAllDomains();
  useSyncMetaStore.getState().setLastSyncedAt(new Date().toISOString());
  useSyncMetaStore.getState().setSyncing(false);
}
