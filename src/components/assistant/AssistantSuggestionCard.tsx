import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import type { AssistantBullet } from '../../services/ai/types';
import { spacing } from '../../theme/spacing';
import { ghostHighlight } from '../../theme/patterns';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AssistantSuggestionCardProps {
  title: string;
  bullets: AssistantBullet[];
  onPress?: () => void;
}

const iconName = (icon: AssistantBullet['icon']): React.ComponentProps<typeof MaterialIcons>['name'] => {
  switch (icon) {
    case 'timer':
      return 'timer';
    case 'notifications_paused':
      return 'notifications-paused';
    case 'block':
      return 'block';
    default:
      return 'check-circle';
  }
};

export const AssistantSuggestionCard: React.FC<AssistantSuggestionCardProps> = ({
  title,
  bullets,
  onPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const inner = (
    <>
      <View style={styles.topLine} pointerEvents="none" />
      <AppText variant="headline-md" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.list}>
        {bullets.map((bullet, i) => (
          <View key={`${bullet.text}-${i}`} style={styles.row}>
            <MaterialIcons
              name={iconName(bullet.icon)}
              size={20}
              color={bullet.tone === 'danger' ? colors.accentRed : colors.primary}
              style={styles.icon}
            />
            <AppText
              variant="body-md"
              style={[styles.bulletText, bullet.tone === 'danger' && styles.bulletDanger]}
            >
              {bullet.text}
            </AppText>
          </View>
        ))}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.card, ghostHighlight(colors)]}>
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.card, ghostHighlight(colors)]}>{inner}</View>;
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardBgDeep,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    color: colors.onSurface,
    lineHeight: 24,
  },
  bulletDanger: {
    color: colors.accentRed,
  },
});
