import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import type { MindItem } from '../../types';
import { getMindFormatBadge, getMindPlatformIcon, hasMindCarousel } from '../../utils/mindPlatformBadge';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindPlatformOverlayProps {
  item: MindItem;
}

export const MindPlatformOverlay: React.FC<MindPlatformOverlayProps> = ({ item }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const badge = getMindFormatBadge(item);
  const platform = badge?.platform ?? item.platform;
  if (!platform || platform === 'generic') return null;

  const icon = badge?.icon ?? getMindPlatformIcon(platform);
  const showCarousel = hasMindCarousel(item);

  return (
    <>
      <View style={[styles.chipBase, styles.platformChip]} pointerEvents="none">
        {platform === 'twitter' ? (
          <FontAwesome6 name="x-twitter" size={14} color={colors.onSurface} />
        ) : (
          <MaterialCommunityIcons name={icon} size={16} color={colors.onSurface} />
        )}
      </View>
      {showCarousel ? (
        <View style={[styles.chipBase, styles.carouselChip]} pointerEvents="none">
          <MaterialCommunityIcons name="layers" size={14} color={colors.onSurface} />
        </View>
      ) : null}
    </>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  chipBase: {
    position: 'absolute' as const,
    padding: 6,
    borderRadius: spacing.pillRadius,
    backgroundColor: 'rgba(26, 26, 26, 0.72)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  platformChip: {
    top: spacing.sm,
    left: spacing.sm,
  },
  carouselChip: {
    top: spacing.sm,
    right: spacing.sm,
  },
});
