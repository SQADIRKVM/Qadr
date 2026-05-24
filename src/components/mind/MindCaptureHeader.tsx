import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import type { TextVariant } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindCaptureHeaderProps {
  count: number;
  onRediscoverPress: () => void;
  onSpacesPress: () => void;
  onBackFromSpaces?: () => void;
  showingSpaces?: boolean;
  activeSpaceName?: string | null;
  onClearSpace?: () => void;
}

export const MindCaptureHeader: React.FC<MindCaptureHeaderProps> = ({
  count,
  onRediscoverPress,
  onSpacesPress,
  onBackFromSpaces,
  showingSpaces,
  activeSpaceName,
  onClearSpace,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { titleVariant } = useResponsive();

  const titleText = activeSpaceName ? activeSpaceName : 'My Mind';

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <AppText variant={titleVariant as TextVariant} style={styles.title}>
          {titleText}
        </AppText>
        <View style={styles.badge}>
          <AppText variant="label-sm" style={styles.badgeText}>
            {count}
          </AppText>
        </View>
      </View>
      <AppText variant="body-lg" muted style={styles.subtitle}>
        {activeSpaceName ? `Showing captures grouped in "${activeSpaceName}".` : 'Links, notes, and images in one place.'}
      </AppText>
      <View style={styles.links}>
        {showingSpaces && onBackFromSpaces ? (
          <Pressable onPress={onBackFromSpaces}>
            <AppText variant="label-sm" style={styles.link}>
              ALL CAPTURES →
            </AppText>
          </Pressable>
        ) : (
          <>
            {activeSpaceName && onClearSpace ? (
              <Pressable onPress={onClearSpace}>
                <AppText variant="label-sm" style={styles.linkDanger}>
                  ALL CAPTURES (CLEAR) ✕
                </AppText>
              </Pressable>
            ) : null}
            <Pressable onPress={onRediscoverPress}>
              <AppText variant="label-sm" style={styles.link}>
                REDISCOVER →
              </AppText>
            </Pressable>
            <Pressable onPress={onSpacesPress}>
              <AppText variant="label-sm" style={styles.link}>
                SPACES →
              </AppText>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    color: colors.primary,
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 4,
  },
  badgeText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1,
  },
  subtitle: {
    lineHeight: 26,
    maxWidth: 640,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  link: {
    color: colors.primary,
    letterSpacing: 2,
  },
  linkDanger: {
    color: colors.onTertiaryContainer,
    letterSpacing: 2,
  },
});
