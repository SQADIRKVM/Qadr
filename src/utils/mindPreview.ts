import type { MindItem } from '../types';
import { getMindPreviewSlides } from './mindPlatformBadge';

/** Instagram oEmbed block present and long enough to render in WebView. */
export function hasInstagramEmbedHtml(item: MindItem): boolean {
  if (item.platform !== 'instagram') return false;
  const html = item.embedHtml?.trim();
  return !!html && html.length > 20;
}

/** Twitter/X oEmbed block present and long enough to render in WebView. */
export function hasTwitterEmbedHtml(item: MindItem): boolean {
  if (item.platform !== 'twitter') return false;
  const html = item.embedHtml?.trim();
  return !!html && html.length > 20;
}

/** Use oEmbed embed when HTML is available (Instagram, or Twitter when no screenshot preview is available). */
export function shouldPreferInstagramEmbed(item: MindItem, _isWeb = false): boolean {
  if (hasInstagramEmbedHtml(item)) return true;
  if (hasTwitterEmbedHtml(item) && getMindPreviewSlides(item).length === 0) return true;
  return false;
}

/** Scraped multi-image carousel when WebView embed is not used. */
export function shouldUseScrapedCarousel(item: MindItem): boolean {
  return getMindPreviewSlides(item).length > 1;
}

