import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import {
  decodeHtmlEntities,
  getInstagramShortcode,
  parseInstagramOembedTitle,
  stripEngagementFromText,
} from './instagramMeta.js';
import { isValidPreviewImageUrl } from './imageUrl.js';

export interface ExtractResponse {
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  embedHtml?: string;
  text?: string;
  transcript?: string;
}

const MAX_IMAGES = 10;

function pushImage(images: string[], seen: Set<string>, raw?: string) {
  if (!raw) return;
  const u = raw.trim();
  if (!isValidPreviewImageUrl(u) || seen.has(u)) return;
  seen.add(u);
  images.push(u);
}

/** Collect og:image, twitter:image, and JSON-LD image URLs from HTML. */
export function collectImagesFromHtml(html: string, primary?: string): string[] {
  const seen = new Set<string>();
  const images: string[] = [];

  pushImage(images, seen, primary);

  const metaRe =
    /<meta[^>]+(?:property|name)=["'](?:og:image(?::url)?|twitter:image(?::src)?)["'][^>]+content=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(html)) !== null) {
    pushImage(images, seen, decodeEntities(m[1]));
    if (images.length >= MAX_IMAGES) return images;
  }

  const metaAltRe =
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image(?::url)?|twitter:image(?::src)?)["']/gi;
  while ((m = metaAltRe.exec(html)) !== null) {
    pushImage(images, seen, decodeEntities(m[1]));
    if (images.length >= MAX_IMAGES) return images;
  }

  const jsonLdBlocks = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  if (jsonLdBlocks) {
    for (const block of jsonLdBlocks) {
      const inner = block.replace(/<\/?script[^>]*>/gi, '').trim();
      try {
        const data = JSON.parse(inner) as unknown;
        collectJsonLdImages(data, images, seen);
      } catch {
        // skip invalid JSON-LD
      }
      if (images.length >= MAX_IMAGES) return images;
    }
  }

  return images;
}

function collectJsonLdImages(data: unknown, images: string[], seen: Set<string>): void {
  if (!data) return;
  if (Array.isArray(data)) {
    for (const entry of data) collectJsonLdImages(entry, images, seen);
    return;
  }
  if (typeof data !== 'object') return;
  const obj = data as Record<string, unknown>;
  if (typeof obj.image === 'string') {
    pushImage(images, seen, obj.image);
  } else if (Array.isArray(obj.image)) {
    for (const img of obj.image) {
      if (typeof img === 'string') pushImage(images, seen, img);
      else if (img && typeof img === 'object' && typeof (img as { url?: string }).url === 'string') {
        pushImage(images, seen, (img as { url: string }).url);
      }
    }
  } else if (obj.image && typeof obj.image === 'object' && typeof (obj.image as { url?: string }).url === 'string') {
    pushImage(images, seen, (obj.image as { url: string }).url);
  }
  if (typeof obj.url === 'string' && /@type["']?\s*:\s*["']ImageObject/i.test(JSON.stringify(obj))) {
    pushImage(images, seen, obj.url);
  }
  for (const v of Object.values(obj)) {
    if (images.length >= MAX_IMAGES) return;
    if (v && typeof v === 'object') collectJsonLdImages(v, images, seen);
  }
}

const FETCH_TIMEOUT_MS = 12000;
const MAX_HTML_BYTES = 2_000_000;
const MAX_TEXT_LEN = 12_000;
const MAX_TRANSCRIPT_LEN = 4000;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const m = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}

function ogMeta(html: string, property: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i',
  );
  const m = html.match(re) ?? html.match(alt);
  return m?.[1] ? decodeEntities(m[1].trim()) : undefined;
}

