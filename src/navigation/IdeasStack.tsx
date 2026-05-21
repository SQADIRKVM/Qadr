import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { IdeaVaultScreen } from '../screens/ideas/IdeaVaultScreen';
import { SundayReviewScreen } from '../screens/ideas/SundayReviewScreen';
import { MindFocusScreen } from '../screens/ideas/MindFocusScreen';
import { MindSerendipityScreen } from '../screens/ideas/MindSerendipityScreen';
import type { IdeasStackParamList } from './types';
import { useColors } from '../theme/ThemeContext';
import { getWebScreenContainerStyle } from '../utils/webLayout';

const Stack = createStackNavigator<IdeasStackParamList>();

export const IdeasStack = () => {
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
    <Stack.Screen name="IdeaVault" component={IdeaVaultScreen} />
    <Stack.Screen name="SundayReview" component={SundayReviewScreen} />
    <Stack.Screen name="MindFocus" component={MindFocusScreen} />
    <Stack.Screen name="MindSerendipity" component={MindSerendipityScreen} />
  </Stack.Navigator>
  );
};
