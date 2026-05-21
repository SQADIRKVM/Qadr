import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { ProgressRing } from '../ProgressRing';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DailyVitalityWidgetProps {
  percent: number;
}

const RING_SIZE = 64;

export const DailyVitalityWidget: React.FC<DailyVitalityWidgetProps> = ({ percent }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.inner}>
      <View style={styles.textCol}>
        <AppText variant="label-sm" style={styles.label}>
          DAILY VITALITY
        </AppText>
        <View style={styles.valueRow}>
          <AppText variant="headline-lg" style={styles.value}>
            {percent}
          </AppText>
          <AppText variant="body-md" style={styles.pct}>
            %
          </AppText>
        </View>
      </View>
      <ProgressRing
        progress={percent}
        size={RING_SIZE}
        strokeWidth={4}
        strokeColor={colors.accentRed}
        trackColor={colors.cardBorder}
      >
        <MaterialIcons name="favorite" size={22} color={colors.primary} />
      </ProgressRing>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.md,
    minWidth: 280,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textCol: { flex: 1 },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: { color: colors.onSurface },
  pct: { color: colors.primary },
});
