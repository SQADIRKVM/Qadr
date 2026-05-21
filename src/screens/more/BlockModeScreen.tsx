import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import {
  FocusModeGrid,
  FocusScheduleCard,
  FocusSessionLog,
  FocusOverrideLog,
  FocusSessionLengthCard,
} from '../../components/focus';
import { FocusScheduleEditSheet } from '../../components/focus/FocusScheduleEditSheet';
import { scheduleBedtimeNudge } from '../../services/notifications';
import { AppText } from '../../components/primitives/AppText';
import { useBlockStore } from '../../stores/useBlockStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useResponsive } from '../../hooks/useResponsive';
import { confirmAction } from '../../utils/confirmAction';
import { getSuggestedBlockMode } from '../../utils/focusSchedule';
import { getFocusModeMeta, isActiveBlockMode, type ActiveBlockMode } from '../../utils/focusMode';
import type { MoreStackParamList } from '../../navigation/types';
import type { BlockMode as Mode } from '../../types';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

export const BlockModeScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<MoreStackParamList>>();
  const {
    mode,
    setMode,
    sessions,
    overrides,
    schedule,
    startFocus,
    endFocus,
    endSession,
    removeSession,
    updateSchedule,
    modeDurations,
    setFocusDurationPreset,
    setBreakDurationPreset,
    updateModeDurations,
    getOpenSession,
  } = useBlockStore();
  const { nightAuto, setNightAuto, bedtime, setBedtime } = useSettingsStore();
  const { gutter } = useResponsive();
  const [scheduleEditOpen, setScheduleEditOpen] = useState(false);

  const suggestedMode = useMemo(() => getSuggestedBlockMode(schedule), [schedule]);

  const lengthEditMode: ActiveBlockMode = useMemo(() => {
    if (isActiveBlockMode(mode)) return mode;
    return suggestedMode ?? 'work';
  }, [mode, suggestedMode]);

  const lengthSettings = modeDurations[lengthEditMode];

  const sessionLengthSubtitle = useMemo(() => {
    if (!suggestedMode) return undefined;
    if (mode === 'off') {
      return `Using suggested ${getFocusModeMeta(suggestedMode).label} lengths`;
    }
    if (isActiveBlockMode(mode) && lengthEditMode !== suggestedMode) {
      return `Editing ${getFocusModeMeta(mode).label} lengths · Schedule suggests ${getFocusModeMeta(suggestedMode).label}`;
    }
    return undefined;
  }, [mode, suggestedMode, lengthEditMode]);

  const handleSaveSchedule = (
    patch: {
      workOn: string;
      workOff: string;
      examOn: string;
      examOff: string;
      nightOn: string;
      nightOff: string;
    },
    nextBedtime: string,
  ) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
    updateSchedule(patch);
    setBedtime(nextBedtime);
    if (nightAuto) {
      void scheduleBedtimeNudge(nextBedtime);
    }
    setScheduleEditOpen(false);
  };

  const beginSession = (m: ActiveBlockMode) => {
    setMode(m);
    startFocus();
    navigation.navigate('FocusOverlay');
  };

  const selectMode = (m: Mode) => {
    hapticLight();
    const open = getOpenSession();

    if (m === 'off') {
      if (open) {
        confirmAction(
          'End focus session',
          'End the active session and turn focus off?',
          () => {
            endFocus();
            setMode('off');
          },
          { confirmLabel: 'End session', destructive: true },
        );
      } else {
        setMode('off');
      }
      return;
    }

    if (!isActiveBlockMode(m)) return;

    if (open && open.mode !== m) {
      confirmAction(
        'Switch focus mode',
        `End the current ${open.mode.toUpperCase()} session and start ${m.toUpperCase()}?`,
        () => {
          endFocus();
          beginSession(m);
        },
        { confirmLabel: 'Switch', destructive: true },
      );
      return;
    }

    if (open && open.mode === m) {
      navigation.navigate('FocusOverlay');
      return;
    }

    beginSession(m);
  };

  return (
    <ScreenShell
      header="none"
      scroll
      scrollProps={{
        contentContainerStyle: { flexGrow: 0, paddingTop: spacing.xs },
      }}
    >
      <SubScreenHeader title="Focus Mode" onBack={() => navigation.goBack()} />
      <View style={[styles.content, { gap: gutter }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            <Text style={styles.titleSlash}>/</Text>
            <Text style={styles.titleMain}>/ FOCUS MODE</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <AppText variant="label-sm" style={styles.sectionLabel}>
            SELECT MODE
          </AppText>
          {suggestedMode ? (
            <AppText variant="body-md" muted style={styles.suggestHint}>
              Schedule suggests {getFocusModeMeta(suggestedMode).label} right now
            </AppText>
          ) : null}
          <FocusModeGrid
            selected={mode}
            suggestedMode={suggestedMode}
            onSelect={selectMode}
          />
        </View>

        <FocusSessionLengthCard
          forMode={lengthEditMode}
          subtitle={sessionLengthSubtitle}
          focusDurationPreset={lengthSettings.focusDurationPreset}
          breakDurationPreset={lengthSettings.breakDurationPreset}
          focusDurationMinutes={lengthSettings.focusDurationMinutes}
          breakDurationMinutes={lengthSettings.breakDurationMinutes}
          onFocusPresetChange={(p) => setFocusDurationPreset(lengthEditMode, p)}
          onBreakPresetChange={(p) => setBreakDurationPreset(lengthEditMode, p)}
          onFocusMinutesChange={(n) =>
            updateModeDurations(lengthEditMode, { focusDurationMinutes: n })
          }
          onBreakMinutesChange={(n) =>
            updateModeDurations(lengthEditMode, { breakDurationMinutes: n })
          }
        />

        <FocusScheduleCard
          workOn={schedule.workOn}
          workOff={schedule.workOff}
          examOn={schedule.examOn}
          examOff={schedule.examOff}
          nightOn={schedule.nightOn}
          nightOff={schedule.nightOff}
          nightAuto={nightAuto}
          bedtime={bedtime}
          onPressEdit={() => setScheduleEditOpen(true)}
          onToggleNightAuto={() => setNightAuto(!nightAuto)}
        />

        <FocusScheduleEditSheet
          visible={scheduleEditOpen}
          initial={{
            workOn: schedule.workOn,
            workOff: schedule.workOff,
            examOn: schedule.examOn,
            examOff: schedule.examOff,
            nightOn: schedule.nightOn,
            nightOff: schedule.nightOff,
            bedtime,
          }}
          onClose={() => setScheduleEditOpen(false)}
          onSave={handleSaveSchedule}
        />

        <FocusSessionLog
          sessions={sessions}
          onCompleteSession={endSession}
          onRemoveSession={removeSession}
        />

        <FocusOverrideLog overrides={overrides} />

        <AppText variant="body-md" muted style={styles.footer}>
          this doesn&apos;t lock your phone. the log is the blocker.
        </AppText>
      </View>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  content: {
    width: '100%',
  },
  titleRow: {
    marginTop: spacing.xs,
  },
  title: {
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  titleSlash: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.secondary,
    letterSpacing: 2,
  },
  titleMain: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  section: {
    width: '100%',
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  suggestHint: {
    marginTop: -4,
    marginBottom: spacing.xs,
  },
  footer: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: spacing.lg,
  },
});
