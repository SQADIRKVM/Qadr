import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface EnergyFlowBlocksProps {
  levels: number[];
}

export const EnergyFlowBlocks: React.FC<EnergyFlowBlocksProps> = ({ levels }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const blockColors = [
    colors.surfaceContainerLowest,
    colors.surfaceContainer,
    colors.surfaceContainerHigh,
    colors.onSurface,
    colors.onSurface,
    colors.surfaceContainerHigh,
    colors.surfaceContainer,
    colors.surfaceContainerLowest,
  ];

  return (
  <>
    <View style={styles.grid}>
      {levels.map((level, i) => {
        const idx = Math.min(Math.max(level, 0), blockColors.length - 1);
        const bg = blockColors[idx];
        const overlayOpacity = level >= 4 ? (i === 3 ? 0.2 : i === 4 ? 0.4 : 0) : 0;
        return (
          <View key={i} style={[styles.block, { backgroundColor: bg }]}>
            {overlayOpacity > 0 ? (
              <View style={[styles.overlay, { opacity: overlayOpacity }]} />
            ) : null}
          </View>
        );
      })}
    </View>
    <View style={styles.labels}>
      {['Morning', 'Midday', 'Evening', 'Night'].map((label) => (
        <Text key={label} style={styles.labelText}>
          {label}
        </Text>
      ))}
    </View>
  </>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  block: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accentRed,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelText: {
    flex: 1,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
