import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MoodLevel } from '../../types';
import { MOOD_DISPLAY_LABELS } from '../../utils/moodLabels';
import { AppText } from '../primitives/AppText';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const MOODS: { key: MoodLevel; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'dead', icon: 'remove-outline' },
  { key: 'low', icon: 'trending-down-outline' },
  { key: 'neutral', icon: 'ellipse-outline' },
  { key: 'good', icon: 'trending-up-outline' },
  { key: 'charged', icon: 'flash-outline' },
];

interface MoodPillsProps {
  selected: MoodLevel | null;
  onSelect: (mood: MoodLevel) => void;
}

export const MoodPills: React.FC<MoodPillsProps> = ({ selected, onSelect }) => {
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
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          accessibilityLabel={MOOD_DISPLAY_LABELS[m.key]}
          style={[styles.pill, active && styles.pillActive]}
        >
          {active ? <View style={styles.activeDot} /> : null}
          <Ionicons
            name={m.icon}
            size={16}
            color={active ? colors.primary : colors.outline}
          />
          <AppText
            variant="label-sm"
            style={[styles.label, active && styles.labelActive]}
          >
            {MOOD_DISPLAY_LABELS[m.key]}
          </AppText>
        </Pressable>
      );
    })}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  pill: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.chipBg,
  },
  pillActive: {
    borderColor: colors.onTertiaryContainer,
    backgroundColor: colors.surfaceContainer,
  },
  label: { fontSize: 10, color: colors.outline },
  labelActive: { color: colors.onSurface },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onTertiaryContainer,
    position: 'absolute',
    top: 6,
    right: 8,
  },
});
