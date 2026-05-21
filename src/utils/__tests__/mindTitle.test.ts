import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MindItem } from '../../types';
import {
  getMindDisplayTitle,
  getMindEditableTitle,
  getMindTitleHint,
  getMindCardSubtitle,
  isMindDefaultTitle,
  isPersistableMindTitle,
  isProvisionalMindTitle,
  MIND_DEFAULT_TITLE,
  normalizeMindUrl,
} from '../mindTitle';

const base: MindItem = {
  id: '1',
  type: 'url',
  title: MIND_DEFAULT_TITLE,
  rawContent: 'https://atmiz.com/robots.txt',
  url: 'https://atmiz.com/robots.txt',
  autoTags: [],
  isPinned: false,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('mindTitle', () => {
  it('treats URL-as-title as default', () => {
    const legacy = { ...base, title: 'https://atmiz.com/robots.txt' };
    assert.equal(isMindDefaultTitle(legacy), true);
    assert.equal(getMindDisplayTitle(legacy), MIND_DEFAULT_TITLE);
  });

  it('shows hostname as subtitle for URLs', () => {
    assert.equal(getMindCardSubtitle(base), 'atmiz.com');
  });

  it('keeps user-defined titles', () => {
    const named = { ...base, title: 'My capture' };
    assert.equal(isMindDefaultTitle(named), false);
    assert.equal(getMindDisplayTitle(named), 'My capture');
  });

  it('isProvisionalMindTitle detects hashtag captions', () => {
    const raw = 'ദൃശ്യം 3 #drishyam3 #mohanlal';
    assert.equal(isProvisionalMindTitle(raw), true);
    assert.equal(isPersistableMindTitle(raw), false);
  });

  it('getMindDisplayTitle uses parsed short title when stored title is provisional', () => {
    const item: MindItem = {
      ...base,
      url: 'https://www.instagram.com/p/abc/',
      title: 'ദൃശ്യം 3 #drishyam3 #mohanlal',
      previewTitle:
        'Skillage on Instagram: "ദൃശ്യം 3 clip #drishyam3 #mohanlal"',
    };
    assert.equal(isProvisionalMindTitle(item.title, item), true);
    const display = getMindDisplayTitle(item);
    assert.ok(display.includes('drishyam3'));
    assert.ok(!display.includes('#'));
  });

  it('getMindEditableTitle prefers real AI title over provisional', () => {
    const item: MindItem = {
      ...base,
      title: 'Drishyam 3 climax discussion',
      aiEnriched: true,
    };
    assert.equal(getMindEditableTitle(item), 'Drishyam 3 climax discussion');
  });

  it('getMindEditableTitle leaves input empty for provisional stored title', () => {
    const item: MindItem = {
      ...base,
      url: 'https://www.instagram.com/p/abc/',
      title: 'drishyam3 · mohanlal',
      previewTitle: 'Skillage on Instagram: "clip #drishyam3 #mohanlal"',
    };
    assert.equal(getMindEditableTitle(item), '');
    assert.equal(getMindTitleHint(item), 'drishyam3 · mohanlal');
  });

  it('normalizeMindUrl strips hash and trailing slash', () => {
    assert.equal(
      normalizeMindUrl('https://www.instagram.com/p/ABC/?utm=1#x'),
      'https://www.instagram.com/p/ABC?utm=1',
    );
  });
});
