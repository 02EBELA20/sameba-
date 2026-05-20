import React, { createContext, useContext } from 'react';

type ReadingModeContextType = {
  readingMode: boolean;
  isReadingMode: boolean;
  toggleReadingMode: () => void;
  setReadingMode: (value: boolean) => void;
};

const ReadingModeContext = createContext<ReadingModeContextType>({
  readingMode: false,
  isReadingMode: false,
  toggleReadingMode: () => {},
  setReadingMode: () => {},
});

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReadingModeContext.Provider
      value={{
        readingMode: false,
        isReadingMode: false,
        toggleReadingMode: () => {},
        setReadingMode: () => {},
      }}
    >
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (!context) {
    throw new Error('useReadingMode must be used within a ReadingModeProvider');
  }
  return context;
}
