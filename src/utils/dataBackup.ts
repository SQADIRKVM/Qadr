import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Platform } from 'react-native';
import { userAlert } from './userAlert';

export const PERSIST_KEYS = [
  'qadr-dashboard',
  'qadr-habits',
  'qadr-sleep',
  'qadr-projects',
  'qadr-ideas',
  'qadr-money',
  'qadr-decisions',
  'qadr-reviews',
  'qadr-block',
  'qadr-settings',
  'qadr-mind-spaces',
  'qadr-mind-items',
] as const;

export interface QadrBackupPayload {
  version: 1;
  exportedAt: string;
  stores: Record<string, unknown>;
}

export async function exportAllStores(): Promise<string> {
  const stores: Record<string, unknown> = {};
  for (const key of PERSIST_KEYS) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      try {
        stores[key] = JSON.parse(raw);
      } catch {
        stores[key] = raw;
      }
    }
  }
  const payload: QadrBackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    stores,
  };
  return JSON.stringify(payload, null, 2);
}

function downloadJsonOnWeb(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareBackupExport(): Promise<void> {
  const json = await exportAllStores();
  const title = 'Qadr backup';

  if (Platform.OS === 'web') {
    try {
      if (typeof document !== 'undefined') {
        downloadJsonOnWeb(json, `qadr-backup-${Date.now()}.json`);
        userAlert(title, 'Backup file downloaded.');
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(json);
        userAlert(title, 'Backup JSON copied to clipboard.');
        return;
      }
    } catch {
      /* fall through */
    }
    throw new Error('Could not export backup on this browser.');
  }

  await Share.share({ message: json, title });
}

export async function importBackupJson(json: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload = JSON.parse(json) as QadrBackupPayload;
    if (!payload.stores || typeof payload.stores !== 'object') {
      return { ok: false, error: 'Invalid backup format.' };
    }
    for (const key of PERSIST_KEYS) {
      const value = payload.stores[key];
      if (value !== undefined) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not parse backup JSON.' };
  }
}
