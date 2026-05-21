import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import { AppText } from '../../components/primitives/AppText';
import { AccountProfileHeader } from '../../components/account/AccountProfileHeader';
import { AccountSection, AccountRow } from '../../components/account/AccountSection';
import { SessionRow } from '../../components/account/SessionRow';
import {
  AccountActionRow,
  AccountDangerButton,
} from '../../components/account/AccountActionRow';
import { GoogleLogoIcon } from '../../components/auth/GoogleLogoIcon';
import { useAuthStore, selectAuthUserId } from '../../stores/useAuthStore';
import { useSyncMetaStore } from '../../stores/useSyncMetaStore';
import { signOut } from '../../services/auth/authApi';
import { formatMfaError, getTotpEnrollment, unenrollTotp } from '../../services/auth/mfa';
import { syncNowManual } from '../../hooks/useCloudSync';
import { isAuthConfigured } from '../../services/auth/authApi';
import {
  listUserSessions,
  revokeSession,
  getCurrentSessionId,
  type UserSessionRow,
} from '../../services/account/sessions';
import { deleteAccountAndCloudData } from '../../services/account/deleteAccount';
import { shareBackupExport, importBackupJson } from '../../utils/dataBackup';
import { confirmAction } from '../../utils/confirmAction';
import { confirmTypedAction } from '../../utils/confirmTypedAction';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';
import { spacing } from '../../theme/spacing';

