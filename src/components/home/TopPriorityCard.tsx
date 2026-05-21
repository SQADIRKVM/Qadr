import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import type { TextVariant } from '../../theme/typography';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface TopPriorityCardProps {
  title: string;
  inProgress: boolean;
  onStartTask: () => void;
  onPressTitle?: () => void;
  style?: ViewStyle;
}

export const TopPriorityCard: React.FC<TopPriorityCardProps> = ({
  title,
  inProgress,
  onStartTask,
  onPressTitle,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { heroMinHeight, cardPadding, titleVariant, isMobile } = useResponsive();
  const boltSize = isMobile ? 56 : 64;

  return (
    <BentoCard
      deep
      style={[
        styles.card,
        { minHeight: heroMinHeight, padding: cardPadding },
        style,
      ]}
      onPress={onPressTitle}
    >
      <View style={styles.boltWrap} pointerEvents="none">
        <Ionicons
          name="flash-outline"
          size={boltSize}
          color={colors.tertiary}
          style={{ opacity: 0.2 }}
        />
      </View>
      <View style={[styles.content, { minHeight: heroMinHeight - cardPadding * 2 }]}>
        <AppText variant="label-sm" style={styles.label}>
          TOP PRIORITY
        </AppText>
        <AppText variant="body-md" muted style={styles.editHint}>
          Tap to edit
        </AppText>
        <AppText variant={titleVariant as TextVariant} style={styles.title}>
          {title}
        </AppText>
        <View style={styles.footer}>
          <Pressable
            style={styles.startBtn}
            onPress={() => {
              hapticLight();
              onStartTask();
            }}
          >
            <AppText variant="label-sm" style={styles.startBtnText}>
              Start Task
            </AppText>
            <Ionicons name="arrow-forward" size={16} color={colors.primaryContainer} />
          </Pressable>
          {inProgress && (
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <AppText variant="body-md" muted>
                In progress
              </AppText>
            </View>
          )}
        </View>
      </View>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { position: 'relative', flex: 1 },
  boltWrap: { position: 'absolute', top: spacing.md, right: spacing.md },
  content: { flex: 1, justifyContent: 'space-between' },
  label: { letterSpacing: 2, marginBottom: 4 },
  editHint: { marginBottom: spacing.sm, fontSize: 12 },
  title: { color: colors.onSurface, marginTop: 8, maxWidth: '92%' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: spacing.lg,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: spacing.pillRadius,
  },
  startBtnText: { color: colors.primaryContainer },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onTertiaryContainer,
  },
});
