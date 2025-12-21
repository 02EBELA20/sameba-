import { useEffect, useState } from "react";
import { View, Text, Pressable, Switch, Alert, AppState } from "react-native";

import {
  initNotifications,
  enableVerseNotifications,
  disableVerseNotifications,
  getNotifEnabled,
  maintainScheduleIfNeeded,
  openOSNotificationSettings,
} from "../services/notifications";

import { getRandomDevotionalVerse, DevotionalVerse } from "../data/devotional";

export default function Home() {
  const [verse, setVerse] = useState<DevotionalVerse | null>(null);
  const [enabled, setEnabled] = useState(false);

  const loadRandom = () => setVerse(getRandomDevotionalVerse());

  useEffect(() => {
    initNotifications();
    loadRandom();

    (async () => {
      const e = await getNotifEnabled();
      setEnabled(e);

      // თუ ჩართულია — schedule ყოველთვის გააქტიურდეს/განახლდეს
      if (e) await maintainScheduleIfNeeded();
    })();

    // როცა user settings-იდან დაბრუნდება (foreground) — schedule ისევ განახლდეს
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const e = await getNotifEnabled();
        setEnabled(e);
        if (e) await maintainScheduleIfNeeded();
      }
    });

    return () => sub.remove();
  }, []);

  const onToggle = async (next: boolean) => {
    setEnabled(next);

    if (next) {
      const res = await enableVerseNotifications();

      if (!res.ok) {
        setEnabled(false);
        Alert.alert(
          "შეტყობინების დაშვება საჭიროა",
          "გთხოვ Settings-ში ჩართე Notifications ამ აპისთვის.",
          [
            { text: "გაუქმება", style: "cancel" },
            { text: "Settings", onPress: openOSNotificationSettings },
          ]
        );
        return;
      }

      Alert.alert("ჩართულია ✅", "ყოველ 1 საათში ერთხელ მიიღებ ახალ მუხლს.");
    } else {
      await disableVerseNotifications();
      Alert.alert("გამორთულია", "შეტყობინებები გამორთულია.");
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
          ჩართე, რომ დაბლოკილ ეკრანზე ყოველ 1 საათში ერთხელ გამოჩნდეს ახალი მუხლი.
        </Text>
      </View>

      {verse && (
        <View className="w-full mt-6 bg-white rounded-2xl p-6 shadow">
          <Text className="text-lg font-semibold leading-relaxed">
            {verse.text}
          </Text>

          <Text className="text-gray-600 mt-3 text-sm">
            {verse.book} {verse.chapter}:{verse.verse}
          </Text>

          {!!verse.explanation && (
            <Pressable
              className="mt-3"
              onPress={() => Alert.alert("განმარტება", verse.explanation)}
            >
              <Text className="text-blue-600 text-sm underline">განმარტება →</Text>
            </Pressable>
          )}
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
