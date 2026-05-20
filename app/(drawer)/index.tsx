import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  ImageBackground,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { getThemeColors } from '../../src/constants/theme';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { getNextDevotional, type DevotionalItem } from '../../src/data/devotional';

import {
  disableDevotionalNotifications,
  enableDevotionalNotifications,
  getIntervalHours,
  getNotifEnabled,
  initNotifications,
  refreshDevotionalNotificationSchedule,
  updateNotificationInterval
} from '../../src/services/notifications';

export default function HomeScreen() {
  const colors = getThemeColors();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [devotional, setDevotional] = useState<DevotionalItem | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [intervalHours, setIntervalHoursLocal] = useState<1 | 3 | 6 | 12 | 24>(6);
  const [previousDevotionals, setPreviousDevotionals] = useState<DevotionalItem[]>([]);
  const [nextDevotionals, setNextDevotionals] = useState<DevotionalItem[]>([]);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize notifications on app start
    initNotifications();
    loadNotificationSettings();
    loadDevotional();
    
    // Refresh notification schedule on app start
    refreshDevotionalNotificationSchedule();

    // Handle app state changes (foreground/background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, refresh notification schedule
        refreshDevotionalNotificationSchedule();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const loadDevotional = async () => {
    const next = await getNextDevotional();
    setDevotional(next);
  };

  
  const handleToggleFavorite = () => {
    if (!devotional) return;

    toggleFavorite({
      id: devotional.id,
      text: devotional.text,
      book: devotional.book,
      chapter: devotional.chapter,
      verse: devotional.verse,
      type: 'devotional'
    });
  };

  const loadNotificationSettings = async () => {
    const enabled = await getNotifEnabled();
    const interval = await getIntervalHours();
    setNotificationsEnabled(enabled);
    setIntervalHoursLocal(interval);
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      const result = await disableDevotionalNotifications();
      if (result.ok) setNotificationsEnabled(false);
    } else {
      const result = await enableDevotionalNotifications(intervalHours);
      if (result.ok) setNotificationsEnabled(true);
    }
  };

  const handleIntervalChange = async (hours: 1 | 3 | 6 | 12 | 24) => {
    setIntervalHoursLocal(hours);
    const result = await updateNotificationInterval(hours);
    if (!result.ok) {
      console.error('Failed to update notification interval:', result.reason);
    }
  };

  
  const handleShare = async () => {
    if (!devotional) return;
    
    await Share.share({
      message: `${devotional.book} ${devotional.chapter}:${devotional.verse}\n\n${devotional.text}`,
    });
  };

  const handleNextVerse = async () => {
    if (!devotional) return;
    
    // Save current devotional to previous history
    setPreviousDevotionals(prev => [...prev, devotional]);
    
    // Get next devotional from forward history or generate new one
    let nextDevotional: DevotionalItem;
    if (nextDevotionals.length > 0) {
      // Take from forward history
      const nextHistory = [...nextDevotionals];
      nextDevotional = nextHistory.pop()!;
      setNextDevotionals(nextHistory);
    } else {
      // Generate new devotional using existing logic
      nextDevotional = await getNextDevotional();
    }
    
    setDevotional(nextDevotional);
  };

  const handlePreviousVerse = () => {
    if (!devotional || previousDevotionals.length === 0) return;
    
    // Save current devotional to forward history
    setNextDevotionals(prev => [...prev, devotional]);
    
    // Get previous devotional from history
    const prevHistory = [...previousDevotionals];
    const previousDevotional = prevHistory.pop()!;
    setPreviousDevotionals(prevHistory);
    
    setDevotional(previousDevotional);
  };


  return (
    <ImageBackground
      source={require('../../assets/images/clouds-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.header}>
          <Text style={styles.samebaTitle}>
            SAMEBA
          </Text>
        </View>
      </View>

      {/* NOTIFICATIONS */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            შეტყობინებები
          </Text>

          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
        </View>

        <View style={styles.intervalRow}>
          {[1, 3, 6, 12, 24].map((h, index) => (
            <TouchableOpacity
              key={`${h}-${index}`}
              onPress={() => handleIntervalChange(h as any)}
              style={[
                styles.intervalBtn,
                intervalHours === h && { backgroundColor: colors.primary }
              ]}
            >
              <Text style={{
                color: intervalHours === h ? '#fff' : colors.text
              }}>
                {h}სთ
              </Text>
            </TouchableOpacity>
          ))}
        </View>

              </View>

      {/* VERSE */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>

        <View style={styles.verseHeader}>
          <Text style={[styles.ref, { color: colors.primary }]}>
            {devotional?.book} {devotional?.chapter}:{devotional?.verse}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Ionicons
                name={devotional && isFavorite(devotional.id) ? 'star' : 'star-outline'}
                size={20}
                color={devotional && isFavorite(devotional.id) ? '#FACC15' : colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => devotional && router.push(`/verse/${devotional.id}`)}
          style={{ width: '100%' }}
        >
          <Text style={[styles.verseText, { color: colors.text }]}>
            {devotional?.text}
          </Text>
        </TouchableOpacity>

        {devotional ? (
          <TouchableOpacity
            style={styles.explanationLink}
            onPress={() =>
              router.push({
                pathname: "/verse/[id]",
                params: { id: devotional.id },
              })
            }
            activeOpacity={0.75}
          >
            <View style={styles.explanationLinkContent}>
              <Text style={styles.explanationLinkText}>განმარტების ნახვა</Text>
              <Ionicons name="chevron-forward" size={14} color="#9E7540" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>
        ) : null}


      </View>

      {/* DEVOTIONAL NAVIGATION BUTTONS */}
      <View style={styles.homeActionRow}>
        <TouchableOpacity
          style={[
            styles.homeActionButton,
            previousDevotionals.length === 0 && styles.disabledNavButton
          ]}
          onPress={handlePreviousVerse}
          disabled={previousDevotionals.length === 0}
        >
          <Text
            style={styles.homeActionButtonText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            ← წინა მუხლი
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeActionButton}
          onPress={handleNextVerse}
        >
          <Text
            style={styles.homeActionButtonText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            შემდეგი მუხლი →
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.homeActionFullButton}
        onPress={() => router.push('/(drawer)/favorites')}
      >
        <Text
          style={styles.homeActionButtonText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          ☆ ფავორიტები
        </Text>
      </TouchableOpacity>


    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 2,
  },

  section: {
    marginBottom: 24,
  },

  content: {
    paddingBottom: 40
  },

  header: {
    alignItems: 'center',
    marginBottom: 20
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },

  themeToggle: {
    position: 'absolute',
    right: 16,
    top: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  samebaTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700',
    color: '#2F2F2F',
    marginTop: 30,
    
  },

  card: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#F8F6F2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    gap: 10
  },

  label: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },

  intervalRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8
  },

  intervalBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee'
  },

  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // 🔥 FIX
    marginBottom: 10
  },

  ref: {
    fontSize: 14,
    fontWeight: '600'
  },

  actions: {
    flexDirection: 'row',
    gap: 12
  },

  verseText: {
    fontSize: 17,
    lineHeight: 26,
    flexShrink: 1,
    flexWrap: 'wrap'
  },

  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  homeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  buttonPrimary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  homeActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    marginHorizontal: 28,
  },

  homeActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
    paddingVertical: 1,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  homeActionFullButton: {
    minHeight: 48,
    marginTop: 10,
    marginHorizontal: 28,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  homeActionButtonText: {
    color: '#2F6F8F',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  disabledNavButton: {
    opacity: 0.35,
  },

  explanationLink: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(160, 120, 70, 0.10)',
  },

  explanationLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9E7540',
  },

  explanationLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chevronIcon: {
    marginLeft: 4,
  }

});