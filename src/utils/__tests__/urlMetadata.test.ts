import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeMetadataFallback } from '../../services/mind/urlMetadata';
import { getYoutubeVideoId, youtubeThumbnailUrl } from '../mindUrl';

describe('urlMetadata helpers', () => {
  it('youtubeMetadataFallback returns thumb without network', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const meta = youtubeMetadataFallback(url);
    assert.ok(meta);
    assert.equal(meta?.contentKind, 'video');
    assert.equal(meta?.previewImageUrl, youtubeThumbnailUrl('dQw4w9WgXcQ'));
  });

  it('getYoutubeVideoId returns null for non-youtube', () => {
    assert.equal(getYoutubeVideoId('https://atmiz.com'), null);
  });
});
