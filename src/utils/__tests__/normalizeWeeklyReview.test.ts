import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isMetricLabel,
  normalizeWeeklyReviewResponse,
  ensureStringArray,
} from '../normalizeWeeklyReview';

describe('normalizeWeeklyReview', () => {
  it('isMetricLabel detects payload keys', () => {
    assert.equal(isMetricLabel('Projects'), true);
    assert.equal(isMetricLabel('Great week on shipping'), false);
  });

  it('ensureStringArray rejects object keys as values only', () => {
    const arr = ensureStringArray({ a: 'hello', b: 'world' });
    assert.deepEqual(arr, ['hello', 'world']);
  });

  it('normalizeWeeklyReviewResponse replaces metric wins with stubs', () => {
    const result = normalizeWeeklyReviewResponse({
      summary: 'ok',
      wins: ['Projects', 'Blocks'],
      fixes: [],
      suggestion: 'Focus on addressing the identified areas for improvement.',
      sleepGrade: 'B',
      focusScore: 80,
      momentumScore: 70,
    });
    assert.ok(result.wins.every((w) => !isMetricLabel(w)));
    assert.ok(result.wins[0].length > 10);
    assert.notEqual(result.suggestion, 'Focus on addressing the identified areas for improvement.');
  });
});
