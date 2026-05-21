import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {
  WEB_SAFE_AREA_INSETS,
  getWebSafeAreaInitialMetrics,
  isWebPlatform,
} from './webLayout';

/**
 * Web-only safe area: context providers only (no NativeSafeAreaProvider env probe).
 * Prevents emulated iOS insets from shrinking layout after mount.
 */
export const WebSafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metrics = useMemo(() => getWebSafeAreaInitialMetrics(), []);
  const frame = metrics?.frame ?? { x: 0, y: 0, width: 0, height: 0 };

  return (
    <SafeAreaFrameContext.Provider value={frame}>
      <SafeAreaInsetsContext.Provider value={WEB_SAFE_AREA_INSETS}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>{children}</View>
      </SafeAreaInsetsContext.Provider>
    </SafeAreaFrameContext.Provider>
  );
};

/** Native SafeAreaProvider; on web uses WebSafeAreaProvider (no env inset updates). */
export const AppSafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isWebPlatform()) {
    return <WebSafeAreaProvider>{children}</WebSafeAreaProvider>;
  }
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>{children}</SafeAreaProvider>
  );
};
