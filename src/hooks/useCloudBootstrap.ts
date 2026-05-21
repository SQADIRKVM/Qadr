import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { runCloudBootstrap } from '../services/sync/bootstrap';
import { isAuthConfigured } from '../services/auth/authApi';
import { selectAuthUserId } from '../stores/useAuthStore';

export function useCloudBootstrap(): void {
  const userId = useAuthStore(selectAuthUserId);
  const authReady = useAuthStore((s) => s.authReady);
  const cloudBootstrapped = useAuthStore((s) => s.cloudBootstrapped);

  useEffect(() => {
    if (!isAuthConfigured() || !authReady || !userId || cloudBootstrapped) return;

    let cancelled = false;
    runCloudBootstrap(userId)
      .then(() => {
        if (!cancelled) useAuthStore.getState().setCloudBootstrapped(true);
      })
      .catch(() => {
        if (!cancelled) useAuthStore.getState().setCloudBootstrapped(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, authReady, cloudBootstrapped]);
}
