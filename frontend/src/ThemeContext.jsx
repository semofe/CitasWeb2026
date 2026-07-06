import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    isDarkMode,
    bg: isDarkMode ? "#0d1117" : "#f8f9fa",
    sidebarBg: isDarkMode ? "#161b22" : "#ffffff",
    cardBg: isDarkMode ? "#21262d" : "#ffffff",
    text: isDarkMode ? "#f0f6fc" : "#212529",
    muted: isDarkMode ? "#9ca3af" : "#6b7280", 
    accent: isDarkMode ? "info" : "danger",
    accentHex: isDarkMode ? "#0dcaf0" : "#dc3545",
    border: isDarkMode ? "#30363d" : "#dee2e6"
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ESTA LÍNEA ES LA QUE TE DA EL ERROR SI FALTA:
export const useTheme = () => useContext(ThemeContext);