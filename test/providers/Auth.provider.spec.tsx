import { render } from '@testing-library/react';
import jwt from 'jwt-simple';

import {
  Iauth, defaultSetAuth, defaultAuth, AuthProvider,
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
  beforeEach(() => {
    store = {};
    window.localStorage.setItem = (key: string, value: string) => {
      store[key] = value;
    };
    window.localStorage.removeItem = (key: string) => {
      delete store[key];
    };
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

  describe('global 401 and auth:logout handling', () => {
    const now = () => Math.floor(Date.now() / 1000);

    it('resets auth when receiving an auth:logout window event', () => {
      window.localStorage.setItem('auth', JSON.stringify({
        token: 'xyz', error: '', isAuthenticated: true, user: { userType: 'admin', email: 'a@b.c' },
      }));
      const { unmount } = render(<AuthProvider><div data-testid="child" /></AuthProvider>);
      window.dispatchEvent(new CustomEvent('auth:logout'));
      expect(window.localStorage.getItem('auth')).toBeDefined();
      unmount();
    });

    it('setUserAuth resets to defaultAuth on 401 response with unexpired token', async () => {
      const token = jwt.encode({ sub: 'user123', iat: now(), exp: now() + 86400 }, 'secret');
      const setAuthType = jest.fn();
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));

      const { setUserAuth } = await import('src/providers/Auth.provider');
      await setUserAuth(token, 'user123', setAuthType, 'setAuth');

      expect(setAuthType).toHaveBeenCalledWith(defaultAuth);
    });

    it('setUserAuth sets auth when response is 200 OK', async () => {
      const token = jwt.encode({ sub: 'user123', iat: now(), exp: now() + 86400 }, 'secret');
      const setAuthType = jest.fn();
      const userData = { email: 'test@example.com', userType: 'JaM-admin' };
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(userData), { status: 200 }));

      const { setUserAuth } = await import('src/providers/Auth.provider');
      await setUserAuth(token, 'user123', setAuthType, 'setAuth');

      expect(setAuthType).toHaveBeenCalledWith({
        error: '',
        isAuthenticated: true,
        token: token,
        user: userData,
      });
    });

    it('setUserAuth sets auth string when type is setAuthString', async () => {
      const token = jwt.encode({ sub: 'user123', iat: now(), exp: now() + 86400 }, 'secret');
      const setAuthType = jest.fn();
      const userData = { email: 'test@example.com', userType: 'JaM-admin' };
      global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(userData), { status: 200 }));

      const { setUserAuth } = await import('src/providers/Auth.provider');
      await setUserAuth(token, 'user123', setAuthType, 'setAuthString');

      expect(setAuthType).toHaveBeenCalledWith(JSON.stringify({
        error: '',
        isAuthenticated: true,
        token: token,
        user: userData,
      }));
    });
  });
});
