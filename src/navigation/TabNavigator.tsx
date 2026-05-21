import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStack } from './HomeStack';
import { IdeasStack } from './IdeasStack';
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { MoreStack } from './MoreStack';
import { WorkspaceTabBar } from '../components/navigation/WorkspaceTabBar';
import { tabBarOptionsForRoute } from './tabBarOptions';
import type { RootTabParamList } from './types';
import { getWebScreenContainerStyle } from '../utils/webLayout';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <WorkspaceTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      lazy: true,
      ...(Platform.OS === 'web'
        ? {
            detachInactiveScreens: true,
            safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
            sceneContainerStyle: getWebScreenContainerStyle(),
          }
        : {}),
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={({ route }) =>
        tabBarOptionsForRoute(route, 'Dashboard', ['OneThingModal', 'BrainDumpModal'])
      }
    />
    <Tab.Screen name="Ideas" component={IdeasStack} />
    <Tab.Screen name="Habits" component={HabitsScreen} />
    <Tab.Screen name="Projects" component={ProjectsScreen} />
    <Tab.Screen
      name="More"
      component={MoreStack}
      options={({ route }) => tabBarOptionsForRoute(route, 'MoreMenu', ['FocusOverlay'])}
    />
  </Tab.Navigator>
);