export const AccountScreen: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const userId = useAuthStore(selectAuthUserId);
  const lastSyncedAt = useSyncMetaStore((s) => s.lastSyncedAt);
  const pendingCount = useSyncMetaStore((s) => s.pendingCount);
  const isOnline = useSyncMetaStore((s) => s.isOnline);

  const [sessions, setSessions] = useState<UserSessionRow[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [deleting, setDeleting] = useState(false);

  const syncStatus = !isOnline
    ? `Offline · ${pendingCount} pending`
    : pendingCount > 0
      ? `${pendingCount} queued`
      : 'Up to date';

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    setLoadingSessions(true);
    try {
      const [rows, currentId] = await Promise.all([
        listUserSessions(userId),
        getCurrentSessionId(),
      ]);
      setSessions(rows);
      setCurrentSessionId(currentId);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void loadSessions();
    }, [loadSessions]),
  );

  const handleSignOut = () => {
    confirmAction('Sign out', 'Sign out on this device?', async () => {
      await signOut();
      useAuthStore.getState().setCloudBootstrapped(false);
    }, { confirmLabel: 'Sign out' });
  };

  const handleDeleteAccount = () => {
    const phrase = user?.email?.trim() || userId || '';
    if (!phrase || !userId) {
      userAlert('Delete account', 'Sign in again, then retry.');
      return;
    }

    confirmAction(
      'Delete account?',
      'This permanently deletes your cloud data and Google sign-in. Local files on this device are not erased.',
      () => {
        confirmTypedAction({
          title: 'Confirm deletion',
          message:
            'This action cannot be undone. Type the text below exactly to delete your account.',
          confirmPhrase: phrase,
          phraseHint: phrase,
          confirmLabel: 'Delete account',
          onConfirm: async () => {
            setDeleting(true);
            try {
              await deleteAccountAndCloudData(userId);
              useAuthStore.getState().setCloudBootstrapped(false);
            } catch (e) {
              userAlert('Delete failed', e instanceof Error ? e.message : 'Try again.');
            } finally {
              setDeleting(false);
            }
          },
        });
      },
      { confirmLabel: 'Continue', destructive: true },
    );
  };

  const handleRevoke = (sessionId: string) => {
    if (!userId) return;
    confirmAction('Revoke session', 'Remove this device from your list?', async () => {
      try {
        await revokeSession(userId, sessionId);
        await loadSessions();
      } catch (e) {
        userAlert('Revoke failed', e instanceof Error ? e.message : 'Try again.');
      }
    }, { confirmLabel: 'Revoke', destructive: true });
  };

  const runSync = async () => {
    setCloudSyncing(true);
    try {
      await syncNowManual();
    } catch (e) {
      userAlert('Sync', e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setCloudSyncing(false);
    }
  };

  if (!isAuthConfigured() || !user) {
    return (
      <ScreenShell header="none" scroll>
        <SubScreenHeader title="Account" onBack={() => navigation.goBack()} />
        <AppText variant="body-md" muted style={styles.centered}>
          Sign in to manage your account.
        </AppText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Account" onBack={() => navigation.goBack()} />

      <AccountProfileHeader
        photoUrl={user.photoURL}
        displayName={user.displayName}
        email={user.email}
      />

      <AccountSection title="Security">
        <AccountActionRow
          label={
            getTotpEnrollment(user).enrolled
              ? 'Two-factor authentication · On'
              : 'Two-factor authentication · Off'
          }
          icon="security"
          onPress={() => {
            if (getTotpEnrollment(user).enrolled) {
              confirmAction(
                'Disable two-factor',
                'Remove authenticator from this account?',
                async () => {
                  try {
                    await unenrollTotp();
                    userAlert('Two-factor', 'Authenticator removed.');
                  } catch (e) {
                    userAlert('Two-factor', formatMfaError(e));
                  }
                },
                { confirmLabel: 'Disable', destructive: true },
              );
            } else {
              navigation.navigate('MfaEnroll' as never);
            }
          }}
          divider={false}
        />
      </AccountSection>

      <AccountSection title="Connected accounts">
        <View style={styles.googleRow}>
          <GoogleLogoIcon size={22} />
          <View style={styles.googleText}>
            <AppText variant="body-md">Google</AppText>
            <AppText variant="label-sm" muted numberOfLines={1}>
              {user.email ?? 'Connected'}
            </AppText>
          </View>
        </View>
      </AccountSection>

      <AccountSection
        title="Cloud sync"
        actionLabel={cloudSyncing ? 'Syncing…' : 'Sync now'}
        onAction={runSync}
      >
        <AccountRow label="Status" divider>
          <AppText variant="body-md">{syncStatus}</AppText>
        </AccountRow>
        <AccountRow label="Last synced" divider={false}>
          <AppText variant="body-md" muted>
            {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Never'}
          </AppText>
        </AccountRow>
      </AccountSection>

      <AccountSection title="Active sessions">
        {loadingSessions ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : sessions.length === 0 ? (
          <AppText variant="body-md" muted style={styles.empty}>
            No other devices yet. Sign in elsewhere to list them here.
          </AppText>
        ) : (
          sessions.map((s, i) => (
            <SessionRow
              key={s.id}
              session={s}
              isCurrent={s.id === currentSessionId}
              onRevoke={s.id === currentSessionId ? undefined : () => handleRevoke(s.id)}
              divider={i < sessions.length - 1}
            />
          ))
        )}
      </AccountSection>

      <AccountSection title="Data">
        <AccountActionRow
          label="Export local backup"
          icon="file-download"
          onPress={async () => {
            try {
              await shareBackupExport();
            } catch (e) {
              userAlert('Backup', e instanceof Error ? e.message : 'Export failed.');
            }
          }}
        />
        <AccountActionRow
          label={showImport ? 'Hide restore' : 'Restore from backup'}
          icon="file-upload"
          divider={!showImport}
          onPress={() => setShowImport((v) => !v)}
        />
        {showImport ? (
          <View style={styles.importBlock}>
            <TextInput
              style={styles.importInput}
              value={importJson}
              onChangeText={setImportJson}
              placeholder="Paste JSON backup…"
              placeholderTextColor={colors.outlineVariant}
              multiline
              numberOfLines={4}
            />
            <Pressable
              style={styles.importConfirm}
              onPress={async () => {
                const result = await importBackupJson(importJson);
                if (result.ok) {
                  userAlert('Backup', 'Restored. Restart if needed.');
                  setImportJson('');
                  setShowImport(false);
                } else {
                  userAlert('Backup', result.error ?? 'Import failed.');
                }
              }}
            >
              <AppText variant="label-sm" style={styles.importConfirmText}>
                Import backup
              </AppText>
            </Pressable>
          </View>
        ) : null}
      </AccountSection>

      <AccountSection title="Sign out & delete">
        <AccountActionRow
          label="Sign out"
          icon="logout"
          onPress={handleSignOut}
          divider
        />
        <AccountDangerButton
          label={deleting ? 'Deleting account…' : 'Delete account'}
          onPress={handleDeleteAccount}
          loading={deleting}
        />
        <AppText variant="label-sm" muted style={styles.dangerHint}>
          Deleting removes cloud workspace data and your Google login for Qadr.
        </AppText>
      </AccountSection>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  centered: { textAlign: 'center', marginTop: spacing.xl },
  googleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  googleText: { flex: 1, minWidth: 0 },
  loadingBox: { padding: spacing.lg, alignItems: 'center' },
  empty: { padding: spacing.md, lineHeight: 22 },
  importBlock: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  importInput: {
    minHeight: 88,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    color: colors.onSurface,
    fontSize: 13,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  importConfirm: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  importConfirmText: { color: colors.primary },
  dangerHint: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    lineHeight: 18,
  },
});
