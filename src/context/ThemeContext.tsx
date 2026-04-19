import React, { createContext, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: themeMode === 'dark',
        themeMode,
        toggleTheme,
        setThemeMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}
