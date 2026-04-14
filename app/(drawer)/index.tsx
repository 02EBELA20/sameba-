import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getRandomDevotionalVerse, getVersePreview } from '../../src/data/devotional';
import {
    disableVerseNotifications,
    enableVerseNotifications,
    getIntervalHours,
    getNotifEnabled,
    setIntervalHours
} from '../../src/services/notifications';
import { getFavorites, toggleFavorite } from '../../src/services/storage';

export default function HomeScreen() {
  const { readingMode, toggleReadingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
    
  const [randomVerse, setRandomVerse] = useState(getRandomDevotionalVerse());
  const [favorites, setFavorites] = useState<number[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [intervalHours, setIntervalHoursLocal] = useState<1 | 3 | 6 | 12 | 24>(6);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFavorites();
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    setIsFavorite(favorites.includes(randomVerse.id));
  }, [favorites, randomVerse]);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  };

  const loadNotificationSettings = async () => {
    const enabled = await getNotifEnabled();
    const interval = await getIntervalHours();
    setNotificationsEnabled(enabled);
    setIntervalHoursLocal(interval);
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await disableVerseNotifications();
      setNotificationsEnabled(false);
    } else {
      const result = await enableVerseNotifications();
      if (result.ok) {
        setNotificationsEnabled(true);
      }
    }
  };

  const handleIntervalChange = async (hours: 1 | 3 | 6 | 12 | 24) => {
    setIntervalHoursLocal(hours);
    await setIntervalHours(hours);
  };

  const handleToggleFavorite = async () => {
    const newFavorites = await toggleFavorite(randomVerse.id);
    setFavorites(newFavorites);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${randomVerse.book} ${randomVerse.chapter}:${randomVerse.verse}\n\n${randomVerse.text}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNextVerse = () => {
    const nextVerse = getRandomDevotionalVerse([randomVerse.id]);
    setRandomVerse(nextVerse);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>
          სამება
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            კითხვის რეჟიმი
          </Text>
          <Switch
            value={readingMode}
            onValueChange={toggleReadingMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {readingMode ? 'ბნელი რეჟიმი' : 'ჩვეული რეჟიმი'}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            შეტყობინებები
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        
        {notificationsEnabled && (
          <View style={styles.intervalContainer}>
            <Text style={[styles.intervalLabel, { color: colors.textSecondary }]}>
              ინტერვალი:
            </Text>
            <View style={styles.intervalButtons}>
              {[1, 3, 6, 12, 24].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.intervalButton,
                    intervalHours === hours 
                      ? { backgroundColor: colors.primary } 
                      : { backgroundColor: colors.border }
                  ]}
                  onPress={() => handleIntervalChange(hours as 1 | 3 | 6 | 12 | 24)}
                >
                  <Text
                    style={[
                      styles.intervalButtonText,
                      { 
                        color: intervalHours === hours 
                          ? colors.white 
                          : colors.text 
                      }
                    ]}
                  >
                    {hours}სთ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.verseHeader}>
          <Text style={[styles.verseReference, { color: colors.primary }]}>
            {randomVerse.book} {randomVerse.chapter}:{randomVerse.verse}
          </Text>
          <View style={styles.verseActions}>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={isFavorite ? colors.goldAccent : colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.verseContainer}
          onPress={() => router.push(`/verse/${randomVerse.id}`)}
        >
          <Text style={[styles.verseText, { color: colors.text }]}>
            {getVersePreview(randomVerse.text, 150)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNextVerse}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            შემდეგი მუხლი
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent, flex: 1, marginRight: 8 }]}
          onPress={() => router.push('/(drawer)/favorites' as any)}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            ფავორიტები
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent, flex: 1, marginLeft: 8 }]}
          onPress={() => router.push('/(drawer)/settings' as any)}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            პარამეტრები
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: 4,
  },
  intervalContainer: {
    marginTop: 16,
  },
  intervalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: 8,
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  intervalButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  verseContainer: {
    marginBottom: 16,
  },
  verseText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
