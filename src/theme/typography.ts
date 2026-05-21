import { TextStyle } from 'react-native';

export type TextVariant =
  | 'headline-xl'
  | 'headline-lg'
  | 'headline-lg-mobile'
  | 'headline-md'
  | 'label-sm'
  | 'body-lg'
  | 'body-md'
  | 'mono-lg'
  | 'mono-md'
  | 'mono-sm';

export const fontFamilies = {
  grotesk: 'SpaceGrotesk_500Medium',
  groteskBold: 'SpaceGrotesk_700Bold',
  groteskMedium: 'SpaceGrotesk_500Medium',
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const typography: Record<TextVariant, TextStyle> = {
  'headline-xl': {
    fontFamily: fontFamilies.groteskBold,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -1.28,
    lineHeight: 70,
  },
  'headline-lg': {
    fontFamily: fontFamilies.groteskMedium,
    fontSize: 40,
    fontWeight: '500',
    letterSpacing: -0.4,
    lineHeight: 48,
  },
  'headline-lg-mobile': {
    fontFamily: fontFamilies.groteskBold,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.32,
    lineHeight: 38,
  },
  'headline-md': {
    fontFamily: fontFamilies.groteskMedium,
    fontSize: 20,
    fontWeight: '500',
  },
  'label-sm': {
    fontFamily: fontFamilies.groteskBold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  'body-lg': {
    fontFamily: fontFamilies.inter,
    fontSize: 18,
    lineHeight: 28.8,
  },
  'body-md': {
    fontFamily: fontFamilies.inter,
    fontSize: 16,
    lineHeight: 24,
  },
  'mono-lg': {
    fontFamily: fontFamilies.mono,
    fontSize: 32,
  },
  'mono-md': {
    fontFamily: fontFamilies.mono,
    fontSize: 20,
  },
  'mono-sm': {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
  },
};
