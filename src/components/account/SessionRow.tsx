import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import type { UserSessionRow } from '../../services/account/sessions';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SessionRowProps {
  session: UserSessionRow;
  isCurrent: boolean;
  onRevoke?: () => void;
  divider?: boolean;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export const SessionRow: React.FC<SessionRowProps> = ({
  session,
  isCurrent,
  onRevoke,
  divider = true,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const title = session.device_label?.trim() || 'Unknown device';
  const meta = [
    session.platform,
    session.ip_address?.trim() || null,
    `Last active ${formatWhen(session.last_active_at)}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={session.platform === 'web' ? 'laptop' : 'cellphone'}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="body-md" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          {isCurrent ? (
            <View style={styles.badge}>
              <AppText variant="label-sm" style={styles.badgeText}>
                This device
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="label-sm" muted numberOfLines={2}>
          {meta}
        </AppText>
      </View>
      {!isCurrent && onRevoke ? (
        <Pressable onPress={onRevoke} hitSlop={8}>
          <AppText variant="label-sm" style={styles.revokeText}>
            Revoke
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: { color: colors.onSurface, flexShrink: 1 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(198, 198, 198, 0.12)',
  },
  badgeText: { color: colors.primary, fontSize: 10 },
  revokeText: { color: colors.accentRed },
});
