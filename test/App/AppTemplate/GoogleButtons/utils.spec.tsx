import { vi } from 'vitest';
import utils from 'src/App/AppTemplate/GoogleButtons/utils';
import jwt from 'jwt-simple';
import commonUtils from 'src/lib/utils';

describe('GoogleButtons/utils', () => {

  it('responseGoogleLogout', async () => {
    window.location.reload = vi.fn();
    const setAuth = vi.fn();
    await utils.responseGoogleLogout(setAuth);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('makeState', () => {
    const state = utils.makeState();
    const result = state();
    expect(typeof result).toBe('string');
  });
  it('setUserAuth', async () => {
    const setAuth = vi.fn();
    const token = 'dime';
    const userId = 'user';

    await utils.setUserAuth(token, userId, setAuth, 'setAuth');

    expect(setAuth).toHaveBeenCalled();
  });
  it('setUser', async () => {
    const auth = {
      isAuthenticated: false, token: 's', error: 'err', user: { userType: 'e', email: 'goo@hotmail.com' },
    };
    const setAuth = vi.fn();
    const token = jwt.encode({ sub: 'some' }, 'secret');

    await utils.setUser(auth, setAuth, token);
    expect(setAuth).toHaveBeenCalled();
  });
  it('responseGoogleLogin', async () => {
    const setAuth = vi.fn();
    vi.spyOn(commonUtils, 'notify').mockImplementation(() => { });
    Object.defineProperty(window, 'location', {
      value: { href: 'https://localhost:8888', assign: vi.fn(), reload: vi.fn() }, writable: true, configurable: true,
    });
    await utils.responseGoogleLogin({ code: '' } as any, {} as any, setAuth);
    expect(setAuth).toHaveBeenCalled();
  });
  it('responseGoogleLogin fails', async () => {
    let err = '';
    vi.spyOn(commonUtils, 'notify').mockImplementation((m) => { err = m; });
    await utils.responseGoogleLogin({ code: '' } as any, {} as any, vi.fn());
    expect(err).toBe('Failed to authenticate');
  });
  it('responseGoogleLogin succeeds when production', async () => {
    const setAuth = vi.fn();
    vi.spyOn(commonUtils, 'notify').mockImplementation(() => { });
    Object.defineProperty(window, 'location', {
      value: { href: 'https://web-jam.com', assign: vi.fn(), reload: vi.fn() }, writable: true, configurable: true,
    });
    await utils.responseGoogleLogin({ code: '' } as any, {} as any, setAuth);
    expect(setAuth).toHaveBeenCalled();
  });
});
