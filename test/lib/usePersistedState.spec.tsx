import { render } from '@testing-library/react';
import { useEffect } from 'react';
import {
  setInitValue, handleValueChange, handleNameChange, usePersistedState,
} from 'src/lib/usePersistedState';

describe('usePersistedState', () => {
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
  beforeEach(() => { store = {}; });

  it('setInitValue uses storedValue when present', () => {
    window.localStorage.setItem('k', 'stored');
    const setValue = jest.fn();
    setInitValue('k', setValue, 'def');
    expect(setValue).toHaveBeenCalledWith('stored');
  });
  it('setInitValue writes default when missing', () => {
    const setValue = jest.fn();
    setInitValue('k', setValue, 'def');
    expect(window.localStorage.getItem('k')).toBe('def');
  });
  it('setInitValue catches errors and falls back to default', () => {
    const broken = window.localStorage.setItem;
    window.localStorage.setItem = jest.fn(() => { throw new Error('nope'); });
    const setValue = jest.fn();
    setInitValue('k', setValue, 'def');
    expect(setValue).toHaveBeenCalledWith('def');
    window.localStorage.setItem = broken;
  });
  it('handleValueChange returns value on success', () => {
    expect(handleValueChange('k', 'v')).toBe('v');
    expect(window.localStorage.getItem('k')).toBe('v');
  });
  it('handleValueChange returns the error message on failure', () => {
    const broken = window.localStorage.setItem;
    window.localStorage.setItem = jest.fn(() => { throw new Error('boom'); });
    expect(handleValueChange('k', 'v')).toBe('boom');
    window.localStorage.setItem = broken;
  });
  it('handleNameChange returns the new name when name changed', () => {
    expect(handleNameChange({ current: 'old' }, 'new', 'v')).toBe('new');
  });
  it('handleNameChange returns empty string when name did not change', () => {
    expect(handleNameChange({ current: 'k' }, 'k', 'v')).toBe('');
  });
  it('handleNameChange catches errors and returns the message', () => {
    const broken = window.localStorage.setItem;
    window.localStorage.setItem = jest.fn(() => { throw new Error('fail'); });
    expect(handleNameChange({ current: 'old' }, 'new', 'v')).toBe('fail');
    window.localStorage.setItem = broken;
  });

  it('usePersistedState reads existing value and writes updates', () => {
    window.localStorage.setItem('theme', 'dark');
    let captured: [string, (v: string) => void] | null = null;
    function Probe() {
      const [value, setValue] = usePersistedState('theme', 'light');
      captured = [value, setValue];
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => { setValue('dark'); }, []);
      return null;
    }
    render(<Probe />);
    expect(captured && captured[0]).toBe('dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });
});
