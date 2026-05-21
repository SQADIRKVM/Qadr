import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface WeeklyReviewHeroProps {
  weekLabel: string;
}

export const WeeklyReviewHero: React.FC<WeeklyReviewHeroProps> = ({ weekLabel }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile } = useResponsive();

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.eyebrow}>
        {weekLabel}
      </AppText>
      <AppText variant={isMobile ? 'headline-lg-mobile' : 'headline-xl'} style={styles.title}>
        Your Week in Review
      </AppText>
      <View style={styles.divider} />
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.onSurface,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.3,
    borderRadius: 9999,
    marginTop: spacing.md,
  },
});
