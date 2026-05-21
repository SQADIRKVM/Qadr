import type { BlockMode } from '../types';
import type { BreakDurationPreset, FocusDurationPreset } from '../stores/useSettingsStore';
import { clampBreakMinutes, clampFocusMinutes } from './focusTimer';

export type ActiveBlockMode = 'work' | 'exam' | 'night';

export interface ModeDurationSettings {
  focusDurationMinutes: number;
  breakDurationMinutes: number;
  focusDurationPreset: FocusDurationPreset;
  breakDurationPreset: BreakDurationPreset;
}

export const DEFAULT_MODE_DURATIONS: Record<ActiveBlockMode, ModeDurationSettings> = {
  work: {
    focusDurationMinutes: 25,
    breakDurationMinutes: 5,
    focusDurationPreset: '25',
    breakDurationPreset: '5',
  },
  exam: {
    focusDurationMinutes: 45,
    breakDurationMinutes: 10,
    focusDurationPreset: '45',
    breakDurationPreset: '10',
  },
  night: {
    focusDurationMinutes: 25,
    breakDurationMinutes: 5,
    focusDurationPreset: '25',
    breakDurationPreset: '5',
  },
};

export function isActiveBlockMode(mode: BlockMode): mode is ActiveBlockMode {
  return mode === 'work' || mode === 'exam' || mode === 'night';
}

export function createModeDurationsFromLegacy(
  focusMinutes?: number,
  breakMinutes?: number,
): Record<ActiveBlockMode, ModeDurationSettings> {
  const focus = clampFocusMinutes(focusMinutes ?? 25);
  const breakM = clampBreakMinutes(breakMinutes ?? 5);
  return {
    work: {
      ...DEFAULT_MODE_DURATIONS.work,
      focusDurationMinutes: focus,
      breakDurationMinutes: breakM,
      focusDurationPreset: focus === 25 ? '25' : focus === 45 ? '45' : 'custom',
      breakDurationPreset: breakM === 5 ? '5' : breakM === 10 ? '10' : 'custom',
    },
    exam: { ...DEFAULT_MODE_DURATIONS.exam },
    night: { ...DEFAULT_MODE_DURATIONS.night },
  };
}

export interface FocusModeMeta {
  id: BlockMode;
  label: string;
  description: string;
  icon: 'power-settings-new' | 'work-outline' | 'school' | 'bedtime';
}

export const FOCUS_MODES: FocusModeMeta[] = [
  {
    id: 'off',
    label: 'Off',
    description: 'No blocking log',
    icon: 'power-settings-new',
  },
  {
    id: 'work',
    label: 'Work',
    description: 'Deep work blocks',
    icon: 'work-outline',
  },
  {
    id: 'exam',
    label: 'Exam',
    description: 'Study lock-in',
    icon: 'school',
  },
  {
    id: 'night',
    label: 'Night',
    description: 'Wind-down mode',
    icon: 'bedtime',
  },
];

export const getFocusModeMeta = (mode: BlockMode): FocusModeMeta =>
  FOCUS_MODES.find((m) => m.id === mode) ?? FOCUS_MODES[0];
