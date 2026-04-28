import { getThemeColors, TYPOGRAPHY } from '@/src/constants/theme';
import { useFavorites } from '@/src/contexts/FavoritesContext';
import { useReadingMode } from '@/src/contexts/ReadingModeContext';
import { BIBLE } from '@/src/data/bible';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChapterScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const { book, chapter } = useLocalSearchParams();
  const { toggleFavorite, isFavorite } = useFavorites();

  const chapterNumber = Number(chapter);
  const verses = BIBLE[book as keyof typeof BIBLE]?.[chapterNumber];

  if (!verses) {
    return null;
  }

  const handleToggleFavorite = (verse: number, text: string) => {
    const verseId = `gospel-${book}-${chapterNumber}-${verse}`;
    const item = {
      id: verseId,
      text,
      book: book as string,
      chapter: chapterNumber,
      verse,
      source: 'gospel' as const
    };
    toggleFavorite(item);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          თავი {chapter}
        </Text>
        
        {verses.map(v => (
          <View key={v.verse} style={styles.verseContainer}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleToggleFavorite(v.verse, v.text)}
            >
              <Ionicons
                name={isFavorite(`gospel-${book}-${chapterNumber}-${v.verse}`) ? "star" : "star-outline"}
                size={20}
                color={isFavorite(`gospel-${book}-${chapterNumber}-${v.verse}`) ? colors.goldAccent : colors.textSecondary}
              />
            </TouchableOpacity>
            <Text style={[styles.verse, { color: colors.text, flex: 1, flexWrap: 'wrap', width: '100%' }]}>
              <Text style={[styles.verseNumber, { color: colors.primary }]}>
                {v.verse}.{' '}
              </Text>
              {v.text}
            </Text>
          </View>
        ))}
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
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  verse: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 26,
    marginBottom: 12,
  },
  verseNumber: {
    fontWeight: '700',
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  favoriteButton: {
    marginRight: 12,
    marginTop: 2,
    padding: 4,
  },
});
