import { colors } from './colors';

export const elevation = {
  level0: { backgroundColor: colors.background },
  level1: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  level2: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.modalBorder,
  },
  level3: {
    borderColor: colors.cardBorderHover,
  },
} as const;
