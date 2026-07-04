import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();
const STORAGE_KEY = "madar_theme";

function resolve(preference) {
  if (preference === "dark" || preference === "light") return preference;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function applyToDocument(resolved) {
  const root = document.documentElement;
  root.classList.add(resolved);
  root.classList.remove(resolved === "dark" ? "light" : "dark");
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "dark" || stored === "light" || stored === "system" ? stored : "light";
    } catch {
      return "light";
    }
  });
  const [theme, setResolvedTheme] = useState(() => resolve(preference));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* private-mode etc. */
    }
    const resolved = resolve(preference);
    setResolvedTheme(resolved);
    applyToDocument(resolved);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system" || typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = resolve("system");
      setResolvedTheme(resolved);
      applyToDocument(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setPreference = useCallback((next) => {
    setPreferenceState(next === "dark" || next === "light" || next === "system" ? next : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => (resolve(prev) === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);