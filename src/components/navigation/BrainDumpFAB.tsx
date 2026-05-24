import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NavigationState, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { shouldShowBrainDumpFab } from '../../navigation/brainDumpFab';
import { useResponsive } from '../../hooks/useResponsive';
import type { RootTabParamList } from '../../navigation/types';
import { fabShadow } from '../../theme/shadows';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface BrainDumpFABProps {
  tabState: NavigationState<ParamListBase>;
}

export const BrainDumpFAB: React.FC<BrainDumpFABProps> = ({ tabState }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { isMobile, horizontalPadding, fabBottom } = useResponsive();
  const showFab = shouldShowBrainDumpFab(tabState);

  if (!showFab) return null;

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
        navigation.navigate('Home', { screen: 'BrainDump' });
      }}
    >
      <Ionicons name="add" size={28} color={colors.primaryContainer} />
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
    ...fabShadow,
  },
});
