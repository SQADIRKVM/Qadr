import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MoreMenuScreen } from '../screens/more/MoreMenuScreen';
import { MoneyScreen } from '../screens/more/MoneyScreen';
import { ContactLedgerScreen } from '../screens/more/ContactLedgerScreen';
import { BlockModeScreen } from '../screens/more/BlockModeScreen';
import { FocusOverlayScreen } from '../screens/more/FocusOverlayScreen';
import { DecisionsScreen } from '../screens/more/DecisionsScreen';
import { WeeklyReviewScreen } from '../screens/more/WeeklyReviewScreen';
import { AssistantScreen } from '../screens/more/AssistantScreen';
import { SettingsScreen } from '../screens/more/SettingsScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { MfaEnrollScreen } from '../screens/account/MfaEnrollScreen';
import { BioSyncHealthScreen } from '../screens/more/BioSyncHealthScreen';
import type { MoreStackParamList } from './types';
import { useColors } from '../theme/ThemeContext';
import { getWebScreenContainerStyle } from '../utils/webLayout';

const Stack = createStackNavigator<MoreStackParamList>();

export const MoreStack = () => {
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
    <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
    <Stack.Screen name="Money" component={MoneyScreen} />
    <Stack.Screen name="MoneyContact" component={ContactLedgerScreen} />
    <Stack.Screen name="BlockMode" component={BlockModeScreen} />
    <Stack.Screen
      name="FocusOverlay"
      component={FocusOverlayScreen}
      options={{ presentation: 'modal', gestureEnabled: false }}
    />
    <Stack.Screen name="Decisions" component={DecisionsScreen} />
    <Stack.Screen name="WeeklyReview" component={WeeklyReviewScreen} />
    <Stack.Screen name="Assistant" component={AssistantScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
    <Stack.Screen name="MfaEnroll" component={MfaEnrollScreen} />
    <Stack.Screen name="BioSyncHealth" component={BioSyncHealthScreen} />
  </Stack.Navigator>
  );
};
