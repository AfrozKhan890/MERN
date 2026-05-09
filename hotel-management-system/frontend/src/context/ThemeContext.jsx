// frontend/src/context/ThemeContext.jsx - ENHANCED DARK/LIGHT THEME
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference as fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = darkMode ? 'dark' : 'light';
    
    // Set theme on both documentElement and body for maximum compatibility
    root.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', darkMode ? '#0B1D3A' : '#ffffff');
    }
    
    // Add/remove dark mode class for additional styling
    document.body.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const setTheme = (isDark) => {
    setDarkMode(isDark);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};