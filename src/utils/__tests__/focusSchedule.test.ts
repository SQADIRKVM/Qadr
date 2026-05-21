import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSuggestedBlockMode,
  isInWindow,
  parseMinutes,
  getScheduleOffTime,
} from '../focusSchedule';

const schedule = {
  workOn: '09:00',
  workOff: '18:00',
  examOn: '08:00',
  examOff: '22:00',
  nightOn: '23:00',
  nightOff: '07:00',
};

describe('focusSchedule', () => {
  it('parseMinutes converts HH:MM', () => {
    assert.equal(parseMinutes('09:30'), 9 * 60 + 30);
  });

  it('isInWindow handles same-day range', () => {
    assert.equal(isInWindow(10 * 60, parseMinutes('09:00'), parseMinutes('18:00')), true);
    assert.equal(isInWindow(8 * 60, parseMinutes('09:00'), parseMinutes('18:00')), false);
  });

  it('isInWindow handles overnight range', () => {
    assert.equal(isInWindow(23 * 60 + 30, parseMinutes('23:00'), parseMinutes('07:00')), true);
    assert.equal(isInWindow(7 * 60, parseMinutes('23:00'), parseMinutes('07:00')), false);
    assert.equal(isInWindow(6 * 60 + 30, parseMinutes('23:00'), parseMinutes('07:00')), true);
  });

  it('getSuggestedBlockMode picks work at 10:00', () => {
    const d = new Date('2026-05-20T10:00:00');
    assert.equal(getSuggestedBlockMode(schedule, d), 'work');
  });

  it('getSuggestedBlockMode picks night at 23:30', () => {
    const d = new Date('2026-05-20T23:30:00');
    assert.equal(getSuggestedBlockMode(schedule, d), 'night');
  });

  it('getSuggestedBlockMode picks night at 06:30 before nightOff', () => {
    const d = new Date('2026-05-20T06:30:00');
    assert.equal(getSuggestedBlockMode(schedule, d), 'night');
  });

  it('getScheduleOffTime returns mode-specific off', () => {
    assert.equal(getScheduleOffTime(schedule, 'exam'), '22:00');
    assert.equal(getScheduleOffTime(schedule, 'night'), '07:00');
  });
});
