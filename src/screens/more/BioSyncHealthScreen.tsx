import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { format } from 'date-fns';
import { ScreenShell, SubScreenHeader } from '../../components/layout';
import { AppText } from '../../components/primitives/AppText';
import {
  BioSyncHero,
  DailyVitalityWidget,
  RestRecoveryCard,
  MindfulFocusCard,
  DailyEnergyCard,
} from '../../components/biosync';
import { EnergyTimelineSheet } from '../../components/biosync/EnergyTimelineSheet';
import { useSleepStore } from '../../stores/useSleepStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useBlockStore } from '../../stores/useBlockStore';
import {
  getSleepScoreLatest,
  getSleepDurationHours,
  getTodayFocusHours,
  getDailyVitalityPercent,
  getVitalityStatusLine,
  getRestQualityLabel,
  getEnergyBlockLevels,
} from '../../utils/selectors';
import type { MoreStackParamList, RootTabParamList } from '../../navigation/types';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

type BioSyncNav = CompositeNavigationProp<
  StackNavigationProp<MoreStackParamList, 'BioSyncHealth'>,
  BottomTabNavigationProp<RootTabParamList>
>;

const getRestDescription = (hours: number | null, quality: number): string => {
  if (hours === null) {
    return 'Log sleep to see recovery stats and personalized insights for your day ahead.';
  }
  if (hours >= 7.5 && quality >= 7) {
    return "Solid deep sleep last night. You're fully recharged for the day ahead.";
  }
  if (hours >= 6) {
    return 'Decent rest — consider an earlier wind-down tonight to sharpen tomorrow.';
  }
  return 'Sleep debt detected. Protect your evening and aim for a fuller recovery tonight.';
};

const getFocusRhythmLine = (hours: number): string => {
  if (hours >= 4) return 'Great rhythm today';
  if (hours >= 2) return 'Building momentum';
  if (hours > 0) return 'Light focus so far';
  return 'Start a focus session';
};

export const BioSyncHealthScreen = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<BioSyncNav>();
  const tabNav = navigation.getParent();
  const { isMobile, gutter } = useResponsive();
  const logs = useSleepStore((s) => s.logs);
  const energyLog = useDashboardStore((s) => s.energyLog);
  const energyToday = useDashboardStore((s) => s.energyToday);
  const sessions = useBlockStore((s) => s.sessions);
  const [energySheetOpen, setEnergySheetOpen] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find((l) => l.date === today);
  const sleepScore = getSleepScoreLatest(logs);
  const vitalityPercent = getDailyVitalityPercent(sleepScore, energyToday);
  const statusLine = getVitalityStatusLine(vitalityPercent);

  const sleepHours = useMemo(() => {
    if (!todayLog) return null;
    return getSleepDurationHours(todayLog.sleptAt, todayLog.wokeAt);
  }, [todayLog]);

  const focusHours = useMemo(() => getTodayFocusHours(sessions), [sessions]);
  const blockLevels = useMemo(() => getEnergyBlockLevels(energyToday), [energyToday]);

  const qualityLabel = todayLog ? getRestQualityLabel(todayLog.quality) : '—';
  const restDescription = getRestDescription(sleepHours, todayLog?.quality ?? 0);
  const rhythmLine = getFocusRhythmLine(focusHours);

  const goLogSleep = () => {
    hapticLight();
    tabNav?.navigate('Habits');
  };

  const goLogEnergy = () => {
    setEnergySheetOpen(false);
    tabNav?.navigate('Habits');
  };

  return (
    <ScreenShell header="none" scroll>
      <SubScreenHeader title="Bio-Sync" onBack={() => navigation.goBack()} />
      <View style={[styles.heroRow, !isMobile && styles.heroRowWide, { marginBottom: gutter }]}>
        <BioSyncHero statusLine={statusLine} compact={isMobile} />
        <DailyVitalityWidget percent={vitalityPercent} />
      </View>

      <View style={[styles.bentoRow, !isMobile && styles.bentoRowWide, { gap: gutter, marginBottom: gutter }]}>
        <RestRecoveryCard
          hours={sleepHours}
          qualityLabel={qualityLabel}
          description={restDescription}
          style={!isMobile ? styles.restWide : undefined}
        />
        <MindfulFocusCard
          hours={focusHours}
          rhythmLine={rhythmLine}
          style={!isMobile ? styles.focusNarrow : undefined}
        />
      </View>

      <DailyEnergyCard
        blockLevels={blockLevels}
        onMorePress={() => setEnergySheetOpen(true)}
      />

      <Pressable onPress={goLogSleep} style={({ pressed }) => [styles.logCta, pressed && { opacity: 0.7 }]}>
        <AppText variant="label-sm" style={styles.logCtaText}>
          LOG SLEEP
        </AppText>
      </Pressable>

      <EnergyTimelineSheet
        visible={energySheetOpen}
        energyLog={energyLog}
        onClose={() => setEnergySheetOpen(false)}
        onLogInHabits={goLogEnergy}
      />
    </ScreenShell>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  heroRow: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  heroRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bentoRow: {
    width: '100%',
  },
  bentoRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  restWide: {
    flex: 2,
    minWidth: 0,
  },
  focusNarrow: {
    flex: 1,
    minWidth: 0,
  },
  logCta: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  logCtaText: {
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
});
