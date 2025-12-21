// src/services/verseCycle.ts
import { VERSES } from "../data/verses";
import { getNextVerseIdFromDeck } from "./storage";

export type Verse = (typeof VERSES)[number];

export function getVerseById(id: number) {
  return VERSES.find((v) => v.id === id) ?? null;
}

/**
 * აბრუნებს შემდეგ verseId-ს deck-ით:
 * - არ მეორდება სანამ არ ამოიწურება ყველა
 * - ამოიწურება → თავიდან shuffle და ისევ რენდომი
 */
export async function nextVerseId(): Promise<number> {
  const allIds = VERSES.map((v) => v.id);
  return await getNextVerseIdFromDeck(allIds);
}
