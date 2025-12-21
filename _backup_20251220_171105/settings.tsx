import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { DEVOTIONAL_VERSES } from "../src/data/devotional";
import { getFavoriteIds, toggleFavorite } from "../src/services/favorites";

import {
  initNotifications,
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
const KEY_DAYS = "sameba_notif_days"; // JSON: number[] (1..7, iOS/Android: 1=Sun..7=Sat)

const DEFAULT_TIMES = [
  { hour: 8, minute: 0 },
  { hour: 14, minute: 0 },
  { hour: 21, minute: 0 },
];

const DEFAULT_DAYS: number[] = [1, 2, 3, 4, 5, 6, 7];

const DAYS_UI: Array<{ label: string; value: number }> = [
  { label: "კვ", value: 1 },
  { label: "ორ", value: 2 },
  { label: "სა", value: 3 },
  { label: "ოთ", value: 4 },
  { label: "ხუ", value: 5 },
  { label: "პა", value: 6 },
  { label: "შა", value: 7 },
];

function fmt(t: { hour: number; minute: number }) {
  const hh = String(t.hour).padStart(2, "0");
  const mm = String(t.minute).padStart(2, "0");
  return `${hh}:${mm}`;
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

function uniqueTimes(times: Array<{ hour: number; minute: number }>) {
  const map = new Map<string, { hour: number; minute: number }>();
  for (const t of times) map.set(`${t.hour}:${t.minute}`, t);
  return Array.from(map.values()).sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)
  );
}

function safeParseDays(s: string | null) {
  if (!s) return null;
  try {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed
      .map((x: any) => Number(x))
      .filter((d: number) => Number.isFinite(d) && d >= 1 && d <= 7);
    const uniq = Array.from(new Set(cleaned));
    return uniq.length ? uniq : null;
  } catch {
    return null;
  }
}

