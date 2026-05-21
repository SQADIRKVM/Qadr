import type { MindContentKind, MindContentType, MindItem } from '../../types';
import { chatCompletion, hasAIConfigured } from './client';
import { parseAIJson } from '../../utils/parseAIJson';
import { detectMindPlatform, getMindContentKind } from '../../utils/mindUrl';
import { decodeHtmlEntities, isBadMindFetchedTitle, parseInstagramOembedTitle } from '../../utils/decodeHtml';
import {
  getMindParsedShortTitle,
  isHashtagStyleMindTitle,
  isMindDefaultTitle,
  isProvisionalMindTitle,
  isWeakAiMindTitle,
  MIND_DEFAULT_TITLE,
} from '../../utils/mindTitle';
import { getMindFormatBadge } from '../../utils/mindPlatformBadge';
import {
  finalizeMindTags,
  generateTopicTagsFromContent,
  topicTagInputFromItem,
} from '../../utils/mindTags';

const FORBIDDEN_TITLES =
  /^(youtube video|instagram reel|tiktok video|summary of|untitled|link from|.+ on instagram)\b/i;

const SOCIAL_CONTEXT_RULES = `title: 6-12 words describing WHAT the post is about (marketing moment, campaign angle, leak/spoiler, news) — include brand/creator from page_metadata.author or caption when present (e.g. "Skillage moment marketing using Drishyam 3 climax").
NEVER return hashtag lists, "hashtag · hashtag" pairs, or bare celebrity/movie names only.
summary: 2-3 COMPLETE sentences with ending punctuation (. ! ? or Malayalam ।). Ground in caption, content_excerpt, and image_text when present — do not infer "film was released" unless the caption explicitly says so.
If the caption mentions climax/leak/spoiler (any language), describe that literally.`;

const CONTENT_RULES = `Use page_metadata.caption, image_text, content_excerpt, transcript, author, brand_hint, and format_label as ground truth.
NEVER use generic titles ("YouTube Video", "Instagram Reel", hostname only, "Untitled").
NEVER use "untitled" as title or in auto_tags.
auto_tags must be 4-8 SPECIFIC TOPIC keywords from the content (people, places, concepts, events) — NEVER platform names (youtube, instagram, video, reel, tiktok).`;

const SYSTEM_REEL = `You enrich short-form video/reels. Return ONLY valid JSON:
{
  "summary": "2-3 sentence TLDW of the topic and takeaway",
  "auto_tags": ["topic1","topic2","topic3","topic4"],
  "content_type": "video",
  "dominant_color": "#RRGGBB",
  "title": "contextual title per rules below"
}
${SOCIAL_CONTEXT_RULES}
${CONTENT_RULES}`;

const SYSTEM_VIDEO = `You enrich long-form videos. Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary of what the video discusses",
  "auto_tags": ["topic1","topic2","topic3","topic4"],
  "content_type": "video",
  "dominant_color": "#RRGGBB",
  "title": "short specific title from the video topic"
}
${CONTENT_RULES}`;

const SYSTEM_ARTICLE = `You enrich articles. Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "auto_tags": ["topic1","topic2","topic3"],
  "content_type": "article",
  "dominant_color": "#RRGGBB",
  "title": "short specific title"
}
${CONTENT_RULES}`;

const SYSTEM_SOCIAL = `You enrich social posts (Instagram, etc.). Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "auto_tags": ["topic1","topic2","topic3"],
  "content_type": "url",
  "dominant_color": "#RRGGBB",
  "title": "contextual title per rules below"
}
${SOCIAL_CONTEXT_RULES}
${CONTENT_RULES}`;

const SYSTEM_LINK = `You enrich saved links. Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "auto_tags": ["topic1","topic2","topic3"],
  "content_type": "article|url|other",
  "dominant_color": "#RRGGBB",
  "title": "short specific title"
}
${CONTENT_RULES}`;

const SYSTEM_NOTE = `You enrich personal notes. Return ONLY valid JSON:
{
  "summary": "1-2 sentence summary",
  "auto_tags": ["topic1","topic2","topic3"],
  "content_type": "note",
  "dominant_color": "#RRGGBB",
  "title": "short title if clear from text"
}
${CONTENT_RULES}`;

const RETRY_SUFFIX =
  '\n\nPrevious JSON was incomplete or invalid. Return full valid JSON with a complete summary (2-3 sentences) and a contextual title. For social posts, title must be a complete phrase like "Skillage moment marketing using Drishyam 3 climax" — include "using" and the movie/subject name; never truncate to "marketing us".';

const VALID_TYPES: MindContentType[] = [
  'note',
  'url',
  'image',
  'quote',
  'article',
  'product',
  'recipe',
  'book',
  'video',
  'other',
];

