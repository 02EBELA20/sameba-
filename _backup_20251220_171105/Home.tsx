import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Switch, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  initNotifications,
  ensureNotificationPermission,
  disableAllScheduledNotifications,
  scheduleDailyAt,
  scheduleMultipleTimesPerDay,
  scheduleEveryNHours,
} from "../services/notifications";

import { getRandomDevotionalVerse, DevotionalVerse } from "../data/devotional";

const KEY_ENABLED = "sameba_notif_enabled";
const KEY_MODE = "sameba_notif_mode";

type Mode = "daily" | "multi" | "interval";

export default function Home() {
  const [verse, setVerse] = useState<DevotionalVerse | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("daily");

  const presets = useMemo(() => {
    return {
      daily: { hour: 8, minute: 0 },
      multi: [
        { hour: 8, minute: 0 },
        { hour: 14, minute: 0 },
        { hour: 21, minute: 0 },
      ],
      intervalHours: 6,
    };
  }, []);

  const loadRandom = () => {
    setVerse(getRandomDevotionalVerse());
  };

  useEffect(() => {
    initNotifications();
    loadRandom();

    (async () => {
      const e = await AsyncStorage.getItem(KEY_ENABLED);
      const m = (await AsyncStorage.getItem(KEY_MODE)) as Mode | null;
      setEnabled(e === "1");
      if (m === "daily" || m === "multi" || m === "interval") setMode(m);
    })();
  }, []);

  const applyScheduleForMode = async (m: Mode) => {
    if (m === "daily") {
      await scheduleDailyAt(presets.daily.hour, presets.daily.minute);
    } else if (m === "multi") {
      await scheduleMultipleTimesPerDay(presets.multi);
    } else {
      await scheduleEveryNHours(presets.intervalHours);
    }
  };

  const onToggle = async (next: boolean) => {
    if (next) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        Alert.alert(
          "ნებართვა საჭიროა",
          Platform.OS === "ios"
            ? "გთხოვ Settings → Notifications-ში ჩართე SAMEBA."
            : "გთხოვ Settings → Notifications-ში ჩართე SAMEBA."
        );
        return;
      }

      await applyScheduleForMode(mode);

      await AsyncStorage.setItem(KEY_ENABLED, "1");
      setEnabled(true);
      Alert.alert("ჩაირთო ✅", "ნოტიფიკაციები ჩართულია.");
    } else {
      await disableAllScheduledNotifications();
      await AsyncStorage.setItem(KEY_ENABLED, "0");
      setEnabled(false);
      Alert.alert("გამორთულია", "ნოტიფიკაციები გამორთულია.");
    }
  };

  const changeMode = async (m: Mode) => {
    setMode(m);
    await AsyncStorage.setItem(KEY_MODE, m);

    // თუ უკვე ჩართულია, ცვლილება მაშინვე გადავდოთ schedule-ზე
    if (enabled) {
      await applyScheduleForMode(m);
      Alert.alert("განახლდა ✅", "სიხშირე შეცვლილია.");
    }
  };

  return (
    <View className="flex-1 px-4 items-center">
      <View className="w-full mt-4 bg-white rounded-2xl p-4 shadow">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold">შეტყობინებები</Text>
          <Switch value={enabled} onValueChange={onToggle} />
        </View>

        <Text className="text-xs text-gray-500 mt-2">
          ჩართე, რომ დაბლოკილ ეკრანზე მიიღოს დღის მუხლი.
        </Text>

        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={() => changeMode("daily")}
            className={`flex-1 py-3 rounded-xl ${
              mode === "daily" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                mode === "daily" ? "text-white" : "text-black"
              }`}
            >
              დღეში ერთხელ
            </Text>
            <Text
              className={`text-center text-xs mt-1 ${
                mode === "daily" ? "text-white" : "text-gray-600"
              }`}
            >
              08:00
            </Text>
          </Pressable>

          <Pressable
            onPress={() => changeMode("multi")}
            className={`flex-1 py-3 rounded-xl ${
              mode === "multi" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                mode === "multi" ? "text-white" : "text-black"
              }`}
            >
              დღეში 3-ჯერ
            </Text>
            <Text
              className={`text-center text-xs mt-1 ${
                mode === "multi" ? "text-white" : "text-gray-600"
              }`}
            >
              08:00 · 14:00 · 21:00
            </Text>
          </Pressable>

          <Pressable
            onPress={() => changeMode("interval")}
            className={`flex-1 py-3 rounded-xl ${
              mode === "interval" ? "bg-blue-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                mode === "interval" ? "text-white" : "text-black"
              }`}
            >
              ყოველ 6 სთ-ში
            </Text>
            <Text
              className={`text-center text-xs mt-1 ${
                mode === "interval" ? "text-white" : "text-gray-600"
              }`}
            >
              Advanced
            </Text>
          </Pressable>
        </View>
      </View>

      {verse && (
        <View className="w-full mt-6 bg-white rounded-2xl p-6 shadow">
          <Text className="text-lg font-semibold leading-relaxed">
            {verse.text}
          </Text>

          <Text className="text-gray-600 mt-3 text-sm">
            {verse.book} {verse.chapter}:{verse.verse}
          </Text>

          <Pressable
            className="mt-3"
            onPress={() => Alert.alert("განმარტება", verse.explanation)}
          >
            <Text className="text-blue-600 text-sm underline">
              განმარტება →
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={loadRandom}
        className="w-full mt-6 bg-blue-600 py-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">ახალი მუხლი</Text>
      </Pressable>
    </View>
  );
}
