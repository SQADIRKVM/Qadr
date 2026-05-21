import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const DecisionScreenHero: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile } = useResponsive();

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.eyebrow}>
        DECISION LOG
      </AppText>
      <View style={styles.titleRow}>
        <AppText variant={isMobile ? 'headline-lg-mobile' : 'headline-xl'} style={styles.title}>
          Architecture Audit
        </AppText>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <AppText variant="label-sm" style={styles.badgeText}>
            SYSTEM ACTIVE
          </AppText>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.onTertiaryContainer,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.onSurface,
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.primary,
    letterSpacing: 1,
  },
});
