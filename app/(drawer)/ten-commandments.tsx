import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';
import { COMMANDMENTS } from '../../src/data/commandments';

export default function TenCommandmentsScreen() {
  const { readingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);
  const [expandedCommandment, setExpandedCommandment] = useState<number | null>(null);

  const toggleCommandment = (index: number) => {
    setExpandedCommandment(expandedCommandment === index ? null : index);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ათი მცნება
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          მოსეს მთაზე მოცემული ათი მცნება
        </Text>
      </View>

      {COMMANDMENTS.map((commandment, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.commandmentCard, { backgroundColor: colors.cardBackground }]}
          onPress={() => toggleCommandment(index)}
          activeOpacity={0.7}
        >
          <View style={styles.commandmentHeader}>
            <Text style={[styles.commandmentNumber, { color: colors.primary }]}>
              {commandment.number}
            </Text>
            <Ionicons
              name={expandedCommandment === index ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </View>
          <Text 
            style={[
              styles.commandmentText, 
              { color: colors.text },
              expandedCommandment === index ? styles.commandmentTextExpanded : styles.commandmentTextCollapsed
            ]}
            numberOfLines={expandedCommandment === index ? undefined : 2}
          >
            {commandment.text}
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  commandmentTextCollapsed: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'center',
  },
  commandmentTextExpanded: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    textAlign: 'center',
  },
});