export function articleTextFromHtml(html: string, pageUrl: string): string | undefined {
  try {
    const dom = new JSDOM(html, { url: pageUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const text = article?.textContent?.replace(/\s+/g, ' ').trim();
    if (text && text.length > 80) return text.slice(0, MAX_TEXT_LEN);
  } catch {
    // fall through
  }
  return undefined;
}

export async function fetchYoutubeTranscript(videoId: string): Promise<string | null> {
  const langs = ['en', 'en-US', 'en-GB', 'a.en'];
  for (const lang of langs) {
    try {
      const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = (await res.json()) as { events?: { segs?: { utf8?: string }[] }[] };
      const parts =
        data.events
          ?.flatMap((e) => e.segs?.map((s) => s.utf8?.trim()).filter(Boolean) ?? [])
          .join(' ') ?? '';
      if (parts.length > 40) return parts.slice(0, MAX_TRANSCRIPT_LEN);
    } catch {
      // try next lang
    }
  }
  return null;
}

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

function isInstagramUrl(url: string): boolean {
  return /instagram\.com|instagr\.am/i.test(url);
}

interface InstagramOEmbed {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
}

async function fetchInstagramOembed(url: string): Promise<InstagramOEmbed | null> {
  const canonical = url.split('?')[0];
  for (const base of [
    'https://api.instagram.com/oembed?url=',
    'https://www.instagram.com/oembed?url=',
  ]) {
    try {
      const res = await fetch(`${base}${encodeURIComponent(canonical)}`, {
        headers: { 'User-Agent': MOBILE_UA },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      return (await res.json()) as InstagramOEmbed;
    } catch {
      // try next endpoint
    }
  }
  return null;
}

function unescapeInstagramJsonUrl(raw: string): string {
  return raw.replace(/\\u0026/g, '&').replace(/\\\//g, '/');
}

/** Parse carousel display_url / CDN URLs from Instagram embed HTML/JSON blobs. */
export function collectInstagramImagesFromHtml(html: string, primary?: string): string[] {
  const seen = new Set<string>();
  const images: string[] = [];
  pushImage(images, seen, primary);

  if (/edge_sidecar_to_children|carousel_media/i.test(html)) {
    const sidecarBlock = html.match(/edge_sidecar_to_children[\s\S]{0,120000}/)?.[0] ?? html;
    const sidecarRe = /"display_url"\s*:\s*"([^"\\]+(?:\\.[^"\\]*)*)"/g;
    let sm: RegExpExecArray | null;
    while ((sm = sidecarRe.exec(sidecarBlock)) !== null) {
      pushImage(images, seen, unescapeInstagramJsonUrl(sm[1]));
      if (images.length >= MAX_IMAGES) return images;
    }
    // Only stop early when we already have 3+ sidecar slides; otherwise scan full HTML for more.
    if (images.length > 2) return images;
  }

  const patterns = [
    /"display_url"\s*:\s*"([^"\\]+(?:\\.[^"\\]*)*)"/g,
    /"url"\s*:\s*"(https:\\\/\\\/[^"\\]*cdninstagram[^"\\]+)"/g,
    /"(https:\\\/\\\/[^"\\]*cdninstagram[^"\\]+)"/g,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      pushImage(images, seen, unescapeInstagramJsonUrl(m[1]));
      if (images.length >= MAX_IMAGES) break;
    }
  }

  collectExtraInstagramImages(html, images, seen);

  return images;
}

/** image_versions2, candidates, and srcset URLs outside sidecar blocks. */
function collectExtraInstagramImages(html: string, images: string[], seen: Set<string>): void {
  const srcsetRe = /srcset=["']([^"']+)["']/gi;
  let sm: RegExpExecArray | null;
  while ((sm = srcsetRe.exec(html)) !== null) {
    for (const part of sm[1].split(',')) {
      const url = part.trim().split(/\s+/)[0]?.replace(/&amp;/g, '&');
      if (url && /cdninstagram|fbcdn/i.test(url)) {
        pushImage(images, seen, url);
        if (images.length >= MAX_IMAGES) return;
      }
    }
  }

  const candidateRe = /"(?:url|src)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  while ((sm = candidateRe.exec(html)) !== null) {
    const decoded = unescapeInstagramJsonUrl(sm[1]);
    if (!/(?:cdninstagram|fbcdn)/i.test(decoded)) continue;
    pushImage(images, seen, decoded);
    if (images.length >= MAX_IMAGES) return;
  }

  const versionsBlock = html.match(/image_versions2[\s\S]{0,80000}/)?.[0];
  if (versionsBlock) {
    const urlRe = /"url"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    while ((sm = urlRe.exec(versionsBlock)) !== null) {
      const decoded = unescapeInstagramJsonUrl(sm[1]);
      if (!/(?:cdninstagram|fbcdn)/i.test(decoded)) continue;
      pushImage(images, seen, decoded);
      if (images.length >= MAX_IMAGES) return;
    }
  }
}

/** Extra pass for carousel_media nodes in embed/page JSON. */
function collectCarouselMediaImages(html: string): string[] {
  const block = html.match(/carousel_media[\s\S]{0,120000}/)?.[0];
  if (!block) return [];
  return collectInstagramImagesFromHtml(block);
}

/** Merge image lists; oEmbed thumb first when valid. */
function mergeInstagramPreviewImages(
  oembedThumb: string | undefined,
  ...batches: string[][]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  if (oembedThumb) pushImage(out, seen, oembedThumb);
  for (const batch of batches) {
    for (const url of batch) {
      pushImage(out, seen, url);
      if (out.length >= MAX_IMAGES) return out;
    }
  }
  return out;
}

function extractInstagramCaption(html: string): string | undefined {
  const patterns = [
    /"caption"\s*:\s*"((?:[^"\\]|\\.)*)"/,
    /"edge_media_to_caption"[^}]*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const decoded = m[1]
        .replace(/\\n/g, '\n')
        .replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\\//g, '/')
        .trim();
      if (decoded.length > 8) return decoded.slice(0, MAX_TEXT_LEN);
    }
  }
  return undefined;
}

