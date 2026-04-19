import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { getColors, type Theme } from '../constants/theme';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  const theme: Theme = context.themeMode === 'dark' ? 'dark' : 'light';

  return {
    isDarkMode: context.isDarkMode,
    toggleTheme: context.toggleTheme,
    colors: getColors(theme),
  };
}
