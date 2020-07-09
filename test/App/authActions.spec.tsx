import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import superagent from 'superagent';
import authenticate from '../../src/App/authActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('authActions', () => {
  it('authenticates', async () => {
    const sa: any = superagent;
    sa.post = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ body: '123' }) }) }));
    const props: any = { auth: {}, dispatch: jest.fn() };
    const gBody: any = { code: 'someCode' };
    const result = await authenticate(gBody, props);
    expect(result).toBe('authenticated');
  });
  it('does not fetch if already authenticated', async () => {
    const props: any = { auth: { isAuthenticated: true }, dispatch: jest.fn() };
    const gBody: any = { code: 'someCode' };
    const result = await authenticate(gBody, props);
    expect(result).toBe('authenticated');
  });
  it('returns failed when nothing is returned from Google', async () => {
    const props: any = { auth: { isAuthenticated: false }, dispatch: jest.fn() };
    const sa: any = superagent;
    sa.post = () => ({
      set: () => ({ send: async () => ({ body: undefined }) }),
    });
    const gBody: any = { code: 'someCode' };
    const result = await authenticate(gBody, props);
    expect(result).toBe('authentication failed');
  });
  it('returns false when fetch error', async () => {
    const props: any = { auth: { isAuthenticated: false }, dispatch: jest.fn() };
    const sa: any = superagent;
    sa.post = () => ({
      set: () => ({ send: () => Promise.reject(new Error('bad')) }),
    });
    const gBody: any = { code: 'someCode' };
    await expect(authenticate(gBody, props)).rejects.toThrow('bad');
  });
});
