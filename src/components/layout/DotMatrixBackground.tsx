import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { isWebPlatform } from '../../utils/webLayout';
import type { ColorPalette } from '../../theme/palettes';

const DOT = 8;
const MAX_DOTS = 800;

export const DotMatrixBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.18 }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { width, height } = useWindowDimensions();

  const webPatternStyle = useMemo((): ViewStyle | undefined => {
    if (Platform.OS !== 'web') return undefined;
    return {
      backgroundImage: `radial-gradient(circle, ${colors.surfaceBright} 0.5px, transparent 0.5px)`,
      backgroundSize: `${DOT}px ${DOT}px`,
    } as ViewStyle;
  }, [colors.surfaceBright]);

  const dots = useMemo(() => {
    if (isWebPlatform()) return [];
    let step = DOT;
    let cols = Math.ceil(width / step);
    let rows = Math.ceil(height / step);
    while (cols * rows > MAX_DOTS && step < 64) {
      step += 4;
      cols = Math.ceil(width / step);
      rows = Math.ceil(height / step);
    }
    const items: { key: string; left: number; top: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({ key: `${r}-${c}`, left: c * step, top: r * step });
      }
    }
    return items;
  }, [width, height]);

  if (isWebPlatform()) {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.wrap,
          webPatternStyle,
          { opacity, backgroundColor: colors.background },
        ]}
        pointerEvents="none"
      />
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.wrap, { opacity }]} pointerEvents="none">
      {dots.map((d) => (
        <View key={d.key} style={[styles.dot, { left: d.left, top: d.top }]} />
      ))}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { backgroundColor: colors.background },
  dot: {
    position: 'absolute',
    width: 1,
    height: 1,
    borderRadius: 1,
    backgroundColor: colors.surfaceBright,
  },
});
