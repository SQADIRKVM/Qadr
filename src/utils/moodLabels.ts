import { format, parseISO } from 'date-fns';
import type { MoodLevel } from '../types';

export const MOOD_DISPLAY_LABELS: Record<MoodLevel, string> = {
  dead: 'FLAT',
  low: 'LOW',
  neutral: 'SOLID',
  good: 'GROUNDED',
  charged: 'CHARGED',
};

export function getMoodDisplayLabel(mood: MoodLevel): string {
  return MOOD_DISPLAY_LABELS[mood];
}

/** Returns mood only if moodTimestamp is today (local calendar day). */
export function getTodayMood(
  mood: MoodLevel | null,
  moodTimestamp: string | null,
  now = new Date(),
): MoodLevel | null {
  if (!mood || !moodTimestamp) return null;
  const today = format(now, 'yyyy-MM-dd');
  const moodDay = format(parseISO(moodTimestamp), 'yyyy-MM-dd');
  return moodDay === today ? mood : null;
}
