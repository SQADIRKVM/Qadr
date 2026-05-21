import { useCallback } from 'react';
import { useRootTabNavigation } from './useRootTabNavigation';
import { useAuthStore } from '../stores/useAuthStore';
import { signOut } from '../services/auth/authApi';
import { confirmAction } from '../utils/confirmAction';

/** Cross-tab navigation to Account / Settings and sign-out (same as Account screen). */
export function useAccountMenuActions() {
  const { tabNavigation } = useRootTabNavigation();

  const openAccount = useCallback(() => {
    tabNavigation?.navigate('Home', { screen: 'Account' });
  }, [tabNavigation]);

  const openSettings = useCallback(() => {
    tabNavigation?.navigate('Home', { screen: 'Settings' });
  }, [tabNavigation]);

  const signOutUser = useCallback(() => {
    confirmAction(
      'Sign out',
      'Sign out on this device?',
      async () => {
        await signOut();
        useAuthStore.getState().setCloudBootstrapped(false);
      },
      { confirmLabel: 'Sign out' },
    );
  }, []);

  return { openAccount, openSettings, signOut: signOutUser };
}
