import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterAndMergeSmartTags,
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

  it('generateTopicTagsFromContent excludes CSS/HTML/JS hashes and database IDs', () => {
    const tags = generateTopicTagsFromContent({
      description: 'workflow layout class ctrzycuqotfrlhagde0a3mwqmapio63n and key lqk1zs2ss8kmoolw3jklyw',
    });
    assert.ok(tags.includes('workflow'));
    assert.ok(tags.includes('layout'));
    assert.equal(tags.includes('ctrzycuqotfrlhagde0a3mwqmapio63n'), false);
    assert.equal(tags.includes('lqk1zs2ss8kmoolw3jklyw'), false);
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

  it('filterAndMergeSmartTags discards naive placeholder tags but preserves user custom tags', () => {
    const input = {
      title: "Aikanksha's lead generation workflow optimization using custom tools",
      excerpt: "Stop paying for lead generation tools, I was paying thousands",
    };

    // The naive tags extracted initially
    const naiveTags = generateTopicTagsFromContent(input);
    assert.ok(naiveTags.includes('lead'));
    assert.ok(naiveTags.includes('stop'));

    // Simulate currentTags having the naive tags + a user manually added tag 'my-custom-tag'
    const currentTags = [...naiveTags, 'my-custom-tag'];

    // Simulated AI tags
    const aiTags = ['lead-generation', 'workflow-optimization', 'custom-tools'];

    const result = filterAndMergeSmartTags(currentTags, aiTags, input);

    // The result should contain the user custom tag and the AI tags
    assert.ok(result.includes('my-custom-tag'));
    assert.ok(result.includes('lead-generation'));
    assert.ok(result.includes('workflow-optimization'));
    assert.ok(result.includes('custom-tools'));

    // The result should NOT contain any of the naive placeholder tags that weren't added by the user
    assert.equal(result.includes('lead'), false);
    assert.equal(result.includes('stop'), false);
  });
});
