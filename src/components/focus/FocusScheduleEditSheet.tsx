import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppText } from '../primitives/AppText';
import { Button } from '../primitives/Button';
import { SettingsField } from '../settings/SettingsField';
import { normalizeScheduleTimes, type ScheduleTimeFields } from '../../utils/timeFormat';
import { userAlert } from '../../utils/userAlert';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export type FocusScheduleValues = Omit<ScheduleTimeFields, 'bedtime'> & { bedtime: string };

interface FocusScheduleEditSheetProps {
  visible: boolean;
  initial: FocusScheduleValues;
  onClose: () => void;
  onSave: (schedule: Omit<FocusScheduleValues, 'bedtime'>, bedtime: string) => void;
}

export const FocusScheduleEditSheet: React.FC<FocusScheduleEditSheetProps> = ({
  visible,
  initial,
  onClose,
  onSave,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [draft, setDraft] = useState<ScheduleTimeFields>({
    workOn: initial.workOn,
    workOff: initial.workOff,
    examOn: initial.examOn,
    examOff: initial.examOff,
    nightOn: initial.nightOn,
    nightOff: initial.nightOff,
    bedtime: initial.bedtime,
  });

  const resetDraft = useCallback(() => {
    setDraft({
      workOn: initial.workOn,
      workOff: initial.workOff,
      examOn: initial.examOn,
      examOff: initial.examOff,
      nightOn: initial.nightOn,
      nightOff: initial.nightOff,
      bedtime: initial.bedtime,
    });
  }, [initial]);

  useEffect(() => {
    if (visible) resetDraft();
  }, [visible, resetDraft]);

  const patch = (key: keyof ScheduleTimeFields, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    resetDraft();
    onClose();
  };

  const handleSave = () => {
    const normalized = normalizeScheduleTimes(draft);
    if (!normalized) {
      userAlert('Invalid time', 'Use 24-hour times like 09:00 or 23:30.');
      return;
    }
    hapticLight();
    onSave(
      {
        workOn: normalized.workOn,
        workOff: normalized.workOff,
        examOn: normalized.examOn,
        examOff: normalized.examOff,
        nightOn: normalized.nightOn,
        nightOff: normalized.nightOff,
      },
      normalized.bedtime,
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleCancel}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <AppText variant="label-sm" style={styles.title}>
              EDIT SCHEDULE
            </AppText>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <AppText variant="label-sm" style={styles.groupLabel}>
                WORK
              </AppText>
              <SettingsField
                label="START"
                value={draft.workOn}
                onChangeText={(v) => patch('workOn', v)}
                inputProps={{ placeholder: '09:00', keyboardType: 'numbers-and-punctuation' }}
              />
              <SettingsField
                label="END"
                value={draft.workOff}
                onChangeText={(v) => patch('workOff', v)}
                inputProps={{ placeholder: '18:00', keyboardType: 'numbers-and-punctuation' }}
              />

              <AppText variant="label-sm" style={styles.groupLabel}>
                EXAM
              </AppText>
              <SettingsField
                label="START"
                value={draft.examOn}
                onChangeText={(v) => patch('examOn', v)}
                inputProps={{ placeholder: '08:00', keyboardType: 'numbers-and-punctuation' }}
              />
              <SettingsField
                label="END"
                value={draft.examOff}
                onChangeText={(v) => patch('examOff', v)}
                inputProps={{ placeholder: '22:00', keyboardType: 'numbers-and-punctuation' }}
              />

              <AppText variant="label-sm" style={styles.groupLabel}>
                NIGHT
              </AppText>
              <SettingsField
                label="START"
                value={draft.nightOn}
                onChangeText={(v) => patch('nightOn', v)}
                inputProps={{ placeholder: '23:00', keyboardType: 'numbers-and-punctuation' }}
              />
              <SettingsField
                label="END"
                value={draft.nightOff}
                onChangeText={(v) => patch('nightOff', v)}
                inputProps={{ placeholder: '07:00', keyboardType: 'numbers-and-punctuation' }}
              />

              <AppText variant="label-sm" style={styles.groupLabel}>
                NIGHT AUTO
              </AppText>
              <SettingsField
                label="BEDTIME"
                value={draft.bedtime}
                onChangeText={(v) => patch('bedtime', v)}
                inputProps={{ placeholder: '23:30', keyboardType: 'numbers-and-punctuation' }}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Button label="SAVE SCHEDULE" onPress={handleSave} />
              <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                <AppText variant="label-sm" style={styles.cancelText}>
                  CANCEL
                </AppText>
              </Pressable>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  panel: {
    maxHeight: '88%',
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.modalBorder,
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outline,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  scroll: { flexGrow: 0 },
  scrollContent: { gap: spacing.sm, paddingBottom: spacing.md },
  groupLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    marginTop: spacing.sm,
  },
  actions: { gap: spacing.sm, paddingTop: spacing.sm },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelText: { color: colors.onSurfaceVariant, letterSpacing: 1 },
});
