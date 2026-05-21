import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { MoodLevel } from '../types';
import { hapticLight } from '../utils/haptics';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

const MOODS: { key: MoodLevel; label: string }[] = [
  { key: 'dead', label: '·' },
  { key: 'low', label: '··' },
  { key: 'neutral', label: '···' },
  { key: 'good', label: '····' },
  { key: 'charged', label: '·····' },
];

interface MoodSelectorProps {
  selected: MoodLevel | null;
  onSelect: (mood: MoodLevel) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selected, onSelect }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.row}>
    {MOODS.map((m) => {
      const active = selected === m.key;
      return (
        <Pressable
          key={m.key}
          onPress={() => {
            hapticLight();
            onSelect(m.key);
          }}
          style={[styles.circle, active && styles.filled]}
          accessibilityLabel={m.key}
        />
      );
    })}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, justifyContent: 'center', paddingVertical: 8 },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filled: { backgroundColor: colors.primary, borderColor: colors.primary },
});
