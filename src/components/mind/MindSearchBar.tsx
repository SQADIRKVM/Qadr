import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../theme/spacing';
import { ghostHighlight } from '../../theme/patterns';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const MindSearchBar: React.FC<MindSearchBarProps> = ({ value, onChangeText }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={[styles.wrap, ghostHighlight(colors)]}>
    <MaterialIcons name="search" size={22} color={colors.onSurfaceVariant} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder="Query captures..."
      placeholderTextColor={colors.outlineVariant}
    />
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBgDeep,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
});
