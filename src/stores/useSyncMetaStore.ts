import { create } from 'zustand';

interface SyncMetaState {
  lastSyncedAt: string | null;
  syncing: boolean;
  syncError: string | null;
  pendingCount: number;
  isOnline: boolean;
  setLastSyncedAt: (v: string | null) => void;
  setSyncing: (v: boolean) => void;
  setSyncError: (v: string | null) => void;
  setPendingCount: (n: number) => void;
  setIsOnline: (v: boolean) => void;
}

export const useSyncMetaStore = create<SyncMetaState>((set) => ({
  lastSyncedAt: null,
  syncing: false,
  syncError: null,
  pendingCount: 0,
  isOnline: true,
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setSyncing: (syncing) => set({ syncing }),
  setSyncError: (syncError) => set({ syncError }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsOnline: (isOnline) => set({ isOnline }),
}));
