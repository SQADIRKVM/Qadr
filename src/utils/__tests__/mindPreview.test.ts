import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MindItem } from '../../types';
import { hasInstagramEmbedHtml, shouldPreferInstagramEmbed, shouldUseScrapedCarousel } from '../mindPreview';
import { needsVisionEnrich } from '../../services/ai/mindVisionEnrich';

const base: MindItem = {
  id: '1',
  type: 'url',
  title: 'Untitled',
  rawContent: 'https://www.instagram.com/p/abc/',
  url: 'https://www.instagram.com/p/abc/',
  platform: 'instagram',
  autoTags: [],
  isPinned: false,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('mindPreview routing', () => {
  it('shouldUseScrapedCarousel when multiple preview images', () => {
    const item: MindItem = {
      ...base,
      previewImages: ['https://a.com/1.jpg', 'https://a.com/2.jpg'],
      previewImageUrl: 'https://a.com/1.jpg',
    };
    assert.equal(shouldUseScrapedCarousel(item), true);
  });

  it('hasInstagramEmbedHtml when embedHtml on instagram', () => {
    const item: MindItem = {
      ...base,
      embedHtml: '<blockquote class="instagram-media">post</blockquote>',
    };
    assert.equal(hasInstagramEmbedHtml(item), true);
    assert.equal(shouldPreferInstagramEmbed(item, false), true);
    assert.equal(shouldPreferInstagramEmbed(item, true), true);
  });

  it('hasInstagramEmbedHtml when embedHtml on twitter', () => {
    const item: MindItem = {
      ...base,
      platform: 'twitter',
      embedHtml: '<blockquote class="twitter-tweet">tweet</blockquote>',
    };
    assert.equal(hasInstagramEmbedHtml(item), false);
    assert.equal(shouldPreferInstagramEmbed(item), true);
  });

  it('does not prefer twitter embed when preview slides are present', () => {
    const item: MindItem = {
      ...base,
      platform: 'twitter',
      embedHtml: '<blockquote class="twitter-tweet">tweet</blockquote>',
      previewImageUrl: 'https://cdn.example.com/screenshot.jpg',
    };
    assert.equal(shouldPreferInstagramEmbed(item), false);
  });
});

describe('needsVisionEnrich', () => {
  it('returns true for hashtag-only caption when AI configured', () => {
    const prev = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key';
    const item: MindItem = {
      ...base,
      previewImageUrl: 'https://cdn.example.com/x.jpg',
      contentExcerpt: '#drishyam3 #mohanlal',
    };
    assert.equal(needsVisionEnrich(item), true);
    process.env.EXPO_PUBLIC_GROQ_API_KEY = prev;
  });
});
