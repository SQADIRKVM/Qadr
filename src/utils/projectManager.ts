import type { ProjectTask } from '../types';
import { getGhostTasks } from './selectors';

export type TaskDisplayTag = 'critical' | 'blocker';

export function getProgressSegments(percent: number, total = 10): number {
  const clamped = Math.min(100, Math.max(0, percent));
  return Math.round((clamped / 100) * total);
}

export function getTaskDisplayTag(
  task: ProjectTask,
  allTasks: ProjectTask[],
): TaskDisplayTag | null {
  const ghosts = getGhostTasks(allTasks);
  if (ghosts.some((g) => g.id === task.id)) return 'blocker';

  const firstOpen = allTasks.find((t) => !t.done && !ghosts.some((g) => g.id === t.id));
  if (firstOpen?.id === task.id) return 'critical';

  return null;
}

export function getQueueCapacityLabel(queueCount: number, hasActive: boolean): string {
  const load = queueCount + (hasActive ? 1 : 0);
  if (load <= 2) return 'Optimal';
  if (load <= 4) return 'Busy';
  return 'Full';
}
