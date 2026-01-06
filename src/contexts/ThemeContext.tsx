import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  borderStrong: string;
  cardBg: string;
  cardBgHover: string;
  cardBgDark: string;
  inputBg: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeConfig = {
  dark: {
    background: '#0a0a0f',
    text: '#E4E4E7',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    textMuted: '#52525b',
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.04)',
    borderStrong: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.02)',
    cardBgHover: 'rgba(255,255,255,0.025)',
    cardBgDark: 'rgba(0,0,0,0.2)',
    inputBg: 'rgba(255,255,255,0.03)',
  },
  light: {
    background: '#ffffff',
    text: '#18181b',
    textSecondary: '#52525b',
    textTertiary: '#71717A',
    textMuted: '#A1A1AA',
    border: 'rgba(0,0,0,0.08)',
    borderLight: 'rgba(0,0,0,0.04)',
    borderStrong: 'rgba(0,0,0,0.12)',
    cardBg: 'rgba(0,0,0,0.02)',
    cardBgHover: 'rgba(0,0,0,0.04)',
    cardBgDark: 'rgba(0,0,0,0.05)',
    inputBg: 'rgba(0,0,0,0.03)',
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage synchronously to prevent flickering
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme');
      // Default to dark mode if no preference stored
      return stored === null ? true : stored === 'dark';
    } catch {
      return true; // Default to dark mode if localStorage fails
    }
  });

  // Persist theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? themeConfig.dark : themeConfig.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
