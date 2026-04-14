import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { getDevotionalVerseById } from '../../src/data/devotional';
import { getFavorites, toggleFavorite } from '../../src/services/storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerseDetailScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [verse, setVerse] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const verseData = getDevotionalVerseById(id);
      setVerse(verseData);
    }
    loadFavorites();
  }, [id]);

  useEffect(() => {
    if (verse) {
      setIsFavorite(favorites.includes(verse.id));
    }
  }, [favorites, verse]);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  };

  const handleToggleFavorite = async () => {
    if (!verse) return;
    const newFavorites = await toggleFavorite(verse.id);
    setFavorites(newFavorites);
  };

  const handleShare = async () => {
    if (!verse) return;
    try {
      await Share.share({
        message: `${verse.book} ${verse.chapter}:${verse.verse}\n\n${verse.text}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!verse) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            1.  2.  3.  4.  5.  6.  7. 
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: colors.white }]}>
              1.  2.  3.  4.  5.  6.  7. 
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButtonContainer}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={24}
              color={isFavorite ? colors.goldAccent : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.verseHeader}>
          <Text style={[styles.verseReference, { color: colors.primary }]}>
            {verse.book} {verse.chapter}:{verse.verse}
          </Text>
        </View>

        <Text style={[styles.verseText, { color: colors.text }]}>
          {verse.text}
        </Text>

        {verse.explanation && (
          <View style={styles.explanationContainer}>
            <Text style={[styles.explanationTitle, { color: colors.textSecondary }]}>
              1.  2.  3.  4.  5.  6.  7. 
            </Text>
            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
              {verse.explanation}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButtonContainer: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verseHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  verseText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'center',
    marginBottom: 24,
  },
  explanationContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  explanationTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
