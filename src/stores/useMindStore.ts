import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MindItem } from '../types';
import { generateId } from '../utils/id';
import { enrichMindItem } from '../services/ai/mindEnrich';
import { visionEnrichMindItem } from '../services/ai/mindVisionEnrich';
import { hasAIConfigured } from '../services/ai/client';
import {
  contentExcerptFromExtract,
  fetchContentExtract,
} from '../services/mind/contentExtract';
import { resolveUrlMetadata, youtubeMetadataFallback } from '../services/mind/urlMetadata';
import { MAX_PINNED } from '../utils/mindVault';
import {
  contentKindToMindType,
  detectMindPlatform,
  getYoutubeVideoId,
  inferContentKindFromUrl,
  youtubeThumbnailUrl,
} from '../utils/mindUrl';
import { isBadMindFetchedTitle } from '../utils/decodeHtml';
import {
  isMindDefaultTitle,
  isPersistableMindTitle,
  MIND_DEFAULT_TITLE,
  normalizeMindItemTitle,
  normalizeMindUrl,
} from '../utils/mindTitle';
import {
  filterAndMergeSmartTags,
  generateTopicTagsFromContent,
  isJunkTopicToken,
  mergeMindTags,
  topicTagInputFromItem,
} from '../utils/mindTags';
import { createPersistStorage } from './storage';

export type MindSaveInput =
  | { kind: 'note'; rawContent: string }
  | { kind: 'url'; url: string }
  | { kind: 'image'; imageUri: string; rawContent?: string };

export type MindAddOptions = { enrichWithAi?: boolean; spaceId?: string | null };

interface MindState {
  items: MindItem[];
  addItem: (input: MindSaveInput, options?: MindAddOptions) => string;
  updateItem: (id: string, patch: Partial<MindItem>) => void;
  hydrateItemMetadata: (id: string) => Promise<void>;
  processItemAfterSave: (id: string, runAi: boolean) => Promise<void>;
  refetchPreview: (id: string) => Promise<void>;
  enrichItem: (id: string) => Promise<void>;
  enrichPendingItems: () => Promise<void>;
  togglePin: (id: string) => void;
  archiveItem: (id: string) => void;
  unarchiveItem: (id: string) => void;
}

function buildDraft(input: MindSaveInput, enrichWithAi: boolean): MindItem {
  const now = new Date().toISOString();
  const id = generateId();

  if (input.kind === 'note') {
    return {
      id,
      type: 'note',
      contentKind: 'link',
      title: MIND_DEFAULT_TITLE,
      rawContent: input.rawContent.trim(),
      contentExcerpt: input.rawContent.trim(),
      autoTags: [],
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      enrichPending: enrichWithAi,
      aiEnriched: false,
    };
  }

  if (input.kind === 'url') {
    const url = input.url.trim();
    const det = detectMindPlatform(url);
    let contentKind = inferContentKindFromUrl(url, det.platform, det.isReel);
    if (det.platform === 'youtube' && getYoutubeVideoId(url) && !det.isReel) {
      contentKind = 'video';
    }
    const { type, isReel } = contentKindToMindType(contentKind);
    const ytId = det.platform === 'youtube' ? getYoutubeVideoId(url) : null;
    return {
      id,
      type,
      contentKind,
      title: MIND_DEFAULT_TITLE,
      rawContent: url,
      url,
      platform: det.platform,
      isReel,
      previewImageUrl: ytId ? youtubeThumbnailUrl(ytId) : undefined,
      autoTags: [],
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      enrichPending: enrichWithAi,
      aiEnriched: false,
    };
  }

  return {
    id,
    type: 'image',
    contentKind: 'link',
    title: MIND_DEFAULT_TITLE,
    rawContent: input.rawContent?.trim() || '',
    imageUri: input.imageUri,
    autoTags: [],
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    enrichPending: enrichWithAi,
    aiEnriched: false,
  };
}

