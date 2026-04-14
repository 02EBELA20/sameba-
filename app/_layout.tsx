import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ReadingModeProvider } from '../src/contexts/ReadingModeContext';
import { initNotifications, maintainScheduleIfNeeded, normalizeVerseIdFromData } from '../src/services/notifications';

export default function RootLayout() {
  const router = useRouter();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    initNotifications();

    const handleNotificationResponse = (response: any) => {
      const verseId = normalizeVerseIdFromData(response.notification.request.content.data);
      if (verseId) {
        router.push(`/verse/${verseId}`);
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        maintainScheduleIfNeeded();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <ReadingModeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="verse/[id]" options={{ headerShown: false }} />
      </Stack>
    </ReadingModeProvider>
  );
}
