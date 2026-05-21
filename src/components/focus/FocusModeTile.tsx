import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import type { FocusModeMeta } from '../../utils/focusMode';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusModeTileProps {
  meta: FocusModeMeta;
  selected: boolean;
  suggested?: boolean;
  onPress: () => void;
}

export const FocusModeTile: React.FC<FocusModeTileProps> = ({
  meta,
  selected,
  suggested,
  onPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const showSuggested = suggested;
  const showActive = selected && meta.id !== 'off' && !showSuggested;

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <BentoCard deep style={[styles.card, selected && styles.cardSelected]}>
        {(showSuggested || showActive) && (
          <View style={styles.badgeRow}>
            {showSuggested ? (
              <AppText variant="label-sm" style={styles.badgeSuggested}>
                Suggested
              </AppText>
            ) : null}
            {showActive ? (
              <AppText variant="label-sm" style={styles.badgeActive}>
                Active
              </AppText>
            ) : null}
          </View>
        )}

        <MaterialIcons
          name={meta.icon}
          size={28}
          color={selected ? colors.primary : colors.onSurfaceVariant}
          style={styles.icon}
        />
        <AppText
          variant="headline-md"
          style={[styles.label, selected && styles.labelSelected]}
        >
          {meta.label}
        </AppText>
        <AppText variant="body-md" muted style={styles.desc} numberOfLines={2}>
          {meta.description}
        </AppText>
      </BentoCard>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    width: '100%',
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    padding: spacing.md,
    paddingTop: spacing.md + 4,
    minHeight: 132,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  badgeRow: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: 6,
  },
  badgeSuggested: {
    color: colors.onTertiaryContainer,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badgeActive: {
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  icon: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.outline,
    marginBottom: 4,
  },
  labelSelected: {
    color: colors.primary,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    paddingBottom: spacing.sm,
  },
});
