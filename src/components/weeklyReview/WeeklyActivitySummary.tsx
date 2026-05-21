import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { ProductivityFlowCard } from './ProductivityFlowCard';
import { WeeklyMetricCard } from './WeeklyMetricCard';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface WeeklyActivitySummaryProps {
  focusScore: number;
  restHours: string;
  habitsKept: string;
}

export const WeeklyActivitySummary: React.FC<WeeklyActivitySummaryProps> = ({
  focusScore,
  restHours,
  habitsKept,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <AppText variant="headline-md" style={styles.sectionTitle}>
      Activity Summary
    </AppText>
    <ProductivityFlowCard focusScore={focusScore} />
    <View style={styles.metricsRow}>
      <WeeklyMetricCard icon="nights-stay" value={restHours} label="REST AVERAGE" />
      <WeeklyMetricCard icon="task-alt" value={habitsKept} label="HABITS KEPT" />
    </View>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.onSurface,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
