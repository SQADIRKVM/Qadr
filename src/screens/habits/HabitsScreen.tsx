import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import { ScreenShell } from '../../components/layout';
import {
  TrackerHeader,
  TodayProgressCard,
  WeekStripCard,
  HabitTrackerCard,
  AddHabitCard,
  SleepLogCard,
  SleepEnergyCard,
  SleepTimePickerSheet,
  type TrackerTab,
} from '../../components/habits';
import { RestRecoveryCard } from '../../components/biosync/RestRecoveryCard';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { Chip } from '../../components/primitives/Chip';
import { useHabitStore } from '../../stores/useHabitStore';
import { useSleepStore } from '../../stores/useSleepStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import {
  getStreak,
  getSleepDurationHours,
  getRestQualityLabel,
} from '../../utils/selectors';
import {
  getTodayCompletionPercent,
  getProgressMessage,
  getWeekDays,
  getDayDotState,
  getSleepDayDotState,
  getWeekLabel,
  isHabitCompletedToday,
} from '../../utils/habitsTracker';
import type { HabitFrequency, SkipReason } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { confirmAction } from '../../utils/confirmAction';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

const SKIP_REASONS: SkipReason[] = ['tired', 'sick', 'forgot', 'busy', 'other'];

const DEFAULT_SLEPT = '23:30';
const DEFAULT_WOKE = '07:00';

function getSleepProgressMessage(score: number): string {
  if (score >= 85) return 'Recovery on point. Keep this rhythm.';
  if (score >= 70) return 'Solid rest — protect your wind-down tonight.';
  if (score >= 50) return 'Room to improve. Aim for an earlier bedtime.';
  if (score > 0) return 'Sleep debt building — reset tonight.';
  return 'Log sleep to unlock your bio-sync insights.';
}

function emptySleepForm() {
  return {
    sleptAt: DEFAULT_SLEPT,
    wokeAt: DEFAULT_WOKE,
    quality: 7,
    lateReasons: [] as string[],
  };
}

