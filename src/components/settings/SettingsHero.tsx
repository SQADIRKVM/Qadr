import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const SettingsHero: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <AppText variant="headline-lg-mobile" style={styles.title}>
        Your space
      </AppText>
      <AppText variant="body-md" muted style={styles.desc}>
        Manage your connection to Qadr. Customize your experience, sync your data, and
        secure your environment.
      </AppText>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrap: { marginBottom: spacing.md, gap: spacing.xs },
    title: { color: colors.onSurface },
    desc: { lineHeight: 22, maxWidth: 560 },
  });
