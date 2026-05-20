import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { searchVerses } from '../../src/utils/verse';


export default function SearchScreen() {
  const colors = getThemeColors();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    return searchVerses(searchQuery);
  }, [searchQuery]);

  const handleItemPress = (item: any) => {
    if (item.type === 'verse') {
      router.push(`/verse/${item.id}` as any);
    } else if (item.type === 'prayer') {
      router.push('/(drawer)/prayers' as any);
    } else if (item.type === 'commandment') {
      router.push('/(drawer)/ten-commandments' as any);
    }
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: colors.surface }]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.resultCategory, { color: colors.primary }]}>
          {item.type === 'verse' && 'მუხლი'}
          {item.type === 'prayer' && 'ლოცვა'}
          {item.type === 'commandment' && 'მცნება'}
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
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ძიება მუხლებში, ლოცვებსა და მცნებებში..."
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
          keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                ვერ მოიძებნა შედეგები
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
    minHeight: 80,
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
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.4,
    paddingTop: 2,
    includeFontPadding: true,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
    flexShrink: 1,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.4,
    paddingTop: 2,
    includeFontPadding: true,
  },
  resultText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.4,
    flexShrink: 1,
    paddingTop: 2,
    includeFontPadding: true,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.base * 1.4,
    paddingTop: 2,
    includeFontPadding: true,
  },
});
