import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { getPrayerCategories } from '../../src/data/prayers';
export default function PrayersScreen() {
  const colors = getThemeColors();
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
    <ImageBackground
      source={require('../../assets/images/clouds-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ლოცვები
        </Text>
      </View>

      {categories.map((category, index) => (
        <View key={`${category.id}-${index}`} style={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryHeader, { backgroundColor: colors.surface }]}
            onPress={() => toggleCategory(category.id)}
          >
            <View style={styles.textContainer}>
              <Text style={[styles.categoryTitle, { color: colors.text, flexShrink: 1, flexWrap: 'wrap' }]}>
                {category.title}
              </Text>
            </View>
            <Ionicons
              name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
              style={styles.categoryIcon}
            />
          </TouchableOpacity>

          {expandedCategory === category.id && (
            <View style={styles.prayersContainer}>
              {category.prayers.map((prayer, prayerIndex) => (
                <TouchableOpacity
                  key={`${category.id}-${prayer.id}-${prayerIndex}`}
                  style={[styles.prayerCard, { backgroundColor: colors.surface }]}
                  onPress={() => togglePrayer(category.id, prayer.id)}
                >
                  <View style={styles.prayerHeader}>
                    <View style={styles.prayerTextContainer}>
                      <Text style={[styles.prayerTitle, { color: colors.text, flexShrink: 1, flexWrap: 'wrap' }]}>
                        {prayer.title}
                      </Text>
                      {prayer.subtitle && (
                        <Text style={[styles.prayerSubtitle, { color: colors.textSecondary, flexShrink: 1, flexWrap: 'wrap' }]}>
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
                    <View style={styles.prayerContentContainer}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 24,
    overflow: 'visible',
    minHeight: 70,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#8B6F47',
    lineHeight: TYPOGRAPHY.fontSize.xxxl + 12,
    includeFontPadding: true,
    paddingBottom: 6,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(47,95,126,0.10)',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    minHeight: 60,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.6,
    paddingTop: 4,
    includeFontPadding: true,
    flexShrink: 1,
  },
  categoryIcon: {
    marginLeft: 12,
  },
  prayersContainer: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: 'rgba(234,244,251,0.65)',
    marginTop: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  prayerCard: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 10,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  prayerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    paddingTop: 2,
    includeFontPadding: true,
    flexShrink: 1,
  },
  prayerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 22,
    paddingTop: 2,
    includeFontPadding: true,
    flexShrink: 1,
  },
  prayerContentContainer: {
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 18,
    marginTop: 10,
    marginHorizontal: 10,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 32,
    textAlign: 'left',
    paddingTop: 2,
    includeFontPadding: true,
  },
});
