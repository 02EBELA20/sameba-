// src/services/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEVOTIONAL_VERSES } from "../data/devotional";
import { subscriptionService } from "./subscription";

const CHANNEL_ID = "daily-verse";

const KEY_ENABLED = "notif_enabled";
const KEY_DECK = "notif_deck"; // shuffled list of verse indexes
const KEY_INDEX = "notif_index"; // pointer in deck
const KEY_LAST_BUCKET = "notif_last_bucket"; // to avoid rescheduling too often
const KEY_INTERVAL_HOURS = "notif_interval_hours"; // 1 | 3

let inited = false;

function getBucket(ts = Date.now()) {
  // include interval in bucket so change interval triggers new schedule
  // e.g. "2025-12-20-18-1" (hour + interval)
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  return `${y}-${m}-${day}-${h}`;
}

function startOfNextHour(now = new Date()) {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY_ENABLED);
  return v === "1";
}

async function setEnabled(v: boolean) {
  await AsyncStorage.setItem(KEY_ENABLED, v ? "1" : "0");
}

export async function getIntervalHours(): Promise<1 | 3> {
  const raw = await AsyncStorage.getItem(KEY_INTERVAL_HOURS);
  const n = Number(raw);
  return n === 3 ? 3 : 1;
}

export async function setIntervalHours(h: 1 | 3) {
  // პრემიუმ გეითინგის შემოწმება
  if (h === 3) {
    try {
      const isPremium = await subscriptionService.isPremiumActive();
      if (!isPremium) {
        console.log('3 საათიანი ინტერვალის დაყენების მცდელობა - მომხმარებელი არ არის პრემიუმ');
      }
    } catch (error) {
      console.error('პრემიუმ სტატუსის შემოწმების შეცდომა:', error);
    }
  }
  
  await AsyncStorage.setItem(KEY_INTERVAL_HOURS, String(h));
}

async function getDeckState(): Promise<{ deck: number[]; idx: number }> {
  const deckRaw = await AsyncStorage.getItem(KEY_DECK);
  const idxRaw = await AsyncStorage.getItem(KEY_INDEX);

  let deck: number[] = deckRaw ? JSON.parse(deckRaw) : [];
  let idx = idxRaw ? Number(idxRaw) : 0;

  const expectedLen = DEVOTIONAL_VERSES.length;

  if (!Array.isArray(deck) || deck.length !== expectedLen) {
    const base = Array.from({ length: expectedLen }, (_, i) => i);
    deck = shuffle(base);
    idx = 0;
    await AsyncStorage.setItem(KEY_DECK, JSON.stringify(deck));
    await AsyncStorage.setItem(KEY_INDEX, String(idx));
  }

  if (!Number.isFinite(idx) || idx < 0) idx = 0;
  return { deck, idx };
}

function formatVerseForNotification(v: any) {
  const text = String(v?.text ?? "").replace(/\s+/g, " ").trim();
  const ref =
    v?.book && v?.chapter && v?.verse
      ? `${v.book} ${v.chapter}:${v.verse}`
      : String(v?.ref ?? v?.reference ?? "").trim();

  const max = 140;
  const short = text.length > max ? text.slice(0, max - 1) + "…" : text;
  return ref ? `${short}  (${ref})` : short;
}

async function pullNextVerse(): Promise<{ i: number; title: string; body: string }> {
  const { deck, idx } = await getDeckState();

  // exhausted -> reshuffle and restart
  if (idx >= deck.length) {
    const base = Array.from({ length: DEVOTIONAL_VERSES.length }, (_, i) => i);
    const newDeck = shuffle(base);
    await AsyncStorage.setItem(KEY_DECK, JSON.stringify(newDeck));
    await AsyncStorage.setItem(KEY_INDEX, "1");

    const i = newDeck[0];
    const v = DEVOTIONAL_VERSES[i];
    return { i, title: "SAMEBA", body: formatVerseForNotification(v) };
  }

  const i = deck[idx];
  await AsyncStorage.setItem(KEY_INDEX, String(idx + 1));
  const v = DEVOTIONAL_VERSES[i];
  return { i, title: "SAMEBA", body: formatVerseForNotification(v) };
}

// ---------- PUBLIC API ----------

export function initNotifications() {
  if (inited) return;
  inited = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Daily Verse",
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => {});
  }
}

export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return { granted: true, canAskAgain: true };

  const res = await Notifications.requestPermissionsAsync();
  return { granted: res.granted, canAskAgain: res.canAskAgain };
}

export async function openOSNotificationSettings() {
  await Linking.openSettings();
}

export async function disableAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(KEY_LAST_BUCKET);
}

export async function enableVerseNotifications() {
  initNotifications();

  const perm = await requestNotificationPermission();
  if (!perm.granted) {
    await setEnabled(false);
    return { ok: false, reason: "permission_denied" as const };
  }

  await setEnabled(true);
  await maintainScheduleIfNeeded(true);
  return { ok: true as const };
}

export async function disableVerseNotifications() {
  await setEnabled(false);
  await disableAllScheduledNotifications();
  return { ok: true as const };
}

export async function getNotifEnabled() {
  return getEnabled();
}

/**
 * Call this:
 * - app start (Home mount)
 * - after toggle ON
 * - when app returns to foreground (AppState active)
 */
export async function maintainScheduleIfNeeded(force = false) {
  const enabled = await getEnabled();
  if (!enabled) return;

  const intervalHours = await getIntervalHours(); // 1 | 3

  // bucket includes hour + interval so changing interval triggers reschedule even within same hour
  const bucket = `${getBucket()}-${intervalHours}`;
  const last = await AsyncStorage.getItem(KEY_LAST_BUCKET);
  if (!force && last === bucket) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  // schedule next 24 hours horizon (enough; refreshed on app open)
  const now = new Date();
  let t = startOfNextHour(now);

  // how many notifications fit into 24 hours
  const count = Math.max(1, Math.floor(24 / intervalHours));

  for (let k = 0; k < count; k++) {
    const next = await pullNextVerse();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: next.title,
        body: next.body || "დღის მუხლი ✝️",
        data: { type: "verse", verseIndex: next.i },
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: t,
      },
    });

    t = addHours(t, intervalHours);
  }

  await AsyncStorage.setItem(KEY_LAST_BUCKET, bucket);
}

export function normalizeVerseIdFromData(data: any): string | null {
  const raw = data?.verseId ?? data?.id ?? data?.params?.id ?? data?.verseIndex;
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  return s.length ? s : null;
}
