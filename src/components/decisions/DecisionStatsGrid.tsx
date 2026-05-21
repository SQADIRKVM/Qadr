import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import {
  getConfidenceAggregatePercent,
  getDecisionsAddedThisWeek,
  getPendingCount,
} from '../../utils/decisionStats';
import type { Decision } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DecisionStatsGridProps {
  decisions: Decision[];
}

export const DecisionStatsGrid: React.FC<DecisionStatsGridProps> = ({ decisions }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile, gutter } = useResponsive();
  const aggregate = getConfidenceAggregatePercent(decisions);
  const total = decisions.length;
  const thisWeek = getDecisionsAddedThisWeek(decisions);
  const pending = getPendingCount(decisions);

  const aggregateCard = (
    <BentoCard style={[styles.card, styles.aggregateCard]}>
      <View style={styles.aggregateInner}>
        <AppText variant="label-sm" style={styles.aggregateLabel}>
          CONFIDENCE AGGREGATE
        </AppText>
        <AppText variant="headline-xl" style={styles.aggregateValue}>
          {aggregate}%
        </AppText>
        <AppText variant="body-md" muted style={styles.aggregateDesc}>
          Global system stability index based on logged architectural shifts.
        </AppText>
      </View>
      <View style={styles.aggregateIcon} pointerEvents="none">
        <MaterialIcons name="analytics" size={128} color="rgba(198, 198, 198, 0.12)" />
      </View>
    </BentoCard>
  );

  const totalCard = (
    <BentoCard deep style={styles.card}>
      <AppText variant="label-sm" style={styles.statLabel}>
        TOTAL DECISIONS
      </AppText>
      <AppText variant="headline-md" style={styles.statValue}>
        {total}
      </AppText>
      <View style={styles.statFooter}>
        <AppText variant="label-sm" style={styles.statFooterPrimary}>
          +{thisWeek} THIS WEEK
        </AppText>
      </View>
    </BentoCard>
  );

  const pendingCard = (
    <BentoCard deep style={styles.card}>
      <AppText variant="label-sm" style={styles.statLabel}>
        PENDING REVIEW
      </AppText>
      <AppText variant="headline-md" style={styles.statValue}>
        {pending}
      </AppText>
      <View style={styles.statFooter}>
        <AppText
          variant="label-sm"
          style={pending > 0 ? styles.statFooterUrgent : styles.statFooterMuted}
        >
          {pending > 0 ? 'URGENT ACTION' : 'ALL CLEAR'}
        </AppText>
      </View>
    </BentoCard>
  );

  if (isMobile) {
    return (
      <View style={[styles.grid, { gap: gutter, marginTop: spacing.lg }]}>
        {aggregateCard}
        {totalCard}
        {pendingCard}
      </View>
    );
  }

  return (
    <View style={[styles.gridDesktop, { gap: gutter, marginTop: spacing.lg }]}>
      <View style={[styles.aggregateWrap, { paddingRight: gutter / 2 }]}>{aggregateCard}</View>
      <View style={[styles.sideCol, { gap: gutter, paddingLeft: gutter / 2 }]}>
        {totalCard}
        {pendingCard}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  grid: {
    width: '100%',
  },
  gridDesktop: {
    flexDirection: 'row',
    width: '100%',
  },
  aggregateWrap: {
    width: '50%',
  },
  sideCol: {
    width: '50%',
    flex: 1,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
  },
  aggregateCard: {
    backgroundColor: colors.surfaceContainer,
    minHeight: 160,
  },
  aggregateInner: {
    zIndex: 1,
  },
  aggregateLabel: {
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  aggregateValue: {
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  aggregateDesc: {
    maxWidth: 320,
  },
  aggregateIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    opacity: 0.1,
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    color: colors.onSurface,
  },
  statFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  statFooterPrimary: {
    color: colors.primary,
    letterSpacing: 1,
  },
  statFooterUrgent: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1,
  },
  statFooterMuted: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
});
