import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNextDevotional } from '../data/devotional';

export type IntervalHours = 1 | 3 | 6 | 12 | 24;

export type NotificationSettings = {
  enabled: boolean;
  intervalHours: number;
  lastScheduledAt?: string;
};

const NOTIFICATIONS_SETTINGS_KEY = 'sameba_notification_settings';
const DEVOTIONAL_NOTIFICATION_CHANNEL_ID = 'sameba-devotional';

// Development logging helper
const log = (message: string, data?: any) => {
  if (__DEV__) {
    console.log(`[Notifications] ${message}`, data || '');
  }
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});


// Initialize Android notification channel
export async function initNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sameba-devotionals', {
      name: 'SAMEBA Devotionals',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9B7442',
    });
    log('Android notification channel created');
  }
}

// Storage functions
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      log('Loaded notification settings:', parsed);
      return parsed;
    }
  } catch (error) {
    log('Error loading notification settings:', error);
  }
  
  // Default settings
  const defaultSettings: NotificationSettings = {
    enabled: false,
    intervalHours: 6,
  };
  log('Using default notification settings:', defaultSettings);
  return defaultSettings;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(settings));
    log('Saved notification settings:', settings);
  } catch (error) {
    log('Error saving notification settings:', error);
    throw error;
  }
}

// Core scheduling functions
export async function scheduleDevotionalNotifications(options: {
  enabled: boolean;
  intervalHours: number;
}): Promise<void> {
  log('Starting devotional notification scheduling:', options);
  
  // Cancel existing SAMEBA notifications first
  await cancelDevotionalNotifications();
  
  if (!options.enabled) {
    log('Notifications disabled, scheduling cancelled');
    return;
  }

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    log('Notification permission not granted');
    throw new Error('Notification permission not granted');
  }

  const intervalSeconds = options.intervalHours * 60 * 60;
  const scheduleDays = 30; // Schedule 30 days ahead
  const maxNotifications = Math.min(64, Math.floor((scheduleDays * 24 * 60 * 60) / intervalSeconds));
  
  log(`Scheduling ${maxNotifications} notifications ahead for ${options.intervalHours}h interval`);

  for (let i = 0; i < maxNotifications; i++) {
    try {
      const devotional = await getNextDevotional();
      const triggerSeconds = intervalSeconds * i;
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${devotional.book} ${devotional.chapter}:${devotional.verse}`,
          body: devotional.text,
          data: {
            type: 'devotional',
            source: 'sameba-devotional',
            devotionalId: devotional.id,
            book: devotional.book,
            chapter: devotional.chapter,
            verse: devotional.verse,
          },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
          repeats: false,
          channelId: Platform.OS === 'android' ? 'sameba-devotionals' : undefined,
        },
      });

      log(`Scheduled notification ${i + 1}/${maxNotifications}:`, {
        id: notificationId,
        devotionalId: devotional.id,
        book: devotional.book,
        chapter: devotional.chapter,
        verse: devotional.verse,
        triggerIn: `${triggerSeconds}s (${Math.floor(triggerSeconds / 3600)}h)`
      });
    } catch (error) {
      log(`Error scheduling notification ${i + 1}:`, error);
    }
  }

  // Save settings with last scheduled timestamp
  const settings: NotificationSettings = {
    ...options,
    lastScheduledAt: new Date().toISOString(),
  };
  await saveNotificationSettings(settings);
  
  log('Devotional notification scheduling completed');
}

export async function cancelDevotionalNotifications(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const devotionalNotificationIds = scheduledNotifications
      .filter(notification => 
        notification.content?.data?.type === 'devotional'
      )
      .map(notification => notification.identifier);

    if (devotionalNotificationIds.length > 0) {
      // Cancel each devotional notification individually
      for (const id of devotionalNotificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      log(`Cancelled ${devotionalNotificationIds.length} devotional notifications`);
    } else {
      log('No devotional notifications to cancel');
    }
  } catch (error) {
    log('Error cancelling devotional notifications:', error);
  }
}

export async function refreshDevotionalNotificationSchedule(): Promise<void> {
  log('Refreshing devotional notification schedule');
  
  try {
    const settings = await getNotificationSettings();
    
    if (!settings.enabled) {
      log('Notifications disabled, skipping refresh');
      return;
    }

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const devotionalCount = scheduledNotifications.filter(
      notification => notification.content?.data?.type === 'devotional'
    ).length;

    const minRequiredNotifications = 8; // Keep at least 8 notifications ahead
    const needsRefresh = devotionalCount < minRequiredNotifications;

    log(`Current devotional notifications: ${devotionalCount}, required: ${minRequiredNotifications}, needs refresh: ${needsRefresh}`);

    if (needsRefresh) {
      await scheduleDevotionalNotifications({
        enabled: true,
        intervalHours: settings.intervalHours,
      });
      log('Devotional notification schedule refreshed');
    } else {
      log('Devotional notification schedule is healthy, no refresh needed');
    }
  } catch (error) {
    log('Error refreshing devotional notification schedule:', error);
  }
}

// Public API functions for UI
export async function enableDevotionalNotifications(intervalHours: IntervalHours): Promise<{ ok: boolean; reason?: string }> {
  try {
    await scheduleDevotionalNotifications({
      enabled: true,
      intervalHours,
    });
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    log('Error enabling devotional notifications:', error);
    return { ok: false, reason };
  }
}

export async function disableDevotionalNotifications(): Promise<{ ok: boolean; reason?: string }> {
  try {
    await cancelDevotionalNotifications();
    await saveNotificationSettings({
      enabled: false,
      intervalHours: 6, // Keep default interval
    });
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    log('Error disabling devotional notifications:', error);
    return { ok: false, reason };
  }
}

export async function updateNotificationInterval(intervalHours: IntervalHours): Promise<{ ok: boolean; reason?: string }> {
  try {
    const settings = await getNotificationSettings();
    if (settings.enabled) {
      await scheduleDevotionalNotifications({
        enabled: true,
        intervalHours,
      });
    } else {
      // Just save the interval for when notifications are enabled
      await saveNotificationSettings({
        ...settings,
        intervalHours,
      });
    }
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    log('Error updating notification interval:', error);
    return { ok: false, reason };
  }
}

// Legacy compatibility functions
export async function getNotifEnabled(): Promise<boolean> {
  const settings = await getNotificationSettings();
  return settings.enabled;
}

export async function getIntervalHours(): Promise<IntervalHours> {
  const settings = await getNotificationSettings();
  return (settings.intervalHours as IntervalHours) || 6;
}

export async function enableVerseNotifications(): Promise<{ ok: boolean; reason?: string }> {
  const interval = await getIntervalHours();
  return enableDevotionalNotifications(interval);
}

export async function disableVerseNotifications(): Promise<{ ok: boolean }> {
  const result = await disableDevotionalNotifications();
  return { ok: result.ok };
}

export async function setIntervalHours(hours: IntervalHours): Promise<void> {
  const result = await updateNotificationInterval(hours);
  if (!result.ok) {
    throw new Error(result.reason);
  }
}


// Utility functions
export function normalizeVerseIdFromData(data: any): string | null {
  if (data && typeof data === 'object' && 'devotionalId' in data) {
    return String(data.devotionalId);
  }
  return null;
}
