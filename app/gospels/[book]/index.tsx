import { getThemeColors, TYPOGRAPHY } from '@/src/constants/theme';
import { useReadingMode } from '@/src/contexts/ReadingModeContext';
import { BIBLE } from '@/src/data/bible';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookIndexScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { book } = useLocalSearchParams<{ book: string }>();

  const bookData = BIBLE[book as keyof typeof BIBLE];

  if (!bookData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            სახარება ვერ მოიძებნა
          </Text>
        </View>
      </View>
    );
  }

  const chapters = Object.keys(bookData).map(chapterNumber => ({
    number: Number(chapterNumber)
  }));

  const getGeorgianTitle = (bookKey: string) => {
    const titles: Record<string, string> = {
      matthew: 'მათეს სახარება',
      mark: 'მარკოზის სახარება',
      luke: 'ლუკას სახარება',
      john: 'იოანეს სახარება'
    };
    return titles[bookKey] || bookKey.charAt(0).toUpperCase() + bookKey.slice(1) + 'ს სახარება';
  };

  const handleChapterPress = (chapterNumber: number) => {
    router.push(`/gospels/${book}/${chapterNumber}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        {getGeorgianTitle(book)}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        ახალი აღთქმა • {chapters.length} თავი
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.number.toString()}
        numColumns={2}
        contentContainerStyle={styles.chaptersContainer}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chapterCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleChapterPress(item.number)}
            activeOpacity={0.7}
          >
            <View style={styles.chapterContent}>
              <View style={styles.chapterNumber}>
                <Text style={[styles.chapterNumberText, { color: colors.primary }]}>
                  {item.number}
                </Text>
              </View>
              <Text style={[styles.chapterLabel, { color: colors.text }]}>
                თავი
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  chaptersContainer: {
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  chapterCard: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chapterContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B6F4733',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  chapterNumberText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  chapterLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: 2,
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
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
});
