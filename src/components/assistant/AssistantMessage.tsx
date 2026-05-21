import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { AssistantSuggestionCard } from './AssistantSuggestionCard';
import type { AssistantReply } from '../../services/ai/types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface AssistantMessageProps {
  reply: AssistantReply;
  onSuggestionPress?: () => void;
  offlineFallback?: boolean;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  reply,
  onSuggestionPress,
  offlineFallback,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
return (
  <View style={styles.wrap}>
    <View style={styles.labelRow}>
      <MaterialIcons name="auto-awesome" size={14} color={colors.onSurfaceVariant} />
      <AppText variant="label-sm" style={styles.label}>
        Qadr
      </AppText>
    </View>

    <View style={styles.body}>
      <AppText variant="body-md" style={styles.message}>
        {reply.message}
      </AppText>

      {reply.suggestion ? (
        <AssistantSuggestionCard
          title={reply.suggestion.title}
          bullets={reply.suggestion.bullets}
          onPress={onSuggestionPress}
        />
      ) : null}

      {reply.followUp ? (
        <PressableFollowUp text={reply.followUp} onPress={onSuggestionPress} />
      ) : null}

      {offlineFallback ? (
        <AppText variant="mono-sm" muted style={styles.offlineNote}>
          (offline fallback)
        </AppText>
      ) : null}
    </View>
  </View>
  );
};

const PressableFollowUp: React.FC<{ text: string; onPress?: () => void }> = ({
  text,
  onPress,
}) => {
  const styles = useThemedStyles(createStyles);
  if (!onPress) {
    return (
      <AppText variant="body-md" style={styles.followUp}>
        {text}
      </AppText>
    );
  }
  return (
    <Pressable onPress={onPress}>
      <AppText variant="body-md" style={styles.followUp}>
        {text}
      </AppText>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    letterSpacing: 2,
    fontSize: 10,
  },
  body: {
    maxWidth: '95%',
    gap: spacing.md,
  },
  message: {
    color: colors.onSurface,
    lineHeight: 24,
  },
  followUp: {
    color: colors.onSurface,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  offlineNote: {
    marginTop: spacing.xs,
  },
});
