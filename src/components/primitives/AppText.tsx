import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography, TextVariant } from '../../theme/typography';
import { useColors } from '../../theme/ThemeContext';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  muted?: boolean;
  accent?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body-md',
  muted,
  accent,
  style,
  children,
  ...rest
}) => {
  const colors = useColors();
  const textScale = useSettingsStore((s) => s.textScale);
  const scale = textScale === 'large' ? 1.12 : 1;
  const base = typography[variant];
  const scaled =
    scale === 1
      ? base
      : {
          ...base,
          fontSize: Math.round((base.fontSize ?? 14) * scale),
          lineHeight: base.lineHeight
            ? Math.round(base.lineHeight * scale)
            : undefined,
        };

  const defaultColor =
    variant === 'label-sm' ? colors.onSurfaceVariant : colors.onSurface;

  return (
    <Text
      style={[
        scaled,
        { color: defaultColor },
        muted && { color: colors.outline },
        accent && { color: colors.accentRed },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
