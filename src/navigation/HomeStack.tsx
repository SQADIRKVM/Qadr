import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SettingsScreen } from '../screens/more/SettingsScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { MfaEnrollScreen } from '../screens/account/MfaEnrollScreen';
import { OneThingModal } from '../screens/home/OneThingModal';
import { BrainDumpScreen } from '../screens/home/BrainDumpScreen';
import { BrainDumpModal } from '../screens/home/BrainDumpModal';
import type { HomeStackParamList } from './types';
import { useColors } from '../theme/ThemeContext';
import { getWebScreenContainerStyle } from '../utils/webLayout';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  const colors = useColors();
  return (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: {
        ...getWebScreenContainerStyle(),
        backgroundColor: colors.background,
      },
    }}
  >
    <Stack.Screen name="Dashboard" component={HomeScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="MfaEnroll" component={MfaEnrollScreen} />
    <Stack.Screen
      name="OneThingModal"
      component={OneThingModal}
      options={{ presentation: 'modal', headerShown: false }}
    />
    <Stack.Screen name="BrainDump" component={BrainDumpScreen} />
    <Stack.Screen
      name="BrainDumpModal"
      component={BrainDumpModal}
      options={{ presentation: 'modal', headerShown: false }}
    />
  </Stack.Navigator>
  );
};
