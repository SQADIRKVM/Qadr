import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampFocusMinutes,
  clampBreakMinutes,
  getRemainingSeconds,
  isPhaseComplete,
  getElapsedMsInPhase,
} from '../focusTimer';

describe('focusTimer', () => {
  const phaseStart = '2026-01-01T10:00:00.000Z';

  it('clampFocusMinutes bounds 1-180', () => {
    assert.equal(clampFocusMinutes(0), 1);
    assert.equal(clampFocusMinutes(200), 180);
    assert.equal(clampFocusMinutes(25), 25);
  });

  it('clampBreakMinutes bounds 1-60', () => {
    assert.equal(clampBreakMinutes(0), 1);
    assert.equal(clampBreakMinutes(99), 60);
  });

  it('getRemainingSeconds counts down from target', () => {
    const now = new Date(phaseStart).getTime() + 5 * 60 * 1000;
    assert.equal(getRemainingSeconds(phaseStart, 25, null, 0, now), 20 * 60);
  });

  it('getRemainingSeconds freezes while paused', () => {
    const pausedAt = '2026-01-01T10:05:00.000Z';
    const now = new Date('2026-01-01T10:10:00.000Z').getTime();
    const remaining = getRemainingSeconds(phaseStart, 25, pausedAt, 0, now);
    assert.equal(remaining, 20 * 60);
  });

  it('isPhaseComplete when elapsed meets target', () => {
    const now = new Date(phaseStart).getTime() + 25 * 60 * 1000;
    assert.equal(isPhaseComplete(phaseStart, 25, null, 0, now), true);
  });

  it('getElapsedMsInPhase subtracts accumulated pause', () => {
    const now = new Date(phaseStart).getTime() + 10 * 60 * 1000;
    const elapsed = getElapsedMsInPhase(phaseStart, null, 2 * 60 * 1000, now);
    assert.equal(elapsed, 8 * 60 * 1000);
  });
});
