import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const FAVORITES_KEY = 'favorites';

interface FavoriteItem {
  id: string;
  text: string;
  book?: string;
  chapter?: number;
  verse?: number;
  source: "gospel" | "devotional";
  createdAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  toggleFavorite: (item: Omit<FavoriteItem, 'createdAt'>) => Promise<void>;
  isFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const favs = stored ? JSON.parse(stored) : [];
      
      // Filter out any invalid items
      const validFavorites = favs.filter((fav: any) => 
        fav && 
        fav.id && 
        fav.text && 
        fav.text.trim() !== "" &&
        fav.source
      );
      
      setFavorites(validFavorites);
      console.log("FAVORITES loaded:", validFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const toggleFavorite = async (item: Omit<FavoriteItem, 'createdAt'>) => {
    const { id, text } = item;
    
    // DO NOT allow empty or invalid item
    if (!item.text || item.text.trim() === "") {
      console.error("Invalid item - no text:", item);
      return;
    }
    
    try {
      const currentFavorites = [...favorites];
      const existingIndex = currentFavorites.findIndex(fav => fav.id === id);
      
      if (existingIndex > -1) {
        // If item exists → remove
        currentFavorites.splice(existingIndex, 1);
        console.log("Removed favorite:", id);
      } else {
        // If not → add
        const newFavorite: FavoriteItem = {
          ...item,
          createdAt: new Date().toISOString(),
        };
        currentFavorites.push(newFavorite);
        console.log("Added favorite:", newFavorite);
      }
      
      setFavorites(currentFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavorites));
      console.log("FAVORITES after toggle:", currentFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some(fav => fav.id === id);
  };

  const removeFavorite = async (id: string) => {
    try {
      const currentFavorites = favorites.filter(fav => fav.id !== id);
      setFavorites(currentFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(currentFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        removeFavorite,
      }}
    >
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
