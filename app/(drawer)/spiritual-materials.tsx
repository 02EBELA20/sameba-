import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';

export default function SpiritualMaterialsScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const router = useRouter();

  const sections = [
    {
      id: 'new-testament',
      title: 'ახალი აღთქმა',
      description: 'სახარება',
      icon: 'book-outline' as const,
      route: '/spiritual-materials/gospels',
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          წმინდა წერილები
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          ახალი აღთქმის წიგნები და სულიერი საკითხავი
        </Text>
      </View>

      {sections.map((section) => (
        <TouchableOpacity
          key={section.id}
          style={[styles.sectionCard, { backgroundColor: colors.cardBackground }]}
          onPress={() => router.push(section.route as any)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name={section.icon}
                size={32}
                color={colors.primary}
                style={styles.sectionIcon}
              />
              <View style={styles.sectionText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  {section.description}
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
  sectionCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 60,
  },
  sectionIcon: {
    marginRight: 24,
  },
  sectionText: {
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 8,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 28,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    minHeight: 20,
  },
});
