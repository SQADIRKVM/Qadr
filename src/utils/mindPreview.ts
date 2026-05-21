import type { MindItem } from '../types';
import { getMindPreviewSlides } from './mindPlatformBadge';

/** Instagram oEmbed block present and long enough to render in WebView. */
export function hasInstagramEmbedHtml(item: MindItem): boolean {
  if (item.platform !== 'instagram') return false;
  const html = item.embedHtml?.trim();
  return !!html && html.length > 20;
}

/** Use Instagram oEmbed embed when embed HTML is available (WebView native, iframe on web). */
export function shouldPreferInstagramEmbed(item: MindItem, _isWeb = false): boolean {
  return hasInstagramEmbedHtml(item);
}

/** Scraped multi-image carousel when WebView embed is not used. */
export function shouldUseScrapedCarousel(item: MindItem): boolean {
  return getMindPreviewSlides(item).length > 1;
}
