import utils from 'src/App/AppTemplate/GoogleButtons/utils';
import superagent from 'superagent';
import jwt from 'jwt-simple';
import commonUtils from 'src/lib/utils';

jest.mock('superagent');

describe('GoogleButtons/utils', () => {
  it('responseGoogleLogout', async () => {
    window.location.reload = jest.fn();
    const setAuth = jest.fn();
    await utils.responseGoogleLogout(setAuth);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('makeState', () => {
    const state = utils.makeState();
    const result = state();
    expect(typeof result).toBe('string');
  });
  it('setUserAuth', async () => {
    const setAuth = jest.fn();
    const token = 'dime';
    const userId = 'user';
    const mockGet = jest.fn().mockResolvedValueOnce({});
    (superagent.get as jest.Mock).mockReturnValueOnce({ set: jest.fn().mockReturnValueOnce({ set: mockGet }) });
    await utils.setUserAuth(token, userId, setAuth, 'setAuth');
    expect(setAuth).toHaveBeenCalled();
  });
  it('setUser', async () => {
    const auth = {
      isAuthenticated: false, token: 's', error: 'err', user: { userType: 'e', email: 'goo@hotmail.com' },
    };
    const setAuth = jest.fn();
    const token = 'nickel';
    const sub: any = 'some';
    jest.spyOn(jwt, 'decode').mockReturnValue({ sub });
    const mockPost = jest.fn().mockResolvedValueOnce({});
    const setUserAuth = (superagent.get as jest.Mock).mockReturnValueOnce({ set: jest.fn().mockReturnValueOnce({ set: mockPost }) });
    await utils.setUser(auth, setAuth, token);
    expect(setUserAuth).toHaveBeenCalled();
  });
  it('responseGoogleLogin', async () => {
    const setAuth = jest.fn();
    const getMock: any = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ body: {} }) }) }));
    superagent.get = getMock;
    jwt.decode = jest.fn(() => ({ sub: '1' }));
    const href = 'https://localhost:8888';
    const reload = jest.fn();
    Object.defineProperty(window, 'location', { value: { href, assign: () => { }, reload }, writable: true });
    const postMock: any = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ body: { token: 'token' } }) }) }));
    superagent.post = postMock;
    await utils.responseGoogleLogin({ code: '' } as any, {} as any, setAuth);
    expect(setAuth).toHaveBeenCalled();
  });
  it('responseGoogleLogin fails', async () => {
    let err = '';
    commonUtils.notify = jest.fn((m) => { err = m; });
    await utils.responseGoogleLogin({ code: '' } as any, {} as any, jest.fn());
    expect(err).toBe('Failed to authenticate');
  });
  it('responseGoogleLogin succeeds when production', async () => {
    const setAuth = jest.fn();
    const getMock: any = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ body: {} }) }) }));
    superagent.get = getMock;
    jwt.decode = jest.fn(() => ({ sub: '1' }));
    const href = 'https://web-jam.com';
    const reload = jest.fn();
    Object.defineProperty(window, 'location', { value: { href, assign: () => { }, reload }, writable: true });
    const postMock: any = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ body: { token: 'token' } }) }) }));
    superagent.post = postMock;
    await utils.responseGoogleLogin({ code: '' } as any, {} as any, setAuth);
    expect(setAuth).toHaveBeenCalled();
  });
});
