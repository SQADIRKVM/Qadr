import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const Separator: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.sep} />;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  sep: { height: 1, backgroundColor: colors.outlineVariant },
});
