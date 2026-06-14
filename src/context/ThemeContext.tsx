/**
 * Theme Context and Provider
 * Manages global state for dark/light mode toggle
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark';

/**
 * Theme context type
 */
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error('Error toggling theme:', error);
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
