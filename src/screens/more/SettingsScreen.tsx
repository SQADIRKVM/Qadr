import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import { AppText } from '../../components/primitives/AppText';
import { SegmentedPill } from '../../components/primitives/SegmentedPill';
import {
  SettingsHero,
  SettingsProfileStrip,
  SettingsSectionCard,
  SettingsField,
  SettingsToggleRow,
  SettingsIconRow,
  SettingsLinkRow,
  SettingsPrimaryButton,
  SecurityCard,
  BioSyncDeviceRow,
} from '../../components/settings';
import {
  useSettingsStore,
  type SyncFrequency,
  type AppLocale,
  type TextScale,
  type AppearanceMode,
} from '../../stores/useSettingsStore';
import { userAlert } from '../../utils/userAlert';
import {
  scheduleBedtimeNudge,
  requestNotificationPermissions,
  scheduleSubscriptionReminders,
  isNativeNotificationsSupported,
} from '../../services/notifications';
import { useMoneyStore } from '../../stores/useMoneyStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { isAuthConfigured } from '../../services/auth/authApi';
import { formatMfaError, getTotpEnrollment, unenrollTotp } from '../../services/auth/mfa';
import { confirmAction } from '../../utils/confirmAction';
import { AIConfigBanner } from '../../components/primitives/AIConfigBanner';
import { syncNowManual } from '../../hooks/useCloudSync';
import { useSyncMetaStore } from '../../stores/useSyncMetaStore';
import { useResponsive } from '../../hooks/useResponsive';
import type { LifestyleMode } from '../../types';
import type { HomeStackParamList, MoreStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type SettingsNavProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'Settings'>,
  StackNavigationProp<MoreStackParamList>
>;

const SYNC_LABELS: Record<SyncFrequency, string> = {
  continuous: 'Continuous',
  hourly: 'Hourly',
  daily: 'Daily',
};

const SYNC_ORDER: SyncFrequency[] = ['continuous', 'hourly', 'daily'];

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  ar: 'Arabic',
  system: 'System default',
};

const TEXT_SCALE_LABELS: Record<TextScale, string> = {
  default: 'Default',
  large: 'Large (112%)',
};

