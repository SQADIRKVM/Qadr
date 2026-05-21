import React from 'react';
import { View, StyleSheet, Switch, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SettingsToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({
  label,
  value,
  onValueChange,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.row}>
    <AppText variant="body-md" style={styles.label}>
      {label}
    </AppText>
    <Switch
      value={value}
      onValueChange={(v) => {
        hapticLight();
        onValueChange(v);
      }}
      trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
      thumbColor={value ? colors.onPrimary : colors.onSurfaceVariant}
      ios_backgroundColor={colors.surfaceContainerHigh}
    />
  </View>
);
}

interface SettingsIconRowProps {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}

export const SettingsIconRow: React.FC<SettingsIconRowProps> = ({ label, icon }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.row}>
    <AppText variant="body-md" style={styles.label}>
      {label}
    </AppText>
    <MaterialIcons name={icon} size={24} color={colors.onSurfaceVariant} />
  </View>
);
}

interface SettingsLinkRowProps {
  label: string;
  value?: string;
  onPress: () => void;
}

export const SettingsLinkRow: React.FC<SettingsLinkRowProps> = ({ label, value, onPress }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      hapticLight();
      onPress();
    }}
    style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}
  >
    <View style={styles.linkLeft}>
      <View style={styles.bulletPrimary} />
      <View style={styles.linkTextCol}>
        <AppText variant="body-md" style={styles.label}>
          {label}
        </AppText>
        {value ? (
          <AppText variant="body-md" muted style={styles.linkValue}>
            {value}
          </AppText>
        ) : null}
      </View>
    </View>
    <MaterialIcons name="arrow-forward" size={18} color={colors.outlineVariant} />
  </Pressable>
);
}

interface SettingsPrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
}

export const SettingsPrimaryButton: React.FC<SettingsPrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <Pressable
    onPress={() => {
      if (loading) return;
      hapticLight();
      onPress();
    }}
    disabled={loading}
    style={({ pressed }) => [
      styles.primaryBtn,
      pressed && !loading && styles.primaryPressed,
      loading && styles.primaryDisabled,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={colors.onPrimary} />
    ) : (
      <AppText variant="label-sm" style={styles.primaryLabel}>
        {label}
      </AppText>
    )}
  </Pressable>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: { color: colors.onSurface },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  linkPressed: { opacity: 0.75 },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.onSurfaceVariant,
  },
  bulletPrimary: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  linkTextCol: { flex: 1, gap: 2 },
  linkValue: { fontSize: 13 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.pillRadius,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryPressed: { opacity: 0.9 },
  primaryDisabled: { opacity: 0.7 },
  primaryLabel: {
    color: colors.onPrimary,
    letterSpacing: 0.3,
    textTransform: 'none',
  },
});
