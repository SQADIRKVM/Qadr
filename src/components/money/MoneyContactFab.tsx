import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { fabShadow } from '../../theme/shadows';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MoneyContactFabProps {
  onPress: () => void;
  label?: string;
}

export const MoneyContactFab: React.FC<MoneyContactFabProps> = ({
  onPress,
  label = 'ADD CONTACT',
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { horizontalPadding, fabBottom } = useResponsive();

  return (
    <Pressable
      style={[styles.fab, { right: horizontalPadding, bottom: fabBottom }]}
      onPress={() => {
        hapticLight();
        onPress();
      }}
    >
      <MaterialIcons name="add" size={24} color={colors.inverseOnSurface} />
      <AppText variant="label-sm" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  fab: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 9999,
    backgroundColor: colors.inverseSurface,
    zIndex: 100,
    ...fabShadow,
  },
  label: {
    color: colors.inverseOnSurface,
    letterSpacing: 2,
  },
});
