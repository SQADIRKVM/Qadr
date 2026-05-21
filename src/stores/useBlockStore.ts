import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BlockMode, BlockSession, BlockOverride } from '../types';
import type { TimerPhase } from '../utils/focusTimer';
import {
  createModeDurationsFromLegacy,
  DEFAULT_MODE_DURATIONS,
  type ActiveBlockMode,
  type ModeDurationSettings,
  isActiveBlockMode,
} from '../utils/focusMode';
import type {
  BreakDurationPreset,
  FocusDurationPreset,
} from './useSettingsStore';
import { useSettingsStore } from './useSettingsStore';
import { clampBreakMinutes, clampFocusMinutes } from '../utils/focusTimer';
import { generateId } from '../utils/id';
import { createPersistStorage } from './storage';

export type { ActiveBlockMode, ModeDurationSettings };

interface BlockSchedule {
  workOn: string;
  workOff: string;
  examOn: string;
  examOff: string;
  nightOn: string;
  nightOff: string;
}

const clearTimerState = {
  timerPhase: 'focus' as TimerPhase,
  phaseStartedAt: null as string | null,
  pausedAt: null as string | null,
  accumulatedPauseMs: 0,
  sessionPausedMs: 0,
  breakStartedAt: null as string | null,
  focusStartedAt: null as string | null,
};

function appendCompletedBreak(
  sessions: BlockSession[],
  breakStartedAt: string,
): BlockSession[] {
  const openId = sessions.find((s) => !s.endedAt)?.id;
  if (!openId) return sessions;
  const endedAt = new Date().toISOString();
  return sessions.map((s) =>
    s.id === openId
      ? {
          ...s,
          breaks: [...s.breaks, { startedAt: breakStartedAt, endedAt }],
        }
      : s,
  );
}

function applyFocusPreset(
  preset: FocusDurationPreset,
  currentMinutes: number,
): Partial<ModeDurationSettings> {
  if (preset === '25') {
    return { focusDurationPreset: preset, focusDurationMinutes: 25 };
  }
  if (preset === '45') {
    return { focusDurationPreset: preset, focusDurationMinutes: 45 };
  }
  return {
    focusDurationPreset: preset,
    focusDurationMinutes: clampFocusMinutes(currentMinutes),
  };
}

function applyBreakPreset(
  preset: BreakDurationPreset,
  currentMinutes: number,
): Partial<ModeDurationSettings> {
  if (preset === '5') {
    return { breakDurationPreset: preset, breakDurationMinutes: 5 };
  }
  if (preset === '10') {
    return { breakDurationPreset: preset, breakDurationMinutes: 10 };
  }
  return {
    breakDurationPreset: preset,
    breakDurationMinutes: clampBreakMinutes(currentMinutes),
  };
}

interface BlockState {
  mode: BlockMode;
  sessions: BlockSession[];
  overrides: BlockOverride[];
  schedule: BlockSchedule;
  modeDurations: Record<ActiveBlockMode, ModeDurationSettings>;
  focusStartedAt: string | null;
  breakStartedAt: string | null;
  timerPhase: TimerPhase;
  phaseStartedAt: string | null;
  pausedAt: string | null;
  accumulatedPauseMs: number;
  sessionPausedMs: number;
  setMode: (mode: BlockMode) => void;
  startFocus: () => void;
  endFocus: () => void;
  endSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  startBreakPhase: () => void;
  startNextFocusPhase: () => void;
  skipToBreak: () => void;
  logOverride: (mode: BlockMode, reason: string, durationMinutes: number) => void;
  updateSchedule: (patch: Partial<BlockSchedule>) => void;
  updateModeDurations: (mode: ActiveBlockMode, patch: Partial<ModeDurationSettings>) => void;
  setFocusDurationPreset: (mode: ActiveBlockMode, preset: FocusDurationPreset) => void;
  setBreakDurationPreset: (mode: ActiveBlockMode, preset: BreakDurationPreset) => void;
  getOpenSession: () => BlockSession | undefined;
}

