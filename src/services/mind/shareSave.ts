import { hasAIConfigured } from '../ai/client';
import { useMindStore } from '../../stores/useMindStore';
import { normalizeMindUrl } from '../../utils/mindTitle';
import { parseShareIntentPayload, type SharedMindPayload } from '../../utils/sharePayload';

export type ShareSaveResult =
  | { ok: true; itemId: string; isDuplicate: boolean }
  | { ok: false; reason: 'no_url' | 'save_failed' };

/**
 * Save a shared URL (or URL embedded in text) into Mind using the same pipeline as MindSaveSheet.
 */
export async function saveSharedPayloadToMind(
  payload: SharedMindPayload,
  options?: { enrichWithAi?: boolean },
): Promise<ShareSaveResult> {
  const parsed =
    payload.url != null
      ? payload
      : parseShareIntentPayload({ text: payload.text, webUrl: null, meta: { title: payload.title ?? undefined } });

  const url = parsed.url?.trim();
  if (!url) {
    return { ok: false, reason: 'no_url' };
  }

  const enrichWithAi = options?.enrichWithAi ?? hasAIConfigured();
  const store = useMindStore.getState();
  const norm = normalizeMindUrl(url);
  const existing = store.items.find(
    (i) => !i.isArchived && i.url && normalizeMindUrl(i.url) === norm,
  );

  try {
    const itemId = store.addItem({ kind: 'url', url }, { enrichWithAi });
    await store.processItemAfterSave(itemId, enrichWithAi);
    return { ok: true, itemId, isDuplicate: !!existing };
  } catch {
    return { ok: false, reason: 'save_failed' };
  }
}
