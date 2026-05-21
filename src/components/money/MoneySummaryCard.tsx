import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { formatRupee } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MoneySummaryCardProps {
  willGive: number;
  willGet: number;
  onViewReport?: () => void;
  onOpenCashbook?: () => void;
}

export const MoneySummaryCard: React.FC<MoneySummaryCardProps> = ({
  willGive,
  willGet,
  onViewReport,
  onOpenCashbook,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <View style={styles.totals}>
      <View style={styles.half}>
        <AppText variant="label-sm" style={styles.label}>
          YOU WILL GIVE
        </AppText>
        <AppText variant="headline-md" style={styles.giveAmount}>
          {formatRupee(willGive)}
        </AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.half}>
        <AppText variant="label-sm" style={styles.label}>
          YOU WILL GET
        </AppText>
        <AppText variant="headline-md" style={styles.getAmount}>
          {formatRupee(willGet)}
        </AppText>
      </View>
    </View>
    <View style={styles.actions}>
      <Pressable style={styles.actionBtn} onPress={onViewReport}>
        <MaterialIcons name="assessment" size={16} color={colors.onSurfaceVariant} />
        <AppText variant="label-sm" style={styles.actionText}>
          VIEW REPORT
        </AppText>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={onOpenCashbook}>
        <MaterialIcons name="account-balance-wallet" size={16} color={colors.onSurfaceVariant} />
        <AppText variant="label-sm" style={styles.actionText}>
          OPEN CASHBOOK
        </AppText>
      </Pressable>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  totals: {
    flexDirection: 'row',
    padding: spacing.lg,
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
  giveAmount: {
    color: colors.primary,
  },
  getAmount: {
    color: colors.onTertiaryContainer,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  actionText: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
});
