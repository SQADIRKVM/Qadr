import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type PillVariant = 'default' | 'surface';

interface SegmentedPillProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  variant?: PillVariant;
  /** When false, pill labels use sentence case (Settings, forms). Default true. */
  uppercase?: boolean;
}

export function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
  variant = 'default',
  uppercase = true,
}: SegmentedPillProps<T>) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = opt.value === value;
        const pillStyle = [
          styles.pill,
          selected
            ? variant === 'surface'
              ? styles.selectedSurface
              : styles.selected
            : styles.unselected,
        ];
        const labelColor =
          selected && variant === 'surface'
            ? colors.primary
            : selected
              ? colors.onPrimary
              : colors.outline;

        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              hapticLight();
              onChange(opt.value);
            }}
            style={pillStyle}
          >
            <AppText
              variant="label-sm"
              style={[
                { color: labelColor },
                !uppercase && styles.labelSentence,
              ]}
            >
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  labelSentence: {
    textTransform: 'none',
    letterSpacing: 0.2,
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: spacing.pillRadius,
  },
  selected: { backgroundColor: colors.primary },
  selectedSurface: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});
