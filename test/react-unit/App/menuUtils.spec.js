import authUtils from '../../../src/App/authUtils';

describe('menuUtils', () => {
  const controllerStub = {
    props: { auth: { token: 'token' }, dispatch: () => Promise.resolve(true) },
  };
  it('handles menuItem', (done) => {
    const result = authUtils.responseGoogleFailLogin('no way');
    expect(result).toBe(false);
    done();
  });
});
