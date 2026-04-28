import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getPrayerCategories } from '../../src/data/prayers';
export default function PrayersScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    // Close any expanded prayer when category is toggled
    setExpandedPrayer(null);
  };

  const togglePrayer = (categoryId: string, prayerId: string) => {
    setExpandedPrayer(expandedPrayer === prayerId ? null : prayerId);
  };

  const categories = getPrayerCategories();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ლოცვები
        </Text>
      </View>

      {categories.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryHeader, { backgroundColor: colors.cardBackground }]}
            onPress={() => toggleCategory(category.id)}
          >
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {category.title}
            </Text>
            <Ionicons
              name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
              style={styles.categoryIcon}
            />
          </TouchableOpacity>

          {expandedCategory === category.id && (
            <View style={styles.prayersContainer}>
              {category.prayers.map((prayer) => (
                <TouchableOpacity
                  key={prayer.id}
                  style={[styles.prayerCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => togglePrayer(category.id, prayer.id)}
                >
                  <View style={styles.prayerHeader}>
                    <View style={styles.prayerTitleContainer}>
                      <Text style={[styles.prayerTitle, { color: colors.text }]}>
                        {prayer.title}
                      </Text>
                      {prayer.subtitle && (
                        <Text style={[styles.prayerSubtitle, { color: colors.textSecondary }]}>
                          {prayer.subtitle}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name={expandedPrayer === prayer.id ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.primary}
                    />
                  </View>

                  {expandedPrayer === prayer.id && (
                    <View style={styles.prayerTextContainer}>
                      <Text style={[styles.prayerText, { color: colors.text }]}>
                        {prayer.text}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
    color: '#8B6F47',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  categoryIcon: {
    marginLeft: 12,
  },
  prayersContainer: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  prayerCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 111, 71, 0.1)',
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  prayerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  prayerTextContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  prayerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'left',
  },
});
