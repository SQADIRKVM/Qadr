import { getFirebaseAuth } from '../../lib/firebase';
import { getSupabase } from '../../lib/supabase';
import { signOut } from '../auth/authApi';
import { deleteAllSessionsForUser } from './sessions';

export async function deleteAccountAndCloudData(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  await supabase.from('sync_domains').delete().eq('user_id', userId);
  await deleteAllSessionsForUser(userId);
  await supabase.from('profiles').delete().eq('id', userId);

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No signed-in user');

  try {
    await user.delete();
  } catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
    if (code === 'auth/requires-recent-login') {
      throw new Error(
        'For security, sign in with Google again, then retry delete account.',
      );
    }
    throw e instanceof Error ? e : new Error('Could not delete Firebase account.');
  }

  await signOut();
}