export const useMindStore = create<MindState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input, options) => {
        const runAi = options?.enrichWithAi ?? hasAIConfigured();

        if (input.kind === 'url') {
          const norm = normalizeMindUrl(input.url);
          const existing = get().items.find(
            (i) => !i.isArchived && i.url && normalizeMindUrl(i.url) === norm,
          );
          if (existing) {
            const patch: Partial<MindItem> = {};
            if (runAi) patch.enrichPending = true;
            if (options?.spaceId !== undefined) patch.spaceId = options.spaceId;
            if (Object.keys(patch).length) get().updateItem(existing.id, patch);
            void get().processItemAfterSave(existing.id, runAi);
            return existing.id;
          }
        }

        const draft = buildDraft(input, runAi);
        if (options?.spaceId) {
          draft.spaceId = options.spaceId;
        }
        set({ items: [draft, ...get().items] });
        void get().processItemAfterSave(draft.id, runAi);
        return draft.id;
      },

      updateItem: (id, patch) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
          ),
        }),

      hydrateItemMetadata: async (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item?.url) return;

        let meta;
        try {
          meta = await resolveUrlMetadata(item.url);
        } catch {
          const fallback = youtubeMetadataFallback(item.url);
          if (!fallback) return;
          meta = {
            platform: fallback.platform!,
            contentKind: fallback.contentKind!,
            previewImageUrl: fallback.previewImageUrl,
            previewTitle: fallback.previewTitle,
            previewDescription: fallback.previewDescription,
            siteName: fallback.siteName,
          };
        }

        if (meta.platform === 'youtube' && getYoutubeVideoId(item.url) && !meta.contentKind) {
          meta.contentKind = 'video';
        }
        if (meta.platform === 'youtube' && getYoutubeVideoId(item.url)) {
          const det = detectMindPlatform(item.url);
          if (!det.isReel) {
            meta.contentKind = 'video';
          }
        }

        const { type, isReel } = contentKindToMindType(meta.contentKind);
        get().updateItem(id, {
          platform: meta.platform,
          contentKind: meta.contentKind,
          type,
          isReel,
          previewImageUrl: meta.previewImageUrl ?? item.previewImageUrl,
          embedHtml: meta.embedHtml ?? item.embedHtml,
          previewTitle: meta.previewTitle,
          previewDescription: meta.previewDescription,
        });
      },

      processItemAfterSave: async (id, runAi) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;

        if (item.url) {
          await get().hydrateItemMetadata(id);
          const current = get().items.find((i) => i.id === id);
          if (!current?.url) return;
          try {
            const extract = await fetchContentExtract(current.url);
            const excerpt = contentExcerptFromExtract(extract);
            const { type, isReel } = contentKindToMindType(extract.contentKind);
            const topicTags = generateTopicTagsFromContent(
              topicTagInputFromItem(current, {
                title: extract.title ?? current.previewTitle,
                description: extract.description,
                excerpt,
                transcript: extract.transcript,
              }),
            );
            const previewImages = extract.images?.length
              ? extract.images
              : extract.image
                ? [extract.image]
                : current.previewImages;
            const previewImageUrl =
              extract.image ?? previewImages?.[0] ?? current.previewImageUrl;

            const previewTitle = extract.text ?? current.previewTitle ?? extract.title;
            let resolvedTitle = extract.title;
            if (isBadMindFetchedTitle(resolvedTitle)) resolvedTitle = undefined;
            const titleContext = { previewTitle, contentExcerpt: excerpt };
            const persistTitle =
              resolvedTitle &&
              isMindDefaultTitle(current) &&
              isPersistableMindTitle(resolvedTitle, titleContext)
                ? resolvedTitle
                : undefined;

            get().updateItem(id, {
              platform: extract.platform,
              contentKind: extract.contentKind,
              type,
              isReel,
              previewTitle,
              previewDescription: extract.description ?? current.previewDescription,
              previewImageUrl,
              previewImages,
              embedHtml: extract.embedHtml ?? current.embedHtml,
              contentExcerpt: excerpt,
              transcript: extract.transcript,
              autoTags: topicTags,
              extractError: undefined,
              ...(persistTitle ? { title: persistTitle } : {}),
            });
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Content extract failed';
            get().updateItem(id, { extractError: message });
          }
        } else if (item.type === 'note') {
          get().updateItem(id, {
            contentExcerpt: item.rawContent,
          });
        }

        if (runAi) {
          await get().enrichItem(id);
        } else {
          const current = get().items.find((i) => i.id === id);
          if (current && (current.autoTags?.length ?? 0) === 0) {
            const tags = generateTopicTagsFromContent(
              topicTagInputFromItem(current, {
                excerpt: current.contentExcerpt ?? current.rawContent,
              }),
            );
            if (tags.length) get().updateItem(id, { autoTags: tags });
          }
        }

        const capturedId = id;
        setTimeout(() => {
          const stale = get().items.find((i) => i.id === capturedId);
          if (!stale?.url || stale.enrichPending || stale.aiEnriched) return;
          if (!isMindDefaultTitle(stale)) return;
          void get().processItemAfterSave(capturedId, hasAIConfigured());
        }, 12000);
      },

      refetchPreview: async (id) => {
        get().updateItem(id, { enrichPending: true });
        try {
          await get().processItemAfterSave(id, false);
        } finally {
          const current = get().items.find((i) => i.id === id);
          if (current?.enrichPending) {
            get().updateItem(id, { enrichPending: false });
          }
        }
      },

      enrichItem: async (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        get().updateItem(id, { enrichPending: true });
        let fresh = get().items.find((i) => i.id === id) ?? item;
        const vision = await visionEnrichMindItem(fresh);
        if (Object.keys(vision.patch).length) {
          get().updateItem(id, vision.patch);
          fresh = get().items.find((i) => i.id === id) ?? fresh;
        }
        if (vision.error && hasAIConfigured()) {
          // eslint-disable-next-line no-console
          console.warn('Mind vision enrich:', vision.error);
        }
        const { patch, fromStub, error } = await enrichMindItem(fresh);
        if (fromStub && error && hasAIConfigured()) {
          // eslint-disable-next-line no-console
          console.warn('Mind enrich failed:', error);
        }
        const mergedPatch = { ...patch };
        if (mergedPatch.autoTags?.length) {
          if (fromStub) {
            mergedPatch.autoTags = mergeMindTags(fresh.autoTags ?? [], mergedPatch.autoTags);
          } else {
            mergedPatch.autoTags = filterAndMergeSmartTags(
              fresh.autoTags ?? [],
              mergedPatch.autoTags,
              topicTagInputFromItem(fresh),
            );
          }
        }
        get().updateItem(id, {
          ...mergedPatch,
          enrichPending: false,
          aiEnriched: true,
        });
      },

      enrichPendingItems: async () => {
        const pending = get().items.filter((i) => i.enrichPending);
        await Promise.all(pending.map((i) => get().enrichItem(i.id)));
      },

      togglePin: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        const pinnedCount = get().items.filter((i) => i.isPinned && !i.isArchived).length;
        if (!item.isPinned && pinnedCount >= MAX_PINNED) return;
        get().updateItem(id, { isPinned: !item.isPinned });
      },

      archiveItem: (id) => {
        get().updateItem(id, { isArchived: true, isPinned: false });
      },

      unarchiveItem: (id) => get().updateItem(id, { isArchived: false }),
    }),
    {
      name: 'qadr-mind-items',
      storage: createPersistStorage(),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.items = state.items.map((item) => {
          const normalized = normalizeMindItemTitle(item);
          if (normalized.autoTags) {
            normalized.autoTags = normalized.autoTags.filter((t) => !isJunkTopicToken(t));
          }
          if (
            !normalized.aiEnriched &&
            ((normalized.autoTags?.length ?? 0) > 0 || !!normalized.summary)
          ) {
            return { ...normalized, aiEnriched: true, enrichPending: false };
          }
          return normalized;
        });
      },
    },
  ),
);
