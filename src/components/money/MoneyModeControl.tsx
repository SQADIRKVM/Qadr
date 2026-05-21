import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { MoneyMode } from '../../types';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const MODES: { key: MoneyMode; label: string }[] = [
  { key: 'ledger', label: 'LEDGER' },
  { key: 'subscriptions', label: 'SUBS' },
  { key: 'expenses', label: 'SPEND' },
  { key: 'income', label: 'INCOME' },
];

interface MoneyModeControlProps {
  value: MoneyMode;
  onChange: (mode: MoneyMode) => void;
}

export const MoneyModeControl: React.FC<MoneyModeControlProps> = ({ value, onChange }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.track}>
    {MODES.map(({ key, label }) => {
      const selected = value === key;
      return (
        <Pressable
          key={key}
          onPress={() => {
            hapticLight();
            onChange(key);
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
    marginBottom: spacing.lg,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
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
    letterSpacing: 0.5,
    fontSize: 9,
  },
  labelActive: {
    color: colors.inverseOnSurface,
  },
});
