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
    jwt.decode = jest.fn(() => { '123'; });
    request.setMockResponse({ body: {} });
    controllerStub.props.dispatch = (obj) => { expect(obj.type).toBe('GOT_TOKEN'); };
    await authUtils.setUser(controllerStub);
  });
});
