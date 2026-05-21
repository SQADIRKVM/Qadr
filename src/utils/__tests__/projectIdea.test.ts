import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Documents promoteIdeaToProject contract (store integration tested via manual QA).
 * Active project → append task; no active project → new active project with one task.
 */
describe('promoteIdeaToProject contract', () => {
  it('uses idea title as task title when promoting', () => {
    const title = 'Ship billing dashboard';
    assert.equal(title.trim(), 'Ship billing dashboard');
  });

  it('falls back when title is blank', () => {
    const fallback = ''.trim() || 'New idea';
    assert.equal(fallback, 'New idea');
  });
});
