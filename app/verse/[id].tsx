import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getDevotionalVerseById } from '../../src/data/devotional';

export default function VerseDetailScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  
  const [verse, setVerse] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const verseData = getDevotionalVerseById(parseInt(id, 10));
      setVerse(verseData);
    }
  }, [id]);

  useEffect(() => {
    if (verse) {
      const verseId = `devotional-${id}`;
      setIsFavorite(checkIsFavorite(verseId));
    }
  }, [verse, checkIsFavorite]);

  const handleToggleFavorite = async () => {
    if (!verse) return;
    const verseId = `devotional-${id}`;
    const item = {
      id: verseId,
      text: verse.text,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse || parseInt(id),
      source: 'devotional' as const
    };
    toggleFavorite(item);
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
            მუხლი არ მოიძებნა
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: colors.white }]}>
              უკან
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

        <Text style={[styles.verseText, { color: colors.text, flex: 1, flexWrap: 'wrap', width: '100%' }]}>
          {verse.text}
        </Text>
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
