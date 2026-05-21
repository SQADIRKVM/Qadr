import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectMindPlatform,
  getMindContentKind,
  getYoutubeVideoId,
  isReelMindItem,
  isVideoMindItem,
  youtubeThumbnailUrl,
} from '../mindUrl';
import type { MindItem } from '../../types';

describe('mindUrl', () => {
  it('detectMindPlatform finds Instagram reel', () => {
    const d = detectMindPlatform('https://www.instagram.com/reel/ABC123/');
    assert.equal(d.platform, 'instagram');
    assert.equal(d.isReel, true);
  });

  it('detectMindPlatform finds YouTube shorts', () => {
    const d = detectMindPlatform('https://youtube.com/shorts/xyz');
    assert.equal(d.platform, 'youtube');
    assert.equal(d.isReel, true);
  });

  it('detectMindPlatform finds regular YouTube watch as non-reel', () => {
    const d = detectMindPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(d.platform, 'youtube');
    assert.equal(d.isReel, false);
  });

  it('detectMindPlatform finds LinkedIn', () => {
    const d = detectMindPlatform('https://www.linkedin.com/posts/foo');
    assert.equal(d.platform, 'linkedin');
  });

  it('getYoutubeVideoId parses watch and youtu.be URLs', () => {
    assert.equal(
      getYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      'dQw4w9WgXcQ',
    );
    assert.equal(getYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.equal(getYoutubeVideoId('https://youtube.com/shorts/abc123XYZ'), 'abc123XYZ');
  });

  it('youtubeThumbnailUrl builds hq thumb', () => {
    assert.equal(
      youtubeThumbnailUrl('dQw4w9WgXcQ'),
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    );
  });

  it('getMindContentKind distinguishes reel vs long video', () => {
    const reel: MindItem = {
      id: '1',
      type: 'video',
      title: 'Untitled',
      rawContent: 'https://youtube.com/shorts/x',
      url: 'https://youtube.com/shorts/x',
      platform: 'youtube',
      isReel: true,
      contentKind: 'reel',
      autoTags: [],
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const video: MindItem = {
      ...reel,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rawContent: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isReel: false,
      contentKind: 'video',
    };
    assert.equal(getMindContentKind(reel), 'reel');
    assert.equal(getMindContentKind(video), 'video');
    assert.equal(isReelMindItem(reel), true);
    assert.equal(isVideoMindItem(video), true);
    assert.equal(isReelMindItem(video), false);
  });
});