export const useBlockStore = create<BlockState>()(
  persist(
    (set, get) => ({
      mode: 'off',
      sessions: [],
      overrides: [],
      schedule: {
        workOn: '09:00',
        workOff: '18:00',
        examOn: '08:00',
        examOff: '22:00',
        nightOn: '23:00',
        nightOff: '07:00',
      },
      modeDurations: { ...DEFAULT_MODE_DURATIONS },
      focusStartedAt: null,
      breakStartedAt: null,
      timerPhase: 'focus',
      phaseStartedAt: null,
      pausedAt: null,
      accumulatedPauseMs: 0,
      sessionPausedMs: 0,
      setMode: (mode) => set({ mode }),
      getOpenSession: () => get().sessions.find((s) => !s.endedAt),
      updateModeDurations: (mode, patch) => {
        const current = get().modeDurations[mode];
        const next = { ...current, ...patch };
        if (patch.focusDurationMinutes != null) {
          next.focusDurationMinutes = clampFocusMinutes(patch.focusDurationMinutes);
          next.focusDurationPreset = 'custom';
        }
        if (patch.breakDurationMinutes != null) {
          next.breakDurationMinutes = clampBreakMinutes(patch.breakDurationMinutes);
          next.breakDurationPreset = 'custom';
        }
        set({
          modeDurations: {
            ...get().modeDurations,
            [mode]: next,
          },
        });
      },
      setFocusDurationPreset: (mode, preset) => {
        const current = get().modeDurations[mode];
        get().updateModeDurations(mode, applyFocusPreset(preset, current.focusDurationMinutes));
      },
      setBreakDurationPreset: (mode, preset) => {
        const current = get().modeDurations[mode];
        get().updateModeDurations(mode, applyBreakPreset(preset, current.breakDurationMinutes));
      },
      startFocus: () => {
        const blockMode = get().mode;
        if (!isActiveBlockMode(blockMode)) return;
        const now = new Date().toISOString();
        const session: BlockSession = {
          id: generateId(),
          mode: blockMode,
          startedAt: now,
          breaks: [],
          pausedMs: 0,
        };
        set({
          ...clearTimerState,
          focusStartedAt: now,
          phaseStartedAt: now,
          timerPhase: 'focus',
          sessions: [session, ...get().sessions],
        });
      },
      endSession: (sessionId) => {
        const { sessions, focusStartedAt, sessionPausedMs } = get();
        const target = sessions.find((s) => s.id === sessionId);
        if (!target || target.endedAt) return;
        set({
          sessions: sessions.map((s) =>
            s.id === sessionId
              ? { ...s, endedAt: new Date().toISOString(), pausedMs: sessionPausedMs }
              : s,
          ),
          ...(focusStartedAt ? clearTimerState : {}),
        });
      },
      removeSession: (sessionId) => {
        const { sessions, focusStartedAt } = get();
        const target = sessions.find((s) => s.id === sessionId);
        const wasActive = !!target && !target.endedAt;
        set({
          sessions: sessions.filter((s) => s.id !== sessionId),
          ...(wasActive ? { ...clearTimerState, mode: 'off' as BlockMode } : {}),
        });
      },
      endFocus: () => {
        const state = get();
        const open = state.sessions.find((s) => !s.endedAt);
        if (!open) {
          set(clearTimerState);
          return;
        }
        let sessions = state.sessions;
        if (state.breakStartedAt) {
          sessions = appendCompletedBreak(sessions, state.breakStartedAt);
          set({ sessions, breakStartedAt: null });
        }
        get().endSession(open.id);
      },
      pauseTimer: () => {
        if (!get().phaseStartedAt || get().pausedAt) return;
        set({ pausedAt: new Date().toISOString() });
      },
      resumeTimer: () => {
        const { pausedAt, accumulatedPauseMs, sessionPausedMs } = get();
        if (!pausedAt) return;
        const delta = Date.now() - new Date(pausedAt).getTime();
        set({
          pausedAt: null,
          accumulatedPauseMs: accumulatedPauseMs + delta,
          sessionPausedMs: sessionPausedMs + delta,
        });
      },
      startBreakPhase: () => {
        const { timerPhase, phaseStartedAt, breakStartedAt } = get();
        if (!phaseStartedAt || timerPhase === 'break') return;
        const now = new Date().toISOString();
        set({
          timerPhase: 'break',
          phaseStartedAt: now,
          pausedAt: null,
          accumulatedPauseMs: 0,
          breakStartedAt: breakStartedAt ?? now,
        });
      },
      startNextFocusPhase: () => {
        const state = get();
        let sessions = state.sessions;
        if (state.breakStartedAt) {
          sessions = appendCompletedBreak(sessions, state.breakStartedAt);
        }
        const now = new Date().toISOString();
        set({
          sessions,
          timerPhase: 'focus',
          phaseStartedAt: now,
          pausedAt: null,
          accumulatedPauseMs: 0,
          breakStartedAt: null,
        });
      },
      skipToBreak: () => {
        get().startBreakPhase();
      },
      logOverride: (mode, reason, durationMinutes) => {
        const state = get();
        let sessions = state.sessions;
        if (state.breakStartedAt) {
          sessions = appendCompletedBreak(sessions, state.breakStartedAt);
        }
        const override: BlockOverride = {
          id: generateId(),
          mode,
          reason,
          durationMinutes,
          timestamp: new Date().toISOString(),
        };
        set({
          sessions,
          overrides: [override, ...state.overrides],
          mode: 'off',
          ...clearTimerState,
        });
      },
      updateSchedule: (patch) => set({ schedule: { ...get().schedule, ...patch } }),
    }),
    {
      name: 'qadr-block',
      storage: createPersistStorage(),
      merge: (persisted, current) => {
        const p = persisted as Partial<BlockState> | undefined;
        const settings = useSettingsStore.getState();
        const modeDurations = p?.modeDurations?.work
          ? p.modeDurations
          : createModeDurationsFromLegacy(
              settings.focusDurationMinutes,
              settings.breakDurationMinutes,
            );
        return { ...current, ...p, modeDurations };
      },
    },
  ),
);
