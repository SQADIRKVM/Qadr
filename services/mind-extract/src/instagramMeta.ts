/** Instagram oEmbed / caption parsing (mirrors app src/utils/decodeHtml.ts). */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeHtmlEntities(text: string): string {
  if (!text || !/&(?:#x?[0-9a-f]+|[a-z]+);/i.test(text)) return text;

  let out = text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    });

  out = out.replace(/&([a-z]+);/gi, (match, name: string) => {
    const key = name.toLowerCase();
    return NAMED_ENTITIES[key] ?? match;
  });

  return out.replace(/\s+/g, ' ').trim();
}

export interface InstagramParsedTitle {
  caption: string;
  displayTitle: string;
}

function titleFromHashtags(caption: string): string | undefined {
  const tags = caption.match(/#[\w\u0080-\uFFFF]+/g);
  if (!tags?.length) return undefined;
  const label = tags
    .slice(0, 2)
    .map((t) => t.replace(/^#/, ''))
    .join(' · ');
  return label.length > 3 ? label.slice(0, 80) : undefined;
}

function truncateTitle(text: string, max = 80): string {
  const line = text.split('\n')[0].trim();
  if (line.length <= max) return line;
  return `${line.slice(0, max - 1).trim()}…`;
}

function stripHashtagsAndEmojiNoise(line: string): string {
  let s = line.replace(/#[\w\u0080-\uFFFF]+/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();
  return s;
}

function displayTitleFromCaption(caption: string): string | undefined {
  const fromTags = titleFromHashtags(caption);
  if (fromTags) return fromTags;
  const stripped = stripHashtagsAndEmojiNoise(caption.split('\n')[0]);
  if (stripped.length >= 4) return truncateTitle(stripped, 60);
  return undefined;
}

export function parseInstagramOembedTitle(
  rawTitle?: string,
  authorName?: string,
): InstagramParsedTitle | null {
  if (!rawTitle?.trim()) return null;

  const decoded = decodeHtmlEntities(rawTitle.trim());

  const quoted = decoded.match(/on Instagram:\s*["'](.+?)["']\s*$/is);
  if (quoted?.[1]) {
    const caption = quoted[1].trim();
    const displayTitle =
      displayTitleFromCaption(caption) ||
      (authorName ? `Post by ${authorName}` : undefined);
    if (displayTitle) return { caption, displayTitle };
  }

  if (/on Instagram/i.test(decoded)) {
    const caption = decoded;
    const displayTitle =
      displayTitleFromCaption(caption) ||
      (authorName ? `Post by ${authorName}` : undefined);
    if (displayTitle) return { caption, displayTitle: truncateTitle(displayTitle) };
  }

  if (
    decoded.length > 3 &&
    !/&#|&[a-z]+;/i.test(decoded) &&
    (/#/.test(decoded) || /on Instagram/i.test(decoded))
  ) {
    const displayTitle = displayTitleFromCaption(decoded) ?? truncateTitle(decoded);
    return { caption: decoded, displayTitle };
  }

  return null;
}

export function stripEngagementFromText(text: string): string {
  return text
    .replace(/\d[\d,.]*\s*(likes?|comments?|views?)\b/gi, ' ')
    .replace(/\b\d[\d,.]*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getInstagramShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  return m?.[1] ?? null;
}

export function extractTweetTextFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return undefined;
  const text = match[1].replace(/<[^>]*>/g, '');
  return decodeHtmlEntities(text).trim();
}

