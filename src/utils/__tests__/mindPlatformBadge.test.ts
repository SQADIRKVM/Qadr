import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getMindFormatBadge, getMindPreviewSlides } from '../mindPlatformBadge';
import type { MindItem } from '../../types';

function baseItem(overrides: Partial<MindItem>): MindItem {
  const now = new Date().toISOString();
  return {
    id: '1',
    type: 'url',
    title: 'Untitled',
    rawContent: 'https://example.com',
    autoTags: [],
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('mindPlatformBadge', () => {
  it('labels Instagram reel vs post', () => {
    const reel = getMindFormatBadge(
      baseItem({
        url: 'https://instagram.com/reel/abc/',
        platform: 'instagram',
        isReel: true,
        contentKind: 'reel',
      }),
    );
    assert.equal(reel?.label, 'Reel');

    const post = getMindFormatBadge(
      baseItem({
        url: 'https://instagram.com/p/abc/',
        platform: 'instagram',
        contentKind: 'social',
      }),
    );
    assert.equal(post?.label, 'Instagram Post');
  });

  it('labels YouTube short vs long video', () => {
    const short = getMindFormatBadge(
      baseItem({
        url: 'https://youtube.com/shorts/x',
        platform: 'youtube',
        isReel: true,
        contentKind: 'reel',
      }),
    );
    assert.equal(short?.label, 'YouTube Short');

    const video = getMindFormatBadge(
      baseItem({
        url: 'https://youtube.com/watch?v=x',
        platform: 'youtube',
        contentKind: 'video',
      }),
    );
    assert.equal(video?.label, 'YouTube Video');
  });

  it('labels X and Reddit posts', () => {
    assert.equal(
      getMindFormatBadge(
        baseItem({ url: 'https://x.com/user/status/1', platform: 'twitter' }),
      )?.label,
      'X Post',
    );
    assert.equal(
      getMindFormatBadge(
        baseItem({ url: 'https://reddit.com/r/a/comments/b', platform: 'reddit' }),
      )?.label,
      'Reddit Post',
    );
  });

  it('getMindPreviewSlides prefers previewImages array', () => {
    const slides = getMindPreviewSlides(
      baseItem({
        previewImages: ['https://a.com/1.jpg', 'https://a.com/2.jpg'],
        previewImageUrl: 'https://a.com/1.jpg',
      }),
    );
    assert.equal(slides.length, 2);
  });
});
