import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FAVORITES_KEY = 'favorites';

export type FavoriteItem = {
  id: string;
  book?: string;
  chapter?: number;
  verse?: number;
  text: string;
  explanation?: string;
  sourceTitle?: string;
  type?: 'devotional' | 'bible' | 'prayer' | 'commandment';
  createdAt?: string;
};

export type FavoritesContextValue = {
  favorites: FavoriteItem[];
  favoriteIds: Set<string>;
  isFavorite: (id: string) => boolean;
  addFavorite: (item: FavoriteItem) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

type LegacyFavoriteItem = {
  id?: string | number;
  text?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  explanation?: string;
  sourceTitle?: string;
  source?: 'gospel' | 'devotional';
  type?: 'devotional' | 'bible' | 'prayer' | 'commandment';
  createdAt?: string;
};

function normalizeFavoriteItem(item: LegacyFavoriteItem): FavoriteItem | null {
  if (!item || !item.id || !item.text || item.text.trim() === "") {
    return null;
  }

  // Convert id to string
  const id = String(item.id);

  // Handle old format conversion
  let type = item.type;
  if (!type && item.source) {
    // Convert old 'source' field to new 'type'
    type = item.source === 'gospel' ? 'bible' : item.source;
  }

  return {
    id,
    text: item.text,
    book: item.book,
    chapter: item.chapter,
    verse: item.verse,
    explanation: item.explanation,
    sourceTitle: item.sourceTitle,
    type: type as FavoriteItem['type'],
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function deduplicateFavorites(items: FavoriteItem[]): FavoriteItem[] {
  const seen = new Set<string>();
  const result: FavoriteItem[] = [];
  
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  
  return result;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map(fav => fav.id));
  }, [favorites]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const rawFavorites = stored ? JSON.parse(stored) : [];
      
      // Normalize and filter invalid items
      const normalizedFavorites = rawFavorites
        .map((item: LegacyFavoriteItem) => normalizeFavoriteItem(item))
        .filter((item: FavoriteItem | null): item is FavoriteItem => item !== null);
      
      // Remove duplicates
      const dedupedFavorites = deduplicateFavorites(normalizedFavorites);
      
      // Save cleaned data back to storage
      if (dedupedFavorites.length !== rawFavorites.length) {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(dedupedFavorites));
      }
      
      setFavorites(dedupedFavorites);
      
      if (__DEV__) {
        console.log('[Favorites] loaded:', dedupedFavorites.length);
      }
    } catch (error) {
      console.error('[Favorites] Error loading favorites:', error);
      setFavorites([]);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const addFavorite = async (item: FavoriteItem) => {
    if (!item.id || !item.text || item.text.trim() === "") {
      console.error('[Favorites] Invalid item - missing id or text:', item);
      return;
    }

    try {
      const newItem: FavoriteItem = {
        ...item,
        id: String(item.id), // Ensure id is string
        createdAt: new Date().toISOString(),
      };

      setFavorites(prev => {
        const exists = prev.some(fav => fav.id === newItem.id);
        if (exists) {
          console.warn('[Favorites] Item already exists:', newItem.id);
          return prev;
        }
        const updated = [...prev, newItem];
        
        if (__DEV__) {
          console.log('[Favorites] added:', newItem.id, newItem.book, newItem.chapter, newItem.verse);
        }
        
        return updated;
      });
    } catch (error) {
      console.error('[Favorites] Error adding favorite:', error);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const stringId = String(id);
      
      setFavorites(prev => {
        const updated = prev.filter(fav => fav.id !== stringId);
        
        if (__DEV__) {
          console.log('[Favorites] removed:', stringId);
        }
        
        return updated;
      });
    } catch (error) {
      console.error('[Favorites] Error removing favorite:', error);
    }
  };

  const toggleFavorite = async (item: FavoriteItem) => {
    const stringId = String(item.id);
    const isCurrentlyFavorite = favoriteIds.has(stringId);

    if (__DEV__) {
      console.log('[Favorites] toggle:', stringId, item.book, item.chapter, item.verse, 'current:', isCurrentlyFavorite);
    }

    if (isCurrentlyFavorite) {
      await removeFavorite(stringId);
    } else {
      await addFavorite(item);
    }
  };

  const isFavorite = (id: string): boolean => {
    const stringId = String(id);
    return favoriteIds.has(stringId);
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  // Save to AsyncStorage whenever favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } else {
      AsyncStorage.removeItem(FAVORITES_KEY);
    }
  }, [favorites]);

  const value: FavoritesContextValue = {
    favorites,
    favoriteIds,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
