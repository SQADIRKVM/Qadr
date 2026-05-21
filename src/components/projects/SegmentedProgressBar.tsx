import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getProgressSegments } from '../../utils/projectManager';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SegmentedProgressBarProps {
  percent: number;
  segments?: number;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  percent,
  segments = 10,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const filled = getProgressSegments(percent, segments);

  return (
    <View style={styles.row}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, i < filled ? styles.segmentFilled : styles.segmentEmpty]}
        />
      ))}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    height: 12,
    width: '100%',
  },
  segment: {
    flex: 1,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: colors.primary,
  },
  segmentEmpty: {
    backgroundColor: colors.surfaceContainerHighest,
  },
});
