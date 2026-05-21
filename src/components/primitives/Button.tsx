import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
} from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'cta';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading,
  onPress,
  disabled,
  style,
  ...rest
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    hapticLight();
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => {
        const base = [
          styles.base,
          variant === 'primary' ? styles.primary : undefined,
          variant === 'secondary' || variant === 'cta' ? styles.secondary : undefined,
          variant === 'destructive' ? styles.destructive : undefined,
          pressed ? styles.pressed : undefined,
          disabled ? styles.disabled : undefined,
        ];
        return [...base, style];
      }}
      {...rest}
    >
      {variant === 'cta' && <View style={styles.ctaDot} />}
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : (
        <AppText
          variant="label-sm"
          style={[
            variant === 'primary' && { color: colors.onPrimary },
            variant === 'destructive' && { color: colors.onSurface },
            variant !== 'primary' && variant !== 'destructive' && { color: colors.onSurface },
          ]}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  base: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.pillRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  destructive: { backgroundColor: colors.accentRed },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  ctaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentRed,
  },
});
