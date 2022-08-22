/* eslint-disable @typescript-eslint/no-explicit-any */
import superagent from 'superagent';
import { authenticate } from 'src/App/AppTemplate/authenticate';

describe('authenticate', () => {
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
