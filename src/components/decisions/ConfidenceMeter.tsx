import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ConfidenceMeterProps {
  confidence: number;
  max?: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  max = 10,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const filled = Math.min(max, Math.max(0, Math.round(confidence)));

  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < filled ? styles.dotFilled : styles.dotEmpty]}
        />
      ))}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: colors.outlineVariant,
  },
});
