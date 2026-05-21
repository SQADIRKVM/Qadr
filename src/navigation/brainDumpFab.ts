import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { NavigationState, PartialState } from '@react-navigation/native';
type NavState = NavigationState | PartialState<NavigationState> | undefined;

/** Brain Dump FAB only on Home → Dashboard (mobile workspace). */
export function shouldShowBrainDumpFab(state: NavState): boolean {
  if (!state?.routes?.length) return false;

  const tabRoute = state.routes[state.index ?? 0];
  if (!tabRoute || tabRoute.name !== 'Home') return false;

  const homeFocused =
    getFocusedRouteNameFromRoute(tabRoute as Parameters<typeof getFocusedRouteNameFromRoute>[0]) ??
    'Dashboard';

  return homeFocused === 'Dashboard';
}
