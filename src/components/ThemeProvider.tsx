'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'technology' | 'light' | 'dark' | 'hacker' | 'cyberpunk';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('technology');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.body.className = `theme-${savedTheme}`;
    } else {
      document.body.className = 'theme-technology';
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    // Remove all theme classes and add the new one
    document.body.classList.remove('theme-technology', 'theme-light', 'theme-dark', 'theme-hacker', 'theme-cyberpunk');
    document.body.classList.add(`theme-${newTheme}`);
  };

  if (!mounted) {
    // Prevent hydration mismatch by rendering invisible content or fallback
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
