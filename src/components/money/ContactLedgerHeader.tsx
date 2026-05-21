import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import type { MoneyContact } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ContactLedgerHeaderProps {
  contact: MoneyContact;
}

export const ContactLedgerHeader: React.FC<ContactLedgerHeaderProps> = ({ contact }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const initial = contact.name.trim()[0]?.toUpperCase() || '?';

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <AppText variant="body-md" style={styles.initial}>
          {initial}
        </AppText>
      </View>
      <AppText variant="headline-md" style={styles.name} numberOfLines={1}>
        {contact.name}
      </AppText>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  name: {
    flex: 1,
    color: colors.onSurface,
    minWidth: 0,
  },
});
