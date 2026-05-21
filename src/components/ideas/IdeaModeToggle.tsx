import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { IdeaViewMode } from '../../stores/useIdeaUiStore';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface IdeaModeToggleProps {
  mode: IdeaViewMode;
  onChange: (mode: IdeaViewMode) => void;
}

export const IdeaModeToggle: React.FC<IdeaModeToggleProps> = ({ mode, onChange }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <Pressable
      style={[styles.segment, mode === 'vault' && styles.segmentActive]}
      onPress={() => {
        hapticLight();
        onChange('vault');
      }}
    >
      <AppText variant="label-sm" style={[styles.label, mode === 'vault' && styles.labelActive]}>
        VAULT
      </AppText>
    </Pressable>
    <Pressable
      style={[styles.segment, mode === 'mind' && styles.segmentActive]}
      onPress={() => {
        hapticLight();
        onChange('mind');
      }}
    >
      <AppText variant="label-sm" style={[styles.label, mode === 'mind' && styles.labelActive]}>
        MIND
      </AppText>
    </Pressable>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBgDeep,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  labelActive: {
    color: colors.primary,
  },
});
