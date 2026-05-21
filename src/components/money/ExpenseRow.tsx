import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { AppText } from '../primitives/AppText';
import type { Expense } from '../../types';
import { formatRupee } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ExpenseRowProps {
  expense: Expense;
  onPress?: () => void;
  embedded?: boolean;
}

function formatExpenseDate(dateStr: string): string {
  const d = parseISO(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return format(d, 'MMM d, yyyy');
}

export const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense, onPress, embedded }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const label = expense.category?.trim() || expense.note?.trim() || 'Expense';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        embedded && styles.rowEmbedded,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="receipt-long" size={20} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <AppText variant="body-md" style={styles.name}>
          {label}
        </AppText>
        <AppText variant="body-md" muted style={styles.meta}>
          {formatExpenseDate(expense.date)}
          {expense.note && expense.category ? ` · ${expense.note}` : ''}
        </AppText>
      </View>
      <AppText variant="body-md" style={styles.amount}>
        {formatRupee(expense.amount)}
      </AppText>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowEmbedded: {
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.onSurface,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    color: colors.primary,
    fontWeight: '500',
  },
});
