import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ScrollView as RNScrollView,
  ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DotMatrixBackground } from './DotMatrixBackground';
import { QadirTopBar } from './QadirTopBar';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { ResponsiveContainer } from './ResponsiveContainer';
import { useResponsive } from '../../hooks/useResponsive';
import { isWebPlatform } from '../../utils/webLayout';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const ShellScrollView = Platform.OS === 'web' ? RNScrollView : GHScrollView;

interface ScreenShellProps {
  children: React.ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  header?: 'qadr' | 'workspace' | 'none';
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  edges?: ('top' | 'bottom')[];
  /** When true, children are not wrapped in ResponsiveContainer (e.g. full-bleed lists). */
  fullWidth?: boolean;
  /** When true, omit shell bottom padding (screen manages its own footer inset). */
  skipBottomInset?: boolean;
}

export const ScreenShell: React.FC<ScreenShellProps> = ({
  children,
  scroll = true,
  scrollProps,
  header = 'qadr',
  onSettingsPress,
  showBack,
  onBack,
  edges = ['top'],
  fullWidth = false,
  skipBottomInset = false,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { bottomInset, horizontalPadding } = useResponsive();

  const inner = fullWidth ? (
    children
  ) : (
    <ResponsiveContainer
      style={
        (!scroll
          ? [styles.containerInner, styles.containerFlex]
          : styles.containerInner) as ViewStyle
      }
    >
      {children}
    </ResponsiveContainer>
  );

  const scrollContentStyle = [
    styles.scroll,
    {
      paddingHorizontal: fullWidth ? horizontalPadding : 0,
      // Tab scenes use flex hosts (scroll=false); tab bar is already below the scene.
      paddingBottom: skipBottomInset || !scroll ? 0 : bottomInset,
    },
    scrollProps?.contentContainerStyle,
  ];

  const content = scroll ? (
    <ShellScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={scrollContentStyle}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      {...scrollProps}
    >
      {inner}
    </ShellScrollView>
  ) : (
    <View style={[styles.scrollHost, scrollContentStyle]}>{inner}</View>
  );

  const shellBody = (
    <>
      <DotMatrixBackground />
      {header === 'workspace' ? (
        <WorkspaceTopBar />
      ) : header === 'qadr' ? (
        <QadirTopBar
          onSettingsPress={onSettingsPress}
          showBack={showBack}
          onBack={onBack}
        />
      ) : null}
      {content}
    </>
  );

  if (isWebPlatform()) {
    return <View style={styles.safe}>{shellBody}</View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {shellBody}
    </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? { minHeight: 0 } : {}),
  },
  scroll: { flexGrow: 1, width: '100%' },
  scrollView: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { overflow: 'scroll' as const } : {}),
  },
  scrollHost: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { overflow: 'scroll' as const } : {}),
  },
  containerInner: { width: '100%' },
  containerFlex: { flex: 1, minHeight: 0 },
});
