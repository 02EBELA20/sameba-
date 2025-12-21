// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";

import { initNotifications, normalizeVerseIdFromData } from "../src/services/notifications";

export default function RootLayout() {
  const router = useRouter();

  const handledInitialRef = useRef(false);
  const lastNavigatedVerseRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      initNotifications();

      if (!mounted) return;
      if (handledInitialRef.current) return;
      handledInitialRef.current = true;

      const last = await Notifications.getLastNotificationResponseAsync();
      const data = last?.notification?.request?.content?.data as any;
      const verseId = normalizeVerseIdFromData(data);

      if (verseId) {
        lastNavigatedVerseRef.current = verseId;
        router.push({ pathname: "/verse/[id]", params: { id: verseId } });
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      const verseId = normalizeVerseIdFromData(data);
      if (!verseId) return;

      if (lastNavigatedVerseRef.current === verseId) return;

      lastNavigatedVerseRef.current = verseId;
      router.push({ pathname: "/verse/[id]", params: { id: verseId } });
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "SAMEBA" }} />
      <Stack.Screen name="favorites" options={{ title: "ფავორიტები" }} />
      <Stack.Screen name="verse/[id]" options={{ title: "მუხლი" }} />
    </Stack>
  );
}
