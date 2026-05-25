import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MindItem, MindPlatform } from '../types';
import { getMindContentKind } from './mindUrl';

export type MindPlatformIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface MindFormatBadge {
  label: string;
  platform: MindPlatform;
  icon: MindPlatformIconName;
}

export function getMindPlatformIcon(platform: MindPlatform): MindPlatformIconName {
  switch (platform) {
    case 'instagram':
      return 'instagram';
    case 'youtube':
      return 'youtube';
    case 'tiktok':
      return 'music-note';
    case 'twitter':
      return 'twitter';
    case 'linkedin':
      return 'linkedin';
    case 'reddit':
      return 'reddit';
    case 'vimeo':
      return 'vimeo';
    case 'telegram':
      return 'send';
    default:
      return 'link-variant';
  }
}

export function getMindFormatBadge(item: MindItem): MindFormatBadge | null {
  if (!item.url && !item.platform) return null;

  const platform = item.platform ?? 'generic';
  const kind = getMindContentKind(item);
  const icon = getMindPlatformIcon(platform);

  if (platform === 'instagram') {
    if (item.isReel || kind === 'reel') {
      return { label: 'Reel', platform, icon };
    }
    return { label: 'Instagram Post', platform, icon };
  }

  if (platform === 'youtube') {
    if (item.isReel || kind === 'reel') {
      return { label: 'YouTube Short', platform, icon };
    }
    return { label: 'YouTube Video', platform, icon };
  }

  if (platform === 'tiktok') {
    return { label: 'TikTok', platform, icon };
  }

  if (platform === 'twitter') {
    return { label: 'X Post', platform, icon };
  }

  if (platform === 'reddit') {
    return { label: 'Reddit Post', platform, icon };
  }

  if (platform === 'linkedin') {
    return { label: 'LinkedIn Post', platform, icon };
  }

  if (platform === 'telegram') {
    return { label: 'Telegram', platform, icon };
  }

  if (platform === 'vimeo') {
    return { label: 'Vimeo', platform, icon };
  }

  if (kind === 'article') {
    return { label: 'Article', platform: 'generic', icon: 'file-document-outline' };
  }

  if (item.url) {
    return { label: 'Link', platform: 'generic', icon };
  }

  return null;
}

/** Slide URIs for carousel (previewImages or single previewImageUrl). */
export function getMindPreviewSlides(item: MindItem): string[] {
  const kind = getMindContentKind(item);
  if (kind === 'reel' || kind === 'video') {
    const single = item.previewImageUrl ?? item.imageUri ?? item.previewImages?.[0];
    return single ? [single] : [];
  }

  if (item.previewImages?.length) return item.previewImages;
  const single = item.previewImageUrl ?? item.imageUri;
  return single ? [single] : [];
}

export function hasMindCarousel(item: MindItem): boolean {
  return getMindPreviewSlides(item).length > 1;
}
