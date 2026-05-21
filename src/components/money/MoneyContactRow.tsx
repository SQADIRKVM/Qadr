import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { MoneyContact } from '../../types';
import {
  formatRupee,
  getBalanceLabel,
  getContactBalance,
  getEntriesForContact,
  getRelativeActivity,
} from '../../utils/ledger';
import type { LedgerEntry } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MoneyContactRowProps {
  contact: MoneyContact;
  entries: LedgerEntry[];
  onPress: () => void;
  /** When true, row has no outer border (used inside MoneyContactList). */
  embedded?: boolean;
}

export const MoneyContactRow: React.FC<MoneyContactRowProps> = ({
  contact,
  entries,
  onPress,
  embedded,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const contactEntries = getEntriesForContact(entries, contact.id);
  const balance = getContactBalance(contactEntries);
  const label = getBalanceLabel(balance);
  const initial = contact.name.trim()[0]?.toUpperCase() || '?';

  const amountColor =
    label.kind === 'get'
      ? colors.onTertiaryContainer
      : label.kind === 'give'
        ? colors.primary
        : colors.onSurfaceVariant;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        embedded && styles.rowEmbedded,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <AppText variant="body-md" style={styles.initial}>
          {initial}
        </AppText>
      </View>
      <View style={styles.info}>
        <AppText variant="body-md" style={styles.name}>
          {contact.name}
        </AppText>
        <AppText variant="body-md" muted style={styles.activity}>
          {getRelativeActivity(contact.updatedAt)}
        </AppText>
      </View>
      <View style={styles.balanceCol}>
        <AppText variant="body-md" style={[styles.amount, { color: amountColor }]}>
          {formatRupee(label.amount)}
        </AppText>
        {label.kind !== 'settled' && (
          <AppText variant="label-sm" style={[styles.sub, { color: amountColor }]}>
            {label.listLabel}
          </AppText>
        )}
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  rowEmbedded: {
    borderBottomWidth: 0,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  initial: {
    color: colors.primary,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.onSurface,
  },
  activity: {
    fontSize: 12,
    marginTop: 2,
  },
  balanceCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '500',
  },
  sub: {
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
