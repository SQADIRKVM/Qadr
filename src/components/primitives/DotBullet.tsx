import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DotBulletProps {
  color?: string;
  size?: number;
}

export const DotBullet: React.FC<DotBulletProps> = ({
  color,
  size = 4,
}) => {
  const colors = useColors();
  const fill = color ?? colors.primary;
  return (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: fill,
      marginRight: 12,
      marginTop: 8,
    }}
  />
  );
};
