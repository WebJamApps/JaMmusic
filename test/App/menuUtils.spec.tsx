import menuUtils from '../../src/App/menuUtils';

describe('menuUtils', () => {
  const controllerStub = {
    googleButtons: () => true,
    makeMenuLink: () => true,
    props: {
      location: { pathname: '/music' },
      auth: { token: 'token', isAuthenticated: true, user: { userType: 'Developer' } },
      dispatch: () => Promise.resolve(true),
    },
  };
  it('handles menuItem for Develper', () => new Promise((done) => {
    const item: any = { link: '/music', type: 'link', auth: true };
    const result = menuUtils.menuItem(item,
      1, controllerStub);
    expect(result).toBe(true);
    done();
  }));
  it('handles menuItem for GoogleLogout', () => new Promise((done) => {
    const result = menuUtils.continueMenuItem({ link: '/', type: 'googleLogout', auth: true },
      1, { pathname: '/music' }, { isAuthenticated: true }, controllerStub);
    expect(result).toBe(true);
    done();
  }));
});
