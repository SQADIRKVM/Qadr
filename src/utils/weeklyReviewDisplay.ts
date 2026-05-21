import { format, parseISO, subDays, startOfDay, isWithinInterval } from 'date-fns';
import type { Habit, HabitCompletion, SleepLog, WeeklyReview } from '../types';
import {
  ensureStringArray,
  filterCoachStrings,
  sanitizeStoredWeeklyReview,
} from './normalizeWeeklyReview';

const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

export function formatWeekOfLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (Number.isNaN(d.getTime())) return 'WEEK OF REVIEW';
  return `WEEK OF ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function getSleepDurationHours(log: SleepLog): number {
  const slept = parseISO(log.sleptAt);
  const woke = parseISO(log.wokeAt);
  if (Number.isNaN(slept.getTime()) || Number.isNaN(woke.getTime())) return 0;
  const ms = woke.getTime() - slept.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60);
}

export function getWeeklyRestAverageHours(sleepLogs: SleepLog[]): number {
  const end = startOfDay(new Date());
  const start = subDays(end, 6);
  const interval = { start, end };

  const inWeek = sleepLogs.filter((log) => {
    const d = parseISO(log.date);
    return !Number.isNaN(d.getTime()) && isWithinInterval(d, interval);
  });

  if (inWeek.length === 0) return 0;
  const total = inWeek.reduce((sum, log) => sum + getSleepDurationHours(log), 0);
  return Math.round((total / inWeek.length) * 10) / 10;
}

export function formatRestHours(hours: number): string {
  if (hours <= 0) return '—';
  return `${hours}h`;
}

export function getWeeklyHabitsKept(
  habits: Habit[],
  completions: HabitCompletion[],
): { kept: number; expected: number } {
  const daily = habits.filter((h) => h.frequency === 'daily');
  if (daily.length === 0) return { kept: 0, expected: 0 };

  const days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(startOfDay(new Date()), 6 - i), 'yyyy-MM-dd'),
  );

  let kept = 0;
  const expected = daily.length * days.length;

  for (const habit of daily) {
    for (const day of days) {
      const done = completions.some(
        (c) => c.habitId === habit.id && c.date === day && !c.skipped,
      );
      if (done) kept += 1;
    }
  }

  return { kept, expected };
}

export function formatHabitsKept(kept: number, expected: number): string {
  if (expected === 0) return '—';
  return `${kept}/${expected}`;
}

export interface CoachBullet {
  text: string;
  emphasis?: boolean;
}

export function buildCoachBullets(review: WeeklyReview): CoachBullet[] {
  const safe = sanitizeStoredWeeklyReview(review);
  const bullets: CoachBullet[] = [];

  for (const w of filterCoachStrings(ensureStringArray(safe.wins))) {
    bullets.push({ text: w });
  }
  for (const f of filterCoachStrings(ensureStringArray(safe.fixes))) {
    bullets.push({ text: f });
  }
  for (const insight of filterCoachStrings(ensureStringArray(safe.insights))) {
    const isTip = /tip/i.test(insight);
    bullets.push({
      text: insight,
      emphasis: isTip,
    });
  }

  return bullets;
}

const GENERIC_SUGGESTION =
  /^focus on addressing the identified areas for improvement\.?$/i;

export function getDirectiveFromReview(review: WeeklyReview): {
  title: string;
  subtitle: string;
} {
  const safe = sanitizeStoredWeeklyReview(review);
  if (safe.directive?.title) {
    return {
      title: safe.directive.title,
      subtitle: safe.directive.subtitle ?? 'Next focus',
    };
  }
  const suggestion = safe.suggestion?.trim() ?? '';
  if (suggestion && !GENERIC_SUGGESTION.test(suggestion)) {
    return {
      title: suggestion,
      subtitle: 'Suggested focus for next week',
    };
  }
  return {
    title: 'Set your next priority',
    subtitle: 'Pick one milestone to ship this week',
  };
}
