import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface HabitToggleProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export const HabitToggle: React.FC<HabitToggleProps> = ({ value, onValueChange }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onValueChange(!value);
    }}
    style={[styles.track, value ? styles.trackOn : styles.trackOff]}
  >
    <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  track: {
    width: 48,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.inverseSurface,
  },
  trackOff: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  knobOn: {
    backgroundColor: colors.background,
    alignSelf: 'flex-end',
  },
  knobOff: {
    backgroundColor: colors.outlineVariant,
    alignSelf: 'flex-start',
  },
});
