/* eslint-disable @typescript-eslint/ban-ts-ignore */
import jwt from 'jwt-simple';
import superagent from 'superagent';
import authUtils from '../../src/App/authUtils';

describe('authUtils', () => {
  const controllerStub = {
    props: { auth: { token: 'token' }, dispatch: () => Promise.resolve(true) },
  };
  it('handles failed login', () => new Promise((done) => {
    const result = authUtils.responseGoogleFailLogin('no way');
    expect(result).toBe(false);
    done();
  }));
  it('handles google login with bad token', async () => {
    await expect(authUtils.responseGoogleLogin({}, controllerStub)).rejects.toThrow('Not enough or too many segments');
  });
  it('handles google login with authenticate error', async () => {
    controllerStub.props.dispatch = () => Promise.reject(new Error('bad'));
    await expect(authUtils.responseGoogleLogin({}, controllerStub)).rejects.toThrow('bad');
  });
  it('sets the user', async () => {
    const cStub2 = {
      props: { auth: { token: 'token' }, dispatch: (obj: any) => { expect(obj.type).toBeDefined(); } },
    };
    jwt.decode = jest.fn(() => ({ sub: '123' }));
    jwt.encode = jest.fn(() => 'token');
    // @ts-ignore
    superagent.get = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ body: {} }) }) }));
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    window.location.reload = jest.fn();
    const result = await authUtils.setUser(cStub2);
    expect(result).toBe(true);
  });
  it('cathes fetch user error when sets the user', async () => {
    jwt.decode = jest.fn(() => ({ sub: '123' }));
    // @ts-ignore
    superagent.get = jest.fn(() => ({ set: () => ({ set: () => Promise.reject(new Error('bad')) }) }));
    await expect(authUtils.setUser(controllerStub)).rejects.toThrow('bad');
  });
  it('sets the user to the already decoded user', async () => {
    jwt.decode = jest.fn(() => ({ sub: '123', user: {} }));
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    window.location.reload = jest.fn();
    const cStub3 = {
      props: { auth: { token: 'token' }, dispatch: (obj: any) => { expect(obj.type).toBe('SET_USER'); } },
    };
    const result = await authUtils.setUser(cStub3);
    expect(result).toBe(true);
  });
  it('logs out when not /dashboard', async () => {
    Object.defineProperty(window, 'location', { value: { href: '/booya', assign: () => { }, reload: () => { } }, writable: true });
    const result = await authUtils.responseGoogleLogout(() => { });
    expect(result).toBe(true);
  });
  it('logs out when /dashboard', async () => {
    delete window.location;
    window.location = {
      ...window.location,
      href: '/dashboard',
      assign: jest.fn(),
    };
    const result = await authUtils.responseGoogleLogout(() => { });
    expect(result).toBe(true);
  });
});
