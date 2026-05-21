import { Platform } from 'react-native';
import { isInstagramCdnHost, isValidPreviewImageUrl } from './mindImageHosts';

export { isInstagramCdnHost, isValidPreviewImageUrl } from './mindImageHosts';

/** mind-extract base without trailing path/query */
function extractServiceOrigin(): string | null {
  const raw = process.env.EXPO_PUBLIC_CONTENT_EXTRACT_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function proxyUrlFor(uri: string): string | null {
  const origin = extractServiceOrigin();
  if (!origin) return null;
  return `${origin}/proxy?url=${encodeURIComponent(uri)}`;
}

/** Ordered sources for preview: on web try CDN direct first, then local proxy. */
export function getMindPreviewImageSources(uri: string): string[] {
  if (!/^https?:\/\//i.test(uri)) return [uri];

  let host = '';
  try {
    host = new URL(uri).hostname;
  } catch {
    return [uri];
  }

  if (!isInstagramCdnHost(host) || !isValidPreviewImageUrl(uri)) {
    return [uri];
  }

  if (Platform.OS !== 'web') {
    return [uri];
  }

  const proxied = proxyUrlFor(uri);
  if (!proxied) return [uri];
  return [uri, proxied];
}

/** Primary display URL (first candidate). */
export function resolveMindPreviewImageUrl(uri: string): string {
  return getMindPreviewImageSources(uri)[0];
}
