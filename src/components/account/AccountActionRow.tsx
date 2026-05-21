import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AccountActionRowProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  destructive?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  divider?: boolean;
}

export const AccountActionRow: React.FC<AccountActionRowProps> = ({
  label,
  onPress,
  loading,
  destructive,
  icon,
  divider = true,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress();
    }}
    disabled={loading}
    style={({ pressed }) => [
      styles.row,
      divider && styles.divider,
      pressed && styles.pressed,
    ]}
  >
    {icon ? (
      <MaterialIcons
        name={icon}
        size={20}
        color={destructive ? colors.accentRed : colors.onSurfaceVariant}
      />
    ) : null}
    <AppText
      variant="body-md"
      style={[styles.label, destructive && styles.destructiveLabel]}
    >
      {label}
    </AppText>
    {loading ? (
      <ActivityIndicator size="small" color={destructive ? colors.accentRed : colors.primary} />
    ) : (
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={destructive ? colors.accentRed : colors.outline}
      />
    )}
  </Pressable>
);
}

interface AccountDangerButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
}

/** Compact destructive CTA — red border and text. */
export const AccountDangerButton: React.FC<AccountDangerButtonProps> = ({
  label,
  onPress,
  loading,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress();
    }}
    disabled={loading}
    style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed]}
  >
    {loading ? (
      <ActivityIndicator size="small" color={colors.accentRed} />
    ) : (
      <AppText variant="label-sm" style={styles.dangerLabel}>
        {label}
      </AppText>
    )}
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  pressed: { opacity: 0.75 },
  label: { flex: 1, color: colors.onSurface },
  destructiveLabel: { color: colors.accentRed },
  dangerBtn: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    paddingVertical: 12,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentRed,
    backgroundColor: 'rgba(255, 0, 49, 0.08)',
    alignItems: 'center',
  },
  dangerLabel: {
    color: colors.accentRed,
    letterSpacing: 0.5,
  },
});
