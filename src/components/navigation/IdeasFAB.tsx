import React from 'react';
import { Pressable, StyleSheet, Platform, View } from 'react-native';
import type { NavigationState, ParamListBase } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { shouldShowIdeasFab } from '../../navigation/ideasFab';
import { useIdeaUiStore } from '../../stores/useIdeaUiStore';
import { useResponsive } from '../../hooks/useResponsive';
import { fabShadow } from '../../theme/shadows';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface IdeasFABProps {
  tabState: NavigationState<ParamListBase>;
}

export const IdeasFAB: React.FC<IdeasFABProps> = ({ tabState }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile, horizontalPadding, fabBottom } = useResponsive();
  const viewMode = useIdeaUiStore((s) => s.viewMode);
  const requestAddSheet = useIdeaUiStore((s) => s.requestAddSheet);
  const requestMindSheet = useIdeaUiStore((s) => s.requestMindSheet);
  const showFab = shouldShowIdeasFab(tabState);

  if (!isMobile || !showFab) return null;

  return (
    <Pressable
      style={[
        styles.fab,
        {
          right: horizontalPadding,
          bottom: fabBottom,
        },
      ]}
      onPress={() => {
        hapticLight();
        if (viewMode === 'mind') requestMindSheet();
        else requestAddSheet();
      }}
    >
      <MaterialIcons name="add" size={28} color={colors.primaryContainer} />
      <View style={styles.dot} />
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...fabShadow,
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.tertiary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
