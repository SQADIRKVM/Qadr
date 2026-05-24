/** Extract the first HTTP(S) URL from shared text (Instagram captions, etc.). */
export function extractUrlFromShareText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const match = text.trim().match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;
  return match[0].replace(/[)\].,!?]+$/, '');
}

export type SharedMindPayload = {
  url: string | null;
  text: string | null;
  title: string | null;
};

/** Normalize expo-share-intent payload into url + optional caption/title. */
export function parseShareIntentPayload(input: {
  text?: string | null;
  webUrl?: string | null;
  meta?: { title?: string } | null;
}): SharedMindPayload {
  const text = input.text?.trim() || null;
  const webUrl = input.webUrl?.trim() || null;
  const fromText = extractUrlFromShareText(text);
  const url = webUrl || fromText;
  const title = input.meta?.title?.trim() || null;
  return { url, text, title };
}
