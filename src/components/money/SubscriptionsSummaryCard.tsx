import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { formatRupee } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SubscriptionsSummaryCardProps {
  monthlyBurn: number;
  activeCount: number;
  upcomingCount: number;
}

export const SubscriptionsSummaryCard: React.FC<SubscriptionsSummaryCardProps> = ({
  monthlyBurn,
  activeCount,
  upcomingCount,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.totals}>
      <View style={styles.half}>
        <AppText variant="label-sm" style={styles.label}>
          MONTHLY BURN
        </AppText>
        <AppText variant="headline-md" style={styles.burn}>
          {formatRupee(monthlyBurn)}
        </AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.half}>
        <AppText variant="label-sm" style={styles.label}>
          ACTIVE
        </AppText>
        <AppText variant="headline-md" style={styles.count}>
          {activeCount}
        </AppText>
        {upcomingCount > 0 ? (
          <AppText variant="label-sm" style={styles.upcoming}>
            {upcomingCount} due soon
          </AppText>
        ) : null}
      </View>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  totals: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.sm,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  burn: {
    color: colors.primary,
  },
  count: {
    color: colors.onSurface,
  },
  upcoming: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
