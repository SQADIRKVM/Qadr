import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MindItem } from '../../types';
import { matchesMindSearch, matchesMindType } from '../mindVault';

const baseItem: MindItem = {
  id: '1',
  type: 'note',
  rawContent: 'Build a habit tracker',
  title: 'Habit tracker',
  summary: 'Notes on tracking daily habits',
  autoTags: ['habits', 'health'],
  isPinned: false,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('mindVault', () => {
  it('matchesMindSearch finds AI tags', () => {
    assert.equal(matchesMindSearch(baseItem, 'health'), true);
    assert.equal(matchesMindSearch(baseItem, 'nomatch'), false);
  });

  it('matchesMindType maps article to url filter', () => {
    const article: MindItem = { ...baseItem, type: 'article', url: 'https://x.com' };
    assert.equal(matchesMindType(article, 'url'), true);
    assert.equal(matchesMindType(article, 'note'), false);
  });
});
