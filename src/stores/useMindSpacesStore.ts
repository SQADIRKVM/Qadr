import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MindSpace } from '../types';
import { generateId } from '../utils/id';
import { createPersistStorage } from './storage';

interface MindSpacesState {
  spaces: MindSpace[];
  addSpace: (name: string) => string;
  renameSpace: (id: string, name: string) => void;
  removeSpace: (id: string) => void;
}

export const useMindSpacesStore = create<MindSpacesState>()(
  persist(
    (set, get) => ({
      spaces: [],
      addSpace: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        const space: MindSpace = {
          id: generateId(),
          name: trimmed,
          createdAt: new Date().toISOString(),
        };
        set({ spaces: [...get().spaces, space] });
        return space.id;
      },
      renameSpace: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set({
          spaces: get().spaces.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
        });
      },
      removeSpace: (id) => {
        set({ spaces: get().spaces.filter((s) => s.id !== id) });
      },
    }),
    { name: 'qadr-mind-spaces', storage: createPersistStorage() },
  ),
);
