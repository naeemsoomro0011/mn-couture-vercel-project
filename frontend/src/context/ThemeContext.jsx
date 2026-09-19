import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const MOBILE_BREAKPOINT = 768;

// Desktop/laptop opens in dark (matte) by default; mobile opens in light
// (soft matte white) by default — exactly the inverse rule from the brief.
const getDefaultTheme = () => {
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  return isMobile ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mn-couture-theme');
    return saved || getDefaultTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mn-couture-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
