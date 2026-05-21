import type { MindItem } from '../types';
import { isMindDefaultTitle, MIND_DEFAULT_TITLE } from './mindTitle';

/** Normalize user/AI tag input for Mind captures. */
export function normalizeMindTag(raw: string): string | null {
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
  if (!t || t.length > 32) return null;
  return t;
}

/** Platform/format tags — not content topics. */
export const PLATFORM_TAGS = new Set([
  'youtube',
  'video',
  'videos',
  'instagram',
  'tiktok',
  'twitter',
  'linkedin',
  'vimeo',
  'telegram',
  'reddit',
  'reel',
  'reels',
  'shorts',
  'link',
  'bookmark',
  'url',
  'marketing',
  'social',
  'media',
  'post',
  'posts',
  'generic',
  'visual',
  'image',
  'note',
  'quote',
]);

const STOPWORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'been',
  'before',
  'being',
  'between',
  'both',
  'come',
  'could',
  'does',
  'done',
  'from',
  'have',
  'here',
  'https',
  'http',
  'into',
  'just',
  'like',
  'more',
  'most',
  'much',
  'must',
  'only',
  'other',
  'over',
  'same',
  'some',
  'such',
  'than',
  'that',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'under',
  'very',
  'what',
  'when',
  'where',
  'which',
  'while',
  'will',
  'with',
  'would',
  'your',
  'explained',
  'explainer',
  'review',
  'watch',
  'full',
  'untitled',
  'note',
  'image',
  'capture',
  'saved',
  'link',
  'likes',
  'liked',
  'comments',
  'comment',
  'views',
  'view',
  'followers',
  'following',
  'shared',
]);

/** Remove Instagram engagement boilerplate before tag generation. */
export function stripEngagementFromText(text: string): string {
  return text
    .replace(/\d[\d,.]*\s*(likes?|comments?|views?)\b/gi, ' ')
    .replace(/\b\d[\d,.]*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isJunkTopicToken(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w || w.length <= 2) return true;
  if (/^\d+$/.test(w)) return true;
  if (/^\d+(likes|comments|views)$/.test(w)) return true;
  return false;
}

function isUsableTagTitle(title?: string): boolean {
  if (!title?.trim()) return false;
  const t = title.trim();
  if (t === MIND_DEFAULT_TITLE || /^untitled\b/i.test(t)) return false;
  return true;
}

/** Topic tag input — never feed default placeholder title into tag generation. */
export function topicTagInputFromItem(
  item: Pick<
    MindItem,
    | 'title'
    | 'previewTitle'
    | 'previewDescription'
    | 'contentExcerpt'
    | 'transcript'
    | 'imageText'
  >,
  overrides?: Partial<TopicTagInput>,
): TopicTagInput {
  const previewTitle = isUsableTagTitle(item.previewTitle) ? item.previewTitle : undefined;
  const itemTitle =
    !isMindDefaultTitle(item as MindItem) && isUsableTagTitle(item.title)
      ? item.title
      : undefined;

  const description = overrides?.description ?? item.previewDescription;
  const excerptParts = [
    overrides?.excerpt ?? item.contentExcerpt,
    item.imageText,
  ].filter(Boolean) as string[];
  const excerpt =
    excerptParts.length > 0
      ? stripEngagementFromText(excerptParts.join('\n\n'))
      : undefined;

  return {
    title: overrides?.title ?? previewTitle ?? itemTitle,
    description: description ? stripEngagementFromText(description) : undefined,
    excerpt,
    transcript: overrides?.transcript ?? item.transcript,
  };
}

export interface TopicTagInput {
  title?: string;
  description?: string;
  excerpt?: string;
  transcript?: string;
}

export function stripPlatformTags(tags: string[]): string[] {
  return tags
    .map((t) => normalizeMindTag(t))
    .filter((t): t is string => !!t && !PLATFORM_TAGS.has(t));
}

export function generateTopicTagsFromContent(input: TopicTagInput, max = 8): string[] {
  const combined = [input.transcript, input.excerpt, input.title, input.description]
    .filter((s): s is string => !!s?.trim())
    .map((s) => stripEngagementFromText(s))
    .join(' ');

  const tokens = combined
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .split(/[\s\-_/|,:;()[\]{}]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter(
      (w) =>
        w.length > 2 &&
        !STOPWORDS.has(w) &&
        !PLATFORM_TAGS.has(w) &&
        !isJunkTopicToken(w),
    );

  const tags: string[] = [];
  for (const w of tokens) {
    const tag = normalizeMindTag(w);
    if (tag && !tags.includes(tag)) tags.push(tag);
    if (tags.length >= max) break;
  }

  // Multi-word phrases from title (e.g. "delimitation bill")
  const title = input.title?.toLowerCase() ?? '';
  const phraseMatches = title.match(/[a-z]{4,}(?:\s+[a-z]{3,}){0,2}/g) ?? [];
  for (const phrase of phraseMatches) {
    const tag = normalizeMindTag(phrase);
    if (
      tag &&
      tag.length > 3 &&
      !STOPWORDS.has(tag) &&
      !PLATFORM_TAGS.has(tag) &&
      !isJunkTopicToken(tag) &&
      !tags.includes(tag)
    ) {
      tags.unshift(tag);
    }
  }

  return [...new Set(tags)].slice(0, max);
}

export function mergeMindTags(
  existing: string[],
  incoming: string[],
  max = 12,
): string[] {
  const merged = [
    ...stripPlatformTags(existing),
    ...stripPlatformTags(incoming),
  ];
  return [...new Set(merged)].slice(0, max);
}

/** Finalize AI tags: topic-only, with fallback from content text. */
export function finalizeMindTags(
  aiTags: string[],
  input: TopicTagInput,
  max = 8,
): string[] {
  let tags = stripPlatformTags(aiTags).filter((t) => t !== 'untitled');
  if (tags.length < 2) {
    tags = generateTopicTagsFromContent(input, max);
  }
  return [...new Set(tags)].slice(0, max);
}
