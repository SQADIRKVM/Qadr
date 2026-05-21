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

interface IdeaVaultNewCardProps {
  onPress: () => void;
}

const CARD_MIN_HEIGHT = 256;

export const IdeaVaultNewCard: React.FC<IdeaVaultNewCardProps> = ({ onPress }) => {
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
      INITIALIZE NEW IDEA
    </AppText>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    minHeight: CARD_MIN_HEIGHT,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
