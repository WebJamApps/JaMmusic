/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import superagent from 'superagent';
import authUtils from '../../src/App/authUtils';

describe('authUtils', () => {
  const vStub: any = {
    authenticate: jest.fn(),
    props: { auth: { token: 'token' }, dispatch: () => Promise.resolve(true) },
  };
  it('handles failed login', () => {
    const result = authUtils.responseGoogleFailLogin('no way');
    expect(result).toBe('no way');
  });
  it('handles google login with bad token', async () => {
    const res = await authUtils.responseGoogleLogin({ code: '' }, vStub);
    expect(res).toBe('jwt malformed');
  });
  it('handles failure to authenticate', async () => {
    vStub.authenticate = jest.fn(() => Promise.reject(new Error('bad')));
    const res = await authUtils.responseGoogleLogin({ code: '' }, vStub);
    expect(res).toBe('bad');
  });
  it('sets the user', async () => {
    const cStub2: any = {
      props: { auth: { token: 'token' }, dispatch: (obj: any) => { expect(obj.type).toBeDefined(); } },
    };
    jwt.verify = jest.fn(() => ('123'));
    const sa: any = superagent;
    sa.get = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ body: {} }) }) }));
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    window.location.reload = jest.fn();
    const result = await authUtils.setUser(cStub2);
    expect(result).toBe('set user');
  });
  it('cathes fetch user error when sets the user', async () => {
    jwt.verify = jest.fn(() => ('123'));
    const sa: any = superagent;
    sa.get = jest.fn(() => ({ set: () => ({ set: () => Promise.reject(new Error('bad')) }) }));
    const res = await authUtils.setUser(vStub);
    expect(res).toBe('bad');
  });
  // it('sets the user to the already decoded user', async () => {
  //   jwt.verify = jest.fn(() => ({ sub: '123', user: {} }));
  //   Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
  //   window.location.reload = jest.fn();
  //   const cStub3: any = {
  //     props: { auth: { token: 'token' }, dispatch: (obj: any) => { expect(obj.type).toBe('SET_USER'); } },
  //   };
  //   const result = await authUtils.setUser(cStub3);
  //   expect(result).toBe('set user');
  // });
  it('fails to set user when token is bad', async () => {
    jwt.verify = jest.fn(() => { throw new Error('bad'); });
    const res = await authUtils.setUser(vStub);
    expect(res).toBe('bad');
  });
  it('logs out when not /dashboard', () => {
    Object.defineProperty(window, 'location', { value: { href: '/booya', assign: () => { }, reload: () => { } }, writable: true });
    const result = authUtils.responseGoogleLogout(() => { });
    expect(result).toBe(true);
  });
  it('logs out when /dashboard', () => {
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    const result = authUtils.responseGoogleLogout(() => { });
    expect(result).toBe(true);
  });
});
