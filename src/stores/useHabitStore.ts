import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { Habit, HabitCompletion, HabitFrequency, SkipReason } from '../types';
import { generateId } from '../utils/id';
import { createPersistStorage } from './storage';

interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  frequencyView: HabitFrequency;
  addHabit: (data: {
    name: string;
    icon: string;
    frequency: HabitFrequency;
    reminderTime?: string;
    startDate: string;
  }) => void;
  toggleHabit: (habitId: string, date?: string) => void;
  skipHabit: (habitId: string, reason: SkipReason, date?: string) => void;
  setFrequencyView: (f: HabitFrequency) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: [],
      frequencyView: 'daily',
      addHabit: (data) => {
        const habit: Habit = {
          id: generateId(),
          ...data,
          createdAt: new Date().toISOString(),
        };
        set({ habits: [...get().habits, habit] });
      },
      toggleHabit: (habitId, date = format(new Date(), 'yyyy-MM-dd')) => {
        const existing = get().completions.find(
          (c) => c.habitId === habitId && c.date === date,
        );
        if (existing && !existing.skipped) {
          set({
            completions: get().completions.filter(
              (c) => !(c.habitId === habitId && c.date === date),
            ),
          });
        } else {
          set({
            completions: [
              ...get().completions.filter(
                (c) => !(c.habitId === habitId && c.date === date),
              ),
              { habitId, date },
            ],
          });
        }
      },
      skipHabit: (habitId, reason, date = format(new Date(), 'yyyy-MM-dd')) => {
        set({
          completions: [
            ...get().completions.filter(
              (c) => !(c.habitId === habitId && c.date === date),
            ),
            { habitId, date, skipped: true, skipReason: reason },
          ],
        });
      },
      setFrequencyView: (frequencyView) => set({ frequencyView }),
    }),
    { name: 'qadr-habits', storage: createPersistStorage() },
  ),
);
