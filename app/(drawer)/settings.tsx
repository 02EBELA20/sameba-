import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useReadingMode } from '../../src/contexts/ReadingModeContext';

export default function SettingsScreen() {
  const { readingMode, toggleReadingMode } = useReadingMode();
  const colors = getThemeColors(readingMode);

  const handleContactSupport = () => {
    Alert.alert(
      'მხარდაჭერა',
      'დაგვიკავშირდით ელფოსტის მეშვეობით',
      [
        { text: 'გაუქმება', style: 'cancel' },
        { text: 'გაგზავნა', onPress: () => Linking.openURL('mailto:support@sameba.app') },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'შეფასება',
      'გთხოვთ შეაფასოთ ჩვენი აპლიკაცია App Store-ში',
      [
        { text: 'გაუქმება', style: 'cancel' },
        { text: 'შეფასება', onPress: () => Linking.openURL('https://apps.apple.com/app/sameba') },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'გამოყენება',
      items: [
        {
          icon: 'moon-outline' as const,
          title: 'ბნელი რეჟიმი',
          subtitle: readingMode ? 'ჩართულია' : 'გამორთულია',
          onPress: toggleReadingMode,
        },
      ],
    },
    {
      title: 'მხარდაჭერა',
      items: [
        {
          icon: 'star-outline' as const,
          title: 'შეფასება',
          subtitle: 'შეაფასეთ აპლიკაცია',
          onPress: handleRateApp,
        },
        {
          icon: 'mail-outline' as const,
          title: 'დაგვიკავშირდით',
          subtitle: 'მხარდაჭერის გუნდი',
          onPress: handleContactSupport,
        },
      ],
    },
    {
      title: 'ინფორმაცია',
      items: [
        {
          icon: 'information-circle-outline' as const,
          title: 'ვერსია',
          subtitle: 'ვერსია 1.0.0',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          პარამეტრები
        </Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {section.title}
          </Text>
          <View style={styles.sectionContainer}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.settingItem, { backgroundColor: colors.cardBackground }]}
                onPress={item.onPress}
              >
                <View style={styles.itemLeft}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={colors.primary}
                    style={styles.itemIcon}
                  />
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          © 2024 სამება
        </Text>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          ვერსია 1.0.0
        </Text>
      </View>
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
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionContainer: {
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
});
