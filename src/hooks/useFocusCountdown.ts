import { useEffect, useState } from 'react';
import { isPhaseComplete, getRemainingSeconds } from '../utils/focusTimer';
import type { TimerPhase } from '../utils/focusTimer';

interface UseFocusCountdownArgs {
  phaseStartedAt: string | null;
  targetMinutes: number;
  pausedAt: string | null;
  accumulatedPauseMs: number;
  timerPhase: TimerPhase;
  enabled: boolean;
}

export function useFocusCountdown({
  phaseStartedAt,
  targetMinutes,
  pausedAt,
  accumulatedPauseMs,
  timerPhase,
  enabled,
}: UseFocusCountdownArgs) {
  const [remainingSeconds, setRemainingSeconds] = useState(targetMinutes * 60);
  const [phaseComplete, setPhaseComplete] = useState(false);

  useEffect(() => {
    if (!enabled || !phaseStartedAt) {
      setRemainingSeconds(targetMinutes * 60);
      setPhaseComplete(false);
      return;
    }

    const tick = () => {
      const remaining = getRemainingSeconds(
        phaseStartedAt,
        targetMinutes,
        pausedAt,
        accumulatedPauseMs,
      );
      setRemainingSeconds(remaining);
      setPhaseComplete(
        isPhaseComplete(phaseStartedAt, targetMinutes, pausedAt, accumulatedPauseMs),
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [
    enabled,
    phaseStartedAt,
    targetMinutes,
    pausedAt,
    accumulatedPauseMs,
    timerPhase,
  ]);

  return { remainingSeconds, phaseComplete };
}
