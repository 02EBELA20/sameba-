import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "sameba:favorites";

export async function getFavoriteIds(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !Number.isNaN(n));
    return [];
  } catch {
    return [];
  }
}

export async function isFavorite(id: number): Promise<boolean> {
  const ids = await getFavoriteIds();
  return ids.includes(id);
}

export async function toggleFavorite(id: number): Promise<number[]> {
  const ids = await getFavoriteIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearFavorites() {
  await AsyncStorage.removeItem(KEY);
}
