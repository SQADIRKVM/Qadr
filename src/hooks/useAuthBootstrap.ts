import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { isAuthConfigured } from '../services/auth/authApi';
import { useAuthStore } from '../stores/useAuthStore';

export function useAuthBootstrap(): void {
  useEffect(() => {
    if (!isAuthConfigured()) {
      useAuthStore.getState().setAuthReady(true);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAuthReady(true);
      if (!user) {
        useAuthStore.getState().setCloudBootstrapped(false);
      }
    });

    return unsubscribe;
  }, []);
}

export function useCloudAuthConfigured(): boolean {
  return isAuthConfigured();
}
