/** Decode HTML entities for social metadata (oEmbed often returns &#xNNNN; Malayalam, etc.). */

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

/** Short human label from caption — prefer hashtags, else text without #/emoji noise. */
function displayTitleFromCaption(caption: string): string | undefined {
  const fromTags = titleFromHashtags(caption);
  if (fromTags) return fromTags;
  const stripped = stripHashtagsAndEmojiNoise(caption.split('\n')[0]);
  if (stripped.length >= 4) return truncateTitle(stripped, 60);
  return undefined;
}

/** Parse Instagram oEmbed title into decoded caption + human title. */
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

  const shared = decoded.match(/A post shared by @?([\w.]+)/i);
  if (shared) {
    const caption = decoded;
    const displayTitle =
      displayTitleFromCaption(caption) ||
      (authorName ? `Post by ${authorName}` : `Post by @${shared[1]}`);
    return { caption, displayTitle: truncateTitle(displayTitle) };
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

/** Reject titles that should not become item.title. */
export function isBadMindFetchedTitle(title?: string): boolean {
  if (!title?.trim()) return true;
  const t = title.trim();
  if (/&#x?[0-9a-f]+;/i.test(t)) return true;
  if (/on Instagram:/i.test(t)) return true;
  if (/^https?:\/\//i.test(t)) return true;

  const lower = t.toLowerCase();
  if (
    lower.includes('website error') ||
    lower.includes('privacy extensions') ||
    lower.includes('something went wrong') ||
    lower.includes('robot check') ||
    lower.includes('cloudflare') ||
    lower.includes('access denied') ||
    lower.includes('403 forbidden') ||
    lower.includes('404 not found') ||
    lower.includes('page not found') ||
    lower.includes('captcha') ||
    lower.includes('security check')
  ) {
    return true;
  }

  return false;
}

export function extractTweetTextFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return undefined;
  const text = match[1].replace(/<[^>]*>/g, '');
  return decodeHtmlEntities(text).trim();
}

