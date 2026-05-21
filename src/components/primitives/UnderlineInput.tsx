import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { fontFamilies } from '../../theme/typography';
import { AppText } from './AppText';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface UnderlineInputProps extends TextInputProps {
  label?: string;
  mono?: boolean;
}

export const UnderlineInput: React.FC<UnderlineInputProps> = ({
  label,
  mono,
  style,
  ...rest
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    {label && (
      <AppText variant="label-sm" style={styles.label}>
        {label}
      </AppText>
    )}
    <TextInput
      placeholderTextColor={colors.outlineVariant}
      style={[
        styles.input,
        mono && { fontFamily: fontFamilies.mono },
        style,
      ]}
      {...rest}
    />
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { marginBottom: 8 },
  input: {
    fontFamily: fontFamilies.grotesk,
    fontSize: 20,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
});
