import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

interface BarData {
  value: number;
  variant?: 'default' | 'good' | 'poor';
}

interface SimpleBarChartProps {
  data: BarData[];
  height?: number;
}

/** Minimal bar chart fallback (victory-native requires Skia setup) */
export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  height = 80,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const barColors = {
    default: colors.chartDefault,
    good: colors.chartGood,
    poor: colors.chartPoor,
  };
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={[styles.chart, { height }]}>
      <View style={styles.baseline} />
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: (d.value / max) * (height - 8),
                backgroundColor: barColors[d.variant ?? 'default'],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  chart: { marginTop: 16, justifyContent: 'flex-end' },
  baseline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flex: 1,
    gap: 4,
    paddingBottom: 1,
  },
  bar: { flex: 1, borderRadius: 2, minHeight: 4 },
});
