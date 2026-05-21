import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress?.();
    }}
    style={[styles.chip, selected && styles.selected]}
  >
    <AppText variant="body-md" style={[styles.text, selected && styles.textSelected]}>
      {label}
    </AppText>
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: spacing.pillRadius,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.surfaceLow,
    borderColor: colors.primary,
  },
  text: { fontSize: 14, color: colors.onSurfaceVariant },
  textSelected: { color: colors.primary },
});
