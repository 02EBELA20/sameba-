import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DEVOTIONAL_VERSES } from '../data/devotional';

export type IntervalHours = 1 | 3 | 6 | 12 | 24;

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const INTERVAL_HOURS_KEY = 'notification_interval_hours';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';
const USED_VERSES_KEY = 'used_notification_verses';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});

export async function initNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('verse-notifications', {
      name: 'Verse Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export async function enableVerseNotifications(): Promise<{ ok: boolean; reason?: string }> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return { ok: false, reason: 'Permission not granted' };
    }

    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
    await maintainScheduleIfNeeded(true);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function disableVerseNotifications(): Promise<{ ok: boolean }> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
}

export async function getNotifEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

export async function getIntervalHours(): Promise<IntervalHours> {
  try {
    const interval = await AsyncStorage.getItem(INTERVAL_HOURS_KEY);
    return (interval ? parseInt(interval, 10) : 6) as IntervalHours;
  } catch {
    return 6;
  }
}

export async function setIntervalHours(hours: IntervalHours): Promise<void> {
  try {
    await AsyncStorage.setItem(INTERVAL_HOURS_KEY, hours.toString());
    await maintainScheduleIfNeeded(true);
  } catch (error) {
    console.error('Error setting interval:', error);
  }
}

async function getUsedVerses(): Promise<number[]> {
  try {
    const used = await AsyncStorage.getItem(USED_VERSES_KEY);
    return used ? JSON.parse(used) : [];
  } catch {
    return [];
  }
}

async function addUsedVerse(id: number): Promise<void> {
  try {
    const used = await getUsedVerses();
    used.push(id);
    await AsyncStorage.setItem(USED_VERSES_KEY, JSON.stringify(used));
  } catch (error) {
    console.error('Error adding used verse:', error);
  }
}

function getNextVerse(usedIds: number[]) {
  const used = new Set(usedIds);
  const available = DEVOTIONAL_VERSES.filter(v => !used.has(v.id));
  
  if (available.length === 0) {
    return DEVOTIONAL_VERSES[Math.floor(Math.random() * DEVOTIONAL_VERSES.length)];
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

export async function maintainScheduleIfNeeded(force: boolean = false): Promise<void> {
  try {
    const enabled = await getNotifEnabled();
    if (!enabled) return;

    const scheduled = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const scheduledTime = scheduled ? parseInt(scheduled, 10) : 0;
    const now = Date.now();
    
    if (!force && now - scheduledTime < 6 * 60 * 60 * 1000) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const interval = await getIntervalHours();
    const usedVerses = await getUsedVerses();
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < Math.floor(24 / interval); j++) {
        const triggerDate = new Date(now);
        triggerDate.setDate(triggerDate.getDate() + i);
        triggerDate.setHours(j * interval, 0, 0, 0);
        
        if (triggerDate.getTime() <= now) continue;

        const verse = getNextVerse(usedVerses);
        await addUsedVerse(verse.id);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'SAMEBA',
            body: `${verse.book} ${verse.chapter}:${verse.verse}\n\n${verse.text.slice(0, 100)}${verse.text.length > 100 ? '...' : ''}`,
            data: { verseId: verse.id.toString() },
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      }
    }

    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, now.toString());
  } catch (error) {
    console.error('Error maintaining schedule:', error);
  }
}

export function normalizeVerseIdFromData(data: any): string | null {
  if (data && typeof data === 'object' && 'verseId' in data) {
    return String(data.verseId);
  }
  return null;
}
