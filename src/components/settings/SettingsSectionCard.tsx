import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface SettingsSectionCardProps {
  title: string;
  icon: MaterialIconName;
  children: React.ReactNode;
  badge?: string;
  divider?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
  title,
  icon,
  children,
  badge,
  divider = false,
  actionLabel,
  onAction,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard deep style={[styles.card, style]}>
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <MaterialIcons name={icon} size={28} color={colors.primary} />
        <AppText variant="headline-md" style={styles.title}>
          {title}
        </AppText>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <AppText variant="label-sm" style={styles.badgeText}>
            {badge}
          </AppText>
        </View>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => pressed && { opacity: 0.75 }}>
          <AppText variant="label-sm" style={styles.action}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
    {divider ? <View style={styles.divider} /> : null}
    <View style={styles.body}>{children}</View>
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { marginBottom: spacing.sm, padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  title: { color: colors.onSurface },
  badge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  badgeText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1,
  },
  action: {
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'none',
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  body: { gap: spacing.md },
});
