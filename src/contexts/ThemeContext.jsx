import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = ["default", "dither", "alternative", "vintage"];

const ThemeContext = createContext({ theme: "default", setTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("visual-theme") || "default"
  );

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem("visual-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Dark/light class is always controlled by the user's toggle — no forced overrides
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
