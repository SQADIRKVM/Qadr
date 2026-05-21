import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserAvatar } from '../primitives/UserAvatar';
import { AppText } from '../primitives/AppText';
import { glassCardBase } from '../../theme/glass';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SettingsProfileStripProps {
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  onPress: () => void;
}

export const SettingsProfileStrip: React.FC<SettingsProfileStripProps> = ({
  displayName,
  email,
  photoUrl,
  onPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const primary = displayName?.trim() || email || 'Signed in';
  const secondary = displayName?.trim() && email ? email : null;

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={({ pressed }) => [styles.card, glassCardBase(colors), pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Open account"
    >
      <UserAvatar
        size={56}
        photoUrl={photoUrl}
        displayName={displayName}
        email={email}
      />
      <View style={styles.textCol}>
        <AppText variant="headline-md" style={styles.name}>
          {primary}
        </AppText>
        {secondary ? (
          <AppText variant="body-md" muted>
            {secondary}
          </AppText>
        ) : null}
        <AppText variant="label-sm" style={styles.manage}>
          Manage account
        </AppText>
      </View>
      <MaterialIcons name="arrow-forward" size={22} color={colors.outlineVariant} />
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    pressed: { opacity: 0.88 },
    textCol: { flex: 1, gap: 2 },
    name: { color: colors.onSurface },
    manage: {
      color: colors.primary,
      marginTop: 4,
      letterSpacing: 0.5,
      textTransform: 'none',
    },
  });
