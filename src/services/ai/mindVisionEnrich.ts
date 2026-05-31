import type { MindItem } from '../../types';
import { parseAIJson } from '../../utils/parseAIJson';
import { getMindPreviewSlides } from '../../utils/mindPlatformBadge';
import { isHashtagStyleMindTitle, isProvisionalMindTitle } from '../../utils/mindTitle';
import { getMindContentKind } from '../../utils/mindUrl';
import { hasAIConfigured, visionChatCompletion, type VisionContentPart } from './client';

const VISION_SYSTEM = `You analyze saved social post images. Return ONLY valid JSON:
{
  "title": "6-12 word contextual title (marketing angle, topic, brand if visible)",
  "summary": "2-3 COMPLETE sentences with ending punctuation",
  "auto_tags": ["topic1","topic2","topic3","topic4"],
  "dominant_color": "#RRGGBB",
  "image_text": "all visible text from the image(s), space-separated"
}
Read text in images (any language). Describe what the post is about — not just hashtags.
NEVER return hashtag-only titles like "drishyam3 · mohanlal".`;

const MAX_VISION_IMAGES = 3;

/** Caption too thin for text-only enrich — run vision on preview images. */
export function needsVisionEnrich(item: MindItem): boolean {
  if (!hasAIConfigured()) return false;
  const slides = getMindPreviewSlides(item);
  if (!slides.length && !item.previewImageUrl && !item.imageUri) return false;

  const kind = getMindContentKind(item);
  if (kind === 'reel' || kind === 'video') return true;

  const caption = item.contentExcerpt?.trim() ?? '';
  if (!caption) return true;
  if (caption.length < 40) return true;
  if (isProvisionalMindTitle(caption, item)) return true;
  if (isHashtagStyleMindTitle(caption)) return true;
  return false;
}

function visionImageUrls(item: MindItem): string[] {
  const slides = getMindPreviewSlides(item);
  if (slides.length) return slides.slice(0, MAX_VISION_IMAGES);
  const single = item.previewImageUrl ?? item.imageUri;
  return single ? [single] : [];
}

export interface VisionEnrichResult {
  patch: Partial<MindItem>;
  error?: string;
}

export async function visionEnrichMindItem(item: MindItem): Promise<VisionEnrichResult> {
  if (!needsVisionEnrich(item)) {
    return { patch: {} };
  }

  const urls = visionImageUrls(item);
  if (!urls.length) {
    return { patch: {} };
  }

  const captionHint = item.contentExcerpt?.trim() || item.previewDescription || '';
  const parts: VisionContentPart[] = [
    {
      type: 'text',
      text: `URL: ${item.url ?? 'n/a'}\nAuthor: ${item.previewDescription ?? 'unknown'}\nCaption snippet: ${captionHint || '(none)'}`,
    },
  ];
  for (const url of urls) {
    parts.push({ type: 'image_url', image_url: { url } });
  }

  try {
    const raw = await visionChatCompletion(VISION_SYSTEM, parts);
    const parsed = parseAIJson(raw) as {
      title?: string;
      summary?: string;
      auto_tags?: string[];
      dominant_color?: string;
      image_text?: string;
    };

    const imageText = parsed.image_text?.trim();
    const patch: Partial<MindItem> = {};

    if (imageText && imageText.length > 8) {
      patch.imageText = imageText.slice(0, 4000);
      const merged = [item.contentExcerpt, imageText].filter(Boolean).join('\n\n');
      patch.contentExcerpt = merged.slice(0, 4000);
    }

    return { patch };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Vision enrich failed';
    return { patch: {}, error: message };
  }
}
