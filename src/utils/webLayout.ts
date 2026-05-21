import { Platform, type ViewStyle } from 'react-native';
import type { EdgeInsets, Metrics } from 'react-native-safe-area-context';

export const WEB_SAFE_AREA_INSETS: EdgeInsets = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}

/** Bounded flex container for stack/tab scenes so inner ScrollViews can scroll on web. */
export function getWebScreenContainerStyle(): ViewStyle {
  return { flex: 1, minHeight: 0, width: '100%' };
}

/** Full-viewport root style for Expo web (avoids letterboxing under emulated safe areas). */
export function getWebRootStyle(): ViewStyle {
  return {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: '100dvh' as ViewStyle['minHeight'],
  };
}

/** Zero insets + full window frame so navigation fills the viewport on web. */
export function getWebSafeAreaInitialMetrics(): Metrics | undefined {
  if (!isWebPlatform() || typeof window === 'undefined') return undefined;
  return {
    frame: {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    insets: WEB_SAFE_AREA_INSETS,
  };
}
