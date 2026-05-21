import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AddHabitCardProps {
  onPress: () => void;
}

export const AddHabitCard: React.FC<AddHabitCardProps> = ({ onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard
    deep
    onPress={() => {
      hapticLight();
      onPress();
    }}
    style={styles.card}
  >
    <MaterialIcons name="add-circle-outline" size={36} color={colors.onSurfaceVariant} />
    <AppText variant="label-sm" style={styles.label}>
      ADD HABIT
    </AppText>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    minHeight: 160,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
});
