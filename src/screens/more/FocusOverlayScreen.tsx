import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { MoreStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import {
  FocusSessionHeader,
  FocusTimerRing,
  FocusControlCard,
  FocusEndSessionCard,
  FocusSessionFooter,
  FocusTimerControls,
} from '../../components/focus';
import { AppText } from '../../components/primitives/AppText';
import { useBlockStore } from '../../stores/useBlockStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useFocusCountdown } from '../../hooks/useFocusCountdown';
import { getFocusSessionDisplay } from '../../utils/focusSession';
import { getFocusModeMeta, isActiveBlockMode } from '../../utils/focusMode';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const LINES = [
  'deep work. no tabs.',
  'one task. full attention.',
  'ship something today.',
];

function formatFirstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] || 'Qadir';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export const FocusOverlayScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<MoreStackParamList>>();
  const userName = useSettingsStore((s) => s.userName);
  const {
    mode,
    modeDurations,
    sessions,
    logOverride,
    endFocus,
    setMode,
    timerPhase,
    phaseStartedAt,
    pausedAt,
    accumulatedPauseMs,
    pauseTimer,
    resumeTimer,
    startBreakPhase,
    startNextFocusPhase,
    skipToBreak,
  } = useBlockStore();
  const { horizontalPadding, isMobile, gutter } = useResponsive();

  const [lineIndex, setLineIndex] = useState(0);
  const [overrideText, setOverrideText] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [dnd, setDnd] = useState(true);
  const phaseHandledRef = useRef<string | null>(null);

  const openSession = useMemo(
    () => sessions.find((s) => !s.endedAt),
    [sessions],
  );
  const sessionMode = openSession?.mode ?? mode;
  const durationMode = isActiveBlockMode(sessionMode) ? sessionMode : 'work';
  const durations = modeDurations[durationMode];

  const targetMinutes =
    timerPhase === 'focus'
      ? durations.focusDurationMinutes
      : durations.breakDurationMinutes;
  const totalSeconds = targetMinutes * 60;

  const { remainingSeconds, phaseComplete } = useFocusCountdown({
    phaseStartedAt,
    targetMinutes,
    pausedAt,
    accumulatedPauseMs,
    timerPhase,
    enabled: !!phaseStartedAt,
  });

  useEffect(() => {
    const t = setInterval(() => setLineIndex((i) => (i + 1) % LINES.length), 300000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!phaseComplete || !phaseStartedAt) return;
    const key = `${timerPhase}-${phaseStartedAt}`;
    if (phaseHandledRef.current === key) return;
    phaseHandledRef.current = key;

    if (timerPhase === 'focus') {
      hapticLight();
      startBreakPhase();
    } else {
      hapticLight();
      userAlert('Break over', 'Start your next focus block when you are ready.');
    }
  }, [phaseComplete, timerPhase, phaseStartedAt, startBreakPhase]);

  const displayName = formatFirstName(userName);
  const sessionDisplay = useMemo(() => getFocusSessionDisplay(sessions), [sessions]);
  const isPaused = !!pausedAt;
  const breakComplete = timerPhase === 'break' && phaseComplete;
  const modeLabel = getFocusModeMeta(durationMode).label.toUpperCase();
  const phaseLabel =
    timerPhase === 'focus' ? `${modeLabel} SESSION` : `${modeLabel} BREAK`;

  const exitToFocusMode = useCallback(() => {
    endFocus();
    setMode('off');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'BlockMode' }],
      }),
    );
  }, [endFocus, navigation, setMode]);

  const submitOverride = () => {
    if (overrideText.toLowerCase() === 'override') {
      endFocus();
      logOverride(mode, 'emergency exit', Math.floor((totalSeconds - remainingSeconds) / 60));
      setMode('off');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'BlockMode' }],
        }),
      );
    }
  };

  const handlePauseResume = () => {
    if (isPaused) resumeTimer();
    else pauseTimer();
  };

  const handleStartNext = () => {
    phaseHandledRef.current = null;
    startNextFocusPhase();
  };

  const handleSkipToBreak = () => {
    phaseHandledRef.current = null;
    skipToBreak();
  };

  const timerBlock = (
    <>
      <FocusTimerRing
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        phaseLabel={phaseLabel}
        compact={isMobile}
      />
      <AppText variant="body-md" muted style={styles.line}>
        {LINES[lineIndex]}
      </AppText>
      <FocusTimerControls
        isPaused={isPaused}
        timerPhase={timerPhase}
        breakComplete={breakComplete}
        onPauseResume={handlePauseResume}
        onSkipToBreak={handleSkipToBreak}
        onStartNext={handleStartNext}
      />
      <AppText variant="body-md" muted style={styles.setupHint}>
        Edit setup changes lengths for the next focus block.
      </AppText>
      <View style={[styles.controls, { gap: gutter }]}>
        <FocusControlCard dndEnabled={dnd} onToggleDnd={() => setDnd((v) => !v)} />
        <FocusEndSessionCard onPress={exitToFocusMode} />
      </View>
    </>
  );

  return (
    <ScreenShell header="none" scroll={false} fullWidth skipBottomInset edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FocusSessionHeader
          onBack={() => navigation.goBack()}
          onPressEdit={() => navigation.navigate('BlockMode')}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppText
            variant={isMobile ? 'headline-md' : 'headline-lg-mobile'}
            style={styles.headline}
          >
            Stay in the flow, {displayName}.
          </AppText>

          {isMobile ? (
            timerBlock
          ) : (
            <View style={[styles.desktopRow, { gap: gutter }]}>
              <View style={styles.desktopHero}>{timerBlock}</View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingHorizontal: horizontalPadding }]}>
          {showOverride ? (
            <View style={styles.override}>
              <AppText variant="label-sm" style={styles.overrideLabel}>
                TYPE &quot;override&quot; to emergency exit
              </AppText>
              <TextInput
                style={styles.input}
                value={overrideText}
                onChangeText={setOverrideText}
                autoCapitalize="none"
                placeholder="override"
                placeholderTextColor={colors.outline}
                onSubmitEditing={submitOverride}
              />
              <View style={styles.overrideActions}>
                <Pressable onPress={() => setShowOverride(false)}>
                  <AppText variant="label-sm" style={styles.cancelBtn}>
                    CANCEL
                  </AppText>
                </Pressable>
                <Pressable onPress={submitOverride}>
                  <AppText variant="label-sm" style={styles.exitBtn}>
                    EXIT
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : null}

          <FocusSessionFooter
            sessionIndex={sessionDisplay.current}
            sessionTotal={sessionDisplay.total}
            onLongPress={() => setShowOverride(true)}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { height: '100%' as const } : {}),
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? { overflow: 'scroll' as const } : {}),
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headline: {
    textAlign: 'center',
    color: colors.onSurface,
    marginBottom: spacing.md,
    width: '100%',
  },
  line: {
    textAlign: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  setupHint: {
    textAlign: 'center',
    width: '100%',
    marginBottom: spacing.sm,
    fontSize: 12,
  },
  desktopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopHero: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
  },
  controls: {
    width: '100%',
    maxWidth: 480,
    marginTop: spacing.sm,
  },
  footer: {
    flexShrink: 0,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: 'rgba(19, 19, 19, 0.85)',
  },
  override: {
    width: '100%',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  overrideLabel: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textAlign: 'center',
  },
  input: {
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: colors.cardBgDeep,
    ...Platform.select({
      web: { outlineStyle: 'none' } as object,
      default: {},
    }),
  },
  overrideActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  exitBtn: {
    color: colors.accentRed,
    letterSpacing: 1,
  },
});
