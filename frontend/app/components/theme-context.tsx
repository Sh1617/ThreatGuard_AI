"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ dark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark((d) => !d);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div
        style={{
          minHeight: "100vh",
          background: dark ? "#080c10" : "#f0f2f5",
          color: dark ? "#e2e8f0" : "#1a202c",
          transition: "background 0.3s ease, color 0.3s ease",
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);