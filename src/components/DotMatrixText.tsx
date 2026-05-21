import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from './primitives/AppText';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface DotMatrixTextProps {
  value: string | number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  alert?: boolean;
}

const sizes = { sm: 18, md: 28, lg: 40 };

/** Dot-matrix LED aesthetic overlay on Space Mono text */
export const DotMatrixText: React.FC<DotMatrixTextProps> = ({
  value,
  size = 'md',
  color,
  alert,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const fontSize = sizes[size];
  const textColor = alert ? colors.accentRed : color ?? colors.onSurface;
  const str = String(value);
  const dotSize = 2;
  const gap = 3;
  const cols = 5;
  const rows = 7;

  return (
    <View style={styles.wrap}>
      <AppText variant="mono-md" style={{ fontSize, color: textColor, opacity: 0.15 }}>
        {str}
      </AppText>
      <AppText variant="mono-md" style={[styles.fore, { fontSize, color: textColor }]}>
        {str}
      </AppText>
      <Svg
        width={cols * (dotSize + gap)}
        height={rows * (dotSize + gap)}
        style={styles.dots}
        pointerEvents="none"
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const x = (i % cols) * (dotSize + gap);
          const y = Math.floor(i / cols) * (dotSize + gap);
          const on = (i + str.length) % 3 !== 0;
          if (!on) return null;
          return (
            <Circle
              key={i}
              cx={x + dotSize}
              cy={y + dotSize}
              r={dotSize / 2}
              fill={textColor}
              opacity={0.12}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { position: 'relative', alignSelf: 'flex-start' },
  fore: { position: 'absolute', left: 0, top: 0 },
  dots: { position: 'absolute', right: -8, top: -4, opacity: 0.5 },
});
