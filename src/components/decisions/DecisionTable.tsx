import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../primitives/AppText';
import { DecisionTableRow } from './DecisionTableRow';
import { useResponsive } from '../../hooks/useResponsive';
import type { Decision } from '../../types';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface DecisionTableProps {
  decisions: Decision[];
  onRowPress: (id: string) => void;
  onRowLongPress?: (id: string) => void;
}

export const DecisionTable: React.FC<DecisionTableProps> = ({
  decisions,
  onRowPress,
  onRowLongPress,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const { isMobile } = useResponsive();

  return (
    <View style={styles.table}>
      {isMobile ? (
        <View style={styles.header}>
          <AppText variant="label-sm" style={[styles.headerCell, styles.flexTitle]}>
            DECISION TITLE
          </AppText>
          <AppText variant="label-sm" style={[styles.headerCell, styles.flexMid]}>
            CONFIDENCE
          </AppText>
          <AppText variant="label-sm" style={[styles.headerCell, styles.flexEnd]}>
            STATUS
          </AppText>
        </View>
      ) : (
        <View style={[styles.header, styles.headerDesktop]}>
          <AppText variant="label-sm" style={[styles.headerCell, styles.dColTitle]}>
            DECISION TITLE
          </AppText>
          <AppText variant="label-sm" style={[styles.headerCell, styles.dColDate]}>
            DATE
          </AppText>
          <AppText variant="label-sm" style={[styles.headerCell, styles.dColConfidence]}>
            CONFIDENCE
          </AppText>
          <AppText variant="label-sm" style={[styles.headerCell, styles.dColStatus]}>
            STATUS
          </AppText>
        </View>
      )}

      {decisions.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="body-md" muted>
            No decisions logged yet.
          </AppText>
        </View>
      ) : (
        decisions.map((d) => (
          <DecisionTableRow
            key={d.id}
            decision={d}
            onPress={() => onRowPress(d.id)}
            onLongPress={onRowLongPress ? () => onRowLongPress(d.id) : undefined}
          />
        ))
      )}
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
  },
  headerDesktop: {
    gap: spacing.lg,
  },
  headerCell: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  flexTitle: {
    flex: 1,
  },
  flexMid: {
    flex: 1,
    textAlign: 'center',
  },
  flexEnd: {
    flex: 1,
    textAlign: 'right',
  },
  dColTitle: {
    flex: 5,
  },
  dColDate: {
    flex: 2,
  },
  dColConfidence: {
    flex: 3,
  },
  dColStatus: {
    flex: 2,
    textAlign: 'right',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
