import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichMindItem,
  isCompleteMindSummary,
  isHashtagStyleTitle,
  validateMindEnrichParsed,
} from '../../services/ai/mindEnrich';
import type { MindItem } from '../../types';
import { isWeakAiMindTitle, MIND_DEFAULT_TITLE } from '../mindTitle';

function youtubeVideoItem(overrides: Partial<MindItem> = {}): MindItem {
  const now = new Date().toISOString();
  return {
    id: 'yt-1',
    type: 'video',
    contentKind: 'video',
    title: MIND_DEFAULT_TITLE,
    rawContent: 'https://www.youtube.com/watch?v=test123',
    url: 'https://www.youtube.com/watch?v=test123',
    platform: 'youtube',
    isReel: false,
    previewTitle: 'Delimitation Bill 2026 Explained',
    previewDescription: 'How parliamentary delimitation works in India',
    autoTags: [],
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('mindEnrich validation', () => {
  it('isHashtagStyleTitle detects hashtag pairs', () => {
    assert.equal(isHashtagStyleTitle('drishyam3 · mohanlal'), true);
    assert.equal(isHashtagStyleTitle('Skillage Drishyam 3 marketing'), false);
  });

  it('isCompleteMindSummary requires length and punctuation', () => {
    assert.equal(isCompleteMindSummary('The Malayalam film Drishyam 3 has'), false);
    assert.equal(
      isCompleteMindSummary(
        'Skillage Academy posted a moment-marketing reel about Drishyam 3 climax footage. The caption highlights a leaked climax scene.',
      ),
      true,
    );
  });

  it('isWeakAiMindTitle rejects truncated social titles', () => {
    const item = youtubeVideoItem({
      platform: 'instagram',
      contentExcerpt: '#drishyam3 skillage',
      autoTags: ['drishyam', 'skillage'],
    });
    assert.equal(isWeakAiMindTitle('Skillage moment marketing us', item), true);
    assert.equal(
      isWeakAiMindTitle('Skillage moment marketing using Drishyam 3 climax', item),
      false,
    );
  });

  it('isWeakAiMindTitle rejects marketing usi with dr tag and instagram url', () => {
    const item = youtubeVideoItem({
      platform: 'instagram',
      contentKind: 'social',
      url: 'https://www.instagram.com/p/DYjeSpymsQv/',
      autoTags: ['skillagein', 'may', 'dr'],
    });
    assert.equal(isWeakAiMindTitle('Skillage moment marketing usi', item), true);
    assert.equal(
      validateMindEnrichParsed(
        {
          title: 'Skillage moment marketing usi',
          summary:
            'Skillage Academy shared a marketing post tied to Drishyam 3 climax leak imagery. The caption frames it as climax content going public.',
        },
        item,
        { requireTitle: true },
      ),
      false,
    );
  });

  it('validateMindEnrichParsed rejects incomplete social enrich', () => {
    const item = youtubeVideoItem({
      platform: 'instagram',
      contentKind: 'social',
      url: 'https://www.instagram.com/p/abc/',
      rawContent: 'https://www.instagram.com/p/abc/',
      previewTitle: 'Skillage on Instagram: "clip #drishyam3"',
      contentExcerpt: 'clip #drishyam3',
    });
    assert.equal(
      validateMindEnrichParsed(
        { title: 'drishyam3 · mohanlal', summary: 'The Malayalam film Drishyam 3 has' },
        item,
        { requireTitle: true },
      ),
      false,
    );
    assert.equal(
      validateMindEnrichParsed(
        {
          title: 'Skillage moment marketing us',
          summary:
            'Skillage Academy shared a marketing post tied to Drishyam 3 climax leak imagery. The caption frames it as climax content going public.',
        },
        item,
        { requireTitle: true },
      ),
      false,
    );
    assert.equal(
      validateMindEnrichParsed(
        {
          title: 'Skillage moment marketing using Drishyam 3 climax',
          summary:
            'Skillage Academy shared a marketing post tied to Drishyam 3 climax leak imagery. The caption frames it as climax content going public.',
        },
        item,
        { requireTitle: true },
      ),
      true,
    );
  });
});

describe('mindEnrich pipeline (stub / no Groq)', () => {
  it('stub enrich applies preview title and topic tags without platform tags', async () => {
    const prev = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    process.env.EXPO_PUBLIC_GROQ_API_KEY = '';

    const { patch, fromStub } = await enrichMindItem(youtubeVideoItem());
    assert.equal(fromStub, true);
    assert.equal(patch.title, 'Delimitation Bill 2026 Explained');
    assert.ok(patch.autoTags?.includes('delimitation') || patch.autoTags?.includes('bill'));
    assert.equal(patch.autoTags?.includes('youtube'), false);
    assert.equal(patch.autoTags?.includes('reel'), false);
    assert.equal(patch.autoTags?.includes('video'), false);
    assert.ok(patch.summary?.length);

    process.env.EXPO_PUBLIC_GROQ_API_KEY = prev;
  });

  it('stub enrich omits hashtag title for Instagram (AI-only titles)', async () => {
    const prev = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    process.env.EXPO_PUBLIC_GROQ_API_KEY = '';

    const { patch, fromStub } = await enrichMindItem(
      youtubeVideoItem({
        platform: 'instagram',
        contentKind: 'social',
        type: 'url',
        url: 'https://www.instagram.com/p/abc/',
        rawContent: 'https://www.instagram.com/p/abc/',
        title: 'ദൃശ്യം 3 #drishyam3 #mohanlal',
        previewTitle:
          'Skillage on Instagram: "ദൃശ്യം 3 #drishyam3 #mohanlal"',
        contentExcerpt: 'ദൃശ്യം 3 #drishyam3 #mohanlal',
      }),
    );
    assert.equal(fromStub, true);
    assert.equal(patch.title, undefined);

    process.env.EXPO_PUBLIC_GROQ_API_KEY = prev;
  });
});
