import { useHabitStore } from '../stores/useHabitStore';
import { useSleepStore } from '../stores/useSleepStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useBlockStore } from '../stores/useBlockStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import {
  getHabitCompletionRate,
  getSleepScoreLatest,
  getProjectProgress,
  getTodayFocusHours,
} from './selectors';

export interface AssistantContextSnapshot {
  habitCompletionPct: number;
  sleepScore: number | null;
  activeProjectName: string | null;
  projectProgressPct: number;
  energyToday: number;
  blockMode: string;
  userName: string;
  oneThing: string;
  oneThingDone: boolean;
  mood: string | null;
  focusMinutesToday: number;
  openTaskCount: number;
}

export function buildAssistantContext(): AssistantContextSnapshot {
  const { habits, completions } = useHabitStore.getState();
  const sleepLogs = useSleepStore.getState().logs;
  const { projects, activeProjectId } = useProjectStore.getState();
  const { energyToday, oneThing, oneThingDone, getTodayMood } = useDashboardStore.getState();
  const { mode: blockMode, sessions } = useBlockStore.getState();
  const userName = useSettingsStore.getState().userName;

  const active = projects.find((p) => p.id === activeProjectId);
  const openTaskCount = active?.tasks.filter((t) => !t.done).length ?? 0;

  return {
    habitCompletionPct: getHabitCompletionRate(habits, completions, 'daily'),
    sleepScore: getSleepScoreLatest(sleepLogs),
    activeProjectName: active?.name ?? null,
    projectProgressPct: getProjectProgress(active),
    energyToday,
    blockMode,
    userName,
    oneThing: oneThing ?? '',
    oneThingDone,
    mood: getTodayMood(),
    focusMinutesToday: Math.round(getTodayFocusHours(sessions) * 60),
    openTaskCount,
  };
}
