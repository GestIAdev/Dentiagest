/**
 * 🎨 THEME CONTEXT & PROVIDER
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * FEATURES:
 * - Theme switching (Classic, Dark, Cyberpunk Medical)
 * - LocalStorage persistence
 * - Smooth transitions
 * - CSS variables injection
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType, Theme, getTheme, DEFAULT_THEME } from './themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeId: ThemeType;
  setTheme: (themeId: ThemeType) => void;
  availableThemes: ThemeType[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dentiagest-theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load theme from localStorage or use default
  const [themeId, setThemeId] = useState<ThemeType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ThemeType) || DEFAULT_THEME;
  });

  const currentTheme = getTheme(themeId);

  // Update theme and persist to localStorage
  const setTheme = (newThemeId: ThemeType) => {
    setThemeId(newThemeId);
    localStorage.setItem(STORAGE_KEY, newThemeId);
  };

  // Inject CSS variables into document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Primary colors
    Object.entries(currentTheme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    // Secondary colors
    Object.entries(currentTheme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    // Status colors
    ['success', 'warning', 'error', 'info'].forEach((status) => {
      const colors = currentTheme.colors[status as keyof typeof currentTheme.colors];
      if (typeof colors === 'object' && 'main' in colors) {
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${status}-${key}`, value);
        });
      }
    });
    
    // Background colors
    Object.entries(currentTheme.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });
    
    // Text colors
    Object.entries(currentTheme.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });
    
    // Border colors
    Object.entries(currentTheme.colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--border-${key}`, value);
    });
    
    // Shadows
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Border radius
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Fonts
    root.style.setProperty('--font-primary', currentTheme.fonts.primary.join(', '));
    root.style.setProperty('--font-mono', currentTheme.fonts.mono.join(', '));
    
    // Add theme class to body for conditional styling
    document.body.className = `theme-${themeId}`;
    
  }, [currentTheme, themeId]);

  const availableThemes: ThemeType[] = ['classic', 'dark', 'cyberpunk-medical'];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeId,
        setTheme,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
