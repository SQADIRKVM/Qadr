import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenShell } from '../../components/layout';
import {
  TopPriorityCard,
  FocusModeCard,
  DailyGoalsCard,
  HealthEnergyCard,
  DailyBriefingCard,
  MoodCheckInCard,
} from '../../components/home';
import { AppText } from '../../components/primitives/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import type { HomeStackParamList, RootTabParamList } from '../../navigation/types';
import {
  useSettingsStore,
  useDashboardStore,
  useSleepStore,
  useProjectStore,
  useBlockStore,
  useHabitStore,
  useMoneyStore,
} from '../../stores';
import {
  getGreetingFriendly,
  isOneThingMorningDue,
  getSleepScoreLatest,
  getTodayFocusHours,
} from '../../utils/selectors';
import { getSuggestedBlockMode, getScheduleOffTime } from '../../utils/focusSchedule';
import { isActiveBlockMode, type ActiveBlockMode } from '../../utils/focusMode';
import { getTodayCompletionPercent } from '../../utils/habitsTracker';
import { getNextSubscriptionBrief } from '../../utils/dailyBriefing';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import type { TextVariant } from '../../theme/typography';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type HomeNav = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'Dashboard'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export const HomeScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<HomeNav>();
  const { isMobile, isDesktop, gutter, titleVariant } = useResponsive();
  const userName = useSettingsStore((s) => s.userName);
  const { oneThing, oneThingDate, oneThingDone, setMood, getTodayMood, setEnergyToday } =
    useDashboardStore();
  const todayMood = getTodayMood();
  const sleepLogs = useSleepStore((s) => s.logs);
  const energyToday = useDashboardStore((s) => s.energyToday);
  const { projects, activeProjectId, toggleTask } = useProjectStore();
  const { mode: blockMode, setMode, schedule, startFocus, sessions, getOpenSession } =
    useBlockStore();
  const { habits, completions } = useHabitStore();
  const subscriptions = useMoneyStore((s) => s.subscriptions);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const sleepScore = getSleepScoreLatest(sleepLogs);
  const energyPercent = energyToday > 0 ? energyToday * 20 : null;

  const priorityTitle = oneThing?.trim() || 'Set your one thing for today.';

  const dailyTasks = useMemo(() => {
    const tasks = activeProject?.tasks ?? [];
    const open = tasks.filter((t) => !t.done);
    const done = tasks.filter((t) => t.done);
    return [...open, ...done].slice(0, 5);
  }, [activeProject?.tasks]);

  const subBrief = useMemo(
    () => getNextSubscriptionBrief(subscriptions),
    [subscriptions],
  );

  const briefingData = useMemo(
    () => ({
      oneThing: oneThing ?? '',
      oneThingDone,
      mood: todayMood,
      habitsPercent: Math.round(getTodayCompletionPercent(habits, completions, 'daily')),
      nextSubName: subBrief?.name ?? null,
      nextSubDue: subBrief?.due ?? null,
      focusMinutesToday: Math.round(getTodayFocusHours(sessions) * 60),
    }),
    [oneThing, oneThingDone, todayMood, habits, completions, subBrief, sessions],
  );

  const focusEnabled = isActiveBlockMode(blockMode);
  const focusUntilMode = useMemo(() => {
    if (isActiveBlockMode(blockMode)) return blockMode;
    return getSuggestedBlockMode(schedule) ?? 'work';
  }, [blockMode, schedule]);
  const focusUntilTime = getScheduleOffTime(schedule, focusUntilMode);

  useEffect(() => {
    if (isOneThingMorningDue(oneThingDate)) {
      navigation.navigate('OneThingModal');
    }
  }, [oneThingDate, navigation]);

  const openFocusOverlay = () => {
    navigation.getParent()?.navigate('More', { screen: 'FocusOverlay' });
  };

  const startFocusWithSuggestedMode = () => {
    const suggested = getSuggestedBlockMode(schedule) ?? 'work';
    setMode(suggested as ActiveBlockMode);
    startFocus();
  };

  const handleStartTask = () => {
    hapticLight();
    if (!focusEnabled) {
      startFocusWithSuggestedMode();
    }
    openFocusOverlay();
  };

  const handlePriorityPress = () => {
    navigation.navigate('OneThingModal');
  };

  const openBlockMode = () => {
    navigation.getParent()?.navigate('More', { screen: 'BlockMode' });
  };

  const handleFocusToggle = () => {
    if (focusEnabled) {
      setMode('off');
    } else {
      startFocusWithSuggestedMode();
    }
  };

  const openBioSync = () => {
    navigation.getParent()?.navigate('More', { screen: 'BioSyncHealth' });
  };

  const openHabitsForEnergy = () => {
    navigation.getParent()?.navigate('Habits');
  };

  const handleToggleTask = (taskId: string) => {
    if (activeProject) toggleTask(activeProject.id, taskId);
  };

  const handleAddGoal = () => {
    navigation.getParent()?.navigate('Projects');
  };

  const greetingVariant = (isDesktop ? 'headline-xl' : titleVariant) as TextVariant;

  return (
    <ScreenShell header="workspace">
      <View style={styles.hero}>
        <AppText variant={greetingVariant} style={styles.greeting}>
          {getGreetingFriendly(userName)}
        </AppText>
        <AppText variant="body-lg" muted style={styles.subtitle}>
          Let's make today count. Here is your daily overview.
        </AppText>
      </View>

      <View style={[styles.bento, { gap: gutter }]}>
        <DailyBriefingCard data={briefingData} />
        <MoodCheckInCard mood={todayMood} onSelect={setMood} />

        <View
          style={[
            styles.row,
            !isMobile && styles.rowSplit,
            { gap: gutter },
          ]}
        >
          <View style={!isMobile ? styles.colWide : styles.colFull}>
            <TopPriorityCard
              title={priorityTitle}
              inProgress={
                Boolean(getOpenSession()) ||
                Boolean(oneThing?.trim() && !oneThingDone)
              }
              onStartTask={handleStartTask}
              onPressTitle={handlePriorityPress}
            />
          </View>
          <View style={!isMobile ? styles.colNarrow : styles.colFull}>
            <FocusModeCard
              enabled={focusEnabled}
              untilTime={focusUntilTime}
              onToggle={handleFocusToggle}
              onPressEdit={openBlockMode}
            />
          </View>
        </View>

        <View
          style={[
            styles.row,
            !isMobile && styles.rowSplit,
            { gap: gutter },
          ]}
        >
          <View style={styles.colHalf}>
            <DailyGoalsCard
              tasks={dailyTasks}
              onToggleTask={handleToggleTask}
              onAddGoal={handleAddGoal}
            />
          </View>
          <View style={styles.colHalf}>
            <HealthEnergyCard
              sleepScore={sleepScore}
              energyPercent={energyPercent}
              energyLevel={energyToday}
              onEnergyChange={setEnergyToday}
              onBioSyncPress={openBioSync}
              onLogEnergyInHabits={energyToday === 0 ? openHabitsForEnergy : undefined}
            />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  hero: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  greeting: {
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    maxWidth: 640,
  },
  bento: {
    width: '100%',
    paddingBottom: spacing.md,
  },
  row: {
    width: '100%',
  },
  rowSplit: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  colFull: { width: '100%' },
  colWide: { flex: 2, minWidth: 0 },
  colNarrow: { flex: 1, minWidth: 280, maxWidth: 420 },
  colHalf: { flex: 1, minWidth: 0 },
});
