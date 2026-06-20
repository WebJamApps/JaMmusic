import { render } from '@testing-library/react';
import jwt from 'jwt-simple';

import {
  Iauth, defaultSetAuth, AuthProvider,
  configAuth, expiredAuthReset,
} from 'src/providers/Auth.provider';
import {
  setInitValue, handleValueChange, handleNameChange,
} from 'src/lib/usePersistedState';

describe('AuthProvider', () => {
  let ls:any, store = {} as Record<string, unknown>;
  beforeAll(() => {
    ls = window.localStorage;
    const localStorageMock = {
      getItem(key:string) {
        // eslint-disable-next-line security/detect-object-injection
        return store[key];
      },

      setItem(key:string, value:string) {
        store[key] = value;
      },

      clear() {
        store = {};
      },

      removeItem(key:string) {
        delete store[key];
      },

      getAll() {
        return store;
      },

    };

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: ls });
  });
  it('AuthProvider renders', () => {
    render(<AuthProvider><div /></AuthProvider>);
    const newRoot = document.getElementById('root') as HTMLElement;
    expect(newRoot.innerHTML.includes('play-buttons')).toBe(true);
  });
  it('setAuthDefault', () => {
    expect(defaultSetAuth({} as Iauth)).toBeUndefined();
  });
  it('setInitValue when storedValue', async () => {
    window.localStorage.setItem('name', 'stored');
    const setValue = jest.fn();
    setInitValue('name', setValue, 'default');
    expect(setValue).toHaveBeenCalledWith('stored');
  });
  it('setInitValue sets defaultValue', async () => {
    window.localStorage.clear();
    const setValue = jest.fn();
    setInitValue('name', setValue, 'default');
    expect(window.localStorage.getItem('name')).toBe('default');
  });
  it('setInitValue catches error', async () => {
    window.localStorage.clear();
    window.localStorage.setItem = jest.fn(() => { throw new Error('failed'); });
    const setValue = jest.fn();
    setInitValue('name', setValue, 'default');
    expect(setValue).toHaveBeenCalledWith('default');
  });
  it('handleValueChange handles localStorage errors', () => {
    window.localStorage.setItem = jest.fn(() => { throw new Error('failed'); });
    expect(handleValueChange('current', 'value')).toBe('failed');
  });
  it('handleNameChange when name has changed', () => {
    window.localStorage.setItem = jest.fn();
    window.localStorage.removeItem = jest.fn();
    expect(handleNameChange({ current: '' }, 'name', 'value')).toBe('name');
  });
  it('handleNameChange catches error when name has changed', () => {
    window.localStorage.setItem = jest.fn(() => { throw new Error('failed'); });
    window.localStorage.removeItem = jest.fn();
    expect(handleNameChange({ current: '' }, 'name', 'value')).toBe('failed');
  });
  it('configAuth catches error', () => {
    const setAuthString = jest.fn();
    const result = configAuth('908asdlj;?', setAuthString);
    expect(result.auth.isAuthenticated).toBe(false);
  });
  it('configAuth calls the setter', () => {
    const setAuthString = jest.fn();
    const result = configAuth(JSON.stringify({}), setAuthString);
    result.setAuth({} as any);
    expect(setAuthString).toHaveBeenCalled();
  });
  describe('expiredAuthReset (auto-logout decision)', () => {
    const now = () => Math.floor(Date.now() / 1000);
    it('resets to logged-out when the token is expired', () => {
      const token = jwt.encode({ sub: 'u', iat: now() - 200, exp: now() - 100 }, 'secret');
      const reset = expiredAuthReset(JSON.stringify({ token, isAuthenticated: true }));
      expect(reset).not.toBeNull();
      expect(JSON.parse(reset as string).isAuthenticated).toBe(false);
    });
    it('returns null for a still-valid token', () => {
      const token = jwt.encode({ sub: 'u', iat: now(), exp: now() + 24 * 60 * 60 }, 'secret');
      expect(expiredAuthReset(JSON.stringify({ token, isAuthenticated: true }))).toBeNull();
    });
    it('returns null when there is no token or the value is garbage', () => {
      expect(expiredAuthReset(JSON.stringify({ token: '' }))).toBeNull();
      expect(expiredAuthReset('not-json')).toBeNull();
    });
  });
});
