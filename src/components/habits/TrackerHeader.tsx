import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import type { TextVariant } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { TrackerSegmentedControl, type TrackerTab } from './TrackerSegmentedControl';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface TrackerHeaderProps {
  tab: TrackerTab;
  onTabChange: (tab: TrackerTab) => void;
}

export const TrackerHeader: React.FC<TrackerHeaderProps> = ({ tab, onTabChange }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { titleVariant, isMobile } = useResponsive();

  return (
    <View style={[styles.wrap, !isMobile && styles.wrapWide]}>
      <AppText variant={titleVariant as TextVariant} style={styles.title}>
        Daily Tracker
      </AppText>
      <TrackerSegmentedControl value={tab} onChange={onTabChange} />
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  wrapWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.primary,
    letterSpacing: -0.5,
  },
});
