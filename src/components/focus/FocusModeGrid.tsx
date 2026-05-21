import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FocusModeTile } from './FocusModeTile';
import { FOCUS_MODES } from '../../utils/focusMode';
import type { FocusModeMeta } from '../../utils/focusMode';
import type { BlockMode } from '../../types';
import type { ActiveBlockMode } from '../../utils/focusMode';
import { isActiveBlockMode } from '../../utils/focusMode';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';

interface FocusModeGridProps {
  selected: BlockMode;
  suggestedMode: ActiveBlockMode | null;
  onSelect: (mode: BlockMode) => void;
}

const MOBILE_ROWS: [FocusModeMeta, FocusModeMeta][] = [
  [FOCUS_MODES[0], FOCUS_MODES[1]],
  [FOCUS_MODES[2], FOCUS_MODES[3]],
];

export const FocusModeGrid: React.FC<FocusModeGridProps> = ({
  selected,
  suggestedMode,
  onSelect,
}) => {
  const { isMobile, gutter } = useResponsive();

  const layout = useMemo(() => {
    if (isMobile) {
      return MOBILE_ROWS.map((pair, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, { gap: gutter }]}>
          {pair.map((meta) => (
            <View key={meta.id} style={styles.cell}>
              <FocusModeTile
                meta={meta}
                selected={selected === meta.id}
                suggested={
                  suggestedMode != null &&
                  isActiveBlockMode(meta.id) &&
                  meta.id === suggestedMode
                }
                onPress={() => onSelect(meta.id)}
              />
            </View>
          ))}
        </View>
      ));
    }

    return (
      <View style={[styles.row, { gap: gutter }]}>
        {FOCUS_MODES.map((meta) => (
          <View key={meta.id} style={styles.cell}>
            <FocusModeTile
              meta={meta}
              selected={selected === meta.id}
              suggested={
                suggestedMode != null &&
                isActiveBlockMode(meta.id) &&
                meta.id === suggestedMode
              }
              onPress={() => onSelect(meta.id)}
            />
          </View>
        ))}
      </View>
    );
  }, [isMobile, gutter, selected, suggestedMode, onSelect]);

  return <View style={[styles.grid, { gap: gutter }]}>{layout}</View>;
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
