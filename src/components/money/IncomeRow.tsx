import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { AppText } from '../primitives/AppText';
import type { Income } from '../../types';
import { formatRupee } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface IncomeRowProps {
  income: Income;
  onPress: () => void;
  embedded?: boolean;
}

function formatIncomeDate(dateStr: string): string {
  const d = parseISO(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return format(d, 'MMM d, yyyy');
}

export const IncomeRow: React.FC<IncomeRowProps> = ({ income, onPress, embedded }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const label = income.source?.trim() || income.note?.trim() || 'Income';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, embedded && styles.rowEmbedded, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="payments" size={20} color={colors.onTertiaryContainer} />
      </View>
      <View style={styles.info}>
        <AppText variant="body-md" style={styles.name}>
          {label}
        </AppText>
        <AppText variant="body-md" muted style={styles.meta}>
          {formatIncomeDate(income.date)}
        </AppText>
      </View>
      <AppText variant="body-md" style={styles.amount}>
        {formatRupee(income.amount)}
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
  rowEmbedded: { paddingVertical: 12 },
  pressed: { opacity: 0.85 },
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
  info: { flex: 1, minWidth: 0 },
  name: { color: colors.onSurface },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { color: colors.onTertiaryContainer, fontWeight: '500' },
});
