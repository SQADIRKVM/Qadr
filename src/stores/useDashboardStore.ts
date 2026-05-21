import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { MoodLevel } from '../types';
import { getTodayMood as resolveTodayMood } from '../utils/moodLabels';
import { createPersistStorage } from './storage';

export { getTodayMood } from '../utils/moodLabels';

interface DashboardState {
  oneThing: string;
  oneThingDate: string;
  oneThingDone: boolean;
  mood: MoodLevel | null;
  moodTimestamp: string | null;
  energyToday: number;
  energyLog: { date: string; level: number }[];
  setOneThing: (text: string) => void;
  markOneThingDone: () => void;
  setMood: (mood: MoodLevel) => void;
  clearOneThing: () => void;
  setEnergyToday: (level: number) => void;
  getTodayMood: () => MoodLevel | null;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      oneThing: '',
      oneThingDate: '',
      oneThingDone: false,
      mood: null,
      moodTimestamp: null,
      energyToday: 0,
      energyLog: [],
      setOneThing: (text) =>
        set({
          oneThing: text,
          oneThingDate: format(new Date(), 'yyyy-MM-dd'),
          oneThingDone: false,
        }),
      markOneThingDone: () => set({ oneThingDone: true }),
      clearOneThing: () =>
        set({ oneThing: '', oneThingDate: '', oneThingDone: false }),
      setMood: (mood) =>
        set({ mood, moodTimestamp: new Date().toISOString() }),
      getTodayMood: () => resolveTodayMood(get().mood, get().moodTimestamp),
      setEnergyToday: (level) =>
        set((s) => {
          const date = format(new Date(), 'yyyy-MM-dd');
          const energyLog = [
            ...s.energyLog.filter((e) => e.date !== date),
            { date, level },
          ];
          return { energyToday: level, energyLog };
        }),
    }),
    { name: 'qadr-dashboard', storage: createPersistStorage() },
  ),
);
