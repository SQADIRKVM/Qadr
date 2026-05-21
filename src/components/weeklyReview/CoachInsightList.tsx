import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import type { CoachBullet } from '../../utils/weeklyReviewDisplay';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface CoachInsightListProps {
  bullets: CoachBullet[];
}

export const CoachInsightList: React.FC<CoachInsightListProps> = ({ bullets }) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    {bullets.map((bullet, i) => (
      <View key={`${i}-${bullet.text.slice(0, 12)}`} style={styles.row}>
        <AppText variant="body-md" style={styles.diamond}>
          ✧
        </AppText>
        <AppText variant="body-md" style={styles.text}>
          {bullet.emphasis ? (
            <>
              <AppText variant="body-md" style={styles.bold}>
                Tip for next week:{' '}
              </AppText>
              {bullet.text.replace(/^tip for next week:\s*/i, '')}
            </>
          ) : (
            bullet.text
          )}
        </AppText>
      </View>
    ))}
  </View>
);
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  diamond: {
    color: colors.primary,
    marginRight: 12,
    lineHeight: 24,
    fontSize: 14,
  },
  text: {
    flex: 1,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    opacity: 0.85,
  },
  bold: {
    color: colors.onSurface,
    fontWeight: '600',
  },
});
