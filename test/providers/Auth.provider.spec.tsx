import { render } from '@testing-library/react';

import {
  Iauth, defaultSetAuth, AuthProvider, setInitValue, handleValueChange, handleNameChange, configAuth,
} from 'src/providers/Auth.provider';

describe('AuthProvider', () => {
  let ls:any;
  beforeAll(() => {
    ls = window.localStorage;
    const localStorageMock = (function () {
      let store = {} as Record<string, unknown>;

      return {
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
    }());

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { value: ls });
  });
  it('AuthProvider renders', () => {
    render(<AuthProvider />);
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
    const setItem = jest.fn(() => { throw new Error('failed'); });
    expect(handleValueChange(setItem, 'current', 'value')).toBe('failed');
  });
  it('handleNameChange when name has changed', () => {
    const setItem = jest.fn();
    const removeItem = jest.fn();
    expect(handleNameChange(setItem, removeItem, { current: '' }, 'name', 'value')).toBe('name');
  });
  it('handleNameChange catches error when name has changed', () => {
    const setItem = jest.fn(() => { throw new Error('failed'); });
    const removeItem = jest.fn();
    expect(handleNameChange(setItem, removeItem, { current: '' }, 'name', 'value')).toBe('failed');
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
});
