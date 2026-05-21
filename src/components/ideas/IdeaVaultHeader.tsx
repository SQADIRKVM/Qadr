import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import type { TextVariant } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface IdeaVaultHeaderProps {
  count: number;
  showSundayReview?: boolean;
  onSundayReviewPress?: () => void;
}

export const IdeaVaultHeader: React.FC<IdeaVaultHeaderProps> = ({
  count,
  showSundayReview,
  onSundayReviewPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { titleVariant } = useResponsive();

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <AppText variant={titleVariant as TextVariant} style={styles.title}>
          Idea Vault
        </AppText>
        <View style={styles.badge}>
          <AppText variant="label-sm" style={styles.badgeText}>
            {count}
          </AppText>
        </View>
      </View>
      <AppText variant="body-lg" muted style={styles.subtitle}>
        A secure repository for unrefined concepts, structural theories, and architectural
        fragments.
      </AppText>
      {showSundayReview && onSundayReviewPress ? (
        <Pressable onPress={onSundayReviewPress}>
          <AppText variant="label-sm" style={styles.sundayLink}>
            SUNDAY REVIEW →
          </AppText>
        </Pressable>
      ) : null}
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
  sundayLink: {
    color: colors.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
});
