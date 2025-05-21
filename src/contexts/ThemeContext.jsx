import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === THEMES.LIGHT || storedTheme === THEMES.DARK) {
      return storedTheme;
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }
    
    return THEMES.LIGHT;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
