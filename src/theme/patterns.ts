import { ViewStyle } from 'react-native';
import type { ColorPalette } from './palettes';

export function ghostHighlight(colors: ColorPalette): ViewStyle {
  const isLight = colors.background === '#F2F0EF';
  return {
    borderTopWidth: 1,
    borderTopColor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
  };
}

export function dotMatrixDotColor(colors: ColorPalette): string {
  return colors.surfaceContainerHighest;
}
