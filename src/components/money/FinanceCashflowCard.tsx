import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { formatRupee } from '../../utils/ledger';
import type { FinanceCashflowSnapshot } from '../../utils/moneyTrackers';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FinanceCashflowCardProps {
  snapshot: FinanceCashflowSnapshot;
}

export const FinanceCashflowCard: React.FC<FinanceCashflowCardProps> = ({ snapshot }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={styles.card}>
    <AppText variant="label-sm" style={styles.label}>
      CASHFLOW (30 DAYS)
    </AppText>
    <View style={styles.grid}>
      <View style={styles.cell}>
        <AppText variant="label-sm" muted>
          INCOME
        </AppText>
        <AppText variant="body-md" style={styles.income}>
          {formatRupee(snapshot.incomeLast30)}
        </AppText>
      </View>
      <View style={styles.cell}>
        <AppText variant="label-sm" muted>
          EXPENSES
        </AppText>
        <AppText variant="body-md" style={styles.expense}>
          {formatRupee(snapshot.expensesLast30)}
        </AppText>
      </View>
      <View style={styles.cell}>
        <AppText variant="label-sm" muted>
          SUB BURN / MO
        </AppText>
        <AppText variant="body-md">{formatRupee(snapshot.monthlySubBurn)}</AppText>
      </View>
      <View style={styles.cell}>
        <AppText variant="label-sm" muted>
          LEDGER NET
        </AppText>
        <AppText variant="body-md">
          {formatRupee(snapshot.ledgerWillGet - snapshot.ledgerWillGive)}
        </AppText>
      </View>
    </View>
    <View style={styles.netRow}>
      <AppText variant="label-sm" style={styles.netLabel}>
        EST. NET POSITION
      </AppText>
      <AppText
        variant="headline-md"
        style={[styles.net, snapshot.netPosition >= 0 ? styles.positive : styles.negative]}
      >
        {formatRupee(snapshot.netPosition)}
      </AppText>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    gap: 4,
  },
  income: {
    color: colors.onTertiaryContainer,
  },
  expense: {
    color: colors.primary,
  },
  netRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  netLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  net: {
    fontWeight: '600',
  },
  positive: {
    color: colors.onTertiaryContainer,
  },
  negative: {
    color: colors.primary,
  },
});
