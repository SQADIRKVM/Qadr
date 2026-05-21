import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Decision, DecisionStatus } from '../types';
import { generateId } from '../utils/id';
import { createPersistStorage } from './storage';

interface DecisionState {
  decisions: Decision[];
  addDecision: (data: {
    title: string;
    reasoning: string;
    deadline: string;
    confidence: number;
  }) => void;
  revisitDecision: (
    id: string,
    outcome: string,
    wasRight: 'yes' | 'no' | 'unsure',
  ) => void;
  updateStatus: (id: string, status: DecisionStatus) => void;
  markDecided: (id: string) => void;
}

export const useDecisionStore = create<DecisionState>()(
  persist(
    (set, get) => ({
      decisions: [],
      addDecision: (data) => {
        const decision: Decision = {
          id: generateId(),
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set({ decisions: [decision, ...get().decisions] });
      },
      revisitDecision: (id, outcome, wasRight) =>
        set({
          decisions: get().decisions.map((d) =>
            d.id === id
              ? {
                  ...d,
                  outcome,
                  wasRight,
                  status: 'revisited' as DecisionStatus,
                  revisitedAt: new Date().toISOString(),
                }
              : d,
          ),
        }),
      updateStatus: (id, status) =>
        set({
          decisions: get().decisions.map((d) =>
            d.id === id ? { ...d, status } : d,
          ),
        }),
      markDecided: (id) =>
        set({
          decisions: get().decisions.map((d) =>
            d.id === id && d.status === 'pending' ? { ...d, status: 'decided' as DecisionStatus } : d,
          ),
        }),
    }),
    { name: 'qadr-decisions', storage: createPersistStorage() },
  ),
);
