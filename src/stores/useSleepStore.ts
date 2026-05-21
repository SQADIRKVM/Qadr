import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { SleepLog, NudgeLog } from '../types';
import { generateId } from '../utils/id';
import { calculateSleepScore } from '../utils/selectors';
import { createPersistStorage } from './storage';

export type SleepLogInput = {
  sleptAt: string;
  wokeAt: string;
  quality: number;
  lateReasons: string[];
  nightDistraction: boolean;
};

interface SleepState {
  logs: SleepLog[];
  nudgeLog: NudgeLog[];
  logSleep: (data: SleepLogInput, date?: string) => void;
  updateSleep: (date: string, data: SleepLogInput) => void;
  deleteSleep: (date: string) => void;
  getLogForDate: (date: string) => SleepLog | undefined;
  addNudgeResponse: (response: 'going_now' | 'thirty_more') => void;
}

function buildLog(date: string, data: SleepLogInput, existingId?: string): SleepLog {
  const score = calculateSleepScore(data.quality, data.sleptAt, data.wokeAt);
  return {
    id: existingId ?? generateId(),
    date,
    ...data,
    score,
  };
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      logs: [],
      nudgeLog: [],
      getLogForDate: (date) => get().logs.find((l) => l.date === date),
      logSleep: (data, date = format(new Date(), 'yyyy-MM-dd')) => {
        const existing = get().logs.find((l) => l.date === date);
        const log = buildLog(date, data, existing?.id);
        set({
          logs: [log, ...get().logs.filter((l) => l.date !== date)],
        });
      },
      updateSleep: (date, data) => {
        get().logSleep(data, date);
      },
      deleteSleep: (date) => {
        set({ logs: get().logs.filter((l) => l.date !== date) });
      },
      addNudgeResponse: (response) => {
        const entry = {
          id: generateId(),
          response,
          timestamp: new Date().toISOString(),
        };
        set({ nudgeLog: [entry, ...get().nudgeLog] });
      },
    }),
    { name: 'qadr-sleep', storage: createPersistStorage() },
  ),
);
