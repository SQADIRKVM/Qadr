import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { EnergyDots } from '../EnergyDots';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SleepEnergyCardProps {
  energy: number;
  onEnergyChange: (n: number) => void;
  honestyNights?: number;
}

export const SleepEnergyCard: React.FC<SleepEnergyCardProps> = ({
  energy,
  onEnergyChange,
  honestyNights,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={styles.card}>
    <View style={styles.header}>
      <View>
        <AppText variant="headline-md" style={styles.title}>
          Daily Energy
        </AppText>
        <AppText variant="label-sm" style={styles.subtitle}>
          HOW YOU FEEL TODAY
        </AppText>
      </View>
      <MaterialIcons name="bolt" size={22} color={colors.onSurfaceVariant} />
    </View>
    <EnergyDots count={energy} onChange={onEnergyChange} />
    {honestyNights != null ? (
      <AppText variant="body-md" muted style={styles.hint}>
        Kept bedtime {honestyNights}/7 nights
      </AppText>
    ) : null}
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { color: colors.onSurface },
  subtitle: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  hint: { marginTop: 4 },
});
