import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import type { Subscription } from '../../types';
import { formatRupee } from '../../utils/ledger';
import { formatBillingCycle, formatDueLabel } from '../../utils/moneyTrackers';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SubscriptionRowProps {
  subscription: Subscription;
  onPress: () => void;
  embedded?: boolean;
}

export const SubscriptionRow: React.FC<SubscriptionRowProps> = ({
  subscription,
  onPress,
  embedded,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const initial = subscription.name.trim()[0]?.toUpperCase() || '?';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        embedded && styles.rowEmbedded,
        !subscription.active && styles.rowInactive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.avatar, !subscription.active && styles.avatarMuted]}>
        <AppText variant="body-md" style={styles.initial}>
          {initial}
        </AppText>
      </View>
      <View style={styles.info}>
        <AppText variant="body-md" style={styles.name}>
          {subscription.name}
        </AppText>
        <AppText variant="body-md" muted style={styles.meta}>
          {formatBillingCycle(subscription.cycle)} · {formatDueLabel(subscription.nextDueDate)}
        </AppText>
      </View>
      <View style={styles.amountCol}>
        <AppText variant="body-md" style={styles.amount}>
          {formatRupee(subscription.amount)}
        </AppText>
        {!subscription.active ? (
          <AppText variant="label-sm" style={styles.paused}>
            PAUSED
          </AppText>
        ) : (
          <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
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
  },
  rowEmbedded: {
    paddingVertical: 12,
  },
  rowInactive: {
    opacity: 0.55,
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
  avatarMuted: {
    borderColor: colors.outlineVariant,
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
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    color: colors.onSurface,
    fontWeight: '500',
  },
  paused: {
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
});
