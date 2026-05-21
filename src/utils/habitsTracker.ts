import { format, subDays, isAfter, startOfDay } from 'date-fns';
import type { Habit, HabitCompletion, HabitFrequency } from '../types';
import { getHabitCompletionRate } from './selectors';

export type DayDotState = 'complete' | 'partial' | 'today' | 'future' | 'empty';

const EMOJI_ICON_MAP: Record<string, string> = {
  '💧': 'water-drop',
  '📚': 'menu-book',
  '🏋': 'fitness-center',
  '🏋️': 'fitness-center',
  '📖': 'menu-book',
  '✓': 'check-circle',
  '✅': 'check-circle',
  '🧘': 'self-improvement',
  '🏃': 'directions-run',
  '💤': 'bedtime',
};

export function getTodayCompletionPercent(
  habits: Habit[],
  completions: HabitCompletion[],
  frequency: HabitFrequency = 'daily',
): number {
  return getHabitCompletionRate(habits, completions, frequency);
}

export function getProgressMessage(pct: number): string {
  if (pct >= 100) return "Perfect day. You're locked in.";
  if (pct >= 75) return "You're doing great today. Almost there!";
  if (pct >= 50) return 'Solid momentum. Keep stacking wins.';
  if (pct > 0) return 'A start is a start. Build from here.';
  return 'Ready when you are. One habit at a time.';
}

export function getWeekDays(): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
}

export function isHabitCompletedToday(
  habitId: string,
  completions: HabitCompletion[],
  date: string = format(new Date(), 'yyyy-MM-dd'),
): boolean {
  return completions.some((c) => c.habitId === habitId && c.date === date && !c.skipped);
}

export function getDayDotState(
  date: Date,
  habits: Habit[],
  completions: HabitCompletion[],
): DayDotState {
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const dateStr = format(day, 'yyyy-MM-dd');

  if (isAfter(day, today)) return 'future';

  const daily = habits.filter((h) => h.frequency === 'daily');
  if (daily.length === 0) return day.getTime() === today.getTime() ? 'today' : 'empty';

  const doneCount = daily.filter((h) => isHabitCompletedToday(h.id, completions, dateStr)).length;
  const ratio = doneCount / daily.length;

  if (day.getTime() === today.getTime()) {
    if (ratio >= 1) return 'today';
    if (ratio > 0) return 'partial';
    return 'today';
  }

  if (ratio >= 1) return 'complete';
  if (ratio > 0) return 'partial';
  return 'empty';
}

export function getSleepDayDotState(
  date: Date,
  logs: { date: string; score: number }[],
): DayDotState {
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const dateStr = format(day, 'yyyy-MM-dd');
  const log = logs.find((l) => l.date === dateStr);

  if (isAfter(day, today)) return 'future';
  if (!log) return day.getTime() === today.getTime() ? 'today' : 'empty';
  if (day.getTime() === today.getTime()) return log.score >= 70 ? 'today' : 'partial';
  if (log.score >= 70) return 'complete';
  if (log.score >= 50) return 'partial';
  return 'empty';
}

export function getHabitMaterialIcon(emoji: string): string | null {
  const trimmed = emoji.trim();
  if (EMOJI_ICON_MAP[trimmed]) return EMOJI_ICON_MAP[trimmed];
  const key = Object.keys(EMOJI_ICON_MAP).find((k) => trimmed.includes(k));
  return key ? EMOJI_ICON_MAP[key] : null;
}

export function getWeekLabel(referenceDate: Date = new Date()): string {
  return `WEEK OF ${format(referenceDate, 'MMM d').toUpperCase()}`;
}
