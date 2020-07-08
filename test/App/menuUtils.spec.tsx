import menuUtils from '../../src/App/menuUtils';

describe('menuUtils', () => {
  const controllerStub = {
    googleButtons: () => true,
    makeMenuLink: () => true,
    props: {
      location: { pathname: '/music' },
      auth: { token: 'token', isAuthenticated: true, user: { userType: '' } },
      dispatch: () => jest.fn(),
    },
  };
  it('handles menuItem for Develper', () => {
    const item: any = { link: '/music', type: 'link', auth: true };
    const result = menuUtils.menuItem(item,
      1, controllerStub);
    expect(result).toBe(true);
  });
  it('handles menuItem for GoogleLogout', () => {
    const result = menuUtils.continueMenuItem({ link: '/', type: 'googleLogout', auth: true },
      1, { pathname: '/music' }, { isAuthenticated: true }, controllerStub);
    expect(result).toBe(true);
  });
});
