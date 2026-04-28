import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '@/src/constants/theme';
import { useReadingMode } from '@/src/contexts/ReadingModeContext';

const GOSPELS = [
  { title: 'მათე', slug: 'matthew', chapters: 28 },
  { title: 'მარკოზი', slug: 'mark', chapters: 16 },
  { title: 'ლუკა', slug: 'luke', chapters: 24 },
  { title: 'იოანე', slug: 'john', chapters: 21 },
];

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
          ახალი აღთმის წიგნები
        </Text>
      </View>

      {GOSPELS.map((gospel) => (
        <TouchableOpacity
          key={gospel.slug}
          style={[styles.bookCard, { backgroundColor: colors.cardBackground }]}
          onPress={() => router.push(`/gospels/${gospel.slug}`)}
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
                  {gospel.title}
                </Text>
                <Text style={[styles.bookChapters, { color: colors.textSecondary }]}>
                  {gospel.chapters} თავი
                </Text>
              </View>
            </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 24,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  bookCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookContent: {
    flex: 1,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    marginRight: 16,
  },
  bookText: {
    flex: 1,
  },
  bookTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 4,
  },
  bookChapters: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
});
