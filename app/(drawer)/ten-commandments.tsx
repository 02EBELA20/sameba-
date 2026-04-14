import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';

const commandments = [
  { number: "I", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "II", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "III", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "IV", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "V", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "VI", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "VII", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "VIII", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "IX", text: "  1.  2.  3.  4.  5.  6.  7.  " },
  { number: "X", text: "  1.  2.  3.  4.  5.  6.  7.  " },
];

export default function TenCommandmentsScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          1.  2.  3.  4.  5.  6.  7.  1.  2.  3.  4.  5.  6.  7. 
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          1.  2.  3.  4.  5.  6.  7. 
        </Text>
      </View>

      {commandments.map((commandment, index) => (
        <View
          key={index}
          style={[styles.commandmentCard, { backgroundColor: colors.cardBackground }]}
        >
          <View style={styles.commandmentHeader}>
            <Text style={[styles.commandmentNumber, { color: colors.primary }]}>
              {commandment.number}
            </Text>
          </View>
          <Text style={[styles.commandmentText, { color: colors.text }]}>
            {commandment.text}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  commandmentCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commandmentHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  commandmentNumber: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  commandmentText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'center',
  },
});
