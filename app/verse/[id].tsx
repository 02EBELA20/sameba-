import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { DEVOTIONAL_VERSES } from "../../src/data/devotional";

export default function VerseDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const verse = useMemo(() => {
    const num = Number(id);
    if (!Number.isFinite(num)) return null;
    return DEVOTIONAL_VERSES.find((v) => v.id === num) ?? null;
  }, [id]);

  if (!verse) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundTitle}>ვერ ვიპოვე მუხლი</Text>
        <Text style={styles.notFoundSub}>დაბრუნდი უკან და სცადე თავიდან.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {verse.book} {verse.chapter}:{verse.verse}
      </Text>

      <View style={styles.card}>
        <Text style={styles.text}>{verse.text}</Text>
      </View>

      {!!verse.explanation && (
        <View style={styles.cardAlt}>
          <Text style={styles.explTitle}>განმარტება</Text>
          <Text style={styles.explText}>{verse.explanation}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#f5f2ec",
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    marginBottom: 12,
  },
  text: { fontSize: 18, lineHeight: 28, textAlign: "center" },

  cardAlt: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e7e2d8",
  },
  explTitle: { fontSize: 14, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  explText: { fontSize: 16, lineHeight: 26, textAlign: "center", color: "#333" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFoundTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  notFoundSub: { fontSize: 14, opacity: 0.7, textAlign: "center" },
});
