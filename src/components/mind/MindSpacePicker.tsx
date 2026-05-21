import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from '../primitives/Chip';
import { AppText } from '../primitives/AppText';
import { useMindSpacesStore } from '../../stores/useMindSpacesStore';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindSpacePickerProps {
  spaceId?: string | null;
  onSelect: (spaceId: string | null) => void;
}

export const MindSpacePicker: React.FC<MindSpacePickerProps> = ({ spaceId, onSelect }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const spaces = useMindSpacesStore((s) => s.spaces);

  if (spaces.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <AppText variant="label-sm" style={styles.label}>
        SPACE
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          <Chip label="None" selected={!spaceId} onPress={() => onSelect(null)} />
          {spaces.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              selected={spaceId === s.id}
              onPress={() => onSelect(s.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { letterSpacing: 2, color: colors.onSurfaceVariant },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
});
