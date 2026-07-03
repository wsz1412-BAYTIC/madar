import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'madar_theme';

// Resolve a preference ('dark' | 'light' | 'system') to the concrete theme.
function resolve(preference) {
  if (preference === 'dark' || preference === 'light') return preference;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

function applyToDocument(resolved) {
  const root = document.documentElement;
  root.classList.add(resolved);
  root.classList.remove(resolved === 'dark' ? 'light' : 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }) {
  // preference is what the user chose (dark | light | system); new users
  // default to following their system. The stored legacy values 'dark'/'light'
  // keep working unchanged.
  const [preference, setPreferenceState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system';
    } catch {
      return 'system';
    }
  });
  const [theme, setResolvedTheme] = useState(() => resolve(preference));

  // Apply + persist whenever the preference changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* private-mode etc. — theme still works for the session */
    }
    const resolved = resolve(preference);
    setResolvedTheme(resolved);
    applyToDocument(resolved);
  }, [preference]);

  // While following the system, track live OS theme changes.
  useEffect(() => {
    if (preference !== 'system' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const resolved = resolve('system');
      setResolvedTheme(resolved);
      applyToDocument(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setPreference = useCallback((next) => {
    setPreferenceState(next === 'dark' || next === 'light' || next === 'system' ? next : 'system');
  }, []);

  // Back-compat: existing callers toggle between explicit dark and light.
  const toggleTheme = useCallback(() => {
    setPreferenceState((prev) => (resolve(prev) === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
