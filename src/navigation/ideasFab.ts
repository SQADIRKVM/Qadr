import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { NavigationState, PartialState } from '@react-navigation/native';

type NavState = NavigationState | PartialState<NavigationState> | undefined;

/** Ideas add FAB only on Ideas → IdeaVault (mobile). */
export function shouldShowIdeasFab(state: NavState): boolean {
  if (!state?.routes?.length) return false;

  const tabRoute = state.routes[state.index ?? 0];
  if (!tabRoute || tabRoute.name !== 'Ideas') return false;

  const ideasFocused =
    getFocusedRouteNameFromRoute(tabRoute as Parameters<typeof getFocusedRouteNameFromRoute>[0]) ??
    'IdeaVault';

  return ideasFocused === 'IdeaVault';
}
