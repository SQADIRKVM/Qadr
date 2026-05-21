import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getTodayMood, getMoodDisplayLabel } from '../moodLabels';
import { buildBriefingLines } from '../dailyBriefing';

describe('moodLabels', () => {
  it('getTodayMood returns mood only for today', () => {
    const now = new Date('2026-05-20T12:00:00');
    assert.equal(
      getTodayMood('charged', '2026-05-20T08:00:00.000Z', now),
      'charged',
    );
    assert.equal(
      getTodayMood('charged', '2026-05-19T08:00:00.000Z', now),
      null,
    );
  });

  it('getMoodDisplayLabel maps keys to UI labels', () => {
    assert.equal(getMoodDisplayLabel('good'), 'GROUNDED');
  });
});

describe('dailyBriefing mood', () => {
  it('buildBriefingLines includes mood when set', () => {
    const lines = buildBriefingLines({
      oneThing: '',
      oneThingDone: false,
      mood: 'charged',
      habitsPercent: 0,
      nextSubName: null,
      nextSubDue: null,
      focusMinutesToday: 0,
    });
    assert.ok(lines.some((l) => l.startsWith('Mood: CHARGED')));
  });
});
