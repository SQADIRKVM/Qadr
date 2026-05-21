import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export type TrackerTab = 'habits' | 'sleep';

interface TrackerSegmentedControlProps {
  value: TrackerTab;
  onChange: (tab: TrackerTab) => void;
}

export const TrackerSegmentedControl: React.FC<TrackerSegmentedControlProps> = ({
  value,
  onChange,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.track}>
    {(['habits', 'sleep'] as TrackerTab[]).map((tab) => {
      const selected = value === tab;
      const label = tab === 'habits' ? 'HABITS' : 'SLEEP';
      return (
        <Pressable
          key={tab}
          onPress={() => {
            hapticLight();
            onChange(tab);
          }}
          style={[styles.pill, selected && styles.pillActive]}
        >
          {selected ? <View style={styles.dot} /> : null}
          <AppText variant="label-sm" style={[styles.label, selected && styles.labelActive]}>
            {label}
          </AppText>
        </Pressable>
      );
    })}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLow,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 4,
    gap: 4,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: spacing.pillRadius,
  },
  pillActive: {
    backgroundColor: colors.inverseSurface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onTertiaryContainer,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    fontSize: 11,
  },
  labelActive: {
    color: colors.inverseOnSurface,
  },
});
