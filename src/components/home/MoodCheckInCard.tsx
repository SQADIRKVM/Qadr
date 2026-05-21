import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { MoodPills } from '../layout/MoodPills';
import { AppText } from '../primitives/AppText';
import type { MoodLevel } from '../../types';
import { getMoodDisplayLabel } from '../../utils/moodLabels';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MoodCheckInCardProps {
  mood: MoodLevel | null;
  onSelect: (mood: MoodLevel) => void;
}

export const MoodCheckInCard: React.FC<MoodCheckInCardProps> = ({ mood, onSelect }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <BentoCard style={styles.card}>
    <AppText variant="label-sm" style={styles.label}>
      HOW ARE YOU TODAY?
    </AppText>
    <MoodPills selected={mood} onSelect={onSelect} />
    {mood ? (
      <AppText variant="body-md" muted style={styles.confirm}>
        Checked in as {getMoodDisplayLabel(mood)}
      </AppText>
    ) : null}
  </BentoCard>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  confirm: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
