import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    isDarkMode,
    bg: isDarkMode ? "#0d1117" : "#f4fdf7",
    sidebarBg: isDarkMode ? "#161b22" : "#ffffff",
    cardBg: isDarkMode ? "#21262d" : "#ffffff",
    text: isDarkMode ? "#f0f6fc" : "#1a2e22",
    muted: isDarkMode ? "#9ca3af" : "#6b7280",
    accent: isDarkMode ? "info" : "success",
    accentHex: isDarkMode ? "#0dcaf0" : "#28b565",
    border: isDarkMode ? "#30363d" : "#c8e6d0"
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ESTA LÍNEA ES LA QUE TE DA EL ERROR SI FALTA:
export const useTheme = () => useContext(ThemeContext);