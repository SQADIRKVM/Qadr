import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { TabNavigator } from './TabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { AppText } from '../components/primitives/AppText';
import { useAuthStore } from '../stores/useAuthStore';
import { useSyncMetaStore } from '../stores/useSyncMetaStore';
import { isAuthConfigured } from '../services/auth/authApi';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

export const RootNavigator = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const authReady = useAuthStore((s) => s.authReady);
  const user = useAuthStore((s) => s.user);
  const cloudBootstrapped = useAuthStore((s) => s.cloudBootstrapped);
  const syncing = useSyncMetaStore((s) => s.syncing);

  if (isAuthConfigured()) {
    if (!authReady) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (!user) {
      return <AuthNavigator />;
    }
    if (!cloudBootstrapped || syncing) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <AppText variant="label-sm" muted style={styles.syncLabel}>
            Syncing workspace…
          </AppText>
        </View>
      );
    }
  }

  return <TabNavigator />;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  syncLabel: { marginTop: 8 },
});
