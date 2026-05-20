import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, TYPOGRAPHY } from '../../src/constants/theme';
import { useFavorites } from '../../src/contexts/FavoritesContext';
import { getDevotionalVerseById, type DevotionalItem } from '../../src/data/devotional';

export default function VerseDetailScreen() {
  const colors = getThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [verse, setVerse] = useState<DevotionalItem | null>(null);

  useEffect(() => {
    if (id) {
      const verseData = getDevotionalVerseById(id);
      setVerse(verseData || null);
    }
  }, [id]);

  
  const handleToggleFavorite = async () => {
    if (!verse) return;
    
    const item = {
      id: verse.id, // Use the same ID as Home screen
      text: verse.text,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      explanation: verse.explanation,
      sourceTitle: verse.sourceTitle,
      type: 'devotional' as const
    };
    toggleFavorite(item);
  };

  const handleShare = async () => {
    if (!verse) return;
    try {
      await Share.share({
        message: `${verse.book} ${verse.chapter}:${verse.verse}\n\n${verse.text}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!verse) {
    return (
      <ImageBackground
        source={require('../../assets/images/clouds-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              მუხლი არ მოიძებნა
            </Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={handleBack}
            >
              <Text style={[styles.backButtonText, { color: colors.white }]}>
                უკან
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/clouds-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: 'transparent' }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
      <View style={styles.card}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.rightIcons}>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Ionicons
                name={verse && isFavorite(verse.id) ? 'star' : 'star-outline'}
                size={24}
                color={verse && isFavorite(verse.id) ? '#FACC15' : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.title, { color: '#8B6B3E' }]}>
          {verse.book} {verse.chapter}:{verse.verse}
        </Text>

        <Text style={[styles.text, { color: '#3E3A36' }]}>
          {verse.text}
        </Text>

        <Text style={[styles.explanationTitle, { color: '#8B6B3E' }]}>
          განმარტება
        </Text>

        <Text style={[styles.explanation, { color: '#666' }]}>
          {verse.explanation && verse.explanation.trim().length > 0 
            ? verse.explanation 
            : "ამ მუხლის განმარტება ჯერ დამატებული არ არის."
          }
        </Text>

        {verse.sourceTitle && verse.sourceTitle.trim().length > 0 && (
          <Text style={[styles.source, { color: '#888' }]}>
            წყარო: {verse.sourceTitle}
          </Text>
        )}
      </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.84)',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  title: {
    fontSize: 16,
    color: '#2C2C2C',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
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
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
    fontStyle: 'italic',
  },
  source: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
