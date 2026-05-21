import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { LedgerEntry } from '../../types';
import { formatLedgerDate, formatRupee } from '../../utils/ledger';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface LedgerEntryRowProps {
  entry: LedgerEntry;
  runningBalance: number;
}

export const LedgerEntryRow: React.FC<LedgerEntryRowProps> = ({ entry, runningBalance }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const gave = entry.type === 'gave' ? entry.amount : null;
  const got = entry.type === 'got' ? entry.amount : null;

  return (
    <View style={styles.row}>
      <View style={styles.details}>
        <AppText variant="body-md" style={styles.date}>
          {formatLedgerDate(entry.createdAt)}
        </AppText>
        <AppText variant="label-sm" style={styles.bal}>
          Bal. {formatRupee(Math.abs(runningBalance))}
        </AppText>
        {entry.note ? (
          <AppText variant="body-md" muted style={styles.note}>
            {entry.note}
          </AppText>
        ) : null}
      </View>
      <View style={styles.amountCol}>
        {gave != null ? (
          <AppText variant="body-md" style={styles.gaveAmount}>
            {formatRupee(gave)}
          </AppText>
        ) : null}
      </View>
      <View style={styles.amountCol}>
        {got != null ? (
          <AppText variant="body-md" style={styles.gotAmount}>
            {formatRupee(got)}
          </AppText>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  details: {
    flex: 1.2,
    paddingRight: spacing.sm,
    minWidth: 0,
  },
  date: {
    color: colors.onSurface,
  },
  bal: {
    color: colors.outline,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  note: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  amountCol: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  gaveAmount: {
    color: colors.onTertiaryContainer,
    fontWeight: '500',
  },
  gotAmount: {
    color: colors.primary,
    fontWeight: '500',
  },
});
