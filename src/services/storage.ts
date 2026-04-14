import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorite_verses';

export async function getFavorites(): Promise<number[]> {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

export async function toggleFavorite(id: number): Promise<number[]> {
  try {
    const favorites = await getFavorites();
    const index = favorites.indexOf(id);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
}
