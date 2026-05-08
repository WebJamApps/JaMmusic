import {
  createContext, useEffect, useMemo,
} from 'react';
import { usePersistedState } from 'src/lib/usePersistedState';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const DEFAULT_THEME: Theme = 'light';

export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

export const applyThemeAttribute = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

interface IthemeContext {
  theme: Theme,
  setTheme: (t: Theme) => void,
  toggleTheme: () => void,
}

export const defaultThemeContext: IthemeContext = {
  theme: DEFAULT_THEME,
  setTheme: () => { /* no-op */ },
  toggleTheme: () => { /* no-op */ },
};

export const ThemeContext = createContext<IthemeContext>(defaultThemeContext);

export function ThemeProvider({ children }: { children?: React.ReactNode }): JSX.Element {
  const [stored, setStored] = usePersistedState(THEME_STORAGE_KEY, DEFAULT_THEME);
  const theme: Theme = isTheme(stored) ? stored : DEFAULT_THEME;

  useEffect(() => { applyThemeAttribute(theme); }, [theme]);

  const value = useMemo<IthemeContext>(() => ({
    theme,
    setTheme: (t: Theme) => { setStored(t); },
    toggleTheme: () => { setStored(theme === 'dark' ? 'light' : 'dark'); },
  }), [theme, setStored]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
