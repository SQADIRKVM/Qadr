import type { MindContentKind, MindPlatform } from '../../types';
import { decodeHtmlEntities } from '../../utils/decodeHtml';
import {
  detectMindPlatform,
  getYoutubeVideoId,
  inferContentKindFromUrl,
} from '../../utils/mindUrl';
import { isValidPreviewImageUrl } from '../../utils/mindImageHosts';
import { resolveUrlMetadata } from './urlMetadata';

export interface ContentExtractResult {
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  embedHtml?: string;
  text?: string;
  transcript?: string;
  platform: MindPlatform;
  contentKind: MindContentKind;
  videoUrl?: string;
}

interface ExtractProxyPayload {
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  embedHtml?: string;
  text?: string;
  transcript?: string;
  siteName?: string;
  site_name?: string;
  videoUrl?: string;
}

const MAX_PREVIEW_IMAGES = 10;

/** Dedupe and validate carousel image URLs. */
export function normalizePreviewImages(
  images?: string[] | null,
  fallback?: string,
): string[] | undefined {
  const seen = new Set<string>();
  const out: string[] = [];
  const candidates = [...(images ?? []), fallback].filter(Boolean) as string[];

  for (const raw of candidates) {
    const u = raw.trim();
    if (!isValidPreviewImageUrl(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length >= MAX_PREVIEW_IMAGES) break;
  }

  return out.length ? out : undefined;
}

const FETCH_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchExtractProxy(targetUrl: string): Promise<ExtractProxyPayload | null> {
  const extractBase = process.env.EXPO_PUBLIC_CONTENT_EXTRACT_URL?.trim();
  const previewBase = process.env.EXPO_PUBLIC_LINK_PREVIEW_PROXY?.trim();
  const base = extractBase || previewBase;
  if (!base) return null;
  try {
    const sep = base.includes('?') ? '&' : '?';
    const res = await fetchWithTimeout(`${base}${sep}url=${encodeURIComponent(targetUrl)}`);
    if (!res.ok) {
      let detail = `Extract HTTP ${res.status}`;
      try {
        const errBody = (await res.json()) as { error?: string };
        if (errBody.error) detail = errBody.error;
      } catch {
        // ignore parse
      }
      throw new Error(detail);
    }
    return (await res.json()) as ExtractProxyPayload;
  } catch (e) {
    if (e instanceof Error) throw e;
    return null;
  }
}

/** Best-effort YouTube captions via public timedtext (may fail on web CORS). */
async function fetchYoutubeTranscript(videoId: string): Promise<string | null> {
  const langs = ['en', 'en-US', 'en-GB', 'a.en'];
  for (const lang of langs) {
    try {
      const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const data = (await res.json()) as { events?: { segs?: { utf8?: string }[] }[] };
      const parts =
        data.events
          ?.flatMap((e) => e.segs?.map((s) => s.utf8?.trim()).filter(Boolean) ?? [])
          .join(' ') ?? '';
      if (parts.length > 40) return parts.slice(0, 4000);
    } catch {
      // try next lang
    }
  }
  return null;
}

async function fetchRedditJson(url: string): Promise<Partial<ContentExtractResult> | null> {
  if (!/reddit\.com/.test(url)) return null;
  try {
    const jsonUrl = url.replace(/\/?$/, '.json');
    const res = await fetchWithTimeout(jsonUrl);
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    const listing = Array.isArray(data) ? data[0] : data;
    const post = (listing as { data?: { children?: { data?: Record<string, unknown> }[] } })
      ?.data?.children?.[0]?.data;
    if (!post) return null;
    const title = String(post.title ?? '').trim();
    const selftext = String(post.selftext ?? '').trim();
    return {
      title,
      text: selftext || title,
      description: selftext.slice(0, 500) || title,
    };
  } catch {
    return null;
  }
}

function buildExcerpt(text?: string, transcript?: string, description?: string): string | undefined {
  const parts = [transcript, text, description].filter(Boolean) as string[];
  if (!parts.length) return undefined;
  return parts.join('\n\n').slice(0, 4000);
}

export async function fetchContentExtract(url: string): Promise<ContentExtractResult> {
  const trimmed = url.trim();
  const det = detectMindPlatform(trimmed);
  const meta = await resolveUrlMetadata(trimmed);

  let contentKind = meta.contentKind;
  if (det.platform === 'youtube' && !det.isReel) {
    contentKind = 'video';
  }

  let title = meta.previewTitle;
  let description = meta.previewDescription;
  let image = meta.previewImageUrl;
  let images: string[] | undefined;
  let embedHtml = meta.embedHtml;
  let text: string | undefined;
  let transcript: string | undefined;
  let videoUrl: string | undefined;

  const proxy = await fetchExtractProxy(trimmed);
  if (proxy) {
    title = proxy.title ? decodeHtmlEntities(proxy.title.trim()) : title;
    description = proxy.description
      ? decodeHtmlEntities(proxy.description.trim())
      : description;
    image = proxy.image || image;
    images = normalizePreviewImages(proxy.images, image);
    embedHtml = proxy.embedHtml?.trim() || embedHtml;
    text = proxy.text ? decodeHtmlEntities(proxy.text.trim()) : undefined;
    transcript = proxy.transcript?.trim();
    videoUrl = proxy.videoUrl;
  }

  const reddit = await fetchRedditJson(trimmed);
  if (reddit) {
    title = reddit.title || title;
    text = reddit.text || text;
    description = reddit.description || description;
    contentKind = 'social';
  }

  if (det.platform === 'youtube') {
    const videoId = getYoutubeVideoId(trimmed);
    if (videoId && !transcript) {
      transcript = (await fetchYoutubeTranscript(videoId)) ?? undefined;
    }
  }

  const checkString = [title, description, text, transcript]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const isErr =
    checkString.includes('website error') ||
    checkString.includes('privacy extensions') ||
    checkString.includes('something went wrong') ||
    checkString.includes('robot check') ||
    checkString.includes('cloudflare') ||
    checkString.includes('access denied') ||
    checkString.includes('403 forbidden') ||
    checkString.includes('404 not found') ||
    checkString.includes('page not found') ||
    checkString.includes('captcha') ||
    checkString.includes('security check');

  if (isErr) {
    title = undefined;
    description = undefined;
    text = undefined;
    transcript = undefined;
  }

  const contentExcerpt = buildExcerpt(text, transcript, description);
  const previewImages = images ?? normalizePreviewImages(undefined, image);
  const primaryImage = previewImages?.[0] ?? image;

  return {
    platform: det.platform,
    contentKind,
    title,
    description,
    image: primaryImage,
    images: previewImages,
    embedHtml,
    text: text ?? contentExcerpt,
    transcript,
    videoUrl,
  };
}

export function contentExcerptFromExtract(result: ContentExtractResult): string | undefined {
  return buildExcerpt(result.text, result.transcript, result.description);
}
