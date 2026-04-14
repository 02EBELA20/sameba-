import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingModeContextType {
  readingMode: boolean;
  toggleReadingMode: () => void;
}

const ReadingModeContext = createContext<ReadingModeContextType | undefined>(undefined);

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    loadReadingMode();
  }, []);

  const loadReadingMode = async () => {
    try {
      const saved = await AsyncStorage.getItem('reading_mode');
      if (saved !== null) {
        setReadingMode(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading reading mode:', error);
    }
  };

  const toggleReadingMode = async () => {
    try {
      const newMode = !readingMode;
      setReadingMode(newMode);
      await AsyncStorage.setItem('reading_mode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving reading mode:', error);
    }
  };

  return (
    <ReadingModeContext.Provider value={{ readingMode, toggleReadingMode }}>
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (context === undefined) {
    throw new Error('useReadingMode must be used within a ReadingModeProvider');
  }
  return context;
}
