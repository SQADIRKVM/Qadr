/** Hostnames allowed for mind-extract image proxy (keep in sync with services/mind-extract/src/server.ts). */
export function isInstagramCdnHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    /cdninstagram\.com$/i.test(h) ||
    /fbcdn\.net$/i.test(h) ||
    /^instagram\.com$/i.test(h) ||
    /(^|\.)instagram\.com$/i.test(h) ||
    /^scontent[\w-]*\.cdninstagram\.com$/i.test(h)
  );
}

/** Reject bare CDN roots and other non-image URLs scraped from Instagram HTML. */
export function isValidPreviewImageUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    if (!/^https?:$/i.test(u.protocol)) return false;

    const pathQuery = `${u.pathname}${u.search}`;
    if (!pathQuery || pathQuery === '/' || u.pathname.length < 6) return false;

    if (isInstagramCdnHost(u.hostname)) {
      return (
        /\/v\/|\/vp\//i.test(u.pathname) ||
        /\.(jpg|jpeg|png|webp)(\?|$)/i.test(pathQuery) ||
        /[?&]oe=/i.test(u.search) ||
        u.pathname.split('/').filter(Boolean).length >= 3
      );
    }

    return u.pathname.length >= 4;
  } catch {
    return false;
  }
}
