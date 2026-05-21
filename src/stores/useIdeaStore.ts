import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Idea, IdeaCategory, IdeaStatus } from '../types';
import { generateId } from '../utils/id';
import { scoreIdeaPriority } from '../utils/selectors';
import { createPersistStorage } from './storage';
import { useProjectStore } from './useProjectStore';

export type IdeaFilter = 'all' | 'locked' | 'sunday' | 'in_progress' | 'archived';

interface IdeaState {
  ideas: Idea[];
  filter: IdeaFilter;
  addIdea: (data: {
    title: string;
    description?: string;
    category: IdeaCategory;
    lock24h: boolean;
    sundayReview: boolean;
  }) => void;
  updateIdea: (id: string, patch: Partial<Idea>) => void;
  setFilter: (filter: IdeaFilter) => void;
  archiveIdea: (id: string) => void;
  moveToProject: (id: string) => void;
  addFromBrainDump: (title: string) => void;
}

export const useIdeaStore = create<IdeaState>()(
  persist(
    (set, get) => ({
      ideas: [],
      filter: 'all',
      addIdea: ({ title, description, category, lock24h, sundayReview }) => {
        const now = new Date().toISOString();
        const lockedUntil = lock24h
          ? new Date(Date.now() + 86400000).toISOString()
          : undefined;
        const idea: Idea = {
          id: generateId(),
          title,
          description,
          category,
          priority: scoreIdeaPriority(title, category, now),
          status: lock24h ? 'locked' : sundayReview ? 'sunday' : 'active',
          lockedUntil,
          sundayReview,
          createdAt: now,
          updatedAt: now,
        };
        set({ ideas: [idea, ...get().ideas] });
      },
      updateIdea: (id, patch) =>
        set({
          ideas: get().ideas.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
          ),
        }),
      setFilter: (filter) => set({ filter }),
      archiveIdea: (id) =>
        set({
          ideas: get().ideas.map((i) =>
            i.id === id ? { ...i, status: 'archived' as IdeaStatus } : i,
          ),
        }),
      moveToProject: (id) => {
        const idea = get().ideas.find((i) => i.id === id);
        if (!idea) return;
        useProjectStore.getState().promoteIdeaToProject(idea.title);
        set({
          ideas: get().ideas.map((i) =>
            i.id === id
              ? { ...i, status: 'in_progress' as IdeaStatus, updatedAt: new Date().toISOString() }
              : i,
          ),
        });
      },
      addFromBrainDump: (title) => {
        get().addIdea({
          title,
          category: 'other',
          lock24h: false,
          sundayReview: false,
        });
      },
    }),
    { name: 'qadr-ideas', storage: createPersistStorage() },
  ),
);
