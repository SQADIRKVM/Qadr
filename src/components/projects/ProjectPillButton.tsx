import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type PillVariant = 'default' | 'destructive' | 'primary';

interface ProjectPillButtonProps {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
  variant?: PillVariant;
  flex?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const ProjectPillButton: React.FC<ProjectPillButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'default',
  flex,
  fullWidth,
  disabled,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      if (disabled) return;
      hapticLight();
      onPress();
    }}
    disabled={disabled}
    style={({ pressed }) => [
      styles.pill,
      flex && styles.flex,
      fullWidth && styles.fullWidth,
      variant === 'primary' && styles.primary,
      variant === 'destructive' && styles.destructive,
      pressed && !disabled && styles.pressed,
      disabled && styles.disabled,
    ]}
  >
    <MaterialIcons
      name={icon}
      size={18}
      color={
        variant === 'primary'
          ? colors.onPrimary
          : variant === 'destructive'
            ? colors.onSurfaceVariant
            : colors.onSurfaceVariant
      }
    />
    <AppText
      variant="label-sm"
      style={[
        styles.label,
        variant === 'primary' && styles.labelPrimary,
        disabled && styles.labelDisabled,
      ]}
    >
      {label}
    </AppText>
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  destructive: {},
  pressed: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.onSurface,
    letterSpacing: 1,
    fontSize: 11,
  },
  labelPrimary: {
    color: colors.onPrimary,
  },
  labelDisabled: {
    color: colors.outline,
  },
});
