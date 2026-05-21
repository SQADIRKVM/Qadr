import type { MindContentKind, MindContentType, MindItem, MindPlatform } from '../types';

export interface MindUrlDetection {
  platform: MindPlatform;
  isReel: boolean;
  label: string;
}

export function getYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id && id.length >= 6 ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2];
        return id && id.length >= 6 ? id : null;
      }
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.split('/')[2];
        return id && id.length >= 6 ? id : null;
      }
      const v = u.searchParams.get('v');
      return v && v.length >= 6 ? v : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumbnailUrl(videoId: string, quality: 'hq' | 'mq' = 'hq'): string {
  const file = quality === 'hq' ? 'hqdefault.jpg' : 'mqdefault.jpg';
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}

export function detectMindPlatform(url: string): MindUrlDetection {
  const lower = url.toLowerCase().trim();

  if (/instagram\.com|instagr\.am/.test(lower)) {
    const isReel = /\/reel\//.test(lower) || /\/reels\//.test(lower);
    return {
      platform: 'instagram',
      isReel,
      label: isReel ? 'Instagram Reel' : 'Instagram',
    };
  }

  if (/youtube\.com|youtu\.be/.test(lower)) {
    const isReel = /\/shorts\//.test(lower);
    return {
      platform: 'youtube',
      isReel,
      label: isReel ? 'YouTube Short' : 'YouTube',
    };
  }

  if (/tiktok\.com/.test(lower)) {
    return { platform: 'tiktok', isReel: true, label: 'TikTok' };
  }

  if (/twitter\.com|x\.com/.test(lower)) {
    return { platform: 'twitter', isReel: false, label: 'X / Twitter' };
  }

  if (/linkedin\.com/.test(lower)) {
    return { platform: 'linkedin', isReel: false, label: 'LinkedIn' };
  }

  if (/vimeo\.com/.test(lower)) {
    return { platform: 'vimeo', isReel: false, label: 'Vimeo' };
  }

  if (/reddit\.com/.test(lower)) {
    return { platform: 'reddit', isReel: false, label: 'Reddit' };
  }

  if (/t\.me\/|telegram\.me\/|telegram\.org\//.test(lower)) {
    return { platform: 'telegram', isReel: false, label: 'Telegram' };
  }

  return { platform: 'generic', isReel: false, label: 'Link' };
}

export function inferContentKindFromUrl(url: string, platform?: MindPlatform, isReel?: boolean): MindContentKind {
  const det = detectMindPlatform(url);
  const plat = platform ?? det.platform;
  const reel = isReel ?? det.isReel;

  if (reel || plat === 'tiktok') return 'reel';
  if (plat === 'youtube' || plat === 'vimeo') return 'video';
  if (plat === 'twitter' || plat === 'linkedin' || plat === 'instagram' || plat === 'reddit' || plat === 'telegram')
    return 'social';
  if (/medium\.com|substack\.com|\.news|blog|article/.test(url.toLowerCase())) return 'article';
  return 'link';
}

export function contentKindToMindType(kind: MindContentKind): {
  type: MindContentType;
  isReel: boolean;
} {
  switch (kind) {
    case 'reel':
      return { type: 'video', isReel: true };
    case 'video':
      return { type: 'video', isReel: false };
    case 'article':
      return { type: 'article', isReel: false };
    case 'social':
      return { type: 'url', isReel: false };
    case 'link':
    default:
      return { type: 'url', isReel: false };
  }
}

export function getMindContentKind(item: MindItem): MindContentKind {
  if (item.contentKind) return item.contentKind;
  if (item.isReel) return 'reel';
  if (item.url) return inferContentKindFromUrl(item.url, item.platform, item.isReel);
  if (item.imageUri) return 'link';
  if (item.type === 'note') return 'link';
  return 'link';
}

/** @deprecated Use getMindContentKind(item) === 'reel' || 'video' */
export function isVideoMindItem(item: MindItem): boolean {
  const kind = getMindContentKind(item);
  return kind === 'reel' || kind === 'video';
}

export function isReelMindItem(item: MindItem): boolean {
  return getMindContentKind(item) === 'reel';
}

export function pathKeywordsFromUrl(url: string): string[] {
  try {
    const u = new URL(url);
    return u.pathname
      .split(/[/\-_]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 3 && !/^\d+$/.test(s))
      .slice(0, 4);
  } catch {
    return [];
  }
}

export function platformDisplayLabel(platform?: MindPlatform): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'twitter':
      return 'X';
    case 'linkedin':
      return 'LinkedIn';
    case 'vimeo':
      return 'Vimeo';
    case 'reddit':
      return 'Reddit';
    case 'telegram':
      return 'Telegram';
    default:
      return 'Link';
  }
}
