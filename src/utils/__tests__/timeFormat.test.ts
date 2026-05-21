import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTime24, normalizeScheduleTimes, parseTime24 } from '../timeFormat';

describe('timeFormat', () => {
  it('parseTime24 accepts valid times', () => {
    assert.equal(parseTime24('09:00'), true);
    assert.equal(parseTime24('9:00'), true);
    assert.equal(parseTime24('23:59'), true);
  });

  it('parseTime24 rejects invalid times', () => {
    assert.equal(parseTime24('24:00'), false);
    assert.equal(parseTime24('12:60'), false);
    assert.equal(parseTime24('noon'), false);
    assert.equal(parseTime24(''), false);
  });

  it('normalizeTime24 pads hours and minutes', () => {
    assert.equal(normalizeTime24('9:5'), '09:05');
    assert.equal(normalizeTime24(' 23:30 '), '23:30');
  });

  it('normalizeScheduleTimes normalizes all fields or returns null', () => {
    assert.deepEqual(
      normalizeScheduleTimes({
        workOn: '9:00',
        workOff: '18:00',
        examOn: '08:00',
        examOff: '22:00',
        nightOn: '23:00',
        nightOff: '07:00',
        bedtime: '23:30',
      }),
      {
        workOn: '09:00',
        workOff: '18:00',
        examOn: '08:00',
        examOff: '22:00',
        nightOn: '23:00',
        nightOff: '07:00',
        bedtime: '23:30',
      },
    );
    assert.equal(
      normalizeScheduleTimes({
        workOn: 'bad',
        workOff: '18:00',
        examOn: '08:00',
        examOff: '22:00',
        nightOn: '23:00',
        nightOff: '07:00',
        bedtime: '23:30',
      }),
      null,
    );
  });
});
