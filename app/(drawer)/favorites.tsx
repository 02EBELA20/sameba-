import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useFavorites } from '../../src/contexts/FavoritesContext';

export default function FavoritesScreen() {
  const colors = getThemeColors();
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();

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
    if (item.type === 'bible' && item.book && item.chapter && item.verse) {
      return `${getGeorgianBookName(item.book)} ${item.chapter}:${item.verse}`;
    } else if (item.type === 'devotional') {
      return 'ლექსიკონი';
    }
    return '';
  };

  const handleVersePress = (item: any) => {
    if (item.type === 'bible' && item.book && item.chapter) {
      router.push(`/gospels/${item.book}/${item.chapter}`);
    } else if (item.type === 'devotional') {
      // For devotional items, use the ID directly
      router.push(`/verse/${item.id}`);
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
        style={[styles.favoriteItem, { backgroundColor: colors.surface }]}
        onPress={() => handleVersePress(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.textContainer}>
            <Text style={[styles.verseReference, { color: colors.primary, flexShrink: 1, flexWrap: 'wrap' }]}>
              {getDisplayReference(item)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name="star"
              size={20}
              color="#FACC15"
            />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.verseText, { color: colors.text, flexShrink: 1, flexWrap: 'wrap' }]}>
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
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flexShrink: 1,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.4,
    paddingTop: 2,
    includeFontPadding: true,
  },
  favoriteButton: {
    padding: 4,
  },
  verseText: {
    fontSize: 17,
    lineHeight: 17 * 1.4,
    flexShrink: 1,
    flexWrap: 'wrap',
    paddingTop: 2,
    includeFontPadding: true,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.4,
    paddingTop: 2,
    includeFontPadding: true,
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
});
