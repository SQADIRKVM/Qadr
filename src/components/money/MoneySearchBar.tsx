import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MoneySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSortPress?: () => void;
  onPdfPress?: () => void;
}

export const MoneySearchBar: React.FC<MoneySearchBarProps> = ({
  value,
  onChangeText,
  onSortPress,
  onPdfPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.row}>
    <View style={styles.searchWrap}>
      <MaterialIcons name="search" size={18} color={colors.onSurfaceVariant} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="SEARCH CONTACT"
        placeholderTextColor={colors.outline}
        autoCapitalize="none"
      />
    </View>
    <Pressable style={styles.iconBtn} onPress={onSortPress}>
      <MaterialIcons name="sort" size={20} color={colors.onSurfaceVariant} />
    </Pressable>
    <Pressable style={styles.iconBtn} onPress={onPdfPress}>
      <MaterialIcons name="picture-as-pdf" size={20} color={colors.onSurfaceVariant} />
    </Pressable>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBg,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    padding: 0,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
  },
});