export const SettingsScreen = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<SettingsNavProp>();
  const { isMobile, gutter } = useResponsive();
  const [syncing, setSyncing] = useState(false);
  const subscriptions = useMoneyStore((s) => s.subscriptions);
  const user = useAuthStore((s) => s.user);
  const cloudConfigured = isAuthConfigured();
  const lastSyncedAt = useSyncMetaStore((s) => s.lastSyncedAt);
  const pendingCount = useSyncMetaStore((s) => s.pendingCount);
  const isOnline = useSyncMetaStore((s) => s.isOnline);
  const totp = getTotpEnrollment(user);

  const {
    userName,
    mode,
    studyTarget,
    deviceName,
    syncFrequency,
    hapticsEnabled,
    nightAuto,
    bedtime,
    locale,
    textScale,
    appearance,
    setUserName,
    setMode,
    setStudyTarget,
    setDeviceName,
    setSyncFrequency,
    setHapticsEnabled,
    setLocale,
    setTextScale,
    setAppearance,
  } = useSettingsStore();

  const syncBadge = !isOnline
    ? 'Offline'
    : pendingCount > 0
      ? `${pendingCount} pending`
      : 'Active';

  const cycleSyncFrequency = () => {
    const idx = SYNC_ORDER.indexOf(syncFrequency);
    const next = SYNC_ORDER[(idx + 1) % SYNC_ORDER.length];
    setSyncFrequency(next);
  };

  const cycleLocale = () => {
    const order: AppLocale[] = ['system', 'en', 'ar'];
    const idx = order.indexOf(locale);
    setLocale(order[(idx + 1) % order.length]);
  };

  const cycleTextScale = () => {
    setTextScale(textScale === 'default' ? 'large' : 'default');
  };

  const enableNotifications = async () => {
    if (!isNativeNotificationsSupported()) {
      userAlert(
        'Notifications',
        'Bedtime and subscription reminders run on the iOS or Android app. Open Qadr on your phone to enable them.',
      );
      return;
    }
    const ok = await requestNotificationPermissions();
    if (ok) {
      if (nightAuto) await scheduleBedtimeNudge(bedtime);
      const subCount = await scheduleSubscriptionReminders(subscriptions);
      userAlert(
        'Notifications',
        `Permissions granted. ${subCount} subscription reminder(s) scheduled.`,
      );
      return;
    }
    userAlert('Notifications', 'Permission was not granted.');
  };

  const refreshVitals = async () => {
    if (syncing) return;
    setSyncing(true);
    let remindersOk = false;
    if (isNativeNotificationsSupported()) {
      const ok = await requestNotificationPermissions();
      if (ok) {
        if (nightAuto) await scheduleBedtimeNudge(bedtime);
        await scheduleSubscriptionReminders(subscriptions);
        remindersOk = true;
      }
    } else {
      remindersOk = true;
    }
    setSyncing(false);
    userAlert(
      'Bio-Sync',
      remindersOk
        ? Platform.OS === 'web'
          ? 'Vitals refreshed on this device. Reminder scheduling is available in the mobile app.'
          : 'Vitals refreshed. Local sleep, energy, and reminder schedules are up to date on this device.'
        : 'Could not refresh reminders — enable notifications in system settings.',
    );
  };

  const forceCloudSync = async () => {
    if (!cloudConfigured || !user) {
      userAlert('Sync', 'Sign in to sync your workspace to the cloud.');
      return;
    }
    if (syncing) return;
    setSyncing(true);
    try {
      await syncNowManual();
      userAlert('Sync', 'Cloud sync completed.');
    } catch (e) {
      userAlert('Sync', e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisable2fa = () => {
    confirmAction(
      'Disable two-factor',
      'Your account will only require Google sign-in. Continue?',
      async () => {
        try {
          await unenrollTotp();
          userAlert('Two-factor', 'Authenticator removed from this account.');
        } catch (e) {
          userAlert('Two-factor', formatMfaError(e));
        }
      },
      { confirmLabel: 'Disable', destructive: true },
    );
  };

  const colStyle = isMobile ? styles.colFull : styles.colHalfWide;

  return (
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <SettingsHero />

      {cloudConfigured && user ? (
        <SettingsProfileStrip
          displayName={user.displayName}
          email={user.email}
          photoUrl={user.photoURL}
          onPress={() => navigation.navigate('Account')}
        />
      ) : null}

      <AIConfigBanner />

      <View style={[styles.bento, !isMobile && styles.bentoWide, { gap: gutter }]}>
        <SettingsSectionCard
          title="Bio-Sync"
          icon="monitor-heart"
          badge={syncBadge}
          divider
          actionLabel={syncing ? 'Refreshing…' : 'Refresh'}
          onAction={refreshVitals}
          style={styles.colFull}
        >
          <SettingsField
            label="Device connection"
            value={deviceName || 'This device'}
            onChangeText={setDeviceName}
            inputProps={{ placeholder: 'This device' }}
            statusDot={isOnline ? 'success' : 'error'}
          />
          <BioSyncDeviceRow />
          <SettingsField
            label="Sync frequency"
            value={SYNC_LABELS[syncFrequency]}
            editable={false}
            onPress={cycleSyncFrequency}
            trailingIcon="keyboard-arrow-down"
          />
          {lastSyncedAt ? (
            <AppText variant="body-md" muted style={styles.syncHint}>
              Last cloud sync {new Date(lastSyncedAt).toLocaleString()}
            </AppText>
          ) : null}
          <SettingsPrimaryButton
            label="Force sync now"
            onPress={() => void forceCloudSync()}
            loading={syncing}
          />
          <SettingsLinkRow
            label="Health & vitality"
            value="Vitals, sleep, energy"
            onPress={() => navigation.navigate('BioSyncHealth')}
          />
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Personalize"
          icon="palette"
          style={colStyle}
        >
          <SettingsIconRow
            label="Interface theme"
            icon={appearance === 'dark' ? 'dark-mode' : 'light-mode'}
          />
          <View style={styles.pillWrap}>
            <SegmentedPill
              options={[
                { value: 'dark' as AppearanceMode, label: 'Dark' },
                { value: 'light' as AppearanceMode, label: 'Light' },
              ]}
              value={appearance}
              onChange={setAppearance}
              variant="surface"
              uppercase={false}
            />
          </View>
          <SettingsToggleRow
            label="Haptic feedback"
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
          />
          <SettingsField label="Your name" value={userName} onChangeText={setUserName} />
          <View style={styles.modeRow}>
            <AppText variant="body-md">Mode</AppText>
            <SegmentedPill
              options={[
                { value: 'founder' as LifestyleMode, label: 'Founder' },
                { value: 'student' as LifestyleMode, label: 'Student' },
              ]}
              value={mode}
              onChange={setMode}
              variant="surface"
              uppercase={false}
            />
          </View>
          {mode === 'student' ? (
            <SettingsField
              label="Study target"
              value={studyTarget}
              onChangeText={setStudyTarget}
              inputProps={{ placeholder: "Today's study focus" }}
            />
          ) : null}
        </SettingsSectionCard>

        <SettingsSectionCard title="Preferences" icon="tune" style={colStyle}>
          <SettingsLinkRow
            label="Notifications"
            value="Reminders & bedtime"
            onPress={() => void enableNotifications()}
          />
          <SettingsLinkRow
            label="Language & region"
            value={LOCALE_LABELS[locale]}
            onPress={cycleLocale}
          />
          <SettingsLinkRow
            label="Text size"
            value={TEXT_SCALE_LABELS[textScale]}
            onPress={cycleTextScale}
          />
          <AppText variant="body-md" muted style={styles.localeHint}>
            Locale preference is saved for date formatting. UI copy remains English.
          </AppText>
          <SettingsLinkRow
            label="Focus & schedule"
            value="Timers, bedtime wind-down"
            onPress={() => navigation.navigate('BlockMode')}
          />
        </SettingsSectionCard>

        {cloudConfigured && user ? (
          <SettingsSectionCard
            title="Security"
            icon="shield"
            badge={totp.enrolled ? 'Protected' : undefined}
            style={colStyle}
          >
            <SecurityCard
              enrolled={totp.enrolled}
              onEnable={() => navigation.navigate('MfaEnroll')}
              onManage={totp.enrolled ? () => void handleDisable2fa() : undefined}
            />
          </SettingsSectionCard>
        ) : null}
      </View>
    </ScreenShell>
  );
};

const createStyles = (_colors: ColorPalette) =>
  StyleSheet.create({
    bento: {
      width: '100%',
      marginTop: spacing.sm,
    },
    bentoWide: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'stretch',
    },
    colFull: { width: '100%' },
    colHalfWide: { flex: 1, minWidth: 280, maxWidth: '100%' },
    pillWrap: { marginTop: -4 },
    modeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    localeHint: { lineHeight: 20, marginTop: -4 },
    syncHint: { lineHeight: 20, marginTop: -4 },
  });
