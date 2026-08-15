import { vi } from 'vitest';
import fetchUtils, { customFetch, handle401 } from 'src/lib/fetch.utils';
import { defaultAuth } from 'src/providers/Auth.provider';

describe('fetch.utils', () => {
  let ls: Storage;
  let store: Record<string, string> = {};

  beforeAll(() => {
    ls = window.localStorage;
    const localStorageMock = {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      clear() {
        store = {};
      },
      removeItem(key: string) {
        delete store[key];
      },
      getAll() {
        return store;
      },
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true, writable: true });
  });

  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: ls, configurable: true, writable: true });
  });

  beforeEach(() => {
    store = {};
    window.location.assign = vi.fn();
    Object.defineProperty(window.location, 'pathname', { value: '/admin/venues', configurable: true, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handle401', () => {
    it('clears persisted auth, dispatches auth:logout, and redirects when pathname is not /', () => {
      window.localStorage.setItem('auth', JSON.stringify({ isAuthenticated: true, token: 'abc' }));
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      handle401();

      expect(window.localStorage.getItem('auth')).toBe(JSON.stringify(defaultAuth));
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });

    it('does not redirect if pathname is already /', () => {
      Object.defineProperty(window.location, 'pathname', { value: '/', configurable: true, writable: true });
      handle401();
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('does not redirect if redirect argument is false', () => {
      handle401(false);
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('handles localStorage errors gracefully without throwing', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = vi.fn(() => {
        throw new Error('quota exceeded');
      });

      expect(() => handle401()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('quota exceeded');
      window.localStorage.setItem = originalSetItem;
    });

    it('handles missing window dispatchEvent or location gracefully', () => {
      const originalDispatch = window.dispatchEvent;
      // @ts-expect-error test edge case
      delete window.dispatchEvent;

      expect(() => handle401()).not.toThrow();
      window.dispatchEvent = originalDispatch;
    });
  });

  describe('customFetch', () => {
    it('returns response and does not trigger handle401 on 200 OK', async () => {
      const okResponse = new Response(JSON.stringify({ ok: true }), { status: 200, statusText: 'OK' });
      global.fetch = vi.fn().mockResolvedValue(okResponse);
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const res = await customFetch('/api/test');

      expect(res.status).toBe(200);
      expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('calls handle401 on 401 Unauthorized response and returns response', async () => {
      const unauthorizedResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        statusText: 'Unauthorized',
      });
      global.fetch = vi.fn().mockResolvedValue(unauthorizedResponse);
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const res = await customFetch('/api/protected');

      expect(res.status).toBe(401);
      expect(window.localStorage.getItem('auth')).toBe(JSON.stringify(defaultAuth));
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });

    it.each([400, 403, 404, 500])('does not call handle401 on %i non-401 error response', async (status) => {
      const errResponse = new Response(JSON.stringify({ error: 'fail' }), {
        status,
        statusText: 'Error',
      });
      global.fetch = vi.fn().mockResolvedValue(errResponse);
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const res = await customFetch('/api/some-endpoint');

      expect(res.status).toBe(status);
      expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('does not catch network errors and leaves auth intact', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      await expect(customFetch('/api/network-fail')).rejects.toThrow('Failed to fetch');
      expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout' }));
      expect(window.location.assign).not.toHaveBeenCalled();
    });
  });

  it('default export provides handle401 and customFetch', () => {
    expect(typeof fetchUtils.handle401).toBe('function');
    expect(typeof fetchUtils.customFetch).toBe('function');
  });
});
