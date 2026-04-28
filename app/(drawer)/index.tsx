import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getRandomDevotionalVerse } from '../../src/data/devotional';
import {
  disableVerseNotifications,
  enableVerseNotifications,
  getIntervalHours,
  getNotifEnabled,
  setIntervalHours
} from '../../src/services/notifications';

export default function HomeScreen() {
  const { readingMode, toggleReadingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
    
  const [randomVerse, setRandomVerse] = useState(getRandomDevotionalVerse());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [intervalHours, setIntervalHoursLocal] = useState<1 | 3 | 6 | 12 | 24>(6);
  const [isFavoriteState, setIsFavoriteState] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    const verseId = `devotional-${randomVerse.id}`;
    setIsFavoriteState(isFavorite(verseId));
  }, [randomVerse, isFavorite]);

  const handleToggleFavorite = () => {
    if (!randomVerse) return;
    const verseId = `devotional-${randomVerse.id}`;
    const item = {
      id: verseId,
      text: randomVerse.text,
      book: randomVerse.book,
      chapter: randomVerse.chapter,
      verse: randomVerse.verse,
      source: 'devotional' as const
    };
    toggleFavorite(item);
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
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: colors.white }]}>
          SAMEBA
        </Text>
        <TouchableOpacity onPress={toggleReadingMode} style={styles.readingModeButton}>
          <Ionicons 
            name={readingMode ? 'moon' : 'sunny'} 
            size={24} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.compactCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.compactCardHeader}>
          <Text style={[styles.compactCardTitle, { color: colors.text }]}>
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
          <View style={styles.compactIntervalContainer}>
            <Text style={[styles.compactIntervalLabel, { color: colors.textSecondary }]}>
              ინტერვალი:
            </Text>
            <View style={styles.compactIntervalButtons}>
              {[1, 3, 6, 12, 24].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.compactIntervalButton,
                    intervalHours === hours 
                      ? { backgroundColor: colors.primary } 
                      : { backgroundColor: colors.border }
                  ]}
                  onPress={() => handleIntervalChange(hours as 1 | 3 | 6 | 12 | 24)}
                >
                  <Text
                    style={[
                      styles.compactIntervalButtonText,
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

      <View style={[styles.verseCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.verseHeader}>
          <Text style={[styles.verseReference, { color: colors.primary }]}>
            {randomVerse.book} {randomVerse.chapter}:{randomVerse.verse}
          </Text>
          <View style={styles.verseActions}>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
              <Ionicons
                name={isFavoriteState ? 'star' : 'star-outline'}
                size={20}
                color={isFavoriteState ? colors.goldAccent : colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.verseContainer}
          onPress={() => router.push(`/verse/${randomVerse.id}`)}
        >
          <Text style={[styles.verseText, { color: colors.text }]}>
            {randomVerse.text}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, width: '100%' }]}
          onPress={handleNextVerse}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            შემდეგი მუხლი
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]}
          onPress={() => router.push('/(drawer)/favorites' as any)}
        >
          <Text style={[styles.buttonText, { color: colors.white }]} numberOfLines={2}>
            ფავორიტები
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.secondary, flex: 1 }]}
          onPress={() => router.push('/(drawer)/settings' as any)}
        >
          <Text style={[styles.buttonText, { color: colors.white }]} numberOfLines={2}>
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  compactCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verseCard: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  readingModeButton: {
    padding: 10,
    borderRadius: 24,
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  compactIntervalContainer: {
    marginTop: 12,
  },
  compactIntervalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: 8,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  compactIntervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  compactIntervalButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  compactIntervalButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    padding: 10,
  },
  verseContainer: {
    marginBottom: 20,
  },
  verseText: {
    fontSize: 17,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'left',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: 24,
    gap: 12,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    textAlign: 'center',
  },
});
