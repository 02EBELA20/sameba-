import React, { createContext, useContext } from 'react';
import { DEFAULT_THEME_COLORS, type AppThemeColors } from '../constants/theme';

type ThemeContextValue = {
  colors: AppThemeColors;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: DEFAULT_THEME_COLORS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors: DEFAULT_THEME_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
