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
  borderExtra: string;
  cardBg: string;
  cardBgHover: string;
  cardBgDark: string;
  inputBg: string;
  // Modal specific
  modalBg: string;
  modalOverlay: string;
  // Additional surfaces
  surfaceElevated: string;
  // Input states
  inputBorder: string;
  inputFocusBg: string;
  // Interactive states
  rowHoverBg: string;
  deleteButtonColor: string;
  deleteButtonHoverBg: string;
  // Scrollbar
  scrollbarTrack: string;
  scrollbarThumb: string;
  // Placeholder
  placeholder: string;
  // Accent colors (light mode variants)
  accentInputs: string;
  accentOutcomes: string;
  accentCalculations: string;
  accentConstraints: string;
  accentObjectives: string;
  accentSuccess: string;
  accentError: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  // Overlay backgrounds
  overlayBg: string;
  overlayBgStrong: string;
  // Sidebar backgrounds
  sidebarBg: string;
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
    borderExtra: 'rgba(255,255,255,0.12)',
    cardBg: 'rgba(255,255,255,0.02)',
    cardBgHover: 'rgba(255,255,255,0.025)',
    cardBgDark: 'rgba(0,0,0,0.2)',
    inputBg: 'rgba(255,255,255,0.03)',
    // Modal specific
    modalBg: '#0f0f14',
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    // Additional surfaces
    surfaceElevated: '#1a1a22',
    // Input states
    inputBorder: 'rgba(255,255,255,0.08)',
    inputFocusBg: 'rgba(45,212,191,0.05)',
    // Interactive states
    rowHoverBg: 'rgba(255,255,255,0.015)',
    deleteButtonColor: '#52525b',
    deleteButtonHoverBg: 'rgba(239,68,68,0.1)',
    // Scrollbar
    scrollbarTrack: 'rgba(255,255,255,0.02)',
    scrollbarThumb: 'rgba(255,255,255,0.1)',
    // Placeholder
    placeholder: '#52525b',
    // Accent colors (same as dark mode - bright colors)
    accentInputs: '#2DD4BF',
    accentOutcomes: '#F472B6',
    accentCalculations: '#A78BFA',
    accentConstraints: '#FB923C',
    accentObjectives: '#60A5FA',
    accentSuccess: '#22C55E',
    accentError: '#EF4444',
    // Shadows
    shadowSm: '0 1px 2px 0 rgba(0,0,0,0.4)',
    shadowMd: '0 4px 6px -1px rgba(0,0,0,0.5)',
    shadowLg: '0 10px 15px -3px rgba(0,0,0,0.6)',
    shadowXl: '0 20px 25px -5px rgba(0,0,0,0.7)',
    // Overlay backgrounds
    overlayBg: 'rgba(10, 10, 15, 0.9)',
    overlayBgStrong: 'rgba(10, 10, 15, 0.98)',
    // Sidebar backgrounds
    sidebarBg: 'rgba(0,0,0,0.15)',
  },
  light: {
    background: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderStrong: '#cbd5e1',
    borderExtra: '#94a3b8',
    cardBg: '#ffffff',
    cardBgHover: '#f8fafc',
    cardBgDark: 'rgba(0,0,0,0.06)',
    inputBg: '#f1f5f9',
    // Modal specific
    modalBg: '#ffffff',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    // Additional surfaces
    surfaceElevated: '#ffffff',
    // Input states
    inputBorder: '#cbd5e1',
    inputFocusBg: '#f0f9ff',
    // Interactive states
    rowHoverBg: 'rgba(100,116,139,0.08)',
    deleteButtonColor: '#64748b',
    deleteButtonHoverBg: 'rgba(220,38,38,0.12)',
    // Scrollbar
    scrollbarTrack: 'rgba(0,0,0,0.06)',
    scrollbarThumb: 'rgba(0,0,0,0.20)',
    // Placeholder
    placeholder: '#cbd5e1',
    // Accent colors (darker, more saturated for light mode)
    accentInputs: '#0f766e',
    accentOutcomes: '#be185d',
    accentCalculations: '#6d28d9',
    accentConstraints: '#c2410c',
    accentObjectives: '#1d4ed8',
    accentSuccess: '#15803d',
    accentError: '#b91c1c',
    // Shadows
    shadowSm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    shadowXl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    // Overlay backgrounds
    overlayBg: 'rgba(255, 255, 255, 0.92)',
    overlayBgStrong: 'rgba(255, 255, 255, 0.98)',
    // Sidebar backgrounds
    sidebarBg: '#f8fafc',
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
