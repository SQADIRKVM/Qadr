import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractUrlFromShareText, parseShareIntentPayload } from '../sharePayload';

describe('sharePayload', () => {
  it('extracts URL from mixed caption text', () => {
    const url = extractUrlFromShareText(
      'Check this https://www.instagram.com/reel/ABC123/ now',
    );
    assert.equal(url, 'https://www.instagram.com/reel/ABC123/');
  });

  it('prefers webUrl over text', () => {
    const p = parseShareIntentPayload({
      text: 'fallback https://example.com',
      webUrl: 'https://www.instagram.com/reel/xyz/',
    });
    assert.equal(p.url, 'https://www.instagram.com/reel/xyz/');
  });

  it('returns null url when no link present', () => {
    const p = parseShareIntentPayload({ text: 'just a note' });
    assert.equal(p.url, null);
  });
});
