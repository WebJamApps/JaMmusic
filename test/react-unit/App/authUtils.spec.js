import authUtils from '../../../src/App/authUtils';

describe('authUtils', () => {
  it('handles failed login', (done) => {
    const result = authUtils.responseGoogleFailLogin('no way');
    expect(result).toBe(false);
    done();
  });
});
