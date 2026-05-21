import type { MindItem } from '../types';
import { parseInstagramOembedTitle } from './decodeHtml';

export const MIND_DEFAULT_TITLE = 'Untitled';

const HASHTAG_STYLE_TITLE = /^[\w\u0080-\uFFFF]+\s*[·•]\s*[\w\u0080-\uFFFF]+$/i;

/** Hashtag-pair style title (drishyam3 · mohanlal). */
export function isHashtagStyleMindTitle(title?: string): boolean {
  const t = title?.trim() ?? '';
  if (!t) return false;
  if (/#/.test(t)) return true;
  return HASHTAG_STYLE_TITLE.test(t);
}

function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  return /^https?:\/\//i.test(t) || /^www\./i.test(t);
}

function hostnameFromUrl(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/** Normalize URL for dedupe (strip hash, trailing slash). */
export function normalizeMindUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = '';
    let path = u.pathname.replace(/\/+$/, '') || '/';
    return `${u.protocol}//${u.hostname.toLowerCase()}${path}${u.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Caption-like title not meant as final persisted label (hashtags, long oEmbed line). */
export function isProvisionalMindTitle(
  title: string,
  context?: { previewTitle?: string; contentExcerpt?: string },
): boolean {
  const t = title.trim();
  if (!t || t === MIND_DEFAULT_TITLE) return false;
  if (/#/.test(t)) return true;
  if (isHashtagStyleMindTitle(t)) return true;
  if (/on Instagram:/i.test(t)) return true;
  if (t.length > 72 && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(t)) return true;

  const excerpt = context?.contentExcerpt?.trim();
  if (excerpt && (t === excerpt || excerpt.startsWith(t) || t.startsWith(excerpt.slice(0, 80)))) {
    return true;
  }

  if (context?.previewTitle && /on Instagram|#\w/i.test(context.previewTitle)) {
    const parsed = parseInstagramOembedTitle(context.previewTitle);
    if (parsed?.caption && (t === parsed.caption || parsed.caption.startsWith(t))) return true;
    if (parsed?.displayTitle && t === parsed.displayTitle && /#/.test(t)) return true;
  }

  return false;
}

/** Parsed short label from preview metadata (hashtags / stripped caption). */
export function getMindParsedShortTitle(
  item: Pick<MindItem, 'previewTitle' | 'previewDescription'>,
): string | undefined {
  if (!item.previewTitle?.trim()) return undefined;
  const parsed = parseInstagramOembedTitle(
    item.previewTitle,
    item.previewDescription?.replace(/^@/, ''),
  );
  return parsed?.displayTitle?.trim() || undefined;
}

/** True when title is empty, default, or still mirrors URL/raw content. */
export function isMindDefaultTitle(item: Pick<MindItem, 'title' | 'url' | 'rawContent'>): boolean {
  const title = item.title?.trim() ?? '';
  if (!title || title === MIND_DEFAULT_TITLE || title === 'Untitled note' || title === 'Image') {
    return true;
  }
  if (item.url && (title === item.url || title === item.url.trim())) return true;
  if (looksLikeUrl(title)) return true;
  if (item.url) {
    const host = hostnameFromUrl(item.url);
    if (host && title === host) return true;
  }
  const raw = item.rawContent?.trim() ?? '';
  if (raw && title === raw) return true;
  if (raw && title === raw.slice(0, 80)) return true;
  return false;
}

/** Safe to write extract/UI string into item.title before AI enrich. */
export function isPersistableMindTitle(
  title: string,
  context?: { previewTitle?: string; contentExcerpt?: string },
): boolean {
  const t = title.trim();
  if (!t || t === MIND_DEFAULT_TITLE) return false;
  return !isProvisionalMindTitle(t, context);
}

/** Title for grid cards — never show raw caption blocks. */
export function getMindDisplayTitle(
  item: Pick<MindItem, 'title' | 'url' | 'rawContent' | 'previewTitle' | 'previewDescription' | 'contentExcerpt'>,
): string {
  const title = item.title?.trim() ?? '';
  if (!isMindDefaultTitle(item) && !isProvisionalMindTitle(title, item)) {
    return title;
  }
  const short = getMindParsedShortTitle(item);
  if (short) return short;
  return MIND_DEFAULT_TITLE;
}

/** Hashtag-style placeholder under title while AI runs (not persisted). */
export function getMindTitleHint(
  item: Pick<
    MindItem,
    'title' | 'url' | 'rawContent' | 'previewTitle' | 'previewDescription' | 'contentExcerpt' | 'aiEnriched' | 'enrichPending'
  >,
): string | undefined {
  const title = item.title?.trim() ?? '';
  if (!isMindDefaultTitle(item) && !isProvisionalMindTitle(title, item)) return undefined;
  if (item.aiEnriched && !isMindDefaultTitle(item)) return undefined;
  return getMindParsedShortTitle(item);
}

/** Title in detail input — only real/AI titles, not hashtag fallback. */
export function getMindEditableTitle(
  item: Pick<
    MindItem,
    'title' | 'url' | 'rawContent' | 'previewTitle' | 'previewDescription' | 'contentExcerpt' | 'aiEnriched'
  >,
): string {
  const title = item.title?.trim() ?? '';
  if (!isMindDefaultTitle(item) && !isProvisionalMindTitle(title, item)) {
    return title;
  }
  return '';
}

function isGenericSummary(text: string): boolean {
  return /^(summary of|saved link|link from|saved )/i.test(text.trim());
}

export function getMindCardSubtitle(item: MindItem): string | undefined {
  if (item.summary?.trim() && item.aiEnriched && !isGenericSummary(item.summary)) {
    const s = item.summary.trim();
    return s.length > 90 ? `${s.slice(0, 87)}…` : s;
  }
  if (item.previewDescription?.trim()) {
    const d = item.previewDescription.trim();
    return d.length > 90 ? `${d.slice(0, 87)}…` : d;
  }
  if (item.contentExcerpt?.trim() && isMindDefaultTitle(item)) {
    const e = item.contentExcerpt.trim();
    return e.length > 90 ? `${e.slice(0, 87)}…` : e;
  }
  if (item.previewTitle?.trim() && isMindDefaultTitle(item)) {
    const parsed = getMindParsedShortTitle(item);
    if (parsed) return parsed.length > 90 ? `${parsed.slice(0, 87)}…` : parsed;
  }
  if (item.url) {
    const host = hostnameFromUrl(item.url);
    if (host) return host;
    return item.url.length > 48 ? `${item.url.slice(0, 45)}…` : item.url;
  }
  if (item.type === 'note' || item.rawContent) {
    const text = item.rawContent.trim();
    if (!text) return undefined;
    const line = text.split('\n')[0].trim();
    return line.length > 90 ? `${line.slice(0, 87)}…` : line;
  }
  if (item.imageUri && !item.summary) return 'Image capture';
  return undefined;
}

/** Normalize legacy persisted items (URL as title → Untitled). */
export function normalizeMindItemTitle(item: MindItem): MindItem {
  if (!isMindDefaultTitle(item) && !isProvisionalMindTitle(item.title, item)) return item;
  if (item.title === MIND_DEFAULT_TITLE) return item;
  const short = getMindParsedShortTitle(item);
  if (short && isProvisionalMindTitle(item.title, item)) {
    return { ...item, title: MIND_DEFAULT_TITLE };
  }
  if (!isMindDefaultTitle(item)) return item;
  return { ...item, title: MIND_DEFAULT_TITLE };
}

export function estimateMindCardHeight(item: MindItem): number {
  const hasMedia = !!(item.imageUri || item.previewImageUrl);
  const isVisual =
    hasMedia || item.contentKind === 'reel' || item.contentKind === 'video';
  if (isVisual) return 280;
  if (item.url) return 200;
  return 168;
}

/** Truncated or incomplete AI title (e.g. "marketing us" instead of "marketing using Drishyam 3 climax"). */
export function isWeakAiMindTitle(
  title: string,
  item?: Pick<
    MindItem,
    'contentExcerpt' | 'previewTitle' | 'autoTags' | 'imageText' | 'platform' | 'url'
  >,
): boolean {
  const t = title.trim();
  if (!t) return true;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 4) return true;

  if (/\bmarketing\s+us$/i.test(t)) return true;
  if (/\bmarketing\s+usi$/i.test(t)) return true;
  if (/\busi$/i.test(t) && !/\busing\b/i.test(t)) return true;
  if (/\b\w+\s+us$/i.test(t) && !/\busing\b/i.test(t)) return true;

  const danglingEnd =
    /\b(on|the|a|an|for|with|and|or|to|in|at|of|about|from|by)\s*$/i;
  if (danglingEnd.test(t) && words.length < 8) return true;

  const tags = (item?.autoTags ?? []).map((t) => t.trim().toLowerCase());
  const contextBlob = [
    item?.contentExcerpt,
    item?.previewTitle,
    item?.imageText,
    item?.url,
    ...tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const mentionsDrishyam =
    /drishyam/i.test(contextBlob) ||
    tags.some((tag) => /^drishyam3?$/i.test(tag) || tag === 'dr');
  const mentionsSkillage = /skillage/i.test(contextBlob);

  if ((mentionsDrishyam || mentionsSkillage) && item?.platform === 'instagram') {
    if (words.length < 7) return true;
    if (mentionsDrishyam && !/drishyam/i.test(t)) return true;
    if (/\bmarketing\b/i.test(t) && !/\busing\b/i.test(t) && mentionsDrishyam) return true;
  }

  return false;
}

/** Instagram carousel likely but only one image loaded so far. */
export function isInstagramCarouselSuspected(item: MindItem): boolean {
  if (item.platform !== 'instagram') return false;
  const slides = item.previewImages?.length ?? (item.previewImageUrl ? 1 : 0);
  if (slides > 1) return false;
  if (/edge_sidecar|sidecar_to_children|carousel_media/i.test(item.contentExcerpt ?? '')) {
    return true;
  }
  return /instagram\.com\/p\//i.test(item.url ?? '');
}
