import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import { IncomeRow } from './IncomeRow';
import type { Income } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface IncomeListProps {
  incomes: Income[];
  onIncomePress: (id: string) => void;
}

export const IncomeList: React.FC<IncomeListProps> = ({ incomes, onIncomePress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <AppText variant="label-sm" style={styles.sectionLabel}>
      INCOME LOG
    </AppText>
    {incomes.length === 0 ? (
      <AppText variant="body-md" muted style={styles.empty}>
        No income logged yet. Tap Add Income below.
      </AppText>
    ) : (
      incomes.map((income, i) => (
        <View key={income.id}>
          <IncomeRow income={income} onPress={() => onIncomePress(income.id)} embedded />
          {i < incomes.length - 1 ? <Separator /> : null}
        </View>
      ))
    )}
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { padding: spacing.lg },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  empty: { lineHeight: 22 },
});
