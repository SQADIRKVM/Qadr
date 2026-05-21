import { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAuthStore } from '../stores/useAuthStore';
import { isAuthConfigured } from '../services/auth/authApi';

export const useStoreHydration = (): boolean => {
  const hasHydrated = useSettingsStore((s) => s._hasHydrated);
  const authReady = useAuthStore((s) => s.authReady);
  const [ready, setReady] = useState(hasHydrated);

  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => {
      useSettingsStore.getState().setHasHydrated(true);
      setReady(true);
    });
    if (useSettingsStore.persist.hasHydrated()) {
      useSettingsStore.getState().setHasHydrated(true);
      setReady(true);
    }
    return unsub;
  }, []);

  if (!ready) return false;
  if (isAuthConfigured() && !authReady) return false;
  return true;
};
