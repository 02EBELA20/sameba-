// Re-export all types from data files for centralized access
export type { DevotionalVerse } from '../data/devotional';
export type { Prayer } from '../data/prayers';
export type { Commandment } from '../data/commandments';

// App-wide types
export type SearchResult = {
  id: string;
  type: 'verse' | 'prayer' | 'commandment';
  title: string;
  content: string;
  reference?: string;
};

export type NotificationSettings = {
  enabled: boolean;
  intervalHours: 1 | 3 | 6 | 12 | 24;
};

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  white: string;
  goldAccent: string;
};

export type ReadingMode = 'light' | 'dark';
