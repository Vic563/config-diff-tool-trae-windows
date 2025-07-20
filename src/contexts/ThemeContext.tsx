import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#1976d2',
    secondary: '#dc004e',
    text: '#000000',
    textSecondary: '#666666',
    added: '#0a5f0a',
    addedBg: '#c3e6c3',
    removed: '#8b0000',
    removedBg: '#ffcccc',
    unchanged: '#666666',
    unchangedBg: '#ffffff',
    modified: '#FF6F00',
    modifiedBg: '#FFF3E0',
    border: '#e0e0e0',
    error: '#d32f2f',
    errorBg: '#ffebee'
  }
};

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#121212',
    surface: '#1e1e1e',
    primary: '#90caf9',
    secondary: '#f48fb1',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    added: '#4caf50',
    addedBg: '#1b5e20',
    removed: '#f44336',
    removedBg: '#5d1f1f',
    unchanged: '#b3b3b3',
    unchangedBg: '#1e1e1e',
    modified: '#FFA726',
    modifiedBg: '#3E2723',
    border: '#333333',
    error: '#ef5350',
    errorBg: '#311b1b'
  }
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? darkTheme : lightTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme.name);
    document.documentElement.style.setProperty('--bg-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme.name === 'light' ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};