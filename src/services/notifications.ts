import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { parseISO, startOfDay, differenceInCalendarDays } from 'date-fns';
import type { Subscription } from '../types';

/** Scheduled local notifications are native-only (expo-notifications web APIs are limited). */
export const isNativeNotificationsSupported = (): boolean => Platform.OS !== 'web';

if (isNativeNotificationsSupported()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!isNativeNotificationsSupported()) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const SUBSCRIPTION_PREFIX = 'qadr-sub-';
const BEDTIME_NUDGE_ID = 'qadr-bedtime-nudge';

export const scheduleSubscriptionReminders = async (
  subscriptions: Subscription[],
): Promise<number> => {
  if (!isNativeNotificationsSupported()) return 0;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith(SUBSCRIPTION_PREFIX)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const today = startOfDay(new Date());
  let count = 0;

  for (const sub of subscriptions) {
    if (!sub.active) continue;
    const due = parseISO(sub.nextDueDate);
    if (Number.isNaN(due.getTime())) continue;
    const days = differenceInCalendarDays(startOfDay(due), today);
    if (days < 0 || days > 7) continue;

    const triggerDate = new Date(due);
    triggerDate.setHours(9, 0, 0, 0);
    if (triggerDate.getTime() <= Date.now()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${SUBSCRIPTION_PREFIX}${sub.id}`,
      content: {
        title: 'Subscription due',
        body: `${sub.name} is due ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}.`,
        data: { type: 'subscription_due', subscriptionId: sub.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    count += 1;
  }

  return count;
};

export const scheduleBedtimeNudge = async (bedtime: string): Promise<void> => {
  if (!isNativeNotificationsSupported()) return;
  await Notifications.cancelScheduledNotificationAsync(BEDTIME_NUDGE_ID);
  const [h, m] = bedtime.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: BEDTIME_NUDGE_ID,
    content: {
      title: 'still awake, qadir?',
      body: 'Tap to log your response.',
      data: { type: 'night_nudge' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: h,
      minute: m,
    },
  });
};

export const setupNotificationCategories = async (): Promise<void> => {
  if (!isNativeNotificationsSupported()) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Qadr',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};
