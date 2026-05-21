import type { MindContentKind, MindPlatform } from '../../types';
import { isValidPreviewImageUrl } from '../../utils/mindImageHosts';
import { parseInstagramOembedTitle } from '../../utils/decodeHtml';
import {
  detectMindPlatform,
  getYoutubeVideoId,
  inferContentKindFromUrl,
  youtubeThumbnailUrl,
} from '../../utils/mindUrl';

export interface MindUrlMetadata {
  platform: MindPlatform;
  contentKind: MindContentKind;
  previewImageUrl?: string;
  embedHtml?: string;
  previewTitle?: string;
  previewDescription?: string;
  siteName?: string;
}

interface OEmbedPayload {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  description?: string;
  html?: string;
}

interface ProxyPayload {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  site_name?: string;
}

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOEmbed(endpoint: string, targetUrl: string): Promise<OEmbedPayload | null> {
  try {
    const q = `${endpoint}${encodeURIComponent(targetUrl)}`;
    const res = await fetchWithTimeout(q);
    if (!res.ok) return null;
    return (await res.json()) as OEmbedPayload;
  } catch {
    return null;
  }
}

async function fetchLinkPreviewProxy(targetUrl: string): Promise<ProxyPayload | null> {
  const base = process.env.EXPO_PUBLIC_LINK_PREVIEW_PROXY?.trim();
  if (!base) return null;
  try {
    const sep = base.includes('?') ? '&' : '?';
    const res = await fetchWithTimeout(`${base}${sep}url=${encodeURIComponent(targetUrl)}`);
    if (!res.ok) return null;
    return (await res.json()) as ProxyPayload;
  } catch {
    return null;
  }
}

function isBrowserClient(): boolean {
  return typeof (globalThis as { document?: unknown }).document !== 'undefined';
}

/** Best-effort Instagram oEmbed (public endpoint; may fail for some posts). */
export async function resolveInstagram(url: string): Promise<Partial<MindUrlMetadata>> {
  // Browser CORS blocks Instagram oEmbed — mind-extract fetches server-side on web.
  if (isBrowserClient()) {
    return { siteName: 'Instagram', contentKind: /\/reel\//.test(url) ? 'reel' : 'social' };
  }

  const canonical = url.split('?')[0];
  const endpoints = [
    `https://api.instagram.com/oembed?url=`,
    `https://www.instagram.com/oembed?url=`,
  ];

  for (const endpoint of endpoints) {
    const oembed = await fetchOEmbed(endpoint, canonical);
    if (!oembed?.thumbnail_url && !oembed?.title) continue;

    const author = oembed.author_name?.trim();
    const rawTitle = oembed.title?.trim();
    const parsed = parseInstagramOembedTitle(rawTitle, author);
    const isReel = /\/reel\//.test(url);

    const thumb = oembed.thumbnail_url?.trim();
    return {
      previewImageUrl:
        thumb && isValidPreviewImageUrl(thumb) ? thumb : undefined,
      embedHtml: oembed.html?.trim() || undefined,
      previewTitle: parsed?.caption ?? rawTitle ?? (author ? `Post by ${author}` : undefined),
      previewDescription: author ? `@${author}` : undefined,
      siteName: 'Instagram',
      contentKind: isReel ? 'reel' : 'social',
    };
  }

  return {};
}

async function resolveYoutube(url: string, isReel: boolean): Promise<Partial<MindUrlMetadata>> {
  const videoId = getYoutubeVideoId(url);
  const thumb = videoId ? youtubeThumbnailUrl(videoId) : undefined;
  const oembed = await fetchOEmbed('https://www.youtube.com/oembed?format=json&url=', url);
  const author = oembed?.author_name?.trim();
  const title = oembed?.title?.trim();
  const description = author && title ? `${title} · ${author}` : title ?? author;

  return {
    previewImageUrl: oembed?.thumbnail_url ?? thumb,
    previewTitle: title,
    previewDescription: description,
    siteName: 'YouTube',
    contentKind: isReel ? 'reel' : 'video',
  };
}

async function resolveVimeo(url: string): Promise<Partial<MindUrlMetadata>> {
  const oembed = await fetchOEmbed('https://vimeo.com/api/oembed.json?url=', url);
  return {
    previewImageUrl: oembed?.thumbnail_url,
    previewTitle: oembed?.title?.trim(),
    previewDescription: oembed?.author_name
      ? `${oembed.title ?? ''} · ${oembed.author_name}`.trim()
      : oembed?.description?.trim(),
    siteName: 'Vimeo',
    contentKind: 'video',
  };
}

function resolveFromProxy(
  proxy: ProxyPayload,
  contentKind: MindContentKind,
  siteName?: string,
): Partial<MindUrlMetadata> {
  return {
    previewImageUrl: proxy.image,
    previewTitle: proxy.title?.trim(),
    previewDescription: proxy.description?.trim(),
    siteName: proxy.siteName ?? proxy.site_name ?? siteName,
    contentKind,
  };
}

export async function resolveUrlMetadata(url: string): Promise<MindUrlMetadata> {
  const trimmed = url.trim();
  const det = detectMindPlatform(trimmed);
  let contentKind = inferContentKindFromUrl(trimmed, det.platform, det.isReel);
  let partial: Partial<MindUrlMetadata> = { siteName: det.label };

  if (det.platform === 'youtube') {
    partial = { ...partial, ...(await resolveYoutube(trimmed, det.isReel)) };
  } else if (det.platform === 'vimeo') {
    partial = { ...partial, ...(await resolveVimeo(trimmed)) };
  } else if (det.platform === 'instagram') {
    partial = { ...partial, ...(await resolveInstagram(trimmed)) };
    if (!partial.previewImageUrl) {
      const proxy = await fetchLinkPreviewProxy(trimmed);
      if (proxy) {
        partial = { ...partial, ...resolveFromProxy(proxy, contentKind, det.label) };
      }
    }
  } else {
    const proxy = await fetchLinkPreviewProxy(trimmed);
    if (proxy) {
      partial = {
        ...partial,
        ...resolveFromProxy(proxy, contentKind, det.label),
      };
    } else if (det.platform === 'tiktok' || det.isReel) {
      contentKind = 'reel';
    } else if (det.platform === 'twitter' || det.platform === 'linkedin') {
      contentKind = 'social';
    }
  }

  if (!partial.previewTitle && !partial.previewImageUrl) {
    const proxy = await fetchLinkPreviewProxy(trimmed);
    if (proxy) {
      partial = { ...partial, ...resolveFromProxy(proxy, contentKind, det.label) };
    }
  }

  const thumb = partial.previewImageUrl?.trim();
  return {
    platform: det.platform,
    contentKind: partial.contentKind ?? contentKind,
    previewImageUrl:
      thumb && isValidPreviewImageUrl(thumb) ? thumb : undefined,
    embedHtml: partial.embedHtml,
    previewTitle: partial.previewTitle,
    previewDescription: partial.previewDescription,
    siteName: partial.siteName ?? det.label,
  };
}

/** Sync YouTube thumb when oEmbed fails (e.g. offline). */
export function youtubeMetadataFallback(url: string): Partial<MindUrlMetadata> | null {
  const det = detectMindPlatform(url);
  if (det.platform !== 'youtube') return null;
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return {
    platform: 'youtube',
    contentKind: det.isReel ? 'reel' : 'video',
    previewImageUrl: youtubeThumbnailUrl(videoId),
    siteName: 'YouTube',
  };
}
