import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight } from '../constants/layout';
import { shouldShowBrainDumpFab } from '../navigation/brainDumpFab';
import { shouldShowIdeasFab } from '../navigation/ideasFab';

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1200,
} as const;

export const LAYOUT = {
  containerMax: 1200,
  marginMobile: 16,
  marginDesktop: 48,
  gutter: 24,
} as const;

const FAB_SIZE = 56;
const FAB_GAP = 12;
const SCROLL_GAP = 16;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const showBrainDumpFab = useNavigationState(shouldShowBrainDumpFab);
  const showIdeasFab = useNavigationState(shouldShowIdeasFab);

  return useMemo(() => {
    const isSm = width < BREAKPOINTS.sm;
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;
    const isWide = width >= BREAKPOINTS.xl;

    const horizontalPadding = isMobile ? LAYOUT.marginMobile : LAYOUT.marginDesktop;
    const contentWidth = Math.min(width, LAYOUT.containerMax);
    const gutter = LAYOUT.gutter;

    const ringSize = isSm ? 88 : isMobile ? 104 : isTablet ? 120 : 128;
    const ringStroke = isMobile ? 5 : 6;
    const heroMinHeight = isMobile ? 220 : isTablet ? 260 : 280;
    const cardPadding = isMobile ? 20 : isTablet ? 24 : 32;
    const titleVariant = isDesktop ? 'headline-lg' : 'headline-lg-mobile';

    const tabBarHeight = getTabBarHeight(Platform.OS === 'web' ? 0 : insets.bottom);
    const fabBottom = isMobile ? tabBarHeight + FAB_GAP : isDesktop ? 24 : 32;
    const fabClearance = tabBarHeight + FAB_SIZE + FAB_GAP;
    const bottomInset = isMobile
      ? showBrainDumpFab || showIdeasFab
        ? fabClearance
        : tabBarHeight + SCROLL_GAP
      : 32;

    /** FlashList padding inside tab scenes (tab bar is outside scene; only clear FAB). */
    const listBottomPadding =
      showBrainDumpFab || showIdeasFab
        ? FAB_SIZE + FAB_GAP + SCROLL_GAP
        : SCROLL_GAP;

    const bentoColumns = isMobile ? 1 : 2;

    return {
      width,
      height,
      isSm,
      isMobile,
      isTablet,
      isDesktop,
      isWide,
      horizontalPadding,
      contentWidth,
      gutter,
      ringSize,
      ringStroke,
      heroMinHeight,
      cardPadding,
      titleVariant,
      tabBarHeight,
      fabBottom,
      bottomInset,
      listBottomPadding,
      bentoColumns,
      showTabBar: isMobile,
    };
  }, [width, height, insets.bottom, showBrainDumpFab, showIdeasFab]);
}

export type Responsive = ReturnType<typeof useResponsive>;
