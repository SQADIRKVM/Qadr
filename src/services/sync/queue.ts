import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistKey } from './domains';

const QUEUE_KEY = 'qadr-sync-queue';

export type SyncQueueOp = 'upsert';

export interface SyncQueueItem {
  id: string;
  domain: PersistKey;
  op: SyncQueueOp;
  createdAt: string;
}

async function readQueue(): Promise<SyncQueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SyncQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueDomain(domain: PersistKey): Promise<void> {
  const queue = await readQueue();
  const without = queue.filter((q) => q.domain !== domain);
  without.push({
    id: `${domain}-${Date.now()}`,
    domain,
    op: 'upsert',
    createdAt: new Date().toISOString(),
  });
  await writeQueue(without);
}

export async function getQueueLength(): Promise<number> {
  return (await readQueue()).length;
}

export async function flushQueue(
  flushOne: (domain: PersistKey) => Promise<void>,
): Promise<{ flushed: number; failed: number }> {
  const queue = await readQueue();
  let flushed = 0;
  let failed = 0;
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      await flushOne(item.domain);
      flushed++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  await writeQueue(remaining);
  return { flushed, failed };
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
