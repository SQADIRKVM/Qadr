import { useEffect } from 'react';
import { isBleSupported, reconnectPairedDevice } from '../services/health/bleDevice';
import { useHealthDeviceStore } from '../stores/useHealthDeviceStore';

/** Reconnect persisted BLE heart rate accessory after app launch. */
export function useHealthDeviceBootstrap(): void {
  const pairedId = useHealthDeviceStore((s) => s.pairedDeviceId);

  useEffect(() => {
    if (!isBleSupported() || !pairedId) return;
    void reconnectPairedDevice();
  }, [pairedId]);
}
