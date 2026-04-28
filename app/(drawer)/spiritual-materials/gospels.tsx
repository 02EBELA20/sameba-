import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../../src/constants/theme';
import { useReadingMode } from '../../../src/contexts/ReadingModeContext';
import { GOSPEL_BOOKS } from '../../../src/data/gospels';

export default function GospelsScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          სახარება
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          ახალი აღთქმის წიგნები
        </Text>
      </View>

      {GOSPEL_BOOKS.map((book) => (
        <TouchableOpacity
          key={book.id}
          style={[styles.bookCard, { backgroundColor: colors.cardBackground }]}
          onPress={() => router.push(`/gospels/${book.slug}` as any)}
          activeOpacity={0.7}
        >
          <View style={styles.bookContent}>
            <View style={styles.bookHeader}>
              <Ionicons
                name="book-outline"
                size={28}
                color={colors.primary}
                style={styles.bookIcon}
              />
              <View style={styles.bookText}>
                <Text style={[styles.bookTitle, { color: colors.text }]}>
                  {book.title}
                </Text>
                <Text style={[styles.bookChapters, { color: colors.textSecondary }]}>
                  {book.totalChapters} თავი
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
  bookCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 90,
  },
  bookContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 60,
  },
  bookIcon: {
    marginRight: 24,
  },
  bookText: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 8,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 28,
  },
  bookChapters: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 20,
  },
});
