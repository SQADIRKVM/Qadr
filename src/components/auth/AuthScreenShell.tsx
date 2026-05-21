import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BREAKPOINTS } from '../../hooks/useResponsive';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const AUTH_CONTENT_MAX_WIDTH = 480;

/** Width of one onboarding page / auth column (matches shell inner width). */
export function useAuthPageWidth(): number {
  const { width } = useWindowDimensions();
  if (Platform.OS === 'web' && width >= BREAKPOINTS.md) {
    return Math.min(width, AUTH_CONTENT_MAX_WIDTH);
  }
  return width;
}

interface AuthScreenShellProps {
  children: React.ReactNode;
}

export const AuthScreenShell: React.FC<AuthScreenShellProps> = ({ children }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const capWidth = Platform.OS === 'web' && width >= BREAKPOINTS.md;

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.inner,
          capWidth && styles.innerCapped,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  innerCapped: {
    maxWidth: AUTH_CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
});
