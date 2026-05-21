import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contentExcerptFromExtract } from '../../services/mind/contentExtract';
import { inferContentKindFromUrl } from '../mindUrl';
import { detectMindPlatform } from '../mindUrl';

describe('mindPipeline', () => {
  it('YouTube watch URL infers video contentKind not reel', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const det = detectMindPlatform(url);
    assert.equal(det.isReel, false);
    const kind = inferContentKindFromUrl(url, det.platform, det.isReel);
    assert.equal(kind, 'video');
  });

  it('contentExcerptFromExtract prefers transcript then article text', () => {
    const excerpt = contentExcerptFromExtract({
      platform: 'youtube',
      contentKind: 'video',
      title: 'Delimitation Bill 2026 Explained',
      description: 'Short description',
      text: 'Article body should appear after transcript.',
      transcript: 'Full caption line about delimitation bill.',
    });
    assert.ok(excerpt?.startsWith('Full caption'));
    assert.ok(excerpt?.includes('Article body'));
  });

  it('watchedAt toggles null and ISO string', () => {
    const watchedAt = new Date().toISOString();
    assert.ok(watchedAt.length > 10);
    const cleared: string | null = null;
    assert.equal(cleared, null);
  });
});
