import { COMMANDMENTS } from '../data/commandments';
import { DEVOTIONAL_VERSES } from '../data/devotional';
import { getAllPrayers } from '../data/prayers';
import { SearchResult } from '../types';

export function searchVerses(query: string): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return [];
  }

  const results: SearchResult[] = [];

  // 🔍 Search in devotional verses
  DEVOTIONAL_VERSES.forEach((verse) => {
    const matchesText = verse.text.toLowerCase().includes(normalizedQuery);
    const matchesBook = verse.book.toLowerCase().includes(normalizedQuery);
    const matchesReference = `${verse.book} ${verse.chapter}:${verse.verse}`
      .toLowerCase()
      .includes(normalizedQuery);

    if (matchesText || matchesBook || matchesReference) {
      results.push({
        id: verse.id.toString(),
        type: 'verse',
        title: `${verse.book} ${verse.chapter}:${verse.verse}`,
        content: verse.text,
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
      });
    }
  });

  // 🔍 Search in prayers (NEW SYSTEM)
  const prayers = getAllPrayers();

  prayers.forEach((prayer) => {
    const matchesTitle = prayer.title.toLowerCase().includes(normalizedQuery);
    const matchesText = prayer.text.toLowerCase().includes(normalizedQuery);

    if (matchesTitle || matchesText) {
      results.push({
        id: prayer.id.toString(),
        type: 'prayer',
        title: prayer.title,
        content: prayer.text,
      });
    }
  });

  // 🔍 Search in commandments
  COMMANDMENTS.forEach((commandment) => {
    const matchesText = commandment.text.toLowerCase().includes(normalizedQuery);
    const matchesNumber = commandment.number
      .toLowerCase()
      .includes(normalizedQuery);

    if (matchesText || matchesNumber) {
      results.push({
        id: commandment.number,
        type: 'commandment',
        title: `მცნება ${commandment.number}`,
        content: commandment.text,
      });
    }
  });

  return results;
}

export function formatVerseReference(verse: {
  book: string;
  chapter: number;
  verse: number;
}): string {
  return `${verse.book} ${verse.chapter}:${verse.verse}`;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}