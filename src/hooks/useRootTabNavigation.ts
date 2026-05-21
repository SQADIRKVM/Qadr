import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';

const TAB_ROUTE_NAMES = new Set<keyof RootTabParamList>([
  'Home',
  'Ideas',
  'Habits',
  'Projects',
  'More',
]);

function isTabNavigatorState(
  state: { type?: string; routeNames?: string[] } | undefined,
): boolean {
  if (!state) return false;
  if (state.type === 'tab') return true;
  return (
    state.routeNames?.some((name) =>
      TAB_ROUTE_NAMES.has(name as keyof RootTabParamList),
    ) ?? false
  );
}

function findTabNavigator(
  navigation: NavigationProp<ParamListBase>,
): BottomTabNavigationProp<RootTabParamList> | undefined {
  let nav: NavigationProp<ParamListBase> | undefined = navigation;
  while (nav) {
    if (isTabNavigatorState(nav.getState())) {
      return nav as BottomTabNavigationProp<RootTabParamList>;
    }
    nav = nav.getParent() as NavigationProp<ParamListBase> | undefined;
  }
  return undefined;
}

/** Resolves the root bottom-tab navigator from any nested stack screen. */
export function useRootTabNavigation() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const tabNavigation = useMemo(
    () => findTabNavigator(navigation),
    [navigation],
  );

  const readActiveTab = () => {
    const state = tabNavigation?.getState();
    if (!state?.routes?.length) return undefined;
    const name = state.routes[state.index ?? 0]?.name;
    return TAB_ROUTE_NAMES.has(name as keyof RootTabParamList)
      ? (name as keyof RootTabParamList)
      : undefined;
  };

  const [activeTabName, setActiveTabName] = useState<
    keyof RootTabParamList | undefined
  >(readActiveTab);

  useEffect(() => {
    setActiveTabName(readActiveTab());
    if (!tabNavigation) return;
    const unsubscribe = tabNavigation.addListener('state', () => {
      setActiveTabName(readActiveTab());
    });
    return unsubscribe;
  }, [tabNavigation]);

  return { tabNavigation, activeTabName };
}
