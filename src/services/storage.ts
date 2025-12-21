// src/services/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
// -------------------- Notification prefs + Deck rotation --------------------
const KEY_NOTIF_ENABLED = "sameba:notifEnabled"; // "1" | "0"
const KEY_NOTIF_INTERVAL = "sameba:notifIntervalHours"; // "1" | "3"
// -------------------- Favorites --------------------
const KEY_FAVORITES = "sameba:favorites"; // JSON number[]

export async function getFavorites(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(KEY_FAVORITES);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x) => Number.isFinite(Number(x))).map(Number)
      : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: number): Promise<number[]> {
  const favs = await getFavorites();
  const next = favs.includes(id) ? favs.filter((x) => x !== id) : [id, ...favs];
  await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(next));
  return next;
}

const KEY_DECK = "sameba:verseDeck"; // JSON: number[]
const KEY_DECK_INDEX = "sameba:verseDeckIndex"; // string number

function shuffle(arr: number[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function setNotifEnabled(v: boolean) {
  await AsyncStorage.setItem(KEY_NOTIF_ENABLED, v ? "1" : "0");
}

export async function getNotifEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY_NOTIF_ENABLED);
  return v === "1";
}

export async function setNotifIntervalHours(v: 1 | 3) {
  await AsyncStorage.setItem(KEY_NOTIF_INTERVAL, String(v));
}

export async function getNotifIntervalHours(): Promise<1 | 3> {
  const v = await AsyncStorage.getItem(KEY_NOTIF_INTERVAL);
  return v === "3" ? 3 : 1;
}

/**
 * ✅ Random non-repeat deck:
 * - allIds shuffled
 * - iterate through deck
 * - when exhausted -> reshuffle and start again
 */
export async function getNextVerseIdFromDeck(allIds: number[]): Promise<number> {
  if (!allIds.length) throw new Error("No verses available");

  const rawDeck = await AsyncStorage.getItem(KEY_DECK);
  const rawIdx = await AsyncStorage.getItem(KEY_DECK_INDEX);

  let deck: number[] = [];
  let idx = 0;

  try {
    deck = rawDeck ? JSON.parse(rawDeck) : [];
    if (!Array.isArray(deck)) deck = [];
  } catch {
    deck = [];
  }

  idx = rawIdx ? Number(rawIdx) : 0;
  if (!Number.isFinite(idx) || idx < 0) idx = 0;

  // თუ deck ცარიელია ან deck-ში verse-ები აღარ ემთხვევა allIds-ს -> თავიდან
  const validSet = new Set(allIds);
  deck = deck.filter((id) => validSet.has(id));

  if (deck.length !== allIds.length) {
    deck = shuffle(allIds);
    idx = 0;
  }

  // თუ ამოიწურა -> თავიდან shuffle
  if (idx >= deck.length) {
    deck = shuffle(allIds);
    idx = 0;
  }

  const nextId = deck[idx];
  idx += 1;

  await AsyncStorage.setItem(KEY_DECK, JSON.stringify(deck));
  await AsyncStorage.setItem(KEY_DECK_INDEX, String(idx));

  return nextId;
}
