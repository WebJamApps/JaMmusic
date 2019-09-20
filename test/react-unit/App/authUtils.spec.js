import jwt from 'jwt-simple';
import authUtils from '../../../src/App/authUtils';
import request from '../../__mocks__/superagent';

describe('authUtils', () => {
  const controllerStub = {
    props: { auth: { token: 'token' }, dispatch: () => Promise.resolve(true) },
  };
  it('handles failed login', (done) => {
    const result = authUtils.responseGoogleFailLogin('no way');
    expect(result).toBe(false);
    done();
  });
  it('handles google login with bad token', async () => {
    try { await authUtils.responseGoogleLogin({}, controllerStub); } catch (e) {
      expect(e.message).toBe('Not enough or too many segments');
    }
  });
  it('handles google login with authenticate error', async () => {
    controllerStub.props.dispatch = () => Promise.reject(new Error('bad'));
    try { await authUtils.responseGoogleLogin({}, controllerStub); } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
  it('sets the user', async () => {
    jwt.decode = jest.fn(() => ({ sub: '123' }));
    jwt.encode = jest.fn(() => 'token');
    request.setMockResponse({ body: {} });
    window.location.reload = jest.fn();
    controllerStub.props.dispatch = (obj) => { expect(obj.type).toBeDefined(); };
    const result = await authUtils.setUser(controllerStub);
    expect(result).toBe(true);
  });
  it('cathes fetch user error when sets the user', async () => {
    jwt.decode = jest.fn(() => ({ sub: '123' }));
    request.get = jest.fn(() => ({ set: () => ({ set: () => Promise.reject(new Error('bad')) }) }));
    try { await authUtils.setUser(controllerStub); } catch (e) { expect(e.message).toBe('bad'); }
  });
  it('sets the user to the already decoded user', async () => {
    jwt.decode = jest.fn(() => ({ sub: '123', user: {} }));
    window.location.reload = jest.fn();
    controllerStub.props.dispatch = (obj) => { expect(obj.type).toBe('SET_USER'); };
    const result = await authUtils.setUser(controllerStub);
    expect(result).toBe(true);
  });
  it('logs out when not /dashboard', async () => {
    const result = await authUtils.responseGoogleLogout('howdy', () => {});
    expect(result).toBe('howdy');
  });
  it('logs out when /dashboard', async () => {
    delete window.location;
    window.location = {
      href: '/dashboard',
      assign: jest.fn(),
    };
    const result = await authUtils.responseGoogleLogout('howdy', () => {});
    expect(result).toBe('howdy');
  });
});
