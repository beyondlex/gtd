import { createContext, useContext, type ReactNode } from "react";
import type { Theme } from "./types.js";
import { loadTheme } from "./load.js";

const theme = loadTheme();
const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}