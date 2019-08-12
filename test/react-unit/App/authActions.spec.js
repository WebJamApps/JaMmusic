import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import request from '../../__mocks__/superagent';// eslint-disable-line no-unused-vars
import authenticate, { logout } from '../../../src/App/authActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('authActions', () => {
  it('authenticates', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result.type).toBe('GOT_TOKEN');
  });
  it('does not fetch if already authenticated', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result).toBe(true);
  });
  it('returns error when nothing is returned from Google', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    request.setMockResponse({ });
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result.type).toBe('AUTH_ERROR');
  });
  it('returns a fetch error', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    request.setMockError(new Error('bad'));
    const result = await store.dispatch(authenticate({ code: 'someCode' }));
    expect(result.type).toBe('AUTH_ERROR');
  });
  it('logs out the user', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    const result = await store.dispatch(logout());
    expect(result.type).toBe('LOGOUT');
  });
});
