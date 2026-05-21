import type { ActiveBlockMode } from './focusMode';

export interface FocusScheduleWindows {
  workOn: string;
  workOff: string;
  examOn: string;
  examOff: string;
  nightOn: string;
  nightOff: string;
}

export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

/** True if now (minutes since midnight) is inside [on, off). Supports overnight windows. */
export function isInWindow(nowMin: number, onMin: number, offMin: number): boolean {
  if (onMin === offMin) return false;
  if (onMin < offMin) {
    return nowMin >= onMin && nowMin < offMin;
  }
  return nowMin >= onMin || nowMin < offMin;
}

/** Night first (overnight), then work before exam so 10:00 suggests work not exam. */
const MODE_PRIORITY: ActiveBlockMode[] = ['night', 'work', 'exam'];

export function getSuggestedBlockMode(
  schedule: FocusScheduleWindows,
  date: Date = new Date(),
): ActiveBlockMode | null {
  const nowMin = date.getHours() * 60 + date.getMinutes();
  const windows: Record<ActiveBlockMode, { on: string; off: string }> = {
    night: { on: schedule.nightOn, off: schedule.nightOff },
    exam: { on: schedule.examOn, off: schedule.examOff },
    work: { on: schedule.workOn, off: schedule.workOff },
  };

  for (const mode of MODE_PRIORITY) {
    const { on, off } = windows[mode];
    if (isInWindow(nowMin, parseMinutes(on), parseMinutes(off))) {
      return mode;
    }
  }
  return null;
}

export function getScheduleOffTime(
  schedule: FocusScheduleWindows,
  mode: ActiveBlockMode,
): string {
  switch (mode) {
    case 'exam':
      return schedule.examOff;
    case 'night':
      return schedule.nightOff;
    default:
      return schedule.workOff;
  }
}
