import type { Auth } from 'src/redux/mapStoreToProps';
import { authenticate, GoogleBody } from 'src/App/GoogleButtons/authenticate';
import superagent from 'superagent';

describe('authenticate', () => {
  it('returns the token if already authenticated', async () => {
    const result = await authenticate(
      {} as GoogleBody,
      {
        auth: { isAuthenticated: true, token: 'token' } as Auth,
        dispatch: jest.fn(),
        heartBeat: '', userCount: 1, history: {} as any, location: {} as any, match: {} as any,
      },
    );
    expect(result).toBe('token');
  });
  it('returns the token after sucessfully authenticated', async () => {
    const postMock: any = jest.fn(() => Promise.resolve({ body: { token: 'token' } }));
    superagent.post = () => ({ set:()=>({ send:postMock }) }) as any;
    const result = await authenticate(
      {} as GoogleBody,
      {
        auth: { isAuthenticated: false, token: 'token' } as Auth,
        dispatch: jest.fn(),
        heartBeat: '', userCount: 1, history: {} as any, location: {} as any, match: {} as any,
      },
    );
    expect(result).toBe('token');
  });
});
