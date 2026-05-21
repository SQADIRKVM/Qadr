import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SquareCheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export const SquareCheckbox: React.FC<SquareCheckboxProps> = ({ checked, onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable onPress={onPress} style={[styles.box, checked && styles.checked]}>
    {checked && <Ionicons name="checkmark" size={14} color={colors.tertiary} />}
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checked: {
    backgroundColor: 'rgba(255, 179, 175, 0.1)',
    borderColor: colors.tertiary,
  },
});
