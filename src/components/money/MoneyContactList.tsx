import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import { MoneyContactRow } from './MoneyContactRow';
import type { MoneyContact, LedgerEntry } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MoneyContactListProps {
  contacts: MoneyContact[];
  entries: LedgerEntry[];
  onContactPress: (contactId: string) => void;
}

export const MoneyContactList: React.FC<MoneyContactListProps> = ({
  contacts,
  entries,
  onContactPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <AppText variant="label-sm" style={styles.sectionLabel}>
      CONTACTS
    </AppText>
    {contacts.length === 0 ? (
      <AppText variant="body-md" muted style={styles.empty}>
        No contacts yet. Tap Add Contact below.
      </AppText>
    ) : (
      contacts.map((contact, i) => (
        <View key={contact.id}>
          <MoneyContactRow
            contact={contact}
            entries={entries}
            onPress={() => onContactPress(contact.id)}
            embedded
          />
          {i < contacts.length - 1 ? <Separator /> : null}
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
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
});
