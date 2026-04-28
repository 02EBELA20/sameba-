export type DevotionalVerse = {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export const DEVOTIONAL_VERSES: DevotionalVerse[] = [
  { id: 1, book: "მათე", chapter: 5, verse: 3, text: "ნეტარ არიან გლახაკნი სულითა, რამეთუ მათია სასუფეველი ცათა." },
  { id: 2, book: "მათე", chapter: 5, verse: 8, text: "ნეტარ არიან წმიდანი გულითა, ვინაიდან ისინი ღმერთს იხილავენ." },
  { id: 3, book: "იოანე", chapter: 3, verse: 16, text: "რამეთუ ესრეთ შეიყვარა ღმერთმა სოფელი, რომ ძე მისი მხოლოდშობილი მისცა." },
  { id: 4, book: "იოანე", chapter: 14, verse: 6, text: "მე ვარ გზა, ჭეშმარიტება და სიცოცხლე." },
  { id: 5, book: "ფილიპელთა", chapter: 4, verse: 13, text: "ყოველივე შემიძლია ქრისტეს მიერ, რომელი მამაგრებს მე." },
];

export function getDevotionalVerseById(id: number): DevotionalVerse | undefined {
  return DEVOTIONAL_VERSES.find(verse => verse.id === id);
}

export function getRandomDevotionalVerse(excludeIds?: number[]): DevotionalVerse {
  const excludedSet = new Set(excludeIds || []);
  const availableVerses = DEVOTIONAL_VERSES.filter(verse => !excludedSet.has(verse.id));
  
  if (availableVerses.length === 0) {
    return DEVOTIONAL_VERSES[Math.floor(Math.random() * DEVOTIONAL_VERSES.length)];
  }
  
  return availableVerses[Math.floor(Math.random() * availableVerses.length)];
}
