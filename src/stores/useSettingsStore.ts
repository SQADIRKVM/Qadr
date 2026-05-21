import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LifestyleMode } from '../types';
import { clampBreakMinutes, clampFocusMinutes } from '../utils/focusTimer';
import { createPersistStorage } from './storage';

export type SyncFrequency = 'continuous' | 'hourly' | 'daily';
export type FocusDurationPreset = '25' | '45' | 'custom';
export type BreakDurationPreset = '5' | '10' | 'custom';
export type AppLocale = 'en' | 'ar' | 'system';
export type TextScale = 'default' | 'large';
export type AppearanceMode = 'dark' | 'light';

interface SettingsState {
  userName: string;
  mode: LifestyleMode;
  bedtime: string;
  studyTarget: string;
  nightAuto: boolean;
  deviceName: string;
  syncFrequency: SyncFrequency;
  hapticsEnabled: boolean;
  focusDurationMinutes: number;
  breakDurationMinutes: number;
  focusDurationPreset: FocusDurationPreset;
  breakDurationPreset: BreakDurationPreset;
  locale: AppLocale;
  textScale: TextScale;
  appearance: AppearanceMode;
  _hasHydrated: boolean;
  setUserName: (name: string) => void;
  setMode: (mode: LifestyleMode) => void;
  setBedtime: (time: string) => void;
  setStudyTarget: (target: string) => void;
  setNightAuto: (v: boolean) => void;
  setDeviceName: (name: string) => void;
  setSyncFrequency: (freq: SyncFrequency) => void;
  setHapticsEnabled: (v: boolean) => void;
  setFocusDurationPreset: (preset: FocusDurationPreset) => void;
  setBreakDurationPreset: (preset: BreakDurationPreset) => void;
  setFocusDurationMinutes: (minutes: number) => void;
  setBreakDurationMinutes: (minutes: number) => void;
  setLocale: (locale: AppLocale) => void;
  setTextScale: (scale: TextScale) => void;
  setAppearance: (appearance: AppearanceMode) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      userName: 'QADIR',
      mode: 'founder',
      bedtime: '23:30',
      studyTarget: '',
      nightAuto: true,
      deviceName: '',
      locale: 'system',
      textScale: 'default',
      appearance: 'dark',
      syncFrequency: 'continuous',
      hapticsEnabled: true,
      focusDurationMinutes: 25,
      breakDurationMinutes: 5,
      focusDurationPreset: '25',
      breakDurationPreset: '5',
      _hasHydrated: false,
      setUserName: (userName) => set({ userName }),
      setMode: (mode) => set({ mode }),
      setBedtime: (bedtime) => set({ bedtime }),
      setStudyTarget: (studyTarget) => set({ studyTarget }),
      setNightAuto: (nightAuto) => set({ nightAuto }),
      setDeviceName: (deviceName) => set({ deviceName }),
      setSyncFrequency: (syncFrequency) => set({ syncFrequency }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setFocusDurationPreset: (focusDurationPreset) => {
        const minutes =
          focusDurationPreset === '25' ? 25 : focusDurationPreset === '45' ? 45 : get().focusDurationMinutes;
        set({
          focusDurationPreset,
          focusDurationMinutes: clampFocusMinutes(minutes),
        });
      },
      setBreakDurationPreset: (breakDurationPreset) => {
        const minutes =
          breakDurationPreset === '5' ? 5 : breakDurationPreset === '10' ? 10 : get().breakDurationMinutes;
        set({
          breakDurationPreset,
          breakDurationMinutes: clampBreakMinutes(minutes),
        });
      },
      setFocusDurationMinutes: (minutes) =>
        set({
          focusDurationMinutes: clampFocusMinutes(minutes),
          focusDurationPreset: 'custom',
        }),
      setBreakDurationMinutes: (minutes) =>
        set({
          breakDurationMinutes: clampBreakMinutes(minutes),
          breakDurationPreset: 'custom',
        }),
      setLocale: (locale) => set({ locale }),
      setTextScale: (textScale) => set({ textScale }),
      setAppearance: (appearance) => set({ appearance }),
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
    }),
    {
      name: 'qadr-settings',
      storage: createPersistStorage(),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
