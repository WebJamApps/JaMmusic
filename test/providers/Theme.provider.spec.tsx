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
    let ctx: { theme: string, toggleTheme: () => void, setTheme: (t: any) => void } | null = null;
    function Probe() {
      ctx = useContext(ThemeContext);
      return null;
    }
    render(<ThemeProvider><Probe /></ThemeProvider>);
    if (!ctx) throw new Error('Probe did not capture context');
    const captured = ctx;
    expect(captured.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    act(() => { captured.toggleTheme(); });
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    act(() => { captured.setTheme('light'); });
    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('ThemeProvider falls back to default when stored value is invalid', () => {
    window.localStorage.setItem('theme', 'banana');
    let ctx: { theme: string } | null = null;
    function Probe() {
      ctx = useContext(ThemeContext);
      return null;
    }
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(ctx && ctx.theme).toBe('light');
  });
});
