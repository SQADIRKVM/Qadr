import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { formatRupee, getBalanceLabel } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ContactBalanceCardProps {
  balance: number;
  collectionDate?: string;
  onSetCollectionDates?: () => void;
}

export const ContactBalanceCard: React.FC<ContactBalanceCardProps> = ({
  balance,
  collectionDate,
  onSetCollectionDates,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const label = getBalanceLabel(balance);
  const headline =
    label.kind === 'get'
      ? 'YOU WILL GET'
      : label.kind === 'give'
        ? 'YOU WILL GIVE'
        : 'SETTLED';

  const amountColor =
    label.kind === 'get'
      ? colors.onTertiaryContainer
      : label.kind === 'give'
        ? colors.primary
        : colors.onSurface;

  return (
    <BentoCard deep style={styles.card}>
      <View style={styles.top}>
        <AppText variant="label-sm" style={styles.label}>
          {headline}
        </AppText>
        <AppText variant="headline-lg-mobile" style={[styles.amount, { color: amountColor }]}>
          {formatRupee(label.amount)}
        </AppText>
      </View>
      <Pressable style={styles.collection} onPress={onSetCollectionDates}>
        <MaterialIcons name="event" size={18} color={colors.onSurfaceVariant} />
        <AppText variant="body-md" muted style={styles.collectionText}>
          {collectionDate ? `Collect by ${collectionDate}` : 'Set collection date'}
        </AppText>
        <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
      </Pressable>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  amount: {
    fontWeight: '600',
  },
  collection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  collectionText: {
    flex: 1,
    textTransform: 'capitalize',
  },
});
