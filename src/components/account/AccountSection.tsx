import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../primitives/AppText';
import { BentoCard } from '../layout/BentoCard';
import { spacing } from '../../theme/spacing';
import { glassCardBase } from '../../theme/glass';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AccountSectionProps {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  footer?: React.ReactNode;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  title,
  children,
  actionLabel,
  onAction,
  footer,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText variant="label-sm" style={styles.sectionTitle}>
          {title}
        </AppText>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <AppText variant="label-sm" style={styles.action}>
              {actionLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <BentoCard style={[styles.card, glassCardBase(colors)]}>
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </BentoCard>
    </View>
  );
};

interface AccountRowProps {
  label?: string;
  children: React.ReactNode;
  onPress?: () => void;
  trailing?: React.ReactNode;
  divider?: boolean;
}

export const AccountRow: React.FC<AccountRowProps> = ({
  label,
  children,
  onPress,
  trailing,
  divider = true,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const content = (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <View style={styles.rowBody}>
        {label ? (
          <AppText variant="label-sm" muted style={styles.rowLabel}>
            {label}
          </AppText>
        ) : null}
        {children}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
    textTransform: 'none',
  },
  action: { color: colors.primary },
  card: { padding: 0, overflow: 'hidden' },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  rowLabel: {
    marginBottom: 4,
    letterSpacing: 0.2,
    textTransform: 'none',
  },
  rowBody: { flex: 1, minWidth: 0 },
});
