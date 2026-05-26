import { useEffect } from 'react';
import { Platform } from 'react-native';
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
    
    // Helper to send sync event to browser extension (zero CSP violations)
    const sendSyncEvent = async (user: any | null, isLogout = false) => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const uid = user ? user.uid : null;
        try {
          const token = user ? await user.getIdToken() : null;
          window.postMessage({ type: "QADR_AUTH_SYNC", uid, token, logout: isLogout }, "*");
        } catch (e) {
          console.error("Failed to get ID token for extension sync:", e);
          window.postMessage({ type: "QADR_AUTH_SYNC", uid, token: null, logout: isLogout }, "*");
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAuthReady(true);
      if (user) {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('qadr-auth-uid', user.uid);
          try {
            const token = await user.getIdToken();
            window.localStorage.setItem('qadr-auth-token', token);
          } catch (e) {
            console.error("Failed to store Qadr auth token:", e);
          }
          await sendSyncEvent(user);
        }
      } else {
        useAuthStore.getState().setCloudBootstrapped(false);
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('qadr-auth-uid');
          window.localStorage.removeItem('qadr-auth-token');
          await sendSyncEvent(null, true);
        }
      }
    });

    // Listen for incoming requests from the browser extension
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleRequest = async (event: MessageEvent) => {
        if (event.data && event.data.type === "QADR_AUTH_REQUEST") {
          const user = auth.currentUser;
          await sendSyncEvent(user);
        }
      };
      window.addEventListener("message", handleRequest);
      return () => {
        unsubscribe();
        window.removeEventListener("message", handleRequest);
      };
    }

    return unsubscribe;
  }, []);
}

export function useCloudAuthConfigured(): boolean {
  return isAuthConfigured();
}
