import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface SystemTerminalFooterProps {
  moduleCount?: number;
}

export const SystemTerminalFooter: React.FC<SystemTerminalFooterProps> = ({
  moduleCount = 10,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.box}>
    <AppText variant="label-sm" style={styles.line}>
      {'> SYSTEM.READY()'}
    </AppText>
    <AppText variant="label-sm" style={styles.line}>
      {`> MODULES.LOADED(${moduleCount})`}
    </AppText>
    <AppText variant="label-sm" style={styles.line}>
      {'> AWAITING_INPUT...'}
    </AppText>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  box: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: '#0A0A0A',
    opacity: 0.5,
  },
  line: {
    color: colors.onSurfaceVariant,
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
});
