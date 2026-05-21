import { format, parseISO } from 'date-fns';
import type { MoodLevel, Subscription } from '../types';
import { getMoodDisplayLabel } from './moodLabels';
import { upcomingSubscriptions, formatDueLabel } from './moneyTrackers';

export interface DailyBriefingData {
  oneThing: string;
  oneThingDone: boolean;
  mood: MoodLevel | null;
  habitsPercent: number;
  nextSubName: string | null;
  nextSubDue: string | null;
  focusMinutesToday: number;
}

export function getFocusMinutesToday(
  sessions: { startedAt: string; endedAt?: string }[],
): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  let totalMs = 0;
  for (const s of sessions) {
    const day = format(parseISO(s.startedAt), 'yyyy-MM-dd');
    if (day !== today) continue;
    const start = parseISO(s.startedAt).getTime();
    const end = s.endedAt ? parseISO(s.endedAt).getTime() : Date.now();
    if (end > start) totalMs += end - start;
  }
  return Math.round(totalMs / 60000);
}

export function getNextSubscriptionBrief(
  subscriptions: Subscription[],
): { name: string; due: string } | null {
  const upcoming = upcomingSubscriptions(subscriptions, 30);
  const next = upcoming[0];
  if (!next) return null;
  return { name: next.name, due: formatDueLabel(next.nextDueDate) };
}

export function buildBriefingLines(data: DailyBriefingData): string[] {
  const lines: string[] = [];
  if (data.oneThing.trim()) {
    lines.push(
      data.oneThingDone
        ? `One thing done: ${data.oneThing}`
        : `Focus: ${data.oneThing}`,
    );
  } else {
    lines.push('Set your one thing for today.');
  }
  if (data.mood) {
    lines.push(`Mood: ${getMoodDisplayLabel(data.mood)}`);
  }
  lines.push(`Habits today: ${data.habitsPercent}%`);
  if (data.nextSubName) {
    lines.push(`${data.nextSubName} — ${data.nextSubDue ?? 'due soon'}`);
  }
  if (data.focusMinutesToday > 0) {
    lines.push(`Focus logged: ${data.focusMinutesToday} min`);
  }
  return lines;
}
