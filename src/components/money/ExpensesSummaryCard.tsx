import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { formatRupee } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ExpensesSummaryCardProps {
  last7Days: number;
  last30Days: number;
}

export const ExpensesSummaryCard: React.FC<ExpensesSummaryCardProps> = ({
  last7Days,
  last30Days,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.totals}>
      <View style={styles.half}>
        <AppText variant="label-sm" style={styles.label}>
          LAST 7 DAYS
        </AppText>
        <AppText variant="headline-md" style={styles.amount}>
          {formatRupee(last7Days)}
        </AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.half}>
        <AppText variant="label-sm" style={styles.label}>
          LAST 30 DAYS
        </AppText>
        <AppText variant="headline-md" style={styles.amountMuted}>
          {formatRupee(last30Days)}
        </AppText>
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
  amount: {
    color: colors.primary,
  },
  amountMuted: {
    color: colors.onSurface,
  },
});
