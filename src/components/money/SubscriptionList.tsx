import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import { SubscriptionRow } from './SubscriptionRow';
import type { Subscription } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onSubscriptionPress: (id: string) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onSubscriptionPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={styles.card}>
    <AppText variant="label-sm" style={styles.sectionLabel}>
      SUBSCRIPTIONS
    </AppText>
    {subscriptions.length === 0 ? (
      <AppText variant="body-md" muted style={styles.empty}>
        No subscriptions yet. Tap Add Subscription below.
      </AppText>
    ) : (
      subscriptions.map((sub, i) => (
        <View key={sub.id}>
          <SubscriptionRow
            subscription={sub}
            onPress={() => onSubscriptionPress(sub.id)}
            embedded
          />
          {i < subscriptions.length - 1 ? <Separator /> : null}
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
