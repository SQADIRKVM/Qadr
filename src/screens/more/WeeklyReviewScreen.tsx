import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import {
  WeeklyReviewHero,
  WeeklyActivitySummary,
  WeeklyCoachNotes,
} from '../../components/weeklyReview';
import { AppText } from '../../components/primitives/AppText';
import { Button } from '../../components/primitives/Button';
import { generateWeeklyReview } from '../../services/ai/weeklyReview';
import { hasAIConfigured } from '../../services/ai/client';
import { useReviewStore } from '../../stores/useReviewStore';
import {
  useSleepStore,
  useHabitStore,
  useIdeaStore,
  useProjectStore,
  useBlockStore,
  useDashboardStore,
  useDecisionStore,
  useMoneyStore,
} from '../../stores';
import { getWeekNumber, getSleepScoreLatest, getTodayFocusHours } from '../../utils/selectors';
import { getTodayCompletionPercent } from '../../utils/habitsTracker';
import {
  formatWeekOfLabel,
  getWeeklyRestAverageHours,
  formatRestHours,
  getWeeklyHabitsKept,
  formatHabitsKept,
  buildCoachBullets,
  getDirectiveFromReview,
} from '../../utils/weeklyReviewDisplay';
import { sanitizeStoredWeeklyReview } from '../../utils/normalizeWeeklyReview';
import { useResponsive } from '../../hooks/useResponsive';
import type { MoreStackParamList, RootTabParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { AIConfigBanner } from '../../components/primitives/AIConfigBanner';
import { userAlert } from '../../utils/userAlert';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type WeeklyReviewNav = CompositeNavigationProp<
  StackNavigationProp<MoreStackParamList, 'WeeklyReview'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export const WeeklyReviewScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<WeeklyReviewNav>();
  const { weeklyReviews, addReview } = useReviewStore();
  const { isMobile, gutter } = useResponsive();
  const [loading, setLoading] = useState(false);
  const latest = weeklyReviews[0];

  const sleepLogs = useSleepStore((s) => s.logs);
  const habits = useHabitStore((s) => s.habits);
  const completions = useHabitStore((s) => s.completions);

  const activityMetrics = useMemo(() => {
    const rest = getWeeklyRestAverageHours(sleepLogs);
    const { kept, expected } = getWeeklyHabitsKept(habits, completions);
    return {
      restHours: formatRestHours(rest),
      habitsKept: formatHabitsKept(kept, expected),
    };
  }, [sleepLogs, habits, completions]);

  const coachData = useMemo(() => {
    if (!latest) return null;
    const safe = sanitizeStoredWeeklyReview(latest);
    return {
      weekLabel: formatWeekOfLabel(latest.createdAt),
      summary: safe.summary,
      focusScore: safe.focusScore,
      bullets: buildCoachBullets(latest),
      directive: getDirectiveFromReview(latest),
    };
  }, [latest]);

  const runReview = async () => {
    setLoading(true);
    const dash = useDashboardStore.getState();
    const habitState = useHabitStore.getState();
    const projectState = useProjectStore.getState();
    const active = projectState.projects.find((p) => p.id === projectState.activeProjectId);
    const sleepLogs = useSleepStore.getState().logs;
    const sessions = useBlockStore.getState().sessions;
    const payload = JSON.stringify({
      dashboard: {
        oneThing: dash.oneThing,
        oneThingDone: dash.oneThingDone,
      },
      habits: {
        percent: Math.round(
          getTodayCompletionPercent(habitState.habits, habitState.completions, 'daily'),
        ),
      },
      sleep: { latestScore: getSleepScoreLatest(sleepLogs) },
      projects: {
        active: active
          ? {
              name: active.name,
              openTasks: active.tasks.filter((t) => !t.done).length,
            }
          : null,
      },
      blocks: { focusMinutesToday: Math.round(getTodayFocusHours(sessions) * 60) },
      raw: {
        sleepLogs: sleepLogs.slice(0, 7),
        ideas: useIdeaStore.getState().ideas.length,
        decisions: useDecisionStore.getState().decisions.length,
      },
    });
    const { review, fromStub, error } = await generateWeeklyReview(payload);
    addReview({
      weekNumber: getWeekNumber(),
      year: new Date().getFullYear(),
      ...review,
    });
    setLoading(false);
    if (hasAIConfigured() && fromStub && error) {
      userAlert(
        'Weekly Review',
        'AI request failed — showing an offline review. Check your API key and connection.',
      );
    }
  };

  return (
    <ScreenShell
      header="none"
      scroll
      scrollProps={{
        contentContainerStyle: { paddingTop: spacing.xs, paddingBottom: spacing.xl },
      }}
    >
      <SubScreenHeader title="Weekly Review" onBack={() => navigation.goBack()} />
      <AIConfigBanner />

      <Button
        label={loading ? 'GENERATING...' : 'RUN WEEKLY REVIEW'}
        onPress={runReview}
        loading={loading}
        style={styles.runBtn}
      />

      {latest && coachData ? (
        <>
          <WeeklyReviewHero weekLabel={coachData.weekLabel} />

          <View style={[styles.grid, isMobile ? styles.gridMobile : styles.gridDesktop, { gap: gutter }]}>
            <View style={isMobile ? styles.colFull : styles.colActivity}>
              <WeeklyActivitySummary
                focusScore={coachData.focusScore}
                restHours={activityMetrics.restHours}
                habitsKept={activityMetrics.habitsKept}
              />
            </View>
            <View style={isMobile ? styles.colFull : styles.colCoach}>
              <WeeklyCoachNotes
                summary={coachData.summary}
                bullets={coachData.bullets}
                directiveTitle={coachData.directive.title}
                directiveSubtitle={coachData.directive.subtitle}
                onDirectivePress={() => navigation.getParent()?.navigate('Projects')}
              />
            </View>
          </View>
        </>
      ) : (
        !loading && (
          <AppText variant="body-md" muted style={styles.empty}>
            No reviews yet. Run your first weekly review to see your week in review.
          </AppText>
        )
      )}
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  runBtn: {
    marginBottom: spacing.lg,
  },
  grid: {
    width: '100%',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  gridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colFull: {
    width: '100%',
  },
  colActivity: {
    width: '41.67%',
    paddingRight: spacing.sm,
  },
  colCoach: {
    width: '58.33%',
    paddingLeft: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
});
