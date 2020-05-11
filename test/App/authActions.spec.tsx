/* eslint-disable @typescript-eslint/ban-ts-ignore */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import superagent from 'superagent';
import authenticate, { logout } from '../../src/App/authActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('authActions', () => {
  it('authenticates', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result).toBe(true);
  });
  it('does not fetch if already authenticated', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result).toBe(true);
  });
  it('returns false when nothing is returned from Google', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    superagent.post = () => ({
      // @ts-ignore
      set: () => ({ send: async () => ({ body: undefined }) }),
    });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result).toBe(false);
  });
  it('returns false when fetch error', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    superagent.post = () => ({
      // @ts-ignore
      set: () => ({ send: () => Promise.reject(new Error('bad')) }),
    });
    await expect(store.dispatch(authenticate({ code: 'someCode' }))).rejects.toThrow('bad');
  });
  it('logs out the user', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    const result = await store.dispatch(logout());
    expect(result.type).toBe('LOGOUT');
  });
});
