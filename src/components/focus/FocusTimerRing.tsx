import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { DotMatrixText } from '../DotMatrixText';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusTimerRingProps {
  remainingSeconds: number;
  totalSeconds: number;
  phaseLabel: string;
  compact?: boolean;
}

export const FocusTimerRing: React.FC<FocusTimerRingProps> = ({
  remainingSeconds,
  totalSeconds,
  phaseLabel,
  compact,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile } = useResponsive();
  const size = compact || isMobile ? 220 : 320;
  const stroke = 6;
  const r = size / 2 - stroke - 8;
  const circ = 2 * Math.PI * r;
  const progress =
    totalSeconds > 0 ? Math.min(remainingSeconds / totalSeconds, 1) : 0;
  const offset = circ - progress * circ;

  const m = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  const timeLabel = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.cardBorder}
          strokeWidth={4}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <DotMatrixText value={timeLabel} size={compact || isMobile ? 'md' : 'lg'} />
        <AppText variant="label-sm" style={styles.caption}>
          {phaseLabel}
        </AppText>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    marginTop: spacing.xs,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
