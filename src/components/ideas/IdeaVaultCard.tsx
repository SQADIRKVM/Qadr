import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import type { Idea } from '../../types';
import { getCategoryDisplayLabel, isIdeaLocked } from '../../utils/ideaVault';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface IdeaVaultCardProps {
  idea: Idea;
  onPress?: () => void;
}

const CARD_MIN_HEIGHT = 256;

export const IdeaVaultCard: React.FC<IdeaVaultCardProps> = ({ idea, onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const locked = isIdeaLocked(idea);
  const categoryLabel = getCategoryDisplayLabel(idea.category);
  const timeAgo = formatDistanceToNow(parseISO(idea.createdAt), { addSuffix: true });

  return (
    <BentoCard deep onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.categoryPill}>
          <AppText variant="label-sm" style={styles.categoryText}>
            {categoryLabel}
          </AppText>
        </View>
        {locked ? (
          <MaterialIcons name="lock" size={20} color={colors.onSurfaceVariant} />
        ) : (
          <View style={styles.lockSpacer} />
        )}
      </View>
      <View style={styles.body}>
        <AppText variant="headline-md" style={styles.title} numberOfLines={2}>
          {idea.title}
        </AppText>
        {idea.description ? (
          <AppText variant="body-md" muted style={styles.desc} numberOfLines={2}>
            {idea.description}
          </AppText>
        ) : null}
      </View>
      <View style={styles.footer}>
        <View style={styles.dot} />
        <AppText variant="label-sm" style={styles.time}>
          {timeAgo}
        </AppText>
      </View>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    minHeight: CARD_MIN_HEIGHT,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryPill: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lockSpacer: { width: 20 },
  body: { flex: 1, gap: 8 },
  title: { color: colors.onSurface },
  desc: { lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.onSurfaceVariant,
  },
  time: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
