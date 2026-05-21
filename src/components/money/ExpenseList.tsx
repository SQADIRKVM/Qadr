import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import { ExpenseRow } from './ExpenseRow';
import type { Expense } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ExpenseListProps {
  expenses: Expense[];
  onExpensePress?: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onExpensePress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <AppText variant="label-sm" style={styles.sectionLabel}>
      RECENT EXPENSES
    </AppText>
    {expenses.length === 0 ? (
      <AppText variant="body-md" muted style={styles.empty}>
        No expenses logged yet. Tap Add Expense below.
      </AppText>
    ) : (
      expenses.map((expense, i) => (
        <View key={expense.id}>
          <ExpenseRow
            expense={expense}
            onPress={onExpensePress ? () => onExpensePress(expense.id) : undefined}
            embedded
          />
          {i < expenses.length - 1 ? <Separator /> : null}
        </View>
      ))
    )}
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  empty: {
    lineHeight: 22,
  },
});
