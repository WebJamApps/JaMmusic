import { render, act } from '@testing-library/react';
import { useContext } from 'react';
import {
  ThemeProvider, ThemeContext, applyThemeAttribute, isTheme, defaultThemeContext,
  THEME_STORAGE_KEY, DEFAULT_THEME,
} from 'src/providers/Theme.provider';

describe('Theme.provider', () => {
  let ls: Storage, store = {} as Record<string, unknown>;
  beforeAll(() => {
    ls = window.localStorage;
    const localStorageMock = {
      getItem(key: string) {
        // eslint-disable-next-line security/detect-object-injection
        return store[key] as string | null;
      },
      setItem(key: string, value: string) { store[key] = value; },
      clear() { store = {}; },
      removeItem(key: string) { delete store[key]; },
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: ls });
  });
  beforeEach(() => {
    store = {};
    document.documentElement.removeAttribute('data-theme');
  });

  it('exports the storage key and default', () => {
    expect(THEME_STORAGE_KEY).toBe('theme');
    expect(DEFAULT_THEME).toBe('light');
  });
  it('isTheme accepts only valid values', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('blue')).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });
  it('default context functions are no-ops', () => {
    expect(defaultThemeContext.theme).toBe('light');
    expect(defaultThemeContext.setTheme('dark')).toBeUndefined();
    expect(defaultThemeContext.toggleTheme()).toBeUndefined();
  });
  it('applyThemeAttribute sets data-theme on the document root', () => {
    applyThemeAttribute('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    applyThemeAttribute('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('ThemeProvider defaults to light, persists toggle, and updates data-theme', () => {
    type Ctx = { theme: string, toggleTheme: () => void, setTheme: (t: any) => void };
    const captured: { current: Ctx | null } = { current: null };
    function Probe() {
      captured.current = useContext(ThemeContext);
      return null;
    }
    render(<ThemeProvider><Probe /></ThemeProvider>);
    const ctx = captured.current;
    if (!ctx) throw new Error('Probe did not capture context');
    expect(ctx.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    act(() => { ctx.toggleTheme(); });
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    act(() => { ctx.setTheme('light'); });
    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('ThemeProvider falls back to default when stored value is invalid', () => {
    window.localStorage.setItem('theme', 'banana');
    const captured: { current: { theme: string } | null } = { current: null };
    function Probe() {
      captured.current = useContext(ThemeContext);
      return null;
    }
    render(<ThemeProvider><Probe /></ThemeProvider>);
    const ctx = captured.current;
    if (!ctx) throw new Error('Probe did not capture context');
    expect(ctx.theme).toBe('light');
  });
});