export interface MindEnrichParsed {
  summary?: string;
  auto_tags?: string[];
  content_type?: string;
  dominant_color?: string;
  title?: string;
}

function normalizeType(raw: string | undefined, fallback: MindContentType): MindContentType {
  const t = (raw ?? '').toLowerCase() as MindContentType;
  return VALID_TYPES.includes(t) ? t : fallback;
}

function systemForKind(kind: MindContentKind, isNote: boolean): string {
  if (isNote) return SYSTEM_NOTE;
  switch (kind) {
    case 'reel':
      return SYSTEM_REEL;
    case 'video':
      return SYSTEM_VIDEO;
    case 'article':
      return SYSTEM_ARTICLE;
    case 'social':
      return SYSTEM_SOCIAL;
    case 'link':
    default:
      return SYSTEM_LINK;
  }
}

function usesSocialAiTitleOnly(item: MindItem, kind: MindContentKind): boolean {
  return item.platform === 'instagram' || kind === 'social';
}

/** Hashtag-pair style title (drishyam3 · mohanlal) — not acceptable as AI title. */
export const isHashtagStyleTitle = isHashtagStyleMindTitle;

/** Summary long enough and not cut off mid-phrase. */
export function isCompleteMindSummary(summary?: string): boolean {
  const s = summary?.trim() ?? '';
  if (s.length < 60) return false;
  if (/[.!?।॥]\s*$/.test(s)) return true;
  return s.length >= 120;
}

export function validateMindEnrichParsed(
  parsed: MindEnrichParsed,
  item: MindItem,
  options?: { requireTitle?: boolean },
): boolean {
  if (!isCompleteMindSummary(parsed.summary)) return false;
  const requireTitle = options?.requireTitle ?? false;
  const t = parsed.title?.trim();
  if (requireTitle && !t) return false;
  if (!t) return true;
  if (isHashtagStyleTitle(t) || isProvisionalMindTitle(t, item)) return false;
  if (FORBIDDEN_TITLES.test(t) || isBadMindFetchedTitle(t)) return false;
  const socialContext =
    item.platform === 'instagram' || getMindContentKind(item) === 'social';
  if (socialContext && isWeakAiMindTitle(t, item)) return false;
  return true;
}

function brandHintFromCaption(caption?: string, author?: string): string | null {
  const text = `${caption ?? ''} ${author ?? ''}`;
  const skillage = text.match(/\b(Skillage Academy|Skillage)\b/i);
  if (skillage) return skillage[1];
  const handle = text.match(/@([\w.]+)/);
  if (handle && /skillage|academy|official/i.test(handle[1])) return handle[1];
  return null;
}

function tagInputFromItem(item: MindItem) {
  return topicTagInputFromItem(item);
}

function captionForEnrich(item: MindItem): string | undefined {
  if (item.contentExcerpt?.trim()) return decodeHtmlEntities(item.contentExcerpt.trim());
  if (item.previewTitle?.trim()) {
    const parsed = parseInstagramOembedTitle(item.previewTitle);
    return parsed?.caption ?? decodeHtmlEntities(item.previewTitle.trim());
  }
  return undefined;
}

function applyAiTitle(
  item: MindItem,
  aiTitle?: string,
  previewTitle?: string,
  options?: { aiOnly?: boolean },
): string | undefined {
  const canReplace =
    isMindDefaultTitle(item) || isProvisionalMindTitle(item.title, item);
  if (!canReplace) return undefined;

  const shortParsed = getMindParsedShortTitle(item);
  const candidates = options?.aiOnly
    ? ([aiTitle?.trim()].filter(Boolean) as string[])
    : ([aiTitle?.trim(), shortParsed, previewTitle?.trim()].filter(Boolean) as string[]);

  for (const t of candidates) {
    if (
      t &&
      t !== MIND_DEFAULT_TITLE &&
      !FORBIDDEN_TITLES.test(t) &&
      !isBadMindFetchedTitle(t) &&
      !isProvisionalMindTitle(t, item) &&
      !isHashtagStyleTitle(t) &&
      !isWeakAiMindTitle(t, item)
    ) {
      return t;
    }
  }
  return undefined;
}

