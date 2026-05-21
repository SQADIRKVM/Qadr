import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenNative from 'expo-splash-screen';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useStoreHydration } from './src/hooks/useStoreHydration';
import { useAuthBootstrap } from './src/hooks/useAuthBootstrap';
import { useCloudBootstrap } from './src/hooks/useCloudBootstrap';
import { useCloudSync } from './src/hooks/useCloudSync';
import { useHealthDeviceBootstrap } from './src/hooks/useHealthDeviceBootstrap';
import { ThemeProvider, useColors, useThemeMode } from './src/theme/ThemeContext';
import { useThemedStyles } from './src/theme/useThemedStyles';
import type { ColorPalette } from './src/theme/palettes';
import { setupNotificationCategories } from './src/services/notifications';
import { getWebRootStyle, isWebPlatform } from './src/utils/webLayout';
import { AppSafeAreaProvider } from './src/utils/webSafeAreaProvider';
import { DialogHost } from './src/components/dialog';

SplashScreenNative.preventAutoHideAsync().catch(() => undefined);

function AppContent() {
  const colors = useColors();
  const appearance = useThemeMode();
  const styles = useThemedStyles(createStyles);
  const hydrated = useStoreHydration();
  const [splashDone, setSplashDone] = useState(false);
  useAuthBootstrap();
  useCloudBootstrap();
  useCloudSync();
  useHealthDeviceBootstrap();

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  const ready = fontsLoaded && hydrated;

  const navTheme = useMemo(() => {
    const base = appearance === 'light' ? DefaultTheme : DarkTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.background,
        text: colors.onSurface,
        border: colors.cardBorder,
        primary: colors.primary,
      },
    };
  }, [appearance, colors]);

  useEffect(() => {
    setupNotificationCategories();
  }, []);

  useEffect(() => {
    if (isWebPlatform() && typeof document !== 'undefined') {
      document.title = 'Qadr';
    }
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreenNative.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!splashDone) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={[styles.root, isWebPlatform() ? getWebRootStyle() : undefined]}>
      <AppSafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style={appearance === 'light' ? 'dark' : 'light'} />
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
          </NavigationContainer>
          <DialogHost />
        </BottomSheetModalProvider>
      </AppSafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    loading: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
