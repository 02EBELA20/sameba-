import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { DEVOTIONAL_VERSES } from '../../src/data/devotional';
import { getDevotionalVerseById } from '../../src/data/devotional';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const prayers = [
  { id: 1, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 2, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 3, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 4, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 5, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 6, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 7, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
  { id: 8, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'prayer' },
];

const commandments = [
  { number: "I", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "II", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "III", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "IV", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "V", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "VI", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "VII", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "VIII", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "IX", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
  { number: "X", text: "  1.  2.  3.  4.  5.  6.  7.  ", category: 'commandment' },
];

export default function SearchScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    DEVOTIONAL_VERSES.forEach(verse => {
      if (
        verse.text.toLowerCase().includes(query) ||
        verse.book.toLowerCase().includes(query) ||
        verse.explanation?.toLowerCase().includes(query)
      ) {
        results.push({
          ...verse,
          category: 'verse',
          title: `${verse.book} ${verse.chapter}:${verse.verse}`,
        });
      }
    });

    prayers.forEach(prayer => {
      if (
        prayer.title.toLowerCase().includes(query) ||
        prayer.text.toLowerCase().includes(query)
      ) {
        results.push({ ...prayer });
      }
    });

    commandments.forEach(commandment => {
      if (commandment.text.toLowerCase().includes(query)) {
        results.push({
          ...commandment,
          title: `1.  2.  3.  4.  5.  6.  7.  ${commandment.number}`,
        });
      }
    });

    return results.slice(0, 30);
  }, [searchQuery]);

  const handleResultPress = (result: any) => {
    if (result.category === 'verse') {
      router.push(`/verse/${result.id}`);
    }
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.resultCategory, { color: colors.primary }]}>
          {item.category === 'verse' && '1.  2.  3.  4.  5.  6.  7. '}
          {item.category === 'prayer' && '1.  2.  3.  4.  5.  6.  7. '}
          {item.category === 'commandment' && '1.  2.  3.  4.  5.  6.  7. '}
        </Text>
        <Text style={[styles.resultTitle, { color: colors.text }]}>
          {item.title}
        </Text>
      </View>
      
      <Text style={[styles.resultText, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="1.  2.  3.  4.  5.  6.  7. "
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            multiline={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => `${item.category}-${item.id || index}`}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                1.  2.  3.  4.  5.  6.  7. 
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultCategory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  resultText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    marginTop: 16,
    textAlign: 'center',
  },
});
