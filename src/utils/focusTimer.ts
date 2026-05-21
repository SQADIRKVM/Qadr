export type TimerPhase = 'focus' | 'break';

export function clampFocusMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 25;
  return Math.min(180, Math.max(1, Math.round(minutes)));
}

export function clampBreakMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 5;
  return Math.min(60, Math.max(1, Math.round(minutes)));
}

/** Elapsed active ms in current phase (excludes paused time). */
export function getElapsedMsInPhase(
  phaseStartedAt: string,
  pausedAt: string | null,
  accumulatedPauseMs: number,
  nowMs = Date.now(),
): number {
  const start = new Date(phaseStartedAt).getTime();
  let pauseMs = accumulatedPauseMs;
  if (pausedAt) {
    pauseMs += nowMs - new Date(pausedAt).getTime();
  }
  return Math.max(0, nowMs - start - pauseMs);
}

export function getRemainingSeconds(
  phaseStartedAt: string,
  targetMinutes: number,
  pausedAt: string | null,
  accumulatedPauseMs: number,
  nowMs = Date.now(),
): number {
  const targetMs = targetMinutes * 60 * 1000;
  const elapsed = getElapsedMsInPhase(phaseStartedAt, pausedAt, accumulatedPauseMs, nowMs);
  return Math.max(0, Math.ceil((targetMs - elapsed) / 1000));
}

export function isPhaseComplete(
  phaseStartedAt: string,
  targetMinutes: number,
  pausedAt: string | null,
  accumulatedPauseMs: number,
  nowMs = Date.now(),
): boolean {
  return getRemainingSeconds(phaseStartedAt, targetMinutes, pausedAt, accumulatedPauseMs, nowMs) === 0;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
