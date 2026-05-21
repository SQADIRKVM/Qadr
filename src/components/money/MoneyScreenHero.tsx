import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { MoneyMode } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const EYEBROW: Record<MoneyMode, string> = {
  ledger: 'LEDGER',
  subscriptions: 'SUBSCRIPTIONS',
  expenses: 'EXPENSES',
  income: 'INCOME',
};

interface MoneyScreenHeroProps {
  mode: MoneyMode;
}

export const MoneyScreenHero: React.FC<MoneyScreenHeroProps> = ({ mode }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <View style={styles.titleRow}>
      <Text style={styles.title}>
        <Text style={styles.titleSlash}>/</Text>
        <Text style={styles.titleMain}>/ MONEY</Text>
      </Text>
    </View>
    <AppText variant="label-sm" style={styles.eyebrow}>
      {EYEBROW[mode]}
    </AppText>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  titleSlash: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.secondary,
    letterSpacing: 2,
  },
  titleMain: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  eyebrow: {
    color: colors.onSurfaceVariant,
    letterSpacing: 3,
  },
});
