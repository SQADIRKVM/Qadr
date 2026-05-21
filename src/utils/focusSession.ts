import { format, parseISO } from 'date-fns';
import type { BlockSession } from '../types';

export const FOCUS_SESSIONS_PER_BLOCK = 4;

export function getFocusSessionDisplay(sessions: BlockSession[]): {
  current: number;
  total: number;
} {
  const todayPrefix = format(new Date(), 'yyyy-MM-dd');
  const todayCount = sessions.filter((s) => s.startedAt.startsWith(todayPrefix)).length;
  const current = Math.min(Math.max(1, todayCount), FOCUS_SESSIONS_PER_BLOCK);
  return { current, total: FOCUS_SESSIONS_PER_BLOCK };
}

export function getSessionDurationMinutes(session: BlockSession): number {
  if (!session.endedAt) return 0;
  const start = parseISO(session.startedAt).getTime();
  const end = parseISO(session.endedAt).getTime();
  let breakMs = 0;
  for (const b of session.breaks) {
    if (b.endedAt) {
      breakMs += parseISO(b.endedAt).getTime() - parseISO(b.startedAt).getTime();
    }
  }
  const pausedMs = session.pausedMs ?? 0;
  return Math.max(0, Math.round((end - start - breakMs - pausedMs) / 60000));
}

export function formatSessionDurationLabel(session: BlockSession): string {
  if (!session.endedAt) return 'ACTIVE';
  const minutes = getSessionDurationMinutes(session);
  if (minutes < 1) return '<1m';
  return `${minutes}m`;
}

export function formatSessionTimeRange(session: BlockSession): string {
  const start = format(parseISO(session.startedAt), 'HH:mm');
  if (!session.endedAt) return `${start} – …`;
  const end = format(parseISO(session.endedAt), 'HH:mm');
  return `${start} – ${end}`;
}
