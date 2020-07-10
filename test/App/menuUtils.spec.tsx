import menuUtils from '../../src/App/menuUtils';

describe('menuUtils', () => {
  const vStub = {
    googleButtons: () => true,
    makeMenuLink: () => true,
    props: {
      location: { pathname: '/music' },
      auth: { token: 'token', isAuthenticated: true, user: { userType: '' } },
      dispatch: () => jest.fn(),
    },
  };
  it('handles menuItem for GoogleLogout', () => {
    const result = menuUtils.continueMenuItem({ link: '/', type: 'googleLogout', auth: true },
      1, { pathname: '/music' }, { isAuthenticated: true }, vStub);
    expect(result).toBe(true);
  });
  it('returns null if auth role is not a match', () => {
    const menu: any = { auth: true };
    const result = menuUtils.menuItem(menu, 1, vStub);
    expect(result).toBe(null);
  });
  it('handles menuItem for music/songs', () => {
    const menu: any = { auth: false, link: '/music/songs' };
    const result = menuUtils.menuItem(menu, 1, vStub);
    expect(result).toBe(true);
  });
  it('handles menuItem for Web Jam LLC', () => {
    const menu: any = { auth: false, link: '/', name: 'Web Jam LLC' };
    const result = menuUtils.menuItem(menu, 1, vStub);
    expect(result).toBe(true);
  });
});
