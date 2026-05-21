import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
} from 'react-native';
import { AppText } from '../primitives/AppText';
import { GoogleLogoIcon } from './GoogleLogoIcon';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface GoogleSignInButtonProps extends Omit<PressableProps, 'style'> {
  loading?: boolean;
  style?: ViewStyle;
  label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  loading,
  onPress,
  disabled,
  style,
  label = 'Continue with Google',
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
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : (
        <>
          <GoogleLogoIcon size={22} />
          <AppText variant="label-sm" style={styles.label}>
            {label.toUpperCase()}
          </AppText>
        </>
      )}
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  base: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: 'rgba(229, 226, 225, 0.25)',
  },
  label: {
    color: '#1F1F1F',
    letterSpacing: 0.6,
  },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.5 },
});
