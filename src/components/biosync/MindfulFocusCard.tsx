import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindfulFocusCardProps {
  hours: number;
  rhythmLine: string;
  style?: StyleProp<ViewStyle>;
}

export const MindfulFocusCard: React.FC<MindfulFocusCardProps> = ({
  hours,
  rhythmLine,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <AppText variant="headline-md" style={styles.title}>
        Mindful Focus
      </AppText>
      <MaterialIcons name="self-improvement" size={28} color={colors.onSurfaceVariant} />
    </View>
    <View style={styles.center}>
      <View style={styles.hoursRow}>
        <AppText variant="headline-xl" style={styles.hours}>
          {hours > 0 ? hours.toFixed(1) : '—'}
        </AppText>
        {hours > 0 ? (
          <AppText variant="headline-md" style={styles.hrUnit}>
            hr
          </AppText>
        ) : null}
      </View>
      <AppText variant="label-sm" style={styles.rhythm}>
        {rhythmLine}
      </AppText>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    minHeight: 220,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { color: colors.onSurface },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  hours: { color: colors.onSurface },
  hrUnit: { color: colors.onSurfaceVariant },
  rhythm: {
    color: colors.accentRed,
    letterSpacing: 2,
    fontSize: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
