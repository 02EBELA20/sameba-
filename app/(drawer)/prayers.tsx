import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const prayers = [
  { id: 1, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 2, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 3, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 4, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 5, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 6, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 7, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { id: 8, title: "  1.  2.  3.  4.  5.  6.  7.  ", text: "  1.  2.  3.  4.  5.  6.  7.  " },
];

export default function PrayersScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const [expandedPrayer, setExpandedPrayer] = useState<number | null>(null);

  const togglePrayer = (id: number) => {
    setExpandedPrayer(expandedPrayer === id ? null : id);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>  1.  2.  3.  4.  5.  6.  7.  </Text>
      </View>

      {prayers.map((prayer) => (
        <TouchableOpacity
          key={prayer.id}
          style={[styles.prayerCard, { backgroundColor: colors.cardBackground }]}
          onPress={() => togglePrayer(prayer.id)}
        >
          <View style={styles.prayerHeader}>
            <Text style={[styles.prayerTitle, { color: colors.text }]}>
              {prayer.title}
            </Text>
            <Ionicons
              name={expandedPrayer === prayer.id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </View>

          {expandedPrayer === prayer.id && (
            <Text style={[styles.prayerText, { color: colors.text }]}>
              {prayer.text}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: TYPOGRAPHY.fontWeight.bold },
  prayerCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  prayerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginTop: 16,
  },
});
