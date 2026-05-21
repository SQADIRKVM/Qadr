import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../../lib/supabase';
import type { PersistKey } from './domains';
import { enqueueDomain, getQueueLength } from './queue';
import { useSyncMetaStore } from '../../stores/useSyncMetaStore';

function extractPayload(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    if (parsed && typeof parsed === 'object' && parsed.state && typeof parsed.state === 'object') {
      return parsed.state;
    }
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

export async function pushDomainFromLocal(domain: PersistKey, userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const raw = await AsyncStorage.getItem(domain);
  const payload = extractPayload(raw) ?? {};

  const { error } = await supabase.from('sync_domains').upsert(
    {
      user_id: userId,
      domain,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,domain' },
  );

  if (error) throw error;
  useSyncMetaStore.getState().setLastSyncedAt(new Date().toISOString());
}

export async function pushDomainWithOfflineQueue(
  domain: PersistKey,
  userId: string,
  isOnline: boolean,
): Promise<void> {
  if (!isOnline) {
    await enqueueDomain(domain);
    useSyncMetaStore.getState().setPendingCount(await getQueueLength());
    return;
  }
  try {
    await pushDomainFromLocal(domain, userId);
    useSyncMetaStore.getState().setPendingCount(await getQueueLength());
  } catch {
    await enqueueDomain(domain);
    useSyncMetaStore.getState().setPendingCount(await getQueueLength());
    throw new Error(`Failed to sync ${domain}`);
  }
}
