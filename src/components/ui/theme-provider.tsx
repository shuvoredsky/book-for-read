"use client";

import * as React from "react";

export type Theme = "dark" | "light" | "system";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  systemTheme: "dark" | "light" | undefined;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  systemTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("light");

  const getSystemTheme = React.useCallback((): "dark" | "light" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Initialize theme from localStorage on client mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
        setThemeState(stored);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [storageKey]);

  // Apply theme to document element
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const sys = getSystemTheme();
    const effective = theme === "system" ? (enableSystem ? sys : "light") : theme;

    setResolvedTheme(effective);

    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(effective);
    } else {
      root.setAttribute(attribute, effective);
    }
    root.style.colorScheme = effective;
  }, [theme, attribute, enableSystem, getSystemTheme]);

  // Listen for system theme changes if theme is "system"
  React.useEffect(() => {
    if (typeof window === "undefined" || !enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newSys = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(newSys);
      const root = document.documentElement;
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(newSys);
      } else {
        root.setAttribute(attribute, newSys);
      }
      root.style.colorScheme = newSys;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, attribute]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Ignore localStorage write errors
      }
      setThemeState(newTheme);
    },
    [storageKey]
  );

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme: getSystemTheme(),
      setTheme,
    }),
    [theme, resolvedTheme, getSystemTheme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

