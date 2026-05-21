import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SettingsFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  statusDot?: 'error' | 'success';
  onPress?: () => void;
  trailingIcon?: React.ComponentProps<typeof MaterialIcons>['name'];
  inputProps?: TextInputProps;
}

export const SettingsField: React.FC<SettingsFieldProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
  statusDot,
  onPress,
  trailingIcon,
  inputProps,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const field = (
    <View style={styles.field}>
      {editable && onChangeText ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.outlineVariant}
          {...inputProps}
        />
      ) : (
        <AppText variant="body-md" style={styles.value}>
          {value}
        </AppText>
      )}
      {statusDot ? (
        <View
          style={[
            styles.dot,
            statusDot === 'error' ? styles.dotError : styles.dotSuccess,
          ]}
        />
      ) : null}
      {trailingIcon ? (
        <MaterialIcons name={trailingIcon} size={22} color={colors.onSurfaceVariant} />
      ) : null}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.label}>
        {label}
      </AppText>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          {field}
        </Pressable>
      ) : (
        field
      )}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 0.2,
    textTransform: 'none',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    gap: 12,
  },
  pressed: { opacity: 0.85 },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
    padding: 0,
  },
  value: { flex: 1, color: colors.onSurface },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotError: { backgroundColor: colors.accentRed },
  dotSuccess: { backgroundColor: colors.dotGreen },
});
