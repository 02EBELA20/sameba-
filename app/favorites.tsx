import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { DEVOTIONAL_VERSES } from "../src/data/devotional";
import { getFavorites, toggleFavorite } from "../src/services/storage";

export default function FavoritesScreen() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const refresh = async () => {
    setFavoriteIds(await getFavorites());
  };

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const items = useMemo(() => {
    const set = new Set(favoriteIds);
    return DEVOTIONAL_VERSES.filter((v) => set.has(v.id));
  }, [favoriteIds]);

  const remove = async (id: number) => {
    const next = await toggleFavorite(id);
    setFavoriteIds(next);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ფავორიტები</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>ჯერ არაფერი გაქვს შენახული ⭐</Text>
      ) : (
        items.map((v) => (
          <Pressable
            key={v.id}
            style={styles.item}
            onPress={() =>
              router.push({ pathname: "/verse/[id]", params: { id: String(v.id) } })
            }
          >
            <View style={styles.row}>
              <Text style={styles.ref}>
                {v.book} {v.chapter}:{v.verse}
              </Text>

              <Pressable
                onPress={(e: any) => {
                  e?.stopPropagation?.();
                  remove(v.id);
                }}
                hitSlop={10}
              >
                <Text style={styles.star}>⭐</Text>
              </Pressable>
            </View>

            <Text style={styles.preview} numberOfLines={3} ellipsizeMode="tail">
              {v.text}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#f5f2ec", flexGrow: 1 },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 14 },
  empty: { textAlign: "center", opacity: 0.7, marginTop: 30 },

  item: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ref: { fontWeight: "800" },
  star: { fontSize: 18 },
  preview: { marginTop: 8, opacity: 0.9, lineHeight: 22 },
});
