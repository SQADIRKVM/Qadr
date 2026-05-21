import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { AppText } from '../primitives/AppText';
import { platformShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusSessionFooterProps {
  sessionIndex: number;
  sessionTotal?: number;
  onLongPress?: () => void;
}

export const FocusSessionFooter: React.FC<FocusSessionFooterProps> = ({
  sessionIndex,
  sessionTotal = 4,
  onLongPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={800}
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      accessibilityLabel={`Session ${sessionIndex} of ${sessionTotal}. Long press for emergency override.`}
    >
      <View style={styles.dot} />
      <AppText variant="label-sm" style={styles.label}>
        SESSION {sessionIndex} OF {sessionTotal}
      </AppText>
    </Pressable>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.chipBg,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...platformShadow({
      color: colors.black,
      offset: { width: 0, height: 4 },
      opacity: 0.2,
      radius: 12,
      elevation: 4,
    }),
  },
  pillPressed: {
    opacity: 0.85,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onTertiaryContainer,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
