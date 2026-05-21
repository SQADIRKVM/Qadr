import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import { glowShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusModeCardProps {
  enabled: boolean;
  untilTime: string;
  onToggle: () => void;
  onPressEdit: () => void;
  style?: ViewStyle;
}

export const FocusModeCard: React.FC<FocusModeCardProps> = ({
  enabled,
  untilTime,
  onToggle,
  onPressEdit,
  style,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { cardPadding, heroMinHeight, isMobile } = useResponsive();
  const lockSize = isMobile ? 40 : 48;

  return (
    <BentoCard
      style={[
        styles.card,
        { padding: cardPadding, minHeight: isMobile ? undefined : heroMinHeight },
        style,
      ]}
    >
      <View style={styles.header}>
        <AppText variant="label-sm" style={styles.label}>
          FOCUS MODE
        </AppText>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              hapticLight();
              onPressEdit();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit focus setup"
          >
            <AppText variant="label-sm" style={styles.editBtn}>
              Edit
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => {
              hapticLight();
              onToggle();
            }}
            style={[styles.toggle, enabled && styles.toggleOn]}
            accessibilityRole="switch"
            accessibilityState={{ checked: enabled }}
          >
            <View style={[styles.knob, enabled && styles.knobOn]} />
          </Pressable>
        </View>
      </View>
      <Pressable
        style={[styles.inner, !isMobile && styles.innerGrow]}
        onPress={() => {
          if (!enabled) {
            hapticLight();
            onToggle();
          }
        }}
      >
        <Ionicons
          name={enabled ? 'lock-closed' : 'lock-open-outline'}
          size={lockSize}
          color={colors.primary}
          style={{ marginBottom: 8 }}
        />
        <AppText variant="headline-md">{enabled ? 'Focus locked' : 'Focus off'}</AppText>
        {enabled ? (
          <AppText variant="body-md" style={styles.until}>
            until {untilTime}
          </AppText>
        ) : (
          <AppText variant="body-md" muted style={{ marginTop: 4 }}>
            Tap to enable
          </AppText>
        )}
      </Pressable>
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: { letterSpacing: 2 },
  editBtn: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1.5,
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.outlineVariant,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.onTertiaryContainer,
    ...glowShadow,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.inverseSurface,
    alignSelf: 'flex-start',
  },
  knobOn: { alignSelf: 'flex-end' },
  inner: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  innerGrow: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 140,
  },
  until: { color: colors.tertiary, marginTop: 4 },
});
