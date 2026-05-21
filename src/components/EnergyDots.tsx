import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { hapticLight } from '../utils/haptics';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface EnergyDotsProps {
  count: number;
  max?: number;
  onChange?: (n: number) => void;
  redFill?: boolean;
}

export const EnergyDots: React.FC<EnergyDotsProps> = ({
  count,
  max = 5,
  onChange,
  redFill,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.row}>
    {Array.from({ length: max }).map((_, i) => {
      const filled = i < count;
      return (
        <Pressable
          key={i}
          disabled={!onChange}
          onPress={() => {
            hapticLight();
            onChange?.(i + 1);
          }}
          style={[
            styles.dot,
            filled && {
              backgroundColor: redFill ? colors.accentRed : colors.primary,
              borderColor: redFill ? colors.accentRed : colors.primary,
            },
          ]}
        />
      );
    })}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});
