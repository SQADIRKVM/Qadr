import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BentoCard } from '../layout/BentoCard';
import { AppText } from '../primitives/AppText';
import { Separator } from '../primitives/Separator';
import type { BlockSession } from '../../types';
import {
  formatSessionDurationLabel,
  formatSessionTimeRange,
} from '../../utils/focusSession';
import { confirmAction } from '../../utils/confirmAction';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface FocusSessionLogProps {
  sessions: BlockSession[];
  maxItems?: number;
  onCompleteSession?: (sessionId: string) => void;
  onRemoveSession?: (sessionId: string) => void;
}

export const FocusSessionLog: React.FC<FocusSessionLogProps> = ({
  sessions,
  maxItems = 15,
  onCompleteSession,
  onRemoveSession,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const items = sessions.slice(0, maxItems);

  const handleRemove = (session: BlockSession) => {
    if (!onRemoveSession) return;
    confirmAction(
      'Remove session',
      'Remove this session from history?',
      () => {
        hapticLight();
        onRemoveSession(session.id);
      },
      { confirmLabel: 'Remove', destructive: true },
    );
  };

  return (
    <BentoCard deep style={styles.card}>
      <AppText variant="label-sm" style={styles.sectionLabel}>
        SESSION HISTORY
      </AppText>

      {items.length === 0 ? (
        <AppText variant="body-md" muted style={styles.empty}>
          No focus sessions yet.
        </AppText>
      ) : (
        items.map((session, i) => {
          const durationLabel = formatSessionDurationLabel(session);
          const isActive = durationLabel === 'ACTIVE';

          return (
            <View key={session.id}>
              <View style={styles.logRow}>
                <View style={styles.logTop}>
                  <AppText variant="body-md" style={styles.logPrimary}>
                    {session.startedAt.split('T')[0]} · {session.mode.toUpperCase()}
                  </AppText>
                  <AppText
                    variant="label-sm"
                    style={[styles.duration, isActive && styles.durationActive]}
                  >
                    {durationLabel}
                  </AppText>
                </View>
                <AppText variant="body-md" muted style={styles.logSecondary}>
                  {formatSessionTimeRange(session)}
                </AppText>
                {(onCompleteSession || onRemoveSession) && (
                  <View style={styles.actions}>
                    {isActive && onCompleteSession ? (
                      <Pressable
                        onPress={() => {
                          hapticLight();
                          onCompleteSession(session.id);
                        }}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.actionBtnPrimary,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppText variant="label-sm" style={styles.actionLabelPrimary}>
                          Complete
                        </AppText>
                      </Pressable>
                    ) : null}
                    {onRemoveSession ? (
                      <Pressable
                        onPress={() => handleRemove(session)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppText variant="label-sm" style={styles.actionLabelMuted}>
                          Remove
                        </AppText>
                      </Pressable>
                    ) : null}
                  </View>
                )}
              </View>
              {i < items.length - 1 ? <Separator /> : null}
            </View>
          );
        })
      )}
    </BentoCard>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  empty: {
    fontStyle: 'italic',
  },
  logRow: {
    paddingVertical: 12,
    gap: 4,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logPrimary: {
    color: colors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  duration: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  durationActive: {
    color: colors.tertiary,
  },
  logSecondary: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBgDeep,
  },
  actionBtnPrimary: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHigh,
  },
  actionLabelPrimary: {
    color: colors.primary,
    letterSpacing: 1,
  },
  actionLabelMuted: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.88,
  },
});
