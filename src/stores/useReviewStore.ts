import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeeklyReview } from '../types';
import { generateId } from '../utils/id';
import { createPersistStorage } from './storage';

interface ReviewState {
  weeklyReviews: WeeklyReview[];
  addReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      weeklyReviews: [],
      addReview: (review) => {
        const entry: WeeklyReview = {
          id: generateId(),
          ...review,
          createdAt: new Date().toISOString(),
        };
        const weeklyReviews = [entry, ...get().weeklyReviews].slice(0, 8);
        set({ weeklyReviews });
      },
    }),
    { name: 'qadr-reviews', storage: createPersistStorage() },
  ),
);
