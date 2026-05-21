import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  TotpMultiFactorGenerator,
  TotpSecret,
  multiFactor,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type MultiFactorResolver,
  type User,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirebaseAuth } from '../../lib/firebase';

export class MfaRequiredError extends Error {
  readonly resolver: MultiFactorResolver;

  constructor(resolver: MultiFactorResolver) {
    super('Multi-factor authentication required');
    this.name = 'MfaRequiredError';
    this.resolver = resolver;
  }
}

export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  return error instanceof MfaRequiredError;
}

/** User-facing message for Firebase MFA errors (e.g. TOTP not enabled in console). */
export function formatMfaError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/operation-not-allowed') {
    return (
      'Authenticator (TOTP) two-factor is not enabled for this Firebase project. ' +
      'In Firebase Console → Authentication → Sign-in method, upgrade to Identity Platform, ' +
      'then enable Multi-factor authentication → Authenticator app (TOTP).'
    );
  }
  if (code === 'auth/requires-recent-login') {
    return 'For security, sign out and sign in again, then retry enabling two-factor.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Could not complete two-factor setup. Try again.';
}

export function getTotpEnrollment(user: User | null): { enrolled: boolean; uid?: string } {
  if (!user) return { enrolled: false };
  const factor = multiFactor(user).enrolledFactors.find(
    (f) => f.factorId === TotpMultiFactorGenerator.FACTOR_ID,
  );
  return factor ? { enrolled: true, uid: factor.uid } : { enrolled: false };
}

export async function reauthenticateCurrentUser(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to continue.');

  if (Platform.OS === 'web') {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
    return;
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
  if (!webClientId) {
    throw new Error('Google client ID is not configured.');
  }
  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success' || !result.data.idToken) {
    throw new Error('Google re-authentication was cancelled.');
  }
  const credential = GoogleAuthProvider.credential(result.data.idToken);
  await reauthenticateWithCredential(user, credential);
}

export async function startTotpEnrollment(): Promise<{
  secret: TotpSecret;
  qrUrl: string;
}> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to enable two-factor authentication.');

  try {
    const session = await multiFactor(user).getSession();
    const secret = await TotpMultiFactorGenerator.generateSecret(session);
    const accountName = user.email ?? user.uid;
    const qrUrl = secret.generateQrCodeUrl(accountName, 'Qadr');
    return { secret, qrUrl };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/requires-recent-login') {
      await reauthenticateCurrentUser();
      const session = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      const accountName = user.email ?? user.uid;
      const qrUrl = secret.generateQrCodeUrl(accountName, 'Qadr');
      return { secret, qrUrl };
    }
    throw e;
  }
}

export async function completeTotpEnrollment(
  secret: TotpSecret,
  oneTimePassword: string,
): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to enable two-factor authentication.');

  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
    secret,
    oneTimePassword.trim(),
  );
  await multiFactor(user).enroll(assertion, 'Authenticator app');
}

export async function unenrollTotp(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to manage two-factor authentication.');

  const { uid } = getTotpEnrollment(user);
  if (!uid) return;

  try {
    await multiFactor(user).unenroll(uid);
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/requires-recent-login') {
      await reauthenticateCurrentUser();
      await multiFactor(user).unenroll(uid);
      return;
    }
    throw e;
  }
}

export async function resolveTotpSignIn(
  resolver: MultiFactorResolver,
  oneTimePassword: string,
): Promise<void> {
  const hint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  if (!hint) {
    throw new Error('No authenticator factor found for this account.');
  }
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(
    hint.uid,
    oneTimePassword.trim(),
  );
  await resolver.resolveSignIn(assertion);
}
