import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  finalizeMindTags,
  generateTopicTagsFromContent,
  mergeMindTags,
  normalizeMindTag,
  stripPlatformTags,
} from '../mindTags';

describe('mindTags', () => {
  it('normalizeMindTag strips hash and lowercases', () => {
    assert.equal(normalizeMindTag('  #Hello World  '), 'hello-world');
  });

  it('mergeMindTags keeps user tags and adds AI tags', () => {
    const merged = mergeMindTags(['custom'], ['ai-tag', 'custom']);
    assert.deepEqual(merged, ['custom', 'ai-tag']);
  });

  it('stripPlatformTags removes youtube, reel, video', () => {
    const out = stripPlatformTags(['delimitation', 'youtube', 'reel', 'video']);
    assert.deepEqual(out, ['delimitation']);
  });

  it('generateTopicTagsFromContent derives topics from title', () => {
    const tags = generateTopicTagsFromContent({
      title: 'Delimitation Bill 2026 Explained',
      description: 'Parliamentary delimitation in India',
    });
    assert.ok(tags.includes('delimitation'));
    assert.ok(tags.includes('bill'));
    assert.equal(tags.includes('youtube'), false);
    assert.equal(tags.includes('reel'), false);
    assert.equal(tags.includes('video'), false);
  });

  it('generateTopicTagsFromContent excludes likes and numeric junk', () => {
    const tags = generateTopicTagsFromContent({
      description: '520 likes, 277 comments on Instagram #drishyam3 #mohanlal',
    });
    assert.ok(tags.includes('drishyam3') || tags.includes('mohanlal'));
    assert.equal(tags.includes('likes'), false);
    assert.equal(tags.includes('520'), false);
    assert.equal(tags.includes('comments'), false);
    assert.equal(tags.includes('277'), false);
  });

  it('generateTopicTagsFromContent ignores Untitled default title', () => {
    const tags = generateTopicTagsFromContent({
      title: 'Untitled',
      description: 'ChatGPT prompts for product photography',
    });
    assert.equal(tags.includes('untitled'), false);
    assert.ok(tags.length > 0);
  });

  it('finalizeMindTags drops platform filler from AI output', () => {
    const tags = finalizeMindTags(
      ['reel', 'youtube', 'video', 'marketing'],
      { title: 'Delimitation Bill 2026 Explained' },
    );
    assert.ok(tags.includes('delimitation') || tags.includes('bill'));
    assert.equal(tags.includes('youtube'), false);
    assert.equal(tags.includes('reel'), false);
  });
});
