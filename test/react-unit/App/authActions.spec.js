import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import request from '../../__mocks__/superagent';
import authenticate, { logout } from '../../../src/App/authActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('authActions', () => {
  it('does nothing', (done) => {
    done();
  });
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
    request.setMockResponse({ });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result).toBe(false);
  });
  it('returns false when fetch error', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    request.post = jest.fn(() => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }));
    try { await store.dispatch(authenticate({ code: 'someCode' })); } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
  it('logs out the user', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    const result = await store.dispatch(logout());
    expect(result.type).toBe('LOGOUT');
  });
});
