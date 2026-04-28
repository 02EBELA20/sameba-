import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, TouchableOpacity } from 'react-native';
import { FavoritesProvider } from '../src/contexts/FavoritesContext';
import { ReadingModeProvider } from '../src/contexts/ReadingModeContext';
import { initNotifications, maintainScheduleIfNeeded, normalizeVerseIdFromData } from '../src/services/notifications';

// BackButton component
function BackButton() {
  const router = useRouter();
  
  return (
    <TouchableOpacity
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      style={{
        padding: 8,
        marginRight: 8,
      }}
    >
      <Ionicons
        name="arrow-back"
        size={24}
        color="#FAF6F0"
      />
    </TouchableOpacity>
  );
}

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
    <FavoritesProvider>
      <ReadingModeProvider>
        <Stack 
          screenOptions={{
            headerShown: true,
            headerLeft: () => <BackButton />,
            headerStyle: {
              backgroundColor: '#8B6F47',
            },
            headerTintColor: '#FAF6F0',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen 
            name="(drawer)" 
            options={{ 
              headerShown: false,
              title: 'SAMEBA'
            }} 
          />
          <Stack.Screen 
            name="verse/[id]" 
            options={{ 
              title: 'ლექსიკონი'
            }} 
          />
          <Stack.Screen 
            name="gospels" 
            options={{ 
              title: 'სახარება'
            }} 
          />
          <Stack.Screen 
            name="gospels/[book]" 
            options={{ 
              title: 'სახარება'
            }} 
          />
          <Stack.Screen 
            name="gospels/[book]/[chapter]" 
            options={{ 
              title: 'თავი'
            }} 
          />
        </Stack>
      </ReadingModeProvider>
    </FavoritesProvider>
  );
}
