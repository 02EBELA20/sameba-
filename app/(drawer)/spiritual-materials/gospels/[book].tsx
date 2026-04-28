import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../../../src/constants/theme';
import { useReadingMode } from '../../../../src/contexts/ReadingModeContext';
import { getChaptersForBook, getGospelBookBySlug } from '../../../../src/data/gospels';

export default function BookChaptersScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();
  const { book } = useLocalSearchParams<{ book: string }>();

  const gospelBook = getGospelBookBySlug(book);
  const chapters = getChaptersForBook(book);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (gospelBook && navigation) {
      navigation.setOptions({
        title: gospelBook.title,
      });
    }
  }, [gospelBook, navigation]);

  if (!gospelBook) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            სახარება ვერ მოიძებნა
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {gospelBook.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          ახალი აღთქმა • {gospelBook.totalChapters} თავი
        </Text>
      </View>

      {chapters.map((chapter) => (
        <TouchableOpacity
          key={chapter.number}
          style={[styles.chapterCard, { backgroundColor: colors.cardBackground }]}
          onPress={() => router.push(`/gospels/${book}/${chapter.number}` as any)}
          activeOpacity={0.7}
        >
          <View style={styles.chapterContent}>
            <View style={styles.chapterHeader}>
              <View style={[styles.chapterNumber, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.chapterNumberText, { color: colors.primary }]}>
                  {chapter.number}
                </Text>
              </View>
              <View style={styles.chapterText}>
                <Text style={[styles.chapterTitle, { color: colors.text }]}>
                  {chapter.title}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      ))}
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
  chapterCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 80,
  },
  chapterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 60,
  },
  chapterNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  chapterNumberText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  chapterText: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  chapterTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 24,
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
});
