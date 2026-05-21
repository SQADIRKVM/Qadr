import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectTask, PostMortem, ProjectStatus } from '../types';
import { generateId } from '../utils/id';
import { createPersistStorage } from './storage';

interface ProjectState {
  activeProjectId: string | null;
  projects: Project[];
  queue: string[];
  postMortems: PostMortem[];
  setActiveProject: (id: string) => void;
  addProject: (data: { name: string; tagline: string; targetDays: number }) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addTask: (projectId: string, title: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  touchTask: (projectId: string, taskId: string) => void;
  reorderQueue: (ids: string[]) => void;
  pauseProject: (id: string) => void;
  completeOrKill: (
    id: string,
    status: 'completed' | 'killed',
    mortem: Omit<PostMortem, 'id' | 'createdAt'>,
  ) => void;
  addTaskFromBrainDump: (title: string) => void;
  addTaskFromIdea: (title: string) => void;
  /** Adds task to active project, or creates a new active project with that task. */
  promoteIdeaToProject: (title: string) => string;
}

const touch = (t: ProjectTask): ProjectTask => ({
  ...t,
  lastTouched: new Date().toISOString(),
});

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      activeProjectId: null,
      projects: [],
      queue: [],
      postMortems: [],
      setActiveProject: (id) => {
        set({
          activeProjectId: id,
          projects: get().projects.map((p) =>
            p.id === id
              ? { ...p, status: 'active' as ProjectStatus }
              : p.status === 'active'
                ? { ...p, status: 'queued' as ProjectStatus }
                : p,
          ),
        });
      },
      addProject: ({ name, tagline, targetDays }) => {
        const project: Project = {
          id: generateId(),
          name,
          tagline,
          status: 'queued',
          targetDays,
          startDate: new Date().toISOString(),
          tasks: [],
          quickNote: '',
          createdAt: new Date().toISOString(),
        };
        set({
          projects: [...get().projects, project],
          queue: [...get().queue, project.id],
        });
      },
      updateProject: (id, patch) =>
        set({
          projects: get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      addTask: (projectId, title) => {
        const now = new Date().toISOString();
        const task: ProjectTask = {
          id: generateId(),
          title,
          done: false,
          lastTouched: now,
          createdAt: now,
        };
        set({
          projects: get().projects.map((p) =>
            p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p,
          ),
        });
      },
      toggleTask: (projectId, taskId) =>
        set({
          projects: get().projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? touch({ ...t, done: !t.done }) : t,
                  ),
                }
              : p,
          ),
        }),
      touchTask: (projectId, taskId) =>
        set({
          projects: get().projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? touch(t) : t)) }
              : p,
          ),
        }),
      reorderQueue: (queue) => set({ queue }),
      pauseProject: (id) =>
        set({
          activeProjectId: get().activeProjectId === id ? null : get().activeProjectId,
          projects: get().projects.map((p) =>
            p.id === id ? { ...p, status: 'paused' as ProjectStatus } : p,
          ),
        }),
      completeOrKill: (id, status, mortem) => {
        const mortemEntry: PostMortem = {
          id: generateId(),
          ...mortem,
          createdAt: new Date().toISOString(),
        };
        set({
          activeProjectId: get().activeProjectId === id ? null : get().activeProjectId,
          postMortems: [mortemEntry, ...get().postMortems],
          projects: get().projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: status as ProjectStatus,
                  completedAt: new Date().toISOString(),
                }
              : p,
          ),
          queue: get().queue.filter((qid) => qid !== id),
        });
      },
      addTaskFromBrainDump: (title) => {
        const activeId = get().activeProjectId;
        if (activeId) get().addTask(activeId, title);
      },
      addTaskFromIdea: (title) => {
        get().promoteIdeaToProject(title);
      },
      promoteIdeaToProject: (title) => {
        const trimmed = title.trim() || 'New idea';
        const activeId = get().activeProjectId;
        if (activeId) {
          get().addTask(activeId, trimmed);
          return activeId;
        }
        const now = new Date().toISOString();
        const projectId = generateId();
        const taskId = generateId();
        const project: Project = {
          id: projectId,
          name: trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed,
          tagline: 'From idea vault',
          status: 'active',
          targetDays: 30,
          startDate: now,
          tasks: [
            {
              id: taskId,
              title: trimmed,
              done: false,
              lastTouched: now,
              createdAt: now,
            },
          ],
          quickNote: '',
          createdAt: now,
        };
        set({
          activeProjectId: projectId,
          projects: [
            ...get().projects.map((p) =>
              p.status === 'active' ? { ...p, status: 'queued' as ProjectStatus } : p,
            ),
            project,
          ],
          queue: get().queue.includes(projectId)
            ? get().queue
            : [...get().queue, projectId],
        });
        return projectId;
      },
    }),
    { name: 'qadr-projects', storage: createPersistStorage() },
  ),
);
