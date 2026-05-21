import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { PERSIST_KEYS } from '../utils/dataBackup';
import { useAuthStore, selectAuthUserId } from '../stores/useAuthStore';
import { useSyncMetaStore } from '../stores/useSyncMetaStore';
import {
  useSettingsStore,
  useDashboardStore,
  useHabitStore,
  useSleepStore,
  useProjectStore,
  useIdeaStore,
  useMoneyStore,
  useBlockStore,
  useDecisionStore,
  useReviewStore,
} from '../stores';
import { useMindStore } from '../stores/useMindStore';
import { useMindSpacesStore } from '../stores/useMindSpacesStore';
import { pushDomainWithOfflineQueue } from '../services/sync/push';
import { flushQueue, getQueueLength } from '../services/sync/queue';
import { pushDomainFromLocal } from '../services/sync/push';
import type { PersistKey } from '../services/sync/domains';

const DOMAIN_STORES: { key: PersistKey; subscribe: (fn: () => void) => () => void }[] = [
  { key: 'qadr-settings', subscribe: (fn) => useSettingsStore.subscribe(fn) },
  { key: 'qadr-dashboard', subscribe: (fn) => useDashboardStore.subscribe(fn) },
  { key: 'qadr-habits', subscribe: (fn) => useHabitStore.subscribe(fn) },
  { key: 'qadr-sleep', subscribe: (fn) => useSleepStore.subscribe(fn) },
  { key: 'qadr-projects', subscribe: (fn) => useProjectStore.subscribe(fn) },
  { key: 'qadr-ideas', subscribe: (fn) => useIdeaStore.subscribe(fn) },
  { key: 'qadr-money', subscribe: (fn) => useMoneyStore.subscribe(fn) },
  { key: 'qadr-decisions', subscribe: (fn) => useDecisionStore.subscribe(fn) },
  { key: 'qadr-reviews', subscribe: (fn) => useReviewStore.subscribe(fn) },
  { key: 'qadr-block', subscribe: (fn) => useBlockStore.subscribe(fn) },
  { key: 'qadr-mind-spaces', subscribe: (fn) => useMindSpacesStore.subscribe(fn) },
  { key: 'qadr-mind-items', subscribe: (fn) => useMindStore.subscribe(fn) },
];

const DEBOUNCE_MS = 600;

function useOnlineListener(): void {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const setOnline = () => useSyncMetaStore.getState().setIsOnline(navigator.onLine);
      setOnline();
      window.addEventListener('online', setOnline);
      window.addEventListener('offline', setOnline);
      return () => {
        window.removeEventListener('online', setOnline);
        window.removeEventListener('offline', setOnline);
      };
    }
    useSyncMetaStore.getState().setIsOnline(true);
  }, []);
}

export function useCloudSync(): void {
  useOnlineListener();
  const userId = useAuthStore(selectAuthUserId);
  const cloudBootstrapped = useAuthStore((s) => s.cloudBootstrapped);
  const isOnline = useSyncMetaStore((s) => s.isOnline);
  const timers = useRef<Partial<Record<PersistKey, ReturnType<typeof setTimeout>>>>({});

  useEffect(() => {
    if (!userId || !cloudBootstrapped) return;

    const schedulePush = (domain: PersistKey) => {
      const existing = timers.current[domain];
      if (existing) clearTimeout(existing);
      timers.current[domain] = setTimeout(() => {
        void pushDomainWithOfflineQueue(domain, userId, isOnline).catch(() => undefined);
      }, DEBOUNCE_MS);
    };

    const unsubs = DOMAIN_STORES.map(({ key, subscribe }) =>
      subscribe(() => schedulePush(key)),
    );

    return () => {
      unsubs.forEach((u) => u());
      Object.values(timers.current).forEach((t) => t && clearTimeout(t));
    };
  }, [userId, cloudBootstrapped, isOnline]);

  useEffect(() => {
    if (!userId || !isOnline || !cloudBootstrapped) return;
    void flushQueue(async (domain) => {
      await pushDomainFromLocal(domain, userId);
    }).then(async () => {
      useSyncMetaStore.getState().setPendingCount(await getQueueLength());
    });
  }, [userId, isOnline, cloudBootstrapped]);
}

export async function syncNowManual(): Promise<void> {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) return;
  const isOnline = useSyncMetaStore.getState().isOnline;
  if (!isOnline) throw new Error('You are offline. Changes will sync when back online.');

  useSyncMetaStore.getState().setSyncing(true);
  try {
    for (const key of PERSIST_KEYS) {
      await pushDomainFromLocal(key, userId);
    }
    await flushQueue(async (domain) => {
      await pushDomainFromLocal(domain, userId);
    });
    useSyncMetaStore.getState().setPendingCount(await getQueueLength());
    useSyncMetaStore.getState().setLastSyncedAt(new Date().toISOString());
  } finally {
    useSyncMetaStore.getState().setSyncing(false);
  }
}
