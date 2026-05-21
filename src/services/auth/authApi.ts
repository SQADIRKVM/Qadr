import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  getMultiFactorResolver,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  type MultiFactorError,
} from 'firebase/auth';
import { MfaRequiredError } from './mfa';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirebaseAuth, isFirebaseConfigured } from '../../lib/firebase';
import { isSupabaseConfigured } from '../../lib/supabase';

let googleSignInConfigured = false;

function configureGoogleSignIn(): void {
  if (googleSignInConfigured || Platform.OS === 'web') return;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
  if (!webClientId) {
    throw new Error(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is required for Google sign-in on native.',
    );
  }
  GoogleSignin.configure({ webClientId });
  googleSignInConfigured = true;
}

export function isAuthConfigured(): boolean {
  return isFirebaseConfigured() && isSupabaseConfigured();
}

async function refreshFirebaseIdToken(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (user) {
    await user.getIdToken(true);
  }
}

function throwIfMfaRequired(error: unknown): never {
  const fb = error as MultiFactorError;
  if (fb?.code === 'auth/multi-factor-auth-required') {
    const resolver = getMultiFactorResolver(getFirebaseAuth(), fb);
    throw new MfaRequiredError(resolver);
  }
  throw error;
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();

  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      await refreshFirebaseIdToken();
    } catch (e) {
      throwIfMfaRequired(e);
    }
    return;
  }

  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success' || !result.data.idToken) {
    throw new Error('Google sign-in was cancelled or failed.');
  }
  const credential = GoogleAuthProvider.credential(result.data.idToken);
  try {
    await signInWithCredential(auth, credential);
    await refreshFirebaseIdToken();
  } catch (e) {
    throwIfMfaRequired(e);
  }
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (Platform.OS !== 'web') {
    try {
      await GoogleSignin.signOut();
    } catch {
      /* not signed in with Google SDK */
    }
  }
  await firebaseSignOut(auth);
}
