import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface TodayProgressCardProps {
  percent: number;
  message: string;
  label?: string;
}

export const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
  percent,
  message,
  label = "TODAY'S PROGRESS",
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.dots} pointerEvents="none" />
    <View style={styles.top}>
      <AppText variant="label-sm" style={styles.label}>
        {label}
      </AppText>
      <MaterialIcons name="trending-up" size={22} color={colors.onSurfaceVariant} />
    </View>
    <View style={styles.body}>
      <View style={styles.pctRow}>
        <AppText variant="headline-xl" style={styles.pct}>
          {percent}
        </AppText>
        <AppText variant="headline-md" style={styles.pctSuffix}>
          %
        </AppText>
      </View>
      <AppText variant="body-md" muted style={styles.message}>
        {message}
      </AppText>
    </View>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.min(100, Math.max(0, percent))}%` }]} />
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    minHeight: 256,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  dots: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    backgroundColor: colors.surfaceContainerHighest,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  body: { marginTop: spacing.md },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  pct: {
    color: colors.onSurface,
    letterSpacing: -1,
  },
  pctSuffix: {
    color: colors.onSurfaceVariant,
  },
  message: {
    marginTop: 8,
    lineHeight: 22,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.onSurface,
    borderRadius: 2,
  },
});
