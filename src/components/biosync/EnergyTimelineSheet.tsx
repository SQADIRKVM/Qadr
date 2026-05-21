import React, { useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { format, subDays } from 'date-fns';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { EnergyFlowBlocks } from './EnergyFlowBlocks';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface EnergyTimelineSheetProps {
  visible: boolean;
  energyLog: { date: string; level: number }[];
  onClose: () => void;
  onLogInHabits?: () => void;
}

export const EnergyTimelineSheet: React.FC<EnergyTimelineSheetProps> = ({
  visible,
  energyLog,
  onClose,
  onLogInHabits,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      const key = format(d, 'yyyy-MM-dd');
      const entry = energyLog.find((e) => e.date === key);
      return {
        key,
        label: format(d, 'EEE'),
        level: entry?.level ?? 0,
      };
    });
  }, [energyLog]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <AppText variant="label-sm" style={styles.title}>
              ENERGY — LAST 7 DAYS
            </AppText>
            <ScrollView style={styles.scroll}>
              {days.map((day) => (
                <View key={day.key} style={styles.row}>
                  <View style={styles.rowLabel}>
                    <AppText variant="label-sm" style={styles.day}>
                      {day.label}
                    </AppText>
                    <AppText variant="body-md" muted>
                      {day.level > 0 ? `${day.level * 20}%` : '—'}
                    </AppText>
                  </View>
                  <EnergyFlowBlocks levels={Array.from({ length: 5 }, (_, i) => (i < day.level ? 1 : 0))} />
                </View>
              ))}
            </ScrollView>
            {onLogInHabits ? (
              <Button label="LOG ENERGY IN HABITS" variant="secondary" onPress={onLogInHabits} />
            ) : null}
            <Button label="CLOSE" onPress={onClose} style={{ marginTop: spacing.sm }} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.modalBorder,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { letterSpacing: 2, marginBottom: spacing.md, color: colors.onSurfaceVariant },
  scroll: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  rowLabel: { gap: 2 },
  day: { letterSpacing: 1, color: colors.onSurface },
});
