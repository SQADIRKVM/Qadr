/** Workspace bottom tab bar layout (matches More HTML mock). */
export const TAB_BAR = {
  paddingTop: 8,
  paddingBottom: 16,
  paddingHorizontal: 16,
  contentHeight: 56,
  borderRadius: 16,
  iconSize: 24,
  labelSize: 10,
  dotSize: 4,
  backgroundColor: 'rgba(32, 32, 31, 0.6)',
  borderTopColor: 'rgba(76, 69, 70, 0.3)',
} as const;

export const getTabBarHeight = (safeAreaBottom: number) =>
  TAB_BAR.paddingTop + TAB_BAR.contentHeight + TAB_BAR.paddingBottom + safeAreaBottom;
