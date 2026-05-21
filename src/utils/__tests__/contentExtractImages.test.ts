import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePreviewImages } from '../../services/mind/contentExtract';

describe('contentExtract images', () => {
  it('normalizePreviewImages dedupes and caps', () => {
    const out = normalizePreviewImages(
      ['https://a.com/1.jpg', 'https://a.com/1.jpg', 'https://a.com/2.jpg'],
      'https://a.com/3.jpg',
    );
    assert.deepEqual(out, [
      'https://a.com/1.jpg',
      'https://a.com/2.jpg',
      'https://a.com/3.jpg',
    ]);
  });

  it('normalizePreviewImages uses fallback when images empty', () => {
    assert.deepEqual(normalizePreviewImages([], 'https://a.com/x.png'), ['https://a.com/x.png']);
  });
});
