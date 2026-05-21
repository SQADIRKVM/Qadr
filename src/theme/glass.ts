import { Platform, ViewStyle } from 'react-native';
import type { ColorPalette } from './palettes';
import { spacing } from './spacing';

const webGlass =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      } as ViewStyle)
    : {};

/** Frosted bento surface — uses page bg bleed-through; no extra section fill. */
export function glassCardBase(colors: ColorPalette): ViewStyle {
  const isLight = colors.background === '#F2F0EF';
  return {
    backgroundColor: isLight ? 'rgba(232, 230, 229, 0.75)' : 'rgba(28, 27, 27, 0.55)',
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: isLight ? 'rgba(26, 24, 24, 0.08)' : 'rgba(229, 226, 225, 0.1)',
    overflow: 'hidden',
    ...webGlass,
  };
}

export function glassCardDeep(colors: ColorPalette): ViewStyle {
  const base = glassCardBase(colors);
  const isLight = colors.background === '#F2F0EF';
  return {
    ...base,
    backgroundColor: isLight ? 'rgba(224, 221, 220, 0.85)' : 'rgba(18, 18, 18, 0.65)',
  };
}

export function glassModalSurface(colors: ColorPalette): ViewStyle {
  const isLight = colors.background === '#F2F0EF';
  return {
    backgroundColor: isLight ? 'rgba(242, 240, 239, 0.92)' : 'rgba(32, 32, 31, 0.85)',
    borderWidth: 1,
    borderColor: colors.modalBorder,
    ...webGlass,
  };
}
