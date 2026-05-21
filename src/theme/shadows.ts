import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

export interface PlatformShadowOptions {
  color?: string;
  offset?: { width: number; height: number };
  opacity?: number;
  radius?: number;
  elevation?: number;
}

/** Native shadow* on iOS/Android; boxShadow on web (avoids RN Web deprecation warnings). */
export function platformShadow({
  color = colors.black,
  offset = { width: 0, height: 4 },
  opacity = 0.25,
  radius = 8,
  elevation = 4,
}: PlatformShadowOptions = {}): ViewStyle {
  if (Platform.OS === 'web') {
    const r = parseInt(color.slice(1, 3), 16) || 0;
    const g = parseInt(color.slice(3, 5), 16) || 0;
    const b = parseInt(color.slice(5, 7), 16) || 0;
    const a = color.length >= 9 ? parseInt(color.slice(7, 9), 16) / 255 : opacity;
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(${r}, ${g}, ${b}, ${a})`,
    } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

export const fabShadow = platformShadow({
  color: colors.onTertiaryContainer,
  offset: { width: 0, height: 8 },
  opacity: 0.35,
  radius: 16,
  elevation: 8,
});

export const glowShadow = platformShadow({
  color: colors.onTertiaryContainer,
  offset: { width: 0, height: 0 },
  opacity: 0.25,
  radius: 8,
  elevation: 0,
});
