import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { BrainDumpFAB } from './BrainDumpFAB';
import { IdeasFAB } from './IdeasFAB';
import { TAB_BAR } from '../../constants/layout';
import { isAssistantScreenFocused } from '../../navigation/assistantTabBar';
import { isFocusOverlayFocused } from '../../navigation/focusTabBar';
import type { RootTabParamList } from '../../navigation/types';
import { hapticLight } from '../../utils/haptics';
import { isWebPlatform } from '../../utils/webLayout';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const LABELS: Record<keyof RootTabParamList, string> = {
  Home: 'Home',
  Ideas: 'Ideas',
  Habits: 'Habits',
  Projects: 'Projects',
  More: 'More',
};

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const getIconName = (
  routeName: keyof RootTabParamList,
  focused: boolean,
): MaterialIconName => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Ideas':
      return 'lightbulb-outline';
    case 'Habits':
      return focused ? 'check-circle' : 'check-circle-outline';
    case 'Projects':
      return 'account-tree';
    case 'More':
      return 'more-horiz';
    default:
      return 'home';
  }
};

const TabBarIcon: React.FC<{
  routeName: keyof RootTabParamList;
  focused: boolean;
  color: string;
}> = ({ routeName, focused, color }) => {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.iconWrap}>
      {focused && <View style={styles.dot} />}
      <MaterialIcons
        name={getIconName(routeName, focused)}
        size={TAB_BAR.iconSize}
        color={color}
      />
    </View>
  );
};

export const WorkspaceTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const assistantBlend = isAssistantScreenFocused(state);

  if (isFocusOverlayFocused(state)) return null;

  if (!isMobile) {
    return (
      <View style={styles.shell}>
        <BrainDumpFAB tabState={state} />
        <IdeasFAB tabState={state} />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <BrainDumpFAB tabState={state} />
      <IdeasFAB tabState={state} />
      <View
        style={[
          styles.bar,
          assistantBlend && styles.barAssistant,
          {
            paddingBottom:
              TAB_BAR.paddingBottom + (isWebPlatform() ? 0 : insets.bottom),
            paddingTop: TAB_BAR.paddingTop,
            paddingHorizontal: TAB_BAR.paddingHorizontal,
          },
        ]}
      >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const routeName = route.name as keyof RootTabParamList;
        const color = focused ? colors.primary : colors.onSurfaceVariant;

        const onPress = () => {
          hapticLight();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={LABELS[routeName]}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <TabBarIcon routeName={routeName} focused={focused} color={color} />
            <Text style={[styles.label, { color }]}>{LABELS[routeName]}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  shell: {
    position: 'relative',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: TAB_BAR.backgroundColor,
    borderTopWidth: 1,
    borderTopColor: TAB_BAR.borderTopColor,
    borderTopLeftRadius: TAB_BAR.borderRadius,
    borderTopRightRadius: TAB_BAR.borderRadius,
    elevation: 0,
    ...(isWebPlatform() ? {} : { shadowOpacity: 0 }),
  },
  barAssistant: {
    backgroundColor: colors.background,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TAB_BAR.contentHeight,
    gap: 4,
  },
  tabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
    marginBottom: 4,
  },
  dot: {
    position: 'absolute',
    top: -4,
    width: TAB_BAR.dotSize,
    height: TAB_BAR.dotSize,
    borderRadius: TAB_BAR.dotSize / 2,
    backgroundColor: colors.tertiary,
  },
  label: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: TAB_BAR.labelSize,
    letterSpacing: 0.5,
  },
});
