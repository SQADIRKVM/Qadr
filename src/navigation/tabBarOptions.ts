import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootTabParamList } from './types';

const hiddenTabBarStyle = { display: 'none' as const };

/** Hide tab bar only on full-screen modals; visible on all other stack pushes. */
export function tabBarOptionsForRoute<RouteName extends keyof RootTabParamList>(
  route: RouteProp<RootTabParamList, RouteName>,
  defaultScreen: string,
  hideWhenFocused: string[],
) {
  const focused = getFocusedRouteNameFromRoute(route) ?? defaultScreen;
  if (hideWhenFocused.includes(focused)) {
    return { tabBarStyle: hiddenTabBarStyle };
  }
  return {};
}
