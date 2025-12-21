import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import * as Notifications from "expo-notifications";

import { DEVOTIONAL_VERSES, DevotionalVerse } from "../src/data/devotional";
import { getFavorites, toggleFavorite } from "../src/services/storage";

import {
  ensureNotificationPermission,
  disableAllScheduledNotifications,
  scheduleMultipleTimesPerDay,
  scheduleEveryNHours,
} from "../src/services/notifications";

type Mode = "times" | "interval";

const KEY_ENABLED = "sameba_notif_enabled";
const KEY_MODE = "sameba_notif_mode";
const KEY_TIMES = "sameba_notif_times"; // JSON: [{hour,minute}]
const KEY_INTERVAL = "sameba_notif_interval"; // number (hours)

const DEFAULT_TIMES = [
  { hour: 8, minute: 0 },
  { hour: 14, minute: 0 },
  { hour: 21, minute: 0 },
];

const CHANNEL_ID = "daily-verse"; // იგივე რაც notifications.ts-ში გაქვს

function pickRandomVerse(): DevotionalVerse {
  const i = Math.floor(Math.random() * DEVOTIONAL_VERSES.length);
  return DEVOTIONAL_VERSES[i] ?? DEVOTIONAL_VERSES[0];
}

function safeParseTimes(s: string | null) {
  if (!s) return null;
  try {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed
      .map((x: any) => ({
        hour: Number(x?.hour),
        minute: Number(x?.minute),
      }))
      .filter(
        (t: any) =>
          Number.isFinite(t.hour) &&
          Number.isFinite(t.minute) &&
          t.hour >= 0 &&
          t.hour <= 23 &&
          t.minute >= 0 &&
          t.minute <= 59
      );
    return cleaned.length ? cleaned : null;
  } catch {
    return null;
  }
}

export default function HomeScreen() {
  const [verse, setVerse] = useState<DevotionalVerse>(() => DEVOTIONAL_VERSES[0]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const isFav = useMemo(
    () => favoriteIds.includes(verse.id),
    [favoriteIds, verse.id]
  );

  const loadHomeState = async () => {
    setFavoriteIds(await getFavorites());

    const e = await AsyncStorage.getItem(KEY_ENABLED);
    setNotifEnabled(e === "1");
  };

  useEffect(() => {
    loadHomeState();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadHomeState();
    }, [])
  );

  const openDetails = () => {
    router.push({ pathname: "/verse/[id]", params: { id: String(verse.id) } });
  };

  const onToggleFav = async () => {
    const next = await toggleFavorite(verse.id);
    setFavoriteIds(next);
  };

  async function applySavedScheduleOrDefault() {
    const m = (await AsyncStorage.getItem(KEY_MODE)) as Mode | null;
    const mode: Mode = m === "interval" ? "interval" : "times";

    const storedTimes = await AsyncStorage.getItem(KEY_TIMES);
    const storedInterval = await AsyncStorage.getItem(KEY_INTERVAL);

    const times = safeParseTimes(storedTimes) ?? DEFAULT_TIMES;

    const interval = storedInterval ? Number(storedInterval) : 6;
    const safeInterval = Number.isFinite(interval)
      ? Math.min(24, Math.max(1, interval))
      : 6;

    if (mode === "times") {
      await scheduleMultipleTimesPerDay(times);
    } else {
      await scheduleEveryNHours(safeInterval);
    }
  }

  const onToggleNotifications = async (next: boolean) => {
    if (!next) {
      setNotifEnabled(false);
      await AsyncStorage.setItem(KEY_ENABLED, "0");
      await disableAllScheduledNotifications();
      return;
    }

    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(
        "ნებართვა საჭიროა",
        "გთხოვ ჩართე Notifications: Settings → Notifications → SAMEBA"
      );
      setNotifEnabled(false);
      await AsyncStorage.setItem(KEY_ENABLED, "0");
      return;
    }

    // ✅ ჩართვა + Settings-ის არჩევანზე დაყრდნობით schedule
    await applySavedScheduleOrDefault();
    setNotifEnabled(true);
    await AsyncStorage.setItem(KEY_ENABLED, "1");

    Alert.alert("ჩართულია ✅", "შეტყობინებები ჩაირთო.");
  };

  const sendTestIn5s = async () => {
    const ok = await ensureNotificationPermission();
    if (!ok) return;
  
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "SAMEBA",
        body: "TEST ✝️ 5 წამში",
        data: { type: "dailyVerse", verseId: String(verse.id) },
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: { seconds: 5, repeats: false } as Notifications.TimeIntervalTriggerInput,
    });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.bigTitle}>SAMEBA</Text>
      <Text style={styles.subtitle}>დღევანდელი სულიერი მუხლი</Text>

      {/* ✅ Home-ზე მთავარი იდეა: Notifications Toggle */}
      <View style={styles.notifRow}>
        <Text style={styles.notifLabel}>შეტყობინებები</Text>
        <Switch value={notifEnabled} onValueChange={onToggleNotifications} />
      </View>

      <Pressable style={styles.card} onPress={openDetails}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardLabel}>მუხლი</Text>

          <Pressable
            onPress={(e: any) => {
              e?.stopPropagation?.();
              onToggleFav();
            }}
            hitSlop={10}
            style={styles.starBtn}
          >
            <Text style={styles.star}>{isFav ? "⭐" : "☆"}</Text>
          </Pressable>
        </View>

        <Text style={styles.message} numberOfLines={4} ellipsizeMode="tail">
          {verse.text}
        </Text>

        <Text style={styles.reference}>
          {verse.book} {verse.chapter}:{verse.verse}
        </Text>

        <Text style={styles.hint}>დააჭირე სრულად სანახავად ↗</Text>
      </Pressable>

      <View style={styles.btnRow}>
        <Pressable style={styles.primaryBtn} onPress={() => setVerse(pickRandomVerse())}>
          <Text style={styles.primaryBtnText}>შემდეგი მუხლი</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/favorites")}>
          <Text style={styles.secondaryBtnText}>ფავორიტები</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/settings")}>
          <Text style={styles.secondaryBtnText}>პარამეტრები</Text>
        </Pressable>

        <Pressable style={styles.testBtn} onPress={sendTestIn5s}>
          <Text style={styles.testBtnText}>🔔 Test in 5s</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f2ec",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bigTitle: { fontSize: 34, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#555", marginBottom: 14, textAlign: "center" },

  notifRow: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  notifLabel: { fontSize: 15, fontWeight: "700", color: "#222" },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 22,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardLabel: { fontSize: 12, color: "#888" },
  starBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  star: { fontSize: 22 },

  message: { fontSize: 18, textAlign: "center", marginBottom: 12, lineHeight: 26 },
  reference: { fontSize: 14, textAlign: "center", color: "#777" },
  hint: { marginTop: 8, fontSize: 12, textAlign: "center", color: "#999" },

  btnRow: { width: "100%" },
  primaryBtn: {
    backgroundColor: "#1E88E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  secondaryBtnText: { color: "#222", fontWeight: "700", fontSize: 16 },

  testBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#222",
    width: "100%",
    alignItems: "center",
  },
  testBtnText: { color: "#fff", fontWeight: "800" },
});
