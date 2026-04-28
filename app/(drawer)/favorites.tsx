import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';

export default function FavoritesScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();

  console.log("FAVORITES in screen:", favorites);

  const getGeorgianBookName = (book: string) => {
    const names: Record<string, string> = {
      matthew: 'მათე',
      mark: 'მარკოზი',
      luke: 'ლუკა',
      john: 'იოანე'
    };
    return names[book] || book;
  };

  const getDisplayReference = (item: any) => {
    if (item.source === 'gospel' && item.book && item.chapter && item.verse) {
      return `${getGeorgianBookName(item.book)} ${item.chapter}:${item.verse}`;
    } else if (item.source === 'devotional') {
      return 'ლექსიკონი';
    }
    return '';
  };

  const handleVersePress = (item: any) => {
    if (item.source === 'gospel' && item.book && item.chapter) {
      router.push(`/gospels/${item.book}/${item.chapter}`);
    } else if (item.source === 'devotional') {
      // Extract index from devotional ID
      const index = item.id.replace('devotional-', '');
      router.push(`/verse/${index}`);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (id) {
      await removeFavorite(id);
    }
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    // Do NOT render any item without valid text
    if (!item || !item.text || item.text.trim() === "") return null;
    
    return (
      <TouchableOpacity
        style={[styles.favoriteItem, { backgroundColor: colors.cardBackground }]}
        onPress={() => handleVersePress(item)}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.verseReference, { color: colors.primary }]}>
            {getDisplayReference(item)}
          </Text>
          <TouchableOpacity
            onPress={() => handleRemoveFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name="star"
              size={20}
              color={colors.goldAccent}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.verseText, { color: colors.text, flex: 1, flexWrap: 'wrap', width: '100%' }]}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

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
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
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
    padding: 20,
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
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
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
