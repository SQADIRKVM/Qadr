import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface ContactQuickActionsProps {
  onReport?: () => void;
  onRemind?: () => void;
  onSms?: () => void;
}

export const ContactQuickActions: React.FC<ContactQuickActionsProps> = ({
  onReport,
  onRemind,
  onSms,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={styles.card}>
    <View style={styles.row}>
      <Pressable style={styles.action} onPress={onReport}>
        <MaterialIcons name="picture-as-pdf" size={24} color={colors.onSurfaceVariant} />
        <AppText variant="label-sm" style={styles.label}>
          Report
        </AppText>
      </Pressable>
      <Pressable style={styles.action} onPress={onRemind}>
        <MaterialIcons name="chat" size={24} color={colors.onSurfaceVariant} />
        <AppText variant="label-sm" style={styles.label}>
          Reminders
        </AppText>
      </Pressable>
      <Pressable style={styles.action} onPress={onSms}>
        <MaterialIcons name="sms" size={24} color={colors.onSurfaceVariant} />
        <AppText variant="label-sm" style={styles.label}>
          SMS
        </AppText>
      </Pressable>
    </View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  action: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
});
