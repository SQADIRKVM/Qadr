import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={[styles.row, style]}>
    <AppText variant="label-sm">{title}</AppText>
    {actionLabel && onAction && (
      <Pressable onPress={onAction}>
        <AppText variant="label-sm" style={{ color: colors.outline }}>
          {actionLabel}
        </AppText>
      </Pressable>
    )}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
});
