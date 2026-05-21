import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
  differenceInDays,
  format,
  isToday,
  startOfDay,
  getHours,
} from 'date-fns';
import type {
  Idea,
  Project,
  ProjectTask,
  SleepLog,
  Habit,
  HabitCompletion,
  BlockSession,
} from '../types';

export const isOneThingMorningDue = (lastSetDate?: string): boolean => {
  if (!lastSetDate) return true;
  const today = format(new Date(), 'yyyy-MM-dd');
  return lastSetDate !== today;
};

export const getGreeting = (userName: string): string => {
  const hour = getHours(new Date());
  const name = userName.toUpperCase();
  if (hour >= 5 && hour < 12) return `GOOD MORNING, ${name}`;
  if (hour >= 12 && hour < 17) return `GOOD AFTERNOON, ${name}`;
  if (hour >= 17 && hour < 22) return `GOOD EVENING, ${name}`;
  return 'STILL AWAKE?';
};

const titleCaseName = (userName: string): string => {
  const trimmed = userName.trim();
  if (!trimmed) return 'Qadir';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

export const getGreetingFriendly = (userName: string): string => {
  const hour = getHours(new Date());
  const name = titleCaseName(userName);
  if (hour >= 5 && hour < 12) return `Good morning, ${name}`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}`;
  if (hour >= 17 && hour < 22) return `Good evening, ${name}`;
  return `Still awake, ${name}?`;
};

export const getIdeasThisWeek = (ideas: Idea[]): number => {
  const now = new Date();
  const interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  return ideas.filter((i) => isWithinInterval(parseISO(i.createdAt), interval)).length;
};

export const getProjectProgress = (project?: Project | null): number => {
  if (!project || project.tasks.length === 0) return 0;
  const done = project.tasks.filter((t) => t.done).length;
  return Math.round((done / project.tasks.length) * 100);
};

export const getGhostTasks = (tasks: ProjectTask[]): ProjectTask[] => {
  const now = new Date();
  return tasks.filter((t) => !t.done && differenceInDays(now, parseISO(t.lastTouched)) >= 7);
};

export const getSleepScoreLatest = (logs: SleepLog[]): number | null => {
  const todayLog = logs.find((l) => l.date === format(new Date(), 'yyyy-MM-dd'));
  return todayLog?.score ?? logs[0]?.score ?? null;
};

export const calculateSleepScore = (
  quality: number,
  sleptAt: string,
  wokeAt: string,
): number => {
  const [sh, sm] = sleptAt.split(':').map(Number);
  const [wh, wm] = wokeAt.split(':').map(Number);
  let sleepMinutes = (wh * 60 + wm) - (sh * 60 + sm);
  if (sleepMinutes < 0) sleepMinutes += 24 * 60;
  const hours = sleepMinutes / 60;
  let score = quality * 8;
  if (hours >= 7 && hours <= 9) score += 20;
  else if (hours >= 6) score += 10;
  if (sh > 1 || (sh === 1 && sm > 30)) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getSleepGrade = (avgScore: number): { grade: 'A' | 'B' | 'C' | 'D'; desc: string } => {
  if (avgScore >= 85) return { grade: 'A', desc: 'recovery on point' };
  if (avgScore >= 70) return { grade: 'B', desc: 'solid but room to tighten bedtime' };
  if (avgScore >= 55) return { grade: 'C', desc: 'inconsistent — protect nights' };
  return { grade: 'D', desc: 'sleep debt building — reset this week' };
};

export const getHabitCompletionRate = (
  habits: Habit[],
  completions: HabitCompletion[],
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily',
): number => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const relevant = habits.filter((h) => h.frequency === frequency);
  if (relevant.length === 0) return 0;
  const done = relevant.filter((h) =>
    completions.some((c) => c.habitId === h.id && c.date === today && !c.skipped),
  ).length;
  return Math.round((done / relevant.length) * 100);
};

export const getStreak = (habitId: string, completions: HabitCompletion[]): number => {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const date = format(d, 'yyyy-MM-dd');
    const done = completions.some((c) => c.habitId === habitId && c.date === date && !c.skipped);
    if (!done) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

export const scoreIdeaPriority = (title: string, category: string, createdAt: string): 'high' | 'low' => {
  const urgent = /urgent|asap|now|launch|revenue|money/i.test(title);
  const age = differenceInDays(new Date(), parseISO(createdAt));
  if (urgent || category === 'business' || category === 'crypto') return 'high';
  if (age > 14) return 'high';
  return 'low';
};

export const getDaysLeft = (project: Project): number => {
  const elapsed = differenceInDays(new Date(), parseISO(project.startDate));
  return Math.max(0, project.targetDays - elapsed);
};

export const isBedtimeLate = (sleptAt: string): boolean => {
  const [h, m] = sleptAt.split(':').map(Number);
  return h > 1 || (h === 1 && m > 30);
};

export const getSleepDurationHours = (sleptAt: string, wokeAt: string): number => {
  const [sh, sm] = sleptAt.split(':').map(Number);
  const [wh, wm] = wokeAt.split(':').map(Number);
  let sleepMinutes = wh * 60 + wm - (sh * 60 + sm);
  if (sleepMinutes < 0) sleepMinutes += 24 * 60;
  return Math.round((sleepMinutes / 60) * 10) / 10;
};

const sessionFocusMinutes = (session: BlockSession): number => {
  if (!session.endedAt) return 0;
  const start = parseISO(session.startedAt).getTime();
  const end = parseISO(session.endedAt).getTime();
  let breakMs = 0;
  for (const b of session.breaks) {
    if (b.endedAt) {
      breakMs += parseISO(b.endedAt).getTime() - parseISO(b.startedAt).getTime();
    }
  }
  return Math.max(0, Math.round((end - start - breakMs) / 60000));
};

export const getTodayFocusHours = (sessions: BlockSession[]): number => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const minutes = sessions
    .filter((s) => format(parseISO(s.startedAt), 'yyyy-MM-dd') === today && s.endedAt)
    .reduce((sum, s) => sum + sessionFocusMinutes(s), 0);
  return Math.round((minutes / 60) * 10) / 10;
};

export const getDailyVitalityPercent = (
  sleepScore: number | null,
  energyToday: number,
): number => {
  const hasSleep = sleepScore !== null;
  const hasEnergy = energyToday > 0;
  if (!hasSleep && !hasEnergy) return 98;
  const sleepPart = hasSleep ? sleepScore! : 70;
  const energyPart = hasEnergy ? (energyToday / 5) * 100 : 50;
  return Math.round(sleepPart * 0.6 + energyPart * 0.4);
};

export const getVitalityStatusLine = (percent: number): string => {
  if (percent >= 85) return 'Looking good today';
  if (percent >= 60) return 'Steady — keep the rhythm';
  return 'Recovery needed';
};

export const getRestQualityLabel = (quality: number): string => {
  if (quality >= 8) return 'High';
  if (quality >= 6) return 'Medium';
  return 'Low';
};

/** 0 = lowest, 4 = peak (white + red overlay in UI) */
export const getEnergyBlockLevels = (energyToday: number): number[] => {
  const peakIndex = Math.min(7, Math.max(0, Math.floor(getHours(new Date()) / 3)));
  const base = energyToday > 0 ? Math.min(4, Math.ceil(energyToday * 0.8)) : 2;
  const pattern = [1, 2, 3, base, base, 3, 2, 1];
  const levels = [...pattern];
  levels[peakIndex] = Math.max(levels[peakIndex], Math.min(4, base + 1));
  if (energyToday >= 4) {
    levels[peakIndex] = 4;
    if (peakIndex > 0) levels[peakIndex - 1] = Math.max(levels[peakIndex - 1], 3);
  }
  return levels;
};

export const getWeekNumber = (): number => {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
};
