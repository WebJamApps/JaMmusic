import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import request from '../../__mocks__/superagent';// eslint-disable-line no-unused-vars
import authenticate, { logout } from '../../../src/App/authActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('authActions', () => {
  it('authenticates', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    let result;
    try {
      result = await store.dispatch(authenticate({ code: 'someCode' }));
    } catch (e) { throw e; }
    expect(result.type).toBe('GOT_TOKEN');
  });
  it('does not fetch if already authenticated', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    let result;
    try { result = await store.dispatch(authenticate({ code: 'someCode' })); } catch (e) { throw e; }
    expect(result).toBe(true);
  });
  it('returns error when nothing is returned from Google', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    let result;
    request.setMockResponse({ });
    try { result = await store.dispatch(authenticate({ code: 'someCode' })); } catch (e) { throw e; }
    expect(result.type).toBe('AUTH_ERROR');
  });
  it('returns a fetch error', async () => {
    const store = mockStore({ auth: { isAuthenticated: false } });
    let result;
    request.setMockError(new Error('bad'));
    try { result = await store.dispatch(authenticate({ code: 'someCode' })); } catch (e) { throw e; }
    expect(result.type).toBe('AUTH_ERROR');
  });
  it('logs out the user', async () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    let result;
    try { result = await store.dispatch(logout()); } catch (e) { throw e; }
    expect(result.type).toBe('LOGOUT');
  });
});