function stubEnrich(item: MindItem): Partial<MindItem> {
  const kind = getMindContentKind(item);
  const input = tagInputFromItem(item);
  const isNote = item.type === 'note' && !item.url;
  const socialOnly = usesSocialAiTitleOnly(item, kind);

  let type: MindContentType = item.type;
  if (kind === 'reel' || kind === 'video') type = 'video';
  else if (kind === 'article') type = 'article';
  else if (item.imageUri) type = 'image';

  const autoTags = generateTopicTagsFromContent(input);
  const title = socialOnly
    ? undefined
    : applyAiTitle(item, undefined, item.previewTitle, { aiOnly: false });

  let summary =
    item.previewDescription ||
    item.contentExcerpt?.slice(0, 280) ||
    item.transcript?.slice(0, 280) ||
    item.previewTitle;
  if (!summary && item.rawContent.length > 200) {
    summary = `${item.rawContent.slice(0, 180).trim()}…`;
  }
  if (!summary) summary = isNote ? 'Saved note' : 'Saved capture';

  return {
    type,
    ...(title ? { title } : {}),
    summary,
    autoTags,
    dominantColor: kind === 'reel' || kind === 'video' ? '#8B5A6B' : '#4C4546',
  };
}

function buildEnrichPayload(item: MindItem, kind: MindContentKind) {
  const det = item.url ? detectMindPlatform(item.url) : null;
  const formatBadge = getMindFormatBadge(item);
  const caption = captionForEnrich(item);
  const author = item.previewDescription?.trim() ?? null;

  return JSON.stringify({
    title: item.title,
    raw_content: item.rawContent,
    url: item.url,
    platform: item.platform ?? det?.platform,
    content_kind: kind,
    is_reel: item.isReel ?? det?.isReel,
    has_image: !!item.imageUri,
    initial_type: item.type,
    page_metadata: {
      title: isBadMindFetchedTitle(item.previewTitle) ? null : (item.previewTitle ?? null),
      caption: caption?.slice(0, 3500) ?? null,
      image_text: item.imageText?.slice(0, 3500) ?? null,
      author,
      brand_hint: brandHintFromCaption(caption, author ?? undefined),
      description: item.previewDescription ?? null,
      content_excerpt: item.contentExcerpt?.slice(0, 3500) ?? null,
      transcript: item.transcript?.slice(0, 3500) ?? null,
      image: item.previewImageUrl ?? null,
      site_name: det?.label ?? null,
      platform: item.platform ?? det?.platform ?? null,
      content_kind: kind,
      format_label: formatBadge?.label ?? null,
    },
  });
}

async function fetchEnrichParsed(
  system: string,
  userPayload: string,
  retry: boolean,
): Promise<MindEnrichParsed> {
  const raw = await chatCompletion(retry ? `${system}${RETRY_SUFFIX}` : system, userPayload);
  return parseAIJson(raw) as MindEnrichParsed;
}

export interface EnrichMindItemResult {
  patch: Partial<MindItem>;
  fromStub: boolean;
  error?: string;
}

export const enrichMindItem = async (item: MindItem): Promise<EnrichMindItemResult> => {
  const fallbackType = item.type;
  const kind = getMindContentKind(item);
  const isNote = item.type === 'note' && !item.url;
  const input = tagInputFromItem(item);
  const socialAiOnly = usesSocialAiTitleOnly(item, kind);

  if (!hasAIConfigured()) {
    return { patch: stubEnrich(item), fromStub: true };
  }

  const system = systemForKind(kind, isNote);
  const userPayload = buildEnrichPayload(item, kind);

  try {
    let parsed = await fetchEnrichParsed(system, userPayload, false);
    if (!validateMindEnrichParsed(parsed, item, { requireTitle: socialAiOnly })) {
      parsed = await fetchEnrichParsed(system, userPayload, true);
    }

    if (!validateMindEnrichParsed(parsed, item, { requireTitle: false })) {
      const stub = stubEnrich(item);
      return { patch: stub, fromStub: true, error: 'AI response incomplete' };
    }

    const rawTags = Array.isArray(parsed.auto_tags)
      ? parsed.auto_tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean)
      : [];

    const autoTags = finalizeMindTags(rawTags, input);
    const stub = stubEnrich(item);
    const aiTitle = applyAiTitle(item, parsed.title, item.previewTitle, {
      aiOnly: socialAiOnly,
    });

    return {
      patch: {
        type:
          kind === 'reel' || kind === 'video'
            ? 'video'
            : normalizeType(parsed.content_type, fallbackType),
        ...(aiTitle ? { title: aiTitle } : {}),
        summary: parsed.summary?.trim() || stub.summary,
        autoTags: autoTags.length ? autoTags : (stub.autoTags ?? []),
        dominantColor: parsed.dominant_color?.match(/^#[0-9A-Fa-f]{6}$/)
          ? parsed.dominant_color
          : stub.dominantColor,
      },
      fromStub: false,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed';
    return { patch: stubEnrich(item), fromStub: true, error: message };
  }
};
