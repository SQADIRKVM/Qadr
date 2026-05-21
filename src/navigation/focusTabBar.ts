import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { NavigationState, PartialState } from '@react-navigation/native';

type NavState = NavigationState | PartialState<NavigationState> | undefined;

/** True when More → Focus Overlay (active deep work) is the focused screen. */
export function isFocusOverlayFocused(state: NavState): boolean {
  if (!state?.routes?.length) return false;

  const tabRoute = state.routes[state.index ?? 0];
  if (!tabRoute || tabRoute.name !== 'More') return false;

  const moreFocused =
    getFocusedRouteNameFromRoute(
      tabRoute as Parameters<typeof getFocusedRouteNameFromRoute>[0],
    ) ?? 'MoreMenu';

  return moreFocused === 'FocusOverlay';
}
