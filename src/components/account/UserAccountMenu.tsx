import React from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import { UserAvatar } from '../primitives/UserAvatar';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAccountMenuActions } from '../../hooks/useAccountMenuActions';
import { userDisplayLabel } from '../../utils/userInitials';
import { useResponsive } from '../../hooks/useResponsive';
import { glassModalSurface } from '../../theme/glass';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export type UserAccountMenuAlign = 'left' | 'right';

interface UserAccountMenuProps {
  visible: boolean;
  onClose: () => void;
  align?: UserAccountMenuAlign;
}

type MenuRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

const MenuRow: React.FC<MenuRowProps> = ({ icon, label, onPress, destructive }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? colors.error : colors.onSurfaceVariant}
      />
      <AppText
        variant="body-md"
        style={destructive ? styles.rowLabelDestructive : styles.rowLabel}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  visible,
  onClose,
  align = 'right',
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { horizontalPadding } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const userName = useSettingsStore((s) => s.userName);
  const { openAccount, openSettings, signOut } = useAccountMenuActions();

  const signedIn = Boolean(user);
  const displayName = user?.displayName ?? null;
  const email = user?.email ?? null;
  const label = userDisplayLabel(displayName, email, userName);

  const run = (action: () => void) => {
    hapticLight();
    onClose();
    action();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu">
        <Pressable
          style={[
            styles.panel,
            glassModalSurface(colors),
            align === 'right'
              ? { right: horizontalPadding }
              : { left: horizontalPadding },
          ]}
          onPress={() => {}}
        >
          {signedIn ? (
            <View style={styles.header}>
              <UserAvatar
                photoUrl={user?.photoURL ?? null}
                displayName={displayName}
                email={email}
                fallbackName={userName}
                size={40}
              />
              <View style={styles.headerText}>
                <AppText variant="body-md" style={styles.headerName} numberOfLines={1}>
                  {label}
                </AppText>
                {email ? (
                  <AppText variant="label-sm" muted numberOfLines={1}>
                    {email}
                  </AppText>
                ) : null}
              </View>
            </View>
          ) : null}

          {signedIn ? <Separator /> : null}

          {signedIn ? (
            <MenuRow
              icon="person-circle-outline"
              label="Manage account"
              onPress={() => run(openAccount)}
            />
          ) : null}

          <MenuRow
            icon="settings-outline"
            label="Settings"
            onPress={() => run(openSettings)}
          />

          {signedIn ? (
            <>
              <Separator />
              <MenuRow
                icon="log-out-outline"
                label="Sign out"
                destructive
                onPress={() => run(signOut)}
              />
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      paddingTop: Platform.OS === 'web' ? 56 : 52,
    },
    panel: {
      position: 'absolute',
      top: Platform.OS === 'web' ? 56 : 52,
      minWidth: 260,
      maxWidth: 320,
      borderRadius: spacing.cardRadius,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      ...(Platform.OS === 'web' ? { zIndex: 1000 } : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
    },
    headerText: { flex: 1, minWidth: 0 },
    headerName: { color: colors.onSurface, marginBottom: 2 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 12,
      paddingHorizontal: spacing.sm,
      borderRadius: spacing.sm,
    },
    rowPressed: {
      backgroundColor: colors.surfaceContainerHigh,
      opacity: 0.92,
    },
    rowLabel: { color: colors.onSurface, flex: 1 },
    rowLabelDestructive: { color: colors.error, flex: 1 },
  });
