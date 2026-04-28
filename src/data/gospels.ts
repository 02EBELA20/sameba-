export interface GospelBook {
  id: string;
  slug: string;
  title: string;
  totalChapters: number;
}

export interface Chapter {
  number: number;
  title: string;
  verses?: Verse[];
}

export interface Verse {
  number: number;
  text: string;
}

export interface GospelContent {
  book: GospelBook;
  chapters: Chapter[];
}

export const GOSPEL_BOOKS: GospelBook[] = [
  {
    id: 'matthew',
    slug: 'matthew',
    title: 'მათე',
    totalChapters: 28,
  },
  {
    id: 'mark',
    slug: 'mark',
    title: 'მარკოზი',
    totalChapters: 16,
  },
  {
    id: 'luke',
    slug: 'luke',
    title: 'ლუკა',
    totalChapters: 24,
  },
  {
    id: 'john',
    slug: 'john',
    title: 'იოანე',
    totalChapters: 21,
  },
];

export function getGospelBookBySlug(slug: string): GospelBook | undefined {
  return GOSPEL_BOOKS.find(book => book.slug === slug);
}

export function getChaptersForBook(bookSlug: string): Chapter[] {
  const book = getGospelBookBySlug(bookSlug);
  if (!book) return [];

  return Array.from({ length: book.totalChapters }, (_, index) => ({
    number: index + 1,
    title: `თავი ${index + 1}`,
  }));
}

export function getChapterContent(bookSlug: string, chapterNumber: number): Chapter | undefined {
  const chapters = getChaptersForBook(bookSlug);
  return chapters.find(chapter => chapter.number === chapterNumber);
}
