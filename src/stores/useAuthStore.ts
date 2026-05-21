import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  authReady: boolean;
  cloudBootstrapped: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (v: boolean) => void;
  setCloudBootstrapped: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authReady: false,
  cloudBootstrapped: false,
  setUser: (user) => set({ user }),
  setAuthReady: (authReady) => set({ authReady }),
  setCloudBootstrapped: (cloudBootstrapped) => set({ cloudBootstrapped }),
}));

/** Firebase UID for cloud sync. */
export const selectAuthUserId = (s: AuthState): string | undefined => s.user?.uid;
