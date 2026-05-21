import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface LedgerBottomActionsProps {
  onGave: () => void;
  onGot: () => void;
}

export const LedgerBottomActions: React.FC<LedgerBottomActionsProps> = ({ onGave, onGot }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <Pressable style={[styles.btn, styles.gaveBtn]} onPress={onGave}>
        <AppText variant="label-sm" style={styles.gaveText}>
          YOU GAVE ₹
        </AppText>
      </Pressable>
      <Pressable style={[styles.btn, styles.gotBtn]} onPress={onGot}>
        <AppText variant="label-sm" style={styles.gotText}>
          YOU GOT ₹
        </AppText>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.cardBgDeep,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    zIndex: 50,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.cardBg,
  },
  gaveBtn: {},
  gotBtn: {},
  gaveText: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1,
    fontWeight: '600',
  },
  gotText: {
    color: colors.primary,
    letterSpacing: 1,
    fontWeight: '600',
  },
});