export const HabitsScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const [tab, setTab] = useState<TrackerTab>('habits');
  const { habits, completions, toggleHabit, skipHabit, addHabit } = useHabitStore();
  const { logs, logSleep, deleteSleep, getLogForDate, nudgeLog } = useSleepStore();
  const { energyToday, setEnergyToday } = useDashboardStore();
  const { isMobile, isTablet, isDesktop, gutter } = useResponsive();
  const cardCols = isDesktop ? 2 : isTablet ? 2 : 1;
  const cardWidth = `${100 / cardCols}%` as const;

  const sheetRef = useRef<BottomSheet>(null);
  const skipRef = useRef<BottomSheet>(null);
  const [skipHabitId, setSkipHabitId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✓');
  const [addFrequency, setAddFrequency] = useState<HabitFrequency>('daily');

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedSleepDate, setSelectedSleepDate] = useState(today);
  const [sleptAt, setSleptAt] = useState(DEFAULT_SLEPT);
  const [wokeAt, setWokeAt] = useState(DEFAULT_WOKE);
  const [quality, setQuality] = useState(7);
  const [lateReasons, setLateReasons] = useState<string[]>([]);
  const [timePicker, setTimePicker] = useState<'slept' | 'woke' | null>(null);

  const loadSleepFormForDate = useCallback(
    (dateKey: string) => {
      const log = getLogForDate(dateKey);
      if (log) {
        setSleptAt(log.sleptAt);
        setWokeAt(log.wokeAt);
        setQuality(log.quality);
        setLateReasons(log.lateReasons ?? []);
      } else {
        const empty = emptySleepForm();
        setSleptAt(empty.sleptAt);
        setWokeAt(empty.wokeAt);
        setQuality(empty.quality);
        setLateReasons(empty.lateReasons);
      }
    },
    [getLogForDate],
  );

  useEffect(() => {
    if (tab === 'sleep') {
      loadSleepFormForDate(selectedSleepDate);
    }
  }, [tab, selectedSleepDate, loadSleepFormForDate, logs]);

  const dailyHabits = useMemo(() => habits.filter((h) => h.frequency === 'daily'), [habits]);

  const habitPct = getTodayCompletionPercent(habits, completions, 'daily');
  const weekDays = getWeekDays();
  const weekLabel = getWeekLabel();

  const habitWeekDots = useMemo(
    () =>
      weekDays.map((date) => ({
        date,
        state: getDayDotState(date, habits, completions),
      })),
    [weekDays, habits, completions],
  );

  const sleepWeekDots = useMemo(
    () =>
      weekDays.map((date) => ({
        date,
        state: getSleepDayDotState(date, logs),
      })),
    [weekDays, logs],
  );

  const selectedLog = getLogForDate(selectedSleepDate);
  const todayLog = getLogForDate(today);
  const avgSleep =
    logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.score, 0) / Math.min(logs.length, 7)) : 0;
  const sleepPct = todayLog?.score ?? avgSleep;
  const honestyNights = nudgeLog.filter((n) => n.response === 'going_now').length;

  const displayLog = selectedSleepDate === today ? todayLog : selectedLog;
  const sleepHours = useMemo(() => {
    if (!displayLog) return null;
    return getSleepDurationHours(displayLog.sleptAt, displayLog.wokeAt);
  }, [displayLog]);

  const qualityLabel = displayLog ? getRestQualityLabel(displayLog.quality) : '—';
  const restDescription = sleepHours != null
    ? sleepHours >= 7
      ? 'Solid deep sleep. Fully recharged for today.'
      : 'Decent rest — protect your evening wind-down.'
    : 'Log sleep to see recovery stats.';

  const editingDateLabel =
    selectedSleepDate === today
      ? 'Today'
      : format(new Date(selectedSleepDate + 'T12:00:00'), 'EEE, MMM d');

  const toggleLateReason = (r: string) => {
    setLateReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const handleSleepDayPress = (date: Date) => {
    setSelectedSleepDate(format(date, 'yyyy-MM-dd'));
  };

  const saveSleep = () => {
    logSleep(
      { sleptAt, wokeAt, quality, lateReasons, nightDistraction: false },
      selectedSleepDate,
    );
  };

  const handleDeleteSleep = () => {
    if (!selectedLog) return;
    confirmAction(
      'Delete sleep log',
      `Remove sleep entry for ${editingDateLabel}?`,
      () => {
        deleteSleep(selectedSleepDate);
        loadSleepFormForDate(selectedSleepDate);
      },
      { confirmLabel: 'Delete', destructive: true },
    );
  };

  const openSkip = (habitId: string) => {
    setSkipHabitId(habitId);
    skipRef.current?.expand();
  };

  const saveHabit = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), icon, frequency: addFrequency, startDate: today });
    setName('');
    setIcon('✓');
    setAddFrequency('daily');
    sheetRef.current?.close();
  };

  const habitCards = (
    <View style={[styles.cardGrid, { gap: gutter }]}>
      {dailyHabits.map((h) => {
        const completed = isHabitCompletedToday(h.id, completions);
        const streak = getStreak(h.id, completions);
        return (
          <View key={h.id} style={[styles.cardGridItem, { width: cardWidth }]}>
            <HabitTrackerCard
              name={h.name}
              icon={h.icon}
              streak={streak}
              completed={completed}
              onToggle={() => toggleHabit(h.id)}
              onLongPress={() => openSkip(h.id)}
            />
          </View>
        );
      })}
      <View style={[styles.cardGridItem, { width: cardWidth }]}>
        <AddHabitCard onPress={() => sheetRef.current?.expand()} />
      </View>
    </View>
  );

  const sleepCards = (
    <View style={[styles.cardGrid, { gap: gutter }]}>
      <View style={[styles.cardGridItem, styles.cardFull]}>
        <SleepLogCard
          sleptAt={sleptAt}
          wokeAt={wokeAt}
          quality={quality}
          lateReasons={lateReasons}
          editingDateLabel={editingDateLabel}
          hasExistingLog={!!selectedLog}
          todayScore={displayLog?.score}
          onSleptAtPress={() => setTimePicker('slept')}
          onWokeAtPress={() => setTimePicker('woke')}
          onQualityChange={setQuality}
          onLateReasonToggle={toggleLateReason}
          onLog={saveSleep}
          onDelete={selectedLog ? handleDeleteSleep : undefined}
        />
      </View>
      <View style={[styles.cardGridItem, { width: cardWidth }]}>
        <RestRecoveryCard
          hours={sleepHours}
          qualityLabel={qualityLabel}
          description={restDescription}
        />
      </View>
      <View style={[styles.cardGridItem, { width: cardWidth }]}>
        <SleepEnergyCard
          energy={energyToday}
          onEnergyChange={setEnergyToday}
          honestyNights={honestyNights}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenShell
        header="workspace"
        scroll
        scrollProps={{
          contentContainerStyle: { paddingTop: spacing.xs },
        }}
      >
        <TrackerHeader tab={tab} onTabChange={setTab} />

        <View style={[styles.layout, !isMobile && styles.layoutWide, { gap: gutter }]}>
          <View style={[styles.leftCol, !isMobile && styles.leftColWide]}>
            <TodayProgressCard
              percent={tab === 'habits' ? habitPct : sleepPct}
              message={
                tab === 'habits'
                  ? getProgressMessage(habitPct)
                  : getSleepProgressMessage(sleepPct)
              }
              label={tab === 'habits' ? "TODAY'S PROGRESS" : 'BIO-SYNC SCORE'}
            />
            <WeekStripCard
              weekLabel={weekLabel}
              days={tab === 'habits' ? habitWeekDots : sleepWeekDots}
              onDayPress={tab === 'sleep' ? handleSleepDayPress : undefined}
              selectedDate={tab === 'sleep' ? selectedSleepDate : undefined}
            />
          </View>

          <View style={[styles.rightCol, !isMobile && styles.rightColWide]}>
            {tab === 'habits' ? habitCards : sleepCards}
          </View>
        </View>
      </ScreenShell>

      <SleepTimePickerSheet
        visible={timePicker === 'slept'}
        label="SLEPT AT"
        value={sleptAt}
        onClose={() => setTimePicker(null)}
        onSave={setSleptAt}
      />
      <SleepTimePickerSheet
        visible={timePicker === 'woke'}
        label="WOKE AT"
        value={wokeAt}
        onClose={() => setTimePicker(null)}
        onSave={setWokeAt}
      />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose
        containerStyle={styles.sheetContainer}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={{ backgroundColor: colors.outline }}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm">ADD HABIT</AppText>
          <TextInput
            style={styles.input}
            placeholder="Habit name"
            placeholderTextColor={colors.outlineVariant}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Icon (emoji)"
            placeholderTextColor={colors.outlineVariant}
            value={icon}
            onChangeText={setIcon}
          />
          <View style={styles.freqRow}>
            {(['daily', 'weekly', 'monthly'] as HabitFrequency[]).map((f) => (
              <Chip
                key={f}
                label={f.toUpperCase()}
                selected={addFrequency === f}
                onPress={() => setAddFrequency(f)}
              />
            ))}
          </View>
          <Button label="SAVE" onPress={saveHabit} />
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={skipRef}
        index={-1}
        snapPoints={['35%']}
        enablePanDownToClose
        containerStyle={styles.sheetContainer}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={{ backgroundColor: colors.outline }}
      >
        <BottomSheetView style={styles.sheet}>
          <AppText variant="label-sm">SKIP WITH REASON</AppText>
          {SKIP_REASONS.map((r) => (
            <Chip
              key={r}
              label={r}
              onPress={() => {
                if (skipHabitId) skipHabit(skipHabitId, r);
                skipRef.current?.close();
              }}
            />
          ))}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  screen: { flex: 1, minHeight: 0 },
  layout: {
    gap: spacing.md,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftCol: {
    gap: spacing.md,
  },
  leftColWide: {
    flex: 1,
    minWidth: 0,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
  },
  rightColWide: {
    flex: 2,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardGridItem: {
    width: '100%',
  },
  cardFull: {
    width: '100%',
  },
  freqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetContainer: {
    pointerEvents: 'box-none',
  },
  sheetBg: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.modalBorder,
  },
  sheet: { padding: spacing.screenMargin, gap: 12 },
  input: {
    fontSize: 16,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: 8,
  },
});
