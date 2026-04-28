import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../../../../src/constants/theme';
import { useReadingMode } from '../../../../../src/contexts/ReadingModeContext';
import { MATTHEW } from '../../../../../src/data/bible/matthew';
import { getChapterContent, getGospelBookBySlug } from '../../../../../src/data/gospels';

export default function ChapterDetailScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();

  const gospelBook = getGospelBookBySlug(book);
  const chapterNumber = parseInt(chapter, 10);
  const chapterData = getChapterContent(book, chapterNumber);
  const navigation = useNavigation();

  // Get actual Bible content based on book slug
  const getBibleChapter = (bookSlug: string, chapterId: number) => {
    switch (bookSlug) {
      case 'matthew':
        return MATTHEW[chapterId] || null;
      case 'mark':
        // TODO: Import MARK when available
        return null;
      case 'luke':
        // TODO: Import LUKE when available
        return null;
      case 'john':
        // TODO: Import JOHN when available
        return null;
      default:
        return null;
    }
  };

  const bibleChapter = getBibleChapter(book, chapterNumber);

  useLayoutEffect(() => {
    if (gospelBook && chapterData && navigation) {
      navigation.setOptions({
        title: `${gospelBook.title} • თავი ${chapterData.number}`,
      });
    }
  }, [gospelBook, chapterData, navigation]);

  if (!gospelBook || !chapterData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            თავი ვერ მოიძებნა
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/');
          }
        }}
        style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
      >
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color={colors.primary} 
        />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {gospelBook.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          თავი {chapterData.number}
        </Text>
      </View>

      <View style={[styles.contentCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.contentTitle, { color: colors.text }]}>
          {chapterData.title}
        </Text>
        
        {bibleChapter ? (
          <View style={styles.versesContainer}>
            {bibleChapter.map((verse) => (
              <View key={verse.verse} style={styles.verseContainer}>
                <Text style={[styles.verseText, { color: colors.text }]}>
                  <Text style={[styles.verseNumber, { color: colors.primary }]}>
                    {verse.verse}.{' '}
                  </Text>
                  {verse.text}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              თავი ვერ მოიძებნა
            </Text>
            <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
              {gospelBook.title} {chapterData.number}
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
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 28,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    minHeight: 44,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 22,
  },
  contentCard: {
    borderRadius: 20,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 200,
  },
  contentTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 28,
  },
  versesContainer: {
    paddingVertical: 16,
  },
  verseContainer: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  verseText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'left',
  },
  verseNumber: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    minHeight: 120,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 24,
  },
  placeholderSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 20,
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
    marginTop: 16,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});
