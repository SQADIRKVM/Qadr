import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './storage';

interface HealthDeviceState {
  pairedDeviceId: string | null;
  pairedDeviceName: string | null;
  lastHeartRate: number | null;
  connected: boolean;
  lastSyncAt: string | null;
  setPairedDevice: (id: string | null, name: string | null) => void;
  setLastHeartRate: (bpm: number | null) => void;
  setConnected: (v: boolean) => void;
  setLastSyncAt: (iso: string | null) => void;
  clearPaired: () => void;
}

export const useHealthDeviceStore = create<HealthDeviceState>()(
  persist(
    (set) => ({
      pairedDeviceId: null,
      pairedDeviceName: null,
      lastHeartRate: null,
      connected: false,
      lastSyncAt: null,
      setPairedDevice: (pairedDeviceId, pairedDeviceName) =>
        set({ pairedDeviceId, pairedDeviceName }),
      setLastHeartRate: (lastHeartRate) => set({ lastHeartRate }),
      setConnected: (connected) => set({ connected }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      clearPaired: () =>
        set({
          pairedDeviceId: null,
          pairedDeviceName: null,
          lastHeartRate: null,
          connected: false,
        }),
    }),
    {
      name: 'qadr-health-device',
      storage: createPersistStorage(),
      partialize: (s) => ({
        pairedDeviceId: s.pairedDeviceId,
        pairedDeviceName: s.pairedDeviceName,
        lastSyncAt: s.lastSyncAt,
      }),
    },
  ),
);
