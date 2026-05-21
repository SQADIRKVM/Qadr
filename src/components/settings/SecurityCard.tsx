import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SecurityCardProps {
  enrolled: boolean;
  onEnable: () => void;
  onManage?: () => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  enrolled,
  onEnable,
  onManage,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  if (enrolled) {
    return (
      <View style={styles.card}>
        <View style={styles.activeRow}>
          <MaterialIcons name="verified-user" size={24} color={colors.dotGreen} />
          <View style={styles.activeText}>
            <AppText variant="body-md" style={styles.title}>
              Two-factor authentication
            </AppText>
            <AppText variant="body-md" muted style={styles.desc}>
              Authenticator app is active on this account.
            </AppText>
          </View>
        </View>
        {onManage ? (
          <Pressable
            onPress={() => {
              hapticLight();
              onManage();
            }}
            style={({ pressed }) => [styles.enableRow, pressed && { opacity: 0.8 }]}
          >
            <AppText variant="label-sm" style={styles.enable}>
              MANAGE
            </AppText>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <MaterialIcons name="warning" size={28} color={colors.error} style={styles.icon} />
      <AppText variant="body-md" style={styles.title}>
        Two-Factor Authentication
      </AppText>
      <AppText variant="body-md" muted style={styles.desc}>
        Add an extra layer of protection to your Qadr environment.
      </AppText>
      <Pressable
        onPress={() => {
          hapticLight();
          onEnable();
        }}
        style={({ pressed }) => [styles.enableRow, pressed && { opacity: 0.8 }]}
      >
        <AppText variant="label-sm" style={styles.enable}>
          ENABLE
        </AppText>
        <View style={styles.dot} />
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
      gap: 8,
    },
    icon: { marginBottom: 4 },
    title: { color: colors.onSurface, fontWeight: '600' },
    desc: { color: colors.onSurfaceVariant, lineHeight: 22, marginBottom: 8 },
    enableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
    },
    enable: {
      color: colors.onSurface,
      letterSpacing: 2,
      fontSize: 12,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accentRed,
    },
    activeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    activeText: { flex: 1, gap: 4 },
  });