export default function SettingsScreen() {
  const [favIds, setFavIds] = useState<number[]>([]);

  // notifications state
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("times");
  const [times, setTimes] = useState<Array<{ hour: number; minute: number }>>(
    DEFAULT_TIMES
  );
  const [intervalHours, setIntervalHours] = useState<number>(6);
  const [days, setDays] = useState<number[]>(DEFAULT_DAYS);

  const refresh = async () => setFavIds(await getFavoriteIds());

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const favorites = useMemo(
    () => DEVOTIONAL_VERSES.filter((v) => favIds.includes(v.id)),
    [favIds]
  );

  useEffect(() => {
    (async () => {
      try {
        await initNotifications();
      } catch {}

      const e = await AsyncStorage.getItem(KEY_ENABLED);
      const m = (await AsyncStorage.getItem(KEY_MODE)) as Mode | null;

      const storedTimes = await AsyncStorage.getItem(KEY_TIMES);
      const storedInterval = await AsyncStorage.getItem(KEY_INTERVAL);
      const storedDays = await AsyncStorage.getItem(KEY_DAYS);

      setNotifEnabled(e === "1");
      if (m === "times" || m === "interval") setMode(m);

      const parsedTimes = safeParseTimes(storedTimes);
      if (parsedTimes) setTimes(uniqueTimes(parsedTimes));

      if (storedInterval) {
        const n = Number(storedInterval);
        if (!Number.isNaN(n) && n >= 1 && n <= 24) setIntervalHours(n);
      }

      const parsedDays = safeParseDays(storedDays);
      if (parsedDays) setDays(parsedDays);
    })();
  }, []);

  const applySchedule = async (nextEnabled: boolean, nextMode: Mode) => {
    if (!nextEnabled) {
      await disableAllScheduledNotifications();
      return;
    }

    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(
        "ნებართვა საჭიროა",
        "გთხოვ ჩართე Notifications: Settings → Notifications → SAMEBA"
      );
      throw new Error("permission_denied");
    }

    if (nextMode === "times") {
      const safeTimes = times.length ? uniqueTimes(times) : DEFAULT_TIMES;
      const safeDays = days.length ? Array.from(new Set(days)) : DEFAULT_DAYS;
      await scheduleMultipleTimesPerDay(safeTimes, safeDays);
    } else {
      await scheduleEveryNHours(intervalHours);
    }
  };

  const toggleNotif = async (next: boolean) => {
    try {
      await applySchedule(next, mode);
      setNotifEnabled(next);
      await AsyncStorage.setItem(KEY_ENABLED, next ? "1" : "0");

      if (next) Alert.alert("ჩართულია ✅", "შეტყობინებები ჩაირთო.");
    } catch {
      setNotifEnabled(false);
      await AsyncStorage.setItem(KEY_ENABLED, "0");
    }
  };

  const selectMode = async (m: Mode) => {
    setMode(m);
    await AsyncStorage.setItem(KEY_MODE, m);

    if (notifEnabled) {
      await applySchedule(true, m);
      Alert.alert("განახლდა ✅", "სიხშირე შეცვლილია.");
    }
  };

  const toggleDay = async (d: number) => {
    const has = days.includes(d);
    const next = has ? days.filter((x) => x !== d) : [...days, d];
    const uniq = Array.from(new Set(next)).sort((a, b) => a - b);

    setDays(uniq);
    await AsyncStorage.setItem(KEY_DAYS, JSON.stringify(uniq));

    if (notifEnabled && mode === "times") {
      const safeTimes = times.length ? uniqueTimes(times) : DEFAULT_TIMES;
      const safeDays = uniq.length ? uniq : DEFAULT_DAYS;
      await scheduleMultipleTimesPerDay(safeTimes, safeDays);
    }
  };

  const addTime = async () => {
    const candidate = { hour: 9, minute: 0 };
    const exists = times.some(
      (t) => t.hour === candidate.hour && t.minute === candidate.minute
    );
    const next = uniqueTimes(
      exists ? [...times, { hour: 10, minute: 0 }] : [...times, candidate]
    );

    setTimes(next);
    await AsyncStorage.setItem(KEY_TIMES, JSON.stringify(next));

    if (notifEnabled && mode === "times") {
      const safeDays = days.length ? days : DEFAULT_DAYS;
      await scheduleMultipleTimesPerDay(next, safeDays);
      Alert.alert("დამატებულია ✅", "დრო დაემატა.");
    }
  };

  const removeTime = async (idx: number) => {
    const next = times.filter((_, i) => i !== idx);
    setTimes(next);
    await AsyncStorage.setItem(KEY_TIMES, JSON.stringify(next));

    if (notifEnabled && mode === "times") {
      if (next.length === 0) {
        await disableAllScheduledNotifications();
      } else {
        const safeDays = days.length ? days : DEFAULT_DAYS;
        await scheduleMultipleTimesPerDay(uniqueTimes(next), safeDays);
      }
      Alert.alert("წაიშალა ✅", "დრო წაიშალა.");
    }
  };

  const incInterval = async () => {
    const next = Math.min(24, intervalHours + 1);
    setIntervalHours(next);
    await AsyncStorage.setItem(KEY_INTERVAL, String(next));
    if (notifEnabled && mode === "interval") await scheduleEveryNHours(next);
  };

  const decInterval = async () => {
    const next = Math.max(1, intervalHours - 1);
    setIntervalHours(next);
    await AsyncStorage.setItem(KEY_INTERVAL, String(next));
    if (notifEnabled && mode === "interval") await scheduleEveryNHours(next);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>პარამეტრები</Text>

      <Text style={styles.sectionTitle}>შეტყობინებები</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={{ fontWeight: "900" }}>ჩართვა / გამორთვა</Text>
          <Switch value={notifEnabled} onValueChange={toggleNotif} />
        </View>

        <Text style={styles.smallMuted}>
          ჩართვის შემდეგ, მუხლები გამოჩნდება დაბლოკილ ეკრანზე.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Pressable
            style={[styles.pill, mode === "times" && styles.pillActive]}
            onPress={() => selectMode("times")}
          >
            <Text style={[styles.pillText, mode === "times" && styles.pillTextActive]}>
              დროებით
            </Text>
          </Pressable>

          <Pressable
            style={[styles.pill, mode === "interval" && styles.pillActive]}
            onPress={() => selectMode("interval")}
          >
            <Text
              style={[styles.pillText, mode === "interval" && styles.pillTextActive]}
            >
              ყოველ X საათში
            </Text>
          </Pressable>
        </View>

        {mode === "times" ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "900", marginBottom: 8 }}>დღეები</Text>

            <View style={styles.daysRow}>
              {DAYS_UI.map((d) => {
                const active = days.includes(d.value);
                return (
                  <Pressable
                    key={d.value}
                    onPress={() => toggleDay(d.value)}
                    style={[styles.dayPill, active && styles.dayPillActive]}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.rowBetween, { marginTop: 12 }]}>
              <Text style={{ fontWeight: "800" }}>დროები</Text>
              <Pressable onPress={addTime} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>+ დამატება</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, gap: 8 }}>
              {times.map((t, idx) => (
                <View key={`${t.hour}:${t.minute}:${idx}`} style={styles.timeRow}>
                  <Text style={{ fontWeight: "900" }}>{fmt(t)}</Text>
                  <Pressable onPress={() => removeTime(idx)} hitSlop={12}>
                    <Text style={{ fontSize: 16 }}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <Text style={styles.smallMuted}>
              (შემდეგ ეტაპზე დავამატებთ Time Picker-ს რომ ზუსტად აირჩიოს საათი/წუთი.)
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "800" }}>ინტერვალი</Text>
            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Pressable onPress={decInterval} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>-</Text>
              </Pressable>

              <Text style={{ fontWeight: "900" }}>{intervalHours} საათში ერთხელ</Text>

              <Pressable onPress={incInterval} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.smallMuted}>
              ეს რეჟიმი “Advanced” არის — iOS-ზე ზოგჯერ შეიძლება დაგვიანდეს.
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>ფავორიტები</Text>

      {favorites.length === 0 ? (
        <Text style={styles.empty}>ჯერ არაფერი დაგიმატებია ⭐</Text>
      ) : (
        <View style={{ width: "100%", gap: 10 }}>
          {favorites.map((v) => (
            <Pressable
              key={v.id}
              style={styles.item}
              onPress={() =>
                router.push({ pathname: "/verse/[id]", params: { id: String(v.id) } })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText} numberOfLines={2}>
                  {v.text}
                </Text>
                <Text style={styles.itemRef}>
                  {v.book} {v.chapter}:{v.verse}
                </Text>
              </View>

              <Pressable
                onPress={async (e: any) => {
                  e?.stopPropagation?.();
                  await toggleFavorite(v.id);
                  refresh();
                }}
                hitSlop={12}
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 18 }}>⭐</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>უკან</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f2ec",
    padding: 24,
    justifyContent: "flex-start",
  },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "900", marginBottom: 10, opacity: 0.8 },
  empty: { opacity: 0.7 },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smallMuted: { marginTop: 8, fontSize: 12, opacity: 0.65 },

  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  pillActive: { backgroundColor: "#1E88E5" },
  pillText: { fontWeight: "900" },
  pillTextActive: { color: "#fff" },

  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#f0f0f0",
  },
  dayPillActive: {
    backgroundColor: "#1E88E5",
  },
  dayText: {
    fontWeight: "900",
    opacity: 0.9,
  },
  dayTextActive: {
    color: "#fff",
    opacity: 1,
  },

  smallBtn: {
    backgroundColor: "#1E88E5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  smallBtnText: { color: "#fff", fontWeight: "900" },

  timeRow: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E88E5",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: "#fff", fontSize: 22, fontWeight: "900" },

  item: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  itemText: { fontSize: 14, lineHeight: 20 },
  itemRef: { marginTop: 6, fontSize: 12, opacity: 0.7 },

  backBtn: {
    marginTop: 18,
    backgroundColor: "#1E88E5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
