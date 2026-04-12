import React, { createContext, useContext, useState } from 'react';

// ─── Theme token shape ────────────────────────────────────────────────────────
export interface Theme {
  isDark: boolean;
  // Backgrounds
  bg: string;           // page / screen background
  surface: string;      // card / panel background
  surfaceAlt: string;   // secondary surface (e.g. even table rows)
  // Borders
  border: string;
  // Text
  text: string;
  textSub: string;
  textMuted: string;
  // Icon containers
  iconBg: string;
  // Navigation header (always dark, shifts shade)
  headerBg: string;
  // Accent — pink is unchanged in both modes
  accent: string;
}

// ─── Light theme ──────────────────────────────────────────────────────────────
export const lightTheme: Theme = {
  isDark: false,
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F7FA',
  border: '#ECECEC',
  text: '#1C1C1E',
  textSub: '#595959',
  textMuted: '#9E9E9E',
  iconBg: '#F2F2F7',
  headerBg: '#1C1C1E',
  accent: '#E91E63',
};

// ─── Dark theme ───────────────────────────────────────────────────────────────
export const darkTheme: Theme = {
  isDark: true,
  bg: '#0D0D0F',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  border: 'rgba(255,255,255,0.10)',
  text: '#FFFFFF',
  textSub: '#AEAEB2',
  textMuted: '#636366',
  iconBg: '#2C2C2E',
  headerBg: '#000000',
  accent: '#E91E63',
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  toggleTheme: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? darkTheme : lightTheme,
        toggleTheme: () => setIsDark(p => !p),
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeContext);
}
