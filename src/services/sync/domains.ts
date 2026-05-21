import { PERSIST_KEYS } from '../../utils/dataBackup';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useHabitStore } from '../../stores/useHabitStore';
import { useSleepStore } from '../../stores/useSleepStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useIdeaStore } from '../../stores/useIdeaStore';
import { useMoneyStore } from '../../stores/useMoneyStore';
import { useBlockStore } from '../../stores/useBlockStore';
import { useDecisionStore } from '../../stores/useDecisionStore';
import { useReviewStore } from '../../stores/useReviewStore';
import { useMindStore } from '../../stores/useMindStore';
import { useMindSpacesStore } from '../../stores/useMindSpacesStore';

export type PersistKey = (typeof PERSIST_KEYS)[number];

type PersistApi = {
  rehydrate: () => Promise<void> | void;
};

const registry: Record<PersistKey, PersistApi> = {
  'qadr-settings': useSettingsStore.persist,
  'qadr-dashboard': useDashboardStore.persist,
  'qadr-habits': useHabitStore.persist,
  'qadr-sleep': useSleepStore.persist,
  'qadr-projects': useProjectStore.persist,
  'qadr-ideas': useIdeaStore.persist,
  'qadr-money': useMoneyStore.persist,
  'qadr-decisions': useDecisionStore.persist,
  'qadr-reviews': useReviewStore.persist,
  'qadr-block': useBlockStore.persist,
  'qadr-mind-spaces': useMindSpacesStore.persist,
  'qadr-mind-items': useMindStore.persist,
};

export function getPersistRegistry(): Record<PersistKey, PersistApi> {
  return registry;
}

export async function rehydrateAllDomains(): Promise<void> {
  await Promise.all(PERSIST_KEYS.map((key) => Promise.resolve(registry[key].rehydrate())));
}