async function extractInstagram(targetUrl: string): Promise<ExtractResponse> {
  const oembed = await fetchInstagramOembed(targetUrl);
  const author = oembed?.author_name?.trim();
  const parsed = parseInstagramOembedTitle(oembed?.title, author);

  let title = parsed?.displayTitle;
  let description = author ? `@${author}` : undefined;
  let image = oembed?.thumbnail_url;
  let text: string | undefined = parsed?.caption;

  const htmlSources: string[] = [];
  const imageBatches: string[][] = [];

  try {
    htmlSources.push(await fetchPageHtml(targetUrl, MOBILE_UA));
  } catch {
    // optional
  }

  const shortcode = getInstagramShortcode(targetUrl);
  if (shortcode) {
    try {
      const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
      htmlSources.push(await fetchPageHtml(embedUrl, MOBILE_UA));
    } catch {
      // optional embed fetch
    }
  }

  for (const html of htmlSources) {
    const ogDesc = decodeHtmlEntities(
      ogMeta(html, 'og:description') ?? ogMeta(html, 'twitter:description') ?? '',
    );
    const caption = extractInstagramCaption(html) ?? ogDesc;
    if (caption && (!text || caption.length > text.length)) text = caption;

    image = image ?? ogMeta(html, 'og:image') ?? ogMeta(html, 'twitter:image');
    const sidecar = collectInstagramImagesFromHtml(html, image);
    if (sidecar.length) imageBatches.push(sidecar);
    const carouselOnly = collectCarouselMediaImages(html);
    if (carouselOnly.length) imageBatches.push(carouselOnly);
  }

  const images = mergeInstagramPreviewImages(oembed?.thumbnail_url, ...imageBatches);

  if (text) {
    const reparsed = parseInstagramOembedTitle(text, author);
    if (reparsed) {
      text = reparsed.caption;
      title = title ?? reparsed.displayTitle;
    }
  }

  if (description) description = stripEngagementFromText(description);
  if (text) text = stripEngagementFromText(text);

  const primaryImage = images[0] ?? image;

  return {
    title: title || (author ? `Post by ${author}` : undefined),
    description,
    image: primaryImage,
    images: images.length ? images : primaryImage ? [primaryImage] : undefined,
    embedHtml: oembed?.html?.trim() || undefined,
    text,
  };
}

export async function fetchPageHtml(url: string, userAgent = MOBILE_UA): Promise<string> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_HTML_BYTES) {
    throw new Error('Page too large');
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(buf);
}

export async function extractFromUrl(targetUrl: string): Promise<ExtractResponse> {
  const trimmed = targetUrl.trim();

  if (isInstagramUrl(trimmed)) {
    return extractInstagram(trimmed);
  }

  const videoId = getYoutubeVideoId(trimmed);

  let title: string | undefined;
  let description: string | undefined;
  let image: string | undefined;
  let text: string | undefined;
  let transcript: string | undefined;

  if (videoId) {
    transcript = (await fetchYoutubeTranscript(videoId)) ?? undefined;
    try {
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (oembed.ok) {
        const data = (await oembed.json()) as { title?: string; author_name?: string };
        title = data.title?.trim();
        description = data.author_name ? `By ${data.author_name}` : undefined;
        image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch {
      // optional oEmbed
    }
  }

  let images: string[] | undefined;

  try {
    const html = await fetchPageHtml(trimmed);
    title = title ?? ogMeta(html, 'og:title') ?? ogMeta(html, 'twitter:title');
    description =
      description ?? ogMeta(html, 'og:description') ?? ogMeta(html, 'twitter:description');
    image = image ?? ogMeta(html, 'og:image') ?? ogMeta(html, 'twitter:image');
    const collected = collectImagesFromHtml(html, image);
    if (collected.length) images = collected;

    if (!videoId) {
      text = articleTextFromHtml(html, trimmed);
      if (!text) {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const stripped = (bodyMatch?.[1] ?? html)
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (stripped.length > 120) text = stripped.slice(0, MAX_TEXT_LEN);
      }
    } else if (!description) {
      description = ogMeta(html, 'og:description');
    }
  } catch {
    // partial result from YouTube branch is fine
  }

  const primaryImage = images?.[0] ?? image;

  return {
    title,
    description,
    image: primaryImage,
    images: images?.length ? images : primaryImage ? [primaryImage] : undefined,
    text,
    transcript,
  };
}
