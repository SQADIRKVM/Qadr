import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Platform } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ColorPalette } from '../theme/palettes';

const SPLASH_LOGO = require('../../assets/splash-icon.png');
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1200,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinish, opacity, scale]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Image source={SPLASH_LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});
