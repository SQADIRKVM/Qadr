import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../primitives/AppText';
import { ConfidenceMeter } from './ConfidenceMeter';
import { DecisionStatusPill } from './DecisionStatusPill';
import { useResponsive } from '../../hooks/useResponsive';
import type { Decision } from '../../types';
import { getDecisionDisplayDate } from '../../utils/decisionStats';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DecisionTableRowProps {
  decision: Decision;
  onPress: () => void;
  onLongPress?: () => void;
}

export const DecisionTableRow: React.FC<DecisionTableRowProps> = ({
  decision,
  onPress,
  onLongPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile } = useResponsive();
  const dateLabel = getDecisionDisplayDate(decision);

  if (isMobile) {
    return (
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}
      >
        <View style={styles.mobileTop}>
          <View style={styles.titleCol}>
            <AppText variant="body-md" style={styles.title}>
              {decision.title}
            </AppText>
            <AppText variant="label-sm" style={styles.dateMobile}>
              {dateLabel}
            </AppText>
          </View>
          <DecisionStatusPill status={decision.status} />
        </View>
        <ConfidenceMeter confidence={decision.confidence} />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, styles.rowDesktop, pressed && styles.rowPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={styles.colTitle}>
        <AppText variant="body-md" style={styles.title}>
          {decision.title}
        </AppText>
      </View>
      <View style={styles.colDate}>
        <AppText variant="label-sm" style={styles.dateDesktop}>
          {dateLabel}
        </AppText>
      </View>
      <View style={styles.colConfidence}>
        <ConfidenceMeter confidence={decision.confidence} />
      </View>
      <View style={styles.colStatus}>
        <DecisionStatusPill status={decision.status} />
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  rowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  rowPressed: {
    backgroundColor: 'rgba(53, 53, 53, 0.2)',
  },
  mobileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.onSurface,
  },
  dateMobile: {
    color: colors.outline,
    marginTop: 4,
    letterSpacing: 1,
  },
  colTitle: {
    flex: 5,
    minWidth: 0,
  },
  colDate: {
    flex: 2,
    justifyContent: 'center',
  },
  colConfidence: {
    flex: 3,
    justifyContent: 'center',
  },
  colStatus: {
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateDesktop: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
});
