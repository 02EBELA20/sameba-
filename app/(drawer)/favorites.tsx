import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getDevotionalVerseById } from '../../src/data/devotional';
import { getFavorites, toggleFavorite } from '../../src/services/storage';

export default function FavoritesScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteVerses, setFavoriteVerses] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
    
    const verses = favs
      .map(id => getDevotionalVerseById(id))
      .filter(Boolean);
    setFavoriteVerses(verses);
  };

  const handleToggleFavorite = async (id: number) => {
    const newFavorites = await toggleFavorite(id);
    setFavorites(newFavorites);
    
    const verses = newFavorites
      .map(favId => getDevotionalVerseById(favId))
      .filter(Boolean);
    setFavoriteVerses(verses);
  };

  const handleVersePress = (id: number) => {
    router.push(`/verse/${id}`);
  };

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.favoriteItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleVersePress(item.id)}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.verseReference, { color: colors.primary }]}>
          {item.book} {item.chapter}:{item.verse}
        </Text>
        <TouchableOpacity
          onPress={() => handleToggleFavorite(item.id)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name="star"
            size={20}
            color={colors.goldAccent}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.verseText, { color: colors.text }]}>
        {item.text}
      </Text>
      
      {item.explanation && (
        <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
          {item.explanation}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            ჯერ არაფელი გაქვს შენახული ⭐
          </Text>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/' as any)}
          >
            <Text style={[styles.homeButtonText, { color: colors.white }]}>
              მთავარ გვერდზე
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ფავორიტები
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favorites.length} {favorites.length === 1 ? 'მუხლი' : 'მუხლი'}
        </Text>
      </View>
      
      <FlatList
        data={favoriteVerses}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  favoriteItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  favoriteButton: {
    padding: 4,
  },
  verseText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  homeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
