import { getFirebaseAuth } from '../../lib/firebase';
import { getSupabase } from '../../lib/supabase';
import { pullAllDomains } from './pull';
import { migrateLocalToCloud } from './migrateLocal';
import { flushQueue, getQueueLength } from './queue';
import { pushDomainFromLocal } from './push';
import { useSyncMetaStore } from '../../stores/useSyncMetaStore';
import { upsertCurrentSession } from '../account/sessions';

export async function runCloudBootstrap(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  useSyncMetaStore.getState().setSyncing(true);
  useSyncMetaStore.getState().setSyncError(null);

  try {
    const firebaseUser = getFirebaseAuth().currentUser;

    const { data: profile } = await supabase
      .from('profiles')
      .select('cloud_migrated_at')
      .eq('id', userId)
      .maybeSingle();

    await supabase.from('profiles').upsert({
      id: userId,
      email: firebaseUser?.email ?? null,
      display_name: firebaseUser?.displayName ?? null,
      photo_url: firebaseUser?.photoURL ?? null,
    });

    if (!profile?.cloud_migrated_at) {
      await migrateLocalToCloud(userId);
    }

    await pullAllDomains(userId);

    await flushQueue(async (domain) => {
      await pushDomainFromLocal(domain, userId);
    });

    const pending = await getQueueLength();
    useSyncMetaStore.getState().setPendingCount(pending);

    await upsertCurrentSession(userId);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Cloud sync failed';
    useSyncMetaStore.getState().setSyncError(message);
    useSyncMetaStore.getState().setSyncing(false);
    throw e;
  }
}
