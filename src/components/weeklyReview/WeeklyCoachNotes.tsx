import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { JournalCard } from './JournalCard';
import { AppText } from '../primitives/AppText';
import { CoachInsightList } from './CoachInsightList';
import { WeeklyDirectiveCard } from './WeeklyDirectiveCard';
import type { CoachBullet } from '../../utils/weeklyReviewDisplay';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface WeeklyCoachNotesProps {
  summary: string;
  bullets: CoachBullet[];
  directiveTitle: string;
  directiveSubtitle: string;
  onDirectivePress?: () => void;
}

export const WeeklyCoachNotes: React.FC<WeeklyCoachNotesProps> = ({
  summary,
  bullets,
  directiveTitle,
  directiveSubtitle,
  onDirectivePress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <AppText variant="headline-md" style={styles.sectionTitle}>
      Coach&apos;s Notes
    </AppText>
    <JournalCard style={styles.card}>
      <MaterialIcons
        name="favorite"
        size={64}
        color={colors.primary}
        style={styles.watermark}
      />
      <AppText variant="body-lg" style={styles.summary}>
        {summary}
      </AppText>
      {bullets.length > 0 ? <CoachInsightList bullets={bullets} /> : null}
      <WeeklyDirectiveCard
        title={directiveTitle}
        subtitle={directiveSubtitle}
        onPress={onDirectivePress}
      />
    </JournalCard>
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.onSurface,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    minHeight: 200,
  },
  watermark: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    opacity: 0.1,
  },
  summary: {
    color: colors.onSurface,
    opacity: 0.9,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
});
