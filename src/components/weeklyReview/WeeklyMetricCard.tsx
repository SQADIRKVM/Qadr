import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { JournalCard } from './JournalCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface WeeklyMetricCardProps {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  value: string;
  label: string;
}

export const WeeklyMetricCard: React.FC<WeeklyMetricCardProps> = ({ icon, value, label }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <JournalCard style={styles.card}>
    <MaterialIcons name={icon} size={28} color={colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
    <View style={styles.bottom}>
      <AppText variant="headline-lg-mobile" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="label-sm" style={styles.label}>
        {label}
      </AppText>
    </View>
  </JournalCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  bottom: {
    marginTop: spacing.md,
  },
  value: {
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
});
